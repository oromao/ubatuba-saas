import { Model } from 'mongoose';
import { Parcel, ParcelDocument } from './parcel.schema';
export type ParcelFilters = {
    projectId: string;
    sqlu?: string;
    inscription?: string;
    inscricaoImobiliaria?: string;
    status?: string;
    workflowStatus?: string;
    bbox?: string;
    q?: string;
    zoneId?: string;
    faceId?: string;
    sourceType?: string;
    isOfficial?: boolean;
    zoneamento?: string;
    statusIPTU?: string;
};
export declare class ParcelsRepository {
    private readonly model;
    constructor(model: Model<ParcelDocument>);
    list(tenantId: string, filters: ParcelFilters): Promise<ParcelDocument[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<ParcelDocument | null>;
    findBySqlu(tenantId: string, projectId: string, sqlu: string): Promise<ParcelDocument | null>;
    findByInscription(tenantId: string, projectId: string, inscription: string): Promise<ParcelDocument | null>;
    create(data: Partial<Parcel>): Promise<ParcelDocument>;
    update(tenantId: string, projectId: string, id: string, data: Partial<Parcel>): Promise<ParcelDocument | null>;
    delete(tenantId: string, projectId: string, id: string): Promise<any>;
}
