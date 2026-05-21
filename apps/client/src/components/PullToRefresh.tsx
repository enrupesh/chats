/**
 * PullToRefresh — mobile swipe-down gesture refresh wrapper.
 *
 * Wraps any scrollable content and detects a downward pull from the top
 * of the scroll position.  When the user pulls more than THRESHOLD pixels
 * and releases, `onRefresh` is called.  A circular animated indicator
 * appears above the content during the pull and during the async refresh.
 *
 * Design:
 *   - Brand green (#2E6F40 / #00A884) spinner ring matching app theme.
 *   - Indicator translates down with the finger (capped at MAX_PULL) and
 *     bounces back when released.
 *   - During the refresh the indicator spins until `onRefresh` resolves.
 *   - Only active on touch devices (isCoarsePointer / mobile).
 *   - Completely passive on desktop (mouse users scroll normally).
 *
 * Usage:
 *   <PullToRefresh onRefresh={async () => { await refetchEverything(); }}>
 *     <YourScrollableContent />
 *   </PullToRefresh>
 */

import {
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

const THRESHOLD = 64;   // px — minimum pull to trigger a refresh
const MAX_PULL = 80;    // px — cap on how far the indicator travels

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

type RefreshState = "idle" | "pulling" | "releasing" | "refreshing";

export function PullToRefresh({
  onRefresh,
  children,
  className,
}: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [state, setState] = useState<RefreshState>("idle");

  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<RefreshState>("idle");

  // Keep stateRef in sync so touch handlers (which close over stale state)
  // can safely read the current phase without triggering re-renders.
  stateRef.current = state;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (stateRef.current !== "idle") return;
    const el = containerRef.current;
    if (!el) return;
    // Only begin tracking if the scroll container is at its very top.
    if (el.scrollTop > 0) return;
    startYRef.current = e.touches[0]?.clientY ?? 0;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (stateRef.current === "refreshing") return;
      const el = containerRef.current;
      if (!el) return;
      if (el.scrollTop > 0) {
        startYRef.current = 0;
        return;
      }
      if (!startYRef.current) return;

      const dy = (e.touches[0]?.clientY ?? startYRef.current) - startYRef.current;
      if (dy <= 0) {
        setPullY(0);
        setState("idle");
        return;
      }

      // Apply resistance so the pull feels elastic.
      const clamped = Math.min(MAX_PULL, dy * 0.5);
      setPullY(clamped);
      setState("pulling");
    },
    [],
  );

  const handleTouchEnd = useCallback(async () => {
    if (stateRef.current !== "pulling") {
      setPullY(0);
      setState("idle");
      return;
    }
    const current = pullY;
    if (current < THRESHOLD) {
      // Not pulled far enough — snap back.
      setState("releasing");
      setPullY(0);
      setTimeout(() => setState("idle"), 300);
      return;
    }

    // Pulled past threshold — trigger refresh.
    setState("refreshing");
    setPullY(MAX_PULL);
    try {
      await onRefresh();
    } catch {
      /* swallow — callers should handle their own errors */
    }
    setState("releasing");
    setPullY(0);
    setTimeout(() => setState("idle"), 350);
  }, [pullY, onRefresh]);

  const isRefreshing = state === "refreshing";
  const indicatorProgress = Math.min(1, pullY / THRESHOLD);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* ── Pull indicator — only rendered when actively pulling or refreshing ── */}
      {state !== "idle" && (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          // Translate the indicator down with the pull, capped at MAX_PULL.
          transform: `translateY(${isRefreshing ? MAX_PULL - 28 : pullY - 28}px)`,
          transition:
            state === "pulling"
              ? "none"
              : "transform 300ms cubic-bezier(0.34, 1.2, 0.64, 1)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#FCF5EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isRefreshing ? (
            /* Spinning ring while async refresh runs */
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              style={{ animation: "ptr-spin 0.7s linear infinite" }}
            >
              <circle
                cx="10"
                cy="10"
                r="7"
                fill="none"
                stroke="#00A884"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="10"
              />
            </svg>
          ) : (
            /* Arc that fills as the user pulls */
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              style={{
                transform: `rotate(${indicatorProgress * 360}deg)`,
                transition: state === "pulling" ? "none" : "transform 300ms",
                opacity: indicatorProgress > 0 ? 1 : 0,
              }}
            >
              <circle
                cx="10"
                cy="10"
                r="7"
                fill="none"
                stroke="#2E6F40"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${indicatorProgress * 32} 32`}
              />
              {indicatorProgress >= 0.95 && (
                /* Arrow head at end of arc when threshold reached */
                <path
                  d="M10 4 L7.5 7 L10 5.5 L12.5 7 Z"
                  fill="#2E6F40"
                />
              )}
            </svg>
          )}
        </div>
      </div>
      )}

      {/* ── Scrollable content — shifts down with the pull ── */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => void handleTouchEnd()}
        style={{
          transform: `translateY(${isRefreshing ? MAX_PULL - 24 : pullY}px)`,
          transition:
            state === "pulling"
              ? "none"
              : "transform 300ms cubic-bezier(0.34, 1.2, 0.64, 1)",
          overflowY: "auto",
          height: "100%",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>

      {/* Keyframe for the spinning ring — injected once */}
      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
