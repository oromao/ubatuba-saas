"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type Connector = {
  _id: string;
  id?: string;
  name: string;
  mode: "REST_JSON" | "CSV_UPLOAD" | "SFTP";
  isActive: boolean;
  lastSyncAt?: string;
};

type SyncLog = {
  _id: string;
  trigger: string;
  status: string;
  errorMessage?: string;
  summary?: {
    processed?: number;
    inserted?: number;
    updated?: number;
    errors?: number;
    message?: string;
  };
  createdAt?: string;
};

export default function IntegracoesPage() {
  const queryClient = useQueryClient();
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [connectorForm, setConnectorForm] = useState({
    name: "",
    mode: "REST_JSON",
    endpoint: "",
    token: "",
    host: "",
    username: "",
    path: "",
  });
  const [csvPayload, setCsvPayload] = useState("inscricao,contribuinte,endereco,valor_venal\n123,JOAO,RUA A,120000");

  const { data: connectors, isLoading } = useQuery({
    queryKey: ["tax-connectors"],
    queryFn: () => apiFetch<Connector[]>("/tax-integration/connectors"),
  });

  const { data: logs } = useQuery({
    queryKey: ["tax-sync-logs", selectedConnectorId],
    enabled: Boolean(selectedConnectorId),
    queryFn: () => apiFetch<SyncLog[]>(`/tax-integration/connectors/${selectedConnectorId}/logs`),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tax-connectors"] });
    if (selectedConnectorId) {
      await queryClient.invalidateQueries({ queryKey: ["tax-sync-logs", selectedConnectorId] });
    }
  };

  const createConnector = useMutation({
    mutationFn: () => {
      const name = connectorForm.name.trim();
      if (!name) throw new Error("Nome do conector e obrigatorio.");
      if (connectorForm.mode === "REST_JSON" && !connectorForm.endpoint.trim()) {
        throw new Error("Endpoint REST e obrigatorio.");
      }
      if (connectorForm.mode === "SFTP" && !connectorForm.host.trim()) {
        throw new Error("Host SFTP e obrigatorio.");
      }

      const config =
        connectorForm.mode === "REST_JSON"
          ? { endpoint: connectorForm.endpoint.trim(), token: connectorForm.token.trim() || undefined }
          : connectorForm.mode === "SFTP"
            ? {
                host: connectorForm.host.trim(),
                username: connectorForm.username.trim() || undefined,
                path: connectorForm.path.trim() || undefined,
              }
            : {};

      return apiFetch("/tax-integration/connectors", {
        method: "POST",
        body: JSON.stringify({
          name,
          mode: connectorForm.mode,
          config,
          fieldMapping: {
            inscricao: "inscricao",
            contribuinte: "contribuinte",
            endereco: "endereco",
            valorVenal: "valor_venal",
            divida: "divida",
          },
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Conector criado.");
      setConnectorForm({
        name: "",
        mode: "REST_JSON",
        endpoint: "",
        token: "",
        host: "",
        username: "",
        path: "",
      });
      await refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Falha ao criar conector."),
  });

  const testConnection = useMutation({
    mutationFn: (connectorId: string) =>
      apiFetch(`/tax-integration/connectors/${connectorId}/test-connection`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      toast.success("Teste executado.");
      await refresh();
    },
    onError: () => toast.error("Falha no teste."),
  });

  const runSync = useMutation({
    mutationFn: (params: { connectorId: string; mode: Connector["mode"] }) =>
      apiFetch(`/tax-integration/connectors/${params.connectorId}/run-sync`, {
        method: "POST",
        body: JSON.stringify(params.mode === "CSV_UPLOAD" ? { csvContent: csvPayload } : {}),
      }),
    onSuccess: async () => {
      toast.success("Sincronizacao executada.");
      await refresh();
    },
    onError: () => toast.error("Falha ao sincronizar."),
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Integracoes tributarias</h1>
        <p className="text-sm text-on-surface-muted">
          Conectores municipais (REST/CSV/SFTP), teste de conexao, sync manual e logs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo conector</CardTitle>
          <CardDescription>Wizard simplificado para configuracao inicial.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Nome"
            value={connectorForm.name}
            onChange={(e) => setConnectorForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select
            className="h-11 rounded-xl border border-outline bg-surface-elevated px-4 text-sm text-on-surface"
            value={connectorForm.mode}
            onChange={(e) =>
              setConnectorForm((prev) => ({
                ...prev,
                mode: e.target.value as "REST_JSON" | "CSV_UPLOAD" | "SFTP",
              }))
            }
          >
            <option value="REST_JSON">REST_JSON</option>
            <option value="CSV_UPLOAD">CSV_UPLOAD</option>
            <option value="SFTP">SFTP</option>
          </select>
          <Input
            placeholder="Endpoint REST (se aplicavel)"
            value={connectorForm.endpoint}
            onChange={(e) => setConnectorForm((prev) => ({ ...prev, endpoint: e.target.value }))}
            disabled={connectorForm.mode !== "REST_JSON"}
          />
          <Input
            placeholder="Token REST (opcional)"
            value={connectorForm.token}
            onChange={(e) => setConnectorForm((prev) => ({ ...prev, token: e.target.value }))}
            disabled={connectorForm.mode !== "REST_JSON"}
          />
          <Input
            placeholder="Host SFTP"
            value={connectorForm.host}
            onChange={(e) => setConnectorForm((prev) => ({ ...prev, host: e.target.value }))}
            disabled={connectorForm.mode !== "SFTP"}
          />
          <Input
            placeholder="Usuario SFTP (opcional)"
            value={connectorForm.username}
            onChange={(e) => setConnectorForm((prev) => ({ ...prev, username: e.target.value }))}
            disabled={connectorForm.mode !== "SFTP"}
          />
          <Input
            placeholder="Path SFTP (opcional)"
            value={connectorForm.path}
            onChange={(e) => setConnectorForm((prev) => ({ ...prev, path: e.target.value }))}
            disabled={connectorForm.mode !== "SFTP"}
          />
          <Button loading={createConnector.isPending} onClick={() => createConnector.mutate()}>
            Criar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conectores</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={connectors ?? []}
            loading={isLoading}
            columns={[
              { key: "name", label: "Nome" },
              { key: "mode", label: "Modo" },
              { key: "isActive", label: "Ativo", render: (value) => (value ? "Sim" : "Nao") },
              { key: "lastSyncAt", label: "Ultimo sync" },
            ]}
            emptyMessage="Sem conectores cadastrados."
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {(connectors ?? []).map((connector) => {
              const connectorId = connector.id ?? connector._id;
              return (
                <div key={connectorId} className="flex items-center gap-2 rounded-md border border-outline p-2">
                  <button
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedConnectorId === connectorId ? "bg-primary text-white" : "bg-cloud text-on-surface"
                    }`}
                    onClick={() => setSelectedConnectorId(connectorId)}
                  >
                    {connector.name}
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={testConnection.isPending}
                    onClick={() => testConnection.mutate(connectorId)}
                  >
                    Testar
                  </Button>
                  <Button
                    size="sm"
                    loading={runSync.isPending}
                    onClick={() => runSync.mutate({ connectorId, mode: connector.mode })}
                  >
                    Sync manual
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payload CSV (teste manual)</CardTitle>
          <CardDescription>Usado quando o conector selecionado estiver em modo CSV_UPLOAD.</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={csvPayload}
            onChange={(e) => setCsvPayload(e.target.value)}
            className="min-h-[120px] w-full rounded-xl border border-outline bg-surface-elevated p-3 text-sm text-on-surface"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Logs de sincronizacao</CardTitle>
            <Button size="sm" variant="outline" onClick={() => refresh()}>
              Atualizar logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={logs ?? []}
            loading={false}
            columns={[
              { key: "trigger", label: "Origem" },
              { key: "status", label: "Status" },
              {
                key: "summary",
                label: "Resumo",
                render: (value) => {
                  const summary = value as SyncLog["summary"];
                  return `${summary?.processed ?? 0} itens - ${summary?.message ?? "-"}`;
                },
              },
              { key: "errorMessage", label: "Erro" },
              { key: "createdAt", label: "Quando" },
            ]}
            emptyMessage={selectedConnectorId ? "Sem logs para este conector." : "Selecione um conector."}
          />
          {logs && logs.length > 0 && (
            <div className="mt-4 space-y-2">
              {logs.slice(0, 5).map((log) => (
                <details key={log._id} className="rounded-md border border-outline bg-surface-elevated p-3">
                  <summary className="cursor-pointer text-sm font-medium text-on-surface">
                    {log.status} - {log.summary?.message ?? "Sem mensagem"}
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-md bg-cloud p-2 text-xs text-on-surface-muted">
                    {JSON.stringify(log, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
