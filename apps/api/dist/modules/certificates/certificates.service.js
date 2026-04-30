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
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const cache_service_1 = require("../shared/cache.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const processes_repository_1 = require("../processes/processes.repository");
const digital_signature_service_1 = require("../../common/services/digital-signature.service");
const certificates_repository_1 = require("./certificates.repository");
function buildMinimalPdf(params) {
    const lines = [params.title, ...params.bodyLines].map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
    const text = [
        '%PDF-1.4',
        '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
        '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
        '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
        '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
        `5 0 obj << /Length ${Math.max(1, lines.join('\n').length + 80)} >> stream`,
        'BT /F1 16 Tf 50 780 Td',
        lines.map((line, index) => `${index === 0 ? '' : '0 -22 Td '}(${line}) Tj`).join('\n'),
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
    ].join('\n');
    return Buffer.from(text, 'utf8');
}
let CertificatesService = class CertificatesService {
    constructor(repository, processesRepository, objectStorageService, cacheService, signatureService) {
        this.repository = repository;
        this.processesRepository = processesRepository;
        this.objectStorageService = objectStorageService;
        this.cacheService = cacheService;
        this.signatureService = signatureService;
    }
    list(tenantId) {
        return this.repository.list(tenantId);
    }
    findById(tenantId, id) {
        return this.repository.findById(tenantId, id);
    }
    async issue(tenantId, dto, issuedBy) {
        const process = dto.processId ? await this.processesRepository.findById(tenantId, dto.processId) : null;
        if (dto.processId && !process) {
            throw new common_1.NotFoundException('Processo nao encontrado');
        }
        const validationCode = (0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 12).toUpperCase();
        const payload = {
            tenantId,
            processId: dto.processId ?? null,
            type: dto.type,
            subjectName: dto.subjectName,
            subjectDocument: dto.subjectDocument ?? null,
            issuedAt: new Date().toISOString(),
            issuedBy: issuedBy ?? null,
        };
        const hashSha256 = (0, crypto_1.createHash)('sha256').update(JSON.stringify(payload)).digest('hex');
        const validationUrl = `/certificates/validate/${validationCode}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(validationUrl)}`;
        const signed = this.signatureService.signPayload(payload);
        const publicKeyHash = (0, crypto_1.createHash)('sha256').update(signed.publicKeyPem).digest('hex').slice(0, 16);
        const pdfBuffer = buildMinimalPdf({
            title: `Certidao ${dto.type}`,
            bodyLines: [
                `Titular: ${dto.subjectName}`,
                `Tipo: ${dto.type}`,
                `Codigo: ${validationCode}`,
                `Hash SHA-256: ${hashSha256}`,
                `Assinatura Digital: ${signed.signature.slice(0, 40)}...`,
                `Algoritmo: ${signed.algorithm}`,
                `Assinado em: ${signed.signedAt}`,
                `Chave Publica Hash: ${publicKeyHash}`,
            ],
        });
        const pdfKey = `certificates/${tenantId}/${validationCode}.pdf`;
        await this.objectStorageService.putObject({
            key: pdfKey,
            content: pdfBuffer,
            contentType: 'application/pdf',
        });
        const created = await this.repository.create({
            tenantId: tenantId,
            processId: dto.processId,
            type: dto.type,
            subjectName: dto.subjectName,
            subjectDocument: dto.subjectDocument,
            validationCode,
            hashSha256,
            pdfKey,
            payloadJson: JSON.stringify(payload),
            status: 'EMITIDA',
            issuedBy,
            issuedAt: payload.issuedAt,
            signature: signed.signature,
            signatureAlgorithm: signed.algorithm,
            signedAt: signed.signedAt,
            publicKeyHash,
            qrCodeUrl,
        });
        await this.cacheService.invalidateByPrefix(`certificates:${tenantId}`);
        return {
            ...created.toObject(),
            validationUrl: `/certificates/validate/${validationCode}`,
            downloadUrl: pdfKey,
        };
    }
    async validatePublic(tenantId, validationCode) {
        const certificate = await this.repository.findByValidationCode(tenantId, validationCode);
        if (!certificate) {
            throw new common_1.NotFoundException('Certidao nao encontrada');
        }
        const isValid = certificate.status === 'EMITIDA';
        let signatureValid = false;
        if (certificate.signature && certificate.payloadJson) {
            try {
                const payload = JSON.parse(certificate.payloadJson);
                signatureValid = this.signatureService.verifySignature({
                    payload,
                    signature: certificate.signature,
                    algorithm: certificate.signatureAlgorithm || 'RSA-SHA256',
                    signedAt: certificate.signedAt || '',
                    publicKeyPem: '',
                });
            }
            catch {
                signatureValid = false;
            }
        }
        return {
            valid: isValid,
            signatureValid,
            certificate,
        };
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [certificates_repository_1.CertificatesRepository,
        processes_repository_1.ProcessesRepository,
        object_storage_service_1.ObjectStorageService,
        cache_service_1.CacheService,
        digital_signature_service_1.DigitalSignatureService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map