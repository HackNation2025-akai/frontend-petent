const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getAuthToken = () => authToken;

export const getApiBaseUrl = () => API_BASE;

const DEFAULT_TIMEOUT_MS = 20000;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type ApiInit = RequestInit & { skipAuth?: boolean; timeoutMs?: number };

export async function apiFetch(path: string, init: ApiInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!init.skipAuth && authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });
    if (!response.ok) {
      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
      throw new ApiError(
        (data as { detail?: string })?.detail || `Request failed with status ${response.status}`,
        response.status,
        data,
      );
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export function swrFetcher(key: string | string[]) {
  const url = Array.isArray(key) ? key[0] : key;
  return apiFetch(url).then((res) => res.json());
}

export function withQuery(path: string, params?: Record<string, string | number | undefined>) {
  if (!params) return path;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    search.set(k, String(v));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

