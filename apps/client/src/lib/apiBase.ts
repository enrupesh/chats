import { isNative, isAndroid } from "./capacitor";

const DEFAULT_PROD_API_BASE = "https://chats-fk6e.onrender.com";

/**
 * Resolve API base URL across web + native Android.
 *
 * - Web/PWA: default to `/api` proxy unless explicitly configured.
 * - Native Android (Capacitor): never use localhost-relative URLs; use
 *   explicit HTTPS backend base (env override first, then production default).
 */
export function getApiBaseUrl(): string {
  const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (envBase) return envBase.replace(/\/+$/, "");

  if (isNative() && isAndroid()) {
    return DEFAULT_PROD_API_BASE;
  }

  return "/api";
}

