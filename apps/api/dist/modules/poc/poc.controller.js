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
exports.PocController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/guards/public.decorator");
const poc_service_1 = require("./poc.service");
let PocController = class PocController {
    constructor(service) {
        this.service = service;
    }
    health() {
        return this.service.health();
    }
    score() {
        return this.service.score();
    }
};
exports.PocController = PocController;
__decorate([
    (0, common_1.Get)('health'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PocController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('score'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PocController.prototype, "score", null);
exports.PocController = PocController = __decorate([
    (0, swagger_1.ApiTags)('poc'),
    (0, common_1.Controller)('poc'),
    __metadata("design:paramtypes", [poc_service_1.PocService])
], PocController);
//# sourceMappingURL=poc.controller.js.map