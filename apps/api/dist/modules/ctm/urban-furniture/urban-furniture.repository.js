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
exports.UrbanFurnitureRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const urban_furniture_schema_1 = require("./urban-furniture.schema");
const object_id_1 = require("../../../common/utils/object-id");
let UrbanFurnitureRepository = class UrbanFurnitureRepository {
    constructor(model) {
        this.model = model;
    }
    list(tenantId, projectId, bbox) {
        const query = {
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
        };
        if (bbox) {
            const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
            query.location = {
                $geoWithin: {
                    $box: [
                        [minLng, minLat],
                        [maxLng, maxLat],
                    ],
                },
            };
        }
        return this.model.find(query).sort({ createdAt: -1 }).exec();
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
exports.UrbanFurnitureRepository = UrbanFurnitureRepository;
exports.UrbanFurnitureRepository = UrbanFurnitureRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(urban_furniture_schema_1.UrbanFurniture.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UrbanFurnitureRepository);
//# sourceMappingURL=urban-furniture.repository.js.map