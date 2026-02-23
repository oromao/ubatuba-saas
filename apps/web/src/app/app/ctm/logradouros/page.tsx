"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { apiFetch } from "@/lib/api";

type Logradouro = {
  _id: string;
  name?: string;
  nome?: string;
  type?: string;
  tipo?: string;
  code?: string;
  codigo?: string;
};

export default function CtmLogradourosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["ctm-logradouros"],
    queryFn: () => apiFetch<Logradouro[]>("/ctm/logradouros"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">CTM - Logradouros</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            {
              key: "code",
              label: "Codigo",
              render: (_, row) => row.codigo ?? row.code ?? "-",
            },
            {
              key: "name",
              label: "Nome",
              render: (_, row) => row.nome ?? row.name ?? "-",
            },
            {
              key: "type",
              label: "Tipo",
              render: (_, row) => row.tipo ?? row.type ?? "-",
            },
          ]}
        />
      </div>
    </div>
  );
}
