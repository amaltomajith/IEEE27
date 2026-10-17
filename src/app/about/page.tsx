import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { about, organizers, site } from "@/content/site";

export const metadata: Metadata = { title: "About", description: about.vision[0] };

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Asking what AI does to us"
        emphasis="to us"
        crumbs={[{ label: "About" }]}
        intro={site.tagline}
      />

      <section className="wrap grid gap-[clamp(32px,5vw,96px)] py-[clamp(64px,8vw,140px)] lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <h2 className="t-h2 fade-up">
            Conference <span className="em">vision</span>
          </h2>
        </Reveal>
        <Reveal className="space-y-6 text-[clamp(18px,1.35vw,24px)] leading-[1.55] text-navy/85">
          {about.vision.map((p) => (
            <p key={p.slice(0, 20)} className="fade-up">{p}</p>
          ))}
        </Reveal>
      </section>

      <section className="glow-bottom relative overflow-hidden bg-white py-[clamp(72px,9vw,150px)] text-navy">
        <div className="wrap">
          <Reveal>
            <h2 className="t-h2 fade-up mb-[clamp(36px,5vw,72px)] max-w-[18ch]">
              Why it is built <span className="em text-signal-ink">this way</span>
            </h2>
          </Reveal>
          <div className="grid gap-3 md:grid-cols-12">
            {about.rationale.map((r, i) => (
              <Reveal
                key={r.title}
                className={`rounded-[var(--radius-l)] bg-paper p-[clamp(24px,2.6vw,44px)] ring-1 ring-navy/[0.06] ${
                  ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"][i]
                }`}
              >
                <div className="fade-up">
                  <span aria-hidden className="node mb-8 block text-[14px]" />
                  <h3 className="t-h3 mb-3">{r.title}</h3>
                  <p className="max-w-[52ch] text-navy/70">{r.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-[clamp(64px,8vw,140px)]">
        <Reveal>
          <h2 className="t-h2 fade-up mb-10 max-w-[20ch]">
            Jointly organized by three <span className="em">schools</span>
          </h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {organizers.map((o) => (
            <a key={o.name} href={o.url} target="_blank" rel="noopener noreferrer" className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-m)] bg-gray">
                <Image src={o.image} alt={`${o.name} building, Kengeri Campus`} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p className="mt-4 text-lg font-medium group-hover:text-signal-ink">{o.name}</p>
            </a>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <span className="inline-flex rounded-[var(--radius-m)] bg-white px-6 py-4 ring-1 ring-navy/5">
            <Image src="/images/brand/christ-logo.webp" alt="CHRIST (Deemed to be University)" width={1280} height={434} className="h-auto w-[240px]" />
          </span>
          <PillButton href={site.universityUrl} variant="ghost">Visit christuniversity.in</PillButton>
        </div>
      </section>
    </>
  );
}
