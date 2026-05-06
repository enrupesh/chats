import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./store";
import { isNative } from "./capacitor";

const ACTIVE_REFETCH_INTERVAL_MS = 45_000;

/**
 * Keeps the app feeling "live" without visual redesign:
 * - periodic refetch of active queries while the app is visible
 * - immediate refetch when app/tab returns to foreground
 *
 * This refreshes chat lists, settings state, connection badges, etc.,
 * and avoids stale screens after backgrounding the app.
 */
export function useAppRefreshLoop(queryClient: QueryClient): void {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    let stopped = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let appListenerCleanup: (() => void) | null = null;

    async function refreshActive(reason: "interval" | "resume" | "focus") {
      if (stopped) return;
      try {
        await queryClient.refetchQueries({
          type: "active",
          stale: false,
        });
      } catch {
        // Best-effort refresh loop; never surface noise to users.
      }
      void reason;
    }

    // Periodic refresh only while visible (browser) to avoid waste.
    timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      void refreshActive("interval");
    }, ACTIVE_REFETCH_INTERVAL_MS);

    // Browser tab focus / visibility restore.
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void refreshActive("focus");
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("focus", onVisible);
      document.addEventListener("visibilitychange", onVisible);
    }

    // Native app foreground restore (Capacitor).
    if (isNative()) {
      void import("@capacitor/app")
        .then(async ({ App }) => {
          const handler = await App.addListener("appStateChange", ({ isActive }) => {
            if (isActive) void refreshActive("resume");
          });
          appListenerCleanup = () => void handler.remove();
        })
        .catch(() => undefined);
    }

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onVisible);
        document.removeEventListener("visibilitychange", onVisible);
      }
      appListenerCleanup?.();
    };
  }, [accessToken, queryClient]);
}

