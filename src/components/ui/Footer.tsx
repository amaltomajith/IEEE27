import Link from "next/link";
import { ArrowUp, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { nav, site } from "@/content/site";
import { venue } from "@/content/venue";
import { ConferenceLockup } from "./Lockup";
import { FooterSlash } from "./FooterSlash";
import { NextDeadline } from "./NextDeadline";
import { BackToTop } from "./BackToTop";

const card = "min-w-0 rounded-[clamp(16px,1.6vw,24px)] bg-white p-[clamp(20px,2vw,32px)] shadow-[0_1px_0_rgb(10_26_64/0.04)]";

export function Footer() {
  return (
    <footer className="footer-bg relative overflow-hidden pt-[clamp(80px,10vw,150px)] pb-6">
      <FooterSlash />
      <div className="wrap relative">
        {/* The conference name lands here from the nav as the footer arrives (see Header). */}
        <div className="mb-[clamp(40px,5vw,80px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div data-snap="down" className="min-w-0">
            <ConferenceLockup size="footer" host masked className="text-ink" />
          </div>
          {/* Host logo on a card like the ones below, so it reads cleanly over the slash. */}
          <a href={site.universityUrl} target="_blank" rel="noopener noreferrer" aria-label="CHRIST (Deemed to be University)" className={`${card} relative shrink-0 transition-transform duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/christ-logo.webp" alt="CHRIST (Deemed to be University)" width={480} height={153} loading="lazy" className="h-[clamp(44px,4.6vw,80px)] w-auto" />
          </a>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr]">
          <nav aria-label="Footer" className={`${card} xl:row-span-2`}>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 font-display font-semibold text-[clamp(20px,1.55vw,26px)]">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-flex text-ink/80 transition-colors hover:text-brand-ink">
                    <span className="roll">
                      <span>{n.label}</span>
                      <span aria-hidden>{n.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a href={`mailto:${site.email}`} className={`${card} group flex items-center justify-between gap-4`}>
            <span className="min-w-0">
              <span className="block text-sm text-muted">Conference email</span>
              <span className="block font-display font-semibold text-[clamp(19px,1.4vw,24px)] leading-snug [font-variant-numeric:lining-nums] [overflow-wrap:anywhere]">
                {site.email.split("@")[0]}
                <wbr />@{site.email.split("@")[1]}
              </span>
            </span>
            <EnvelopeSimple size={26} className="shrink-0 text-brand-ink transition-transform group-hover:-rotate-12" />
          </a>
          <a href={venue.phoneHref} className={`${card} group flex items-center justify-between gap-4`}>
            <span>
              <span className="block text-sm text-muted">Campus</span>
              <span className="block font-display font-semibold text-[clamp(19px,1.4vw,24px)] [font-variant-numeric:lining-nums]">{venue.phone}</span>
            </span>
            <Phone size={26} className="shrink-0 text-brand-ink transition-transform group-hover:-rotate-12" />
          </a>
          <div className={`${card} flex items-start gap-4`}>
            <span className="relative mt-1.5 flex size-2.5 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
            </span>
            <span>
              <span className="block text-sm text-muted">Next deadline</span>
              <span className="block font-medium"><NextDeadline /></span>
            </span>
          </div>
          <a href={venue.maps} target="_blank" rel="noopener noreferrer" className={`${card} group flex flex-col gap-4 !p-2.5`}>
            {/* The poster ends on the Kengeri campus; the footer's venue card shows it. */}
            <span className="relative block aspect-[960/300] overflow-hidden rounded-[clamp(10px,1.1vw,16px)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/venue/campus-poster.webp" alt="CHRIST University Kengeri Campus building" width={960} height={260} loading="lazy" decoding="async" className="size-full object-cover object-[50%_65%] transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-105" />
            </span>
            <span className="flex items-start justify-between gap-4 px-[clamp(10px,1.2vw,22px)] pb-[clamp(10px,1.2vw,22px)]">
              <span>
                <span className="block text-sm text-muted">Venue</span>
                <span className="block font-display font-semibold text-[19px] leading-snug">{venue.name}</span>
                <span className="block text-muted">{venue.address.join(", ")}</span>
              </span>
              <MapPin size={26} className="shrink-0 text-amber transition-transform group-hover:-translate-y-1" />
            </span>
          </a>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <p>
            &copy; {site.short}. All rights reserved. {site.host}, {site.campus}
          </p>
          <BackToTop icon={<ArrowUp size={18} weight="bold" />} />
        </div>
      </div>
    </footer>
  );
}
