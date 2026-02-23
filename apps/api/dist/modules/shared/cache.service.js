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
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const redis_service_1 = require("./redis.service");
let CacheService = class CacheService {
    constructor(redisService) {
        this.redisService = redisService;
    }
    buildKey(key) {
        return `flydea:${key}`;
    }
    hashQuery(query) {
        const payload = JSON.stringify(query);
        return (0, crypto_1.createHash)('sha256').update(payload).digest('hex').slice(0, 16);
    }
    async get(key) {
        const client = await this.redisService.getClient();
        if (!client)
            return null;
        try {
            const value = await client.get(this.buildKey(key));
            return value ? JSON.parse(value) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        const client = await this.redisService.getClient();
        if (!client)
            return;
        try {
            await client.set(this.buildKey(key), JSON.stringify(value), {
                EX: ttlSeconds,
            });
        }
        catch {
            return;
        }
    }
    async invalidateByPrefix(prefix) {
        const client = await this.redisService.getClient();
        if (!client)
            return;
        const pattern = this.buildKey(`${prefix}*`);
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], CacheService);
//# sourceMappingURL=cache.service.js.map