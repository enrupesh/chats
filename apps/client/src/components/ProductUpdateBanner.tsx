import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UPDATE_BANNER_DISMISS_KEY = "veil:product_updates_banner_dismissed_v1";

const updates = [
  {
    title: "VeilChat Team section",
    body: "A dedicated team space is now available so you can stay connected with the VeilChat Team and see important product notes in one place.",
  },
  {
    title: "Recovery key upload",
    body: "You can now upload your recovery key file directly. PDF, TXT, and JSON files are supported, so typing all 12 words is no longer required.",
  },
  {
    title: "Daily verification is optional",
    body: "Daily verification now gives you more control. Turn it on when you want the extra check, or keep it off for a smoother sign-in experience.",
  },
  {
    title: "A stronger chat experience",
    body: "Chat flows are faster and more reliable, with smoother loading, clearer states, and a more comfortable experience across phones and desktop.",
  },
  {
    title: "Stronger security by default",
    body: "We tightened session protection, recovery-key handling, and privacy safeguards while keeping your conversations end-to-end encrypted.",
  },
  {
    title: "More control, less friction",
    body: "We also polished navigation, accessibility, and app responsiveness so private conversations feel simpler to manage every day.",
  },
];

type ProductUpdateBannerProps = {
  variant: "landing" | "app";
  className?: string;
};

export function ProductUpdateBanner({
  variant,
  className = "",
}: ProductUpdateBannerProps) {
  const [visible, setVisible] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(UPDATE_BANNER_DISMISS_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!detailsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [detailsOpen]);

  const dismiss = () => {
    try {
      localStorage.setItem(UPDATE_BANNER_DISMISS_KEY, "1");
    } catch {
      // The banner should still dismiss for this session if storage is unavailable.
    }
    setDetailsOpen(false);
    setVisible(false);
  };

  if (!visible) return null;

  const isLanding = variant === "landing";
  const surface = isLanding
    ? "bg-gradient-to-r from-[#E5F3E7] via-[#F1FAF2] to-white border-[#68BA7F]/35 text-[#253D2C] shadow-[0_18px_38px_-26px_rgba(46,111,64,0.55)]"
    : "bg-gradient-to-r from-wa-green/15 via-panel/95 to-panel/80 border-wa-green/30 text-text shadow-card";

  return (
    <>
      <div
        className={[
          "relative z-20 mx-auto flex w-full max-w-7xl items-center gap-3 border px-4 py-2.5 backdrop-blur-xl",
          isLanding ? "sm:mx-5 sm:w-auto sm:rounded-2xl lg:mx-auto lg:w-[calc(100%-4rem)]" : "rounded-xl",
          surface,
          className,
        ].join(" ")}
        role="status"
      >
        <span
          aria-hidden="true"
          className={[
            "grid size-8 shrink-0 place-items-center rounded-full text-sm",
            isLanding ? "bg-[#CFFFDC] text-[#2E6F40]" : "bg-wa-green/15 text-wa-green",
          ].join(" ")}
        >
          ✦
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-bold uppercase tracking-[0.08em]">
            Newly updated
          </p>
          <p
            className={
              isLanding
                ? "truncate text-[13px] text-[#3C5A47]"
                : "truncate text-[13px] text-text-muted"
            }
          >
            VeilChat is safer, smoother, and easier to recover
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className={[
            "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors",
            isLanding
              ? "bg-[#2E6F40] text-white hover:bg-[#253D2C]"
              : "bg-wa-green text-text-oncolor hover:bg-wa-green-dark",
          ].join(" ")}
        >
          Explore updates
        </button>
        <Link
          to="/donate"
          className={[
            "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all",
            "ring-1 ring-wa-green/30 hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(0,168,132,0.22)]",
            isLanding
              ? "bg-[#2E6F40] text-white hover:bg-[#253D2C]"
              : "bg-wa-green text-text-oncolor hover:bg-wa-green-dark",
          ].join(" ")}
        >
          Donate
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss updates announcement"
          className={[
            "grid size-7 shrink-0 place-items-center rounded-full text-lg leading-none transition-colors",
            isLanding
              ? "text-[#3C5A47]/60 hover:bg-[#253D2C]/10 hover:text-[#253D2C]"
              : "text-text-muted hover:bg-elevated hover:text-text",
          ].join(" ")}
        >
          ×
        </button>
      </div>

      {detailsOpen && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-updates-title"
            className="max-h-[min(720px,calc(100vh-2rem))] w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-panel text-text shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-line/70 px-5 py-5 sm:px-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-wa-green">
                  VeilChat updates
                </p>
                <h2 id="product-updates-title" className="mt-1 text-xl font-bold">
                  What’s new
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  The latest improvements across VeilChat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                aria-label="Close updates"
                className="grid size-9 shrink-0 place-items-center rounded-full text-xl text-text-muted transition-colors hover:bg-elevated hover:text-text"
              >
                ×
              </button>
            </header>

            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-5 py-4 sm:px-6">
              <ul className="space-y-1">
                {updates.map((update) => (
                  <li
                    key={update.title}
                    className="flex gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-elevated/60"
                  >
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-wa-green" />
                    <div>
                      <h3 className="text-sm font-semibold text-text">{update.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
                        {update.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-line/70 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={dismiss}
                className="h-11 w-full rounded-full bg-wa-green px-5 text-sm font-semibold text-text-oncolor transition-colors hover:bg-wa-green-dark"
              >
                Got it
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}