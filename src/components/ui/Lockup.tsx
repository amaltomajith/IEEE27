import { forwardRef } from "react";
import { site } from "@/content/site";
import { keep } from "@/lib/keep";

// Only the type size changes between sizes; rule, padding and leading are in em, so all three read as one mark.
const SIZES = {
  hero: { box: "text-[clamp(26px,2.6vw,46px)] max-md:max-w-[66vw]", wrap: "md:whitespace-nowrap", br: "max-md:hidden", host: "text-[clamp(12px,0.95vw,15px)] tracking-[0.16em]" },
  nav: { box: "text-[clamp(13.5px,1.22vw,19px)]", wrap: "whitespace-nowrap", br: "", host: "" },
  footer: { box: "text-[clamp(30px,5.2vw,100px)]", wrap: "md:whitespace-nowrap", br: "", host: "text-[clamp(11px,0.95vw,16px)] tracking-[0.18em]" },
} as const;

/**
 * The conference name as one block: gold rule, "International Interdisciplinary / Conference 2027",
 * optional host line. `masked` sets each line in a .line-mask and draws the rule in, so the block
 * reveals the way the site's headings do whenever an ancestor (or the block itself) gets `is-in`.
 */
export const ConferenceLockup = forwardRef<
  HTMLDivElement,
  { size: keyof typeof SIZES; host?: boolean; masked?: boolean; className?: string }
>(function ConferenceLockup({ size, host = false, masked = false, className = "" }, ref) {
  const s = SIZES[size];
  const year = <span className="text-brand-ink [font-variant-numeric:lining-nums]">2027</span>;
  return (
    <div ref={ref} className={`relative pl-[0.5em] ${masked ? "" : "border-l-[0.045em] border-gold"} ${s.box} ${className}`}>
      {masked && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[0.045em] min-w-px origin-top scale-y-0 bg-gold transition-transform duration-[0.9s] [transition-timing-function:var(--ease-out)] in-[.is-in]:scale-y-100"
        />
      )}
      <p className={`font-display text-[1em] leading-[1.05] font-semibold tracking-[-0.01em] ${s.wrap}`}>
        {masked ? (
          <>
            <span className="line-mask">
              <span>International Interdisciplinary</span>
            </span>
            <span className="line-mask">
              <span>Conference {year}</span>
            </span>
          </>
        ) : (
          <>
            International Interdisciplinary <br className={s.br} />
            Conference {year}
          </>
        )}
      </p>
      {host && (
        <p className={`mt-[0.75em] leading-snug font-semibold text-gold uppercase ${masked ? "fade-up [transition-delay:0.2s]" : ""} ${s.host}`}>
          {keep(`${site.host}, ${site.campus}`)}
        </p>
      )}
    </div>
  );
});
