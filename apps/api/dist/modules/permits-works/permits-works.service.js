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
exports.PermitsWorksService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const cache_service_1 = require("../shared/cache.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const projects_service_1 = require("../projects/projects.service");
const permits_works_repository_1 = require("./permits-works.repository");
const WORK_STAGE_TO_STATUS = {
    ABERTURA: 'ABERTO',
    ANALISE_TECNICA: 'EM_ANALISE',
    EXIGENCIAS: 'EXIGENCIA',
    PARECER: 'EM_ANALISE',
    TAXAS: 'EM_TAXA',
    ASSINATURA: 'EM_ASSINATURA',
    EMISSAO: 'EMISSO',
    ENCERRAMENTO: 'CONCLUIDO',
    INDEFERIDO: 'INDEFERIDO',
};
const WORK_TRANSITIONS = {
    ABERTURA: ['ANALISE_TECNICA', 'EXIGENCIAS', 'INDEFERIDO'],
    ANALISE_TECNICA: ['EXIGENCIAS', 'PARECER', 'TAXAS', 'INDEFERIDO'],
    EXIGENCIAS: ['ANALISE_TECNICA', 'PARECER', 'INDEFERIDO'],
    PARECER: ['TAXAS', 'ASSINATURA', 'EXIGENCIAS', 'INDEFERIDO'],
    TAXAS: ['ASSINATURA', 'INDEFERIDO'],
    ASSINATURA: ['EMISSAO', 'INDEFERIDO'],
    EMISSAO: ['ENCERRAMENTO'],
    ENCERRAMENTO: [],
    INDEFERIDO: [],
};
function buildSimplePdf(title, lines) {
    const safe = [title, ...lines].map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
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
let PermitsWorksService = class PermitsWorksService {
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
        const projectId = await this.projectsService.resolveProjectId(tenantId);
        const protocolNumber = `OB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(0, crypto_1.randomUUID)().slice(0, 6).toUpperCase()}`;
        const request = await this.repository.create({
            tenantId: tenantId,
            projectId,
            protocolNumber,
            applicantName: dto.applicantName,
            subjectAddress: dto.subjectAddress,
            status: 'ABERTO',
            currentStage: 'ABERTURA',
            responsibleDepartment: 'Urbanismo / Obras',
            history: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    status: 'ABERTO',
                    stage: 'ABERTURA',
                    action: 'ABRIR_PROCESSO',
                    message: 'Solicitacao aberta',
                    createdAt: new Date().toISOString(),
                    actorId,
                },
            ],
            requirements: (dto.requirements ?? []).map((title) => ({
                id: (0, crypto_1.randomUUID)(),
                title,
                status: 'ABERTA',
                responsibleDepartment: 'Urbanismo / Obras',
                createdAt: new Date().toISOString(),
            })),
            invoices: [],
        });
        await this.cacheService.invalidateByPrefix(`permits-works:${tenantId}`);
        return request;
    }
    async update(tenantId, id, dto, actorId) {
        const request = await this.repository.findById(tenantId, id);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        if (dto.stage) {
            this.transition(request, dto.stage, dto.message, actorId);
        }
        else if (dto.status) {
            request.status = dto.status;
            request.history.push({
                id: (0, crypto_1.randomUUID)(),
                status: dto.status,
                stage: request.currentStage,
                action: 'UPDATE_STATUS',
                message: dto.message ?? `Status alterado para ${dto.status}`,
                createdAt: new Date().toISOString(),
                actorId,
            });
        }
        return this.repository.save(request);
    }
    async addInvoice(tenantId, id, description, amount) {
        const request = await this.repository.findById(tenantId, id);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        request.invoices.push({
            id: (0, crypto_1.randomUUID)(),
            description,
            amount,
            status: 'PENDENTE',
            createdAt: new Date().toISOString(),
        });
        this.transition(request, 'TAXAS', `Taxa adicionada: ${description}`);
        return this.repository.save(request);
    }
    async addRequirementResponse(tenantId, id, requirementId, note, actorId) {
        const request = await this.repository.findById(tenantId, id);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        const requirement = request.requirements.find((item) => item.id === requirementId);
        if (!requirement)
            throw new common_1.NotFoundException('Exigencia nao encontrada');
        requirement.status = 'ATENDIDA';
        requirement.notes = note;
        requirement.reviewedBy = actorId;
        requirement.updatedAt = new Date().toISOString();
        request.evidences.push({
            id: (0, crypto_1.randomUUID)(),
            title: `Atendimento de exigencia: ${requirement.title}`,
            note,
            createdAt: new Date().toISOString(),
            createdBy: actorId,
        });
        request.history.push({
            id: (0, crypto_1.randomUUID)(),
            status: request.status,
            stage: request.currentStage,
            action: 'ATENDER_EXIGENCIA',
            message: note,
            createdAt: new Date().toISOString(),
            actorId,
        });
        return this.repository.save(request);
    }
    async addEvidence(tenantId, id, title, note, fileName, actorId) {
        const request = await this.repository.findById(tenantId, id);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        request.evidences.push({
            id: (0, crypto_1.randomUUID)(),
            title,
            note,
            fileName,
            createdAt: new Date().toISOString(),
            createdBy: actorId,
        });
        request.history.push({
            id: (0, crypto_1.randomUUID)(),
            status: request.status,
            stage: request.currentStage,
            action: 'ANEXAR_EVIDENCIA',
            message: title,
            createdAt: new Date().toISOString(),
            actorId,
        });
        return this.repository.save(request);
    }
    async decide(tenantId, id, decision, reason, actorId) {
        const request = await this.repository.findById(tenantId, id);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        request.decision = {
            kind: decision,
            reason,
            at: new Date().toISOString(),
            actorId,
        };
        if (decision === 'DEFERIDO') {
            this.transition(request, request.currentStage === 'EMISSAO' ? 'ENCERRAMENTO' : 'EMISSAO', reason ?? 'Processo deferido', actorId, true);
            request.status = 'CONCLUIDO';
        }
        else if (decision === 'INDEFERIDO') {
            this.transition(request, 'INDEFERIDO', reason ?? 'Processo indeferido', actorId, true);
        }
        else {
            this.transition(request, 'EXIGENCIAS', reason ?? 'Processo devolvido para atendimento', actorId, true);
            request.status = 'EXIGENCIA';
        }
        return this.repository.save(request);
    }
    async issueDecisionPdf(tenantId, id) {
        const request = await this.repository.findById(tenantId, id);
        if (!request)
            throw new common_1.NotFoundException('Solicitacao nao encontrada');
        const pdf = buildSimplePdf('Alvara Digital de Obras', [
            `Protocolo: ${request.protocolNumber}`,
            `Requerente: ${request.applicantName}`,
            `Endereco: ${request.subjectAddress}`,
            `Status: ${request.status}`,
        ]);
        const key = `permits-works/${tenantId}/${request.protocolNumber}.pdf`;
        await this.storage.putObject({ key, content: pdf, contentType: 'application/pdf' });
        request.decisionPdfKey = key;
        request.currentStage = 'EMISSAO';
        request.status = 'EMISSO';
        request.history.push({
            id: (0, crypto_1.randomUUID)(),
            status: 'EMISSO',
            stage: 'EMISSAO',
            action: 'GERAR_PDF',
            message: 'PDF de decisao gerado',
            createdAt: new Date().toISOString(),
        });
        return this.repository.save(request);
    }
    transition(request, stage, message, actorId, force = false) {
        const allowed = WORK_TRANSITIONS[request.currentStage] ?? [];
        if (!force && request.currentStage !== stage && !allowed.includes(stage)) {
            throw new common_1.BadRequestException(`Transicao invalida de ${request.currentStage} para ${stage}`);
        }
        request.currentStage = stage;
        request.status = WORK_STAGE_TO_STATUS[stage];
        if (stage === 'EXIGENCIAS') {
            request.requirements = request.requirements.length
                ? request.requirements
                : [
                    {
                        id: (0, crypto_1.randomUUID)(),
                        title: 'Complementar documentacao tecnica',
                        status: 'ABERTA',
                        responsibleDepartment: 'Urbanismo / Obras',
                        createdAt: new Date().toISOString(),
                    },
                ];
            request.responsibleDepartment = 'Urbanismo / Obras';
        }
        if (stage === 'TAXAS')
            request.responsibleDepartment = 'Receita Municipal';
        if (stage === 'ASSINATURA' || stage === 'EMISSAO' || stage === 'ENCERRAMENTO')
            request.responsibleDepartment = 'Gabinete / Digital';
        request.history.push({
            id: (0, crypto_1.randomUUID)(),
            status: request.status,
            stage,
            action: 'TRANSICAO',
            message: message ?? `Etapa alterada para ${stage}`,
            createdAt: new Date().toISOString(),
            actorId,
        });
    }
    async importData(tenantId, data, fileName, sourceType, actorId) {
        if (!data || !Array.isArray(data.features)) {
            throw new common_1.BadRequestException('Dados GeoJSON inválidos. Esperado array de features.');
        }
        let imported = 0;
        let updated = 0;
        let errors = 0;
        const errorDetails = [];
        for (let i = 0; i < data.features.length; i++) {
            const feature = data.features[i];
            try {
                const properties = feature.properties || {};
                const applicantName = properties.applicantName || properties.applicant_name || `Importado ${i + 1}`;
                const subjectAddress = properties.subjectAddress || properties.address || `Endereço ${i + 1}`;
                const existing = await this.repository.findOne(tenantId, { applicantName });
                if (existing) {
                    await this.repository.update(tenantId, String(existing._id), { applicantName, subjectAddress });
                    updated++;
                }
                else {
                    await this.create(tenantId, { applicantName, subjectAddress }, actorId);
                    imported++;
                }
            }
            catch (error) {
                errors++;
                errorDetails.push({
                    row: i + 1,
                    featureId: feature.properties?.id,
                    message: error instanceof Error ? error.message : 'Erro desconhecido',
                });
            }
        }
        return { imported, updated, errors, errorDetails };
    }
    async importCsv(tenantId, csv, fileName, sourceType, actorId) {
        const lines = csv.split('\n').filter((line) => line.trim());
        if (lines.length < 2) {
            throw new common_1.BadRequestException('CSV deve ter cabeçalho e pelo menos uma linha de dados');
        }
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const applicantIndex = headers.indexOf('applicantname') || headers.indexOf('applicant') || headers.indexOf('requerente');
        const addressIndex = headers.indexOf('subjectaddress') || headers.indexOf('address') || headers.indexOf('endereco');
        let imported = 0;
        let updated = 0;
        let errors = 0;
        const errorDetails = [];
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].split(',').map((v) => v.trim());
                const applicantName = applicantIndex !== -1 ? values[applicantIndex] : `Importado ${i}`;
                const subjectAddress = addressIndex !== -1 ? values[addressIndex] : `Endereço ${i}`;
                if (!applicantName)
                    continue;
                const existing = await this.repository.findOne(tenantId, { applicantName });
                if (existing) {
                    await this.repository.update(tenantId, String(existing._id), { applicantName, subjectAddress });
                    updated++;
                }
                else {
                    await this.create(tenantId, { applicantName, subjectAddress }, actorId);
                    imported++;
                }
            }
            catch (error) {
                errors++;
                errorDetails.push({
                    row: i + 1,
                    message: error instanceof Error ? error.message : 'Erro desconhecido',
                });
            }
        }
        return { imported, updated, errors, errorDetails };
    }
};
exports.PermitsWorksService = PermitsWorksService;
exports.PermitsWorksService = PermitsWorksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permits_works_repository_1.PermitsWorksRepository,
        projects_service_1.ProjectsService,
        object_storage_service_1.ObjectStorageService,
        cache_service_1.CacheService])
], PermitsWorksService);
//# sourceMappingURL=permits-works.service.js.map