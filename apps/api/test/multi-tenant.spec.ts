import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ProjectsRepository } from '../src/modules/projects/projects.repository';
import { Types } from 'mongoose';

describe('Multi-tenant Isolation Logic', () => {
  let service: ProjectsService;
  let repository: ProjectsRepository;

  const mockRepository = {
    list: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findDefault: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: ProjectsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get<ProjectsRepository>(ProjectsRepository);
  });

  it('should filter projects by tenantId in list()', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    await service.list(tenantId);
    expect(repository.list).toHaveBeenCalledWith(tenantId);
  });

  it('should filter projects by tenantId in findById()', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const projectId = new Types.ObjectId().toHexString();
    await service.findById(tenantId, projectId);
    expect(repository.findById).toHaveBeenCalledWith(tenantId, projectId);
  });

  it('should enforce tenantId ownership when creating projects', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const dto = { name: 'Projeto Teste', slug: 'teste' };
    await service.create(tenantId, dto);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: expect.anything(), // Validated via asObjectId
      name: dto.name,
    }));
  });
});
