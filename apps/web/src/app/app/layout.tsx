"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/auth";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "sonner";
import { isAppRouteAllowed } from "@/lib/rbac";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, token, userRole } = useAuthGuard();
  const pathname = usePathname();
  const router = useRouter();

  const allowed = isAppRouteAllowed(pathname ?? "/app", userRole);

  useEffect(() => {
    if (!ready || !token) return;
    if (!allowed) {
      router.replace("/app/dashboard");
    }
  }, [allowed, ready, router, token]);

  // Not yet hydrated — render nothing to avoid layout flash
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-cloud text-on-surface">
        <div className="rounded-md border border-outline bg-surface-elevated px-4 py-3 text-sm text-on-surface-muted">
          Carregando sessao institucional...
        </div>
      </div>
    );
  }

  // No session — hard block, redirect handled by useAuthGuard
  if (!token) {
    return null;
  }

  // Authenticated but not allowed on this route
  if (!allowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-cloud text-on-surface">
        <div className="rounded-md border border-outline bg-surface-elevated px-4 py-3 text-sm text-on-surface-muted">
          Acesso nao autorizado para este modulo.
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] bg-cloud text-on-surface">
        <Sidebar />
        <MobileSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-3 pb-4 pt-3 md:px-0">{children}</main>
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  );
}
