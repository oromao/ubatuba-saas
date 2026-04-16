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
import { PortalSession, PortalSessionDocument } from './portal-session.schema';

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
    @InjectModel(PortalSession.name)
    private readonly portalSessionModel: Model<PortalSessionDocument>,
  ) {}

  createRefreshToken(data: Partial<RefreshToken>): Promise<RefreshTokenDocument> {
    return this.refreshModel.create(data);
  }

  findRefreshToken(tokenHash: string): Promise<RefreshTokenDocument | null> {
    return this.refreshModel.findOne({ tokenHash }).exec();
  }

  deleteRefreshToken(tokenHash: string): Promise<any> {
    return this.refreshModel.deleteOne({ tokenHash }).exec();
  }

  deleteRefreshTokensByUser(userId: string): Promise<any> {
    return this.refreshModel.deleteMany({ userId }).exec();
  }

  createPasswordResetToken(data: Partial<PasswordResetToken>): Promise<PasswordResetTokenDocument> {
    return this.resetModel.create(data);
  }

  findPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenDocument | null> {
    return this.resetModel.findOne({ tokenHash }).exec();
  }

  markPasswordResetUsed(id: string): Promise<PasswordResetTokenDocument | null> {
    return this.resetModel.findByIdAndUpdate(id, { used: true }).exec();
  }

  createEmailOutbox(data: Partial<EmailOutbox>): Promise<EmailOutboxDocument> {
    return this.outboxModel.create(data);
  }

  createAuthEvent(data: Partial<AuthEvent>): Promise<AuthEventDocument> {
    return this.eventModel.create(data);
  }

  createPortalSession(data: Partial<PortalSession>): Promise<PortalSessionDocument> {
    return this.portalSessionModel.create(data);
  }

  findPortalSession(tokenHash: string): Promise<PortalSessionDocument | null> {
    return this.portalSessionModel.findOne({ tokenHash }).exec();
  }

  deletePortalSession(tokenHash: string): Promise<any> {
    return this.portalSessionModel.deleteOne({ tokenHash }).exec();
  }
}
