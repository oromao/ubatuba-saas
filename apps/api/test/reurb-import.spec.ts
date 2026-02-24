import { ObjectStorageService } from '../src/modules/shared/object-storage.service';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ReurbRepository } from '../src/modules/reurb/reurb.repository';
import { ReurbService } from '../src/modules/reurb/reurb.service';
import { ReurbValidationService } from '../src/modules/reurb/reurb-validation.service';

describe('reurb csv import', () => {
  const makeService = () => {
    const repository: Pick<ReurbRepository, 'createFamily' | 'createAuditLog'> = {
      createFamily: jest.fn().mockResolvedValue({ id: 'fam-1' }),
      createAuditLog: jest.fn().mockResolvedValue({}),
    };
    const projectsService: Pick<ProjectsService, 'resolveProjectId'> = {
      resolveProjectId: jest.fn().mockResolvedValue('64b8f0f4f4f4f4f4f4f4f4f1'),
    };
    const storage: Partial<ObjectStorageService> = {};
    const validationService: Partial<ReurbValidationService> = {};
    const service = new ReurbService(
      repository as ReurbRepository,
      projectsService as ProjectsService,
      storage as ObjectStorageService,
      validationService as ReurbValidationService,
    );
    return { service, repository, projectsService };
  };

  it('rejects when required columns are missing', async () => {
    const { service } = makeService();
    await expect(
      service.importFamiliesCsv(
        '64b8f0f4f4f4f4f4f4f4f4f0',
        { csvContent: 'code,name\nA1,Maria' },
        '64b8f0f4f4f4f4f4f4f4f4f2',
      ),
    ).rejects.toThrow('CSV faltando colunas');
  });

  it('creates families and returns summary', async () => {
    const { service, repository } = makeService();
    const result = await service.importFamiliesCsv(
      '64b8f0f4f4f4f4f4f4f4f4f0',
      {
        csvContent: 'familyCode,nucleus,responsibleName,cpf,address\nFAM-01,N1,Maria,123,Rua A',
      },
      '64b8f0f4f4f4f4f4f4f4f4f2',
    );

    expect(repository.createFamily).toHaveBeenCalledTimes(1);
    expect(result.created).toBe(1);
    expect(result.total).toBe(1);
    expect(result.errors.length).toBe(0);
  });
});
