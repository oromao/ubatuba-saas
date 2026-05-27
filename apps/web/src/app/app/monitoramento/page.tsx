"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Satellite, 
  ShieldAlert, 
  Compass, 
  Activity, 
  Radio, 
  AlertTriangle,
  FolderOpen,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  UserCheck
} from "lucide-react";

type Event = {
  _id: string;
  type: string;
  title: string;
  severity: string;
  stage: string;
  source?: string;
  sourceMode?: string;
  sourceAdapter?: string;
  assignedTo?: string;
  evidenceKeys?: string[];
  observedAt?: string;
  location?: { coordinates: [number, number] };
};

export default function MonitoringPage() {
  const queryClient = useQueryClient();
  const [filterStage, setFilterStage] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSourceMode, setFilterSourceMode] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStage) params.set("stage", filterStage);
    if (filterSeverity) params.set("severity", filterSeverity);
    if (filterType) params.set("type", filterType);
    if (filterSourceMode) params.set("sourceMode", filterSourceMode);
    return params.toString();
  }, [filterSeverity, filterSourceMode, filterStage, filterType]);

  const eventsQuery = useQuery({
    queryKey: ["monitoring-events", query],
    queryFn: () => apiFetch<Event[]>(`/monitoring/events${query ? `?${query}` : ""}`),
  });

  const dashboardQuery = useQuery({
    queryKey: ["monitoring-dashboard", query],
    queryFn: () =>
      apiFetch<{
        total: number;
        triagem: number;
        fiscalizacao: number;
        notificacao: number;
        desfecho: number;
        criticidadeAlta: number;
        comEvidencia: number;
        semAtribuicao: number;
        notificados: number;
        sourceBreakdown: Array<{ source: string; total: number }>;
        typeBreakdown: Array<{ type: string; total: number }>;
        sourceModeBreakdown: Array<{ sourceMode: string; total: number }>;
        feedAdapters: Array<{ adapter: string; mode: string; status: string }>;
        recentTimeline: Array<{ id: string; title: string; stage: string; severity: string; source: string; resolvedAt: string | null }>;
      }>(`/monitoring/dashboard${query ? `?${query}` : ""}`),
  });

  const monitoringError = eventsQuery.error ?? dashboardQuery.error ?? null;

  // Real-grade INPE/DETER satellite alert simulator
  const simulateDeterAlert = useMutation({
    mutationFn: () => {
      const ubatubaAppAreas = [
        { title: "INPE-DETER: Foco de Desmatamento Detectado (Área de APP - Itamambuca)", type: "DESMATAMENTO", lat: -23.385, lng: -45.012, source: "INPE-DETER" },
        { title: "INPE-DETER: Alerta de Invasão e Supressão de Vegetação (Parque Estadual Serra do Mar)", type: "INVASAO", lat: -23.412, lng: -45.184, source: "INPE-DETER" },
        { title: "CEMADEN: Alerta de Alto Risco de Deslizamento (Morro do Estufa II)", type: "DESLIZAMENTO", lat: -23.448, lng: -45.091, source: "CEMADEN" },
      ];
      // Pick random
      const selected = ubatubaAppAreas[Math.floor(Math.random() * ubatubaAppAreas.length)];

      return apiFetch<Event>("/monitoring/events", {
        method: "POST",
        body: JSON.stringify({
          type: selected.type,
          title: selected.title,
          severity: "CRITICA",
          lat: selected.lat,
          lng: selected.lng,
          source: selected.source,
          sourceMode: "SATELLITE",
          sourceAdapter: "INPE_DETER_API_V2",
        }),
      });
    },
    onSuccess: () => {
      alert("Alerta Aeroespacial de Satélite (INPE/DETER) recebido e ingerido com sucesso no CTM!");
      queryClient.invalidateQueries({ queryKey: ["monitoring-events"] });
      queryClient.invalidateQueries({ queryKey: ["monitoring-dashboard"] });
    },
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, path, body }: { id: string; path: string; body?: Record<string, unknown> }) =>
      apiFetch<Event>(`/monitoring/events/${id}${path}`, {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring-events"] });
      queryClient.invalidateQueries({ queryKey: ["monitoring-dashboard"] });
    },
  });

  function getSeverityColor(sev: string) {
    if (sev === "CRITICA" || sev === "ALTA") return "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200";
    if (sev === "MEDIA") return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200";
    return "bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 border-sky-200";
  }

  function getStageBadge(stage: string) {
    if (stage === "INGESTAO") return <Badge variant="outline" className="text-[10px]">INGESTÃO</Badge>;
    if (stage === "TRIAGEM") return <Badge variant="info" className="text-[10px]">TRIAGEM</Badge>;
    if (stage === "FISCALIZACAO") return <Badge variant="warning" className="text-[10px]">FISCALIZAÇÃO</Badge>;
    if (stage === "NOTIFICACAO") return <Badge variant="destructive" className="text-[10px]">NOTIFICADO</Badge>;
    return <Badge variant="success" className="text-[10px]">DESFECHO OK</Badge>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-6 py-6 md:px-8 motion-reduce:animate-none">
      {/* Header com Simulador de Satélite */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-outline pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-on-surface">Monitoramento Aeroespacial & Alertas</h1>
            <Badge variant="success" className="animate-pulse">ONLINE</Badge>
          </div>
          <p className="text-sm text-on-surface-muted mt-1">
            Gestão inteligente de alertas de desmatamento, invasões e anomalias territoriais via satélite.
          </p>
        </div>

        <Button 
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-2 h-10 shadow-sm"
          onClick={() => simulateDeterAlert.mutate()}
          disabled={simulateDeterAlert.isPending}
        >
          <Satellite className="h-4.5 w-4.5 animate-spin-slow" />
          Simular Alerta de Satélite (DETER/INPE)
        </Button>
      </div>

      {/* Grid de Resumo */}
      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Total Ocorrências</span>
              <p className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                {dashboardQuery.data?.total ?? 0}
              </p>
            </div>
            <Activity className="h-5 w-5 text-sky-500" />
          </CardContent>
        </Card>

        <Card className="bg-surface/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Em Triagem</span>
              <p className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {dashboardQuery.data?.triagem ?? 0}
              </p>
            </div>
            <Radio className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>

        <Card className="bg-surface/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Criticidade Crítica</span>
              <p className="font-display text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {dashboardQuery.data?.criticidadeAlta ?? 0}
              </p>
            </div>
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </CardContent>
        </Card>

        <Card className="bg-surface/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">Notificados / Campo</span>
              <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {dashboardQuery.data?.notificados ?? 0}
              </p>
            </div>
            <Compass className="h-5 w-5 text-emerald-500" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Painel Operacional de Alertas */}
        <Card className="bg-surface/40 backdrop-blur-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-outline">
            <div>
              <CardTitle className="text-base font-semibold">Painel Operacional de Alertas</CardTitle>
              <CardDescription className="text-xs">Triagem ativa e direcionamento de equipes de fiscalização territorial.</CardDescription>
            </div>
            <FolderOpen className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="pt-4">
            {/* Filtros */}
            <div className="mb-4 grid gap-2 grid-cols-2 sm:grid-cols-4">
              <Input value={filterStage} onChange={(e) => setFilterStage(e.target.value)} placeholder="Estágio" className="h-9 text-xs" />
              <Input value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} placeholder="Severidade" className="h-9 text-xs" />
              <Input value={filterType} onChange={(e) => setFilterType(e.target.value)} placeholder="Tipo" className="h-9 text-xs" />
              <Input value={filterSourceMode} onChange={(e) => setFilterSourceMode(e.target.value)} placeholder="Origem" className="h-9 text-xs" />
            </div>

            {/* Listagem de Alertas */}
            <div className="grid gap-3">
              {eventsQuery.isLoading ? (
                <div className="py-6 text-center text-xs text-on-surface-muted">Carregando painel aeroespacial...</div>
              ) : eventsQuery.data?.map((event) => (
                <div key={event._id} className="rounded-xl border border-outline bg-surface/50 p-4 transition-all hover:bg-surface-elevated/20">
                  <div className="flex flex-col gap-3">
                    {/* Linha 1: Titulo & Severidade */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{event.title}</span>
                          <Badge variant="outline" className={`text-[9px] uppercase font-bold ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-on-surface-muted mt-1.5 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Lng/Lat: {event.location?.coordinates?.map(c => c.toFixed(4)).join(', ') ?? 'Ubatuba'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Detectado: {event.observedAt ? new Date(event.observedAt).toLocaleDateString() : 'Hoje'}</span>
                        </div>
                      </div>
                      {getStageBadge(event.stage)}
                    </div>

                    {/* Linha 2: Atribuição & Origem */}
                    <div className="flex items-center justify-between text-xs text-on-surface-muted border-t border-dashed border-outline pt-2.5">
                      <div>
                        <span className="font-semibold text-slate-500">Fonte:</span> {event.source ?? "Satélite"} ({event.sourceMode ?? "MANUAL"})
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                        <span>{event.assignedTo ? `Fiscal: ${event.assignedTo}` : "Aguardando equipe de campo"}</span>
                      </div>
                    </div>

                    {/* Linha 3: Botões de Ação */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-outline">
                      <Button 
                        variant="outline" 
                        size="xs" 
                        onClick={() => stageMutation.mutate({ id: event._id, path: "/triage", body: { message: "Triagem de satélite concluída" } })}
                        className="text-[10px] h-7 px-2 border-sky-100 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                      >
                        Triagem
                      </Button>
                      <Button 
                        variant="outline" 
                        size="xs" 
                        onClick={() => stageMutation.mutate({ id: event._id, path: "/assign", body: { assignedTo: "Fiscal Ambiental (Ubatuba)" } })}
                        className="text-[10px] h-7 px-2 border-sky-100 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                      >
                        Enviar Equipe
                      </Button>
                      <Button 
                        variant="outline" 
                        size="xs" 
                        onClick={() => stageMutation.mutate({ id: event._id, path: "/notify", body: { message: "Notificação oficial emitida" } })}
                        className="text-[10px] h-7 px-2 border-sky-100 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                      >
                        Notificar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="xs" 
                        onClick={() => stageMutation.mutate({ id: event._id, path: "", body: { evidenceKey: `SAT-EVID-${event._id}` } })}
                        className="text-[10px] h-7 px-2 border-sky-100 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                      >
                        Anexar Satélite
                      </Button>
                      <Button 
                        size="xs" 
                        onClick={() => stageMutation.mutate({ id: event._id, path: "/close", body: { message: "Caso encerrado. Notificação e multa aplicadas." } })}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] h-7 px-2"
                      >
                        Fechar Caso
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {!eventsQuery.isLoading && (eventsQuery.data?.length ?? 0) === 0 ? (
                <div className="py-12 border-2 border-dashed border-outline rounded-xl text-center text-xs text-on-surface-muted bg-surface/20">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                  Nenhum evento monitorado ou pendente de triagem.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Informações dos Sensores e Feed de Satélites */}
        <div className="grid gap-6">
          {/* Adaptadores Preparados */}
          <Card className="bg-surface/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-outline">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Satellite className="h-4.5 w-4.5 text-sky-500" />
                Adaptadores de Satélites e Sensores
              </CardTitle>
              <CardDescription className="text-xs">Feeds aeroespaciais prontos para integração territorial.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 grid gap-2.5">
              {dashboardQuery.data?.feedAdapters?.map((item) => (
                <div key={item.adapter} className="flex items-center justify-between rounded-xl border border-outline bg-surface-elevated/40 p-3.5 hover:bg-surface-elevated/60 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400">
                      <Radio className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{item.adapter}</span>
                      <p className="text-[10px] text-on-surface-muted mt-0.5 uppercase tracking-wider font-semibold">{item.mode} FEED</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[9px] uppercase px-2 py-0.5 tracking-wide">
                    PRONTO
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recentes Fechamentos */}
          <Card className="bg-surface/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-outline">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                Histórico Operacional Recente
              </CardTitle>
              <CardDescription className="text-xs">Últimos encerramentos e desfechos de incidentes.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 grid gap-2.5">
              {dashboardQuery.data?.recentTimeline?.slice(0, 4).map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline bg-surface-elevated/40 p-3.5 hover:bg-surface-elevated/60 transition-all">
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate max-w-[200px]" title={item.title}>
                      {item.title}
                    </span>
                    <p className="text-[10px] text-on-surface-muted mt-0.5 font-medium">
                      {item.source} • {item.severity} • {item.stage}
                    </p>
                  </div>
                  <Badge 
                    variant={item.resolvedAt ? "success" : "outline"} 
                    className="text-[9px] uppercase tracking-wide px-2 py-0.5 font-bold"
                  >
                    {item.resolvedAt ? "RESOLVIDO" : "ABERTO"}
                  </Badge>
                </div>
              ))}
              {!dashboardQuery.isLoading && (dashboardQuery.data?.recentTimeline?.length ?? 0) === 0 ? (
                <div className="py-6 text-center text-xs text-on-surface-muted">Nenhum histórico operacional registrado.</div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
export const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
