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
exports.DashboardLayoutSchema = exports.DashboardLayout = exports.DashboardWidgetConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DashboardWidgetConfig = class DashboardWidgetConfig {
};
exports.DashboardWidgetConfig = DashboardWidgetConfig;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DashboardWidgetConfig.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], DashboardWidgetConfig.prototype, "visible", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DashboardWidgetConfig.prototype, "order", void 0);
exports.DashboardWidgetConfig = DashboardWidgetConfig = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], DashboardWidgetConfig);
let DashboardLayout = class DashboardLayout {
};
exports.DashboardLayout = DashboardLayout;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DashboardLayout.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DashboardLayout.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'executive' }),
    __metadata("design:type", String)
], DashboardLayout.prototype, "viewMode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DashboardWidgetConfig], default: [] }),
    __metadata("design:type", Array)
], DashboardLayout.prototype, "widgets", void 0);
exports.DashboardLayout = DashboardLayout = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'dashboard_layouts' })
], DashboardLayout);
exports.DashboardLayoutSchema = mongoose_1.SchemaFactory.createForClass(DashboardLayout);
exports.DashboardLayoutSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
//# sourceMappingURL=dashboard-layout.schema.js.map