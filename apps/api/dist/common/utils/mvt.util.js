"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVectorTile = createVectorTile;
const geojson_vt_1 = __importDefault(require("geojson-vt"));
const vtpbf = __importStar(require("vt-pbf"));
function createVectorTile(geojson, z, x, y) {
    const tileIndex = (0, geojson_vt_1.default)(geojson, {
        maxZoom: 24,
        tolerance: 3,
        extent: 4096,
        buffer: 64,
        debug: 0,
        lineMetrics: false,
        promoteId: null,
        generateId: false,
        indexMaxZoom: 5,
        indexMaxPoints: 100000,
    });
    const tile = tileIndex.getTile(z, x, y);
    if (!tile) {
        // Return empty protocol buffer
        return Buffer.from('');
    }
    const buff = vtpbf.fromGeojsonVt({ layer: tile });
    return Buffer.from(buff);
}
