import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolve4 } from "node:dns/promises";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
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
  await sql.unsafe(
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_official" boolean NOT NULL DEFAULT false`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "users_official_idx" ON "users" ("is_official") WHERE "is_official" = true`,
  );
  await sql.unsafe(
    `ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "plaintext" text`,
  );
  // Retire the old account-creation welcome rows. The Team chat now renders
  // this onboarding copy as a permanent local UI message instead of storing
  // one server row for every account.
  await sql.unsafe(`
    DELETE FROM "messages"
    WHERE "plaintext" LIKE 'Welcome to VeilChat!%'
      AND "sender_user_id" IN (
        SELECT "id" FROM "users" WHERE "is_official" = true
      )
  `);

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

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "donation_requests" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "location" text NOT NULL,
      "contact" text NOT NULL,
      "contact_method" text NOT NULL DEFAULT 'Email',
      "amount" integer,
      "currency" text NOT NULL DEFAULT 'USD',
      "payment_method" text NOT NULL,
      "note" text,
      "created_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  await sql.unsafe(
    `ALTER TABLE "donation_requests" ADD COLUMN IF NOT EXISTS "currency" text NOT NULL DEFAULT 'USD'`,
  );
  await sql.unsafe(
    `ALTER TABLE "donation_requests" ADD COLUMN IF NOT EXISTS "contact_method" text NOT NULL DEFAULT 'Email'`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "donation_requests_created_at_idx" ON "donation_requests" ("created_at")`,
  );

  // Product launch waitlist. Public signup only collects an email plus
  // optional founder qualification links; duplicate emails are prevented
  // at the database boundary.
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "product_waitlist" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" text NOT NULL,
      "website_url" text,
      "linkedin_url" text,
      "created_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "product_waitlist_email_idx" ON "product_waitlist" ("email")`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "product_waitlist_created_at_idx" ON "product_waitlist" ("created_at")`,
  );

  // Temporary receive-only inboxes. `temp_address_reservations` is a
  // permanent tombstone table by design: inbox rows and messages expire, but
  // an address that was ever issued must never be assigned again.
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "temp_inbox_users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "firebase_uid" text NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "temp_inbox_users_firebase_uid_idx" ON "temp_inbox_users" ("firebase_uid")`,
  );
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "temp_address_reservations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "address" text NOT NULL,
      "issued_by_hash" text NOT NULL,
      "reserved_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  await sql.unsafe(
    `ALTER TABLE "temp_address_reservations" ADD COLUMN IF NOT EXISTS "issued_by_hash" text`,
  );
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "temp_address_reservations_address_idx" ON "temp_address_reservations" ("address")`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "temp_address_reservations_quota_idx" ON "temp_address_reservations" ("issued_by_hash", "reserved_at")`,
  );
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "temp_inboxes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "temp_inbox_users"("id") ON DELETE CASCADE,
      "address" text NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT NOW(),
      "expires_at" timestamptz NOT NULL
    )
  `);
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "temp_inboxes_address_idx" ON "temp_inboxes" ("address")`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "temp_inboxes_user_idx" ON "temp_inboxes" ("user_id", "created_at")`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "temp_inboxes_expiry_idx" ON "temp_inboxes" ("expires_at")`,
  );
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "temp_inbox_messages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "inbox_id" uuid NOT NULL REFERENCES "temp_inboxes"("id") ON DELETE CASCADE,
      "resend_email_id" text NOT NULL,
      "from_address" text NOT NULL,
      "subject" text NOT NULL,
      "text_body" text,
      "html_body" text,
      "headers" jsonb,
      "received_at" timestamptz NOT NULL DEFAULT NOW(),
      "otp_code" text,
      "attachment_count" integer NOT NULL DEFAULT 0,
      "created_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "temp_inbox_messages_resend_id_idx" ON "temp_inbox_messages" ("resend_email_id")`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS "temp_inbox_messages_inbox_idx" ON "temp_inbox_messages" ("inbox_id", "received_at")`,
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

/**
 * Creates the managed VeilChat Team profile once. It is intentionally not a
 * normal login account: Team replies use the separate admin console and the
 * Team channel is explicitly server-readable rather than E2EE.
 */
export async function ensureVeilChatTeam(): Promise<void> {
  if (!env.DATABASE_URL) return;
  const db = getDb();
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.isOfficial, true))
    .limit(1);
  const avatarDataUrl =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='32' fill='%23F4C95D'/%3E%3Cpath d='M64 22 99 36v25c0 22-15 37-35 45C44 98 29 83 29 61V36l35-14Z' fill='%23253D2C'/%3E%3Cpath d='m48 64 11 11 22-25' fill='none' stroke='%23F4C95D' stroke-width='9' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
  if (existing.length > 0) {
    await db
      .update(schema.users)
      .set({
        username: "veilchatteam",
        displayName: "VeilChat Team",
        bio: "Official VeilChat support. Ask us anything about your account, privacy, or using VeilChat.",
        avatarDataUrl,
        isDiscoverable: true,
        isOfficial: true,
      })
      .where(eq(schema.users.id, existing[0]!.id));
    return;
  }
  await db.insert(schema.users).values({
    accountType: "random",
    randomId: "system:veilchat-team",
    username: "veilchatteam",
    displayName: "VeilChat Team",
    bio: "Official VeilChat support. Ask us anything about your account, privacy, or using VeilChat.",
    avatarDataUrl,
    isDiscoverable: true,
    isOfficial: true,
    identityPubkey: randomBytes(32),
  });
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
