import { getApiBaseUrl } from "./apiBase";

export type TempInbox = {
  id: string;
  address: string;
  createdAt: string;
  expiresAt: string;
};

export type TempInboxMessage = {
  id: string;
  fromAddress: string;
  subject: string;
  textBody: string | null;
  htmlBody: string | null;
  headers: Record<string, string> | null;
  receivedAt: string;
  otpCode: string | null;
  attachmentCount: number;
};

async function request<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!response.ok) {
    throw new Error(payload?.error || "The temporary inbox service is unavailable.");
  }
  return payload as T;
}

export async function listTempInboxes(token: string): Promise<TempInbox[]> {
  const result = await request<{ inboxes: TempInbox[] }>("/temporary-inbox", token);
  return result.inboxes;
}

export async function createTempInbox(
  token: string,
  turnstileToken?: string,
): Promise<TempInbox> {
  const result = await request<{ inbox: TempInbox }>("/temporary-inbox", token, {
    method: "POST",
    body: JSON.stringify({ turnstileToken }),
  });
  return result.inbox;
}

export async function listTempInboxMessages(
  token: string,
  inboxId: string,
): Promise<TempInboxMessage[]> {
  const result = await request<{ messages: TempInboxMessage[] }>(
    `/temporary-inbox/${encodeURIComponent(inboxId)}/messages`,
    token,
  );
  return result.messages;
}

export async function deleteTempInbox(
  token: string,
  inboxId: string,
): Promise<void> {
  await request<{ ok: true }>(
    `/temporary-inbox/${encodeURIComponent(inboxId)}`,
    token,
    { method: "DELETE" },
  );
}