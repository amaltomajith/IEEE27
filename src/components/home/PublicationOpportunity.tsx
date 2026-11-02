import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { publication } from "@/content/publication";

const { partner, specialIssue, charges } = publication;

// "Cross-Domain" never splits at its hyphen.
const [titleStart, titleEnd] = specialIssue.title.split("Cross-Domain");

const amount = "font-display leading-none font-semibold [font-variant-numeric:lining-nums]";

/** The Scopus route, a main reason to submit: the journal beside what it costs, in the same tiles the fee pages use. */
export function PublicationOpportunity() {
  return (
    <section className="wrap pt-[clamp(80px,10vw,170px)]">
      <Reveal>
        <h2 className="t-h2 fade-up">
          Scopus-Indexed Publication <span className="em">Opportunity</span>
        </h2>
        <p className="fade-up mt-5 max-w-[52ch] text-muted">{publication.homeNote}</p>
      </Reveal>

      <Reveal className="mt-[clamp(28px,3.4vw,48px)] grid gap-3 lg:grid-cols-12">
        <article className="fade-up glow-bottom flex flex-col justify-between gap-[clamp(24px,2.2vw,36px)] overflow-hidden rounded-[var(--radius-l)] bg-brand-soft p-[clamp(24px,2.6vw,44px)] lg:col-span-7">
          <div className="flex items-center gap-[clamp(16px,2.4vw,40px)]">
            <Image src={partner.logo} alt={partner.logoAlt} width={689} height={689} sizes="168px" className="size-[clamp(84px,9vw,168px)] shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-muted">Publication Partner</p>
              <h3 className="mt-2 font-display text-[clamp(28px,3vw,52px)] leading-[1.08] font-semibold tracking-[-0.01em]">
                {partner.journal} <span className="em">({partner.abbr})</span>
              </h3>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <a
                  href={partner.scopus}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-brand py-1.5 pr-3 pl-3.5 font-medium text-paper transition-colors hover:bg-brand-deep"
                >
                  Scopus Indexed
                  <ArrowUpRight size={14} weight="bold" className="transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-45" />
                </a>
                <span className="rounded-full bg-white px-3.5 py-1.5 text-ink/80 ring-1 ring-ink/[0.06]">Open Access</span>
              </div>
            </div>
          </div>
          <div className="border-t border-ink/10 pt-[clamp(16px,1.8vw,24px)]">
            <p className="text-sm text-muted">Special Issue</p>
            <p className="mt-1 font-display text-[clamp(23px,1.9vw,32px)] leading-[1.15] font-semibold [text-wrap:balance]">
              {titleStart}
              <span className="whitespace-nowrap">Cross-Domain</span>
              {titleEnd}
            </p>
          </div>
        </article>

        <article className="fade-up flex flex-col gap-[clamp(18px,1.5vw,24px)] rounded-[var(--radius-l)] bg-white p-[clamp(24px,2.6vw,44px)] ring-1 ring-ink/5 lg:col-span-5">
          <div>
            <p className="font-medium text-ink/75">{charges.apc.label}</p>
            <p className={`${amount} mt-4 text-[clamp(52px,4.6vw,80px)] text-brand-deep`}>{charges.apc.amount}</p>
            <p className="mt-3 text-ink/75">{charges.apc.approx} {charges.apc.unit}</p>
          </div>
          <div className="border-t border-ink/10 pt-[clamp(16px,1.8vw,24px)]">
            <p className="text-sm text-muted">{charges.latex.label}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
              <span className={`${amount} text-[clamp(26px,2.3vw,38px)]`}>{charges.latex.amount}</span>
              <span className="text-sm text-ink/75">{charges.latex.extra} ({charges.latex.unit})</span>
            </p>
          </div>
          <div className="mt-auto">
            <PillButton href="/publication/" variant="brand">Publication Details</PillButton>
          </div>
        </article>
      </Reveal>
    </section>
  );
}
