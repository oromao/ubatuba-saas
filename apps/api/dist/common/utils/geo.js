"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPolygonGeometry = isPolygonGeometry;
exports.isLineGeometry = isLineGeometry;
exports.isPointGeometry = isPointGeometry;
exports.calculateGeometryArea = calculateGeometryArea;
const area_1 = require("@turf/area");
function isPolygonGeometry(value) {
    if (!value || typeof value !== 'object')
        return false;
    const geometry = value;
    return ((geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') &&
        Array.isArray(geometry.coordinates));
}
function isLineGeometry(value) {
    if (!value || typeof value !== 'object')
        return false;
    const geometry = value;
    return geometry.type === 'LineString' && Array.isArray(geometry.coordinates);
}
function isPointGeometry(value) {
    if (!value || typeof value !== 'object')
        return false;
    const geometry = value;
    return geometry.type === 'Point' && Array.isArray(geometry.coordinates);
}
function calculateGeometryArea(geometry) {
    return (0, area_1.default)({
        type: 'Feature',
        geometry,
        properties: {},
    });
}
//# sourceMappingURL=geo.js.map