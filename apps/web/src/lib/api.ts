import { appLogger } from "@/lib/logger";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const fallbackFromWindow =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:4000`
    : "http://localhost:4000";
export const API_URL =
  rawApiUrl && rawApiUrl !== "undefined" && rawApiUrl.trim().length > 0
    ? rawApiUrl
    : fallbackFromWindow;

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const storage = typeof window !== "undefined" ? window.localStorage : null;
  const accessToken = storage?.getItem("accessToken") ?? null;
  const tenantId = storage?.getItem("tenantId") ?? null;

  const buildHeaders = (token?: string) => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
    ...(options.headers ?? {}),
  });

  const doFetch = (token?: string) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: buildHeaders(token ?? accessToken ?? undefined),
    });

  let res = await doFetch();

  if (res.status === 401 && storage) {
    const refreshToken = storage.getItem("refreshToken");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const refreshPayload = (await refreshRes.json()) as {
          data?: { accessToken?: string; refreshToken?: string };
        };
        const newAccessToken = refreshPayload.data?.accessToken;
        const newRefreshToken = refreshPayload.data?.refreshToken;
        if (newAccessToken) {
          storage.setItem("accessToken", newAccessToken);
        }
        if (newRefreshToken) {
          storage.setItem("refreshToken", newRefreshToken);
        }
        if (newAccessToken) {
          res = await doFetch(newAccessToken);
        }
      }
    }
  }

  if (res.status === 401) {
    storage?.removeItem("accessToken");
    storage?.removeItem("refreshToken");
    storage?.removeItem("tenantId");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Nao autorizado");
  }

  if (!res.ok) {
    let detail = "Erro ao carregar dados";
    let correlationId: string | null = null;
    try {
      const payload = (await res.clone().json()) as {
        detail?: string;
        title?: string;
        correlationId?: string;
      };
      detail = payload.detail ?? payload.title ?? detail;
      correlationId = payload.correlationId ?? null;
    } catch {
      /* ignore parse errors */
    }
    appLogger.error("api", "request_failed", {
      path,
      method: options.method ?? "GET",
      status: res.status,
      correlationId,
      detail,
    });
    throw new Error(`${detail} (${res.status})`);
  }
  const payload = (await res.json()) as { data: T };
  return payload.data;
}
