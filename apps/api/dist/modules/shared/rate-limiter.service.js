"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const redis_service_1 = require("./redis.service");
const RATE_LIMIT_TIERS = [
    {
        role: 'ADMIN',
        points: 1000,
        duration: 60,
        description: 'Admin: 1000 req/min (bulk operations)',
    },
    {
        role: 'GESTOR',
        points: 300,
        duration: 60,
        description: 'Gestor: 300 req/min (project management)',
    },
    {
        role: 'OPERADOR',
        points: 120,
        duration: 60,
        description: 'Operador: 120 req/min (field operations)',
    },
    {
        role: 'LEITOR',
        points: 60,
        duration: 60,
        description: 'Leitor: 60 req/min (read-only)',
    },
    {
        role: 'ANONYMOUS',
        points: 30,
        duration: 60,
        description: 'Anonymous: 30 req/min (public endpoints)',
    },
];
let RateLimiterService = class RateLimiterService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger('RateLimiter');
        this.redisAvailable = false;
        this.limiters = new Map();
        this.setup();
    }
    async setup() {
        const client = await this.redisService.getClient();
        if (client) {
            this.redisAvailable = true;
            this.logger.log('Rate limiter using Redis backend');
        }
        else {
            this.logger.warn('Rate limiter using memory backend (Redis unavailable)');
        }
        for (const tier of RATE_LIMIT_TIERS) {
            if (client && this.redisAvailable) {
                this.limiters.set(tier.role, new rate_limiter_flexible_1.RateLimiterRedis({
                    storeClient: client,
                    points: tier.points,
                    duration: tier.duration,
                    keyPrefix: `ratelimit:${tier.role}:`,
                }));
            }
            else {
                this.limiters.set(tier.role, new rate_limiter_flexible_1.RateLimiterMemory({
                    points: tier.points,
                    duration: tier.duration,
                }));
            }
            this.logger.log(tier.description);
        }
    }
    async consume(userId, role = 'ANONYMOUS', _points = 1) {
        const limiter = this.limiters.get(role.toUpperCase());
        if (!limiter) {
            this.logger.warn(`Unknown role: ${role}, using ANONYMOUS limits`);
            const defaultLimiter = this.limiters.get('ANONYMOUS');
            if (!defaultLimiter) {
                return;
            }
            await this.checkLimit(defaultLimiter, userId, 'ANONYMOUS');
            return;
        }
        await this.checkLimit(limiter, userId, role);
    }
    async checkLimit(limiter, key, role) {
        try {
            await limiter.consume(key, 1);
        }
        catch (error) {
            const rateLimiterRes = error.rateLimiterRes;
            this.logger.warn(`Rate limit exceeded for ${role} user ${key}: ` +
                `${rateLimiterRes?.remainingPoints ?? 0} points remaining, ` +
                `retry in ${rateLimiterRes?.msBeforeNext ?? 0}ms`);
            const retryAfter = Math.ceil(((rateLimiterRes?.msBeforeNext ?? 0) / 1000));
            throw new common_1.HttpException({
                message: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
                retryAfter,
                role,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    getTierInfo(role) {
        return RATE_LIMIT_TIERS.find((t) => t.role === role.toUpperCase());
    }
    getAllTiers() {
        return RATE_LIMIT_TIERS;
    }
    isRedisAvailable() {
        return this.redisAvailable;
    }
    async reset(userId, role = 'ANONYMOUS') {
        const limiter = this.limiters.get(role.toUpperCase());
        if (limiter) {
            await limiter.delete(userId);
            this.logger.log(`Rate limit reset for ${role} user ${userId}`);
        }
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map