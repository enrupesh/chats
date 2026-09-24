import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutFirebase,
} from "../lib/firebase";
import {
  type TempInbox,
  type TempInboxMessage,
  createTempInbox,
  listTempInboxMessages,
  listTempInboxes,
} from "../lib/tempInboxApi";
import { useNoindex } from "../lib/useDocumentMeta";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import "./temporary-inbox-page.css";

type TurnstileWidget = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

const turnstileSiteKey = (
  import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
)?.trim();
const turnstileRequired = !import.meta.env.DEV || Boolean(turnstileSiteKey);

function loadTurnstile(): Promise<TurnstileWidget> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-script="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.turnstile) resolve(window.turnstile);
        else reject(new Error("Cloudflare Turnstile did not load."));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Cloudflare Turnstile did not load.")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    script.addEventListener("load", () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Cloudflare Turnstile did not load."));
    });
    script.addEventListener("error", () =>
      reject(new Error("Cloudflare Turnstile did not load.")),
    );
    document.head.appendChild(script);
  });
}

function formatRemaining(expiresAt: string, now: number): string {
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(
    remainingSeconds,
  ).padStart(2, "0")}s`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function TemporaryInboxPage() {
  useNoindex("Temporary Mail · Private verification inbox");
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardRoute = location.pathname.endsWith("/dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured());
  const [inboxes, setInboxes] = useState<TempInbox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TempInboxMessage[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const turnstileHostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const refreshInFlightRef = useRef(false);

  useEffect(() => {
    if (!authReady) return;
    if (user && !isDashboardRoute) {
      navigate("/temporary-inbox/dashboard", { replace: true });
    } else if (!user && isDashboardRoute) {
      navigate("/temporary-inbox", { replace: true });
    }
  }, [authReady, isDashboardRoute, navigate, user]);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      setError(null);
    });
  }, []);

  const refreshInboxes = useCallback(async () => {
    if (!user) return;
    const idToken = await user.getIdToken();
    const next = await listTempInboxes(idToken);
    setInboxes(next);
    setSelectedId((current) =>
      current && next.some((inbox) => inbox.id === current)
        ? current
        : next[0]?.id ?? null,
    );
  }, [user]);

  const selectedInbox = useMemo(
    () => inboxes.find((inbox) => inbox.id === selectedId) ?? null,
    [inboxes, selectedId],
  );

  const refreshMessages = useCallback(async () => {
    if (!user || !selectedInbox) {
      setMessages([]);
      return;
    }
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    setLoadingMessages(true);
    try {
      const idToken = await user.getIdToken();
      setMessages(await listTempInboxMessages(idToken, selectedInbox.id));
    } catch (loadError) {
      setError(messageOf(loadError));
    } finally {
      setLoadingMessages(false);
      refreshInFlightRef.current = false;
    }
  }, [selectedInbox, user]);

  useEffect(() => {
    if (!user) {
      setInboxes([]);
      setSelectedId(null);
      setMessages([]);
      return;
    }
    void refreshInboxes().catch((loadError) => setError(messageOf(loadError)));
  }, [refreshInboxes, user]);

  useEffect(() => {
    void refreshMessages();
    if (!selectedInbox) return;
    const interval = window.setInterval(() => void refreshMessages(), 20_000);
    return () => window.clearInterval(interval);
  }, [refreshMessages, selectedInbox]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !turnstileSiteKey || !turnstileHostRef.current) return;
    let cancelled = false;
    void loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !turnstileHostRef.current || widgetIdRef.current) return;
        widgetIdRef.current = turnstile.render(turnstileHostRef.current, {
          sitekey: turnstileSiteKey,
          theme: "light",
          callback: (nextToken) => setTurnstileToken(nextToken),
          "expired-callback": () => setTurnstileToken(undefined),
          "error-callback": () => setTurnstileToken(undefined),
        });
      })
      .catch((loadError) => setError(messageOf(loadError)));
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      setTurnstileToken(undefined);
    };
  }, [user]);

  async function handleGoogleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (signInError) {
      setError(messageOf(signInError));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const inbox = await createTempInbox(idToken, turnstileToken);
      setInboxes((current) => [inbox, ...current]);
      setSelectedId(inbox.id);
      setMessages([]);
      setTurnstileToken(undefined);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } catch (createError) {
      setError(messageOf(createError));
    } finally {
      setBusy(false);
    }
  }

  async function handleManualRefresh() {
    if (!user || !selectedInbox || manualRefreshing) return;
    setError(null);
    setManualRefreshing(true);
    try {
      await refreshMessages();
    } finally {
      setManualRefreshing(false);
    }
  }

  async function copyValue(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1400);
    } catch {
      setError("Copy is unavailable in this browser. Select the address manually.");
    }
  }

  if (!isDashboardRoute) {
    return (
      <main className="tm-page">
        <header className="tm-topbar">
          <Link className="tm-brand" to="/temporary-inbox" aria-label="Temporary Mail home">
            <span className="tm-brand-mark" aria-hidden="true">@</span>
            <span>temporary mail</span>
          </Link>
          <span className="tm-topbar-note">Receive only · auto-deletes in 24h</span>
        </header>

        <div className="tm-landing-main">
          <section className="tm-hero">
            <div>
              <p className="tm-kicker"><span className="tm-kicker-dot" aria-hidden="true" />Private verification inbox</p>
              <h1>A temporary inbox for one important email.</h1>
              <p className="tm-hero-copy">
                Get a private address, use it for a verification code, and leave.
                No sending. No permanent mailbox history.
              </p>
              {error ? <p className="tm-error" role="alert">{error}</p> : null}
              {!authReady ? (
                <p className="tm-auth-status">Checking your Google session…</p>
              ) : !isFirebaseConfigured() ? (
                <p className="tm-error" role="alert">Google sign-in is not configured yet.</p>
              ) : (
                <button className="tm-google-button" type="button" onClick={() => void handleGoogleSignIn()} disabled={busy}>
                  <GoogleIcon />
                  <span>{busy ? "Opening Google…" : "Continue with Google"}</span>
                  <b aria-hidden="true">↗</b>
                </button>
              )}
              <p className="tm-fine-print">Google sign-in keeps your inbox private. We never see your Google password.</p>
            </div>

            <div className="tm-preview-window" aria-label="Example temporary mailbox">
              <div className="tm-preview-window-top">
                <small>Mailbox preview</small>
                <span className="tm-window-dots" aria-hidden="true"><span /><span /><span /></span>
              </div>
              <div className="tm-preview-address">
                <span className="tm-preview-label">Your address</span>
                <strong>maple-8q3r@temp.mail</strong>
              </div>
              <div className="tm-preview-message">
                <div className="tm-preview-message-head">
                  <span className="tm-sender-dot" aria-hidden="true">S</span>
                  <div><strong>security@linear.app</strong><small>Just now</small></div>
                </div>
                <h3>Your Linear verification code</h3>
                <div className="tm-preview-code"><span>Verification code</span><strong>482 193</strong></div>
              </div>
            </div>
          </section>

          <section className="tm-trust-strip" aria-label="How temporary mail works">
            <div className="tm-trust-item"><strong>Private by default</strong><span>Only you can open your inbox.</span></div>
            <div className="tm-trust-item"><strong>One address at a time</strong><span>Made for the code you need now.</span></div>
            <div className="tm-trust-item"><strong>Gone after 24 hours</strong><span>Address and message are deleted.</span></div>
          </section>
        </div>

        <footer className="tm-landing-footer"><span>Temporary Mail</span><span>Receive only. Never reused.</span></footer>
      </main>
    );
  }

  if (!authReady || !user) {
    return (
      <main className="tm-page">
        <header className="tm-topbar">
          <Link className="tm-brand" to="/temporary-inbox" aria-label="Temporary Mail home">
            <span className="tm-brand-mark" aria-hidden="true">@</span>
            <span>temporary mail</span>
          </Link>
          <span className="tm-topbar-note">Private dashboard</span>
        </header>
        <section className="tm-dashboard-main">
          <div className="tm-mailbox tm-waiting-state tm-waiting-state--signed-out">
            <div><div className="tm-waiting-icon" aria-hidden="true">@</div><h2>Opening your mailbox…</h2><p>We are checking your Google session.</p></div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="tm-page">
      <header className="tm-topbar">
        <Link className="tm-brand" to="/temporary-inbox" aria-label="Temporary Mail home">
          <span className="tm-brand-mark" aria-hidden="true">@</span>
          <span>temporary mail</span>
        </Link>
        <div className="tm-account">
          <span className="tm-avatar" aria-hidden="true">{(user.email ?? "G").slice(0, 2).toUpperCase()}</span>
          <span>{user.email ?? "Google account"}</span>
          <button className="tm-signout" type="button" onClick={() => void signOutFirebase()}>Sign out</button>
        </div>
      </header>

      <section className="tm-dashboard-main" aria-label="Temporary inbox dashboard">
        <div className="tm-dashboard-heading">
          <div><h1>Inbox</h1><p>One address. The latest email only.</p></div>
          <span className="tm-dashboard-note">Receive-only mailbox</span>
        </div>

        <div className="tm-create-row">
          <div>
            <span className="tm-preview-label">Your allowance</span>
            <strong>{inboxes.length} / 2 active addresses</strong>
            <p>Need another code? Ask the sender to send it again. Your latest email replaces the previous one automatically.</p>
          </div>
          <div className="tm-create-controls">
            {turnstileSiteKey ? <div ref={turnstileHostRef} className="tm-turnstile" /> : (
              <small className="tm-turnstile-missing">Turnstile site key is not configured.</small>
            )}
            <button className="tm-dark-button" type="button" onClick={() => void handleCreate()} disabled={busy || (turnstileRequired && !turnstileToken)}>
              {busy ? "Creating…" : "Create temporary address"} <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>

        {error ? <p className="tm-error" role="alert">{error}</p> : null}

        <div className="tm-address-picker" aria-label="Temporary addresses">
          <div className="tm-address-picker-heading"><span>Your addresses</span><span>{inboxes.length} active</span></div>
          {inboxes.length === 0 ? (
            <p className="tm-address-picker-empty">Create an address to start receiving mail.</p>
          ) : inboxes.map((inbox) => (
            <button type="button" key={inbox.id} className={`tm-address-option ${selectedId === inbox.id ? "is-selected" : ""}`} onClick={() => setSelectedId(inbox.id)}>
              <span className="tm-address-option-mark" aria-hidden="true">@</span>
              <span><strong>{inbox.address}</strong><small>Expires in {formatRemaining(inbox.expiresAt, now)}</small></span>
              <span className="tm-address-option-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>

        <div className="tm-mailbox">
          {!selectedInbox ? (
            <div className="tm-waiting-state">
              <div><div className="tm-waiting-icon" aria-hidden="true">@</div><h2>Waiting for a temporary address</h2><p>Create an address above, then use it wherever you need a verification email.</p></div>
            </div>
          ) : (
            <>
              <div className="tm-address-bar">
                <div className="tm-address-content">
                  <span className="tm-preview-label">Your temporary address</span>
                  <strong className="tm-address">{selectedInbox.address}</strong>
                  <span className="tm-address-status">Private · expires in {formatRemaining(selectedInbox.expiresAt, now)}</span>
                </div>
                <div className="tm-address-actions">
                  <button className="tm-plain-button" type="button" onClick={() => void copyValue(selectedInbox.address, selectedInbox.id)}>{copied === selectedInbox.id ? "Copied" : "Copy address"}</button>
                </div>
              </div>

              <div className="tm-mailbox-body">
                <aside className="tm-sidebar" aria-label="Inbox message list">
                  <div className="tm-sidebar-heading"><span>Latest email</span><span>{messages.length} message{messages.length === 1 ? "" : "s"}</span></div>
                  {messages.length ? messages.map((message) => (
                    <div className="tm-mail-row" key={message.id}>
                      <span className="tm-mail-row-avatar" aria-hidden="true">{message.fromAddress.slice(0, 1).toUpperCase()}</span>
                      <div className="tm-mail-row-copy"><strong>{message.fromAddress}</strong><span>{message.subject}</span><small>{formatDate(message.receivedAt)}</small></div>
                    </div>
                  )) : <div className="tm-sidebar-empty"><strong>No email yet</strong>Use this address on another site. The newest email will appear here.</div>}
                   {messages.length ? <div className="tm-sidebar-empty"><strong>Latest email only</strong>Ask for another code when you need one. The previous message is replaced automatically.</div> : null}
                </aside>

                <section className="tm-message-pane" aria-label="Received email">
                  <div className="tm-message-pane-heading">
                    <div><span className="tm-preview-label">Received email</span><h2>{messages[0]?.subject ?? "Waiting for incoming mail"}</h2></div>
                    <button className="tm-plain-button" type="button" onClick={() => void handleManualRefresh()} disabled={manualRefreshing || loadingMessages}>
                      <span className={manualRefreshing ? "tm-spin" : ""} aria-hidden="true">↻</span>{manualRefreshing ? "Checking…" : "Refresh mail"}
                    </button>
                  </div>
                  {loadingMessages && messages.length === 0 ? <div className="tm-message-empty">Checking for new mail…</div> : messages.length === 0 ? (
                    <div className="tm-message-empty"><strong>Waiting for incoming mail</strong><span>Use the address on another site. The newest email appears here automatically.</span></div>
                  ) : messages.map((message) => <MessageCard key={message.id} message={message} copied={copied} onCopy={copyValue} />)}
                </section>
              </div>
            </>
          )}
        </div>

        <div className="tm-dashboard-footer"><span>Messages delete automatically after 24 hours.</span><span>Temporary Mail · private by default</span></div>
      </section>
    </main>
  );
}

function MessageCard({
  message,
  copied,
  onCopy,
}: {
  message: TempInboxMessage;
  copied: string | null;
  onCopy: (value: string, key: string) => Promise<void>;
}) {
  return (
    <article className="tm-message-card">
      <div className="tm-message-meta">
        <span className="tm-sender-avatar" aria-hidden="true">{message.fromAddress.slice(0, 1).toUpperCase()}</span>
        <div><strong>{message.fromAddress}</strong><small>to temporary address · {formatDate(message.receivedAt)}</small></div>
      </div>
      {message.attachmentCount ? <p className="tm-message-attachment">{message.attachmentCount} attachment{message.attachmentCount === 1 ? "" : "s"}</p> : null}
      {message.otpCode ? (
        <div className="tm-otp-box">
          <div><span>Verification code</span><strong className="tm-otp-code">{message.otpCode}</strong></div>
          <button className="tm-otp-copy" type="button" onClick={() => void onCopy(message.otpCode!, `otp:${message.id}`)}>{copied === `otp:${message.id}` ? "Copied" : "Copy code"}</button>
        </div>
      ) : null}
      <div className="tm-message-body">
        {message.textBody ? <p>{message.textBody}</p> : message.htmlBody ? <div dangerouslySetInnerHTML={{ __html: message.htmlBody }} /> : <p className="is-muted">This message has no displayable body.</p>}
      </div>
    </article>
  );
}

function GoogleIcon() {
  return <span className="tm-google-icon" aria-hidden="true">G</span>;
}