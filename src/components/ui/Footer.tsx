import Link from "next/link";
import { ArrowUp, ArrowUpRight, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { nav, site } from "@/content/site";
import { venue } from "@/content/venue";
import { conveners } from "@/content/contact";
import { ConferenceLockup } from "./Lockup";
import { FooterSlash } from "./FooterSlash";
import { NextDeadline } from "./NextDeadline";
import { BackToTop } from "./BackToTop";
import { MailLink } from "./MailLink";
import { keep } from "@/lib/keep";
import { Phrases } from "@/components/ui/Phrases";
import { EmailText } from "@/components/ui/EmailText";

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
        {/* xl: links over the next deadline | conveners over the email | the venue down the full height.
            md: the same pairs in two columns, the venue across the bottom. Phones: one column in source order. */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr]">
          <nav aria-label="Footer" className={`${card} md:col-start-1 md:row-start-1`}>
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
          <Link href="/important-dates/" className={`${card} group flex items-start gap-4 md:col-start-1 md:row-start-2`}>
            <span className="relative mt-1.5 flex size-2.5 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-muted">Next Deadline</span>
              <span className="mt-1 block font-medium"><NextDeadline /></span>
            </span>
            <ArrowUpRight size={22} className="shrink-0 text-brand-ink transition-transform group-hover:rotate-45" />
          </Link>
          <div className={`${card} flex flex-col justify-between gap-6 md:col-start-2 md:row-start-1`}>
            <span className="block text-sm text-muted">Conference Conveners</span>
            <ul className="divide-y divide-ink/10">
              {conveners.map((c) => (
                <li key={c.tel} className="py-[clamp(14px,1.4vw,20px)] first:pt-0 last:pb-0">
                  <a href={c.tel} className="group flex items-center justify-between gap-4">
                    <span className="min-w-0">
                      <span className="block font-display font-semibold text-[clamp(19px,1.4vw,23px)] leading-snug">{c.name}</span>
                      <span className="mt-0.5 block text-[clamp(16px,1.1vw,18px)] text-ink/70 tabular-nums transition-colors group-hover:text-brand-ink">{c.phone}</span>
                    </span>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink transition group-hover:bg-brand group-hover:text-paper">
                      <Phone size={20} className="transition-transform group-hover:-rotate-12" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <MailLink to={site.email} className={`${card} group flex items-center justify-between gap-4 md:col-start-2 md:row-start-2`}>
            <span className="min-w-0">
              <span className="block text-sm text-muted">Conference Email</span>
              <span className="block font-display font-semibold text-[clamp(19px,1.4vw,24px)] leading-snug [font-variant-numeric:lining-nums] [overflow-wrap:anywhere]">
                <EmailText email={site.email} />
              </span>
            </span>
            <EnvelopeSimple size={26} className="shrink-0 text-brand-ink transition-transform group-hover:-rotate-12" />
          </MailLink>
          <a href={venue.maps} target="_blank" rel="noopener noreferrer" className={`${card} group flex flex-col gap-2 !p-2.5 md:col-span-2 md:max-xl:flex-row xl:col-span-1 xl:col-start-3 xl:row-span-2 xl:row-start-1`}>
            {/* The photo takes whatever height the two rows leave, so the card has no dead space. */}
            <span className="relative block min-h-[150px] flex-1 overflow-hidden rounded-[clamp(10px,1.1vw,16px)] md:max-xl:min-h-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/venue/campus-poster.webp" alt="CHRIST University Kengeri Campus building" width={960} height={260} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover object-[50%_65%] transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-105" />
            </span>
            <span className="flex items-start justify-between gap-4 p-[clamp(12px,1.2vw,20px)] md:max-xl:flex-1 md:max-xl:self-center">
              <span className="min-w-0">
                <span className="block text-sm text-muted">Venue</span>
                <span className="mt-1 block font-display font-semibold text-[clamp(19px,1.4vw,22px)] leading-snug">{keep(venue.name)}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-muted"><Phrases parts={venue.address} /></span>
              </span>
              <MapPin size={26} className="shrink-0 text-amber transition-transform group-hover:-translate-y-1" />
            </span>
          </a>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <p>
            &copy; {site.short}. All rights reserved. {keep(`${site.host}, ${site.campus}`)}
          </p>
          <BackToTop icon={<ArrowUp size={18} weight="bold" />} />
        </div>
      </div>
    </footer>
  );
}
