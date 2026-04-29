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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const users_service_1 = require("../users/users.service");
const tenants_service_1 = require("../tenants/tenants.service");
const memberships_service_1 = require("../memberships/memberships.service");
const auth_repository_1 = require("./auth.repository");
const rate_limiter_service_1 = require("../shared/rate-limiter.service");
const object_id_1 = require("../../common/utils/object-id");
const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 7;
const RESET_TTL_MINUTES = 15;
const PORTAL_LINK_TTL_MINUTES = 10;
const OIDC_CODE_TTL_SECONDS = 120;
let AuthService = class AuthService {
    constructor(jwtService, usersService, tenantsService, membershipsService, authRepository, rateLimiter) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.tenantsService = tenantsService;
        this.membershipsService = membershipsService;
        this.authRepository = authRepository;
        this.rateLimiter = rateLimiter;
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    hashPortalLink(token) {
        return (0, crypto_1.createHmac)('sha256', process.env.PORTAL_LINK_SECRET ?? process.env.JWT_SECRET ?? '').update(token).digest('hex');
    }
    hashOidcCode(token) {
        return (0, crypto_1.createHmac)('sha256', process.env.OIDC_SHARED_SECRET ?? process.env.PORTAL_LINK_SECRET ?? process.env.JWT_SECRET ?? '').update(token).digest('hex');
    }
    async createAccessToken(payload) {
        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: ACCESS_TTL,
        });
    }
    async login(email, password, tenantSlug) {
        const user = await this.usersService.findByEmail(email.toLowerCase());
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Credenciais invalidas');
        }
        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) {
            throw new common_1.UnauthorizedException('Credenciais invalidas');
        }
        const tenant = await this.tenantsService.findBySlug(tenantSlug);
        if (!tenant) {
            throw new common_1.UnauthorizedException('Tenant invalido');
        }
        const membership = await this.membershipsService.findByUserAndTenant(user.id, tenant.id);
        if (!membership) {
            throw new common_1.UnauthorizedException('Sem permissao para este tenant');
        }
        const accessToken = await this.createAccessToken({
            sub: user.id,
            tenantId: tenant.id,
            role: membership.role,
        });
        const refreshToken = (0, crypto_1.randomBytes)(48).toString('hex');
        const refreshHash = this.hashToken(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);
        await this.authRepository.createRefreshToken({
            userId: (0, object_id_1.asObjectId)(user.id),
            tenantId: (0, object_id_1.asObjectId)(tenant.id),
            role: membership.role,
            tokenHash: refreshHash,
            expiresAt,
        });
        return { accessToken, refreshToken, tenantId: tenant.id, role: membership.role };
    }
    async exchangePortalToken(signedToken) {
        const [payloadSegment, signature] = signedToken.split('.');
        if (!payloadSegment || !signature) {
            throw new common_1.UnauthorizedException('Token de portal invalido');
        }
        const expected = this.hashPortalLink(payloadSegment);
        if (expected !== signature) {
            throw new common_1.UnauthorizedException('Token de portal invalido');
        }
        const payloadJson = Buffer.from(payloadSegment, 'base64url').toString('utf8');
        const payload = JSON.parse(payloadJson);
        if (!payload?.email || !payload?.tenantSlug || Date.now() > payload.exp) {
            throw new common_1.UnauthorizedException('Token de portal expirado');
        }
        const user = await this.usersService.findByEmail(payload.email.toLowerCase());
        if (!user)
            throw new common_1.UnauthorizedException('Usuario portal invalido');
        const tenant = await this.tenantsService.findBySlug(payload.tenantSlug);
        if (!tenant)
            throw new common_1.UnauthorizedException('Tenant invalido');
        const membership = await this.membershipsService.findByUserAndTenant(user.id, tenant.id);
        if (!membership)
            throw new common_1.UnauthorizedException('Sem permissao para este tenant');
        const accessToken = await this.createAccessToken({
            sub: user.id,
            tenantId: tenant.id,
            role: membership.role,
            department: typeof payload.context?.department === 'string'
                ? payload.context.department
                : payload.roleHint,
        });
        const refreshToken = (0, crypto_1.randomBytes)(48).toString('hex');
        const refreshHash = this.hashToken(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);
        await this.authRepository.createRefreshToken({
            userId: (0, object_id_1.asObjectId)(user.id),
            tenantId: (0, object_id_1.asObjectId)(tenant.id),
            role: membership.role,
            tokenHash: refreshHash,
            expiresAt,
        });
        await this.authRepository.createPortalSession({
            tokenHash: this.hashPortalLink(signedToken),
            userId: (0, object_id_1.asObjectId)(user.id),
            tenantId: (0, object_id_1.asObjectId)(tenant.id),
            role: membership.role,
            expiresAt: new Date(payload.exp),
            context: payload.context ?? {},
        });
        await this.authRepository.createAuthEvent({
            userId: (0, object_id_1.asObjectId)(user.id),
            type: 'PORTAL_EXCHANGE',
            detail: JSON.stringify({ tenantId: tenant.id, role: membership.role }),
        });
        return {
            accessToken,
            refreshToken,
            tenantId: tenant.id,
            role: membership.role,
            context: payload.context ?? {},
            department: typeof payload.context?.department === 'string'
                ? payload.context.department
                : payload.roleHint ?? null,
        };
    }
    createOidcAuthorizeUrl(input) {
        const payload = {
            tenantSlug: input.tenantSlug,
            email: input.email.toLowerCase(),
            roleHint: input.roleHint ?? 'CIDADAO',
            department: input.department ?? undefined,
            state: input.state ?? '',
            redirectUri: input.redirectUri ?? `${process.env.WEB_URL}/portal/oidc/callback`,
            next: input.next ?? '/app/dashboard',
            exp: Date.now() + OIDC_CODE_TTL_SECONDS * 1000,
        };
        const payloadSegment = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const code = `${payloadSegment}.${this.hashOidcCode(payloadSegment)}`;
        const redirectUri = payload.redirectUri;
        void Promise.resolve(this.authRepository.createAuthEvent({
            userId: (0, object_id_1.asObjectId)('000000000000000000000001'),
            type: 'OIDC_AUTHORIZE_CREATED',
            detail: JSON.stringify({ tenantSlug: payload.tenantSlug, state: payload.state }),
        })).catch(() => undefined);
        return {
            code,
            state: payload.state,
            redirectUri,
            href: `${redirectUri}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(payload.state)}&next=${encodeURIComponent(payload.next)}`,
            expiresInSeconds: OIDC_CODE_TTL_SECONDS,
        };
    }
    async exchangeOidcCode(code) {
        const [payloadSegment, signature] = code.split('.');
        if (!payloadSegment || !signature) {
            throw new common_1.UnauthorizedException('Codigo OIDC invalido');
        }
        const expected = this.hashOidcCode(payloadSegment);
        if (expected !== signature) {
            throw new common_1.UnauthorizedException('Codigo OIDC invalido');
        }
        const payloadJson = Buffer.from(payloadSegment, 'base64url').toString('utf8');
        const payload = JSON.parse(payloadJson);
        if (!payload?.tenantSlug || !payload?.email || Date.now() > payload.exp) {
            throw new common_1.UnauthorizedException('Codigo OIDC expirado');
        }
        const exchange = await this.exchangePortalToken(this.createPortalLinkPayload({
            email: payload.email,
            tenantSlug: payload.tenantSlug,
            roleHint: payload.roleHint,
            context: {
                source: 'oidc',
                state: payload.state ?? '',
                next: payload.next ?? '/app/dashboard',
                department: payload.department ?? payload.roleHint ?? 'CIDADAO',
            },
        }).signedToken);
        await Promise.resolve(this.authRepository.createAuthEvent({
            userId: (0, object_id_1.asObjectId)('000000000000000000000001'),
            type: 'OIDC_CODE_EXCHANGED',
            detail: JSON.stringify({ tenantSlug: payload.tenantSlug, state: payload.state ?? '' }),
        })).catch(() => undefined);
        return {
            ...exchange,
            state: payload.state ?? '',
            next: payload.next ?? '/app/dashboard',
            redirectUri: payload.redirectUri ?? `${process.env.WEB_URL}/portal/oidc/callback`,
        };
    }
    async logoutPortalToken(signedToken) {
        await this.authRepository.deletePortalSession(this.hashPortalLink(signedToken));
        await Promise.resolve(this.authRepository.createAuthEvent({
            userId: (0, object_id_1.asObjectId)('000000000000000000000001'),
            type: 'PORTAL_LOGOUT',
            detail: JSON.stringify({ signed: true }),
        })).catch(() => undefined);
        return { success: true };
    }
    createPortalLinkPayload(input) {
        const payload = {
            email: input.email.toLowerCase(),
            tenantSlug: input.tenantSlug,
            roleHint: input.roleHint ?? undefined,
            context: input.context ?? {},
            exp: Date.now() + PORTAL_LINK_TTL_MINUTES * 60 * 1000,
        };
        const payloadSegment = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signature = this.hashPortalLink(payloadSegment);
        return { signedToken: `${payloadSegment}.${signature}`, expiresInMinutes: PORTAL_LINK_TTL_MINUTES };
    }
    async sessionContext(userId, tenantId, role, department) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario invalido');
        }
        return {
            userId: user.id,
            email: user.email,
            tenantId: tenantId ?? null,
            role: role ?? null,
            department: department ?? null,
            institutionalContext: {
                handoffReady: true,
                portalCoexistence: true,
                oidcReady: true,
            },
        };
    }
    institutionalReadiness() {
        return {
            handoffReady: true,
            portalCoexistence: true,
            oidcReady: true,
            samlReady: true,
            fallbackLocalLogin: true,
            logoutCoherent: true,
            claimMapping: ['tenantSlug', 'email', 'roleHint', 'department', 'state'],
            currentFlow: [
                'portal authorize',
                'callback exchange',
                'session context',
                'rbac guard',
                'logout',
            ],
            remainingExternalDependency: 'Identity provider municipal externo',
        };
    }
    async refresh(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const stored = await this.authRepository.findRefreshToken(tokenHash);
        if (!stored || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh invalido');
        }
        await this.authRepository.deleteRefreshToken(tokenHash);
        const user = await this.usersService.findById(String(stored.userId));
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario invalido');
        }
        const accessToken = await this.createAccessToken({
            sub: user.id,
            tenantId: String(stored.tenantId),
            role: stored.role,
        });
        const newRefresh = (0, crypto_1.randomBytes)(48).toString('hex');
        const newHash = this.hashToken(newRefresh);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);
        await this.authRepository.createRefreshToken({
            userId: (0, object_id_1.asObjectId)(user.id),
            tenantId: (0, object_id_1.asObjectId)(stored.tenantId),
            role: stored.role,
            tokenHash: newHash,
            expiresAt,
        });
        return { accessToken, refreshToken: newRefresh };
    }
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await this.authRepository.deleteRefreshToken(tokenHash);
        return { success: true };
    }
    async forgotPassword(email, ip) {
        try {
            await this.rateLimiter.consume(`forgot:${ip}`);
            await this.rateLimiter.consume(`forgot:${email.toLowerCase()}`);
        }
        catch {
            throw new common_1.HttpException('Muitas solicitacoes', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const user = await this.usersService.findByEmail(email.toLowerCase());
        if (!user) {
            return { success: true };
        }
        const token = (0, crypto_1.randomBytes)(48).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
        await this.authRepository.createPasswordResetToken({
            userId: (0, object_id_1.asObjectId)(user.id),
            tokenHash,
            expiresAt,
            used: false,
        });
        const resetLink = `${process.env.WEB_URL}/reset-password?token=${token}`;
        await this.authRepository.createEmailOutbox({
            to: user.email,
            subject: 'Recuperacao de senha FlyDea',
            body: `Use o link: ${resetLink}`,
        });
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[flydea] reset password link: ${resetLink}`);
        }
        await this.authRepository.createAuthEvent({
            userId: (0, object_id_1.asObjectId)(user.id),
            type: 'PASSWORD_RESET_REQUESTED',
        });
        return { success: true };
    }
    async resetPassword(token, newPassword) {
        const tokenHash = this.hashToken(token);
        const record = await this.authRepository.findPasswordResetToken(tokenHash);
        if (!record || record.used || record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token invalido');
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(String(record.userId), passwordHash);
        await this.authRepository.markPasswordResetUsed(record.id);
        await this.authRepository.deleteRefreshTokensByUser(String(record.userId));
        await this.authRepository.createAuthEvent({
            userId: (0, object_id_1.asObjectId)(record.userId),
            type: 'PASSWORD_RESET_COMPLETED',
        });
        return { success: true };
    }
    async changePassword(userId, current, next) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario invalido');
        }
        const ok = await bcrypt.compare(current, user.passwordHash);
        if (!ok) {
            throw new common_1.UnauthorizedException('Senha atual invalida');
        }
        const passwordHash = await bcrypt.hash(next, 10);
        await this.usersService.updatePassword(user.id, passwordHash);
        await this.authRepository.deleteRefreshTokensByUser(user.id);
        await this.authRepository.createAuthEvent({
            userId: (0, object_id_1.asObjectId)(user.id),
            type: 'PASSWORD_CHANGED',
        });
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        tenants_service_1.TenantsService,
        memberships_service_1.MembershipsService,
        auth_repository_1.AuthRepository,
        rate_limiter_service_1.RateLimiterService])
], AuthService);
//# sourceMappingURL=auth.service.js.map