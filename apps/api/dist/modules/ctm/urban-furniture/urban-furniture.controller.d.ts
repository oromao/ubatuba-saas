import { UrbanFurnitureService } from './urban-furniture.service';
import { CreateUrbanFurnitureDto } from './dto/create-urban-furniture.dto';
import { UpdateUrbanFurnitureDto } from './dto/update-urban-furniture.dto';
export declare class UrbanFurnitureController {
    private readonly urbanFurnitureService;
    constructor(urbanFurnitureService: UrbanFurnitureService);
    list(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<import("./urban-furniture.schema").UrbanFurnitureDocument[]>;
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
    }, id: string, projectId?: string): Promise<import("./urban-furniture.schema").UrbanFurnitureDocument | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: CreateUrbanFurnitureDto): Promise<import("./urban-furniture.schema").UrbanFurnitureDocument>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateUrbanFurnitureDto): Promise<import("./urban-furniture.schema").UrbanFurnitureDocument | null>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<any>;
}
