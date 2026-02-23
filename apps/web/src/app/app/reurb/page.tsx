"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type TenantConfig = {
  reurbEnabled: boolean;
  spreadsheet?: { templateVersion?: string; columns?: Array<{ key: string; label: string; required?: boolean }> };
};

type Family = {
  id: string;
  familyCode: string;
  nucleus: string;
  responsibleName: string;
  cpf?: string;
  status: "APTA" | "PENDENTE" | "IRREGULAR";
};

type Pendency = {
  id: string;
  nucleus: string;
  documentType: string;
  missingDocument: string;
  status: "ABERTA" | "EM_ANALISE" | "RESOLVIDA";
  responsible: string;
};

type Deliverable = {
  id: string;
  kind: string;
  version: number;
  fileName: string;
  generatedAt: string;
  hashSha256: string;
};

export default function ReurbPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [newFamily, setNewFamily] = useState({
    familyCode: "",
    nucleus: "",
    responsibleName: "",
    cpf: "",
  });

  const configQuery = useQuery({
    queryKey: ["reurb-config"],
    queryFn: () => apiFetch<TenantConfig>("/reurb/tenant-config"),
  });

  const familiesQuery = useQuery({
    queryKey: ["reurb-families", q],
    queryFn: () => apiFetch<Family[]>(`/reurb/families${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  });

  const pendenciesQuery = useQuery({
    queryKey: ["reurb-pendencies"],
    queryFn: () => apiFetch<Pendency[]>("/reurb/pendencies"),
  });

  const deliverablesQuery = useQuery({
    queryKey: ["reurb-deliverables"],
    queryFn: () => apiFetch<Deliverable[]>("/reurb/deliverables"),
  });

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["reurb-families"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-pendencies"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-deliverables"] }),
      queryClient.invalidateQueries({ queryKey: ["reurb-config"] }),
    ]);
  };

  const toggleReurb = useMutation({
    mutationFn: async () =>
      apiFetch("/reurb/tenant-config", {
        method: "PUT",
        body: JSON.stringify({ reurbEnabled: !configQuery.data?.reurbEnabled }),
      }),
    onSuccess: async () => {
      toast.success("Configuracao REURB atualizada.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar configuracao.");
    },
  });

  const createFamily = useMutation({
    mutationFn: async () =>
      apiFetch("/reurb/families", {
        method: "POST",
        body: JSON.stringify({
          ...newFamily,
          status: "PENDENTE",
        }),
      }),
    onSuccess: async () => {
      toast.success("Familia cadastrada.");
      setNewFamily({ familyCode: "", nucleus: "", responsibleName: "", cpf: "" });
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao cadastrar familia.");
    },
  });

  const generatePlanilha = useMutation({
    mutationFn: () => apiFetch<Deliverable>("/reurb/planilha-sintese/generate", { method: "POST", body: "{}" }),
    onSuccess: async () => {
      toast.success("Planilha sintese gerada com sucesso.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao gerar planilha.");
    },
  });

  const generateCsv = useMutation({
    mutationFn: () => apiFetch<Deliverable>("/reurb/families/export.csv", { method: "POST", body: "{}" }),
    onSuccess: async () => {
      toast.success("Banco tabulado CSV gerado.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao exportar CSV.");
    },
  });

  const generateZip = useMutation({
    mutationFn: () => apiFetch<Deliverable>("/reurb/cartorio/package", { method: "POST", body: "{}" }),
    onSuccess: async () => {
      toast.success("Pacote do cartorio gerado.");
      await refreshAll();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao gerar pacote cartorio.");
    },
  });

  const columnsText = useMemo(
    () =>
      (configQuery.data?.spreadsheet?.columns ?? [])
        .map((item) => `${item.label}${item.required ? "*" : ""}`)
        .join(", "),
    [configQuery.data?.spreadsheet?.columns],
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">REURB</h1>
          <p className="text-sm text-on-surface-muted">
            Banco tabulado, planilha sintese, pendencias documentais e pacote cartorio por tenant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={configQuery.data?.reurbEnabled ? "success" : "warning"}>
            {configQuery.data?.reurbEnabled ? "REURB habilitado" : "REURB desabilitado"}
          </Badge>
          <Button loading={toggleReurb.isPending} onClick={() => toggleReurb.mutate()}>
            {configQuery.data?.reurbEnabled ? "Desativar" : "Ativar"} REURB
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entregaveis obrigatorios</CardTitle>
          <CardDescription>
            Geracao bloqueada automaticamente quando houver inconsistencias de conformidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button loading={generatePlanilha.isPending} onClick={() => generatePlanilha.mutate()}>
            Gerar Planilha Sintese
          </Button>
          <Button variant="outline" loading={generateCsv.isPending} onClick={() => generateCsv.mutate()}>
            Exportar Banco Tabulado (CSV)
          </Button>
          <Button variant="outline" loading={generateZip.isPending} onClick={() => generateZip.mutate()}>
            Gerar Pacote Cartorio (ZIP)
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de familias beneficiarias</CardTitle>
            <CardDescription>Modelo estruturado, com status Apta/Pendente/Irregular.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Codigo da familia"
                value={newFamily.familyCode}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, familyCode: e.target.value }))}
              />
              <Input
                placeholder="Nucleo"
                value={newFamily.nucleus}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, nucleus: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Responsavel"
                value={newFamily.responsibleName}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, responsibleName: e.target.value }))}
              />
              <Input
                placeholder="CPF"
                value={newFamily.cpf}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, cpf: e.target.value }))}
              />
            </div>
            <Button loading={createFamily.isPending} onClick={() => createFamily.mutate()}>
              Cadastrar familia
            </Button>
            <Input placeholder="Buscar por codigo, responsavel, CPF..." value={q} onChange={(e) => setQ(e.target.value)} />
            <DataTable
              data={familiesQuery.data ?? []}
              loading={familiesQuery.isLoading}
              columns={[
                { key: "familyCode", label: "Codigo" },
                { key: "nucleus", label: "Nucleo" },
                { key: "responsibleName", label: "Responsavel" },
                { key: "status", label: "Status" },
              ]}
              emptyMessage="Nenhuma familia cadastrada."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendencias documentais</CardTitle>
            <CardDescription>Controle por nucleo/familia com trilha de status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={pendenciesQuery.data ?? []}
              loading={pendenciesQuery.isLoading}
              columns={[
                { key: "nucleus", label: "Nucleo" },
                { key: "documentType", label: "Tipo" },
                { key: "missingDocument", label: "Documento faltante" },
                { key: "responsible", label: "Responsavel" },
                { key: "status", label: "Status" },
              ]}
              emptyMessage="Nenhuma pendencia cadastrada."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historico de entregaveis</CardTitle>
          <CardDescription>
            Template: {configQuery.data?.spreadsheet?.templateVersion ?? "v1"}. Colunas: {columnsText || "padrao"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={deliverablesQuery.data ?? []}
            loading={deliverablesQuery.isLoading}
            columns={[
              { key: "kind", label: "Tipo" },
              { key: "version", label: "Versao" },
              { key: "fileName", label: "Arquivo" },
              { key: "generatedAt", label: "Gerado em" },
              { key: "hashSha256", label: "Hash" },
            ]}
            emptyMessage="Nenhum entregavel gerado ainda."
          />
        </CardContent>
      </Card>
    </div>
  );
}
