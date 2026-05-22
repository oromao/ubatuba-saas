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
    <main className="mx-auto max-w-xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Ubatuba — Portal Cidadão 156
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Registre sua solicitação ou reclamação
        </p>
      </div>

      {/* Success state */}
      {protocolNumber && (
        <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-center">
          <p className="font-semibold text-green-800">Solicitação enviada com sucesso!</p>
          <p className="mt-1 text-sm text-green-700">
            Guarde este protocolo:{" "}
            <span className="font-mono font-bold">{protocolNumber}</span>
          </p>
          <button
            onClick={() => setProtocolNumber(null)}
            className="mt-3 text-xs text-green-600 underline hover:text-green-800"
          >
            Enviar nova solicitação
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      {!protocolNumber && (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Nome */}
          <div className="space-y-1">
            <Label htmlFor="nome">Nome (opcional)</Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
            />
          </div>

          {/* Contato */}
          <div className="space-y-1">
            <Label htmlFor="contato">Contato — telefone ou e-mail (opcional)</Label>
            <Input
              id="contato"
              name="contato"
              placeholder="(12) 99999-0000 ou email@exemplo.com"
              value={form.contato}
              onChange={handleChange}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1">
            <Label htmlFor="categoria">Categoria *</Label>
            <select
              id="categoria"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Assunto */}
          <div className="space-y-1">
            <Label htmlFor="assunto">Assunto *</Label>
            <Input
              id="assunto"
              name="assunto"
              placeholder="Descreva brevemente o problema"
              value={form.assunto}
              onChange={handleChange}
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Detalhes adicionais sobre a solicitação"
              rows={4}
              value={form.descricao}
              onChange={handleChange}
            />
          </div>

          {/* Endereço */}
          <div className="space-y-1">
            <Label htmlFor="endereco">Endereço / Local (opcional)</Label>
            <Input
              id="endereco"
              name="endereco"
              placeholder="Rua, número, bairro"
              value={form.endereco}
              onChange={handleChange}
            />
          </div>

          {/* LGPD Consent */}
          {hasPersonalData && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <input
                type="checkbox"
                id="lgpdConsent"
                name="lgpdConsent"
                checked={form.lgpdConsent}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="lgpdConsent" className="text-xs leading-5 text-blue-900">
                Autorizo o tratamento dos meus dados pessoais (nome e contato) para fins de
                registro e acompanhamento da solicitação, conforme a{" "}
                <a
                  href="/privacidade"
                  target="_blank"
                  className="font-medium underline hover:text-blue-700"
                >
                  Política de Privacidade
                </a>{" "}
                (art. 7 LGPD). Estou ciente que posso solicitar a exclusão dos meus dados a
                qualquer momento.
              </label>
            </div>
          )}

          <div className="text-xs text-slate-400 text-center">
            Ao enviar, você concorda com os{" "}
            <a href="/privacidade" target="_blank" className="underline hover:text-slate-600">
              Termos de Uso e Política de Privacidade
            </a>
            .
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </form>
      )}
    </main>
  );
}
