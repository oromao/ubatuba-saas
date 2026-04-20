"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

type Asset = {
  _id: string;
  name: string;
  category: string;
  status: string;
};

export default function AssetsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["assets"],
    queryFn: () => apiFetch<Asset[]>("/assets"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">Ativos territoriais</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          error={error instanceof Error ? error.message : error ? "Falha ao carregar ativos." : null}
          columns={[
            { key: "name", label: "Ativo" },
            { key: "category", label: "Categoria" },
            {
              key: "status",
              label: "Status",
              render: (value) => (
                <Badge variant={String(value) === "ATIVO" ? "success" : "warning"}>
                  {String(value)}
                </Badge>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
