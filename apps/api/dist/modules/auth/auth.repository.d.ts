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
    createRefreshToken(data: Partial<RefreshToken>): Promise<import("mongoose").Document<unknown, {}, RefreshTokenDocument, {}, {}> & RefreshToken & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findRefreshToken(tokenHash: string): Promise<(import("mongoose").Document<unknown, {}, RefreshTokenDocument, {}, {}> & RefreshToken & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    deleteRefreshToken(tokenHash: string): Promise<import("mongodb").DeleteResult>;
    deleteRefreshTokensByUser(userId: string): Promise<import("mongodb").DeleteResult>;
    createPasswordResetToken(data: Partial<PasswordResetToken>): Promise<import("mongoose").Document<unknown, {}, PasswordResetTokenDocument, {}, {}> & PasswordResetToken & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findPasswordResetToken(tokenHash: string): Promise<(import("mongoose").Document<unknown, {}, PasswordResetTokenDocument, {}, {}> & PasswordResetToken & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    markPasswordResetUsed(id: string): Promise<(import("mongoose").Document<unknown, {}, PasswordResetTokenDocument, {}, {}> & PasswordResetToken & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createEmailOutbox(data: Partial<EmailOutbox>): Promise<import("mongoose").Document<unknown, {}, EmailOutboxDocument, {}, {}> & EmailOutbox & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createAuthEvent(data: Partial<AuthEvent>): Promise<import("mongoose").Document<unknown, {}, AuthEventDocument, {}, {}> & AuthEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
