import { CertificatesService } from '../src/modules/certificates/certificates.service';
import { CertificatesRepository } from '../src/modules/certificates/certificates.repository';
import { ProcessesRepository } from '../src/modules/processes/processes.repository';
import { CacheService } from '../src/modules/shared/cache.service';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';
import { DigitalSignatureService } from '../src/common/services/digital-signature.service';

const repository = {
  create: jest.fn().mockResolvedValue({
    toObject: () => ({
      _id: 'cert-1',
      validationCode: 'ABC123',
      pdfKey: 'certificates/tenant/ABC123.pdf',
    }),
  }),
  list: jest.fn(),
  findById: jest.fn(),
  findByValidationCode: jest.fn().mockResolvedValue({
    status: 'EMITIDA',
    validationCode: 'ABC123',
  }),
} as unknown as CertificatesRepository;

const processesRepository = {
  findById: jest.fn().mockResolvedValue({ id: 'proc-1' }),
} as unknown as ProcessesRepository;

const objectStorageService = {
  putObject: jest.fn().mockResolvedValue({}),
} as unknown as ObjectStorageService;

const cacheService = {
  invalidateByPrefix: jest.fn(),
} as unknown as CacheService;

const signatureService = {
  signPayload: jest.fn().mockImplementation((payload) => ({
    payload,
    signature: 'mock-signature',
    algorithm: 'RSA-SHA256',
    signedAt: new Date().toISOString(),
    publicKeyPem: 'mock-public-key',
  })),
  hashPayload: jest.fn().mockReturnValue('mock-hash-sha256'),
} as unknown as DigitalSignatureService;

describe('CertificatesService', () => {
  it('issues certificate with hash and validation code', async () => {
    const service = new CertificatesService(
      repository,
      processesRepository,
      objectStorageService,
      cacheService,
      signatureService,
    );

    const result = await service.issue('66f1f77a67e30f9f62000004', {
      type: 'Uso e Ocupacao',
      subjectName: 'Imovel Demo',
      subjectDocument: '123',
      processId: 'proc-1',
    });

    expect(objectStorageService.putObject).toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: expect.anything(),
        validationCode: expect.any(String),
        hashSha256: expect.any(String),
        pdfKey: expect.stringContaining('certificates/'),
      }),
    );
    expect(result.validationUrl).toContain('/certificates/validate/');
  });

  it('validates public certificate lookup', async () => {
    const service = new CertificatesService(
      repository,
      processesRepository,
      objectStorageService,
      cacheService,
      signatureService,
    );
    const result = await service.validatePublic('66f1f77a67e30f9f62000004', 'ABC123');
    expect(result.valid).toBe(true);
  });
});
