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

type Template = {
  _id: string;
  id?: string;
  name: string;
  version: number;
  isActive: boolean;
  variables: string[];
};

type Batch = {
  _id: string;
  id?: string;
  protocol: string;
  templateName: string;
  templateVersion: number;
  status: "GERADA" | "ENTREGUE" | "DEVOLVIDA";
  letters: Array<{ id: string; status: "GERADA" | "ENTREGUE" | "DEVOLVIDA"; fileKey: string }>;
  createdAt?: string;
};

export default function CartasPage() {
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templateForm, setTemplateForm] = useState({
    name: "",
    html: "Notificacao da parcela {{sqlu}} para o endereco {{endereco}}.",
  });
  const [parcelStatusFilter, setParcelStatusFilter] = useState("ATIVO");

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ["letter-templates"],
    queryFn: () => apiFetch<Template[]>("/notifications-letters/templates"),
  });

  const { data: batches, isLoading: loadingBatches } = useQuery({
    queryKey: ["letter-batches"],
    queryFn: () => apiFetch<Batch[]>("/notifications-letters/batches"),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["letter-templates"] });
    await queryClient.invalidateQueries({ queryKey: ["letter-batches"] });
  };

  const createTemplate = useMutation({
    mutationFn: () =>
      apiFetch("/notifications-letters/templates", {
        method: "POST",
        body: JSON.stringify(templateForm),
      }),
    onSuccess: async () => {
      toast.success("Template criado.");
      setTemplateForm({
        name: "",
        html: "Notificacao da parcela {{sqlu}} para o endereco {{endereco}}.",
      });
      await refresh();
    },
    onError: () => toast.error("Falha ao criar template."),
  });

  const generateBatch = useMutation({
    mutationFn: () =>
      apiFetch("/notifications-letters/batches/generate", {
        method: "POST",
        body: JSON.stringify({
          templateId: selectedTemplateId,
          parcelStatus: parcelStatusFilter,
        }),
      }),
    onSuccess: async () => {
      toast.success("Lote de cartas gerado.");
      await refresh();
    },
    onError: () => toast.error("Falha ao gerar lote."),
  });

  const updateLetterStatus = useMutation({
    mutationFn: (params: { batchId: string; letterId: string; status: "ENTREGUE" | "DEVOLVIDA" }) =>
      apiFetch(`/notifications-letters/batches/${params.batchId}/letters/${params.letterId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: params.status }),
      }),
    onSuccess: async () => {
      toast.success("Status da carta atualizado.");
      await refresh();
    },
    onError: () => toast.error("Falha ao atualizar status."),
  });

  const downloadLetter = async (batchId: string, letterId: string) => {
    try {
      const payload = await apiFetch<{ url: string }>(
        `/notifications-letters/batches/${batchId}/letters/${letterId}/download`,
      );
      window.open(payload.url, "_blank");
    } catch {
      toast.error("Falha ao obter link de download.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Cartas de notificacao</h1>
        <p className="text-sm text-on-surface-muted">
          Templates versionados, geracao em lote, PDF e protocolo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Criar e versionar modelos HTML com variaveis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
            <Input
              placeholder="Nome do template"
              value={templateForm.name}
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="HTML com {{variaveis}}"
              value={templateForm.html}
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, html: e.target.value }))}
            />
            <Button loading={createTemplate.isPending} onClick={() => createTemplate.mutate()}>
              Criar template
            </Button>
          </div>

          <DataTable
            data={templates ?? []}
            loading={loadingTemplates}
            columns={[
              { key: "name", label: "Template" },
              { key: "version", label: "Versao" },
              {
                key: "isActive",
                label: "Ativo",
                render: (value) => (value ? "Sim" : "Nao"),
              },
              {
                key: "variables",
                label: "Variaveis",
                render: (value) => (Array.isArray(value) ? value.join(", ") : ""),
              },
            ]}
            emptyMessage="Sem templates cadastrados."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geracao em lote</CardTitle>
          <CardDescription>Filtra parcelas e gera PDFs com protocolo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <select
            className="h-11 rounded-xl border border-outline bg-surface-elevated px-4 text-sm text-on-surface"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            <option value="">Selecione template</option>
            {(templates ?? []).map((template) => {
              const id = template.id ?? template._id;
              return (
                <option key={id} value={id}>
                  {template.name} v{template.version}
                </option>
              );
            })}
          </select>

          <select
            className="h-11 rounded-xl border border-outline bg-surface-elevated px-4 text-sm text-on-surface"
            value={parcelStatusFilter}
            onChange={(e) => setParcelStatusFilter(e.target.value)}
          >
            <option value="ATIVO">ATIVO</option>
            <option value="INATIVO">INATIVO</option>
            <option value="CONFLITO">CONFLITO</option>
          </select>

          <Button
            loading={generateBatch.isPending}
            disabled={!selectedTemplateId}
            onClick={() => generateBatch.mutate()}
          >
            Gerar lote
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historico de lotes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={batches ?? []}
            loading={loadingBatches}
            columns={[
              { key: "protocol", label: "Protocolo" },
              { key: "templateName", label: "Template" },
              {
                key: "status",
                label: "Status",
                render: (value) => (
                  <Badge
                    variant={
                      value === "ENTREGUE" ? "success" : value === "DEVOLVIDA" ? "destructive" : "info"
                    }
                  >
                    {String(value)}
                  </Badge>
                ),
              },
              { key: "createdAt", label: "Criado em" },
            ]}
            emptyMessage="Sem lotes gerados."
          />

          <div className="mt-4 space-y-4">
            {(batches ?? []).map((batch) => {
              const batchId = batch.id ?? batch._id;
              return (
                <div key={batchId} className="rounded-md border border-outline p-3">
                  <p className="text-sm font-semibold text-on-surface">
                    {batch.protocol} ({batch.letters.length} cartas)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {batch.letters.map((letter) => (
                      <div key={letter.id} className="flex items-center gap-2 rounded-md border border-outline px-2 py-1">
                        <span className="text-xs text-on-surface-muted">{letter.id.slice(0, 8)}</span>
                        <Badge variant={letter.status === "ENTREGUE" ? "success" : letter.status === "DEVOLVIDA" ? "destructive" : "info"}>
                          {letter.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => downloadLetter(batchId, letter.id)}>
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          loading={updateLetterStatus.isPending}
                          onClick={() => updateLetterStatus.mutate({ batchId, letterId: letter.id, status: "ENTREGUE" })}
                        >
                          Entregue
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          loading={updateLetterStatus.isPending}
                          onClick={() => updateLetterStatus.mutate({ batchId, letterId: letter.id, status: "DEVOLVIDA" })}
                        >
                          Devolvida
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

