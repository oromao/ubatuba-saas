"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL, apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/app/data-table";

type PgvZone = { _id: string; code?: string; name?: string; nome?: string };
type PgvFace = { _id: string; code?: string; name?: string; nome?: string };
type PgvVersion = { _id: string; code?: string; name?: string; isActive?: boolean };
type ScenarioRow = {
  _id?: string;
  name?: string;
  summary?: {
    parcelsEvaluated?: number;
    totalCurrentValue?: number;
    totalProposedValue?: number;
    totalDelta?: number;
    totalDeltaPct?: number;
    estimatedAnnualArrecadationImpact?: number;
  };
  filters?: Record<string, unknown>;
  impactedParcels?: Array<{ parcelId: string; sqlu?: string; delta?: number; deltaPct?: number; bairro?: string | null; logradouro?: string | null }>;
  createdAt?: string;
};

type SimulationResult = {
  summary: {
    parcelsEvaluated: number;
    totalCurrentValue: number;
    totalProposedValue: number;
    totalDelta: number;
    totalDeltaPct: number;
    estimatedAnnualArrecadationImpact: number;
  };
  filters: {
    zoneId?: string | null;
    faceId?: string | null;
    q?: string | null;
    bairro?: string | null;
    logradouro?: string | null;
    uso?: string | null;
    padraoConstrutivo?: string | null;
    proposedLandMultiplier?: number;
    proposedConstructionMultiplier?: number;
  };
  chartSeries: Array<{ label: string; currentValue: number; proposedValue: number }>;
  territorialBreakdown: Array<{
    type: string;
    label: string;
    parcels: number;
    currentValue: number;
    proposedValue: number;
    delta: number;
  }>;
  impactedParcels: Array<{
    parcelId: string;
    sqlu?: string;
    inscrição?: string | null;
    bairro?: string | null;
    logradouro?: string | null;
    zoneCode?: string | null;
    faceCode?: string | null;
    usage?: string | null;
    pattern?: string | null;
    currentValue: number;
    proposedValue: number;
    delta: number;
    deltaPct: number;
  }>;
  highlights: {
    withPositiveImpact: number;
    withHigherUrbanPressure: number;
  };
};

export default function PgvReportPage() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState("demo");
  const [name, setName] = useState("Cenario Fiscal Ubatuba");
  const [zoneId, setZoneId] = useState("");
  const [faceId, setFaceId] = useState("");
  const [q, setQ] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [uso, setUso] = useState("");
  const [padraoConstrutivo, setPadraoConstrutivo] = useState("");
  const [proposedLandMultiplier, setProposedLandMultiplier] = useState("1.08");
  const [proposedConstructionMultiplier, setProposedConstructionMultiplier] = useState("1.05");

  const zonesQuery = useQuery({
    queryKey: ["pgv-zones", projectId],
    queryFn: () => apiFetch<PgvZone[]>(`/pgv/zones?projectId=${encodeURIComponent(projectId)}`),
  });
  const facesQuery = useQuery({
    queryKey: ["pgv-faces", projectId],
    queryFn: () => apiFetch<PgvFace[]>(`/pgv/faces?projectId=${encodeURIComponent(projectId)}`),
  });
  const versionsQuery = useQuery({
    queryKey: ["pgv-versions", projectId],
    queryFn: () => apiFetch<PgvVersion[]>(`/pgv/versions?projectId=${encodeURIComponent(projectId)}`),
  });
  const scenariosQuery = useQuery({
    queryKey: ["pgv-scenarios", projectId],
    queryFn: () => apiFetch<ScenarioRow[]>(`/pgv/simulations?projectId=${encodeURIComponent(projectId)}`),
  });

  const simulationMutation = useMutation({
    mutationFn: () =>
      apiFetch<SimulationResult>("/pgv/simulations", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          name,
          zoneId: zoneId || undefined,
          faceId: faceId || undefined,
          q: q || undefined,
          bairro: bairro || undefined,
          logradouro: logradouro || undefined,
          uso: uso || undefined,
          padraoConstrutivo: padraoConstrutivo || undefined,
          proposedLandMultiplier: Number(proposedLandMultiplier),
          proposedConstructionMultiplier: Number(proposedConstructionMultiplier),
          persist: true,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pgv-scenarios", projectId] });
    },
  });

  const latest = simulationMutation.data ?? (scenariosQuery.data?.[0] as ScenarioRow | undefined);
  const summary = latest?.summary;
  const chart = simulationMutation.data?.chartSeries ?? [];
  const breakdown = simulationMutation.data?.territorialBreakdown ?? [];
  const impacted = simulationMutation.data?.impactedParcels ?? [];

  const topImpact = impacted.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-on-surface">PGV Fazendária</h1>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-muted">
            Simulação venal, impacto de arrecadação, divergência territorial e leitura executiva para a Fazenda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">Simulacao</Badge>
          <Badge variant="outline">Arrecadacao</Badge>
          <Badge variant="outline">CTM</Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Montar cenário</CardTitle>
            <CardDescription>Filtre por recorte territorial e compare a base atual com a proposta.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="ProjectId" />
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cenário" />
            <Input value={zoneId} onChange={(e) => setZoneId(e.target.value)} placeholder="ZoneId" list="pgv-zones-list" />
            <Input value={faceId} onChange={(e) => setFaceId(e.target.value)} placeholder="FaceId" list="pgv-faces-list" />
            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" />
            <Input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Logradouro" />
            <Input value={uso} onChange={(e) => setUso(e.target.value)} placeholder="Tipo de uso" />
            <Input value={padraoConstrutivo} onChange={(e) => setPadraoConstrutivo(e.target.value)} placeholder="Padrão construtivo" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca livre" className="md:col-span-2" />
            <Input value={proposedLandMultiplier} onChange={(e) => setProposedLandMultiplier(e.target.value)} placeholder="Multiplicador do terreno" />
            <Input value={proposedConstructionMultiplier} onChange={(e) => setProposedConstructionMultiplier(e.target.value)} placeholder="Multiplicador da construção" />
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <Button onClick={() => simulationMutation.mutate()} disabled={simulationMutation.isPending}>
                {simulationMutation.isPending ? "Simulando..." : "Rodar cenário"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.open(
                    `${API_URL}/pgv/report.csv?projectId=${encodeURIComponent(projectId)}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leitura executiva</CardTitle>
            <CardDescription>O cenário precisa responder rápido quanto arrecada e quem é impactado.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Metric title="Imóveis avaliados" value={String(summary?.parcelsEvaluated ?? 0)} />
            <Metric title="Delta total" value={money(summary?.totalDelta ?? 0)} />
            <Metric title="Impacto anual estimado" value={money(summary?.estimatedAnnualArrecadationImpact ?? 0)} />
            <Metric title="Pressão urbana alta" value={String(simulationMutation.data?.highlights.withHigherUrbanPressure ?? 0)} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Comparativo venal</CardTitle>
            <CardDescription>Atual versus proposto, em leitura rápida para banca e Fazenda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chart.length > 0 ? (
              chart.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-on-surface">{item.label}</span>
                    <span className="text-on-surface-muted">{money(item.proposedValue || item.currentValue)}</span>
                  </div>
                  <div className="grid gap-2">
                    <BarRow label="Atual" value={item.currentValue} max={Math.max(item.currentValue, item.proposedValue)} tone="bg-sky-500" />
                    <BarRow label="Proposto" value={item.proposedValue} max={Math.max(item.currentValue, item.proposedValue)} tone="bg-emerald-500" />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="Rode um cenário para visualizar o comparativo venal." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mapa territorial de impacto</CardTitle>
            <CardDescription>Zoneamento, bairro, via e uso que concentram os efeitos da revisão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdown.length > 0 ? (
              breakdown.map((item) => (
                <div key={`${item.type}-${item.label}`} className="rounded-2xl border border-border bg-surface/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                      <p className="text-xs text-on-surface-muted">{item.type} · {item.parcels} imóveis</p>
                    </div>
                    <Badge variant={item.delta >= 0 ? "success" : "warning"}>{money(item.delta)}</Badge>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(10, Math.abs(item.delta))) }%` }} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="A quebra territorial aparece aqui após a simulação." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Imóveis impactados</CardTitle>
            <CardDescription>Lista priorizada dos maiores impactos e possíveis divergências com CTM.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={topImpact}
              loading={simulationMutation.isPending}
              pageSize={5}
              emptyMessage="Nenhum imóvel impactado ainda."
              columns={[
                { key: "sqlu", label: "SQLU" },
                { key: "bairro", label: "Bairro" },
                { key: "logradouro", label: "Logradouro" },
                { key: "currentValue", label: "Atual", render: (value) => money(Number(value ?? 0)) },
                { key: "proposedValue", label: "Proposto", render: (value) => money(Number(value ?? 0)) },
                { key: "delta", label: "Delta", render: (value) => money(Number(value ?? 0)) },
                { key: "deltaPct", label: "%", render: (value) => `${Number(value ?? 0).toFixed(2)}%` },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cenários persistidos</CardTitle>
            <CardDescription>Base para comparação entre versões e narrativa de ganho fazendário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(scenariosQuery.data ?? []).slice(0, 6).map((scenario) => (
              <div key={scenario._id ?? scenario.name} className="rounded-2xl border border-border bg-surface/60 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-on-surface">{scenario.name ?? "Cenário"}</p>
                    <p className="text-xs text-on-surface-muted">{scenario.createdAt ? new Date(scenario.createdAt).toLocaleString("pt-BR") : "Agora"}</p>
                  </div>
                  <Badge variant="info">{money(scenario.summary?.totalDelta ?? 0)}</Badge>
                </div>
                <p className="mt-2 text-xs text-on-surface-muted">
                  {scenario.summary?.parcelsEvaluated ?? 0} imóveis · impacto anual {money(scenario.summary?.estimatedAnnualArrecadationImpact ?? 0)}
                </p>
              </div>
            ))}
            {versionsQuery.data?.length ? (
              <p className="text-xs text-on-surface-muted">
                Versão ativa: {versionsQuery.data.find((version) => version.isActive)?.code ?? versionsQuery.data[0]?.code ?? versionsQuery.data[0]?.name ?? "N/D"}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <datalist id="pgv-zones-list">
        {zonesQuery.data?.map((zone) => (
          <option key={zone._id} value={zone.code ?? zone.nome ?? zone.name ?? zone._id} />
        ))}
      </datalist>
      <datalist id="pgv-faces-list">
        {facesQuery.data?.map((face) => (
          <option key={face._id} value={face.code ?? face.nome ?? face.name ?? face._id} />
        ))}
      </datalist>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-on-surface-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-on-surface">{value}</p>
    </div>
  );
}

function BarRow({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const width = max > 0 ? Math.max(8, (value / max) * 100) : 0;
  return (
    <div className="grid grid-cols-[80px_1fr_92px] items-center gap-3">
      <span className="text-xs text-on-surface-muted">{label}</span>
      <div className="h-3 rounded-full bg-muted">
        <div className={`h-3 rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-right text-xs font-medium text-on-surface">{money(value)}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-on-surface-muted">{text}</div>;
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}
