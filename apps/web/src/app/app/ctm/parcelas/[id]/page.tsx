"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, API_URL } from "@/lib/api";
import { ChevronLeft, ClipboardCheck, Edit2, FileDown, Save, X, CheckCircle2, XCircle } from "lucide-react";

const MiniMap = dynamic(() => import("@/components/maps/MiniMap"), { ssr: false });

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
  geometry?: unknown;
  createdAt?: string;
  updatedAt?: string;
  sourceType?: string;
  isOfficial?: boolean;
  statusIPTU?: string;
  iptuLancado?: number | null;
  iptuPago?: number | null;
  iptuEmAberto?: number | null;
  valorVenalTotal?: number | null;
};

type BuildingData = {
  usoTipo?: string;
  padrao?: string;
  areaConstruida?: number;
  pavimentos?: number;
  anoConstrutivo?: number;
};

type SocioeconomicData = {
  faixaRenda?: string;
  moradores?: number;
  vulnerabilidade?: string;
};

type InfrastructureData = {
  agua?: boolean;
  esgoto?: boolean;
  energia?: boolean;
  pavimentacao?: boolean;
  iluminacao?: boolean;
  coletaLixo?: boolean;
};

type VistoriaItem = {
  _id: string;
  tipo?: string;
  data?: string;
  status?: string;
};

type TabId = "construcao" | "socioeconomico" | "infraestrutura" | "vistorias" | "iptu";

const TABS: { id: TabId; label: string }[] = [
  { id: "construcao", label: "Construção" },
  { id: "socioeconomico", label: "Socioeconômico" },
  { id: "infraestrutura", label: "Infraestrutura" },
  { id: "vistorias", label: "Vistorias" },
  { id: "iptu", label: "IPTU" },
];

function formatBRL(value: number | null | undefined): string {
  if (value == null) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ParcelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const parcelId = (params?.id as string) || "";

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Parcel>>({});
  const [activeTab, setActiveTab] = useState<TabId>("construcao");

  const { data: parcel, isLoading, error } = useQuery({
    queryKey: ["parcel", parcelId],
    queryFn: () => apiFetch<Parcel>(`/ctm/parcels/${parcelId}`),
  });

  const { data: history } = useQuery({
    queryKey: ["parcel-history", parcelId],
    queryFn: () => apiFetch<{ action?: string; createdAt: string; diff?: { observacao?: string } }[]>(`/ctm/parcels/${parcelId}/history`),
    enabled: !!parcel,
  });

  const { data: building, isLoading: buildingLoading } = useQuery({
    queryKey: ["parcel-building", parcelId],
    queryFn: async () => {
      try {
        return await apiFetch<BuildingData>(`/ctm/parcels/${parcelId}/building`);
      } catch {
        return null;
      }
    },
    enabled: activeTab === "construcao" && !!parcelId,
  });

  const { data: socioeconomic, isLoading: socioeconomicLoading } = useQuery({
    queryKey: ["parcel-socioeconomic", parcelId],
    queryFn: async () => {
      try {
        return await apiFetch<SocioeconomicData>(`/ctm/parcels/${parcelId}/socioeconomic`);
      } catch {
        return null;
      }
    },
    enabled: activeTab === "socioeconomico" && !!parcelId,
  });

  const { data: infrastructure, isLoading: infrastructureLoading } = useQuery({
    queryKey: ["parcel-infrastructure", parcelId],
    queryFn: async () => {
      try {
        return await apiFetch<InfrastructureData>(`/ctm/parcels/${parcelId}/infrastructure`);
      } catch {
        return null;
      }
    },
    enabled: activeTab === "infraestrutura" && !!parcelId,
  });

  const { data: vistorias, isLoading: vistoriasLoading } = useQuery({
    queryKey: ["parcel-vistorias", parcelId],
    queryFn: async () => {
      try {
        return await apiFetch<VistoriaItem[]>(`/ctm/vistorias?parcelId=${parcelId}`);
      } catch {
        return null;
      }
    },
    enabled: activeTab === "vistorias" && !!parcelId,
  });

  const [showTransicao, setShowTransicao] = useState(false);
  const [transicaoStatus, setTransicaoStatus] = useState("");
  const [transicaoObs, setTransicaoObs] = useState("");

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
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold">Lote {parcel.sqlu}</h1>
              {parcel.isOfficial && <Badge variant="success">OFICIAL</Badge>}
              {!parcel.isOfficial && parcel.sourceType === "DEMO" && <Badge variant="warning">DEMO</Badge>}
            </div>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const token = typeof window !== 'undefined'
                  ? (localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken'))
                  : null;
                fetch(`${API_URL}/ctm/parcels/${parcelId}/pdf`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                  .then(r => r.blob())
                  .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `lote-${parcel.sqlu ?? parcelId}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                  });
              }}
            >
              <FileDown className="h-4 w-4 mr-2" />
              PDF
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
        {/* MiniMap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Localização</CardTitle>
            <CardDescription>Dados geoespaciais do lote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[280px] w-full rounded-md overflow-hidden">
              <MiniMap
                geojsonUrl={`${API_URL}/ctm/parcels/geojson?sqlu=${encodeURIComponent(parcel.sqlu)}`}
                interactive={false}
              />
            </div>
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

      {/* Tabs */}
      <Card className="mb-6">
        <CardHeader className="pb-0">
          <div className="flex gap-0 border-b border-outline overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  activeTab === tab.id
                    ? "px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary whitespace-nowrap"
                    : "px-4 py-3 text-sm font-medium border-b-2 border-transparent text-on-surface-muted hover:text-on-surface whitespace-nowrap"
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {activeTab === "construcao" && (
            <TabConstrucao data={building ?? null} isLoading={buildingLoading} parcelId={parcelId} />
          )}
          {activeTab === "socioeconomico" && (
            <TabSocioeconomico data={socioeconomic ?? null} isLoading={socioeconomicLoading} />
          )}
          {activeTab === "infraestrutura" && (
            <TabInfraestrutura data={infrastructure ?? null} isLoading={infrastructureLoading} />
          )}
          {activeTab === "vistorias" && (
            <TabVistorias data={vistorias ?? null} isLoading={vistoriasLoading} parcelId={parcelId} router={router} />
          )}
          {activeTab === "iptu" && (
            <TabIPTU parcel={parcel} />
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

function TabConstrucao({
  data,
  isLoading,
  parcelId,
}: {
  data: BuildingData | null;
  isLoading: boolean;
  parcelId: string;
}) {
  if (isLoading) {
    return <div className="h-24 bg-muted rounded animate-pulse" />;
  }
  if (!data) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-on-surface-muted">Informações construtivas não cadastradas.</p>
        <Button variant="outline" size="sm" disabled title="Em breve">
          Registrar Dados Construtivos
        </Button>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Uso / Tipo</p>
        <p className="mt-1">{data.usoTipo || "-"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Padrão</p>
        <p className="mt-1">{data.padrao || "-"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Área Construída (m²)</p>
        <p className="mt-1 font-semibold">{data.areaConstruida != null ? data.areaConstruida.toFixed(2) : "-"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Pavimentos</p>
        <p className="mt-1">{data.pavimentos ?? "-"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Ano Construtivo</p>
        <p className="mt-1">{data.anoConstrutivo ?? "-"}</p>
      </div>
    </div>
  );
}

function TabSocioeconomico({
  data,
  isLoading,
}: {
  data: SocioeconomicData | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-24 bg-muted rounded animate-pulse" />;
  }
  if (!data) {
    return <p className="text-sm text-on-surface-muted">Dados socioeconômicos não cadastrados.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Faixa de Renda</p>
        <p className="mt-1">{data.faixaRenda || "-"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Moradores</p>
        <p className="mt-1 font-semibold">{data.moradores ?? "-"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Vulnerabilidade</p>
        <p className="mt-1">{data.vulnerabilidade || "-"}</p>
      </div>
    </div>
  );
}

const INFRA_ITEMS: { key: keyof InfrastructureData; label: string }[] = [
  { key: "agua", label: "Água" },
  { key: "esgoto", label: "Esgoto" },
  { key: "energia", label: "Energia" },
  { key: "pavimentacao", label: "Pavimentação" },
  { key: "iluminacao", label: "Iluminação" },
  { key: "coletaLixo", label: "Coleta de Lixo" },
];

function TabInfraestrutura({
  data,
  isLoading,
}: {
  data: InfrastructureData | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-24 bg-muted rounded animate-pulse" />;
  }
  if (!data) {
    return <p className="text-sm text-on-surface-muted">Dados de infraestrutura não cadastrados.</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {INFRA_ITEMS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          {data[key] ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
          )}
          <span className="text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}

function TabVistorias({
  data,
  isLoading,
  parcelId,
  router,
}: {
  data: VistoriaItem[] | null;
  isLoading: boolean;
  parcelId: string;
  router: ReturnType<typeof useRouter>;
}) {
  if (isLoading) {
    return <div className="h-24 bg-muted rounded animate-pulse" />;
  }
  return (
    <div className="space-y-4">
      {data && data.length > 0 ? (
        <div className="space-y-2">
          {data.map((v) => (
            <div
              key={v._id}
              className="flex items-center justify-between rounded-md border border-outline px-4 py-3 hover:bg-surface-elevated cursor-pointer transition-colors"
              onClick={() => router.push(`/app/ctm/vistorias/${v._id}`)}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{v.tipo || "Vistoria"}</span>
                {v.data && (
                  <span className="text-xs text-on-surface-muted">
                    {new Date(v.data).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
              {v.status && (
                <Badge variant="outline" className="text-xs">{v.status}</Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-on-surface-muted">Nenhuma vistoria registrada para este lote.</p>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/app/ctm/vistorias/novo?parcelId=${parcelId}`)}
      >
        <ClipboardCheck className="h-4 w-4 mr-2" />
        Nova Vistoria
      </Button>
    </div>
  );
}

function TabIPTU({ parcel }: { parcel: Parcel }) {
  const hasData =
    parcel.statusIPTU != null ||
    parcel.iptuLancado != null ||
    parcel.iptuPago != null ||
    parcel.iptuEmAberto != null ||
    parcel.valorVenalTotal != null;

  if (!hasData) {
    return (
      <p className="text-sm text-on-surface-muted">
        Dados tributários não disponíveis. Importe via integração IPTU.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {parcel.statusIPTU != null && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Status IPTU</p>
          <p className="mt-1">{parcel.statusIPTU}</p>
        </div>
      )}
      {parcel.valorVenalTotal != null && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Valor Venal Total</p>
          <p className="mt-1 font-semibold">{formatBRL(parcel.valorVenalTotal)}</p>
        </div>
      )}
      {parcel.iptuLancado != null && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">IPTU Lançado</p>
          <p className="mt-1 font-semibold">{formatBRL(parcel.iptuLancado)}</p>
        </div>
      )}
      {parcel.iptuPago != null && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">IPTU Pago</p>
          <p className="mt-1 font-semibold text-emerald-700">{formatBRL(parcel.iptuPago)}</p>
        </div>
      )}
      {parcel.iptuEmAberto != null && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">IPTU em Aberto</p>
          <p className="mt-1 font-semibold text-rose-700">{formatBRL(parcel.iptuEmAberto)}</p>
        </div>
      )}
    </div>
  );
}
