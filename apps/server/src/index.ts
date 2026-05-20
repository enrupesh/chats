import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import { env, isDev, missingAuthConfig } from "./env.js";
import type { HealthResponse } from "@veil/shared";
import { appRouter, type AppRouter } from "./trpc/routers/index.js";
import { createContext } from "./trpc/context.js";
import { registerWebSocketRoutes } from "./lib/wsServer.js";
import { initPush } from "./lib/push.js";
import { verifyAccessToken } from "./lib/jwt.js";
import { getDb, awaitDbBootstrap, schema } from "./db/index.js";
import { eq, and } from "drizzle-orm";
import { startMediaSweeper } from "./lib/mediaSweeper.js";
import { startMessageSweeper } from "./lib/messageSweeper.js";
import { startScheduledSweeper } from "./lib/scheduledSweeper.js";
import { ensureCorsPolicy } from "./lib/r2.js";
import { registerMediaUploadRoute, registerMediaDownloadRoute } from "./lib/mediaUploadRoute.js";

const app = Fastify({
  trustProxy: true,
  // Encrypted media now uploads directly to R2 via presigned URLs, so the
  // server only ever sees small JSON envelopes again.
  bodyLimit: 1 * 1024 * 1024,
  // tRPC batches GET requests by joining procedure names with commas in
  // the URL path (e.g. `/trpc/a.b,c.d,e.f`). Fastify's default
  // `maxParamLength` of 100 rejects long batches with a 404 before the
  // tRPC plugin ever sees them. Bump it well above any realistic batch.
  maxParamLength: 5000,
  logger: isDev
    ? {
        level: "info",
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss" },
        },
        redact: {
          paths: ["req.headers.authorization", "req.headers.cookie"],
          remove: true,
        },
      }
    : {
        level: "info",
        redact: {
          paths: ["req.headers.authorization", "req.headers.cookie"],
          remove: true,
        },
      },
});

/**
 * Match an origin against an allow-list entry.
 * Supports exact matches and `*` as a hostname wildcard, e.g.
 *   https://*.vercel.app          → any Vercel subdomain over https
 *   https://chats-*.vercel.app    → any chats-* preview on Vercel
 *   *                              → allow any origin (use with care)
 */
function originMatches(origin: string, pattern: string): boolean {
  if (pattern === "*") return true;
  if (pattern === origin) return true;
  if (!pattern.includes("*")) return false;
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`).test(origin);
}

/**
 * Built-in trusted client-hosting hostname patterns. These are always allowed
 * (in addition to anything in CORS_ORIGIN) so the API "just works" when the
 * client is deployed to a common static host without requiring per-deploy env
 * configuration. Set CORS_STRICT=true to disable these defaults.
 */
const TRUSTED_CLIENT_HOST_PATTERNS = [
  /\.vercel\.app$/,        // Vercel production + previews
  /\.netlify\.app$/,       // Netlify production + previews
  /\.pages\.dev$/,         // Cloudflare Pages
  /\.onrender\.com$/,      // Render static sites
  /\.replit\.app$/,        // Replit deployments
  /\.replit\.dev$/,        // Replit dev
  /\.repl\.co$/,           // Replit (legacy)
  /^veilchat\.me$/,        // Production custom domain (apex)
  /\.veilchat\.me$/,       // Production custom domain (any subdomain, e.g. www)
];

const corsStrict = process.env.CORS_STRICT === "true";

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowList = env.CORS_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowList.some((pattern) => originMatches(origin, pattern))) {
      return cb(null, true);
    }
    let host = "";
    try {
      host = new URL(origin).hostname;
    } catch {
      // origin wasn't a valid URL — fall through to rejection
    }
    if (host) {
      if (isDev && (host === "localhost" || host === "127.0.0.1")) {
        return cb(null, true);
      }
      if (!corsStrict && TRUSTED_CLIENT_HOST_PATTERNS.some((re) => re.test(host))) {
        return cb(null, true);
      }
    }
    app.log.warn({ origin, allowList, corsStrict }, "CORS origin rejected");
    cb(new Error(`Origin not allowed: ${origin}`), false);
  },
  credentials: true,
});

await app.register(cookie);

await registerWebSocketRoutes(app);

// Binary media proxies: browser → our server → R2 (eliminates CORS entirely).
// Registered before tRPC so these routes take priority.
await registerMediaUploadRoute(app);
await registerMediaDownloadRoute(app);

app.get("/health", async (): Promise<HealthResponse> => {
  return {
    status: "ok",
    service: "veil-server",
    version: "0.0.0",
    timestamp: new Date().toISOString(),
  };
});

// ── Presence tracking ─────────────────────────────────────────────────────────
// Each browser tab POSTs /ping every 30 s with a stable session ID.
// Active = seen within the last 2 minutes.
const presenceSessions = new Map<string, number>(); // sid → last-seen ms
const PRESENCE_TTL = 120_000;

setInterval(() => {
  const cutoff = Date.now() - PRESENCE_TTL;
  for (const [sid, ts] of presenceSessions) {
    if (ts < cutoff) presenceSessions.delete(sid);
  }
}, 30_000).unref();

app.post<{ Body: { sid?: string } }>("/ping", async (req, reply) => {
  const sid = (req.body as Record<string, unknown>)?.sid;
  if (sid && typeof sid === "string" && sid.length <= 128) {
    presenceSessions.set(sid, Date.now());
  }
  return reply.status(204).send();
});

app.get("/active-users", async () => {
  const cutoff = Date.now() - PRESENCE_TTL;
  let count = 0;
  for (const ts of presenceSessions.values()) {
    if (ts >= cutoff) count++;
  }
  return { count };
});

// ── Admin: registered users ───────────────────────────────────────────────────
// Protected by a static token (SHA-256 of admin credentials, never plain-text).
const ADMIN_TOKEN = "2ada6ca17dcc4f828a68c94eb629bc8d7cf46ea7e22b084d08cd58ea35690869";

app.get("/admin/users", async (req, reply) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  const db = getDb();
  const rows = await db
    .select({
      id:          schema.users.id,
      username:    schema.users.username,
      displayName: schema.users.displayName,
      randomId:    schema.users.randomId,
      accountType: schema.users.accountType,
      createdAt:   schema.users.createdAt,
    })
    .from(schema.users)
    .orderBy(schema.users.createdAt);
  return { total: rows.length, users: rows };
});

/**
 * POST /push/fcm-token
 * Register an FCM device token for the authenticated user (Android app).
 * Body: { token: string, platform?: string }
 */
app.post<{ Body: { token: string; platform?: string } }>(
  "/push/fcm-token",
  async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    let userId: string;
    try {
      const claims = await verifyAccessToken(auth.slice(7).trim());
      userId = claims.sub;
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }

    const { token, platform = "android" } = req.body ?? {};
    if (!token || typeof token !== "string") {
      return reply.status(400).send({ error: "token is required" });
    }

    const db = getDb();
    await db
      .insert(schema.fcmTokens)
      .values({ userId, token, platform })
      .onConflictDoUpdate({
        target: schema.fcmTokens.token,
        set: { userId, platform, updatedAt: new Date() },
      });

    return reply.send({ ok: true });
  },
);

/**
 * DELETE /push/fcm-token
 * Unregister an FCM device token for the authenticated user.
 * Body: { token: string }
 */
app.delete<{ Body: { token: string } }>(
  "/push/fcm-token",
  async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    let userId: string;
    try {
      const claims = await verifyAccessToken(auth.slice(7).trim());
      userId = claims.sub;
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }

    const { token } = req.body ?? {};
    if (!token || typeof token !== "string") {
      return reply.status(400).send({ error: "token is required" });
    }

    const db = getDb();
    await db
      .delete(schema.fcmTokens)
      .where(
        and(
          eq(schema.fcmTokens.token, token),
          eq(schema.fcmTokens.userId, userId),
        ),
      );

    return reply.send({ ok: true });
  },
);

await app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      const cause = error.cause as Record<string, unknown> | undefined;
      app.log.error(
        {
          path,
          code: error.code,
          msg: error.message,
          cause: cause
            ? {
                pgCode: cause["code"],
                pgMsg: cause["message"],
                pgDetail: cause["detail"],
                pgConstraint: cause["constraint"],
              }
            : undefined,
        },
        "tRPC error",
      );
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

const missing = missingAuthConfig();
if (missing.length > 0) {
  app.log.warn(
    `Auth endpoints disabled until you set: ${missing.join(", ")}. ` +
      `See apps/server/.env.example.`,
  );
}
if (!env.RESEND_API_KEY && isDev) {
  app.log.warn(
    "RESEND_API_KEY not set — OTP codes will be logged to this console (dev only).",
  );
}

// Resolve the DB hostname to IPv4 before any query fires.
// Render's infrastructure cannot route IPv6; Supabase's direct-connection
// hostname resolves to an IPv6 address which causes ENETUNREACH on every tick.
await awaitDbBootstrap();

initPush(app.log);
startMediaSweeper(app.log);
startMessageSweeper(app.log);
startScheduledSweeper(app.log);

// Apply CORS policy to the R2 bucket so browsers can PUT directly via
// presigned URLs. Idempotent — safe to call on every cold start.
ensureCorsPolicy(app.log).catch(() => undefined);

try {
  await app.listen({ host: env.HOST, port: env.PORT });
  app.log.info(`veil-server listening on http://${env.HOST}:${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
