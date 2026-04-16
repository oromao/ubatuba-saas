"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type Vistoria = {
  _id: string;
  parcelId: string;
  tipo: string;
  data: string;
  status: string;
  observacoes?: string;
};

const STATUS_COLOR: Record<string, "default" | "destructive" | "outline" | "info" | "success" | "warning"> = {
  RASCUNHO: "outline",
  ENVIADA: "info",
  EM_ANALISE: "warning",
  APROVADA: "success",
  REJEITADA: "destructive",
  CANCELADA: "default",
};

export default function VistoriasPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["ctm-vistorias"],
    queryFn: () => apiFetch<Vistoria[]>("/ctm/vistorias"),
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Vistorias</h1>
          <p className="text-sm text-on-surface-muted">Gestão de vistorias de campo.</p>
        </div>
        <Link href="/app/ctm/vistorias/novo">
          <Button size="sm">Nova Vistoria</Button>
        </Link>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-on-surface-muted">Carregando...</p>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-on-surface-muted">Nenhuma vistoria encontrada.</p>
            <Link href="/app/ctm/vistorias/novo" className="mt-4">
              <Button size="sm" variant="outline">Criar primeira vistoria</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-surface-variant/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-on-surface-muted">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium text-on-surface-muted">Parcela</th>
                  <th className="px-4 py-3 text-left font-medium text-on-surface-muted">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-on-surface-muted">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-on-surface-muted">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((v) => (
                  <tr
                    key={v._id}
                    className="cursor-pointer hover:bg-surface-variant/20"
                    onClick={() => router.push(`/app/ctm/vistorias/${v._id}`)}
                  >
                    <td className="px-4 py-3">{v.tipo}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.parcelId}</td>
                    <td className="px-4 py-3">{new Date(v.data).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_COLOR[v.status] ?? "outline"}>{v.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/ctm/vistorias/${v._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
