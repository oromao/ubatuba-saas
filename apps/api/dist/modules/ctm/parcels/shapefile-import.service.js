"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ShapefileImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShapefileImportService = void 0;
const common_1 = require("@nestjs/common");
const JSZip = require("jszip");
const shapefile = require("shapefile");
const crs_1 = require("../../../common/utils/crs");
let ShapefileImportService = ShapefileImportService_1 = class ShapefileImportService {
    constructor() {
        this.logger = new common_1.Logger(ShapefileImportService_1.name);
    }
    detectCrsFromPrj(prjContent) {
        if (!prjContent)
            return null;
        const upper = prjContent.toUpperCase();
        if (upper.includes('WGS_1984') || upper.includes('WGS84') || upper.includes('GCS_WGS_1984')) {
            return crs_1.CRS_WGS84;
        }
        if ((upper.includes('SIRGAS_2000') || upper.includes('SIRGAS2000') || upper.includes('GRS_1980')) &&
            upper.includes('ZONE_23')) {
            return crs_1.CRS_SIRGAS2000_UTM_23S;
        }
        if ((upper.includes('SIRGAS_2000') || upper.includes('SIRGAS2000') || upper.includes('GRS_1980')) &&
            upper.includes('ZONE_24')) {
            return crs_1.CRS_SIRGAS2000_UTM_24S;
        }
        if (upper.includes('WEB_MERCATOR') || upper.includes('MERCATOR') || upper.includes('3857')) {
            return 'EPSG:3857';
        }
        return null;
    }
    reprojectGeometry(geometry, sourceCrs) {
        if (sourceCrs === crs_1.CRS_WGS84)
            return geometry;
        return (0, crs_1.convertGeometryCoordinates)(geometry, sourceCrs, crs_1.CRS_WGS84);
    }
    async parseShpZip(zipBuffer) {
        const warnings = [];
        let zip;
        try {
            zip = await JSZip.loadAsync(zipBuffer);
        }
        catch {
            throw new common_1.BadRequestException('Arquivo inválido: não é um ZIP válido');
        }
        const files = Object.keys(zip.files);
        const shpEntry = files.find((f) => f.toLowerCase().endsWith('.shp') && !zip.files[f].dir);
        const dbfEntry = files.find((f) => f.toLowerCase().endsWith('.dbf') && !zip.files[f].dir);
        const prjEntry = files.find((f) => f.toLowerCase().endsWith('.prj') && !zip.files[f].dir);
        if (!shpEntry) {
            throw new common_1.BadRequestException('ZIP inválido: arquivo .shp não encontrado');
        }
        if (!dbfEntry) {
            warnings.push('Arquivo .dbf não encontrado — atributos (propriedades) estarão ausentes');
        }
        const shpBuffer = Buffer.from(await zip.files[shpEntry].async('arraybuffer'));
        const dbfBuffer = dbfEntry
            ? Buffer.from(await zip.files[dbfEntry].async('arraybuffer'))
            : undefined;
        let detectedCrs = null;
        if (prjEntry) {
            const prjContent = await zip.files[prjEntry].async('string');
            detectedCrs = this.detectCrsFromPrj(prjContent);
            if (!detectedCrs) {
                warnings.push('.prj encontrado mas CRS não reconhecido — assumindo WGS84');
                detectedCrs = crs_1.CRS_WGS84;
            }
            this.logger.log(`CRS detectado via .prj: ${detectedCrs}`);
        }
        else {
            warnings.push('.prj não encontrado — assumindo WGS84');
            detectedCrs = crs_1.CRS_WGS84;
        }
        const features = [];
        let skipped = 0;
        try {
            const source = await shapefile.open(shpBuffer, dbfBuffer);
            while (true) {
                const result = await source.read();
                if (result.done)
                    break;
                const feature = result.value;
                if (!feature || !feature.geometry) {
                    skipped++;
                    continue;
                }
                if (detectedCrs !== crs_1.CRS_WGS84) {
                    const coords = this.extractFirstCoordinate(feature.geometry);
                    const runtimeCrs = coords
                        ? (0, crs_1.detectCrsFromCoordinates)(coords).detectedCrs || detectedCrs
                        : detectedCrs;
                    const reprojected = this.reprojectGeometry(feature.geometry, runtimeCrs);
                    if (!reprojected) {
                        skipped++;
                        warnings.push(`Feature #${features.length + skipped}: reprojeção falhou, ignorada`);
                        continue;
                    }
                    features.push({ ...feature, geometry: reprojected });
                }
                else {
                    features.push(feature);
                }
            }
        }
        catch (err) {
            throw new common_1.BadRequestException(`Erro ao processar Shapefile: ${err?.message || 'erro desconhecido'}`);
        }
        if (skipped > 0) {
            warnings.push(`${skipped} feature(s) ignorada(s) por geometria ausente ou erro de reprojeção`);
        }
        if (features.length === 0) {
            warnings.push('Nenhuma feature válida encontrada no Shapefile');
        }
        const featureCollection = {
            type: 'FeatureCollection',
            features,
        };
        return {
            featureCollection,
            warnings,
            detectedCrs,
            totalFeatures: features.length,
        };
    }
    extractFirstCoordinate(geometry) {
        try {
            if (geometry.type === 'Point')
                return geometry.coordinates;
            if (geometry.type === 'LineString')
                return geometry.coordinates[0];
            if (geometry.type === 'Polygon')
                return geometry.coordinates[0][0];
            if (geometry.type === 'MultiPolygon')
                return geometry.coordinates[0][0][0];
        }
        catch {
            return null;
        }
        return null;
    }
};
exports.ShapefileImportService = ShapefileImportService;
exports.ShapefileImportService = ShapefileImportService = ShapefileImportService_1 = __decorate([
    (0, common_1.Injectable)()
], ShapefileImportService);
//# sourceMappingURL=shapefile-import.service.js.map