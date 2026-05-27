"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/api";

const CATEGORIES = [
  "Buracos e Pavimentação",
  "Iluminação Pública",
  "Limpeza Urbana",
  "Poda e Árvores",
  "Drenagem e Esgoto",
  "Fiscalização",
  "Outros",
];

type FormState = {
  nome: string;
  contato: string;
  categoria: string;
  assunto: string;
  descricao: string;
  endereco: string;
  lgpdConsent: boolean;
};

const initialForm: FormState = {
  nome: "",
  contato: "",
  categoria: "",
  assunto: "",
  descricao: "",
  endereco: "",
  lgpdConsent: false,
};

export default function CidadaoPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  const hasPersonalData = form.nome.trim() || form.contato.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.assunto.trim()) {
      setError("O campo Assunto é obrigatório.");
      return;
    }
    if (!form.categoria) {
      setError("Selecione uma categoria.");
      return;
    }
    if (hasPersonalData && !form.lgpdConsent) {
      setError("Você precisa concordar com a política de privacidade para fornecer dados pessoais.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/cidadao/solicitacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: process.env.NEXT_PUBLIC_TENANT_SLUG || "demo",
          title: form.assunto,
          category: form.categoria,
          description: form.descricao || undefined,
          reporterName: form.nome || undefined,
          reporterContact: form.contato || undefined,
          address: form.endereco || undefined,
          lgpdConsent: hasPersonalData ? form.lgpdConsent : undefined,
          lgpdConsentVersion: "v1.0-2026-05",
        }),
      });

      const data = (await res.json()) as {
        protocolNumber?: string;
        message?: string;
        detail?: string;
      };

      if (!res.ok) {
        throw new Error(data.detail ?? "Erro ao enviar solicitação.");
      }

      setProtocolNumber(data.protocolNumber ?? null);
      setForm(initialForm);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar solicitação.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-12 animate-fade-up">
      {/* Header */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-display font-extrabold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
          Ubatuba — Portal Cidadão 156
        </h1>
        <p className="text-sm text-on-surface-muted/90 font-medium">
          Registre sua solicitação, ocorrência ou reclamação de forma rápida
        </p>
      </div>

      {/* Success state */}
      {protocolNumber && (
        <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 text-center shadow-lg shadow-emerald-500/5 animate-fade-in">
          <p className="font-semibold text-emerald-700 text-lg">Solicitação enviada com sucesso!</p>
          <p className="mt-2 text-sm text-emerald-600/90 font-medium">
            Guarde o seu número de protocolo para acompanhar:
          </p>
          <div className="mt-3 inline-block rounded-md bg-emerald-500/10 px-4 py-2 border border-emerald-500/20 shadow-inner">
            <span className="font-mono font-bold text-xl tracking-wider text-emerald-800">{protocolNumber}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-500/10">
            <button
              onClick={() => setProtocolNumber(null)}
              className="text-xs text-primary font-semibold underline underline-offset-4 hover:text-primary-variant transition-colors"
            >
              Enviar nova solicitação
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 animate-shake">
          <p className="text-sm text-rose-700 font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      {!protocolNumber && (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-primary/10 bg-surface/90 p-8 shadow-xl shadow-primary/5 backdrop-blur-sm">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="nome" className="font-semibold text-on-surface/90">Nome (opcional)</Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={handleChange}
              className="focus-visible:ring-primary border-primary/5"
            />
          </div>

          {/* Contato */}
          <div className="space-y-1.5">
            <Label htmlFor="contato" className="font-semibold text-on-surface/90">Contato — telefone ou e-mail (opcional)</Label>
            <Input
              id="contato"
              name="contato"
              placeholder="(12) 99999-0000 ou email@exemplo.com"
              value={form.contato}
              onChange={handleChange}
              className="focus-visible:ring-primary border-primary/5"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label htmlFor="categoria" className="font-semibold text-on-surface/90">Categoria *</Label>
            <select
              id="categoria"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
              className="flex h-11 w-full rounded-md border border-primary/5 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface"
            >
              <option value="" className="text-on-surface-muted">Selecione uma categoria...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Assunto */}
          <div className="space-y-1.5">
            <Label htmlFor="assunto" className="font-semibold text-on-surface/90">Assunto *</Label>
            <Input
              id="assunto"
              name="assunto"
              placeholder="Descreva brevemente o problema"
              value={form.assunto}
              onChange={handleChange}
              required
              className="focus-visible:ring-primary border-primary/5"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="font-semibold text-on-surface/90">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Detalhes adicionais sobre a solicitação ou ponto de referência..."
              rows={4}
              value={form.descricao}
              onChange={handleChange}
              className="focus-visible:ring-primary border-primary/5"
            />
          </div>

          {/* Endereço */}
          <div className="space-y-1.5">
            <Label htmlFor="endereco" className="font-semibold text-on-surface/90">Endereço / Local (opcional)</Label>
            <Input
              id="endereco"
              name="endereco"
              placeholder="Rua, número, bairro em Ubatuba"
              value={form.endereco}
              onChange={handleChange}
              className="focus-visible:ring-primary border-primary/5"
            />
          </div>

          {/* LGPD Consent */}
          {hasPersonalData && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/10 bg-primary/5 p-4 animate-fade-in">
              <input
                type="checkbox"
                id="lgpdConsent"
                name="lgpdConsent"
                checked={form.lgpdConsent}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary"
              />
              <label htmlFor="lgpdConsent" className="text-xs leading-5 text-primary-variant font-medium">
                Autorizo o tratamento dos meus dados pessoais (nome e contato) para fins de
                registro e acompanhamento da solicitação, conforme a{" "}
                <a
                  href="/privacidade"
                  target="_blank"
                  className="font-bold underline underline-offset-2 hover:text-primary-variant transition-colors"
                >
                  Política de Privacidade
                </a>{" "}
                (art. 7 LGPD). Estou ciente que posso solicitar a exclusão dos meus dados a
                qualquer momento.
              </label>
            </div>
          )}

          <div className="text-xs text-on-surface-muted/70 text-center font-medium">
            Ao enviar, você concorda com os{" "}
            <a href="/privacidade" target="_blank" className="underline underline-offset-2 hover:text-on-surface-muted transition-colors">
              Termos de Uso e Política de Privacidade
            </a>
            .
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-variant font-bold transition-all shadow-md shadow-primary/10 h-11">
            {loading ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </form>
      )}
    </main>
  );
}
