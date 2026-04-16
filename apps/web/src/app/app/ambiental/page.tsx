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

type EnvCase = {
  _id: string;
  protocolNumber: string;
  title: string;
  category: string;
  status: string;
  reportPdfKey?: string;
  tasks?: Array<{ id: string }>;
  evidenceKeys?: string[];
};

type EnvSummary = {
  total: number;
  abertos: number;
  análise: number;
  campo: number;
  laudos: number;
  encerrados: number;
  tarefas: number;
  evidências: number;
};

const CATEGORIES = [
  { value: "PODA", label: "Poda de árvore" },
  { value: "APP", label: "Área de Proteção Permanente" },
  { value: "LAUDO", label: "Emissão de laudo" },
  { value: "SUPRESSAO", label: "Supressão vegetal" },
  { value: "QUEIMADA", label: "Queimada / Incêndio" },
  { value: "DESCARTE", label: "Descarte irregular" },
  { value: "LICENCIAMENTO", label: "Licenciamento ambiental" },
  { value: "OUTROS", label: "Outros" },
];

type PendingAction = { id: string; status: string; message: string; label: string } | null;

export default function AmbientalPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PODA");
  const [task, setTask] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const casesQuery = useQuery({
    queryKey: ["environment-cases"],
    queryFn: () => apiFetch<EnvCase[]>("/environment/cases"),
  });
  const summaryQuery = useQuery({
    queryKey: ["environment-summary"],
    queryFn: () => apiFetch<EnvSummary>("/environment/summary"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<EnvCase>("/environment/cases", {
        method: "POST",
        body: JSON.stringify({ title, category, tasks: task ? [task] : [] }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environment-cases"] });
      queryClient.invalidateQueries({ queryKey: ["environment-summary"] });
      setTitle("");
      setTask("");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, message }: { id: string; status: string; message: string }) =>
      apiFetch<EnvCase>(`/environment/cases/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, message }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environment-cases"] });
      queryClient.invalidateQueries({ queryKey: ["environment-summary"] });
      setPendingAction(null);
    },
  });

  const reportMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<EnvCase>(`/environment/cases/${id}/report`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environment-cases"] });
    },
  });

  const confirmAction = (id: string, status: string, message: string, label: string) => {
    setPendingAction({ id, status, message, label });
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Gestão Ambiental</h1>
          <p className="text-sm text-on-surface-muted">Processos, APP, poda, laudos e ordens de serviço.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:col-span-2 grid gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {[
            { label: "Total", value: summaryQuery.data?.total ?? 0 },
            { label: "Abertos", value: summaryQuery.data?.abertos ?? 0 },
            { label: "Análise", value: summaryQuery.data?.análise ?? 0 },
            { label: "Campo", value: summaryQuery.data?.campo ?? 0 },
            { label: "Laudos", value: summaryQuery.data?.laudos ?? 0 },
            { label: "Encerrados", value: summaryQuery.data?.encerrados ?? 0 },
            { label: "Tarefas", value: summaryQuery.data?.tarefas ?? 0 },
            { label: "Evidências", value: summaryQuery.data?.evidências ?? 0 },
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
            <CardTitle>Abrir caso</CardTitle>
            <CardDescription>Modelo mínimo para licenciamento e fiscalização.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-muted">Título</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Descreva o caso ambiental"
                aria-label="Título do caso"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-muted">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Categoria ambiental">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-muted">Tarefa inicial (opcional)</label>
              <Input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Ex: Vistoria de campo"
                aria-label="Tarefa inicial"
              />
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !title.trim()}
            >
              {createMutation.isPending ? "Abrindo..." : "Abrir caso"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Casos</CardTitle>
            <CardDescription>Monitoramento de ativos e processos ambientais.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={casesQuery.data ?? []}
              loading={casesQuery.isLoading}
              emptyMessage="Nenhum caso ambiental encontrado."
              columns={[
                { key: "protocolNumber", label: "Protocolo" },
                { key: "title", label: "Título" },
                { key: "category", label: "Categoria", render: (v) => CATEGORIES.find(c => c.value === String(v))?.label ?? String(v) },
                { key: "status", label: "Status", render: (value) => <Badge variant="outline">{String(value).replace(/_/g, " ")}</Badge> },
                { key: "tasks", label: "Tarefas", render: (value) => <Badge variant="outline">{Array.isArray(value) ? value.length : 0}</Badge> },
                { key: "reportPdfKey", label: "Laudo", render: (value) => <Badge variant={value ? "info" : "outline"}>{value ? "Emitido" : "Pendente"}</Badge> },
                {
                  key: "_id",
                  label: "Ações",
                  render: (value) => (
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: String(value), status: "EM_ANALISE", message: "Caso em análise" })}
                        disabled={statusMutation.isPending}
                      >
                        Analisar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: String(value), status: "EM_CAMPO", message: "Vistoria em campo" })}
                        disabled={statusMutation.isPending}
                      >
                        Campo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reportMutation.mutate(String(value))}
                        disabled={reportMutation.isPending}
                      >
                        Laudo
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => confirmAction(String(value), "ENCERRADO", "Caso encerrado", "Encerrar caso")}
                        disabled={statusMutation.isPending}
                      >
                        Encerrar
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar encerramento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-on-surface-muted">
            Deseja realmente <strong>encerrar</strong> este caso ambiental?
            O status será registrado no histórico e não poderá ser revertido automaticamente.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => pendingAction && statusMutation.mutate(pendingAction)}
              loading={statusMutation.isPending}
            >
              Encerrar caso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
