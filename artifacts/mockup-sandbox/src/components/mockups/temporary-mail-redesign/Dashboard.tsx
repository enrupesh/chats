import {
  Check,
  Clipboard,
  Copy,
  Inbox,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Clock3,
} from "lucide-react";
import { useState } from "react";
import "./_styles.css";

const address = "maple-8q3r@temp.mail";

export function Dashboard() {
  const [copied, setCopied] = useState<"address" | "otp" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("a few seconds ago");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [signedOut, setSignedOut] = useState(false);

  function copyValue(value: string, kind: "address" | "otp") {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(value).catch(() => undefined);
    }
    setCopied(kind);
    window.setTimeout(() => setCopied((current) => current === kind ? null : current), 1500);
  }

  function refreshMailbox() {
    if (refreshing || deleted) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setUpdatedAt("just now");
    }, 650);
  }

  function deleteAddress() {
    setConfirmDelete(false);
    setDeleted(true);
  }

  if (signedOut) {
    return (
      <main className="tm-page">
        <header className="tm-topbar">
          <a className="tm-brand" href="/" aria-label="Temporary Mail home">
            <span className="tm-brand-mark" aria-hidden="true"><Inbox /></span>
            <span>temporary mail</span>
          </a>
          <span className="tm-topbar-note">Receive only · auto-deletes in 24h</span>
        </header>
        <section className="tm-dashboard-main">
          <div className="tm-mailbox">
            <div className="tm-waiting-state tm-waiting-state--signed-out">
              <div>
                <div className="tm-waiting-icon"><LogOut aria-hidden="true" /></div>
                <h2>You are signed out.</h2>
                <p>Sign in with Google to open a private temporary mailbox.</p>
                <button className="tm-dark-button" type="button" onClick={() => setSignedOut(false)} style={{ marginTop: 18 }}>
                  <ShieldCheck aria-hidden="true" />
                  Return to mailbox
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="tm-page">
      <header className="tm-topbar">
        <a className="tm-brand" href="/" aria-label="Temporary Mail home">
          <span className="tm-brand-mark" aria-hidden="true"><Inbox /></span>
          <span>temporary mail</span>
        </a>
        <span className="tm-topbar-note">Receive only · auto-deletes in 24h</span>
      </header>

      <section className="tm-dashboard-main">
        <div className="tm-dashboard-heading">
          <div>
            <h1>Inbox</h1>
            <p>One address. The latest email only.</p>
          </div>
          <div className="tm-account">
            <span className="tm-avatar" aria-hidden="true">JD</span>
            <span>jordan.davis@gmail.com</span>
            <button className="tm-signout" type="button" onClick={() => setSignedOut(true)}>Sign out</button>
          </div>
        </div>

        <div className="tm-mailbox">
          {deleted ? (
            <div className="tm-waiting-state">
              <div>
                <div className="tm-waiting-icon"><Clock3 aria-hidden="true" /></div>
                <h2>Waiting for a temporary address</h2>
                <p>This mailbox was deleted. A new address will appear here when you start another session.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="tm-address-bar">
                <div className="tm-address-content">
                  <span className="tm-preview-label">Your temporary address</span>
                  <strong className="tm-address">{address}</strong>
                  <span className="tm-address-status">
                    <ShieldCheck aria-hidden="true" />
                    Private · expires in 23h 41m
                  </span>
                </div>
                {confirmDelete ? (
                  <div className="tm-delete-confirm" role="alert">
                    <span>Delete this address?</span>
                    <button type="button" onClick={deleteAddress}>Yes, delete</button>
                    <button type="button" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  </div>
                ) : (
                  <div className="tm-address-actions">
                    <button className="tm-plain-button" type="button" onClick={() => copyValue(address, "address")}>
                      {copied === "address" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                      {copied === "address" ? "Copied" : "Copy address"}
                    </button>
                    <button className="tm-danger-button" type="button" onClick={() => setConfirmDelete(true)}>
                      <Trash2 aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="tm-mailbox-body">
                <aside className="tm-sidebar" aria-label="Inbox message list">
                  <div className="tm-sidebar-heading">
                    <span>Latest email</span>
                    <span>1 message</span>
                  </div>
                  <div className="tm-mail-row">
                    <span className="tm-mail-row-avatar" aria-hidden="true">S</span>
                    <div className="tm-mail-row-copy">
                      <strong>security@linear.app</strong>
                      <span>Your Linear verification code</span>
                      <small>Received 4 minutes ago</small>
                    </div>
                  </div>
                  <div className="tm-sidebar-empty">
                    <strong>No older messages</strong>
                    New mail replaces this one. This inbox never builds a history.
                  </div>
                </aside>

                <article className="tm-message-pane">
                  <div className="tm-message-pane-heading">
                    <div>
                      <span className="tm-preview-label">Received email</span>
                      <h2>Your Linear verification code</h2>
                    </div>
                    <time>{updatedAt}</time>
                  </div>
                  <div className="tm-message-meta">
                    <span className="tm-sender-avatar" aria-hidden="true">S</span>
                    <div className="tm-message-meta-copy">
                      <strong>security@linear.app</strong>
                      <span>to maple-8q3r@temp.mail</span>
                    </div>
                  </div>
                  <div className="tm-message-body">
                    <div className="tm-otp-box">
                      <div>
                        <span>Verification code</span>
                        <strong className="tm-otp-code">482 193</strong>
                      </div>
                      <button className="tm-otp-copy" type="button" onClick={() => copyValue("482 193", "otp")}>
                        {copied === "otp" ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
                        {copied === "otp" ? "Copied" : "Copy code"}
                      </button>
                    </div>
                    <p>Use this code to finish signing in to Linear.</p>
                    <p>This code expires in 10 minutes.</p>
                  </div>
                  <div className="tm-message-note">
                    <span>Receive-only mailbox. Replies and attachments are not supported.</span>
                  </div>
                </article>
              </div>

              <div style={{ padding: "0 21px 18px", display: "flex", justifyContent: "flex-end" }}>
                <button className="tm-plain-button" type="button" onClick={refreshMailbox} disabled={refreshing}>
                  {refreshing ? <LoaderCircle className="tm-spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
                  {refreshing ? "Checking…" : "Refresh mail"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="tm-dashboard-footer">
          <span><Check aria-hidden="true" style={{ width: 12, verticalAlign: -2, marginRight: 4 }} />Messages delete automatically after 24 hours.</span>
          <span>Temporary Mail · private by default</span>
        </div>
      </section>
    </main>
  );
}