import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "./jwt.js";
import { getDb, schema } from "../db/index.js";
import { r2Configured, putObjectBuffer } from "./r2.js";
import { env } from "../env.js";

/**
 * PUT /api/media/upload/:blobId
 *
 * A server-side proxy for R2 uploads. The browser PUTs raw ciphertext here
 * (with a Bearer token) and this route forwards it to R2 using the server's
 * own AWS credentials. This completely eliminates the browser→R2 CORS issue
 * because the upload never leaves our own server from the browser's point of
 * view — only our server talks to R2.
 *
 * Body:   raw application/octet-stream bytes (encrypted ciphertext)
 * Auth:   Authorization: Bearer <access_token>
 * Params: blobId — must already exist in media_blobs (created by requestUpload)
 */
export async function registerMediaUploadRoute(
  app: FastifyInstance,
): Promise<void> {
  // Register a binary content-type parser with a generous body limit.
  // This overrides Fastify's global 1 MB bodyLimit for octet-stream bodies,
  // allowing encrypted media up to MEDIA_MAX_BYTES.
  app.addContentTypeParser(
    "application/octet-stream",
    { parseAs: "buffer", bodyLimit: env.MEDIA_MAX_BYTES + 256 * 1024 },
    (_req, body, done) => done(null, body),
  );

  app.put<{ Params: { blobId: string } }>(
    "/api/media/upload/:blobId",
    async (req, reply) => {
      // ── Authenticate ────────────────────────────────────────────────────────
      const auth = req.headers.authorization;
      if (!auth?.startsWith("Bearer ")) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      let userId: string;
      try {
        const claims = await verifyAccessToken(auth.slice(7).trim());
        userId = claims.sub;
      } catch {
        return reply.code(401).send({ error: "Invalid or expired token" });
      }

      const { blobId } = req.params;

      // ── Verify blob ownership ────────────────────────────────────────────────
      const db = getDb();
      const rows = await db
        .select({
          id: schema.mediaBlobs.id,
          r2Key: schema.mediaBlobs.r2Key,
          ownerUserId: schema.mediaBlobs.ownerUserId,
          uploaded: schema.mediaBlobs.uploaded,
        })
        .from(schema.mediaBlobs)
        .where(eq(schema.mediaBlobs.id, blobId))
        .limit(1);

      const row = rows[0];
      if (!row || row.ownerUserId !== userId) {
        return reply.code(404).send({ error: "Blob not found" });
      }
      // Idempotent: if already uploaded return success without re-uploading.
      if (row.uploaded) {
        return reply.code(200).send({ ok: true });
      }

      // ── Body checks ──────────────────────────────────────────────────────────
      const body = req.body as Buffer;
      if (!body || body.length === 0) {
        return reply.code(400).send({ error: "Empty body" });
      }
      if (body.length > env.MEDIA_MAX_BYTES) {
        return reply.code(413).send({ error: "Payload too large" });
      }

      // ── R2 availability ──────────────────────────────────────────────────────
      if (!r2Configured()) {
        return reply.code(503).send({ error: "Storage not configured" });
      }

      // ── Upload to R2 (server-side SDK call — no browser CORS) ───────────────
      await putObjectBuffer(row.r2Key, body);

      return reply.code(200).send({ ok: true });
    },
  );
}
