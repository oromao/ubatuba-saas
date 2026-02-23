import {
  Armchair,
  Bell,
  Building2,
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
  Radar,
  Route,
  ShieldCheck,
  SlidersHorizontal,
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
    items: [
      {
        label: "Dashboard",
        href: "/app/dashboard",
        icon: LayoutDashboard,
        keywords: ["painel", "kpi", "executivo"],
        roles: ROLE_GROUPS.all,
      },
      withDefaultRoles({
        label: "Mapas & Drones",
        href: "/app/maps",
        icon: MapPinned,
        keywords: ["mapa", "camadas", "geo", "drone"],
      }),
      withDefaultRoles({
        label: "Levantamentos",
        href: "/app/levantamentos",
        icon: Radar,
        keywords: ["aerofoto", "lidar", "entregaveis"],
      }),
    ],
  },
  {
    title: "CADASTRO (CTM)",
    items: [
      withDefaultRoles({ label: "Parcelas", href: "/app/ctm/parcelas", icon: Landmark, keywords: ["lotes", "ctm"] }),
      withDefaultRoles({ label: "Logradouros", href: "/app/ctm/logradouros", icon: Route, keywords: ["ruas", "vias"] }),
      withDefaultRoles({ label: "Mobiliario", href: "/app/ctm/mobiliario", icon: Armchair, keywords: ["urbano"] }),
    ],
  },
  {
    title: "VALORACAO (PGV)",
    items: [
      withDefaultRoles({ label: "Zonas", href: "/app/pgv/zonas", icon: Layers, keywords: ["valor"] }),
      withDefaultRoles({ label: "Faces", href: "/app/pgv/faces", icon: Route, keywords: ["quadra"] }),
      withDefaultRoles({ label: "Fatores", href: "/app/pgv/fatores", icon: SlidersHorizontal, keywords: ["multiplicador"] }),
      withDefaultRoles({ label: "Relatorio", href: "/app/pgv/relatorio", icon: LineChart, keywords: ["venal"] }),
    ],
  },
  {
    items: [
      withDefaultRoles({ label: "Alertas", href: "/app/alerts", icon: Bell, keywords: ["ambiental", "risco"] }),
      withDefaultRoles({ label: "Processos", href: "/app/processes", icon: FileCheck2, keywords: ["workflow"] }),
      withDefaultRoles({ label: "Ativos", href: "/app/assets", icon: Building2, keywords: ["inventario"] }),
      withDefaultRoles({ label: "Integracoes", href: "/app/integracoes", icon: Link2, keywords: ["tributario", "sync", "conector"] }),
      withDefaultRoles({ label: "Cartas", href: "/app/cartas", icon: Mail, keywords: ["notificacao", "pdf", "protocolo"] }),
      withDefaultRoles({ label: "Compliance", href: "/app/compliance", icon: ShieldCheck, keywords: ["crea", "cau", "cat", "art"] }),
      withDefaultRoles({ label: "REURB", href: "/app/reurb", icon: FileSpreadsheet, keywords: ["familias", "planilha", "cartorio"] }),
      {
        label: "PoC",
        href: "/app/poc",
        icon: ClipboardCheck,
        keywords: ["score", "aderencia", "evidencia"],
        roles: ROLE_GROUPS.all,
      },
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
