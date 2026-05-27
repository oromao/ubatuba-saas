"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBbox = parseBbox;
exports.buildGeoIntersectsPolygon = buildGeoIntersectsPolygon;
function parseBbox(value) {
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
function buildGeoIntersectsPolygon(minLng, minLat, maxLng, maxLat) {
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
//# sourceMappingURL=bbox.js.map