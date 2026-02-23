"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { apiFetch } from "@/lib/api";

type UrbanFurniture = {
  _id: string;
  type?: string;
  tipo?: string;
  condition?: string;
  estadoConservacao?: string;
  notes?: string;
  observacao?: string;
  fotoUrl?: string;
};

export default function CtmMobiliarioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["ctm-urban-furniture"],
    queryFn: () => apiFetch<UrbanFurniture[]>("/ctm/urban-furniture"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">CTM - Mobiliario Urbano</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            {
              key: "type",
              label: "Tipo",
              render: (_, row) => row.tipo ?? row.type ?? "-",
            },
            {
              key: "condition",
              label: "Conservacao",
              render: (_, row) => row.estadoConservacao ?? row.condition ?? "-",
            },
            {
              key: "notes",
              label: "Observacao",
              render: (_, row) => row.observacao ?? row.notes ?? "-",
            },
          ]}
        />
      </div>
    </div>
  );
}
