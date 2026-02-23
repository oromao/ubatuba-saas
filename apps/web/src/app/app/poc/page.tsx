"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL, apiFetch } from "@/lib/api";

type PocCheck = {
  id: string;
  title: string;
  passed: boolean;
  weight: number;
  evidence: string;
};

type PocScore = {
  score: number;
  status: "OK" | "ATENCAO";
  threshold: number;
  checks: PocCheck[];
  generatedAt: string;
};

export default function PocPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["poc-score"],
    queryFn: () => apiFetch<PocScore>("/poc/score"),
    refetchInterval: 30_000,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">PoC 95% - Aderencia</h1>
        <p className="text-sm text-on-surface-muted">
          Painel de checagem automatizada dos requisitos do edital e evidencias implementadas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score atual</CardTitle>
          <CardDescription>Resultado consolidado do endpoint `/poc/score`.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-on-surface-muted">Carregando score...</p>
          ) : data ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-4xl font-semibold text-on-surface">{data.score}%</p>
                <Badge variant={data.score >= data.threshold ? "success" : "warning"}>{data.status}</Badge>
              </div>
              <p className="text-sm text-on-surface-muted">
                Limiar esperado: {data.threshold}% | Atualizado em {new Date(data.generatedAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-on-surface-muted">Sem dados de score.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de checks</CardTitle>
          <CardDescription>Evidencias por requisito implementado no repositorio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data?.checks ?? []).map((check) => (
            <div key={check.id} className="flex items-center justify-between rounded-sm border border-outline bg-surface p-3 text-sm">
              <div>
                <p className="font-medium text-on-surface">{check.title}</p>
                <p className="text-xs text-on-surface-muted">{check.evidence}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={check.passed ? "success" : "destructive"}>{check.passed ? "OK" : "PENDENTE"}</Badge>
                <span className="text-xs text-on-surface-muted">peso {check.weight}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidencias rapidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <a href={`${API_URL}/docs`} target="_blank" className="rounded-sm border border-outline bg-surface px-3 py-2">
            Swagger API
          </a>
          <a href={`${API_URL}/poc/health`} target="_blank" className="rounded-sm border border-outline bg-surface px-3 py-2">
            GET /poc/health
          </a>
          <a href={`${API_URL}/poc/score`} target="_blank" className="rounded-sm border border-outline bg-surface px-3 py-2">
            GET /poc/score
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
