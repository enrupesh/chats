import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutFirebase,
} from "../lib/firebase";
import {
  deleteTempInbox,
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
  useNoindex("Temporary inbox · VeilChat");
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured());
  const [inboxes, setInboxes] = useState<TempInbox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TempInboxMessage[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const turnstileHostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

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
    setLoadingMessages(true);
    try {
      const idToken = await user.getIdToken();
      setMessages(await listTempInboxMessages(idToken, selectedInbox.id));
    } catch (loadError) {
      setError(messageOf(loadError));
    } finally {
      setLoadingMessages(false);
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

  async function handleDelete(inbox: TempInbox) {
    if (!user || !window.confirm(`Delete ${inbox.address}? This address can never be reused.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteTempInbox(await user.getIdToken(), inbox.id);
      await refreshInboxes();
    } catch (deleteError) {
      setError(messageOf(deleteError));
    } finally {
      setBusy(false);
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

  return (
    <main className="temp-inbox">
      <div className="temp-inbox__grain" aria-hidden="true" />
      <header className="temp-inbox__nav">
        <Link className="temp-inbox__brand" to="/">
          <span className="temp-inbox__brand-mark" aria-hidden="true">V</span>
          <span>
            <strong>VeilChat</strong>
            <small>temporary inbox</small>
          </span>
        </Link>
        <nav className="temp-inbox__links" aria-label="Temporary inbox navigation">
          <Link to="/waitlist">Founder access</Link>
          {user ? (
            <button type="button" onClick={() => void signOutFirebase()}>
              Sign out
            </button>
          ) : null}
        </nav>
      </header>

      <section className="temp-inbox__hero">
        <div>
          <p className="temp-inbox__eyebrow"><i /> RECEIVE ONLY / 24 HOURS</p>
          <h1>A quiet address for the code you need.</h1>
          <p className="temp-inbox__intro">
            Create a disposable inbox on <strong>temp.veilchat.me</strong>, use it on
            another site, and copy the verification code here. No sending, replying,
            forwarding, or permanent mailbox history.
          </p>
        </div>
        <div className="temp-inbox__promise">
          <span>01</span><strong>Google-only access</strong><small>Your inboxes stay tied to your account.</small>
          <span>02</span><strong>Two addresses</strong><small>A rolling 24-hour limit keeps the service useful.</small>
          <span>03</span><strong>Automatic deletion</strong><small>Messages and inboxes expire after 24 hours.</small>
        </div>
      </section>

      <section className="temp-inbox__workspace" aria-label="Temporary inbox dashboard">
        {!authReady ? (
          <div className="temp-inbox__card temp-inbox__loading">Checking your Google session…</div>
        ) : !isFirebaseConfigured() ? (
          <div className="temp-inbox__card temp-inbox__notice">
            <span className="temp-inbox__card-label">Setup needed</span>
            <h2>Google access is not configured yet.</h2>
            <p>Set the Firebase client configuration and enable the Google provider to open a temporary inbox.</p>
          </div>
        ) : !user ? (
          <div className="temp-inbox__card temp-inbox__signin">
            <div className="temp-inbox__card-label">Private dashboard</div>
            <h2>Sign in before you receive.</h2>
            <p>Google is the only sign-in method for this product. Your VeilChat messenger account stays separate.</p>
            {error ? <p className="temp-inbox__error" role="alert">{error}</p> : null}
            <button className="temp-inbox__google" type="button" onClick={() => void handleGoogleSignIn()} disabled={busy}>
              <GoogleIcon />
              <span>{busy ? "Opening Google…" : "Continue with Google"}</span>
              <b>↗</b>
            </button>
            <p className="temp-inbox__fineprint">No password is created here. We never receive your Google password.</p>
          </div>
        ) : (
          <div className="temp-inbox__dashboard">
            <div className="temp-inbox__dashboard-top">
              <div>
                <span className="temp-inbox__card-label">Your temporary space</span>
                <h2>What are you waiting for?</h2>
              </div>
              <span className="temp-inbox__identity">{user.email ?? "Google account"}</span>
            </div>

            <div className="temp-inbox__control-row">
              <div className="temp-inbox__quota">
                <span className="temp-inbox__card-label">Rolling allowance</span>
                <strong>{inboxes.length} / 2 active addresses</strong>
                 <small>Only the newest email is kept; the inbox expires after 24 hours.</small>
              </div>
              <div className="temp-inbox__create">
                {turnstileSiteKey ? <div ref={turnstileHostRef} className="temp-inbox__turnstile" /> : (
                  <small className="temp-inbox__turnstile-missing">Turnstile site key is not configured.</small>
                )}
                <button type="button" className="temp-inbox__create-button" onClick={() => void handleCreate()} disabled={busy || (turnstileRequired && !turnstileToken)}>
                  {busy ? "Working…" : "Create temporary inbox"} <span>+</span>
                </button>
              </div>
            </div>

            {error ? <p className="temp-inbox__error" role="alert">{error}</p> : null}

            <div className="temp-inbox__columns">
              <div className="temp-inbox__inboxes">
                <div className="temp-inbox__section-heading"><span>Issued addresses</span><small>{inboxes.length ? "Select an inbox" : "None yet"}</small></div>
                {inboxes.length === 0 ? (
                  <div className="temp-inbox__empty"><span>+</span><p>Your first temporary address will appear here.</p></div>
                ) : inboxes.map((inbox) => (
                  <button
                    type="button"
                    key={inbox.id}
                    className={`temp-inbox__inbox-row ${selectedId === inbox.id ? "is-selected" : ""}`}
                    onClick={() => setSelectedId(inbox.id)}
                  >
                    <span className="temp-inbox__inbox-icon" aria-hidden="true">@</span>
                    <span className="temp-inbox__inbox-copy"><strong>{inbox.address}</strong><small>Expires in {formatRemaining(inbox.expiresAt, now)}</small></span>
                    <span className="temp-inbox__inbox-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>

              <div className="temp-inbox__messages">
                {!selectedInbox ? (
                  <div className="temp-inbox__empty temp-inbox__empty--messages"><span>✦</span><p>Select an address to view incoming mail.</p></div>
                ) : (
                  <>
                    <div className="temp-inbox__message-heading">
                      <div><span className="temp-inbox__card-label">Live receive-only view</span><strong>{selectedInbox.address}</strong></div>
                      <div className="temp-inbox__message-actions">
                        <button type="button" onClick={() => void copyValue(selectedInbox.address, selectedInbox.id)}>{copied === selectedInbox.id ? "Copied" : "Copy address"}</button>
                        <button type="button" className="is-danger" onClick={() => void handleDelete(selectedInbox)}>Delete</button>
                      </div>
                    </div>
                    <div className="temp-inbox__message-list">
                      {loadingMessages && messages.length === 0 ? <div className="temp-inbox__message-empty">Checking for new mail…</div> : messages.length === 0 ? (
                         <div className="temp-inbox__message-empty"><span>⌁</span><strong>Waiting for incoming mail</strong><small>Use the address on another site. The newest email appears here automatically.</small></div>
                      ) : messages.map((message) => <MessageCard key={message.id} message={message} copied={copied} onCopy={copyValue} />)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <footer className="temp-inbox__footer">
        <span>VEILCHAT / TEMPORARY MAIL</span>
        <span>Receive only. Delete automatically. Never reused.</span>
        <span>© {new Date().getFullYear()} VeilChat</span>
      </footer>
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
    <article className="temp-inbox__message-card">
      <div className="temp-inbox__message-meta">
        <span className="temp-inbox__sender-badge">{message.fromAddress.slice(0, 1).toUpperCase()}</span>
        <div><strong>{message.fromAddress}</strong><small>{formatDate(message.receivedAt)}</small></div>
        {message.attachmentCount ? <span className="temp-inbox__attachments">{message.attachmentCount} attachment{message.attachmentCount === 1 ? "" : "s"}</span> : null}
      </div>
      <h3>{message.subject}</h3>
      {message.otpCode ? (
        <div className="temp-inbox__otp">
          <div><span>Possible verification code</span><strong>{message.otpCode}</strong></div>
          <button type="button" onClick={() => void onCopy(message.otpCode!, `otp:${message.id}`)}>{copied === `otp:${message.id}` ? "Copied" : "Copy code"} <span>↗</span></button>
        </div>
      ) : null}
      <div className="temp-inbox__body">
        {message.textBody ? <p>{message.textBody}</p> : message.htmlBody ? <div dangerouslySetInnerHTML={{ __html: message.htmlBody }} /> : <p className="is-muted">This message has no displayable body.</p>}
      </div>
    </article>
  );
}

function GoogleIcon() {
  return <span className="temp-inbox__google-icon" aria-hidden="true">G</span>;
}