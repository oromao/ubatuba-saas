"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { LocateFixed, RefreshCcw, UploadCloud, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { isMobileRouteAllowed } from "@/lib/rbac";
import {
  type MobileChecklist,
  type MobileLocation,
  type OfflineQueueRecord,
  appendOfflineQueueHistory,
  markOfflineEvidenceStatus,
  markOfflineQueueStatus,
  listOfflineQueue,
  putOfflineQueueItem,
  removeOfflineQueueItem,
} from "@/lib/mobile-offline";

type Parcel = {
  _id?: string;
  id?: string;
  sqlu?: string;
  inscription?: string;
  inscriçãoImobiliaria?: string;
  mainAddress?: string;
  workflowStatus?: string;
  updatedAt?: string;
};

type MobileSummary = {
  total: number;
  processado: number;
  conflito: number;
  recebido: number;
  comEvidências: number;
  evidênciasTotal: number;
  erros: number;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Falha ao converter foto"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao converter foto"));
    reader.readAsDataURL(file);
  });

const sha256Hex = async (payload: string) => {
  if (typeof window === "undefined" || !window.crypto?.subtle) return undefined;
  const bytes = new TextEncoder().encode(payload);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const resolveParcelId = (parcel: Parcel) => parcel.id ?? parcel._id ?? "";

export default function MobilePage() {
  const { ready, token, userRole } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [checklist, setChecklist] = useState<MobileChecklist>({
    occupancyChecked: false,
    addressChecked: false,
    infrastructureChecked: false,
    notes: "",
  });
  const [location, setLocation] = useState<MobileLocation | undefined>(undefined);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [evidenceFiles, setEvidenceFiles] = useState<
    Array<{
      clientId: string;
      fileName: string;
      base64: string;
      mimeType?: string;
      checksum?: string;
      capturedAt?: string;
      size?: number;
      status: "PENDENTE" | "SINCRONIZADO" | "ERRO";
      retries: number;
      lastError?: string;
      lastAttemptAt?: string;
    }>
  >([]);
  const [queue, setQueue] = useState<OfflineQueueRecord[]>([]);
  const [summary, setSummary] = useState<MobileSummary | null>(null);
  const [syncedRecords, setSyncedRecords] = useState<any[]>([]);
  const [queueBusyId, setQueueBusyId] = useState<string | null>(null);

  const refreshQueue = useCallback(async () => {
    try {
      setQueue(await listOfflineQueue());
    } catch {
      setQueue([]);
    }
  }, []);

  const refreshSyncedRecords = useCallback(async () => {
    try {
      const projectId = typeof window !== "undefined" ? window.localStorage.getItem("projectId") ?? undefined : undefined;
      const suffix = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      setSyncedRecords(await apiFetch<any[]>(`/mobile/ctm-sync${suffix}`));
    } catch {
      setSyncedRecords([]);
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    try {
      const projectId = typeof window !== "undefined" ? window.localStorage.getItem("projectId") ?? undefined : undefined;
      const suffix = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      setSummary(await apiFetch<MobileSummary>(`/mobile/dashboard${suffix}`));
    } catch {
      setSummary(null);
    }
  }, []);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    void refreshQueue();
    void refreshSyncedRecords();
    void refreshSummary();
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [refreshQueue, refreshSyncedRecords, refreshSummary]);

  const searchParcels = useMutation({
    mutationFn: async () => {
      const suffix = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      return apiFetch<Parcel[]>(`/ctm/parcels${suffix}`);
    },
    onSuccess: (data) => setResults(data),
    onError: () => toast.error("Falha ao buscar parcelas."),
  });

  const syncQueue = useMutation({
    mutationFn: async () => {
      if (!isOnline) throw new Error("offline");
      const items = await listOfflineQueue();
      if (items.length === 0) return { processed: 0 };

      const projectId = typeof window !== "undefined" ? window.localStorage.getItem("projectId") ?? undefined : undefined;
      const payload = {
        projectId,
        items: items.map((item) => ({
          clientId: item.id,
          parcelId: item.parcelId,
          parcelUpdatedAt: item.parcelUpdatedAt,
          checklist: item.checklist,
          location: item.location,
          photoBase64: item.photoBase64,
          evidences: item.evidences?.map((evidence) => ({
            clientId: evidence.clientId,
            fileName: evidence.fileName,
            mimeType: evidence.mimeType,
            base64: evidence.base64,
            checksum: evidence.checksum,
            capturedAt: evidence.capturedAt,
            size: evidence.size,
          })),
        })),
      };

      const result = await apiFetch<{
        processed: number;
        failed?: Array<{
          clientId?: string;
          error?: string;
          details?: { clientParcelUpdatedAt?: string; serverParcelUpdatedAt?: string };
        }>;
      }>("/mobile/ctm-sync", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await Promise.all(
        items.map(async (item) => {
          const failedItem = (result.failed ?? []).find((entry) => entry.clientId === item.id);
          const error = failedItem?.error;
          if (error) {
            const detailedError =
              error === "CONFLITO_DE_VERSAO_CADASTRAL" && failedItem.details?.serverParcelUpdatedAt
                ? `Conflito cadastral: servidor atualizado em ${new Date(failedItem.details.serverParcelUpdatedAt).toLocaleString("pt-BR")}`
                : error;
            if (item.evidences?.length) {
              await Promise.all(
                item.evidences.map((evidence) =>
                  markOfflineEvidenceStatus(item.id, evidence.clientId, {
                    status: "ERRO",
                    retries: evidence.retries + 1,
                    lastError: detailedError,
                    lastAttemptAt: new Date().toISOString(),
                  }),
                ),
              );
            }
            await markOfflineQueueStatus(item.id, {
              status: "ERRO",
              retries: item.retries + 1,
              lastError: detailedError,
              lastAttemptAt: new Date().toISOString(),
              parcelUpdatedAt: failedItem?.details?.serverParcelUpdatedAt ?? item.parcelUpdatedAt,
            });
            await appendOfflineQueueHistory(item.id, {
              at: new Date().toISOString(),
              status: error === "CONFLITO_DE_VERSAO_CADASTRAL" ? "CONFLITO" : "ERRO",
              message: detailedError,
              source: "sync",
            });
            return;
          }
          if (item.evidences?.length) {
            await Promise.all(
              item.evidences.map((evidence) =>
                markOfflineEvidenceStatus(item.id, evidence.clientId, {
                  status: "SINCRONIZADO",
                  retries: evidence.retries,
                  lastAttemptAt: new Date().toISOString(),
                }),
              ),
            );
          }
          await appendOfflineQueueHistory(item.id, {
            at: new Date().toISOString(),
            status: "SINCRONIZADO",
            message: "Registro e evidências sincronizados com sucesso",
            source: "sync",
          });
          await removeOfflineQueueItem(item.id);
        }),
      );
      await refreshQueue();
      await refreshSyncedRecords();
      await refreshSummary();
      return result;
    },
    onSuccess: (result) => {
      const failed = result.failed?.length ?? 0;
      toast.success(`${result.processed} registro(s) enviados${failed > 0 ? `, ${failed} com erro.` : "."}`);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "offline") {
        toast.error("Sem internet. A fila permanece salva no dispositivo.");
        return;
      }
      toast.error("Falha ao sincronizar fila mobile.");
    },
  });

  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncQueue.isPending) {
      void syncQueue.mutateAsync();
    }
  }, [isOnline, queue.length, syncQueue]);

  const selectedParcelLabel = useMemo(() => {
    if (!selectedParcel) return "";
    return selectedParcel.mainAddress ?? selectedParcel.inscriçãoImobiliaria ?? selectedParcel.inscription ?? selectedParcel.sqlu ?? resolveParcelId(selectedParcel);
  }, [selectedParcel]);

  const handleCaptureLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocalização não suportada no dispositivo.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        toast.success("Localização capturada.");
      },
      () => toast.error("Não foi possível obter geolocalização."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleStoreOffline = async () => {
    if (!selectedParcel) {
      toast.error("Selecione uma parcela para salvar coleta.");
      return;
    }
    const parcelId = resolveParcelId(selectedParcel);
    if (!parcelId) {
      toast.error("Parcela invalida.");
      return;
    }

    const projectId = typeof window !== "undefined" ? window.localStorage.getItem("projectId") ?? undefined : undefined;
    const nowIso = new Date().toISOString();
    await putOfflineQueueItem({
      id: crypto.randomUUID(),
      projectId,
      clientId: crypto.randomUUID(),
      parcelId,
      parcelLabel: selectedParcelLabel,
      parcelUpdatedAt: selectedParcel.updatedAt,
      checklist,
      location,
      photoBase64,
      evidences: evidenceFiles,
      createdAt: nowIso,
      status: "PENDENTE",
      retries: 0,
      syncHistory: [
        {
          at: nowIso,
          status: "PENDENTE",
          message: "Registro salvo offline no dispositivo",
          source: "device",
        },
      ],
    });

    setChecklist({ occupancyChecked: false, addressChecked: false, infrastructureChecked: false, notes: "" });
    setLocation(undefined);
    setPhotoBase64(undefined);
    setEvidenceFiles([]);
    await refreshQueue();
    await refreshSyncedRecords();
    await refreshSummary();
    toast.success("Registro salvo offline.");
  };

  if (!ready) return null;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8 text-on-surface">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Modo Mobile (PWA)</CardTitle>
            <CardDescription>Você precisa estar autenticado para coletar dados de campo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">
              Ir para login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isMobileRouteAllowed(userRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8 text-on-surface">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
            <CardDescription>
              Este módulo é exclusivo para perfis operacionais (Admin, Gestor e Operador/Campo).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/dashboard" className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-white">
              Voltar ao painel
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-5 text-on-surface sm:px-6">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Card>
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="font-display text-2xl">FlyDea Mobile Campo</CardTitle>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  isOnline ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <CardDescription>
              Coleta CTM offline-first com fila local (IndexedDB) e sincronização automática.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-sm border border-outline bg-surface-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-on-surface-muted">Registros</p>
                <p className="mt-1 text-2xl font-semibold">{summary?.total ?? 0}</p>
              </div>
              <div className="rounded-sm border border-outline bg-surface-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-on-surface-muted">Processados</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">{summary?.processado ?? 0}</p>
              </div>
              <div className="rounded-sm border border-outline bg-surface-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-on-surface-muted">Conflitos</p>
                <p className="mt-1 text-2xl font-semibold text-rose-600">{summary?.conflito ?? 0}</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-sm border border-outline bg-surface-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-on-surface-muted">Com evidências</p>
                <p className="mt-1 text-2xl font-semibold">{summary?.comEvidências ?? 0}</p>
              </div>
              <div className="rounded-sm border border-outline bg-surface-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-on-surface-muted">Evidências</p>
                <p className="mt-1 text-2xl font-semibold">{summary?.evidênciasTotal ?? 0}</p>
              </div>
              <div className="rounded-sm border border-outline bg-surface-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-on-surface-muted">Erros</p>
                <p className="mt-1 text-2xl font-semibold text-rose-600">{summary?.erros ?? 0}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                data-testid="mobile-search-input"
                placeholder="Buscar parcela por SQLU, inscrição ou endereço"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button data-testid="mobile-search-button" loading={searchParcels.isPending} onClick={() => searchParcels.mutate()}>
                Buscar
              </Button>
            </div>

            <div className="max-h-40 space-y-2 overflow-y-auto rounded-sm border border-outline bg-surface p-2">
              {results.length === 0 ? (
                <p className="px-2 py-3 text-sm text-on-surface-muted">Nenhuma parcela carregada.</p>
              ) : (
                results.map((parcel) => {
                  const parcelId = resolveParcelId(parcel);
                  const label =
                    parcel.mainAddress ??
                    parcel.inscriçãoImobiliaria ??
                    parcel.inscription ??
                    parcel.sqlu ??
                    parcelId;
                  const isSelected = selectedParcel && resolveParcelId(selectedParcel) === parcelId;
                  return (
                    <button
                      key={parcelId}
                      data-testid={`mobile-parcel-${parcelId}`}
                      className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm ${
                        isSelected ? "bg-primary text-white" : "bg-surface-elevated text-on-surface"
                      }`}
                      onClick={() => setSelectedParcel(parcel)}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="text-xs opacity-80">{parcel.workflowStatus ?? "-"}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="space-y-2 rounded-sm border border-outline bg-surface p-3">
              <p className="text-sm font-semibold">Checklist de campo</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  data-testid="mobile-check-occupancy"
                  type="checkbox"
                  checked={Boolean(checklist.occupancyChecked)}
                  onChange={(event) =>
                    setChecklist((prev) => ({ ...prev, occupancyChecked: event.target.checked }))
                  }
                />
                Ocupação confirmada
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  data-testid="mobile-check-address"
                  type="checkbox"
                  checked={Boolean(checklist.addressChecked)}
                  onChange={(event) =>
                    setChecklist((prev) => ({ ...prev, addressChecked: event.target.checked }))
                  }
                />
                Endereço validado
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  data-testid="mobile-check-infra"
                  type="checkbox"
                  checked={Boolean(checklist.infrastructureChecked)}
                  onChange={(event) =>
                    setChecklist((prev) => ({ ...prev, infrastructureChecked: event.target.checked }))
                  }
                />
                Infraestrutura conferida
              </label>
              <textarea
                data-testid="mobile-notes"
                className="min-h-20 w-full rounded-sm border border-outline bg-surface-elevated px-3 py-2 text-sm"
                placeholder="Observações de campo"
                value={checklist.notes ?? ""}
                onChange={(event) => setChecklist((prev) => ({ ...prev, notes: event.target.value }))}
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <Button data-testid="mobile-capture-gps" type="button" variant="outline" onClick={handleCaptureLocation}>
                  <LocateFixed className="h-4 w-4" />
                  Capturar GPS
                </Button>
                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-sm border border-outline bg-surface-elevated px-4 text-sm font-semibold">
                  <UploadCloud className="h-4 w-4" />
                  Anexar evidência
                  <input
                    data-testid="mobile-photo-input"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      try {
                        const encoded = await fileToBase64(file);
                        const checksum = await sha256Hex(encoded);
                        const capturedAt = new Date().toISOString();
                        setPhotoBase64(encoded);
                        setEvidenceFiles((prev) => [
                          ...prev,
                          {
                            clientId: crypto.randomUUID(),
                            fileName: file.name,
                            base64: encoded,
                            mimeType: file.type || undefined,
                            checksum,
                            capturedAt,
                            size: file.size,
                            status: "PENDENTE",
                            retries: 0,
                          },
                        ]);
                        toast.success("Foto anexada para envio.");
                      } catch {
                        toast.error("Falha ao ler foto.");
                      }
                    }}
                  />
                </label>
              </div>

              {location && (
                <p className="text-xs text-on-surface-muted">
                  GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
              {evidenceFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">Evidências locais</p>
                  {evidenceFiles.map((evidence) => (
                    <div key={evidence.clientId} className="rounded-sm border border-outline bg-cloud px-3 py-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{evidence.fileName}</span>
                        <Badge variant={evidence.status === "ERRO" ? "destructive" : evidence.status === "SINCRONIZADO" ? "info" : "outline"}>
                          {evidence.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">Tentativas {evidence.retries}</Badge>
                        {evidence.size ? <Badge variant="outline">{Math.round(evidence.size / 1024)} KB</Badge> : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEvidenceFiles((prev) => prev.filter((current) => current.clientId !== evidence.clientId))}
                        >
                          Remover
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEvidenceFiles((prev) =>
                              prev.map((current) =>
                                current.clientId === evidence.clientId
                                  ? {
                                      ...current,
                                      status: "PENDENTE",
                                      retries: current.retries + 1,
                                      lastError: undefined,
                                      lastAttemptAt: new Date().toISOString(),
                                    }
                                  : current,
                              ),
                            )
                          }
                        >
                          Reenviar
                        </Button>
                      </div>
                      {evidence.checksum ? <p className="mt-1 text-[11px] text-on-surface-muted">SHA-256 {evidence.checksum.slice(0, 12)}...</p> : null}
                      {evidence.capturedAt ? <p className="mt-1 text-[11px] text-on-surface-muted">Capturada em {new Date(evidence.capturedAt).toLocaleString("pt-BR")}</p> : null}
                      {evidence.lastError ? <p className="mt-1 text-rose-700">{evidence.lastError}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button data-testid="mobile-save-offline" onClick={handleStoreOffline}>Salvar offline</Button>
              <Button data-testid="mobile-sync-now" variant="outline" loading={syncQueue.isPending} onClick={() => syncQueue.mutate()}>
                <RefreshCcw className="h-4 w-4" />
                Sincronizar agora
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Fila offline</CardTitle>
            <CardDescription>{queue.length} registro(s) aguardando sincronização.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {queue.length === 0 ? (
              <p className="text-sm text-on-surface-muted">Fila vazia.</p>
            ) : (
              queue.map((item) => (
                <div key={item.id} className="rounded-sm border border-outline bg-surface p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.parcelLabel}</p>
                    <Badge variant={item.status === "ERRO" ? "destructive" : item.status === "SINCRONIZADO" ? "info" : "outline"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-muted">
                    {item.checklist.occupancyChecked ? "Ocupação" : "Sem ocupação"} ·{" "}
                    {item.checklist.addressChecked ? "Endereço ok" : "Endereço pendente"} ·{" "}
                    {item.checklist.infrastructureChecked ? "Infra ok" : "Infra pendente"}
                  </p>
                  {item.location && (
                    <p className="text-xs text-on-surface-muted">
                      GPS {item.location.lat.toFixed(5)}, {item.location.lng.toFixed(5)}
                    </p>
                  )}
                  <p className="text-xs text-on-surface-muted">{new Date(item.createdAt).toLocaleString("pt-BR")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">Tentativas {item.retries}</Badge>
                    {item.lastError ? <Badge variant="outline">{item.lastError}</Badge> : null}
                    {item.status === "ERRO" && item.lastError?.includes("CONFLITO") ? (
                      <Badge variant="outline">Conflito de cadastro</Badge>
                    ) : null}
                    {item.lastAttemptAt ? <Badge variant="outline">Última tentativa {new Date(item.lastAttemptAt).toLocaleTimeString("pt-BR")}</Badge> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={queueBusyId === item.id}
                      onClick={async () => {
                        setQueueBusyId(item.id);
                        try {
                          await markOfflineQueueStatus(item.id, {
                            status: "PENDENTE",
                            retries: item.retries + 1,
                            lastError: undefined,
                            lastAttemptAt: new Date().toISOString(),
                          });
                          await appendOfflineQueueHistory(item.id, {
                            at: new Date().toISOString(),
                            status: "PENDENTE",
                            message: "Registro marcado manualmente para novo envio",
                            source: "device",
                          });
                          await refreshQueue();
                          toast.success("Registro marcado para novo envio.");
                        } finally {
                          setQueueBusyId(null);
                        }
                      }}
                      >
                      Reenviar registro
                    </Button>
                  </div>
                  {item.evidences?.length ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">Evidências da fila</p>
                      {item.evidences.map((evidence) => (
                        <div key={evidence.clientId} className="rounded-sm border border-outline bg-cloud px-3 py-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{evidence.fileName ?? evidence.clientId}</span>
                            <Badge variant={evidence.status === "ERRO" ? "destructive" : evidence.status === "SINCRONIZADO" ? "info" : "outline"}>
                              {evidence.status}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="outline">Tentativas {evidence.retries}</Badge>
                            {evidence.size ? <Badge variant="outline">{Math.round(evidence.size / 1024)} KB</Badge> : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={queueBusyId === item.id}
                              onClick={async () => {
                                setQueueBusyId(item.id);
                                try {
                                  await markOfflineEvidenceStatus(item.id, evidence.clientId, {
                                    status: "PENDENTE",
                                    retries: evidence.retries + 1,
                                    lastError: undefined,
                                    lastAttemptAt: new Date().toISOString(),
                                  });
                                  await appendOfflineQueueHistory(item.id, {
                                    at: new Date().toISOString(),
                                    status: "PENDENTE",
                                    message: `Evidência ${evidence.fileName ?? evidence.clientId} marcada para novo envio`,
                                    source: "device",
                                  });
                                  await refreshQueue();
                                  toast.success("Evidência marcada para novo envio.");
                                } finally {
                                  setQueueBusyId(null);
                                }
                              }}
                            >
                              Reenviar evidência
                            </Button>
                          </div>
                          {evidence.checksum ? <p className="mt-1 text-[11px] text-on-surface-muted">SHA-256 {evidence.checksum.slice(0, 12)}...</p> : null}
                          {evidence.capturedAt ? <p className="mt-1 text-[11px] text-on-surface-muted">Capturada em {new Date(evidence.capturedAt).toLocaleString("pt-BR")}</p> : null}
                          {evidence.lastError ? <p className="mt-1 text-rose-700">{evidence.lastError}</p> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {item.syncHistory?.length ? (
                    <div className="mt-3 space-y-1 rounded-sm border border-outline bg-cloud px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted">Histórico de sync</p>
                      {item.syncHistory.map((entry, index) => (
                        <p key={`${entry.at}-${index}`} className="text-[11px] text-on-surface-muted">
                          {new Date(entry.at).toLocaleString("pt-BR")} · {entry.status} · {entry.message}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Registros sincronizados</CardTitle>
            <CardDescription>{syncedRecords.length} registro(s) persistidos no backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {syncedRecords.length === 0 ? (
              <p className="text-sm text-on-surface-muted">Nenhum registro sincronizado ainda.</p>
            ) : (
              syncedRecords.map((record) => (
                <div key={record._id ?? record.id} className="rounded-sm border border-outline bg-surface p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{record.parcelId ?? "Parcela"}</p>
                    <Badge variant="info">{record.syncStatus ?? "PROCESSADO"}</Badge>
                  </div>
                  <p className="text-xs text-on-surface-muted">
                    Evidências: {record.evidences?.length ?? 0} · Tentativas: {record.syncAttempts ?? 0}
                  </p>
                  {record.syncedAt ? (
                    <p className="text-xs text-on-surface-muted">Sincronizado em {new Date(record.syncedAt).toLocaleString("pt-BR")}</p>
                  ) : null}
                  {record.syncContext?.serverParcelUpdatedAt ? (
                    <p className="text-xs text-rose-700">
                      Cadastro remoto em {new Date(record.syncContext.serverParcelUpdatedAt).toLocaleString("pt-BR")}
                    </p>
                  ) : null}
                  {record.evidences?.length ? (
                    <div className="mt-2 space-y-1">
                      {record.evidences.map((evidence: any) => (
                        <p key={evidence.clientId} className="text-xs text-on-surface-muted">
                          {evidence.fileName ?? evidence.clientId} · {evidence.status ?? "SINCRONIZADO"} · {evidence.checksum ? `SHA ${String(evidence.checksum).slice(0, 12)}...` : "sem hash"}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {record.syncTimeline?.length ? (
                    <div className="mt-2 space-y-1">
                      {record.syncTimeline.map((entry: any, index: number) => (
                        <p key={`${entry.at}-${index}`} className="text-xs text-on-surface-muted">
                          {new Date(entry.at).toLocaleString("pt-BR")} · {entry.status} · {entry.message}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Toaster position="bottom-center" richColors />
    </div>
  );
}
