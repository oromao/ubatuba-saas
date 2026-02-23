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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayersService = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("../shared/cache.service");
const layers_repository_1 = require("./layers.repository");
let LayersService = class LayersService {
    constructor(layersRepository, cacheService) {
        this.layersRepository = layersRepository;
        this.cacheService = cacheService;
    }
    buildGeoserverTileUrl(workspace, layerName) {
        const base = (process.env.GEOSERVER_PUBLIC_URL ?? process.env.GEOSERVER_URL ?? '').replace(/\/$/, '');
        if (!base) {
            return null;
        }
        const serviceUrl = `${base}/wms`;
        return `${serviceUrl}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=${workspace}:${layerName}&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;
    }
    buildLegendUrl(workspace, layerName) {
        const base = (process.env.GEOSERVER_PUBLIC_URL ?? process.env.GEOSERVER_URL ?? '').replace(/\/$/, '');
        if (!base) {
            return null;
        }
        const serviceUrl = `${base}/wms`;
        return `${serviceUrl}?SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=${workspace}:${layerName}`;
    }
    toResponse(layer) {
        const plain = layer.toObject();
        const response = {
            ...plain,
            id: String(plain._id),
        };
        if (layer.source === 'geoserver' && layer.geoserver) {
            response.tileUrl = this.buildGeoserverTileUrl(layer.geoserver.workspace, layer.geoserver.layerName) ?? undefined;
            response.legendUrl = this.buildLegendUrl(layer.geoserver.workspace, layer.geoserver.layerName) ?? undefined;
        }
        return response;
    }
    async list(tenantId) {
        const cacheKey = `layers:${tenantId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const layers = await this.layersRepository.list(tenantId);
        const data = layers.map((layer) => this.toResponse(layer));
        await this.cacheService.set(cacheKey, data, 30);
        return data;
    }
    async update(tenantId, id, dto) {
        const updated = await this.layersRepository.update(tenantId, id, dto);
        await this.cacheService.invalidateByPrefix(`layers:${tenantId}`);
        return updated;
    }
};
exports.LayersService = LayersService;
exports.LayersService = LayersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [layers_repository_1.LayersRepository,
        cache_service_1.CacheService])
], LayersService);
//# sourceMappingURL=layers.service.js.map