"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

type Process = {
  _id: string;
  title: string;
  owner: string;
  status: string;
  protocolNumber: string;
};

export default function ProcessesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["processes"],
    queryFn: () => apiFetch<Process[]>("/processes"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">Processos</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            { key: "protocolNumber", label: "Protocolo" },
            { key: "title", label: "Processo" },
            { key: "owner", label: "Responsavel" },
            {
              key: "status",
              label: "Status",
              render: (value) => (
                <Badge variant={String(value) === "CONCLUIDO" ? "success" : "info"}>
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
