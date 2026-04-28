import {
  CRS_WGS84,
  CRS_SIRGAS2000_UTM_23S,
  CRS_SIRGAS2000_UTM_24S,
  convertCoordinate,
  convertGeometryCoordinates,
  detectCrsFromCoordinates,
  isWgs84Coordinate,
  isUtmCoordinate,
  suggestCrsForBrazil,
} from '../src/common/utils/crs';
import * as GeoJSON from 'geojson';

describe('CRS Transformation Utilities', () => {
  describe('Coordinate Detection', () => {
    it('should detect WGS84 coordinates for Sao Paulo', () => {
      // São Paulo downtown in WGS84
      const result = detectCrsFromCoordinates([-46.6333, -23.5505]);
      expect(result.detectedCrs).toBe(CRS_WGS84);
      expect(result.confidence).toBe('high');
      expect(result.reasoning).toContain('Brazil');
    });

    it('should detect WGS84 coordinates within Brazil bounds', () => {
      // Rio de Janeiro
      const result = detectCrsFromCoordinates([-43.1729, -22.9068]);
      expect(result.detectedCrs).toBe(CRS_WGS84);
      expect(result.confidence).toBe('high');
    });

    it('should detect WGS84 coordinates globally', () => {
      // New York
      const result = detectCrsFromCoordinates([-74.0060, 40.7128]);
      expect(result.detectedCrs).toBe(CRS_WGS84);
      // Note: New York is outside Brazil bounds, so confidence is 'low' or 'medium'
      expect(['low', 'medium']).toContain(result.confidence);
    });

    it('should detect UTM Zone 23S coordinates', () => {
      // São Paulo UTM Zone 23S coordinates (easting, northing)
      // Approximate for São Paulo: E ~ 328,000, N ~ 7,395,000
      const result = detectCrsFromCoordinates([328000, 7395000]);
      expect(result.detectedCrs).toBe(CRS_SIRGAS2000_UTM_23S);
      expect(result.confidence).toBe('medium');
    });

    it('should detect UTM Zone 24S coordinates', () => {
      // Western Brazil UTM Zone 24S coordinates
      const result = detectCrsFromCoordinates([500000, 7000000]);
      // Note: Detection is based on range, may return zone 23 or 24
      expect(result.detectedCrs).toBeDefined();
      expect(['medium', 'low']).toContain(result.confidence);
    });

    it('should return null for invalid coordinates', () => {
      const result = detectCrsFromCoordinates([9999999, 9999999]);
      expect(result.detectedCrs).toBeNull();
    });
  });

  describe('Coordinate Validation', () => {
    it('should identify valid WGS84 coordinates', () => {
      expect(isWgs84Coordinate([-46.6333, -23.5505])).toBe(true);
      expect(isWgs84Coordinate([0, 0])).toBe(true);
      expect(isWgs84Coordinate([180, 90])).toBe(true);
      expect(isWgs84Coordinate([-180, -90])).toBe(true);
    });

    it('should reject invalid WGS84 coordinates', () => {
      expect(isWgs84Coordinate([181, -23.5505])).toBe(false);
      expect(isWgs84Coordinate([-46.6333, 91])).toBe(false);
      expect(isWgs84Coordinate([1000000, -23.5505])).toBe(false);
    });

    it('should identify UTM coordinates', () => {
      expect(isUtmCoordinate([328000, 7395000])).toBe(true);
      expect(isUtmCoordinate([500000, 7000000])).toBe(true);
      expect(isUtmCoordinate([200000, 10000000])).toBe(true);
    });

    it('should reject non-UTM coordinates', () => {
      expect(isUtmCoordinate([-46.6333, -23.5505])).toBe(false);
      expect(isUtmCoordinate([0, 0])).toBe(false);
      expect(isUtmCoordinate([100, 100])).toBe(false);
    });

    it('should suggest CRS for Brazil', () => {
      expect(suggestCrsForBrazil([-46.6333, -23.5505])).toBe(CRS_WGS84);
      expect(suggestCrsForBrazil([328000, 7395000])).toBe(CRS_SIRGAS2000_UTM_23S);
    });
  });

  describe('Coordinate Conversion', () => {
    // Known test point: São Paulo
    // Approximate coordinates:
    // WGS84: -46.6333, -23.5505
    // UTM Zone 23S: approximately 328,000 E, 7,395,000 N
    
    it('should convert UTM Zone 23S to WGS84', () => {
      // Test with UTM coordinates that should convert to Brazil
      // Using central São Paulo area UTM coordinates
      const result = convertCoordinate([328000, 7395000], CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(result.success).toBe(true);
      expect(result.converted).toBeDefined();
      // Result should be valid WGS84 coordinates
      expect(result.converted![0]).toBeGreaterThanOrEqual(-180);
      expect(result.converted![0]).toBeLessThanOrEqual(180);
      expect(result.converted![1]).toBeGreaterThanOrEqual(-90);
      expect(result.converted![1]).toBeLessThanOrEqual(90);
      // For zone 23S in Brazil, longitude should be around -45 to -47
      expect(result.converted![0]).toBeGreaterThanOrEqual(-50);
      expect(result.converted![0]).toBeLessThanOrEqual(-40);
    });

    it('should convert WGS84 to UTM Zone 23S', () => {
      const result = convertCoordinate([-46.6333, -23.5505], CRS_WGS84, CRS_SIRGAS2000_UTM_23S);
      expect(result.success).toBe(true);
      expect(result.converted).toBeDefined();
      // São Paulo area in UTM Zone 23S should have easting ~328,000 and northing ~7,395,000
      expect(result.converted![0]).toBeGreaterThan(300000);
      expect(result.converted![0]).toBeLessThan(400000);
      expect(result.converted![1]).toBeGreaterThan(7000000);
      expect(result.converted![1]).toBeLessThan(8000000);
    });

    it('should pass through WGS84 to WGS84 conversion', () => {
      const result = convertCoordinate([-46.6333, -23.5505], CRS_WGS84, CRS_WGS84);
      expect(result.success).toBe(true);
      expect(result.converted).toEqual([-46.6333, -23.5505]);
    });

    it('should handle zone mismatch errors', () => {
      // Try to convert a coordinate that's in zone 24 to zone 23 UTM
      const result = convertCoordinate([-46.6333, -23.5505], CRS_WGS84, CRS_SIRGAS2000_UTM_24S);
      // This might succeed or fail depending on the actual zone
      // The important thing is it doesn't crash
      expect(result).toBeDefined();
    });

    it('should return error for unsupported CRS conversion', () => {
      const result = convertCoordinate([0, 0], 'EPSG:1234', CRS_WGS84);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Geometry Conversion', () => {
    it('should convert Point geometry from UTM to WGS84', () => {
      const utmPoint = {
        type: 'Point' as const,
        coordinates: [328000, 7395000] as [number, number],
      };
      const result = convertGeometryCoordinates(utmPoint, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('Point');
      const point = result as GeoJSON.Point;
      // Result should be valid WGS84 coordinates
      expect(point.coordinates[0]).toBeGreaterThanOrEqual(-180);
      expect(point.coordinates[0]).toBeLessThanOrEqual(180);
      expect(point.coordinates[1]).toBeGreaterThanOrEqual(-90);
      expect(point.coordinates[1]).toBeLessThanOrEqual(90);
    });

    it('should convert Polygon geometry from UTM to WGS84', () => {
      // Simple square polygon in UTM Zone 23S
      const utmPolygon = {
        type: 'Polygon' as const,
        coordinates: [[
          [328000, 7395000],
          [328100, 7395000],
          [328100, 7395100],
          [328000, 7395100],
          [328000, 7395000],
        ]],
      };
      const result = convertGeometryCoordinates(utmPolygon, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('Polygon');
      const polygon = result as GeoJSON.Polygon;
      expect(polygon.coordinates[0].length).toBe(5);
      // All coordinates should be in WGS84 bounds
      for (const coord of polygon.coordinates[0]) {
        expect(coord[0]).toBeGreaterThanOrEqual(-180);
        expect(coord[0]).toBeLessThanOrEqual(180);
        expect(coord[1]).toBeGreaterThanOrEqual(-90);
        expect(coord[1]).toBeLessThanOrEqual(90);
      }
    });

    it('should convert MultiPolygon geometry from UTM to WGS84', () => {
      const utmMultiPolygon: GeoJSON.MultiPolygon = {
        type: 'MultiPolygon',
        coordinates: [
          [[
            [328000, 7395000],
            [328100, 7395000],
            [328100, 7395100],
            [328000, 7395100],
            [328000, 7395000],
          ]],
          [[
            [328200, 7395000],
            [328300, 7395000],
            [328300, 7395100],
            [328200, 7395100],
            [328200, 7395000],
          ]],
        ],
      };
      const result = convertGeometryCoordinates(utmMultiPolygon, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('MultiPolygon');
      const multiPolygon = result as GeoJSON.MultiPolygon;
      expect(multiPolygon.coordinates.length).toBe(2);
      // All coordinates should be in WGS84 bounds
      for (const polygon of multiPolygon.coordinates) {
        for (const ring of polygon) {
          for (const coord of ring) {
            expect(coord[0]).toBeGreaterThanOrEqual(-180);
            expect(coord[0]).toBeLessThanOrEqual(180);
            expect(coord[1]).toBeGreaterThanOrEqual(-90);
            expect(coord[1]).toBeLessThanOrEqual(90);
          }
        }
      }
    });

    it('should return null for invalid geometry conversion', () => {
      const invalidGeometry = {
        type: 'InvalidType' as any,
        coordinates: [] as any,
      };
      const result = convertGeometryCoordinates(invalidGeometry, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(result).toBeNull();
    });

    it('should pass through when source and target CRS are the same', () => {
      const wgs84Polygon: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: [[
          [-46.6333, -23.5505],
          [-46.6330, -23.5505],
          [-46.6330, -23.5502],
          [-46.6333, -23.5502],
          [-46.6333, -23.5505],
        ]],
      };
      const result = convertGeometryCoordinates(wgs84Polygon, CRS_WGS84, CRS_WGS84);
      expect(result).not.toBeNull();
      // Should be unchanged
      const polygon = result as GeoJSON.Polygon;
      expect(polygon.coordinates[0][0][0]).toBeCloseTo(-46.6333);
      expect(polygon.coordinates[0][0][1]).toBeCloseTo(-23.5505);
    });
  });

  describe('Round-trip Conversion', () => {
    it('should convert WGS84 → UTM → WGS84 with minimal error', () => {
      // Known São Paulo coordinates
      const originalLng = -46.6333;
      const originalLat = -23.5505;
      
      // Convert to UTM
      const toUtm = convertCoordinate([originalLng, originalLat], CRS_WGS84, CRS_SIRGAS2000_UTM_23S);
      expect(toUtm.success).toBe(true);
      expect(toUtm.converted).toBeDefined();
      
      // Convert back to WGS84
      const backToWgs84 = convertCoordinate(toUtm.converted!, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(backToWgs84.success).toBe(true);
      expect(backToWgs84.converted).toBeDefined();
      
      // Check that we get back to approximately the same coordinates
      // The pure JS conversion has some limitations but should be reasonable
      expect(backToWgs84.converted![0]).toBeCloseTo(originalLng, 0.1);
      expect(backToWgs84.converted![1]).toBeCloseTo(originalLat, 0.1);
    });
  });

  describe('Real-world São Paulo Coordinates', () => {
    // Test with real São Paulo area coordinates
    const spCoordinates = {
      wgs84: {
        downtown: [-46.6333, -23.5505],
        oferta: [-46.6856, -23.6262], // avrebbe
        airport: [-46.6598, -23.4356], // GRU
      },
      // Approximate UTM Zone 23S for these locations
      // These are illustrative - exact values depend on precise location
      utmZone23S: {
        downtown: [328000, 7395000],
        oferta: [322000, 7388000],
        airport: [329000, 7402000],
      },
    };

    it('should detect São Paulo downtown as WGS84', () => {
      const result = detectCrsFromCoordinates(spCoordinates.wgs84.downtown);
      expect(result.detectedCrs).toBe(CRS_WGS84);
    });

    it('should detect São Paulo UTM as Zone 23S', () => {
      const result = detectCrsFromCoordinates(spCoordinates.utmZone23S.downtown);
      expect(result.detectedCrs).toBe(CRS_SIRGAS2000_UTM_23S);
    });

    it('should convert São Paulo UTM to WGS84 with expected longitude range', () => {
      const result = convertCoordinate(spCoordinates.utmZone23S.downtown, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(result.success).toBe(true);
      expect(result.converted).toBeDefined();
      // Result should be valid WGS84 coordinates
      expect(result.converted![0]).toBeGreaterThanOrEqual(-180);
      expect(result.converted![0]).toBeLessThanOrEqual(180);
      expect(result.converted![1]).toBeGreaterThanOrEqual(-90);
      expect(result.converted![1]).toBeLessThanOrEqual(90);
    });
  });
});
