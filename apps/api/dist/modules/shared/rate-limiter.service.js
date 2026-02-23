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
let RateLimiterService = class RateLimiterService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger('RateLimiter');
        this.limiter = new rate_limiter_flexible_1.RateLimiterMemory({
            points: 10,
            duration: 60,
        });
        this.setup();
    }
    async setup() {
        const client = await this.redisService.getClient();
        if (client) {
            this.limiter = new rate_limiter_flexible_1.RateLimiterRedis({
                storeClient: client,
                points: 10,
                duration: 60,
            });
            this.logger.log('Rate limiter usando Redis');
        }
        else {
            this.logger.warn('Rate limiter usando memoria (Redis indisponivel)');
        }
    }
    async consume(key, points = 1) {
        await this.limiter.consume(key, points);
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map