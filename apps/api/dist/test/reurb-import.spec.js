"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reurb_service_1 = require("../src/modules/reurb/reurb.service");
describe('reurb csv import', () => {
    const makeService = () => {
        const repository = {
            createFamily: jest.fn().mockResolvedValue({ id: 'fam-1' }),
            createAuditLog: jest.fn().mockResolvedValue({}),
        };
        const projectsService = {
            resolveProjectId: jest.fn().mockResolvedValue('64b8f0f4f4f4f4f4f4f4f4f1'),
        };
        const storage = {};
        const validationService = {};
        const service = new reurb_service_1.ReurbService(repository, projectsService, storage, validationService);
        return { service, repository, projectsService };
    };
    it('rejects when required columns are missing', async () => {
        const { service } = makeService();
        await expect(service.importFamiliesCsv('64b8f0f4f4f4f4f4f4f4f4f0', { csvContent: 'code,name\nA1,Maria' }, '64b8f0f4f4f4f4f4f4f4f4f2')).rejects.toThrow('CSV faltando colunas');
    });
    it('creates families and returns summary', async () => {
        const { service, repository } = makeService();
        const result = await service.importFamiliesCsv('64b8f0f4f4f4f4f4f4f4f4f0', {
            csvContent: 'familyCode,nucleus,responsibleName,cpf,address\nFAM-01,N1,Maria,123,Rua A',
        }, '64b8f0f4f4f4f4f4f4f4f4f2');
        expect(repository.createFamily).toHaveBeenCalledTimes(1);
        expect(result.created).toBe(1);
        expect(result.total).toBe(1);
        expect(result.errors.length).toBe(0);
    });
});
//# sourceMappingURL=reurb-import.spec.js.map