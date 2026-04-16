import { CemeteryService } from '../src/modules/cemetery/cemetery.service';

describe('CemeteryService', () => {
  const repository: any = {
    list: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const cacheService: any = { invalidateByPrefix: jest.fn() };
  const service = new CemeteryService(repository, cacheService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a cemetery plot with history', async () => {
    repository.create.mockResolvedValue({ id: '1', cemeteryName: 'Cemitério Municipal' });
    const result = await service.create('64f000000000000000000010', {
      cemeteryName: 'Cemitério Municipal',
      block: 'A',
      row: '01',
      plot: '015',
      ownerName: 'Familia Demo',
    });
    expect(repository.create).toHaveBeenCalled();
    expect(cacheService.invalidateByPrefix).toHaveBeenCalledWith('cemetery:64f000000000000000000010');
    expect(result).toEqual({ id: '1', cemeteryName: 'Cemitério Municipal' });
  });

  it('adds document keys to plot', async () => {
    const current: any = { documentKeys: [], history: [], status: 'LIVRE' };
    repository.findById.mockResolvedValue(current);
    repository.save.mockImplementation(async (value: any) => value);
    const result = await service.addDocumentKeys('tenant', 'plot', ['a', 'b'], 'actor');
    expect(result.documentKeys).toEqual(['a', 'b']);
    expect(result.history[0].message).toContain('Documentos vinculados');
  });

  it('summarizes cemetery occupancy and documents', async () => {
    repository.list.mockResolvedValue([
      { status: 'LIVRE', documentKeys: [] },
      { status: 'RESERVADO', documentKeys: ['a'] },
      { status: 'OCUPADO', documentKeys: ['b', 'c'] },
    ]);
    const summary = await service.summary('tenant');
    expect(summary.total).toBe(3);
    expect(summary.livres).toBe(1);
    expect(summary.reservados).toBe(1);
    expect(summary.ocupados).toBe(1);
    expect(summary.documentos).toBe(3);
  });
});
