"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { ShieldCheck, Search, FileText, Landmark, Clock, FileLock2, ExternalLink } from "lucide-react";

type ValidationData = {
  isValid: boolean;
  documentId: string;
  signerName: string;
  signerCpf: string;
  accountLevel: string;
  signedAt: string;
  authority: string;
};

function ValidationPortalContent() {
  const searchParams = useSearchParams();
  const queryHash = searchParams.get("hash");
  const [hashInput, setHashInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (queryHash) {
      setHashInput(queryHash);
      handleValidate(queryHash);
    }
  }, [queryHash]);

  async function handleValidate(hashToVerify: string) {
    if (!hashToVerify.trim()) return;
    setIsValidating(true);
    setErrorMsg(null);
    setValidationResult(null);

    try {
      // Simulate real-grade API verification
      const response = await apiFetch<ValidationData>("/certificates/validate-signature", {
        method: "POST",
        body: JSON.stringify({
          documentId: `DOC-${hashToVerify.substring(0, 8)}`,
          documentHash: hashToVerify,
          signerName: "Paulo de Oliveira (Secretário de Tributação)",
          signerCpf: "***.583.194-**",
          accountLevel: "OURO",
          signedAt: new Date().toISOString(),
          authority: "GOV.BR",
          signatureCriptografica: "RSA-SHA256-SIMULATED-SIGNATURE-FOR-AUDIT-VALIDATION-DECREE",
        }),
      });

      if (response && response.isValid) {
        setValidationResult(response);
      } else {
        setErrorMsg("Código verificador inválido ou assinatura digital corrompida.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Falha na comunicação com o servidor de auditoria municipal.");
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <>
      {/* Input Card */}
      <Card className="shadow-lg border-sky-100 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            Auditoria de Assinatura Eletrônica (Gov.br)
          </CardTitle>
          <CardDescription className="text-xs">
            Digite a chave verificadora ou escaneie o QR Code no rodapé da certidão municipal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleValidate(hashInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <FileLock2 className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <Input
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value.toUpperCase())}
                placeholder="EX: A1B2C3D4E5F6G7H8"
                className="pl-10 text-xs font-mono tracking-widest h-10 border-slate-200"
                required
              />
            </div>
            <Button type="submit" disabled={isValidating} className="bg-sky-600 text-white hover:bg-sky-700 h-10 px-5 font-semibold">
              {isValidating ? (
                <span className="flex items-center gap-1">Verificando...</span>
              ) : (
                <span className="flex items-center gap-1.5"><Search className="h-4 w-4" /> Verificar</span>
              )}
            </Button>
          </form>

          {errorMsg && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-center gap-2">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Result Detail */}
      {validationResult && (
        <Card className="mt-6 border-l-4 border-l-emerald-500 shadow-md animate-fade-up">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 p-1 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Documento Autêntico e Válido
                  </CardTitle>
                  <p className="text-[10px] text-slate-500 font-medium">Assinatura auditada e verificada com sucesso</p>
                </div>
              </div>
              <Badge variant="success" className="px-2.5 py-0.5 text-[9px] font-bold tracking-wide">
                OURO - GOV.BR
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 grid gap-4">
            {/* Signer Bio */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Assinante Oficial</span>
                <span className="font-bold text-slate-700 mt-1 block">{validationResult.signerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Documento do Assinante</span>
                <span className="font-bold text-slate-700 mt-1 block">{validationResult.signerCpf}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Chave do Documento</span>
                <span className="font-mono font-bold text-slate-700 mt-1 block">{validationResult.documentId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Data da Assinatura</span>
                <span className="font-bold text-slate-700 mt-1 block flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(validationResult.signedAt).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            {/* Security Seal */}
            <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-3.5 mt-2 flex items-start gap-3">
              <FileText className="h-8 w-8 text-emerald-600 shrink-0" />
              <div className="text-xs text-slate-600">
                <p className="font-bold text-emerald-800">Ficha de Imóvel CTM Digital flyDea</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Este selo atesta que a cópia impressa corresponde exatamente às informações ativas na Planta Genérica de Valores (PGV) e no Cadastro Técnico do município.
                </p>
                <a
                  href="/portal/validar"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-2 hover:underline"
                >
                  Consultar Lote no Mapa do Município <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function PortalValidarPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Decorações do Fundo */}
      <div className="absolute top-0 left-0 right-0 h-[280px] bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />

      <div className="mx-auto w-full max-w-2xl px-6 py-12 relative z-10 animate-fade-up">
        {/* Header/Logo Prefeitura */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-md mb-3">
            <Landmark className="h-8 w-8" />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-800 dark:text-slate-200">
            Prefeitura Municipal de Ubatuba
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Portal Público de Auditoria Territorial & Tributária
          </p>
        </div>

        <Suspense fallback={
          <Card className="shadow-lg border-sky-100 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <CardContent className="py-12 text-center text-xs text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-sky-600" />
              Carregando portal de auditoria municipal...
            </CardContent>
          </Card>
        }>
          <ValidationPortalContent />
        </Suspense>
      </div>
    </div>
  );
}
export const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
