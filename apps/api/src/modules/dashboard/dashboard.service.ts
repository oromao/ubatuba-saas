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
    try {
      let cached = null;
      try {
        cached = await this.cacheService.get<unknown>(cacheKey);
      } catch (e) {}
      if (cached) return cached;

      const [processes, alerts, assets] = await Promise.all([
        this.processesService.list(tenantId).catch(() => []),
        this.alertsService.list(tenantId).catch(() => []),
        this.assetsService.list(tenantId).catch(() => []),
      ]);

      const result = {
        processes: Array.isArray(processes) ? processes.length : 0,
        alerts: Array.isArray(alerts) ? alerts.length : 0,
        assets: Array.isArray(assets) ? assets.length : 0,
      };

      try {
        await this.cacheService.set(cacheKey, result, 60);
      } catch (e) {}
      return result;
    } catch (error) {
      return {
        processes: 0,
        alerts: 0,
        assets: 0,
      };
    }
  }

  async getExecutive(tenantId: string, userId: string) {
    const cacheKey = `dashboard:${tenantId}:executive:${userId}`;
    try {
      let cached = null;
      try { cached = await this.cacheService.get<unknown>(cacheKey); } catch (e) {}
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
        this.processesService.list(tenantId).catch(() => []),
        this.alertsService.list(tenantId).catch(() => []),
        this.assetsService.list(tenantId).catch(() => []),
        this.permitsWorksService.list(tenantId).catch(() => []),
        this.permitsBusinessService.list(tenantId).catch(() => []),
        this.citizen156Service.list(tenantId).catch(() => []),
        this.environmentService.list(tenantId).catch(() => []),
        this.publicWorksService.list(tenantId).catch(() => []),
        this.cemeteryService.list(tenantId).catch(() => []),
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
        } : {
          totalParcelas: 0,
          oficiais: 0,
          demo: 0,
          comSqlu: 0,
          taxaAdimplencia: 0,
          totalValorVenal: 0,
          totalIptuLancado: 0,
          totalIptuPago: 0,
          totalIptuEmAberto: 0,
          porStatus: {},
        },
        summary: {
          processos: Array.isArray(processes) ? processes.length : 0,
          alertas: Array.isArray(alerts) ? alerts.length : 0,
          ativos: Array.isArray(assets) ? assets.length : 0,
          obras: Array.isArray(works) ? works.length : 0,
          empresas: Array.isArray(business) ? business.length : 0,
          chamados156: Array.isArray(calls) ? calls.length : 0,
          ambientais: Array.isArray(environmentCases) ? environmentCases.length : 0,
          obrasPublicas: Array.isArray(publicWorks) ? publicWorks.length : 0,
          cemiterio: Array.isArray(cemeteryPlots) ? cemeteryPlots.length : 0,
        },
        widgets: await this.getLayout(tenantId, userId).catch(() => ({
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
        })),
        secretarias: [
          { name: 'Obras', total: (Array.isArray(works) ? works.length : 0) + (Array.isArray(publicWorks) ? publicWorks.length : 0), status: 'operacional' },
          { name: 'Urbanismo', total: Array.isArray(processes) ? processes.length : 0, status: 'operacional' },
          { name: 'Meio Ambiente', total: (Array.isArray(environmentCases) ? environmentCases.length : 0) + (Array.isArray(alerts) ? alerts.length : 0), status: 'monitoramento' },
          { name: 'Atendimento', total: Array.isArray(calls) ? calls.length : 0, status: 'fila' },
          { name: 'Tributário', total: Array.isArray(business) ? business.length : 0, status: 'integração' },
          { name: 'Patrimônio', total: Array.isArray(cemeteryPlots) ? cemeteryPlots.length : 0, status: 'cadastro' },
        ],
        priorities: [
          { label: 'Obras em andamento', value: Array.isArray(publicWorks) ? publicWorks.filter((item: any) => item && item.status === 'EM_EXECUCAO').length : 0 },
          { label: 'Chamados abertos', value: Array.isArray(calls) ? calls.filter((item: any) => item && item.status === 'ABERTO').length : 0 },
          { label: 'Alertas em triagem', value: Array.isArray(alerts) ? alerts.filter((item: any) => item && item.stage === 'TRIAGEM').length : 0 },
        ],
        satelliteHealth: [
          {
            id: '156',
            label: 'Atendimento 156',
            total: Array.isArray(calls) ? calls.length : 0,
            open: Array.isArray(calls) ? calls.filter((item: any) => item && item.status === 'ABERTO').length : 0,
            inProgress: Array.isArray(calls) ? calls.filter((item: any) => item && (item.status === 'EM_TRIAGEM' || item.status === 'ENCAMINHADO' || item.status === 'EM_CAMPO')).length : 0,
            closed: Array.isArray(calls) ? calls.filter((item: any) => item && (item.status === 'RESOLVIDO' || item.status === 'CANCELADO')).length : 0,
          },
          {
            id: 'environment',
            label: 'Ambiental',
            total: Array.isArray(environmentCases) ? environmentCases.length : 0,
            open: Array.isArray(environmentCases) ? environmentCases.filter((item: any) => item && item.status === 'ABERTO').length : 0,
            inProgress: Array.isArray(environmentCases) ? environmentCases.filter((item: any) => item && (item.status === 'EM_TRIAGEM' || item.status === 'EM_CAMPO')).length : 0,
            closed: Array.isArray(environmentCases) ? environmentCases.filter((item: any) => item && (item.status === 'RESOLVIDO' || item.status === 'LAUDO')).length : 0,
          },
          {
            id: 'public-works',
            label: 'Obras Públicas',
            total: Array.isArray(publicWorks) ? publicWorks.length : 0,
            open: Array.isArray(publicWorks) ? publicWorks.filter((item: any) => item && item.status === 'PLANEJADA').length : 0,
            inProgress: Array.isArray(publicWorks) ? publicWorks.filter((item: any) => item && (item.status === 'EM_EXECUCAO' || item.status === 'CONTRATADA')).length : 0,
            closed: Array.isArray(publicWorks) ? publicWorks.filter((item: any) => item && item.status === 'CONCLUIDA').length : 0,
          },
          {
            id: 'cemetery',
            label: 'Cemitério',
            total: Array.isArray(cemeteryPlots) ? cemeteryPlots.length : 0,
            open: Array.isArray(cemeteryPlots) ? cemeteryPlots.filter((item: any) => item && item.status === 'LIVRE').length : 0,
            inProgress: Array.isArray(cemeteryPlots) ? cemeteryPlots.filter((item: any) => item && item.status === 'OCUPADO').length : 0,
            closed: Array.isArray(cemeteryPlots) ? cemeteryPlots.filter((item: any) => item && item.status === 'INATIVO').length : 0,
          },
        ],
        readinessSignals: [
          { label: 'Portal institucional', value: 1, note: 'Handoff, callback e logout prontos para demo' },
          { label: 'RBAC e tenant', value: 1, note: 'Isolamento por tenant e perfil operacional' },
          { label: 'Rastreabilidade', value: 1, note: 'Histórico em módulos críticos e fluxos de campo' },
          {
            label: 'Satélites',
            value: Math.max(0, Math.min(4, Math.round(
              ((Array.isArray(calls) ? calls.length : 0) +
               (Array.isArray(environmentCases) ? environmentCases.length : 0) +
               (Array.isArray(publicWorks) ? publicWorks.length : 0) +
               (Array.isArray(cemeteryPlots) ? cemeteryPlots.length : 0)) / 4
            ))),
            note: 'Volume operacional disponível para demo'
          },
        ],
      };

      try {
        await this.cacheService.set(cacheKey, result, 60);
      } catch (e) {}
      return result;
    } catch (error) {
      return {
        ctm: {
          totalParcelas: 0,
          oficiais: 0,
          demo: 0,
          comSqlu: 0,
          taxaAdimplencia: 0,
          totalValorVenal: 0,
          totalIptuLancado: 0,
          totalIptuPago: 0,
          totalIptuEmAberto: 0,
          porStatus: {},
        },
        summary: {
          processos: 0,
          alertas: 0,
          ativos: 0,
          obras: 0,
          empresas: 0,
          chamados156: 0,
          ambientais: 0,
          obrasPublicas: 0,
          cemiterio: 0,
        },
        widgets: {
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
        },
        secretarias: [
          { name: 'Obras', total: 0, status: 'operacional' },
          { name: 'Urbanismo', total: 0, status: 'operacional' },
          { name: 'Meio Ambiente', total: 0, status: 'monitoramento' },
          { name: 'Atendimento', total: 0, status: 'fila' },
          { name: 'Tributário', total: 0, status: 'integração' },
          { name: 'Patrimônio', total: 0, status: 'cadastro' },
        ],
        priorities: [
          { label: 'Obras em andamento', value: 0 },
          { label: 'Chamados abertos', value: 0 },
          { label: 'Alertas em triagem', value: 0 },
        ],
        satelliteHealth: [
          { id: '156', label: 'Atendimento 156', total: 0, open: 0, inProgress: 0, closed: 0 },
          { id: 'environment', label: 'Ambiental', total: 0, open: 0, inProgress: 0, closed: 0 },
          { id: 'public-works', label: 'Obras Públicas', total: 0, open: 0, inProgress: 0, closed: 0 },
          { id: 'cemetery', label: 'Cemitério', total: 0, open: 0, inProgress: 0, closed: 0 },
        ],
        readinessSignals: [
          { label: 'Portal institucional', value: 1, note: 'Handoff, callback e logout prontos para demo' },
          { label: 'RBAC e tenant', value: 1, note: 'Isolamento por tenant e perfil operacional' },
          { label: 'Rastreabilidade', value: 1, note: 'Histórico em módulos críticos e fluxos de campo' },
          { label: 'Satélites', value: 0, note: 'Volume operacional disponível para demo' },
        ],
      };
    }
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
