import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './refresh-token.schema';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from './password-reset.schema';
import { EmailOutbox, EmailOutboxDocument } from './email-outbox.schema';
import { AuthEvent, AuthEventDocument } from './auth-event.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
    @InjectModel(PasswordResetToken.name)
    private readonly resetModel: Model<PasswordResetTokenDocument>,
    @InjectModel(EmailOutbox.name)
    private readonly outboxModel: Model<EmailOutboxDocument>,
    @InjectModel(AuthEvent.name)
    private readonly eventModel: Model<AuthEventDocument>,
  ) {}

  createRefreshToken(data: Partial<RefreshToken>) {
    return this.refreshModel.create(data);
  }

  findRefreshToken(tokenHash: string) {
    return this.refreshModel.findOne({ tokenHash }).exec();
  }

  deleteRefreshToken(tokenHash: string) {
    return this.refreshModel.deleteOne({ tokenHash }).exec();
  }

  deleteRefreshTokensByUser(userId: string) {
    return this.refreshModel.deleteMany({ userId }).exec();
  }

  createPasswordResetToken(data: Partial<PasswordResetToken>) {
    return this.resetModel.create(data);
  }

  findPasswordResetToken(tokenHash: string) {
    return this.resetModel.findOne({ tokenHash }).exec();
  }

  markPasswordResetUsed(id: string) {
    return this.resetModel.findByIdAndUpdate(id, { used: true }).exec();
  }

  createEmailOutbox(data: Partial<EmailOutbox>) {
    return this.outboxModel.create(data);
  }

  createAuthEvent(data: Partial<AuthEvent>) {
    return this.eventModel.create(data);
  }
}
