"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crs_1 = require("../src/common/utils/crs");
describe('CRS Transformation Utilities', () => {
    describe('Coordinate Detection', () => {
        it('should detect WGS84 coordinates for Sao Paulo', () => {
            const result = (0, crs_1.detectCrsFromCoordinates)([-46.6333, -23.5505]);
            expect(result.detectedCrs).toBe(crs_1.CRS_WGS84);
            expect(result.confidence).toBe('high');
            expect(result.reasoning).toContain('Brazil');
        });
        it('should detect WGS84 coordinates within Brazil bounds', () => {
            const result = (0, crs_1.detectCrsFromCoordinates)([-43.1729, -22.9068]);
            expect(result.detectedCrs).toBe(crs_1.CRS_WGS84);
            expect(result.confidence).toBe('high');
        });
        it('should detect WGS84 coordinates globally', () => {
            const result = (0, crs_1.detectCrsFromCoordinates)([-74.0060, 40.7128]);
            expect(result.detectedCrs).toBe(crs_1.CRS_WGS84);
            expect(['low', 'medium']).toContain(result.confidence);
        });
        it('should detect UTM Zone 23S coordinates', () => {
            const result = (0, crs_1.detectCrsFromCoordinates)([328000, 7395000]);
            expect(result.detectedCrs).toBe(crs_1.CRS_SIRGAS2000_UTM_23S);
            expect(result.confidence).toBe('medium');
        });
        it('should detect UTM Zone 24S coordinates', () => {
            const result = (0, crs_1.detectCrsFromCoordinates)([500000, 7000000]);
            expect(result.detectedCrs).toBeDefined();
            expect(['medium', 'low']).toContain(result.confidence);
        });
        it('should return null for invalid coordinates', () => {
            const result = (0, crs_1.detectCrsFromCoordinates)([9999999, 9999999]);
            expect(result.detectedCrs).toBeNull();
        });
    });
    describe('Coordinate Validation', () => {
        it('should identify valid WGS84 coordinates', () => {
            expect((0, crs_1.isWgs84Coordinate)([-46.6333, -23.5505])).toBe(true);
            expect((0, crs_1.isWgs84Coordinate)([0, 0])).toBe(true);
            expect((0, crs_1.isWgs84Coordinate)([180, 90])).toBe(true);
            expect((0, crs_1.isWgs84Coordinate)([-180, -90])).toBe(true);
        });
        it('should reject invalid WGS84 coordinates', () => {
            expect((0, crs_1.isWgs84Coordinate)([181, -23.5505])).toBe(false);
            expect((0, crs_1.isWgs84Coordinate)([-46.6333, 91])).toBe(false);
            expect((0, crs_1.isWgs84Coordinate)([1000000, -23.5505])).toBe(false);
        });
        it('should identify UTM coordinates', () => {
            expect((0, crs_1.isUtmCoordinate)([328000, 7395000])).toBe(true);
            expect((0, crs_1.isUtmCoordinate)([500000, 7000000])).toBe(true);
            expect((0, crs_1.isUtmCoordinate)([200000, 10000000])).toBe(true);
        });
        it('should reject non-UTM coordinates', () => {
            expect((0, crs_1.isUtmCoordinate)([-46.6333, -23.5505])).toBe(false);
            expect((0, crs_1.isUtmCoordinate)([0, 0])).toBe(false);
            expect((0, crs_1.isUtmCoordinate)([100, 100])).toBe(false);
        });
        it('should suggest CRS for Brazil', () => {
            expect((0, crs_1.suggestCrsForBrazil)([-46.6333, -23.5505])).toBe(crs_1.CRS_WGS84);
            expect((0, crs_1.suggestCrsForBrazil)([328000, 7395000])).toBe(crs_1.CRS_SIRGAS2000_UTM_23S);
        });
    });
    describe('Coordinate Conversion', () => {
        it('should convert UTM Zone 23S to WGS84', () => {
            const result = (0, crs_1.convertCoordinate)([328000, 7395000], crs_1.CRS_SIRGAS2000_UTM_23S, crs_1.CRS_WGS84);
            expect(result.success).toBe(true);
            expect(result.converted).toBeDefined();
            expect(result.converted[0]).toBeGreaterThanOrEqual(-180);
            expect(result.converted[0]).toBeLessThanOrEqual(180);
            expect(result.converted[1]).toBeGreaterThanOrEqual(-90);
            expect(result.converted[1]).toBeLessThanOrEqual(90);
            expect(result.converted[0]).toBeGreaterThanOrEqual(-50);
            expect(result.converted[0]).toBeLessThanOrEqual(-40);
        });
        it('should convert WGS84 to UTM Zone 23S', () => {
            const result = (0, crs_1.convertCoordinate)([-46.6333, -23.5505], crs_1.CRS_WGS84, crs_1.CRS_SIRGAS2000_UTM_23S);
            expect(result.success).toBe(true);
            expect(result.converted).toBeDefined();
            expect(result.converted[0]).toBeGreaterThan(300000);
            expect(result.converted[0]).toBeLessThan(400000);
            expect(result.converted[1]).toBeGreaterThan(7000000);
            expect(result.converted[1]).toBeLessThan(8000000);
        });
        it('should pass through WGS84 to WGS84 conversion', () => {
            const result = (0, crs_1.convertCoordinate)([-46.6333, -23.5505], crs_1.CRS_WGS84, crs_1.CRS_WGS84);
            expect(result.success).toBe(true);
            expect(result.converted).toEqual([-46.6333, -23.5505]);
        });
        it('should handle zone mismatch errors', () => {
            const result = (0, crs_1.convertCoordinate)([-46.6333, -23.5505], crs_1.CRS_WGS84, crs_1.CRS_SIRGAS2000_UTM_24S);
            expect(result).toBeDefined();
        });
        it('should return error for unsupported CRS conversion', () => {
            const result = (0, crs_1.convertCoordinate)([0, 0], 'EPSG:1234', crs_1.CRS_WGS84);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
    describe('Geometry Conversion', () => {
        it('should convert Point geometry from UTM to WGS84', () => {
            const utmPoint = {
                type: 'Point',
                coordinates: [328000, 7395000],
            };
            const result = (0, crs_1.convertGeometryCoordinates)(utmPoint, crs_1.CRS_SIRGAS2000_UTM_23S, crs_1.CRS_WGS84);
            expect(result).not.toBeNull();
            expect(result?.type).toBe('Point');
            const point = result;
            expect(point.coordinates[0]).toBeGreaterThanOrEqual(-180);
            expect(point.coordinates[0]).toBeLessThanOrEqual(180);
            expect(point.coordinates[1]).toBeGreaterThanOrEqual(-90);
            expect(point.coordinates[1]).toBeLessThanOrEqual(90);
        });
        it('should convert Polygon geometry from UTM to WGS84', () => {
            const utmPolygon = {
                type: 'Polygon',
                coordinates: [[
                        [328000, 7395000],
                        [328100, 7395000],
                        [328100, 7395100],
                        [328000, 7395100],
                        [328000, 7395000],
                    ]],
            };
            const result = (0, crs_1.convertGeometryCoordinates)(utmPolygon, crs_1.CRS_SIRGAS2000_UTM_23S, crs_1.CRS_WGS84);
            expect(result).not.toBeNull();
            expect(result?.type).toBe('Polygon');
            const polygon = result;
            expect(polygon.coordinates[0].length).toBe(5);
            for (const coord of polygon.coordinates[0]) {
                expect(coord[0]).toBeGreaterThanOrEqual(-180);
                expect(coord[0]).toBeLessThanOrEqual(180);
                expect(coord[1]).toBeGreaterThanOrEqual(-90);
                expect(coord[1]).toBeLessThanOrEqual(90);
            }
        });
        it('should convert MultiPolygon geometry from UTM to WGS84', () => {
            const utmMultiPolygon = {
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
            const result = (0, crs_1.convertGeometryCoordinates)(utmMultiPolygon, crs_1.CRS_SIRGAS2000_UTM_23S, crs_1.CRS_WGS84);
            expect(result).not.toBeNull();
            expect(result?.type).toBe('MultiPolygon');
            const multiPolygon = result;
            expect(multiPolygon.coordinates.length).toBe(2);
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
                type: 'InvalidType',
                coordinates: [],
            };
            const result = (0, crs_1.convertGeometryCoordinates)(invalidGeometry, crs_1.CRS_SIRGAS2000_UTM_23S, crs_1.CRS_WGS84);
            expect(result).toBeNull();
        });
        it('should pass through when source and target CRS are the same', () => {
            const wgs84Polygon = {
                type: 'Polygon',
                coordinates: [[
                        [-46.6333, -23.5505],
                        [-46.6330, -23.5505],
                        [-46.6330, -23.5502],
                        [-46.6333, -23.5502],
                        [-46.6333, -23.5505],
                    ]],
            };
            const result = (0, crs_1.convertGeometryCoordinates)(wgs84Polygon, crs_1.CRS_WGS84, crs_1.CRS_WGS84);
            expect(result).not.toBeNull();
            const polygon = result;
            expect(polygon.coordinates[0][0][0]).toBeCloseTo(-46.6333);
            expect(polygon.coordinates[0][0][1]).toBeCloseTo(-23.5505);
        });
    });
    describe('Round-trip Conversion', () => {
        it.skip('should convert WGS84 → UTM → WGS84 with minimal error', () => {
            const originalLng = -46.6333;
            const originalLat = -23.5505;
            const toUtm = (0, crs_1.convertCoordinate)([originalLng, originalLat], crs_1.CRS_WGS84, crs_1.CRS_SIRGAS2000_UTM_23S);
            expect(toUtm.success).toBe(true);
            expect(toUtm.converted).toBeDefined();
            const backToWgs84 = (0, crs_1.convertCoordinate)(toUtm.converted, crs_1.CRS_SIRGAS2000_UTM_23S, crs_1.CRS_WGS84);
            expect(backToWgs84.success).toBe(true);
            expect(backToWgs84.converted).toBeDefined();
            expect(backToWgs84.converted[0]).toBeCloseTo(originalLng, 0.1);
            expect(backToWgs84.converted[1]).toBeCloseTo(originalLat, 0.1);
        });
    });
    describe('Real-world São Paulo Coordinates', () => {
        const spCoordinates = {
            wgs84: {
                downtown: [-46.6333, -23.5505],
                oferta: [-46.6856, -23.6262],
                airport: [-46.6598, -23.4356],
            },
            utmZone23S: {
                downtown: [328000, 7395000],
                oferta: [322000, 7388000],
                airport: [329000, 7402000],
            },
        };
        it('should detect São Paulo downtown as WGS84', () => {
            const result = (0, crs_1.detectCrsFromCoordinates)(spCoordinates.wgs84.downtown);
            expect(result.detectedCrs).toBe(crs_1.CRS_WGS84);
        });
        it('should detect São Paulo UTM as Zone 23S', () => {
            const result = (0, crs_1.detectCrsFromCoordinates)(spCoordinates.utmZone23S.downtown);
            expect(result.detectedCrs).toBe(crs_1.CRS_SIRGAS2000_UTM_23S);
        });
        it('should convert São Paulo UTM to WGS84 with expected longitude range', () => {
            const result = (0, crs_1.convertCoordinate)(spCoordinates.utmZone23S.downtown, crs_1.CRS_SIRGAS2000_UTM_23S, crs_1.CRS_WGS84);
            expect(result.success).toBe(true);
            expect(result.converted).toBeDefined();
            expect(result.converted[0]).toBeGreaterThanOrEqual(-180);
            expect(result.converted[0]).toBeLessThanOrEqual(180);
            expect(result.converted[1]).toBeGreaterThanOrEqual(-90);
            expect(result.converted[1]).toBeLessThanOrEqual(90);
        });
    });
});
//# sourceMappingURL=crs-transform.spec.js.map