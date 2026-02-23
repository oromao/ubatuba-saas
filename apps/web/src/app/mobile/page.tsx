"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { LocateFixed, RefreshCcw, UploadCloud, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
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
  listOfflineQueue,
  putOfflineQueueItem,
  removeOfflineQueueItem,
} from "@/lib/mobile-offline";

type Parcel = {
  _id?: string;
  id?: string;
  sqlu?: string;
  inscription?: string;
  inscricaoImobiliaria?: string;
  mainAddress?: string;
  workflowStatus?: string;
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
  const [queue, setQueue] = useState<OfflineQueueRecord[]>([]);

  const refreshQueue = useCallback(async () => {
    try {
      setQueue(await listOfflineQueue());
    } catch {
      setQueue([]);
    }
  }, []);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    void refreshQueue();
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [refreshQueue]);

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
          parcelId: item.parcelId,
          checklist: item.checklist,
          location: item.location,
          photoBase64: item.photoBase64,
        })),
      };

      const result = await apiFetch<{ processed: number }>("/mobile/ctm-sync", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await Promise.all(items.map((item) => removeOfflineQueueItem(item.id)));
      await refreshQueue();
      return result;
    },
    onSuccess: (result) => {
      toast.success(`${result.processed} registro(s) enviados para sincronizacao.`);
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
    return selectedParcel.mainAddress ?? selectedParcel.inscricaoImobiliaria ?? selectedParcel.inscription ?? selectedParcel.sqlu ?? resolveParcelId(selectedParcel);
  }, [selectedParcel]);

  const handleCaptureLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocalizacao nao suportada no dispositivo.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        toast.success("Localizacao capturada.");
      },
      () => toast.error("Nao foi possivel obter geolocalizacao."),
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
      parcelId,
      parcelLabel: selectedParcelLabel,
      checklist,
      location,
      photoBase64,
      createdAt: nowIso,
    });

    setChecklist({ occupancyChecked: false, addressChecked: false, infrastructureChecked: false, notes: "" });
    setLocation(undefined);
    setPhotoBase64(undefined);
    await refreshQueue();
    toast.success("Registro salvo offline.");
  };

  if (!ready) return null;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8 text-on-surface">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Modo Mobile (PWA)</CardTitle>
            <CardDescription>Voce precisa estar autenticado para coletar dados de campo.</CardDescription>
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
              Este modulo e exclusivo para perfis operacionais (Admin, Gestor e Operador/Campo).
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
              Coleta CTM offline-first com fila local (IndexedDB) e sincronizacao automatica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                data-testid="mobile-search-input"
                placeholder="Buscar parcela por SQLU, inscricao ou endereco"
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
                    parcel.inscricaoImobiliaria ??
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
                Ocupacao confirmada
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
                Endereco validado
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
                placeholder="Observacoes de campo"
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
                  Anexar foto
                  <input
                    data-testid="mobile-photo-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      try {
                        const encoded = await fileToBase64(file);
                        setPhotoBase64(encoded);
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
            <CardDescription>{queue.length} registro(s) aguardando sincronizacao.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {queue.length === 0 ? (
              <p className="text-sm text-on-surface-muted">Fila vazia.</p>
            ) : (
              queue.map((item) => (
                <div key={item.id} className="rounded-sm border border-outline bg-surface p-3 text-sm">
                  <p className="font-medium">{item.parcelLabel}</p>
                  <p className="text-xs text-on-surface-muted">{new Date(item.createdAt).toLocaleString("pt-BR")}</p>
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
