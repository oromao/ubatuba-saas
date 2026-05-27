import { Request } from 'express';
import { ShapefileService } from './shapefile.service';
import { ParcelsService } from './parcels.service';
export declare class ShapefileController {
    private readonly shapefileService;
    private readonly parcelsService;
    constructor(shapefileService: ShapefileService, parcelsService: ParcelsService);
    importShp(file: Express.Multer.File, projectId: string | undefined, req: Request): Promise<{
        batchId: any;
        inserted: number;
        updated: number;
        skipped: number;
        errors: number;
        errorDetails: {
            row: number;
            featureId?: string;
            message: string;
            field?: string;
        }[];
    }>;
}
