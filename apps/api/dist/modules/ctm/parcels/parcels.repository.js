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
exports.ParcelsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const parcel_schema_1 = require("./parcel.schema");
const object_id_1 = require("../../../common/utils/object-id");
let ParcelsRepository = class ParcelsRepository {
    constructor(model) {
        this.model = model;
    }
    list(tenantId, filters) {
        const query = {
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(filters.projectId),
        };
        if (filters.sqlu)
            query.sqlu = filters.sqlu;
        if (filters.inscription)
            query.inscription = filters.inscription;
        if (filters.inscricaoImobiliaria) {
            query.inscricaoImobiliaria = filters.inscricaoImobiliaria;
        }
        if (filters.status)
            query.status = filters.status;
        if (filters.workflowStatus)
            query.workflowStatus = filters.workflowStatus;
        if (filters.zoneId)
            query.zoneId = (0, object_id_1.asObjectId)(filters.zoneId);
        if (filters.faceId)
            query.faceId = (0, object_id_1.asObjectId)(filters.faceId);
        if (filters.q) {
            const term = filters.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(term, 'i');
            query.$or = [
                { sqlu: regex },
                { inscription: regex },
                { inscricaoImobiliaria: regex },
                { mainAddress: regex },
                { 'enderecoPrincipal.logradouro': regex },
                { 'enderecoPrincipal.bairro': regex },
                { 'enderecoPrincipal.cidade': regex },
            ];
        }
        if (filters.bbox) {
            const [minLng, minLat, maxLng, maxLat] = filters.bbox.split(',').map(Number);
            query.geometry = {
                $geoWithin: {
                    $box: [
                        [minLng, minLat],
                        [maxLng, maxLat],
                    ],
                },
            };
        }
        return this.model.find(query).sort({ sqlu: 1 }).exec();
    }
    findById(tenantId, projectId, id) {
        return this.model
            .findOne({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .exec();
    }
    create(data) {
        return this.model.create(data);
    }
    update(tenantId, projectId, id, data) {
        return this.model
            .findOneAndUpdate({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) }, data, { new: true })
            .exec();
    }
    delete(tenantId, projectId, id) {
        return this.model.deleteOne({
            _id: id,
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        });
    }
};
exports.ParcelsRepository = ParcelsRepository;
exports.ParcelsRepository = ParcelsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(parcel_schema_1.Parcel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ParcelsRepository);
//# sourceMappingURL=parcels.repository.js.map