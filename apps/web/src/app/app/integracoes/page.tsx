"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/app/data-table";
import { apiFetch } from "@/lib/api";

type Adapter = {
  id: string;
  label: string;
  mode: string;
  description: string;
  target: string;
};

type HubResponse = {
  strategy: string;
  adapters: Adapter[];
  exchangeTemplate?: string;
};

type InstitutionalReadiness = {
  handoffReady: boolean;
  portalCoexistence: boolean;
  oidcReady: boolean;
  samlReady: boolean;
  fallbackLocalLogin: boolean;
  logoutCoherent: boolean;
  claimMapping: string[];
  currentFlow: string[];
  remainingExternalDependency: string;
};

export default function IntegracoesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["integration-hub"],
    queryFn: () => apiFetch<HubResponse>("/integration-hub/adapters"),
  });

  const readiness = useQuery({
    queryKey: ["institutional-readiness"],
    queryFn: () => apiFetch<InstitutionalReadiness>("/auth/institutional-readiness"),
  });

  const portalLinks = useQuery({
    queryKey: ["integration-hub-links"],
    queryFn: () => apiFetch<{ links: Array<{ id: string; label: string; href: string; mode: string }> }>("/integration-hub/portal-links"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Hub de Integrações</h1>
          <p className="text-sm text-on-surface-muted">Coexistência com portal cidadão, deep links e adapters públicos.</p>
        </div>
        <Badge variant="info">P0</Badge>
      </div>

      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Estratégia de coexistência</CardTitle>
            <CardDescription>{data?.strategy ?? "Não duplicar portal. Integrar por deep link, API e futura camada SSO."}</CardDescription>
            <p className="mt-2 text-xs text-on-surface-muted">
              {data?.exchangeTemplate ?? "Portal troca via /portal/exchange?token={signedToken}&next={target}"}
            </p>
          </CardHeader>
        </Card>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Readiness institucional</CardTitle>
            <CardDescription>Resumo do que já está pronto e do que ainda depende de IdP externo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {readiness.data ? (
              <>
                {[
                  ["Handoff pronto", readiness.data.handoffReady],
                  ["Coexistência com portal", readiness.data.portalCoexistence],
                  ["OIDC pronto", readiness.data.oidcReady],
                  ["SAML pronto", readiness.data.samlReady],
                  ["Login local de fallback", readiness.data.fallbackLocalLogin],
                  ["Logout coerente", readiness.data.logoutCoherent],
                ].map(([label, ok]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                    <span className="text-sm text-on-surface">{label as string}</span>
                    <Badge variant={ok ? "info" : "outline"}>{ok ? "OK" : "Pendente"}</Badge>
                  </div>
                ))}
                <div className="rounded-md border border-outline bg-surface-elevated p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Claims mapeadas</p>
                  <p className="mt-1 text-sm text-on-surface">{readiness.data.claimMapping.join(", ")}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-on-surface-muted">Carregando readiness institucional...</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fluxo institucional atual</CardTitle>
            <CardDescription>Como a identidade atravessa o portal, callback, sessão e logout.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {readiness.data?.currentFlow.map((item) => (
              <div key={item} className="rounded-md border border-outline bg-surface-elevated p-3 text-sm text-on-surface">
                {item}
              </div>
            ))}
            <div className="rounded-md border border-outline bg-surface-elevated p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-on-surface-muted">Dependência externa restante</p>
              <p className="mt-1 text-sm text-on-surface">{readiness.data?.remainingExternalDependency ?? "Indisponivel"}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Adapters do portal</CardTitle>
            <CardDescription>Rotas prontas para integração sem duplicar serviço municipal.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data?.adapters ?? []}
              loading={isLoading}
              columns={[
                { key: "label", label: "Serviço" },
                { key: "mode", label: "Modo" },
                { key: "description", label: "Descrição" },
                { key: "target", label: "Destino" },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Links públicos / deep links</CardTitle>
            <CardDescription>Atalho para jornadas que o portal externo pode reutilizar.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {portalLinks.data?.links.map((link) => (
              <div key={link.id} className="flex items-center justify-between rounded-md border border-outline bg-surface-elevated p-3">
                <div>
                  <p className="font-medium text-on-surface">{link.label}</p>
                  <p className="text-xs text-on-surface-muted">{link.mode}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href={link.href}>Abrir</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
