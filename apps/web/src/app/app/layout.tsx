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

  const allowed = isAppRouteAllowed(pathname, userRole);

  useEffect(() => {
    if (!ready || !token) return;
    if (!allowed) {
      router.replace("/app/dashboard");
    }
  }, [allowed, ready, router, token]);

  if (!ready || (token && !allowed)) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-cloud text-on-surface">
        <Sidebar />
        <MobileSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  );
}
