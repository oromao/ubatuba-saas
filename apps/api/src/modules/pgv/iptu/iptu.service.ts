import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parcel, ParcelDocument } from '../../ctm/parcels/parcel.schema';
import { PgvZone, PgvZoneDocument } from '../zones/zone.schema';
import { PgvValuation, PgvValuationDocument } from '../valuations/valuation.schema';
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

@Injectable()
export class IptuService {
  constructor(
    @InjectModel(Parcel.name) private readonly parcelModel: Model<ParcelDocument>,
    @InjectModel(PgvZone.name) private readonly zoneModel: Model<PgvZoneDocument>,
    @InjectModel(PgvValuation.name) private readonly valuationModel: Model<PgvValuationDocument>,
    private readonly valuationsService: ValuationsService,
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * Calculate IPTU for a single parcel.
   * Returns stored IPTU data from the parcel (pre-calculated during seed).
   */
  async calculateForParcel(input: IptuCalculationInput): Promise<IptuCalculationResult> {
    const year = input.year || new Date().getFullYear();

    if (!input.parcelId || input.parcelId.length !== 24) {
      throw new Error('ID de parcela invalido');
    }

    const parcel = await this.parcelModel.findById(input.parcelId).lean().exec();
    if (!parcel) {
      throw new Error(`Parcel ${input.parcelId} not found`);
    }

    const aliquota = (parcel as any).aliquotaIptu || 0.005;
    const zoneCode = (parcel as any).zoneamento || 'unknown';
    const valorVenalTerreno = (parcel as any).valorVenalTerreno || 0;
    const valorVenalConstrucao = (parcel as any).valorVenalConstrucao || 0;
    const valorVenalTotal = (parcel as any).valorVenalTotal || 0;
    const iptuDevido = (parcel as any).iptuDevido || Math.round(valorVenalTotal * aliquota);

    return {
      parcelId: String(parcel._id),
      sqlu: parcel.sqlu || '',
      inscricaoImobiliaria: parcel.inscricaoImobiliaria || parcel.inscription,
      valorVenalTerreno,
      valorVenalConstrucao,
      valorVenalTotal,
      aliquotaIptu: aliquota,
      iptuDevido,
      anoExercicio: year,
      zoneCode,
      zoneName: '',
    };
  }

  /**
   * Calculate IPTU for all parcels in a project (optionally filtered by zone).
   */
  async calculateBatch(
    tenantId: string,
    projectId: string,
    year?: number,
    zoneId?: string,
  ): Promise<IptuBatchResult> {
    const exerciseYear = year || new Date().getFullYear();

    const query: Record<string, unknown> = { tenantId, projectId };
    if (zoneId) {
      query.zoneId = zoneId;
    }

    const parcels = await this.parcelModel
      .find(query as any)
      .select('_id sqlu inscricaoImobiliaria inscription zoneamento zoneId')
      .lean()
      .exec();

    const calculos: IptuCalculationResult[] = [];
    let totalIptu = 0;

    for (const parcel of parcels) {
      try {
        const result = await this.calculateForParcel({
          parcelId: String(parcel._id),
          tenantId,
          projectId,
          year: exerciseYear,
        });
        calculos.push(result);
        totalIptu += result.iptuDevido;
      } catch {
        // Skip parcels that fail calculation (e.g., missing geometry)
      }
    }

    return {
      calculos,
      totalIptu: Math.round(totalIptu * 100) / 100,
      totalParcelas: calculos.length,
      anoExercicio: exerciseYear,
    };
  }

  /**
   * Get the IPTU aliquota for a parcel based on its zone.
   */
  async getAliquota(parcelId: string): Promise<{ aliquota: number; zoneCode?: string; zoneName?: string }> {
    const parcel = await this.parcelModel.findById(parcelId).lean().exec();
    if (!parcel) {
      throw new Error(`Parcel ${parcelId} not found`);
    }

    if (parcel.zoneId) {
      const zone = await this.zoneModel.findById(parcel.zoneId).lean().exec();
      if (zone) {
        return {
          aliquota: zone.aliquotaIptu ?? 0.005,
          zoneCode: zone.code,
          zoneName: zone.name || zone.nome,
        };
      }
    }

    return { aliquota: 0.005 };
  }
}
