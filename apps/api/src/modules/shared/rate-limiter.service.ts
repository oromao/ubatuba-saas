import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisService } from './redis.service';

/**
 * Rate Limiting Tiers by User Role
 *
 * Different limits for different user roles to prevent abuse
 * while allowing high-volume operations for admins
 */
interface RateLimitTier {
  role: string;
  points: number; // Requests per duration
  duration: number; // Duration in seconds
  description: string;
}

const RATE_LIMIT_TIERS: RateLimitTier[] = [
  {
    role: 'ADMIN',
    points: 1000, // 1000 req/min
    duration: 60,
    description: 'Admin: 1000 req/min (bulk operations)',
  },
  {
    role: 'GESTOR',
    points: 300, // 300 req/min
    duration: 60,
    description: 'Gestor: 300 req/min (project management)',
  },
  {
    role: 'OPERADOR',
    points: 120, // 120 req/min
    duration: 60,
    description: 'Operador: 120 req/min (field operations)',
  },
  {
    role: 'LEITOR',
    points: 60, // 60 req/min
    duration: 60,
    description: 'Leitor: 60 req/min (read-only)',
  },
  {
    role: 'ANONYMOUS',
    points: 30, // 30 req/min
    duration: 60,
    description: 'Anonymous: 30 req/min (public endpoints)',
  },
];

@Injectable()
export class RateLimiterService {
  private limiters: Map<string, RateLimiterMemory | RateLimiterRedis>;
  private readonly logger = new Logger('RateLimiter');
  private redisAvailable = false;

  constructor(private readonly redisService: RedisService) {
    this.limiters = new Map();
    this.setup();
  }

  private async setup() {
    const client = await this.redisService.getClient();

    if (client) {
      this.redisAvailable = true;
      this.logger.log('Rate limiter using Redis backend');
    } else {
      this.logger.warn('Rate limiter using memory backend (Redis unavailable)');
    }

    // Initialize limiters for each role
    for (const tier of RATE_LIMIT_TIERS) {
      if (client && this.redisAvailable) {
        this.limiters.set(
          tier.role,
          new RateLimiterRedis({
            storeClient: client,
            points: tier.points,
            duration: tier.duration,
            keyPrefix: `ratelimit:${tier.role}:`,
          }),
        );
      } else {
        this.limiters.set(
          tier.role,
          new RateLimiterMemory({
            points: tier.points,
            duration: tier.duration,
          }),
        );
      }

      this.logger.log(tier.description);
    }
  }

  /**
   * Check and consume rate limit for a user
   *
   * @param userId - User ID (or IP for anonymous)
   * @param role - User role (ADMIN, GESTOR, OPERADOR, LEITOR, ANONYMOUS)
   * @param points - Points to consume (default: 1)
   * @throws HttpException (429) if limit exceeded
   */
  async consume(userId: string, role: string = 'ANONYMOUS', points = 1): Promise<void> {
    // Validate role and get appropriate limiter
    const limiter = this.limiters.get(role.toUpperCase());

    if (!limiter) {
      this.logger.warn(`Unknown role: ${role}, using ANONYMOUS limits`);
      const defaultLimiter = this.limiters.get('ANONYMOUS');
      if (!defaultLimiter) {
        return; // Fail open if no limiters configured
      }
      await this.checkLimit(defaultLimiter, userId, 'ANONYMOUS');
      return;
    }

    await this.checkLimit(limiter, userId, role);
  }

  private async checkLimit(
    limiter: RateLimiterMemory | RateLimiterRedis,
    key: string,
    role: string,
  ): Promise<void> {
    try {
      await limiter.consume(key, 1);
    } catch (error) {
      const rateLimiterRes = (error as any).rateLimiterRes;

      this.logger.warn(
        `Rate limit exceeded for ${role} user ${key}: ` +
          `${rateLimiterRes?.remainingPoints ?? 0} points remaining, ` +
          `retry in ${rateLimiterRes?.msBeforeNext ?? 0}ms`,
      );

      // Throw 429 with retry-after header
      const retryAfter = Math.ceil(
        ((rateLimiterRes?.msBeforeNext ?? 0) / 1000),
      );
      throw new HttpException(
        {
          message: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
          retryAfter,
          role,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Get rate limit info for a role
   */
  getTierInfo(role: string): RateLimitTier | undefined {
    return RATE_LIMIT_TIERS.find((t) => t.role === role.toUpperCase());
  }

  /**
   * Get all configured tiers
   */
  getAllTiers(): RateLimitTier[] {
    return RATE_LIMIT_TIERS;
  }

  /**
   * Get Redis availability status
   */
  isRedisAvailable(): boolean {
    return this.redisAvailable;
  }

  /**
   * Reset rate limit for a user (admin only)
   */
  async reset(userId: string, role: string = 'ANONYMOUS'): Promise<void> {
    const limiter = this.limiters.get(role.toUpperCase());
    if (limiter) {
      // @ts-ignore - direct API access for admin reset
      await limiter.delete(userId);
      this.logger.log(`Rate limit reset for ${role} user ${userId}`);
    }
  }
}
