import webpush from "web-push";
import type { FastifyBaseLogger } from "fastify";
import { eq, inArray } from "drizzle-orm";
import { env, isDev } from "../env.js";
import { getDb, schema } from "../db/index.js";
import {
  isFirebaseConfigured,
  sendFcmMessage,
} from "./firebase.js";

let configured = false;
let publicKey: string | null = null;

/**
 * Configure web-push with VAPID keys.
 *
 * In production, both keys must be supplied via env vars so they're
 * stable across restarts and instances. In dev, if either is missing
 * we generate an ephemeral pair and log it.
 */
export function initPush(log: FastifyBaseLogger): void {
  let pub = env.VAPID_PUBLIC_KEY;
  let priv = env.VAPID_PRIVATE_KEY;

  if (!pub || !priv) {
    if (!isDev) {
      log.warn(
        "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not configured — Web Push notifications will be disabled.",
      );
      configured = false;
      return;
    }
    const generated = webpush.generateVAPIDKeys();
    pub = generated.publicKey;
    priv = generated.privateKey;
    log.warn(
      `Generated ephemeral VAPID keys (dev only).\n` +
        `  VAPID_PUBLIC_KEY=${pub}\n` +
        `  VAPID_PRIVATE_KEY=${priv}\n` +
        `Add these to apps/server/.env to make push subscriptions survive restarts.`,
    );
  }

  webpush.setVapidDetails(env.VAPID_SUBJECT, pub, priv);
  publicKey = pub;
  configured = true;
}

export function getPublicKey(): string | null {
  return publicKey;
}

export function isPushConfigured(): boolean {
  return configured;
}

export interface VeilPushPayload {
  type: "new_message" | "chat_request";
  title?: string;
  body?: string;
  url?: string;
}

/**
 * Fan out a Web Push (VAPID) notification to every subscription
 * registered for `userId`. Stale subscriptions (404/410) are pruned.
 */
export async function pushToUser(
  userId: string,
  payload: VeilPushPayload,
  log?: FastifyBaseLogger,
): Promise<void> {
  if (!configured) return;
  const db = getDb();
  const subs = await db
    .select()
    .from(schema.pushSubscriptions)
    .where(eq(schema.pushSubscriptions.userId, userId));
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          body,
          { TTL: 60, urgency: "high" },
        );
      } catch (err: unknown) {
        const statusCode =
          (err as { statusCode?: number }).statusCode ?? 0;
        if (statusCode === 404 || statusCode === 410) {
          dead.push(s.id);
        } else if (log) {
          log.warn(
            { err, endpoint: s.endpoint.slice(0, 40) },
            "web-push send failed",
          );
        }
      }
    }),
  );

  if (dead.length > 0) {
    await db
      .delete(schema.pushSubscriptions)
      .where(inArray(schema.pushSubscriptions.id, dead));
  }
}

/**
 * Fan out an FCM push notification to every device token registered
 * for `userId` (Android Capacitor app users).
 *
 * Stale / invalid tokens are pruned automatically.
 * No-ops gracefully when Firebase is not configured.
 */
export async function fcmPushToUser(
  userId: string,
  payload: VeilPushPayload,
  log?: FastifyBaseLogger,
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const db = getDb();
  const rows = await db
    .select({ id: schema.fcmTokens.id, token: schema.fcmTokens.token })
    .from(schema.fcmTokens)
    .where(eq(schema.fcmTokens.userId, userId));

  if (rows.length === 0) return;

  const dead: string[] = [];

  await Promise.all(
    rows.map(async (r) => {
      try {
        const ok = await sendFcmMessage(r.token, {
          title: payload.title ?? "VeilChat",
          body: payload.body ?? "You have a new notification.",
          data: {
            type: payload.type,
            url: payload.url ?? "",
          },
        });
        if (!ok) {
          // Token is permanently invalid — prune it.
          dead.push(r.id);
        }
      } catch (err) {
        if (log) {
          log.warn({ err, tokenPrefix: r.token.slice(0, 20) }, "fcm send failed");
        }
      }
    }),
  );

  if (dead.length > 0) {
    await db
      .delete(schema.fcmTokens)
      .where(inArray(schema.fcmTokens.id, dead));
  }
}

/**
 * Deliver a push notification to a user on ALL registered endpoints:
 * VAPID Web Push (browser / PWA) AND FCM (Android Capacitor app).
 *
 * This is the single call-site you should use in routers instead of
 * calling pushToUser directly, so both platforms receive notifications.
 */
export async function notifyUser(
  userId: string,
  payload: VeilPushPayload,
  log?: FastifyBaseLogger,
): Promise<void> {
  await Promise.all([
    pushToUser(userId, payload, log),
    fcmPushToUser(userId, payload, log),
  ]);
}
