import { ProjectsService } from '../src/modules/projects/projects.service';
import { ProjectsRepository } from '../src/modules/projects/projects.repository';
import { Types } from 'mongoose';

const mockRepository = {
  list: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findDefault: jest.fn(),
  create: jest.fn().mockImplementation((data) => Promise.resolve({ id: new Types.ObjectId().toString(), ...data })),
  update: jest.fn().mockImplementation((tenantId, id, data) => Promise.resolve({ id, ...data })),
} as unknown as ProjectsRepository;

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectsService(mockRepository);
  });

  it('should list projects', async () => {
    const tenantId = new Types.ObjectId().toString();
    await service.list(tenantId);
    expect(mockRepository.list).toHaveBeenCalledWith(tenantId);
  });

  it('should find project by id', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    await service.findById(tenantId, projectId);
    expect(mockRepository.findById).toHaveBeenCalledWith(tenantId, projectId);
  });

  it('should resolve given project ID', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();

    const resolved = await service.resolveProjectId(tenantId, projectId);

    expect(resolved.toString()).toBe(projectId);
    expect(mockRepository.findDefault).not.toHaveBeenCalled();
  });

  it('should resolve default project if no project ID is provided and one exists', async () => {
    const tenantId = new Types.ObjectId().toString();
    const defaultProjectId = new Types.ObjectId().toString();
    mockRepository.findDefault = jest.fn().mockResolvedValue({ id: defaultProjectId });

    const resolved = await service.resolveProjectId(tenantId);

    expect(resolved.toString()).toBe(defaultProjectId);
    expect(mockRepository.findDefault).toHaveBeenCalledWith(tenantId);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should create a demo project if no project ID is provided and no default exists', async () => {
    const tenantId = new Types.ObjectId().toString();
    mockRepository.findDefault = jest.fn().mockResolvedValue(null);

    const resolved = await service.resolveProjectId(tenantId);

    expect(resolved).toBeDefined();
    expect(mockRepository.findDefault).toHaveBeenCalledWith(tenantId);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: expect.any(Object),
        name: 'Projeto Demo',
        slug: 'demo',
        isDefault: true,
      }),
    );
  });

  it('should create a project', async () => {
    const tenantId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();
    const dto = {
      name: 'Novo Projeto',
      slug: 'novo',
      description: 'Desc',
      defaultCenter: [1, 2] as [number, number],
      defaultBbox: [1, 2, 3, 4] as [number, number, number, number],
      defaultZoom: 10,
    };

    await service.create(tenantId, dto, userId);

    expect(mockRepository.create).toHaveBeenCalledWith({
      tenantId: expect.any(Object),
      name: 'Novo Projeto',
      slug: 'novo',
      description: 'Desc',
      defaultCenter: [1, 2],
      defaultBbox: [1, 2, 3, 4],
      defaultZoom: 10,
      createdBy: expect.any(Object),
    });
  });

  it('should update project details', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      name: 'Projeto Atualizado',
      description: 'Nova Desc',
      defaultCenter: [2, 3] as [number, number],
      defaultBbox: [2, 3, 4, 5] as [number, number, number, number],
      defaultZoom: 12,
    };

    await service.update(tenantId, projectId, dto);

    expect(mockRepository.update).toHaveBeenCalledWith(tenantId, projectId, {
      name: 'Projeto Atualizado',
      description: 'Nova Desc',
      defaultCenter: [2, 3],
      defaultBbox: [2, 3, 4, 5],
      defaultZoom: 12,
    });
  });
});
