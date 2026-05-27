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
exports.ShapefileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const shapefile_service_1 = require("./shapefile.service");
const parcels_service_1 = require("./parcels.service");
let ShapefileController = class ShapefileController {
    constructor(shapefileService, parcelsService) {
        this.shapefileService = shapefileService;
        this.parcelsService = parcelsService;
    }
    async importShp(file, projectId, req) {
        if (!file)
            throw new common_1.BadRequestException('Arquivo não enviado. Use field name "file".');
        const parsed = await this.shapefileService.parse(file.buffer, file.originalname);
        const tenantId = req.tenantId || 'demo';
        const userId = req.user?.sub || req.user?.id;
        return this.parcelsService.importGeojson(tenantId, projectId, parsed, 'SHAPEFILE', file.originalname, true, userId);
    }
};
exports.ShapefileController = ShapefileController;
__decorate([
    (0, common_1.Post)('shp'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 50 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ShapefileController.prototype, "importShp", null);
exports.ShapefileController = ShapefileController = __decorate([
    (0, common_1.Controller)('ctm/parcels/import'),
    __metadata("design:paramtypes", [shapefile_service_1.ShapefileService,
        parcels_service_1.ParcelsService])
], ShapefileController);
//# sourceMappingURL=shapefile.controller.js.map