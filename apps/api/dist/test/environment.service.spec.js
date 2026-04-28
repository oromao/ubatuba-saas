"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_service_1 = require("../src/modules/environment/environment.service");
const repository = {
    create: jest.fn().mockResolvedValue({ protocolNumber: 'AM-20260401-ABC123' }),
    findById: jest.fn().mockResolvedValue({
        save: jest.fn(),
        history: [],
        tasks: [],
        status: 'ABERTO',
    }),
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
describe('EnvironmentService', () => {
    it('creates environmental case', async () => {
        const service = new environment_service_1.EnvironmentService(repository, projectsService, storage, cache);
        const created = await service.create('66f1f77a67e30f9f62000001', {
            title: 'Poda preventiva',
            category: 'PODA',
            tasks: ['Vistoria'],
        });
        expect(created.protocolNumber).toContain('AM-');
    });
    it('summarizes environmental backoffice state', async () => {
        const summaryRepo = {
            ...repository,
            list: jest.fn().mockResolvedValue([
                { status: 'ABERTO', tasks: [{}], evidenceKeys: ['a'] },
                { status: 'EM_ANALISE', tasks: [{}, {}], evidenceKeys: [] },
                { status: 'LAUDO', tasks: [], evidenceKeys: ['b'] },
            ]),
        };
        const service = new environment_service_1.EnvironmentService(summaryRepo, projectsService, storage, cache);
        const summary = await service.summary('66f1f77a67e30f9f62000001');
        expect(summary.total).toBe(3);
        expect(summary.abertos).toBe(1);
        expect(summary.analise).toBe(1);
        expect(summary.laudos).toBe(1);
        expect(summary.tarefas).toBe(3);
        expect(summary.evidencias).toBe(2);
    });
});
//# sourceMappingURL=environment.service.spec.js.map