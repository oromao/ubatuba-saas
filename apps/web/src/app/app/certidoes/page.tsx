"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/app/data-table";
import { apiFetch, API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

type Certificate = {
  _id: string;
  type: string;
  subjectName: string;
  subjectDocument?: string;
  validationCode: string;
  hashSha256: string;
  pdfKey: string;
  status: string;
  issuedAt: string;
  validationUrl?: string;
};

export default function CertidoesPage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState("Certidao de Uso e Ocupacao");
  const [subjectName, setSubjectName] = useState("Imovel Demo Ubatuba");
  const [subjectDocument, setSubjectDocument] = useState("12.345.678/0001-99");
  const [processId, setProcessId] = useState("");
  const [validationCode, setValidationCode] = useState("");

  const certificatesQuery = useQuery({
    queryKey: ["certificates"],
    queryFn: () => apiFetch<Certificate[]>("/certificates"),
  });

  const issueMutation = useMutation({
    mutationFn: () =>
      apiFetch<Certificate & { validationUrl: string; downloadUrl: string }>("/certificates", {
        method: "POST",
        body: JSON.stringify({
          type,
          subjectName,
          subjectDocument,
          processId: processId || undefined,
        }),
      }),
    onSuccess: (created) => {
      setValidationCode(created.validationCode);
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });

  const validationQuery = useQuery({
    queryKey: ["certificate-validation", validationCode],
    queryFn: () => apiFetch<{ valid: boolean; certificate: Certificate }>(`/certificates/validate/${validationCode}`),
    enabled: validationCode.trim().length > 0,
  });

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-6 md:px-8 motion-reduce:animate-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-on-surface">Certidões</h1>
          <p className="text-sm text-on-surface-muted">Emissão, validação pública e vínculo com processos.</p>
        </div>
        <Badge variant="info">P0 Ubatuba</Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Emitir certidão</CardTitle>
            <CardDescription>Gera PDF, hash e código validador.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Tipo de certidão" />
            <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Titular" />
            <Input value={subjectDocument} onChange={(e) => setSubjectDocument(e.target.value)} placeholder="Documento" />
            <Input value={processId} onChange={(e) => setProcessId(e.target.value)} placeholder="Processo vinculado (opcional)" />
            <Button onClick={() => issueMutation.mutate()} disabled={issueMutation.isPending}>
              {issueMutation.isPending ? "Emitindo..." : "Emitir certidão"}
            </Button>
            {issueMutation.data && (
              <div className="rounded-lg border border-outline bg-cloud/40 p-3 text-sm text-on-surface-muted">
                <p className="font-medium text-on-surface">Código validador: {issueMutation.data.validationCode}</p>
                <p className="mt-1 break-all">
                  Validação pública: {`${API_URL}/certificates/validate/${issueMutation.data.validationCode}?tenantId=${sessionStorage.getItem("tenantId") ?? ""}`}
                </p>
                <p className="mt-1 break-all">Arquivo PDF: {issueMutation.data.pdfKey}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validar certidão</CardTitle>
            <CardDescription>Consulta pública por código validador.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={validationCode} onChange={(e) => setValidationCode(e.target.value)} placeholder="Código validador" />
            <div
              className={cn(
                "rounded-lg border p-3 text-sm",
                validationQuery.data?.valid ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-outline bg-cloud/40 text-on-surface-muted",
              )}
            >
              {validationQuery.isFetching && <p>Validando...</p>}
              {!validationQuery.isFetching && validationQuery.data && (
                <>
                  <p className="font-medium text-on-surface">{validationQuery.data.valid ? "Certidão válida" : "Certidão inválida"}</p>
                  <p className="mt-1">Tipo: {validationQuery.data.certificate.type}</p>
                  <p>Titular: {validationQuery.data.certificate.subjectName}</p>
                </>
              )}
              {!validationQuery.isFetching && !validationQuery.data && <p>Informe um código para consultar.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Certidões emitidas</CardTitle>
          <CardDescription>Base operacional do portal e atendimento municipal.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={certificatesQuery.data ?? []}
            loading={certificatesQuery.isLoading}
            columns={[
              { key: "type", label: "Tipo" },
              { key: "subjectName", label: "Titular" },
              { key: "validationCode", label: "Código" },
              {
                key: "status",
                label: "Status",
                render: (value) => <Badge variant={String(value) === "EMITIDA" ? "success" : "destructive"}>{String(value)}</Badge>,
              },
              { key: "issuedAt", label: "Emitida em" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
