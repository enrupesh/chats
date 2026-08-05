import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useDocumentMeta } from "../lib/useDocumentMeta";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Public Careers page.
 *
 * The content is intentionally a calm placeholder until the team is ready
 * to publish roles. Keeping the page live now gives future listings a home
 * without inventing hiring information.
 */
export function CareersPage() {
  useDocumentMeta({
    title: "Careers at VeilChat",
    description:
      "Help build a more private internet with VeilChat. Our careers page is coming soon.",
    canonical: "/careers",
    ogType: "website",
  });

  const reduceMotion = useReducedMotion();

  return (
    <div
      className="min-h-screen overflow-hidden antialiased"
      style={{
        backgroundColor: "#FCF5EB",
        color: "#111B21",
        fontFamily:
          "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <CareersNav />

      <main>
        <section className="relative px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-40">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <motion.div
              className="absolute -right-40 -top-48 h-[620px] w-[620px] rounded-full"
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, 18, 0], y: [0, 14, 0], scale: [1, 1.04, 1] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 14, ease: "easeInOut", repeat: Infinity }
              }
              style={{
                background:
                  "radial-gradient(circle, rgba(207,255,220,0.88), rgba(207,255,220,0) 68%)",
              }}
            />
            <motion.div
              className="absolute -bottom-56 -left-48 h-[580px] w-[580px] rounded-full"
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, -16, 0], y: [0, -12, 0] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 17, ease: "easeInOut", repeat: Infinity }
              }
              style={{
                background:
                  "radial-gradient(circle, rgba(104,186,127,0.2), rgba(104,186,127,0) 68%)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_OUT }}
              className="inline-flex items-center gap-2 rounded-full border border-[#68BA7F]/40 bg-[#CFFFDC] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2E6F40]"
            >
              <SparkIcon />
              Come build with us
            </motion.div>

            <motion.h1
              initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: EASE_OUT }}
              className="mt-7 text-[46px] font-semibold leading-[1.04] tracking-[-0.03em] text-[#253D2C] sm:text-[64px] md:text-[78px]"
              style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
            >
              Build something
              <br />
              <span className="italic text-[#2E6F40]">worth protecting.</span>
            </motion.h1>

            <motion.p
              initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: EASE_OUT }}
              className="mx-auto mt-6 max-w-2xl text-[17px] leading-[1.7] text-[#3C5A47] sm:text-[19px]"
            >
              VeilChat is building a quieter, more human internet — one where
              privacy is the starting point, not a premium feature. We&apos;re
              preparing the next chapter of the team.
            </motion.p>
          </div>
        </section>

        <section className="relative px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="rounded-[28px] border border-[#253D2C]/10 bg-white/75 p-7 shadow-[0_24px_60px_-40px_rgba(37,61,44,0.45)] backdrop-blur-sm sm:p-10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CFFFDC] text-[#2E6F40]">
                <CompassIcon />
              </div>
              <h2
                className="mt-6 text-[29px] font-semibold leading-tight tracking-tight text-[#253D2C] sm:text-[34px]"
                style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
              >
                A small team with a large point of view.
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.75] text-[#3C5A47]">
                We care about thoughtful software, strong ownership, and
                products that respect people when nobody is watching. When
                roles open, this is where we&apos;ll share them.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Privacy first", "Remote friendly", "Open source"].map(
                  (value, index) => (
                    <motion.span
                      key={value}
                      initial={
                        reduceMotion
                          ? undefined
                          : { opacity: 0, scale: 0.9, y: 5 }
                      }
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.35,
                        delay: 0.18 + index * 0.07,
                        ease: EASE_OUT,
                      }}
                      className="rounded-full border border-[#68BA7F]/35 bg-[#F0F9F2] px-3 py-1.5 text-[12px] font-semibold text-[#2E6F40]"
                    >
                      {value}
                    </motion.span>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
              className="relative overflow-hidden rounded-[28px] bg-[#111B21] p-7 text-[#FCF5EB] shadow-[0_24px_60px_-32px_rgba(17,27,33,0.55)] sm:p-10"
            >
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, rgba(104,186,127,0.42), rgba(104,186,127,0) 68%)",
                }}
              />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#68BA7F]/15 text-[#9BE5AD]">
                  <BriefcaseIcon />
                </div>
                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9BE5AD]">
                  Open roles
                </p>
                <h2
                  className="mt-3 text-[29px] font-semibold leading-tight tracking-tight text-white sm:text-[34px]"
                  style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
                >
                  Something good is on the way.
                </h2>
                <p className="mt-4 text-[15px] leading-[1.75] text-[#FCF5EB]/70">
                  We&apos;re getting the details ready. Check back soon for
                  opportunities to help make private communication the norm.
                </p>
                <div className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#CFFFDC]/80">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#68BA7F]" />
                  Roles will be posted here
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-t border-[#253D2C]/10 bg-[#F0F9F2] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2E6F40]">
                Stay close
              </p>
              <h2
                className="mt-2 text-[27px] font-semibold tracking-tight text-[#253D2C] sm:text-[32px]"
                style={{ fontFamily: "'Fraunces', 'Inter', serif" }}
              >
                Until then, explore VeilChat.
              </h2>
            </div>
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-full bg-[#2E6F40] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_12px_28px_-14px_rgba(46,111,64,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#253D2C] hover:shadow-[0_16px_32px_-14px_rgba(46,111,64,0.8)] focus-visible:ring-2 focus-visible:ring-[#2E6F40] focus-visible:ring-offset-2"
            >
              Back to home
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <CareersFooter />
    </div>
  );
}

function CareersNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#253D2C]/10 bg-[#FCF5EB]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[18px] font-bold tracking-tight text-[#253D2C]">
            VeilChat
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-[14px] text-[#3C5A47] sm:gap-6">
          <Link
            to="/about"
            className="transition-colors hover:text-[#2E6F40] focus-visible:text-[#2E6F40]"
          >
            About
          </Link>
          <Link
            to="/welcome"
            className="rounded-full bg-[#2E6F40] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#253D2C] focus-visible:ring-2 focus-visible:ring-[#2E6F40] focus-visible:ring-offset-2"
          >
            Get VeilChat
          </Link>
        </nav>
      </div>
    </header>
  );
}

function CareersFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#111B21] text-[#FCF5EB]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-9 text-center sm:flex-row sm:px-8 sm:text-left">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="text-[16px] font-bold tracking-tight text-white">
            VeilChat
          </span>
        </Link>
        <div className="text-[12.5px] text-[#FCF5EB]/60">
          © {new Date().getFullYear()} VeilChat ·{" "}
          <Link to="/privacy-policy" className="transition-colors hover:text-white">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link to="/terms" className="transition-colors hover:text-white">
            Terms
          </Link>{" "}
          ·{" "}
          <Link to="/" className="transition-colors hover:text-white">
            Home
          </Link>
        </div>
      </div>
    </footer>
  );
}

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
      }}
      className="relative grid place-items-center bg-[#2E6F40] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_-8px_rgba(46,111,64,0.55)]"
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

function SparkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="m15.5 8.5-2.3 4.7-4.7 2.3 2.3-4.7 4.7-2.3Z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2" />
    </svg>
  );
}