"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Upload, Link as LinkIcon, Database, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

type ImportResult = {
  batchId: string | null;
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  status?: string;
  errorDetails: Array<{ row: number; featureId?: string; message: string; field?: string }>;
};

type CatalogItem = {
  name: string;
  url: string;
  description?: string;
  type?: string;
};

const CATALOG_URL = "https://nucleo-digital.github.io/sp-mapas/index.json";

export default function ImportarParcelasPage() {
  const [importType, setImportType] = useState<"GEOJSON" | "CSV">("GEOJSON");
  const [geojsonSource, setGeojsonSource] = useState<"FILE" | "URL" | "CATALOG">("FILE");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState<any>(null);
  const [url, setUrl] = useState("");
  const [upsert, setUpsert] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [crsWarning, setCrsWarning] = useState<string | null>(null);

  // Catalog fetching
  const { data: catalog, isLoading: isLoadingCatalog } = useQuery({
    queryKey: ["geo-catalog"],
    queryFn: async () => {
      const resp = await fetch(CATALOG_URL);
      const data = await resp.json();
      // Handle array or object with layers
      return Array.isArray(data) ? data : data.layers || [];
    },
    enabled: geojsonSource === "CATALOG",
  });

  const importMutation = useMutation({
    mutationFn: (payload: any) => {
      const endpoint = importType === "GEOJSON" ? "/ctm/parcels/import" : "/ctm/parcels/import-csv";
      return apiFetch<ImportResult>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.imported > 0 || data.updated > 0) {
        toast.success(`${data.imported + data.updated} registro(s) processado(s) com sucesso`);
      }
      if (data.errors > 0) {
        toast.warning(`${data.errors} erro(s) encontrados`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Erro ao importar");
    },
  });

  function validateGeoJson(json: any) {
    if (!json || json.type !== "FeatureCollection" || !Array.isArray(json.features)) {
      toast.error("O arquivo não é uma FeatureCollection válida");
      return false;
    }
    
    // CRS Check (Simple)
    const firstFeature = json.features.find((f: any) => f.geometry);
    if (firstFeature) {
      const geom = firstFeature.geometry;
      let coord: number[] | null = null;
      if (geom.type === "Point") coord = geom.coordinates;
      else if (geom.type === "LineString") coord = geom.coordinates[0];
      else if (geom.type === "Polygon") coord = geom.coordinates[0][0];
      else if (geom.type === "MultiPolygon") coord = geom.coordinates[0][0][0];

      if (coord) {
        const [lng, lat] = coord;
        if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
          setCrsWarning(`Coordenadas detectadas (${lng.toFixed(2)}, ${lat.toFixed(2)}) parecem estar fora do padrão WGS84 (EPSG:4326). O sistema requer WGS84. Por favor, converta o arquivo antes de importar.`);
          return false;
        }
      }
    }
    
    setCrsWarning(null);
    return true;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importType === "CSV") {
        setFileContent(text);
      } else {
        try {
          const json = JSON.parse(text);
          if (validateGeoJson(json)) {
            setFileContent(json);
          } else {
            setFileContent(null);
          }
        } catch (e) {
          toast.error("Erro ao ler JSON: arquivo inválido");
          setFileContent(null);
        }
      }
    };
    reader.readAsText(file);
  }

  async function handleUrlImport(urlToFetch: string) {
    setUrl(urlToFetch);
    setResult(null);
    try {
      const resp = await fetch(urlToFetch);
      if (!resp.ok) throw new Error("Erro ao baixar arquivo da URL");
      const json = await resp.json();
      if (validateGeoJson(json)) {
        setFileContent(json);
        toast.success("GeoJSON carregado da URL com sucesso");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileContent) {
      toast.error("Nenhum dado válido carregado");
      return;
    }
    
    const payload = importType === "GEOJSON" 
      ? { data: fileContent, fileName, upsert, sourceType: "OFFICIAL_IMPORT" }
      : { csv: fileContent, fileName, sourceType: "CSV_ENRICHMENT" };
      
    importMutation.mutate(payload);
  }

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">
            Importação de Dados de Parcelas
          </h1>
          <p className="text-sm text-on-surface-muted">
            Importe bases GeoJSON oficiais ou enriqueça dados via CSV.
          </p>
        </div>
        <Link href="/app/ctm/parcelas">
          <Button variant="outline" size="sm">
            Voltar para Parcelas
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        <Button 
          variant={importType === "GEOJSON" ? "primary" : "outline"}
          onClick={() => { setImportType("GEOJSON"); setFileContent(null); setResult(null); }}
          className="flex-1"
        >
          GeoJSON (Base Geográfica)
        </Button>
        <Button 
          variant={importType === "CSV" ? "primary" : "outline"}
          onClick={() => { setImportType("CSV"); setFileContent(null); setResult(null); }}
          className="flex-1"
        >
          CSV (Enriquecimento de Atributos)
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importType === "GEOJSON" ? <Upload className="h-5 w-5" /> : <Database className="h-5 w-5" />}
                {importType === "GEOJSON" ? "Importar Base Oficial (GeoJSON)" : "Enriquecer Atributos (CSV)"}
              </CardTitle>
              <CardDescription>
                {importType === "GEOJSON" 
                  ? "Selecione um arquivo GeoJSON em WGS84 (EPSG:4326) para importar polígonos e atributos."
                  : "Use o CSV para atualizar dados de parcelas existentes vinculadas pelo SQLU ou Inscrição."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importType === "GEOJSON" && (
                <div className="mb-6 flex border-b border-outline">
                  <button 
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${geojsonSource === "FILE" ? "border-primary text-primary" : "border-transparent text-on-surface-muted"}`}
                    onClick={() => setGeojsonSource("FILE")}
                  >
                    Upload de Arquivo
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${geojsonSource === "URL" ? "border-primary text-primary" : "border-transparent text-on-surface-muted"}`}
                    onClick={() => setGeojsonSource("URL")}
                  >
                    Por URL Direta
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${geojsonSource === "CATALOG" ? "border-primary text-primary" : "border-transparent text-on-surface-muted"}`}
                    onClick={() => setGeojsonSource("CATALOG")}
                  >
                    Catálogo Externo
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {importType === "CSV" || geojsonSource === "FILE" ? (
                  <div className="space-y-4">
                    <Label htmlFor="file-upload" className="block p-8 border-2 border-dashed border-outline rounded-lg text-center cursor-pointer hover:bg-surface-subtle transition-colors">
                      <Upload className="mx-auto h-10 w-10 text-on-surface-muted mb-2" />
                      <span className="text-sm font-medium">Clique para selecionar ou arraste o arquivo</span>
                      <p className="text-xs text-on-surface-muted mt-1">
                        {importType === "CSV" ? ".csv até 50MB" : ".geojson ou .json até 100MB"}
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        accept={importType === "CSV" ? ".csv" : ".geojson,.json"}
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </Label>
                    {fileName && (
                      <div className="flex items-center gap-2 text-sm text-on-surface">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Arquivo: <strong>{fileName}</strong>
                      </div>
                    )}
                  </div>
                ) : geojsonSource === "URL" ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://exemplo.com/base.geojson" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <Button type="button" onClick={() => handleUrlImport(url)}>Carregar</Button>
                    </div>
                    <p className="text-xs text-on-surface-muted">O arquivo deve ser público e estar no formato GeoJSON FeatureCollection.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-on-surface-muted">Escolha uma camada do catálogo oficial do projeto:</p>
                    {isLoadingCatalog ? (
                      <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Carregando catálogo...</div>
                    ) : (
                      <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
                        {catalog?.map((item: CatalogItem, i: number) => (
                          <div 
                            key={i} 
                            className="p-3 border border-outline rounded-md hover:border-primary cursor-pointer transition-colors flex items-center justify-between"
                            onClick={() => handleUrlImport(item.url)}
                          >
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              {item.description && <p className="text-xs text-on-surface-muted">{item.description}</p>}
                            </div>
                            <Button size="xs" variant="ghost" type="button">Selecionar</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {crsWarning && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex gap-3 text-amber-900 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold">Possível erro de Projeção</p>
                      <p>{crsWarning}</p>
                    </div>
                  </div>
                )}

                {fileContent && !crsWarning && (
                  <div className="p-4 bg-surface-subtle border border-outline rounded-md">
                    <p className="text-sm font-medium mb-2">Resumo dos dados detectados:</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-on-surface-muted uppercase">Tipo</p>
                        <p className="font-semibold">{importType === "GEOJSON" ? "GeoJSON FeatureCollection" : "CSV Enrichment"}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-muted uppercase">Registros</p>
                        <p className="font-semibold">
                          {importType === "GEOJSON" ? fileContent.features.length : fileContent.split("\n").length - 1}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {importType === "GEOJSON" && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="upsert" 
                      checked={upsert} 
                      onChange={(e) => setUpsert(e.target.checked)}
                      className="h-4 w-4 rounded border-outline"
                    />
                    <Label htmlFor="upsert" className="text-sm">Atualizar registros existentes (Upsert por SQLU/Inscrição)</Label>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!fileContent || importMutation.isPending || !!crsWarning}
                >
                  {importMutation.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processando...</span>
                  ) : (
                    `Iniciar Importação de ${importType}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Resultado da Operação
                  <Badge variant={result.errors === 0 ? "success" : "warning"}>
                    {result.status || (result.errors === 0 ? "Concluído" : "Com Erros")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="rounded-md border border-outline p-3 bg-green-50/30">
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-muted">Inseridos</p>
                    <p className="text-xl font-bold text-green-600">{result.imported}</p>
                  </div>
                  <div className="rounded-md border border-outline p-3 bg-blue-50/30">
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-muted">Atualizados</p>
                    <p className="text-xl font-bold text-blue-600">{result.updated}</p>
                  </div>
                  <div className="rounded-md border border-outline p-3 bg-amber-50/30">
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-muted">Pulados</p>
                    <p className="text-xl font-bold text-amber-600">{result.skipped}</p>
                  </div>
                  <div className="rounded-md border border-outline p-3 bg-rose-50/30">
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-muted">Erros</p>
                    <p className="text-xl font-bold text-rose-600">{result.errors}</p>
                  </div>
                </div>

                {result.errorDetails.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-on-surface">Detalhamento de inconsistências:</p>
                    <div className="overflow-x-auto rounded-md border border-outline max-h-64">
                      <table className="w-full text-xs">
                        <thead className="bg-surface-subtle sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-on-surface-muted">Linha/Feature</th>
                            <th className="px-3 py-2 text-left font-medium text-on-surface-muted">ID/SQLU</th>
                            <th className="px-3 py-2 text-left font-medium text-on-surface-muted">Mensagem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.errorDetails.map((err, i) => (
                            <tr key={i} className="border-t border-outline">
                              <td className="px-3 py-2 font-mono">{err.row}</td>
                              <td className="px-3 py-2 font-mono text-on-surface-muted">{err.featureId || "—"}</td>
                              <td className="px-3 py-2 text-rose-600">{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href="/app/ctm/parcelas">
                    <Button variant="outline" size="sm">Ver no Cadastro</Button>
                  </Link>
                  <Link href="/app/maps">
                    <Button variant="outline" size="sm">Ver no Mapa</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4" /> Requisitos Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3 text-on-surface-muted">
              <div>
                <p className="font-semibold text-on-surface">Projeção e CRS</p>
                <p>O sistema opera exclusivamente em <strong>WGS84 / EPSG:4326</strong>. Arquivos em SIRGAS 2000 UTM ou SAD69 devem ser reprojetados antes do envio.</p>
              </div>
              <div>
                <p className="font-semibold text-on-surface">Geometrias Suportadas</p>
                <p>Apenas <code className="bg-surface-subtle px-1 rounded">Polygon</code> e <code className="bg-surface-subtle px-1 rounded">MultiPolygon</code>. Linhas e pontos serão descartados.</p>
              </div>
              <div>
                <p className="font-semibold text-on-surface">Mapeamento de Campos</p>
                <p>O importador detecta automaticamente SQLU, Inscrição, Endereço e Área baseando-se em aliases comuns. Exemplo: <code className="bg-surface-subtle px-1 rounded">codigo_sql</code> mapeia para <code className="bg-surface-subtle px-1 rounded">sqlu</code>.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Modelos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/templates/parcelas-modelo.csv" download className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 p-2 rounded hover:bg-slate-100">
                Baixar Modelo CSV
              </a>
              <a href="/templates/parcelas-modelo.geojson" download className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 p-2 rounded hover:bg-slate-100">
                Baixar Modelo GeoJSON
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
