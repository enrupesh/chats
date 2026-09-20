import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../lib/store";
import {
  isDailyVerificationDue,
  markDailyVerified,
} from "../lib/dailyVerification";
import { loadIdentity } from "../lib/db";
import {
  encryptRecoveryPhraseForServer,
} from "../lib/unlock";
import {
  bytesToBase64,
  deriveIdentityFromPhrase,
  isValidRecoveryPhrase,
  signMessage,
} from "../lib/crypto";
import {
  Logo,
  PrimaryButton,
  FieldLabel,
  TextInput,
  ErrorMessage,
} from "./Layout";

/**
 * Routes the gate should NOT cover. Anything not in this list is
 * considered "main app surface" and requires a fresh daily check.
 */
const PUBLIC_PREFIXES = [
  "/",
  "/welcome",
  "/login",
  "/signup",
  "/i/",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/welcome") return true;
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/i/")
  );
}

export function DailyVerificationGate() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const verify = trpc.auth.verifyDailyPassword.useMutation();
  const dailyStatus = trpc.me.dailyVerificationStatus.useQuery(undefined, {
    enabled: Boolean(user),
    staleTime: 60_000,
    retry: false,
  });
  const beginReset = trpc.auth.beginVerificationPasswordReset.useMutation();
  const completeReset =
    trpc.auth.completeVerificationPasswordReset.useMutation();

  const [password, setPassword] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [challengeNonce, setChallengeNonce] = useState("");

  // Re-evaluate whether the gate should appear whenever the user,
  // route, or focus changes. Reopening the tab after sleep should
  // immediately re-prompt if the 24h window has elapsed.
  useEffect(() => {
    function evaluate() {
      if (!user) {
        setOpen(false);
        return;
      }
      if (isPublicPath(location.pathname)) {
        setOpen(false);
        return;
      }
      setOpen(
        dailyStatus.data?.enabled === true && isDailyVerificationDue(user.id),
      );
    }
    evaluate();
    window.addEventListener("focus", evaluate);
    document.addEventListener("visibilitychange", evaluate);
    return () => {
      window.removeEventListener("focus", evaluate);
      document.removeEventListener("visibilitychange", evaluate);
    };
  }, [user, location.pathname, dailyStatus.data?.enabled]);

  if (!open || !user) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8 || !user) return;
    setError(null);
    try {
      // Opportunistically back-fill the server-side encrypted recovery
      // phrase blob for legacy accounts that signed up before this
      // feature existed. The server only stores it when the column is
      // currently null, so this is a one-time upgrade.
      let encryptedRecoveryPhrase: Awaited<
        ReturnType<typeof encryptRecoveryPhraseForServer>
      > | undefined;
      try {
        const rec = await loadIdentity();
        if (rec?.recoveryPhrase) {
          encryptedRecoveryPhrase = await encryptRecoveryPhraseForServer(
            rec.recoveryPhrase,
            password,
          );
        }
      } catch {
        /* best-effort backfill; never block verification */
      }
      await verify.mutateAsync({ password, encryptedRecoveryPhrase });
      markDailyVerified(user.id);
      setPassword("");
      setOpen(false);
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ??
        "Wrong verification password.";
      setError(msg);
    }
  }

  async function startRecoveryReset() {
    setError(null);
    try {
      const result = await beginReset.mutateAsync();
      setChallengeNonce(result.challengeNonce);
      setPassword("");
      setResetMode(true);
    } catch (err) {
      setError(
        (err as { message?: string })?.message ??
          "Could not start password recovery.",
      );
    }
  }

  async function onRecoveryReset(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !challengeNonce) return;
    const phrase = recoveryKey.trim().toLowerCase();
    if (!isValidRecoveryPhrase(phrase)) {
      setError("Enter the valid 12-word Recovery Key for this account.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords don't match.");
      return;
    }

    setError(null);
    try {
      const identity = deriveIdentityFromPhrase(phrase);
      const encryptedRecoveryPhrase = await encryptRecoveryPhraseForServer(
        phrase,
        newPassword,
      );
      await completeReset.mutateAsync({
        challengeNonce,
        identityPubkey: bytesToBase64(identity.publicKey),
        signature: signMessage(identity.privateKey, challengeNonce),
        newPassword,
        encryptedRecoveryPhrase,
      });
      markDailyVerified(user.id);
      setRecoveryKey("");
      setNewPassword("");
      setConfirmNewPassword("");
      setChallengeNonce("");
      setResetMode(false);
      setOpen(false);
    } catch (err) {
      setError(
        (err as { message?: string })?.message ??
          "Recovery Key verification failed.",
      );
    }
  }

  function cancelRecoveryReset() {
    setRecoveryKey("");
    setNewPassword("");
    setConfirmNewPassword("");
    setChallengeNonce("");
    setResetMode(false);
    setError(null);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      {resetMode ? (
        <form
          onSubmit={onRecoveryReset}
          className="w-full max-w-sm rounded-2xl bg-bg border border-line p-6 flex flex-col gap-4 shadow-2xl"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo />
            <h2 className="text-xl font-semibold text-text">
              Reset daily password
            </h2>
            <p className="text-sm text-text-muted">
              Your Recovery Key proves that you own this account. It stays on
              this device and is never uploaded.
            </p>
          </div>

          <div>
            <FieldLabel>Recovery Key</FieldLabel>
            <textarea
              autoFocus
              value={recoveryKey}
              onChange={(e) => setRecoveryKey(e.target.value)}
              placeholder="Enter your 12 recovery words"
              autoComplete="off"
              spellCheck={false}
              className="w-full min-h-24 rounded-xl bg-surface border border-line px-3 py-2.5 text-sm text-text outline-none focus:border-wa-green transition resize-none"
            />
          </div>

          <div>
            <FieldLabel>New daily verification password</FieldLabel>
            <TextInput
              type={show ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div>
            <FieldLabel>Confirm new password</FieldLabel>
            <TextInput
              type={show ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Type it again"
              autoComplete="new-password"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
              className="accent-wa-green"
            />
            Show password
          </label>

          <ErrorMessage>{error}</ErrorMessage>

          <PrimaryButton
            type="submit"
            loading={completeReset.isPending}
            disabled={
              !recoveryKey.trim() ||
              newPassword.length < 8 ||
              newPassword !== confirmNewPassword ||
              completeReset.isPending
            }
          >
            Reset and unlock
          </PrimaryButton>
          <button
            type="button"
            onClick={cancelRecoveryReset}
            className="text-sm text-text-muted hover:text-text underline underline-offset-4"
          >
            Back to daily verification
          </button>
        </form>
      ) : (
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm rounded-2xl bg-bg border border-line p-6 flex flex-col gap-4 shadow-2xl"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo />
            <h2 className="text-xl font-semibold text-text">
              Daily verification
            </h2>
            <p className="text-sm text-text-muted">
              For your security, please re-enter your daily verification
              password to continue.
            </p>
          </div>

          <div>
            <FieldLabel>Verification password</FieldLabel>
            <TextInput
              autoFocus
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your verification password"
              autoComplete="current-password"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
              className="accent-wa-green"
            />
            Show password
          </label>

          <PrimaryButton
            type="submit"
            loading={verify.isPending}
            disabled={password.length < 8 || verify.isPending}
          >
            Unlock
          </PrimaryButton>

          <button
            type="button"
            onClick={() => void startRecoveryReset()}
            disabled={beginReset.isPending}
            className="text-sm text-wa-green-dark dark:text-wa-green hover:underline underline-offset-4 disabled:opacity-50"
          >
            {beginReset.isPending ? "Preparing recovery…" : "Forgot Password?"}
          </button>

          <ErrorMessage>{error}</ErrorMessage>
        </form>
      )}
    </div>
  );
}
