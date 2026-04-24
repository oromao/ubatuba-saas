"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
};

export default function MonitoringPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Chuvas intensas e alagamento");
  const [type, setType] = useState("INUNDACAO");
  const [severity, setSeverity] = useState("ALTA");
  const [lat, setLat] = useState("-23.432");
  const [lng, setLng] = useState("-45.083");
  const [source, setSource] = useState("CEMADEN");
  const [sourceMode, setSourceMode] = useState("API");
  const [sourceAdapter, setSourceAdapter] = useState("CEMADEN");
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

  const ingestMutation = useMutation({
    mutationFn: () =>
      apiFetch<Event>("/monitoring/events", {
        method: "POST",
        body: JSON.stringify({
          type,
          title,
          severity,
          lat: Number(lat),
          lng: Number(lng),
          source,
          sourceMode,
          sourceAdapter,
        }),
      }),
    onSuccess: () => {
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

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Monitoramento Ambiental</h1>
          <p className="text-sm text-on-surface-muted">Ingestão, triagem e desfecho de eventos ambientais.</p>
        </div>
        <Badge variant="info">P1</Badge>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        {monitoringError && (
          <Card className="border-rose-200 bg-rose-50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-rose-900">Monitoramento indisponivel</CardTitle>
              <CardDescription className="text-rose-800">
                Não foi possível carregar os eventos ambientais neste momento. Tente novamente ou revise a integração.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-rose-800">
              {monitoringError instanceof Error ? monitoringError.message : "Falha inesperada ao carregar o monitoramento."}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Ingerir evento</CardTitle>
            <CardDescription>Fonte preparada para operação, sensores e futuros adaptadores externos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Tipo" />
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
            <Input value={severity} onChange={(e) => setSeverity(e.target.value)} placeholder="Severidade" />
            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Fonte" />
            <Input value={sourceMode} onChange={(e) => setSourceMode(e.target.value)} placeholder="Modo da fonte" />
            <Input value={sourceAdapter} onChange={(e) => setSourceAdapter(e.target.value)} placeholder="Adapter externo" />
            <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
            <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" />
            <Button onClick={() => ingestMutation.mutate()} disabled={ingestMutation.isPending}>
              {ingestMutation.isPending ? "Ingerindo..." : "Ingerir evento"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Eventos</CardTitle>
            <CardDescription>Painel operacional com filtro, estágio, evidência e desfecho.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-2 md:grid-cols-4">
              <Input value={filterStage} onChange={(e) => setFilterStage(e.target.value)} placeholder="Filtrar por estágio" />
              <Input value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} placeholder="Filtrar por severidade" />
              <Input value={filterType} onChange={(e) => setFilterType(e.target.value)} placeholder="Filtrar por tipo" />
              <Input value={filterSourceMode} onChange={(e) => setFilterSourceMode(e.target.value)} placeholder="Filtrar por modo" />
            </div>
            <div className="grid gap-3">
              {eventsQuery.data?.map((event) => (
                <div key={event._id} className="rounded-lg border border-outline bg-surface-elevated p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-on-surface">{event.title}</p>
                      <p className="text-xs text-on-surface-muted">
                        {event.type} • {event.severity} • {event.stage} • {event.source ?? "sem fonte"} • {event.sourceMode ?? "MANUAL"}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-muted">
                        {event.assignedTo ? `Atribuído a ${event.assignedTo}` : "Sem atribuição"} • Evidências {event.evidenceKeys?.length ?? 0}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => stageMutation.mutate({ id: event._id, path: "/triage", body: { message: "Triagem iniciada" } })}>
                        Triagem
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => stageMutation.mutate({ id: event._id, path: "/assign", body: { assignedTo: "Fiscal de campo" } })}>
                        Fiscalizar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => stageMutation.mutate({ id: event._id, path: "", body: { evidenceKey: `evid-${event._id}` } })}>
                        Evidenciar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => stageMutation.mutate({ id: event._id, path: "/notify", body: { message: "Notificação preparada" } })}>
                        Notificar
                      </Button>
                      <Button size="sm" onClick={() => stageMutation.mutate({ id: event._id, path: "/close", body: { message: "Desfecho registrado" } })}>
                        Encerrar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {!eventsQuery.isLoading && (eventsQuery.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-on-surface-muted">Nenhum evento monitorado.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-sm">Total: {dashboardQuery.data?.total ?? 0}</CardContent></Card>
        <Card><CardContent className="p-4 text-sm">Triagem: {dashboardQuery.data?.triagem ?? 0}</CardContent></Card>
        <Card><CardContent className="p-4 text-sm">Alta criticidade: {dashboardQuery.data?.criticidadeAlta ?? 0}</CardContent></Card>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-sm">Com evidencia: {dashboardQuery.data?.comEvidencia ?? 0}</CardContent></Card>
        <Card><CardContent className="p-4 text-sm">Sem atribuicao: {dashboardQuery.data?.semAtribuicao ?? 0}</CardContent></Card>
        <Card><CardContent className="p-4 text-sm">Notificados: {dashboardQuery.data?.notificados ?? 0}</CardContent></Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fontes monitoradas</CardTitle>
            <CardDescription>Defesa civil, sensores e origem de ingestão.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {dashboardQuery.data?.sourceBreakdown?.map((item) => (
              <div key={item.source} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                <span className="text-sm text-on-surface">{item.source}</span>
                <Badge variant="outline">{item.total}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tipos em foco</CardTitle>
            <CardDescription>Distribuição por tipo de evento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {dashboardQuery.data?.typeBreakdown?.map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                <span className="text-sm text-on-surface">{item.type}</span>
                <Badge variant="outline">{item.total}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Modos de origem</CardTitle>
            <CardDescription>Preparo para manual, sensor, satelite ou API externa.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {dashboardQuery.data?.sourceModeBreakdown?.map((item) => (
              <div key={item.sourceMode} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                <span className="text-sm text-on-surface">{item.sourceMode}</span>
                <Badge variant="outline">{item.total}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Adaptadores preparados</CardTitle>
            <CardDescription>Seams prontas para feeds externos sem prometer integração oficial.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {dashboardQuery.data?.feedAdapters?.map((item) => (
              <div key={item.adapter} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                <div>
                  <span className="text-sm text-on-surface">{item.adapter}</span>
                  <p className="text-xs text-on-surface-muted">{item.mode}</p>
                </div>
                <Badge variant="outline">{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Linha do tempo operacional</CardTitle>
          <CardDescription>Últimos eventos com estágio e situação de desfecho.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {dashboardQuery.data?.recentTimeline?.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-outline bg-surface-elevated p-3">
              <div>
                <p className="font-medium text-on-surface">{item.title}</p>
                <p className="text-xs text-on-surface-muted">
                  {item.source} • {item.stage} • {item.severity}
                </p>
              </div>
              <Badge variant={item.resolvedAt ? "info" : "outline"}>{item.resolvedAt ? "Encerrado" : "Aberto"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
