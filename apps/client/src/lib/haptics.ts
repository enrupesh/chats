/**
 * VeilChat haptics.
 *
 * On Android (Capacitor), uses the native Haptics plugin for precise,
 * high-quality tactile feedback — much better than navigator.vibrate.
 * On the web / iOS PWA, falls back to navigator.vibrate as before.
 * Every call is a silent no-op on platforms without vibration support.
 */

import { isAndroid } from "./capacitor";

let hapticsEnabled = true;

export function setHapticsEnabled(v: boolean): void {
  hapticsEnabled = v;
}

// ─── Native (Capacitor Android) path ────────────────────────────────────────

async function nativeImpact(style: "Heavy" | "Medium" | "Light"): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle[style] });
  } catch {
    /* native module not available — silently ignore */
  }
}

async function nativeNotification(type: "Success" | "Warning" | "Error"): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType[type] });
  } catch {
    /* native module not available — silently ignore */
  }
}

async function nativeVibrate(duration: number): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    const { Haptics } = await import("@capacitor/haptics");
    await Haptics.vibrate({ duration });
  } catch {
    /* native module not available — silently ignore */
  }
}

// ─── Web path ────────────────────────────────────────────────────────────────

function canVibrate(): boolean {
  if (!hapticsEnabled) return false;
  if (typeof navigator === "undefined") return false;
  return typeof navigator.vibrate === "function";
}

function buzz(pattern: number | number[]): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* some browsers throw on rapid repeat — safe to ignore */
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Softest "I felt the tap." */
export function hapticTap(): void {
  if (isAndroid()) {
    void nativeImpact("Light");
  } else {
    buzz(8);
  }
}

/** Slightly more present, for confirmations. */
export function hapticSoft(): void {
  if (isAndroid()) {
    void nativeImpact("Medium");
  } else {
    buzz(15);
  }
}

/** A short "ba-dum" for sends and successful actions. */
export function hapticSuccess(): void {
  if (isAndroid()) {
    void nativeNotification("Success");
  } else {
    buzz([10, 40, 12]);
  }
}

/** Two quick taps for incoming activity. */
export function hapticReceive(): void {
  if (isAndroid()) {
    void nativeImpact("Medium");
  } else {
    buzz([12, 60, 12]);
  }
}

/** A heavier triple for errors. */
export function hapticError(): void {
  if (isAndroid()) {
    void nativeNotification("Error");
  } else {
    buzz([40, 30, 40, 30, 40]);
  }
}

/** Cancel any in-flight vibration. */
export function hapticCancel(): void {
  if (isAndroid()) {
    void nativeVibrate(0).catch(() => undefined);
  } else if (canVibrate()) {
    try {
      navigator.vibrate(0);
    } catch {
      /* ignore */
    }
  }
}
