export interface BboxCoords {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export type BboxString = string; // "minLng,minLat,maxLng,maxLat"

export function parseBbox(value: string | number[]): BboxCoords {
  const coords = Array.isArray(value) ? value : value.split(',').map(Number);
  if (coords.length !== 4 || coords.some(isNaN)) {
    throw new Error('bbox deve conter exatamente 4 valores numéricos: minLng,minLat,maxLng,maxLat');
  }
  const [minLng, minLat, maxLng, maxLat] = coords;
  if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) {
    throw new Error('Coordenadas bbox fora dos limites válidos (lng: -180 a 180, lat: -90 a 90)');
  }
  if (minLng >= maxLng) {
    throw new Error('bbox inválido: minLng deve ser menor que maxLng');
  }
  if (minLat >= maxLat) {
    throw new Error('bbox inválido: minLat deve ser menor que maxLat');
  }
  return { minLng, minLat, maxLng, maxLat };
}

export function buildGeoIntersectsPolygon(minLng: number, minLat: number, maxLng: number, maxLat: number) {
  return {
    $geoIntersects: {
      $geometry: {
        type: 'Polygon',
        coordinates: [[
          [minLng, minLat],
          [minLng, maxLat],
          [maxLng, maxLat],
          [maxLng, minLat],
          [minLng, minLat],
        ]],
      },
    },
  };
}
