import { useState } from "react";
import { Link } from "react-router-dom";
import waitlistOfferArt from "../assets/waitlist-offer-art.png";
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
  error?: string;
};

export function WaitlistPage() {
  useDocumentMeta({
    title: "VeilChat for founders — professional email for $1",
    description:
      "Get a professional email address on your own custom domain for just $1. Join the VeilChat founder waitlist for early access and five months free.",
    canonical: "https://www.veilchat.me/waitlist",
    ogImage: "https://www.veilchat.me/waitlist-og.jpg?v=2",
    ogType: "website",
  });

  const [form, setForm] = useState<WaitlistForm>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<WaitlistResponse | null>(null);

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
      <div className="waitlist-scene" aria-hidden="true">
        <div className="waitlist-scene-grid" />
        <div className="waitlist-scene-halo" />
        <div className="waitlist-scene-ring waitlist-scene-ring-one" />
        <div className="waitlist-scene-ring waitlist-scene-ring-two" />
        <div className="waitlist-scene-core">
          <img
            src={waitlistOfferArt}
            alt=""
            className="h-full w-full rounded-[34%] object-cover"
          />
        </div>
        <div className="waitlist-scene-card waitlist-scene-card-one">
          <span className="waitlist-scene-card-dot" />
          AI reply agent
          <strong>ready when you are</strong>
        </div>
        <div className="waitlist-scene-card waitlist-scene-card-two">
          <span className="waitlist-scene-card-spark">+</span>
          Analytics
          <strong>your signal</strong>
        </div>
        <div className="waitlist-scene-star waitlist-scene-star-one" />
        <div className="waitlist-scene-star waitlist-scene-star-two" />
        <div className="waitlist-scene-star waitlist-scene-star-three" />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="waitlist-reveal flex items-center justify-between gap-4">
          <Link to="/" aria-label="Back to VeilChat home">
            <img
              src={waitlistOfferArt}
              alt="VeilChat"
              className="size-16 rounded-[22%] object-cover shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
            />
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
               A new product from the VeilChat team
            </div>
            <h1
               className="mt-6 max-w-2xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-[#253D2C] sm:text-6xl"
              style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
            >
               Your professional email.
              <br />
               On your own domain.
              <br />
               <span className="waitlist-price-shine">Just $1/month.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3C5A47]">
               Get a professional custom-domain inbox for{" "}
               <strong className="text-[#2E6F40]">$1/month</strong>, plus premium
               templates, analytics, AI-powered email tools, and more.
            </p>

             <div className="waitlist-founder-perk mt-6">
               <span className="text-xl" aria-hidden="true">🎁</span>
               <div>
                 <p className="text-sm font-bold text-[#253D2C]">
                   Founder Perk — Qualifying founders get 5 months free
                 </p>
                 <p className="mt-1 text-xs leading-relaxed text-[#3C5A47]/70">
                   Share your website or LinkedIn profile so we can verify your
                   founder status.
                 </p>
               </div>
             </div>

             <div className="waitlist-3d-stage mt-7" aria-hidden="true">
              <div className="waitlist-3d-shadow" />
              <div className="waitlist-3d-ring waitlist-3d-ring-back" />
              <div className="waitlist-3d-ring waitlist-3d-ring-front" />
              <div className="waitlist-3d-mail">
                <div className="waitlist-3d-mail-top" />
                <div className="waitlist-3d-mail-front">
                  <span className="waitlist-mail-dot" />
                  <span className="waitlist-mail-line waitlist-mail-line-long" />
                  <span className="waitlist-mail-line" />
                </div>
                <div className="waitlist-3d-mail-side" />
                <img
                  src={waitlistOfferArt}
                  alt=""
                  className="waitlist-3d-mail-mark"
                />
              </div>
              <span className="waitlist-float-label waitlist-float-label-one">yourname@yourdomain</span>
              <span className="waitlist-float-label waitlist-float-label-two">private by design</span>
            </div>

            <div className="waitlist-launch-note mt-6">
              <span className="waitlist-launch-note-pulse" />
               <span>Founder pricing is reserved for early launch members.</span>
            </div>

             <div className="mt-8 grid gap-3 sm:grid-cols-3">
               <FeatureGroup
                 title="Professional Email"
                 items={[
                   "Custom-domain inbox",
                   "Premium templates",
                   "Temporary email aliases",
                 ]}
               />
               <FeatureGroup
                 title="AI-Powered"
                 items={["AI marketing emails", "AI reply agent"]}
               />
               <FeatureGroup
                 title="Analytics"
                 items={["Email opens", "Link clicks", "Campaign performance"]}
               />
            </div>

              <div className="waitlist-video-card mt-5 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/70 shadow-[0_18px_42px_rgba(37,61,44,0.1)] backdrop-blur">
                <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2E6F40]">
                      See the idea
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#253D2C]">
                      Built for people building in public
                    </p>
                  </div>
                  <a
                    href="https://www.youtube.com/@TryAloneFailAloneWinAlone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full border border-[#253D2C]/12 bg-white/75 px-3 py-2 text-xs font-bold text-[#2E6F40] transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    YouTube ↗
                  </a>
                </div>
                <div className="waitlist-video-frame">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/lX0VAINKnAY?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1"
                    title="VeilChat founder launch video"
                    loading="eager"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
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
                   Reserve My Founder Spot
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#253D2C]/60">
                   Reserve the $1/month launch price and get five months free if
                   you qualify as a founder.
                </p>
                 <p className="mt-2 text-xs leading-relaxed text-[#253D2C]/55">
                   Website or LinkedIn is optional, but sharing it helps us verify
                   qualifying founders and send more relevant founder updates.
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
                     {busy ? "Saving your spot…" : "Reserve My Founder Spot →"}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs leading-relaxed text-[#253D2C]/45">
                  No password. No payment details. Unsubscribe anytime.
                </p>
              </>
            )}
            <div className="mt-8 border-t border-[#253D2C]/10 pt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2E6F40]">
                Follow the launch
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <a
                  href="https://x.com/mailforfounders"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Mail for Founders on X"
                  className="group flex items-center gap-3 rounded-2xl border border-[#253D2C] bg-[#253D2C] px-4 py-3.5 text-[#FCF5EB] shadow-[0_14px_30px_-18px_rgba(37,61,44,0.9)] transition hover:-translate-y-0.5 hover:bg-[#2E6F40]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-lg font-semibold">
                    𝕏
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#BFE8C8]">
                      Official launch updates
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-bold">
                      @mailforfounders
                    </span>
                  </span>
                  <span className="text-lg transition-transform group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
                <a
                  href="https://www.instagram.com/entrepreneur.rupesh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Rupesh on Instagram"
                  className="group flex items-center gap-3 rounded-2xl border border-[#253D2C]/10 bg-white/70 px-4 py-3.5 text-[#253D2C] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#253D2C]/15 text-sm font-bold">
                    IG
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#3C5A47]/60">
                      Behind the build
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-bold">
                      @entrepreneur.rupesh
                    </span>
                  </span>
                  <span className="text-lg text-[#2E6F40] transition-transform group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
                <a
                  href="https://www.veilchat.me/discover/64c2bf97-4eac-4420-ad9d-5b9fe58df06a"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the official VeilChat profile"
                  className="group flex items-center gap-3 rounded-2xl border border-[#68BA7F]/30 bg-[#E8FAEE]/80 px-4 py-3.5 text-[#253D2C] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#E8FAEE]"
                >
                  <img
                    src={waitlistOfferArt}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#2E6F40]">
                      Official VeilChat profile
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-bold">
                      Meet VeilChat
                    </span>
                  </span>
                  <span className="text-lg text-[#2E6F40] transition-transform group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
                <a
                  href="https://www.youtube.com/@TryAloneFailAloneWinAlone"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the Try Alone Fail Alone Win Alone YouTube channel"
                  className="group flex items-center gap-3 rounded-2xl border border-[#FF0000]/15 bg-[#FFF7F5] px-4 py-3.5 text-[#253D2C] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#FF0000] text-sm text-white shadow-[0_8px_18px_rgba(255,0,0,0.18)]">
                    ▶
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#D00000]/65">
                      Behind the build
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-bold">
                      Try Alone · Fail Alone · Win Alone
                    </span>
                  </span>
                  <span className="text-lg text-[#D00000] transition-transform group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
              </div>
            </div>
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
        .waitlist-scene {
          position: fixed;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
          perspective: 1000px;
        }
        .waitlist-scene-grid {
          position: absolute;
          right: -14vw;
          bottom: -22vh;
          width: 78vw;
          height: 72vh;
          opacity: 0.36;
          background-image:
            linear-gradient(rgba(46,111,64,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,111,64,0.1) 1px, transparent 1px);
          background-size: 48px 48px;
          transform: rotateX(62deg) rotateZ(-13deg) translateZ(-80px);
          transform-origin: center bottom;
          -webkit-mask-image: linear-gradient(to top, black, transparent 78%);
          mask-image: linear-gradient(to top, black, transparent 78%);
          animation: waitlist-grid-drift 18s linear infinite;
        }
        .waitlist-scene-halo {
          position: absolute;
          top: 10vh;
          right: 8vw;
          width: min(42vw, 38rem);
          height: min(42vw, 38rem);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,250,238,0.88) 0, rgba(232,250,238,0.36) 33%, transparent 69%);
          filter: blur(3px);
          animation: waitlist-halo-breathe 7s ease-in-out infinite;
        }
        .waitlist-scene-ring {
          position: absolute;
          top: 28vh;
          right: 13vw;
          width: min(32vw, 29rem);
          height: min(14vw, 12rem);
          border: 1px solid rgba(46,111,64,0.22);
          border-radius: 50%;
          transform-style: preserve-3d;
          box-shadow: 0 0 32px rgba(46,111,64,0.08);
        }
        .waitlist-scene-ring-one {
          transform: rotateX(68deg) rotateZ(-18deg);
          animation: waitlist-scene-spin 13s linear infinite;
        }
        .waitlist-scene-ring-two {
          width: min(24vw, 21rem);
          height: min(11vw, 10rem);
          top: 31vh;
          right: 17vw;
          border-color: rgba(212,123,41,0.32);
          transform: rotateX(68deg) rotateZ(42deg);
          animation: waitlist-scene-spin-reverse 10s linear infinite;
        }
        .waitlist-scene-core {
          position: absolute;
          top: 28vh;
          right: calc(13vw + min(16vw, 14.5rem));
          display: grid;
          width: 7.5rem;
          height: 7.5rem;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.86);
          border-radius: 34% 66% 54% 46% / 45% 43% 57% 55%;
          background: linear-gradient(145deg, rgba(255,255,255,0.76), rgba(196,226,201,0.54));
          box-shadow:
            inset 12px 10px 26px rgba(255,255,255,0.78),
            inset -14px -12px 24px rgba(46,111,64,0.12),
            0 24px 64px rgba(46,111,64,0.14);
          transform: translateZ(0) rotate(-16deg);
          animation: waitlist-core-float 5.5s ease-in-out infinite;
        }
        .waitlist-scene-core-letter {
          color: #2E6F40;
          font-family: Georgia, serif;
          font-size: 3.7rem;
          font-weight: 700;
          transform: rotate(16deg);
          text-shadow: 2px 4px 0 rgba(255,255,255,0.55);
        }
        .waitlist-scene-card {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(255,255,255,0.72);
          border-radius: 0.9rem;
          background: rgba(255,255,255,0.48);
          padding: 0.72rem 0.85rem;
          color: rgba(37,61,44,0.68);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          box-shadow: 0 16px 34px rgba(37,61,44,0.1);
          backdrop-filter: blur(13px);
          white-space: nowrap;
        }
        .waitlist-scene-card strong {
          color: #2E6F40;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .waitlist-scene-card-one {
          top: 20vh;
          right: 6vw;
          animation: waitlist-card-float 5s ease-in-out infinite;
        }
        .waitlist-scene-card-two {
          top: 47vh;
          right: 9vw;
          animation: waitlist-card-float 6s ease-in-out -2s infinite reverse;
        }
        .waitlist-scene-card-dot,
        .waitlist-scene-card-spark {
          display: grid;
          width: 1.25rem;
          height: 1.25rem;
          place-items: center;
          border-radius: 0.4rem;
          background: #E8FAEE;
          color: #2E6F40;
        }
        .waitlist-scene-card-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: #D47B29;
          box-shadow: 0 0 0 5px rgba(212,123,41,0.12);
        }
        .waitlist-scene-star {
          position: absolute;
          width: 0.28rem;
          height: 0.28rem;
          border-radius: 50%;
          background: #D47B29;
          box-shadow: 0 0 18px 4px rgba(212,123,41,0.24);
          animation: waitlist-star-twinkle 2.6s ease-in-out infinite;
        }
        .waitlist-scene-star-one { top: 24vh; right: 37vw; }
        .waitlist-scene-star-two { top: 59vh; right: 22vw; animation-delay: -1.1s; }
        .waitlist-scene-star-three { top: 12vh; right: 22vw; animation-delay: -1.8s; }
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
          height: 10.5rem;
          max-width: 28rem;
          perspective: 900px;
        }
        .waitlist-3d-ring {
          position: absolute;
          left: 3.3rem;
          bottom: 1.7rem;
          width: 15rem;
          height: 5rem;
          border: 1px solid rgba(46,111,64,0.22);
          border-radius: 50%;
          transform: rotateX(67deg) rotateZ(-12deg);
          box-shadow: 0 0 20px rgba(46,111,64,0.1);
        }
        .waitlist-3d-ring-back {
          animation: waitlist-local-ring 7s linear infinite;
        }
        .waitlist-3d-ring-front {
          width: 11rem;
          height: 3.6rem;
          left: 5rem;
          bottom: 2.4rem;
          border-color: rgba(212,123,41,0.34);
          transform: rotateX(67deg) rotateZ(22deg);
          animation: waitlist-local-ring-reverse 5s linear infinite;
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
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 0.45rem;
          object-fit: cover;
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
        .waitlist-founder-perk {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          max-width: 32rem;
          border: 1px solid rgba(212,123,41,0.24);
          border-radius: 1rem;
          background: rgba(255,248,235,0.86);
          padding: 0.85rem 1rem;
          box-shadow: 0 12px 28px rgba(212,123,41,0.08);
        }
        .waitlist-video-card {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }
        .waitlist-video-card:hover {
          border-color: rgba(46,111,64,0.24);
          box-shadow: 0 22px 48px rgba(37,61,44,0.14);
          transform: translateY(-3px);
        }
        .waitlist-video-frame {
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #253D2C;
        }
        .waitlist-video-frame iframe {
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
        }
        .waitlist-category-card {
          min-height: 100%;
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }
        .waitlist-category-card:hover {
          border-color: rgba(46,111,64,0.25);
          box-shadow: 0 14px 28px rgba(37,61,44,0.08);
          transform: translateY(-3px);
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
        @keyframes waitlist-grid-drift {
          from { background-position: 0 0; }
          to { background-position: 0 48px; }
        }
        @keyframes waitlist-halo-breathe {
          0%, 100% { opacity: 0.7; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes waitlist-scene-spin {
          from { transform: rotateX(68deg) rotateZ(-18deg) rotate(0deg); }
          to { transform: rotateX(68deg) rotateZ(-18deg) rotate(360deg); }
        }
        @keyframes waitlist-scene-spin-reverse {
          from { transform: rotateX(68deg) rotateZ(42deg) rotate(360deg); }
          to { transform: rotateX(68deg) rotateZ(42deg) rotate(0deg); }
        }
        @keyframes waitlist-core-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-16deg); }
          50% { transform: translate3d(0, -13px, 0) rotate(-8deg); }
        }
        @keyframes waitlist-card-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
          50% { transform: translate3d(0, -9px, 0) rotate(2deg); }
        }
        @keyframes waitlist-star-twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.35); }
        }
        @keyframes waitlist-local-ring {
          from { transform: rotateX(67deg) rotateZ(-12deg) rotate(0deg); }
          to { transform: rotateX(67deg) rotateZ(-12deg) rotate(360deg); }
        }
        @keyframes waitlist-local-ring-reverse {
          from { transform: rotateX(67deg) rotateZ(22deg) rotate(360deg); }
          to { transform: rotateX(67deg) rotateZ(22deg) rotate(0deg); }
        }
        @media (max-width: 700px) {
          .waitlist-scene-grid {
            right: -42vw;
            bottom: -12vh;
            width: 150vw;
            height: 46vh;
            opacity: 0.18;
          }
          .waitlist-scene-halo {
            top: 15vh;
            right: -24vw;
            width: 88vw;
            height: 88vw;
          }
          .waitlist-scene-ring {
            top: 25vh;
            right: -8vw;
            width: 72vw;
            height: 34vw;
            opacity: 0.65;
          }
          .waitlist-scene-ring-two {
            top: 28vh;
            right: 4vw;
            width: 52vw;
            height: 24vw;
          }
          .waitlist-scene-core {
            top: 25vh;
            right: 31vw;
            width: 5.2rem;
            height: 5.2rem;
          }
          .waitlist-scene-core-letter {
            font-size: 2.7rem;
          }
          .waitlist-scene-card {
            display: none;
          }
          .waitlist-scene-star-one {
            top: 25vh;
            right: 14vw;
          }
          .waitlist-scene-star-two {
            top: 39vh;
            right: 20vw;
          }
          .waitlist-scene-star-three {
            top: 17vh;
            right: 36vw;
          }
          .waitlist-3d-stage {
            height: 8.5rem;
            margin-top: 2rem;
          }
          .waitlist-3d-mail {
            left: 3.5rem;
            transform: scale(0.8) rotateX(58deg) rotateZ(-18deg) rotateY(-22deg);
            transform-origin: left bottom;
          }
          .waitlist-3d-ring {
            left: 1.5rem;
            transform: scale(0.8) rotateX(67deg) rotateZ(-12deg);
            transform-origin: left bottom;
          }
          .waitlist-3d-ring-front {
            left: 2.9rem;
            transform: scale(0.8) rotateX(67deg) rotateZ(22deg);
          }
          .waitlist-float-label-one {
            right: 0;
          }
          .waitlist-float-label-two {
            right: 0.5rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .waitlist-reveal,
          .waitlist-orbit-one,
          .waitlist-orbit-two,
          .waitlist-scene-grid,
          .waitlist-scene-halo,
          .waitlist-scene-ring-one,
          .waitlist-scene-ring-two,
          .waitlist-scene-core,
          .waitlist-scene-card-one,
          .waitlist-scene-card-two,
          .waitlist-scene-star,
          .waitlist-3d-mail,
          .waitlist-3d-shadow,
          .waitlist-3d-ring-back,
          .waitlist-3d-ring-front,
          .waitlist-float-label-one,
          .waitlist-float-label-two,
          .waitlist-launch-note-pulse {
            animation: none;
          }
          .waitlist-feature-card,
          .waitlist-category-card,
          .waitlist-form-card {
            transition: none;
          }
          .waitlist-video-card {
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

function FeatureGroup({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="waitlist-category-card rounded-2xl border border-[#253D2C]/10 bg-white/70 p-4 backdrop-blur">
      <h2 className="text-sm font-bold text-[#253D2C]">{title}</h2>
      <ul className="waitlist-category-list mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-[#3C5A47]/75">
            <span className="mt-0.5 text-[#2E6F40]" aria-hidden="true">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
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