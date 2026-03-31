import { Model } from 'mongoose';
import { RefreshToken, RefreshTokenDocument } from './refresh-token.schema';
import { PasswordResetToken, PasswordResetTokenDocument } from './password-reset.schema';
import { EmailOutbox, EmailOutboxDocument } from './email-outbox.schema';
import { AuthEvent, AuthEventDocument } from './auth-event.schema';
export declare class AuthRepository {
    private readonly refreshModel;
    private readonly resetModel;
    private readonly outboxModel;
    private readonly eventModel;
    constructor(refreshModel: Model<RefreshTokenDocument>, resetModel: Model<PasswordResetTokenDocument>, outboxModel: Model<EmailOutboxDocument>, eventModel: Model<AuthEventDocument>);
    createRefreshToken(data: Partial<RefreshToken>): Promise<RefreshTokenDocument>;
    findRefreshToken(tokenHash: string): Promise<RefreshTokenDocument | null>;
    deleteRefreshToken(tokenHash: string): Promise<any>;
    deleteRefreshTokensByUser(userId: string): Promise<any>;
    createPasswordResetToken(data: Partial<PasswordResetToken>): Promise<PasswordResetTokenDocument>;
    findPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenDocument | null>;
    markPasswordResetUsed(id: string): Promise<PasswordResetTokenDocument | null>;
    createEmailOutbox(data: Partial<EmailOutbox>): Promise<EmailOutboxDocument>;
    createAuthEvent(data: Partial<AuthEvent>): Promise<AuthEventDocument>;
}
