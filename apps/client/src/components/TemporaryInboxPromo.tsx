import { Link } from "react-router-dom";

type PromoVariant = "app" | "marketing" | "dark";

type TemporaryInboxPromoCardProps = {
  className?: string;
  variant?: PromoVariant;
  compact?: boolean;
  language?: "en" | "hi";
};

const copy = {
  en: {
    eyebrow: "Private verification inbox",
    title: "Need one email, not a permanent mailbox?",
    body: "Create a private, receive-only address for a verification code. The address and its latest message disappear automatically after 24 hours.",
    cta: "Try temporary inbox",
    article: "How it works",
  },
  hi: {
    eyebrow: "निजी verification inbox",
    title: "एक email चाहिए, permanent mailbox नहीं?",
    body: "Verification code के लिए private, receive-only address बनाएँ। Address और उसका latest message 24 घंटे बाद अपने-आप हट जाते हैं।",
    cta: "Temporary inbox आज़माएँ",
    article: "कैसे काम करता है",
  },
} as const;

/**
 * The shared, low-noise promotion for VeilChat's temporary inbox.
 * Keep this component link-only: the actual inbox still owns Google auth,
 * Turnstile, quotas, and all mailbox actions.
 */
export function TemporaryInboxPromoCard({
  className = "",
  variant = "app",
  compact = false,
  language = "en",
}: TemporaryInboxPromoCardProps) {
  const text = copy[language];
  const palette =
    variant === "dark"
      ? {
          shell: "border-[#68BA7F]/25 bg-[#68BA7F]/10 text-white",
          eyebrow: "text-[#9BD4A8]",
          title: "text-white",
          body: "text-white/70",
          button: "bg-[#68BA7F] text-[#111B21] hover:bg-[#83CB91]",
          article: "text-white/70 hover:text-white",
        }
      : variant === "marketing"
        ? {
            shell: "border-[#2E6F40]/15 bg-[#E8F3E5]/75 text-[#0F2A18]",
            eyebrow: "text-[#2E6F40]",
            title: "text-[#0F2A18]",
            body: "text-[#28332c]/75",
            button: "bg-[#2E6F40] text-white hover:bg-[#1F4F2D]",
            article: "text-[#2E6F40] hover:text-[#1F4F2D]",
          }
        : {
            shell: "border-wa-green/25 bg-wa-green/8 text-text",
            eyebrow: "text-wa-green-dark dark:text-wa-green",
            title: "text-text",
            body: "text-text-muted",
            button: "bg-wa-green text-text-oncolor hover:bg-wa-green-dark",
            article: "text-wa-green-dark dark:text-wa-green hover:underline",
          };

  return (
    <section
      aria-label="Temporary inbox promotion"
      className={`rounded-2xl border ${palette.shell} ${compact ? "px-4 py-3.5" : "p-5 sm:p-6"} ${className}`}
    >
      <div className={`flex ${compact ? "flex-col gap-3" : "flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}`}>
        <div className="min-w-0">
          <div className={`text-[10.5px] font-bold uppercase tracking-[0.15em] ${palette.eyebrow}`}>
            <span aria-hidden="true">＠</span> {text.eyebrow}
          </div>
          <h2 className={`mt-1.5 ${compact ? "text-[16px]" : "text-[20px]"} font-semibold tracking-tight ${palette.title}`}>
            {text.title}
          </h2>
          <p className={`mt-1.5 ${compact ? "text-[12.5px]" : "text-[14px]"} leading-relaxed ${palette.body}`}>
            {text.body}
          </p>
        </div>
        <div className={`flex ${compact ? "items-center" : "flex-wrap items-center"} gap-3 shrink-0`}>
          <Link
            to="/temporary-inbox"
            className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors wa-tap ${palette.button}`}
          >
            {text.cta} <span aria-hidden="true" className="ml-1">→</span>
          </Link>
          {!compact && (
            <Link
              to="/blog/temporary-inbox"
              className={`text-[12.5px] font-semibold underline-offset-4 hover:underline ${palette.article}`}
            >
              {text.article}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function TemporaryInboxMiniLink({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/temporary-inbox"
      className={
        "inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-wa-green " +
        "hover:text-wa-green-dark hover:underline underline-offset-4 transition-colors " +
        className
      }
      aria-label="Try VeilChat temporary inbox"
    >
      <span aria-hidden="true">＠</span>
      <span className="hidden sm:inline">Try temporary inbox</span>
      <span className="sm:hidden">Temp inbox</span>
    </Link>
  );
}