import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { organizers, site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

const FACTS = ["Hybrid mode", "Scopus-indexed Open Access journal", "APC USD 100, on acceptance only", "Proceedings with DOI"];

export function OrganizersSection() {
  return (
    <section className="warm-a relative overflow-hidden py-[clamp(80px,10vw,170px)] text-cocoa">
      <div className="wrap">
        <Reveal>
          <h2 className="t-h2 fade-up mb-[clamp(40px,5vw,80px)] max-w-[16ch]">
            Three schools, one <span className="em text-wine-ink">question</span>
          </h2>
        </Reveal>
        <ul className="border-t border-cocoa/10">
          {organizers.map((o) => (
            <li key={o.name} className="border-b border-cocoa/10">
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
                  <span className="block text-[clamp(28px,4.6vw,80px)] leading-[1.02] font-medium tracking-[-0.035em] text-cocoa/90 transition-colors group-hover:text-cocoa">
                    {o.short}
                  </span>
                  <span className="mt-1 block text-muted md:hidden">{o.name}</span>
                </span>
                <span className="hidden max-w-[22ch] text-right text-muted transition-colors group-hover:text-cocoa/80 lg:block">{o.name}</span>
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-cocoa/[0.05] text-wine-ink transition duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-45 group-hover:bg-wine group-hover:text-paper">
                  <ArrowUpRight size={20} weight="bold" />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <ul className="mt-[clamp(40px,5vw,72px)] flex flex-wrap gap-2">
          {FACTS.map((f) => (
            <li key={f} className="rounded-full bg-paper px-5 py-3 text-cocoa/80 ring-1 ring-cocoa/[0.06]">{f}</li>
          ))}
          <li className="rounded-full bg-wine px-5 py-3 font-medium text-paper">{site.dates}</li>
        </ul>
      </div>
    </section>
  );
}
