import { env } from "../env.js";

let _app: import("firebase-admin/app").App | null = null;
let _initialized = false;

export function isFirebaseConfigured(): boolean {
  return !!(
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY
  );
}

async function getFirebaseApp(): Promise<import("firebase-admin/app").App> {
  if (_app) return _app;
  if (_initialized) throw new Error("Firebase Admin not configured.");

  _initialized = true;

  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  const { initializeApp, cert } = await import("firebase-admin/app");
  _app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID!,
      clientEmail: env.FIREBASE_CLIENT_EMAIL!,
      privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
  return _app;
}

/**
 * Verify a Firebase ID token and return the decoded claims.
 * Throws if the token is invalid or Firebase is not configured.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<{ uid: string; phone_number?: string }> {
  const app = await getFirebaseApp();
  const { getAuth } = await import("firebase-admin/auth");
  const decoded = await getAuth(app).verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    phone_number: decoded.phone_number,
  };
}

/**
 * Send a single FCM push notification to a device token.
 *
 * Returns true if the message was accepted by FCM.
 * Returns false (instead of throwing) for expected non-retryable errors
 * (invalid / unregistered token) so callers can prune stale tokens.
 * Throws for unexpected errors (Firebase misconfigured, network issues).
 */
export async function sendFcmMessage(
  token: string,
  payload: {
    title?: string;
    body?: string;
    data?: Record<string, string>;
  },
): Promise<boolean> {
  const app = await getFirebaseApp();
  const { getMessaging } = await import("firebase-admin/messaging");

  try {
    await getMessaging(app).send({
      token,
      notification: {
        title: payload.title ?? "VeilChat",
        body: payload.body ?? "You have a new notification.",
      },
      data: payload.data ?? {},
      android: {
        priority: "high",
        notification: {
          // Channel must be created on the Android side in MainActivity.
          channelId: "veilchat_messages",
          visibility: "private",
        },
      },
    });
    return true;
  } catch (err: unknown) {
    // FCM error codes that indicate the token is permanently invalid.
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("registration-token-not-registered") ||
      msg.includes("invalid-registration-token") ||
      msg.includes("UNREGISTERED")
    ) {
      return false; // caller should prune this token
    }
    throw err;
  }
}
