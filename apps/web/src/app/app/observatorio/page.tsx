"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/app/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type MarketOverview = {
  summary: {
    parcelas: number;
    avaliacoes: number;
    valorMedioVenal: number;
    valorTotalVenal: number;
    variacaoValor30d: number;
  };
  concentration: Array<{ zoneId: string; count: number }>;
  byNeighborhood: Array<{ neighborhood: string; count: number }>;
  byStreet: Array<{ street: string; count: number }>;
  discrepancyCards: Array<{ zoneId: string; total: number; pendentes: number; conflitos: number; aprovadas: number }>;
  monitoringSummary: {
    total: number;
    triagem: number;
    fiscalizacao: number;
    desfecho: number;
    altaCriticidade: number;
    currentWindow: number;
    previousWindow: number;
    variation: number;
  };
  coverage: {
    valuationCoverage: number;
    pendingRate: number;
    conflictRate: number;
  };
  comparativeBreakdown: Array<{
    scope: string;
    label: string;
    totalParcels: number;
    totalValuations: number;
    avgValue: number;
    totalValue: number;
    pendingParcels: number;
    conflictParcels: number;
    approvedParcels: number;
    criticalMonitoringEvents: number;
  }>;
  topValuations: Array<{ parcelId: string; totalValue: number; landValue: number; constructionValue: number }>;
  indicators: Array<{ label: string; value: number }>;
  trend: { currentWindowDays: number; currentValue: number; previousValue: number; variation: number };
  operationalNarrative: {
    arrecadacao: string;
    fiscalizacao: string;
    planejamento: string;
  };
  scope: {
    compare: string;
    neighborhood: string | null;
    street: string | null;
    zoneId: string | null;
  };
};

export default function ObservatoryPage() {
  const queryClient = useQueryClient();
  const [focus, setFocus] = useState("default");
  const [projectId, setProjectId] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [compare, setCompare] = useState<"all" | "city" | "zone" | "street">("all");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("observatory-filters") : null;
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<{
        focus: string;
        projectId: string;
        neighborhood: string;
        street: string;
        zoneId: string;
        compare: "all" | "city" | "zone" | "street";
      }>;
      if (parsed.focus) setFocus(parsed.focus);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.neighborhood) setNeighborhood(parsed.neighborhood);
      if (parsed.street) setStreet(parsed.street);
      if (parsed.zoneId) setZoneId(parsed.zoneId);
      if (parsed.compare) setCompare(parsed.compare);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "observatory-filters",
      JSON.stringify({ focus, projectId, neighborhood, street, zoneId, compare }),
    );
  }, [compare, focus, neighborhood, projectId, street, zoneId]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (projectId.trim()) params.set("projectId", projectId.trim());
    if (focus.trim()) params.set("focus", focus.trim());
    if (neighborhood.trim()) params.set("neighborhood", neighborhood.trim());
    if (street.trim()) params.set("street", street.trim());
    if (zoneId.trim()) params.set("zoneId", zoneId.trim());
    if (compare !== "all") params.set("compare", compare);
    return params.toString();
  }, [compare, focus, neighborhood, projectId, street, zoneId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["observatory-market", query],
    queryFn: () => apiFetch<MarketOverview>(`/observatory/market${query ? `?${query}` : ""}`),
  });

  const handleExport = async () => {
    const payload = await apiFetch<{ fileName: string; csv: string }>("/observatory/market/export.csv" + (query ? `?${query}` : ""));
    const blob = new Blob([payload.csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = payload.fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Observatório Municipal</h1>
          <p className="mt-1 text-sm text-on-surface-muted">Leitura executiva de CTM, PGV, monitoramento, arrecadação e discrepâncias territoriais.</p>
        </div>
        <Badge variant="info">Decisão executiva</Badge>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Filtros de decisão</CardTitle>
          <CardDescription>Persistência local simples por usuário para demo e navegação assistida.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[repeat(2,minmax(0,1fr))_repeat(4,minmax(0,1fr))_auto] md:items-end">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Foco</label>
            <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="arrecadação, fiscalização, planejamento" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Projeto</label>
            <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Opcional" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Bairro</label>
            <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Centro, Itagua..." />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Logradouro</label>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua, Avenida..." />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Zona</label>
            <Input value={zoneId} onChange={(e) => setZoneId(e.target.value)} placeholder="Opcional" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Comparar</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-on-surface"
              value={compare}
              onChange={(e) => setCompare(e.target.value as "all" | "city" | "zone" | "street")}
            >
              <option value="all">Tudo</option>
              <option value="city">Cidade</option>
              <option value="zone">Zona</option>
              <option value="street">Logradouro</option>
            </select>
          </div>
          <Button variant="outline" onClick={handleExport}>
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["observatory-market"] })}>
            Aplicar
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mt-4 border-rose-200 bg-rose-50">
          <CardHeader>
            <CardTitle className="text-rose-900">Observatório indisponível</CardTitle>
            <CardDescription className="text-rose-800">
              Não foi possível carregar os indicadores executivos no momento. Tente novamente ou revise a integração.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-rose-800">
            {error instanceof Error ? error.message : "Falha inesperada ao carregar o observatório."}
          </CardContent>
        </Card>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-8 w-16" />
                </CardHeader>
              </Card>
            ))
          : [
              { label: "Parcelas", value: data?.summary.parcelas ?? 0 },
              { label: "Avaliações", value: data?.summary.avaliacoes ?? 0 },
              { label: "Valor total", value: `R$ ${(data?.summary.valorTotalVenal ?? 0).toFixed(2)}` },
              { label: "Variação 30d", value: `${(data?.summary.variacaoValor30d ?? 0).toFixed(1)}%` },
            ].map((item) => (
              <Card key={item.label}>
                <CardHeader>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">{item.label}</p>
                  <CardTitle className="font-display text-3xl">{item.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        {[
          { label: "Cobertura de avaliação", value: `${(data?.coverage.valuationCoverage ?? 0).toFixed(1)}%` },
          { label: "Pendência cadastral", value: `${(data?.coverage.pendingRate ?? 0).toFixed(1)}%` },
          { label: "Taxa de conflito", value: `${(data?.coverage.conflictRate ?? 0).toFixed(1)}%` },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">{item.label}</p>
              <CardTitle className="font-display text-2xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Discrepâncias por zona</CardTitle>
            <CardDescription>Ranking para fiscalização, arrecadação e saneamento cadastral.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : data?.discrepancyCards.map((item) => (
                  <div key={item.zoneId} className="rounded-md border border-outline bg-surface-elevated p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-on-surface">{item.zoneId}</span>
                      <Badge variant="outline">Pendentes {item.pendentes}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <Badge variant="info">Total {item.total}</Badge>
                      <Badge variant="outline">Conflitos {item.conflitos}</Badge>
                      <Badge variant="outline">Aprovadas {item.aprovadas}</Badge>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Monitoramento + arrecadação</CardTitle>
            <CardDescription>Cruzamento com eventos ambientais e operação territorial.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-md border border-outline bg-surface-elevated p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Eventos críticos</p>
              <p className="mt-1 text-2xl font-semibold">{data?.monitoringSummary.altaCriticidade ?? 0}</p>
            </div>
            <div className="rounded-md border border-outline bg-surface-elevated p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Leitura executiva</p>
              <p className="mt-2 text-sm text-on-surface">{data?.operationalNarrative.arrecadacao ?? ""}</p>
              <p className="mt-2 text-xs text-on-surface-muted">{data?.operationalNarrative.fiscalizacao ?? ""}</p>
              <p className="mt-2 text-xs text-on-surface-muted">{data?.operationalNarrative.planejamento ?? ""}</p>
            </div>
            {data?.indicators.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                <span className="text-sm text-on-surface">{item.label}</span>
                <Badge variant="info">{Number(item.value).toFixed(0)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="font-display text-xl">Comparativo territorial</CardTitle>
            <CardDescription>Leitura comparativa conforme o recorte selecionado em “Comparar”.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data?.comparativeBreakdown ?? []}
              loading={isLoading}
              columns={[
                { key: "scope", label: "Escopo" },
                { key: "label", label: "Recorte" },
                { key: "totalParcels", label: "Parcelas" },
                { key: "totalValuations", label: "Avaliações" },
                { key: "totalValue", label: "Valor total", render: (value) => `R$ ${Number(value).toFixed(2)}` },
                { key: "pendingParcels", label: "Pendentes" },
                { key: "conflictParcels", label: "Conflitos" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Top valorações</CardTitle>
            <CardDescription>Parâmetro para revisão de PGV e arrecadação.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data?.topValuations ?? []}
              loading={isLoading}
              columns={[
                { key: "parcelId", label: "Parcela" },
                { key: "totalValue", label: "Total", render: (value) => `R$ ${Number(value).toFixed(2)}` },
                { key: "landValue", label: "Terreno", render: (value) => `R$ ${Number(value).toFixed(2)}` },
                { key: "constructionValue", label: "Construção", render: (value) => `R$ ${Number(value).toFixed(2)}` },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Bairros com mais parcelas</CardTitle>
            <CardDescription>Recorte útil para planejamento e fiscalização territorial.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data?.byNeighborhood ?? []}
              loading={isLoading}
              columns={[
                { key: "neighborhood", label: "Bairro" },
                { key: "count", label: "Parcelas" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Logradouros com mais parcelas</CardTitle>
            <CardDescription>Visão operacional para campo e saneamento cadastral.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data?.byStreet ?? []}
              loading={isLoading}
              columns={[
                { key: "street", label: "Logradouro" },
                { key: "count", label: "Parcelas" },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
