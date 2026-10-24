import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { FacultyCard } from "@/components/pages/TrackCommittee";
import { getTrack, tracks } from "@/content/tracks";
import { trackCommittee } from "@/content/committee";
import { site } from "@/content/site";

export const dynamicParams = false;
export const generateStaticParams = () => tracks.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = getTrack((await params).slug);
  return t ? { title: `${t.short}: ${t.title}`, description: t.description.slice(0, 160) } : {};
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTrack((await params).slug);
  if (!t) notFound();
  const idx = tracks.indexOf(t);
  const prev = tracks[(idx + tracks.length - 1) % tracks.length];
  const next = tracks[(idx + 1) % tracks.length];

  return (
    <>
      <PageHero
        title={t.title}
        emphasis={t.emphasis}
        crumbs={[{ label: "Thematic Tracks", href: "/thematic-tracks/" }, { label: t.short }]}
        intro={t.department}
      />

      <section className="wrap grid items-start gap-[clamp(32px,5vw,96px)] pb-[clamp(64px,8vw,130px)] lg:grid-cols-[minmax(0,1fr)_auto]">
        <Reveal className="space-y-8">
          <p className="fade-up text-[clamp(18px,1.4vw,25px)] leading-[1.55] text-ink/85">{t.description}</p>
          <div className="fade-up">
            <PillButton href={site.portals.submission} variant="brand">Submit to this track</PillButton>
          </div>
          <div className="fade-up pt-4">
            <h2 className="mb-4 font-display text-[22px] font-semibold text-muted">Track Committee</h2>
            <ul className="grid max-w-[384px] grid-cols-2 gap-4">
              {trackCommittee[t.slug].map((m) => (
                <li key={m.name}><FacultyCard m={m} /></li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal className="w-full max-w-[420px] lg:w-[clamp(320px,30vw,420px)] lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:justify-self-end">
          <div className="fade-up relative aspect-square overflow-hidden rounded-[var(--radius-l)] bg-gray">
            <Image src={t.poster} alt={`${t.short} track poster`} fill priority sizes="(min-width:640px) 420px, 92vw" className="object-cover" />
          </div>
        </Reveal>
      </section>

      <section className="tint-b relative overflow-hidden py-[clamp(72px,9vw,150px)] text-ink">
        <div className="wrap">
          <Reveal><h2 className="t-h2 fade-up mb-[clamp(32px,4vw,64px)]">Sub-<span className="em text-brand-ink">tracks</span></h2></Reveal>
          <ol className="grid gap-3 lg:grid-cols-3">
            {t.subTracks.map((s) => (
              <Reveal as="li" key={s.number} className="rounded-[var(--radius-l)] bg-paper p-[clamp(24px,2.4vw,40px)] ring-1 ring-ink/[0.06]">
                <div className="fade-up flex h-full flex-col justify-between gap-12">
                  <span className="font-display text-[clamp(60px,6.4vw,104px)] leading-none font-semibold text-amber-ink [font-variant-numeric:lining-nums]">{String(s.number).padStart(2, "0")}</span>
                  <h3 className="t-h3">{s.title}</h3>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap py-[clamp(64px,8vw,130px)]">
        <Reveal><h2 className="t-h2 fade-up mb-10">Topics of <span className="em">interest</span></h2></Reveal>
        <div className="space-y-10">
          {t.topics.map((g, gi) => (
            <Reveal key={gi}>
              {g.heading && <h3 className="fade-up mb-4 font-display font-semibold text-[22px] text-muted">{g.heading}</h3>}
              <ul className="fade-up flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <li key={it} className="rounded-full bg-white px-4 py-2.5 text-[15px] ring-1 ring-ink/10 transition hover:bg-brand hover:text-paper hover:ring-brand">
                    {it}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <nav aria-label="Other tracks" className="wrap grid gap-3 pb-[clamp(64px,8vw,130px)] sm:grid-cols-2">
        {[{ t: prev, dir: "Previous" }, { t: next, dir: "Next" }].map(({ t: o, dir }) => (
          <Link key={dir} href={`/thematic-tracks/${o.slug}/`} className={`group flex items-center gap-5 rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-ink/5 transition hover:ring-brand ${dir === "Next" ? "sm:flex-row-reverse sm:text-right" : ""}`}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gray transition group-hover:bg-brand group-hover:text-paper">
              {dir === "Next" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </span>
            <span>
              <span className="block text-sm text-muted">{dir} track</span>
              <span className="block font-medium">{o.short}: {o.title}</span>
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
