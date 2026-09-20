import { useState } from "react";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../lib/store";

type Device = "mobile" | "tablet" | "laptop" | "desktop" | "other";

const deviceOptions: Array<{ value: Device; label: string; detail: string; icon: string }> = [
  { value: "mobile", label: "Mobile phone", detail: "iPhone or Android", icon: "▯" },
  { value: "tablet", label: "Tablet", detail: "iPad or Android tablet", icon: "▭" },
  { value: "laptop", label: "Laptop", detail: "MacBook or Windows laptop", icon: "⌁" },
  { value: "desktop", label: "Desktop", detail: "A larger screen at a desk", icon: "▣" },
  { value: "other", label: "Something else", detail: "Another kind of device", icon: "✦" },
];

export function OnboardingSurveyModal() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = trpc.me.onboardingSurvey.useQuery(undefined, {
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: Infinity,
  });
  const utils = trpc.useUtils();
  const submit = trpc.me.submitOnboardingSurvey.useMutation({
    onSuccess: () => {
      void utils.me.onboardingSurvey.invalidate();
    },
  });
  const [device, setDevice] = useState<Device>();

  if (!accessToken || !status.data || status.data.completed) return null;

  const canContinue = Boolean(device);

  function next() {
    if (!device) return;
    void submit.mutateAsync({ device });
  }

  return (
    <div className="veil-survey-backdrop" role="presentation">
      <section
        className="veil-survey-modal veil-soft-pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-title"
        aria-describedby="survey-description"
      >
        <div className="veil-survey-topline">
          <span className="veil-survey-brand"><span>✦</span> VeilChat</span>
          <span className="veil-survey-step">1 question</span>
        </div>

        <div className="veil-survey-progress" aria-hidden="true">
          <span className="is-active" />
        </div>

        <div className="veil-survey-heading">
          <p className="veil-survey-eyebrow">A quick welcome question</p>
          <h2 id="survey-title">Which device are you using?</h2>
          <p id="survey-description">This helps us prioritize the best VeilChat experience for you.</p>
        </div>

        <div className="veil-survey-options" role="radiogroup" aria-label="Devices">
          {deviceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`veil-survey-option ${device === option.value ? "is-selected" : ""}`}
              onClick={() => setDevice(option.value)}
              role="radio"
              aria-checked={device === option.value}
            >
              <span className="veil-survey-option-icon">{option.icon}</span>
              <span><strong>{option.label}</strong><small>{option.detail}</small></span>
              <span className="veil-survey-check" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>

        {submit.error && (
          <p className="veil-survey-error" role="alert">
            We couldn’t save that just yet. Please try again.
          </p>
        )}

        <div className="veil-survey-actions">
          <button
            type="button"
            className="veil-survey-continue"
            onClick={next}
            disabled={!canContinue || submit.isPending}
          >
            {submit.isPending ? "Saving..." : "Continue"}
            {!submit.isPending && <span aria-hidden="true">→</span>}
          </button>
        </div>
        <p className="veil-survey-footnote">
          Choose one to continue. Your answer is used only to improve VeilChat.
        </p>
      </section>
    </div>
  );
}