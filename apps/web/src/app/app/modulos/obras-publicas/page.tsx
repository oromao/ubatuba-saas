"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/app/data-table";

type PublicWork = {
  _id: string;
  protocolNumber: string;
  title: string;
  department: string;
  location: string;
  status: string;
  stage?: string;
  progress?: number;
  contractor?: string;
  measurements?: Array<{ id: string }>;
  evidenceKeys?: string[];
  history?: Array<{ id: string }>;
};

type PublicWorksSummary = {
  total: number;
  planejadas: number;
  execucao: number;
  contratadas: number;
  concluidas: number;
  progressoMedio: number;
  medicoes: number;
  evidencias: number;
};

export default function ObrasPublicasPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Requalificacao da orla");
  const [department, setDepartment] = useState("Secretaria de Obras");
  const [location, setLocation] = useState("Av. Iperoig, Ubatuba");
  const [contractor, setContractor] = useState("Construtora Demo");
  const [measurementLabel, setMeasurementLabel] = useState("Terraplanagem");
  const [measurementQuantity, setMeasurementQuantity] = useState("12");
  const [measurementUnit, setMeasurementUnit] = useState("m2");

  const worksQuery = useQuery({
    queryKey: ["public-works"],
    queryFn: () => apiFetch<PublicWork[]>("/public-works"),
  });
  const summaryQuery = useQuery({
    queryKey: ["public-works-summary"],
    queryFn: () => apiFetch<PublicWorksSummary>("/public-works/summary"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<PublicWork>("/public-works", {
        method: "POST",
        body: JSON.stringify({
          title,
          department,
          location,
          contractor,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-works"] });
      queryClient.invalidateQueries({ queryKey: ["public-works-summary"] });
    },
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage, message }: { id: string; stage: string; message: string }) =>
      apiFetch<PublicWork>(`/public-works/${id}/stage`, {
        method: "POST",
        body: JSON.stringify({
          stage,
          message,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-works"] });
      queryClient.invalidateQueries({ queryKey: ["public-works-summary"] });
    },
  });

  const measurementMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<PublicWork>(`/public-works/${id}/measurements`, {
        method: "POST",
        body: JSON.stringify({
          label: measurementLabel,
          quantity: Number(measurementQuantity),
          unit: measurementUnit,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-works"] });
      queryClient.invalidateQueries({ queryKey: ["public-works-summary"] });
    },
  });

  const evidenceMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<PublicWork>(`/public-works/${id}/evidence`, {
        method: "POST",
        body: JSON.stringify({
          keys: ["photo:obras-publicas-demo", "report:medicao-demo"],
          message: "Evidencias anexadas pela fiscalizacao",
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-works"] });
      queryClient.invalidateQueries({ queryKey: ["public-works-summary"] });
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Obras Públicas</h1>
          <p className="text-sm text-on-surface-muted">Mapa de obras, medições, evidências e entrega.</p>
        </div>
        <Badge variant="info">P2</Badge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {[
          { label: "Total", value: summaryQuery.data?.total ?? 0 },
          { label: "Planejadas", value: summaryQuery.data?.planejadas ?? 0 },
          { label: "Execução", value: summaryQuery.data?.execucao ?? 0 },
          { label: "Contratadas", value: summaryQuery.data?.contratadas ?? 0 },
          { label: "Concluídas", value: summaryQuery.data?.concluidas ?? 0 },
          { label: "Progresso médio", value: `${Math.round(summaryQuery.data?.progressoMedio ?? 0)}%` },
          { label: "Medições", value: summaryQuery.data?.medicoes ?? 0 },
          { label: "Evidências", value: summaryQuery.data?.evidencias ?? 0 },
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
            <CardTitle>Nova obra</CardTitle>
            <CardDescription>Cadastro operacional para fiscalização e acompanhamento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Secretaria" />
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Local" />
            <Input value={contractor} onChange={(e) => setContractor(e.target.value)} placeholder="Contratada" />
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Cadastrando..." : "Cadastrar obra"}
            </Button>
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-surface-subtle/50 p-4">
              <div className="text-sm font-medium text-on-surface">Medição rápida</div>
              <Input value={measurementLabel} onChange={(e) => setMeasurementLabel(e.target.value)} placeholder="Descrição" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={measurementQuantity} onChange={(e) => setMeasurementQuantity(e.target.value)} placeholder="Quantidade" />
                <Input value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} placeholder="Unidade" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Obras cadastradas</CardTitle>
            <CardDescription>Status, etapa, progresso e rastreabilidade.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={worksQuery.data ?? []}
              loading={worksQuery.isLoading}
              columns={[
                { key: "protocolNumber", label: "Protocolo" },
                { key: "title", label: "Obra" },
                { key: "department", label: "Secretaria" },
                { key: "location", label: "Local" },
                { key: "status", label: "Status", render: (value) => <Badge variant="outline">{String(value)}</Badge> },
                { key: "stage", label: "Etapa", render: (value) => <Badge variant="info">{String(value ?? "-")}</Badge> },
                { key: "progress", label: "Progresso", render: (value) => `${Number(value ?? 0)}%` },
                { key: "measurements", label: "Medições", render: (value) => <Badge variant="outline">{Array.isArray(value) ? value.length : 0}</Badge> },
                { key: "evidenceKeys", label: "Evidências", render: (value) => <Badge variant="outline">{Array.isArray(value) ? value.length : 0}</Badge> },
                { key: "contractor", label: "Contratada" },
                {
                  key: "_id",
                  label: "Ações",
                  render: (value) => (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          stageMutation.mutate({
                            id: String(value),
                            stage: "EXECUCAO",
                            message: "Obra iniciada em campo",
                          })
                        }
                      >
                        Execução
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => measurementMutation.mutate(String(value))}>
                        Medir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          stageMutation.mutate({
                            id: String(value),
                            stage: "ENTREGA",
                            message: "Obra encaminhada para entrega",
                          })
                        }
                      >
                        Entrega
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => evidenceMutation.mutate(String(value))}>
                        Evidência
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
