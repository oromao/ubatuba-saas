"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { Loader2, Plus, RefreshCw, FlaskConical, List, ChevronUp, ChevronDown, CloudLightning, FolderOpen, History, Terminal, Sparkles } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaxConnector = {
  _id: string;
  name: string;
  mode: "REST_JSON" | "CSV_UPLOAD" | "SFTP";
  config: Record<string, string>;
  fieldMapping: Record<string, string>;
  isActive: boolean;
  lastSyncAt?: string;
};

type SyncResult = {
  status: "SUCESSO" | "ERRO";
  processed: number;
  updated?: number;
  errors?: number;
  message?: string;
};

type SyncLog = {
  _id: string;
  status: string;
  processed: number;
  errors: number;
  message: string;
  createdAt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PARCEL_FIELDS = [
  "inscricaoImobiliaria",
  "statusIPTU",
  "valorVenalTotal",
  "iptuLancado",
  "iptuPago",
  "iptuEmAberto",
  "contribuinte",
  "logradouro",
  "numero",
  "bairro",
  "area",
  "testada",
];

const DEFAULT_MAPPINGS: Array<{ ext: string; parcel: string }> = [
  { ext: "inscricao", parcel: "inscricaoImobiliaria" },
  { ext: "status", parcel: "statusIPTU" },
  { ext: "valor_venal", parcel: "valorVenalTotal" },
  { ext: "iptu_lancado", parcel: "iptuLancado" },
  { ext: "iptu_pago", parcel: "iptuPago" },
  { ext: "iptu_em_aberto", parcel: "iptuEmAberto" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "Nunca sincronizado";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function modeBadge(mode: TaxConnector["mode"]) {
  const label = mode === "REST_JSON" ? "REST" : mode === "CSV_UPLOAD" ? "CSV" : "SFTP";
  return (
    <Badge variant="info" className="text-xs">
      {label}
    </Badge>
  );
}

// ─── Create Form ─────────────────────────────────────────────────────────────

type MappingRow = { ext: string; parcel: string };

function CreateConnectorForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<TaxConnector["mode"]>("REST_JSON");

  // Config state
  const [endpoint, setEndpoint] = useState("");
  const [token, setToken] = useState("");
  const [csvSample, setCsvSample] = useState("");
  const [sftpHost, setSftpHost] = useState("");
  const [sftpUser, setSftpUser] = useState("");
  const [sftpPath, setSftpPath] = useState("");

  // Field mapping
  const [mappings, setMappings] = useState<MappingRow[]>(DEFAULT_MAPPINGS.map((m) => ({ ...m })));

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<TaxConnector>("/tax-integration/connectors", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tax-connectors"] });
      onClose();
    },
  });

  function buildConfig(): Record<string, string> {
    if (mode === "REST_JSON") return { endpoint, token };
    if (mode === "CSV_UPLOAD") return { csvSample };
    return { host: sftpHost, user: sftpUser, path: sftpPath };
  }

  function buildFieldMapping(): Record<string, string> {
    const fm: Record<string, string> = {};
    for (const row of mappings) {
      if (row.ext.trim() && row.parcel.trim()) fm[row.ext.trim()] = row.parcel.trim();
    }
    return fm;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      name,
      mode,
      config: buildConfig(),
      fieldMapping: buildFieldMapping(),
      isActive: true,
    });
  }

  function addMapping() {
    setMappings((prev) => [...prev, { ext: "", parcel: "inscricaoImobiliaria" }]);
  }

  function updateMapping(idx: number, field: "ext" | "parcel", value: string) {
    setMappings((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  }

  function removeMapping(idx: number) {
    setMappings((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <Card className="mt-4 border-2 border-sky-200">
      <CardHeader>
        <CardTitle className="text-base">Novo Conector</CardTitle>
        <CardDescription>Preencha os dados do conector de integração tributária.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="conn-name">Nome</Label>
            <Input
              id="conn-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: IPTU Municipal 2024"
              required
            />
          </div>

          {/* Mode */}
          <div className="grid gap-1.5">
            <Label htmlFor="conn-mode">Modo</Label>
            <select
              id="conn-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as TaxConnector["mode"])}
              className="flex h-10 w-full rounded-md border border-outline bg-surface-elevated px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="REST_JSON">REST JSON</option>
              <option value="CSV_UPLOAD">CSV Upload</option>
              <option value="SFTP">SFTP</option>
            </select>
          </div>

          {/* Dynamic config */}
          {mode === "REST_JSON" && (
            <div className="grid gap-3 rounded-md border border-outline bg-surface-elevated p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">Configuração REST</p>
              <div className="grid gap-1.5">
                <Label htmlFor="conn-endpoint">Endpoint URL</Label>
                <Input
                  id="conn-endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://tributario.municipio.gov.br/api/iptu"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="conn-token">Bearer Token (opcional)</Label>
                <Input
                  id="conn-token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="token de autenticação"
                />
              </div>
            </div>
          )}

          {mode === "CSV_UPLOAD" && (
            <div className="grid gap-3 rounded-md border border-outline bg-surface-elevated p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">Configuração CSV</p>
              <div className="grid gap-1.5">
                <Label htmlFor="conn-csv-sample">CSV de Exemplo (opcional)</Label>
                <Textarea
                  id="conn-csv-sample"
                  value={csvSample}
                  onChange={(e) => setCsvSample(e.target.value)}
                  placeholder="inscricao,status,valor_venal&#10;001.001.001,ADIMPLENTE,120000"
                  rows={4}
                />
              </div>
            </div>
          )}

          {mode === "SFTP" && (
            <div className="grid gap-3 rounded-md border border-outline bg-surface-elevated p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">Configuração SFTP</p>
              <div className="grid gap-1.5">
                <Label htmlFor="conn-sftp-host">Host</Label>
                <Input
                  id="conn-sftp-host"
                  value={sftpHost}
                  onChange={(e) => setSftpHost(e.target.value)}
                  placeholder="sftp.municipio.gov.br"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="conn-sftp-user">Usuário</Label>
                <Input
                  id="conn-sftp-user"
                  value={sftpUser}
                  onChange={(e) => setSftpUser(e.target.value)}
                  placeholder="ftpuser"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="conn-sftp-path">Caminho remoto</Label>
                <Input
                  id="conn-sftp-path"
                  value={sftpPath}
                  onChange={(e) => setSftpPath(e.target.value)}
                  placeholder="/exports/iptu/dados.csv"
                />
              </div>
            </div>
          )}

          {/* Field mapping */}
          <div className="grid gap-3">
            <p className="text-sm font-semibold text-on-surface">Mapeamento de Campos</p>
            <p className="text-xs text-on-surface-muted">Campo externo → campo da parcela</p>
            {mappings.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={row.ext}
                  onChange={(e) => updateMapping(idx, "ext", e.target.value)}
                  placeholder="campo externo"
                  className="flex-1"
                />
                <span className="text-on-surface-muted">→</span>
                <select
                  value={row.parcel}
                  onChange={(e) => updateMapping(idx, "parcel", e.target.value)}
                  className="flex h-10 flex-1 rounded-md border border-outline bg-surface-elevated px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {PARCEL_FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMapping(idx)}
                  className="text-red-600 hover:text-red-700"
                >
                  ×
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addMapping} className="w-fit">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Adicionar mapeamento
            </Button>
          </div>

          {create.isError && (
            <p className="text-sm text-red-600">{(create.error as Error)?.message ?? "Erro ao criar conector"}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conector
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Connector Card ────────────────────────────────────────────────────────────

function ConnectorCard({ connector }: { connector: TaxConnector }) {
  const qc = useQueryClient();
  const [showCsvInput, setShowCsvInput] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  const testMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ success: boolean; message?: string }>(
        `/tax-integration/connectors/${connector._id}/test-connection`,
        { method: "POST" }
      ),
  });

  const syncMutation = useMutation({
    mutationFn: (body: { csvContent?: string }) =>
      apiFetch<SyncResult>(`/tax-integration/connectors/${connector._id}/run-sync`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      setSyncResult(data);
      setShowCsvInput(false);
      setCsvContent("");
      void qc.invalidateQueries({ queryKey: ["tax-connectors"] });
    },
  });

  const logsQuery = useQuery({
    queryKey: ["tax-sync-logs", connector._id],
    queryFn: () => apiFetch<SyncLog[]>(`/tax-integration/connectors/${connector._id}/logs`),
    enabled: showLogs,
  });

  function handleSync() {
    if (connector.mode === "CSV_UPLOAD") {
      if (!showCsvInput) {
        setShowCsvInput(true);
        return;
      }
      syncMutation.mutate({ csvContent: csvContent || undefined });
    } else {
      syncMutation.mutate({});
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: info */}
          <div className="grid gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-on-surface">{connector.name}</span>
              {modeBadge(connector.mode)}
              <Badge variant={connector.isActive ? "success" : "outline"}>
                {connector.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-xs text-on-surface-muted">
              Última sync: {connector.lastSyncAt ? formatDate(connector.lastSyncAt) : "Nunca sincronizado"}
            </p>
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
            >
              {testMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
              )}
              Testar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Sincronizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogs((v) => !v)}
            >
              <List className="mr-1.5 h-3.5 w-3.5" />
              Ver Logs
              {showLogs ? (
                <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Test result */}
        {testMutation.data !== undefined && (
          <div className="mt-3 rounded-md border border-outline bg-surface-elevated p-3 text-sm">
            {testMutation.data?.success ? (
              <span className="text-emerald-700">Conexão bem-sucedida. {testMutation.data.message}</span>
            ) : (
              <span className="text-red-600">Falha na conexão. {testMutation.data?.message}</span>
            )}
          </div>
        )}
        {testMutation.isError && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {(testMutation.error as Error)?.message ?? "Erro ao testar conexão"}
          </div>
        )}

        {/* CSV input */}
        {showCsvInput && connector.mode === "CSV_UPLOAD" && (
          <div className="mt-3 grid gap-2">
            <Label htmlFor={`csv-${connector._id}`} className="text-sm">
              Conteúdo CSV para sincronização
            </Label>
            <Textarea
              id={`csv-${connector._id}`}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="inscricao,status,valor_venal&#10;001.001.001,ADIMPLENTE,120000"
              rows={5}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => syncMutation.mutate({ csvContent: csvContent || undefined })}
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Executar Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCsvInput(false);
                  setCsvContent("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Sync error */}
        {syncMutation.isError && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {(syncMutation.error as Error)?.message ?? "Erro ao executar sincronização"}
          </div>
        )}

        {/* Sync result */}
        {syncResult && (
          <div className="mt-3 rounded-md border border-outline bg-surface-elevated p-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant={syncResult.status === "SUCESSO" ? "success" : "destructive"}>
                {syncResult.status}
              </Badge>
              <span className="text-on-surface">
                <span className="font-medium">{syncResult.processed}</span> processados
              </span>
              {syncResult.updated !== undefined && (
                <span className="text-on-surface">
                  <span className="font-medium">{syncResult.updated}</span> atualizados
                </span>
              )}
              {syncResult.errors !== undefined && syncResult.errors > 0 && (
                <span className="text-red-600">
                  <span className="font-medium">{syncResult.errors}</span> erros
                </span>
              )}
              {syncResult.message && (
                <span className="text-on-surface-muted">{syncResult.message}</span>
              )}
            </div>
          </div>
        )}

        {/* Logs panel */}
        {showLogs && (
          <div className="mt-4">
            {logsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-on-surface-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando logs...
              </div>
            ) : logsQuery.isError ? (
              <p className="text-sm text-red-600">
                {(logsQuery.error as Error)?.message ?? "Erro ao carregar logs"}
              </p>
            ) : !logsQuery.data || logsQuery.data.length === 0 ? (
              <p className="text-sm text-on-surface-muted">Nenhum log de sincronização encontrado.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-outline">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline bg-surface-elevated text-xs uppercase tracking-wide text-on-surface-muted">
                      <th className="px-3 py-2 text-left">Data</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-right">Processados</th>
                      <th className="px-3 py-2 text-right">Erros</th>
                      <th className="px-3 py-2 text-left">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsQuery.data.slice(0, 10).map((log) => (
                      <tr key={log._id} className="border-b border-outline last:border-0">
                        <td className="whitespace-nowrap px-3 py-2 text-on-surface-muted">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={
                              log.status === "SUCESSO"
                                ? "success"
                                : log.status === "ERRO"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-right text-on-surface">{log.processed}</td>
                        <td className="px-3 py-2 text-right text-on-surface">{log.errors}</td>
                        <td className="max-w-xs truncate px-3 py-2 text-on-surface-muted">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SFTP Panel Component ─────────────────────────────────────────────────────

function SftpConnectorPanel() {
  const qc = useQueryClient();
  const [showSimulator, setShowSimulator] = useState(false);
  const [simFileName, setSimFileName] = useState("carga_tributaria_ubatuba.csv");
  const [simContent, setSimContent] = useState(
    `sqlu,valorVenalTotal,statusIPTU,iptuLancado,iptuPago\n` +
    `001.002.0003.01,250000,QUITADO,1250,1250\n` +
    `001.002.0004.01,480000,INADIMPLENTE,2400,0\n` +
    `001.002.0005.01,310000,PARCELADO,1550,775`
  );

  const { data: sftpStatus, isLoading: sftpLoading } = useQuery({
    queryKey: ["ctm-sftp-status"],
    queryFn: () => apiFetch<{
      inboxPath: string;
      processedPath: string;
      pendingCount: number;
      pendingFiles: Array<{ fileName: string; sizeBytes: number; createdAt: string }>;
      processedCount: number;
      processedFiles: Array<{ fileName: string; sizeBytes: number; processedAt: string }>;
    }>("/ctm/parcels/sftp-status"),
  });

  const syncMutation = useMutation({
    mutationFn: () => apiFetch<{
      message: string;
      processedFiles: number;
      results: Array<{ fileName: string; status: string; message?: string }>;
    }>("/ctm/parcels/sftp-sync", { method: "POST" }),
    onSuccess: (data) => {
      alert(data.message || "Sincronização concluída com sucesso!");
      void qc.invalidateQueries({ queryKey: ["ctm-sftp-status"] });
    },
  });

  const depositMutation = useMutation({
    mutationFn: (body: { fileName: string; csv: string }) =>
      apiFetch<{ success: boolean; fileName: string }>("/ctm/parcels/sftp-deposit", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      alert(`Arquivo "${data.fileName}" depositado com sucesso no SFTP inbox!`);
      setShowSimulator(false);
      void qc.invalidateQueries({ queryKey: ["ctm-sftp-status"] });
    },
  });

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <Card className="border-l-4 border-l-sky-500 bg-surface/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-sky-100 p-2 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <CloudLightning className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-on-surface">
                Conector Tributário SFTP Integrado (CTM)
              </CardTitle>
              <CardDescription className="text-xs">
                Atualização cadastral e tributária via depósito automatizado de arquivos municipais.
              </CardDescription>
            </div>
          </div>
          <Badge variant="success" className="px-2.5 py-0.5 font-display text-[10px] uppercase">
            AUTOMÁTICO
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* SFTP Status & Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-outline bg-surface-elevated/40 p-4 transition-all hover:bg-surface-elevated/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted">
              Inbox SFTP
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-sky-600 dark:text-sky-400">
                {sftpLoading ? "..." : sftpStatus?.pendingCount ?? 0}
              </span>
              <span className="text-xs text-on-surface-muted">arquivos pendentes</span>
            </div>
          </div>

          <div className="rounded-xl border border-outline bg-surface-elevated/40 p-4 transition-all hover:bg-surface-elevated/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted">
              Processados (Lote)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {sftpLoading ? "..." : sftpStatus?.processedCount ?? 0}
              </span>
              <span className="text-xs text-on-surface-muted">arquivos processados</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2 rounded-xl border border-outline bg-surface-elevated/40 p-4">
            <Button
              className="w-full bg-sky-600 font-semibold text-white shadow-sm transition-all hover:bg-sky-700 h-9"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending || sftpStatus?.pendingCount === 0}
            >
              {syncMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sincronizar SFTP
            </Button>
            <Button
              variant="outline"
              className="w-full border-sky-200/50 hover:bg-sky-50 dark:hover:bg-sky-950/20 h-9"
              onClick={() => setShowSimulator((v) => !v)}
            >
              <Terminal className="mr-2 h-4 w-4" />
              Simular Depósito SFTP
            </Button>
          </div>
        </div>

        {/* SFTP Simulator form */}
        {showSimulator && (
          <div className="grid gap-3.5 rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/20 p-4 dark:border-sky-900/50 dark:bg-sky-950/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-semibold text-on-surface">Simulador de Depósito de Arquivo (SFTP)</span>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sim-filename" className="text-xs">Nome do Arquivo CSV</Label>
              <Input
                id="sim-filename"
                value={simFileName}
                onChange={(e) => setSimFileName(e.target.value)}
                placeholder="Ex: iptu_sincronizacao.csv"
                className="h-9 text-xs"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sim-content" className="text-xs">Conteúdo do Arquivo Tributário (CSV)</Label>
              <Textarea
                id="sim-content"
                value={simContent}
                onChange={(e) => setSimContent(e.target.value)}
                rows={4}
                className="font-mono text-[11px] leading-relaxed"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-sky-600 text-white hover:bg-sky-700 h-9"
                onClick={() => depositMutation.mutate({ fileName: simFileName, csv: simContent })}
                disabled={depositMutation.isPending}
              >
                {depositMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Depositar no SFTP
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSimulator(false)}
                className="h-9"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* SFTP File Queues */}
        {!sftpLoading && sftpStatus && (sftpStatus.pendingCount > 0 || sftpStatus.processedCount > 0) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Pending files */}
            {sftpStatus.pendingCount > 0 && (
              <div className="rounded-lg border border-outline bg-surface-elevated/20 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-muted pb-2 border-b border-outline">
                  <FolderOpen className="h-4 w-4 text-sky-500" />
                  Arquivos na Caixa de Entrada SFTP
                </div>
                <div className="mt-2 divide-y divide-outline">
                  {sftpStatus.pendingFiles.map((file) => (
                    <div key={file.fileName} className="flex items-center justify-between py-2 text-xs">
                      <span className="font-mono text-on-surface font-medium truncate max-w-[200px]" title={file.fileName}>
                        {file.fileName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {formatBytes(file.sizeBytes)}
                        </Badge>
                        <span className="text-[10px] text-on-surface-muted">
                          {new Date(file.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processed files */}
            {sftpStatus.processedCount > 0 && (
              <div className="rounded-lg border border-outline bg-surface-elevated/20 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-muted pb-2 border-b border-outline">
                  <History className="h-4 w-4 text-emerald-500" />
                  Últimos Processados via SFTP
                </div>
                <div className="mt-2 divide-y divide-outline">
                  {sftpStatus.processedFiles.map((file) => (
                    <div key={file.fileName} className="flex items-center justify-between py-2 text-xs">
                      <span className="font-mono text-on-surface-muted truncate max-w-[180px]" title={file.fileName}>
                        {file.fileName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px]">
                          {formatBytes(file.sizeBytes)}
                        </Badge>
                        <span className="text-[10px] text-on-surface-muted">
                          {new Date(file.processedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegracoesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: connectors, isLoading } = useQuery({
    queryKey: ["tax-connectors"],
    queryFn: () => apiFetch<TaxConnector[]>("/tax-integration/connectors"),
  });

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">
            Integração Tributária (IPTU)
          </h1>
          <p className="mt-1 text-sm text-on-surface-muted">
            Conectores de sincronização com sistema tributário municipal
          </p>
        </div>
        <Button onClick={() => setShowCreateForm((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Conector
        </Button>
      </div>

      {/* SFTP Integrated Panel */}
      <div className="mt-6">
        <SftpConnectorPanel />
      </div>

      {/* Create form */}
      {showCreateForm && <CreateConnectorForm onClose={() => setShowCreateForm(false)} />}

      {/* Connector list */}
      <div className="mt-6 grid gap-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-on-surface-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando conectores...
          </div>
        ) : !connectors || connectors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-on-surface-muted">
                Nenhum conector configurado. Configure um conector para sincronizar dados do IPTU municipal.
              </p>
              <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Configurar primeiro conector
              </Button>
            </CardContent>
          </Card>
        ) : (
          connectors.map((c) => <ConnectorCard key={c._id} connector={c} />)
        )}
      </div>
    </div>
  );
}
