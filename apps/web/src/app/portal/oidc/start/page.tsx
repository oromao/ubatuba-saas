"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/lib/api";

function PortalOidcStartContent() {
  const params = useSearchParams();
  const [href, setHref] = useState<string | null>(null);
  const [status, setStatus] = useState("Preparando login institucional...");

  useEffect(() => {
    if (!params) return;
    const tenantSlug = params.get("tenantSlug") ?? "demo";
    const email = params.get("email") ?? "admin@demo.local";
    const roleHint = params.get("roleHint") ?? "CIDADAO";
    const department = params.get("department") ?? "Portal Cidadão";
    const next = params.get("next") ?? "/app/dashboard";
    const state = params.get("state") ?? "portal";
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/oidc/authorize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantSlug, email, roleHint, department, next, state }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.message ?? "Falha ao preparar login");
        setHref(payload.data.href);
        setStatus("Login institucional pronto.");
      } catch {
        setStatus("Nao foi possivel preparar o login institucional.");
      }
    };
    void run();
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8 text-on-surface">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Portal institucional</CardTitle>
          <CardDescription>Homologacao OIDC para demonstrar coexistencia com portal municipal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-on-surface-muted">{status}</p>
          {href ? (
            <a
              href={href}
              className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-all duration-fast ease-standard hover:bg-primary/90 active:scale-[0.97]"
            >
              Entrar no FlyDea
            </a>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PortalOidcStartPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8 text-on-surface">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Portal institucional</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <PortalOidcStartContent />
    </Suspense>
  );
}
