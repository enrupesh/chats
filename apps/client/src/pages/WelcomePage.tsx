import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Logo,
  PrimaryButton,
  ChevronRightIcon,
  LockIcon,
} from "../components/Layout";
import { fetchHealth } from "../api";
import { isFirebaseConfigured } from "../lib/firebase";
import { feedback } from "../lib/feedback";
import { useNoindex } from "../lib/useDocumentMeta";

type ServerStatus =
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

export function WelcomePage() {
  useNoindex("Welcome · VeilChat");
  const [status, setStatus] = useState<ServerStatus>({ kind: "loading" });
  const firebaseReady = isFirebaseConfigured();

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then(() => !cancelled && setStatus({ kind: "ok" }))
      .catch(
        (e) =>
          !cancelled &&
          setStatus({ kind: "error", message: String(e?.message ?? e) }),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-full flex flex-col bg-bg text-text relative overflow-hidden">
      {/* Soft ambient glow behind the logo — adds depth without visual noise. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[420px] opacity-[0.55]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgb(0 168 132 / 0.18), transparent 60%)",
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          {/* ── Hero ── */}
          <div
            className="animate-slide-up flex flex-col items-center gap-5"
            style={{ animationDelay: "40ms" }}
          >
            <Logo size={88} />
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
                Welcome to VeilChat
              </h1>
              <p className="mt-2 text-[14px] text-text-muted leading-relaxed">
                Private by design.
                <br />
                Visible to no one but you.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-wa-green-dark dark:text-wa-green/90">
              <LockIcon /> End-to-end encrypted
            </span>
          </div>

          {/* ── Identity choice ── */}
          <div
            className="w-full mt-9 animate-slide-up"
            style={{ animationDelay: "180ms" }}
          >
            <SectionLabel>Make it yours</SectionLabel>
            <FeaturedSignupCard
              to="/signup/random"
              title="Create with a Random ID"
              sub="Maximum privacy — no email or phone. You hold a recovery phrase."
              recommended
            />

            <div className="mt-5">
              <SectionLabel>More ways to join</SectionLabel>
              <div className="flex flex-col gap-2">
                <SignupOptionCard
                  to="/signup/phone"
                  title="Phone number"
                  sub="SMS verification — your number stays private"
                />
                <SignupOptionCard
                  to="/signup/email"
                  sub="6-digit code to your inbox"
                  title="Email address"
                />
              </div>
            </div>
          </div>

          {/* ── Returning user ── */}
          <Link
            to="/login"
            onClick={() => feedback.tap()}
            className="mt-7 text-[13.5px] font-medium text-wa-green-dark dark:text-wa-green hover:underline animate-fade-in"
            style={{ animationDelay: "320ms" }}
          >
            I already have an account →
          </Link>

          {/* ── Watch intro video ── */}
          <WatchIntroCard />
        </div>
      </div>

      {/* ── Trust strip — privacy as a feature, not a lecture ── */}
      <div
        className="px-6 pb-5 pt-3 animate-fade-in relative z-10"
        style={{ animationDelay: "440ms" }}
      >
        <div className="mx-auto max-w-md">
          <div
            className={
              "rounded-2xl border border-line/60 bg-surface/60 backdrop-blur-sm " +
              "px-4 py-3 grid grid-cols-3 gap-2"
            }
          >
            <TrustPill icon={<NoAdIcon />} label="No ads, ever" />
            <TrustPill icon={<NoEyeIcon />} label="Zero tracking" />
            <TrustPill icon={<DeviceIcon />} label="Lives on your device" />
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <ServerStatusBadge status={status} />
            <span className="text-text-faint text-[10px]">·</span>
            <Link
              to="/promises"
              onClick={() => feedback.tap()}
              className="text-[10.5px] font-semibold text-wa-green-dark dark:text-wa-green hover:underline"
            >
              Read our promises →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─────────────────────────── Watch intro card ─────────────────────────── */

const YT_ID = "bmTKkXD_bqY";

function WatchIntroCard() {
  const [open, setOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div
      className="w-full mt-6 animate-fade-in"
      style={{ animationDelay: "400ms" }}
    >
      {!open ? (
        /* Collapsed pill — thumbnail + label */
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            "w-full flex items-center gap-3 rounded-2xl border border-line/60 " +
            "bg-surface/60 backdrop-blur-sm px-3 py-2.5 " +
            "hover:border-wa-green/40 hover:bg-surface " +
            "transition-[border-color,background-color] duration-150 wa-tap text-left"
          }
        >
          {/* Thumbnail */}
          <div className="relative shrink-0 w-[72px] h-[40px] rounded-lg overflow-hidden bg-black">
            <img
              src={`https://img.youtube.com/vi/${YT_ID}/mqdefault.jpg`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            {/* Play icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-wa-green/90 flex items-center justify-center shadow">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="white" aria-hidden="true" className="ml-0.5">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-semibold text-text leading-tight">
              Watch the intro
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              See how VeilChat works · ~2 min
            </div>
          </div>

          {/* Arrow */}
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
            className="text-text-faint shrink-0"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        /* Expanded inline player */
        <div className="rounded-2xl overflow-hidden border border-line/60 bg-black">
          {/* Close bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-surface/80 backdrop-blur-sm border-b border-line/40">
            <span className="text-[11.5px] font-semibold text-text">VeilChat — Introduction</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[10.5px] text-text-muted hover:text-text transition-colors px-2 py-1 rounded-lg hover:bg-white/10 wa-tap"
            >
              Close ✕
            </button>
          </div>
          {/* 16:9 iframe */}
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1`}
              title="VeilChat Introduction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── building blocks ─────────────────────────── */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-text-faint mb-2.5">
      {children}
    </div>
  );
}

/**
 * Hero-style signup card. Bigger, warmer, and motion-aware so the
 * recommended path feels like the obvious next step rather than one
 * of three equal options.
 */
function FeaturedSignupCard({
  to,
  title,
  sub,
  recommended,
}: {
  to: string;
  title: string;
  sub: string;
  recommended?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={() => feedback.press()}
      className={
        "group block w-full text-left rounded-2xl " +
        "bg-gradient-to-b from-wa-green/[0.10] to-wa-green/[0.04] " +
        "border border-wa-green/30 " +
        "px-4 py-4 " +
        "shadow-card hover:shadow-glow-accent " +
        "transition-[box-shadow,transform,background-color] duration-200 ease-veil-soft " +
        "active:scale-[0.985] wa-tap"
      }
    >
      <div className="flex items-center gap-3.5">
        <div
          className={
            "size-11 rounded-xl shrink-0 grid place-items-center " +
            "bg-gradient-to-b from-wa-green to-wa-green-dark text-text-oncolor " +
            "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),0_2px_6px_rgba(0,168,132,0.28)]"
          }
        >
          <KeyIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px] tracking-tight text-text">
              {title}
            </span>
            {recommended && (
              <span
                className={
                  "text-[9.5px] font-semibold uppercase tracking-[0.10em] " +
                  "px-1.5 py-[2px] rounded-full " +
                  "bg-wa-green text-text-oncolor"
                }
              >
                Recommended
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-text-muted leading-snug mt-1">
            {sub}
          </p>
        </div>
        <ChevronRightIcon className="text-wa-green-dark dark:text-wa-green shrink-0 transition-transform duration-200 ease-veil-soft group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function SignupOptionCard({
  to,
  title,
  sub,
}: {
  to: string;
  title: string;
  sub: string;
}) {
  return (
    <Link
      to={to}
      onClick={() => feedback.tap()}
      className={
        "group w-full text-left rounded-xl bg-surface border border-line/60 " +
        "px-3.5 py-2.5 flex items-center justify-between gap-3 " +
        "hover:border-wa-green/40 hover:bg-surface/80 " +
        "transition-[border-color,background-color] duration-150 ease-veil-soft wa-tap"
      }
    >
      <div className="min-w-0">
        <div className="font-medium text-[13.5px] text-text flex items-center gap-2">
          <span>{title}</span>
        </div>
        <div className="text-[11.5px] text-text-muted truncate">{sub}</div>
      </div>
      <ChevronRightIcon className="text-text-faint group-hover:text-wa-green shrink-0 transition-colors duration-150" />
    </Link>
  );
}

/**
 * One cell of the trust strip. Icon + tiny label, stacked vertically
 * so three pills fit comfortably on a phone width.
 */
function TrustPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="text-wa-green-dark dark:text-wa-green">{icon}</span>
      <span className="text-[10.5px] font-medium text-text-muted leading-tight">
        {label}
      </span>
    </div>
  );
}

function ServerStatusBadge({ status }: { status: ServerStatus }) {
  if (status.kind === "loading") {
    return (
      <div className="flex items-center gap-2 text-[10.5px] text-text-faint">
        <span className="size-1.5 rounded-full bg-text-faint animate-pulse" />
        Connecting…
      </div>
    );
  }
  if (status.kind === "ok") {
    return (
      <div className="flex items-center gap-2 text-[10.5px] text-text-faint">
        <span className="size-1.5 rounded-full bg-wa-green" />
        Server reachable
      </div>
    );
  }
  return null;
}

/* ─────────────────────────── icons ─────────────────────────── */

function KeyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="12" r="3.5" />
      <path d="M12.5 12h7.5" />
      <path d="M17 12v3" />
      <path d="M20 12v2" />
    </svg>
  );
}

function NoAdIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

function NoEyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12s3.5-7 9-7c2 0 3.7.6 5.1 1.6" />
      <path d="M21 12s-3.5 7-9 7c-2 0-3.7-.6-5.1-1.6" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="3" width="12" height="18" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}

// Re-export for back-compat with existing imports from this module.
export { PrimaryButton };
