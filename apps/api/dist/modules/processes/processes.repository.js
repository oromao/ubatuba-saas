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
exports.ProcessesRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const process_schema_1 = require("./process.schema");
const process_event_schema_1 = require("./process-event.schema");
const object_id_1 = require("../../common/utils/object-id");
let ProcessesRepository = class ProcessesRepository {
    constructor(model, eventModel) {
        this.model = model;
        this.eventModel = eventModel;
    }
    list(tenantId) {
        return this.model.find({ tenantId: (0, object_id_1.asObjectId)(tenantId) }).sort({ createdAt: -1 }).exec();
    }
    findById(tenantId, id) {
        return this.model.findOne({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId) }).exec();
    }
    create(data) {
        return this.model.create(data);
    }
    update(tenantId, id, data) {
        return this.model
            .findOneAndUpdate({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId) }, data, { new: true })
            .exec();
    }
    delete(tenantId, id) {
        return this.model.deleteOne({ _id: id, tenantId: (0, object_id_1.asObjectId)(tenantId) }).exec();
    }
    addEvent(data) {
        return this.eventModel.create(data);
    }
    listEvents(tenantId, processId) {
        return this.eventModel
            .find({ tenantId: (0, object_id_1.asObjectId)(tenantId), processId })
            .sort({ createdAt: -1 })
            .exec();
    }
};
exports.ProcessesRepository = ProcessesRepository;
exports.ProcessesRepository = ProcessesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(process_schema_1.Process.name)),
    __param(1, (0, mongoose_1.InjectModel)(process_event_schema_1.ProcessEvent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ProcessesRepository);
//# sourceMappingURL=processes.repository.js.map