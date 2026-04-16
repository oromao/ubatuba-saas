"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";

type HistoricoEntry = {
  status: string;
  observacao: string;
  userId: string;
  timestamp: string;
};

type Vistoria = {
  _id: string;
  parcelId: string;
  tipo: string;
  data: string;
  status: string;
  observacoes?: string;
  fotos: string[];
  historico: HistoricoEntry[];
  operadorId?: string;
  createdAt?: string;
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  RASCUNHO: ["ENVIADA", "CANCELADA"],
  ENVIADA: ["EM_ANALISE", "CANCELADA"],
  EM_ANALISE: ["APROVADA", "REJEITADA", "CANCELADA"],
  APROVADA: ["CANCELADA"],
  REJEITADA: [],
  CANCELADA: [],
};

const STATUS_COLOR: Record<string, "default" | "destructive" | "outline" | "info" | "success" | "warning"> = {
  RASCUNHO: "outline",
  ENVIADA: "info",
  EM_ANALISE: "warning",
  APROVADA: "success",
  REJEITADA: "destructive",
  CANCELADA: "default",
};

export default function VistoriaDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [transicaoObs, setTransicaoObs] = useState("");
  const [transicaoError, setTransicaoError] = useState<string | null>(null);

  const { data: vistoria, isLoading, error } = useQuery({
    queryKey: ["vistoria", id],
    queryFn: () => apiFetch<Vistoria>(`/ctm/vistorias/${id}`),
    enabled: !!id,
  });

  const transicaoMutation = useMutation({
    mutationFn: ({ status, observacao }: { status: string; observacao: string }) =>
      apiFetch<Vistoria>(`/ctm/vistorias/${id}/transicao`, {
        method: "POST",
        body: JSON.stringify({ status, observacao }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vistoria", id] });
      queryClient.invalidateQueries({ queryKey: ["ctm-vistorias"] });
      setDialogOpen(false);
      setNextStatus("");
      setTransicaoObs("");
      setTransicaoError(null);
    },
    onError: (err: Error) => {
      setTransicaoError(err.message);
    },
  });

  const handleTransicao = () => {
    if (!nextStatus) {
      setTransicaoError("Selecione o novo status");
      return;
    }
    setTransicaoError(null);
    transicaoMutation.mutate({ status: nextStatus, observacao: transicaoObs });
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8">
        <p className="text-sm text-on-surface-muted">Carregando...</p>
      </div>
    );
  }

  if (error || !vistoria) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8">
        <p className="text-sm text-destructive">Vistoria não encontrada.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const nextStatuses = VALID_TRANSITIONS[vistoria.status] ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-on-surface">
              Vistoria — {vistoria.tipo.replace("_", " ")}
            </h1>
            <Badge variant={STATUS_COLOR[vistoria.status] ?? "outline"}>{vistoria.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-on-surface-muted">
            Parcela:{" "}
            <Link
              href={`/app/ctm/parcelas/${vistoria.parcelId}`}
              className="font-mono text-primary hover:underline"
            >
              {vistoria.parcelId}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          {nextStatuses.length > 0 && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Avançar Status
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 grid gap-4 rounded-lg border p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-on-surface-muted">Data</p>
          <p className="mt-0.5 text-sm font-medium">
            {new Date(vistoria.data).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-on-surface-muted">Operador</p>
          <p className="mt-0.5 text-sm font-medium">{vistoria.operadorId ?? "—"}</p>
        </div>
        {vistoria.observacoes && (
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-on-surface-muted">Observações</p>
            <p className="mt-0.5 text-sm">{vistoria.observacoes}</p>
          </div>
        )}
      </div>

      {/* Fotos */}
      {vistoria.fotos?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-muted">
            Fotos ({vistoria.fotos.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {vistoria.fotos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <Image
                  src={url}
                  alt={`Foto ${i + 1}`}
                  width={256}
                  height={128}
                  unoptimized
                  className="h-32 w-full rounded-lg object-cover transition-opacity hover:opacity-80"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Historico */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-on-surface-muted">
          Histórico
        </h2>
        <div className="flex flex-col gap-3">
          {vistoria.historico?.map((entry, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_COLOR[entry.status] ?? "outline"} className="text-xs">
                    {entry.status}
                  </Badge>
                  <span className="text-xs text-on-surface-muted">
                    {new Date(entry.timestamp).toLocaleString("pt-BR")}
                  </span>
                </div>
                {entry.observacao && (
                  <p className="mt-0.5 text-sm text-on-surface-muted">{entry.observacao}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transicao Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avançar Status</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Novo Status</Label>
              <Select value={nextStatus} onValueChange={setNextStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {nextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Observação (opcional)</Label>
              <Textarea
                value={transicaoObs}
                onChange={(e) => setTransicaoObs(e.target.value)}
                placeholder="Motivo ou comentário..."
                rows={3}
              />
            </div>
            {transicaoError && (
              <p className="text-sm text-destructive">{transicaoError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleTransicao} disabled={transicaoMutation.isPending}>
              {transicaoMutation.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
