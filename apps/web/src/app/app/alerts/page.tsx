"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

type Alert = {
  _id: string;
  title: string;
  level: string;
  status: string;
};

export default function AlertsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiFetch<Alert[]>("/alerts"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">Alertas ambientais</h1>
      <div className="mt-6">
        <DataTable
          data={data ?? []}
          loading={isLoading}
          columns={[
            { key: "title", label: "Alerta" },
            { key: "level", label: "Nivel" },
            {
              key: "status",
              label: "Status",
              render: (value) => (
                <Badge variant={String(value) === "ABERTO" ? "warning" : "default"}>
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
