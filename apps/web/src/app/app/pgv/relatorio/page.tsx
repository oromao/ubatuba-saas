"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { apiFetch } from "@/lib/api";

type Valuation = {
  _id: string;
  parcelId: string;
  totalValue: number;
  landValue: number;
  constructionValue: number;
};

export default function PgvRelatorioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["pgv-valor-venal"],
    queryFn: () => apiFetch<Valuation[]>("/pgv/valuations"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">PGV - Relatorio por Parcela</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            { key: "parcelId", label: "Parcela" },
            {
              key: "totalValue",
              label: "Valor venal",
              render: (value) => `R$ ${Number(value).toFixed(2)}`,
            },
            {
              key: "landValue",
              label: "Terreno",
              render: (value) => `R$ ${Number(value).toFixed(2)}`,
            },
            {
              key: "constructionValue",
              label: "Construcao",
              render: (value) => `R$ ${Number(value).toFixed(2)}`,
            },
          ]}
        />
      </div>
    </div>
  );
}
