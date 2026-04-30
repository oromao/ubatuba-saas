import { GisService } from './gis.service';
import { Coordinate, CoordinateTransformResult } from './gis.service';
export declare class GisController {
    private readonly gisService;
    constructor(gisService: GisService);
    convertCoordinate(fromEPSG: number, toEPSG: number, x: number, y: number): CoordinateTransformResult;
    batchConvertCoordinates(body: {
        from: number;
        to: number;
        coordinates: Coordinate[];
    }): CoordinateTransformResult[];
    queryBbox(tenantId: string, projectId: string, minLng: number, minLat: number, maxLng: number, maxLat: number, limit?: number): Promise<import("./gis.service").GisBboxResult>;
    queryViewport(tenantId: string, projectId: string, bbox: string, limit?: number): Promise<import("./gis.service").GisBboxResult>;
    queryClusters(tenantId: string, projectId: string, minLng: number, minLat: number, maxLng: number, maxLat: number, zoom: number): Promise<import("./gis.service").ClusterResult>;
    getMvtTile(z: number, x: number, y: number, tenantId: string, projectId: string): Promise<Buffer>;
}
