import area from '@turf/area';

export type PolygonGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
};

export type LineGeometry = {
  type: 'LineString';
  coordinates: [number, number][];
};

export type PointGeometry = {
  type: 'Point';
  coordinates: [number, number];
};

export function isPolygonGeometry(value: unknown): value is PolygonGeometry {
  if (!value || typeof value !== 'object') return false;
  const geometry = value as PolygonGeometry;
  return (
    (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') &&
    Array.isArray(geometry.coordinates)
  );
}

export function isLineGeometry(value: unknown): value is LineGeometry {
  if (!value || typeof value !== 'object') return false;
  const geometry = value as LineGeometry;
  return geometry.type === 'LineString' && Array.isArray(geometry.coordinates);
}

export function isPointGeometry(value: unknown): value is PointGeometry {
  if (!value || typeof value !== 'object') return false;
  const geometry = value as PointGeometry;
  return geometry.type === 'Point' && Array.isArray(geometry.coordinates);
}

export function calculateGeometryArea(geometry: PolygonGeometry): number {
  // Assumes SRID 4326 (WGS84) and uses Turf's planar area approximation.
  return area({
    type: 'Feature',
    geometry,
    properties: {},
  });
}
