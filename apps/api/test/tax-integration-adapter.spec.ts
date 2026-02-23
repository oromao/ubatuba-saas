import { Types } from 'mongoose';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { TaxIntegrationRepository } from '../src/modules/tax-integration/tax-integration.repository';
import { TaxIntegrationService } from '../src/modules/tax-integration/tax-integration.service';

describe('tax integration adapters', () => {
  const tenantId = new Types.ObjectId().toHexString();
  const projectId = new Types.ObjectId();
  const connectorId = new Types.ObjectId().toHexString();
  const userId = new Types.ObjectId().toHexString();

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

    const service = new TaxIntegrationService(
      repository as unknown as TaxIntegrationRepository,
      projectsService as unknown as ProjectsService,
    );

    const result = await service.runSync(
      tenantId,
      undefined,
      connectorId,
      {
        csvContent: 'inscricao,valor_venal\nINS-001,120000\nINS-002,98000',
      },
      userId,
    );

    expect(result.status).toBe('SUCESSO');
    expect(result.processed).toBe(2);
    expect(repository.createLog).toHaveBeenCalledTimes(1);
    expect(repository.updateConnector).toHaveBeenCalled();
  });
});
