import Link from "next/link";
import { ArrowUp, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { nav, site } from "@/content/site";
import { venue } from "@/content/venue";
import { Wordmark } from "./Logo";
import { FooterSlash } from "./FooterSlash";
import { NextDeadline } from "./NextDeadline";
import { BackToTop } from "./BackToTop";

const card = "rounded-[clamp(16px,1.6vw,24px)] bg-white p-[clamp(20px,2vw,32px)] shadow-[0_1px_0_rgb(10_33_41/0.04)]";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray pt-[clamp(80px,10vw,150px)] pb-6">
      <FooterSlash />
      <div className="wrap relative">
        <p className="t-xl mb-[clamp(40px,5vw,80px)] text-[clamp(64px,17vw,300px)]">
          <Wordmark />
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr]">
          <nav aria-label="Footer" className={`${card} xl:row-span-2`}>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[clamp(17px,1.3vw,22px)]">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-flex text-navy/80 transition-colors hover:text-signal-ink">
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
              <span className="block truncate text-[clamp(16px,1.15vw,20px)] font-medium">{site.email}</span>
            </span>
            <EnvelopeSimple size={26} className="shrink-0 text-signal-ink transition-transform group-hover:-rotate-12" />
          </a>
          <a href={venue.phoneHref} className={`${card} group flex items-center justify-between gap-4`}>
            <span>
              <span className="block text-sm text-muted">Campus</span>
              <span className="block text-[clamp(16px,1.15vw,20px)] font-medium">{venue.phone}</span>
            </span>
            <Phone size={26} className="shrink-0 text-signal-ink transition-transform group-hover:-rotate-12" />
          </a>
          <div className={`${card} flex items-start gap-4`}>
            <span className="relative mt-1.5 flex size-2.5 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-signal" />
            </span>
            <span>
              <span className="block text-sm text-muted">Next deadline</span>
              <span className="block font-medium"><NextDeadline /></span>
            </span>
          </div>
          <a href={venue.maps} target="_blank" rel="noopener noreferrer" className={`${card} group flex items-start justify-between gap-4`}>
            <span>
              <span className="block text-sm text-muted">Venue</span>
              <span className="block font-medium">{venue.name}</span>
              <span className="block text-muted">{venue.address.join(", ")}</span>
            </span>
            <MapPin size={26} className="shrink-0 text-signal-ink transition-transform group-hover:-translate-y-1" />
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
