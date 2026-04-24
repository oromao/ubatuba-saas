"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type ImportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  supportedFormats?: ("csv" | "geojson" | "json")[];
  maxFiles?: number;
  maxAttempts?: number;
  onImport: (file: File, content: string | Record<string, any>) => Promise<void>;
  isLoading?: boolean;
};

export function ImportModal({
  open,
  onOpenChange,
  title,
  description = "Selecione um arquivo para importar dados.",
  supportedFormats = ["csv", "geojson"],
  maxFiles = 6,
  maxAttempts = 2,
  onImport,
  isLoading = false,
}: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | Record<string, any> | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [filesProcessed, setFilesProcessed] = useState(0);

  const acceptedFileTypes = supportedFormats
    .map((format) => (format === "geojson" ? ".geojson,.json" : `.${format}`))
    .join(",");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file count constraint
    if (filesProcessed >= maxFiles) {
      toast.error(`Limite de ${maxFiles} arquivos atingido. Feche e reabra o modal para reiniciar.`);
      return;
    }

    // Validate file extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    const isValidFormat = supportedFormats.some(
      (format) => format === extension || (format === "geojson" && (extension === "geojson" || extension === "json")),
    );

    if (!isValidFormat) {
      toast.error(`Formato inválido. Formatos aceitos: ${supportedFormats.join(", ")}`);
      return;
    }

    setSelectedFile(file);

    // Parse file content
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;

      if (extension === "csv") {
        setFileContent(text);
      } else if (extension === "geojson" || extension === "json") {
        try {
          const json = JSON.parse(text);

          // Basic validation for GeoJSON
          if (extension === "geojson" || (json.type === "FeatureCollection" && Array.isArray(json.features))) {
            setFileContent(json);
            toast.success("Arquivo GeoJSON carregado com sucesso");
          } else {
            toast.error("Arquivo JSON válido, mas não é uma FeatureCollection");
            setFileContent(null);
            setSelectedFile(null);
          }
        } catch (parseError) {
          toast.error("Erro ao fazer parsing do JSON. Verifique o formato.");
          setFileContent(null);
          setSelectedFile(null);
        }
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!selectedFile || !fileContent) {
      toast.error("Nenhum arquivo selecionado ou válido");
      return;
    }

    if (attempts >= maxAttempts) {
      toast.error(`Limite de ${maxAttempts} tentativas atingido para este modal`);
      return;
    }

    try {
      await onImport(selectedFile, fileContent);
      setFilesProcessed((prev) => prev + 1);
      setAttempts((prev) => prev + 1);

      // Reset form but keep modal open for more imports
      setSelectedFile(null);
      setFileContent(null);

      if (filesProcessed + 1 >= maxFiles) {
        toast.info(`${filesProcessed + 1}/${maxFiles} arquivos processados. Limite atingido.`);
      }
    } catch (error) {
      setAttempts((prev) => prev + 1);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao importar";
      toast.error(errorMessage);
    }
  }

  function handleClose() {
    // Reset all state when closing
    setSelectedFile(null);
    setFileContent(null);
    setAttempts(0);
    setFilesProcessed(0);
    onOpenChange(false);
  }

  const canImport = selectedFile && fileContent && attempts < maxAttempts && filesProcessed < maxFiles;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex gap-2">
            <div className="text-xs text-on-surface-muted">
              {filesProcessed}/{maxFiles} arquivos processados
            </div>
            <div className="text-xs text-on-surface-muted">
              {attempts}/{maxAttempts} tentativas usadas
            </div>
          </div>

          {/* File input */}
          <div className="space-y-2">
            <label htmlFor="import-file" className="block">
              <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-outline rounded-lg cursor-pointer hover:bg-surface-subtle transition-colors">
                <Upload className="h-6 w-6 text-on-surface-muted" />
                <div className="text-center">
                  <p className="text-sm font-medium text-on-surface">Clique para selecionar arquivo</p>
                  <p className="text-xs text-on-surface-muted mt-1">{supportedFormats.join(", ").toUpperCase()}</p>
                </div>
              </div>
              <input
                id="import-file"
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileSelect}
                disabled={filesProcessed >= maxFiles || attempts >= maxAttempts}
                className="sr-only"
              />
            </label>
          </div>

          {/* Selected file indicator */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-900">{selectedFile.name}</p>
                <p className="text-xs text-green-700">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}

          {/* Constraints warning */}
          {(filesProcessed >= maxFiles || attempts >= maxAttempts) && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                {filesProcessed >= maxFiles ? `Limite de ${maxFiles} arquivos atingido.` : ""}
                {attempts >= maxAttempts ? ` Limite de ${maxAttempts} tentativas atingido.` : ""}
              </div>
            </div>
          )}

          {/* Format hints */}
          <div className="p-3 bg-surface-subtle rounded-md border border-outline">
            <p className="text-xs font-medium text-on-surface mb-2">Formatos aceitos:</p>
            <div className="flex flex-wrap gap-1">
              {supportedFormats.map((format) => (
                <Badge key={format} variant="outline" className="text-xs">
                  {format.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              "Importar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
