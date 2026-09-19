import { useMemo, useState } from "react";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../lib/store";

type Step = "country" | "device" | "source" | "goal";
type Device = "mobile" | "tablet" | "laptop" | "desktop" | "other";
type Source =
  | "search"
  | "social"
  | "friend"
  | "website"
  | "advertisement"
  | "app_store"
  | "other";
type Goal = "private_messaging" | "switching" | "groups" | "exploring" | "other";

const steps: Step[] = ["country", "device", "source", "goal"];

const deviceOptions: Array<{ value: Device; label: string; detail: string; icon: string }> = [
  { value: "mobile", label: "Mobile phone", detail: "iPhone or Android", icon: "▯" },
  { value: "tablet", label: "Tablet", detail: "iPad or Android tablet", icon: "▭" },
  { value: "laptop", label: "Laptop", detail: "MacBook or Windows laptop", icon: "⌁" },
  { value: "desktop", label: "Desktop", detail: "A larger screen at a desk", icon: "▣" },
  { value: "other", label: "Something else", detail: "Another kind of device", icon: "✦" },
];

const sourceOptions: Array<{ value: Source; label: string; icon: string }> = [
  { value: "search", label: "Google or another search", icon: "⌕" },
  { value: "social", label: "Social media", icon: "◎" },
  { value: "friend", label: "A friend or colleague", icon: "♡" },
  { value: "website", label: "A website or blog", icon: "◌" },
  { value: "advertisement", label: "An advertisement", icon: "↗" },
  { value: "app_store", label: "An app store", icon: "▤" },
  { value: "other", label: "Somewhere else", icon: "✦" },
];

const goalOptions: Array<{ value: Goal; label: string; detail: string }> = [
  { value: "private_messaging", label: "A more private way to message", detail: "Privacy comes first" },
  { value: "switching", label: "A thoughtful alternative to my current app", detail: "I’m comparing options" },
  { value: "groups", label: "Private groups with people I trust", detail: "Friends, family, or teams" },
  { value: "exploring", label: "I’m just exploring", detail: "Show me what VeilChat can do" },
  { value: "other", label: "Something else", detail: "I have another reason" },
];

function getCountries(): Array<{ code: string; label: string }> {
  // Intl.DisplayNames can label regions, but there is no standard
  // Intl.supportedValuesOf("region") key. Keep the ISO list explicit so the
  // country picker works consistently across browsers and native WebViews.
  const codes = `
    AC AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
    BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
    CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
    DE DJ DK DM DO DZ
    EC EE EG EH ER ES ET
    FI FJ FK FM FO FR
    GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
    HK HM HN HR HT HU
    ID IE IL IM IN IO IQ IR IS IT
    JE JM JO JP
    KE KG KH KI KM KN KP KR KW KY KZ
    LA LB LC LI LK LR LS LT LU LV LY
    MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
    NA NC NE NF NG NI NL NO NP NR NU NZ
    OM
    PA PE PF PG PH PK PL PM PN PR PS PT PW PY
    QA
    RE RO RS RU RW
    SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
    TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
    UA UG UM US UY UZ
    VA VC VE VG VI VN VU
    WF WS
    YE YT
    ZA ZM ZW
  `.trim().split(/\s+/);
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return codes
    .map((code) => ({ code, label: names.of(code) ?? code }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function OnboardingSurveyModal() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = trpc.me.onboardingSurvey.useQuery(undefined, {
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: Infinity,
  });
  const submit = trpc.me.submitOnboardingSurvey.useMutation();
  const countries = useMemo(getCountries, []);
  const [step, setStep] = useState<Step>("country");
  const [countryCode, setCountryCode] = useState("");
  const [device, setDevice] = useState<Device>();
  const [source, setSource] = useState<Source>();
  const [goal, setGoal] = useState<Goal>();
  const [search, setSearch] = useState("");
  const [closed, setClosed] = useState(false);

  if (!accessToken || !status.data || status.data.completed || closed) return null;

  const stepIndex = steps.indexOf(step);
  const filteredCountries = countries.filter((country) =>
    country.label.toLowerCase().includes(search.toLowerCase()),
  );
  const canContinue =
    step === "country"
      ? Boolean(countryCode)
      : step === "device"
        ? Boolean(device)
        : step === "source"
          ? Boolean(source)
          : Boolean(goal);

  function next() {
    if (!canContinue) return;
    if (stepIndex === steps.length - 1) {
      void submit.mutateAsync({ countryCode, device, source, goal }).then(() => {
        setClosed(true);
      });
      return;
    }
    const nextStep = steps[stepIndex + 1];
    if (nextStep) setStep(nextStep);
  }

  function skip() {
    void submit.mutateAsync({ skipped: true }).then(() => setClosed(true));
  }

  const heading =
    step === "country"
      ? "Where are you joining from?"
      : step === "device"
        ? "What do you use VeilChat on?"
        : step === "source"
          ? "How did you find VeilChat?"
          : "What brings you here?";

  const subheading =
    step === "country"
      ? "This helps us understand where our community is growing."
      : step === "device"
        ? "We’ll use this to prioritize the best experience for you."
        : step === "source"
          ? "One tap is enough. No personal details needed."
          : "This helps us keep VeilChat focused on what matters.";

  return (
    <div className="veil-survey-backdrop" role="presentation">
      <section
        className="veil-survey-modal veil-soft-pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-title"
      >
        <div className="veil-survey-topline">
          <span className="veil-survey-brand"><span>✦</span> VeilChat</span>
          <span className="veil-survey-step">Step {stepIndex + 1} of {steps.length}</span>
        </div>

        <div className="veil-survey-progress" aria-hidden="true">
          {steps.map((item, index) => (
            <span key={item} className={index <= stepIndex ? "is-active" : ""} />
          ))}
        </div>

        <div className="veil-survey-heading">
          <p className="veil-survey-eyebrow">A quick welcome question</p>
          <h2 id="survey-title">{heading}</h2>
          <p>{subheading}</p>
        </div>

        {step === "country" && (
          <div className="veil-survey-country">
            <label htmlFor="survey-country-search">Choose your country</label>
            <input
              id="survey-country-search"
              className="veil-survey-search veil-focus-ring"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search countries..."
              autoFocus
            />
            <div className="veil-survey-country-list" role="listbox" aria-label="Countries">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={`veil-survey-country-option ${countryCode === country.code ? "is-selected" : ""}`}
                  onClick={() => setCountryCode(country.code)}
                  role="option"
                  aria-selected={countryCode === country.code}
                >
                  <span>{country.label}</span>
                  <small>{country.code}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "device" && (
          <div className="veil-survey-options">
            {deviceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`veil-survey-option ${device === option.value ? "is-selected" : ""}`}
                onClick={() => setDevice(option.value)}
              >
                <span className="veil-survey-option-icon">{option.icon}</span>
                <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                <span className="veil-survey-check" aria-hidden="true">✓</span>
              </button>
            ))}
          </div>
        )}

        {step === "source" && (
          <div className="veil-survey-source-grid">
            {sourceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`veil-survey-source ${source === option.value ? "is-selected" : ""}`}
                onClick={() => setSource(option.value)}
              >
                <span>{option.icon}</span>
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>
        )}

        {step === "goal" && (
          <div className="veil-survey-options">
            {goalOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`veil-survey-option ${goal === option.value ? "is-selected" : ""}`}
                onClick={() => setGoal(option.value)}
              >
                <span className="veil-survey-option-icon">✦</span>
                <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                <span className="veil-survey-check" aria-hidden="true">✓</span>
              </button>
            ))}
          </div>
        )}

        {submit.error && (
          <p className="veil-survey-error" role="alert">
            We couldn’t save that just yet. Please try again.
          </p>
        )}

        <div className="veil-survey-actions">
          <button type="button" className="veil-survey-skip" onClick={skip} disabled={submit.isPending}>
            Not now
          </button>
          <button
            type="button"
            className="veil-survey-continue"
            onClick={next}
            disabled={!canContinue || submit.isPending}
          >
            {submit.isPending ? "Saving..." : stepIndex === steps.length - 1 ? "Finish" : "Continue"}
            {!submit.isPending && <span aria-hidden="true">→</span>}
          </button>
        </div>
        <p className="veil-survey-footnote">Your answers are used only to improve VeilChat.</p>
      </section>
    </div>
  );
}