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
exports.ParcelSubdivisionRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const parcel_subdivision_schema_1 = require("./parcel-subdivision.schema");
let ParcelSubdivisionRepository = class ParcelSubdivisionRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findById(tenantId, id) {
        return this.model.findOne({ _id: id, tenantId }).exec();
    }
    async list(tenantId, projectId, filters) {
        const query = { tenantId, projectId };
        if (filters?.status)
            query.status = filters.status;
        if (filters?.tipo)
            query.tipo = filters.tipo;
        if (filters?.parentParcelId)
            query.parentParcelId = filters.parentParcelId;
        return this.model.find(query).sort({ createdAt: -1 }).exec();
    }
    async update(id, tenantId, data) {
        return this.model.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true }).exec();
    }
};
exports.ParcelSubdivisionRepository = ParcelSubdivisionRepository;
exports.ParcelSubdivisionRepository = ParcelSubdivisionRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(parcel_subdivision_schema_1.ParcelSubdivision.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ParcelSubdivisionRepository);
//# sourceMappingURL=parcel-subdivision.repository.js.map