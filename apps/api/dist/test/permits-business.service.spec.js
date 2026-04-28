"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const permits_business_service_1 = require("../src/modules/permits-business/permits-business.service");
const repository = {
    create: jest.fn().mockResolvedValue({
        protocolNumber: 'EM-1',
        save: jest.fn(),
    }),
    findById: jest.fn(),
    save: jest.fn().mockResolvedValue({}),
    list: jest.fn(),
};
const projectsService = {
    resolveProjectId: jest.fn().mockResolvedValue('proj-1'),
};
const storage = {
    putObject: jest.fn().mockResolvedValue({}),
};
const cache = {
    invalidateByPrefix: jest.fn(),
};
describe('PermitsBusinessService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('creates business permit request with workflow metadata', async () => {
        const service = new permits_business_service_1.PermitsBusinessService(repository, projectsService, storage, cache);
        const created = await service.create('tenant-1', {
            companyName: 'Empresa Demo',
            cnpj: '123',
            activityDescription: 'Servicos',
        });
        expect(created.protocolNumber).toContain('EM-');
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ currentStage: 'ABERTURA' }));
    });
    it('rejects invalid workflow transition', async () => {
        repository.findById.mockResolvedValue({
            currentStage: 'ABERTURA',
            status: 'ABERTO',
            taxes: [],
            evidences: [],
            history: [],
            save: jest.fn(),
        });
        const service = new permits_business_service_1.PermitsBusinessService(repository, projectsService, storage, cache);
        await expect(service.update('tenant-1', 'req-1', { stage: 'EMISSAO' })).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    it('supports decision workflow', async () => {
        const doc = {
            currentStage: 'ANALISE_TECNICA',
            status: 'EM_ANALISE',
            taxes: [],
            evidences: [],
            history: [],
            save: jest.fn(),
        };
        repository.findById.mockResolvedValue(doc);
        const service = new permits_business_service_1.PermitsBusinessService(repository, projectsService, storage, cache);
        await service.addEvidence('tenant-1', 'req-1', 'Doc', 'ok');
        await service.decide('tenant-1', 'req-1', 'DEFERIDO', 'OK');
        expect(doc.decision?.kind).toBe('DEFERIDO');
        expect(doc.currentStage).toBe('ENCERRAMENTO');
    });
});
//# sourceMappingURL=permits-business.service.spec.js.map