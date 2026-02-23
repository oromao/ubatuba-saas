import { UrbanFurnitureService } from './urban-furniture.service';
import { CreateUrbanFurnitureDto } from './dto/create-urban-furniture.dto';
import { UpdateUrbanFurnitureDto } from './dto/update-urban-furniture.dto';
export declare class UrbanFurnitureController {
    private readonly urbanFurnitureService;
    constructor(urbanFurnitureService: UrbanFurnitureService);
    list(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./urban-furniture.schema").UrbanFurnitureDocument, {}, {}> & import("./urban-furniture.schema").UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    geojson(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<{
        type: string;
        features: {
            type: string;
            id: any;
            geometry: import("../../../common/utils/geo").PointGeometry;
            properties: {
                featureType: string;
                furnitureId: any;
                type: string;
                tipo: string;
                condition: string | undefined;
                estadoConservacao: string | undefined;
                notes: string | undefined;
                observacao: string | undefined;
                photoUrl: string | undefined;
                fotoUrl: string | undefined;
            };
        }[];
    }>;
    get(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./urban-furniture.schema").UrbanFurnitureDocument, {}, {}> & import("./urban-furniture.schema").UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: CreateUrbanFurnitureDto): Promise<import("mongoose").Document<unknown, {}, import("./urban-furniture.schema").UrbanFurnitureDocument, {}, {}> & import("./urban-furniture.schema").UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateUrbanFurnitureDto): Promise<(import("mongoose").Document<unknown, {}, import("./urban-furniture.schema").UrbanFurnitureDocument, {}, {}> & import("./urban-furniture.schema").UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<import("mongodb").DeleteResult>;
}
