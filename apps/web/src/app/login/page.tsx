"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, Sparkles } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantSlug: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

const metrics = [
  { label: "Camadas ativas", value: "64" },
  { label: "Missoes semanais", value: "12" },
  { label: "Alertas monitorados", value: "284" },
  { label: "Aprovacoes digitais", value: "1.4k" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await res.json();
    if (res.ok) {
      login(payload.data.accessToken, payload.data.refreshToken, payload.data.tenantId);
      return;
    }
    toast.error("Credenciais invalidas. Verifique email, senha e tenant.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-on-surface">
      <div className="pointer-events-none absolute inset-0 bg-atlas" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-sun/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative space-y-8">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface">
              FlyDea Atlas
              <span className="rounded-full border border-outline bg-surface-elevated px-2 py-0.5 text-[11px] text-slate">
                SaaS geoespacial
              </span>
            </Link>
            <Badge variant="info">Acesso seguro ao painel operacional</Badge>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-on-surface md:text-5xl">
              Controle territorial em um painel moderno, auditavel e pronto para escala.
            </h1>
            <p className="max-w-xl text-base text-slate">
              Mapeamento, cadastro tecnico, processos digitais e monitoramento integrados com
              governanca por perfil.
            </p>
          </div>

          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            {metrics.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-outline/70 bg-surface-elevated/90 p-4 shadow-1"
              >
                <p className="text-xs text-slate">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-on-surface">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl rounded-2xl border border-outline/70 bg-surface-elevated/90 p-4 shadow-1">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-teal" />
              <div>
                <p className="text-sm font-semibold text-on-surface">Seguranca institucional</p>
                <p className="text-sm text-slate">
                  Logs por usuario, trilha de auditoria e segregacao multi-tenant.
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate">
              <span className="inline-flex items-center gap-1 rounded-full border border-outline bg-cloud px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-sun" />
                Fluxo simplificado
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-outline bg-cloud px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-teal" />
                LGPD + RBAC
              </span>
            </div>
          </div>

        </section>

        <section className="flex w-full justify-center lg:justify-end">
          <Card className="w-full max-w-md border-outline/80 bg-surface-elevated shadow-3">
            <CardHeader className="space-y-2">
              <CardTitle className="font-display text-3xl">Entrar no painel</CardTitle>
              <CardDescription>
                Informe credenciais de acesso para sua operacao geoespacial.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
                    Email institucional
                  </label>
                  <Input placeholder="nome@prefeitura.gov.br" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-red-500">Email invalido</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
                    Senha
                  </label>
                  <Input placeholder="********" type="password" {...register("password")} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">
                    Tenant
                  </label>
                  <Input placeholder="ex: prefeitura-jales" {...register("tenantSlug")} />
                </div>

                <Button type="submit" className="mt-2 w-full bg-ocean text-white" loading={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="flex items-center justify-between text-sm text-slate">
                <Link href="/forgot-password">Esqueci minha senha</Link>
                <Link href="/" className="text-on-surface/75">
                  Voltar ao site
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
