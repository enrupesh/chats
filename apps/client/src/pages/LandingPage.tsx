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
 * The page is intentionally editorial rather than dashboard-like: one clear
 * promise up front, real product context in the middle, and transparent
 * privacy proof before the final call to action.
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
        <EverydayLife />
        <FeatureSection />
        <HowItWorks />
        <SecuritySection />
        <FaqSection />
        <FinalCta />
      </main>

      <SiteFooter />
      <PrivacyGuidePill />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#253D2C]/10 bg-[#FCF5EB]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          aria-label="VeilChat home"
          className="inline-flex items-center gap-2.5 rounded-full focus-visible:ring-2 focus-visible:ring-[#2E6F40]/40 focus-visible:ring-offset-2"
        >
          <BrandMark size={34} />
          <span className="text-[17px] font-bold tracking-[-0.02em]">VeilChat</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 text-[13px] font-medium text-[#3C5A47] lg:flex">
          <a className="transition-colors hover:text-[#2E6F40]" href="#features">Features</a>
          <a className="transition-colors hover:text-[#2E6F40]" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-[#2E6F40]" href="#privacy">Privacy</a>
          <a className="transition-colors hover:text-[#2E6F40]" href="#faq">FAQ</a>
        </nav>

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
    <section className="relative scroll-mt-20 overflow-hidden px-5 pb-20 pt-36 sm:px-8 sm:pb-28 sm:pt-44">
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
            End-to-end encrypted · Open source
          </div>

          <h1
            className="max-w-[700px] text-[48px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#253D2C] sm:text-[68px] lg:text-[78px]"
            style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
          >
            Message <span className="italic text-[#2E6F40]">privately.</span>
            <br />
            Built for the people
            <br className="hidden sm:block" /> you actually trust.
          </h1>

          <p className="mt-7 max-w-xl text-[17px] leading-[1.65] text-[#3C5A47] sm:text-[19px]">
            VeilChat is a calm, beautifully simple messenger. Every message,
            call, and photo is end-to-end encrypted by default — so your
            conversations stay between you and the people you talk to.
          </p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              to="/welcome"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#3A8550] to-[#2E6F40] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_36px_-14px_rgba(46,111,64,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all hover:-translate-y-0.5 hover:from-[#2E6F40] hover:to-[#253D2C] hover:shadow-[0_22px_44px_-14px_rgba(46,111,64,0.65)] focus-visible:ring-2 focus-visible:ring-[#2E6F40]/50 focus-visible:ring-offset-2"
            >
              Get Veil — it&apos;s free
              <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-[#253D2C]/15 bg-white/45 px-5 py-3 text-[14px] font-semibold text-[#253D2C] transition-colors hover:border-[#2E6F40]/35 hover:bg-white"
            >
              See how it works
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#3C5A47]/80">
            <CheckItem>No phone number required</CheckItem>
            <CheckItem>Works on every device</CheckItem>
            <CheckItem>Free, forever</CheckItem>
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
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-semibold">A</span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold">Alex Mendoza</div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#CFFFDC]">
                <LockIcon size={10} />
                End-to-end encrypted
              </div>
            </div>
            <span className="text-white/80"><DotsIcon /></span>
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
            <MessageBubble side="out">Wouldn&apos;t miss it. 7pm at the place by the park?</MessageBubble>
            <MessageBubble side="in">Perfect. I&apos;ll bring the playlist.</MessageBubble>
            <MessageBubble side="out">You always do.</MessageBubble>
          </div>

          <div className="flex items-center gap-2 bg-[#FCF5EB] px-3 pb-3 pt-2">
            <div className="flex h-10 flex-1 items-center rounded-full border border-[#253D2C]/10 bg-white px-4 text-[12px] text-[#3C5A47]/60">Message</div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2E6F40] text-white"><SendIcon /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ children, side }: { children: React.ReactNode; side: "in" | "out" }) {
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
    { title: "Private identity", body: "No phone number required to create an account.", icon: <PersonIcon /> },
    { title: "Encrypted by default", body: "Your keys stay on your device. Not on our servers.", icon: <LockIcon size={20} /> },
    { title: "Open source", body: "Read the code, verify the claims, or self-host it.", icon: <CodeIcon /> },
  ];

  return (
    <section className="border-y border-[#253D2C]/10 bg-white/45 px-5 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-3 md:gap-8">
        {proof.map((item) => (
          <div key={item.title} className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#E8FAEE] text-[#2E6F40]">{item.icon}</span>
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#253D2C]">{item.title}</h2>
              <p className="mt-1.5 max-w-[250px] text-[13px] leading-[1.55] text-[#3C5A47]/80">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EverydayLife() {
  return (
    <section className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32" id="features">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="order-2 lg:order-1">
          <EverydayVisual />
        </div>
        <div className="order-1 max-w-xl lg:order-2">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2E6F40]">For the moments that matter</p>
          <h2 className="text-[39px] font-semibold leading-[1.06] tracking-[-0.045em] text-[#253D2C] sm:text-[56px]" style={{ fontFamily: "'Fraunces', 'Inter', serif" }}>
            Your everyday life,
            <br />
            <span className="italic text-[#2E6F40]">kept yours.</span>
          </h2>
          <p className="mt-6 text-[16px] leading-[1.75] text-[#3C5A47]">
            From a quick “made it home” to the photos you keep coming back to,
            VeilChat gives ordinary conversations the privacy they deserve.
            No audience, no feed, no algorithm deciding what your friends see.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <SmallFeature title="Private groups" body="Plan, share, and laugh together without a data trail." />
            <SmallFeature title="Encrypted media" body="Photos and files are protected before they leave your device." />
          </div>
        </div>
      </div>
    </section>
  );
}

function EverydayVisual() {
  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[500px]" aria-label="A collage of private everyday conversations" role="img">
      <div className="absolute left-0 top-8 h-[260px] w-[220px] -rotate-6 overflow-hidden rounded-[2rem] border-[7px] border-white bg-[#E7D3B7] shadow-[0_22px_50px_-28px_rgba(37,61,44,0.7)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,#f9edcf_0_17%,transparent_18%),linear-gradient(145deg,#c9966b,#e8cda6_56%,#7e9a77)]" />
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 px-4 py-3 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2E6F40]">Saturday</p>
          <p className="mt-1 text-[14px] font-semibold text-[#253D2C]">See you at seven?</p>
        </div>
      </div>
      <div className="absolute right-0 top-0 h-[280px] w-[235px] rotate-6 overflow-hidden rounded-[2rem] border-[7px] border-white bg-[#CFFFDC] shadow-[0_24px_50px_-28px_rgba(37,61,44,0.7)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,#f3f0d1_0_15%,transparent_16%),linear-gradient(155deg,#86ae89,#cce0a6_48%,#e5ba86)]" />
        <div className="absolute bottom-0 left-0 right-0 bg-[#253D2C]/80 px-4 py-3 text-white backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CFFFDC]">Family group</p>
          <p className="mt-1 text-[14px] font-semibold">Only us, always.</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 w-[285px] -translate-x-1/2 rounded-[1.5rem] border border-[#253D2C]/10 bg-[#FCF5EB] p-4 shadow-[0_25px_55px_-30px_rgba(37,61,44,0.75)]">
        <div className="flex items-center gap-3 border-b border-[#253D2C]/10 pb-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#2E6F40] text-xs font-semibold text-white">M</span>
          <div><p className="text-[13px] font-semibold text-[#253D2C]">Maya</p><p className="text-[10px] text-[#3C5A47]/70">encrypted conversation</p></div>
          <LockIcon size={14} />
        </div>
        <div className="space-y-2 py-3 text-[11px]">
          <div className="w-fit rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[#253D2C]">Don&apos;t forget the playlist.</div>
          <div className="ml-auto w-fit rounded-xl rounded-tr-sm bg-[#CFFFDC] px-3 py-2 text-[#253D2C]">Already saved it.</div>
        </div>
      </div>
    </div>
  );
}

function FeatureSection() {
  const features = [
    { number: "01", title: "Privacy without the settings maze", body: "Encryption is on from the first message. You don’t need to understand a security menu to be protected.", icon: <ShieldIcon /> },
    { number: "02", title: "An identity that belongs to you", body: "Choose a private ID, email, or phone. Your account is yours, not a profile built for advertisers.", icon: <FingerprintIcon /> },
    { number: "03", title: "A quiet place to talk", body: "No ads, no tracking, no engagement tricks. Just fast, reliable conversations with people you trust.", icon: <QuietIcon /> },
  ];

  return (
    <section className="scroll-mt-24 bg-[#F2EDE2] px-5 py-24 sm:px-8 sm:py-32" id="privacy">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-2xl">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2E6F40]">The Veil difference</p>
          <h2 className="text-[39px] font-semibold leading-[1.07] tracking-[-0.045em] text-[#253D2C] sm:text-[54px]" style={{ fontFamily: "'Fraunces', 'Inter', serif" }}>
            Simple on the surface.
            <br /><span className="italic text-[#2E6F40]">Serious underneath.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.number} className="rounded-[1.75rem] border border-[#253D2C]/10 bg-[#FCF5EB] p-7 transition-transform hover:-translate-y-1 sm:p-8">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#CFFFDC] text-[#2E6F40]">{feature.icon}</span>
                <span className="text-[11px] font-bold tracking-[0.18em] text-[#3C5A47]/45">{feature.number}</span>
              </div>
              <h3 className="mt-8 text-[20px] font-semibold leading-tight tracking-[-0.025em] text-[#253D2C]">{feature.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#3C5A47]">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "Create your private identity", "Start with a private ID — no phone number needed. Keep your recovery kit somewhere safe."],
    ["02", "Find your people", "Share an invite or connect with a trusted contact. Your address book stays yours."],
    ["03", "Talk freely", "Send messages, photos, files, and more. Encryption protects the conversation automatically."],
  ];

  return (
    <section className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32" id="how-it-works">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="max-w-md">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2E6F40]">How it works</p>
          <h2 className="text-[39px] font-semibold leading-[1.06] tracking-[-0.045em] text-[#253D2C] sm:text-[54px]" style={{ fontFamily: "'Fraunces', 'Inter', serif" }}>
            Privacy should feel
            <br /><span className="italic text-[#2E6F40]">ordinary.</span>
          </h2>
          <p className="mt-6 text-[16px] leading-[1.75] text-[#3C5A47]">We take care of the complicated parts so you can get back to the conversation.</p>
          <Link to="/download" className="group mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-[#2E6F40] hover:text-[#253D2C]">
            See all ways to use Veil <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="divide-y divide-[#253D2C]/10 rounded-[1.75rem] border border-[#253D2C]/10 bg-white/50 px-6 sm:px-10">
          {steps.map(([number, title, body]) => (
            <div className="flex gap-5 py-7 first:pt-8 last:pb-8 sm:gap-8" key={number}>
              <span className="pt-1 text-[11px] font-bold tracking-[0.16em] text-[#2E6F40]">{number}</span>
              <div><h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[#253D2C]">{title}</h3><p className="mt-2 max-w-lg text-[14px] leading-[1.7] text-[#3C5A47]">{body}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="bg-[#253D2C] px-5 py-24 text-[#FCF5EB] sm:px-8 sm:py-32">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div className="max-w-xl">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#CFFFDC]">Trust, but verify</p>
          <h2 className="text-[39px] font-semibold leading-[1.07] tracking-[-0.045em] sm:text-[54px]" style={{ fontFamily: "'Fraunces', 'Inter', serif" }}>
            Nothing hidden.
            <br /><span className="italic text-[#8FD5A0]">Nothing to sell.</span>
          </h2>
          <p className="mt-6 text-[16px] leading-[1.75] text-[#CFFFDC]/80">
            VeilChat is open source and built around a simple promise: your
            conversations are yours. Read the code, understand what we store,
            and decide for yourself.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/open-source" className="inline-flex items-center gap-2 rounded-full bg-[#CFFFDC] px-5 py-3 text-[14px] font-semibold text-[#253D2C] transition-colors hover:bg-white">Explore the source <ArrowIcon /></Link>
            <Link to="/what-we-store" className="inline-flex items-center gap-2 rounded-full border border-[#CFFFDC]/25 px-5 py-3 text-[14px] font-semibold text-[#FCF5EB] transition-colors hover:border-[#CFFFDC]/60">What we store <ArrowIcon /></Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-[#8FD5A0]/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#111B21] shadow-[0_30px_80px_-35px_rgba(0,0,0,0.75)]">
            <img src="/landing/veilchat-github-repo.png" alt="VeilChat open-source repository on GitHub" className="block w-full opacity-90" />
            <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#111B21] px-5 py-4 text-[12px] text-[#CFFFDC]/75">
              <span className="flex items-center gap-2"><CodeIcon /> AGPL-3.0 open source</span>
              <Link className="font-semibold text-[#CFFFDC] hover:text-white" to="/open-source">Audit every line →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const items = [
    ["Is VeilChat really free?", "Yes — and it always will be. There are no ads, premium tiers, or data sales. VeilChat is built as an independent privacy project."],
    ["Do I need to give my phone number?", "No. You can create a private ID and use a recovery phrase that exists only on your device. Phone and email signup are also available if you prefer them."],
    ["Can VeilChat read my messages?", "No. Messages are end-to-end encrypted before they leave your device. We store only what the app needs to deliver the service."],
    ["How is this different from WhatsApp?", "VeilChat is designed around privacy as the product, not as a setting. It is open source, does not rely on advertising, and gives you a private identity without requiring a phone number."],
  ];

  return (
    <section className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32" id="faq">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
        <div>
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2E6F40]">Questions, answered</p>
          <h2 className="text-[39px] font-semibold leading-[1.06] tracking-[-0.045em] text-[#253D2C] sm:text-[52px]" style={{ fontFamily: "'Fraunces', 'Inter', serif" }}>Good privacy should be easy to understand.</h2>
        </div>
        <div className="divide-y divide-[#253D2C]/10 border-y border-[#253D2C]/10">
          {items.map(([question, answer]) => (
            <details className="group py-5" key={question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-semibold text-[#253D2C] [&::-webkit-details-marker]:hidden">
                {question}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#253D2C]/15 text-[#2E6F40] transition-transform group-open:rotate-45"><PlusIcon /></span>
              </summary>
              <p className="max-w-2xl pr-10 pt-3 text-[14px] leading-[1.7] text-[#3C5A47]">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 pb-24 pt-4 sm:px-8 sm:pb-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#CFFFDC] px-6 py-16 text-center sm:px-12 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 h-[330px] w-[330px] rounded-full bg-white/45 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-28 h-[360px] w-[360px] rounded-full bg-[#68BA7F]/20 blur-2xl" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2E6F40]">A better place to talk</p>
          <h2 className="mt-5 text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] text-[#253D2C] sm:text-[58px]" style={{ fontFamily: "'Fraunces', 'Inter', serif" }}>Keep the conversation between you.</h2>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-[1.7] text-[#3C5A47]">Start privately. Stay close. No ads, no tracking, no noise.</p>
          <Link to="/welcome" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#2E6F40] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_30px_-14px_rgba(46,111,64,0.75)] transition-all hover:-translate-y-0.5 hover:bg-[#253D2C]">Start chatting <ArrowIcon /></Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#253D2C]/10 px-5 py-12 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-[1fr_auto_auto_auto]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="font-semibold text-[#253D2C]">VeilChat</span>
          </Link>
          <p className="mt-4 max-w-[220px] text-[13px] leading-[1.6] text-[#3C5A47]/75">Private messaging, simply. Free, open source, and visible to no one but you.</p>
        </div>
        <FooterColumn title="Product" links={[["How it works", "#how-it-works"], ["Download", "/download"], ["Promises", "/promises"], ["Status", "/raka98"]]} />
        <FooterColumn title="Privacy" links={[["Encryption", "/encryption"], ["What we store", "/what-we-store"], ["Privacy policy", "/privacy-policy"], ["WhatsApp privacy guide", "/blog/whatsapp-privacy-truth"]]} />
        <FooterColumn title="Project" links={[["About", "/about"], ["Our story", "/our-story"], ["Open source", "/open-source"], ["Terms", "/terms"]]} />
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-col gap-2 border-t border-[#253D2C]/10 pt-5 text-[11px] text-[#3C5A47]/60 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} VeilChat. Built for private conversations.</span>
        <span>End-to-end encrypted by default.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#253D2C]">{title}</h3>
      <nav className="flex flex-col items-start gap-2.5 text-[13px] text-[#3C5A47]/80">
        {links.map(([label, href]) =>
          href.startsWith("#") ? <a className="transition-colors hover:text-[#2E6F40]" href={href} key={label}>{label}</a> : <Link className="transition-colors hover:text-[#2E6F40]" to={href} key={label}>{label}</Link>,
        )}
      </nav>
    </div>
  );
}

function PrivacyGuidePill() {
  return (
    <Link
      to="/blog/whatsapp-privacy-truth"
      className="fixed bottom-4 right-4 z-30 hidden items-center gap-2 rounded-full border border-[#253D2C]/10 bg-white/90 px-4 py-2.5 text-[12px] font-semibold text-[#253D2C] shadow-[0_12px_30px_-15px_rgba(37,61,44,0.6)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#2E6F40]/30 hover:text-[#2E6F40] sm:flex"
      aria-label="Read the WhatsApp privacy guide"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#E8FAEE] text-[#2E6F40]"><LockIcon size={11} /></span>
      Coming from WhatsApp?
      <ArrowIcon />
    </Link>
  );
}

function SmallFeature({ title, body }: { title: string; body: string }) {
  return <div><h3 className="text-[14px] font-semibold text-[#253D2C]">{title}</h3><p className="mt-1 text-[13px] leading-[1.55] text-[#3C5A47]/80">{body}</p></div>;
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#CFFFDC] text-[#2E6F40]"><CheckIcon /></span>{children}</span>;
}

function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <span aria-hidden="true" className="relative grid place-items-center bg-[#2E6F40] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_-8px_rgba(46,111,64,0.55)]" style={{ width: size, height: size, borderRadius: Math.round(size * 0.22) }}>
      <svg viewBox="0 0 64 64" width={Math.round(size * 0.68)} height={Math.round(size * 0.68)} fill="none">
        <path d="M16 22 L32 44 L48 22" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="52" cy="13" r="4" fill="white" />
      </svg>
    </span>
  );
}

function LockIcon({ size = 14 }: { size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></svg>;
}

function DotsIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>;
}

function SendIcon() {
  return <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m2 21 21-9L2 3v7l15 2-15 2z" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>;
}

function PlusIcon() {
  return <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}

function PersonIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c.9-3.1 3.4-4.7 7.5-4.7s6.6 1.6 7.5 4.7" /></svg>;
}

function CodeIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m8 9-3 3 3 3" /><path d="m16 9 3 3-3 3" /><path d="m14 5-4 14" /></svg>;
}

function ShieldIcon() {
  return <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 20 6v5c0 5.1-3.4 8.1-8 10-4.6-1.9-8-4.9-8-10V6l8-3Z" /><path d="m8.7 12 2.1 2.1 4.5-4.5" /></svg>;
}

function FingerprintIcon() {
  return <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 11.5a2.5 2.5 0 0 1 2.5 2.5c0 3.5-1.1 5.7-2.3 7" /><path d="M8.5 21c1.4-2.2 2-4.4 2-7a1.5 1.5 0 0 1 3 0c0 2.8-.7 5.2-1.8 7" /><path d="M6 18.4c.7-1.6 1-3.2 1-5.4a5 5 0 0 1 10 0c0 3.9-.6 6.4-1.7 8" /><path d="M4.4 15.8c.4-1.1.6-2.2.6-3.8a7 7 0 0 1 14 0" /><path d="M12 6.5a5.5 5.5 0 0 1 5.5 5.5" /></svg>;
}

function QuietIcon() {
  return <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /><path d="m19 3 2 2M21 3l-2 2" /></svg>;
}