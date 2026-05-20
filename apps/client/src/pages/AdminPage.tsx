import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Auth constants (SHA-256 hashes — plain credentials never stored here) ─── */
const U_HASH = "2c3c77a8496efe23a03a47e3f740bea0db8bbad50bcf66dad24ef1647535115a";
const P_HASH = "fd3f62a4bd11b22d47a1d6fa00cbda4ec08d5670c2f18effe5be837be22e0234";
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
  const [tick, setTick] = useState(0);

  // Force re-render key on count change for number animation
  useEffect(() => { setTick((t) => t + 1); }, [count]);

  const peak = history.length ? Math.max(...history.map((h) => h.count)) : 0;
  const barMax = Math.max(peak, 1);
  const lastUpdated = history.at(-1)?.ts;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FCF5EB", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: "#111B21" }}>

      {/* Grid background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#253D2C06 1px, transparent 1px), linear-gradient(90deg, #253D2C06 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(37,61,44,0.09)", backgroundColor: "rgba(252,245,235,0.92)", backdropFilter: "blur(14px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#2E6F40", display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#111B21", letterSpacing: "-0.02em" }}>VeilChat</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#2E6F40", backgroundColor: "rgba(46,111,64,0.1)", padding: "2px 9px", borderRadius: 100, border: "1px solid rgba(46,111,64,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Team
            </span>
          </div>
          <button
            onClick={onSignOut}
            style={{ fontSize: 13, color: "#253D2C", background: "white", border: "1px solid rgba(37,61,44,0.14)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 500, transition: "all 0.15s", boxShadow: "0 1px 3px rgba(17,27,33,0.06)" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#2E6F40"; e.currentTarget.style.color = "#2E6F40"; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = "rgba(37,61,44,0.14)"; e.currentTarget.style.color = "#253D2C"; }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Body */}
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

        {/* More coming note */}
        <div style={{ marginTop: 28, borderRadius: 12, border: "1.5px dashed rgba(37,61,44,0.15)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, color: "rgba(37,61,44,0.4)", fontSize: 13 }}>
          <span style={{ fontSize: 18 }}>＋</span>
          More sections — tell us what to add next.
        </div>
      </div>

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
