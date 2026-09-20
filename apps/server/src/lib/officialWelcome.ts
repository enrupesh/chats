import { and, eq } from "drizzle-orm";
import { getDb, schema } from "../db/index.js";
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
  const db = getDb();
  const team = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(and(eq(schema.users.isOfficial, true), eq(schema.users.username, "veilchatteam")))
    .limit(1);

  if (!team[0]) {
    throw new Error("VeilChat Team account is not initialized");
  }

  const senderUserId = team[0].id;
  const [row] = await db
    .insert(schema.messages)
    .values({
      senderUserId,
      recipientUserId,
      conversationId: conversationIdFor(senderUserId, recipientUserId),
      header: Buffer.alloc(0),
      ciphertext: Buffer.alloc(0),
      plaintext: WELCOME_MESSAGE,
    })
    .returning({
      id: schema.messages.id,
      createdAt: schema.messages.createdAt,
    });

  publish(recipientUserId, {
    type: "new_message",
    message: {
      id: row!.id,
      senderUserId,
      header: "",
      ciphertext: "",
      plaintext: WELCOME_MESSAGE,
      isPlaintext: true,
      createdAt: row!.createdAt.toISOString(),
      expiresAt: null,
      groupId: null,
    },
  });
}