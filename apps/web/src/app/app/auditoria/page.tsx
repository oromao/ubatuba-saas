"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type AuditEntry = {
  _id: string;
  parcelId: string;
  action: string;
  diff?: Record<string, { before: unknown; after: unknown }>;
  actorId?: string;
  createdAt: string;
};

type AuditResponse = {
  entries: AuditEntry[];
  total: number;
  limit: number;
  offset: number;
};

const ACTION_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  TRANSICAO: "outline",
};

const ACTION_OPTIONS = ["", "UPDATE", "TRANSICAO", "CREATE", "DELETE"] as const;

export default function AuditoriaPage() {
  const [parcelIdFilter, setParcelIdFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const [activeFilters, setActiveFilters] = useState<{
    parcelId: string;
    action: string;
    offset: number;
  }>({ parcelId: "", action: "", offset: 0 });

  const { data, isLoading, isError } = useQuery<AuditResponse>({
    queryKey: ["audit-log", activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilters.parcelId) params.set("parcelId", activeFilters.parcelId);
      if (activeFilters.action) params.set("action", activeFilters.action);
      params.set("limit", String(limit));
      params.set("offset", String(activeFilters.offset));
      const res = await apiFetch<AuditResponse>(`/ctm/parcels/audit?${params.toString()}`);
      return res;
    },
  });

  function handleSearch() {
    setOffset(0);
    setActiveFilters({ parcelId: parcelIdFilter, action: actionFilter, offset: 0 });
  }

  function handlePrev() {
    const newOffset = Math.max(0, activeFilters.offset - limit);
    setOffset(newOffset);
    setActiveFilters((prev) => ({ ...prev, offset: newOffset }));
  }

  function handleNext() {
    const newOffset = activeFilters.offset + limit;
    setOffset(newOffset);
    setActiveFilters((prev) => ({ ...prev, offset: newOffset }));
  }

  const total = data?.total ?? 0;
  const currentOffset = activeFilters.offset;
  const hasPrev = currentOffset > 0;
  const hasNext = currentOffset + limit < total;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Auditoria de Dados</h1>
        <p className="text-muted-foreground mt-1">
          Histórico de alterações em parcelas cadastrais — ações de criação, edição, transição e exclusão.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">ID da Parcela</label>
              <Input
                placeholder="Ex: 6645a1f..."
                value={parcelIdFilter}
                onChange={(e) => setParcelIdFilter(e.target.value)}
                className="w-56"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Ação</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || "Todas"}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoria</CardTitle>
          {data && (
            <CardDescription>
              {total} registro{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">Erro ao carregar registros de auditoria.</p>
          ) : !data?.entries.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="text-base font-medium">Nenhum registro encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Data/Hora</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Ação</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Parcela</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Campos Alterados</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Operador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.entries.map((entry) => (
                      <tr key={entry._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-2 pr-4 whitespace-nowrap tabular-nums text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={ACTION_BADGE_VARIANT[entry.action] ?? "outline"}>
                            {entry.action}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          {entry.parcelId ? (
                            <Link
                              href={`/app/ctm/parcelas/${entry.parcelId}`}
                              className="font-mono text-xs text-primary underline-offset-2 hover:underline"
                            >
                              {String(entry.parcelId).slice(0, 8)}…
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          {entry.diff && Object.keys(entry.diff).length > 0 ? (
                            <span className="text-xs text-muted-foreground">
                              {Object.keys(entry.diff).join(", ")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2">
                          {entry.actorId ? (
                            <span className="font-mono text-xs">{String(entry.actorId).slice(0, 8)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                  Mostrando {currentOffset + 1}–{Math.min(currentOffset + limit, total)} de {total}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrev} disabled={!hasPrev}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNext} disabled={!hasNext}>
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
