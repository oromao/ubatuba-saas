"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
let RedisService = class RedisService {
    constructor() {
        this.client = null;
    }
    async getClient() {
        if (!process.env.REDIS_URL) {
            return null;
        }
        if (!this.client) {
            this.client = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
            this.client.on('error', () => undefined);
            try {
                await this.client.connect();
            }
            catch {
                this.client = null;
            }
        }
        return this.client;
    }
    async status() {
        const client = await this.getClient();
        if (!client) {
            return { status: 'disabled' };
        }
        try {
            await client.ping();
            return { status: 'ok' };
        }
        catch {
            return { status: 'degraded' };
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map