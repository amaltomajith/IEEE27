import { Plus } from "@phosphor-icons/react/dist/ssr";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { MailLink } from "@/components/ui/MailLink";
import { Ribbon } from "@/components/ui/Ribbon";

export function Faq() {
  return (
    <section className="wrap relative grid gap-[clamp(32px,5vw,96px)] py-[clamp(80px,10vw,170px)] lg:grid-cols-[0.8fr_1.2fr]">
      <Ribbon shape="sweep" flip className="bottom-[-2%] right-[-9%] h-[58%] max-lg:hidden" />
      <div className="relative z-[1]">
        <Reveal className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
          <h2 className="t-h2 fade-up max-w-[11ch]">
            Questions, <span className="em">Answered</span>
          </h2>
          <p className="fade-up mt-6 max-w-[34ch] text-muted">
            Not covered here? Write to
            <MailLink to={site.email} className="mt-1 block w-fit text-ink underline decoration-brand decoration-2 underline-offset-4">
              {site.email}
            </MailLink>
          </p>
        </Reveal>
      </div>
      <div className="relative z-[1] space-y-2">
        {faq.map((f) => (
          <details key={f.q} className="group rounded-[var(--radius-m)] bg-white ring-1 ring-ink/5 open:ring-brand/60">
            <summary className="flex items-center justify-between gap-6 p-[clamp(18px,1.8vw,28px)] font-display font-semibold text-[clamp(21px,1.6vw,27px)] leading-snug">
              {f.q}
              <span className="faq-icon grid size-10 shrink-0 place-items-center rounded-full bg-gray transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-open:bg-brand group-open:text-paper">
                <Plus size={18} weight="bold" />
              </span>
            </summary>
            <p className="max-w-[60ch] px-[clamp(18px,1.8vw,28px)] pb-[clamp(18px,1.8vw,28px)] text-ink/75">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
