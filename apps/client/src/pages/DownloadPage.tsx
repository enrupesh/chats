import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { toPublicAbsoluteUrl } from "../lib/publicAppUrl";

/**
 * /download — Android APK download page.
 *
 * Matches the cream / forest-green design language of the rest of the
 * marketing site. Includes a step-by-step install guide because users
 * installing outside the Play Store need to know about "unknown sources".
 */

// ─── APK URL ─────────────────────────────────────────────────────────────────
// Update this constant whenever you release a new version.
// Host the APK file on GitHub Releases (free) or any file host, then
// paste the direct download URL here.
const ANDROID_APK_URL: string =
  (import.meta.env.VITE_ANDROID_APK_URL as string | undefined) ?? "";

const APK_VERSION = (import.meta.env.VITE_ANDROID_APK_VERSION as string | undefined) ?? "1.0";
const APK_SIZE = (import.meta.env.VITE_ANDROID_APK_SIZE as string | undefined) ?? "";
// ─────────────────────────────────────────────────────────────────────────────

export function DownloadPage() {
  useDocumentMeta({
    title: "Download VeilChat for Android — Free APK",
    description:
      "Download the VeilChat Android app directly. End-to-end encrypted, no ads, no tracking. Works without the Play Store.",
    canonical: "/download",
    ogType: "website",
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
      <DownloadNav />
      <main>
        <DownloadHero />
        <InstallGuide />
        <OtherPlatforms />
      </main>
      <DownloadFooter />
    </div>
  );
}

/* ─────────────────────────── Nav ─────────────────────────── */

function DownloadNav() {
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
        "fixed top-0 inset-x-0 z-40 transition-colors duration-200",
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
          <Link to="/" className="hover:text-[#2E6F40] transition-colors">
            Home
          </Link>
          <Link
            to="/welcome"
            className="hidden sm:inline-flex text-[14px] font-semibold text-white bg-[#2E6F40] hover:bg-[#253D2C] px-4 py-2 rounded-full transition-colors"
          >
            Sign up free
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */

function DownloadHero() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const downloadUrl = toPublicAbsoluteUrl("/download");

  useEffect(() => {
    QRCode.toDataURL(downloadUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 260,
      color: { dark: "#253D2C", light: "#FCF5EB" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [downloadUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const apkAvailable = Boolean(ANDROID_APK_URL);

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(207,255,220,0.7), rgba(207,255,220,0) 65%)",
          }}
        />
        <div
          className="absolute top-[40%] -left-32 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(104,186,127,0.15), rgba(104,186,127,0) 65%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: text + download button */}
          <div>
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase text-[#2E6F40] bg-[#CFFFDC] border border-[#68BA7F]/40 rounded-full px-3 py-1.5 mb-6">
              <AndroidIcon size={14} />
              Android App
            </div>

            <h1
              className="text-[40px] sm:text-[52px] font-semibold tracking-[-0.025em] leading-[1.05] text-[#253D2C]"
              style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
            >
              VeilChat{" "}
              <span className="italic" style={{ color: "#2E6F40" }}>
                for Android.
              </span>
            </h1>

            <p className="mt-5 text-[17px] sm:text-[19px] text-[#3C5A47] leading-[1.6] max-w-lg">
              The full VeilChat experience as a real Android app — no Play Store needed. Install directly in seconds.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {(["End-to-end encrypted", "No ads", "Free forever"] as const).map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 text-[13px] text-[#2E6F40] font-medium"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="7.5" stroke="#2E6F40" strokeWidth="1" />
                    <path d="M4.5 8 L7 10.5 L11.5 5.5" stroke="#2E6F40" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </span>
              ))}
            </div>

            {/* Download button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {apkAvailable ? (
                <a
                  href={ANDROID_APK_URL}
                  download
                  className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl text-[16px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(46,111,64,0.55)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(46,111,64,0.65)] hover:-translate-y-0.5 active:translate-y-0"
                  style={{ backgroundColor: "#2E6F40" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>
                    Download APK
                    {APK_VERSION && (
                      <span className="ml-2 text-[13px] font-normal opacity-80">
                        v{APK_VERSION}{APK_SIZE ? ` · ${APK_SIZE}` : ""}
                      </span>
                    )}
                  </span>
                </a>
              ) : (
                <div
                  className="inline-flex flex-col items-start gap-1.5 px-6 py-4 rounded-2xl border-2 border-dashed border-[#2E6F40]/30 bg-[#CFFFDC]/40"
                >
                  <span className="text-[14px] font-semibold text-[#2E6F40]">APK coming soon</span>
                  <span className="text-[13px] text-[#3C5A47]">The download link will appear here once live.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-[15px] font-semibold text-[#253D2C] bg-white border border-[#253D2C]/12 shadow-sm hover:bg-[#F0FAF3] transition-all"
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E6F40" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    Link copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Copy link
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-[13px] text-[#3C5A47]/70">
              Android 7.0 or newer · No Google account required
            </p>
          </div>

          {/* Right: QR + phone mockup card */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-[320px] rounded-[2rem] bg-white border border-[#253D2C]/10 shadow-[0_24px_64px_-24px_rgba(17,27,33,0.2)] overflow-hidden">
              {/* Card header */}
              <div className="px-6 pt-6 pb-4 text-center" style={{ backgroundColor: "#E6FFDA" }}>
                <p className="text-[12px] font-bold tracking-[0.18em] uppercase text-[#2E6F40]">
                  Scan on your phone
                </p>
                <p className="mt-1 text-[13px] text-[#3C5A47]">
                  Open the camera and point it here
                </p>
              </div>
              <div className="p-6 flex justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scan to open the VeilChat download page on your phone"
                    width={180}
                    height={180}
                    className="block rounded-xl"
                  />
                ) : (
                  <div className="w-[180px] h-[180px] rounded-xl bg-[#FCF5EB] animate-pulse" />
                )}
              </div>
              <div className="px-6 pb-6 text-center">
                <p className="text-[12.5px] text-[#3C5A47]">
                  Or visit{" "}
                  <span className="font-semibold text-[#2E6F40]">veilchat.me/download</span>
                  {" "}on your phone
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Install Guide ───────────────────── */

const STEPS = [
  {
    number: "1",
    title: "Tap the Download button",
    body: "Tap the green \"Download APK\" button above. Your phone will download the file — it usually takes just a few seconds.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Open the downloaded file",
    body: "Pull down your notification bar and tap the downloaded file, or open your Downloads folder and tap \"VeilChat.apk\".",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    number: "3",
    title: 'Allow "Install unknown apps"',
    body: 'Android will ask for permission to install apps from outside the Play Store. Tap "Settings", enable the toggle, then press the back button and tap "Install".',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    note: "This permission is normal for apps not on the Play Store — just like installing software on a computer.",
  },
  {
    number: "4",
    title: "Tap Install and open",
    body: 'Tap "Install" to confirm. In a few seconds, VeilChat will appear in your app drawer — just like any other app.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

function InstallGuide() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase text-[#2E6F40] bg-[#CFFFDC] border border-[#68BA7F]/40 rounded-full px-3 py-1.5 mb-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            How to install
          </div>
          <h2
            className="text-[32px] sm:text-[40px] font-semibold tracking-tight text-[#253D2C]"
            style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
          >
            4 simple steps.{" "}
            <span className="italic" style={{ color: "#2E6F40" }}>Takes 1 minute.</span>
          </h2>
          <p className="mt-4 text-[16px] text-[#3C5A47] max-w-xl mx-auto leading-relaxed">
            Installing an APK is just like installing any other app — Android just asks for permission once.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative bg-white rounded-[1.75rem] border border-[#253D2C]/10 p-7 shadow-[0_4px_24px_-8px_rgba(17,27,33,0.1)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-[0_6px_16px_-6px_rgba(46,111,64,0.5)]"
                  style={{ backgroundColor: "#2E6F40" }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-[#2E6F40]">
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#253D2C] leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] text-[#3C5A47] leading-relaxed">
                    {step.body}
                  </p>
                  {step.note && (
                    <p className="mt-3 text-[13px] text-[#3C5A47]/70 italic bg-[#FCF5EB] rounded-xl px-3 py-2">
                      💡 {step.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety reassurance card */}
        <div
          className="mt-8 rounded-[1.75rem] p-6 sm:p-8 flex gap-5 items-start"
          style={{ backgroundColor: "#E6FFDA", border: "1px solid rgba(46,111,64,0.2)" }}
        >
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#2E6F40" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#253D2C]">
              100% safe — open source and independently verifiable
            </h3>
            <p className="mt-1.5 text-[14px] text-[#3C5A47] leading-relaxed">
              VeilChat is fully open source. You can inspect every line of code at{" "}
              <a
                href="https://github.com/rupeshsahu408"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2E6F40] underline underline-offset-2"
              >
                github.com/rupeshsahu408
              </a>
              . The APK you download is built directly from that code — no hidden extras, no tracking, no ads.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Other Platforms ─────────────────── */

function OtherPlatforms() {
  return (
    <section className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="rounded-[2rem] border border-[#253D2C]/10 overflow-hidden bg-white shadow-[0_8px_32px_-16px_rgba(17,27,33,0.12)]">
          <div className="px-7 py-6 border-b border-[#253D2C]/8">
            <h2 className="text-[18px] font-semibold text-[#253D2C]">
              Also available on every platform
            </h2>
            <p className="mt-1 text-[14px] text-[#3C5A47]">
              No app needed — VeilChat works right in your browser too.
            </p>
          </div>
          <div className="divide-y divide-[#253D2C]/8">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                ),
                label: "iPhone & iPad",
                description: "Open veilchat.me in Safari → tap Share → Add to Home Screen",
                action: "Instant, no download",
                color: "#111B21",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                ),
                label: "Mac, Windows & Linux",
                description: "Open veilchat.me in Chrome or Edge → click the install icon in the address bar",
                action: "Works offline too",
                color: "#111B21",
              },
            ].map((p) => (
              <div key={p.label} className="px-7 py-5 flex items-center gap-5">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-[#253D2C]">{p.label}</div>
                  <div className="text-[13.5px] text-[#3C5A47] mt-0.5">{p.description}</div>
                </div>
                <div className="hidden sm:block flex-shrink-0 text-[12.5px] font-medium text-[#2E6F40] bg-[#CFFFDC] px-3 py-1.5 rounded-full">
                  {p.action}
                </div>
              </div>
            ))}
          </div>
          <div className="px-7 py-5 bg-[#FCF5EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[13.5px] text-[#3C5A47]">
              Ready to start chatting privately?
            </p>
            <Link
              to="/welcome"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold text-white transition-colors"
              style={{ backgroundColor: "#2E6F40" }}
            >
              Create your free account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Footer ──────────────────────── */

function DownloadFooter() {
  return (
    <footer style={{ backgroundColor: "#111B21", color: "#FCF5EB" }}>
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="text-[16px] font-bold tracking-tight text-white">
            VeilChat
          </span>
        </Link>
        <div className="text-[12.5px] text-[#FCF5EB]/60 text-center sm:text-right">
          © {new Date().getFullYear()} VeilChat ·{" "}
          <Link to="/about" className="hover:text-white transition-colors">About</Link>{" "}·{" "}
          <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>{" "}·{" "}
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── Shared ──────────────────────── */

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
      }}
      className="relative bg-[#2E6F40] grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_-8px_rgba(46,111,64,0.55)]"
    >
      <svg
        viewBox="0 0 64 64"
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        aria-hidden="true"
      >
        <path
          d="M16 22 L32 44 L48 22"
          fill="none"
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

function AndroidIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.523 15.341a.854.854 0 0 1-.857.857.854.854 0 0 1-.857-.857.854.854 0 0 1 .857-.857.854.854 0 0 1 .857.857M7.19 15.341a.854.854 0 0 1-.857.857.854.854 0 0 1-.857-.857.854.854 0 0 1 .857-.857.854.854 0 0 1 .857.857M17.79 10l1.5-2.598a.313.313 0 0 0-.114-.427.313.313 0 0 0-.427.114L17.23 9.56A8.99 8.99 0 0 0 12 8.25a8.99 8.99 0 0 0-5.23 1.31L5.25 7.089a.313.313 0 0 0-.427-.114.313.313 0 0 0-.114.427L6.21 10C4.246 11.221 3 13.232 3 15.5h18c0-2.268-1.246-4.279-3.21-5.5" />
    </svg>
  );
}
