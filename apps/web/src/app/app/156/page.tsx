"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/app/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CitizenCall = {
  _id: string;
  protocolNumber: string;
  title: string;
  category: string;
  status: string;
  reporterName?: string;
  reporterContact?: string;
  attachmentKeys?: string[];
  history?: Array<{ id: string }>;
};

type CitizenCallSummary = {
  total: number;
  abertos: number;
  triagem: number;
  encaminhados: number;
  resolvidos: number;
  anexos: number;
};

const CATEGORIES = [
  "VIAS",
  "ILUMINACAO",
  "LIMPEZA_URBANA",
  "ARBORIZACAO",
  "BUEIROS",
  "CALCADAS",
  "SINALIZACAO",
  "MEIO_AMBIENTE",
  "OUTROS",
];

type PendingAction = { id: string; status: string; message: string; label: string } | null;

export default function Citizen156Page() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("VIAS");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const callsQuery = useQuery({
    queryKey: ["citizen-156"],
    queryFn: () => apiFetch<CitizenCall[]>("/citizen-156/calls"),
  });
  const summaryQuery = useQuery({
    queryKey: ["citizen-156-summary"],
    queryFn: () => apiFetch<CitizenCallSummary>("/citizen-156/summary"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<CitizenCall>("/citizen-156/calls", {
        method: "POST",
        body: JSON.stringify({ title, category, reporterName, reporterContact }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen-156"] });
      queryClient.invalidateQueries({ queryKey: ["citizen-156-summary"] });
      setTitle("");
      setReporterName("");
      setReporterContact("");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, message }: { id: string; status: string; message: string }) =>
      apiFetch<CitizenCall>(`/citizen-156/calls/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, message }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen-156"] });
      queryClient.invalidateQueries({ queryKey: ["citizen-156-summary"] });
      setPendingAction(null);
    },
  });

  const confirmAction = (id: string, status: string, message: string, label: string) => {
    setPendingAction({ id, status, message, label });
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Atendimento 156</h1>
          <p className="text-sm text-on-surface-muted">Chamados com geolocalização, anexos e histórico.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:col-span-2 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Total", value: summaryQuery.data?.total ?? 0 },
            { label: "Abertos", value: summaryQuery.data?.abertos ?? 0 },
            { label: "Triagem", value: summaryQuery.data?.triagem ?? 0 },
            { label: "Encaminhados", value: summaryQuery.data?.encaminhados ?? 0 },
            { label: "Resolvidos", value: summaryQuery.data?.resolvidos ?? 0 },
            { label: "Anexos", value: summaryQuery.data?.anexos ?? 0 },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-on-surface">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Abrir chamado</CardTitle>
            <CardDescription>Entrada cidadã com roteamento para secretarias.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-muted">Título</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Descreva o problema"
                aria-label="Título do chamado"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-muted">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Categoria do chamado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-muted">Nome do solicitante</label>
              <Input
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Nome completo"
                aria-label="Nome do solicitante"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-muted">Contato</label>
              <Input
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="(12) 99999-0000"
                aria-label="Contato do solicitante"
              />
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !title.trim()}
            >
              {createMutation.isPending ? "Abrindo..." : "Abrir chamado"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chamados</CardTitle>
            <CardDescription>Lista operacional do atendimento ao cidadão.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={callsQuery.data ?? []}
              loading={callsQuery.isLoading}
              emptyMessage="Nenhum chamado encontrado."
              emptyAction={
                <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLInputElement>('[aria-label="Título do chamado"]')?.focus()}>
                  Abrir primeiro chamado
                </Button>
              }
              columns={[
                { key: "protocolNumber", label: "Protocolo" },
                { key: "title", label: "Título" },
                { key: "category", label: "Categoria" },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => (
                    <Badge variant={String(value) === "ABERTO" ? "warning" : String(value) === "RESOLVIDO" ? "success" : "default"}>
                      {String(value).replace(/_/g, " ")}
                    </Badge>
                  ),
                },
                { key: "reporterName", label: "Solicitante" },
                {
                  key: "attachmentKeys",
                  label: "Anexos",
                  render: (value) => <Badge variant="outline">{Array.isArray(value) ? value.length : 0}</Badge>,
                },
                {
                  key: "_id",
                  label: "Ações",
                  render: (value) => (
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: String(value), status: "EM_TRIAGEM", message: "Chamado em triagem" })}
                        disabled={statusMutation.isPending}
                      >
                        Triagem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: String(value), status: "EM_CAMPO", message: "Equipe acionada" })}
                        disabled={statusMutation.isPending}
                      >
                        Campo
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => confirmAction(String(value), "RESOLVIDO", "Chamado resolvido", "Marcar como resolvido")}
                        disabled={statusMutation.isPending}
                      >
                        Resolver
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Confirmation dialog for destructive actions */}
      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-on-surface-muted">
            Deseja realmente <strong>{pendingAction?.label?.toLowerCase()}</strong> este chamado?
            Esta ação registrará o status no histórico.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => pendingAction && statusMutation.mutate(pendingAction)}
              loading={statusMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
