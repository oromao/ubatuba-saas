"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAD69_UTM_ZONES = exports.SIRGAS_2000_UTM_ZONES = exports.CRS_WEB_MERCATOR = exports.CRS_SAD69_UTM_24S = exports.CRS_SAD69_UTM_23S = exports.CRS_SIRGAS2000_UTM_24S = exports.CRS_SIRGAS2000_UTM_23S = exports.CRS_WGS84 = void 0;
exports.detectCrsFromCoordinates = detectCrsFromCoordinates;
exports.convertCoordinate = convertCoordinate;
exports.convertGeometryCoordinates = convertGeometryCoordinates;
exports.isWgs84Coordinate = isWgs84Coordinate;
exports.isUtmCoordinate = isUtmCoordinate;
exports.suggestCrsForBrazil = suggestCrsForBrazil;
exports.CRS_WGS84 = 'EPSG:4326';
exports.CRS_SIRGAS2000_UTM_23S = 'EPSG:31983';
exports.CRS_SIRGAS2000_UTM_24S = 'EPSG:31984';
exports.CRS_SAD69_UTM_23S = 'EPSG:29193';
exports.CRS_SAD69_UTM_24S = 'EPSG:29194';
exports.CRS_WEB_MERCATOR = 'EPSG:3857';
exports.SIRGAS_2000_UTM_ZONES = [exports.CRS_SIRGAS2000_UTM_23S, exports.CRS_SIRGAS2000_UTM_24S];
exports.SAD69_UTM_ZONES = [exports.CRS_SAD69_UTM_23S, exports.CRS_SAD69_UTM_24S];
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}
const A = 6378137.0;
const F = 1 / 298.257223563;
const K0 = 0.9996;
const E = Math.sqrt(2 * F - F * F);
const E_PRIME_SQ = (E * E) / (1 - E * E);
function utmToLatLong(easting, northing, zoneNumber, southernHemisphere) {
    const e1 = (1 - Math.sqrt(1 - E * E)) / (1 + Math.sqrt(1 - E * E));
    let M = northing;
    if (!southernHemisphere) {
        M = northing - 10000000;
    }
    const mu = M / (A * K0 * (1 - E * E / 4 - 3 * E * E * E * E / 64 - 5 * E * E * E * E * E * E / 256));
    const phi1 = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) +
        (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) +
        (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
    const N1 = A / Math.sqrt(1 - E * E * Math.sin(phi1) * Math.sin(phi1));
    const T1 = Math.tan(phi1) * Math.tan(phi1);
    const C1 = E_PRIME_SQ * Math.cos(phi1) * Math.cos(phi1);
    const R1 = A * (1 - E * E) / Math.pow(1 - E * E * Math.sin(phi1) * Math.sin(phi1), 1.5);
    const D = easting / (N1 * K0);
    let lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * E_PRIME_SQ) * D * D * D * D / 24 +
        (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * E_PRIME_SQ - 3 * C1 * C1) * D * D * D * D * D * D / 720);
    let lng = (D - (1 + 2 * T1 + C1) * D * D * D / 6 +
        (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * E_PRIME_SQ + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1);
    const centralLongitude = ((zoneNumber - 1) * 6 - 180) + 3;
    lng += centralLongitude;
    return [lng, lat];
}
function latLongToUtm(lat, lng) {
    const zoneNumber = Math.floor((lng + 180) / 6) + 1;
    const centralLongitude = (zoneNumber - 1) * 6 - 180 + 3;
    const latRad = degreesToRadians(lat);
    const lngRad = degreesToRadians(lng);
    const lngOriginRad = degreesToRadians(centralLongitude);
    const N = A / Math.sqrt(1 - E * E * Math.sin(latRad) * Math.sin(latRad));
    const T = Math.tan(latRad) * Math.tan(latRad);
    const C = E_PRIME_SQ * Math.cos(latRad) * Math.cos(latRad);
    const A_coord = Math.cos(latRad) * (lngRad - lngOriginRad);
    const M = A * ((1 - E * E / 4 - 3 * E * E * E * E / 64 - 5 * E * E * E * E * E * E / 256) * latRad -
        (3 * E * E / 8 + 3 * E * E * E * E / 32 + 45 * E * E * E * E * E * E / 1024) * Math.sin(2 * latRad) +
        (15 * E * E * E * E / 256 + 45 * E * E * E * E * E * E / 1024) * Math.sin(4 * latRad) -
        (35 * E * E * E * E * E * E / 3072) * Math.sin(6 * latRad));
    let easting = K0 * N * (A_coord + (1 - T + C) * A_coord * A_coord * A_coord / 6 +
        (5 - 18 * T + T * T + 72 * C - 58 * E_PRIME_SQ) * A_coord * A_coord * A_coord * A_coord * A_coord / 120) + 500000;
    let northing = K0 * (M + N * Math.tan(latRad) * (A_coord * A_coord / 2 +
        (5 - T + 9 * C + 4 * C * C) * A_coord * A_coord * A_coord * A_coord / 24 +
        (61 - 58 * T + T * T + 600 * C - 330 * E_PRIME_SQ) * A_coord * A_coord * A_coord * A_coord * A_coord * A_coord / 720));
    if (lat < 0) {
        northing += 10000000;
    }
    return { easting, northing, zoneNumber };
}
function detectCrsFromCoordinates(coordinates) {
    const [x, y] = coordinates;
    if (typeof x !== 'number' || typeof y !== 'number') {
        return {
            detectedCrs: null,
            confidence: 'low',
            reasoning: 'Coordinates format not recognized',
        };
    }
    const isWithinWgs84Bounds = x >= -180 && x <= 180 && y >= -90 && y <= 90;
    const isWithinBrazilBounds = x >= -74 && x <= -34 && y >= -34 && y <= 5;
    const isUtmBrazilZone23 = x >= 100000 && x <= 900000 && y >= 7000000 && y <= 11000000;
    const isUtmBrazilZone24 = x >= 100000 && x <= 900000 && y >= 7000000 && y <= 11000000;
    const isUtmRange = x >= 100000 && x <= 1000000 && y >= 1000000 && y <= 10000000;
    if (isWithinWgs84Bounds && isWithinBrazilBounds) {
        return {
            detectedCrs: exports.CRS_WGS84,
            confidence: 'high',
            reasoning: `Coordinates within Brazil WGS84 bounds: (${x.toFixed(2)}, ${y.toFixed(2)})`,
        };
    }
    if (isUtmBrazilZone23) {
        return {
            detectedCrs: exports.CRS_SIRGAS2000_UTM_23S,
            confidence: 'medium',
            reasoning: `UTM coordinates detected in valid range for zone 23S: (${x.toFixed(0)}, ${y.toFixed(0)})`,
        };
    }
    if (isUtmBrazilZone24) {
        return {
            detectedCrs: exports.CRS_SIRGAS2000_UTM_24S,
            confidence: 'medium',
            reasoning: `UTM coordinates detected in valid range for zone 24S: (${x.toFixed(0)}, ${y.toFixed(0)})`,
        };
    }
    if (isUtmRange) {
        return {
            detectedCrs: null,
            confidence: 'low',
            reasoning: `Coordinates appear to be UTM but zone cannot be determined: (${x.toFixed(0)}, ${y.toFixed(0)})`,
        };
    }
    if (!isWithinWgs84Bounds && !isUtmRange) {
        return {
            detectedCrs: null,
            confidence: 'low',
            reasoning: `Coordinates outside both WGS84 and UTM ranges: (${x.toFixed(2)}, ${y.toFixed(2)})`,
        };
    }
    return {
        detectedCrs: exports.CRS_WGS84,
        confidence: 'low',
        reasoning: `Assume WGS84 by default: (${x.toFixed(2)}, ${y.toFixed(2)})`,
    };
}
function convertCoordinate(coordinate, fromCrs, toCrs = exports.CRS_WGS84) {
    const [x, y] = coordinate;
    if (fromCrs === toCrs) {
        return { success: true, converted: coordinate };
    }
    if (fromCrs === exports.CRS_WGS84 && (toCrs === exports.CRS_SIRGAS2000_UTM_23S || toCrs === exports.CRS_SAD69_UTM_23S)) {
        const result = latLongToUtm(y, x);
        if (result.zoneNumber === 23) {
            return { success: true, converted: [result.easting, result.northing] };
        }
        return { success: false, error: `Coordinate zone (${result.zoneNumber}) does not match target CRS (zone 23)` };
    }
    if (fromCrs === exports.CRS_WGS84 && (toCrs === exports.CRS_SIRGAS2000_UTM_24S || toCrs === exports.CRS_SAD69_UTM_24S)) {
        const result = latLongToUtm(y, x);
        if (result.zoneNumber === 24) {
            return { success: true, converted: [result.easting, result.northing] };
        }
        return { success: false, error: `Coordinate zone (${result.zoneNumber}) does not match target CRS (zone 24)` };
    }
    if ((fromCrs === exports.CRS_SIRGAS2000_UTM_23S || fromCrs === exports.CRS_SAD69_UTM_23S) && toCrs === exports.CRS_WGS84) {
        const result = utmToLatLong(x, y, 23, true);
        return { success: true, converted: result };
    }
    if ((fromCrs === exports.CRS_SIRGAS2000_UTM_24S || fromCrs === exports.CRS_SAD69_UTM_24S) && toCrs === exports.CRS_WGS84) {
        const result = utmToLatLong(x, y, 24, true);
        return { success: true, converted: result };
    }
    if ((fromCrs === exports.CRS_SIRGAS2000_UTM_23S || fromCrs === exports.CRS_SAD69_UTM_23S) && (toCrs === exports.CRS_SIRGAS2000_UTM_24S || toCrs === exports.CRS_SAD69_UTM_24S)) {
        const wgs84 = utmToLatLong(x, y, 23, true);
        const result = latLongToUtm(wgs84[1], wgs84[0]);
        if (result.zoneNumber === 24) {
            return { success: true, converted: [result.easting, result.northing] };
        }
        return { success: false, error: `Conversion between zones not supported directly` };
    }
    return { success: false, error: `CRS conversion from ${fromCrs} to ${toCrs} not supported` };
}
function convertGeometryCoordinates(geometry, fromCrs, toCrs = exports.CRS_WGS84) {
    if (fromCrs === toCrs)
        return geometry;
    try {
        if (geometry.type === 'Point') {
            const result = convertCoordinate(geometry.coordinates, fromCrs, toCrs);
            if (!result.success || !result.converted)
                return null;
            return { type: 'Point', coordinates: result.converted };
        }
        if (geometry.type === 'LineString') {
            const coords = geometry.coordinates;
            const converted = coords
                .map((c) => convertCoordinate(c, fromCrs, toCrs))
                .filter((r) => r.success && r.converted)
                .map((r) => r.converted);
            if (converted.length !== coords.length)
                return null;
            return { type: 'LineString', coordinates: converted };
        }
        if (geometry.type === 'Polygon') {
            const rings = geometry.coordinates;
            const convertedRings = rings.map((ring) => {
                const converted = ring
                    .map((c) => convertCoordinate(c, fromCrs, toCrs))
                    .filter((r) => r.success && r.converted)
                    .map((r) => r.converted);
                if (converted.length !== ring.length)
                    return null;
                return converted;
            });
            if (convertedRings.some((r) => r === null))
                return null;
            return { type: 'Polygon', coordinates: convertedRings };
        }
        if (geometry.type === 'MultiPolygon') {
            const polys = geometry.coordinates;
            const convertedPolys = polys.map((poly) => {
                const rings = poly;
                const convertedRings = rings.map((ring) => {
                    const converted = ring
                        .map((c) => convertCoordinate(c, fromCrs, toCrs))
                        .filter((r) => r.success && r.converted)
                        .map((r) => r.converted);
                    if (converted.length !== ring.length)
                        return null;
                    return converted;
                });
                if (convertedRings.some((r) => r === null))
                    return null;
                return convertedRings;
            });
            if (convertedPolys.some((p) => p === null))
                return null;
            return { type: 'MultiPolygon', coordinates: convertedPolys };
        }
        return null;
    }
    catch {
        return null;
    }
}
function isWgs84Coordinate(coord) {
    const [lng, lat] = coord;
    return typeof lng === 'number' && typeof lat === 'number' &&
        lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}
function isUtmCoordinate(coord) {
    const [x, y] = coord;
    return typeof x === 'number' && typeof y === 'number' &&
        x >= 100000 && x <= 1000000 && y >= 1000000 && y <= 10000000;
}
function suggestCrsForBrazil(coordinates) {
    const result = detectCrsFromCoordinates(coordinates);
    if (result.detectedCrs && result.confidence !== 'low') {
        return result.detectedCrs;
    }
    return exports.CRS_WGS84;
}
//# sourceMappingURL=crs.js.map