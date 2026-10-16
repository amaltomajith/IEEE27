import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { advisory } from "@/content/committee";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";

const intl = advisory.find((g) => g.scope === "International")!.members;

/** Sticky stack: each card pins a little lower than the last, so they pile up as you scroll. */
export function AdvisoryStack() {
  return (
    <section data-header="dark" className="glow-bottom relative bg-navy py-[clamp(80px,10vw,170px)] text-white">
      <div className="wrap grid gap-[clamp(40px,5vw,96px)] lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Reveal className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            <h2 className="t-h2 fade-up max-w-[13ch]">
              Guided by an international <span className="em text-signal">board</span>
            </h2>
            <p className="fade-up mt-6 max-w-[38ch] text-white/65">
              Advisors in psychology, business and engineering from the United States, South Africa and Uganda.
            </p>
            <div className="fade-up mt-8">
              <PillButton href="/committee/advisory/" variant="ghost-dark">Full advisory board</PillButton>
            </div>
          </Reveal>
        </div>
        <ul className="relative">
          {intl.map((m, i) => (
            <li key={m.name} className="sticky pb-4" style={{ top: `calc(var(--header-h) + 24px + ${i * 14}px)` }}>
              <article className="flex min-h-[clamp(220px,26vh,300px)] flex-col justify-between gap-8 rounded-[var(--radius-l)] bg-navy-2 p-[clamp(22px,2.4vw,40px)] shadow-[0_-24px_60px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-muted-dark">{m.place}</span>
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} profile`} className="grid size-11 place-items-center rounded-full bg-white/10 text-signal transition hover:rotate-45 hover:bg-signal hover:text-navy">
                      <ArrowUpRight size={18} weight="bold" />
                    </a>
                  )}
                </div>
                <div>
                  <h3 className="t-h3">{m.name}</h3>
                  <p className="mt-2 max-w-[48ch] text-white/65">{[m.role, m.org].filter(Boolean).join(", ")}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
