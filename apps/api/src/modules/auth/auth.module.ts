import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { RefreshToken, RefreshTokenSchema } from './refresh-token.schema';
import { PasswordResetToken, PasswordResetTokenSchema } from './password-reset.schema';
import { EmailOutbox, EmailOutboxSchema } from './email-outbox.schema';
import { AuthEvent, AuthEventSchema } from './auth-event.schema';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { RateLimiterService } from '../shared/rate-limiter.service';
import { RedisService } from '../shared/redis.service';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    TenantsModule,
    MembershipsModule,
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      { name: EmailOutbox.name, schema: EmailOutboxSchema },
      { name: AuthEvent.name, schema: AuthEventSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, RateLimiterService, RedisService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
