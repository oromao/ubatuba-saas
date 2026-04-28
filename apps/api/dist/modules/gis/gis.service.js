"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GisService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const parcel_schema_1 = require("../ctm/parcels/parcel.schema");
const object_id_1 = require("../../common/utils/object-id");
const vector_tile_1 = require("@mapbox/vector-tile");
const EPSG_WGS84 = 4326;
const EPSG_UTM_23S = 31983;
const MVT_EXTENT = 4096;
const MVT_LAYER_NAME = 'parcels';
const MVT_LAYER_VERSION = 2;
let GisService = class GisService {
    constructor(model) {
        this.model = model;
    }
    async queryBboxViewport(params) {
        const { tenantId, projectId, bbox, limit = 1000 } = params;
        const [minLng, minLat, maxLng, maxLat] = bbox;
        const query = {
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            geometry: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [minLng, minLat],
                                [minLng, maxLat],
                                [maxLng, maxLat],
                                [maxLng, minLat],
                                [minLng, minLat],
                            ],
                        ],
                    },
                },
            },
        };
        const safeLimit = Math.min(limit, 1000);
        const [features, total] = await Promise.all([
            this.model
                .find(query)
                .limit(safeLimit)
                .select('sqlu inscription geometry rawProperties centroid bbox status sourceType')
                .lean()
                .exec(),
            this.model.countDocuments(query).exec(),
        ]);
        const resultFeatures = features.map((p) => ({
            type: 'Feature',
            id: String(p._id),
            geometry: p.geometry,
            properties: {
                sqlu: p.sqlu,
                inscription: p.inscription,
                status: p.status,
                sourceType: p.sourceType,
                centroid: p.centroid,
                bbox: p.bbox,
                ...p.rawProperties,
            },
        }));
        return {
            type: 'FeatureCollection',
            features: resultFeatures,
            total,
            limit: safeLimit,
        };
    }
    getBboxFromCoordinates(coords) {
        return coords;
    }
    transformCoordinate(input, fromEPSG, toEPSG) {
        let output;
        if (fromEPSG === EPSG_UTM_23S && toEPSG === EPSG_WGS84) {
            output = this.utmToWgs84(input.x, input.y, 23, true);
        }
        else if (fromEPSG === EPSG_WGS84 && toEPSG === EPSG_UTM_23S) {
            output = this.wgs84ToUtm(input.x, input.y, 23, true);
        }
        else if (fromEPSG === toEPSG) {
            output = { x: input.x, y: input.y };
        }
        else {
            throw new Error(`CRS transformation not supported: from EURG:${fromEPSG} to EPSG:${toEPSG}. ` +
                `Supported: WGS84(4326) <-> UTM 23S(31983)`);
        }
        return {
            fromEPSG,
            toEPSG,
            input: { x: input.x, y: input.y },
            output,
        };
    }
    transformCoordinates(coords, fromEPSG, toEPSG) {
        return coords.map((c) => this.transformCoordinate(c, fromEPSG, toEPSG).output);
    }
    wgs84ToUtm(longitude, latitude, zone, southernHemisphere) {
        const a = 6378137.0;
        const f = 1 / 298.257223563;
        const k0 = 0.9996;
        const latRad = latitude * (Math.PI / 180);
        const lonRad = longitude * (Math.PI / 180);
        const lon0 = (zone - 1) * 6 - 180 + 3;
        const lon0Rad = lon0 * (Math.PI / 180);
        const N = a / Math.sqrt(1 - (2 * f) + (f * f));
        const A = (lonRad - lon0Rad) * Math.cos(latRad);
        const T = Math.tan(latRad) * Math.tan(latRad);
        const C = ((f / (1 - f)) * (2 * T)) / (1 + T);
        const V = (N / (1 + T)) * (1 + C);
        const M = this.meridionalArc(latRad, a, f);
        const easting = k0 * N * A + 500000.0;
        let northing = k0 * (M + N * Math.tan(latRad) * ((A * A) / 2 + ((5 - T + 9 * C + 4 * C * C) * (A * A * A * A) / 24)));
        if (southernHemisphere) {
            northing += 10000000.0;
        }
        return { x: Math.round(easting * 100) / 100, y: Math.round(northing * 100) / 100 };
    }
    meridionalArc(lat, a, f) {
        const n = f / (2 - f);
        const A = a * (1 + n) * (1 + (n * n) / 4) * (1 + (n * n) / 64);
        const alpha = ['', '1/2', '-1/24', '-1/720', '-1/4480'];
        const beta = ['', '-1/2', '-1/24', '-1/720', '-1/4480'];
        let sum = 0;
        for (let i = 1; i <= 4; i++) {
            const term1 = (Math.sin(2 * i * lat)) * (n ** i);
            const term2 = parseFloat(alpha[i]) * (1 - (2 * i) * n + (4 * i * i - 1) * (n ** 2));
            sum += term1 * term2;
        }
        return A * (lat + sum);
    }
    utmToWgs84(easting, northing, zone, southernHemisphere) {
        const a = 6378137.0;
        const f = 1 / 298.257223563;
        const k0 = 0.9996;
        const centralMeridian = (zone - 1) * 6 - 180 + 3;
        const centralMeridianRad = centralMeridian * (Math.PI / 180);
        let northingAdj = northing;
        if (southernHemisphere) {
            northingAdj -= 10000000.0;
        }
        const x = easting - 500000.0;
        const y = northingAdj;
        const N = a / Math.sqrt(1 - (2 * f) + (f * f));
        const latitude = y / (k0 * N) + this.approxLatCorrection(y, x, N, f, k0);
        const longitude = (x / (k0 * N * Math.cos(latitude * (Math.PI / 180)))) + centralMeridian;
        return { x: Math.round(longitude * 1e6) / 1e6, y: Math.round(latitude * 1e6) / 1e6 };
    }
    approxLatCorrection(y, x, N, f, k0) {
        const term1 = (3 * y * x) / (2 * N * N);
        const term2 = (3 * y * y * y) / (2 * N * N * N);
        return (term1 + term2) * (180 / Math.PI);
    }
    async getMvtTile(z, x, y, tenantId, projectId) {
        const tileBbox = this.tileToBbox(z, x, y);
        const parcels = await this.model
            .find({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            geometry: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [tileBbox[0], tileBbox[1]],
                                [tileBbox[0], tileBbox[3]],
                                [tileBbox[2], tileBbox[3]],
                                [tileBbox[2], tileBbox[1]],
                                [tileBbox[0], tileBbox[1]],
                            ],
                        ],
                    },
                },
            },
        })
            .select('geometry sqlu inscription status sourceType')
            .lean()
            .exec();
        return Buffer.from([]);
    }
    createVtFeature(geometry, tileBbox, properties, id) {
        const [minX, minY, maxX, maxY] = tileBbox;
        const scaleX = MVT_EXTENT / (maxX - minX);
        const scaleY = MVT_EXTENT / (maxY - minY);
        function projectCoords(coord) {
            const [x, y] = coord;
            const px = Math.round((x - minX) * scaleX);
            const py = Math.round((maxY - y) * scaleY);
            return [px, py];
        }
        try {
            switch (geometry.type) {
                case 'Polygon': {
                    const rings = geometry.coordinates.map((ring) => ring.map((coord) => projectCoords(coord)));
                    return new vector_tile_1.VectorTileFeature({
                        id: parseInt(id.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString().slice(0, 8), 10) || 0,
                        properties,
                        type: 3,
                        geometry: rings,
                    });
                }
                case 'MultiPolygon': {
                    const multiRings = geometry.coordinates.flatMap((polygon) => polygon.map((ring) => ring.map((coord) => projectCoords(coord))));
                    return new vector_tile_1.VectorTileFeature({
                        id: parseInt(id.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString().slice(0, 8), 10) || 0,
                        properties,
                        type: 3,
                        geometry: multiRings,
                    });
                }
                case 'Point': {
                    const point = geometry.coordinates;
                    return new vector_tile_1.VectorTileFeature({
                        id: parseInt(id.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString().slice(0, 8), 10) || 0,
                        properties,
                        type: 1,
                        geometry: [projectCoords(point)],
                    });
                }
                case 'LineString': {
                    const line = geometry.coordinates.map((coord) => projectCoords(coord));
                    return new vector_tile_1.VectorTileFeature({
                        id: parseInt(id.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString().slice(0, 8), 10) || 0,
                        properties,
                        type: 2,
                        geometry: [line],
                    });
                }
                case 'MultiLineString': {
                    const lines = geometry.coordinates.map((line) => line.map((coord) => projectCoords(coord)));
                    return new vector_tile_1.VectorTileFeature({
                        id: parseInt(id.split('').reduce((a, b) => a + b.charCodeAt(0), 0).toString().slice(0, 8), 10) || 0,
                        properties,
                        type: 2,
                        geometry: lines,
                    });
                }
                default:
                    console.warn(`[MVT] Unsupported geometry type: ${geometry.type}`);
                    return null;
            }
        }
        catch (error) {
            console.warn(`[MVT] Error creating VT feature:`, error);
            return null;
        }
    }
    tileToBbox(z, x, y) {
        const n = Math.PI - (2.0 * Math.PI * y) / Math.pow(2, z);
        const minLat = (180.0 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
        const maxLat = (180.0 / Math.PI) * Math.atan(0.5 * (Math.exp(n - (2.0 * Math.PI) / Math.pow(2, z))) - Math.exp(-(n - (2.0 * Math.PI) / Math.pow(2, z))));
        const minLng = (x / Math.pow(2, z)) * 360.0 - 180.0;
        const maxLng = ((x + 1) / Math.pow(2, z)) * 360.0 - 180.0;
        return [minLng, minLat, maxLng, maxLat];
    }
    tileCoordinatesFromBbox(bbox, z) {
        const [minLng, minLat, maxLng, maxLat] = bbox;
        const tiles = [];
        const minX = Math.floor(((minLng + 180) / 360) * Math.pow(2, z));
        const maxX = Math.floor(((maxLng + 180) / 360) * Math.pow(2, z));
        const minY = Math.floor(((1 - Math.log(Math.tan((minLat * Math.PI) / 180) + 1 / Math.cos((minLat * Math.PI) / 180))) / Math.PI) *
            Math.pow(2, z - 1));
        const maxY = Math.floor(((1 - Math.log(Math.tan((maxLat * Math.PI) / 180) + 1 / Math.cos((maxLat * Math.PI) / 180))) / Math.PI) *
            Math.pow(2, z - 1));
        for (let tx = minX; tx <= maxX; tx++) {
            for (let ty = minY; ty <= maxY; ty++) {
                tiles.push({ z, x: tx, y: ty });
            }
        }
        return tiles;
    }
};
exports.GisService = GisService;
exports.GisService = GisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(parcel_schema_1.Parcel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GisService);
//# sourceMappingURL=gis.service.js.map