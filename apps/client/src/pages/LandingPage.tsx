import { Link } from "react-router-dom";
import { useDocumentMeta } from "../lib/useDocumentMeta";

const colors = {
  cream: "#FCF5EB",
  ink: "#253D2C",
  copy: "#3C5A47",
  green: "#2E6F40",
  mint: "#CFFFDC",
};

/**
 * Public marketing landing page.
 *
 * The landing page intentionally stays small: one promise, one action, and
 * enough proof to make the product understandable without asking visitors to
 * navigate a brochure.
 */
export function LandingPage() {
  useDocumentMeta({
    title: "VeilChat — Private messaging, beautifully simple",
    description:
      "VeilChat is a private, end-to-end encrypted messenger for the people you actually trust. Free, open source, no ads, no tracking.",
    canonical: "/",
    ogType: "website",
  });

  return (
    <div
      className="min-h-screen antialiased"
      style={{
        backgroundColor: colors.cream,
        color: colors.ink,
        fontFamily:
          "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <SiteHeader />

      <main id="main">
        <Hero />
        <ProofRow />
        <PrivacyStatement />
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-[#FCF5EB]/80 backdrop-blur-xl"
      style={{ borderBottomColor: "rgba(37, 61, 44, 0.08)" }}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          aria-label="VeilChat home"
          className="inline-flex items-center gap-2.5 rounded-full focus-visible:ring-2 focus-visible:ring-[#2E6F40]/40 focus-visible:ring-offset-2"
        >
          <BrandMark size={34} />
          <span className="text-[17px] font-bold tracking-[-0.02em]">{`VeilChat`}</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to="/login"
            className="rounded-full px-2 py-2 text-[14px] font-medium text-[#3C5A47] transition-colors hover:text-[#253D2C] focus-visible:ring-2 focus-visible:ring-[#2E6F40]/40 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
          <Link
            to="/welcome"
            className="rounded-full bg-[#2E6F40] px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(46,111,64,0.7)] transition-all hover:bg-[#253D2C] hover:shadow-[0_12px_24px_-10px_rgba(46,111,64,0.8)] focus-visible:ring-2 focus-visible:ring-[#2E6F40]/50 focus-visible:ring-offset-2 sm:px-5"
          >
            Start chatting
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-36 sm:px-8 sm:pb-28 sm:pt-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-48 h-[620px] w-[620px] rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(207,255,220,0.95), rgba(207,255,220,0) 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 -left-48 h-[500px] w-[500px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(104,186,127,0.2), rgba(104,186,127,0) 68%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-20">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#68BA7F]/35 bg-[#E8FAEE] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2E6F40]">
            <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-white/75">
              <LockIcon size={11} />
            </span>
            Private by default
          </div>

          <h1
            className="max-w-[680px] text-[46px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#253D2C] sm:text-[64px] lg:text-[76px]"
            style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
          >
            A quieter way to{" "}
            <span className="italic text-[#2E6F40]">stay close.</span>
          </h1>

          <p className="mt-7 max-w-xl text-[17px] leading-[1.65] text-[#3C5A47] sm:text-[19px]">
            VeilChat is the simple messenger for the people you actually trust.
            Your messages, calls, and photos are end-to-end encrypted from the
            start.
          </p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              to="/welcome"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#3A8550] to-[#2E6F40] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_36px_-14px_rgba(46,111,64,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all hover:-translate-y-0.5 hover:from-[#2E6F40] hover:to-[#253D2C] hover:shadow-[0_22px_44px_-14px_rgba(46,111,64,0.65)] focus-visible:ring-2 focus-visible:ring-[#2E6F40]/50 focus-visible:ring-offset-2"
            >
              Start chatting
              <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <span className="text-[13px] text-[#3C5A47]/75">
              Free forever · No ads · No tracking
            </span>
          </div>
        </div>

        <ConversationPreview />
      </div>
    </section>
  );
}

function ConversationPreview() {
  return (
    <div
      aria-label="Illustration of an end-to-end encrypted conversation"
      className="relative mx-auto w-full max-w-[360px]"
      role="img"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(46,111,64,0.18), rgba(46,111,64,0) 64%)",
        }}
      />
      <div className="relative rounded-[2.25rem] bg-[#111B21] p-[6px] shadow-[0_42px_80px_-28px_rgba(17,27,33,0.48)]">
        <div className="overflow-hidden rounded-[1.9rem] bg-[#FCF5EB]">
          <div className="flex items-center justify-between px-6 pb-2 pt-4 text-[10px] font-semibold text-[#253D2C]/65">
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#253D2C]/55" />
              <span className="h-1 w-1 rounded-full bg-[#253D2C]/55" />
              <span>100%</span>
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#2E6F40] px-4 py-3.5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-semibold">
              A
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold">Alex Mendoza</div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#CFFFDC]">
                <LockIcon size={10} />
                End-to-end encrypted
              </div>
            </div>
            <span className="text-white/80">
              <DotsIcon />
            </span>
          </div>

          <div
            className="min-h-[310px] space-y-2.5 px-4 py-5"
            style={{
              backgroundColor: "#EAF8E7",
              backgroundImage:
                "radial-gradient(rgba(46,111,64,0.08) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          >
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CFFFDC]/80 px-3 py-1 text-[10px] font-medium text-[#3C5A47]">
                <LockIcon size={10} />
                Only you can read these messages
              </span>
            </div>
            <MessageBubble side="in">Hey, are we still on for Saturday?</MessageBubble>
            <MessageBubble side="out">
              Wouldn&apos;t miss it. 7pm at the place by the park?
            </MessageBubble>
            <MessageBubble side="in">Perfect. I&apos;ll bring the playlist.</MessageBubble>
            <MessageBubble side="out">You always do.</MessageBubble>
          </div>

          <div className="flex items-center gap-2 bg-[#FCF5EB] px-3 pb-3 pt-2">
            <div className="flex h-10 flex-1 items-center rounded-full border border-[#253D2C]/10 bg-white px-4 text-[12px] text-[#3C5A47]/60">
              Message
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2E6F40] text-white">
              <SendIcon />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  children,
  side,
}: {
  children: React.ReactNode;
  side: "in" | "out";
}) {
  return (
    <div className={side === "in" ? "flex justify-start" : "flex justify-end"}>
      <div
        className={[
          "max-w-[82%] rounded-2xl px-3.5 py-2 text-[12px] leading-snug text-[#111B21] shadow-[0_1px_1px_rgba(17,27,33,0.06)]",
          side === "in" ? "rounded-tl-md bg-white" : "rounded-tr-md bg-[#CFFFDC]",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function ProofRow() {
  const proof = [
    {
      title: "Private identity",
      body: "No phone number required to create an account.",
      icon: <PersonIcon />,
    },
    {
      title: "Encrypted by default",
      body: "Your keys stay on your device. Not on our servers.",
      icon: <LockIcon size={20} />,
    },
    {
      title: "Open source",
      body: "Read the code, verify the claims, or self-host it.",
      icon: <CodeIcon />,
    },
  ];

  return (
    <section className="border-y border-[#253D2C]/10 bg-white/45 px-5 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-3 md:gap-8">
        {proof.map((item) => (
          <div key={item.title} className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#E8FAEE] text-[#2E6F40]">
              {item.icon}
            </span>
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#253D2C]">
                {item.title}
              </h2>
              <p className="mt-1.5 max-w-[250px] text-[13px] leading-[1.55] text-[#3C5A47]/80">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrivacyStatement() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid w-full max-w-6xl items-end gap-10 md:grid-cols-[1fr_auto] md:gap-16">
        <div className="max-w-2xl">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2E6F40]">
            Built around trust
          </p>
          <h2
            className="text-[38px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#253D2C] sm:text-[52px]"
            style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
          >
            Nothing to sell.
            <br />
            Nothing to watch.
          </h2>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.7] text-[#3C5A47]">
            VeilChat is free, independent, and made for real conversations.
            There are no ads, no tracking pixels, and no business model built
            around your attention.
          </p>
        </div>

        <Link
          to="/encryption"
          className="group inline-flex items-center gap-2 self-start rounded-full border border-[#253D2C]/15 bg-white/60 px-5 py-3 text-[14px] font-semibold text-[#253D2C] transition-all hover:border-[#2E6F40]/40 hover:bg-white hover:text-[#2E6F40] md:self-end"
        >
          See how encryption works
          <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#253D2C]/10 px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 text-[12px] text-[#3C5A47]/75 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <BrandMark size={25} />
          <span className="font-semibold text-[#253D2C]">VeilChat</span>
          <span aria-hidden="true">·</span>
          <span>Private messaging, simply.</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link className="hover:text-[#2E6F40]" to="/about">
            About
          </Link>
          <Link className="hover:text-[#2E6F40]" to="/open-source">
            Open source
          </Link>
          <Link className="hover:text-[#2E6F40]" to="/privacy-policy">
            Privacy
          </Link>
          <Link className="hover:text-[#2E6F40]" to="/terms">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative grid place-items-center bg-[#2E6F40] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_-8px_rgba(46,111,64,0.55)]"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        fill="none"
      >
        <path
          d="M16 22 L32 44 L48 22"
          stroke="white"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="52" cy="13" r="4" fill="white" />
      </svg>
    </span>
  );
}

function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="9" rx="2.2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="m2 21 21-9L2 3v7l15 2-15 2z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.9-3.1 3.4-4.7 7.5-4.7s6.6 1.6 7.5 4.7" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 9-3 3 3 3" />
      <path d="m16 9 3 3-3 3" />
      <path d="m14 5-4 14" />
    </svg>
  );
}