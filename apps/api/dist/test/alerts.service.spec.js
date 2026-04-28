"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alerts_service_1 = require("../src/modules/alerts/alerts.service");
const repository = {
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn(),
    findById: jest.fn().mockResolvedValue({
        evidenceKeys: [],
        timeline: [],
    }),
};
const cache = {
    invalidateByPrefix: jest.fn(),
};
describe('AlertsService', () => {
    it('creates alert with stage and evidence', async () => {
        const service = new alerts_service_1.AlertsService(repository, cache);
        await service.create('66f1f77a67e30f9f62000001', {
            title: 'Nova ocupacao',
            level: 'ALTO',
            lat: -23.4,
            lng: -45.1,
            evidenceKeys: ['evidence-1'],
        });
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
            stage: 'TRIAGEM',
            evidenceKeys: ['evidence-1'],
        }));
    });
});
//# sourceMappingURL=alerts.service.spec.js.map