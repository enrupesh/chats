/**
 * Android-native initialisation for VeilChat.
 *
 * Called once on app mount when running inside the Capacitor shell.
 * Handles:
 *   - Hiding the splash screen after the React tree is ready.
 *   - Status bar colour matching the app's brand background.
 *   - Physical / gesture back-button behaviour (Android only).
 *   - App lifecycle events (foreground / background) for WebSocket
 *     reconnect hints and push-subscription refresh.
 *   - Passkey support detection via the native WebAuthn plugin.
 *
 * All imports are dynamic so the web bundle is never bloated with
 * native-only code — tree-shaking removes the entire module on web.
 */

import { isAndroid } from "./capacitor";

type CleanupFn = () => void;

export async function initAndroidNative(opts: {
  onBackButton?: () => boolean;
}): Promise<CleanupFn> {
  if (!isAndroid()) return () => undefined;

  const cleanups: Array<() => void> = [];

  // ── 1. Status bar ───────────────────────────────────────────────────────
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#FCF5EB" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    /* not critical — continue */
  }

  // ── 2. Splash screen ────────────────────────────────────────────────────
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    // Delay the hide so the AnimatedVectorDrawable in ic_splash_animated.xml
    // has time to complete its full animation sequence (600 ms chevron draw
    // + 300 ms dot fade = 900 ms total). We wait 950 ms before hiding so
    // the user sees the full animation, then the React NativeIntro overlay
    // (which has already mounted at this point) carries the visual continuity
    // while the native splash fades out behind it.
    setTimeout(() => {
      void SplashScreen.hide({ fadeOutDuration: 350 });
    }, 950);
  } catch {
    /* not critical — continue */
  }

  // ── 3. Back button ──────────────────────────────────────────────────────
  try {
    const { App } = await import("@capacitor/app");

    const backHandler = await App.addListener("backButton", ({ canGoBack }) => {
      // Let the consumer decide first (e.g. close modals / drawers).
      if (opts.onBackButton && opts.onBackButton()) return;

      if (canGoBack) {
        // History API back — mirrors the browser back button.
        window.history.back();
      } else {
        // We are at the root — pressing back a second time exits the app.
        void App.minimizeApp();
      }
    });

    cleanups.push(() => void backHandler.remove());
  } catch {
    /* not critical */
  }

  // ── 4. App lifecycle (foreground / background) ──────────────────────────
  try {
    const { App } = await import("@capacitor/app");

    const stateHandler = await App.addListener("appStateChange", ({ isActive }) => {
      // Dispatch a synthetic visibility-change event so the existing
      // SessionSync / wsClient logic (which listens to visibilitychange)
      // behaves correctly inside the native WebView.
      const event = new Event("visibilitychange");
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => (isActive ? "visible" : "hidden"),
      });
      document.dispatchEvent(event);
    });

    cleanups.push(() => void stateHandler.remove());
  } catch {
    /* not critical */
  }

  // ── 5. Passkey / WebAuthn support detection ─────────────────────────────
  // This must run early so that isPasskeySupported() returns the correct
  // value by the time the user reaches any page that shows passkey UI.
  try {
    const { initAndroidPasskeySupport } = await import("./passkey");
    await initAndroidPasskeySupport();
  } catch {
    /* not critical — passkey UI will hide itself if unsupported */
  }

  return () => cleanups.forEach((fn) => fn());
}
