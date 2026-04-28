"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const public_works_service_1 = require("../src/modules/public-works/public-works.service");
describe('PublicWorksService', () => {
    const repository = {
        list: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    };
    const projectsService = { resolveProjectId: jest.fn().mockResolvedValue('64f000000000000000000001') };
    const cacheService = { invalidateByPrefix: jest.fn() };
    const service = new public_works_service_1.PublicWorksService(repository, projectsService, cacheService);
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('creates a public work with history and tenant binding', async () => {
        repository.create.mockResolvedValue({ id: '1', protocolNumber: 'OP-1' });
        const result = await service.create('64f000000000000000000010', {
            title: 'Obra Demo',
            department: 'Obras',
            location: 'Centro',
            contractor: 'Construtora Demo',
        });
        expect(projectsService.resolveProjectId).toHaveBeenCalledWith('64f000000000000000000010');
        expect(repository.create).toHaveBeenCalled();
        expect(cacheService.invalidateByPrefix).toHaveBeenCalledWith('public-works:64f000000000000000000010');
        expect(result).toEqual({ id: '1', protocolNumber: 'OP-1' });
    });
    it('advances stage and marks execution', async () => {
        const current = {
            stage: 'CADASTRO',
            status: 'PLANEJADA',
            history: [],
            measurements: [],
            evidenceKeys: [],
        };
        repository.findById.mockResolvedValue(current);
        repository.save.mockImplementation(async (value) => value);
        const result = await service.advanceStage('tenant', 'work', { stage: 'EXECUCAO', message: 'inicio' }, 'actor');
        expect(result.status).toBe('EM_EXECUCAO');
        expect(result.stage).toBe('EXECUCAO');
        expect(result.history[0].message).toBe('inicio');
    });
    it('throws when work is missing', async () => {
        repository.findById.mockResolvedValue(null);
        await expect(service.addMeasurement('tenant', 'missing', { label: 'x', quantity: 1, unit: 'm' })).rejects.toBeInstanceOf(common_1.NotFoundException);
    });
    it('summarizes works operation state', async () => {
        repository.list.mockResolvedValue([
            { status: 'PLANEJADA', progress: 0, measurements: [], evidenceKeys: [] },
            { status: 'EM_EXECUCAO', progress: 35, measurements: [{}], evidenceKeys: ['a'] },
            { status: 'CONCLUIDA', progress: 100, measurements: [{}, {}], evidenceKeys: ['b', 'c'] },
        ]);
        const summary = await service.summary('tenant');
        expect(summary.total).toBe(3);
        expect(summary.planejadas).toBe(1);
        expect(summary.execucao).toBe(1);
        expect(summary.concluidas).toBe(1);
        expect(summary.medicoes).toBe(3);
        expect(summary.evidencias).toBe(3);
    });
});
//# sourceMappingURL=public-works.service.spec.js.map