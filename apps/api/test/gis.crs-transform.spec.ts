import { Test, TestingModule } from '@nestjs/testing';
import { GisService, Coordinate, CoordinateTransformResult } from '../src/modules/gis/gis.service';

describe('GisService CRS Transform', () => {
  let service: GisService;

  beforeEach(async () => {
    // Mock the model injection
    const mockModel = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        { provide: 'ParcelModelToken', useValue: mockModel },
      ],
    }).compile();

    service = module.get<GisService>(GisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformCoordinate', () => {
    it('should transform WGS84 to UTM 23S', () => {
      // São Paulo coordinates (WGS84)
      const wgs84Coord: Coordinate = { x: -46.6333, y: -23.5505 };
      
      const result: CoordinateTransformResult = service.transformCoordinate(
        wgs84Coord,
        4326, // WGS84
        31983, // UTM 23S
      );

      expect(result.fromEPSG).toBe(4326);
      expect(result.toEPSG).toBe(31983);
      expect(result.input).toEqual(wgs84Coord);
      expect(result.output.x).toBeGreaterThan(0); // Easting should be positive
      expect(result.output.y).toBeGreaterThan(0); // Northing should be positive (adjusted for southern hemisphere)
    });

    it('should transform UTM 23S to WGS84', () => {
      // Approximate UTM coordinates for São Paulo
      // Sãp Paulo is roughly at: UTM 23S: E 328,000m, N 7,450,000m
      const utmCoord: Coordinate = { x: 328000, y: 7450000 };
      
      const result: CoordinateTransformResult = service.transformCoordinate(
        utmCoord,
        31983, // UTM 23S
        4326, // WGS84
      );

      expect(result.fromEPSG).toBe(31983);
      expect(result.toEPSG).toBe(4326);
      expect(result.input).toEqual(utmCoord);
      // Should return approximate São Paulo coordinates
      expect(result.output.x).toBeCloseTo(-46.6, 1); // Within ~1 degree
      expect(result.output.y).toBeCloseTo(-23.5, 1); // Within ~1 degree
    });

    it('should return same coordinates when from and to are the same', () => {
      const coord: Coordinate = { x: -46.6333, y: -23.5505 };
      
      const result: CoordinateTransformResult = service.transformCoordinate(
        coord,
        4326,
        4326,
      );

      expect(result.output).toEqual(coord);
    });

    it('should throw error for unsupported CRS conversion', () => {
      const coord: Coordinate = { x: -46.6333, y: -23.5505 };
      
      expect(() => {
        service.transformCoordinate(coord, 3857, 4326); // Web Mercator not supported
      }).toThrow('CRS transformation not supported');
    });

    it('should transform round-trip WGS84 -> UTM -> WGS84 with reasonable accuracy', () => {
      const original: Coordinate = { x: -46.6333, y: -23.5505 };
      
      // WGS84 -> UTM
      const toUtm = service.transformCoordinate(original, 4326, 31983);
      
      // UTM -> WGS84
      const backToWgs84 = service.transformCoordinate(toUtm.output, 31983, 4326);
      
      // Check if we're within reasonable accuracy (simplified formulas have limited precision)
      expect(Math.abs(backToWgs84.output.x - original.x)).toBeLessThan(0.5); // < 0.5 degree
      expect(Math.abs(backToWgs84.output.y - original.y)).toBeLessThan(0.5); // < 0.5 degree
    });
  });

  describe('transformCoordinates', () => {
    it('should transform array of coordinates', () => {
      const coords: Coordinate[] = [
        { x: -46.6333, y: -23.5505 },
        { x: -46.65, y: -23.56 },
        { x: -46.6, y: -23.54 },
      ];

      const results = service.transformCoordinates(coords, 4326, 31983);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.x).toBeGreaterThan(0);
        expect(result.y).toBeGreaterThan(0);
      });
    });

    it('should return empty array for empty input', () => {
      const results = service.transformCoordinates([], 4326, 31983);
      expect(results).toEqual([]);
    });
  });
});
