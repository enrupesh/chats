import { useEffect } from "react";

const BACKEND_URL = "https://chats-fk6e.onrender.com";
const PING_INTERVAL = 30_000;
const SID_KEY = "veil:presence:sid";

function getSessionId(): string {
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

async function sendPing(): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/ping`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sid: getSessionId() }),
      keepalive: true,
    });
  } catch {
    // silent — presence is best-effort
  }
}

export function usePresence(): void {
  useEffect(() => {
    void sendPing();
    const id = setInterval(() => { void sendPing(); }, PING_INTERVAL);
    return () => clearInterval(id);
  }, []);
}
