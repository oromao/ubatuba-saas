"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const permits_works_service_1 = require("../src/modules/permits-works/permits-works.service");
const repository = {
    create: jest.fn().mockResolvedValue({
        protocolNumber: 'OB-1',
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
describe('PermitsWorksService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('creates work permit request with workflow metadata', async () => {
        const service = new permits_works_service_1.PermitsWorksService(repository, projectsService, storage, cache);
        const created = await service.create('tenant-1', {
            applicantName: 'Construtora Demo',
            subjectAddress: 'Rua A, 10',
            requirements: ['Projeto', 'ART'],
        });
        expect(created.protocolNumber).toContain('OB-');
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ currentStage: 'ABERTURA' }));
    });
    it('rejects invalid workflow transition', async () => {
        repository.findById.mockResolvedValue({
            currentStage: 'ABERTURA',
            status: 'ABERTO',
            requirements: [],
            evidences: [],
            history: [],
            invoices: [],
            save: jest.fn(),
        });
        const service = new permits_works_service_1.PermitsWorksService(repository, projectsService, storage, cache);
        await expect(service.update('tenant-1', 'req-1', { stage: 'ASSINATURA' })).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    it('supports decision and evidence workflow', async () => {
        const doc = {
            currentStage: 'ANALISE_TECNICA',
            status: 'EM_ANALISE',
            requirements: [{ id: 'req-1', title: 'ART', status: 'ABERTA', createdAt: new Date().toISOString() }],
            evidences: [],
            history: [],
            invoices: [],
            save: jest.fn(),
        };
        repository.findById.mockResolvedValue(doc);
        const service = new permits_works_service_1.PermitsWorksService(repository, projectsService, storage, cache);
        await service.addRequirementResponse('tenant-1', 'req-1', 'req-1', 'Atendido');
        await service.decide('tenant-1', 'req-1', 'DEFERIDO', 'OK');
        expect(doc.decision?.kind).toBe('DEFERIDO');
        expect(doc.currentStage).toBe('EMISSAO');
    });
});
//# sourceMappingURL=permits-works.service.spec.js.map