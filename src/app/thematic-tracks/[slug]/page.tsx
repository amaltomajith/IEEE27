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
            <h2 className="mb-3 font-display text-[22px] font-semibold text-muted">Sub-Tracks</h2>
            <ol className="max-w-[60ch] border-b border-ink/10">
              {t.subTracks.map((s) => (
                <li key={s.number} className="flex items-baseline gap-4 border-t border-ink/10 py-[clamp(12px,1.2vw,16px)]">
                  <span className="mono w-8 shrink-0 text-[1.05em] text-amber-ink [font-variant-numeric:lining-nums]">{String(s.number).padStart(2, "0")}</span>
                  <span className="font-display text-[clamp(19px,1.45vw,24px)] leading-snug font-semibold">{s.title}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="fade-up">
            <PillButton href={site.portals.submission} variant="brand">Submit to This Track</PillButton>
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


      <section className="wrap py-[clamp(64px,8vw,130px)]">
        <Reveal><h2 className="t-h2 fade-up mb-10">Topics of <span className="em">Interest</span></h2></Reveal>
        {/* One row per sub-track: its number and title on the left, the topics it covers on the right. */}
        <div className="border-b border-ink/10">
          {t.topics.map((g) => {
            const st = t.subTracks.find((s) => s.number === g.subTrack)!;
            return (
              <Reveal key={g.subTrack} className="grid gap-5 border-t border-ink/10 py-[clamp(24px,3vw,44px)] lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-[clamp(32px,4vw,72px)]">
                <div className="fade-up flex items-baseline gap-4">
                  <span className="mono w-8 shrink-0 text-[1.05em] text-amber-ink [font-variant-numeric:lining-nums]">{String(st.number).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[clamp(21px,1.6vw,27px)] leading-snug font-semibold">{st.title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{g.items.length} topics</p>
                  </div>
                </div>
                <ul className="fade-up flex flex-wrap content-start gap-2 sm:max-lg:pl-12">
                  {g.items.map((it) => (
                    <li key={it} className="rounded-full bg-white px-4 py-2.5 text-[15px] max-sm:rounded-[14px] ring-1 ring-ink/10 transition hover:bg-brand hover:text-paper hover:ring-brand">
                      {it}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </section>

      <nav aria-label="Other tracks" className="wrap grid gap-3 pb-[clamp(64px,8vw,130px)] sm:grid-cols-2">
        {[{ t: prev, dir: "Previous" }, { t: next, dir: "Next" }].map(({ t: o, dir }) => (
          <Link key={dir} href={`/thematic-tracks/${o.slug}/`} className={`group flex items-center gap-5 rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-ink/5 transition hover:ring-brand ${dir === "Next" ? "sm:flex-row-reverse sm:text-right" : ""}`}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gray transition group-hover:bg-brand group-hover:text-paper">
              {dir === "Next" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </span>
            <span>
              <span className="block text-sm text-muted">{dir} Track</span>
              <span className="block font-medium">{o.short}: {o.title}</span>
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
