import type { FastifyBaseLogger, FastifyInstance } from "fastify";
import { and, count, desc, eq, gt, gte, lt, ne, sql } from "drizzle-orm";
import { createHmac, randomBytes } from "node:crypto";
import { env, isDev } from "../env.js";
import { getDb, schema } from "../db/index.js";
import { verifyFirebaseIdToken } from "./firebase.js";
import { getResendClient } from "./email.js";
import { rateLimit } from "./rateLimit.js";

const ADDRESS_ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";
const MAX_BODY_CHARS = 500_000;

type TempInboxRequest = {
  headers: Record<string, string | string[] | undefined>;
  ip: string;
  body?: unknown;
};

type TempInboxReply = {
  status: (code: number) => TempInboxReply;
  send: (payload: unknown) => unknown;
};

function headerValue(
  headers: TempInboxRequest["headers"],
  name: string,
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

function bearerToken(req: TempInboxRequest): string | null {
  const raw = headerValue(req.headers, "authorization");
  if (!raw || !raw.startsWith("Bearer ")) return null;
  const token = raw.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

async function firebaseUid(
  req: TempInboxRequest,
  reply: TempInboxReply,
): Promise<string | null> {
  const token = bearerToken(req);
  if (!token) {
    reply.status(401).send({ error: "Sign in with Google to use a temporary inbox." });
    return null;
  }
  try {
    return (await verifyFirebaseIdToken(token)).uid;
  } catch {
    reply.status(401).send({ error: "Your Google session expired. Sign in again." });
    return null;
  }
}

function generateLocalPart(): string {
  const bytes = randomBytes(12);
  let localPart = "";
  for (const byte of bytes) {
    localPart += ADDRESS_ALPHABET[byte % ADDRESS_ALPHABET.length];
  }
  return localPart;
}

function quotaHash(firebaseUid: string): string {
  return createHmac(
    "sha256",
    env.IDENTIFIER_HMAC_PEPPER ?? env.JWT_SECRET ?? "veil-temp-inbox-quota",
  )
    .update(`temporary-inbox:${firebaseUid}`)
    .digest("hex");
}

function addressFromRecipient(value: string): string {
  const angle = value.match(/<\s*([^>]+)\s*>/);
  return (angle?.[1] ?? value).trim().toLowerCase();
}

function normalizeRecipients(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(","))
    .map(addressFromRecipient)
    .filter(Boolean);
}

function stripHtml(value: string): string {
  return value
    .replace(/<\s*(script|style|iframe|object|embed|form|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeEmailUrl(
  value: string,
  kind: "href" | "src",
): string | null {
  const normalized = value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  if (!normalized) return null;
  if (kind === "href" && /^#/.test(normalized)) return normalized;
  if (/^(?:https?:|mailto:|tel:)/i.test(normalized)) return normalized;
  if (
    kind === "src" &&
    /^(?:data:image\/(?:gif|jpe?g|png|webp|avif);|\/\/)/i.test(normalized)
  ) {
    return normalized;
  }
  return null;
}

function sanitizeEmailCss(value: string): string {
  return value
    .replace(/@import\b[^;]+;?/gi, "")
    .replace(/\b(?:expression|behavior|-moz-binding)\s*:/gi, "")
    .replace(/\b(?:javascript|vbscript)\s*:/gi, "")
    .replace(
      /url\s*\(\s*(['"]?)(?!https?:|data:image\/|\/\/)[^)]*\1\s*\)/gi,
      "",
    );
}

function sanitizeEmailAttributes(value: string): string {
  const withoutActiveAttributes = value
    .replace(
      /\s+(?:on[a-z0-9_-]+|srcdoc|action|formaction)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      "",
    )
    .replace(
      /\s+(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
      (
        _match: string,
        attribute: "href" | "src",
        doubleQuoted: string | undefined,
        singleQuoted: string | undefined,
        bare: string | undefined,
      ) => {
        const raw = doubleQuoted ?? singleQuoted ?? bare ?? "";
        const safe = sanitizeEmailUrl(raw, attribute);
        return safe
          ? ` ${attribute}="${safe
              .replace(/&/g, "&amp;")
              .replace(/"/g, "&quot;")}"`
          : "";
      },
    );

  return withoutActiveAttributes.replace(
    /\s+style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    (
      _match: string,
      doubleQuoted: string | undefined,
      singleQuoted: string | undefined,
    ) => {
      const raw = doubleQuoted ?? singleQuoted ?? "";
      return ` style="${sanitizeEmailCss(raw)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")}"`;
    },
  );
}

/**
 * Keep display-safe email markup while preserving the sender's visual design.
 * The client renders this inside a sandboxed iframe, so scripts/forms are
 * blocked there as a second boundary. Links, inline styles, and email CSS are
 * retained after protocol and active-content filtering.
 */
function sanitizeEmailHtml(value: string | null | undefined): string | null {
  if (!value) return null;
  const safe = value
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(
      /<\s*(script|iframe|object|embed|form|svg|math|video|audio|source|base|meta|link)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      " ",
    )
    .replace(
      /<\s*\/?\s*(script|iframe|object|embed|form|svg|math|video|audio|source|base|meta|link)\b[^>]*>/gi,
      " ",
    )
    .replace(/<([a-z][a-z0-9:-]*)\b([^>]*)>/gi, (_match, tag: string, attributes: string) => {
      return `<${tag}${sanitizeEmailAttributes(attributes)}>`;
    })
    .replace(/<a\b([^>]*)>/gi, (_match, attributes: string) => {
      const withoutNavigationOverrides = attributes
        .replace(/\s+target\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/\s+rel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
      return `<a${withoutNavigationOverrides} target="_blank" rel="noopener noreferrer">`;
    })
    .slice(0, MAX_BODY_CHARS);
  return safe.trim() || null;
}

function detectOtp(subject: string, text: string): string | null {
  const source = `${subject}\n${text}`.slice(0, MAX_BODY_CHARS);
  const nearby = source.match(
    /\b(?:code|otp|verification|verify|pin|passcode|one[-\s]?time)[^\d]{0,32}(\d{4,8})\b/i,
  );
  if (nearby?.[1]) return nearby[1];
  const reversed = source.match(
    /\b(\d{4,8})\b[^\n]{0,32}\b(?:code|otp|verification|verify|pin|passcode)\b/i,
  );
  return reversed?.[1] ?? null;
}

async function validateTurnstile(token: unknown, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    return isDev;
  }
  if (typeof token !== "string" || token.length < 10) return false;
  try {
    const body = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      ...(ip !== "unknown" ? { remoteip: ip } : {}),
    });
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const result = (await response.json()) as { success?: boolean };
    return response.ok && result.success === true;
  } catch {
    return false;
  }
}

function serializeInbox(row: typeof schema.tempInboxes.$inferSelect) {
  return {
    id: row.id,
    address: row.address,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
  };
}

function serializeMessage(row: typeof schema.tempInboxMessages.$inferSelect) {
  return {
    id: row.id,
    fromAddress: row.fromAddress,
    subject: row.subject,
    textBody: row.textBody,
    htmlBody: row.htmlBody,
    headers: row.headers,
    receivedAt: row.receivedAt.toISOString(),
    otpCode: row.otpCode,
    attachmentCount: row.attachmentCount,
  };
}

async function createInbox(
  uid: string,
  ip: string,
  turnstileToken: unknown,
): Promise<
  | { ok: true; inbox: ReturnType<typeof serializeInbox>; quotaResetAt: string | null }
  | { ok: false; status: number; error: string }
> {
  const captchaOk = await validateTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return {
      ok: false,
      status: 400,
      error: "Complete the Cloudflare check before creating an inbox.",
    };
  }

  const limiter = rateLimit({
    key: `temp-inbox:create:${ip}`,
    limit: 8,
    windowSeconds: 60 * 60,
  });
  if (!limiter.allowed) {
    return {
      ok: false,
      status: 429,
      error: `Too many attempts. Try again in ${limiter.resetInSeconds}s.`,
    };
  }

  const db = getDb();
  const now = new Date();
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const issuedByHash = quotaHash(uid);

  try {
    return await db.transaction(async (tx) => {
      const insertedUser = await tx
        .insert(schema.tempInboxUsers)
        .values({ firebaseUid: uid })
        .onConflictDoNothing({
          target: schema.tempInboxUsers.firebaseUid,
        })
        .returning({ id: schema.tempInboxUsers.id });
      const userId =
        insertedUser[0]?.id ??
        (
          await tx
            .select({ id: schema.tempInboxUsers.id })
            .from(schema.tempInboxUsers)
            .where(eq(schema.tempInboxUsers.firebaseUid, uid))
            .limit(1)
        )[0]?.id;
      if (!userId) {
        return {
          ok: false as const,
          status: 500,
          error: "Could not prepare your temporary inbox account.",
        };
      }

      // Serialize quota checks for the same Firebase user in a multi-click
      // race. This lock is on the small identity row, never on email data.
      await tx.execute(
        sql`SELECT id FROM "temp_inbox_users" WHERE id = ${userId} FOR UPDATE`,
      );
      const recent = await tx
        .select({
          total: count(),
          lastCreatedAt: sql<Date | null>`max(${schema.tempAddressReservations.reservedAt})`,
        })
        .from(schema.tempAddressReservations)
        .where(
          and(
            eq(schema.tempAddressReservations.issuedByHash, issuedByHash),
            gte(schema.tempAddressReservations.reservedAt, windowStart),
          ),
        );
      const total = Number(recent[0]?.total ?? 0);
      if (total >= 2) {
        const latest = recent[0]?.lastCreatedAt
          ? new Date(recent[0].lastCreatedAt)
          : now;
        return {
          ok: false as const,
          status: 429,
          error: `You have used both inboxes for this 24-hour window. Try again in ${Math.max(
            1,
            Math.ceil((latest.getTime() + 24 * 60 * 60 * 1000 - now.getTime()) / 1000),
          )}s.`,
        };
      }

      let reservationId: string | null = null;
      let address = "";
      for (let attempt = 0; attempt < 8 && !reservationId; attempt += 1) {
        address = `${generateLocalPart()}@${env.TEMP_MAIL_DOMAIN}`;
        const reservation = await tx
          .insert(schema.tempAddressReservations)
          .values({ address, issuedByHash, reservedAt: now })
          .onConflictDoNothing({
            target: schema.tempAddressReservations.address,
          })
          .returning({ id: schema.tempAddressReservations.id });
        reservationId = reservation[0]?.id ?? null;
      }
      if (!reservationId) {
        return {
          ok: false as const,
          status: 503,
          error: "We could not reserve an address. Please try again.",
        };
      }

      const expiresAt = new Date(
        now.getTime() + env.TEMP_MAIL_TTL_HOURS * 60 * 60 * 1000,
      );
      const [inbox] = await tx
        .insert(schema.tempInboxes)
        .values({ userId, address, createdAt: now, expiresAt })
        .returning();
      if (!inbox) {
        return {
          ok: false as const,
          status: 500,
          error: "We could not create the inbox. Please try again.",
        };
      }
      return {
        ok: true as const,
        inbox: serializeInbox(inbox),
        quotaResetAt:
          total === 1
            ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
            : null,
      };
    });
  } catch (error) {
    throw error;
  }
}

async function handleReceivedEmail(
  event: {
    type?: string;
    data?: {
      email_id?: string;
      to?: string[];
    };
  },
  log: FastifyBaseLogger,
): Promise<void> {
  if (event.type !== "email.received") return;
  const emailId = event.data?.email_id;
  const recipients = normalizeRecipients(event.data?.to);
  if (!emailId || recipients.length === 0) return;

  const db = getDb();
  const now = new Date();
  const inboxRows = await db
    .select()
    .from(schema.tempInboxes)
    .where(
      and(
        sql`${schema.tempInboxes.address} IN (${sql.join(
          recipients.map((value) => sql`${value}`),
          sql`, `,
        )})`,
        gt(schema.tempInboxes.expiresAt, now),
      ),
    )
    .limit(1);
  const inbox = inboxRows[0];
  if (!inbox) return;

  const resend = getResendClient();
  if (!resend) {
    log.error("Cannot process inbound email without RESEND_API_KEY");
    return;
  }
  const received = await resend.emails.receiving.get(emailId);
  if (received.error || !received.data) {
    log.error({ emailId, error: received.error }, "Could not fetch received email");
    return;
  }
  const email = received.data;
  const textBody = email.text?.slice(0, MAX_BODY_CHARS) ?? null;
  const htmlBody = sanitizeEmailHtml(email.html);
  const otpCode = detectOtp(email.subject ?? "", textBody ?? stripHtml(email.html ?? ""));
  await db.transaction(async (tx) => {
    // Serialize replacement for this address so concurrent webhook deliveries
    // cannot leave multiple active messages behind.
    await tx.execute(
      sql`SELECT id FROM "temp_inboxes" WHERE id = ${inbox.id} FOR UPDATE`,
    );
    const inserted = await tx
      .insert(schema.tempInboxMessages)
      .values({
        inboxId: inbox.id,
        resendEmailId: email.id,
        fromAddress: email.from.slice(0, 500),
        subject: (email.subject || "(no subject)").slice(0, 500),
        textBody,
        htmlBody,
        headers: email.headers,
        receivedAt: new Date(email.created_at),
        otpCode,
        attachmentCount: email.attachments?.length ?? 0,
      })
      .onConflictDoNothing({
        target: schema.tempInboxMessages.resendEmailId,
      })
      .returning({ id: schema.tempInboxMessages.id });

    // Keep only the newest successfully inserted email. Duplicate webhook
    // deliveries do not enter this branch, so they cannot remove the current
    // message.
    if (inserted[0]) {
      await tx
        .delete(schema.tempInboxMessages)
        .where(
          and(
            eq(schema.tempInboxMessages.inboxId, inbox.id),
            ne(schema.tempInboxMessages.id, inserted[0].id),
          ),
        );
    }
  });
}

export function registerTempInboxRoutes(app: FastifyInstance): void {
  app.get("/temporary-inbox", async (req, reply) => {
    const uid = await firebaseUid(req as unknown as TempInboxRequest, reply);
    if (!uid) return;
    const db = getDb();
    const user = await db
      .select({ id: schema.tempInboxUsers.id })
      .from(schema.tempInboxUsers)
      .where(eq(schema.tempInboxUsers.firebaseUid, uid))
      .limit(1);
    if (!user[0]) return reply.send({ inboxes: [] });
    const rows = await db
      .select()
      .from(schema.tempInboxes)
      .where(
        and(
          eq(schema.tempInboxes.userId, user[0].id),
          gt(schema.tempInboxes.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(schema.tempInboxes.createdAt));
    return reply.send({ inboxes: rows.map(serializeInbox) });
  });

  app.post<{ Body: { turnstileToken?: string } }>(
    "/temporary-inbox",
    async (req, reply) => {
      const uid = await firebaseUid(req as unknown as TempInboxRequest, reply);
      if (!uid) return;
      const body =
        req.body && typeof req.body === "object"
          ? (req.body as { turnstileToken?: string })
          : {};
      try {
        const result = await createInbox(uid, req.ip, body.turnstileToken);
        return reply.status(result.ok ? 201 : result.status).send(result.ok ? result : { error: result.error });
      } catch (error) {
        app.log.error({ error }, "Temporary inbox creation failed");
        return reply.status(500).send({ error: "Could not create a temporary inbox." });
      }
    },
  );

  app.get<{ Params: { inboxId: string } }>(
    "/temporary-inbox/:inboxId/messages",
    async (req, reply) => {
      const uid = await firebaseUid(req as unknown as TempInboxRequest, reply);
      if (!uid) return;
      const db = getDb();
      const owned = await db
        .select({ id: schema.tempInboxes.id })
        .from(schema.tempInboxes)
        .innerJoin(
          schema.tempInboxUsers,
          eq(schema.tempInboxUsers.id, schema.tempInboxes.userId),
        )
        .where(
          and(
            eq(schema.tempInboxes.id, req.params.inboxId),
            eq(schema.tempInboxUsers.firebaseUid, uid),
            gt(schema.tempInboxes.expiresAt, new Date()),
          ),
        )
        .limit(1);
      if (!owned[0]) return reply.status(404).send({ error: "Inbox not found or expired." });
      const messages = await db
        .select()
        .from(schema.tempInboxMessages)
        .where(eq(schema.tempInboxMessages.inboxId, req.params.inboxId))
        .orderBy(desc(schema.tempInboxMessages.receivedAt));
      return reply.send({ messages: messages.map(serializeMessage) });
    },
  );

  app.delete<{ Params: { inboxId: string } }>(
    "/temporary-inbox/:inboxId",
    async (req, reply) => {
      const uid = await firebaseUid(req as unknown as TempInboxRequest, reply);
      if (!uid) return;
      const db = getDb();
      const owned = await db
        .select({ id: schema.tempInboxes.id })
        .from(schema.tempInboxes)
        .innerJoin(
          schema.tempInboxUsers,
          eq(schema.tempInboxUsers.id, schema.tempInboxes.userId),
        )
        .where(
          and(
            eq(schema.tempInboxes.id, req.params.inboxId),
            eq(schema.tempInboxUsers.firebaseUid, uid),
          ),
        )
        .limit(1);
      if (!owned[0]) return reply.status(404).send({ error: "Inbox not found." });
      await db
        .delete(schema.tempInboxes)
        .where(eq(schema.tempInboxes.id, req.params.inboxId));
      return reply.send({ ok: true });
    },
  );

  app.post("/webhooks/resend/received", async (req, reply) => {
    const rawBody =
      (req as unknown as { rawBody?: string }).rawBody ??
      JSON.stringify(req.body ?? {});
    let event: { type?: string; data?: { email_id?: string; to?: string[] } };
    const resend = getResendClient();
    try {
      if (env.RESEND_WEBHOOK_SECRET && resend) {
        event = resend.webhooks.verify({
          payload: rawBody,
          headers: {
            id: headerValue(req.headers, "svix-id") ?? "",
            timestamp: headerValue(req.headers, "svix-timestamp") ?? "",
            signature: headerValue(req.headers, "svix-signature") ?? "",
          },
          webhookSecret: env.RESEND_WEBHOOK_SECRET,
        }) as typeof event;
      } else if (isDev) {
        event = (req.body ?? {}) as typeof event;
      } else {
        return reply.status(503).send({ error: "Inbound webhook verification is not configured." });
      }
    } catch {
      return reply.status(401).send({ error: "Invalid webhook signature." });
    }
    try {
      await handleReceivedEmail(event, app.log);
      return reply.send({ received: true });
    } catch (error) {
      app.log.error({ error }, "Inbound temporary email processing failed");
      return reply.status(500).send({ error: "Inbound email processing failed." });
    }
  });
}

export function startTempInboxSweeper(log: FastifyBaseLogger): void {
  const sweep = async () => {
    try {
      const db = getDb();
      const deleted = await db
        .delete(schema.tempInboxes)
        .where(lt(schema.tempInboxes.expiresAt, new Date()))
        .returning({ id: schema.tempInboxes.id });
      if (deleted.length > 0) {
        log.info({ count: deleted.length }, "Expired temporary inboxes removed");
      }
    } catch (error) {
      log.error({ error }, "Temporary inbox sweep failed");
    }
  };
  void sweep();
  setInterval(() => void sweep(), 5 * 60 * 1000).unref?.();
}