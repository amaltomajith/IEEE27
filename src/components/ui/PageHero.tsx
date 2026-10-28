import Link from "next/link";
import { Field } from "./Field";
import { Reveal } from "./Reveal";
import { ScrollSlash } from "./ScrollSlash";
import { keep, keepRuns } from "@/lib/keep";

type Crumb = { label: string; href?: string };

// A title runs larger than a protected phrase can always fit on a phone, so phrases here are inline-blocks, not no-break spaces.
const Runs = ({ text }: { text: string }) =>
  keepRuns(text).map((r, i) => (i % 2 ? <span key={i} className="inline-block">{r}</span> : r));

export function PageHero({
  title,
  emphasis,
  intro,
  crumbs = [],
  children,
}: {
  title: string;
  emphasis?: string;
  intro?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  const parts = emphasis ? title.split(emphasis) : [title];
  // "CHRIST (Deemed to be University) Bangalore " -> lead "CHRIST (Deemed to be University) ", last "Bangalore ".
  const [, lead, last] = /^(.*?)(\S* ?)$/.exec(parts[0])!;
  return (
    <section className="relative isolate overflow-hidden pt-[calc(var(--header-h)+clamp(48px,9vh,120px))] pb-[clamp(48px,8vw,120px)]">
      <Field />
      <ScrollSlash className="absolute top-[12%] right-[10%] hidden h-[78%] w-[clamp(50px,5vw,90px)] opacity-90 md:block" />
      <Reveal className="wrap relative">
        <nav aria-label="Breadcrumb" className="fade-up mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {c.href ? <Link href={c.href} className="hover:text-ink">{c.label}</Link> : <span aria-current="page" className="text-ink">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className={title.length > 42 ? "t-h2 max-w-[31ch] !font-semibold" : "t-h1 max-w-[16ch] md:max-w-[18ch]"}>
          <span className="line-mask">
            <span>
              {/* Protected names stay whole, and the emphasis never drops onto a line of its own: it rides in one
                  inline-block with the word before it, which wraps inside only when even a full line can't hold both. */}
              {emphasis ? (
                <>
                  <Runs text={lead} />
                  <span className="inline-block">
                    {last}
                    <span className="em">{emphasis}</span>
                  </span>
                </>
              ) : (
                <Runs text={title} />
              )}
              {parts[1] && <Runs text={parts[1]} />}
            </span>
          </span>
        </h1>
        {intro && <div className="fade-up t-h5 mt-8 max-w-[44ch] text-ink/80">{typeof intro === "string" ? keep(intro) : intro}</div>}
        {children && <div className="fade-up mt-10">{children}</div>}
      </Reveal>
    </section>
  );
}
