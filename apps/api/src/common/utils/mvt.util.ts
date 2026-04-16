import geojsonvt from 'geojson-vt';
import * as vtpbf from 'vt-pbf';

export function createVectorTile(geojson: any, z: number, x: number, y: number): Buffer {
  const tileIndex = geojsonvt(geojson, {
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

  // Convert to MVT protobuf
  // 'layer' is the name of the layer inside the vector tile
  // @ts-ignore - mismatch between geojson-vt Tile and vt-pbf types in DefinitelyTyped
  const buff = vtpbf.fromGeojsonVt({ layer: tile });
  return Buffer.from(buff);
}
