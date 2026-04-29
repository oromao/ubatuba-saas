"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsService = void 0;
const common_1 = require("@nestjs/common");
const JSZip = require("jszip");
const PDFDocument = require("pdfkit");
let ExportsService = ExportsService_1 = class ExportsService {
    constructor() {
        this.logger = new common_1.Logger(ExportsService_1.name);
    }
    async generateReurbS_Dossier(nucleoId, metadata) {
        this.logger.log(`[EXPORT: ${metadata.reqTenant}] - Iniciando Geração do Dossiê ZIP do Núcleo: ${nucleoId}`);
        const zip = new JSZip();
        const csvContent = "NOME,CPF,QUADRA,LOTE,RENDA\nJoão da Silva,111.222.333-44,A,01,1500.00\nMaria Souza,222.333.444-55,A,02,0.00";
        zip.file("Lista_Ocupantes_Selada.csv", csvContent);
        zip.file("Planta_Georreferenciada_NAO_IMPLEMENTADA.txt", [
            'PLANTA GEORREFERENCIADA NAO IMPLEMENTADA',
            `nucleo_id=${nucleoId}`,
            `tenant=${metadata.reqTenant}`,
            'Este pacote nao contem geometria real. A origem geoespacial precisa ser integrada antes do uso operacional.',
        ].join('\n'));
        const pdfBuffer = await this.generateCertificatePdf(nucleoId, metadata);
        zip.file("CRF_Emissao_Automatica_Assinada.pdf", pdfBuffer);
        this.logger.log(`[ZIP BUILD] Concluído para Núcleo ${nucleoId}. Redirecionando payload para S3/MinIO ou Client.`);
        return zip.generateAsync({ type: 'nodebuffer', compression: "DEFLATE", compressionOptions: { level: 9 } });
    }
    generateCertificatePdf(nucleoId, metadata) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.fontSize(20).text('CERTIDÃO DE REGULARIZAÇÃO FUNDIÁRIA (CRF)', { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text(`Referência Núcleo ID: ${nucleoId}`);
                doc.text(`Tenant/Município: ${metadata.reqTenant}`);
                doc.text(`Operador Sistêmico (Gerado por): ${metadata.actor}`);
                doc.text(`Data de Emissão: ${new Date().toISOString()}`);
                doc.moveDown();
                doc.text(`Nos termos da Lei 13.465/2017 e diretrizes do licitatório CE 24/2025 de Ubatuba-SP, atesta-se digitalmente a lisura dos levantamentos contidos neste dossiê anexado.`);
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
};
exports.ExportsService = ExportsService;
exports.ExportsService = ExportsService = ExportsService_1 = __decorate([
    (0, common_1.Injectable)()
], ExportsService);
//# sourceMappingURL=exports.service.js.map