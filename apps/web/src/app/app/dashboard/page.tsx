"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const MiniMap = dynamic(() => import("@/components/maps/MiniMap"), { ssr: false });

type WidgetConfig = { id: string; visible: boolean; order: number };

const WIDGET_LABELS: Record<string, { title: string; description: string }> = {
  ctm: { title: "Cadastro Territorial (CTM)", description: "Parcelas, IPTU e status cadastral" },
  summary: { title: "Resumo executivo", description: "Indicadores principais do painel" },
  secretarias: { title: "Visão por secretaria", description: "Operação consolidada por área" },
  priorities: { title: "Prioridades de hoje", description: "Fila resumida para leitura executiva" },
  satelliteHealth: { title: "Saúde dos módulos satélite", description: "Status dos módulos de apoio" },
  readinessSignals: { title: "Sinais de prontidão", description: "Indicadores institucionais e técnicos" },
  map: { title: "Mapa situacional", description: "Camadas e contexto territorial" },
  operations: { title: "Operação do dia", description: "Equipe em campo e tarefas pendentes" },
  integrations: { title: "Integrações e prontidão", description: "Conectores e estado institucional" },
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const defaultWidgets = useMemo<WidgetConfig[]>(
    () => [
      { id: "ctm", visible: true, order: 0 },
      { id: "summary", visible: true, order: 1 },
      { id: "secretarias", visible: true, order: 2 },
      { id: "priorities", visible: true, order: 3 },
      { id: "satelliteHealth", visible: true, order: 4 },
      { id: "readinessSignals", visible: true, order: 5 },
      { id: "map", visible: true, order: 6 },
      { id: "operations", visible: true, order: 7 },
      { id: "integrations", visible: true, order: 8 },
    ],
    [],
  );

  const { data, isLoading, error: kpisError } = useQuery({
    queryKey: ["kpis"],
    queryFn: () => apiFetch<{ processes: number; alerts: number; assets: number }>("/dashboard/kpis"),
  });

  const executiveQuery = useQuery({
    queryKey: ["dashboard-executive"],
    queryFn: () =>
      apiFetch<{
        ctm?: {
          totalParcelas: number;
          oficiais: number;
          demo: number;
          comSqlu: number;
          taxaAdimplencia: number;
          totalValorVenal: number;
          totalIptuLancado: number;
          totalIptuPago: number;
          totalIptuEmAberto: number;
          porStatus: Record<string, number>;
        } | null;
        summary: Record<string, number>;
        secretarias: Array<{ name: string; total: number; status: string }>;
        priorities: Array<{ label: string; value: number }>;
        satelliteHealth: Array<{ id: string; label: string; total: number; open: number; inProgress: number; closed: number }>;
        readinessSignals: Array<{ label: string; value: number; note: string }>;
        widgets?: { viewMode?: string; widgets?: WidgetConfig[] };
      }>("/dashboard/executive"),
  });

  const layoutQuery = useQuery({
    queryKey: ["dashboard-layout"],
    queryFn: () => apiFetch<{ viewMode: string; widgets: WidgetConfig[] }>("/dashboard/layout"),
  });

  const dashboardError = kpisError ?? executiveQuery.error ?? layoutQuery.error ?? null;

  const [viewMode, setViewMode] = useState<"executive" | "operational">("executive");
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);

  useEffect(() => {
    if (!layoutQuery.data) return;
    setViewMode((layoutQuery.data.viewMode as "executive" | "operational") ?? "executive");
    setWidgets(layoutQuery.data.widgets?.length ? layoutQuery.data.widgets : defaultWidgets);
  }, [defaultWidgets, layoutQuery.data]);

  const currentWidgets = useMemo(
    () => [...(widgets.length > 0 ? widgets : layoutQuery.data?.widgets ?? defaultWidgets)].sort((a, b) => a.order - b.order),
    [defaultWidgets, layoutQuery.data?.widgets, widgets],
  );

  const visibleWidgets = useMemo(() => currentWidgets.filter((widget) => widget.visible), [currentWidgets]);
  const hasWidget = (id: string) => visibleWidgets.some((widget) => widget.id === id);

  const saveLayout = useMutation({
    mutationFn: () =>
      apiFetch("/dashboard/layout", {
        method: "PATCH",
        body: JSON.stringify({ viewMode, widgets: currentWidgets }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-layout"] }),
  });

  const updateWidget = (widgetId: string, patch: Partial<WidgetConfig>) => {
    setWidgets((prev) => {
      const source = prev.length > 0 ? prev : layoutQuery.data?.widgets ?? defaultWidgets;
      return source.map((widget) => (widget.id === widgetId ? { ...widget, ...patch } : widget));
    });
  };

  const moveWidget = (widgetId: string, direction: "up" | "down") => {
    setWidgets((prev) => {
      const source = [...(prev.length > 0 ? prev : layoutQuery.data?.widgets ?? defaultWidgets)].sort((a, b) => a.order - b.order);
      const index = source.findIndex((widget) => widget.id === widgetId);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= source.length) return source;
      const next = [...source];
      const currentOrder = next[index].order;
      next[index] = { ...next[index], order: next[nextIndex].order };
      next[nextIndex] = { ...next[nextIndex], order: currentOrder };
      return next;
    });
  };

  const kpis = [
    { label: "Processos digitais", value: data?.processes ?? "--", note: "Fluxos com SLA ativo" },
    { label: "Alertas ambientais", value: data?.alerts ?? "--", note: "Risco monitorado" },
    { label: "Ativos territoriais", value: data?.assets ?? "--", note: "Cadastro atualizado" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Painel Executivo</h1>
      </div>

      <div className="mt-6 space-y-6">
        {dashboardError && (
          <Card className="border-rose-200 bg-rose-50">
            <CardHeader>
              <CardTitle className="text-rose-900">Painel indisponível</CardTitle>
              <CardDescription className="text-rose-800">
                Não foi possível carregar os indicadores executivos neste momento. Tente novamente ou revise a integração.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-rose-800">
              {dashboardError instanceof Error ? dashboardError.message : "Falha inesperada ao carregar o painel executivo."}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Widgets configuráveis</CardTitle>
            <CardDescription>Layout persistido por usuário para gestão estratégica e operação. O painel usa nomes de negócio em vez de IDs técnicos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Visão</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-on-surface"
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value as "executive" | "operational")}
              >
                <option value="executive">Executiva</option>
                <option value="operational">Operacional</option>
              </select>
            </div>
            <div className="grid gap-2">
              {currentWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-outline bg-surface-elevated px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{WIDGET_LABELS[widget.id]?.title ?? widget.id}</span>
                    <span className="text-xs text-on-surface-muted">{WIDGET_LABELS[widget.id]?.description ?? "Widget do painel"}</span>
                    <span className="text-xs text-on-surface-muted">Ordem {widget.order}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-on-surface-muted">
                      <input
                        type="checkbox"
                        checked={widget.visible}
                        onChange={(event) => updateWidget(widget.id, { visible: event.target.checked })}
                      />
                      Visível
                    </label>
                    <Button variant="ghost" size="sm" onClick={() => moveWidget(widget.id, "up")}>
                      ↑
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveWidget(widget.id, "down")}>
                      ↓
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => saveLayout.mutate()} loading={saveLayout.isPending}>
                Salvar layout
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setWidgets(defaultWidgets);
                  setViewMode("executive");
                }}
              >
                Restaurar
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasWidget("ctm") && executiveQuery.data?.ctm && (
          <Card>
            <CardHeader>
              <CardTitle>Cadastro Territorial — CTM</CardTitle>
              <CardDescription>Dados reais de parcelas e tributação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase tracking-wide text-on-surface-muted">Total Parcelas</p>
                  <p className="mt-1 text-2xl font-semibold">{executiveQuery.data.ctm.totalParcelas}</p>
                  <p className="text-xs text-on-surface-muted">{executiveQuery.data.ctm.oficiais} oficiais</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase tracking-wide text-on-surface-muted">Com SQLU</p>
                  <p className="mt-1 text-2xl font-semibold">{executiveQuery.data.ctm.comSqlu}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase tracking-wide text-on-surface-muted">Adimplência IPTU</p>
                  <p className="mt-1 text-2xl font-semibold">{executiveQuery.data.ctm.taxaAdimplencia.toFixed(1)}%</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase tracking-wide text-on-surface-muted">Valor Venal Total</p>
                  <p className="mt-1 text-xl font-semibold">
                    {executiveQuery.data.ctm.totalValorVenal > 0
                      ? executiveQuery.data.ctm.totalValorVenal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : '—'}
                  </p>
                </div>
              </div>
              {executiveQuery.data.ctm.totalIptuLancado > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border p-3">
                    <p className="text-xs uppercase tracking-wide text-on-surface-muted">IPTU Lançado</p>
                    <p className="mt-1 text-lg font-semibold">
                      {executiveQuery.data.ctm.totalIptuLancado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs uppercase tracking-wide text-on-surface-muted">IPTU Pago</p>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {executiveQuery.data.ctm.totalIptuPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs uppercase tracking-wide text-on-surface-muted">Em Aberto</p>
                    <p className="mt-1 text-lg font-semibold text-amber-600">
                      {executiveQuery.data.ctm.totalIptuEmAberto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              )}
              {executiveQuery.data.ctm.porStatus && Object.keys(executiveQuery.data.ctm.porStatus).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wide text-on-surface-muted mb-2">Status IPTU</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(executiveQuery.data.ctm.porStatus).map(([status, count]) => (
                      <span key={status} className="rounded-full border px-3 py-1 text-xs">
                        {status}: <strong>{count as number}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {hasWidget("summary") ? (
          <section className="grid gap-4 md:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="mt-2 h-8 w-16" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))
              : kpis.map((item) => (
                  <Card key={item.label}>
                    <CardHeader>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">{item.label}</p>
                      <CardTitle className="font-display text-3xl">{item.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-on-surface-muted">{item.note}</CardContent>
                  </Card>
                ))}
          </section>
        ) : null}

        {hasWidget("secretarias") || hasWidget("priorities") ? (
          <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            {hasWidget("secretarias") ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Visão por secretaria</CardTitle>
                  <CardDescription>Consolida operação urbana, atendimento e fiscalização.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {executiveQuery.isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    : executiveQuery.data?.secretarias.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                          <div>
                            <p className="font-medium text-on-surface">{item.name}</p>
                            <p className="text-xs text-on-surface-muted">{item.status}</p>
                          </div>
                          <Badge variant="outline">{item.total}</Badge>
                        </div>
                      ))}
                </CardContent>
              </Card>
            ) : null}

            {hasWidget("priorities") ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Prioridades de hoje</CardTitle>
                  <CardDescription>Fila resumida para leitura estratégica.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {executiveQuery.isLoading
                    ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                    : executiveQuery.data?.priorities.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                          <span className="text-sm text-on-surface">{item.label}</span>
                          <Badge variant="info">{item.value}</Badge>
                        </div>
                      ))}
                </CardContent>
              </Card>
            ) : null}
          </section>
        ) : null}

        {hasWidget("satelliteHealth") || hasWidget("readinessSignals") ? (
          <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            {hasWidget("satelliteHealth") ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Saúde dos módulos satélite</CardTitle>
                  <CardDescription>Leitura rápida de 156, ambiental, obras públicas e cemitério.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {executiveQuery.isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    : executiveQuery.data?.satelliteHealth.map((item) => (
                        <div key={item.id} className="rounded-md border border-outline bg-surface-elevated p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-on-surface">{item.label}</p>
                              <p className="text-xs text-on-surface-muted">
                                {item.open} abertos · {item.inProgress} em andamento · {item.closed} encerrados
                              </p>
                            </div>
                            <Badge variant="outline">{item.total}</Badge>
                          </div>
                        </div>
                      ))}
                </CardContent>
              </Card>
            ) : null}

            {hasWidget("readinessSignals") ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Sinais de prontidão</CardTitle>
                  <CardDescription>Resume o estado institucional para auditoria e governança.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {executiveQuery.isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                    : executiveQuery.data?.readinessSignals.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                          <div>
                            <span className="text-sm text-on-surface">{item.label}</span>
                            <p className="mt-1 text-xs text-on-surface-muted">{item.note}</p>
                          </div>
                          <Badge variant={item.value > 0 ? "info" : "outline"}>{item.value > 0 ? "OK" : "PENDENTE"}</Badge>
                        </div>
                      ))}
                </CardContent>
              </Card>
            ) : null}
          </section>
        ) : null}

        {hasWidget("map") || hasWidget("operations") ? (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {hasWidget("map") ? (
              <Card className="relative overflow-hidden">
                <MiniMap className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" />
                <CardHeader className="relative flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-display text-xl">Mapa situacional</CardTitle>
                    <CardDescription>Camadas com dados de campo e drone.</CardDescription>
                  </div>
                  <Link
                    href="/app/maps"
                    className="inline-flex h-9 items-center justify-center rounded-full border border-outline bg-surface-elevated px-4 text-xs font-semibold text-on-surface transition hover:border-accent/30"
                  >
                    Abrir mapa
                  </Link>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { label: "Área mapeada", value: "128 km2" },
                      { label: "Missões em andamento", value: "3" },
                      { label: "Atualização cartográfica", value: "2h" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-md border border-outline bg-surface-elevated p-4">
                        <p className="text-xs text-on-surface-muted">{item.label}</p>
                        <p className="text-xl font-semibold text-on-surface">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Ortomosaico", "Modelo 3D", "Nuvem de pontos", "Risco hidrológico"].map((item) => (
                      <Badge key={item} variant="default">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {hasWidget("operations") ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Operação do dia</CardTitle>
                  <CardDescription>Equipe em campo e relatórios pendentes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-on-surface-muted">
                  {[
                    { label: "Drone 02 - Zona Norte", status: "Em voo" },
                    { label: "Equipe Ambiental - Rio Azul", status: "Vistoria 14h" },
                    { label: "Licenciamento - Bairro Central", status: "Pendências" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                      <span>{item.label}</span>
                      <Badge variant={item.status === "Em voo" ? "info" : "default"}>{item.status}</Badge>
                    </div>
                  ))}
                  <div className="rounded-md border border-outline bg-surface-elevated p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Integrações</p>
                    <p className="mt-1 text-sm text-on-surface">
                      Monitore conectores tributários, execute sync manual e inspecione logs de erro.
                    </p>
                    <Link
                      href="/app/integracoes"
                      className="mt-3 inline-flex h-8 items-center justify-center rounded-full border border-outline px-3 text-xs font-semibold text-on-surface transition hover:border-accent/30"
                    >
                      Abrir integrações
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </section>
        ) : null}

        {hasWidget("integrations") ? (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Integrações e prontidão</CardTitle>
                <CardDescription>Leitura rápida para TI, secretaria e banca técnica.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-md border border-outline bg-surface-elevated p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Estado institucional</p>
                  <p className="mt-2 text-sm text-on-surface">
                    Portal coexistente, handoff institucional e layout por usuário já estão operacionais plena.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="info">Portal ready</Badge>
                    <Badge variant="outline">RBAC</Badge>
                    <Badge variant="outline">Tenant isolation</Badge>
                    <Badge variant="outline">Auditoria</Badge>
                  </div>
                </div>
                <div className="rounded-md border border-outline bg-surface-elevated p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Próximos conectores</p>
                  <div className="mt-3 grid gap-2">
                    {[
                      "Tributário municipal",
                      "Portal cidadão / SSO externo",
                      "Feed territorial oficial",
                    ].map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-md border border-outline bg-surface px-3 py-2">
                        <span className="text-sm text-on-surface">{item}</span>
                        <Badge variant="outline">Preparado</Badge>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/app/integracoes"
                    className="mt-4 inline-flex h-8 items-center justify-center rounded-full border border-outline px-3 text-xs font-semibold text-on-surface transition hover:border-accent/30"
                  >
                    Abrir hub de integrações
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}
      </div>
    </div>
  );
}
