import { Injectable } from '@nestjs/common';
import { CacheService } from '../shared/cache.service';
import { ProcessesService } from '../processes/processes.service';
import { AlertsService } from '../alerts/alerts.service';
import { AssetsService } from '../assets/assets.service';
import { PermitsWorksService } from '../permits-works/permits-works.service';
import { PermitsBusinessService } from '../permits-business/permits-business.service';
import { Citizen156Service } from '../citizen-156/citizen-156.service';
import { EnvironmentService } from '../environment/environment.service';
import { PublicWorksService } from '../public-works/public-works.service';
import { CemeteryService } from '../cemetery/cemetery.service';
import { ParcelsService } from '../ctm/parcels/parcels.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DashboardLayout, DashboardLayoutDocument } from './dashboard-layout.schema';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class DashboardService {
  constructor(
    private readonly processesService: ProcessesService,
    private readonly alertsService: AlertsService,
    private readonly assetsService: AssetsService,
    private readonly permitsWorksService: PermitsWorksService,
    private readonly permitsBusinessService: PermitsBusinessService,
    private readonly citizen156Service: Citizen156Service,
    private readonly environmentService: EnvironmentService,
    private readonly publicWorksService: PublicWorksService,
    private readonly cemeteryService: CemeteryService,
    private readonly parcelsService: ParcelsService,
    private readonly cacheService: CacheService,
    @InjectModel(DashboardLayout.name) private readonly layoutModel: Model<DashboardLayoutDocument>,
  ) {}

  async getKpis(tenantId: string) {
    const cacheKey = `dashboard:${tenantId}:kpis`;
    const cached = await this.cacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const [processes, alerts, assets] = await Promise.all([
      this.processesService.list(tenantId),
      this.alertsService.list(tenantId),
      this.assetsService.list(tenantId),
    ]);

    const result = {
      processes: processes.length,
      alerts: alerts.length,
      assets: assets.length,
    };

    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  async getExecutive(tenantId: string, userId: string) {
    const cacheKey = `dashboard:${tenantId}:executive:${userId}`;
    const cached = await this.cacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const [
      processes,
      alerts,
      assets,
      works,
      business,
      calls,
      environmentCases,
      publicWorks,
      cemeteryPlots,
    ] = await Promise.all([
      this.processesService.list(tenantId),
      this.alertsService.list(tenantId),
      this.assetsService.list(tenantId),
      this.permitsWorksService.list(tenantId),
      this.permitsBusinessService.list(tenantId),
      this.citizen156Service.list(tenantId),
      this.environmentService.list(tenantId),
      this.publicWorksService.list(tenantId),
      this.cemeteryService.list(tenantId),
    ]);

    const parcelStats = await this.parcelsService.getStatistics(tenantId).catch(() => null);

    const result = {
      ctm: parcelStats ? {
        totalParcelas: parcelStats.total,
        oficiais: parcelStats.official,
        demo: parcelStats.demo,
        comSqlu: parcelStats.withSqlu,
        taxaAdimplencia: parcelStats.taxaAdimplencia,
        totalValorVenal: parcelStats.totalValorVenal,
        totalIptuLancado: parcelStats.totalIptuLancado,
        totalIptuPago: parcelStats.totalIptuPago,
        totalIptuEmAberto: parcelStats.totalIptuEmAberto,
        porStatus: parcelStats.byStatus,
      } : null,
      summary: {
        processos: processes.length,
        alertas: alerts.length,
        ativos: assets.length,
        obras: works.length,
        empresas: business.length,
        chamados156: calls.length,
        ambientais: environmentCases.length,
        obrasPublicas: publicWorks.length,
        cemiterio: cemeteryPlots.length,
      },
      widgets: await this.getLayout(tenantId, userId),
      secretarias: [
        { name: 'Obras', total: works.length + publicWorks.length, status: 'operacional' },
        { name: 'Urbanismo', total: processes.length, status: 'operacional' },
        { name: 'Meio Ambiente', total: environmentCases.length + alerts.length, status: 'monitoramento' },
        { name: 'Atendimento', total: calls.length, status: 'fila' },
        { name: 'Tributário', total: business.length, status: 'integração' },
        { name: 'Patrimônio', total: cemeteryPlots.length, status: 'cadastro' },
      ],
      priorities: [
        { label: 'Obras em andamento', value: publicWorks.filter((item: any) => item.status === 'EM_EXECUCAO').length },
        { label: 'Chamados abertos', value: calls.filter((item: any) => item.status === 'ABERTO').length },
        { label: 'Alertas em triagem', value: alerts.filter((item: any) => item.stage === 'TRIAGEM').length },
      ],
      satelliteHealth: [
        {
          id: '156',
          label: 'Atendimento 156',
          total: calls.length,
          open: calls.filter((item: any) => item.status === 'ABERTO').length,
          inProgress: calls.filter((item: any) => item.status === 'EM_ANALISE').length,
          closed: calls.filter((item: any) => item.status === 'ENCERRADO').length,
        },
        {
          id: 'environment',
          label: 'Ambiental',
          total: environmentCases.length,
          open: environmentCases.filter((item: any) => item.status === 'ABERTO').length,
          inProgress: environmentCases.filter((item: any) => item.status === 'EM_ANALISE' || item.status === 'EM_CAMPO').length,
          closed: environmentCases.filter((item: any) => item.status === 'ENCERRADO' || item.status === 'LAUDO').length,
        },
        {
          id: 'public-works',
          label: 'Obras Públicas',
          total: publicWorks.length,
          open: publicWorks.filter((item: any) => item.status === 'PLANEJADA').length,
          inProgress: publicWorks.filter((item: any) => item.status === 'EM_EXECUCAO' || item.status === 'CONTRATADA').length,
          closed: publicWorks.filter((item: any) => item.status === 'CONCLUIDA').length,
        },
        {
          id: 'cemetery',
          label: 'Cemitério',
          total: cemeteryPlots.length,
          open: cemeteryPlots.filter((item: any) => item.status === 'LIVRE').length,
          inProgress: cemeteryPlots.filter((item: any) => item.status === 'OCUPADO').length,
          closed: cemeteryPlots.filter((item: any) => item.status === 'INATIVO').length,
        },
      ],
      readinessSignals: [
        { label: 'Portal institucional', value: 1, note: 'Handoff, callback e logout prontos para demo' },
        { label: 'RBAC e tenant', value: 1, note: 'Isolamento por tenant e perfil operacional' },
        { label: 'Rastreabilidade', value: 1, note: 'Histórico em módulos críticos e fluxos de campo' },
        { label: 'Satélites', value: Math.max(0, Math.min(4, Math.round((calls.length + environmentCases.length + publicWorks.length + cemeteryPlots.length) / 4))), note: 'Volume operacional disponível para demo' },
      ],
    };

    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  async getLayout(tenantId: string, userId: string) {
    const layout = await this.layoutModel.findOne({
      tenantId: asObjectId(tenantId),
      userId: asObjectId(userId),
    }).lean();
    const defaults = {
      viewMode: 'executive',
      widgets: [
        { id: 'summary', visible: true, order: 0 },
        { id: 'secretarias', visible: true, order: 1 },
        { id: 'priorities', visible: true, order: 2 },
        { id: 'satelliteHealth', visible: true, order: 3 },
        { id: 'readinessSignals', visible: true, order: 4 },
        { id: 'map', visible: true, order: 5 },
        { id: 'operations', visible: true, order: 6 },
        { id: 'integrations', visible: true, order: 7 },
      ],
    };
    return layout ?? defaults;
  }

  async saveLayout(
    tenantId: string,
    userId: string,
    layout: { viewMode?: 'executive' | 'operational'; widgets: Array<{ id: string; visible: boolean; order: number }> },
  ) {
    return this.layoutModel.findOneAndUpdate(
      { tenantId: asObjectId(tenantId), userId: asObjectId(userId) },
      { tenantId: asObjectId(tenantId), userId: asObjectId(userId), ...layout },
      { upsert: true, new: true },
    ).lean();
  }
}
