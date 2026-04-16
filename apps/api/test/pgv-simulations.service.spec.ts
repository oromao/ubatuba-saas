import { PgvSimulationsService } from '../src/modules/pgv/simulations/pgv-simulations.service';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ParcelsRepository } from '../src/modules/ctm/parcels/parcels.repository';
import { ParcelBuildingsRepository } from '../src/modules/ctm/parcel-buildings/parcel-buildings.repository';
import { ValuationsService } from '../src/modules/pgv/valuations/valuations.service';
import { ZonesRepository } from '../src/modules/pgv/zones/zones.repository';
import { FacesRepository } from '../src/modules/pgv/faces/faces.repository';
import { PgvScenariosRepository } from '../src/modules/pgv/simulations/pgv-scenarios.repository';

const projectsService = {
  resolveProjectId: jest.fn().mockResolvedValue('507f1f77bcf86cd799439014'),
} as unknown as ProjectsService;

const parcelsRepository = {
  list: jest.fn().mockResolvedValue([
    {
      id: 'parcel-1',
      sqlu: 'SQLU-1',
      enderecoPrincipal: { bairro: 'Centro', logradouro: 'Rua A' },
    },
  ]),
} as unknown as ParcelsRepository;

const parcelBuildingsRepository = {
  findByParcel: jest.fn().mockResolvedValue({
    uso: 'RESIDENCIAL',
    padraoConstrutivo: 'MÉDIO',
  }),
} as unknown as ParcelBuildingsRepository;

const valuationsService = {
  calculate: jest.fn().mockResolvedValue({
    landValue: 100,
    constructionValue: 50,
    totalValue: 150,
  }),
} as unknown as ValuationsService;

const zonesRepository = {
  findById: jest.fn().mockResolvedValue({ code: 'Z1' }),
} as unknown as ZonesRepository;

const facesRepository = {
  findById: jest.fn().mockResolvedValue({ code: 'F1' }),
} as unknown as FacesRepository;

const scenariosRepository = {
  create: jest.fn().mockResolvedValue({}),
  list: jest.fn().mockResolvedValue([]),
} as unknown as PgvScenariosRepository;

describe('PgvSimulationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds a fiscal simulation scenario and persists it', async () => {
    const service = new PgvSimulationsService(
      projectsService,
      parcelsRepository,
      parcelBuildingsRepository,
      valuationsService,
      zonesRepository,
      facesRepository,
      scenariosRepository,
    );

    const result = await service.simulate(
      '507f1f77bcf86cd799439012',
      {
        projectId: '507f1f77bcf86cd799439011',
        name: 'Cenario demo',
        zoneId: 'zone-1',
        faceId: 'face-1',
        q: 'Centro',
        proposedLandMultiplier: 1.1,
        proposedConstructionMultiplier: 1.05,
        persist: true,
      },
      '507f1f77bcf86cd799439013',
    );

    expect(result.summary.parcelsEvaluated).toBe(1);
    expect(result.summary.totalDelta).toBeGreaterThan(0);
    expect(result.highlights.withPositiveImpact).toBe(1);
    expect(scenariosRepository.create).toHaveBeenCalled();
  });
});
