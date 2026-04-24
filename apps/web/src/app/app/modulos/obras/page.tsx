"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/app/data-table";
import { useState } from "react";

type PermitRequest = {
  _id: string;
  protocolNumber: string;
  applicantName: string;
  subjectAddress: string;
  status: string;
  currentStage?: string;
  responsibleDepartment?: string;
  history?: Array<{ id: string; message: string; stage?: string; action?: string; createdAt: string }>;
  requirements?: Array<{ id: string; title: string; status: string; notes?: string; responsibleDepartment?: string }>;
  evidences?: Array<{ id: string; title: string; note?: string; fileName?: string }>;
  decision?: { kind: string; reason?: string; at: string };
  decisionPdfKey?: string;
};

export default function ObrasPage() {
  const queryClient = useQueryClient();
  const [applicantName, setApplicantName] = useState("Construtora Demo");
  const [subjectAddress, setSubjectAddress] = useState("Rua da Praia, 100");
  const [requirements, setRequirements] = useState("Projeto arquitetonico, ART/RRT, taxas");

  const requestsQuery = useQuery({
    queryKey: ["permits-works"],
    queryFn: () => apiFetch<PermitRequest[]>("/permits-works"),
  });
  const requestsError = requestsQuery.error ?? null;

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<PermitRequest>("/permits-works", {
        method: "POST",
        body: JSON.stringify({
          applicantName,
          subjectAddress,
          requirements: requirements.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits-works"] }),
  });

  const selected = requestsQuery.data?.[0];
  const respondRequirementMutation = useMutation({
    mutationFn: () => {
      const requirementId = selected?.requirements?.find((item) => item.status === "ABERTA")?.id;
      if (!selected || !requirementId) throw new Error("Sem exigencia aberta para responder");
      return apiFetch<PermitRequest>(`/permits-works/${selected._id}/requirements/${requirementId}/response`, {
        method: "POST",
        body: JSON.stringify({ note: "Documentacao complementada e memoria tecnica atualizada." }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits-works"] }),
  });

  const addEvidenceMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Sem processo selecionado");
      return apiFetch<PermitRequest>(`/permits-works/${selected._id}/evidences`, {
        method: "POST",
        body: JSON.stringify({ title: "Relatorio tecnico", note: "Laudo, ART e fotografia de obra anexados." }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits-works"] }),
  });

  const decideMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Sem processo selecionado");
      return apiFetch<PermitRequest>(`/permits-works/${selected._id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision: "DEFERIDO", reason: "Atende aos requisitos tecnicos e fiscais." }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permits-works"] }),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Alvará de Obras</h1>
          <p className="text-sm text-on-surface-muted">Fluxo com etapas, exigências, parecer, decisão e histórico auditável.</p>
        </div>
        <Badge variant="info">P1</Badge>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        {requestsError && (
          <Card className="border-rose-200 bg-rose-50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-rose-900">Alvará de obras indisponível</CardTitle>
              <CardDescription className="text-rose-800">
                Não foi possível carregar as solicitações de obra neste momento. Tente novamente ou revise a integração.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-rose-800">
              {requestsError instanceof Error ? requestsError.message : "Falha inesperada ao carregar o alvará de obras."}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Abrir solicitação</CardTitle>
            <CardDescription>Reaproveita o núcleo de processos e armazenamento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} placeholder="Requerente" />
            <Input value={subjectAddress} onChange={(e) => setSubjectAddress(e.target.value)} placeholder="Endereço da obra" />
            <Input value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Exigências separadas por vírgula" />
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
            <CardDescription>Status, emissão e rastreabilidade do alvará.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={requestsQuery.data ?? []}
              loading={requestsQuery.isLoading}
              columns={[
                { key: "protocolNumber", label: "Protocolo" },
                { key: "applicantName", label: "Requerente" },
                { key: "subjectAddress", label: "Endereço" },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => <Badge variant="info">{String(value)}</Badge>,
                },
                { key: "currentStage", label: "Etapa", render: (value) => String(value ?? "-") },
                { key: "responsibleDepartment", label: "Responsavel", render: (value) => String(value ?? "-") },
                { key: "decisionPdfKey", label: "PDF" },
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
              <CardDescription>Mostra onde o processo está travado e o que já foi produzido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-on-surface-muted">Protocolo {selected.protocolNumber} · {selected.currentStage ?? "ABERTURA"}</p>
              <div className="grid gap-2">
                {(selected.requirements ?? []).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-surface/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-on-surface">{item.title}</span>
                      <Badge variant={item.status === "ATENDIDA" ? "success" : "warning"}>{item.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-on-surface-muted">{item.notes ?? "Aguardando resposta do interessado."}</p>
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
              <CardDescription>Sequência real de tramitação, do protocolo ao fechamento.</CardDescription>
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
