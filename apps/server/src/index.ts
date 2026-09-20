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
import { getDb, awaitDbBootstrap, ensureVeilChatTeam, schema } from "./db/index.js";
import { eq, and, desc, gte, or } from "drizzle-orm";
import { createHmac } from "node:crypto";
import { startMediaSweeper } from "./lib/mediaSweeper.js";
import { startMessageSweeper } from "./lib/messageSweeper.js";
import { startScheduledSweeper } from "./lib/scheduledSweeper.js";
import { publish } from "./lib/wsHub.js";
import {
  deviceInfo,
  lookupCity,
} from "./lib/loginRisk.js";
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

// ── Detailed health (used by status page — no auth required, no sensitive data) ─
app.get("/health/detailed", {
  config: {},
}, async (_req, reply) => {
  let dbStatus: "ok" | "error" = "error";
  let dbLatency: number | null = null;
  try {
    const db = getDb();
    const t = Date.now();
    await db.select({ id: schema.users.id }).from(schema.users).limit(1);
    dbLatency = Date.now() - t;
    dbStatus = "ok";
  } catch {
    dbStatus = "error";
  }
  await reply.header("Access-Control-Allow-Origin", "*").send({
    api: "ok",
    database: dbStatus,
    databaseLatencyMs: dbLatency,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Presence tracking ─────────────────────────────────────────────────────────
// Each browser tab POSTs /ping every 30 s with a stable session ID.
// Active = seen within the last 2 minutes.
const presenceSessions = new Map<string, number>(); // sid → last-seen ms
const PRESENCE_TTL = 120_000;
const ANALYTICS_VISITOR_SECRET =
  env.IDENTIFIER_HMAC_PEPPER ?? env.JWT_SECRET ?? "veil-site-analytics";

function visitorHash(sid: string): string {
  return createHmac("sha256", ANALYTICS_VISITOR_SECRET)
    .update(sid)
    .digest("hex");
}

function firstHeader(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

function analyticsLanguage(
  value: string | string[] | undefined,
): string | null {
  const raw = firstHeader(value);
  const language = raw?.split(",")[0]?.split(";")[0]?.trim().toLowerCase();
  return language && /^[a-z]{2,3}(?:-[a-z]{2})?$/.test(language)
    ? language
    : null;
}

function analyticsPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  // Keep the route useful while avoiding query strings and arbitrary payloads.
  const path = value.split("?")[0]!.slice(0, 120);
  return path || "/";
}

function analyticsScreenClass(value: unknown): string | null {
  return value === "mobile" || value === "tablet" || value === "desktop"
    ? value
    : null;
}

function analyticsReferrer(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "Direct";
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return hostname.slice(0, 120) || "Direct";
  } catch {
    return "Direct";
  }
}

function analyticsDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

setInterval(() => {
  const cutoff = Date.now() - PRESENCE_TTL;
  for (const [sid, ts] of presenceSessions) {
    if (ts < cutoff) presenceSessions.delete(sid);
  }
}, 30_000).unref();

app.post<{
  Body: { sid?: string; path?: string; referrer?: string; screenClass?: string };
}>("/ping", async (req, reply) => {
  const sid = (req.body as Record<string, unknown>)?.sid;
  if (sid && typeof sid === "string" && sid.length <= 128) {
    presenceSessions.set(sid, Date.now());

    // Presence remains in memory, while this separate best-effort path stores
    // one privacy-preserving visitor row and one visitor/day row. Analytics
    // must never make the beacon fail or affect the rest of the application.
    try {
      const db = getDb();
      const now = new Date();
      const hash = visitorHash(sid);
      const ua = firstHeader(req.headers["user-agent"]);
      const device = deviceInfo(ua);
      const geo = await lookupCity(req.ip);
      const country = geo.country;
      const city = geo.city;
      const language = analyticsLanguage(req.headers["accept-language"]);
      const referrerDomain = analyticsReferrer(
        (req.body as Record<string, unknown>)?.referrer,
      );
      const screenClass = analyticsScreenClass(
        (req.body as Record<string, unknown>)?.screenClass,
      );
      const path = analyticsPath((req.body as Record<string, unknown>)?.path);

      await db
        .insert(schema.siteVisitors)
        .values({
          visitorHash: hash,
          firstSeenAt: now,
          lastSeenAt: now,
          country,
          city,
          deviceCategory: device.category,
          browser: device.browser,
          operatingSystem: device.operatingSystem,
          language,
          referrerDomain,
          screenClass,
          lastPath: path,
        })
        .onConflictDoUpdate({
          target: schema.siteVisitors.visitorHash,
          set: {
            lastSeenAt: now,
            country,
            city,
            deviceCategory: device.category,
            browser: device.browser,
            operatingSystem: device.operatingSystem,
            language,
            referrerDomain,
            screenClass,
            lastPath: path,
          },
        });

      await db
        .insert(schema.siteVisitorDays)
        .values({
          visitorHash: hash,
          day: analyticsDay(now),
          firstSeenAt: now,
          lastSeenAt: now,
          country,
          deviceCategory: device.category,
          browser: device.browser,
          operatingSystem: device.operatingSystem,
          language,
          referrerDomain,
          screenClass,
        })
        .onConflictDoUpdate({
          target: [
            schema.siteVisitorDays.visitorHash,
            schema.siteVisitorDays.day,
          ],
          set: { lastSeenAt: now },
        });
    } catch (error) {
      app.log.debug({ err: error }, "visitor analytics beacon skipped");
    }
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
      surveyCountry: schema.users.onboardingCountry,
      surveyDevice: schema.users.onboardingDevice,
      surveySource: schema.users.onboardingSource,
      surveyGoal: schema.users.onboardingGoal,
      surveyCompletedAt: schema.users.onboardingSurveyCompletedAt,
    })
    .from(schema.users)
    .orderBy(schema.users.createdAt);
  const sessionRows = await db
    .select({
      userId: schema.sessions.userId,
      country: schema.sessions.lastCountry,
      city: schema.sessions.lastCity,
      device: schema.sessions.deviceLabel,
      createdAt: schema.sessions.createdAt,
      lastUsedAt: schema.sessions.lastUsedAt,
      expiresAt: schema.sessions.expiresAt,
    })
    .from(schema.sessions)
    .orderBy(desc(schema.sessions.lastUsedAt));
  const visitorRows = await db
    .select({
      lastSeenAt: schema.siteVisitors.lastSeenAt,
      firstSeenAt: schema.siteVisitors.firstSeenAt,
      country: schema.siteVisitors.country,
      city: schema.siteVisitors.city,
      deviceCategory: schema.siteVisitors.deviceCategory,
      browser: schema.siteVisitors.browser,
      operatingSystem: schema.siteVisitors.operatingSystem,
      language: schema.siteVisitors.language,
      referrerDomain: schema.siteVisitors.referrerDomain,
      screenClass: schema.siteVisitors.screenClass,
      lastPath: schema.siteVisitors.lastPath,
    })
    .from(schema.siteVisitors)
    .orderBy(desc(schema.siteVisitors.lastSeenAt));
  const sinceDay = analyticsDay(
    new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
  );
  const visitorDayRows = await db
    .select({
      day: schema.siteVisitorDays.day,
    })
    .from(schema.siteVisitorDays)
    .where(gte(schema.siteVisitorDays.day, sinceDay));

  const sessionsByUser = new Map<string, typeof sessionRows>();
  for (const session of sessionRows) {
    const bucket = sessionsByUser.get(session.userId) ?? [];
    bucket.push(session);
    sessionsByUser.set(session.userId, bucket);
  }

  const users = rows.map((row) => {
    const sessions = sessionsByUser.get(row.id) ?? [];
    const latest = sessions[0] ?? null;
    const countries = [...new Set(sessions.map((s) => s.country).filter(Boolean))];
    const devices = [...new Set(sessions.map((s) => s.device).filter(Boolean))];
    return {
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      randomId: row.randomId,
      accountType: row.accountType,
      createdAt: row.createdAt,
      survey: {
        country: row.surveyCountry,
        device: row.surveyDevice,
        source: row.surveySource,
        goal: row.surveyGoal,
        completedAt: row.surveyCompletedAt,
      },
      access: {
        detectedCountry: latest?.country ?? null,
        detectedCity: latest?.city ?? null,
        latestDevice: latest?.device ?? null,
        lastSeenAt: latest?.lastUsedAt ?? null,
        sessionCount: sessions.length,
        countries,
        devices,
        history: sessions.slice(0, 12).map((session) => ({
          country: session.country,
          city: session.city,
          device: session.device,
          signedInAt: session.createdAt,
          lastSeenAt: session.lastUsedAt,
        })),
      },
    };
  });

  const countValues = (values: Array<string | null | undefined>) => {
    const counts = new Map<string, number>();
    for (const value of values) {
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  };

  return {
    total: users.length,
    analytics: {
      surveyCompleted: users.filter((user) => user.survey.completedAt !== null).length,
      surveyCountries: countValues(users.map((user) => user.survey.country)),
      surveyDevices: countValues(users.map((user) => user.survey.device)),
      discoverySources: countValues(users.map((user) => user.survey.source)),
      surveyGoals: countValues(users.map((user) => user.survey.goal)),
      detectedCountries: countValues(users.map((user) => user.access.detectedCountry)),
      detectedDevices: countValues(users.map((user) => user.access.latestDevice)),
      activeSessions: sessionRows.filter((session) => session.expiresAt > new Date()).length,
      visitors: {
        total: visitorRows.length,
        last24Hours: visitorRows.filter(
          (visitor) =>
            visitor.lastSeenAt.getTime() >= Date.now() - 24 * 60 * 60 * 1000,
        ).length,
        last7Days: visitorRows.filter(
          (visitor) =>
            visitor.lastSeenAt.getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).length,
        countries: countValues(visitorRows.map((visitor) => visitor.country)),
        deviceCategories: countValues(
          visitorRows.map((visitor) => visitor.deviceCategory),
        ),
        browsers: countValues(visitorRows.map((visitor) => visitor.browser)),
        operatingSystems: countValues(
          visitorRows.map((visitor) => visitor.operatingSystem),
        ),
        languages: countValues(visitorRows.map((visitor) => visitor.language)),
        referrers: countValues(
          visitorRows.map((visitor) => visitor.referrerDomain),
        ),
        screenClasses: countValues(
          visitorRows.map((visitor) => visitor.screenClass),
        ),
        daily: [...new Set(visitorDayRows.map((row) => row.day))]
          .sort()
          .map((day) => ({
            day,
            count: visitorDayRows.filter((row) => row.day === day).length,
          })),
        recent: visitorRows.slice(0, 12).map((visitor) => ({
          lastSeenAt: visitor.lastSeenAt,
          firstSeenAt: visitor.firstSeenAt,
          country: visitor.country,
          city: visitor.city,
          deviceCategory: visitor.deviceCategory,
          browser: visitor.browser,
          operatingSystem: visitor.operatingSystem,
          language: visitor.language,
          referrerDomain: visitor.referrerDomain,
          screenClass: visitor.screenClass,
          lastPath: visitor.lastPath,
        })),
      },
    },
    users,
  };
});

// ── Public donation interest ─────────────────────────────────────────────────
// This intentionally collects only donation intent and contact details. A
// payment gateway can be added later without exposing payment credentials to
// the VeilChat application.
app.post<{
  Body: {
    name?: string;
    location?: string;
    contact?: string;
    amount?: string | number;
    paymentMethod?: string;
    note?: string;
  };
}>("/donations", async (req, reply) => {
  const body = req.body ?? {};
  const name = body.name?.trim();
  const location = body.location?.trim();
  const contact = body.contact?.trim();
  const paymentMethod = body.paymentMethod?.trim();
  const note = body.note?.trim() || null;
  const amountText =
    body.amount === undefined || body.amount === null
      ? ""
      : String(body.amount).trim();
  const amount = amountText ? Number(amountText) : null;
  const allowedMethods = new Set([
    "UPI",
    "Bank transfer",
    "Card checkout",
    "Other",
  ]);

  if (
    !name ||
    name.length > 120 ||
    !location ||
    location.length > 120 ||
    !contact ||
    contact.length > 160 ||
    !paymentMethod ||
    !allowedMethods.has(paymentMethod) ||
    !Number.isInteger(amount) ||
    amount === null ||
    amount < 1 ||
    amount > 10_000_000 ||
    (note !== null && note.length > 500)
  ) {
    return reply.status(400).send({
      error: "Please provide valid name, location, contact, amount, and payment method.",
    });
  }

  const db = getDb();
  const [row] = await db
    .insert(schema.donationRequests)
    .values({
      name,
      location,
      contact,
      amount,
      paymentMethod,
      note,
    })
    .returning({
      id: schema.donationRequests.id,
      createdAt: schema.donationRequests.createdAt,
    });

  if (!row) return reply.status(500).send({ error: "Donation request was not saved." });
  return reply.send({ ok: true, id: row.id });
});

// ── Admin: donation interest submissions ──────────────────────────────────────
app.get("/admin/donations", async (req, reply) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  const db = getDb();
  const rows = await db
    .select({
      id: schema.donationRequests.id,
      name: schema.donationRequests.name,
      location: schema.donationRequests.location,
      contact: schema.donationRequests.contact,
      amount: schema.donationRequests.amount,
      paymentMethod: schema.donationRequests.paymentMethod,
      note: schema.donationRequests.note,
      createdAt: schema.donationRequests.createdAt,
    })
    .from(schema.donationRequests)
    .orderBy(desc(schema.donationRequests.createdAt));
  return reply.send({ total: rows.length, donations: rows });
});

// ── Admin: VeilChat Team plaintext inbox ─────────────────────────────────────
// This is deliberately separate from the E2EE tRPC message path. The admin
// console can read these rows because the Team channel is explicitly
// server-readable and marked as such in the user-facing chat header.
app.get("/admin/team/messages", async (req, reply) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  const db = getDb();
  const team = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.isOfficial, true))
    .limit(1);
  if (!team[0]) return reply.send({ team: null, conversations: [] });

  const rows = await db
    .select({
      id: schema.messages.id,
      senderUserId: schema.messages.senderUserId,
      recipientUserId: schema.messages.recipientUserId,
      plaintext: schema.messages.plaintext,
      createdAt: schema.messages.createdAt,
      senderUsername: schema.users.username,
      senderDisplayName: schema.users.displayName,
    })
    .from(schema.messages)
    .innerJoin(schema.users, eq(schema.users.id, schema.messages.senderUserId))
    .where(
      or(
        eq(schema.messages.senderUserId, team[0].id),
        eq(schema.messages.recipientUserId, team[0].id),
      ),
    )
    .orderBy(desc(schema.messages.createdAt))
    .limit(2000);
  return reply.send({
    team: { id: team[0].id, username: "veilchatteam", displayName: "VeilChat Team" },
    messages: rows
      .filter((row) => row.plaintext !== null)
      .map((row) => ({
        id: row.id,
        senderUserId: row.senderUserId,
        recipientUserId: row.recipientUserId,
        text: row.plaintext,
        createdAt: row.createdAt,
        sender: {
          username: row.senderUsername,
          displayName: row.senderDisplayName,
        },
      })),
  });
});

app.post<{
  Body: { recipientUserId?: string; plaintext?: string };
}>("/admin/team/messages", async (req, reply) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  const recipientUserId = req.body?.recipientUserId?.trim();
  const plaintext = req.body?.plaintext?.trim();
  if (!recipientUserId || !plaintext || plaintext.length > 4000) {
    return reply.status(400).send({ error: "recipientUserId and plaintext are required" });
  }
  const db = getDb();
  const team = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.isOfficial, true))
    .limit(1);
  if (!team[0]) return reply.status(503).send({ error: "VeilChat Team is not initialized" });
  const recipient = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.id, recipientUserId))
    .limit(1);
  if (!recipient[0]) return reply.status(404).send({ error: "User not found" });

  const [row] = await db
    .insert(schema.messages)
    .values({
      senderUserId: team[0].id,
      recipientUserId,
      conversationId:
        team[0].id < recipientUserId
          ? `${team[0].id}:${recipientUserId}`
          : `${recipientUserId}:${team[0].id}`,
      header: Buffer.alloc(0),
      ciphertext: Buffer.alloc(0),
      plaintext,
    })
    .returning({ id: schema.messages.id, createdAt: schema.messages.createdAt });
  if (!row) return reply.status(500).send({ error: "Message was not created" });
  publish(recipientUserId, {
    type: "new_message",
    message: {
      id: row.id,
      senderUserId: team[0].id,
      header: "",
      ciphertext: "",
      plaintext,
      isPlaintext: true,
      createdAt: row.createdAt.toISOString(),
      expiresAt: null,
      groupId: null,
    },
  });
  return reply.send({ id: row.id, createdAt: row.createdAt });
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
await ensureVeilChatTeam();

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
