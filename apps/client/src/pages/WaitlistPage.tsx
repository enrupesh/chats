import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Layout";
import { getApiBaseUrl } from "../lib/apiBase";
import { useDocumentMeta } from "../lib/useDocumentMeta";

type WaitlistForm = {
  email: string;
  websiteUrl: string;
  linkedinUrl: string;
};

const initialForm: WaitlistForm = {
  email: "",
  websiteUrl: "",
  linkedinUrl: "",
};

type WaitlistResponse = {
  joined?: boolean;
  alreadyJoined?: boolean;
  count?: number;
  error?: string;
};

export function WaitlistPage() {
  useDocumentMeta({
    title: "VeilChat for founders — professional email for $1",
    description:
      "Get a professional email address on your own custom domain for just $1. Join the VeilChat founder waitlist for early access and five months free.",
    canonical: "https://www.veilchat.me/waitlist",
  });

  const [form, setForm] = useState<WaitlistForm>(initialForm);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<WaitlistResponse | null>(null);

  useEffect(() => {
    let active = true;
    void fetch(`${getApiBaseUrl()}/waitlist/count`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as { count?: number };
        if (active && typeof payload.count === "number") setCount(payload.count);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof WaitlistForm>(key: K, value: WaitlistForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          websiteUrl: form.websiteUrl.trim(),
          linkedinUrl: form.linkedinUrl.trim(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as WaitlistResponse | null;
      if (!response.ok) {
        throw new Error(payload?.error || "We couldn't save your spot. Please try again.");
      }
      setSubmitted(payload ?? { joined: true });
      if (typeof payload?.count === "number") setCount(payload.count);
      setForm(initialForm);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We couldn't save your spot. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="waitlist-shell min-h-screen overflow-hidden bg-[#FCF5EB] text-[#111B21]">
      <div className="waitlist-grain" aria-hidden="true" />
      <div className="waitlist-orbit waitlist-orbit-one" aria-hidden="true" />
      <div className="waitlist-orbit waitlist-orbit-two" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="waitlist-reveal flex items-center justify-between gap-4">
          <Link to="/" aria-label="Back to VeilChat home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#253D2C]/45 sm:inline">
              veilchat.me/waitlist
            </span>
            <Link
              to="/"
              className="rounded-full border border-[#253D2C]/15 bg-white/35 px-4 py-2 text-sm font-semibold text-[#253D2C] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/75"
            >
              Back to VeilChat
            </Link>
          </div>
        </header>

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="waitlist-reveal waitlist-reveal-delay-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#68BA7F]/35 bg-[#E8FAEE]/85 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#2E6F40] shadow-[0_8px_30px_rgba(46,111,64,0.08)] backdrop-blur">
              <span className="size-1.5 rounded-full bg-[#2E6F40]" />
              Founder's launch room · 02.02.27
            </div>
            <h1
              className="mt-6 max-w-2xl text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-[#253D2C] sm:text-7xl"
              style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
            >
              Your domain.
              <br />
              Your professional inbox.
              <br />
              <span className="waitlist-price-shine">$1.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3C5A47]">
              A serious email address on your own custom domain, for just{" "}
              <strong className="text-[#2E6F40]">$1</strong>. Join the founder
              list and help shape the tools your next chapter needs. Qualifying
              founders who share their website or LinkedIn can get{" "}
              <strong className="text-[#2E6F40]">5 months free</strong>.
            </p>

            <div className="waitlist-3d-stage mt-8" aria-hidden="true">
              <div className="waitlist-3d-shadow" />
              <div className="waitlist-3d-mail">
                <div className="waitlist-3d-mail-top" />
                <div className="waitlist-3d-mail-front">
                  <span className="waitlist-mail-dot" />
                  <span className="waitlist-mail-line waitlist-mail-line-long" />
                  <span className="waitlist-mail-line" />
                </div>
                <div className="waitlist-3d-mail-side" />
                <div className="waitlist-3d-mail-mark">V</div>
              </div>
              <span className="waitlist-float-label waitlist-float-label-one">yourname@yourdomain</span>
              <span className="waitlist-float-label waitlist-float-label-two">private by design</span>
            </div>

            <div className="waitlist-launch-note mt-6">
              <span className="waitlist-launch-note-pulse" />
              <span>Built with founders. More launch benefits will be added before release.</span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["$1 custom-domain email", "A professional inbox on your own domain."],
                ["Premium templates", "Ready-to-send emails for launches and sales."],
                ["Analytics", "Understand what gets opened and clicked."],
                ["AI marketing emails", "Draft campaigns and outreach faster."],
                ["AI reply agent", "Get help writing thoughtful email replies."],
                ["Temporary emails", "Use safer aliases when you need them."],
                ["Founder perk", "Qualifying founders get 5 months free on their domain."],
              ].map(([title, detail]) => (
                <div
                  key={title}
                  className="waitlist-feature-card rounded-2xl border border-[#253D2C]/10 bg-white/70 p-4 backdrop-blur"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#E8FAEE] text-[#2E6F40]">
                      ✓
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-[#253D2C]">{title}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-[#3C5A47]/65">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="waitlist-reveal waitlist-reveal-delay-2 waitlist-form-card rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_24px_70px_rgba(37,61,44,0.16)] backdrop-blur-xl sm:p-8">
            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#E8FAEE] text-3xl text-[#2E6F40]">
                  ✓
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#2E6F40]">
                  {submitted.alreadyJoined ? "Already on the list" : "You're on the list"}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#253D2C]">
                  We’ll keep you posted.
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#3C5A47]/70">
                  We saved your interest. We’ll share launch updates and early
                  access details by email.
                </p>
                {(submitted.count ?? count ?? 0) > 0 && (
                  <p className="mt-6 text-sm font-semibold text-[#2E6F40]">
                    {submitted.count ?? count} people are waiting with you.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setSubmitted(null)}
                  className="mt-8 rounded-full border border-[#253D2C]/15 px-5 py-2.5 text-sm font-semibold text-[#253D2C] transition hover:bg-[#FCF5EB]"
                >
                  Add another email
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2E6F40]">
                  Get early access
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#111B21]">
                  Reserve your founder spot
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#253D2C]/60">
                  Email is required. Website and LinkedIn are optional, but
                  sharing them helps us send relevant founder feedback.
                </p>

                <form className="mt-7 space-y-4" onSubmit={(event) => void submit(event)}>
                  <Field label="Email address" required>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      autoComplete="email"
                      maxLength={254}
                      placeholder="you@company.com"
                      className="waitlist-input"
                    />
                  </Field>
                  <Field label="Your website (optional)">
                    <input
                      type="url"
                      value={form.websiteUrl}
                      onChange={(event) => update("websiteUrl", event.target.value)}
                      maxLength={500}
                      placeholder="https://yourwebsite.com"
                      className="waitlist-input"
                    />
                  </Field>
                  <Field label="LinkedIn profile (optional)">
                    <input
                      type="url"
                      value={form.linkedinUrl}
                      onChange={(event) => update("linkedinUrl", event.target.value)}
                      maxLength={500}
                      placeholder="https://linkedin.com/in/your-name"
                      className="waitlist-input"
                    />
                  </Field>

                  {error && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-full bg-[#2E6F40] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_-14px_rgba(46,111,64,0.7)] transition hover:bg-[#253D2C] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Saving your spot…" : "Join the waitlist →"}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs leading-relaxed text-[#253D2C]/45">
                  No password. No payment details. Unsubscribe anytime.
                </p>
                {count !== null && count > 0 && (
                  <p className="mt-6 text-center text-sm font-semibold text-[#2E6F40]">
                    {count} early members have joined
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </div>
      <style>{`
        .waitlist-shell {
          isolation: isolate;
          background:
            radial-gradient(circle at 12% 12%, rgba(164, 221, 177, 0.22), transparent 26rem),
            radial-gradient(circle at 86% 72%, rgba(244, 191, 115, 0.18), transparent 30rem),
            #FCF5EB;
        }
        .waitlist-grain {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: 0.18;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
        .waitlist-orbit {
          position: fixed;
          z-index: -1;
          width: 32rem;
          height: 32rem;
          border: 1px solid rgba(46,111,64,0.09);
          border-radius: 50%;
          pointer-events: none;
          transform: rotate(-22deg);
        }
        .waitlist-orbit::after {
          content: "";
          position: absolute;
          inset: 2.5rem;
          border: 1px solid rgba(46,111,64,0.06);
          border-radius: 50%;
        }
        .waitlist-orbit-one {
          top: -15rem;
          right: -10rem;
          animation: waitlist-orbit-drift 14s ease-in-out infinite;
        }
        .waitlist-orbit-two {
          bottom: -19rem;
          left: -15rem;
          transform: rotate(28deg) scale(0.8);
          animation: waitlist-orbit-drift 18s ease-in-out -5s infinite reverse;
        }
        .waitlist-reveal {
          animation: waitlist-reveal 800ms cubic-bezier(.2,.8,.2,1) both;
        }
        .waitlist-reveal-delay-1 { animation-delay: 100ms; }
        .waitlist-reveal-delay-2 { animation-delay: 220ms; }
        .waitlist-price-shine {
          color: #D47B29;
          text-shadow: 0 8px 24px rgba(212,123,41,0.18);
        }
        .waitlist-3d-stage {
          position: relative;
          height: 8.5rem;
          max-width: 28rem;
          perspective: 900px;
        }
        .waitlist-3d-shadow {
          position: absolute;
          left: 4.5rem;
          bottom: 0.75rem;
          width: 13rem;
          height: 2rem;
          border-radius: 50%;
          background: rgba(37,61,44,0.2);
          filter: blur(16px);
          transform: rotate(-8deg);
          animation: waitlist-shadow-breathe 4s ease-in-out infinite;
        }
        .waitlist-3d-mail {
          position: absolute;
          left: 5.5rem;
          bottom: 1.2rem;
          width: 11rem;
          height: 6.7rem;
          transform-style: preserve-3d;
          transform: rotateX(58deg) rotateZ(-18deg) rotateY(-22deg);
          animation: waitlist-mail-float 5s ease-in-out infinite;
        }
        .waitlist-3d-mail-front,
        .waitlist-3d-mail-top,
        .waitlist-3d-mail-side {
          position: absolute;
          border: 1px solid rgba(37,61,44,0.16);
          background: linear-gradient(145deg, #fffdf8, #e8f4e8);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);
        }
        .waitlist-3d-mail-front {
          inset: 0 1.5rem 0 0;
          border-radius: 0.55rem;
          transform: translateZ(1.5rem);
          padding: 1.2rem;
        }
        .waitlist-3d-mail-top {
          top: 0;
          left: 0;
          width: calc(100% - 1.5rem);
          height: 100%;
          border-radius: 0.55rem;
          transform: rotateX(90deg) translateZ(3.35rem);
          transform-origin: top;
          background: linear-gradient(135deg, #effbef, #cfe8d3);
        }
        .waitlist-3d-mail-side {
          top: 0;
          right: 0;
          width: 1.5rem;
          height: 100%;
          border-radius: 0 0.55rem 0.55rem 0;
          transform: rotateY(90deg) translateZ(9.5rem);
          transform-origin: right;
          background: linear-gradient(180deg, #d4ebd7, #a8cfb0);
        }
        .waitlist-3d-mail-mark {
          position: absolute;
          right: 2.25rem;
          bottom: 1.15rem;
          color: #2E6F40;
          font-family: Georgia, serif;
          font-size: 2.4rem;
          font-weight: 700;
          transform: translateZ(1.7rem);
        }
        .waitlist-mail-dot {
          display: block;
          width: 0.55rem;
          height: 0.55rem;
          margin-bottom: 0.6rem;
          border-radius: 50%;
          background: #D47B29;
        }
        .waitlist-mail-line {
          display: block;
          width: 45%;
          height: 0.28rem;
          margin-top: 0.45rem;
          border-radius: 999px;
          background: rgba(46,111,64,0.2);
        }
        .waitlist-mail-line-long { width: 72%; }
        .waitlist-float-label {
          position: absolute;
          border: 1px solid rgba(37,61,44,0.1);
          border-radius: 999px;
          background: rgba(255,255,255,0.7);
          padding: 0.45rem 0.7rem;
          color: rgba(37,61,44,0.7);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 10px 26px rgba(37,61,44,0.08);
          backdrop-filter: blur(8px);
        }
        .waitlist-float-label-one {
          top: 0.35rem;
          right: 0.5rem;
          animation: waitlist-label-float 4.5s ease-in-out infinite;
        }
        .waitlist-float-label-two {
          right: 1.5rem;
          bottom: 0;
          color: #2E6F40;
          animation: waitlist-label-float 5.2s ease-in-out -1s infinite reverse;
        }
        .waitlist-launch-note {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          max-width: 28rem;
          color: rgba(37,61,44,0.62);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .waitlist-launch-note-pulse {
          width: 0.5rem;
          height: 0.5rem;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #D47B29;
          box-shadow: 0 0 0 0 rgba(212,123,41,0.35);
          animation: waitlist-pulse 2s infinite;
        }
        .waitlist-feature-card {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }
        .waitlist-feature-card:hover {
          border-color: rgba(46,111,64,0.25);
          box-shadow: 0 14px 28px rgba(37,61,44,0.08);
          transform: translateY(-3px);
        }
        .waitlist-form-card {
          transform: translateZ(0);
          transition: transform 300ms ease, box-shadow 300ms ease;
        }
        .waitlist-form-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 80px rgba(37,61,44,0.2);
        }
        @keyframes waitlist-reveal {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes waitlist-mail-float {
          0%, 100% { transform: rotateX(58deg) rotateZ(-18deg) rotateY(-22deg) translateY(0); }
          50% { transform: rotateX(60deg) rotateZ(-15deg) rotateY(-18deg) translateY(-11px); }
        }
        @keyframes waitlist-shadow-breathe {
          0%, 100% { opacity: 0.65; transform: rotate(-8deg) scaleX(1); }
          50% { opacity: 0.38; transform: rotate(-8deg) scaleX(0.76); }
        }
        @keyframes waitlist-label-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-7px) rotate(2deg); }
        }
        @keyframes waitlist-orbit-drift {
          0%, 100% { transform: rotate(-22deg) translate3d(0, 0, 0); }
          50% { transform: rotate(-17deg) translate3d(18px, 14px, 0); }
        }
        @keyframes waitlist-pulse {
          0% { box-shadow: 0 0 0 0 rgba(212,123,41,0.35); }
          70% { box-shadow: 0 0 0 8px rgba(212,123,41,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,123,41,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .waitlist-reveal,
          .waitlist-orbit-one,
          .waitlist-orbit-two,
          .waitlist-3d-mail,
          .waitlist-3d-shadow,
          .waitlist-float-label-one,
          .waitlist-float-label-two,
          .waitlist-launch-note-pulse {
            animation: none;
          }
          .waitlist-feature-card,
          .waitlist-form-card {
            transition: none;
          }
        }
        .waitlist-input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(37,61,44,0.16);
          border-radius: 12px;
          background: #F8FAF8;
          color: #111B21;
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
        }
        .waitlist-input:focus {
          border-color: #2E6F40;
          box-shadow: 0 0 0 3px rgba(46,111,64,0.1);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[#253D2C]/60">
        {label} {required && <span className="text-[#2E6F40]">*</span>}
      </span>
      {children}
    </label>
  );
}