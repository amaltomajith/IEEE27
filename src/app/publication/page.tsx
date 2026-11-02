import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { publication } from "@/content/publication";
import { site } from "@/content/site";
import { MailLink } from "@/components/ui/MailLink";
import { EmailText } from "@/components/ui/EmailText";
import { Phrases } from "@/components/ui/Phrases";

export const metadata: Metadata = { title: "Publication", description: publication.description };

const { partner, specialIssue, charges, chair } = publication;

// "Cross-Domain" never splits at its hyphen.
const [before, after] = specialIssue.title.split("Cross-Domain");

const amount = "font-display leading-none font-semibold [font-variant-numeric:lining-nums]";

export default function PublicationPage() {
  return (
    <>
      <PageHero title={publication.title} emphasis="Open Access" crumbs={[{ label: "Publication" }]} />

      {/* The partner: the journal's seal beside the announcement, with the two places to check it. */}
      <section className="wrap pb-3">
        <Reveal>
          <div className="fade-up grid overflow-hidden rounded-[var(--radius-l)] bg-white ring-1 ring-ink/5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <div className="glow-bottom grid place-items-center bg-brand-soft p-[clamp(28px,4vw,72px)]">
              <Image src={partner.logo} alt={partner.logoAlt} width={689} height={689} sizes="(min-width:1024px) 24vw, 56vw" className="aspect-square w-[min(56vw,260px)] lg:w-[clamp(220px,20vw,320px)]" />
            </div>
            <div className="flex flex-col justify-center gap-8 p-[clamp(24px,4vw,72px)]">
              <div>
                <p className="font-medium text-amber-ink">Publication Partner</p>
                <h2 className="t-h2 mt-3 max-w-[18ch]">
                  {partner.journal} <span className="em">({partner.abbr})</span>
                </h2>
                <p className="mt-5 max-w-[52ch] text-[clamp(18px,1.3vw,22px)] leading-[1.55] text-ink/80">
                  We are pleased to recognize Scopus Indexed Journal {partner.journal} ({partner.abbr}) as the Publication Partner for IIC 2027.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
                <PillButton href={partner.website} variant="brand" icon={<ArrowUpRight size={17} weight="bold" />}>Journal Website</PillButton>
                <a href={partner.scopus} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink/80 transition-colors hover:text-ink">
                  <span className="underline decoration-ink/25 underline-offset-4 group-hover:decoration-ink">View on Scopus</span>
                  <ArrowUpRight size={15} weight="bold" className="text-brand-ink transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-45" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* The Special Issue: the title carries the block, the conditions run under it in reading order. */}
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <Reveal>
          <div className="fade-up navy-grad overflow-hidden rounded-[var(--radius-l)] p-[clamp(24px,4vw,72px)] text-white">
            <p className="font-medium text-amber">Special Issue</p>
            <h2 className="t-h2 mt-4 max-w-[30ch]">
              {before}
              <span className="whitespace-nowrap">Cross-Domain</span>
              {after}
            </h2>
            <p className="mt-6 max-w-[60ch] text-lg text-white/80">{specialIssue.body}</p>
            <ul className="mt-[clamp(28px,3.4vw,48px)] grid gap-x-8 gap-y-5 border-t border-white/15 pt-[clamp(20px,2.4vw,32px)] sm:grid-cols-2 xl:grid-cols-4">
              {specialIssue.conditions.map((c) => (
                <li key={c} className="flex items-start gap-3 text-white/90">
                  <span aria-hidden className="mt-0.5 grid size-6 flex-none place-items-center rounded-full bg-amber text-navy">
                    <Check size={13} weight="bold" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Charges, the same tiles the registration fees use: the APC leads, LaTeX is the optional extra. */}
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <Reveal>
          <h2 className="t-h2 fade-up mb-[clamp(28px,3.4vw,48px)]">
            Publication <span className="em">Charges</span>
          </h2>
        </Reveal>
        <div className="grid gap-3 md:grid-cols-[1.25fr_1fr]">
          <Reveal className="glow-bottom relative flex min-h-[clamp(240px,22vw,320px)] flex-col justify-between gap-10 overflow-hidden rounded-[var(--radius-l)] bg-brand-soft p-[clamp(24px,3vw,48px)]">
            <p className="fade-up font-medium text-ink/75">{charges.apc.label}</p>
            <div className="fade-up">
              <p className={`${amount} text-[clamp(60px,6.4vw,112px)] text-brand-deep`}>{charges.apc.amount}</p>
              <p className="mt-3 text-ink/75">{charges.apc.approx} {charges.apc.unit}</p>
            </div>
          </Reveal>
          <Reveal className="flex min-h-[clamp(240px,22vw,320px)] flex-col justify-between gap-10 rounded-[var(--radius-l)] bg-white p-[clamp(24px,3vw,48px)] ring-1 ring-ink/5">
            <p className="fade-up font-medium text-ink/75">{charges.latex.label}</p>
            <div className="fade-up">
              <p className={`${amount} text-[clamp(48px,4.6vw,80px)]`}>{charges.latex.amount}</p>
              <p className="mt-3 text-ink/75">{charges.latex.extra} ({charges.latex.unit})</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The next step: how to register interest, and who receives it. */}
      <section className="wrap grid gap-[clamp(32px,5vw,96px)] pb-[clamp(64px,8vw,130px)] xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
        <Reveal>
          <h2 className="t-h2 fade-up">
            Expression of <span className="em">Interest</span>
          </h2>
          <p className="fade-up mt-6 max-w-[50ch] text-lg text-ink/75">{publication.interest}</p>
          <div className="fade-up mt-8">
            <PillButton href={site.portals.publicationInterest} variant="brand">Send Expression of Interest</PillButton>
          </div>
        </Reveal>
        <Reveal className="rounded-[var(--radius-l)] bg-white p-[clamp(24px,3vw,48px)] ring-1 ring-ink/5">
          <div className="fade-up">
            <p className="text-sm text-muted">Publication Chair</p>
            <p className="mt-2 font-display text-[clamp(26px,2.2vw,36px)] leading-tight font-semibold">{chair.name}</p>
            <p className="mt-3 text-ink/75 max-sm:text-sm">
              {chair.role.map((line) => (
                <span key={line} className="block">
                  <Phrases parts={[line]} />
                </span>
              ))}
            </p>
            <p className="mt-5 [overflow-wrap:anywhere]">
              <MailLink to={chair.email} subject="IIC 2027: Expression of Interest for Journal Publication" greeting={`Dear ${chair.name},`} className="font-medium text-brand-ink underline decoration-2 underline-offset-4">
                <EmailText email={chair.email} />
              </MailLink>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
