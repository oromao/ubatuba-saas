"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryService = void 0;
const common_1 = require("@nestjs/common");
function isSupportedGeometry(geometry) {
    if (!geometry || typeof geometry !== 'object') {
        return false;
    }
    const candidate = geometry;
    if (!['Polygon', 'MultiPolygon', 'Point'].includes(String(candidate.type))) {
        return false;
    }
    return Array.isArray(candidate.coordinates) || candidate.type === 'Point';
}
function hasCoordinates(geometry) {
    return Boolean(geometry && typeof geometry === 'object' && 'coordinates' in geometry);
}
let GeometryService = class GeometryService {
    isValidGeometry(geometry) {
        if (!isSupportedGeometry(geometry))
            return false;
        if (!Array.isArray(geometry.coordinates))
            return false;
        if (geometry.type === 'Polygon') {
            const ring = geometry.coordinates[0];
            return !!(ring && ring.length >= 4);
        }
        return true;
    }
    calculateArea(geometry) {
        if (!isSupportedGeometry(geometry) || !Array.isArray(geometry.coordinates))
            return 0;
        if (geometry.type === 'Polygon' && geometry.coordinates[0]?.length >= 3) {
            return this.calculatePolygonArea(geometry.coordinates[0]);
        }
        return 0;
    }
    validateNoOverlap(geometries) {
        for (let i = 0; i < geometries.length; i++) {
            for (let j = i + 1; j < geometries.length; j++) {
                if (this.checkSimpleOverlap(geometries[i], geometries[j])) {
                }
            }
        }
    }
    calculateCentroid(geometry) {
        if (!isSupportedGeometry(geometry) || !(geometry.type === 'Polygon'))
            return undefined;
        const coords = geometry.coordinates[0];
        if (!coords || coords.length < 4)
            return undefined;
        let sumX = 0, sumY = 0;
        const n = coords.length - 1;
        for (let i = 0; i < n; i++) {
            sumX += coords[i][0];
            sumY += coords[i][1];
        }
        return {
            type: 'Point',
            coordinates: [sumX / n, sumY / n],
        };
    }
    calculateBbox(geometry) {
        if (!isSupportedGeometry(geometry) || !(geometry.type === 'Polygon'))
            return undefined;
        const coords = geometry.coordinates[0];
        if (!coords || coords.length === 0)
            return undefined;
        const minX = Math.min(...coords.map((c) => c[0]));
        const maxX = Math.max(...coords.map((c) => c[0]));
        const minY = Math.min(...coords.map((c) => c[1]));
        const maxY = Math.max(...coords.map((c) => c[1]));
        return { minX, minY, maxX, maxY };
    }
    validateGeometry(geometry) {
        const errors = [];
        const warnings = [];
        if (!isSupportedGeometry(geometry)) {
            if (!geometry) {
                return { valid: false, errors: ['Geometria ausente'], warnings: [] };
            }
            errors.push('Tipo de geometria não definido');
            return { valid: false, errors, warnings };
        }
        if (!geometry.type) {
            errors.push('Tipo de geometria não definido');
        }
        if (!['Polygon', 'MultiPolygon', 'Point'].includes(geometry.type)) {
            errors.push(`Tipo inválido: ${geometry.type}. Use Polygon, MultiPolygon ou Point`);
        }
        if (!Array.isArray(geometry.coordinates)) {
            errors.push('Coordenadas ausentes ou inválidas');
            return { valid: false, errors, warnings };
        }
        if (geometry.type === 'Polygon') {
            const ring = geometry.coordinates[0];
            if (!ring || ring.length < 4) {
                errors.push('Polígono precisa de pelo menos 3 vértices + fechamento');
            }
            else {
                const first = ring[0];
                const last = ring[ring.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    warnings.push('Polígono não está fechado — será fechado automaticamente');
                }
                const unique = new Set(ring.map((c) => `${c[0]},${c[1]}`));
                if (unique.size < 3) {
                    errors.push('Polígono degenerado: vértices repetidos');
                }
            }
        }
        let calculatedArea;
        if (geometry.type === 'Polygon' && geometry.coordinates[0]?.length >= 3) {
            calculatedArea = this.calculatePolygonArea(geometry.coordinates[0]);
            if (calculatedArea < 1) {
                warnings.push(`Área calculada muito pequena: ${calculatedArea.toFixed(2)} m²`);
            }
            if (calculatedArea > 1000000) {
                warnings.push(`Área calculada muito grande: ${calculatedArea.toFixed(2)} m²`);
            }
        }
        return { valid: errors.length === 0, errors, warnings, calculatedArea };
    }
    calculatePolygonArea(coordinates) {
        const EARTH_RADIUS = 6371000;
        let area = 0;
        const n = coordinates.length;
        for (let i = 0; i < n - 1; i++) {
            const [lon1, lat1] = coordinates[i].map((d) => d * Math.PI / 180);
            const [lon2, lat2] = coordinates[i + 1].map((d) => d * Math.PI / 180);
            area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
        }
        return Math.abs(area * EARTH_RADIUS * EARTH_RADIUS / 2);
    }
    checkSimpleOverlap(geom1, geom2) {
        if (!hasCoordinates(geom1) || !hasCoordinates(geom2))
            return false;
        const bbox1 = this.getBoundingBox((geom1.coordinates[0] ?? []));
        const bbox2 = this.getBoundingBox((geom2.coordinates[0] ?? []));
        if (!bbox1 || !bbox2)
            return false;
        return !(bbox1.maxLng < bbox2.minLng ||
            bbox2.maxLng < bbox1.minLng ||
            bbox1.maxLat < bbox2.minLat ||
            bbox2.maxLat < bbox1.minLat);
    }
    getBoundingBox(coords) {
        if (!coords || coords.length === 0)
            return null;
        return {
            minLng: Math.min(...coords.map((c) => c[0])),
            maxLng: Math.max(...coords.map((c) => c[0])),
            minLat: Math.min(...coords.map((c) => c[1])),
            maxLat: Math.max(...coords.map((c) => c[1])),
        };
    }
};
exports.GeometryService = GeometryService;
exports.GeometryService = GeometryService = __decorate([
    (0, common_1.Injectable)()
], GeometryService);
//# sourceMappingURL=geometry.service.js.map