"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type Survey = {
  _id: string;
  id?: string;
  createdAt?: string;
  name: string;
  type: "AEROFOTO_RGB_5CM" | "MOBILE_LIDAR_360";
  pipelineStatus: "RECEBIDO" | "VALIDANDO" | "PUBLICADO" | "REPROVADO";
  metadata: {
    municipality: string;
    surveyDate: string;
    gsdCm?: number;
    srcDatum: string;
    supplier: string;
    precision?: string;
  };
  files: Array<{
    id: string;
    name: string;
    category: string;
    key: string;
  }>;
  qa?: {
    coverageOk?: boolean;
    georeferencingOk?: boolean;
    qualityOk?: boolean;
    comments?: string;
  };
  publication?: {
    layerName: string;
    publishedAt: string;
  };
};

export default function LevantamentosPage() {
  const queryClient = useQueryClient();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    type: "AEROFOTO_RGB_5CM",
    municipality: "Jales",
    surveyDate: new Date().toISOString().slice(0, 10),
    gsdCm: "5",
    srcDatum: "SIRGAS2000 / EPSG:4326",
    precision: "",
    supplier: "",
  });
  const [qaForm, setQaForm] = useState({
    coverageOk: true,
    georeferencingOk: true,
    qualityOk: true,
    comments: "",
  });
  const [uploadCategory, setUploadCategory] = useState("GEOTIFF");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: surveys, isLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => apiFetch<Survey[]>("/surveys"),
  });

  const selectedSurvey = useMemo(() => {
    if (!selectedSurveyId) return null;
    return (surveys ?? []).find((item) => (item.id ?? item._id) === selectedSurveyId) ?? null;
  }, [selectedSurveyId, surveys]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["surveys"] });
  };

  const createSurvey = useMutation({
    mutationFn: () =>
      apiFetch("/surveys", {
        method: "POST",
        body: JSON.stringify({
          name: createForm.name,
          type: createForm.type,
          municipality: createForm.municipality,
          surveyDate: createForm.surveyDate,
          gsdCm: Number(createForm.gsdCm),
          srcDatum: createForm.srcDatum,
          precision: createForm.precision,
          supplier: createForm.supplier,
        }),
      }),
    onSuccess: async () => {
      toast.success("Levantamento criado.");
      setCreateForm((prev) => ({ ...prev, name: "", supplier: "", precision: "" }));
      await refresh();
    },
    onError: () => toast.error("Falha ao criar levantamento."),
  });

  const updateQa = useMutation({
    mutationFn: (surveyId: string) =>
      apiFetch(`/surveys/${surveyId}/qa`, {
        method: "PATCH",
        body: JSON.stringify(qaForm),
      }),
    onSuccess: async () => {
      toast.success("Checklist QA atualizado.");
      await refresh();
    },
    onError: () => toast.error("Falha ao atualizar QA."),
  });

  const publishSurvey = useMutation({
    mutationFn: (surveyId: string) =>
      apiFetch(`/surveys/${surveyId}/publish`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      toast.success("Levantamento publicado no GeoServer e camada registrada.");
      await refresh();
    },
    onError: () => toast.error("Falha na publicacao."),
  });

  const uploadFile = async () => {
    if (!selectedSurveyId || !selectedFile) return;
    try {
      const presign = await apiFetch<{
        url: string;
        method: "PUT";
        headers: Record<string, string>;
        key: string;
      }>(`/surveys/${selectedSurveyId}/files/presign-upload`, {
        method: "POST",
        body: JSON.stringify({
          fileName: selectedFile.name,
          mimeType: selectedFile.type || "application/octet-stream",
          size: selectedFile.size,
          category: uploadCategory,
        }),
      });

      const uploadRes = await fetch(presign.url, {
        method: presign.method,
        headers: presign.headers,
        body: selectedFile,
      });
      if (!uploadRes.ok) {
        throw new Error("upload-failed");
      }

      await apiFetch(`/surveys/${selectedSurveyId}/files/complete`, {
        method: "POST",
        body: JSON.stringify({
          key: presign.key,
          name: selectedFile.name,
          mimeType: selectedFile.type || "application/octet-stream",
          size: selectedFile.size,
          category: uploadCategory,
        }),
      });
      toast.success("Arquivo enviado e registrado.");
      setSelectedFile(null);
      await refresh();
    } catch {
      toast.error("Falha no upload.");
    }
  };

  const downloadFile = async (surveyId: string, fileId: string) => {
    try {
      const res = await apiFetch<{ url: string }>(`/surveys/${surveyId}/files/${fileId}/download`);
      window.open(res.url, "_blank");
    } catch {
      toast.error("Falha ao obter download.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Levantamentos & Entregaveis</h1>
        <p className="text-sm text-on-surface-muted">
          Registro de aerofoto RGB 5cm e mobile LiDAR/360, arquivos no MinIO, QA e publicacao.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo levantamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Nome"
            value={createForm.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select
            className="h-11 rounded-xl border border-outline bg-surface-elevated px-4 text-sm text-on-surface"
            value={createForm.type}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                type: e.target.value as "AEROFOTO_RGB_5CM" | "MOBILE_LIDAR_360",
              }))
            }
          >
            <option value="AEROFOTO_RGB_5CM">AEROFOTO_RGB_5CM</option>
            <option value="MOBILE_LIDAR_360">MOBILE_LIDAR_360</option>
          </select>
          <Input
            placeholder="Municipio"
            value={createForm.municipality}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, municipality: e.target.value }))}
          />
          <Input
            placeholder="Data"
            value={createForm.surveyDate}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, surveyDate: e.target.value }))}
          />
          <Input
            placeholder="GSD cm"
            value={createForm.gsdCm}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, gsdCm: e.target.value }))}
          />
          <Input
            placeholder="SRC/Datum"
            value={createForm.srcDatum}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, srcDatum: e.target.value }))}
          />
          <Input
            placeholder="Precisao"
            value={createForm.precision}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, precision: e.target.value }))}
          />
          <Input
            placeholder="Fornecedor"
            value={createForm.supplier}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, supplier: e.target.value }))}
          />
          <Button className="md:col-span-4" loading={createSurvey.isPending} onClick={() => createSurvey.mutate()}>
            Criar levantamento
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de levantamentos</CardTitle>
          <CardDescription>Selecione um item para gerenciar arquivos, QA e publicacao.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={surveys ?? []}
            loading={isLoading}
            columns={[
              { key: "name", label: "Levantamento" },
              { key: "type", label: "Tipo" },
              {
                key: "pipelineStatus",
                label: "Status",
                render: (value) => (
                  <Badge
                    variant={
                      value === "PUBLICADO"
                        ? "success"
                        : value === "REPROVADO"
                          ? "destructive"
                          : value === "VALIDANDO"
                            ? "warning"
                            : "info"
                    }
                  >
                    {String(value)}
                  </Badge>
                ),
              },
              { key: "createdAt", label: "Criado em" },
            ]}
            emptyMessage="Nenhum levantamento cadastrado."
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {(surveys ?? []).map((survey) => {
              const surveyId = survey.id ?? survey._id;
              return (
                <button
                  key={surveyId}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedSurveyId === surveyId ? "bg-primary text-white" : "bg-cloud text-on-surface"
                  }`}
                  onClick={() => setSelectedSurveyId(surveyId)}
                >
                  {survey.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedSurvey && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhe: {selectedSurvey.name}</CardTitle>
            <CardDescription>
              {selectedSurvey.type} | {selectedSurvey.metadata.municipality}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <select
                className="h-11 rounded-xl border border-outline bg-surface-elevated px-4 text-sm text-on-surface"
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
              >
                <option value="GEOTIFF">GEOTIFF/COG</option>
                <option value="MOSAICO">MOSAICO</option>
                <option value="RELATORIO_QA">RELATORIO_QA</option>
                <option value="EQUIRETANGULAR_360">EQUIRETANGULAR_360</option>
                <option value="LAS_LAZ">LAS_LAZ</option>
              </select>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="h-11 rounded-xl border border-outline bg-surface-elevated px-3 py-2 text-sm text-on-surface md:col-span-2"
              />
              <Button onClick={uploadFile} disabled={!selectedFile}>
                Upload
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={qaForm.coverageOk}
                  onChange={(e) => setQaForm((prev) => ({ ...prev, coverageOk: e.target.checked }))}
                />
                Cobertura OK
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={qaForm.georeferencingOk}
                  onChange={(e) => setQaForm((prev) => ({ ...prev, georeferencingOk: e.target.checked }))}
                />
                Georreferenciamento OK
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={qaForm.qualityOk}
                  onChange={(e) => setQaForm((prev) => ({ ...prev, qualityOk: e.target.checked }))}
                />
                Qualidade OK
              </label>
              <Button
                variant="outline"
                loading={updateQa.isPending}
                onClick={() => updateQa.mutate(selectedSurvey.id ?? selectedSurvey._id)}
              >
                Salvar QA
              </Button>
              <Input
                placeholder="Comentarios QA"
                value={qaForm.comments}
                onChange={(e) => setQaForm((prev) => ({ ...prev, comments: e.target.value }))}
                className="md:col-span-3"
              />
              <Button
                loading={publishSurvey.isPending}
                onClick={() => publishSurvey.mutate(selectedSurvey.id ?? selectedSurvey._id)}
              >
                Publicar no GeoServer
              </Button>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-on-surface">Arquivos</h3>
              <div className="space-y-2">
                {selectedSurvey.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-md border border-outline p-2">
                    <div>
                      <p className="text-sm text-on-surface">{file.name}</p>
                      <p className="text-xs text-on-surface-muted">{file.category}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        downloadFile(selectedSurvey.id ?? selectedSurvey._id, file.id)
                      }
                    >
                      Download
                    </Button>
                  </div>
                ))}
                {selectedSurvey.files.length === 0 && (
                  <p className="text-sm text-on-surface-muted">Nenhum arquivo registrado.</p>
                )}
              </div>
            </div>

            {selectedSurvey.publication && (
              <div className="rounded-md border border-outline bg-cloud p-3 text-sm text-on-surface-muted">
                Publicado: {selectedSurvey.publication.layerName} em {selectedSurvey.publication.publishedAt}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
