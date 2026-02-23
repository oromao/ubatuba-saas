"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { apiFetch } from "@/lib/api";

type Parcel = {
  _id: string;
  sqlu: string;
  inscription?: string;
  inscricaoImobiliaria?: string;
  mainAddress?: string;
  enderecoPrincipal?: {
    logradouro?: string;
    numero?: string;
  };
  areaTerreno?: number;
  area?: number;
  statusCadastral?: string;
  status?: string;
  workflowStatus?: string;
  pendingIssues?: string[];
};

type PendingItem = {
  parcelId: string;
  sqlu: string;
  inscription?: string;
  workflowStatus: string;
  pendingIssues: string[];
};

export default function CtmParcelsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["ctm-parcels"],
    queryFn: () => apiFetch<Parcel[]>("/ctm/parcels"),
  });

  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["ctm-parcels-pending"],
    queryFn: () => apiFetch<PendingItem[]>("/ctm/parcels/pendencias"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">CTM - Parcelas</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            { key: "sqlu", label: "SQLU" },
            {
              key: "inscription",
              label: "Inscricao",
              render: (_, row) => row.inscricaoImobiliaria ?? row.inscription ?? "-",
            },
            {
              key: "mainAddress",
              label: "Endereco",
              render: (_, row) => {
                const address =
                  row.mainAddress ??
                  [row.enderecoPrincipal?.logradouro, row.enderecoPrincipal?.numero]
                    .filter(Boolean)
                    .join(", ");
                return address && address.length > 0 ? address : "-";
              },
            },
            {
              key: "area",
              label: "Area (m2)",
              render: (_, row) => Number(row.areaTerreno ?? row.area ?? 0).toFixed(2),
            },
            {
              key: "status",
              label: "Status",
              render: (_, row) => row.statusCadastral ?? row.status ?? "-",
            },
            {
              key: "workflowStatus",
              label: "Workflow",
              render: (_, row) => row.workflowStatus ?? "PENDENTE",
            },
            {
              key: "pendingIssues",
              label: "Pendencias",
              render: (_, row) => (row.pendingIssues && row.pendingIssues.length > 0 ? row.pendingIssues.join(", ") : "-"),
            },
          ]}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-on-surface">Fila de pendencias</h2>
        <div className="mt-3">
          <DataTable
            data={pendingData ?? []}
            loading={loadingPending}
            columns={[
              { key: "sqlu", label: "SQLU" },
              { key: "inscription", label: "Inscricao" },
              { key: "workflowStatus", label: "Workflow" },
              {
                key: "pendingIssues",
                label: "Pendencias",
                render: (value) => (Array.isArray(value) ? value.join(", ") : "-"),
              },
            ]}
            emptyMessage="Sem pendencias no momento."
          />
        </div>
      </div>
    </div>
  );
}
