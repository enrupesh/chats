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
    title: "Join the VeilChat launch waitlist",
    description:
      "Get early access to professional email on your domain for $1, with premium templates, analytics, and AI email tools.",
    canonical: "/waitlist",
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
    <main className="min-h-screen bg-[#FCF5EB] text-[#111B21]">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="Back to VeilChat home">
            <Logo />
          </Link>
          <Link
            to="/"
            className="rounded-full border border-[#253D2C]/15 px-4 py-2 text-sm font-semibold text-[#253D2C] transition hover:bg-white/60"
          >
            Back to VeilChat
          </Link>
        </header>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#68BA7F]/35 bg-[#E8FAEE] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#2E6F40]">
              <span className="size-1.5 rounded-full bg-[#2E6F40]" />
              Founding waitlist · target launch 2 February 2027
            </div>
            <h1
              className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-[#253D2C] sm:text-7xl"
              style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
            >
              Professional email, without the professional price.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3C5A47]">
              Join the early list for professional email on your own domain for
              just <strong>$1</strong>. Launch members will also get selected
              premium tools free while we build the product with founders.
              Founders who share their website or LinkedIn can qualify for
              <strong> 5 months of custom-domain professional email free</strong>.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["$1 custom-domain email", "A professional inbox for your own domain."],
                ["Premium templates", "Ready-to-send emails for launches and sales."],
                ["Analytics", "Understand what gets opened and clicked."],
                ["AI marketing emails", "Draft campaigns and outreach faster."],
                ["AI reply agent", "Get help writing thoughtful email replies."],
                ["Temporary emails", "Use safer aliases when you need them."],
                ["Founder perk", "Qualifying founders get 5 months free on their domain."],
              ].map(([title, detail]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#253D2C]/10 bg-white/70 p-4"
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

          <section className="rounded-[2rem] border border-[#253D2C]/10 bg-white p-6 shadow-[0_18px_50px_rgba(37,61,44,0.12)] sm:p-8">
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
                {typeof (submitted.count ?? count) === "number" && (
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
                {count !== null && (
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