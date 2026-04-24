"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { apiFetch } from "@/lib/api";

type UrbanFurniture = {
  _id: string;
  type?: string;
  tipo?: string;
  location?: { coordinates?: [number, number] };
  condition?: string;
  estadoConservacao?: string;
};

function formatLocation(location?: { coordinates?: [number, number] }): string {
  if (!location?.coordinates?.length) return "-";
  const [lng, lat] = location.coordinates;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export default function CtmEquipamentosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["ctm-equipamentos"],
    queryFn: () => apiFetch<UrbanFurniture[]>("/ctm/urban-furniture"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">CTM - Equipamentos Urbanos</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            {
              key: "_id",
              label: "ID",
              render: (_, row) => row._id ? row._id.slice(-8).toUpperCase() : "-",
            },
            {
              key: "type",
              label: "Tipo",
              render: (_, row) => row.tipo ?? row.type ?? "-",
            },
            {
              key: "location",
              label: "Localização",
              render: (_, row) => formatLocation(row.location),
            },
            {
              key: "condition",
              label: "Status",
              render: (_, row) => row.estadoConservacao ?? row.condition ?? "-",
            },
          ]}
        />
      </div>
    </div>
  );
}
