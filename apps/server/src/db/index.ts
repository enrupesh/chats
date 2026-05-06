import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
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
}

export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to apps/server/.env",
    );
  }
  if (!_db) {
    _sql = postgres(env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      prepare: false,
    });
    _db = drizzle(_sql, { schema });
    _bootstrapPromise = ensureSchema(_sql).catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error("[db] ensureSchema failed:", err);
    });
  }
  return _db;
}

export async function awaitDbBootstrap(): Promise<void> {
  if (_bootstrapPromise) await _bootstrapPromise;
}

export { schema };
