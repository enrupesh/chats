import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorMessage, Logo, PrimaryButton, SecondaryButton } from "../components/Layout";
import { getApiBaseUrl } from "../lib/apiBase";
import { useAuthStore } from "../lib/store";
import { trpc } from "../lib/trpc";
import { useDocumentMeta } from "../lib/useDocumentMeta";

type DonationForm = {
  name: string;
  location: string;
  contact: string;
  contactMethod: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  note: string;
};

const initialForm: DonationForm = {
  name: "",
  location: "",
  contact: "",
  contactMethod: "Email",
  amount: "",
  currency: "USD",
  paymentMethod: "UPI",
  note: "",
};

export function DonatePage() {
  useDocumentMeta({
    title: "Support VeilChat",
    description: "Donate to help keep VeilChat private, open, and accessible.",
    noindex: false,
  });
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = trpc.me.get.useQuery(undefined, {
    enabled: !!accessToken,
    retry: false,
  });
  const [form, setForm] = useState<DonationForm>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof DonationForm>(key: K, value: DonationForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (
      form.contactMethod === "VeilChat" &&
      !form.contact &&
      meQuery.data?.username
    ) {
      update("contact", meQuery.data.username);
    }
  }, [form.contact, form.contactMethod, meQuery.data?.username]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          location: form.location.trim(),
          contact: form.contact.trim(),
          contactMethod: form.contactMethod,
          amount: form.amount.trim(),
          currency: form.currency.trim().toUpperCase(),
          paymentMethod: form.paymentMethod,
          note: form.note.trim(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload?.error || "We couldn't save your request. Please try again.");
      }
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FCF5EB] text-[#111B21]">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="Back to VeilChat home">
            <Logo />
          </Link>
          <Link
            to="/"
            className="rounded-full border border-[#253D2C]/15 px-4 py-2 text-sm font-semibold text-[#253D2C] transition hover:bg-white/60"
          >
            Back to VeilChat
          </Link>
        </header>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <section className="rounded-3xl bg-[#253D2C] p-7 text-[#FCF5EB] shadow-[0_18px_50px_rgba(37,61,44,0.2)] sm:p-10">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#9DDBAA]/25 bg-[#9DDBAA]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#BFEAC7]">
              <span className="size-1.5 rounded-full bg-[#9DDBAA]" />
              Support private communication
            </div>
            <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Help VeilChat stay free, calm, and private.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#FCF5EB]/75">
              VeilChat is built for people who believe their conversations
              should belong to them. Your support helps us keep the app
              independent, improve security, and make private messaging
              available to more people.
            </p>

            <div className="mt-10 rounded-2xl border border-[#9DDBAA]/20 bg-[#9DDBAA]/10 p-5">
              <div className="text-3xl font-bold tracking-tight text-white">
                5,09,882
              </div>
              <div className="mt-1 text-sm text-[#BFEAC7]">
                people have donated
              </div>
            </div>

            <p className="mt-8 text-sm leading-relaxed text-[#FCF5EB]/65">
              Your contribution does not go toward unnecessary luxuries. It
              goes back into hosting, security reviews, accessibility, and
              making this site better for the people who use it.
            </p>
          </section>

          <section className="rounded-3xl border border-[#253D2C]/10 bg-white p-6 shadow-[0_10px_35px_rgba(37,61,44,0.08)] sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2E6F40]">
                Donation interest
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Tell us how you would like to help
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#253D2C]/60">
                We’ll contact you with the next steps. This form does not ask
                for card numbers, CVV, UPI PINs, passwords, or other payment
                credentials.
              </p>
            </div>

            <form className="mt-7 space-y-4" onSubmit={(e) => void submit(e)}>
              <Field label="Your name" required>
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  maxLength={120}
                  placeholder="What should we call you?"
                  className="donate-input"
                />
              </Field>
              <Field label="Location" required>
                <input
                  required
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  maxLength={120}
                  placeholder="City, state or country"
                  className="donate-input"
                />
              </Field>
              <Field label="How can our team contact you?" required>
                <select
                  required
                  value={form.contactMethod}
                  onChange={(e) => {
                    update("contactMethod", e.target.value);
                    update("contact", "");
                  }}
                  className="donate-input"
                >
                  <option>Email</option>
                  <option>Phone</option>
                  <option>VeilChat</option>
                </select>
              </Field>
              <Field
                label={
                  form.contactMethod === "Email"
                    ? "Email address"
                    : form.contactMethod === "Phone"
                      ? "Phone number"
                      : "VeilChat username"
                }
                required
              >
                <input
                  required
                  type={
                    form.contactMethod === "Email"
                      ? "email"
                      : form.contactMethod === "Phone"
                        ? "tel"
                        : "text"
                  }
                  value={form.contact}
                  onChange={(e) => update("contact", e.target.value)}
                  maxLength={160}
                  autoComplete={
                    form.contactMethod === "Email"
                      ? "email"
                      : form.contactMethod === "Phone"
                        ? "tel"
                        : "username"
                  }
                  placeholder={
                    form.contactMethod === "Email"
                      ? "you@example.com"
                      : form.contactMethod === "Phone"
                        ? "+1 555 123 4567"
                        : meQuery.data?.username
                           ? "Your VeilChat username"
                           : "Enter your VeilChat username"
                  }
                  className="donate-input"
                />
                {form.contactMethod === "VeilChat" && (
                  <span className="mt-1.5 block text-xs font-normal text-[#253D2C]/55">
                    {meQuery.data?.username
                      ? "Your username was filled from your account. You can edit it."
                      : "If you are not signed in, enter your username manually."}
                  </span>
                )}
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Intended amount" required>
                  <input
                    required
                    inputMode="numeric"
                    value={form.amount}
                    onChange={(e) => update("amount", e.target.value)}
                    maxLength={10}
                    placeholder="e.g. 500"
                    className="donate-input"
                  />
                </Field>
                <Field label="Currency" required>
                  <input
                    required
                    value={form.currency}
                    onChange={(e) =>
                      update("currency", e.target.value.replace(/[^a-z]/gi, "").toUpperCase())
                    }
                    maxLength={10}
                    pattern="[A-Z]{3,10}"
                    title="Enter a currency code such as USD, EUR, or INR."
                    placeholder="USD"
                    className="donate-input"
                  />
                </Field>
                <Field label="Preferred method" required>
                  <select
                    required
                    value={form.paymentMethod}
                    onChange={(e) => update("paymentMethod", e.target.value)}
                    className="donate-input"
                  >
                    <option>UPI</option>
                    <option>Bank transfer</option>
                    <option>Card checkout</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>
              <Field label="Anything you would like us to know">
                <textarea
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Optional message"
                  className="donate-input resize-none"
                />
              </Field>

              <ErrorMessage>{error}</ErrorMessage>
              <PrimaryButton loading={busy} type="submit">
                Send donation details
              </PrimaryButton>
            </form>
          </section>
        </div>
      </div>

      {submitted && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#111B21]/65 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donation-success-title"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#E5F3E7] text-2xl">
              ♥
            </div>
            <h2 id="donation-success-title" className="mt-5 text-2xl font-semibold">
              Thank you
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#253D2C]/65">
              Our team will contact you soon.
            </p>
            <SecondaryButton className="mt-6 w-full" onClick={() => setSubmitted(false)}>
              Done
            </SecondaryButton>
          </div>
        </div>
      )}

      <style>{`
        .donate-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(37,61,44,0.14);
          background: #FCF5EB;
          padding: 0.7rem 0.85rem;
          color: #111B21;
          outline: none;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .donate-input:focus {
          border-color: #2E6F40;
          box-shadow: 0 0 0 3px rgba(46,111,64,0.12);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-[#253D2C]">
      {label}
      {required && <span className="ml-1 text-[#2E6F40]">*</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}