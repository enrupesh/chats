import { useState, useEffect, useRef } from "react";

const U_HASH = "2c3c77a8496efe23a03a47e3f740bea0db8bbad50bcf66dad24ef1647535115a";
const P_HASH = "fd3f62a4bd11b22d47a1d6fa00cbda4ec08d5670c2f18effe5be837be22e0234";
const SESSION_KEY = "veil:team:session";

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

/* ─── Login screen ─── */

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("")  ;
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
    await new Promise((r) => setTimeout(r, 420));

    if (uh === U_HASH && ph === P_HASH) {
      onSuccess();
    } else {
      setLoading(false);
      setError("Invalid credentials.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#07090C", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", padding: "24px" }}>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          animation: shake ? "taShake 0.5s ease" : undefined,
        }}
      >
        {/* Card */}
        <div style={{ backgroundColor: "#0E1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "44px 40px 40px", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)" }}>

          {/* Logo mark */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(79,70,229,0.35)" }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
              Team Access
            </h1>
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
              Restricted area · VeilChat internal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Username */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>
                Username
              </label>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                autoComplete="off"
                spellCheck={false}
                placeholder="Enter username"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  backgroundColor: "#161B27",
                  border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 10,
                  padding: "11px 14px",
                  fontSize: 14,
                  color: "#F1F5F9",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                onBlur={(e)  => { e.target.style.borderColor = error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#161B27",
                    border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 10,
                    padding: "11px 44px 11px 14px",
                    fontSize: 14,
                    color: "#F1F5F9",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 4, display: "flex", alignItems: "center" }}
                >
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#FCA5A5" }}>
                <span style={{ fontSize: 15 }}>⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.01em",
                transition: "opacity 0.2s, transform 0.1s",
                boxShadow: loading ? "none" : "0 4px 16px rgba(79,70,229,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
              onMouseOut={(e)  => { e.currentTarget.style.opacity = "1"; }}
            >
              {loading ? <Spinner /> : null}
              {loading ? "Verifying…" : "Sign in"}
            </button>

          </form>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11.5, color: "#1E293B" }}>
          Authorised personnel only
        </p>
      </div>

      <style>{`
        @keyframes taShake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
        @keyframes taSpin {
          from{transform:rotate(0deg)} to{transform:rotate(360deg)}
        }
      `}</style>
    </div>
  );
}

/* ─── Dashboard shell (post-login) ─── */

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#07090C", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", color: "#F8FAFC" }}>

      {/* Top bar */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(7,9,12,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>VeilChat</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#818CF8", backgroundColor: "rgba(99,102,241,0.12)", padding: "2px 8px", borderRadius: 100, border: "1px solid rgba(99,102,241,0.2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Team
            </span>
          </div>
          <button
            onClick={onSignOut}
            style={{ fontSize: 13, color: "#475569", background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseOver={(e) => { e.currentTarget.style.color = "#F8FAFC"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseOut={(e)  => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Welcome area */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 10px", background: "linear-gradient(135deg, #F8FAFC 30%, #818CF8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>
            VeilChat internal team panel · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Placeholder area — more sections coming */}
        <div style={{ backgroundColor: "#0E1117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", display: "grid", placeItems: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(79,70,229,0.3)" }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
            Panel ready
          </h2>
          <p style={{ fontSize: 13.5, color: "#334155", maxWidth: 340, margin: "0 auto", lineHeight: 1.6 }}>
            You're signed in as the team. More sections will appear here as they're added.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Root component ─── */

export function AdminPage() {
  const { authed, grant, revoke } = useSession();
  return authed
    ? <Dashboard onSignOut={revoke} />
    : <LoginScreen onSuccess={grant} />;
}

/* ─── Icons ─── */

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "taSpin 0.7s linear infinite" }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
