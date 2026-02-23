"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

type TokenPayload = {
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
};

const decodeJwtPayload = (token: string): TokenPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = window.atob(`${normalized}${padding}`);
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
};

const resolveUserName = (payload: TokenPayload | null) => {
  const fallbackFromEmail = payload?.email?.split("@")[0];
  return payload?.name ?? payload?.fullName ?? payload?.username ?? fallbackFromEmail ?? null;
};

export function useAuth() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedToken = window.localStorage.getItem("accessToken");
    const storedTenantId = window.localStorage.getItem("tenantId");
    const payload = storedToken ? decodeJwtPayload(storedToken) : null;
    setToken(storedToken);
    setTenantId(storedTenantId);
    setUserName(resolveUserName(payload));
    setUserEmail(payload?.email ?? null);
    setUserRole(payload?.role ?? null);
    setReady(true);
  }, []);

  const login = (accessToken: string, refreshToken: string, tenantId: string) => {
    window.localStorage.setItem("accessToken", accessToken);
    window.localStorage.setItem("refreshToken", refreshToken);
    window.localStorage.setItem("tenantId", tenantId);
    const payload = decodeJwtPayload(accessToken);
    setToken(accessToken);
    setTenantId(tenantId);
    setUserName(resolveUserName(payload));
    setUserEmail(payload?.email ?? null);
    setUserRole(payload?.role ?? null);
    router.push("/app/dashboard");
  };

  const logout = () => {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("tenantId");
    setToken(null);
    setTenantId(null);
    setUserName(null);
    setUserEmail(null);
    setUserRole(null);
    router.push("/login");
  };

  return { token, ready, login, logout, tenantId, userName, userEmail, userRole };
}

export function useAuthGuard() {
  const { token, ready, userRole } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (ready && !token) {
      router.push("/login");
    }
  }, [ready, token, router]);

  return { ready, token, userRole };
}
