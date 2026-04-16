import { Injectable } from '@nestjs/common';

export type GeometryValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  calculatedArea?: number;
};

@Injectable()
export class GeometryService {
  validateGeometry(geometry: any): GeometryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!geometry) {
      return { valid: false, errors: ['Geometria ausente'], warnings: [] };
    }

    if (!geometry.type) {
      errors.push('Tipo de geometria não definido');
    }

    if (!['Polygon', 'MultiPolygon', 'Point'].includes(geometry.type)) {
      errors.push(`Tipo inválido: ${geometry.type}. Use Polygon, MultiPolygon ou Point`);
    }

    if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
      errors.push('Coordenadas ausentes ou inválidas');
      return { valid: errors.length === 0, errors, warnings };
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

  private calculatePolygonArea(coordinates: number[][]): number {
    const EARTH_RADIUS = 6371000;
    let area = 0;
    const n = coordinates.length;
    for (let i = 0; i < n - 1; i++) {
      const [lon1, lat1] = coordinates[i].map((d: number) => d * Math.PI / 180);
      const [lon2, lat2] = coordinates[i + 1].map((d: number) => d * Math.PI / 180);
      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    return Math.abs(area * EARTH_RADIUS * EARTH_RADIUS / 2);
  }

  checkSimpleOverlap(geom1: any, geom2: any): boolean {
    if (!geom1?.coordinates || !geom2?.coordinates) return false;
    const bbox1 = this.getBoundingBox(geom1.coordinates[0] || []);
    const bbox2 = this.getBoundingBox(geom2.coordinates[0] || []);
    if (!bbox1 || !bbox2) return false;
    return !(
      bbox1.maxLng < bbox2.minLng ||
      bbox2.maxLng < bbox1.minLng ||
      bbox1.maxLat < bbox2.minLat ||
      bbox2.maxLat < bbox1.minLat
    );
  }

  private getBoundingBox(coords: number[][]) {
    if (!coords || coords.length === 0) return null;
    return {
      minLng: Math.min(...coords.map((c) => c[0])),
      maxLng: Math.max(...coords.map((c) => c[0])),
      minLat: Math.min(...coords.map((c) => c[1])),
      maxLat: Math.max(...coords.map((c) => c[1])),
    };
  }
}
