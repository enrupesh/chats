import { Link } from "react-router-dom";
import {
  BlogLayout,
  Callout,
  Cite,
  H2,
  H3,
  P,
  type BlogSource,
  type BlogTocItem,
} from "../components/BlogLayout";
import { useDocumentMeta, SEO_SITE_URL } from "../lib/useDocumentMeta";

const SOURCES: BlogSource[] = [
  { n: 1, title: "RFC 5321 — Simple Mail Transfer Protocol", publisher: "IETF", url: "https://www.rfc-editor.org/rfc/rfc5321", date: "2008" },
  { n: 2, title: "RFC 7489 — Domain-based Message Authentication, Reporting, and Conformance", publisher: "IETF", url: "https://www.rfc-editor.org/rfc/rfc7489", date: "2015" },
  { n: 3, title: "Email Authentication — DMARC", publisher: "CISA", url: "https://www.cisa.gov/topics/cyber-threats-and-advisories/email-security", date: "current guidance" },
  { n: 4, title: "Guidelines for Managing the Security of Mobile Devices", publisher: "NIST", url: "https://csrc.nist.gov/publications/detail/sp/800-124/rev-2/final", date: "2023" },
  { n: 5, title: "Authentication Cheat Sheet", publisher: "OWASP", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", date: "current guidance" },
  { n: 6, title: "Data minimisation", publisher: "ICO", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles-a-guide-to-the-data-protection-principles/data-minimisation/", date: "current guidance" },
  { n: 7, title: "Privacy Framework", publisher: "NIST", url: "https://www.nist.gov/privacy-framework", date: "current guidance" },
  { n: 8, title: "VeilChat Temporary Inbox", publisher: "VeilChat", url: "https://www.veilchat.me/temporary-inbox/", date: "product page" },
];

const TOC: BlogTocItem[] = [
  { id: "short-version", label: "The short version" },
  { id: "what-it-is", label: "What a temporary inbox is" },
  { id: "how-it-works", label: "How VeilChat's inbox works" },
  { id: "privacy-boundary", label: "The privacy boundary" },
  { id: "when-to-use", label: "When to use one" },
  { id: "when-not-to-use", label: "When not to use one" },
  { id: "security-checklist", label: "A practical security checklist" },
  { id: "faq", label: "Frequently asked questions" },
];

export function TemporaryInboxBlogPage() {
  const title = "Temporary Email Inbox: Private Verification Without a Permanent Mailbox | VeilChat";
  const description =
    "A practical, privacy-first guide to temporary email inboxes: how they work, when to use them for verification codes, what they protect, what they cannot protect, and how VeilChat automatically deletes addresses and messages after 24 hours.";

  useDocumentMeta({
    title,
    description,
    canonical: "/blog/temporary-inbox",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: `${SEO_SITE_URL}/og-image.png`,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SEO_SITE_URL}/blog/temporary-inbox` },
      author: { "@type": "Organization", name: "VeilChat" },
      publisher: {
        "@type": "Organization",
        name: "VeilChat",
        logo: { "@type": "ImageObject", url: `${SEO_SITE_URL}/icon-512.svg` },
      },
      datePublished: "2026-09-24",
      dateModified: "2026-09-24",
      inLanguage: "en",
    },
  });

  return (
    <BlogLayout
      badge="Privacy guide · Temporary email"
      title={<>A temporary inbox for the one email you need — and nothing you need to keep.</>}
      lead={
        <>
          <p>
            Most websites ask for an email address before they let you try a product,
            download a file, or confirm a new device. That does not mean every website
            needs a permanent line into your real inbox.
          </p>
          <p>
            VeilChat Temporary Mail gives you a private, receive-only address for that
            short moment: copy it, wait for the verification email, read the latest
            message, and move on. The address and message expire automatically after
            24 hours.
          </p>
        </>
      }
      readingMinutes={10}
      toc={TOC}
      sources={SOURCES}
      slug="temporary-inbox"
      related={[
        {
          href: "/blog/messenger-metadata-leaks",
          title: "What metadata your messenger leaks",
          description: "Why privacy is more than keeping message text secret.",
        },
        {
          href: "/blog/messenger-without-phone-number",
          title: "A private messenger without a phone number",
          description: "A practical guide to reducing identity linkage.",
        },
      ]}
    >
      <H2 id="short-version">The short version</H2>
      <P>
        A temporary email inbox is a short-lived receiving address. It is useful when
        you need a one-time verification link or code but do not want to expose your
        everyday address to a service you may never use again. Email itself is not
        end-to-end encrypted by default; SMTP is a delivery protocol, not a promise
        that every mailbox or sender is private. <Cite n={1} />
      </P>
      <Callout title="What VeilChat promises">
        <ul className="list-disc space-y-1 pl-5">
          <li>Receive-only inboxes: you cannot use them to send mail.</li>
          <li>Only the newest successfully received message is retained.</li>
          <li>Active addresses and their message are deleted after 24 hours.</li>
          <li>No payment credentials are collected on the inbox page.</li>
        </ul>
      </Callout>

      <H2 id="what-it-is">What a temporary inbox is</H2>
      <P>
        Think of it as a disposable layer between a website and your real mailbox.
        The address is real enough to receive a code, but it is deliberately poor as
        a long-term identity: it expires, it cannot send replies, and its mailbox is
        designed around one current verification task rather than years of history.
      </P>
      <P>
        That distinction matters. A forwarding alias can remain active for years.
        A secondary mailbox may still accumulate newsletters and password-reset mail.
        A temporary inbox is narrower by design: it minimises the amount of identity
        and history attached to a low-trust signup.
      </P>
      <H3>It is not an anonymous internet passport</H3>
      <P>
        A temporary address does not make you invisible. The website you visit may
        still see your IP address, browser signals, device information, payment
        details, or activity. It may also require a phone number, passkey, or
        identity check. Data minimisation works best when you apply it to the whole
        flow, not just the email field. <Cite n={6} />
      </P>

      <H2 id="how-it-works">How VeilChat's inbox works</H2>
      <ol className="mt-5 list-decimal space-y-3 pl-6">
        <li>
          <strong>Open the inbox page.</strong> Visit{" "}
          <Link className="text-[#2E6F40] underline" to="/temporary-inbox">veilchat.me/temporary-inbox</Link>.
        </li>
        <li>
          <strong>Sign in with Google.</strong> This is used to keep the private
          inbox tied to you without exposing your Google password to VeilChat.
        </li>
        <li>
          <strong>Create an address.</strong> The address is generated for receiving
          mail and is subject to a rolling allowance and an abuse-prevention check.
        </li>
        <li>
          <strong>Use it for the verification email.</strong> Copy the address into
          the service that needs it and wait for the message.
        </li>
        <li>
          <strong>Read the latest email.</strong> The dashboard shows the newest
          message, extracts a verification code when possible, and renders HTML in a
          sandboxed frame.
        </li>
        <li>
          <strong>Leave it behind.</strong> The address and message expire after 24
          hours. A later email replaces the previous message rather than creating a
          permanent inbox history.
        </li>
      </ol>
      <P>
        The service follows the basic shape of internet mail: a sender transfers a
        message through the mail system and the receiving service stores it long
        enough to make it available to the intended recipient. <Cite n={1} /> The
        privacy work happens in the product boundary around that protocol: limited
        retention, receive-only behaviour, scoped access, and a UI that does not
        encourage users to keep a long-lived archive.
      </P>

      <H2 id="privacy-boundary">The privacy boundary</H2>
      <P>
        The useful question is not “Is temporary email private?” in the abstract. It
        is: <em>which piece of information am I trying not to share, with whom, and
        for how long?</em>
      </P>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[620px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-[#0F2A18]/10 bg-white text-[15px]">
          <thead>
            <tr className="bg-[#E8F3E5]/80 text-left text-[#0F2A18]">
              <th className="border-b border-[#0F2A18]/10 px-4 py-3">Question</th>
              <th className="border-b border-[#0F2A18]/10 px-4 py-3">What the inbox helps with</th>
            </tr>
          </thead>
          <tbody className="text-[#28332c]">
            <tr><th className="border-b border-[#0F2A18]/8 px-4 py-3 text-left font-medium">Do I want to avoid exposing my primary email?</th><td className="border-b border-[#0F2A18]/8 px-4 py-3">Yes — use a separate, expiring receiving address.</td></tr>
            <tr className="bg-[#FBF6EE]/60"><th className="border-b border-[#0F2A18]/8 px-4 py-3 text-left font-medium">Do I need to receive a one-time code?</th><td className="border-b border-[#0F2A18]/8 px-4 py-3">Yes — that is the main use case.</td></tr>
            <tr><th className="border-b border-[#0F2A18]/8 px-4 py-3 text-left font-medium">Do I need account recovery next year?</th><td className="border-b border-[#0F2A18]/8 px-4 py-3">No — use a durable mailbox or alias you control.</td></tr>
            <tr className="bg-[#FBF6EE]/60"><th className="px-4 py-3 text-left font-medium">Do I need to hide my network identity?</th><td className="px-4 py-3">No — email address privacy and network privacy are different problems.</td></tr>
          </tbody>
        </table>
      </div>
      <Callout title="Privacy is a system property">
        Reducing one identifier is valuable, but it is not a complete threat model.
        Combine data minimisation with a trusted browser, HTTPS, strong account
        security, and careful decisions about what you put in the email itself.
        NIST describes privacy as a risk-management problem rather than a single
        switch. <Cite n={7} />
      </Callout>

      <H2 id="when-to-use">When a temporary inbox is a good fit</H2>
      <ul className="mt-5 list-disc space-y-3 pl-6">
        <li>Trying a service before deciding whether to create a lasting account.</li>
        <li>Receiving a short-lived login or verification code from a low-trust site.</li>
        <li>Downloading a public resource where a marketing signup is required.</li>
        <li>Testing an email flow in a development or QA environment.</li>
        <li>Separating one-time product experiments from your personal mailbox.</li>
      </ul>
      <P>
        The best use is a low-consequence, short-lived transaction. If you would be
        upset to lose access to the account, the email address is probably not
        temporary: use a mailbox or alias that you can keep and recover.
      </P>

      <H2 id="when-not-to-use">When not to use one</H2>
      <ul className="mt-5 list-disc space-y-3 pl-6">
        <li>Banking, healthcare, government, school, or employment accounts.</li>
        <li>Anything that may need password recovery after the address expires.</li>
        <li>Receipts, warranties, legal notices, travel documents, or tax records.</li>
        <li>Messages containing sensitive personal data that should not enter an email system at all.</li>
        <li>Services whose terms prohibit disposable or temporary addresses.</li>
      </ul>
      <P>
        Do not use a temporary address to evade a safety control, impersonate
        someone, send unsolicited mail, or create accounts in violation of a
        service's rules. The product is for privacy-conscious verification and
        testing, not abuse.
      </P>

      <H2 id="security-checklist">A practical security checklist</H2>
      <H3>Before you create an address</H3>
      <ul className="mt-4 list-disc space-y-2 pl-6">
        <li>Decide whether the account must be recoverable later.</li>
        <li>Check the service's policy on temporary email addresses.</li>
        <li>Use the minimum information the service genuinely needs.</li>
      </ul>
      <H3>When the message arrives</H3>
      <ul className="mt-4 list-disc space-y-2 pl-6">
        <li>Check the sender and destination before clicking a link.</li>
        <li>Never share a verification code with a person who asks for it.</li>
        <li>Be cautious with images, attachments, and external links in HTML mail.</li>
        <li>Do not treat an email code as proof that the sender is trustworthy.</li>
      </ul>
      <H3>After you finish</H3>
      <ul className="mt-4 list-disc space-y-2 pl-6">
        <li>Close the site session and remove any downloaded sensitive files.</li>
        <li>Use a password manager for accounts you intend to keep.</li>
        <li>Turn on a passkey or multi-factor authentication where appropriate.</li>
      </ul>
      <P>
        Authentication guidance consistently treats a one-time code as only one
        component of an account's security. It does not replace a strong password,
        phishing-resistant authentication, or a recovery plan. <Cite n={5} />
      </P>

      <H2 id="faq">Frequently asked questions</H2>
      <H3>Can I send email from the temporary inbox?</H3>
      <P>
        No. VeilChat's temporary inbox is receive-only. That keeps the product
        focused on verification and prevents it from becoming a disposable sending
        identity.
      </P>
      <H3>How long does the address last?</H3>
      <P>
        Active addresses and their latest received message are designed to expire
        after 24 hours. Check the live product page for the current policy and
        remaining time. <Cite n={8} />
      </P>
      <H3>Does it keep every email I receive?</H3>
      <P>
        No. The inbox is intentionally latest-message-only. If a sender sends a
        second code, the newest message is the one that remains visible. That is
        useful for verification and avoids building a permanent message archive.
      </P>
      <H3>Can I use it for a private conversation?</H3>
      <P>
        No. Email is not the right place for a sensitive conversation. Use a
        purpose-built end-to-end encrypted messenger for private communication, and
        use the temporary inbox only for the short verification step it is designed
        to handle.
      </P>
      <H3>Why is Google sign-in required?</H3>
      <P>
        The inbox needs an account boundary so one person cannot freely enumerate or
        read another person's addresses. Google sign-in is used as the access
        mechanism; VeilChat does not ask for your Google password on the product
        page. It is still wise to review the permissions and account security on
        every identity provider you use.
      </P>

      <Callout title="Ready to use it?">
        <p>
          Open the{" "}
          <Link className="font-semibold text-[#2E6F40] underline" to="/temporary-inbox">
            VeilChat Temporary Inbox
          </Link>
          {" "}when you need one verification email without turning your everyday
          mailbox into a permanent record.
        </p>
      </Callout>
    </BlogLayout>
  );
}