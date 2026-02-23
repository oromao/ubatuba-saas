"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const auth_repository_1 = require("./auth.repository");
const refresh_token_schema_1 = require("./refresh-token.schema");
const password_reset_schema_1 = require("./password-reset.schema");
const email_outbox_schema_1 = require("./email-outbox.schema");
const auth_event_schema_1 = require("./auth-event.schema");
const users_module_1 = require("../users/users.module");
const tenants_module_1 = require("../tenants/tenants.module");
const memberships_module_1 = require("../memberships/memberships.module");
const rate_limiter_service_1 = require("../shared/rate-limiter.service");
const redis_service_1 = require("../shared/redis.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({}),
            users_module_1.UsersModule,
            tenants_module_1.TenantsModule,
            memberships_module_1.MembershipsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: refresh_token_schema_1.RefreshToken.name, schema: refresh_token_schema_1.RefreshTokenSchema },
                { name: password_reset_schema_1.PasswordResetToken.name, schema: password_reset_schema_1.PasswordResetTokenSchema },
                { name: email_outbox_schema_1.EmailOutbox.name, schema: email_outbox_schema_1.EmailOutboxSchema },
                { name: auth_event_schema_1.AuthEvent.name, schema: auth_event_schema_1.AuthEventSchema },
            ]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, auth_repository_1.AuthRepository, rate_limiter_service_1.RateLimiterService, redis_service_1.RedisService],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map