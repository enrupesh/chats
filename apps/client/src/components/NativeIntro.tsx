/**
 * NativeIntro — animated app-open intro for Android.
 *
 * Renders a full-screen branded overlay that plays a scale + fade entrance
 * animation (similar to Instagram's launch animation), holds briefly, then
 * fades out to reveal the app underneath.
 *
 * Lifecycle:
 *   "in"   (0–420 ms)   — logo scales in with spring + soft glow
 *   "hold" (420–1250 ms) — subtle breathing pulse for premium feel
 *   "out"  (1250–1650 ms) — overlay fades away
 *   "done" (1650 ms+)    — component unmounts, parent clears it
 *
 * The overlay is positioned fixed with z-index 9999 so it sits on top of
 * every route, including the RouteFallback spinner and any lazy-loaded chunk.
 * Background colour matches the app shell (#FCF5EB) so there is no jarring
 * colour flash between the native splash screen and the React layer.
 *
 * Only rendered inside the Capacitor Android shell — the parent (App.tsx)
 * checks isAndroid() before mounting this component.
 */

import { useEffect, useRef, useState } from "react";

type Phase = "in" | "hold" | "out" | "done";

export function NativeIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("in");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 420);
    const t2 = setTimeout(() => setPhase("out"), 1250);
    const t3 = setTimeout(() => {
      setPhase("done");
      onDoneRef.current();
    }, 1650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === "done") return null;

  const logoVisible = phase === "hold" || phase === "out";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#FCF5EB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 400ms ease-in-out",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Logo mark — V-chevron + dot */}
      <div
        style={{
          transform:
            phase === "hold"
              ? "scale(1.015)"
              : logoVisible
                ? "scale(1)"
                : "scale(0.74)",
          opacity: logoVisible ? 1 : 0,
          transition:
            "transform 520ms cubic-bezier(0.22, 0.9, 0.2, 1), opacity 300ms ease-out",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          filter:
            phase === "hold"
              ? "drop-shadow(0 8px 20px rgba(0,168,132,0.22))"
              : "none",
        }}
      >
        {/* SVG matches ic_launcher_foreground paths, scaled to 88px */}
        <svg
          width="88"
          height="88"
          viewBox="0 0 108 108"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            background: "#00A884",
            borderRadius: "50%",
            padding: "8px",
          }}
        >
          {/* V-chevron */}
          <path
            d="M27,44 L54,78 L81,44"
            stroke="#FFFFFF"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Notification dot */}
          <circle cx="86" cy="24" r="7" fill="#FFFFFF" />
        </svg>

        {/* App name */}
        <div
          style={{
            marginTop: 18,
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "#2E6F40",
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? "translateY(0)" : "translateY(10px)",
            transition:
              "opacity 320ms ease-out 80ms, transform 320ms ease-out 80ms",
          }}
        >
          VeilChat
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 6,
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, sans-serif",
            fontSize: 13,
            color: "#2E6F40",
            opacity: logoVisible ? 0.55 : 0,
            transform: logoVisible ? "translateY(0)" : "translateY(6px)",
            transition:
              "opacity 320ms ease-out 160ms, transform 320ms ease-out 160ms",
            letterSpacing: "0.3px",
          }}
        >
          Private by design
        </div>
      </div>
    </div>
  );
}
