"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { userName, userEmail, userRole, tenantId } = useAuth();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Perfil</h1>
        <p className="text-sm text-on-surface-muted">Dados basicos da sessao atual.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacoes do usuario</CardTitle>
          <CardDescription>Use estes dados para auditoria e suporte interno.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-on-surface-muted">Nome</div>
            <div className="text-sm font-medium text-on-surface">{userName || "Usuario"}</div>
          </div>
          <div>
            <div className="text-xs text-on-surface-muted">Email</div>
            <div className="text-sm font-medium text-on-surface">{userEmail || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-on-surface-muted">Perfil</div>
            <div className="text-sm font-medium text-on-surface">{userRole || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-on-surface-muted">Tenant</div>
            <div className="text-sm font-medium text-on-surface">{tenantId || "-"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
