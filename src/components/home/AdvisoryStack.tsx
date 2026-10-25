import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { advisory } from "@/content/committee";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { Ribbon } from "@/components/ui/Ribbon";
import { Phrases } from "@/components/ui/Phrases";

const intl = advisory.find((g) => g.scope === "International")!.members;

/** Sticky stack: each card pins a little lower than the last, so they pile up as you scroll. */
export function AdvisoryStack() {
  return (
    <section className="tint-b relative py-[clamp(80px,10vw,170px)] text-ink">
      <Ribbon shape="hook" flip className="top-[12%] right-[-7%] h-[52%] max-lg:hidden" />
      <div className="wrap relative z-[1] grid gap-[clamp(40px,5vw,96px)] lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Reveal className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            <h2 className="t-h2 fade-up max-w-[13ch]">
              Guided by an International <span className="em text-brand-ink">Board</span>
            </h2>
            <p className="fade-up mt-6 max-w-[38ch] text-muted">
              Advisors in psychology, business and engineering from the United States, South Africa and Uganda.
            </p>
            <div className="fade-up mt-8">
              <PillButton href="/committee/advisory/" variant="ghost">Full Advisory Board</PillButton>
            </div>
          </Reveal>
        </div>
        <ul className="relative">
          {intl.map((m, i) => (
            <li key={m.name} className="sticky pb-4" style={{ top: `calc(var(--header-h) + 24px + ${i * 14}px)` }}>
              <article className="flex min-h-[clamp(220px,26vh,300px)] flex-col justify-between gap-8 rounded-[var(--radius-l)] bg-paper p-[clamp(22px,2.4vw,40px)] shadow-[0_-24px_60px_-34px_rgb(10_26_64/0.22)] ring-1 ring-ink/[0.06]">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-muted"><Phrases parts={[m.place]} /></span>
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} profile`} className="grid size-11 place-items-center rounded-full bg-ink/[0.05] text-brand-ink transition hover:rotate-45 hover:bg-brand hover:text-paper">
                      <ArrowUpRight size={18} weight="bold" />
                    </a>
                  )}
                </div>
                <div>
                  <h3 className="t-h3">{m.name}</h3>
                  <p className="mt-2 max-w-[48ch] text-muted"><Phrases parts={[m.role, m.org]} /></p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
