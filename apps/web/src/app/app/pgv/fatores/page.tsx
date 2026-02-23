"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type FactorItem = {
  tipo: string;
  chave: string;
  valorMultiplicador: number;
};

type ConstructionValueItem = {
  uso: string;
  padraoConstrutivo: string;
  valorM2: number;
};

type FactorSet = {
  _id: string;
  fatoresTerreno: FactorItem[];
  fatoresConstrucao: FactorItem[];
  valoresConstrucaoM2: ConstructionValueItem[];
};

export default function PgvFactorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["pgv-factor-set"],
    queryFn: () => apiFetch<FactorSet>("/pgv/factor-sets"),
  });

  const [fatoresTerreno, setFatoresTerreno] = useState("[]");
  const [fatoresConstrucao, setFatoresConstrucao] = useState("[]");
  const [valoresConstrucaoM2, setValoresConstrucaoM2] = useState("[]");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setFatoresTerreno(JSON.stringify(data.fatoresTerreno ?? [], null, 2));
    setFatoresConstrucao(JSON.stringify(data.fatoresConstrucao ?? [], null, 2));
    setValoresConstrucaoM2(JSON.stringify(data.valoresConstrucaoM2 ?? [], null, 2));
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/pgv/factor-sets", {
        method: "PUT",
        body: JSON.stringify({
          fatoresTerreno: JSON.parse(fatoresTerreno || "[]"),
          fatoresConstrucao: JSON.parse(fatoresConstrucao || "[]"),
          valoresConstrucaoM2: JSON.parse(valoresConstrucaoM2 || "[]"),
        }),
      });
      toast.success("Fatores atualizados com sucesso.");
    } catch {
      toast.error("Nao foi possivel salvar os fatores.");
      return;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-8 py-6 motion-reduce:animate-none">
      <h1 className="font-display text-2xl font-semibold text-on-surface">PGV - Fatores</h1>
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-1 h-3 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[280px] w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Fatores de terreno</CardTitle>
              <CardDescription>Localizacao, esquina, testada.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-[280px] w-full rounded-2xl border border-outline bg-surface-elevated px-4 py-3 text-xs text-on-surface shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={fatoresTerreno}
                onChange={(event) => setFatoresTerreno(event.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Fatores de construcao</CardTitle>
              <CardDescription>Uso e padrao construtivo.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-[280px] w-full rounded-2xl border border-outline bg-surface-elevated px-4 py-3 text-xs text-on-surface shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={fatoresConstrucao}
                onChange={(event) => setFatoresConstrucao(event.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Valores construcao (m2)</CardTitle>
              <CardDescription>Tabela base por uso e padrao.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-[280px] w-full rounded-2xl border border-outline bg-surface-elevated px-4 py-3 text-xs text-on-surface shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={valoresConstrucaoM2}
                onChange={(event) => setValoresConstrucaoM2(event.target.value)}
              />
            </CardContent>
          </Card>
        </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            {saving ? "Salvando..." : "Salvar fatores"}
          </Button>
        </div>
      </div>
    </div>
  );
}
