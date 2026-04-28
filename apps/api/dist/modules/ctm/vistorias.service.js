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
exports.VistoriasService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const vistoria_schema_1 = require("./vistoria.schema");
const VALID_TRANSITIONS = {
    RASCUNHO: ['ENVIADA', 'CANCELADA'],
    ENVIADA: ['EM_ANALISE', 'CANCELADA'],
    EM_ANALISE: ['APROVADA', 'REJEITADA', 'CANCELADA'],
    APROVADA: ['CANCELADA'],
    REJEITADA: [],
    CANCELADA: [],
};
let VistoriasService = class VistoriasService {
    constructor(model) {
        this.model = model;
    }
    async create(dto, userId, tenantId) {
        if (!dto.parcelId)
            throw new common_1.BadRequestException('parcelId obrigatório');
        if (!dto.tipo)
            throw new common_1.BadRequestException('tipo obrigatório');
        if (!dto.data)
            throw new common_1.BadRequestException('data obrigatória');
        const vistoria = await this.model.create({
            ...dto,
            data: new Date(dto.data),
            status: 'RASCUNHO',
            fotos: dto.fotos || [],
            historico: [{ status: 'RASCUNHO', observacao: 'Criada', userId, timestamp: new Date() }],
            operadorId: userId,
            tenantId,
        });
        return vistoria;
    }
    async findAll(tenantId, parcelId) {
        const filter = { tenantId };
        if (parcelId)
            filter.parcelId = parcelId;
        return this.model.find(filter).sort({ createdAt: -1 }).exec();
    }
    async findById(id, tenantId) {
        const v = await this.model.findOne({ _id: id, tenantId }).exec();
        if (!v)
            throw new common_1.NotFoundException('Vistoria não encontrada');
        return v;
    }
    async update(id, dto, tenantId) {
        const v = await this.findById(id, tenantId);
        Object.assign(v, dto);
        return v.save();
    }
    async transicao(id, newStatus, observacao, userId, tenantId) {
        const v = await this.findById(id, tenantId);
        const allowed = VALID_TRANSITIONS[v.status] || [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Transição inválida: ${v.status} → ${newStatus}`);
        }
        v.status = newStatus;
        v.historico = [...(v.historico || []), { status: newStatus, observacao, userId, timestamp: new Date() }];
        return v.save();
    }
    async addFotos(id, urls, tenantId) {
        const v = await this.findById(id, tenantId);
        v.fotos = [...(v.fotos || []), ...urls];
        return v.save();
    }
    async remove(id, tenantId) {
        await this.findById(id, tenantId);
        await this.model.findByIdAndDelete(id).exec();
        return { deleted: true };
    }
};
exports.VistoriasService = VistoriasService;
exports.VistoriasService = VistoriasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vistoria_schema_1.Vistoria.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VistoriasService);
//# sourceMappingURL=vistorias.service.js.map