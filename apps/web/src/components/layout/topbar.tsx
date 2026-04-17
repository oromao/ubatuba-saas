"use client";

import { Menu, Bell, LogOut, User, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSidebar } from "./sidebar-context";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

import { SearchCommand } from "@/components/layout/search-command";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const PATH_LABELS: Record<string, string> = {
  'dashboard': 'Painel',
  'ctm': 'Cadastro Territorial',
  'parcelas': 'Lotes e Imóveis',
  'vistorias': 'Vistorias',
  'maps': 'Mapa',
  'integracoes': 'Integrações',
  'pgv': 'Planta de Valores',
  'observatorio': 'Observatório',
  'cartas': 'Notificações',
  'processes': 'Processos',
};

function Breadcrumb() {
  const pathname = usePathname() ?? "";

  if (pathname === "/app/dashboard") return null;

  const segments = pathname
    .replace(/^\/app\//, "")
    .split("/")
    .filter(Boolean);

  const parts = segments
    .map((seg) => PATH_LABELS[seg])
    .filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <div className="border-t border-outline/50 px-4 py-1 text-xs text-on-surface-muted select-none">
      {parts.join(" › ")}
    </div>
  );
}

export function Topbar() {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const { logout, userName, userEmail } = useAuth();
  const [lastTenantSlug, setLastTenantSlug] = useState<string | null>(null);
  const router = useRouter();
  const avatarInitial = (userName || userEmail || "A").charAt(0).toUpperCase();
  const { data: tenant } = useQuery({
    queryKey: ["current-tenant"],
    queryFn: () => apiFetch<{ name: string; slug: string } | null>("/tenants/me"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: notifData } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => apiFetch<{ count: number }>("/notifications-letters/unread-count").catch(() => ({ count: 0 })),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const unreadCount = notifData?.count ?? 0;

  useEffect(() => {
    setLastTenantSlug(window.localStorage.getItem("lastTenantSlug"));
  }, []);
  const tenantLabel = tenant?.name ?? lastTenantSlug ?? "Prefeitura";

  return (
    <header className="shrink-0 border-b border-outline bg-surface-elevated">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-on-surface-muted transition-colors hover:bg-cloud hover:text-on-surface lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-md p-2 text-on-surface-muted transition-colors hover:bg-cloud hover:text-on-surface lg:flex"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global search — desktop */}
        <div className="hidden flex-1 md:block">
          <div className="max-w-md">
            <SearchCommand />
          </div>
        </div>

        {/* Global search — mobile button triggers Ctrl+K listener */}
        <button
          className="flex rounded-md p-2 text-on-surface-muted transition-colors hover:bg-cloud hover:text-on-surface md:hidden"
          aria-label="Buscar"
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
        >
          <Search className="h-5 w-5" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          {tenantLabel && (
            <span className="hidden rounded-full border border-outline bg-cloud px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-on-surface-muted lg:inline">
              {tenantLabel}
            </span>
          )}

          {/* Notification bell */}
          <button
            className="relative rounded-md p-2 text-on-surface-muted transition-colors hover:bg-cloud hover:text-on-surface"
            aria-label={unreadCount > 0 ? `${unreadCount} notificacoes nao lidas` : "Notificacoes"}
            onClick={() => router.push("/app/notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-on-surface-muted transition-colors hover:bg-cloud hover:text-on-surface">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {avatarInitial}
                </div>
                <span className="hidden text-sm font-medium md:inline">{userName || "Usuario"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{userEmail || "Minha Conta"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/app/profile")}>
                <User className="h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Breadcrumb />
    </header>
  );
}
