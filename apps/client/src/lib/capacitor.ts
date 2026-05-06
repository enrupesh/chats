/**
 * Capacitor platform utilities for VeilChat.
 *
 * All Capacitor plugin imports are guarded so the app continues to work
 * normally in the browser (PWA) without any modification. Every function
 * degrades gracefully to a no-op or sensible default when not running
 * inside a native Capacitor shell.
 */

import { Capacitor } from "@capacitor/core";

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === "android";
}

export function isIos(): boolean {
  return Capacitor.getPlatform() === "ios";
}

export function isWeb(): boolean {
  return Capacitor.getPlatform() === "web";
}

export function getPlatform(): "android" | "ios" | "web" {
  return Capacitor.getPlatform() as "android" | "ios" | "web";
}
