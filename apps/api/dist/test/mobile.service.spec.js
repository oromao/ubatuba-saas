"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobile_service_1 = require("../src/modules/mobile/mobile.service");
const repository = {
    create: jest.fn().mockResolvedValue({}),
    list: jest.fn(),
    summary: jest.fn().mockResolvedValue({
        total: 0,
        processado: 0,
        conflito: 0,
        recebido: 0,
        comEvidencias: 0,
        evidenciasTotal: 0,
        erros: 0,
    }),
};
const projectsService = {
    resolveProjectId: jest.fn().mockResolvedValue('proj-1'),
};
const parcelsRepository = {
    findById: jest.fn().mockResolvedValue({ updatedAt: new Date().toISOString() }),
};
describe('MobileService', () => {
    it('syncs mobile field records', async () => {
        const service = new mobile_service_1.MobileService(repository, projectsService, parcelsRepository);
        const result = await service.sync('66f1f77a67e30f9f62000001', {
            projectId: 'proj-1',
            items: [
                {
                    clientId: 'client-1',
                    parcelId: '66f1f77a67e30f9f62000002',
                    parcelUpdatedAt: new Date().toISOString(),
                    checklist: { occupancyChecked: true, addressChecked: true },
                    location: { lat: -23.4, lng: -45.1 },
                    evidences: [
                        {
                            clientId: 'evidence-1',
                            fileName: 'foto-1.jpg',
                            mimeType: 'image/jpeg',
                            base64: 'data:image/jpeg;base64,abc',
                        },
                    ],
                },
            ],
        });
        expect(result.processed).toBe(1);
        expect(result.evidenceSummary.processed).toBe(1);
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
            clientId: 'client-1',
            syncTimeline: [expect.objectContaining({ status: 'PROCESSADO' })],
            evidences: [
                expect.objectContaining({
                    clientId: 'evidence-1',
                    fileName: 'foto-1.jpg',
                    status: 'SINCRONIZADO',
                    checksum: expect.any(String),
                }),
            ],
        }));
    });
    it('returns partial failures without dropping successful evidences', async () => {
        const failingRepository = {
            create: jest
                .fn()
                .mockResolvedValueOnce({})
                .mockRejectedValueOnce(new Error('boom')),
            list: jest.fn(),
            summary: jest.fn().mockResolvedValue({
                total: 0,
                processado: 0,
                conflito: 0,
                recebido: 0,
                comEvidencias: 0,
                evidenciasTotal: 0,
                erros: 0,
            }),
        };
        const service = new mobile_service_1.MobileService(failingRepository, projectsService, parcelsRepository);
        const result = await service.sync('66f1f77a67e30f9f62000001', {
            items: [
                {
                    clientId: 'client-ok',
                    parcelId: '66f1f77a67e30f9f62000002',
                    parcelUpdatedAt: new Date().toISOString(),
                    evidences: [
                        { clientId: 'evidence-ok', base64: 'data:text/plain;base64,abc' },
                    ],
                },
                {
                    clientId: 'client-fail',
                    parcelId: '66f1f77a67e30f9f62000003',
                    parcelUpdatedAt: new Date().toISOString(),
                    evidences: [
                        { clientId: 'evidence-fail', base64: 'data:text/plain;base64,def' },
                    ],
                },
            ],
        });
        expect(result.processed).toBe(1);
        expect(result.failed).toHaveLength(1);
        expect(result.failed[0].clientId).toBe('client-fail');
        expect(result.evidenceSummary.processed).toBe(1);
        expect(result.evidenceSummary.failed).toBe(1);
    });
    it('returns conflict when parcel changed after offline capture', async () => {
        const conflictRepo = {
            create: jest.fn().mockResolvedValue({}),
            list: jest.fn(),
            summary: jest.fn().mockResolvedValue({
                total: 0,
                processado: 0,
                conflito: 0,
                recebido: 0,
                comEvidencias: 0,
                evidenciasTotal: 0,
                erros: 0,
            }),
        };
        const newerParcelRepo = {
            findById: jest.fn().mockResolvedValue({ updatedAt: new Date(Date.now() + 60_000).toISOString() }),
        };
        const service = new mobile_service_1.MobileService(conflictRepo, projectsService, newerParcelRepo);
        const capturedAt = new Date().toISOString();
        const result = await service.sync('66f1f77a67e30f9f62000001', {
            items: [
                {
                    clientId: 'client-conflict',
                    parcelId: '66f1f77a67e30f9f62000002',
                    parcelUpdatedAt: capturedAt,
                },
            ],
        });
        expect(result.processed).toBe(0);
        expect(result.failed).toHaveLength(1);
        expect(result.failed[0].error).toBe('CONFLITO_DE_VERSAO_CADASTRAL');
        expect(result.failed[0].details?.serverParcelUpdatedAt).toBeDefined();
        expect(result.evidenceSummary.failed).toBe(0);
    });
    it('summarizes sync status', async () => {
        const summaryRepo = {
            create: jest.fn(),
            list: jest.fn().mockResolvedValue([
                { syncStatus: 'PROCESSADO', evidences: [{}] },
                { syncStatus: 'CONFLITO', evidences: [{}, {}] },
                { syncStatus: 'RECEBIDO', evidences: [] },
            ]),
            summary: jest.fn().mockResolvedValue({
                total: 3,
                processado: 1,
                conflito: 1,
                recebido: 1,
                comEvidencias: 2,
                evidenciasTotal: 3,
                erros: 2,
            }),
        };
        const service = new mobile_service_1.MobileService(summaryRepo, projectsService, parcelsRepository);
        const summary = await service.summary('66f1f77a67e30f9f62000001', 'proj-1');
        expect(summary.total).toBe(3);
        expect(summary.processado).toBe(1);
        expect(summary.conflito).toBe(1);
        expect(summary.evidenciasTotal).toBe(3);
    });
});
//# sourceMappingURL=mobile.service.spec.js.map