/**
 * WebAuthn / passkey client helpers.
 *
 * Thin wrapper around @simplewebauthn/browser for web/PWA, plus a
 * native Android Credential Manager bridge (WebAuthnPlugin.java) for
 * the Capacitor Android build — because window.PublicKeyCredential is
 * not exposed in the Capacitor WebView.
 *
 * Platform routing:
 *   • Android native (Capacitor)  → WebAuthnNative plugin (Credential Manager)
 *   • Browser / PWA               → @simplewebauthn/browser
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";
import { isAndroid, isNative } from "./capacitor";

/**
 * Module-level cache for Android native passkey support.
 * Populated by initAndroidPasskeySupport() at app startup.
 * Starts as `true` (optimistic) so UI shows the passkey option
 * immediately while the async check runs; corrected if the device
 * turns out to be too old (Android < 9).
 */
let _androidPasskeySupported: boolean = true;
let _androidPasskeyChecked: boolean = false;

/**
 * Asynchronously initialise passkey support detection for Android.
 * Called once from androidSetup.ts at app mount.
 * No-op on non-Android platforms.
 */
export async function initAndroidPasskeySupport(): Promise<void> {
  if (!isNative() || !isAndroid()) return;
  try {
    const { WebAuthnNative } = await import("./webauthnNative");
    const { supported } = await WebAuthnNative.isSupported();
    _androidPasskeySupported = supported;
  } catch {
    _androidPasskeySupported = false;
  }
  _androidPasskeyChecked = true;
}

/**
 * Returns true if passkeys can be created/used on this platform.
 *
 * On Android native: delegates to the Credential Manager plugin check.
 * Optimistically returns true before initAndroidPasskeySupport() has
 * resolved (corrected on next render cycle if false).
 *
 * On browser/PWA: uses @simplewebauthn/browser's detection.
 */
export function isPasskeySupported(): boolean {
  if (typeof window === "undefined") return false;

  if (isNative() && isAndroid()) {
    // If the init has already completed use the real value; otherwise
    // return true optimistically so the UI renders the passkey card.
    return _androidPasskeySupported;
  }

  try {
    return browserSupportsWebAuthn();
  } catch {
    return false;
  }
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isPasskeySupported()) return false;

  // On Android native we assume a platform authenticator is available
  // when the Credential Manager API is supported (Android 9+).
  if (isNative() && isAndroid()) {
    return _androidPasskeySupported;
  }

  try {
    return await platformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
}

/**
 * Best-effort guess at a friendly device name from the user-agent.
 */
export function suggestDeviceName(): string {
  if (typeof navigator === "undefined") return "This device";
  const ua = navigator.userAgent || "";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android phone";
  if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
  if (/Windows NT/i.test(ua)) return "Windows PC";
  if (/CrOS/i.test(ua)) return "Chromebook";
  if (/Linux/i.test(ua)) return "Linux PC";
  return "This device";
}

/**
 * Run the passkey registration ceremony.
 * On Android: uses the native Credential Manager plugin.
 * On browser: uses @simplewebauthn/browser.
 *
 * `options` is the JSON returned by the server-side
 * `passkey.getRegistrationOptions` mutation.
 */
export async function startPasskeyRegistration(options: unknown) {
  if (isNative() && isAndroid()) {
    if (!_androidPasskeySupported) {
      throw new Error("Passkeys require Android 9 or later on this device.");
    }
    try {
      const { WebAuthnNative } = await import("./webauthnNative");
      const requestJson = JSON.stringify(options);
      const { responseJson } = await WebAuthnNative.create({ requestJson });
      return JSON.parse(responseJson) as unknown;
    } catch (e) {
      throw friendlyError(e);
    }
  }

  if (!isPasskeySupported()) {
    throw new Error("Passkeys aren't supported on this device.");
  }
  try {
    return await startRegistration({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      optionsJSON: options as any,
    });
  } catch (e) {
    throw friendlyError(e);
  }
}

/**
 * Run the passkey authentication ceremony.
 * On Android: uses the native Credential Manager plugin.
 * On browser: uses @simplewebauthn/browser.
 */
export async function startPasskeyAuthentication(options: unknown) {
  if (isNative() && isAndroid()) {
    if (!_androidPasskeySupported) {
      throw new Error("Passkeys require Android 9 or later on this device.");
    }
    try {
      const { WebAuthnNative } = await import("./webauthnNative");
      const requestJson = JSON.stringify(options);
      const { responseJson } = await WebAuthnNative.get({ requestJson });
      return JSON.parse(responseJson) as unknown;
    } catch (e) {
      throw friendlyError(e);
    }
  }

  if (!isPasskeySupported()) {
    throw new Error("Passkeys aren't supported on this device.");
  }
  try {
    return await startAuthentication({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      optionsJSON: options as any,
    });
  } catch (e) {
    throw friendlyError(e);
  }
}

function friendlyError(e: unknown): Error {
  const msg = e instanceof Error ? e.message : String(e);
  const name = e instanceof Error ? e.name : "";

  if (
    name === "NotAllowedError" ||
    /not allowed|cancel|timed out/i.test(msg) ||
    /cancelled|canceled/i.test(msg)
  ) {
    return new Error("Passkey prompt was cancelled or timed out.");
  }
  if (name === "InvalidStateError") {
    return new Error("This device already has a passkey registered.");
  }
  if (/excludecredentials|already registered/i.test(msg)) {
    return new Error("This device already has a passkey registered.");
  }
  if (/secure context|https/i.test(msg)) {
    return new Error("Passkeys require a secure (HTTPS) connection.");
  }
  if (/no passkey found|nocredential/i.test(msg)) {
    return new Error("No passkey found for this account on this device.");
  }
  return new Error(msg || "Passkey could not be set up.");
}
