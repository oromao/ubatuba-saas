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
exports.EnvironmentService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const projects_service_1 = require("../projects/projects.service");
const cache_service_1 = require("../shared/cache.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const environment_repository_1 = require("./environment.repository");
function buildSimplePdf(lines) {
    const safe = lines.map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
    const body = safe.map((line, index) => `${index === 0 ? '' : '0 -20 Td '}(${line}) Tj`).join('\n');
    return Buffer.from([
        '%PDF-1.4',
        '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
        '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
        '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
        '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
        `5 0 obj << /Length ${body.length + 80} >> stream`,
        'BT /F1 14 Tf 50 780 Td',
        body,
        'ET',
        'endstream endobj',
        'xref',
        '0 6',
        '0000000000 65535 f ',
        '0000000010 00000 n ',
        '0000000063 00000 n ',
        '0000000120 00000 n ',
        '0000000240 00000 n ',
        '0000000310 00000 n ',
        'trailer << /Size 6 /Root 1 0 R >>',
        'startxref',
        '380',
        '%%EOF',
    ].join('\n'));
}
let EnvironmentService = class EnvironmentService {
    constructor(repository, projectsService, storage, cacheService) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.storage = storage;
        this.cacheService = cacheService;
    }
    list(tenantId) {
        return this.repository.list(tenantId);
    }
    findById(tenantId, id) {
        return this.repository.findById(tenantId, id);
    }
    async create(tenantId, dto, actorId) {
        const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const protocolNumber = `AM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(0, crypto_1.randomUUID)().slice(0, 6).toUpperCase()}`;
        const created = await this.repository.create({
            tenantId: tenantId,
            projectId,
            protocolNumber,
            title: dto.title,
            category: dto.category,
            status: 'ABERTO',
            history: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    status: 'ABERTO',
                    message: 'Caso ambiental aberto',
                    createdAt: new Date().toISOString(),
                    actorId,
                },
            ],
            tasks: (dto.tasks ?? []).map((title) => ({
                id: (0, crypto_1.randomUUID)(),
                title,
                status: 'ABERTA',
                createdAt: new Date().toISOString(),
            })),
            evidenceKeys: [],
        });
        await this.cacheService.invalidateByPrefix(`environment:${tenantId}`);
        return created;
    }
    async update(tenantId, id, dto, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Caso nao encontrado');
        if (dto.status) {
            current.status = dto.status;
            current.history.unshift({
                id: (0, crypto_1.randomUUID)(),
                status: dto.status,
                message: dto.message ?? `Status alterado para ${dto.status}`,
                createdAt: new Date().toISOString(),
                actorId,
            });
        }
        return this.repository.save(current);
    }
    async issueReport(tenantId, id) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Caso nao encontrado');
        const pdf = buildSimplePdf([
            'Gestao e Licenciamento Ambiental',
            `Protocolo: ${current.protocolNumber}`,
            `Titulo: ${current.title}`,
            `Categoria: ${current.category}`,
            `Status: ${current.status}`,
        ]);
        const key = `environment/${tenantId}/${current.protocolNumber}.pdf`;
        await this.storage.putObject({ key, content: pdf, contentType: 'application/pdf' });
        current.reportPdfKey = key;
        current.status = 'LAUDO';
        current.history.unshift({
            id: (0, crypto_1.randomUUID)(),
            status: 'LAUDO',
            message: 'Laudo gerado',
            createdAt: new Date().toISOString(),
        });
        return this.repository.save(current);
    }
    async summary(tenantId) {
        const items = await this.repository.list(tenantId);
        return {
            total: items.length,
            abertos: items.filter((item) => item.status === 'ABERTO').length,
            analise: items.filter((item) => item.status === 'EM_ANALISE').length,
            campo: items.filter((item) => item.status === 'EM_CAMPO' || item.status === 'OS').length,
            laudos: items.filter((item) => item.status === 'LAUDO').length,
            encerrados: items.filter((item) => item.status === 'ENCERRADO' || item.status === 'INDEFERIDO').length,
            tarefas: items.reduce((acc, item) => acc + (item.tasks?.length ?? 0), 0),
            evidencias: items.reduce((acc, item) => acc + (item.evidenceKeys?.length ?? 0), 0),
        };
    }
};
exports.EnvironmentService = EnvironmentService;
exports.EnvironmentService = EnvironmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [environment_repository_1.EnvironmentRepository,
        projects_service_1.ProjectsService,
        object_storage_service_1.ObjectStorageService,
        cache_service_1.CacheService])
], EnvironmentService);
//# sourceMappingURL=environment.service.js.map