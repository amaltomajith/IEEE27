import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { publication } from "@/content/publication";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Publication", description: publication.body.slice(0, 160) };

export default function PublicationPage() {
  return (
    <>
      <PageHero title={publication.title} emphasis="Open Access" crumbs={[{ label: "Publication" }]} />
      <section className="wrap grid gap-[clamp(32px,5vw,96px)] pb-[clamp(64px,8vw,130px)] lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <p className="fade-up text-[clamp(18px,1.4vw,25px)] leading-[1.55] text-ink/85">{publication.body}</p>
        </Reveal>
        <Reveal className="glow-bottom relative self-start overflow-hidden rounded-[var(--radius-l)] bg-brand-soft p-[clamp(24px,3vw,48px)] text-ink">
          <div className="fade-up">
            <p className="text-muted">Article Processing Charge</p>
            <p className="mt-3 font-display text-[clamp(60px,5.8vw,100px)] leading-none font-semibold text-amber-ink [font-variant-numeric:lining-nums]">{publication.apc}</p>
            <p className="mt-2 text-ink/70">per paper</p>
            <ul className="mt-8 space-y-3 text-ink/75">
              {publication.apcNotes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </Reveal>
      </section>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <Reveal><h2 className="t-h2 fade-up mb-10">Important <span className="em">notes</span></h2></Reveal>
        <div className="grid gap-3 md:grid-cols-3">
          {publication.notes.map((n) => (
            <Reveal key={n} className="rounded-[var(--radius-m)] bg-white p-[clamp(20px,2vw,32px)] ring-1 ring-ink/5">
              <p className="fade-up text-ink/80">{n}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <div className="relative overflow-hidden rounded-[var(--radius-l)] navy-grad p-[clamp(28px,4vw,72px)] text-paper">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <h2 className="t-h2 max-w-[16ch]">Expression of <span className="em text-amber">interest</span></h2>
              <p className="mt-6 max-w-[48ch] text-lg text-paper/80">{publication.interest}</p>
            </div>
            <div className="space-y-5">
              <div>
                <p className="font-display font-semibold text-[24px]">{publication.chair.name}</p>
                <p className="text-paper/75">{publication.chair.role}</p>
                <p className="mt-3">
                  {publication.chair.email && (
                    <>
                      <a className="font-medium underline decoration-2 underline-offset-4" href={`mailto:${publication.chair.email}`}>{publication.chair.email}</a> or{" "}
                    </>
                  )}
                  <a className="font-medium underline decoration-2 underline-offset-4" href={`mailto:${site.email}`}>{site.email}</a>
                </p>
              </div>
              <PillButton href={site.portals.publicationInterest} variant="light">Send expression of interest</PillButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
