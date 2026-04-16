import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parcel } from '../ctm/parcels/parcel.schema';
import { Vistoria } from '../ctm/vistoria.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Parcel.name) private parcelModel: Model<any>,
    @InjectModel(Vistoria.name) private vistoriaModel: Model<any>,
  ) {}

  async fiscalizacaoReport(
    tenantId: string,
    filters: { dataInicio?: string; dataFim?: string; status?: string },
  ) {
    const query: any = { tenantId };
    if (filters.dataInicio || filters.dataFim) {
      query.data = {};
      if (filters.dataInicio) query.data.$gte = new Date(filters.dataInicio);
      if (filters.dataFim) query.data.$lte = new Date(filters.dataFim);
    }
    if (filters.status) query.status = filters.status;

    const [total, byStatus, byTipo, recent] = await Promise.all([
      this.vistoriaModel.countDocuments(query),
      this.vistoriaModel.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.vistoriaModel.aggregate([
        { $match: query },
        { $group: { _id: '$tipo', count: { $sum: 1 } } },
      ]),
      this.vistoriaModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .select('tipo data status parcelId'),
    ]);

    const aprovadas = byStatus.find((s: any) => s._id === 'APROVADA')?.count || 0;
    const pendentes = byStatus.find((s: any) => s._id === 'RASCUNHO')?.count || 0;

    return {
      resumo: {
        total,
        aprovadas,
        pendentes,
        taxaAprovacao: total > 0 ? Math.round((aprovadas / total) * 100) : 0,
      },
      porStatus: byStatus,
      porTipo: byTipo,
      recentes: recent,
      periodo: {
        inicio: filters.dataInicio || 'todos',
        fim: filters.dataFim || 'todos',
      },
    };
  }

  async parcelasReport(tenantId: string) {
    const [total, byStatus, byWorkflow, withPendencias] = await Promise.all([
      this.parcelModel.countDocuments({ tenantId }),
      this.parcelModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$statusCadastral', count: { $sum: 1 } } },
      ]),
      this.parcelModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$workflowStatus', count: { $sum: 1 } } },
      ]),
      this.parcelModel.countDocuments({
        tenantId,
        'pendingIssues.0': { $exists: true },
      }),
    ]);

    return {
      resumo: { total, withPendencias, semPendencias: total - withPendencias },
      porStatus: byStatus,
      porWorkflow: byWorkflow,
    };
  }

  async executivoReport(tenantId: string) {
    const [parcelas, vistorias] = await Promise.all([
      this.parcelasReport(tenantId),
      this.fiscalizacaoReport(tenantId, {}),
    ]);
    return { parcelas, vistorias, geradoEm: new Date().toISOString() };
  }
}
