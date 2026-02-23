"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { apiFetch } from "@/lib/api";

type Zone = {
  _id: string;
  code?: string;
  name?: string;
  nome?: string;
  baseLandValue?: number;
  baseConstructionValue?: number;
  valorBaseTerrenoM2?: number;
  valorBaseConstrucaoM2?: number;
};

export default function PgvZonesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["pgv-zones"],
    queryFn: () => apiFetch<Zone[]>("/pgv/zones"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">PGV - Zonas de Valor</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            { key: "code", label: "Codigo", render: (_, row) => row.code ?? "-" },
            {
              key: "name",
              label: "Nome",
              render: (_, row) => row.nome ?? row.name ?? "-",
            },
            {
              key: "baseLandValue",
              label: "Base terreno (R$/m2)",
              render: (_, row) =>
                Number(row.valorBaseTerrenoM2 ?? row.baseLandValue ?? 0).toFixed(2),
            },
            {
              key: "baseConstructionValue",
              label: "Base construcao (R$/m2)",
              render: (_, row) =>
                Number(row.valorBaseConstrucaoM2 ?? row.baseConstructionValue ?? 0).toFixed(2),
            },
          ]}
        />
      </div>
    </div>
  );
}
