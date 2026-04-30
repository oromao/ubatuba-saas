import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from '../src/modules/tenants/tenants.service';
import { TenantsRepository } from '../src/modules/tenants/tenants.repository';

const TID = '507f1f77bcf86cd799439011';

function makeTenant(overrides: Record<string, any> = {}) {
  return {
    _id: TID,
    name: 'Ubatuba',
    slug: 'ubatuba',
    municipalConfig: {},
    ...overrides,
    save: jest.fn().mockResolvedValue({}),
  };
}

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  save: jest.fn().mockImplementation((doc) => Promise.resolve(doc)),
  updateConfig: jest.fn(),
};

describe('TenantsService - Municipal Config (T8-MUNICIPAL-CFG)', () => {
  let service: TenantsService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: TenantsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = moduleRef.get<TenantsService>(TenantsService);
  });

  afterAll(async () => {
    if (typeof (moduleRef as any).close === 'function') {
      await (moduleRef as any).close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMunicipalConfig', () => {
    it('should return empty object when no config exists', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant());
      const result = await service.getMunicipalConfig(TID);
      expect(result).toEqual({});
    });

    it('should return existing config', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant({
        municipalConfig: { ibgeCode: '3555406', uf: 'SP', cnpjMunicipio: '46239090000183' },
      }));
      const result = await service.getMunicipalConfig(TID);
      expect((result as any).ibgeCode).toBe('3555406');
      expect((result as any).uf).toBe('SP');
    });

    it('should throw for non-existent tenant', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getMunicipalConfig('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMunicipalConfig', () => {
    it('should set municipal config fields', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant());
      const result = await service.updateMunicipalConfig(TID, {
        brasao: 'https://storage/brasao.png',
        ibgeCode: '3555406',
        uf: 'SP',
        cnpjMunicipio: '46239090000183',
      });
      expect(result).toBeDefined();
      expect((result as any).brasao).toBe('https://storage/brasao.png');
      expect((result as any).ibgeCode).toBe('3555406');
      expect((result as any).uf).toBe('SP');
    });

    it('should merge with existing config', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant({
        municipalConfig: { ibgeCode: '3555406', uf: 'SP' },
      }));
      const result = await service.updateMunicipalConfig(TID, { cnpjMunicipio: '46239090000183' });
      expect((result as any).ibgeCode).toBe('3555406');
      expect((result as any).cnpjMunicipio).toBe('46239090000183');
    });

    it('should set aliquotasPadrao', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant());
      const result = await service.updateMunicipalConfig(TID, {
        aliquotasPadrao: { iptuResidencial: 0.005, iptuComercial: 0.01, iptuIndustrial: 0.015 },
      });
      expect((result as any).aliquotasPadrao?.iptuResidencial).toBe(0.005);
      expect((result as any).aliquotasPadrao?.iptuComercial).toBe(0.01);
    });

    it('should add leis municipais', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant());
      const result = await service.updateMunicipalConfig(TID, {
        leis: [
          { numero: '1234', ano: 2024, titulo: 'Lei do IPTU 2024', tipo: 'LEI_MUNICIPAL' },
          { numero: '5678', ano: 2023, titulo: 'Plano Diretor', tipo: 'LEI_MUNICIPAL' },
        ],
      });
      expect((result as any).leis).toHaveLength(2);
      expect((result as any).leis[0].titulo).toBe('Lei do IPTU 2024');
    });

    it('should set address and contact info', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant());
      const result = await service.updateMunicipalConfig(TID, {
        endereco: { logradouro: 'Rua Dr. Esteves da Silva', numero: '75', bairro: 'Centro', cep: '11680-000', telefone: '(12) 3832-6000', email: 'prefeitura@ubatuba.sp.gov.br' },
      });
      expect((result as any).endereco?.logradouro).toBe('Rua Dr. Esteves da Silva');
      expect((result as any).endereco?.cep).toBe('11680-000');
    });

    it('should set module toggles', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant());
      const result = await service.updateMunicipalConfig(TID, {
        modulosHabilitados: { ctm: true, pgv: true, reurb: false, alvaraObras: true },
      });
      expect((result as any).modulosHabilitados?.ctm).toBe(true);
      expect((result as any).modulosHabilitados?.reurb).toBe(false);
    });
  });

  describe('getAliquotasPadrao', () => {
    it('should return empty when no config', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant());
      const result = await service.getAliquotasPadrao(TID);
      expect(result).toEqual({});
    });

    it('should return aliquotas when configured', async () => {
      mockRepo.findById.mockResolvedValue(makeTenant({
        municipalConfig: { aliquotasPadrao: { iptuResidencial: 0.01 } },
      }));
      const result = await service.getAliquotasPadrao(TID);
      expect((result as any).iptuResidencial).toBe(0.01);
    });
  });
});
