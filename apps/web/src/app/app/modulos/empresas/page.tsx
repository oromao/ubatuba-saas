"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/app/data-table";
import { Input } from "@/components/ui/input";

type BusinessPermit = {
  _id: string;
  protocolNumber: string;
  companyName: string;
  cnpj: string;
  activityDescription: string;
  status: string;
  currentStage?: string;
  responsibleDepartment?: string;
  history?: Array<{ id: string; message: string; stage?: string; action?: string; createdAt: string }>;
  taxes?: Array<{ id: string; description: string; amount: number; status: string }>;
  evidences?: Array<{ id: string; title: string; note?: string; fileName?: string }>;
  decision?: { kind: string; reason?: string; at: string };
  permitPdfKey?: string;
};

export default function EmpresasPage() {
  const queryClient = useQueryClient();
  const [companyName, setCompanyName] = useState("Empresa Demo Ubatuba");
  const [cnpj, setCnpj] = useState("12.345.678/0001-99");
  const [activityDescription, setActivityDescription] = useState("Comercio local e servicos");

  const permitsQuery = useQuery({
    queryKey: ["permits-business"],
    queryFn: () => apiFetch<BusinessPermit[]>("/permits-business"),
  });
  const permitsError = permitsQuery.error ?? null;

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<BusinessPermit>("/permits-business", {
        method: "POST",
        body: JSON.stringify({
          companyName,
          cnpj,
          activityDescription,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits-business"] }),
  });

  const selected = permitsQuery.data?.[0];
  const addEvidenceMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Sem processo selecionado");
      return apiFetch<BusinessPermit>(`/permits-business/${selected._id}/evidences`, {
        method: "POST",
        body: JSON.stringify({ title: "Documentacao societaria", note: "Contrato social e consulta de CNAE atualizados." }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits-business"] }),
  });

  const respondRequirementMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Sem processo selecionado");
      return apiFetch<BusinessPermit>(`/permits-business/${selected._id}/requirements/response`, {
        method: "POST",
        body: JSON.stringify({ note: "Exigencia atendida com comprovantes cadastrais e tributarios." }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits-business"] }),
  });

  const decideMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Sem processo selecionado");
      return apiFetch<BusinessPermit>(`/permits-business/${selected._id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision: "DEFERIDO", reason: "CNAE compativel, documentacao completa e taxas previstas." }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits-business"] }),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Alvará de Empresas</h1>
          <p className="text-sm text-on-surface-muted">Abertura e emissão digital com trilha de status.</p>
        </div>
        <Badge variant="info">P1</Badge>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        {permitsError && (
          <Card className="border-rose-200 bg-rose-50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-rose-900">Alvará indisponível</CardTitle>
              <CardDescription className="text-rose-800">
                Não foi possível carregar as solicitações de empresas neste momento. Tente novamente ou revise a integração.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-rose-800">
              {permitsError instanceof Error ? permitsError.message : "Falha inesperada ao carregar o alvará de empresas."}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Abrir solicitação</CardTitle>
            <CardDescription>Fluxo inicial para inscrição mobiliária e alvará.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Razão social" />
            <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="CNPJ" />
            <Input value={activityDescription} onChange={(e) => setActivityDescription(e.target.value)} placeholder="Atividade" />
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Abrindo..." : "Abrir solicitação"}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => respondRequirementMutation.mutate()} disabled={respondRequirementMutation.isPending || !selected}>
                Responder exigência
              </Button>
              <Button variant="outline" onClick={() => addEvidenceMutation.mutate()} disabled={addEvidenceMutation.isPending || !selected}>
                Anexar evidência
              </Button>
              <Button variant="outline" onClick={() => decideMutation.mutate()} disabled={decideMutation.isPending || !selected}>
                Deferir
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Solicitações</CardTitle>
            <CardDescription>Lista operacional do alvará digital de empresas.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={permitsQuery.data ?? []}
              loading={permitsQuery.isLoading}
              columns={[
                { key: "protocolNumber", label: "Protocolo" },
                { key: "companyName", label: "Empresa" },
                { key: "cnpj", label: "CNPJ" },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => <Badge variant="info">{String(value)}</Badge>,
                },
                { key: "currentStage", label: "Etapa", render: (value) => String(value ?? "-") },
                { key: "responsibleDepartment", label: "Responsavel", render: (value) => String(value ?? "-") },
                { key: "permitPdfKey", label: "PDF" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {selected ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalhe do processo</CardTitle>
              <CardDescription>O fluxo deixa explícito a tramitação entre análise, taxas e emissão.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-on-surface-muted">Protocolo {selected.protocolNumber} · {selected.currentStage ?? "ABERTURA"}</p>
              <div className="grid gap-2">
                {(selected.taxes ?? []).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-surface/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-on-surface">{item.description}</span>
                      <Badge variant={item.status === "PAGO" ? "success" : "warning"}>{item.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-on-surface-muted">R$ {Number(item.amount ?? 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                {(selected.evidences ?? []).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-surface/60 p-3 text-sm">
                    <p className="font-medium text-on-surface">{item.title}</p>
                    <p className="text-xs text-on-surface-muted">{item.note ?? "Evidência registrada."}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trilha de auditoria</CardTitle>
              <CardDescription>Sequência real de tramitação, com decisão final e histórico claro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(selected.history ?? []).slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-surface/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{item.stage ?? "—"}</Badge>
                    <span className="text-xs text-on-surface-muted">{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="mt-2 text-sm text-on-surface">{item.message}</p>
                </div>
              ))}
              {selected.decision ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm font-semibold text-emerald-900">Decisão: {selected.decision.kind}</p>
                  <p className="text-xs text-emerald-900/80">{selected.decision.reason ?? "Sem justificativa"}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
