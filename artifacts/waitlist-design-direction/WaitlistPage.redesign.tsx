import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import waitlistOfferArt from "../../apps/client/src/assets/waitlist-offer-art.png";
import { getApiBaseUrl } from "../../apps/client/src/lib/apiBase";
import { useDocumentMeta } from "../../apps/client/src/lib/useDocumentMeta";
import "./waitlist-page.css";

type WaitlistForm = {
  email: string;
  websiteUrl: string;
  linkedinUrl: string;
};

type WaitlistResponse = {
  joined?: boolean;
  alreadyJoined?: boolean;
  error?: string;
};

const initialForm: WaitlistForm = {
  email: "",
  websiteUrl: "",
  linkedinUrl: "",
};

export function WaitlistPage() {
  useDocumentMeta({
    title: "VeilChat for founders — professional email for $1",
    description:
      "Get a professional email address on your own custom domain for just $1. Join the VeilChat founder waitlist for early access and five months free.",
    canonical: "https://www.veilchat.me/waitlist",
    ogImage: "https://www.veilchat.me/waitlist-og.jpg?v=2",
    ogType: "website",
  });

  const [form, setForm] = useState<WaitlistForm>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<WaitlistResponse | null>(null);

  function update<K extends keyof WaitlistForm>(key: K, value: WaitlistForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          websiteUrl: form.websiteUrl.trim(),
          linkedinUrl: form.linkedinUrl.trim(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as WaitlistResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error || "We couldn't save your spot. Please try again.");
      }

      setSubmitted(payload ?? { joined: true });
      setForm(initialForm);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We couldn't save your spot. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="vc-waitlist">
      <div className="vc-waitlist__grain" aria-hidden="true" />
      <div className="vc-waitlist__wash vc-waitlist__wash--top" aria-hidden="true" />
      <div className="vc-waitlist__wash vc-waitlist__wash--bottom" aria-hidden="true" />

      <div className="vc-waitlist__frame">
        <header className="vc-nav vc-enter vc-enter--nav">
          <Link to="/" className="vc-brand" data-testid="link-home">
            <span className="vc-brand__mark">
              <img src={waitlistOfferArt} alt="" />
            </span>
            <span className="vc-brand__words">
              <strong>VeilChat</strong>
              <span>for founders</span>
            </span>
          </Link>

          <div className="vc-nav__right">
            <span className="vc-nav__location">veilchat.me / waitlist</span>
            <Link to="/" className="vc-text-link" data-testid="link-back-home">
              Back to VeilChat <span aria-hidden="true" className="vc-arrow">↗</span>
            </Link>
          </div>
        </header>

        <div className="vc-hero">
          <section className="vc-story vc-enter vc-enter--story">
            <p className="vc-kicker">
              <span className="vc-kicker__dot" aria-hidden="true" />
              A new product from the VeilChat team
            </p>

            <h1 className="vc-headline">
              Make your name
              <br />
              <span>look like yours.</span>
            </h1>

            <p className="vc-deck">
              Professional email on your own domain, with the quiet tools that help
              you look ready before the room gets busy.
            </p>

            <div className="vc-price-line">
              <span className="vc-price-line__rule" aria-hidden="true" />
              <span>
                Founder pricing
                <strong>$1 / month</strong>
              </span>
              <span className="vc-price-line__note">five months free for qualifying founders</span>
            </div>

            <ProductObject />

            <div className="vc-edition-rail" aria-label="What is included">
              <div className="vc-edition-rail__intro">
                <span className="vc-mono">The first edition</span>
                <span>Built for the work before the launch.</span>
              </div>
              <div className="vc-edition-rail__item">
                <span className="vc-edition-rail__number">01</span>
                <strong>Your domain</strong>
                <span>an address that travels with you</span>
              </div>
              <div className="vc-edition-rail__item">
                <span className="vc-edition-rail__number">02</span>
                <strong>Quiet tools</strong>
                <span>templates, aliases, replies</span>
              </div>
              <div className="vc-edition-rail__item">
                <span className="vc-edition-rail__number">03</span>
                <strong>Useful signal</strong>
                <span>opens, clicks, campaign health</span>
              </div>
            </div>

            <div className="vc-video-card">
              <div className="vc-video-card__top">
                <div>
                  <span className="vc-mono">A note from the build</span>
                  <strong>For people building in public</strong>
                </div>
                <a
                  href="https://www.youtube.com/@TryAloneFailAloneWinAlone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vc-outline-link"
                  data-testid="link-youtube-header"
                >
                  Watch on YouTube <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="vc-video-card__frame">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/lX0VAINKnAY?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1"
                  title="VeilChat founder launch video"
                  loading="eager"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          <section className="vc-pass-wrap vc-enter vc-enter--pass" aria-label="Founder waitlist form">
            <div className="vc-pass">
              <div className="vc-pass__topline">
                <span className="vc-mono">Founder pass / 001</span>
                <span className="vc-pass__seal">Early access</span>
              </div>

              {submitted ? (
                <SuccessState submitted={submitted} onReset={() => setSubmitted(null)} />
              ) : (
                <>
                  <div className="vc-pass__heading">
                    <span className="vc-pass__eyebrow">Reserve your place</span>
                    <h2>Be early on purpose.</h2>
                    <p>
                      Lock the $1/month launch price. Qualifying founders also get
                      five months free.
                    </p>
                  </div>

                  <div className="vc-founder-note">
                    <span className="vc-founder-note__mark" aria-hidden="true">+</span>
                    <div>
                      <strong>Founder perk included</strong>
                      <span>Share a website or LinkedIn profile if you would like us to verify it.</span>
                    </div>
                  </div>

                  <form className="vc-form" onSubmit={(event) => void submit(event)}>
                    <Field label="Email address" required>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(event) => update("email", event.target.value)}
                        autoComplete="email"
                        maxLength={254}
                        placeholder="you@company.com"
                        className="vc-input"
                        data-testid="input-email"
                      />
                    </Field>
                    <Field label="Your website" optional>
                      <input
                        type="url"
                        value={form.websiteUrl}
                        onChange={(event) => update("websiteUrl", event.target.value)}
                        maxLength={500}
                        placeholder="https://yourwebsite.com"
                        className="vc-input"
                        data-testid="input-website"
                      />
                    </Field>
                    <Field label="LinkedIn profile" optional>
                      <input
                        type="url"
                        value={form.linkedinUrl}
                        onChange={(event) => update("linkedinUrl", event.target.value)}
                        maxLength={500}
                        placeholder="https://linkedin.com/in/your-name"
                        className="vc-input"
                        data-testid="input-linkedin"
                      />
                    </Field>

                    {error ? (
                      <p className="vc-error" role="alert" data-testid="status-waitlist-error">
                        {error}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={busy}
                      className="vc-submit"
                      data-testid="button-submit-waitlist"
                    >
                      <span>{busy ? "Saving your place" : "Reserve my founder spot"}</span>
                      {busy ? (
                        <span className="vc-submit__loading" aria-label="Submitting">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <span className="vc-submit__arrow" aria-hidden="true">→</span>
                      )}
                    </button>
                  </form>

                  <p className="vc-privacy-note">
                    No password. No payment details. Unsubscribe anytime.
                  </p>
                </>
              )}

              <div className="vc-pass__footer">
                <span className="vc-mono">Follow the launch</span>
                <div className="vc-socials">
                  <SocialLink
                    href="https://x.com/mailforfounders"
                    label="Follow Mail for Founders on X"
                    mark="X"
                    title="@mailforfounders"
                    kind="dark"
                    testId="link-social-x"
                  />
                  <SocialLink
                    href="https://www.instagram.com/mailforfounders/"
                    label="Follow Mail for Founders on Instagram"
                    mark="IG"
                    title="@mailforfounders"
                    kind="light"
                    testId="link-social-instagram"
                  />
                  <SocialLink
                    href="https://www.veilchat.me/discover/64c2bf97-4eac-4420-ad9d-5b9fe58df06a"
                    label="Open the official VeilChat profile"
                    mark="V"
                    title="Meet VeilChat"
                    kind="sage"
                    testId="link-social-veilchat"
                  />
                  <SocialLink
                    href="https://www.youtube.com/@TryAloneFailAloneWinAlone"
                    label="Open the Try Alone Fail Alone Win Alone YouTube channel"
                    mark="YT"
                    title="Behind the build"
                    kind="clay"
                    testId="link-social-youtube"
                  />
                </div>
              </div>
            </div>
            <span className="vc-pass-wrap__caption">A small inbox for a serious beginning.</span>
          </section>
        </div>

        <footer className="vc-footer">
          <span>VEILCHAT / FOUNDER EDITION</span>
          <span>Private by design. Useful by default.</span>
          <span>© {new Date().getFullYear()} VeilChat</span>
        </footer>
      </div>
    </main>
  );
}

function ProductObject() {
  return (
    <div className="vc-object" aria-hidden="true">
      <div className="vc-object__backdrop" />
      <div className="vc-object__orbit vc-object__orbit--one" />
      <div className="vc-object__orbit vc-object__orbit--two" />
      <div className="vc-object__card">
        <div className="vc-object__card-top">
          <span>VeilChat / mail</span>
          <span>01</span>
        </div>
        <img src={waitlistOfferArt} alt="" />
        <div className="vc-object__card-bottom">
          <span>yourname@</span>
          <strong>yourdomain</strong>
        </div>
      </div>
      <span className="vc-object__annotation vc-object__annotation--one">custom domain</span>
      <span className="vc-object__annotation vc-object__annotation--two">private by design</span>
      <span className="vc-object__spark vc-object__spark--one" />
      <span className="vc-object__spark vc-object__spark--two" />
    </div>
  );
}

function Field({
  children,
  label,
  optional,
  required,
}: {
  children: ReactNode;
  label: string;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <label className="vc-field">
      <span className="vc-field__label">
        {label}
        {required ? <span className="vc-field__required">Required</span> : null}
        {optional ? <span className="vc-field__optional">Optional</span> : null}
      </span>
      {children}
    </label>
  );
}

function SuccessState({
  submitted,
  onReset,
}: {
  submitted: WaitlistResponse;
  onReset: () => void;
}) {
  return (
    <div className="vc-success" data-testid="status-waitlist-success">
      <div className="vc-success__stamp" aria-hidden="true">
        <span>V</span>
      </div>
      <span className="vc-pass__eyebrow">
        {submitted.alreadyJoined ? "Already on the list" : "You're on the list"}
      </span>
      <h2>We’ll keep you posted.</h2>
      <p>
        Your interest is saved. We’ll share launch updates and early access details
        by email.
      </p>
      <button type="button" className="vc-secondary-button" onClick={onReset} data-testid="button-add-email">
        Add another email
      </button>
    </div>
  );
}

function SocialLink({
  href,
  label,
  mark,
  title,
  kind,
  testId,
}: {
  href: string;
  label: string;
  mark: string;
  title: string;
  kind: "dark" | "light" | "sage" | "clay";
  testId: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`vc-social vc-social--${kind}`}
      data-testid={testId}
    >
      <span className="vc-social__mark">{mark}</span>
      <span className="vc-social__title">{title}</span>
      <span className="vc-social__arrow" aria-hidden="true">↗</span>
    </a>
  );
}
