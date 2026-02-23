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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const refresh_token_schema_1 = require("./refresh-token.schema");
const password_reset_schema_1 = require("./password-reset.schema");
const email_outbox_schema_1 = require("./email-outbox.schema");
const auth_event_schema_1 = require("./auth-event.schema");
let AuthRepository = class AuthRepository {
    constructor(refreshModel, resetModel, outboxModel, eventModel) {
        this.refreshModel = refreshModel;
        this.resetModel = resetModel;
        this.outboxModel = outboxModel;
        this.eventModel = eventModel;
    }
    createRefreshToken(data) {
        return this.refreshModel.create(data);
    }
    findRefreshToken(tokenHash) {
        return this.refreshModel.findOne({ tokenHash }).exec();
    }
    deleteRefreshToken(tokenHash) {
        return this.refreshModel.deleteOne({ tokenHash }).exec();
    }
    deleteRefreshTokensByUser(userId) {
        return this.refreshModel.deleteMany({ userId }).exec();
    }
    createPasswordResetToken(data) {
        return this.resetModel.create(data);
    }
    findPasswordResetToken(tokenHash) {
        return this.resetModel.findOne({ tokenHash }).exec();
    }
    markPasswordResetUsed(id) {
        return this.resetModel.findByIdAndUpdate(id, { used: true }).exec();
    }
    createEmailOutbox(data) {
        return this.outboxModel.create(data);
    }
    createAuthEvent(data) {
        return this.eventModel.create(data);
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(refresh_token_schema_1.RefreshToken.name)),
    __param(1, (0, mongoose_1.InjectModel)(password_reset_schema_1.PasswordResetToken.name)),
    __param(2, (0, mongoose_1.InjectModel)(email_outbox_schema_1.EmailOutbox.name)),
    __param(3, (0, mongoose_1.InjectModel)(auth_event_schema_1.AuthEvent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map