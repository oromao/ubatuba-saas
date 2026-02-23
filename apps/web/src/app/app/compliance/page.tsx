"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type ComplianceProfile = {
  company?: {
    legalName?: string;
    cnpj?: string;
    mdRegistry?: string;
    creaCauNumber?: string;
  };
  technicalResponsibles?: Array<{ id: string; name: string; creaCauNumber?: string; registryType?: string; validUntil?: string }>;
  artsRrts?: Array<{ id: string; type: string; number: string; validUntil?: string }>;
  cats?: Array<{ id: string; number: string; validUntil?: string }>;
  team?: Array<{ id: string; name: string; role: string }>;
  checklist?: Array<{ id: string; requirementCode: string; title: string; status: "OK" | "PENDENTE" | "EXPIRADO" }>;
};

export default function CompliancePage() {
  const queryClient = useQueryClient();
  const [company, setCompany] = useState({
    legalName: "",
    cnpj: "",
    mdRegistry: "",
    creaCauNumber: "",
  });
  const [responsible, setResponsible] = useState({
    name: "",
    creaCauNumber: "",
    registryType: "CREA",
    validUntil: "",
  });
  const [teamMember, setTeamMember] = useState({
    name: "",
    role: "",
  });
  const [checklist, setChecklist] = useState({
    requirementCode: "",
    title: "",
    status: "PENDENTE",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["compliance-profile"],
    queryFn: () => apiFetch<ComplianceProfile>("/compliance"),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["compliance-profile"] });
  };

  const saveCompany = useMutation({
    mutationFn: () => apiFetch("/compliance/company", { method: "PUT", body: JSON.stringify(company) }),
    onSuccess: async () => {
      toast.success("Empresa atualizada.");
      await refresh();
    },
    onError: () => toast.error("Falha ao atualizar empresa."),
  });

  const addResponsible = useMutation({
    mutationFn: () =>
      apiFetch("/compliance/responsibles", {
        method: "POST",
        body: JSON.stringify(responsible),
      }),
    onSuccess: async () => {
      toast.success("Responsavel adicionado.");
      setResponsible({ name: "", creaCauNumber: "", registryType: "CREA", validUntil: "" });
      await refresh();
    },
    onError: () => toast.error("Falha ao adicionar responsavel."),
  });

  const addTeamMember = useMutation({
    mutationFn: () => apiFetch("/compliance/team", { method: "POST", body: JSON.stringify(teamMember) }),
    onSuccess: async () => {
      toast.success("Membro da equipe adicionado.");
      setTeamMember({ name: "", role: "" });
      await refresh();
    },
    onError: () => toast.error("Falha ao adicionar equipe."),
  });

  const upsertChecklist = useMutation({
    mutationFn: () => apiFetch("/compliance/checklist", { method: "PUT", body: JSON.stringify(checklist) }),
    onSuccess: async () => {
      toast.success("Checklist atualizado.");
      setChecklist({ requirementCode: "", title: "", status: "PENDENTE" });
      await refresh();
    },
    onError: () => toast.error("Falha ao atualizar checklist."),
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Compliance</h1>
        <p className="text-sm text-on-surface-muted">
          Gestao de conformidade editalicia: empresa, responsaveis, ART/RRT, CAT, equipe e checklist.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Empresa</CardTitle>
            <CardDescription>Registro institucional e dados principais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Razao social"
              value={company.legalName}
              onChange={(e) => setCompany((prev) => ({ ...prev, legalName: e.target.value }))}
            />
            <Input
              placeholder="CNPJ"
              value={company.cnpj}
              onChange={(e) => setCompany((prev) => ({ ...prev, cnpj: e.target.value }))}
            />
            <Input
              placeholder="Registro Ministerio da Defesa"
              value={company.mdRegistry}
              onChange={(e) => setCompany((prev) => ({ ...prev, mdRegistry: e.target.value }))}
            />
            <Input
              placeholder="CREA/CAU empresa"
              value={company.creaCauNumber}
              onChange={(e) => setCompany((prev) => ({ ...prev, creaCauNumber: e.target.value }))}
            />
            <Button loading={saveCompany.isPending} onClick={() => saveCompany.mutate()}>
              Salvar empresa
            </Button>
            {data?.company && (
              <div className="rounded-md border border-outline bg-cloud p-3 text-xs text-on-surface-muted">
                <p>Atual: {data.company.legalName || "-"}</p>
                <p>CNPJ: {data.company.cnpj || "-"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist de conformidade</CardTitle>
            <CardDescription>Status por requisito do edital.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Codigo requisito (ex: R10)"
              value={checklist.requirementCode}
              onChange={(e) => setChecklist((prev) => ({ ...prev, requirementCode: e.target.value }))}
            />
            <Input
              placeholder="Titulo"
              value={checklist.title}
              onChange={(e) => setChecklist((prev) => ({ ...prev, title: e.target.value }))}
            />
            <select
              className="h-11 w-full rounded-xl border border-outline bg-surface-elevated px-4 text-sm text-on-surface"
              value={checklist.status}
              onChange={(e) =>
                setChecklist((prev) => ({
                  ...prev,
                  status: e.target.value as "OK" | "PENDENTE" | "EXPIRADO",
                }))
              }
            >
              <option value="OK">OK</option>
              <option value="PENDENTE">PENDENTE</option>
              <option value="EXPIRADO">EXPIRADO</option>
            </select>
            <Button loading={upsertChecklist.isPending} onClick={() => upsertChecklist.mutate()}>
              Atualizar checklist
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Responsaveis tecnicos</CardTitle>
            <CardDescription>Cadastro CREA/CAU e validade.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Nome"
              value={responsible.name}
              onChange={(e) => setResponsible((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="CREA/CAU"
              value={responsible.creaCauNumber}
              onChange={(e) => setResponsible((prev) => ({ ...prev, creaCauNumber: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="h-11 w-full rounded-xl border border-outline bg-surface-elevated px-4 text-sm text-on-surface"
                value={responsible.registryType}
                onChange={(e) => setResponsible((prev) => ({ ...prev, registryType: e.target.value }))}
              >
                <option value="CREA">CREA</option>
                <option value="CAU">CAU</option>
              </select>
              <Input
                placeholder="Valido ate"
                value={responsible.validUntil}
                onChange={(e) => setResponsible((prev) => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
            <Button loading={addResponsible.isPending} onClick={() => addResponsible.mutate()}>
              Adicionar responsavel
            </Button>

            <DataTable
              data={data?.technicalResponsibles ?? []}
              loading={isLoading}
              columns={[
                { key: "name", label: "Nome" },
                { key: "registryType", label: "Registro" },
                { key: "creaCauNumber", label: "Numero" },
                { key: "validUntil", label: "Validade" },
              ]}
              emptyMessage="Sem responsaveis cadastrados."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipe tecnica</CardTitle>
            <CardDescription>Atribuicoes e evidencias da equipe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Nome"
              value={teamMember.name}
              onChange={(e) => setTeamMember((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Cargo/funcao"
              value={teamMember.role}
              onChange={(e) => setTeamMember((prev) => ({ ...prev, role: e.target.value }))}
            />
            <Button loading={addTeamMember.isPending} onClick={() => addTeamMember.mutate()}>
              Adicionar equipe
            </Button>
            <DataTable
              data={data?.team ?? []}
              loading={isLoading}
              columns={[
                { key: "name", label: "Nome" },
                { key: "role", label: "Cargo" },
              ]}
              emptyMessage="Sem equipe cadastrada."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ART/RRT e CAT</CardTitle>
          <CardDescription>Visao consolidada de documentos tecnicos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-on-surface">ART/RRT</h3>
            <DataTable
              data={data?.artsRrts ?? []}
              loading={isLoading}
              columns={[
                { key: "type", label: "Tipo" },
                { key: "number", label: "Numero" },
                { key: "validUntil", label: "Validade" },
              ]}
              emptyMessage="Sem ART/RRT cadastrada."
            />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-on-surface">CAT</h3>
            <DataTable
              data={data?.cats ?? []}
              loading={isLoading}
              columns={[
                { key: "number", label: "Numero" },
                { key: "validUntil", label: "Validade" },
              ]}
              emptyMessage="Sem CAT cadastrada."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status geral</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(data?.checklist ?? []).map((item) => (
            <Badge
              key={item.id}
              variant={item.status === "OK" ? "success" : item.status === "EXPIRADO" ? "destructive" : "warning"}
            >
              {item.requirementCode}: {item.status}
            </Badge>
          ))}
          {(data?.checklist ?? []).length === 0 && (
            <p className="text-sm text-on-surface-muted">Nenhum item de checklist cadastrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

