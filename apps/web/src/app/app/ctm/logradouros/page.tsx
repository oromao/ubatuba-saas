"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">CTM - Logradouros</h1>
          <p className="text-sm text-on-surface-muted">Tabela oficial de vias para endereçamento unificado.</p>
        </div>
        <Badge variant="info">P1 Base</Badge>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Logradouros e Vias Públicas</CardTitle>
            <CardDescription>Base oficial para emissão de alvarás e tributação.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data ?? []}
              loading={isLoading}
              columns={[
                {
                  key: "code",
                  label: "Código",
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
                  render: (_, row) => <Badge variant="outline">{row.tipo ?? row.type ?? "-"}</Badge>,
                },
              ]}
              emptyMessage="Nenhum logradouro encontrado."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
