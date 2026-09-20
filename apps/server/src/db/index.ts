import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolve4 } from "node:dns/promises";
import { env } from "../env.js";
import * as schema from "./schema.js";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;
let _bootstrapPromise: Promise<void> | null = null;

/**
 * Idempotent bootstrap that brings the database forward to the columns
 * the current code expects. Drizzle's migration journal got out of sync
 * with the SQL files at some point, so we apply the deltas defensively
 * with `IF NOT EXISTS` guards. Safe to run on every server start.
 */
async function ensureSchema(sql: ReturnType<typeof postgres>) {
  // username column — added after initial schema; safe to run on every start.
  await sql.unsafe(
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" text`,
  );
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" (lower("username")) WHERE "username" IS NOT NULL`,
  );

  await sql.unsafe(
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_discoverable" boolean NOT NULL DEFAULT false`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "users_discoverable_idx" ON "users" ("is_discoverable") WHERE "is_discoverable" = true`,
  );

  // FCM token table for Android Capacitor push notifications (added after
  // initial schema; safe to run on every start thanks to IF NOT EXISTS).
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "fcm_tokens" (
      "id"         uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id"    uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "token"      text        NOT NULL,
      "platform"   text        NOT NULL DEFAULT 'android',
      "created_at" timestamptz NOT NULL DEFAULT NOW(),
      "updated_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "fcm_tokens_token_idx" ON "fcm_tokens" ("token")`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "fcm_tokens_user_idx" ON "fcm_tokens" ("user_id")`,
  );

  // Privacy-preserving first-party analytics. The visitor hash is generated
  // by the server from the browser's opaque id plus the server secret; no raw
  // IP or complete referrer URL is stored.
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "site_visitors" (
      "visitor_hash" text PRIMARY KEY,
      "first_seen_at" timestamptz NOT NULL DEFAULT NOW(),
      "last_seen_at" timestamptz NOT NULL DEFAULT NOW(),
      "country" text,
      "city" text,
      "device_category" text,
      "browser" text,
      "operating_system" text,
      "language" text,
      "referrer_domain" text,
      "screen_class" text,
      "last_path" text
    )
  `);
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "site_visitors_last_seen_idx" ON "site_visitors" ("last_seen_at")`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "site_visitors_country_idx" ON "site_visitors" ("country")`,
  );
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "site_visitor_days" (
      "visitor_hash" text NOT NULL,
      "day" text NOT NULL,
      "first_seen_at" timestamptz NOT NULL DEFAULT NOW(),
      "last_seen_at" timestamptz NOT NULL DEFAULT NOW(),
      "country" text,
      "device_category" text,
      "browser" text,
      "operating_system" text,
      "language" text,
      "referrer_domain" text,
      "screen_class" text,
      PRIMARY KEY ("visitor_hash", "day")
    )
  `);
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "site_visitor_days_day_idx" ON "site_visitor_days" ("day")`,
  );
}

/**
 * Resolve a hostname to its first IPv4 address.
 *
 * Render's infrastructure cannot route IPv6 outbound connections.
 * Supabase's direct-connection hostname (db.*.supabase.co) resolves to an
 * IPv6 address by default, which causes every query to fail with ENETUNREACH.
 * By resolving to IPv4 here we guarantee the postgres client dials an
 * address that Render can actually reach.
 */
async function resolveToIPv4(hostname: string): Promise<string> {
  // Already a raw IPv4 literal — nothing to resolve.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return hostname;
  try {
    const addrs = await resolve4(hostname);
    if (addrs.length > 0) return addrs[0]!;
  } catch {
    // DNS failure or no A records — fall back to the original hostname
    // and let the OS try (may still fail on Render if only AAAA exists).
  }
  return hostname;
}

function buildSqlClient(
  host: string,
  url: URL,
): ReturnType<typeof postgres> {
  return postgres({
    host,
    port: Number(url.port) || 5432,
    database: url.pathname.slice(1),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    // Supabase requires SSL; never hard-fail on self-signed certs.
    ssl: url.searchParams.get("sslmode") !== "disable"
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
    idle_timeout: 20,
    prepare: false,
  });
}

/**
 * Asynchronously bootstraps the database connection with IPv4 DNS resolution.
 *
 * Always await this at server startup (before registering routes or starting
 * sweepers). Once it resolves, getDb() returns the IPv4-connected client
 * instantly for all subsequent callers.
 */
export async function awaitDbBootstrap(): Promise<void> {
  if (!env.DATABASE_URL) return;

  if (!_bootstrapPromise) {
    _bootstrapPromise = (async () => {
      const url = new URL(env.DATABASE_URL!);
      const host = await resolveToIPv4(url.hostname);
      _sql = buildSqlClient(host, url);
      _db = drizzle(_sql, { schema });
      await ensureSchema(_sql).catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error("[db] ensureSchema failed:", err);
      });
    })();
  }

  await _bootstrapPromise;
}

export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase connection string to apps/server/.env",
    );
  }

  if (_db) return _db;

  // Synchronous fallback — hit only if getDb() is called before
  // awaitDbBootstrap() resolves (should not happen after the startup change).
  // Uses the raw URL string which may resolve to IPv6 on some hosts.
  _sql = postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    prepare: false,
  });
  _db = drizzle(_sql, { schema });
  if (!_bootstrapPromise) {
    _bootstrapPromise = ensureSchema(_sql).catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error("[db] ensureSchema failed:", err);
    });
  }
  return _db;
}

export { schema };
