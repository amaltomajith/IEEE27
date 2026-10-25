import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";

const LINKS = [
  { href: "/submission/", label: "Submission", note: "Extended abstract or full manuscript" },
  { href: "/registration/", label: "Registration", note: "National and international fees" },
  { href: "/publication/", label: "Publication", note: "Scopus-indexed Open Access journal" },
  { href: "/venue/", label: "Venue", note: "Kengeri Campus, Bengaluru" },
  { href: "/committee/", label: "Committee", note: "Advisory, technical and organising boards" },
];

export function TakePart() {
  return (
    <section className="wrap grid gap-3 pb-[clamp(80px,10vw,170px)] lg:grid-cols-[1.25fr_1fr]">
      <Reveal className="rounded-[var(--radius-l)] bg-white p-[clamp(24px,3vw,56px)] ring-1 ring-ink/5">
        <h2 className="t-h2 fade-up mb-8">
          Plan Your <span className="em">Part</span>
        </h2>
        <ul className="fade-up">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group flex items-center justify-between gap-6 border-t border-ink/10 py-5">
                <span>
                  <span className="block font-display font-semibold text-[clamp(26px,2.3vw,38px)] leading-tight transition-colors group-hover:text-brand-ink">{l.label}</span>
                  <span className="block text-muted">{l.note}</span>
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gray transition duration-500 [transition-timing-function:var(--ease-spring)] group-hover:translate-x-1 group-hover:bg-brand group-hover:text-paper">
                  <ArrowRight size={18} weight="bold" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[var(--radius-l)] navy-grad p-[clamp(24px,3vw,56px)] text-paper">
        <svg aria-hidden viewBox="0 0 200 300" className="absolute top-0 right-0 h-full w-auto text-paper/15" preserveAspectRatio="xMaxYMid slice">
          <path d="M200 40 H120 Q100 40 100 60 V140 Q100 160 80 160 H40 Q20 160 20 180 V300" className="trace-base" />
          <path d="M200 110 H150 Q134 110 134 126 V300" className="trace-base" />
          <circle cx="100" cy="100" r="5" className="fill-amber" />
          <circle cx="134" cy="200" r="5" className="fill-paper/30" />
        </svg>
        <div className="fade-up relative">
          <p className="text-paper/70">Registration From</p>
          <p className="mt-2 font-display text-[clamp(64px,6.6vw,116px)] leading-none font-semibold text-amber [font-variant-numeric:lining-nums]">₹1,500</p>
          <p className="mt-3 text-lg text-paper/80">or $100 for international delegates. Early bird closes 15 January 2027.</p>
        </div>
        <div className="fade-up relative mt-10">
          <PillButton href="/registration/" variant="light">See All Fees</PillButton>
        </div>
      </Reveal>
    </section>
  );
}
