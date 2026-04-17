import geojsonvt from 'geojson-vt';
import * as vtpbf from 'vt-pbf';

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<Record<string, unknown>>;
};

export function createVectorTile(geojson: GeoJsonFeatureCollection, z: number, x: number, y: number): Buffer {
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
    // Return empty protocol buffer
    return Buffer.from('');
  }

  const buff = vtpbf.fromGeojsonVt({ layer: tile as unknown as ReturnType<typeof geojsonvt> });
  return Buffer.from(buff);
}
