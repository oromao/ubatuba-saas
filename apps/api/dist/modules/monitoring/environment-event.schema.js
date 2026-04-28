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
exports.EnvironmentalEventSchema = exports.EnvironmentalEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let EnvironmentalEvent = class EnvironmentalEvent {
};
exports.EnvironmentalEvent = EnvironmentalEvent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EnvironmentalEvent.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "severity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "stage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "classification", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], EnvironmentalEvent.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnvironmentalEvent.prototype, "evidenceKeys", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], EnvironmentalEvent.prototype, "timeline", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'MANUAL' }),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "sourceMode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "sourceAdapter", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "externalReference", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "observedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "assignedTo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "notifiedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EnvironmentalEvent.prototype, "resolvedAt", void 0);
exports.EnvironmentalEvent = EnvironmentalEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'environmental_events' })
], EnvironmentalEvent);
exports.EnvironmentalEventSchema = mongoose_1.SchemaFactory.createForClass(EnvironmentalEvent);
//# sourceMappingURL=environment-event.schema.js.map