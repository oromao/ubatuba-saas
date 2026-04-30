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
exports.Citizen156Repository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const object_id_1 = require("../../common/utils/object-id");
const citizen_call_schema_1 = require("./citizen-call.schema");
let Citizen156Repository = class Citizen156Repository {
    constructor(model) {
        this.model = model;
    }
    list(tenantId) {
        return this.model
            .find({
            $or: [{ tenantId }, { tenantId: (0, object_id_1.asObjectId)(tenantId) }],
        })
            .sort({ createdAt: -1 })
            .exec();
    }
    findById(tenantId, id) {
        return this.model.findOne({
            _id: id,
            $or: [{ tenantId }, { tenantId: (0, object_id_1.asObjectId)(tenantId) }],
        }).exec();
    }
    create(data) {
        return this.model.create({
            ...data,
            tenantId: data.tenantId ? (0, object_id_1.asObjectId)(String(data.tenantId)) : data.tenantId,
            projectId: data.projectId ? (0, object_id_1.asObjectId)(String(data.projectId)) : data.projectId,
        });
    }
    save(doc) {
        return doc.save();
    }
    findByProtocol(protocolNumber) {
        return this.model.findOne({ protocolNumber }).exec();
    }
};
exports.Citizen156Repository = Citizen156Repository;
exports.Citizen156Repository = Citizen156Repository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(citizen_call_schema_1.CitizenCall.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], Citizen156Repository);
//# sourceMappingURL=citizen-156.repository.js.map