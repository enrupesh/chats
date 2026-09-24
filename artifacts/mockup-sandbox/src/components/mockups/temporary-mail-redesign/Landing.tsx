import { ArrowUpRight, Check, Inbox } from "lucide-react";
import { useState } from "react";
import "./_styles.css";

export function Landing() {
  const [signingIn, setSigningIn] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  function handleGoogleSignIn() {
    setSigningIn(true);
    window.setTimeout(() => {
      setSigningIn(false);
      setSignedIn(true);
    }, 650);
  }

  return (
    <main className="tm-page">
      <header className="tm-topbar">
        <a className="tm-brand" href="/" aria-label="Temporary Mail home">
          <span className="tm-brand-mark" aria-hidden="true">
            <Inbox />
          </span>
          <span>temporary mail</span>
        </a>
        <span className="tm-topbar-note">Receive only · auto-deletes in 24h</span>
      </header>

      <div className="tm-landing-main">
        <section className="tm-hero">
          <div>
            <p className="tm-kicker">
              <span className="tm-kicker-dot" aria-hidden="true" />
              Private verification inbox
            </p>
            <h1>A temporary inbox for one important email.</h1>
            <p className="tm-hero-copy">
              Get a private address, use it for a verification code, and leave.
              No sending. No permanent mailbox history.
            </p>
            <button
              className="tm-google-button"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn || signedIn}
            >
              <span className="tm-google-g" aria-hidden="true">G</span>
              <span>{signedIn ? "Google account connected" : signingIn ? "Opening Google…" : "Continue with Google"}</span>
              {!signedIn ? <ArrowUpRight className="tm-button-arrow" aria-hidden="true" /> : <Check className="tm-button-arrow" aria-hidden="true" />}
            </button>
            <p className="tm-fine-print">
              Google sign-in keeps your inbox private. We never see your Google password.
            </p>
            {signedIn ? (
              <span className="tm-landing-status">
                <Check aria-hidden="true" />
                Ready for your temporary mailbox
              </span>
            ) : null}
          </div>

          <div className="tm-preview-window" aria-label="Example temporary mailbox">
            <div className="tm-preview-window-top">
              <small>Mailbox preview</small>
              <span className="tm-window-dots" aria-hidden="true">
                <span /><span /><span />
              </span>
            </div>
            <div className="tm-preview-address">
              <span className="tm-preview-label">Your address</span>
              <strong>maple-8q3r@temp.mail</strong>
            </div>
            <div className="tm-preview-message">
              <div className="tm-preview-message-head">
                <span className="tm-sender-dot" aria-hidden="true">S</span>
                <div>
                  <strong>security@linear.app</strong>
                  <small>Just now</small>
                </div>
              </div>
              <h3>Your Linear verification code</h3>
              <div className="tm-preview-code">
                <span>Verification code</span>
                <strong>482 193</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="tm-trust-strip" aria-label="How temporary mail works">
          <div className="tm-trust-item">
            <strong>Private by default</strong>
            <span>Only you can open your inbox.</span>
          </div>
          <div className="tm-trust-item">
            <strong>One address at a time</strong>
            <span>Made for the code you need now.</span>
          </div>
          <div className="tm-trust-item">
            <strong>Gone after 24 hours</strong>
            <span>Address and message are deleted.</span>
          </div>
        </section>
      </div>

      <footer className="tm-landing-footer">
        <span>Temporary Mail</span>
        <span>Receive only. Never reused.</span>
      </footer>
    </main>
  );
}