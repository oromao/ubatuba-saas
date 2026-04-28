"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const certificates_service_1 = require("../src/modules/certificates/certificates.service");
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
};
const processesRepository = {
    findById: jest.fn().mockResolvedValue({ id: 'proc-1' }),
};
const objectStorageService = {
    putObject: jest.fn().mockResolvedValue({}),
};
const cacheService = {
    invalidateByPrefix: jest.fn(),
};
describe('CertificatesService', () => {
    it('issues certificate with hash and validation code', async () => {
        const service = new certificates_service_1.CertificatesService(repository, processesRepository, objectStorageService, cacheService);
        const result = await service.issue('66f1f77a67e30f9f62000004', {
            type: 'Uso e Ocupacao',
            subjectName: 'Imovel Demo',
            subjectDocument: '123',
            processId: 'proc-1',
        });
        expect(objectStorageService.putObject).toHaveBeenCalled();
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
            tenantId: expect.anything(),
            validationCode: expect.any(String),
            hashSha256: expect.any(String),
            pdfKey: expect.stringContaining('certificates/'),
        }));
        expect(result.validationUrl).toContain('/certificates/validate/');
    });
    it('validates public certificate lookup', async () => {
        const service = new certificates_service_1.CertificatesService(repository, processesRepository, objectStorageService, cacheService);
        const result = await service.validatePublic('66f1f77a67e30f9f62000004', 'ABC123');
        expect(result.valid).toBe(true);
    });
});
//# sourceMappingURL=certificates.service.spec.js.map