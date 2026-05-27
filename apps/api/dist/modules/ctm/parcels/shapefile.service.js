"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShapefileService = void 0;
const common_1 = require("@nestjs/common");
const JSZip = require("jszip");
let ShapefileService = class ShapefileService {
    async parse(buffer, originalName) {
        const name = (originalName || '').toLowerCase();
        if (name.endsWith('.zip')) {
            return this.parseZip(buffer);
        }
        if (name.endsWith('.shp')) {
            return this.parseShp(buffer);
        }
        throw new common_1.BadRequestException('Formato não suportado. Envie um arquivo .shp ou .zip contendo .shp + .dbf + .shx');
    }
    async parseZip(buffer) {
        const zip = await JSZip.loadAsync(buffer);
        const shpFile = this.findInZip(zip, '.shp');
        const dbfFile = this.findInZip(zip, '.dbf');
        const prjFile = this.findInZip(zip, '.prj');
        if (!shpFile) {
            throw new common_1.BadRequestException('Arquivo .shp não encontrado dentro do .zip');
        }
        const shpBuffer = await shpFile.async('nodebuffer');
        const dbfBuffer = dbfFile ? await dbfFile.async('nodebuffer') : null;
        return this.parseShpPair(shpBuffer, dbfBuffer, prjFile ? await prjFile.async('text') : null);
    }
    findInZip(zip, ext) {
        const files = zip.file(/.*/);
        for (const file of files) {
            if (file.name.toLowerCase().endsWith(ext))
                return file;
        }
        return null;
    }
    async parseShp(buffer) {
        return this.parseShpPair(buffer, null, null);
    }
    async parseShpPair(shpBuffer, dbfBuffer, prjText) {
        const shapefile = await Promise.resolve().then(() => require('shapefile'));
        const shpArray = new Uint8Array(shpBuffer);
        const dbfArray = dbfBuffer ? new Uint8Array(dbfBuffer) : null;
        const source = dbfArray
            ? await shapefile.open(shpArray, dbfArray)
            : await shapefile.openShp(shpArray);
        const features = [];
        while (true) {
            const result = await source.read();
            if (result.done)
                break;
            const feature = result.value;
            if (!feature || !feature.geometry)
                continue;
            const crsNote = prjText ? { crs_original: prjText.trim() } : {};
            features.push({
                type: 'Feature',
                geometry: feature.geometry,
                properties: {
                    ...feature.properties,
                    ...crsNote,
                },
            });
        }
        if (features.length === 0) {
            throw new common_1.BadRequestException('Nenhuma feature encontrada no shapefile');
        }
        return { type: 'FeatureCollection', features };
    }
};
exports.ShapefileService = ShapefileService;
exports.ShapefileService = ShapefileService = __decorate([
    (0, common_1.Injectable)()
], ShapefileService);
//# sourceMappingURL=shapefile.service.js.map