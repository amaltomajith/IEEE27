import type { Metadata } from "next";
import Image from "next/image";
import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { site } from "@/content/site";
import { venue } from "@/content/venue";

export const metadata: Metadata = { title: "Programme Schedule", description: `The ${site.short} programme schedule will be updated shortly. ${site.dates}, ${venue.name}.` };

export default function ProgrammeSchedulePage() {
  return (
    <>
      <PageHero title="Programme Schedule" emphasis="Schedule" crumbs={[{ label: "Programme Schedule" }]} intro="The programme schedule will be updated shortly." />

      {/* Until the schedule is out: when and where, beside the campus aerial. */}
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <Reveal>
          <div className="fade-up navy-grad grid overflow-hidden rounded-[var(--radius-l)] text-white lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-8 p-[clamp(24px,3.4vw,56px)]">
              <h2 className="t-h2">
                <span className="em text-amber">Venue</span>
              </h2>
              <dl className="divide-y divide-white/15 border-y border-white/15">
                <div className="flex gap-4 py-5">
                  <CalendarBlank size={24} className="mt-0.5 shrink-0 text-amber" />
                  <div>
                    <dt className="text-sm text-white/60">Dates</dt>
                    <dd className="mt-1 text-lg text-white/90">{site.dates} ({site.mode})</dd>
                  </div>
                </div>
                <div className="flex gap-4 py-5">
                  <MapPin size={24} className="mt-0.5 shrink-0 text-amber" />
                  <div>
                    <dt className="text-sm text-white/60">Venue</dt>
                    <dd className="mt-1 text-lg text-white/90">
                      <span className="block">{venue.name}</span>
                      <address className="mt-2 text-[15px] leading-relaxed not-italic text-white/70">
                        {venue.address.map((l) => (
                          <span key={l} className="block">{l}</span>
                        ))}
                      </address>
                    </dd>
                  </div>
                </div>
              </dl>
              <div className="flex flex-wrap gap-3">
                <PillButton href={venue.maps} variant="light">Directions on Google Maps</PillButton>
                <PillButton href="/venue/" variant="ghost-dark">About the Venue</PillButton>
              </div>
            </div>
            <div className="p-2.5 max-lg:order-first max-lg:pb-0">
              <div className="relative h-full min-h-[clamp(220px,40vw,320px)] overflow-hidden rounded-[calc(var(--radius-l)-10px)]">
                <Image src="/images/venue/kengeri-main-block.webp" alt="Main block of the CHRIST Bangalore Kengeri Campus" fill sizes="(min-width:1024px) 52vw, 92vw" className="object-cover object-[50%_55%]" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
