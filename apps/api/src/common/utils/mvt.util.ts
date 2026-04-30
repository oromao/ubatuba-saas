import geojsonvtDefault from 'geojson-vt';
import * as vtpbf from 'vt-pbf';

const geojsonvt = (geojsonvtDefault as any)?.default || geojsonvtDefault;

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<Record<string, unknown>>;
};

export function createVectorTile(geojson: GeoJsonFeatureCollection, z: number, x: number, y: number): Buffer {
  if (!geojson.features || geojson.features.length === 0) {
    return Buffer.from('');
  }

  const tileIndex = geojsonvt(geojson as unknown as Parameters<typeof geojsonvt>[0], {
    maxZoom: 24,
    tolerance: 3,
    extent: 4096,
    buffer: 64,
    debug: 0,
    lineMetrics: false,
    promoteId: null,
    generateId: false,
    indexMaxZoom: 5,
    indexMaxPoints: 100000,
  });

  const tile = tileIndex.getTile(z, x, y);

  if (!tile) {
    return Buffer.from('');
  }

  const buff = vtpbf.fromGeojsonVt({ parcels: tile } as any, { version: 2 });
  return Buffer.from(buff);
}
