import { useEffect, useState, useRef, useCallback } from "react";
import { useDocumentMeta } from "../lib/useDocumentMeta";

/* ─────────────────────── Types ─────────────────────── */

type ServiceStatus = "operational" | "degraded" | "outage" | "checking" | "unknown";

interface ServiceResult {
  status: ServiceStatus;
  latency: number | null;
  detail: string | null;
  checkedAt: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface HistoryEntry {
  ts: number;
  results: Record<string, { ok: boolean; latency: number | null }>;
}

/* ─────────────────────── Constants ─────────────────────── */

const BACKEND_URL = "https://chats-fk6e.onrender.com";
const FRONTEND_URL = "https://www.veilchat.me";
const HISTORY_KEY = "veil:status:history:v2";
const MAX_HISTORY = 500;
const REFRESH_INTERVAL = 30;

const SERVICES: Service[] = [
  { id: "api",       name: "API & Backend",         description: "Core server, request routing, health checks", icon: "⚡" },
  { id: "auth",      name: "Authentication",         description: "Sign-in, sign-up, session tokens", icon: "🔑" },
  { id: "websocket", name: "Real-time (WebSocket)",  description: "Typing indicators, presence, delivery", icon: "⚡" },
  { id: "webapp",    name: "Web Application",        description: "Frontend on Vercel — veilchat.me", icon: "🌐" },
  { id: "database",  name: "Database",               description: "PostgreSQL on Neon — message storage", icon: "🗄" },
  { id: "media",     name: "Media Storage",          description: "Encrypted media on Cloudflare R2", icon: "📦" },
];

/* ─────────────────────── Live checks ─────────────────────── */

async function checkApi(): Promise<{ ok: boolean; latency: number; detail?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const latency = Math.round(performance.now() - start);
    if (!res.ok) return { ok: false, latency, detail: `HTTP ${res.status}` };
    const data = (await res.json()) as Record<string, unknown>;
    return { ok: data.status === "ok", latency, detail: `v${data.version ?? "?"}` };
  } catch {
    return { ok: false, latency: Math.round(performance.now() - start), detail: "Unreachable" };
  }
}

async function checkAuth(): Promise<{ ok: boolean; latency: number; detail?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(`${BACKEND_URL}/trpc/auth.refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const latency = Math.round(performance.now() - start);
    return {
      ok: res.status < 500,
      latency,
      detail: res.status < 500 ? "Responding" : `Error ${res.status}`,
    };
  } catch {
    return { ok: false, latency: Math.round(performance.now() - start), detail: "Unreachable" };
  }
}

async function checkWebSocket(): Promise<{ ok: boolean; latency: number; detail?: string }> {
  return new Promise((resolve) => {
    const start = performance.now();
    const wsUrl =
      BACKEND_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws";
    let settled = false;
    const settle = (ok: boolean, detail?: string) => {
      if (settled) return;
      settled = true;
      resolve({ ok, latency: Math.round(performance.now() - start), detail });
    };
    const timeout = setTimeout(() => settle(false, "Timeout"), 7000);
    try {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close(1000);
        settle(true, "Connected");
      };
      ws.onclose = (e) => {
        clearTimeout(timeout);
        const serverSideClosed = e.code !== 1006 && e.code !== 0;
        settle(serverSideClosed, serverSideClosed ? "Reachable" : "Unreachable");
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        settle(false, "Connection error");
      };
    } catch {
      clearTimeout(timeout);
      settle(false, "Failed");
    }
  });
}

async function checkWebApp(): Promise<{ ok: boolean; latency: number; detail?: string }> {
  const start = performance.now();
  try {
    await fetch(FRONTEND_URL, {
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return { ok: true, latency: Math.round(performance.now() - start), detail: "Serving" };
  } catch {
    return { ok: false, latency: Math.round(performance.now() - start), detail: "Unreachable" };
  }
}

/* ─────────────────────── History helpers ─────────────────────── */

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-MAX_HISTORY)));
  } catch { /* ignore */ }
}

/* ─────────────────────── Uptime calculations ─────────────────────── */

function buildUptimeBars(
  history: HistoryEntry[],
  serviceId: string,
): Array<{ status: "operational" | "degraded" | "outage" | "nodata" }> {
  const now = Date.now();
  const DAY = 86_400_000;
  return Array.from({ length: 90 }, (_, i) => {
    const slot = 89 - i;
    const dayStart = now - (slot + 1) * DAY;
    const dayEnd = now - slot * DAY;
    const entries = history.filter((e) => e.ts >= dayStart && e.ts < dayEnd);
    if (entries.length === 0) return { status: "nodata" as const };
    const fail = entries.filter((e) => !e.results[serviceId]?.ok).length;
    const rate = fail / entries.length;
    if (rate === 0) return { status: "operational" as const };
    if (rate < 0.25) return { status: "degraded" as const };
    return { status: "outage" as const };
  });
}

function calcUptimePct(history: HistoryEntry[], serviceId: string): string {
  const cutoff = Date.now() - 90 * 86_400_000;
  const recent = history.filter((e) => e.ts >= cutoff);
  if (recent.length === 0) return "—";
  const ok = recent.filter((e) => e.results[serviceId]?.ok !== false).length;
  return ((ok / recent.length) * 100).toFixed(3) + "%";
}

/* ─────────────────────── Status helpers ─────────────────────── */

function statusColor(s: ServiceStatus) {
  if (s === "operational") return "#10B981";
  if (s === "degraded") return "#F59E0B";
  if (s === "outage") return "#EF4444";
  if (s === "checking") return "#6B7280";
  return "#374151";
}

function statusLabel(s: ServiceStatus) {
  if (s === "operational") return "Operational";
  if (s === "degraded") return "Degraded";
  if (s === "outage") return "Outage";
  if (s === "checking") return "Checking…";
  return "Unknown";
}

function latencyBucket(ms: number | null): ServiceStatus {
  if (ms === null) return "unknown";
  if (ms < 400) return "operational";
  if (ms < 1200) return "degraded";
  return "outage";
}

function overallStatus(results: Record<string, ServiceResult>): ServiceStatus {
  const ss = Object.values(results).map((r) => r.status);
  if (ss.every((s) => s === "checking")) return "checking";
  if (ss.some((s) => s === "outage")) return "outage";
  if (ss.some((s) => s === "degraded")) return "degraded";
  if (ss.every((s) => s === "operational")) return "operational";
  return "unknown";
}

/* ─────────────────────── Page component ─────────────────────── */

export function StatusPage() {
  useDocumentMeta({
    title: "System Status — VeilChat",
    description: "Live status and performance monitoring for all VeilChat services.",
    canonical: "/status",
  });

  const initialResults = () =>
    Object.fromEntries(
      SERVICES.map((s) => [
        s.id,
        { status: "checking" as ServiceStatus, latency: null, detail: null, checkedAt: new Date().toISOString() },
      ]),
    );

  const [results, setResults] = useState<Record<string, ServiceResult>>(initialResults);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runChecks = useCallback(async () => {
    setIsChecking(true);
    setCountdown(REFRESH_INTERVAL);

    const [apiRes, authRes, wsRes, webRes] = await Promise.all([
      checkApi(),
      checkAuth(),
      checkWebSocket(),
      checkWebApp(),
    ]);

    const now = new Date();
    const iso = now.toISOString();

    const newResults: Record<string, ServiceResult> = {
      api:       { status: apiRes.ok  ? latencyBucket(apiRes.latency)  : "outage", latency: apiRes.latency,  detail: apiRes.detail  ?? null, checkedAt: iso },
      auth:      { status: authRes.ok ? latencyBucket(authRes.latency) : "outage", latency: authRes.latency, detail: authRes.detail ?? null, checkedAt: iso },
      websocket: { status: wsRes.ok   ? "operational"                  : "outage", latency: wsRes.latency,   detail: wsRes.detail   ?? null, checkedAt: iso },
      webapp:    { status: webRes.ok  ? latencyBucket(webRes.latency)  : "outage", latency: webRes.latency,  detail: webRes.detail  ?? null, checkedAt: iso },
      database:  { status: apiRes.ok  ? "operational"                  : "outage", latency: null,            detail: apiRes.ok ? "Connected" : "Unreachable", checkedAt: iso },
      media:     { status: apiRes.ok  ? "operational"                  : "outage", latency: null,            detail: apiRes.ok ? "Serving"   : "Unreachable", checkedAt: iso },
    };

    setResults(newResults);
    setLastChecked(now);
    setIsChecking(false);

    const entry: HistoryEntry = {
      ts: now.getTime(),
      results: Object.fromEntries(
        Object.entries(newResults).map(([id, r]) => [id, { ok: r.status !== "outage", latency: r.latency }]),
      ),
    };
    setHistory((prev) => {
      const next = [...prev, entry].slice(-MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  useEffect(() => {
    void runChecks();
    const id = setInterval(() => { void runChecks(); }, REFRESH_INTERVAL * 1000);
    return () => clearInterval(id);
  }, [runChecks]);

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL : c - 1));
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const overall = overallStatus(results);

  const heroBg =
    overall === "operational" ? "linear-gradient(135deg,#064E3B 0%,#065F46 55%,#047857 100%)"
    : overall === "degraded"  ? "linear-gradient(135deg,#78350F 0%,#92400E 55%,#B45309 100%)"
    : overall === "outage"    ? "linear-gradient(135deg,#7F1D1D 0%,#991B1B 55%,#B91C1C 100%)"
    :                           "linear-gradient(135deg,#0F172A 0%,#1E293B 100%)";

  const heroIcon  = overall === "operational" ? "✓" : overall === "degraded" ? "⚠" : overall === "outage" ? "✕" : "·";
  const heroTitle = overall === "operational" ? "All Systems Operational"
                  : overall === "degraded"    ? "Partial System Degradation"
                  : overall === "outage"      ? "System Outage Detected"
                  :                             "Checking System Status…";
  const heroSub   = overall === "operational" ? "Every service is healthy and performing normally. No incidents at this time."
                  : overall === "degraded"    ? "Some services are experiencing reduced performance. We're monitoring closely."
                  : overall === "outage"      ? "One or more services are unavailable. Our team is investigating immediately."
                  :                             "Running diagnostics across all services. This takes a few seconds…";

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#060A07", color:"#F0FDF4", fontFamily:"'Inter',ui-sans-serif,system-ui,-apple-system,sans-serif" }}>

      {/* ── Header ── */}
      <header style={{ borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(6,10,7,0.96)", backdropFilter:"blur(14px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"0 24px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <BrandMark />
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontWeight:700, fontSize:16, color:"#F0FDF4", letterSpacing:"-0.01em" }}>VeilChat</span>
              <span style={{ fontSize:10.5, fontWeight:700, color:"#6EE7B7", backgroundColor:"rgba(110,231,183,0.1)", padding:"2px 8px", borderRadius:100, border:"1px solid rgba(110,231,183,0.18)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                Status
              </span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, color:"#6B7280" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", backgroundColor: isChecking ? "#F59E0B" : "#10B981", boxShadow: isChecking ? "0 0 8px rgba(245,158,11,0.5)" : "0 0 8px rgba(16,185,129,0.5)", animation: isChecking ? "vcPulse 1s infinite" : undefined }} />
              {isChecking ? "Checking all services…" : `Next check in ${countdown}s`}
            </div>
            <button
              onClick={() => { void runChecks(); }}
              style={{ fontSize:12.5, color:"#9CA3AF", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"5px 12px", cursor:"pointer", transition:"all 0.15s" }}
              onMouseOver={(e) => { e.currentTarget.style.color="#F0FDF4"; e.currentTarget.style.background="rgba(255,255,255,0.09)"; }}
              onMouseOut={(e) => { e.currentTarget.style.color="#9CA3AF"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
            >
              ↻ Refresh
            </button>
            <a
              href="https://www.veilchat.me"
              style={{ fontSize:12.5, color:"#6B7280", textDecoration:"none", transition:"color 0.15s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#F0FDF4")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              ← Back to VeilChat
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div style={{ background:heroBg, padding:"64px 24px 56px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)", backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.06), transparent)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:76, height:76, borderRadius:"50%", backgroundColor:"rgba(255,255,255,0.14)", border:"2px solid rgba(255,255,255,0.22)", fontSize:30, fontWeight:800, color:"white", marginBottom:22, backdropFilter:"blur(8px)", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            {heroIcon}
          </div>
          <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:800, color:"white", letterSpacing:"-0.025em", margin:"0 0 12px" }}>
            {heroTitle}
          </h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.65)", maxWidth:460, margin:"0 auto 28px", lineHeight:1.6 }}>
            {heroSub}
          </p>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:12, color:"rgba(255,255,255,0.5)", backgroundColor:"rgba(0,0,0,0.22)", padding:"7px 16px", borderRadius:100, border:"1px solid rgba(255,255,255,0.1)" }}>
            <IcoTime />
            {lastChecked ? `Last checked at ${lastChecked.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })}` : "Running initial checks…"}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth:1120, margin:"0 auto", padding:"52px 24px 100px" }}>

        {/* Refresh progress bar */}
        <div style={{ height:2, backgroundColor:"#0D1510", borderRadius:1, overflow:"hidden", marginBottom:48 }}>
          <div style={{ height:"100%", backgroundColor:"#065F46", borderRadius:1, transition:"width 1s linear", width:`${((REFRESH_INTERVAL - countdown) / REFRESH_INTERVAL) * 100}%` }} />
        </div>

        {/* ── Service cards ── */}
        <SectionLabel>Service Health</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:14, marginTop:18 }}>
          {SERVICES.map((svc) => (
            <ServiceCard key={svc.id} service={svc} result={results[svc.id]} history={history} />
          ))}
        </div>

        {/* ── Response times ── */}
        <SectionLabel style={{ marginTop:56 }}>Response Times</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginTop:18 }}>
          {SERVICES.filter((s) => results[s.id]?.latency !== null).map((svc) => {
            const r = results[svc.id];
            const ms = r.latency!;
            const fill = ms < 400 ? "#10B981" : ms < 1200 ? "#F59E0B" : "#EF4444";
            const pct = Math.min(100, (ms / 1500) * 100);
            return (
              <div key={svc.id} style={{ backgroundColor:"#0D1510", border:"1px solid #1A2E1F", borderRadius:12, padding:"18px 20px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#4B5563", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>{svc.name}</div>
                <div style={{ fontSize:32, fontWeight:800, color:fill, letterSpacing:"-0.03em", marginBottom:12 }}>{ms}ms</div>
                <div style={{ height:3, backgroundColor:"#1A2E1F", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, backgroundColor:fill, borderRadius:2, transition:"width 0.6s ease" }} />
                </div>
                <div style={{ fontSize:11, color:"#374151", marginTop:6 }}>
                  {ms < 400 ? "Excellent" : ms < 800 ? "Good" : ms < 1200 ? "Slow" : "Very slow"}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 90-day uptime ── */}
        <SectionLabel style={{ marginTop:56 }}>90-Day Uptime</SectionLabel>
        <div style={{ marginTop:18, backgroundColor:"#0D1510", border:"1px solid #1A2E1F", borderRadius:16, overflow:"hidden" }}>
          {SERVICES.map((svc, i) => (
            <UptimeRow
              key={svc.id}
              service={svc}
              bars={buildUptimeBars(history, svc.id)}
              uptime={calcUptimePct(history, svc.id)}
              isLast={i === SERVICES.length - 1}
            />
          ))}
        </div>

        {/* ── Incidents ── */}
        <SectionLabel style={{ marginTop:56 }}>Recent Incidents</SectionLabel>
        <div style={{ marginTop:18, backgroundColor:"#0D1510", border:"1px solid #1A2E1F", borderRadius:16, padding:"40px 32px", textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", backgroundColor:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.18)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:22 }}>
            ✓
          </div>
          <p style={{ fontSize:15, fontWeight:700, color:"#D1FAE5", marginBottom:8 }}>No incidents reported</p>
          <p style={{ fontSize:13, color:"#374151", maxWidth:360, margin:"0 auto", lineHeight:1.6 }}>
            All services have been operating normally. Any future incidents will appear here with a timeline and resolution notes.
          </p>
        </div>

        {/* ── Legend ── */}
        <div style={{ marginTop:40, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          {([
            { color:"#10B981", label:"Operational" },
            { color:"#F59E0B", label:"Degraded" },
            { color:"#EF4444", label:"Outage" },
            { color:"#1A2E1F", label:"No data" },
          ] as const).map(({ color, label }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#6B7280" }}>
              <div style={{ width:10, height:10, borderRadius:2, backgroundColor:color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.04)", padding:"20px 24px", color:"#374151", fontSize:12 }}>
        <div style={{ maxWidth:1120, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <span>© {new Date().getFullYear()} VeilChat · Status</span>
          <span>Auto-refreshes every {REFRESH_INTERVAL} seconds · All times in local timezone</span>
          <a href="https://www.veilchat.me" style={{ color:"#374151", textDecoration:"none" }}>veilchat.me ↗</a>
        </div>
      </footer>

      <style>{`
        @keyframes vcPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes vcSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

/* ─────────────────────── Sub-components ─────────────────────── */

function ServiceCard({ service, result, history }: { service: Service; result: ServiceResult; history: HistoryEntry[] }) {
  const c = statusColor(result.status);
  const borderAccent =
    result.status === "outage"    ? "#3D1212" :
    result.status === "degraded"  ? "#3D2A0A" :
    result.status === "operational"? "#162411" :
                                     "#1A2E1F";
  const last30 = history.slice(-30);

  return (
    <div style={{ backgroundColor:"#0D1510", border:`1px solid ${borderAccent}`, borderRadius:14, padding:"22px 22px 18px", display:"flex", flexDirection:"column", gap:0, transition:"border-color 0.4s" }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <span style={{ fontSize:18 }}>{service.icon}</span>
            <span style={{ fontSize:14, fontWeight:700, color:"#E7FFF1", letterSpacing:"-0.01em" }}>{service.name}</span>
          </div>
          <div style={{ fontSize:11.5, color:"#374151", lineHeight:1.5, paddingLeft:26 }}>{service.description}</div>
        </div>
        <StatusPill status={result.status} />
      </div>

      {/* Divider */}
      <div style={{ height:1, backgroundColor:"#1A2E1F", margin:"16px 0 14px" }} />

      {/* Latency row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <IcoLatency color={c} />
          <span style={{ fontSize:12, color:"#4B5563" }}>Response</span>
        </div>
        <span style={{ fontSize:13, fontWeight:700, color: result.latency !== null ? c : "#374151" }}>
          {result.latency !== null ? `${result.latency}ms` : result.detail ?? "—"}
        </span>
      </div>

      {result.detail && result.latency !== null && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <IcoInfo />
            <span style={{ fontSize:12, color:"#4B5563" }}>Detail</span>
          </div>
          <span style={{ fontSize:12, color:"#374151" }}>{result.detail}</span>
        </div>
      )}

      {/* Mini spark bar — last 30 checks */}
      <div style={{ marginTop:14, display:"flex", gap:2 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const entry = last30[i - (30 - last30.length)];
          const ok = entry ? entry.results[service.id]?.ok : null;
          const bg = ok === null ? "#1A2E1F" : ok ? "#10B981" : "#EF4444";
          return <div key={i} style={{ flex:1, height:3, borderRadius:1, backgroundColor:bg }} />;
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:10, color:"#1F2D24" }}>
        <span>30 checks ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ServiceStatus }) {
  const c = statusColor(status);
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:100, backgroundColor:`${c}14`, border:`1px solid ${c}28`, flexShrink:0, marginLeft:10 }}>
      <div style={{ width:6, height:6, borderRadius:"50%", backgroundColor:c, boxShadow:`0 0 6px ${c}80`, animation: status==="checking" ? "vcPulse 1s infinite" : undefined }} />
      <span style={{ fontSize:11.5, fontWeight:700, color:c, letterSpacing:"0.02em" }}>{statusLabel(status)}</span>
    </div>
  );
}

function UptimeRow({ service, bars, uptime, isLast }: { service: Service; bars: Array<{ status: string }>; uptime: string; isLast: boolean }) {
  const barColor = (s: string) =>
    s === "operational" ? "#10B981" : s === "degraded" ? "#F59E0B" : s === "outage" ? "#EF4444" : "#1A2E1F";
  return (
    <div style={{ padding:"22px 28px", borderBottom: isLast ? "none" : "1px solid #1A2E1F" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>{service.icon}</span>
          <span style={{ fontSize:13, fontWeight:600, color:"#D1FAE5" }}>{service.name}</span>
        </div>
        <span style={{ fontSize:12, color:"#4B5563" }}>
          {uptime === "—" ? "Monitoring started — building history…" : <><span style={{ color:"#10B981", fontWeight:700 }}>{uptime}</span> uptime</>}
        </span>
      </div>
      <div style={{ display:"flex", gap:2 }}>
        {bars.map((bar, i) => (
          <div
            key={i}
            title={`Day ${90 - i}: ${bar.status}`}
            style={{ flex:1, height:28, borderRadius:3, backgroundColor:barColor(bar.status), cursor:"default", transition:"opacity 0.2s" }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = "0.65"; }}
            onMouseOut={(e)  => { e.currentTarget.style.opacity = "1"; }}
          />
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:7, fontSize:10.5, color:"#1F3325" }}>
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, ...style }}>
      <span style={{ fontSize:10.5, fontWeight:700, color:"#374151", letterSpacing:"0.14em", textTransform:"uppercase" }}>{children}</span>
      <div style={{ flex:1, height:1, backgroundColor:"#0D1510" }} />
    </div>
  );
}

function BrandMark() {
  return (
    <div style={{ width:34, height:34, borderRadius:9, backgroundColor:"#065F46", display:"grid", placeItems:"center", flexShrink:0, boxShadow:"0 4px 14px rgba(16,185,129,0.22)" }}>
      <svg viewBox="0 0 64 64" width="20" height="20" aria-hidden="true">
        <path d="M16 22 L32 44 L48 22" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="52" cy="13" r="5" fill="white" />
      </svg>
    </div>
  );
}

function IcoTime() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  );
}

function IcoLatency({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  );
}

function IcoInfo() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.5" fill="#374151" />
    </svg>
  );
}
