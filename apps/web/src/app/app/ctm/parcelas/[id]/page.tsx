"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { ChevronLeft, ClipboardCheck, Edit2, Save, X } from "lucide-react";

type Parcel = {
  _id: string;
  sqlu: string;
  inscription?: string;
  inscricaoImobiliaria?: string;
  mainAddress?: string;
  enderecoPrincipal?: { logradouro?: string; numero?: string; bairro?: string };
  areaTerreno?: number;
  area?: number;
  statusCadastral?: string;
  status?: string;
  workflowStatus?: string;
  pendingIssues?: string[];
  geometry?: any;
  createdAt?: string;
  updatedAt?: string;
};

export default function ParcelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const parcelId = (params?.id as string) || "";

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Parcel>>({});

  // Fetch parcel details
  const { data: parcel, isLoading, error } = useQuery({
    queryKey: ["parcel", parcelId],
    queryFn: () => apiFetch<Parcel>(`/ctm/parcels/${parcelId}`),
  });

  // Fetch parcel history
  const { data: history } = useQuery({
    queryKey: ["parcel-history", parcelId],
    queryFn: () => apiFetch<any[]>(`/ctm/parcels/${parcelId}/history`),
    enabled: !!parcel,
  });

  const [showTransicao, setShowTransicao] = useState(false);
  const [transicaoStatus, setTransicaoStatus] = useState("");
  const [transicaoObs, setTransicaoObs] = useState("");

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Parcel>) =>
      apiFetch(`/ctm/parcels/${parcelId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcel", parcelId] });
      queryClient.invalidateQueries({ queryKey: ["parcel-history", parcelId] });
      setIsEditing(false);
      setEditData({});
    },
  });

  const transicaoMutation = useMutation({
    mutationFn: ({ status, observacao }: { status: string; observacao: string }) =>
      apiFetch(`/ctm/parcels/${parcelId}/transicao`, {
        method: "POST",
        body: JSON.stringify({ status, observacao }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcel", parcelId] });
      queryClient.invalidateQueries({ queryKey: ["parcel-history", parcelId] });
      setShowTransicao(false);
      setTransicaoStatus("");
      setTransicaoObs("");
    },
  });

  const NEXT_STATUSES: Record<string, string[]> = {
    PENDENTE: ["EM_VALIDACAO"],
    EM_VALIDACAO: ["APROVADA", "REPROVADA", "PENDENTE"],
    APROVADA: ["PENDENTE"],
    REPROVADA: ["PENDENTE", "EM_VALIDACAO"],
  };
  const nextStatuses = NEXT_STATUSES[parcel?.workflowStatus ?? "PENDENTE"] ?? [];

  const handleEdit = () => {
    if (parcel) {
      setEditData(parcel);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">
        <div className="h-4 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <p className="font-semibold">Erro ao carregar lote</p>
          <p className="text-sm">{error?.message || "Lote não encontrado"}</p>
        </div>
      </div>
    );
  }

  const address = parcel.mainAddress ||
    [parcel.enderecoPrincipal?.logradouro, parcel.enderecoPrincipal?.numero]
      .filter(Boolean)
      .join(", ") ||
    "Sem endereço";

  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-muted mb-4">
        <span
          className="cursor-pointer hover:text-on-surface transition-colors"
          onClick={() => router.push("/app/ctm/parcelas")}
        >
          Parcelas
        </span>
        <span>/</span>
        <span className="text-on-surface font-semibold">Lote {parcel.sqlu}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/ctm/parcelas")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold">Lote {parcel.sqlu}</h1>
            <p className="text-sm text-on-surface-muted">{address}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && nextStatuses.length > 0 && (
            <Button onClick={() => setShowTransicao(true)} variant="outline" size="sm">
              Avançar Status
            </Button>
          )}
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/app/ctm/vistorias/novo?parcelId=${parcelId}`)}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Nova Vistoria
            </Button>
          )}
          {!isEditing && (
            <Button onClick={handleEdit} variant="primary" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        {/* Geometry Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Localização</CardTitle>
            <CardDescription>Dados geoespaciais do lote</CardDescription>
          </CardHeader>
          <CardContent>
            {parcel.geometry ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Tipo:</span> {parcel.geometry.type}</p>
                <p><span className="font-semibold">Coordenadas:</span> {JSON.stringify(parcel.geometry).substring(0, 100)}...</p>
                <p className="text-xs text-on-surface-muted">Visualização completa disponível na página de mapa</p>
              </div>
            ) : (
              <p className="text-on-surface-muted">Geometria não disponível</p>
            )}
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">
                Cadastral
              </p>
              <Badge variant={parcel.statusCadastral === "ATIVO" ? "success" : "outline"} className="mt-2">
                {parcel.statusCadastral || "INATIVO"}
              </Badge>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">
                Workflow
              </p>
              <Badge
                variant={
                  parcel.workflowStatus === "APROVADA"
                    ? "success"
                    : parcel.workflowStatus === "REPROVADA"
                      ? "destructive"
                      : "outline"
                }
                className="mt-2"
              >
                {parcel.workflowStatus || "PENDENTE"}
              </Badge>
            </div>

            {parcel.pendingIssues && parcel.pendingIssues.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted mb-2">
                  Pendências ({parcel.pendingIssues.length})
                </p>
                <ul className="space-y-1">
                  {parcel.pendingIssues.map((issue) => (
                    <li key={issue} className="text-xs bg-orange-50 text-orange-800 px-2 py-1 rounded">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dados Cadastrais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">SQLU</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.sqlu || ""}
                  onChange={(e) => setEditData({ ...editData, sqlu: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              ) : (
                <p className="mt-1 font-semibold">{parcel.sqlu}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">
                Inscrição Imobiliária
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.inscricaoImobiliaria || ""}
                  onChange={(e) => setEditData({ ...editData, inscricaoImobiliaria: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              ) : (
                <p className="mt-1">{parcel.inscricaoImobiliaria || "-"}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">
                Área (m²)
              </p>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.areaTerreno || editData.area || ""}
                  onChange={(e) => setEditData({ ...editData, areaTerreno: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              ) : (
                <p className="mt-1 font-semibold">{(parcel.areaTerreno || parcel.area || 0).toFixed(2)}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">
                Endereço
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.mainAddress || ""}
                  onChange={(e) => setEditData({ ...editData, mainAddress: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              ) : (
                <p className="mt-1">{address}</p>
              )}
            </div>

            {parcel.enderecoPrincipal?.bairro && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">
                  Bairro
                </p>
                <p className="mt-1">{parcel.enderecoPrincipal.bairro}</p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-6 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} loading={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Alterações</CardTitle>
            <CardDescription>{history.length} alterações registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((item, idx) => (
                <div key={idx} className="border-l-2 border-primary pl-3 py-2">
                  <p className="text-sm font-semibold text-on-surface">
                    {item.action || "Alteração"}
                  </p>
                  <p className="text-xs text-on-surface-muted">
                    {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </p>
                  {item.diff?.observacao && (
                    <p className="text-xs text-on-surface-muted mt-1">
                      Obs: {item.diff.observacao}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transicao Dialog */}
      {showTransicao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-outline bg-surface p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-semibold text-on-surface">Avançar Status do Workflow</h2>
            <p className="mb-4 text-sm text-on-surface-muted">
              Status atual: <Badge variant="outline">{parcel.workflowStatus ?? "PENDENTE"}</Badge>
            </p>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-on-surface-muted">
                Novo Status
              </label>
              <select
                value={transicaoStatus}
                onChange={(e) => setTransicaoStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {nextStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-on-surface-muted">
                Observação
              </label>
              <textarea
                value={transicaoObs}
                onChange={(e) => setTransicaoObs(e.target.value)}
                rows={3}
                placeholder="Descreva o motivo da transição..."
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { setShowTransicao(false); setTransicaoStatus(""); setTransicaoObs(""); }}
              >
                Cancelar
              </Button>
              <Button
                disabled={!transicaoStatus || transicaoMutation.isPending}
                onClick={() => transicaoMutation.mutate({ status: transicaoStatus, observacao: transicaoObs })}
              >
                {transicaoMutation.isPending ? "Processando..." : "Confirmar"}
              </Button>
            </div>
            {transicaoMutation.isError && (
              <p className="mt-3 text-sm text-rose-600">{(transicaoMutation.error as Error).message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
