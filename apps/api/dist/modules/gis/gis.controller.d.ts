import { Response } from 'express';
import { GisService, Bbox, Coordinate, CoordinateTransformResult } from './gis.service';
export declare class GisController {
    private readonly gisService;
    constructor(gisService: GisService);
    bboxQuery(req: {
        tenantId: string;
    }, projectId: string, bboxRaw: string, limitRaw?: string): Promise<import("./gis.service").GisBboxResult | {
        type: string;
        features: never[];
        total: number;
        limit: number;
        error: string;
    }>;
    convertCoordinate(fromRaw: string, toRaw: string, xRaw: string, yRaw: string): Promise<CoordinateTransformResult | {
        error: string;
    }>;
    batchConvertCoordinate(body: {
        from: number;
        to: number;
        coordinates: Coordinate[];
    }): Promise<{
        results: CoordinateTransformResult[];
    } | {
        error: string;
    }>;
    getMvtTile(z: string, x: string, y: string, req: {
        tenantId: string;
    }, projectId: string, res: Response): Promise<void>;
    getTileMetadata(zRaw: string, xRaw: string, yRaw: string): Promise<{
        error: string;
        z?: undefined;
        x?: undefined;
        y?: undefined;
        bbox?: undefined;
        bounds?: undefined;
    } | {
        z: number;
        x: number;
        y: number;
        bbox: Bbox;
        bounds: number[][];
        error?: undefined;
    }>;
}
