export type AppRole = "ADMIN" | "GESTOR" | "OPERADOR" | "LEITOR";

export const ROLE_GROUPS = {
  all: ["ADMIN", "GESTOR", "OPERADOR", "LEITOR"] as AppRole[],
  ops: ["ADMIN", "GESTOR", "OPERADOR"] as AppRole[],
  managers: ["ADMIN", "GESTOR"] as AppRole[],
  adminOnly: ["ADMIN"] as AppRole[],
};

type RouteRule = {
  prefix: string;
  roles: AppRole[];
};

const APP_ROUTE_RULES: RouteRule[] = [
  { prefix: "/app/dashboard", roles: ROLE_GROUPS.all },
  { prefix: "/app/poc", roles: ROLE_GROUPS.adminOnly },
  { prefix: "/app/maps", roles: ROLE_GROUPS.ops },
  { prefix: "/app/levantamentos", roles: ROLE_GROUPS.ops },
  { prefix: "/app/ctm", roles: ROLE_GROUPS.ops },
  { prefix: "/app/pgv", roles: ROLE_GROUPS.ops },
  { prefix: "/app/alerts", roles: ROLE_GROUPS.ops },
  { prefix: "/app/monitoramento", roles: ROLE_GROUPS.ops },
  { prefix: "/app/ambiental", roles: ROLE_GROUPS.ops },
  { prefix: "/app/156", roles: ROLE_GROUPS.ops },
  { prefix: "/app/observatorio", roles: ROLE_GROUPS.ops },
  { prefix: "/app/auditoria", roles: ROLE_GROUPS.ops },
  { prefix: "/app/processes", roles: ROLE_GROUPS.ops },
  { prefix: "/app/assets", roles: ROLE_GROUPS.ops },
  { prefix: "/app/notifications", roles: ROLE_GROUPS.all },
  { prefix: "/app/profile", roles: ROLE_GROUPS.all },
  { prefix: "/app/relatorios", roles: ROLE_GROUPS.ops },
  { prefix: "/app/aprovacao", roles: ROLE_GROUPS.ops },
  { prefix: "/app/certidoes", roles: ROLE_GROUPS.ops },
  { prefix: "/app/integracoes", roles: ROLE_GROUPS.ops },
  { prefix: "/app/cartas", roles: ROLE_GROUPS.ops },
  { prefix: "/app/modulos/compliance", roles: ROLE_GROUPS.ops },
  { prefix: "/app/modulos/obras", roles: ROLE_GROUPS.ops },
  { prefix: "/app/modulos/obras-publicas", roles: ROLE_GROUPS.ops },
  { prefix: "/app/modulos/empresas", roles: ROLE_GROUPS.ops },
  { prefix: "/app/modulos/cemiterio", roles: ROLE_GROUPS.ops },
  { prefix: "/app/reurb", roles: ROLE_GROUPS.ops },
];

export const isAppRouteAllowed = (pathname: string, role?: string | null) => {
  if (!pathname.startsWith("/app")) return true;
  if (pathname === "/app" || pathname === "/app/") return true;
  if (!role) return false;

  const rule = APP_ROUTE_RULES.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
  // Deny by default inside /app when route is not explicitly mapped.
  if (!rule) return false;
  return rule.roles.includes(role as AppRole);
};

export const isMobileRouteAllowed = (role?: string | null) =>
  !!role && ROLE_GROUPS.ops.includes(role as AppRole);
