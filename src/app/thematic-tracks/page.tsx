import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Ribbon } from "@/components/ui/Ribbon";
import { tracks } from "@/content/tracks";
import { trackCommittee } from "@/content/committee";

export const metadata: Metadata = {
  title: "Thematic Tracks",
  description: "Four dedicated thematic tracks and twelve sub-tracks across CSE, AI & ML, EEE & ME, BBA and Psychology.",
};

// Same per-track tones as the home tracks carousel.
const TONES = [
  { chip: "bg-brand text-paper", num: "text-brand-ink", band: "bg-brand" },
  { chip: "bg-amber text-navy", num: "text-amber-ink", band: "bg-amber" },
  { chip: "bg-gold text-ink", num: "text-[#8a6630]", band: "bg-gold" },
  { chip: "bg-navy text-paper", num: "text-navy-3", band: "bg-navy" },
];

export default function TracksPage() {
  return (
    <>
      <PageHero
        title="Four Dedicated Thematic Tracks"
        emphasis="Thematic"
        crumbs={[{ label: "Thematic Tracks" }]}
        intro="Each participating department anchors a track, curates its own scholarly community, and contributes to one shared question: how humans and AI work together."
      />
      <section className="relative overflow-hidden pb-[clamp(80px,10vw,170px)]">
        <Ribbon shape="hook" className="bottom-[-6%] left-[-7%] h-[78%] max-lg:hidden" />
        <Ribbon shape="sweep" flip className="top-[-4%] right-[-6%] h-[46%] max-lg:top-[30%] max-lg:right-[-20%] max-lg:h-[30%]" />
        <ul className="wrap relative z-[1] grid items-start gap-x-4 gap-y-4 lg:grid-cols-2 lg:gap-y-6 lg:pb-[clamp(48px,7vw,120px)]">
          {tracks.map((t, i) => {
            const tone = TONES[i % TONES.length];
            return (
              <Reveal as="li" key={t.slug} className={i % 2 ? "lg:translate-y-[clamp(48px,7vw,120px)]" : ""}>
                <Link
                  href={`/thematic-tracks/${t.slug}/`}
                  className="group fade-up flex flex-col gap-[clamp(16px,1.8vw,28px)] rounded-[var(--radius-l)] bg-white p-[clamp(12px,1.2vw,18px)] ring-1 ring-ink/[0.06] transition-shadow duration-500 hover:shadow-[0_24px_60px_-30px_rgb(10_26_64/0.3)] sm:flex-row"
                >
                  <div className="relative aspect-square w-full shrink-0 self-start overflow-hidden rounded-[var(--radius-m)] bg-gray sm:w-[clamp(180px,17vw,260px)]">
                    <Image
                      src={t.poster}
                      alt={`${t.short} track poster: ${t.title}`}
                      fill
                      sizes="(min-width:640px) 260px, 92vw"
                      className="object-cover transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.05]"
                    />
                    <span className={`absolute top-3 right-3 grid size-10 place-items-center rounded-full shadow-lg ${tone.chip} transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-45`}>
                      <ArrowUpRight size={18} weight="bold" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col pr-[clamp(4px,1vw,12px)] pb-1 sm:py-1">
                    <p className="flex items-center gap-2 text-sm font-medium text-ink/70">
                      <span aria-hidden className={`h-1.5 w-6 rounded-full ${tone.band}`} />
                      {t.short} &middot; Tracks {t.subTracks[0].number}-{t.subTracks[2].number}
                    </p>
                    <h2 className="mt-2 font-display text-[clamp(22px,1.6vw,27px)] leading-[1.15] font-semibold transition-colors group-hover:text-brand-ink">{t.title}</h2>
                    <ul className="mt-3 flex flex-col gap-1 text-[14px] leading-snug text-ink/70">
                      {t.subTracks.map((st) => (
                        <li key={st.number} className="flex gap-3">
                          <span className={`mono w-6 shrink-0 ${tone.num}`}>{String(st.number).padStart(2, "0")}</span>
                          {st.title}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-auto border-t border-ink/10 pt-3 text-[13px] leading-snug text-muted max-sm:mt-4 sm:mt-4">
                      <span className="block font-medium text-ink/70">Track Committee</span>
                      {trackCommittee[t.slug].map((m) => m.name).join(", ")}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>
    </>
  );
}
