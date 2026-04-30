import { Model } from 'mongoose';
import { ParcelDocument } from './parcel.schema';
import { ParcelSubdivisionDocument } from './parcel-subdivision.schema';
import { ParcelSubdivisionRepository } from './parcel-subdivision.repository';
import { ParcelsRepository } from './parcels.repository';
import { GeometryService } from '../geometry.service';
import { CreateSubdivisionDto } from './dto/create-subdivision.dto';
import { UpdateSubdivisionDto } from './dto/update-subdivision.dto';
export declare class ParcelSubdivisionService {
    private readonly parcelModel;
    private readonly repository;
    private readonly parcelsRepository;
    private readonly geometryService;
    constructor(parcelModel: Model<ParcelDocument>, repository: ParcelSubdivisionRepository, parcelsRepository: ParcelsRepository, geometryService: GeometryService);
    createRequest(tenantId: string, projectId: string, userId: string, dto: CreateSubdivisionDto): Promise<ParcelSubdivisionDocument>;
    listRequests(tenantId: string, projectId: string, filters?: {
        status?: string;
        tipo?: string;
        parentParcelId?: string;
    }): Promise<ParcelSubdivisionDocument[]>;
    getRequest(tenantId: string, id: string): Promise<ParcelSubdivisionDocument | null>;
    updateRequest(tenantId: string, id: string, dto: UpdateSubdivisionDto): Promise<ParcelSubdivisionDocument | null>;
    approve(tenantId: string, projectId: string, requestId: string, userId: string): Promise<ParcelSubdivisionDocument>;
    reject(tenantId: string, requestId: string, userId: string, motivoRejeicao: string): Promise<ParcelSubdivisionDocument | null>;
    cancel(tenantId: string, requestId: string): Promise<ParcelSubdivisionDocument | null>;
    getChildren(tenantId: string, parentParcelId: string): Promise<any[]>;
    getParentChain(tenantId: string, parcelId: string): Promise<any[]>;
}
