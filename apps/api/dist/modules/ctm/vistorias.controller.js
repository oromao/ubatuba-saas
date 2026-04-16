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
exports.VistoriasController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const vistorias_service_1 = require("./vistorias.service");
const create_vistoria_dto_1 = require("./dto/create-vistoria.dto");
const update_vistoria_dto_1 = require("./dto/update-vistoria.dto");
const transicao_vistoria_dto_1 = require("./dto/transicao-vistoria.dto");
const upload_service_1 = require("../uploads/upload.service");
let VistoriasController = class VistoriasController {
    constructor(service, uploadService) {
        this.service = service;
        this.uploadService = uploadService;
    }
    create(dto, req) {
        return this.service.create(dto, req.user?.sub ?? '', req.tenantId ?? '');
    }
    findAll(parcelId, req) {
        return this.service.findAll(req.tenantId ?? '', parcelId);
    }
    findOne(id, req) {
        return this.service.findById(id, req.tenantId ?? '');
    }
    update(id, dto, req) {
        return this.service.update(id, dto, req.tenantId ?? '');
    }
    transicao(id, dto, req) {
        return this.service.transicao(id, dto.status, dto.observacao ?? '', req.user?.sub ?? '', req.tenantId ?? '');
    }
    async addFotos(id, files, req) {
        const urls = await this.uploadService.saveFiles(files ?? []);
        return this.service.addFotos(id, urls, req.tenantId ?? '');
    }
    remove(id, req) {
        return this.service.remove(id, req.tenantId ?? '');
    }
};
exports.VistoriasController = VistoriasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vistoria_dto_1.CreateVistoriaDto, Object]),
    __metadata("design:returntype", void 0)
], VistoriasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('parcelId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VistoriasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VistoriasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vistoria_dto_1.UpdateVistoriaDto, Object]),
    __metadata("design:returntype", void 0)
], VistoriasController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/transicao'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transicao_vistoria_dto_1.TransicaoVistoriaDto, Object]),
    __metadata("design:returntype", void 0)
], VistoriasController.prototype, "transicao", null);
__decorate([
    (0, common_1.Post)(':id/fotos'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], VistoriasController.prototype, "addFotos", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VistoriasController.prototype, "remove", null);
exports.VistoriasController = VistoriasController = __decorate([
    (0, common_1.Controller)('ctm/vistorias'),
    __metadata("design:paramtypes", [vistorias_service_1.VistoriasService,
        upload_service_1.UploadService])
], VistoriasController);
//# sourceMappingURL=vistorias.controller.js.map