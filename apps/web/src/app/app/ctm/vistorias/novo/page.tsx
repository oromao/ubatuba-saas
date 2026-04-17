"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, API_URL } from "@/lib/api";

type CreateVistoriaPayload = {
  parcelId: string;
  tipo: string;
  data: string;
  observacoes?: string;
  fotos?: string[];
};

type VistoriaResponse = {
  _id: string;
  parcelId: string;
  tipo: string;
  status: string;
};

const TIPOS = ["INICIAL", "REINSPECAO", "VISTORIA_ESPECIAL", "CONFERENCIA"];

async function uploadFiles(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("accessToken")
      : null;

  const res = await fetch(`${API_URL}/upload/files`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload falhou: ${res.status}`);
  }

  const data = (await res.json()) as { urls?: string[] };
  return data.urls ?? [];
}

export default function NovaVistoriaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledParcelId = searchParams?.get("parcelId") ?? "";

  const [parcelId, setParcelId] = useState(prefilledParcelId);
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: CreateVistoriaPayload) => {
      return apiFetch<VistoriaResponse>("/ctm/vistorias", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (result) => {
      router.push(`/app/ctm/vistorias/${result._id}`);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parcelId.trim()) {
      setError("ID da parcela é obrigatório");
      return;
    }
    if (!tipo) {
      setError("Tipo é obrigatório");
      return;
    }
    if (!data) {
      setError("Data é obrigatória");
      return;
    }

    let fotosUrls: string[] = [];
    if (files.length > 0) {
      setUploadProgress(true);
      try {
        fotosUrls = await uploadFiles(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao fazer upload das fotos");
        setUploadProgress(false);
        return;
      }
      setUploadProgress(false);
    }

    mutation.mutate({ parcelId: parcelId.trim(), tipo, data, observacoes, fotos: fotosUrls });
  };

  const isLoading = uploadProgress || mutation.isPending;

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-on-surface">Nova Vistoria</h1>
        <p className="text-sm text-on-surface-muted">Registre uma nova vistoria de campo.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {!parcelId && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            ⚠️ Esta vistoria precisa ser criada a partir de um lote. Volte à listagem de parcelas e clique em &quot;Nova Vistoria&quot;.
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="parcelId">ID da Parcela (SQLU)</Label>
          {prefilledParcelId ? (
            <div className="flex items-center gap-2 rounded-md border border-input bg-muted px-3 py-2 text-sm text-on-surface-muted">
              {parcelId}
            </div>
          ) : (
            <Input
              id="parcelId"
              value={parcelId}
              onChange={(e) => setParcelId(e.target.value)}
              placeholder="Ex: SQLU-00001"
              required
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipo">Tipo de Vistoria</Label>
          <Select value={tipo} onValueChange={setTipo} required>
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="data">Data da Vistoria</Label>
          <Input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações da vistoria..."
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fotos">Fotos (opcional)</Label>
          <Input
            id="fotos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          {files.length > 0 && (
            <p className="text-xs text-on-surface-muted">{files.length} arquivo(s) selecionado(s)</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading || !parcelId}>
            {uploadProgress ? "Fazendo upload..." : isLoading ? "Salvando..." : "Criar Vistoria"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
