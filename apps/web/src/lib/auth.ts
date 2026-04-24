"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

// NOTE: tokens are stored in sessionStorage (cleared on browser close).
// Full migration to HttpOnly cookies requires API changes to POST /auth/login
// returning Set-Cookie headers instead of JSON tokens.

type TokenPayload = {
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
  department?: string;
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

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
};

export function useAuth() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [department, setDepartment] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storage = getStorage();
    const storedToken = storage?.getItem("accessToken") ?? null;
    const storedTenantId = storage?.getItem("tenantId") ?? null;
    const payload = storedToken ? decodeJwtPayload(storedToken) : null;
    setToken(storedToken);
    setTenantId(storedTenantId);
    setUserName(resolveUserName(payload));
    setUserEmail(payload?.email ?? null);
    setUserRole(payload?.role ?? null);
    setDepartment(payload?.department ?? null);
    setReady(true);
  }, []);

  React.useEffect(() => {
    const storage = getStorage();
    if (!storage || ready) return;
    const storedToken = storage.getItem("accessToken") ?? null;
    const storedTenantId = storage.getItem("tenantId") ?? null;
    const payload = storedToken ? decodeJwtPayload(storedToken) : null;
    setToken(storedToken);
    setTenantId(storedTenantId);
    setUserName(resolveUserName(payload));
    setUserEmail(payload?.email ?? null);
    setUserRole(payload?.role ?? null);
    setDepartment(payload?.department ?? null);
    setReady(true);
  }, [ready]);

  const login = (accessToken: string, refreshToken: string, tenantId: string, nextPath = "/app/dashboard") => {
    const storage = getStorage();
    storage?.setItem("accessToken", accessToken);
    storage?.setItem("refreshToken", refreshToken);
    storage?.setItem("tenantId", tenantId);
    // keep lastTenantSlug in localStorage for pre-filling the login form
    window.localStorage.setItem("lastTenantSlug", window.localStorage.getItem("lastTenantSlug") ?? "");
    const payload = decodeJwtPayload(accessToken);
    setToken(accessToken);
    setTenantId(tenantId);
    setUserName(resolveUserName(payload));
    setUserEmail(payload?.email ?? null);
    setUserRole(payload?.role ?? null);
    setDepartment(payload?.department ?? null);
    router.push(nextPath);
  };

  const logout = () => {
    const storage = getStorage();
    storage?.removeItem("accessToken");
    storage?.removeItem("refreshToken");
    storage?.removeItem("tenantId");
    setToken(null);
    setTenantId(null);
    setUserName(null);
    setUserEmail(null);
    setUserRole(null);
    setDepartment(null);
    router.push("/login");
  };

  return { token, ready, login, logout, tenantId, userName, userEmail, userRole, department };
}

export function useAuthGuard() {
  const { token, ready, userRole } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (ready && !token) {
      router.replace("/login");
    }
  }, [ready, token, router]);

  return { ready, token, userRole };
}
