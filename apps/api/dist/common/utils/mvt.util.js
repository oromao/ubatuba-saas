"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVectorTile = createVectorTile;
const geojson_vt_1 = require("geojson-vt");
const vtpbf = require("vt-pbf");
function createVectorTile(geojson, z, x, y) {
    const tileIndex = (0, geojson_vt_1.default)(geojson, {
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
    const buff = vtpbf.fromGeojsonVt({ layer: tile });
    return Buffer.from(buff);
}
//# sourceMappingURL=mvt.util.js.map