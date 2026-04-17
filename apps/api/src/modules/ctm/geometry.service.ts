import { Injectable } from '@nestjs/common';

export type GeometryValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  calculatedArea?: number;
};

type CoordinatePair = [number, number];

type PolygonGeometry = {
  type: 'Polygon';
  coordinates: CoordinatePair[][];
};

type MultiPolygonGeometry = {
  type: 'MultiPolygon';
  coordinates: CoordinatePair[][][];
};

type PointGeometry = {
  type: 'Point';
  coordinates: CoordinatePair;
};

type SupportedGeometry = PolygonGeometry | MultiPolygonGeometry | PointGeometry;

function isSupportedGeometry(geometry: unknown): geometry is SupportedGeometry {
  if (!geometry || typeof geometry !== 'object') {
    return false;
  }

  const candidate = geometry as { type?: unknown; coordinates?: unknown };
  if (!['Polygon', 'MultiPolygon', 'Point'].includes(String(candidate.type))) {
    return false;
  }

  return Array.isArray(candidate.coordinates) || candidate.type === 'Point';
}

function hasCoordinates(
  geometry: unknown,
): geometry is { coordinates: CoordinatePair[] | CoordinatePair[][] | CoordinatePair[][][] } {
  return Boolean(geometry && typeof geometry === 'object' && 'coordinates' in geometry);
}

@Injectable()
export class GeometryService {
  validateGeometry(geometry: unknown): GeometryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isSupportedGeometry(geometry)) {
      if (!geometry) {
        return { valid: false, errors: ['Geometria ausente'], warnings: [] };
      }

      errors.push('Tipo de geometria não definido');
      return { valid: false, errors, warnings };
    }

    if (!geometry.type) {
      errors.push('Tipo de geometria não definido');
    }

    if (!['Polygon', 'MultiPolygon', 'Point'].includes(geometry.type)) {
      errors.push(`Tipo inválido: ${geometry.type}. Use Polygon, MultiPolygon ou Point`);
    }

    if (!Array.isArray(geometry.coordinates)) {
      errors.push('Coordenadas ausentes ou inválidas');
      return { valid: false, errors, warnings };
    }

    if (geometry.type === 'Polygon') {
      const ring = geometry.coordinates[0];
      if (!ring || ring.length < 4) {
        errors.push('Polígono precisa de pelo menos 3 vértices + fechamento');
      } else {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          warnings.push('Polígono não está fechado — será fechado automaticamente');
        }
        const unique = new Set(ring.map((c: number[]) => `${c[0]},${c[1]}`));
        if (unique.size < 3) {
          errors.push('Polígono degenerado: vértices repetidos');
        }
      }
    }

    let calculatedArea: number | undefined;
    if (geometry.type === 'Polygon' && geometry.coordinates[0]?.length >= 3) {
      calculatedArea = this.calculatePolygonArea(geometry.coordinates[0]);
      if (calculatedArea < 1) {
        warnings.push(`Área calculada muito pequena: ${calculatedArea.toFixed(2)} m²`);
      }
      if (calculatedArea > 1000000) {
        warnings.push(`Área calculada muito grande: ${calculatedArea.toFixed(2)} m²`);
      }
    }

    return { valid: errors.length === 0, errors, warnings, calculatedArea };
  }

  private calculatePolygonArea(coordinates: CoordinatePair[]): number {
    const EARTH_RADIUS = 6371000;
    let area = 0;
    const n = coordinates.length;
    for (let i = 0; i < n - 1; i++) {
      const [lon1, lat1] = coordinates[i].map((d: number) => d * Math.PI / 180) as CoordinatePair;
      const [lon2, lat2] = coordinates[i + 1].map((d: number) => d * Math.PI / 180) as CoordinatePair;
      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    return Math.abs(area * EARTH_RADIUS * EARTH_RADIUS / 2);
  }

  checkSimpleOverlap(geom1: unknown, geom2: unknown): boolean {
    if (!hasCoordinates(geom1) || !hasCoordinates(geom2)) return false;
    const bbox1 = this.getBoundingBox((geom1.coordinates[0] ?? []) as CoordinatePair[]);
    const bbox2 = this.getBoundingBox((geom2.coordinates[0] ?? []) as CoordinatePair[]);
    if (!bbox1 || !bbox2) return false;
    return !(
      bbox1.maxLng < bbox2.minLng ||
      bbox2.maxLng < bbox1.minLng ||
      bbox1.maxLat < bbox2.minLat ||
      bbox2.maxLat < bbox1.minLat
    );
  }

  private getBoundingBox(coords: CoordinatePair[]) {
    if (!coords || coords.length === 0) return null;
    return {
      minLng: Math.min(...coords.map((c) => c[0])),
      maxLng: Math.max(...coords.map((c) => c[0])),
      minLat: Math.min(...coords.map((c) => c[1])),
      maxLat: Math.max(...coords.map((c) => c[1])),
    };
  }
}
