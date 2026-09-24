import { useEffect, useMemo, useState } from "react";
import "./_group.css";

type TempInbox = {
  id: string;
  address: string;
  createdAt: string;
  expiresAt: string;
};

type TempInboxMessage = {
  id: string;
  fromAddress: string;
  subject: string;
  textBody: string | null;
  htmlBody: string | null;
  receivedAt: string;
  otpCode: string | null;
  attachmentCount: number;
};

type MockUser = { email: string };

const initialInbox: TempInbox = {
  id: "inbox-1",
  address: "violet-7k2p@temp.veilchat.me",
  createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  expiresAt: new Date(Date.now() + 23 * 60 * 60_000 + 15 * 60_000).toISOString(),
};

const initialMessage: TempInboxMessage = {
  id: "message-1",
  fromAddress: "security@linear.app",
  subject: "Your Linear verification code",
  textBody: "Use this code to finish signing in to Linear.\n\nThis code expires in 10 minutes.",
  htmlBody: null,
  receivedAt: new Date(Date.now() - 4 * 60_000).toISOString(),
  otpCode: "482 193",
  attachmentCount: 0,
};

function formatRemaining(expiresAt: string, now: number): string {
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function Current() {
  const [user, setUser] = useState<MockUser | null>({ email: "you@example.com" });
  const [inboxes, setInboxes] = useState<TempInbox[]>([initialInbox]);
  const [selectedId, setSelectedId] = useState<string | null>(initialInbox.id);
  const [messages, setMessages] = useState<TempInboxMessage[]>([initialMessage]);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const selectedInbox = useMemo(
    () => inboxes.find((inbox) => inbox.id === selectedId) ?? null,
    [inboxes, selectedId],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleGoogleSignIn = () => {
    setBusy(true);
    window.setTimeout(() => {
      setUser({ email: "you@example.com" });
      setBusy(false);
    }, 350);
  };

  const handleCreate = () => {
    if (!user || inboxes.length >= 2) return;
    setBusy(true);
    window.setTimeout(() => {
      const inbox: TempInbox = {
        id: "inbox-2",
        address: "cobalt-4m8q@temp.veilchat.me",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
      };
      setInboxes((current) => [inbox, ...current]);
      setSelectedId(inbox.id);
      setMessages([]);
      setBusy(false);
    }, 450);
  };

  const handleDelete = (inbox: TempInbox) => {
    if (!window.confirm(`Delete ${inbox.address}? This address can never be reused.`)) return;
    setInboxes((current) => current.filter((item) => item.id !== inbox.id));
    setSelectedId(null);
    setMessages([]);
  };

  const handleManualRefresh = () => {
    if (!selectedInbox || manualRefreshing) return;
    setManualRefreshing(true);
    setLoadingMessages(true);
    window.setTimeout(() => {
      setLoadingMessages(false);
      setManualRefreshing(false);
    }, 700);
  };

  const copyValue = (value: string, key: string) => {
    void value;
    setCopied(key);
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1400);
  };

  return (
    <main className="temp-inbox">
      <div className="temp-inbox__grain" aria-hidden="true" />
      <header className="temp-inbox__nav">
        <a className="temp-inbox__brand" href="/">
          <span className="temp-inbox__brand-mark" aria-hidden="true">V</span>
          <span><strong>VeilChat</strong><small>temporary inbox</small></span>
        </a>
        <nav className="temp-inbox__links" aria-label="Temporary inbox navigation">
          <a href="/waitlist">Founder access</a>
          {user ? <button type="button" onClick={() => setUser(null)}>Sign out</button> : null}
        </nav>
      </header>

      <section className="temp-inbox__hero">
        <div>
          <p className="temp-inbox__eyebrow"><i /> RECEIVE ONLY / 24 HOURS</p>
          <h1>A quiet address for the code you need.</h1>
          <p className="temp-inbox__intro">
            Create a disposable inbox on <strong>temp.veilchat.me</strong>, use it on another site,
            and copy the verification code here. No sending, replying, forwarding, or permanent mailbox history.
          </p>
        </div>
        <div className="temp-inbox__promise">
          <span>01</span><strong>Google-only access</strong><small>Your inboxes stay tied to your account.</small>
          <span>02</span><strong>Two addresses</strong><small>A rolling 24-hour limit keeps the service useful.</small>
          <span>03</span><strong>Automatic deletion</strong><small>Messages and inboxes expire after 24 hours.</small>
        </div>
      </section>

      <section className="temp-inbox__workspace" aria-label="Temporary inbox dashboard">
        {!user ? (
          <div className="temp-inbox__card temp-inbox__signin">
            <div className="temp-inbox__card-label">Private dashboard</div>
            <h2>Sign in before you receive.</h2>
            <p>Google is the only sign-in method for this product. Your VeilChat messenger account stays separate.</p>
            <button className="temp-inbox__google" type="button" onClick={handleGoogleSignIn} disabled={busy}>
              <GoogleIcon /><span>{busy ? "Opening Google…" : "Continue with Google"}</span><b>↗</b>
            </button>
            <p className="temp-inbox__fineprint">No password is created here. We never receive your Google password.</p>
          </div>
        ) : (
          <div className="temp-inbox__dashboard">
            <div className="temp-inbox__dashboard-top">
              <div><span className="temp-inbox__card-label">Your temporary space</span><h2>What are you waiting for?</h2></div>
              <span className="temp-inbox__identity">{user.email}</span>
            </div>
            <div className="temp-inbox__control-row">
              <div className="temp-inbox__quota">
                <span className="temp-inbox__card-label">Rolling allowance</span>
                <strong>{inboxes.length} / 2 active addresses</strong>
                <small>Only the newest email is kept; the inbox expires after 24 hours.</small>
              </div>
              <div className="temp-inbox__create">
                <small className="temp-inbox__turnstile-missing">Turnstile site key is not configured.</small>
                <button type="button" className="temp-inbox__create-button" onClick={handleCreate} disabled={busy || inboxes.length >= 2}>
                  {busy ? "Working…" : "Create temporary inbox"} <span>+</span>
                </button>
              </div>
            </div>
            <div className="temp-inbox__columns">
              <div className="temp-inbox__inboxes">
                <div className="temp-inbox__section-heading"><span>Issued addresses</span><small>{inboxes.length ? "Select an inbox" : "None yet"}</small></div>
                {inboxes.length === 0 ? (
                  <div className="temp-inbox__empty"><span>+</span><p>Your first temporary address will appear here.</p></div>
                ) : inboxes.map((inbox) => (
                  <button type="button" key={inbox.id} className={`temp-inbox__inbox-row ${selectedId === inbox.id ? "is-selected" : ""}`} onClick={() => setSelectedId(inbox.id)}>
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
                        <button type="button" className={`temp-inbox__refresh-button ${manualRefreshing ? "is-refreshing" : ""}`} onClick={handleManualRefresh} disabled={manualRefreshing || loadingMessages} aria-label="Refresh incoming mail" title="Refresh incoming mail">
                          <span className="temp-inbox__refresh-icon" aria-hidden="true">↻</span><span>{manualRefreshing ? "Refreshing…" : "Refresh mail"}</span>
                        </button>
                        <button type="button" onClick={() => copyValue(selectedInbox.address, selectedInbox.id)}>{copied === selectedInbox.id ? "Copied" : "Copy address"}</button>
                        <button type="button" className="is-danger" onClick={() => handleDelete(selectedInbox)}>Delete</button>
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

      <footer className="temp-inbox__footer"><span>VEILCHAT / TEMPORARY MAIL</span><span>Receive only. Delete automatically. Never reused.</span><span>© 2026 VeilChat</span></footer>
    </main>
  );
}

function MessageCard({ message, copied, onCopy }: { message: TempInboxMessage; copied: string | null; onCopy: (value: string, key: string) => void }) {
  return (
    <article className="temp-inbox__message-card">
      <div className="temp-inbox__message-meta">
        <span className="temp-inbox__sender-badge">{message.fromAddress.slice(0, 1).toUpperCase()}</span>
        <div><strong>{message.fromAddress}</strong><small>{formatDate(message.receivedAt)}</small></div>
        {message.attachmentCount ? <span className="temp-inbox__attachments">{message.attachmentCount} attachment{message.attachmentCount === 1 ? "" : "s"}</span> : null}
      </div>
      <h3>{message.subject}</h3>
      {message.otpCode ? <div className="temp-inbox__otp"><div><span>Possible verification code</span><strong>{message.otpCode}</strong></div><button type="button" onClick={() => onCopy(message.otpCode!, `otp:${message.id}`)}>{copied === `otp:${message.id}` ? "Copied" : "Copy code"} <span>↗</span></button></div> : null}
      <div className="temp-inbox__body">{message.textBody ? <p>{message.textBody}</p> : message.htmlBody ? <div dangerouslySetInnerHTML={{ __html: message.htmlBody }} /> : <p className="is-muted">This message has no displayable body.</p>}</div>
    </article>
  );
}

function GoogleIcon() {
  return <span className="temp-inbox__google-icon" aria-hidden="true">G</span>;
}