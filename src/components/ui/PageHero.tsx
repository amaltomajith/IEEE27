import Link from "next/link";
import { Field } from "./Field";
import { Reveal } from "./Reveal";
import { ScrollSlash } from "./ScrollSlash";

type Crumb = { label: string; href?: string };

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
        <h1 className={title.length > 42 ? "t-h2 max-w-[26ch] !font-semibold" : "t-h1 max-w-[16ch] md:max-w-[18ch]"}>
          <span className="line-mask">
            <span>
              {parts[0]}
              {emphasis && <span className="em">{emphasis}</span>}
              {parts[1]}
            </span>
          </span>
        </h1>
        {intro && <div className="fade-up t-h5 mt-8 max-w-[44ch] text-ink/80">{intro}</div>}
        {children && <div className="fade-up mt-10">{children}</div>}
      </Reveal>
    </section>
  );
}
