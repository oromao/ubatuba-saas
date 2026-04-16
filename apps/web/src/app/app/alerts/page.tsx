"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

type Alert = {
  _id: string;
  title: string;
  level: string;
  status: string;
  stage?: string;
  assignedTo?: string;
};

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Nova ocupacao irregular");
  const [level, setLevel] = useState("ALTO");
  const [lat, setLat] = useState("-23.433");
  const [lng, setLng] = useState("-45.083");
  const [stageMessage, setStageMessage] = useState("Triagem concluida, encaminhar fiscalizacao.");
  const { data, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiFetch<Alert[]>("/alerts"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<Alert>("/alerts", {
        method: "POST",
        body: JSON.stringify({
          title,
          level,
          lat: Number(lat),
          lng: Number(lng),
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const stageMutation = useMutation({
    mutationFn: (alertId: string) =>
      apiFetch<Alert>(`/alerts/${alertId}/stage`, {
        method: "POST",
        body: JSON.stringify({
          stage: "FISCALIZACAO",
          message: stageMessage,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Monitoramento de alterações</h1>
          <p className="text-sm text-on-surface-muted">Fluxo de triagem, fiscalização, evidência e desfecho.</p>
        </div>
        <Badge variant="info">P1</Badge>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Abrir alerta</CardTitle>
            <CardDescription>Geração manual para simulação e operação de campo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do alerta" />
            <Input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Nível" />
            <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
            <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" />
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Abrindo..." : "Abrir alerta"}
            </Button>
            <Input value={stageMessage} onChange={(e) => setStageMessage(e.target.value)} placeholder="Mensagem da transição" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas ativos</CardTitle>
            <CardDescription>Lista operacional com estágio do tratamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data ?? []}
              loading={isLoading}
              columns={[
                { key: "title", label: "Alerta" },
                { key: "level", label: "Nivel" },
                { key: "stage", label: "Etapa", render: (value) => <Badge variant="outline">{String(value ?? "-")}</Badge> },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => (
                    <Badge variant={String(value) === "ABERTO" ? "warning" : "default"}>
                      {String(value)}
                    </Badge>
                  ),
                },
                {
                  key: "_id",
                  label: "Acoes",
                  render: (value) => (
                    <Button variant="outline" size="sm" onClick={() => stageMutation.mutate(String(value))}>
                      Triar
                    </Button>
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
