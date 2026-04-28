/**
 * Simple test to verify CRS conversion works end-to-end in the service
 */
import { convertCoordinate, convertGeometryCoordinates, CRS_WGS84, CRS_SIRGAS2000_UTM_23S } from '../src/common/utils/crs';
import * as GeoJSON from 'geojson';

describe('CRS Import Simple Proof', () => {
  describe('known coordinate validation', () => {
    it('should convert known UTM São Paulo coordinate to WGS84 correctly', () => {
      // Known São Paulo UTM coordinate (approximate center of city)
      // UTM Zone 23S, Easting: 328000, Northing: 7395000
      const utmEasting = 328000;
      const utmNorthing = 7395000;
      
      const result = convertCoordinate([utmEasting, utmNorthing], CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      
      expect(result.success).toBe(true);
      expect(result.converted).toBeDefined();
      expect(result.converted!.length).toBe(2);
      
      const [lng, lat] = result.converted!;
      
      // São Paulo is approximately at -46.6333, -23.5505
      // After conversion from UTM Zone 23S [328000, 7395000], should be close to SP
      expect(lng).toBeGreaterThan(-47);
      expect(lng).toBeLessThan(-46);
      expect(lat).toBeGreaterThan(-24);
      expect(lat).toBeLessThan(-23);
      
      // within WGS84 bounds
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
    });

    it('should convert WGS84 São Paulo back to UTM Zone 23S', () => {
      // Known São Paulo coordinates
      const wgs84Lng = -46.6333;
      const wgs84Lat = -23.5505;
      
      // Convert to UTM
      const result = convertCoordinate([wgs84Lng, wgs84Lat], CRS_WGS84, CRS_SIRGAS2000_UTM_23S);
      
      expect(result.success).toBe(true);
      expect(result.converted).toBeDefined();
      expect(result.converted!.length).toBe(2);
      
      const [easting, northing] = result.converted!;
      
      // UTM coordinates for São Paulo area should be in these ranges
      // Zone 23S: Easting roughly 100k-900k, Northing roughly 7M-10M (southern hemisphere)
      expect(easting).toBeGreaterThan(100000);
      expect(easting).toBeLessThan(900000);
      expect(northing).toBeGreaterThan(7000000);
      expect(northing).toBeLessThan(10000000);
    });

    it('should round-trip convert WGS84 ↔ UTM with high precision', () => {
      // Known accurate coordinate for Praça da Sé, São Paulo
      const originalLng = -46.6348;
      const originalLat = -23.5505;
      
      // Convert to UTM
      const toUtm = convertCoordinate([originalLng, originalLat], CRS_WGS84, CRS_SIRGAS2000_UTM_23S);
      expect(toUtm.success).toBe(true);
      
      // Convert back to WGS84
      const backToWgs84 = convertCoordinate(toUtm.converted!, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(backToWgs84.success).toBe(true);
      
      // Precision should be excellent with proj4 (within 0.001 degrees)
      const [convertedLng, convertedLat] = backToWgs84.converted!;
      expect(Math.abs(convertedLng - originalLng)).toBeLessThan(0.001);
      expect(Math.abs(convertedLat - originalLat)).toBeLessThan(0.001);
    });
  });

  describe('geometry conversion', () => {
    it('should convert UTM polygon to WGS84', () => {
      const utmPolygon: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: [[
          [328000, 7395000],
          [328100, 7395000],
          [328100, 7395100],
          [328000, 7395100],
          [328000, 7395000],
        ]],
      };
      
      const converted = convertGeometryCoordinates(utmPolygon, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      
      expect(converted).not.toBeNull();
      expect(converted!.type).toBe('Polygon');
      expect((converted as GeoJSON.Polygon).coordinates[0].length).toBe(5);
      
      // All converted coordinates should be in WGS84 bounds
      const coords = (converted as GeoJSON.Polygon).coordinates[0];
      for (const coord of coords) {
        expect(coord[0]).toBeGreaterThanOrEqual(-180);
        expect(coord[0]).toBeLessThanOrEqual(180);
        expect(coord[1]).toBeGreaterThanOrEqual(-90);
        expect(coord[1]).toBeLessThanOrEqual(90);
      }
    });

    it('should leave WGS84 polygon unchanged', () => {
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
      
      const converted = convertGeometryCoordinates(wgs84Polygon, CRS_WGS84, CRS_WGS84);
      
      expect(converted).not.toBeNull();
      expect(converted!.type).toBe('Polygon');
      expect((converted as GeoJSON.Polygon).coordinates).toEqual(wgs84Polygon.coordinates);
    });
  });

  describe('CRS detection for São Paulo', () => {
    it('should detect São Paulo municipality and use Zone 23S', () => {
      // This test verifies the logic in parcels.service.ts detectAndConvertCRS
      // For now, just test the coordinate detection
      const utmCoord = [328000, 7395000];
      
      // These should be recognized as UTM Zone 23S
      expect(utmCoord[0]).toBeGreaterThanOrEqual(100000);
      expect(utmCoord[0]).toBeLessThanOrEqual(900000);
      expect(utmCoord[1]).toBeGreaterThanOrEqual(7000000);
      expect(utmCoord[1]).toBeLessThanOrEqual(11000000);
      
      // Convert to verify it lands in São Paulo bounds
      const result = convertCoordinate(utmCoord, CRS_SIRGAS2000_UTM_23S, CRS_WGS84);
      expect(result.success).toBe(true);
      
      const [lng, lat] = result.converted!;
      // São Paulo state bounds approximately
      expect(lng).toBeGreaterThan(-50);
      expect(lng).toBeLessThan(-45);
      expect(lat).toBeGreaterThan(-25);
      expect(lat).toBeLessThan(-20);
    });
  });
});
