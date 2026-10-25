import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { organizers, site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { Ribbon } from "@/components/ui/Ribbon";

const FACTS = ["Hybrid Mode", "Scopus-Indexed Open Access Journal", "APC USD 100, on Acceptance Only", "Proceedings with DOI"];

export function OrganizersSection() {
  return (
    <section className="tint-a relative overflow-hidden py-[clamp(80px,10vw,170px)] text-ink">
      <Ribbon shape="s" className="top-[-7%] right-[-5%] h-[38%] max-md:top-[-2%] max-md:right-[-16%] max-md:h-[20%]" />
      <div className="wrap relative z-[1]">
        <Reveal>
          <h2 className="t-h2 fade-up mb-[clamp(40px,5vw,80px)] max-w-[16ch]">
            Three Schools, One <span className="em text-brand-ink">Question</span>
          </h2>
        </Reveal>
        <ul className="border-t border-ink/10">
          {organizers.map((o) => (
            <li key={o.name} className="border-b border-ink/10">
              <a
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-[clamp(16px,2vw,40px)] py-[clamp(18px,2.4vw,36px)]"
              >
                <span className="relative h-[clamp(56px,6vw,104px)] w-0 shrink-0 overflow-hidden rounded-[var(--radius-s)] transition-[width] duration-700 [transition-timing-function:var(--ease-out)] group-hover:w-[clamp(84px,9vw,156px)] max-md:w-[clamp(56px,16vw,84px)]">
                  <Image src={o.image} alt="" fill sizes="160px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[clamp(32px,5vw,88px)] leading-[1.02] font-semibold tracking-[-0.01em] text-ink/90 transition-colors group-hover:text-ink">
                    {o.short}
                  </span>
                  <span className="mt-1 block text-muted md:hidden">{o.name}</span>
                </span>
                <span className="hidden max-w-[22ch] text-right text-muted transition-colors group-hover:text-ink/80 lg:block">{o.name}</span>
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink/[0.05] text-brand-ink transition duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-45 group-hover:bg-brand group-hover:text-paper">
                  <ArrowUpRight size={20} weight="bold" />
                </span>
              </a>
            </li>
          ))}
        </ul>
        {/* Always one row: fluid pills fit on laptops and up; narrower screens swipe the strip, date first. */}
        <ul className="-mx-[var(--gutter)] mt-[clamp(40px,5vw,72px)] flex snap-x scroll-px-[var(--gutter)] flex-nowrap gap-[clamp(5px,0.55vw,8px)] overflow-x-auto px-[var(--gutter)] py-1 text-[clamp(12.5px,1.05vw,17px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FACTS.map((f) => (
            <li key={f} className="shrink-0 snap-start rounded-full bg-paper px-[clamp(11px,1.08vw,20px)] py-[clamp(9px,0.8vw,12px)] whitespace-nowrap text-ink/80 ring-1 ring-ink/[0.06]">{f}</li>
          ))}
          <li className="shrink-0 snap-start rounded-full bg-brand px-[clamp(11px,1.08vw,20px)] py-[clamp(9px,0.8vw,12px)] font-medium whitespace-nowrap text-paper max-lg:order-first">{site.dates}</li>
        </ul>
      </div>
    </section>
  );
}
