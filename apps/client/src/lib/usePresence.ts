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
  // Do not let internal admin/status visits pollute public visitor analytics.
  if (window.location.pathname === "/raka98" || window.location.pathname === "/status") {
    return;
  }
  try {
    const width = window.innerWidth;
    const screenClass = width < 640 ? "mobile" : width < 1024 ? "tablet" : "desktop";
    await fetch(`${BACKEND_URL}/ping`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sid: getSessionId(),
        path: window.location.pathname,
        referrer: document.referrer,
        screenClass,
      }),
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
