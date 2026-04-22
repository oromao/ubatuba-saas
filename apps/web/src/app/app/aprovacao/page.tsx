"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type Parcel = {
  _id: string;
  sqlu?: string;
  inscricao?: string;
  enderecoPrincipal?: { logradouro?: string; numero?: string; bairro?: string };
  workflowStatus?: string;
  pendencias?: string[];
};

type ParcelsResponse = {
  items?: Parcel[];
  data?: Parcel[];
  total?: number;
};

type BulkResult = {
  total: number;
  successful: number;
  failed: number;
  results: { id: string; status: string; message?: string }[];
};

const STATUS_BADGE: Record<string, "default" | "destructive" | "outline" | "success" | "warning" | "info"> = {
  PENDENTE: "warning",
  EM_VALIDACAO: "info",
  APROVADA: "success",
  REPROVADA: "destructive",
};

const WORKFLOW_STATUSES = ["PENDENTE", "EM_VALIDACAO", "APROVADA", "REPROVADA"];

export default function AprovacaoPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [observacao, setObservacao] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState<string>("PENDENTE");
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: parcelsData, isLoading } = useQuery<ParcelsResponse>({
    queryKey: ["ctm-parcels", workflowFilter],
    queryFn: () =>
      apiFetch<ParcelsResponse>(`/ctm/parcels?workflowStatus=${workflowFilter}&limit=100`),
  });

  const { data: pendingData } = useQuery<{ items?: Parcel[]; total?: number }>({
    queryKey: ["ctm-parcels-pending"],
    queryFn: () =>
      apiFetch<{ items?: Parcel[]; total?: number }>("/ctm/parcels/pendencias"),
  });

  const bulkMutation = useMutation<BulkResult, Error, { ids: string[]; status: string; observacao: string }>({
    mutationFn: (body) =>
      apiFetch<BulkResult>("/ctm/parcels/bulk-transicao", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["ctm-parcels"] });
      queryClient.invalidateQueries({ queryKey: ["ctm-parcels-pending"] });
      setSelected([]);
      setObservacao("");
      setResultMsg(
        `${result.successful} processado(s) com sucesso${result.failed > 0 ? `, ${result.failed} erro(s)` : "."}`
      );
      setTimeout(() => setResultMsg(null), 3000);
    },
  });

  const parcels: Parcel[] = parcelsData?.items ?? (parcelsData as any)?.data ?? [];
  const pendingCount =
    pendingData?.total ??
    (pendingData?.items ?? []).length;

  const allSelected = parcels.length > 0 && selected.length === parcels.length;

  function toggleAll() {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(parcels.map((p) => p._id));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleBulkAction(status: string) {
    if (selected.length === 0) return;
    bulkMutation.mutate({ ids: selected, status, observacao });
  }

  function formatAddress(parcel: Parcel) {
    const e = parcel.enderecoPrincipal;
    if (!e) return "—";
    return [e.logradouro, e.numero, e.bairro].filter(Boolean).join(", ") || "—";
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Fila de Aprovacao</h1>
        <p className="text-muted-foreground mt-1">Revise e aprove lotes em analise</p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap">
        <Card className="flex-1 min-w-[180px]">
          <CardHeader className="pb-2">
            <CardDescription>Pendencias abertas</CardDescription>
            <CardTitle className="text-3xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="flex-1 min-w-[180px]">
          <CardHeader className="pb-2">
            <CardDescription>Exibindo ({workflowFilter})</CardDescription>
            <CardTitle className="text-3xl">{parcels.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {WORKFLOW_STATUSES.map((s) => (
          <Button
            key={s}
            variant={workflowFilter === s ? "primary" : "outline"}
            size="sm"
            onClick={() => {
              setWorkflowFilter(s);
              setSelected([]);
            }}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-medium">{selected.length} selecionado(s)</p>
            <textarea
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm min-h-[64px] resize-y"
              placeholder="Observacao (opcional, compartilhada para todos)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => handleBulkAction("APROVADA")}
                disabled={bulkMutation.isPending}
              >
                Aprovar Selecionados
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction("REPROVADA")}
                disabled={bulkMutation.isPending}
              >
                Rejeitar Selecionados
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("EM_VALIDACAO")}
                disabled={bulkMutation.isPending}
              >
                Enviar para Validacao
              </Button>
            </div>
            {resultMsg && (
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">{resultMsg}</p>
            )}
            {bulkMutation.isError && (
              <p className="text-sm text-destructive">{bulkMutation.error?.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parcel table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
          ) : parcels.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">Nenhum lote encontrado com status {workflowFilter}.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="cursor-pointer"
                      title="Selecionar todos"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">SQLU</th>
                  <th className="px-4 py-3 text-left">Inscricao</th>
                  <th className="px-4 py-3 text-left">Endereco</th>
                  <th className="px-4 py-3 text-left">Status Workflow</th>
                  <th className="px-4 py-3 text-left">Pendencias</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel) => (
                  <tr
                    key={parcel._id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(parcel._id)}
                        onChange={() => toggleOne(parcel._id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <Link
                        href={`/app/ctm/parcelas/${parcel._id}`}
                        className="text-primary hover:underline"
                      >
                        {parcel.sqlu || parcel._id.slice(-6)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{parcel.inscricao || "—"}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate">{formatAddress(parcel)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[parcel.workflowStatus ?? ""] ?? "outline"}>
                        {parcel.workflowStatus || "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {parcel.pendencias && parcel.pendencias.length > 0
                        ? parcel.pendencias.length
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
