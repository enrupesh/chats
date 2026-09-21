import { Link } from "react-router-dom";

const waitlistHref = "/waitlist";

export function WaitlistMiniLink({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Link
      to={waitlistHref}
      className={
        "inline-flex items-center gap-1.5 text-[12px] font-semibold text-wa-green " +
        "hover:text-wa-green-dark hover:underline underline-offset-4 transition-colors " +
        className
      }
      aria-label="Join the VeilChat launch waitlist"
    >
      <span aria-hidden>✦</span>
      <span>Join the launch waitlist</span>
    </Link>
  );
}

export function WaitlistPromoCard({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-5 sm:p-6 " +
        (dark
          ? "border-white/15 bg-white/[0.07] text-white"
          : "border-[#2E6F40]/15 bg-[#E8F3E5]/65 text-[#0F2A18]") +
        " " +
        className
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div
            className={
              "text-[11px] font-bold uppercase tracking-[0.16em] " +
              (dark ? "text-white/65" : "text-[#2E6F40]")
            }
          >
            Founder launch
          </div>
          <h2
            className={
              "mt-1.5 text-[20px] font-semibold tracking-tight " +
              (dark ? "text-white" : "text-[#0F2A18]")
            }
          >
            Be first to hear when VeilChat email launches.
          </h2>
          <p
            className={
              "mt-1.5 text-[14px] leading-relaxed " +
              (dark ? "text-white/75" : "text-[#28332c]/75")
            }
          >
            Join the private launch room for $1 custom-domain email and founder
            updates.
          </p>
        </div>
        <Link
          to={waitlistHref}
          className={
            "inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors " +
            (dark
              ? "bg-white text-[#1F4F2D] hover:bg-white/90"
              : "bg-[#2E6F40] text-white hover:bg-[#1F4F2D]")
          }
        >
          Join the waitlist →
        </Link>
      </div>
    </div>
  );
}