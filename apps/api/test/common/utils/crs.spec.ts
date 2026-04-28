/**
 * T5-SP-UNIT-CRITICAL
 * Unit tests for CRS (Coordinate Reference System) utilities
 * Tests: detectCrsFromCoordinates, convertCoordinate, convertGeometryCoordinates
 */

import {
  detectCrsFromCoordinates,
  convertCoordinate,
  convertGeometryCoordinates,
  isWgs84Coordinate,
  isUtmCoordinate,
  suggestCrsForBrazil,
  CRS_WGS84,
  CRS_SIRGAS2000_UTM_23S,
  CRS_SIRGAS2000_UTM_24S,
} from '../../../src/common/utils/crs';

describe('CRS Utilities - Unit Tests', () => {
  describe('detectCrsFromCoordinates', () => {
    it('should detect WGS84 for valid lat/lng in Brazil', () => {
      const result = detectCrsFromCoordinates([-46.6333, -23.5505]);
      expect(result.detectedCrs).toBe(CRS_WGS84);
      expect(result.confidence).toBe('high');
    });

    it('should detect UTM 23S for São Paulo UTM coordinates', () => {
      // Approximate UTM coordinates for São Paulo (zone 23S)
      const result = detectCrsFromCoordinates([328000, 7450000]);
      expect(result.detectedCrs).toBe(CRS_SIRGAS2000_UTM_23S);
      expect(result.confidence).toBe('medium');
    });

    it('should detect UTM 24S for coordinates in zone 24S range', () => {
      // UTM zone 24S range (roughly -48 to -42 longitude)
      const result = detectCrsFromCoordinates([400000, 7450000]);
      expect(result.detectedCrs).toBe(CRS_SIRGAS2000_UTM_24S);
      expect(result.confidence).toBe('medium');
    });

    it('should return low confidence for coordinates outside known ranges', () => {
      const result = detectCrsFromCoordinates([9999999, 9999999]);
      expect(result.confidence).toBe('low');
      expect(result.detectedCrs).toBeNull();
    });

    it('should handle invalid coordinates', () => {
      const result = detectCrsFromCoordinates([null as unknown as number, undefined as unknown as number]);
      expect(result.confidence).toBe('low');
      expect(result.detectedCrs).toBeNull();
    });
  });

  describe('convertCoordinate', () => {
    it('should return same coordinates when from and to are the same', () => {
      const coord = [-46.6333, -23.5505];
      const result = convertCoordinate(coord, CRS_WGS84, CRS_WGS84);
      expect(result.success).toBe(true);
      expect(result.converted).toEqual(coord);
    });

    it('should convert WGS84 to UTM 23S', () => {
      // São Paulo coordinates
      const coord = [-46.6333, -23.5505];
      const result = convertCoordinate(coord, CRS_WGS84, CRS_SIRGAS2000_UTM_23S);
      expect(result.success).toBe(true);
      expect(result.converted!).toBeDefined();
      expect(result.converted![0]).toBeGreaterThan(100000); // Easting should be in UTM range
      expect(result.converted![1]).toBeGreaterThan(7000000); // Northing should be in southern hemisphere range
    });

    it('should convert UTM 23S to WGS84', () => {
      // Approximate UTM coordinates for São Paulo
      const coord = [328000, 7450000];
      const result = convertCoordinate(coord, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(result.success).toBe(true);
      expect(result.converted!).toBeDefined();
      expect(result.converted![0]).toBeCloseTo(-46.6, 1); // Should be close to -46.6
      expect(result.converted![1]).toBeCloseTo(-23.5, 1); // Should be close to -23.5
    });

    it('should return error for unsupported conversion', () => {
      const result = convertCoordinate([0, 0], 'EPSG:99999', 'EPSG:4326');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should handle zone mismatch for WGS84 to UTM conversion', () => {
      // Coordinate that would fall in zone 22, but we're converting to zone 23S
      const coord = [-49.0, -23.5505]; // West of zone 23
      const result = convertCoordinate(coord, CRS_WGS84, CRS_SIRGAS2000_UTM_23S);
      expect(result.success).toBe(false);
      expect(result.error).toContain('zone');
    });
  });

  describe('convertGeometryCoordinates', () => {
    it('should convert Polygon coordinates', () => {
      const polygon = {
        type: 'Polygon' as const,
        coordinates: [[[-46.6, -23.5], [-46.6, -23.4], [-46.5, -23.4], [-46.5, -23.5], [-46.6, -23.5]]],
      };
      const result = convertGeometryCoordinates(polygon, CRS_WGS84, CRS_SIRGAS2000_UTM_23S);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('Polygon');
    });

    it('should convert MultiPolygon coordinates', () => {
      const multiPolygon = {
        type: 'MultiPolygon' as const,
        coordinates: [
          [[[-46.6, -23.5], [-46.6, -23.4], [-46.5, -23.4], [-46.5, -23.5], [-46.6, -23.5]]],
          [[[-46.7, -23.6], [-46.7, -23.5], [-46.6, -23.5], [-46.6, -23.6], [-46.7, -23.6]]],
        ],
      };
      const result = convertGeometryCoordinates(multiPolygon, CRS_WGS84, CRS_SIRGAS2000_UTM_23S);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('MultiPolygon');
    });

    it('should return null for unsupported conversion', () => {
      const polygon = {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };
      const result = convertGeometryCoordinates(polygon, 'EPSG:99999', CRS_WGS84);
      expect(result).toBeNull();
    });

    it('should skip conversion when from and to are the same', () => {
      const polygon = {
        type: 'Polygon' as const,
        coordinates: [[[-46.6, -23.5], [-46.6, -23.4], [-46.5, -23.4], [-46.5, -23.5], [-46.6, -23.5]]],
      };
      const result = convertGeometryCoordinates(polygon, CRS_WGS84, CRS_WGS84);
      expect(result).toEqual(polygon);
    });
  });

  describe('isWgs84Coordinate', () => {
    it('should return true for valid WGS84 coordinates', () => {
      expect(isWgs84Coordinate([-46.6333, -23.5505])).toBe(true);
      expect(isWgs84Coordinate([0, 0])).toBe(true);
      expect(isWgs84Coordinate([180, 90])).toBe(true);
      expect(isWgs84Coordinate([-180, -90])).toBe(true);
    });

    it('should return false for coordinates outside WGS84 range', () => {
      expect(isWgs84Coordinate([-181, -23.5])).toBe(false);
      expect(isWgs84Coordinate([-46.6, -91])).toBe(false);
      expect(isWgs84Coordinate([200, 200])).toBe(false);
    });

    it('should return false for non-numeric coordinates', () => {
      expect(isWgs84Coordinate([null as unknown as number, -23.5])).toBe(false);
      expect(isWgs84Coordinate([-46.6, undefined as unknown as number])).toBe(false);
    });
  });

  describe('isUtmCoordinate', () => {
    it('should return true for valid UTM coordinates', () => {
      expect(isUtmCoordinate([500000, 7500000])).toBe(true);
      expect(isUtmCoordinate([100000, 1000000])).toBe(true);
      expect(isUtmCoordinate([999999, 9999999])).toBe(true);
    });

    it('should return false for coordinates outside UTM range', () => {
      expect(isUtmCoordinate([50000, 7500000])).toBe(false);
      expect(isUtmCoordinate([500000, 500000])).toBe(false);
      expect(isUtmCoordinate([10000000, 10000000])).toBe(false);
    });
  });

  describe('suggestCrsForBrazil', () => {
    it('should suggest WGS84 for Brazil lat/lng', () => {
      const result = suggestCrsForBrazil([-46.6333, -23.5505]);
      expect(result).toBe(CRS_WGS84);
    });

    it('should suggest UTM for UTM coordinates in Brazil range', () => {
      const result = suggestCrsForBrazil([328000, 7450000]);
      expect(result).toBe(CRS_SIRGAS2000_UTM_23S);
    });
  });
});
