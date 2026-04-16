"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">PGV - Faces de Quadra</h1>
          <p className="text-sm text-on-surface-muted">Planta Genérica de Valores aplicada à infraestrutura urbana.</p>
        </div>
        <Badge variant="info">P0 Tributário</Badge>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Valoração de Terrenos</CardTitle>
            <CardDescription>Valores base para cálculo venal por metro quadrado.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data ?? []}
              loading={isLoading}
              columns={[
                { key: "code", label: "Código da Face", render: (_, row) => row.code ?? "-" },
                {
                  key: "landValuePerSqm",
                  label: "Valor Terreno (R$/m²)",
                  render: (_, row) => {
                    const val = Number(row.valorTerrenoM2 ?? row.landValuePerSqm ?? 0);
                    return val > 0 ? `R$ ${val.toFixed(2)}` : "-";
                  }
                },
                {
                  key: "metadados",
                  label: "Lado / Metadado",
                  render: (_, row) => <Badge variant="outline">{row.metadados?.lado ?? "-"}</Badge>,
                },
              ]}
              emptyMessage="Nenhuma face de quadra configurada."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
