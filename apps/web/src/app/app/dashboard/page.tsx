"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["kpis"],
    queryFn: () => apiFetch<{ processes: number; alerts: number; assets: number }>("/dashboard/kpis"),
  });

  const kpis = [
    {
      label: "Processos digitais",
      value: data?.processes ?? "--",
      note: "Fluxos com SLA ativo",
    },
    {
      label: "Alertas ambientais",
      value: data?.alerts ?? "--",
      note: "Risco monitorado",
    },
    {
      label: "Ativos territoriais",
      value: data?.assets ?? "--",
      note: "Cadastro atualizado",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Painel Executivo</h1>
      </div>

      <div className="mt-6 space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-2 h-8 w-16" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))
            : kpis.map((item) => (
                <Card key={item.label}>
                  <CardHeader>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">
                      {item.label}
                    </p>
                    <CardTitle className="font-display text-3xl">{item.value}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-on-surface-muted">{item.note}</CardContent>
                </Card>
              ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-map-grid opacity-60" />
            <CardHeader className="relative flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="font-display text-xl">Mapa situacional</CardTitle>
                <CardDescription>Camadas com dados de campo e drone.</CardDescription>
              </div>
              <Link
                href="/app/maps"
                className="inline-flex h-9 items-center justify-center rounded-full border border-outline bg-surface-elevated px-4 text-xs font-semibold text-on-surface transition hover:border-accent/30"
              >
                Abrir mapa
              </Link>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Area mapeada", value: "128 km2" },
                  { label: "Missoes em andamento", value: "3" },
                  { label: "Atualizacao cartografica", value: "2h" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-md border border-outline bg-surface-elevated p-4"
                  >
                    <p className="text-xs text-on-surface-muted">{item.label}</p>
                    <p className="text-xl font-semibold text-on-surface">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["Ortomosaico", "Modelo 3D", "Nuvem de pontos", "Risco hidrologico"].map(
                  (item) => (
                    <Badge key={item} variant="default">
                      {item}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Operacao do dia</CardTitle>
              <CardDescription>Equipe em campo e relatorios pendentes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-on-surface-muted">
              {[
                { label: "Drone 02 - Zona Norte", status: "Em voo" },
                { label: "Equipe Ambiental - Rio Azul", status: "Vistoria 14h" },
                { label: "Licenciamento - Bairro Central", status: "Pendencias" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3"
                >
                  <span>{item.label}</span>
                  <Badge variant={item.status === "Em voo" ? "info" : "default"}>{item.status}</Badge>
                </div>
              ))}
              <div className="rounded-md border border-outline bg-surface-elevated p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Integracoes</p>
                <p className="mt-1 text-sm text-on-surface">
                  Monitore conectores tributarios, execute sync manual e inspecione logs de erro.
                </p>
                <Link
                  href="/app/integracoes"
                  className="mt-3 inline-flex h-8 items-center justify-center rounded-full border border-outline px-3 text-xs font-semibold text-on-surface transition hover:border-accent/30"
                >
                  Abrir integracoes
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
