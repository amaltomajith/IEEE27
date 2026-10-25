import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { RoundLink } from "@/components/ui/RoundLink";
import { venue } from "@/content/venue";
import { campuses, campusCredits } from "@/content/campuses";

export const metadata: Metadata = { title: "Venue", description: `${venue.name}, ${venue.address.join(", ")}.` };

export default function VenuePage() {
  return (
    <>
      <PageHero title={venue.name} emphasis="Kengeri Campus" crumbs={[{ label: "Venue" }]} />
      <section className="wrap grid gap-3 pb-[clamp(56px,7vw,110px)] md:grid-cols-12">
        {venue.photos.map((p, i) => (
          <Reveal key={p.src} className={["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"][i]}>
            <figure className="fade-up">
              <div className={`relative overflow-hidden rounded-[var(--radius-l)] bg-gray ${i === 0 || i === 3 ? "aspect-[4/3] md:aspect-[16/10]" : "aspect-[4/3] md:aspect-[11/10]"}`}>
                <Image src={p.src} alt={`${p.label}, CHRIST Kengeri Campus`} fill sizes="(min-width:768px) 55vw, 92vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 text-muted">{p.label}</figcaption>
            </figure>
          </Reveal>
        ))}
      </section>

      {/* Getting there: the address, CHRIST's own travel notes and the directions link, beside an aerial of the campus. */}
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <Reveal>
          <div className="fade-up navy-grad grid overflow-hidden rounded-[var(--radius-l)] text-white lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-8 p-[clamp(24px,3.4vw,56px)]">
              <span className="grid size-12 place-items-center rounded-full bg-amber text-navy">
                <MapPin size={24} weight="fill" />
              </span>
              <div>
                <h2 className="t-h2">
                  Getting <span className="em text-amber">There</span>
                </h2>
                <address className="mt-4 text-lg leading-relaxed not-italic text-white/80">
                  {venue.address.map((l) => (
                    <span key={l} className="block">{l}</span>
                  ))}
                </address>
              </div>
              <dl className="divide-y divide-white/15 border-y border-white/15">
                {venue.travel.map((t) => (
                  <div key={t.from} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-6">
                    <dt className="text-sm text-white/60">From {t.from}</dt>
                    <dd className="text-[15px] text-white/90">{t.how}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <PillButton href={venue.maps} variant="light">Directions on Google Maps</PillButton>
                <a href={venue.phoneHref} className="group inline-flex items-center gap-2.5 text-[15px] text-white/80 transition-colors hover:text-white">
                  <Phone size={18} className="text-amber transition-transform group-hover:-rotate-12" />
                  <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white">{venue.phone}</span>
                </a>
              </div>
            </div>
            <div className="p-2.5 max-lg:order-first max-lg:pb-0">
              <div className="relative h-full min-h-[clamp(220px,40vw,320px)] overflow-hidden rounded-[calc(var(--radius-l)-10px)]">
                <Image src="/images/venue/kengeri-aerial.webp" alt="Aerial view of the CHRIST Bangalore Kengeri Campus" fill sizes="(min-width:1024px) 52vw, 92vw" className="object-cover object-[50%_60%]" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <Reveal>
          <h2 className="t-h2 fade-up">
            Our <span className="em">Campuses</span>
          </h2>
          <p className="fade-up mt-4 max-w-[52ch] text-lg text-ink/70">One university across six campuses, in Bengaluru, Pune and Delhi NCR.</p>
        </Reveal>
        <ul className="mt-[clamp(28px,3.4vw,48px)] grid gap-x-3 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {campuses.map((c) => (
            <Reveal as="li" key={c.url} className="group">
              <div className="fade-up">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-m)] bg-gray">
                  <Image src={c.image} alt={`${c.name}, CHRIST (Deemed to be University)`} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 46vw, 92vw" className="object-cover grayscale-[0.15] transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0" />
                  <RoundLink href={c.url} label={`${c.name} website`} title="Campus website" />
                </div>
                <p className="mt-4 flex flex-wrap items-center gap-x-2.5 text-sm text-muted">
                  {c.place}
                  {c.venue && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-amber-ink">
                      <span aria-hidden className="size-1.5 rounded-full bg-amber" />
                      Conference Venue
                    </span>
                  )}
                </p>
                <p className="mt-1 font-display text-[clamp(21px,1.6vw,25px)] leading-snug font-semibold">{c.name}</p>
              </div>
            </Reveal>
          ))}
        </ul>
        <p className="mt-10 text-xs text-muted">
          Photos of the Central and Delhi NCR campuses via Wikimedia Commons:{" "}
          {campusCredits.map((p, i) => (
            <span key={p.url}>
              {i > 0 && "; "}
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-ink">
                {p.label}
              </a>{" "}
              by {p.author}, {p.license}
            </span>
          ))}
          .
        </p>
      </section>
    </>
  );
}
