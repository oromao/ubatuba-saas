import { UsersRepository } from './users.repository';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    findByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, import("./user.schema").UserDocument, {}, {}> & import("./user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./user.schema").UserDocument, {}, {}> & import("./user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: {
        email: string;
        passwordHash: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./user.schema").UserDocument, {}, {}> & import("./user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updatePassword(id: string, passwordHash: string): Promise<(import("mongoose").Document<unknown, {}, import("./user.schema").UserDocument, {}, {}> & import("./user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
