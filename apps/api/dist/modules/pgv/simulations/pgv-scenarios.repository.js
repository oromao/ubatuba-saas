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
exports.PgvScenariosRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const object_id_1 = require("../../../common/utils/object-id");
const pgv_scenario_schema_1 = require("./pgv-scenario.schema");
let PgvScenariosRepository = class PgvScenariosRepository {
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return this.model.create(data);
    }
    list(tenantId, projectId) {
        return this.model
            .find({ tenantId: (0, object_id_1.asObjectId)(tenantId), projectId: (0, object_id_1.asObjectId)(projectId) })
            .sort({ createdAt: -1 })
            .exec();
    }
};
exports.PgvScenariosRepository = PgvScenariosRepository;
exports.PgvScenariosRepository = PgvScenariosRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(pgv_scenario_schema_1.PgvScenario.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PgvScenariosRepository);
//# sourceMappingURL=pgv-scenarios.repository.js.map