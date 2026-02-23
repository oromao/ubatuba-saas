import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const capabilities = [
  {
    title: "Mapeamento com drone e satelite",
    desc: "Ortomosaico, nuvem de pontos e modelos 3D atualizados com voo programado.",
    tag: "Mapa 2D/3D",
    icon: MapPinned,
  },
  {
    title: "Cadastro tecnico multifinalitario",
    desc: "Base cartografica unica para IPTU, infraestrutura e planejamento urbano.",
    tag: "Cadastro unico",
    icon: Building2,
  },
  {
    title: "Licenciamento e processos digitais",
    desc: "Fluxos com SLA, assinatura e trilhas de auditoria para cada etapa.",
    tag: "Workflow",
    icon: FileCheck2,
  },
  {
    title: "Monitoramento ambiental continuo",
    desc: "Alertas, risco hidrologico e fiscalizacao georreferenciada.",
    tag: "Risco e alerta",
    icon: BadgeCheck,
  },
  {
    title: "Painel executivo e indicadores",
    desc: "KPI territoriais, comparativos por regiao e visao consolidada.",
    tag: "Gestao",
    icon: LayoutDashboard,
  },
  {
    title: "Portal publico e transparencia",
    desc: "Camadas publicas, consultas e pedidos externos com governanca.",
    tag: "Cidadania",
    icon: ShieldCheck,
  },
];

const workflow = [
  {
    title: "Captura e processamento",
    desc: "Coleta com drone, satelite e sensores. Processamento automatico em nuvem.",
  },
  {
    title: "Inteligencia e analise",
    desc: "Comparacao temporal, deteccao de risco e analise cadastral integrada.",
  },
  {
    title: "Operacao e auditoria",
    desc: "Acoes de campo, relatorios e trilha completa de conformidade.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="sticky top-0 z-40 border-b border-outline/60 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6">
          <Link href="/" className="min-w-[180px]">
            <p className="text-xl font-semibold text-on-surface">FlyDea Atlas</p>
            <p className="text-xs text-slate">GeoInteligencia municipal com drone</p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate lg:flex">
            <Link href="#plataforma">Plataforma</Link>
            <Link href="#drone">Drone</Link>
            <Link href="#confianca">Confianca</Link>
            <Link href="#contato">Contato</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden h-10 items-center justify-center rounded-full border border-outline bg-surface-elevated px-4 text-sm font-semibold text-on-surface transition hover:border-ocean/35 md:inline-flex"
            >
              Acessar painel
            </Link>
            <Button className="h-10 bg-ocean px-5 text-white">Solicitar demo</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-atlas">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-24 h-56 w-56 rounded-full bg-sun/25 blur-3xl" />

          <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.04fr_0.96fr]">
            <div className="space-y-6">
              <Badge variant="info">Plataforma geoespacial completa</Badge>
              <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight md:text-6xl">
                Gestao territorial com mapas precisos, drones e inteligencia aplicada.
              </h1>
              <p className="max-w-2xl text-lg text-slate">
                Uma base unica para cadastro tecnico, monitoramento ambiental, licenciamento e
                planejamento urbano. Tudo integrado ao mapa com operacao segura e auditavel.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button className="bg-ocean text-white">
                  Falar com especialista
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-outline bg-surface-elevated px-5 text-sm font-semibold text-on-surface transition hover:border-ocean/30"
                >
                  Entrar agora
                </Link>
              </div>

              <div className="grid max-w-2xl gap-4 pt-4 sm:grid-cols-3">
                {[
                  { label: "Municipios atendidos", value: "120+" },
                  { label: "Atualizacao cartografica", value: "7 dias" },
                  { label: "Disponibilidade", value: "99.95%" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-outline/70 bg-surface-elevated/90 p-4 shadow-1"
                  >
                    <p className="text-2xl font-semibold text-on-surface">{item.value}</p>
                    <p className="text-xs text-slate">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="relative overflow-hidden border-outline/70 bg-surface-elevated/95 shadow-3">
                <div className="absolute inset-0 bg-map-grid opacity-55" />
                <CardHeader className="relative">
                  <CardTitle className="font-display text-2xl">Mapa operacional vivo</CardTitle>
                  <CardDescription>
                    Camadas urbanas, ambientais e fiscais em tempo real.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-surface-elevated text-on-surface">Ortomosaico 10 cm</Badge>
                    <Badge className="bg-surface-elevated text-on-surface">Cadastro tecnico</Badge>
                    <Badge className="bg-surface-elevated text-on-surface">Risco hidrologico</Badge>
                  </div>
                  <div className="rounded-2xl border border-outline/70 bg-surface-elevated p-4">
                    <p className="text-xs text-slate">Missao ativa</p>
                    <p className="text-2xl font-semibold text-on-surface">Drone 02 - Zona Norte</p>
                    <p className="text-xs text-slate">Cobertura 48 km2 | Voo 92%</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-outline/70 bg-surface-elevated p-4">
                      <p className="text-xs text-slate">Alertas ambientais</p>
                      <p className="text-2xl font-semibold text-on-surface">18</p>
                      <p className="text-xs text-slate">4 criticos nas ultimas 2h</p>
                    </div>
                    <div className="rounded-2xl border border-outline/70 bg-surface-elevated p-4">
                      <p className="text-xs text-slate">Processos digitais</p>
                      <p className="text-2xl font-semibold text-on-surface">342</p>
                      <p className="text-xs text-slate">82% dentro do SLA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="plataforma" className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                Plataforma completa
              </p>
              <h2 className="font-display text-3xl font-semibold text-on-surface">
                Frentes operacionais de uma central geoespacial robusta.
              </h2>
              <p className="text-slate">
                Mapeamento, cadastro, licenciamento, monitoramento e portal publico em um unico
                ecossistema. Cada modulo conversa com o mapa para decisoes mais rapidas.
              </p>
              <div className="space-y-3 text-sm text-slate">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-teal" />
                  Dados unificados com controle de versao e auditoria diaria
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-teal" />
                  Operacao multi-secretarias com perfis e permissoes
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-teal" />
                  APIs prontas para integrar cadastros e sistemas fiscais
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {capabilities.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="border-outline/70 bg-surface-elevated/95">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ocean/10 text-ocean">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-slate">{item.tag}</span>
                      </div>
                      <CardTitle className="mt-4 font-display text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-2 text-sm">{item.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="drone" className="bg-surface-elevated">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                Operacao com drone
              </p>
              <h2 className="font-display text-3xl font-semibold text-on-surface">
                Do voo ao mapa em horas, com rastreio completo.
              </h2>
              <p className="text-slate">
                Planeje missoes, acompanhe processamento automatico e publique camadas prontas para
                inspeccao, fiscalizacao e planejamento urbano.
              </p>
              <div className="grid gap-4">
                {workflow.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-outline/70 bg-surface p-4">
                    <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                    <p className="text-sm text-slate">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-outline/70 bg-hero-glow">
              <div className="absolute inset-0 bg-map-grid opacity-55" />
              <CardHeader className="relative">
                <CardTitle className="font-display text-2xl">Centro de missao</CardTitle>
                <CardDescription>Controle de voo, qualidade e processamento.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="rounded-2xl border border-outline/70 bg-surface-elevated/90 p-4">
                  <p className="text-xs text-slate">Ultima coleta</p>
                  <p className="text-2xl font-semibold text-on-surface">Ontem, 16:40</p>
                  <p className="text-xs text-slate">Ortomosaico + modelo 3D</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-outline/70 bg-surface-elevated/90 p-4">
                    <p className="text-xs text-slate">Area mapeada</p>
                    <p className="text-xl font-semibold text-on-surface">128 km2</p>
                  </div>
                  <div className="rounded-2xl border border-outline/70 bg-surface-elevated/90 p-4">
                    <p className="text-xs text-slate">Missoes em fila</p>
                    <p className="text-xl font-semibold text-on-surface">6</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-outline/70 bg-surface-elevated/90 p-4 text-xs text-slate">
                  Qualidade garantida com pontos de controle e revisao tecnica automatica.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="confianca" className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                Confianca operacional
              </p>
              <h2 className="font-display text-3xl font-semibold text-on-surface">
                Compliance, resiliencia e governanca para dados sensiveis.
              </h2>
              <p className="text-slate">
                Criptografia, trilhas de auditoria e controles por perfil garantem seguranca e
                estabilidade para equipes tecnicas e gestores.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "LGPD + RBAC",
                  "Backups diarias",
                  "Monitoramento 24/7",
                  "Ambiente multi-tenant",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-outline/70 bg-surface-elevated p-4 text-sm text-slate">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-outline/70 bg-surface-elevated/95">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Sala situacional</CardTitle>
                <CardDescription>Indicadores executivos para decisao rapida.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-outline/70 bg-surface p-4">
                  <p className="text-xs text-slate">Tempo de resposta</p>
                  <p className="text-2xl font-semibold text-on-surface">-18%</p>
                </div>
                <div className="rounded-2xl border border-outline/70 bg-surface p-4">
                  <p className="text-xs text-slate">Processos digitais</p>
                  <p className="text-2xl font-semibold text-on-surface">+32%</p>
                </div>
                <div className="rounded-2xl border border-outline/70 bg-surface p-4">
                  <p className="text-xs text-slate">Alertas resolvidos</p>
                  <p className="text-2xl font-semibold text-on-surface">94%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="contato" className="bg-surface-elevated">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold text-on-surface">
                Modernize a governanca territorial com mapa e drone.
              </h2>
              <p className="mt-4 text-slate">
                Solicite uma demonstracao e receba um plano de implantacao completo.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                <span>Implantacao guiada</span>
                <span>Treinamento</span>
                <span>Suporte 24/7</span>
              </div>
            </div>

            <Card className="border-outline/70 bg-surface-elevated/95">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Fale com especialistas</CardTitle>
                <CardDescription>Resposta em ate 24h</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Nome" />
                <Input placeholder="Email" />
                <Input placeholder="Municipio" />
                <Button className="w-full bg-ocean text-white">Enviar</Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline/70 bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-on-surface">FlyDea Atlas</p>
            <p className="mt-2 text-sm text-slate">GeoInteligencia para governos locais.</p>
          </div>
          <div className="text-sm text-slate">
            <p className="font-semibold text-on-surface">Plataforma</p>
            <ul className="mt-3 space-y-2">
              <li>Mapa e drones</li>
              <li>Cadastro tecnico</li>
              <li>Monitoramento ambiental</li>
            </ul>
          </div>
          <div className="text-sm text-slate">
            <p className="font-semibold text-on-surface">Contato</p>
            <ul className="mt-3 space-y-2">
              <li>contato@flydea.com.br</li>
              <li>(11) 4040-2024</li>
              <li>Sao Paulo, Brasil</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
