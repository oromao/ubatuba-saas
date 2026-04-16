"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/lib/api";

function PortalExchangeContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Validando acesso do portal...");

  useEffect(() => {
    if (!params) {
      setStatus("Parametro de portal indisponivel.");
      return;
    }
    const token = params.get("token");
    const nextPath = params.get("next") ?? "/app/dashboard";
    if (!token) {
      setStatus("Token ausente. Retorne ao portal de origem.");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/portal/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedToken: token }),
        });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.message ?? "Falha na troca de sessao");
        }
        const data = payload.data ?? payload;
        window.localStorage.setItem("accessToken", data.accessToken);
        window.localStorage.setItem("refreshToken", data.refreshToken);
        window.localStorage.setItem("tenantId", data.tenantId);
        window.location.replace(nextPath);
        setTimeout(() => {
          window.location.href = nextPath;
        }, 50);
      } catch {
        setStatus("Nao foi possivel concluir a troca de sessao.");
      }
    };

    void run();
  }, [params]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Acesso por portal</CardTitle>
        <CardDescription>Conectando a sessao institucional ao painel FlyDea.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-on-surface-muted">{status}</p>
      </CardContent>
    </Card>
  );
}

export default function PortalExchangePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8 text-on-surface">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Acesso por portal</CardTitle>
              <CardDescription>Carregando acesso institucional...</CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <PortalExchangeContent />
      </Suspense>
    </div>
  );
}
