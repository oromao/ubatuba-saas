"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const processes_service_1 = require("../src/modules/processes/processes.service");
const repository = {
    create: jest.fn().mockResolvedValue({ id: 'proc-1' }),
    addEvent: jest.fn(),
    update: jest.fn(),
};
const cache = {
    invalidateByPrefix: jest.fn(),
};
describe('ProcessesService', () => {
    it('creates process with tenantId', async () => {
        const service = new processes_service_1.ProcessesService(repository, cache);
        const tenantId = '66f1f77a67e30f9f62000004';
        await service.create(tenantId, { title: 'Teste', owner: 'Secretaria' });
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: expect.anything() }));
    });
});
//# sourceMappingURL=processes.service.spec.js.map