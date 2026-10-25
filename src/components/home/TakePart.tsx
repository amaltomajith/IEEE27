import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/Reveal";
import { RegistrationCard } from "./RegistrationCard";

const LINKS = [
  { href: "/submission/", label: "Paper Submission", note: "Extended abstract or full manuscript" },
  { href: "/registration/", label: "Registration", note: "National and international fees" },
  { href: "/publication/", label: "Publication", note: "Scopus-indexed Open Access journal" },
  { href: "/venue/", label: "Venue", note: "CHRIST (Deemed to be University) Bangalore Kengeri Campus" },
  { href: "/committee/", label: "Committees", note: "Advisory, technical and organising boards" },
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
      <Reveal className="h-full">
        <RegistrationCard />
      </Reveal>
    </section>
  );
}
