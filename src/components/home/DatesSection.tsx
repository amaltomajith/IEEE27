import { DatesTimeline } from "@/components/pages/DatesTimeline";
import { NextDeadline } from "@/components/ui/NextDeadline";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";

export function DatesSection() {
  return (
    <section className="wrap grid gap-[clamp(40px,6vw,120px)] py-[clamp(80px,10vw,170px)] lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <Reveal className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
          <h2 className="t-h2 fade-up max-w-[12ch]">
            From abstract to <span className="em">Bengaluru</span>
          </h2>
          <div className="fade-up mt-8 inline-flex items-start gap-3 rounded-[var(--radius-m)] bg-white px-5 py-4 ring-1 ring-cocoa/5">
            <span className="relative mt-2 flex size-2.5 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-wine opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-wine" />
            </span>
            <NextDeadline />
          </div>
          <div className="fade-up mt-8">
            <PillButton href="/important-dates/" variant="ghost">All dates</PillButton>
          </div>
        </Reveal>
      </div>
      <DatesTimeline />
    </section>
  );
}
