import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { tracks } from "@/content/tracks";

export const metadata: Metadata = {
  title: "Thematic Tracks",
  description: "Four dedicated thematic tracks and twelve sub-tracks across CSE, AI & ML, EEE & ME, BBA and Psychology.",
};

export default function TracksPage() {
  return (
    <>
      <PageHero
        title="Four dedicated thematic tracks"
        emphasis="thematic"
        crumbs={[{ label: "Thematic Tracks" }]}
        intro="Each participating department anchors a track, curates its own scholarly community, and contributes to one shared question: how humans and AI work together."
      />
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <ul className="grid gap-x-4 gap-y-14 md:grid-cols-2">
          {tracks.map((t, i) => (
            <Reveal as="li" key={t.slug} className={i % 2 ? "md:mt-[clamp(40px,8vw,140px)]" : ""}>
              <Link href={`/thematic-tracks/${t.slug}/`} className="group fade-up block">
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-l)] bg-gray">
                  <Image
                    src={t.poster}
                    alt={`${t.short} track poster: ${t.title}`}
                    fill
                    sizes="(min-width:768px) 45vw, 92vw"
                    className="object-cover transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-5 right-5 grid size-14 place-items-center rounded-full bg-white text-cocoa transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:scale-110 group-hover:rotate-45">
                    <ArrowUpRight size={22} weight="bold" />
                  </span>
                </div>
                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <p className="text-muted">
                      {t.short} &middot; Tracks {t.subTracks[0].number}-{t.subTracks[2].number}
                    </p>
                    <h2 className="t-h3 mt-2 max-w-[24ch] transition-colors group-hover:text-wine-ink">{t.title}</h2>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
