"use client";

import { Menu, Bell, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { useAuth } from "@/lib/auth";

import { SearchCommand } from "@/components/layout/search-command";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const { logout, userName, userEmail, tenantId } = useAuth();
  const router = useRouter();
  const avatarInitial = (userName || userEmail || "A").charAt(0).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-outline bg-surface-elevated px-4">
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

      {/* Global search */}
      <div className="hidden flex-1 md:block">
        <div className="max-w-md">
          <SearchCommand />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {tenantId && (
          <span className="hidden rounded-full border border-outline bg-cloud px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-on-surface-muted lg:inline">
            {tenantId}
          </span>
        )}

        {/* Notification bell */}
        <button
          className="relative rounded-md p-2 text-on-surface-muted transition-colors hover:bg-cloud hover:text-on-surface"
          aria-label="Notificacoes"
          onClick={() => router.push("/app/notifications")}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
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
    </header>
  );
}
