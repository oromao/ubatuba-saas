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
const gis_service_1 = require("./gis.service");
let GisController = class GisController {
    constructor(gisService) {
        this.gisService = gisService;
    }
    async bboxQuery(req, projectId, bboxRaw, limitRaw) {
        if (!bboxRaw) {
            return {
                type: 'FeatureCollection',
                features: [],
                total: 0,
                limit: 1000,
                error: 'bbox parameter required. Format: minLng,minLat,maxLng,maxLat',
            };
        }
        const bboxCoords = bboxRaw.split(',').map(Number);
        if (bboxCoords.length !== 4 || bboxCoords.some(isNaN)) {
            return {
                type: 'FeatureCollection',
                features: [],
                total: 0,
                limit: 1000,
                error: 'Invalid bbox format. Expected: minLng,minLat,maxLng,maxLat',
            };
        }
        const bbox = bboxCoords;
        if (bbox[0] < -180 || bbox[0] > 180 || bbox[2] < -180 || bbox[2] > 180) {
            return {
                type: 'FeatureCollection',
                features: [],
                total: 0,
                limit: 1000,
                error: 'Invalid longitude values. Must be between -180 and 180',
            };
        }
        if (bbox[1] < -90 || bbox[1] > 90 || bbox[3] < -90 || bbox[3] > 90) {
            return {
                type: 'FeatureCollection',
                features: [],
                total: 0,
                limit: 1000,
                error: 'Invalid latitude values. Must be between -90 and 90',
            };
        }
        const limit = limitRaw ? parseInt(limitRaw, 10) : 1000;
        return this.gisService.queryBboxViewport({
            tenantId: req.tenantId,
            projectId,
            bbox,
            limit: Math.min(limit, 1000),
        });
    }
    async convertCoordinate(fromRaw, toRaw, xRaw, yRaw) {
        const fromEPSG = parseInt(fromRaw, 10);
        const toEPSG = parseInt(toRaw, 10);
        const x = parseFloat(xRaw);
        const y = parseFloat(yRaw);
        if (isNaN(fromEPSG) || isNaN(toEPSG)) {
            return { error: 'Invalid EPSG codes. from and to parameters must be numbers' };
        }
        if (isNaN(x) || isNaN(y)) {
            return { error: 'Invalid coordinates. x and y parameters must be numbers' };
        }
        try {
            return this.gisService.transformCoordinate({ x, y }, fromEPSG, toEPSG);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { error: message };
        }
    }
    async batchConvertCoordinate(body) {
        const { from, to, coordinates } = body;
        if (!Array.isArray(coordinates)) {
            return { error: 'coordinates must be an array' };
        }
        if (coordinates.length === 0) {
            return { results: [] };
        }
        try {
            const results = coordinates.map((coord) => this.gisService.transformCoordinate(coord, from, to));
            return { results };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { error: message };
        }
    }
    async getMvtTile(z, x, y, req, projectId, res) {
        try {
            const zNum = parseInt(z, 10);
            const xNum = parseInt(x, 10);
            const yNum = parseInt(y, 10);
            if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
                res.status(400).json({ error: 'Invalid tile coordinates' });
                return;
            }
            if (!projectId) {
                res.status(400).json({ error: 'projectId is required' });
                return;
            }
            const buffer = await this.gisService.getMvtTile(zNum, xNum, yNum, req.tenantId, projectId);
            res.set({
                'Content-Type': 'application/x-protobuf',
                'Content-Encoding': 'identity',
            });
            res.send(buffer);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: message });
        }
    }
    async getTileMetadata(zRaw, xRaw, yRaw) {
        const z = parseInt(zRaw, 10);
        const x = parseInt(xRaw, 10);
        const y = parseInt(yRaw, 10);
        if (isNaN(z) || isNaN(x) || isNaN(y)) {
            return { error: 'Invalid tile coordinates' };
        }
        const bbox = this.gisService.tileToBbox(z, x, y);
        return {
            z,
            x,
            y,
            bbox,
            bounds: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
        };
    }
};
exports.GisController = GisController;
__decorate([
    (0, common_1.Get)('bbox'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], GisController.prototype, "bboxQuery", null);
__decorate([
    (0, common_1.Get)('convert'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('x')),
    __param(3, (0, common_1.Query)('y')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], GisController.prototype, "convertCoordinate", null);
__decorate([
    (0, common_1.Post)('convert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GisController.prototype, "batchConvertCoordinate", null);
__decorate([
    (0, common_1.Get)('tiles/:z/:x/:y.pbf'),
    __param(0, (0, common_1.Param)('z')),
    __param(1, (0, common_1.Param)('x')),
    __param(2, (0, common_1.Param)('y')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Query)('projectId')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], GisController.prototype, "getMvtTile", null);
__decorate([
    (0, common_1.Get)('tiles/metadata'),
    __param(0, (0, common_1.Query)('z')),
    __param(1, (0, common_1.Query)('x')),
    __param(2, (0, common_1.Query)('y')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GisController.prototype, "getTileMetadata", null);
exports.GisController = GisController = __decorate([
    (0, common_1.Controller)('gis'),
    __metadata("design:paramtypes", [gis_service_1.GisService])
], GisController);
//# sourceMappingURL=gis.controller.js.map