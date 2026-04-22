"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

type ReportType = "parcelas" | "fiscalizacao" | "executivo";

const STATUS_OPTIONS = ["RASCUNHO", "ENVIADA", "EM_ANALISE", "APROVADA", "REJEITADA"];

function exportParcelasCSV(porStatus: { _id: string; count: number }[]) {
  const header = "Status,Quantidade";
  const rows = porStatus.map((r) => `${r._id ?? "N/A"},${r.count}`);
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `relatorio-parcelas-${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

type ParcelasData = {
  resumo: { total: number; withPendencias: number; semPendencias: number };
  porStatus: { _id: string; count: number }[];
  porWorkflow: { _id: string; count: number }[];
};

type FiscalizacaoData = {
  resumo: { total: number; aprovadas: number; pendentes: number; taxaAprovacao: number };
  porStatus: { _id: string; count: number }[];
  porTipo: { _id: string; count: number }[];
  recentes: { tipo: string; data: string; status: string; parcelId: string }[];
  periodo: { inicio: string; fim: string };
};

type ExecutivoData = {
  parcelas: ParcelasData;
  vistorias: FiscalizacaoData;
  geradoEm: string;
};

function ParcelasResult({ data }: { data: ParcelasData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{data.resumo.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Com Pendências</p>
            <p className="text-2xl font-semibold text-amber-600">{data.resumo.withPendencias}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sem Pendências</p>
            <p className="text-2xl font-semibold text-green-600">{data.resumo.semPendencias}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Por Status Cadastral</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1 text-left font-medium text-muted-foreground">Status</th>
                  <th className="py-1 text-right font-medium text-muted-foreground">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {data.porStatus.map((row) => (
                  <tr key={row._id} className="border-b last:border-0">
                    <td className="py-1">{row._id ?? "—"}</td>
                    <td className="py-1 text-right font-semibold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Por Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1 text-left font-medium text-muted-foreground">Workflow</th>
                  <th className="py-1 text-right font-medium text-muted-foreground">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {data.porWorkflow.map((row) => (
                  <tr key={row._id} className="border-b last:border-0">
                    <td className="py-1">{row._id ?? "—"}</td>
                    <td className="py-1 text-right font-semibold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => exportParcelasCSV(data.porStatus)}>
          Exportar CSV
        </Button>
      </div>
    </div>
  );
}

function FiscalizacaoResult({ data }: { data: FiscalizacaoData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{data.resumo.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Aprovadas</p>
            <p className="text-2xl font-semibold text-green-600">{data.resumo.aprovadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-semibold text-amber-600">{data.resumo.pendentes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Taxa Aprovação</p>
            <p className="text-2xl font-semibold">{data.resumo.taxaAprovacao}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1 text-left font-medium text-muted-foreground">Status</th>
                  <th className="py-1 text-right font-medium text-muted-foreground">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {data.porStatus.map((row) => (
                  <tr key={row._id} className="border-b last:border-0">
                    <td className="py-1">{row._id ?? "—"}</td>
                    <td className="py-1 text-right font-semibold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="py-1 text-right font-medium text-muted-foreground">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {data.porTipo.map((row) => (
                  <tr key={row._id} className="border-b last:border-0">
                    <td className="py-1">{row._id ?? "—"}</td>
                    <td className="py-1 text-right font-semibold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ExecutivoResult({ data }: { data: ExecutivoData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Parcelas
        </h3>
        <ParcelasResult data={data.parcelas} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fiscalização
        </h3>
        <FiscalizacaoResult data={data.vistorias} />
      </div>
      <p className="text-xs text-muted-foreground">
        Gerado em: {new Date(data.geradoEm).toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

export default function RelatoriosPage() {
  const [activeType, setActiveType] = useState<ReportType>("parcelas");
  const [generate, setGenerate] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState("");

  const buildPath = () => {
    if (activeType === "fiscalizacao") {
      const params = new URLSearchParams();
      if (dataInicio) params.set("dataInicio", dataInicio);
      if (dataFim) params.set("dataFim", dataFim);
      if (status) params.set("status", status);
      const qs = params.toString();
      return `/reports/fiscalizacao${qs ? `?${qs}` : ""}`;
    }
    return `/reports/${activeType}`;
  };

  const { data, isFetching, error } = useQuery({
    queryKey: ["reports", activeType, dataInicio, dataFim, status, generate],
    queryFn: () => apiFetch<ParcelasData | FiscalizacaoData | ExecutivoData>(buildPath()),
    enabled: generate,
  });

  const handleGenerate = () => {
    setGenerate(true);
  };

  const handleTypeChange = (type: ReportType) => {
    setActiveType(type);
    setGenerate(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Gere e exporte relatórios cadastrais e de fiscalização.</p>
      </div>

      {/* Report type selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tipo de Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["parcelas", "fiscalizacao", "executivo"] as ReportType[]).map((type) => (
              <Button
                key={type}
                variant={activeType === type ? "primary" : "outline"}
                size="sm"
                onClick={() => handleTypeChange(type)}
              >
                {type === "parcelas" && "Parcelas"}
                {type === "fiscalizacao" && "Fiscalização"}
                {type === "executivo" && "Executivo"}
              </Button>
            ))}
          </div>

          {/* Fiscalizacao filters */}
          {activeType === "fiscalizacao" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => { setDataInicio(e.target.value); setGenerate(false); }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => { setDataFim(e.target.value); setGenerate(false); }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setGenerate(false); }}
                >
                  <option value="">Todos</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={isFetching}>
            {isFetching ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">Erro ao carregar relatório. Tente novamente.</p>
          </CardContent>
        </Card>
      )}

      {data && !isFetching && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {activeType === "parcelas" && "Relatório de Parcelas"}
              {activeType === "fiscalizacao" && "Relatório de Fiscalização"}
              {activeType === "executivo" && "Relatório Executivo"}
            </CardTitle>
            <CardDescription>
              {activeType === "fiscalizacao" && (
                <span className="flex gap-2">
                  {(data as FiscalizacaoData).periodo.inicio !== "todos" && (
                    <Badge variant="outline">De: {(data as FiscalizacaoData).periodo.inicio}</Badge>
                  )}
                  {(data as FiscalizacaoData).periodo.fim !== "todos" && (
                    <Badge variant="outline">Até: {(data as FiscalizacaoData).periodo.fim}</Badge>
                  )}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeType === "parcelas" && <ParcelasResult data={data as ParcelasData} />}
            {activeType === "fiscalizacao" && <FiscalizacaoResult data={data as FiscalizacaoData} />}
            {activeType === "executivo" && <ExecutivoResult data={data as ExecutivoData} />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
