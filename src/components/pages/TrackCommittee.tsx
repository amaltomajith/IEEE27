import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { trackCommittee, type Member } from "@/content/committee";
import { tracks } from "@/content/tracks";

/** Portrait box with the name underneath, linking out to the member's CHRIST faculty page. */
export function FacultyCard({ m }: { m: Member }) {
  return (
    <a href={m.url} target="_blank" rel="noopener noreferrer" className="group block">
      <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-m)] bg-gray ring-1 ring-ink/[0.06]">
        {m.photo && (
          <Image
            src={m.photo}
            alt={`Portrait of ${m.name}`}
            fill
            sizes="(min-width:640px) 184px, 45vw"
            className="object-cover object-top grayscale-[0.15] transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        )}
        <span className="absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-white text-brand-ink opacity-0 shadow-md transition duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-45 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight size={16} weight="bold" />
        </span>
      </span>
      <span className="mt-3 block font-display text-[19px] leading-snug font-semibold transition-colors group-hover:text-brand-ink">{m.name}</span>
      {m.role && <span className="mt-0.5 block text-[14px] leading-snug text-ink/75">{m.role}</span>}
      {m.org && <span className="block text-[13px] leading-snug text-muted">{m.org}</span>}
    </a>
  );
}

/** One row per track, after the home "Three schools" list: the poster opens on hover, faculty sit alongside. */
export function TrackCommittee() {
  return (
    <ul className="border-t border-ink/10">
      {tracks.map((t) => (
        <li key={t.slug} className="group/row border-b border-ink/10">
          <div className="grid items-center gap-x-[clamp(24px,4vw,80px)] gap-y-6 py-[clamp(24px,2.8vw,44px)] lg:grid-cols-[minmax(0,1fr)_auto]">
            <Link href={`/thematic-tracks/${t.slug}/`} className="group/track flex min-w-0 items-center">
              <span className="relative mr-[clamp(16px,2vw,40px)] size-[clamp(64px,7vw,124px)] shrink-0 overflow-hidden rounded-[var(--radius-s)] transition-[width,margin] duration-700 [transition-timing-function:var(--ease-out)] md:mr-0 md:w-0 md:group-focus-within/row:mr-[clamp(16px,2vw,40px)] md:group-focus-within/row:w-[clamp(64px,7vw,124px)] md:group-hover/row:mr-[clamp(16px,2vw,40px)] md:group-hover/row:w-[clamp(64px,7vw,124px)]">
                <Image src={t.poster} alt="" fill sizes="124px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[clamp(32px,4.6vw,84px)] leading-[1.02] font-semibold tracking-[-0.01em] text-ink/90 transition-colors group-hover/track:text-brand-ink">
                  {t.short}
                </span>
                <span className="mt-1 block max-w-[40ch] text-muted">
                  Tracks {t.subTracks[0].number}-{t.subTracks[2].number} &middot; {t.title}
                </span>
              </span>
            </Link>
            <ul className="grid grid-cols-2 gap-4 sm:w-[384px]">
              {trackCommittee[t.slug].map((m) => (
                <li key={m.name}><FacultyCard m={m} /></li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}
