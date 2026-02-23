"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { getNavGroupsByRole, type NavItem } from "./nav-config";

function NavLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      data-testid={`nav-link-${item.href.replace(/\//g, "-").replace(/^-+/, "") || "root"}`}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-fast ease-standard",
        collapsed ? "justify-center" : "",
        active
          ? "bg-primary/10 text-primary"
          : "text-on-surface-muted hover:bg-cloud hover:text-on-surface"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { userRole } = useAuth();
  const navGroups = getNavGroupsByRole(userRole);

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
      {navGroups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? "mt-4" : ""}>
          {group.title && !collapsed && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-muted">
              {group.title}
            </p>
          )}
          {group.title && collapsed && (
            <div className="mx-auto my-2 h-px w-6 bg-outline" />
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 px-5 py-5", collapsed && "justify-center px-0")}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
        F
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-on-surface">FlyDea</p>
          <p className="truncate text-[11px] text-on-surface-muted">GeoInteligencia Municipal</p>
        </div>
      )}
    </div>
  );
}

function SidebarProfile({ collapsed }: { collapsed: boolean }) {
  const { userName, userEmail, tenantId, logout } = useAuth();
  const initial = (userName || userEmail || "A").charAt(0).toUpperCase();

  return (
    <div className={cn("mx-3 mb-3 mt-3 rounded-md border border-outline bg-cloud/60 p-3", collapsed && "p-2")}>
      <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {initial}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-on-surface">{userName || "Usuario"}</p>
            <p className="truncate text-[11px] text-on-surface-muted">{tenantId ? `Tenant: ${tenantId}` : "Tenant nao definido"}</p>
          </div>
        )}
      </div>
      {!collapsed && userEmail && <p className="mt-2 truncate text-[11px] text-on-surface-muted">{userEmail}</p>}
      <button
        onClick={logout}
        data-testid="sidebar-logout"
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11px] text-on-surface-muted transition-colors hover:bg-cloud hover:text-on-surface",
          collapsed && "mt-2 w-full justify-center px-0"
        )}
      >
        <LogOut className="h-3.5 w-3.5" />
        {!collapsed && <span>Sair</span>}
      </button>
    </div>
  );
}

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden h-screen flex-col border-r border-outline bg-surface-elevated transition-[width] duration-normal ease-standard lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarBrand collapsed={collapsed} />
        <div className="mx-3 h-px bg-outline" />
        <SidebarNav collapsed={collapsed} />
        <div className="mx-3 h-px bg-outline" />
        <SidebarProfile collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center gap-2 px-5 py-4 text-on-surface-muted transition-colors hover:text-on-surface"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-normal",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="text-xs font-medium">Recolher</span>}
        </button>
      </aside>
    </TooltipProvider>
  );
}

export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <TooltipProvider>
          <SidebarBrand collapsed={false} />
          <div className="mx-3 h-px bg-outline" />
          <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
          <div className="mx-3 h-px bg-outline" />
          <SidebarProfile collapsed={false} />
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
}
