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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileFieldRecordSchema = exports.MobileFieldRecord = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let MobileFieldRecord = class MobileFieldRecord {
};
exports.MobileFieldRecord = MobileFieldRecord;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MobileFieldRecord.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MobileFieldRecord.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MobileFieldRecord.prototype, "parcelId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], MobileFieldRecord.prototype, "checklist", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], MobileFieldRecord.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MobileFieldRecord.prototype, "photoBase64", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'RECEBIDO' }),
    __metadata("design:type", String)
], MobileFieldRecord.prototype, "syncStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MobileFieldRecord.prototype, "syncedBy", void 0);
exports.MobileFieldRecord = MobileFieldRecord = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'mobile_field_records' })
], MobileFieldRecord);
exports.MobileFieldRecordSchema = mongoose_1.SchemaFactory.createForClass(MobileFieldRecord);
exports.MobileFieldRecordSchema.index({ tenantId: 1, projectId: 1, parcelId: 1, createdAt: -1 });
//# sourceMappingURL=mobile-field-record.schema.js.map