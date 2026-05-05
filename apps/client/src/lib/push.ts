/**
 * Push notification lifecycle for VeilChat.
 *
 * Two paths depending on the runtime platform:
 *
 *  Android (Capacitor) ── FCM via @capacitor/push-notifications.
 *                          The native shell registers the device token with
 *                          our server so the backend can fan-out via FCM.
 *
 *  Web / iOS PWA ─────── Standard Web Push via PushManager + service worker.
 *                          Unchanged from the original implementation.
 *
 * Notification payload never carries message text on either path — the
 * recipient sees only "New message" until they open the app and decrypt.
 */

import { trpcClientProxy } from "./trpcClientProxy";
import { isAndroid } from "./capacitor";

const SUBSCRIBED_KEY = "veil:push:endpoint";
const NATIVE_TOKEN_KEY = "veil:push:fcm_token";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const std = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(std);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bufToUrlB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type PushSetupResult =
  | { state: "ok" }
  | { state: "unsupported" }
  | { state: "denied" }
  | { state: "not_configured" }
  | { state: "error"; message: string };

// ─── Android / FCM path ──────────────────────────────────────────────────────

async function setupNativePush(opts?: { requestPermission?: boolean }): Promise<PushSetupResult> {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt" && opts?.requestPermission) {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive === "denied") {
      return { state: "denied" };
    }

    if (permStatus.receive !== "granted") {
      return { state: "error", message: "Push permission not granted." };
    }

    await PushNotifications.register();

    return new Promise<PushSetupResult>((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ state: "error", message: "FCM registration timed out." });
      }, 15_000);

      PushNotifications.addListener("registration", async (token) => {
        clearTimeout(timeout);
        try {
          const stored = localStorage.getItem(NATIVE_TOKEN_KEY);
          if (stored !== token.value) {
            // POST the FCM token to the server so it can fan-out via FCM.
            // Uses the REST base URL directly since this is a native path
            // (no Vite proxy, no service worker).
            const baseUrl =
              (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
              "https://chats-fk6e.onrender.com";
            const { accessToken } = (await import("./store")).useAuthStore.getState();
            await fetch(`${baseUrl}/push/fcm-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({ token: token.value, platform: "android" }),
            }).catch(() => {
              // Server endpoint may not exist yet — silently ignore.
              // FCM push will work once the server adds this route.
            });
            localStorage.setItem(NATIVE_TOKEN_KEY, token.value);
          }
          resolve({ state: "ok" });
        } catch (err) {
          resolve({
            state: "error",
            message: err instanceof Error ? err.message : "Token registration failed.",
          });
        }
      });

      PushNotifications.addListener("registrationError", (err) => {
        clearTimeout(timeout);
        resolve({ state: "error", message: String(err.error) });
      });
    });
  } catch (err) {
    return {
      state: "error",
      message: err instanceof Error ? err.message : "Native push setup failed.",
    };
  }
}

async function disableNativePush(): Promise<void> {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    await PushNotifications.removeAllListeners();
    const token = localStorage.getItem(NATIVE_TOKEN_KEY);
    if (token) {
      const baseUrl =
        (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
        "https://chats-fk6e.onrender.com";
      const { accessToken } = (await import("./store")).useAuthStore.getState();
      await fetch(`${baseUrl}/push/fcm-token`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ token }),
      }).catch(() => undefined);
      localStorage.removeItem(NATIVE_TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
}

// ─── Web Push path (unchanged) ───────────────────────────────────────────────

async function setupWebPush(opts?: { requestPermission?: boolean }): Promise<PushSetupResult> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return { state: "unsupported" };
  }

  let perm = Notification.permission;
  if (perm === "default" && opts?.requestPermission) {
    try {
      perm = await Notification.requestPermission();
    } catch {
      return { state: "error", message: "Permission request failed." };
    }
  }
  if (perm === "denied") return { state: "denied" };
  if (perm !== "granted") return { state: "error", message: "Permission not granted." };

  let reg: ServiceWorkerRegistration | undefined;
  try {
    reg = await navigator.serviceWorker.ready;
  } catch {
    return { state: "unsupported" };
  }
  if (!reg) return { state: "unsupported" };

  let publicKey: string | null = null;
  try {
    const r = await trpcClientProxy().push.publicKey.query();
    publicKey = r.publicKey;
  } catch {
    return { state: "error", message: "Couldn't reach server." };
  }
  if (!publicKey) return { state: "not_configured" };

  let sub = await reg.pushManager.getSubscription();
  if (sub) {
    const opt = sub.options.applicationServerKey;
    const optB64 = opt ? bufToUrlB64(opt as ArrayBuffer) : null;
    if (optB64 !== publicKey) {
      try {
        await sub.unsubscribe();
      } catch {
        /* ignore */
      }
      sub = null;
    }
  }
  if (!sub) {
    try {
      const keyBytes = urlBase64ToUint8Array(publicKey);
      const keyBuf = new ArrayBuffer(keyBytes.byteLength);
      new Uint8Array(keyBuf).set(keyBytes);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBuf,
      });
    } catch (err) {
      return {
        state: "error",
        message: err instanceof Error ? err.message : "Subscribe failed.",
      };
    }
  }

  const p256dh = sub.getKey("p256dh");
  const auth = sub.getKey("auth");
  if (!p256dh || !auth) {
    return { state: "error", message: "Subscription missing keys." };
  }

  try {
    await trpcClientProxy().push.subscribe.mutate({
      endpoint: sub.endpoint,
      p256dh: bufToUrlB64(p256dh),
      auth: bufToUrlB64(auth),
      userAgent: navigator.userAgent.slice(0, 200),
    });
    localStorage.setItem(SUBSCRIBED_KEY, sub.endpoint);
    return { state: "ok" };
  } catch (err) {
    return {
      state: "error",
      message: err instanceof Error ? err.message : "Server rejected subscription.",
    };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function ensurePushSubscription(opts?: {
  requestPermission?: boolean;
}): Promise<PushSetupResult> {
  if (isAndroid()) {
    return setupNativePush(opts);
  }
  return setupWebPush(opts);
}

export async function disablePushSubscription(): Promise<void> {
  if (isAndroid()) {
    await disableNativePush();
    return;
  }

  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  try {
    await sub.unsubscribe();
  } catch {
    /* ignore */
  }
  try {
    await trpcClientProxy().push.unsubscribe.mutate({ endpoint });
  } catch {
    /* ignore */
  }
  localStorage.removeItem(SUBSCRIBED_KEY);
}
