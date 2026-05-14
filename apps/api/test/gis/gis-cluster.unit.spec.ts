import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GisService } from '../../src/modules/gis/gis.service';
import { Parcel } from '../../src/modules/ctm/parcels/parcel.schema';

const mockParcelModel = (data: any[]) => {
  const exec = jest.fn().mockResolvedValue(data);
  const lean = jest.fn().mockReturnValue({ exec });
  const limit = jest.fn().mockReturnValue({ lean });
  const select = jest.fn().mockReturnValue({ limit });
  const find = jest.fn().mockReturnValue({ select });
  return { find, countDocuments: jest.fn().mockResolvedValue(0) };
};

describe('GisService — queryClusters', () => {
  let service: GisService;
  let model: ReturnType<typeof mockParcelModel>;

  const bbox = [-45.1, -23.5, -44.9, -23.3] as [number, number, number, number];
  const tenantId = '507f1f77bcf86cd799439011';
  const projectId = '507f1f77bcf86cd799439012';

  beforeEach(async () => {
    model = mockParcelModel([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: getModelToken(Parcel.name), useValue: model },
      ],
    }).compile();
    service = module.get<GisService>(GisService);
  });

  it('should return empty collection for no parcels', async () => {
    const result = await service.queryClusters(bbox, 10, tenantId, projectId);
    expect(result.features).toHaveLength(0);
    expect(result.zoom).toBe(10);
    expect(result.bbox).toBe(bbox);
  });

  it('should return single feature for single parcel', async () => {
    const parcels = [
      { _id: '1', sqlu: 'SQ001', centroid: { coordinates: [-45.0, -23.4] }, geometry: null },
    ];
    model = mockParcelModel(parcels);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: getModelToken(Parcel.name), useValue: model },
      ],
    }).compile();
    service = module.get<GisService>(GisService);

    const result = await service.queryClusters(bbox, 15, tenantId, projectId);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.cluster).toBe(false);
    expect(result.features[0].properties.count).toBe(1);
    expect(result.features[0].geometry.coordinates).toEqual([-45.0, -23.4]);
  });

  it('should cluster nearby parcels at low zoom', async () => {
    const parcels = Array.from({ length: 10 }, (_, i) => ({
      _id: String(i),
      sqlu: `SQ${String(i + 1).padStart(3, '0')}`,
      centroid: { coordinates: [-45.0 + i * 0.0001, -23.4 + i * 0.0001] },
      geometry: null,
    }));
    model = mockParcelModel(parcels);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: getModelToken(Parcel.name), useValue: model },
      ],
    }).compile();
    service = module.get<GisService>(GisService);

    const result = await service.queryClusters(bbox, 10, tenantId, projectId);
    expect(result.features.length).toBeLessThan(10);
    expect(result.features.some((f) => f.properties.cluster)).toBe(true);
  });

  it('should not cluster parcels spread far apart', async () => {
    const parcels = [
      { _id: '1', sqlu: 'SQ001', centroid: { coordinates: [-45.0, -23.4] }, geometry: null },
      { _id: '2', sqlu: 'SQ002', centroid: { coordinates: [-44.0, -22.4] }, geometry: null },
    ];
    model = mockParcelModel(parcels);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: getModelToken(Parcel.name), useValue: model },
      ],
    }).compile();
    service = module.get<GisService>(GisService);

    const result = await service.queryClusters(bbox, 10, tenantId, projectId);
    expect(result.features).toHaveLength(2);
    expect(result.features.every((f) => f.properties.cluster === false)).toBe(true);
  });

  it('should include expansion_zoom in cluster properties', async () => {
    const parcels = Array.from({ length: 5 }, (_, i) => ({
      _id: String(i),
      sqlu: `SQ${String(i + 1).padStart(3, '0')}`,
      centroid: { coordinates: [-45.0, -23.4] },
      geometry: null,
    }));
    model = mockParcelModel(parcels);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: getModelToken(Parcel.name), useValue: model },
      ],
    }).compile();
    service = module.get<GisService>(GisService);

    const result = await service.queryClusters(bbox, 10, tenantId, projectId);
    const cluster = result.features.find((f) => f.properties.cluster);
    expect(cluster).toBeDefined();
    expect(cluster!.properties.expansion_zoom).toBeDefined();
    expect(cluster!.properties.expansion_zoom).toBeGreaterThan(10);
  });

  it('should handle parcels with geometry but no centroid', async () => {
    const parcels = [
      {
        _id: '1',
        sqlu: 'SQ001',
        centroid: null,
        geometry: {
          type: 'Polygon',
          coordinates: [[[-45.0, -23.4], [-44.999, -23.4], [-44.999, -23.399], [-45.0, -23.399], [-45.0, -23.4]]],
        },
      },
    ];
    model = mockParcelModel(parcels);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: getModelToken(Parcel.name), useValue: model },
      ],
    }).compile();
    service = module.get<GisService>(GisService);

    const result = await service.queryClusters(bbox, 15, tenantId, projectId);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.sqlu_list).toEqual(['SQ001']);
  });

  it('should respect zoom level for cluster granularity', async () => {
    const parcels = Array.from({ length: 20 }, (_, i) => ({
      _id: String(i),
      sqlu: `SQ${String(i + 1).padStart(3, '0')}`,
      centroid: { coordinates: [-45.0 + i * 0.001, -23.4 + i * 0.001] },
      geometry: null,
    }));
    model = mockParcelModel(parcels);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: getModelToken(Parcel.name), useValue: model },
      ],
    }).compile();
    service = module.get<GisService>(GisService);

    const lowZoom = await service.queryClusters(bbox, 8, tenantId, projectId);
    const highZoom = await service.queryClusters(bbox, 18, tenantId, projectId);

    expect(highZoom.features.length).toBeGreaterThanOrEqual(lowZoom.features.length);
  });
});
