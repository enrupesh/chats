import { and, eq } from "drizzle-orm";
import { ensureVeilChatTeam, getDb, schema } from "../db/index.js";
import { publish } from "./wsHub.js";

const WELCOME_MESSAGE = `Welcome to VeilChat! 🎉

We’re happy to have you here. VeilChat is private by design — your personal conversations are end-to-end encrypted, with no ads and no tracking.

Here are a few things you can do:
• Chat privately with friends and groups
• Share photos and voice notes
• Use disappearing messages, replies, reactions, polls, and message scheduling
• Protect your account with a recovery kit and passkeys
• Control your privacy, notifications, themes, and focus mode

🌍 Discover People
Meet people who have chosen to be discoverable and start a conversation: [Open Discover People](/discover)

More than 1 million happy users are already part of our community. We’re glad you’re here — enjoy VeilChat! 💚`;
const WELCOME_TTL_MS = 24 * 60 * 60 * 1000;

function conversationIdFor(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

/**
 * Queue the first message from the managed VeilChat Team account.
 *
 * The official channel is intentionally server-readable (unlike normal
 * E2EE conversations), so the new account can receive a useful welcome
 * message before it has any contacts or a second device.
 */
export async function sendWelcomeMessage(recipientUserId: string): Promise<void> {
  try {
    // Make the sender available even when this helper is called before the
    // normal server bootstrap has completed, or after a partial deployment.
    await ensureVeilChatTeam();
    const db = getDb();
    const recipient = await db
      .select({ createdAt: schema.users.createdAt })
      .from(schema.users)
      .where(eq(schema.users.id, recipientUserId))
      .limit(1);
    const account = recipient[0];
    if (!account) {
      return;
    }
    const team = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.isOfficial, true))
      .limit(1);

    if (!team[0]) {
      console.warn("[welcome] VeilChat Team account is not initialized");
      return;
    }

    const senderUserId = team[0].id;
    if (senderUserId === recipientUserId) return;

    const existing = await db
      .select({
        id: schema.messages.id,
        createdAt: schema.messages.createdAt,
        expiresAt: schema.messages.expiresAt,
      })
      .from(schema.messages)
      .where(
        and(
          eq(schema.messages.senderUserId, senderUserId),
          eq(schema.messages.recipientUserId, recipientUserId),
          eq(schema.messages.plaintext, WELCOME_MESSAGE),
        ),
      )
      .limit(1);
    const previous = existing[0];
    if (previous) {
      // Legacy welcome rows were created before the one-day TTL existed.
      // Give those rows the same account-relative expiry instead of leaving
      // them permanently visible in the Team inbox.
      if (!previous.expiresAt) {
        await db
          .update(schema.messages)
          .set({
            expiresAt: new Date(
              previous.createdAt.getTime() + WELCOME_TTL_MS,
            ),
          })
          .where(eq(schema.messages.id, previous.id));
      }
      return;
    }

    // This helper is also called from connections.list as a recovery path
    // for accounts created while the Team profile was unavailable. Restrict
    // that recovery to the account's first 24 hours so an expired welcome
    // can never be recreated on a later login.
    if (account.createdAt.getTime() + WELCOME_TTL_MS <= Date.now()) {
      return;
    }

    const expiresAt = new Date(account.createdAt.getTime() + WELCOME_TTL_MS);
    const [row] = await db
      .insert(schema.messages)
      .values({
        senderUserId,
        recipientUserId,
        conversationId: conversationIdFor(senderUserId, recipientUserId),
        header: Buffer.alloc(0),
        ciphertext: Buffer.alloc(0),
        plaintext: WELCOME_MESSAGE,
        expiresAt,
      })
      .returning({
        id: schema.messages.id,
        createdAt: schema.messages.createdAt,
        expiresAt: schema.messages.expiresAt,
      });

    if (!row) return;
    publish(recipientUserId, {
      type: "new_message",
      message: {
        id: row.id,
        senderUserId,
        header: "",
        ciphertext: "",
        plaintext: WELCOME_MESSAGE,
        isPlaintext: true,
        createdAt: row.createdAt.toISOString(),
        expiresAt: row.expiresAt?.toISOString() ?? expiresAt.toISOString(),
        groupId: null,
      },
    });
  } catch (error) {
    // A welcome message must never turn a successful account creation or
    // connection-list request into an auth failure.
    console.error("[welcome] Could not send VeilChat Team message:", error);
  }
}