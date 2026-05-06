import { isNative, isAndroid } from "./capacitor";

const DEFAULT_PUBLIC_WEB_ORIGIN = "https://www.veilchat.me";

/**
 * Returns the externally shareable web origin for links that must work
 * outside the app (invites, downloads, etc).
 *
 * In Capacitor Android, `window.location.origin` is `https://localhost`,
 * which is not shareable. For native Android we force the public domain.
 */
export function getPublicWebOrigin(): string {
  const fromEnv = (import.meta.env.VITE_PUBLIC_WEB_ORIGIN as string | undefined)?.trim();
  const publicOrigin = fromEnv && fromEnv.length > 0
    ? fromEnv.replace(/\/+$/, "")
    : DEFAULT_PUBLIC_WEB_ORIGIN;

  if (isNative() && isAndroid()) {
    return publicOrigin;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return publicOrigin;
}

export function toPublicAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getPublicWebOrigin()}${normalizedPath}`;
}

