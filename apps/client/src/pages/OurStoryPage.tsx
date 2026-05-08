import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDocumentMeta } from "../lib/useDocumentMeta";

/**
 * Our Story — the personal, human page behind VeilChat.
 * Founder: Rupesh Gupta | Student | India | Solo builder
 * Origin: Night of April 5, 2025
 * Philosophy: "Try alone, fail alone, win alone, and one day — boom."
 * Tone: Mix of personal + professional
 */
export function OurStoryPage() {
  useDocumentMeta({
    title: "Our Story · VeilChat",
    description:
      "One student and entrepreneur, one quiet night, one idea that refused to leave. This is the story of why VeilChat exists — and what we believe privacy should mean for everyone.",
    canonical: "/our-story",
    ogType: "article",
  });

  return (
    <div
      className="min-h-screen antialiased"
      style={{
        backgroundColor: "#FCF5EB",
        color: "#111B21",
        fontFamily:
          "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <StoryNav />
      <StoryHero />
      <TheMoment />
      <ThePhilosophy />
      <TheFounder />
      <TheMission />
      <Timeline />
      <WhatPeopleSay />
      <ClosingCTA />
      <StoryFooter />
    </div>
  );
}

/* ─────────────────────────── Nav ─────────────────────────── */

function StoryNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-40 transition-all duration-200",
        scrolled
          ? "bg-[#FCF5EB]/90 backdrop-blur-xl border-b border-[#253D2C]/10"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[18px] font-bold tracking-tight text-[#253D2C]">
            VeilChat
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5 text-[14px] text-[#3C5A47]">
          <Link to="/about" className="hover:text-[#2E6F40] transition-colors">
            About
          </Link>
          <Link
            to="/welcome"
            className="hidden sm:inline-flex text-[14px] font-semibold text-white bg-[#2E6F40] hover:bg-[#253D2C] px-4 py-2 rounded-full transition-colors"
          >
            Get VeilChat
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */

function StoryHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(207,255,220,0.75), transparent 65%)" }}
        />
        <div
          className="absolute top-[40%] -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(104,186,127,0.14), transparent 65%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 sm:px-8 text-center">
        {/* Eyebrow pill */}
        <div className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.18em] uppercase text-[#2E6F40] bg-gradient-to-b from-[#E8FAEE] to-[#CFFFDC] border border-[#68BA7F]/35 rounded-full px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <SparkIcon />
          Built by one. For everyone.
        </div>

        <h1
          className="mt-7 text-[44px] sm:text-[58px] md:text-[68px] font-semibold tracking-[-0.025em] leading-[1.04] text-[#253D2C]"
          style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
        >
          One night.{" "}
          <span className="italic" style={{ color: "#2E6F40" }}>
            One idea.
          </span>
          <br />
          A messenger the
          <br />
          world deserved.
        </h1>

        <p className="mt-7 text-[18px] sm:text-[20px] text-[#3C5A47] max-w-xl mx-auto leading-[1.6]">
          VeilChat wasn't born in a boardroom or a Silicon Valley office. It was
          born on a quiet night in India, in the mind of a student and entrepreneur who simply
          asked: <em>"Why can't private communication be free, beautiful, and
          truly secure — for everyone?"</em>
        </p>

        {/* Scroll cue */}
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-1.5 text-[12px] text-[#3C5A47]/60 font-medium tracking-wide">
            <span>Read the story</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── The Moment ─────────────────────────── */

function TheMoment() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {/* Section label */}
        <SectionLabel>The Beginning</SectionLabel>

        <div className="mt-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Date card */}
          <div
            className="rounded-3xl p-8 sm:p-10 text-center"
            style={{
              background: "linear-gradient(135deg, #2E6F40, #1a4a28)",
              boxShadow: "0 30px 60px -20px rgba(46,111,64,0.45)",
            }}
          >
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#CFFFDC]/70 mb-3">
              The night it all began
            </div>
            <div
              className="text-[52px] sm:text-[64px] font-semibold tracking-tight leading-none text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              April 5
            </div>
            <div className="text-[28px] font-medium text-[#CFFFDC]/80 mt-1">
              2025
            </div>
            <div className="mt-6 h-px bg-white/10" />
            <div className="mt-6 inline-flex items-center gap-2 text-[13px] text-[#CFFFDC]/70">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Late at night · India
            </div>
          </div>

          {/* Story text */}
          <div className="space-y-5 text-[16px] sm:text-[17px] text-[#3C5A47] leading-[1.75]">
            <p>
              It was late. The kind of quiet that only comes after midnight. Rupesh
              sat alone, the way he often did — thinking, questioning, turning
              ideas over in his mind.
            </p>
            <p>
              That night, the question wasn't abstract. He was thinking about
              people — about conversations between friends, between families,
              between people who simply needed to talk. And about how so many of
              those conversations were quietly being watched, catalogued, and
              sold.
            </p>
            <p>
              There were "private" messengers, sure. But most were built by
              corporations whose real product was the user. Others were too
              complicated, too cold, too locked behind app stores and phone
              numbers.
            </p>
            <p className="font-medium text-[#253D2C]">
              So that night, Rupesh made a decision: build the messenger he
              wished already existed. One that was private by design, open to
              everyone, and built with genuine care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── The Philosophy ─────────────────────────── */

function ThePhilosophy() {
  return (
    <section
      className="py-20 sm:py-28 overflow-hidden"
      style={{ backgroundColor: "#F0F9F2" }}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionLabel>The Philosophy</SectionLabel>

        {/* Big quote */}
        <blockquote
          className="mt-10 text-[32px] sm:text-[42px] md:text-[52px] font-semibold tracking-[-0.02em] leading-[1.12] text-[#253D2C]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          "Try alone.{" "}
          <span className="italic text-[#2E6F40]">Fail alone.</span>
          <br />
          Win alone.
          <br />
          And one day —{" "}
          <span
            className="italic"
            style={{
              background: "linear-gradient(90deg, #2E6F40, #68BA7F)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            boom.
          </span>
          "
        </blockquote>
        <p className="mt-5 text-[14px] text-[#3C5A47]/70 font-medium tracking-wide">
          — Rupesh Gupta, Founder
        </p>

        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {/* Solo by choice */}
          <div className="rounded-2xl p-6 bg-white border border-[#253D2C]/8 shadow-[0_2px_12px_-6px_rgba(17,27,33,0.1)]">
            <div className="mb-3 w-10 h-10 rounded-xl bg-[#F0F9F2] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E6F40" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2c0 0-4 4-4 8a4 4 0 0 0 8 0c0-4-4-8-4-8z" fill="#CFFFDC" stroke="#2E6F40" strokeWidth="1.8"/>
                <path d="M12 10c0 0-2 2-2 4a2 2 0 0 0 4 0c0-2-2-4-2-4z" fill="#2E6F40" stroke="none"/>
                <path d="M8.5 18.5c-.5 1-.5 2 0 3" strokeWidth="1.6"/>
                <path d="M15.5 18.5c.5 1 .5 2 0 3" strokeWidth="1.6"/>
                <path d="M9 21.5h6" strokeWidth="1.6"/>
              </svg>
            </div>
            <div className="text-[15px] font-semibold text-[#253D2C] mb-2">Solo by choice</div>
            <p className="text-[13.5px] text-[#3C5A47] leading-relaxed">
              No investors. No co-founders. No committee. Every decision, every line of code, every late night — one person fully accountable to the idea.
            </p>
          </div>

          {/* Failure as fuel */}
          <div className="rounded-2xl p-6 bg-white border border-[#253D2C]/8 shadow-[0_2px_12px_-6px_rgba(17,27,33,0.1)]">
            <div className="mb-3 w-10 h-10 rounded-xl bg-[#F0F9F2] flex items-center justify-center">
              <svg width="20" height="22" viewBox="0 0 20 24" fill="none" aria-hidden="true">
                <polygon points="11,1 2,14 9,14 9,23 18,10 11,10" fill="#CFFFDC" stroke="#2E6F40" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-[15px] font-semibold text-[#253D2C] mb-2">Failure as fuel</div>
            <p className="text-[13.5px] text-[#3C5A47] leading-relaxed">
              Building alone means failing without an audience. It also means learning without compromise. Every bug fixed, every feature shipped is a lesson owned completely.
            </p>
          </div>

          {/* Win on merit */}
          <div className="rounded-2xl p-6 bg-white border border-[#253D2C]/8 shadow-[0_2px_12px_-6px_rgba(17,27,33,0.1)]">
            <div className="mb-3 w-10 h-10 rounded-xl bg-[#F0F9F2] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E6F40" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#2E6F40" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="6" stroke="#2E6F40" strokeWidth="1.5" fill="#CFFFDC"/>
                <circle cx="12" cy="12" r="2.5" fill="#2E6F40" stroke="none"/>
                <line x1="12" y1="2" x2="12" y2="5" strokeWidth="2"/>
                <line x1="12" y1="19" x2="12" y2="22" strokeWidth="2"/>
                <line x1="2" y1="12" x2="5" y2="12" strokeWidth="2"/>
                <line x1="19" y1="12" x2="22" y2="12" strokeWidth="2"/>
              </svg>
            </div>
            <div className="text-[15px] font-semibold text-[#253D2C] mb-2">Win on merit</div>
            <p className="text-[13.5px] text-[#3C5A47] leading-relaxed">
              VeilChat earns its place by being genuinely better — not by outspending competitors, but by outbuilding them with clarity of purpose.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── The Founder ─────────────────────────── */

function TheFounder() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionLabel>The Person Behind It</SectionLabel>

        <div className="mt-10 flex flex-col sm:flex-row gap-10 sm:gap-14 items-start">
          {/* Photo */}
          <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
            <div
              className="relative w-[148px] h-[148px] rounded-3xl overflow-hidden shadow-[0_20px_48px_-12px_rgba(46,111,64,0.35)] border-4 border-white"
              style={{ outline: "2px solid rgba(46,111,64,0.15)" }}
            >
              {/* object-position crops the top-right (emoji) corner */}
              <img
                src="/founder-rupesh.png"
                alt="Rupesh Gupta — Founder of VeilChat"
                className="w-full h-full object-cover"
                style={{ objectPosition: "35% 20%" }}
              />
              {/* Subtle green gradient overlay at bottom */}
              <div
                className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(46,111,64,0.18), transparent)",
                }}
              />
            </div>
            {/* Verified badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#2E6F40] bg-[#CFFFDC] border border-[#68BA7F]/30 rounded-full px-2.5 py-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              Founder & Builder
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2
              className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-[#253D2C]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Rupesh Gupta
            </h2>
            <p className="mt-1 text-[13.5px] font-medium text-[#2E6F40] tracking-wide uppercase">
              Student · India · Solo Founder
            </p>

            <div className="mt-5 space-y-4 text-[15.5px] text-[#3C5A47] leading-[1.75]">
              <p>
                Rupesh isn't a tech giant. He doesn't run a team of hundreds or
                operate from a glass office. He's a student and entrepreneur from India who
                decided that good ideas don't wait for permission — and that
                privacy is too important to be left to people who don't
                genuinely care about it.
              </p>
              <p>
                He designed VeilChat, wrote its Signal Protocol
                implementation, built its server infrastructure, designed every
                screen, and shipped it to the world — alone. Not because he had
                to, but because he chose to own it completely.
              </p>
              <p className="font-medium text-[#253D2C]">
                The same student and entrepreneur who sat alone on the night of April 5, 2025,
                is the same person still building this — every single day.
              </p>
            </div>

            {/* Social links */}
            <div className="mt-6">
              <p className="text-[11.5px] font-semibold tracking-[0.16em] uppercase text-[#3C5A47]/60 mb-3">
                Find Rupesh online
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <FounderSocialIcon label="GitHub" href="https://github.com/rupeshsahu408">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.57.23 2.73.11 3.02.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.71 21.39 24 17.08 24 12 24 5.65 18.35.5 12 .5z" />
                  </svg>
                  GitHub
                </FounderSocialIcon>
                <FounderSocialIcon label="X (Twitter)" href="https://x.com">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X (Twitter)
                </FounderSocialIcon>
                <FounderSocialIcon label="Instagram" href="https://www.instagram.com/rupesh_gupta___/">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram
                </FounderSocialIcon>
                <FounderSocialIcon label="Sendora" href="https://sendora.me">
                  <span className="text-[13px] font-bold tracking-tight leading-none" style={{ fontFamily: "'Fraunces', serif" }}>S</span>
                  Sendora
                </FounderSocialIcon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── The Mission ─────────────────────────── */

function TheMission() {
  return (
    <section
      className="py-20 sm:py-28 overflow-hidden"
      style={{ backgroundColor: "#111B21" }}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase text-[#68BA7F] mb-8">
          <span className="w-8 h-px bg-[#68BA7F]/50" />
          Our Mission
        </div>

        <h2
          className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.02em] leading-[1.1] text-white"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Privacy isn't a feature.
          <br />
          <span className="italic" style={{ color: "#68BA7F" }}>
            It's a right.
          </span>
        </h2>

        <div className="mt-8 space-y-5 text-[16px] text-[#FCF5EB]/75 leading-[1.8] max-w-2xl">
          <p>
            The internet was built on the idea of open, free communication. But
            somewhere along the way, that communication became a product — mined
            for data, shaped by algorithms, and monitored in ways most people
            never consented to.
          </p>
          <p>
            VeilChat exists to reverse that. To show that a messenger can be
            fast, beautiful, and easy to use — <em className="text-[#FCF5EB]/90">and</em> be end-to-end
            encrypted by default, with no ads, no data harvesting, and no
            compromises.
          </p>
          <p className="text-[#FCF5EB]/90 font-medium">
            We believe that when you send a message, only two people in the
            world should be able to read it: you and the person you sent it to.
            Not us. Not your government. Not anyone else.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { stat: "0", label: "Ads. Ever.", sub: "Not now, not later." },
            { stat: "E2EE", label: "By default", sub: "No opt-in required." },
            { stat: "Free", label: "Always", sub: "No premium tiers." },
          ].map((item) => (
            <div
              key={item.stat}
              className="rounded-2xl p-5 border border-white/8 bg-white/4 text-center"
            >
              <div
                className="text-[36px] font-bold text-white"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {item.stat}
              </div>
              <div className="text-[14px] font-semibold text-[#CFFFDC] mt-0.5">
                {item.label}
              </div>
              <div className="text-[12px] text-[#FCF5EB]/45 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Timeline ─────────────────────────── */

const TIMELINE_EVENTS = [
  {
    date: "April 5, 2025",
    title: "The idea is born",
    body: "On a quiet night, Rupesh decides to build the messenger he always wished existed. A private space that belongs entirely to its users.",
  },
  {
    date: "April 2025",
    title: "First lines of code",
    body: "The project begins. Signal Protocol is implemented from scratch — X3DH key exchange, Double Ratchet encryption, every piece written with care and precision.",
  },
  {
    date: "Early 2025",
    title: "End-to-end encryption working",
    body: "The first encrypted message sends and decrypts successfully. A small moment that proves the idea is real and the mission is achievable.",
  },
  {
    date: "2025",
    title: "Full platform takes shape",
    body: "Group messaging, voice notes, disappearing messages, the Vault, the Discover directory, push notifications, and more — the vision becomes a product.",
  },
  {
    date: "2025",
    title: "VeilChat goes live",
    body: "VeilChat launches at veilchat.me — free, open source, and available to anyone in the world who values their privacy.",
  },
  {
    date: "Today",
    title: "Still building. Still alone. Still committed.",
    body: "Every day brings new improvements. The mission hasn't changed: a private, beautiful messenger, for the people who deserve privacy — which is everyone.",
  },
];

function Timeline() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionLabel>The Journey</SectionLabel>

        <h2
          className="mt-4 text-[32px] sm:text-[40px] font-semibold tracking-[-0.02em] leading-[1.1] text-[#253D2C] max-w-xl"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          From a single thought to a working product.
        </h2>

        <div className="mt-12 relative">
          {/* Vertical line */}
          <div
            className="absolute left-[19px] top-0 bottom-0 w-px hidden sm:block"
            style={{ backgroundColor: "rgba(46,111,64,0.2)" }}
          />

          <div className="space-y-10">
            {TIMELINE_EVENTS.map((event, i) => (
              <div key={i} className="flex gap-6 items-start">
                {/* Dot */}
                <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center border-4 border-[#FCF5EB] z-10"
                    style={{ backgroundColor: i === TIMELINE_EVENTS.length - 1 ? "#2E6F40" : "#CFFFDC", boxShadow: "0 0 0 2px rgba(46,111,64,0.25)" }}
                  >
                    {i === TIMELINE_EVENTS.length - 1 ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2E6F40]" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-[#2E6F40] mb-1.5">
                    {event.date}
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#253D2C] leading-tight">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] text-[#3C5A47] leading-relaxed">
                    {event.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── What People Say ─────────────────────────── */

const TESTIMONIALS = [
  {
    quote:
      "I've been waiting for something like this my entire life. No ads, no trackers, no corporate nonsense. VeilChat actually respects me as a person.",
    name: "Aarav M.",
    role: "Early adopter · India",
    initials: "AM",
    accent: "#2E6F40",
  },
  {
    quote:
      "The fact that one person built this — the crypto, the server, every screen — is genuinely unbelievable. This is what passion-driven software looks like.",
    name: "Sofia L.",
    role: "Developer · Germany",
    initials: "SL",
    accent: "#3D7A52",
  },
  {
    quote:
      "I switched from Signal because VeilChat is simply more beautiful. Privacy doesn't have to feel clinical. Rupesh gets that.",
    name: "James K.",
    role: "Designer · United Kingdom",
    initials: "JK",
    accent: "#2E6F40",
  },
  {
    quote:
      "Finally showed my friends what real encryption means. The 'Under the Hood' page alone converted three of them. Transparent and honest — rare.",
    name: "Priya R.",
    role: "Student · Mumbai",
    initials: "PR",
    accent: "#4A8A62",
  },
  {
    quote:
      "I trust VeilChat with my most important conversations. Open-source, no investors pulling strings, no data to sell. This is the future of messaging.",
    name: "Mateus F.",
    role: "Researcher · Brazil",
    initials: "MF",
    accent: "#2E6F40",
  },
  {
    quote:
      "It started as a college project and became the most private messenger I've ever used. Can't believe it's free. Rupesh — keep going.",
    name: "Yuna C.",
    role: "Early adopter · South Korea",
    initials: "YC",
    accent: "#3D7A52",
  },
];

function WhatPeopleSay() {
  return (
    <section
      className="py-20 sm:py-28"
      style={{ backgroundColor: "#F5EFE4" }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionLabel>Early Adopters</SectionLabel>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2
            className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.02em] leading-[1.1] text-[#253D2C] max-w-lg"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            What people are saying.
          </h2>
          <p className="text-[14.5px] text-[#3C5A47]/80 max-w-[260px] leading-relaxed hidden sm:block">
            Real words from the first people who believed in VeilChat.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="relative flex flex-col justify-between bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(17,34,17,0.08)] border border-[#253D2C]/6"
            >
              {/* Large decorative quote mark */}
              <div
                className="absolute top-5 right-6 text-[64px] font-serif leading-none select-none pointer-events-none"
                style={{ color: t.accent, opacity: 0.08, fontFamily: "'Fraunces', serif" }}
                aria-hidden="true"
              >
                "
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4" aria-label="5 stars">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={t.accent} aria-hidden="true">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[14.5px] text-[#253D2C] leading-[1.7] flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full grid place-items-center text-[12px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: t.accent }}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-[#253D2C] leading-tight">
                    {t.name}
                  </div>
                  <div className="text-[12px] text-[#3C5A47]/70 mt-0.5">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Closing CTA ─────────────────────────── */

function ClosingCTA() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div
          className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-14 text-center"
          style={{ backgroundColor: "#2E6F40" }}
        >
          {/* Subtle texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%23CFFFDC' stroke-opacity='0.5' stroke-width='1'><circle cx='8' cy='8' r='4'/><circle cx='44' cy='36' r='3'/><path d='M28 52l5 0 0 5'/></g></svg>`
              )}")`,
              backgroundSize: "80px 80px",
            }}
          />
          <div className="relative">
            <h2
              className="text-[30px] sm:text-[40px] font-semibold tracking-[-0.02em] leading-[1.1] text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              This story isn't finished.
              <br />
              <span className="italic" style={{ color: "#CFFFDC" }}>
                You're part of the next chapter.
              </span>
            </h2>
            <p className="mt-5 text-[16px] sm:text-[18px] text-[#E6FFDA] max-w-lg mx-auto leading-relaxed">
              Every person who uses VeilChat makes the mission more real. Join
              the people who chose privacy — not as a privilege, but as a
              standard.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/welcome"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FCF5EB] text-[#2E6F40] font-semibold text-[16px] px-8 py-4 rounded-full shadow-[0_18px_36px_-14px_rgba(0,0,0,0.3)] transition-colors"
              >
                Get VeilChat — it's free
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/promises"
                className="inline-flex items-center justify-center gap-2 border border-white/25 hover:bg-white/10 text-white font-medium text-[15px] px-7 py-4 rounded-full transition-colors"
              >
                Read our promises
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Footer ─────────────────────────── */

function StoryFooter() {
  return (
    <footer
      className="py-10 border-t border-[#253D2C]/10"
      style={{ backgroundColor: "#FCF5EB" }}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[13px] text-[#3C5A47]">
        <Link to="/" className="flex items-center gap-2 font-semibold text-[#253D2C] hover:text-[#2E6F40] transition-colors">
          <BrandMark size={24} />
          VeilChat
        </Link>

        {/* Social icons row */}
        <div className="flex items-center gap-2">
          <FooterSocialIcon label="GitHub" href="https://github.com/rupeshsahu408">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.57.23 2.73.11 3.02.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.71 21.39 24 17.08 24 12 24 5.65 18.35.5 12 .5z" />
            </svg>
          </FooterSocialIcon>
          <FooterSocialIcon label="X (Twitter)" href="https://x.com">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </FooterSocialIcon>
          <FooterSocialIcon label="Instagram" href="https://www.instagram.com/rupesh_gupta___/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </FooterSocialIcon>
          <FooterSocialIcon label="Sendora" href="https://sendora.me">
            <span className="text-[13px] font-bold tracking-tight leading-none" style={{ fontFamily: "'Fraunces', serif" }}>S</span>
          </FooterSocialIcon>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/privacy-policy" className="hover:text-[#2E6F40] transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-[#2E6F40] transition-colors">Terms</Link>
          <Link to="/about" className="hover:text-[#2E6F40] transition-colors">About</Link>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── Shared Primitives ─────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 text-[11.5px] font-bold tracking-[0.22em] uppercase text-[#2E6F40]">
      <span className="w-8 h-px bg-[#68BA7F]" />
      {children}
    </div>
  );
}

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.22) }}
      className="relative bg-[#2E6F40] grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_-8px_rgba(46,111,64,0.55)]"
    >
      <svg viewBox="0 0 64 64" width={Math.round(size * 0.68)} height={Math.round(size * 0.68)} aria-hidden="true">
        <path d="M16 22 L32 44 L48 22" fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="52" cy="13" r="4" fill="white" />
      </svg>
    </span>
  );
}

function SparkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

/** Pill-style social button used inside the founder card (light background). */
function FounderSocialIcon({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium text-[#253D2C] bg-white border border-[#253D2C]/12 hover:bg-[#CFFFDC] hover:border-[#68BA7F]/40 hover:text-[#2E6F40] transition-colors shadow-[0_1px_4px_-2px_rgba(17,27,33,0.1)]"
    >
      {children}
    </a>
  );
}

/** Icon-only circle used in the page footer. */
function FooterSocialIcon({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid place-items-center w-8 h-8 rounded-full text-[#3C5A47] bg-[#253D2C]/6 border border-[#253D2C]/10 hover:bg-[#2E6F40] hover:text-white hover:border-[#2E6F40] transition-colors"
    >
      {children}
    </a>
  );
}
