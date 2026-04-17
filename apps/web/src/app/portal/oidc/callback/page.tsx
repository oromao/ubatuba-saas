"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/lib/api";

function PortalOidcCallbackContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Concluindo login institucional...");

  useEffect(() => {
    if (!params) {
      setStatus("Parametros OIDC indisponiveis.");
      return;
    }
    const code = params.get("code");
    const state = params.get("state") ?? "";
    const next = params.get("next") ?? "/app/dashboard";
    if (!code) {
      setStatus("Codigo OIDC ausente.");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/oidc/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.message ?? "Falha no callback OIDC");
        const data = payload.data ?? payload;
        const targetUrl = new URL(next, window.location.origin).toString();
        window.sessionStorage.setItem("accessToken", data.accessToken);
        window.sessionStorage.setItem("refreshToken", data.refreshToken);
        window.sessionStorage.setItem("tenantId", data.tenantId);
        window.location.href = targetUrl;
      } catch {
        setStatus("Nao foi possivel concluir o login institucional.");
      }
    };

    void run();
  }, [params]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Callback institucional</CardTitle>
        <CardDescription>Troca de codigo para sessao FlyDea.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-on-surface-muted">{status}</p>
      </CardContent>
    </Card>
  );
}

export default function PortalOidcCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8 text-on-surface">
      <Suspense fallback={<Card className="w-full max-w-md"><CardHeader><CardTitle>Callback institucional</CardTitle></CardHeader></Card>}>
        <PortalOidcCallbackContent />
      </Suspense>
    </div>
  );
}
