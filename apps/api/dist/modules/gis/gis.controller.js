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
exports.GisController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gis_service_1 = require("./gis.service");
let GisController = class GisController {
    constructor(gisService) {
        this.gisService = gisService;
    }
    convertCoordinate(fromEPSG, toEPSG, x, y) {
        return this.gisService.transformCoordinate({ x, y }, fromEPSG, toEPSG);
    }
    batchConvertCoordinates(body) {
        const { from, to, coordinates } = body;
        return this.gisService.transformCoordinates(coordinates, from, to).map((output, index) => ({
            fromEPSG: from,
            toEPSG: to,
            input: coordinates[index],
            output,
        }));
    }
    async queryBbox(tenantId, projectId, minLng, minLat, maxLng, maxLat, limit) {
        const bbox = [minLng, minLat, maxLng, maxLat];
        return this.gisService.queryBboxViewport({
            tenantId,
            projectId,
            bbox,
            limit,
        });
    }
    async queryViewport(tenantId, projectId, bbox, limit) {
        const coords = bbox.split(',').map(parseFloat);
        if (coords.length !== 4) {
            throw new Error('Invalid bbox format. Expected: minLng,minLat,maxLng,maxLat');
        }
        return this.gisService.queryBboxViewport({
            tenantId,
            projectId,
            bbox: coords,
            limit,
        });
    }
    async getMvtTile(z, x, y, tenantId, projectId) {
        return this.gisService.getMvtTile(z, x, y, tenantId, projectId);
    }
};
exports.GisController = GisController;
__decorate([
    (0, common_1.Get)('convert'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Convert coordinates between CRS systems',
        description: 'Converts coordinates between supported CRS systems. Currently supports: WGS84 (EPSG:4326) <-> UTM 23S (EPSG:31983). For UTM to WGS84: provide easting as x, northing as y. For WGS84 to UTM: provide longitude as x, latitude as y.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true, description: 'Source EPSG code (e.g., 4326 for WGS84, 31983 for UTM 23S)' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true, description: 'Target EPSG code (e.g., 4326 for WGS84, 31983 for UTM 23S)' }),
    (0, swagger_1.ApiQuery)({ name: 'x', required: true, description: 'X coordinate (longitude for WGS84, easting for UTM)' }),
    (0, swagger_1.ApiQuery)({ name: 'y', required: true, description: 'Y coordinate (latitude for WGS84, northing for UTM)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Coordinate transformation result',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or unsupported CRS conversion',
    }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('x')),
    __param(3, (0, common_1.Query)('y')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Number]),
    __metadata("design:returntype", Object)
], GisController.prototype, "convertCoordinate", null);
__decorate([
    (0, common_1.Post)('convert/batch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Batch convert coordinates between CRS systems',
        description: 'Converts multiple coordinates between supported CRS systems.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Array of coordinate transformation results',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters or unsupported CRS conversion',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], GisController.prototype, "batchConvertCoordinates", null);
__decorate([
    (0, common_1.Get)('bbox'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Query parcels within a viewport bbox',
        description: 'Returns parcels that intersect with the given bounding box. Uses MongoDB $geoIntersects with 2dsphere index. Default limit: 1000 features for performance.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true, description: 'Tenant ID' }),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: true, description: 'Project ID' }),
    (0, swagger_1.ApiQuery)({ name: 'minLng', required: true, description: 'Minimum longitude' }),
    (0, swagger_1.ApiQuery)({ name: 'minLat', required: true, description: 'Minimum latitude' }),
    (0, swagger_1.ApiQuery)({ name: 'maxLng', required: true, description: 'Maximum longitude' }),
    (0, swagger_1.ApiQuery)({ name: 'maxLat', required: true, description: 'Maximum latitude' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Maximum number of results (default: 1000, max: 1000)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'GeoJSON FeatureCollection with parcels in the bbox',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid bbox coordinates',
    }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('minLng')),
    __param(3, (0, common_1.Query)('minLat')),
    __param(4, (0, common_1.Query)('maxLng')),
    __param(5, (0, common_1.Query)('maxLat')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], GisController.prototype, "queryBbox", null);
__decorate([
    (0, common_1.Get)('viewport'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Query parcels within a viewport (alias for bbox)',
        description: 'Same as /gis/bbox but with different parameter names for compatibility.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true, description: 'Tenant ID' }),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: true, description: 'Project ID' }),
    (0, swagger_1.ApiQuery)({ name: 'bbox', required: true, description: 'Bounding box as comma-separated values: minLng,minLat,maxLng,maxLat' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Maximum number of results' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], GisController.prototype, "queryViewport", null);
__decorate([
    (0, common_1.Get)('tiles/:z/:x/:y.pbf'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Header)('Content-Type', 'application/x-protobuf'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get MVT vector tile for a given tile coordinate',
        description: 'Returns a Mapbox Vector Tile (MVT) in protobuf format for the specified tile at zoom level z, and tile coordinates x, y.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true, description: 'Tenant ID' }),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: true, description: 'Project ID' }),
    __param(0, (0, common_1.Param)('z')),
    __param(1, (0, common_1.Param)('x')),
    __param(2, (0, common_1.Param)('y')),
    __param(3, (0, common_1.Query)('tenantId')),
    __param(4, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], GisController.prototype, "getMvtTile", null);
exports.GisController = GisController = __decorate([
    (0, swagger_1.ApiTags)('GIS'),
    (0, common_1.Controller)('gis'),
    __metadata("design:paramtypes", [gis_service_1.GisService])
], GisController);
//# sourceMappingURL=gis.controller.js.map