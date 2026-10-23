import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { venue } from "@/content/venue";

export const metadata: Metadata = { title: "Venue", description: `${venue.name}, ${venue.address.join(", ")}.` };

export default function VenuePage() {
  return (
    <>
      <PageHero title="Kengeri Campus, Bengaluru" emphasis="Bengaluru" crumbs={[{ label: "Venue" }]} intro={venue.name}>
        <PillButton href={venue.maps} variant="wine">Directions on Google Maps</PillButton>
      </PageHero>
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
      <section className="wrap grid gap-3 pb-[clamp(64px,8vw,130px)] lg:grid-cols-[0.8fr_1.2fr]">
        <div className="glow-bottom relative flex flex-col justify-between gap-10 overflow-hidden rounded-[var(--radius-l)] bg-wine-soft p-[clamp(24px,3vw,48px)] text-cocoa">
          <div>
            <MapPin size={30} className="mb-6 text-wine-ink" />
            <p className="t-h3">{venue.name}</p>
            <address className="mt-4 text-lg not-italic text-cocoa/70">
              {venue.address.map((l) => <span key={l} className="block">{l}</span>)}
            </address>
          </div>
          <a href={venue.phoneHref} className="inline-flex items-center gap-3 text-lg hover:text-wine">
            <Phone size={22} /> {venue.phone}
          </a>
        </div>
        <div className="relative min-h-[380px] overflow-hidden rounded-[var(--radius-l)] bg-gray">
          <iframe title="Map of CHRIST University, Kengeri Campus" src={venue.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 size-full border-0 grayscale-[0.3]" />
        </div>
      </section>
    </>
  );
}
