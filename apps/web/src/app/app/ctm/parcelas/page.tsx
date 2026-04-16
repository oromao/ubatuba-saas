"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/app/data-table";
import { apiFetch, API_URL } from "@/lib/api";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const MiniMap = dynamic(() => import("@/components/maps/MiniMap"), { ssr: false });

type Parcel = {
  _id: string;
  sqlu: string;
  inscription?: string;
  inscricaoImobiliaria?: string;
  mainAddress?: string;
  enderecoPrincipal?: { logradouro?: string; numero?: string; bairro?: string; cidade?: string };
  areaTerreno?: number;
  area?: number;
  statusCadastral?: string;
  status?: string;
  workflowStatus?: string;
  pendingIssues?: string[];
  sourceType?: string;
  isOfficial?: boolean;
  zoneamento?: string;
  statusIPTU?: string;
  iptuLancado?: number;
  iptuPago?: number;
  iptuEmAberto?: number;
  valorVenalTotal?: number;
  municipalityName?: string;
  setor?: string;
  quadra?: string;
  lote?: string;
};

type Statistics = {
  total: number;
  official: number;
  demo: number;
  withSqlu: number;
  withIptu: number;
  totalValorVenal: number;
  totalIptuLancado: number;
  totalIptuPago: number;
  totalIptuEmAberto: number;
  inadimplentes: number;
  taxaAdimplencia: number;
  byZone: Record<string, number>;
  byStatus: Record<string, number>;
};

type PendingItem = {
  parcelId: string;
  sqlu: string;
  inscription?: string;
  workflowStatus: string;
  pendingIssues: string[];
};

export default function CtmParcelsPage() {
  const router = useRouter();
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>("");
  const [showOnlyOfficial, setShowOnlyOfficial] = useState<boolean>(false);

  const queryParams = new URLSearchParams();
  if (sourceTypeFilter) queryParams.set("sourceType", sourceTypeFilter);
  if (showOnlyOfficial) queryParams.set("isOfficial", "true");

  const { data, isLoading, refetch } = useQuery<Parcel[]>({
    queryKey: ["ctm-parcels", sourceTypeFilter, showOnlyOfficial],
    queryFn: () => apiFetch<Parcel[]>(`/ctm/parcels?${queryParams.toString()}`),
  });

  const { data: statsData, isLoading: loadingStats } = useQuery<Statistics>({
    queryKey: ["ctm-parcels-statistics"],
    queryFn: () => apiFetch<Statistics>("/ctm/parcels/statistics"),
  });

  const { data: pendingData, isLoading: loadingPending } = useQuery<PendingItem[]>({
    queryKey: ["ctm-parcels-pending"],
    queryFn: () => apiFetch<PendingItem[]>("/ctm/parcels/pendencias"),
  });

  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const totalParcels = data?.length ?? 0;
  const activeParcels = data?.filter((p) => p.status === "ATIVO" || p.statusCadastral === "ATIVO").length ?? 0;
  const totalPending = pendingData?.length ?? 0;

  const hasOfficialData = (statsData?.official ?? 0) > 0;
  const hasAnyData = (statsData?.total ?? 0) > 0;
  const isDemoOnly = hasAnyData && !hasOfficialData;
  const hasExternalDemo = data?.some(p => p.sourceType === 'DEMO_EXTERNAL' || p.sourceType === 'OFFICIAL_SAMPLE') ?? false;
  const externalMunicipality = data?.find(p => p.municipalityName)?.municipalityName;

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Cadastro Técnico - Parcelas</h1>
          <p className="text-sm text-on-surface-muted">Gestão cadastral, histórico e consolidação territorial.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/ctm/parcelas/importar">
            <Button variant="outline" size="sm">Importar Dados</Button>
          </Link>
          {isDemoOnly && !hasExternalDemo && (
            <Badge variant="warning">MODO DEMO</Badge>
          )}
          {hasExternalDemo && (
            <Badge variant="info">BASE DEMO {externalMunicipality ? `- ${externalMunicipality.toUpperCase()}` : ''}</Badge>
          )}
          {hasOfficialData && (
            <Badge variant="success">DADOS OFICIAIS</Badge>
          )}
        </div>
      </div>

      {isDemoOnly && !hasExternalDemo && (
        <Card className="mt-4 border-amber-500 bg-amber-50">
          <CardContent className="p-4">
            <p className="font-semibold text-amber-800">Aviso: Modo Demonstração</p>
            <p className="text-sm text-amber-700">
              O sistema está operando com dados de demonstração. Para usar em produção, importe a base oficial de lotes da prefeitura via GeoJSON ou shapefile.
            </p>
          </CardContent>
        </Card>
      )}

      {hasExternalDemo && (
        <Card className="mt-4 border-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <p className="font-semibold text-blue-800">Base Demonstrativa Externa</p>
            <p className="text-sm text-blue-700">
              O sistema está exibindo dados de demonstração externos ({externalMunicipality || 'município externo'}). 
              Esta base é usada apenas para演示 e não representa dados oficiais de Ubatuba.
            </p>
          </CardContent>
        </Card>
      )}

      {!hasAnyData && (
        <Card className="mt-4 border-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <p className="font-semibold text-blue-800">Nenhuma parcela cadastrada</p>
            <p className="text-sm text-blue-700">
              Importe a base territorial oficial ou utilize o seed demo para testes.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Total de Parcelas</p>
            <p className="mt-1 text-2xl font-semibold text-on-surface">{statsData?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Parcelas Oficiais</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">{statsData?.official ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Com SQLU</p>
            <p className="mt-1 text-2xl font-semibold text-on-surface">{statsData?.withSqlu ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Taxa Adimplência</p>
            <p className="mt-1 text-2xl font-semibold text-on-surface">{statsData?.taxaAdimplencia?.toFixed(1) ?? 0}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        <Button
          variant={sourceTypeFilter === "" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSourceTypeFilter("")}
        >
          Todas
        </Button>
        <Button
          variant={sourceTypeFilter === "DEMO" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSourceTypeFilter("DEMO")}
        >
          Demo
        </Button>
        <Button
          variant={sourceTypeFilter === "OFFICIAL_IMPORT" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSourceTypeFilter("OFFICIAL_IMPORT")}
        >
          Oficial
        </Button>
        <Button
          variant={sourceTypeFilter === "DEMO_EXTERNAL" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSourceTypeFilter("DEMO_EXTERNAL")}
        >
          Externo
        </Button>
        <Button
          variant={sourceTypeFilter === "OFFICIAL_SAMPLE" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSourceTypeFilter("OFFICIAL_SAMPLE")}
        >
          Amostra
        </Button>
        <Button
          variant={sourceTypeFilter === "GEOJSON" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSourceTypeFilter("GEOJSON")}
        >
          GeoJSON
        </Button>
        <Button
          variant={showOnlyOfficial ? "primary" : "outline"}
          size="sm"
          onClick={() => setShowOnlyOfficial(!showOnlyOfficial)}
        >
          {showOnlyOfficial ? "Mostrar Todos" : "Apenas Oficiais"}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Mapa Cadastral</CardTitle>
            <CardDescription>
              {hasOfficialData 
                ? `Visualização de ${statsData?.official} parcelas oficiais`
                : "Nenhuma base oficial importada"}
            </CardDescription>
          </CardHeader>
          <div className="relative flex-1 min-h-[400px]">
            <MiniMap 
              interactive 
              geojsonUrl={`${API_URL}/ctm/parcels/geojson?${queryParams.toString()}`}
              onFeatureClick={(props) => setSelectedParcel(props)}
            />
            {selectedParcel && (
              <div className="absolute bottom-4 left-4 right-4 rounded-md border border-outline bg-surface-elevated/95 p-3 shadow-lg backdrop-blur max-h-48 overflow-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">SQLU: {selectedParcel.sqlu}</p>
                    <p className="text-xs text-on-surface-muted">Área: {Number(selectedParcel.areaTerreno || selectedParcel.area || 0).toFixed(2)} m²</p>
                    <p className="text-xs text-on-surface-muted">Endereço: {selectedParcel.address || selectedParcel.mainAddress || "-"}</p>
                    {selectedParcel.sourceType && (
                      <Badge variant={selectedParcel.isOfficial ? "success" : "outline"} className="mt-1">
                        {selectedParcel.sourceType}
                      </Badge>
                    )}
                  </div>
                  <button onClick={() => setSelectedParcel(null)} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base Consolidada</CardTitle>
            <CardDescription>Visualização em lista das parcelas territoriais.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data ?? []}
              loading={isLoading}
              onRowClick={(row: any) => router.push(`/app/ctm/parcelas/${row._id}`)}
              columns={[
                { key: "sqlu", label: "SQLU" },
                {
                  key: "inscription",
                  label: "Inscrição",
                  render: (_, row) => row.inscricaoImobiliaria ?? row.inscription ?? "-",
                },
                {
                  key: "mainAddress",
                  label: "Endereço",
                  render: (_, row) => {
                    const address = row.mainAddress ?? [row.enderecoPrincipal?.logradouro, row.enderecoPrincipal?.numero].filter(Boolean).join(", ");
                    return address && address.length > 0 ? address : "-";
                  },
                },
                {
                  key: "area",
                  label: "Área (m²)",
                  render: (_, row) => Number(row.areaTerreno ?? row.area ?? 0).toFixed(2),
                },
                {
                  key: "sourceType",
                  label: "Origem",
                  render: (_, row) => (
                    <Badge variant={row.isOfficial ? "success" : row.sourceType === "DEMO" ? "warning" : "outline"}>
                      {row.sourceType || "MANUAL"}
                    </Badge>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (_, row) => <Badge variant={row.statusCadastral === "ATIVO" || row.status === "ATIVO" ? "success" : "outline"}>{row.statusCadastral ?? row.status ?? "INATIVO"}</Badge>,
                },
              ]}
              emptyMessage="Nenhuma parcela encontrada no cadastro."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
