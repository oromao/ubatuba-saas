"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Notificacoes</h1>
        <p className="text-sm text-on-surface-muted">Central de avisos da plataforma.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nao ha notificacoes pendentes</CardTitle>
          <CardDescription>Quando houver eventos relevantes, eles aparecerao aqui.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/app/alerts">Abrir alertas operacionais</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/reurb">Abrir REURB</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
