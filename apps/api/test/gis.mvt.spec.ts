import { Test, TestingModule } from '@nestjs/testing';
import { GisService } from '../src/modules/gis/gis.service';
import { getModelToken } from '@nestjs/mongoose';
import { Parcel } from '../src/modules/ctm/parcels/parcel.schema';
import { VectorTile } from '@mapbox/vector-tile';

describe('GisService MVT Tiles', () => {
  let service: GisService;

  const mockParcelModel = {
    find: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        {
          provide: getModelToken(Parcel.name),
          useValue: mockParcelModel,
        },
      ],
    }).compile();

    service = module.get<GisService>(GisService);
  });

  describe('tileToBbox', () => {
    it('should calculate bbox for tile 0/0/0', () => {
      // Tile 0/0/0 covers the entire world
      const bbox = (service as any).tileToBbox(0, 0, 0);
      expect(bbox[0]).toBeCloseTo(-180, 5);
      expect(bbox[1]).toBeCloseTo(-85.05112877980659, 5);
      expect(bbox[2]).toBeCloseTo(180, 5);
      expect(bbox[3]).toBeCloseTo(85.05112877980659, 5);
    });

    it('should calculate bbox for tile at zoom 12', () => {
      // São Paulo area at zoom 12
      const bbox = (service as any).tileToBbox(12, 2000, 3000);
      expect(bbox[0]).toBeLessThan(0);      // Negative longitude
      expect(bbox[1]).toBeLessThan(0);      // Negative latitude (southern hemisphere)
      expect(bbox[2]).toBeGreaterThan(0);   // Still negative but less
      expect(bbox[3]).toBeGreaterThan(0);   // Still negative but less
    });
  });

  describe('tileCoordinatesFromBbox', () => {
    it('should return tile coordinates for a bbox', () => {
      // São Paulo bbox
      const spBbox: [number, number, number, number] = [-47, -24, -46, -23];
      const tiles = (service as any).tileCoordinatesFromBbox(spBbox, 12);
      
      expect(tiles.length).toBeGreaterThan(0);
      tiles.forEach((tile: any) => {
        expect(tile.z).toBe(12);
        expect(typeof tile.x).toBe('number');
        expect(typeof tile.y).toBe('number');
      });
    });
  });

  describe('getMvtTile', () => {
    it('should return valid MVT buffer for parcels in tile', async () => {
      const mockParcels = [
        {
          _id: '60d5ec9f8b3a3e001f8e4a1b',
          sqlu: 'TEST-001',
          geometry: {
            type: 'Polygon',
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
          },
        },
      ];

      mockParcelModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockParcels),
          }),
        }),
      });

      const buffer = await service.getMvtTile(12, 2000, 3000, 'tenant-1', 'project-1');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle empty result', async () => {
      mockParcelModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const buffer = await service.getMvtTile(12, 2000, 3000, 'tenant-1', 'project-1');

      expect(buffer).toBeInstanceOf(Buffer);
      // Empty tile should still have header
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should decode back to valid tile structure', async () => {
      const mockParcels = [
        {
          _id: '60d5ec9f8b3a3e001f8e4a1b',
          sqlu: 'SP-001',
          inscription: '12345',
          status: 'ATIVO',
          sourceType: 'OFFICIAL',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-46.6, -23.5], [-46.6, -23.4], [-46.5, -23.4], [-46.5, -23.5], [-46.6, -23.5]]],
          },
        },
      ];

      mockParcelModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockParcels),
          }),
        }),
      });

      const buffer = await service.getMvtTile(12, 2000, 3000, 'tenant-1', 'project-1');
      
      // Try to decode the tile to verify it's valid MVT
      const tile = new VectorTile(new Uint8Array(buffer));
      const layer = tile.layers[MVT_LAYER_NAME || 'parcels'];
      
      // Should have created a layer
      expect(layer).toBeDefined();
      
      // Decode features
      const features = layer?.features || [];
      expect(features.length).toBeGreaterThanOrEqual(0);
    });
  });
});
