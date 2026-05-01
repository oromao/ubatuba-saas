import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { ProcessesRepository } from '../processes/processes.repository';
import { DigitalSignatureService } from '../../common/services/digital-signature.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificatesRepository } from './certificates.repository';

function buildMinimalPdf(params: { title: string; bodyLines: string[]; tenantName?: string }) {
  const header = params.tenantName || 'FlyDea Municipal';
  const safe = [header, params.title, ...params.bodyLines].map((line) =>
    line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
  );

  // Multi-font, multi-size PDF with header, body, and signature block
  const text = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
    `5 0 obj << /Length ${Math.max(1, safe.join('\n').length + 300)} >> stream`,
    // Municipal header
    'BT /F2 18 Tf 50 790 Td',
    `(${header}) Tj`,
    'ET',
    // Divider line
    'BT /F1 10 Tf 50 775 Td',
    '(-----------------------------------------------------------------) Tj',
    'ET',
    // Title
    'BT /F2 14 Tf 50 755 Td',
    `(${params.title}) Tj`,
    'ET',
    // Body lines
    `BT /F1 11 Tf 50 720 Td`,
    safe.slice(2).map((line, index) =>
      index === 0 ? `(${line}) Tj` : `0 -18 Td (${line}) Tj`
    ).join('\n'),
    'ET',
    // Signature block
    'BT /F1 10 Tf 50 380 Td',
    '(__________________________________________) Tj',
    '0 -15 Td (Assinatura Digital - RSA-SHA256) Tj',
    '0 -12 Td (Documento assinado digitalmente conforme MP 2.200-2/2001) Tj',
    'ET',
    'endstream endobj',
    'xref',
    '0 7',
    '0000000000 65535 f ',
    '0000000010 00000 n ',
    '0000000063 00000 n ',
    '0000000120 00000 n ',
    '0000000240 00000 n ',
    '0000000380 00000 n ',
    '0000000450 00000 n ',
    'trailer << /Size 7 /Root 1 0 R >>',
    'startxref',
    '520',
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
    private readonly signatureService: DigitalSignatureService,
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
    const validationUrl = `/certificates/validate/${validationCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(validationUrl)}`;

    // Digital signature (RSA-SHA256)
    const signed = this.signatureService.signPayload(payload);
    const publicKeyHash = createHash('sha256').update(signed.publicKeyPem).digest('hex').slice(0, 16);

    const pdfBuffer = buildMinimalPdf({
      title: `Certidao ${dto.type}`,
      tenantName: 'Prefeitura Municipal',
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
      signature: signed.signature,
      signatureAlgorithm: signed.algorithm,
      signedAt: signed.signedAt,
      publicKeyHash,
      qrCodeUrl,
    } as any);
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

    const isValid = certificate.status === 'EMITIDA';

    // Verify digital signature if present
    let signatureValid = false;
    if (certificate.signature && certificate.payloadJson) {
      try {
        const payload = JSON.parse(certificate.payloadJson);
        signatureValid = this.signatureService.verifySignature({
          payload,
          signature: certificate.signature,
          algorithm: certificate.signatureAlgorithm || 'RSA-SHA256',
          signedAt: certificate.signedAt || '',
          publicKeyPem: '', // verified against internal key pair
        });
      } catch {
        signatureValid = false;
      }
    }

    return {
      valid: isValid,
      signatureValid,
      certificate,
    };
  }
}
