/**
 * Screen-security bridge for VeilChat.
 *
 * Wraps the native ScreenSecurityPlugin (Android only) that sets and clears
 * Android's FLAG_SECURE window flag.  While the flag is active, any OS
 * screenshot attempt — including the hardware Power + Volume-Down shortcut,
 * screen recording, and the Recents panel thumbnail — produces a blank black
 * frame instead of the actual screen content.
 *
 * Usage:
 *   await enableScreenSecurity();   // called when View-Once viewer opens
 *   await disableScreenSecurity();  // called when View-Once viewer closes
 *
 * Both functions are silent no-ops on web and iOS — no import guard needed
 * at the call site.
 */

import { registerPlugin } from "@capacitor/core";
import { isAndroid } from "./capacitor";

interface ScreenSecurityPlugin {
  enable(): Promise<void>;
  disable(): Promise<void>;
}

// registerPlugin() returns a proxy object that routes calls through the
// Capacitor bridge to the native ScreenSecurityPlugin on Android.
// On web/iOS the proxy simply throws, which we swallow in the helpers below.
const ScreenSecurity = registerPlugin<ScreenSecurityPlugin>("ScreenSecurity");

/**
 * Activate FLAG_SECURE on the Android activity window.
 *
 * After this resolves, any OS screenshot or screen-recording attempt will
 * capture a blank black frame instead of the screen content.  The Recents
 * panel overview thumbnail is also blanked.
 *
 * No-op on web and iOS.
 */
export async function enableScreenSecurity(): Promise<void> {
  if (!isAndroid()) return;
  try {
    await ScreenSecurity.enable();
  } catch (e) {
    // Non-fatal: if the plugin call fails (e.g. old APK without the plugin
    // registered) we log a warning and continue rather than crashing the viewer.
    console.warn("[ScreenSecurity] enable() failed:", e);
  }
}

/**
 * Clear FLAG_SECURE from the Android activity window.
 *
 * Always call this when the secure viewer is dismissed so normal screenshot
 * behaviour is restored for the rest of the app session.
 *
 * No-op on web and iOS.
 */
export async function disableScreenSecurity(): Promise<void> {
  if (!isAndroid()) return;
  try {
    await ScreenSecurity.disable();
  } catch (e) {
    console.warn("[ScreenSecurity] disable() failed:", e);
  }
}
