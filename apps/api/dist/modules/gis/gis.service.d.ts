import { Model } from 'mongoose';
import { ParcelDocument } from '../ctm/parcels/parcel.schema';
export type Bbox = [number, number, number, number];
export interface Coordinate {
    x: number;
    y: number;
}
export interface CoordinateTransformResult {
    fromEPSG: number;
    toEPSG: number;
    input: Coordinate;
    output: Coordinate;
}
export interface GisBboxQuery {
    tenantId: string;
    projectId: string;
    bbox: Bbox;
    limit?: number;
}
export interface GisBboxResult {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        id: string;
        geometry: any;
        properties: Record<string, any>;
    }>;
    total: number;
    limit: number;
}
export declare class GisService {
    private readonly model;
    constructor(model: Model<ParcelDocument>);
    queryBboxViewport(params: GisBboxQuery): Promise<GisBboxResult>;
    getBboxFromCoordinates(coords: [number, number, number, number]): Bbox;
    transformCoordinate(input: Coordinate, fromEPSG: number, toEPSG: number): CoordinateTransformResult;
    transformCoordinates(coords: Coordinate[], fromEPSG: number, toEPSG: number): Coordinate[];
    private calculateUtmZone;
    private wgs84ToUtm;
    private meridionalArc;
    private utmToWgs84;
    private approxLatCorrection;
    getMvtTile(z: number, x: number, y: number, tenantId: string, projectId: string): Promise<Buffer>;
    private projectCoordinateToTile;
    private projectPolygonToTile;
    private projectMultiPolygonToTile;
    tileToBbox(z: number, x: number, y: number): Bbox;
    tileCoordinatesFromBbox(bbox: Bbox, z: number): Array<{
        z: number;
        x: number;
        y: number;
    }>;
}
