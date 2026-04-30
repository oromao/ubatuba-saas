import { Model } from 'mongoose';
import { ParcelDocument } from '../../ctm/parcels/parcel.schema';
import { PgvZoneDocument } from '../zones/zone.schema';
import { PgvValuationDocument } from '../valuations/valuation.schema';
import { ValuationsService } from '../valuations/valuations.service';
import { TenantsService } from '../../tenants/tenants.service';
export interface IptuCalculationInput {
    parcelId: string;
    tenantId: string;
    projectId: string;
    year?: number;
}
export interface IptuCalculationResult {
    parcelId: string;
    sqlu: string;
    inscricaoImobiliaria?: string;
    valorVenalTerreno: number;
    valorVenalConstrucao: number;
    valorVenalTotal: number;
    aliquotaIptu: number;
    iptuDevido: number;
    anoExercicio: number;
    zoneCode?: string;
    zoneName?: string;
}
export interface IptuBatchResult {
    calculos: IptuCalculationResult[];
    totalIptu: number;
    totalParcelas: number;
    anoExercicio: number;
}
export declare class IptuService {
    private readonly parcelModel;
    private readonly zoneModel;
    private readonly valuationModel;
    private readonly valuationsService;
    private readonly tenantsService;
    constructor(parcelModel: Model<ParcelDocument>, zoneModel: Model<PgvZoneDocument>, valuationModel: Model<PgvValuationDocument>, valuationsService: ValuationsService, tenantsService: TenantsService);
    calculateForParcel(input: IptuCalculationInput): Promise<IptuCalculationResult>;
    calculateBatch(tenantId: string, projectId: string, year?: number, zoneId?: string): Promise<IptuBatchResult>;
    getAliquota(parcelId: string): Promise<{
        aliquota: number;
        zoneCode?: string;
        zoneName?: string;
    }>;
}
