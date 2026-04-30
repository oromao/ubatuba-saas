import { ParcelSubdivisionService } from './parcel-subdivision.service';
import { CreateSubdivisionDto } from './dto/create-subdivision.dto';
import { UpdateSubdivisionDto } from './dto/update-subdivision.dto';
export declare class ParcelSubdivisionController {
    private readonly service;
    constructor(service: ParcelSubdivisionService);
    create(dto: CreateSubdivisionDto & {
        tenantId: string;
        projectId: string;
        userId: string;
    }): Promise<import("./parcel-subdivision.schema").ParcelSubdivisionDocument>;
    list(tenantId: string, projectId: string, status?: string, tipo?: string, parentParcelId?: string): Promise<import("./parcel-subdivision.schema").ParcelSubdivisionDocument[]>;
    get(tenantId: string, id: string): Promise<import("./parcel-subdivision.schema").ParcelSubdivisionDocument | null>;
    update(tenantId: string, id: string, dto: UpdateSubdivisionDto): Promise<import("./parcel-subdivision.schema").ParcelSubdivisionDocument | null>;
    approve(tenantId: string, projectId: string, userId: string, id: string): Promise<import("./parcel-subdivision.schema").ParcelSubdivisionDocument>;
    reject(tenantId: string, userId: string, id: string, body: {
        motivoRejeicao: string;
    }): Promise<import("./parcel-subdivision.schema").ParcelSubdivisionDocument | null>;
    cancel(tenantId: string, id: string): Promise<import("./parcel-subdivision.schema").ParcelSubdivisionDocument | null>;
    children(tenantId: string, parcelId: string): Promise<any[]>;
    parents(tenantId: string, parcelId: string): Promise<any[]>;
}
