"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("../src/modules/auth/auth.service");
const jwtService = new jwt_1.JwtService({});
describe('Password reset', () => {
    it('invalidates refresh tokens after reset', async () => {
        const userId = '66f1f77a67e30f9f62000003';
        const authRepository = {
            findPasswordResetToken: jest.fn().mockResolvedValue({
                id: 'reset-1',
                userId,
                used: false,
                expiresAt: new Date(Date.now() + 1000 * 60),
            }),
            markPasswordResetUsed: jest.fn(),
            deleteRefreshTokensByUser: jest.fn(),
            createAuthEvent: jest.fn(),
        };
        const usersService = {
            updatePassword: jest.fn().mockResolvedValue(true),
            findById: jest.fn().mockResolvedValue({ id: userId }),
        };
        const authService = new auth_service_1.AuthService(jwtService, usersService, {}, {}, authRepository, {});
        await authService.resetPassword('token', 'NovaSenha@123');
        expect(authRepository.deleteRefreshTokensByUser).toHaveBeenCalledWith(userId);
    });
    it('hashes new password', async () => {
        const hash = await bcrypt.hash('NovaSenha@123', 10);
        expect(hash).not.toBe('NovaSenha@123');
    });
});
//# sourceMappingURL=password-reset.spec.js.map