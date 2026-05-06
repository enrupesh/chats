/**
 * TypeScript bridge to the native Android WebAuthn (Credential Manager) plugin.
 *
 * This plugin is registered in MainActivity.java as "WebAuthn". It wraps
 * the Android Credential Manager API so Capacitor apps can create and use
 * passkeys on Android without relying on window.PublicKeyCredential (which
 * is not available in the Capacitor WebView).
 *
 * On non-Android platforms this module is imported but the functions are
 * never called — the passkey.ts layer gates all calls on isAndroid().
 */

import { registerPlugin } from "@capacitor/core";

export interface WebAuthnNativePlugin {
  /** Returns whether this device supports passkeys (Android 9+ / API 28+). */
  isSupported(): Promise<{ supported: boolean }>;

  /**
   * Create a new passkey.
   * @param options.requestJson  JSON string of WebAuthn PublicKeyCredentialCreationOptions
   * @returns responseJson       JSON string of WebAuthn registration response
   */
  create(options: { requestJson: string }): Promise<{ responseJson: string }>;

  /**
   * Retrieve an existing passkey for sign-in.
   * @param options.requestJson  JSON string of WebAuthn PublicKeyCredentialRequestOptions
   * @returns responseJson       JSON string of WebAuthn authentication response
   */
  get(options: { requestJson: string }): Promise<{ responseJson: string }>;
}

export const WebAuthnNative = registerPlugin<WebAuthnNativePlugin>("WebAuthn");
