"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { apiFetch } from "@/lib/api";

type Face = {
  _id: string;
  code?: string;
  landValuePerSqm?: number;
  valorTerrenoM2?: number;
  metadados?: {
    lado?: string;
    trecho?: string;
  };
};

export default function PgvFacesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["pgv-faces"],
    queryFn: () => apiFetch<Face[]>("/pgv/faces"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">PGV - Faces de Quadra</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            { key: "code", label: "Codigo", render: (_, row) => row.code ?? "-" },
            {
              key: "landValuePerSqm",
              label: "Valor terreno (R$/m2)",
              render: (_, row) =>
                Number(row.valorTerrenoM2 ?? row.landValuePerSqm ?? 0).toFixed(2),
            },
            {
              key: "metadados",
              label: "Lado",
              render: (_, row) => row.metadados?.lado ?? "-",
            },
          ]}
        />
      </div>
    </div>
  );
}
