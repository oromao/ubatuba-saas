"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const tax_integration_service_1 = require("../src/modules/tax-integration/tax-integration.service");
describe('tax integration adapters', () => {
    const tenantId = new mongoose_1.Types.ObjectId().toHexString();
    const projectId = new mongoose_1.Types.ObjectId();
    const connectorId = new mongoose_1.Types.ObjectId().toHexString();
    const userId = new mongoose_1.Types.ObjectId().toHexString();
    it('processa CSV_UPLOAD e registra log de sucesso', async () => {
        const repository = {
            findConnectorById: jest.fn().mockResolvedValue({
                id: connectorId,
                mode: 'CSV_UPLOAD',
                config: {},
            }),
            createLog: jest.fn().mockResolvedValue({}),
            updateConnector: jest.fn().mockResolvedValue({}),
            listConnectors: jest.fn(),
            createConnector: jest.fn(),
            updateConnectorConfig: jest.fn(),
            listLogs: jest.fn(),
        };
        const projectsService = {
            resolveProjectId: jest.fn().mockResolvedValue(projectId),
        };
        const service = new tax_integration_service_1.TaxIntegrationService(repository, projectsService);
        const result = await service.runSync(tenantId, undefined, connectorId, {
            csvContent: 'inscricao,valor_venal\nINS-001,120000\nINS-002,98000',
        }, userId);
        expect(result.status).toBe('SUCESSO');
        expect(result.processed).toBe(2);
        expect(repository.createLog).toHaveBeenCalledTimes(1);
        expect(repository.updateConnector).toHaveBeenCalled();
    });
    it('bloqueia SFTP sem fingir sucesso', async () => {
        const repository = {
            findConnectorById: jest.fn().mockResolvedValue({
                id: connectorId,
                mode: 'SFTP',
                config: { host: 'sftp.prefeitura.local' },
            }),
            createLog: jest.fn().mockResolvedValue({}),
            updateConnector: jest.fn().mockResolvedValue({}),
            listConnectors: jest.fn(),
            createConnector: jest.fn(),
            updateConnectorConfig: jest.fn(),
            listLogs: jest.fn(),
        };
        const projectsService = {
            resolveProjectId: jest.fn().mockResolvedValue(projectId),
        };
        const service = new tax_integration_service_1.TaxIntegrationService(repository, projectsService);
        const result = await service.runSync(tenantId, undefined, connectorId, {}, userId);
        expect(result.status).toBe('ERRO');
        expect(result.message).toContain('ainda nao implementado');
        expect(repository.createLog).toHaveBeenCalledTimes(1);
        expect(repository.updateConnector).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=tax-integration-adapter.spec.js.map