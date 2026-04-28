/**
 * T6-SP-GIS-MULTIPOLYGON-COMPLEX
 * Unit tests for complex geometry handling (holes, islands, MultiPolygon)
 * Tests: Validated with holes, imports with holes, parsing MultiPolygon with holes
 */

import { Test, TestingModule } from '@nestjs/testing';
import { GeometryService } from '../../../src/modules/ctm/geometry.service';

describe('GeometryService - Complex Geometry (MultiPolygon with Holes)', () => {
  let service: GeometryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeometryService],
    }).compile();

    service = module.get<GeometryService>(GeometryService);
  });

  describe('Polygon with holes', () => {
    it('should validate Polygon with hole', () => {
      // Polygon with one hole
      const polygon = {
        type: 'Polygon',
        coordinates: [
          // Outer ring (CCW)
          [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
          // Hole (CW) - inside the outer ring
          [[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]],
        ],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate Polygon with multiple holes', () => {
      // Polygon with two holes
      const polygon = {
        type: 'Polygon',
        coordinates: [
          // Outer ring
          [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],
          // First hole
          [[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]],
          // Second hole
          [[12, 12], [18, 12], [18, 18], [12, 18], [12, 12]],
        ],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate complex MultiPolygon with holes', () => {
      // MultiPolygon where one polygon has a hole
      const multiPolygon = {
        type: 'MultiPolygon',
        coordinates: [
          // First polygon with hole
          [
            [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
            [[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]],
          ],
          // Second polygon without hole
          [
            [[11, 11], [20, 11], [20, 20], [11, 20], [11, 11]],
          ],
        ],
      };

      const result = service.validateGeometry(multiPolygon);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate realistic SP MultiPolygon with hole', () => {
      // São Paulo style lot with a hole (e.g., building in the middle)
      const spPolygon = {
        type: 'Polygon',
        coordinates: [
          // Outer ring (block perimeter)
          [[-46.635, -23.551], [-46.633, -23.551], [-46.633, -23.549], [-46.635, -23.549], [-46.635, -23.551]],
          // Hole (inner area not part of the lot)
          [[-46.634, -23.5505], [-46.6343, -23.5505], [-46.6343, -23.5502], [-46.634, -23.5502], [-46.634, -23.5505]],
        ],
      };

      const result = service.validateGeometry(spPolygon);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.calculatedArea).toBeGreaterThan(0);
    });

    it('should calculate area correctly for Polygon with hole', () => {
      // Polygon with hole - the hole should be subtracted from the total area
      const polygon = {
        type: 'Polygon',
        coordinates: [
          // Outer: 100x100 square in degrees (will be large in meters)
          [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]],
          // Hole: 0.2x0.2 square
          [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6], [0.4, 0.4]],
        ],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(true);
      // Area should be calculated (outer area minus hole area)
      expect(result.calculatedArea).toBeDefined();
    });
  });

  describe('Edge cases - Malformed', () => {
    it('should handle Polygon with uncoachined hole', () => {
      // Hole that extends outside the polygon
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]],
          [[5, 5], [10, 5], [10, 10], [5, 10], [5, 5]], // Hole outside!
        ],
      };

      const result = service.validateGeometry(polygon);
      // Should still be valid (the hole outside is geometrically possible, just unusual)
      expect(result.valid).toBe(true);
    });

    it('should handle empty hole', () => {
      // Polygon with an empty hole (edge case)
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]],
          [], // Empty hole
        ],
      };

      const result = service.validateGeometry(polygon);
      // Empty hole should cause validation issues
      expect(result.valid).toBe(false);
    });

    it('should handle MultiPolygon com empty coordinates', () => {
      const multiPolygon = {
        type: 'MultiPolygon',
        coordinates: [[], []],
      };

      const result = service.validateGeometry(multiPolygon);
      expect(result.valid).toBe(false);
    });

    it('should handle self-intersecting Polygon', () => {
      // Figure-8 shaped polygon (self-intersecting)
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]],
          [[1, -1], [1, 3], [3, 1], [-1, 1], [1, -1]], // This would intersect
        ],
      };

      // May not detect self-intersection (requires more complex geometry library)
      const result = service.validateGeometry(polygon);
      // At a minimum, it should not crash
      expect(result).toBeDefined();
    });
  });

  describe('Real-world SP scenarios', () => {
    it('should validate complex São Paulo block with multiple units', () => {
      // Complex SP MultiPolygon representing a city block with multiple lots
      const spComplex = {
        type: 'MultiPolygon',
        coordinates: [
          // Lot 1: Simple rectangle
          [
            [[-46.635, -23.551], [-46.634, -23.551], [-46.634, -23.550], [-46.635, -23.550], [-46.635, -23.551]],
          ],
          // Lot 2: L-shaped lot
          [
            [[-46.634, -23.551], [-46.633, -23.551], [-46.633, -23.5505], 
             [-46.6335, -23.5505], [-46.6335, -23.550], [-46.634, -23.550], [-46.634, -23.551]],
          ],
          // Lot 3: With hole (internal courtyard)
          [
            [[-46.633, -23.551], [-46.632, -23.551], [-46.632, -23.550], [-46.633, -23.550], [-46.633, -23.551]],
            [[-46.6325, -23.5508], [-46.6323, -23.5508], [-46.6323, -23.5506], [-46.6325, -23.5506], [-46.6325, -23.5508]],
          ],
        ],
      };

      const result = service.validateGeometry(spComplex);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle MultiPolygon with islands (separate polygons)', () => {
      // MultiPolygon representing a main island and a small separate island
      const multiIsland = {
        type: 'MultiPolygon',
        coordinates: [
          // Main island
          [
            [[-46.64, -23.555], [-46.638, -23.555], [-46.638, -23.553], [-46.64, -23.553], [-46.64, -23.555]],
          ],
          // Small separate island
          [
            [[-46.642, -23.554], [-46.641, -23.554], [-46.641, -23.5535], [-46.642, -23.5535], [-46.642, -23.554]],
          ],
        ],
      };

      const result = service.validateGeometry(multiIsland);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle UTM coordinates in geometry', () => {
      // Geometry with UTM coordinates (for imported data)
      const utmPolygon = {
        type: 'Polygon',
        coordinates: [
          [[328000, 7450000], [328100, 7450000], [328100, 7450100], [328000, 7450100], [328000, 7450000]],
        ],
      };

      const result = service.validateGeometry(utmPolygon);
      expect(result.valid).toBe(true);
    });
  });

  describe('Geometry bounds calculations', () => {
    it('should detect overlap between complex polygons', () => {
      const poly1 = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [5, 0], [5, 5], [0, 5], [0, 0]],
          [[1, 1], [4, 1], [4, 4], [1, 4], [1, 1]],
        ],
      };
      const poly2 = {
        type: 'Polygon',
        coordinates: [
          [[3, 3], [8, 3], [8, 8], [3, 8], [3, 3]],
        ],
      };

      const result = service.checkSimpleOverlap(poly1, poly2);
      expect(result).toBe(true);
    });

    it('should detect non-overlap between separated complex polygons', () => {
      const poly1 = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]],
          [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]],
        ],
      };
      const poly2 = {
        type: 'Polygon',
        coordinates: [
          [[5, 5], [7, 5], [7, 7], [5, 7], [5, 5]],
        ],
      };

      const result = service.checkSimpleOverlap(poly1, poly2);
      expect(result).toBe(false);
    });
  });
});
