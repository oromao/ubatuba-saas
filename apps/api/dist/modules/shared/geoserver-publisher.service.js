"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoserverPublisherService = void 0;
const common_1 = require("@nestjs/common");
let GeoserverPublisherService = class GeoserverPublisherService {
    baseUrl() {
        return (process.env.GEOSERVER_URL ?? 'http://geoserver:8080/geoserver').replace(/\/$/, '');
    }
    authHeader() {
        const user = process.env.GEOSERVER_USER ?? 'admin';
        const password = process.env.GEOSERVER_PASSWORD ?? 'geoserver';
        return `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
    }
    async geoserverRequest(path, options) {
        const response = await fetch(`${this.baseUrl()}${path}`, {
            ...options,
            headers: {
                Authorization: this.authHeader(),
                ...(options.headers ?? {}),
            },
        });
        return response;
    }
    async ensureWorkspace(workspace) {
        const exists = await this.geoserverRequest(`/rest/workspaces/${workspace}.json`, {
            method: 'GET',
        });
        if (exists.ok)
            return;
        const createResponse = await this.geoserverRequest('/rest/workspaces', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                workspace: { name: workspace },
            }),
        });
        if (!createResponse.ok) {
            throw new Error(`Nao foi possivel criar workspace ${workspace}`);
        }
    }
    async publishGeoTiff(input) {
        await this.ensureWorkspace(input.workspace);
        const upload = await this.geoserverRequest(`/rest/workspaces/${input.workspace}/coveragestores/${input.store}/file.geotiff?coverageName=${input.layerName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'image/tiff',
            },
            body: input.fileBuffer,
        });
        if (!upload.ok) {
            const body = await upload.text();
            throw new Error(`Falha ao publicar raster no GeoServer: ${upload.status} ${body}`);
        }
        const configureLayer = await this.geoserverRequest(`/rest/workspaces/${input.workspace}/coveragestores/${input.store}/coverages/${input.layerName}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coverage: {
                    name: input.layerName,
                    nativeName: input.layerName,
                    srs: 'EPSG:4326',
                    enabled: true,
                },
            }),
        });
        if (!configureLayer.ok) {
            const body = await configureLayer.text();
            throw new Error(`Falha ao configurar coverage no GeoServer: ${configureLayer.status} ${body}`);
        }
    }
};
exports.GeoserverPublisherService = GeoserverPublisherService;
exports.GeoserverPublisherService = GeoserverPublisherService = __decorate([
    (0, common_1.Injectable)()
], GeoserverPublisherService);
//# sourceMappingURL=geoserver-publisher.service.js.map