import {
  Armchair,
  CheckSquare,
  ClipboardCheck,
  FileSpreadsheet,
  FileCheck2,
  Landmark,
  Layers,
  LayoutDashboard,
  Link2,
  LineChart,
  Mail,
  MapPinned,
  Route,
  ShieldCheck,
  Briefcase,
  HardHat
} from "lucide-react";
import type { ComponentType } from "react";
import { ROLE_GROUPS, type AppRole } from "@/lib/rbac";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  keywords?: string[];
  roles?: UserRole[];
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export type UserRole = AppRole;

const DEFAULT_ROLES: UserRole[] = ROLE_GROUPS.ops;
const withDefaultRoles = (item: Omit<NavItem, "roles"> & { roles?: UserRole[] }): NavItem => ({
  ...item,
  roles: item.roles ?? DEFAULT_ROLES,
});

export const navGroups: NavGroup[] = [
  {
    title: "CADASTRO TERRITORIAL",
    items: [
      withDefaultRoles({ label: "Lotes e Imóveis", href: "/app/ctm/parcelas", icon: Landmark, keywords: ["lotes", "ctm", "parcelas"] }),
      withDefaultRoles({ label: "Malha Viária ↗", href: "/app/ctm/logradouros", icon: Route, keywords: ["ruas", "vias", "logradouros"] }),
      withDefaultRoles({ label: "Equipamentos ↗", href: "/app/ctm/equipamentos", icon: Armchair, keywords: ["urbano", "mobiliario", "equipamentos"] }),
      withDefaultRoles({ label: "Vistorias", href: "/app/ctm/vistorias", icon: ClipboardCheck, keywords: ["vistoria", "campo", "inspecao", "foto"] }),
      withDefaultRoles({
        label: "Mapa Interativo",
        href: "/app/maps",
        icon: MapPinned,
        keywords: ["mapa", "camadas", "geo", "drone"],
      }),
    ],
  },
  {
    title: "PAINEL E ANÁLISE",
    items: [
      {
        label: "Painel de Gestão",
        href: "/app/dashboard",
        icon: LayoutDashboard,
        keywords: ["painel", "kpi", "executivo", "arrecadacao"],
        roles: ROLE_GROUPS.all,
      },
      withDefaultRoles({
        label: "Observatório Urbano",
        href: "/app/observatorio",
        icon: LineChart,
        keywords: ["mercado", "pgv", "arrecadacao", "bi"],
      }),
      withDefaultRoles({ label: "Relatórios", href: "/app/relatorios", icon: FileSpreadsheet, keywords: ["relatorio", "exportar", "csv"] }),
    ],
  },
  {
    title: "FISCALIZAÇÃO",
    items: [
      withDefaultRoles({ label: "Processos Digitais", href: "/app/processes", icon: FileCheck2, keywords: ["workflow", "alvara"] }),
      { label: "Notificações Oficiais", href: "/app/notifications", icon: Mail, keywords: ["notificacao", "sistema", "avisos"], roles: ROLE_GROUPS.all },
      withDefaultRoles({ label: "Fila de Aprovacao", href: "/app/aprovacao", icon: CheckSquare, keywords: ["aprovacao", "validacao", "pendentes"] }),
    ],
  },
  {
    title: "TRIBUTAÇÃO",
    items: [
      withDefaultRoles({ label: "Integração Tributária", href: "/app/integracoes", icon: Link2, keywords: ["tributario", "sync", "conector"] }),
    ],
  },
  {
    title: "MÓDULOS",
    items: [
      withDefaultRoles({ label: "Obras ↗", href: "/app/modulos/obras", icon: HardHat, keywords: ["alvara", "habite-se", "obra"] }),
      withDefaultRoles({ label: "Atividades Econômicas ↗", href: "/app/modulos/empresas", icon: Briefcase, keywords: ["alvara", "empresa", "inscricao"] }),
      withDefaultRoles({ label: "Licenciamento ↗", href: "/app/ambiental", icon: ShieldCheck, keywords: ["licenciamento", "poda", "app", "laudo"] }),
      withDefaultRoles({ label: "Planta de Valores ↗", href: "/app/pgv/zonas", icon: Layers, keywords: ["valor", "pgv", "zonas"] }),
      withDefaultRoles({ label: "Regularização ↗", href: "/app/reurb", icon: FileSpreadsheet, keywords: ["familias", "planilha", "cartorio"] }),
    ],
  },
  {
    title: "ADMINISTRAÇÃO",
    items: [
      {
        label: "Conformidade",
        href: "/app/poc",
        icon: ClipboardCheck,
        keywords: ["score", "aderencia", "evidencia", "conformidade"],
        roles: ROLE_GROUPS.adminOnly,
      },
      withDefaultRoles({ label: "Auditoria", href: "/app/auditoria", icon: ClipboardCheck, keywords: ["auditoria", "historico", "log"] }),
    ],
  },
];

export const getNavGroupsByRole = (role?: string | null): NavGroup[] => {
  if (!role) return [];
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role as UserRole)),
    }))
    .filter((group) => group.items.length > 0);
};

export const getFlatNavItemsByRole = (role?: string | null) =>
  getNavGroupsByRole(role).flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      section: group.title ?? "GERAL",
    })),
  );
