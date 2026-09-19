import { useState, useEffect, useRef, useCallback } from "react";
import { StatusContent } from "./StatusPage";

/* ─── Auth constants (SHA-256 hashes — plain credentials never stored here) ─── */
const U_HASH = "2ed2f92a467e9b5068c82dad22262f3cfa98054dbedae3949b1d60c29186486d";
const P_HASH = "0d86e76e4850a1fa71c111b6c5c030a23bfe2e36d9c8aad73607b0c7efcef459";
const ADMIN_TOKEN = "2ada6ca17dcc4f828a68c94eb629bc8d7cf46ea7e22b084d08cd58ea35690869";
const SESSION_KEY = "veil:team:session";
const BACKEND_URL = "https://chats-fk6e.onrender.com";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function useSession() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const grant = () => { sessionStorage.setItem(SESSION_KEY, "1"); setAuthed(true); };
  const revoke = () => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); };
  return { authed, grant, revoke };
}

/* ════════════════════════════════════════════════════════════
   LOGIN SCREEN  — landing-page cream / forest-green theme
   ════════════════════════════════════════════════════════════ */
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { usernameRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError("Both fields are required."); return; }
    setLoading(true);
    setError("");
    const [uh, ph] = await Promise.all([sha256(username), sha256(password)]);
    await new Promise((r) => setTimeout(r, 380));
    if (uh === U_HASH && ph === P_HASH) {
      onSuccess();
    } else {
      setLoading(false);
      setError("Invalid credentials. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 550);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FCF5EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", padding: 24 }}>

      {/* Subtle grid background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#253D2C08 1px, transparent 1px), linear-gradient(90deg, #253D2C08 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative", animation: shake ? "taShake 0.5s ease" : undefined }}>

        {/* Brand mark */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#2E6F40", display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(46,111,64,0.25)", marginBottom: 16 }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111B21", letterSpacing: "-0.025em", margin: "0 0 5px" }}>Team Access</h1>
          <p style={{ fontSize: 13, color: "#253D2C", opacity: 0.5, margin: 0 }}>VeilChat internal — restricted area</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid rgba(37,61,44,0.1)", padding: "32px 28px", boxShadow: "0 4px 24px rgba(17,27,33,0.07), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
          <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Username */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#253D2C", opacity: 0.6, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 7 }}>Username</label>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                autoComplete="off"
                spellCheck={false}
                placeholder="Enter your username"
                style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#F8FAF8", border: `1.5px solid ${error ? "#E53E3E" : "rgba(37,61,44,0.14)"}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#111B21", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onFocus={(e) => { e.target.style.borderColor = "#2E6F40"; e.target.style.boxShadow = "0 0 0 3px rgba(46,111,64,0.1)"; }}
                onBlur={(e)  => { e.target.style.borderColor = error ? "#E53E3E" : "rgba(37,61,44,0.14)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#253D2C", opacity: 0.6, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 7 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#F8FAF8", border: `1.5px solid ${error ? "#E53E3E" : "rgba(37,61,44,0.14)"}`, borderRadius: 10, padding: "11px 44px 11px 14px", fontSize: 14, color: "#111B21", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
                  onFocus={(e) => { e.target.style.borderColor = "#2E6F40"; e.target.style.boxShadow = "0 0 0 3px rgba(46,111,64,0.1)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = error ? "#E53E3E" : "rgba(37,61,44,0.14)"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#253D2C", opacity: 0.4, padding: 4, display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, backgroundColor: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: 9, padding: "9px 12px", fontSize: 13, color: "#C53030" }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 4, width: "100%", padding: "12px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", backgroundColor: loading ? "#68BA7F" : "#2E6F40", color: "white", fontSize: 14, fontWeight: 700, letterSpacing: "0.01em", transition: "background-color 0.2s, transform 0.1s", boxShadow: loading ? "none" : "0 4px 14px rgba(46,111,64,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#245C33"; }}
              onMouseOut={(e)  => { if (!loading) e.currentTarget.style.backgroundColor = "#2E6F40"; }}
            >
              {loading ? <SmallSpinner /> : null}
              {loading ? "Verifying…" : "Sign in →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 11.5, color: "rgba(37,61,44,0.28)" }}>Authorised personnel only</p>
      </div>

      <style>{`
        @keyframes taShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes taSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes taPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.92)} }
        @keyframes taCount { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD — landing-page theme + live user count
   ════════════════════════════════════════════════════════════ */

interface PresenceSnapshot {
  count: number;
  ts: Date;
}

/* ── Registered users types & hook ── */

interface RegisteredUser {
  id: string;
  username: string | null;
  displayName: string | null;
  randomId: string | null;
  accountType: "email" | "phone" | "random";
  createdAt: string;
  survey: {
    country: string | null;
    device: string | null;
    source: string | null;
    goal: string | null;
    completedAt: string | null;
  };
  access: {
    detectedCountry: string | null;
    detectedCity: string | null;
    latestDevice: string | null;
    lastSeenAt: string | null;
    sessionCount: number;
    countries: string[];
    devices: string[];
    history: Array<{
      country: string | null;
      city: string | null;
      device: string | null;
      signedInAt: string;
      lastSeenAt: string;
    }>;
  };
}

interface UsersData {
  total: number;
  users: RegisteredUser[];
  analytics: {
    surveyCompleted: number;
    surveyCountries: Array<{ label: string; count: number }>;
    surveyDevices: Array<{ label: string; count: number }>;
    discoverySources: Array<{ label: string; count: number }>;
    surveyGoals: Array<{ label: string; count: number }>;
    detectedCountries: Array<{ label: string; count: number }>;
    detectedDevices: Array<{ label: string; count: number }>;
    activeSessions: number;
  };
}

function useRegisteredUsers() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/users`, {
        cache: "no-store",
        headers: { "x-admin-token": ADMIN_TOKEN },
      });
      if (!res.ok) { setError(true); return; }
      const json = (await res.json()) as UsersData;
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);

  const displayName = (u: RegisteredUser): string => {
    if (u.username) return u.username;
    if (u.displayName) return u.displayName;
    if (u.randomId) return u.randomId;
    return u.id.slice(0, 8);
  };

  const filtered = data
    ? data.users.filter((u) => {
        const q = search.toLowerCase();
        return (
          !q ||
          (u.username ?? "").toLowerCase().includes(q) ||
          (u.displayName ?? "").toLowerCase().includes(q) ||
          (u.randomId ?? "").toLowerCase().includes(q)
        );
      })
    : [];

  return { data, loading, error, search, setSearch, filtered, refetch, displayName };
}

function formatLabel(value: string | null | undefined): string {
  if (!value) return "Not available";
  if (/^[A-Z]{2}$/.test(value)) {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(value) ?? value;
  }
  return value
    .replace(/_/g, " ")
    .replace(/:\w+/g, "")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DistributionList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);
  return (
    <div style={{ backgroundColor: "white", border: "1px solid rgba(37,61,44,0.1)", borderRadius: 16, padding: 20 }}>
      <h3 style={{ fontSize: 14, margin: "0 0 15px", color: "#111B21" }}>{title}</h3>
      {items.length === 0 ? (
        <p style={{ margin: 0, color: "rgba(37,61,44,0.45)", fontSize: 12 }}>No responses yet</p>
      ) : (
        <div style={{ display: "grid", gap: 11 }}>
          {items.slice(0, 6).map((item) => (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5, fontSize: 12 }}>
                <span style={{ color: "#253D2C" }}>{formatLabel(item.label)}</span>
                <strong style={{ color: "#2E6F40" }}>{item.count}</strong>
              </div>
              <div style={{ height: 6, backgroundColor: "rgba(46,111,64,0.1)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", backgroundColor: "#68BA7F", borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserAnalytics({ user, onClose }: { user: RegisteredUser; onClose: () => void }) {
  const name = user.username || user.displayName || user.randomId || user.id.slice(0, 8);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, backgroundColor: "rgba(17,27,33,0.35)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <aside style={{ width: "min(520px, 100%)", height: "100%", overflowY: "auto", backgroundColor: "#FCF5EB", padding: "28px 24px 48px", boxShadow: "-12px 0 40px rgba(17,27,33,0.16)" }} onClick={(event) => event.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 26 }}>
          <div>
            <p style={{ margin: "0 0 5px", color: "#2E6F40", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>User analytics</p>
            <h2 style={{ margin: 0, fontSize: 25, color: "#111B21", letterSpacing: "-0.03em" }}>{name}</h2>
            <p style={{ margin: "7px 0 0", color: "rgba(37,61,44,0.55)", fontSize: 12 }}>{user.accountType} account · Joined {formatDate(user.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close analytics" style={{ border: "1px solid rgba(37,61,44,0.14)", borderRadius: 9, background: "white", color: "#253D2C", cursor: "pointer", fontSize: 18, width: 34, height: 34 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 20 }}>
          {[
            ["Detected country", user.access.detectedCountry || "Unknown"],
            ["Detected city", user.access.detectedCity || "Unknown"],
            ["Latest device", formatLabel(user.access.latestDevice)],
            ["Sessions", String(user.access.sessionCount)],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "white", border: "1px solid rgba(37,61,44,0.1)", borderRadius: 13, padding: 14 }}>
              <div style={{ color: "rgba(37,61,44,0.48)", fontSize: 11, marginBottom: 6 }}>{label}</div>
              <strong style={{ color: "#111B21", fontSize: 14, overflowWrap: "anywhere" }}>{value}</strong>
            </div>
          ))}
        </div>

        <div style={{ background: "white", border: "1px solid rgba(37,61,44,0.1)", borderRadius: 16, padding: 20, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, margin: "0 0 16px", color: "#111B21" }}>Survey responses</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["Country they selected", user.survey.country],
              ["Device they selected", user.survey.device],
              ["How they found VeilChat", user.survey.source],
              ["What brings them here", user.survey.goal],
              ["Completed", user.survey.completedAt ? formatDate(user.survey.completedAt) : "Skipped or not completed"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 18, borderBottom: "1px solid rgba(37,61,44,0.07)", paddingBottom: 10, fontSize: 12 }}>
                <span style={{ color: "rgba(37,61,44,0.5)" }}>{label}</span>
                <strong style={{ color: "#253D2C", textAlign: "right" }}>{formatLabel(value)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid rgba(37,61,44,0.1)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, margin: "0 0 5px", color: "#111B21" }}>Access history</h3>
          <p style={{ margin: "0 0 15px", color: "rgba(37,61,44,0.48)", fontSize: 11 }}>Coarse location and device only. Raw IP addresses are never displayed.</p>
          {user.access.history.length === 0 ? (
            <p style={{ color: "rgba(37,61,44,0.45)", fontSize: 12 }}>No sign-in history available.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {user.access.history.map((session, index) => (
                <div key={`${session.lastSeenAt}-${index}`} style={{ paddingBottom: 10, borderBottom: "1px solid rgba(37,61,44,0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                    <strong style={{ color: "#253D2C" }}>{session.country || "Unknown country"}{session.city ? ` · ${session.city}` : ""}</strong>
                    <span style={{ color: "rgba(37,61,44,0.45)", whiteSpace: "nowrap" }}>{formatDate(session.lastSeenAt)}</span>
                  </div>
                  <div style={{ color: "rgba(37,61,44,0.5)", fontSize: 11, marginTop: 4 }}>{formatLabel(session.device)} · signed in {formatDate(session.signedInAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function useLiveUserCount(refreshMs = 5000) {
  const [count, setCount] = useState<number | null>(null);
  const [history, setHistory] = useState<PresenceSnapshot[]>([]);
  const [error, setError] = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/active-users`, { cache: "no-store" });
      if (!res.ok) { setError(true); return; }
      const data = (await res.json()) as { count: number };
      const snap: PresenceSnapshot = { count: data.count, ts: new Date() };
      setCount(data.count);
      setError(false);
      setHistory((prev) => [...prev.slice(-59), snap]);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void fetch_();
    const id = setInterval(() => { void fetch_(); }, refreshMs);
    return () => clearInterval(id);
  }, [fetch_, refreshMs]);

  return { count, history, error };
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const { count, history, error } = useLiveUserCount(5000);
  const users = useRegisteredUsers();
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "status">("overview");
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);

  // Force re-render key on count change for number animation
  useEffect(() => { setTick((t) => t + 1); }, [count]);

  const peak = history.length ? Math.max(...history.map((h) => h.count)) : 0;
  const barMax = Math.max(peak, 1);
  const lastUpdated = history.at(-1)?.ts;

  const tabStyle = (tab: "overview" | "status"): React.CSSProperties => ({
    fontSize: 13,
    fontWeight: 600,
    padding: "6px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
    background: activeTab === tab ? "#2E6F40" : "transparent",
    color: activeTab === tab ? "white" : "rgba(37,61,44,0.55)",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: activeTab === "status" ? "#060A07" : "#FCF5EB", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: "#111B21" }}>

      {/* Grid background — only for overview */}
      {activeTab === "overview" && (
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#253D2C06 1px, transparent 1px), linear-gradient(90deg, #253D2C06 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none", zIndex: 0 }} />
      )}

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: activeTab === "status" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(37,61,44,0.09)", backgroundColor: activeTab === "status" ? "rgba(6,10,7,0.96)" : "rgba(252,245,235,0.92)", backdropFilter: "blur(14px)" }}>
        <div style={{ maxWidth: activeTab === "status" ? "none" : 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#2E6F40", display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: activeTab === "status" ? "#F0FDF4" : "#111B21", letterSpacing: "-0.02em" }}>VeilChat</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#2E6F40", backgroundColor: "rgba(46,111,64,0.1)", padding: "2px 9px", borderRadius: 100, border: "1px solid rgba(46,111,64,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Team
            </span>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, backgroundColor: activeTab === "status" ? "rgba(255,255,255,0.06)" : "rgba(37,61,44,0.07)", borderRadius: 10, padding: 3 }}>
            <button style={tabStyle("overview")} onClick={() => setActiveTab("overview")}>Overview</button>
            <button style={tabStyle("status")}   onClick={() => setActiveTab("status")}>System Status</button>
          </div>

          {/* Sign out */}
          <button
            onClick={onSignOut}
            style={{ fontSize: 13, color: activeTab === "status" ? "#9CA3AF" : "#253D2C", background: activeTab === "status" ? "rgba(255,255,255,0.06)" : "white", border: activeTab === "status" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(37,61,44,0.14)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 500, transition: "all 0.15s", flexShrink: 0 }}
            onMouseOver={(e) => { e.currentTarget.style.color = activeTab === "status" ? "#F0FDF4" : "#2E6F40"; }}
            onMouseOut={(e)  => { e.currentTarget.style.color = activeTab === "status" ? "#9CA3AF" : "#253D2C"; }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── System Status tab ── */}
      {activeTab === "status" && <StatusContent />}

      {/* ── Overview tab body ── */}
      {activeTab === "overview" && (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Page title */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#111B21", letterSpacing: "-0.025em", margin: "0 0 6px" }}>
            Team Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "#253D2C", opacity: 0.5, margin: 0 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* ── User insights ── */}
        {users.data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 14 }}>
              {[
                ["Survey responses", `${users.data.analytics.surveyCompleted} / ${users.data.total}`, "completed"],
                ["Detected countries", String(users.data.analytics.detectedCountries.length), "from sign-ins"],
                ["Detected devices", String(users.data.analytics.detectedDevices.length), "from sessions"],
                ["Tracked sessions", String(users.data.analytics.activeSessions), "coarse location"],
              ].map(([label, value, detail]) => (
                <div key={label} style={{ background: "white", border: "1px solid rgba(37,61,44,0.1)", borderRadius: 15, padding: "16px 17px" }}>
                  <div style={{ color: "rgba(37,61,44,0.48)", fontSize: 11, marginBottom: 7 }}>{label}</div>
                  <strong style={{ display: "block", color: "#111B21", fontSize: 22, letterSpacing: "-0.03em" }}>{value}</strong>
                  <span style={{ color: "rgba(37,61,44,0.42)", fontSize: 11 }}>{detail}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 32 }}>
              <DistributionList title="Where users say they are from" items={users.data.analytics.surveyCountries} />
              <DistributionList title="How users discovered VeilChat" items={users.data.analytics.discoverySources} />
              <DistributionList title="Current access countries" items={users.data.analytics.detectedCountries} />
              <DistributionList title="Survey device choices" items={users.data.analytics.surveyDevices} />
              <DistributionList title="Detected devices" items={users.data.analytics.detectedDevices} />
              <DistributionList title="What users want" items={users.data.analytics.surveyGoals} />
            </div>
          </>
        )}

        {/* ── Live users card ── */}
        <div style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid rgba(37,61,44,0.1)", padding: "32px 32px 28px", boxShadow: "0 4px 24px rgba(17,27,33,0.07), inset 0 1px 0 rgba(255,255,255,1)", marginBottom: 20 }}>

          {/* Card header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: error ? "#E53E3E" : "#68BA7F", boxShadow: error ? "0 0 0 3px rgba(229,62,62,0.2)" : "0 0 0 3px rgba(104,186,127,0.2)", animation: error ? undefined : "taPulse 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#253D2C", opacity: 0.5, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {error ? "Connection error" : "Live · updates every 5s"}
                </span>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111B21", margin: 0, letterSpacing: "-0.01em" }}>
                Active Users on veilchat.me
              </h2>
            </div>
            <div style={{ fontSize: 11.5, color: "#253D2C", opacity: 0.4, textAlign: "right", paddingTop: 2 }}>
              {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Fetching…"}
            </div>
          </div>

          {/* Big number */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 32 }}>
            <div key={tick} style={{ fontSize: "clamp(56px,8vw,96px)", fontWeight: 800, color: "#111B21", letterSpacing: "-0.04em", lineHeight: 1, animation: "taCount 0.3s ease" }}>
              {count === null ? "—" : count}
            </div>
            <div style={{ paddingBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2E6F40", marginBottom: 2 }}>users online</div>
              <div style={{ fontSize: 12, color: "#253D2C", opacity: 0.4 }}>in the last 2 minutes</div>
            </div>
            {peak > 0 && (
              <div style={{ marginLeft: "auto", paddingBottom: 10, textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#253D2C", opacity: 0.45, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Session peak</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#2E6F40", letterSpacing: "-0.02em" }}>{peak}</div>
              </div>
            )}
          </div>

          {/* Spark bars — last 60 readings */}
          {history.length > 1 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#253D2C", opacity: 0.35, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                Activity — last {history.length} readings
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 52 }}>
                {history.map((snap, i) => {
                  const pct = barMax > 0 ? (snap.count / barMax) : 0;
                  const h = Math.max(4, Math.round(pct * 52));
                  const isLatest = i === history.length - 1;
                  return (
                    <div
                      key={i}
                      title={`${snap.count} users · ${snap.ts.toLocaleTimeString()}`}
                      style={{ flex: 1, height: h, borderRadius: 3, backgroundColor: isLatest ? "#2E6F40" : "#68BA7F", opacity: isLatest ? 1 : 0.5 + (i / history.length) * 0.5, transition: "height 0.4s ease", cursor: "default" }}
                    />
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, color: "rgba(37,61,44,0.3)" }}>
                <span>{history[0]?.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span>Now</span>
              </div>
            </div>
          )}

          {history.length <= 1 && count === null && (
            <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, color: "rgba(37,61,44,0.3)", fontSize: 13 }}>
              <SmallSpinner color="#68BA7F" />
              Connecting to server…
            </div>
          )}
        </div>

        {/* Stat strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { label: "Session high",   value: peak > 0 ? String(peak) : "—", sub: "this session" },
            { label: "Readings taken", value: String(history.length),        sub: "since page load" },
            { label: "Refresh rate",   value: "5s",                          sub: "live polling" },
            { label: "Tracking window",value: "2 min",                       sub: "presence TTL" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid rgba(37,61,44,0.09)", padding: "18px 20px", boxShadow: "0 2px 10px rgba(17,27,33,0.04)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#253D2C", opacity: 0.45, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111B21", letterSpacing: "-0.03em", marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11.5, color: "#253D2C", opacity: 0.4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Registered users section ── */}
        <div style={{ marginTop: 32 }}>

          {/* Section header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111B21", letterSpacing: "-0.02em", margin: "0 0 3px" }}>
                Registered Users
                {users.data && (
                  <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 700, color: "#2E6F40", backgroundColor: "rgba(46,111,64,0.1)", padding: "2px 10px", borderRadius: 100, verticalAlign: "middle" }}>
                    {users.data.total}
                  </span>
                )}
              </h2>
              <p style={{ fontSize: 13, color: "#253D2C", opacity: 0.45, margin: 0 }}>All accounts created on veilchat.me</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(37,61,44,0.4)" strokeWidth="2.5" strokeLinecap="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users…"
                  value={users.search}
                  onChange={(e) => users.setSearch(e.target.value)}
                  style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid rgba(37,61,44,0.14)", borderRadius: 9, backgroundColor: "white", fontSize: 13, color: "#111B21", outline: "none", width: 180, boxShadow: "0 1px 3px rgba(17,27,33,0.05)" }}
                  onFocus={(e) => { e.target.style.borderColor = "#2E6F40"; e.target.style.boxShadow = "0 0 0 3px rgba(46,111,64,0.1)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "rgba(37,61,44,0.14)"; e.target.style.boxShadow = "0 1px 3px rgba(17,27,33,0.05)"; }}
                />
              </div>
              {/* Refresh */}
              <button
                onClick={() => { void users.refetch(); }}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#253D2C", background: "white", border: "1px solid rgba(37,61,44,0.14)", borderRadius: 9, padding: "7px 12px", cursor: "pointer", fontWeight: 500, boxShadow: "0 1px 3px rgba(17,27,33,0.05)" }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = "#2E6F40"; e.currentTarget.style.color = "#2E6F40"; }}
                onMouseOut={(e)  => { e.currentTarget.style.borderColor = "rgba(37,61,44,0.14)"; e.currentTarget.style.color = "#253D2C"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Card */}
          <div style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid rgba(37,61,44,0.1)", overflow: "hidden", boxShadow: "0 4px 24px rgba(17,27,33,0.07), inset 0 1px 0 rgba(255,255,255,1)" }}>

            {/* Loading */}
            {users.loading && (
              <div style={{ padding: "52px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: "rgba(37,61,44,0.35)" }}>
                <SmallSpinner color="#68BA7F" />
                <span style={{ fontSize: 13 }}>Loading users from database…</span>
              </div>
            )}

            {/* Error / needs deploy */}
            {!users.loading && users.error && (
              <div style={{ padding: "40px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#C53030", marginBottom: 6 }}>Could not fetch users</p>
                <p style={{ fontSize: 13, color: "rgba(37,61,44,0.45)", maxWidth: 340, margin: "0 auto" }}>
                  The server needs to be redeployed on Render for this endpoint to be available.
                </p>
              </div>
            )}

            {/* Empty */}
            {!users.loading && !users.error && users.filtered.length === 0 && (
              <div style={{ padding: "40px 32px", textAlign: "center", color: "rgba(37,61,44,0.4)", fontSize: 14 }}>
                {users.search ? `No users matching "${users.search}"` : "No registered users yet."}
              </div>
            )}

            {/* Table header */}
            {!users.loading && !users.error && users.filtered.length > 0 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 110px 140px", padding: "11px 20px", borderBottom: "1px solid rgba(37,61,44,0.07)", backgroundColor: "rgba(37,61,44,0.02)" }}>
                  {["#", "Username", "Account type", "Joined"].map((h) => (
                    <div key={h} style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(37,61,44,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>

                {/* Rows */}
                <div style={{ maxHeight: 520, overflowY: "auto" }}>
                  {users.filtered.map((u, i) => {
                    const name = users.displayName(u);
                    const initials = name.slice(0, 2).toUpperCase();
                    const typeColor =
                      u.accountType === "email"  ? { bg: "rgba(59,130,246,0.08)", text: "#1D4ED8", border: "rgba(59,130,246,0.2)" } :
                      u.accountType === "phone"  ? { bg: "rgba(16,185,129,0.08)", text: "#065F46", border: "rgba(16,185,129,0.2)" } :
                                                   { bg: "rgba(139,92,246,0.08)", text: "#5B21B6", border: "rgba(139,92,246,0.2)" };
                    const joined = new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const isEven = i % 2 === 0;

                    return (
                      <div
                        key={u.id}
                        role="button"
                        tabIndex={0}
                        title="Open user analytics"
                        onClick={() => setSelectedUser(u)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedUser(u);
                          }
                        }}
                        style={{ display: "grid", gridTemplateColumns: "52px 1fr 110px 140px", padding: "12px 20px", alignItems: "center", borderBottom: "1px solid rgba(37,61,44,0.05)", backgroundColor: isEven ? "white" : "rgba(37,61,44,0.015)", transition: "background-color 0.15s", cursor: "pointer" }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "rgba(46,111,64,0.04)"; }}
                        onMouseOut={(e)  => { e.currentTarget.style.backgroundColor = isEven ? "white" : "rgba(37,61,44,0.015)"; }}
                      >
                        {/* Serial */}
                        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(37,61,44,0.35)" }}>{i + 1}</div>

                        {/* Avatar + name */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: `hsl(${(name.charCodeAt(0) * 37) % 360}, 45%, 88%)`, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: `hsl(${(name.charCodeAt(0) * 37) % 360}, 55%, 32%)`, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111B21" }}>{name}</div>
                            {u.username && u.displayName && u.displayName !== u.username && (
                              <div style={{ fontSize: 11, color: "rgba(37,61,44,0.4)" }}>{u.displayName}</div>
                            )}
                            <div style={{ fontSize: 10.5, color: "rgba(37,61,44,0.45)", marginTop: 3 }}>
                              {u.access.detectedCountry || "Location unknown"} · {u.survey.completedAt ? "Survey complete" : "Survey pending"}
                            </div>
                          </div>
                        </div>

                        {/* Account type badge */}
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: typeColor.text, backgroundColor: typeColor.bg, border: `1px solid ${typeColor.border}`, padding: "2px 8px", borderRadius: 100, letterSpacing: "0.04em" }}>
                            {u.accountType}
                          </span>
                        </div>

                        {/* Joined */}
                        <div style={{ fontSize: 12, color: "rgba(37,61,44,0.45)" }}>{joined}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer count */}
                <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(37,61,44,0.07)", backgroundColor: "rgba(37,61,44,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(37,61,44,0.4)" }}>
                    {users.search
                      ? `${users.filtered.length} of ${users.data?.total ?? 0} users match`
                      : `${users.data?.total ?? 0} total registered users`}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["email", "phone", "random"] as const).map((t) => {
                      const n = users.data?.users.filter((u) => u.accountType === t).length ?? 0;
                      if (!n) return null;
                      return (
                        <span key={t} style={{ fontSize: 11, color: "rgba(37,61,44,0.45)", backgroundColor: "rgba(37,61,44,0.06)", padding: "2px 8px", borderRadius: 100 }}>
                          {n} {t}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {selectedUser && (
        <UserAnalytics user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <style>{`
        @keyframes taShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes taSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes taPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.88)} }
        @keyframes taCount { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

/* ── Root ── */
export function AdminPage() {
  const { authed, grant, revoke } = useSession();
  return authed ? <Dashboard onSignOut={revoke} /> : <LoginScreen onSuccess={grant} />;
}

/* ── Micro icons ── */
function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function SmallSpinner({ color = "white" }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ animation: "taSpin 0.7s linear infinite", flexShrink: 0 }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
