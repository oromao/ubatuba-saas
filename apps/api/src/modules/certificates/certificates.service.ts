import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { ProcessesRepository } from '../processes/processes.repository';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificatesRepository } from './certificates.repository';

function buildMinimalPdf(params: { title: string; bodyLines: string[] }) {
  const lines = [params.title, ...params.bodyLines].map((line) =>
    line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
  );
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

@Injectable()
export class CertificatesService {
  constructor(
    private readonly repository: CertificatesRepository,
    private readonly processesRepository: ProcessesRepository,
    private readonly objectStorageService: ObjectStorageService,
    private readonly cacheService: CacheService,
  ) {}

  list(tenantId: string) {
    return this.repository.list(tenantId);
  }

  findById(tenantId: string, id: string) {
    return this.repository.findById(tenantId, id);
  }

  async issue(tenantId: string, dto: CreateCertificateDto, issuedBy?: string) {
    const process = dto.processId ? await this.processesRepository.findById(tenantId, dto.processId) : null;
    if (dto.processId && !process) {
      throw new NotFoundException('Processo nao encontrado');
    }

    const validationCode = randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
    const payload = {
      tenantId,
      processId: dto.processId ?? null,
      type: dto.type,
      subjectName: dto.subjectName,
      subjectDocument: dto.subjectDocument ?? null,
      issuedAt: new Date().toISOString(),
      issuedBy: issuedBy ?? null,
    };
    const hashSha256 = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const pdfBuffer = buildMinimalPdf({
      title: `Certidao ${dto.type}`,
      bodyLines: [
        `Titular: ${dto.subjectName}`,
        `Tipo: ${dto.type}`,
        `Codigo: ${validationCode}`,
        `Hash: ${hashSha256}`,
      ],
    });
    const pdfKey = `certificates/${tenantId}/${validationCode}.pdf`;
    await this.objectStorageService.putObject({
      key: pdfKey,
      content: pdfBuffer,
      contentType: 'application/pdf',
    });
    const created = await this.repository.create({
      tenantId: tenantId as any,
      processId: dto.processId as any,
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
    });
    await this.cacheService.invalidateByPrefix(`certificates:${tenantId}`);
    return {
      ...created.toObject(),
      validationUrl: `/certificates/validate/${validationCode}`,
      downloadUrl: pdfKey,
    };
  }

  async validatePublic(tenantId: string, validationCode: string) {
    const certificate = await this.repository.findByValidationCode(tenantId, validationCode);
    if (!certificate) {
      throw new NotFoundException('Certidao nao encontrada');
    }
    return {
      valid: certificate.status === 'EMITIDA',
      certificate,
    };
  }
}
