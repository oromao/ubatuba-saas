"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/app/data-table";

type CemeteryPlot = {
  _id: string;
  cemeteryName: string;
  block: string;
  row: string;
  plot: string;
  status: string;
  ownerName?: string;
  occupantName?: string;
  locationCode?: string;
  documentKeys?: string[];
  history?: Array<{ id: string }>;
};

type CemeterySummary = {
  total: number;
  livres: number;
  reservados: number;
  ocupados: number;
  manutencao: number;
  documentos: number;
};

export default function CemiterioPage() {
  const queryClient = useQueryClient();
  const [cemeteryName, setCemeteryName] = useState("Cemitério Municipal");
  const [block, setBlock] = useState("A");
  const [row, setRow] = useState("01");
  const [plot, setPlot] = useState("015");
  const [ownerName, setOwnerName] = useState("Familia Demo");
  const [occupantName, setOccupantName] = useState("Jazigo Demo");
  const [locationCode, setLocationCode] = useState("A-01-015");

  const plotsQuery = useQuery({
    queryKey: ["cemetery"],
    queryFn: () => apiFetch<CemeteryPlot[]>("/cemetery"),
  });
  const summaryQuery = useQuery({
    queryKey: ["cemetery-summary"],
    queryFn: () => apiFetch<CemeterySummary>("/cemetery/summary"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<CemeteryPlot>("/cemetery", {
        method: "POST",
        body: JSON.stringify({
          cemeteryName,
          block,
          row,
          plot,
          ownerName,
          occupantName,
          locationCode,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cemetery"] });
      queryClient.invalidateQueries({ queryKey: ["cemetery-summary"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, message }: { id: string; status: string; message: string }) =>
      apiFetch<CemeteryPlot>(`/cemetery/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          message,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cemetery"] });
      queryClient.invalidateQueries({ queryKey: ["cemetery-summary"] });
    },
  });

  const docsMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<CemeteryPlot>(`/cemetery/${id}/documents`, {
        method: "POST",
        body: JSON.stringify({
          keys: ["doc:registro-demo", "doc:termo-demo"],
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cemetery"] });
      queryClient.invalidateQueries({ queryKey: ["cemetery-summary"] });
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Gestão de Cemitério</h1>
          <p className="text-sm text-on-surface-muted">Quadras, jazigos, ocupação e documentos vinculados.</p>
        </div>
        <Badge variant="info">P2</Badge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total", value: summaryQuery.data?.total ?? 0 },
          { label: "Livres", value: summaryQuery.data?.livres ?? 0 },
          { label: "Reservados", value: summaryQuery.data?.reservados ?? 0 },
          { label: "Ocupados", value: summaryQuery.data?.ocupados ?? 0 },
          { label: "Manutenção", value: summaryQuery.data?.manutencao ?? 0 },
          { label: "Documentos", value: summaryQuery.data?.documentos ?? 0 },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-on-surface">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Novo jazigo</CardTitle>
            <CardDescription>Cadastro operacional do patrimônio funerário.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={cemeteryName} onChange={(e) => setCemeteryName(e.target.value)} placeholder="Nome do cemitério" />
            <div className="grid grid-cols-3 gap-2">
              <Input value={block} onChange={(e) => setBlock(e.target.value)} placeholder="Quadra" />
              <Input value={row} onChange={(e) => setRow(e.target.value)} placeholder="Fila" />
              <Input value={plot} onChange={(e) => setPlot(e.target.value)} placeholder="Jazigo" />
            </div>
            <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Concessionário" />
            <Input value={occupantName} onChange={(e) => setOccupantName(e.target.value)} placeholder="Ocupante" />
            <Input value={locationCode} onChange={(e) => setLocationCode(e.target.value)} placeholder="Código de localização" />
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Cadastrando..." : "Cadastrar jazigo"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jazigos</CardTitle>
            <CardDescription>Visão operacional e documental.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={plotsQuery.data ?? []}
              loading={plotsQuery.isLoading}
              columns={[
                { key: "cemeteryName", label: "Cemitério" },
                { key: "block", label: "Quadra" },
                { key: "row", label: "Fila" },
                { key: "plot", label: "Jazigo" },
                { key: "status", label: "Status", render: (value) => <Badge variant="outline">{String(value)}</Badge> },
                { key: "ownerName", label: "Concessionário" },
                { key: "occupantName", label: "Ocupante" },
                { key: "documentKeys", label: "Docs", render: (value) => <Badge variant="outline">{Array.isArray(value) ? value.length : 0}</Badge> },
                {
                  key: "_id",
                  label: "Ações",
                  render: (value) => (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          statusMutation.mutate({
                            id: String(value),
                            status: "RESERVADO",
                            message: "Jazigo reservado para regularização",
                          })
                        }
                      >
                        Reservar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          statusMutation.mutate({
                            id: String(value),
                            status: "OCUPADO",
                            message: "Jazigo ocupado",
                          })
                        }
                      >
                        Ocupado
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          statusMutation.mutate({
                            id: String(value),
                            status: "EM_MANUTENCAO",
                            message: "Jazigo em manutenção",
                          })
                        }
                      >
                        Manutenção
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => docsMutation.mutate(String(value))}>
                        Documentos
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
