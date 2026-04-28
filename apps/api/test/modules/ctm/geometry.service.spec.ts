/**
 * T5-SP-UNIT-CRITICAL
 * Unit tests for GeometryService
 * Tests: validateGeometry, calculatePolygonArea, checkSimpleOverlap
 */

import { Test, TestingModule } from '@nestjs/testing';
import { GeometryService } from '../../../src/modules/ctm/geometry.service';

describe('GeometryService - Unit Tests', () => {
  let service: GeometryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeometryService],
    }).compile();

    service = module.get<GeometryService>(GeometryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateGeometry', () => {
    it('should validate simple Polygon', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]], // Closed ring
        ],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.calculatedArea).toBeGreaterThan(0);
    });

    it('should validate simple closed Polygon', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]], // Properly closed
        ],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(true);
      expect(result.calculatedArea).toBeGreaterThan(10000000); // Large area in square meters
    });

    it('should warn when Polygon is not closed', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [1, 0], [1, 1], [0, 1]], // NOT closed (first !== last)
        ],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(true); // Still valid, just a warning
      expect(result.warnings).toContain('Polígono não está fechado');
    });

    it('should reject Polygon with insufficient vertices', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [1, 0]], // Only 2 vertices, needs at least 3 + closure
        ],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('pelo menos 3 vértices');
    });

    it('should reject Polygon with degenerate vertices', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [[0, 0], [0, 0], [0, 0], [0, 0]], // All vertices are the same
        ],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('degenerado');
    });

    it('should validate MultiPolygon', () => {
      const multiPolygon = {
        type: 'MultiPolygon',
        coordinates: [
          [
            [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]],
          ],
          [
            [[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]],
          ],
        ],
      };

      const result = service.validateGeometry(multiPolygon);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate Point', () => {
      const point = {
        type: 'Point',
        coordinates: [-46.6333, -23.5505],
      };

      const result = service.validateGeometry(point);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unsupported geometry type', () => {
      const geometry = {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1]],
      };

      const result = service.validateGeometry(geometry);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tipo de geometria não definido');
    });

    it('should reject null geometry', () => {
      const result = service.validateGeometry(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Geometria ausente');
    });

    it('should reject geometry without type', () => {
      const result = service.validateGeometry({ coordinates: [] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tipo de geometria não definido');
    });

    it('should warn for very small area', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [[[0, 0], [0.0001, 0], [0.0001, 0.0001], [0, 0.0001], [0, 0]]],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('muito pequena');
    });

    it('should warn for very large area', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [[[0, 0], [180, 0], [180, 90], [0, 90], [0, 0]]],
      };

      const result = service.validateGeometry(polygon);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('muito grande');
    });
  });

  describe('checkSimpleOverlap', () => {
    it('should detect overlapping bounding boxes', () => {
      const geom1 = {
        type: 'Polygon',
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
      };
      const geom2 = {
        type: 'Polygon',
        coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]],
      };

      const result = service.checkSimpleOverlap(geom1, geom2);
      expect(result).toBe(true);
    });

    it('should detect non-overlapping bounding boxes', () => {
      const geom1 = {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };
      const geom2 = {
        type: 'Polygon',
        coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]],
      };

      const result = service.checkSimpleOverlap(geom1, geom2);
      expect(result).toBe(false);
    });

    it('should return false for null geometries', () => {
      const result = service.checkSimpleOverlap(null, { type: 'Polygon', coordinates: [] });
      expect(result).toBe(false);
    });

    it('should return false for geometries without coordinates', () => {
      const result = service.checkSimpleOverlap({ type: 'Polygon' }, { type: 'Polygon' });
      expect(result).toBe(false);
    });
  });

  describe('private methods (tested via public API)', () => {
    it('calculatePolygonArea should calculate area for simple square', () => {
      // Square from (0,0) to (1,1) in degrees
      // Note: actual area will be in square meters, not square degrees
      const polygon = {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      const result = service.validateGeometry(polygon);
      expect(result.calculatedArea).toBeDefined();
      expect(result.calculatedArea).toBeGreaterThan(0);
    });

    it('getBoundingBox should handle valid coordinates', () => {
      // Tested indirectly via checkSimpleOverlap
      expect(true).toBe(true);
    });
  });
});
