"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useMagnetic } from "./Magnetic";

type Variant = "dark" | "light" | "wine" | "ghost" | "ghost-dark";

type Props = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  tabIndex?: number;
};

const cls: Record<Variant, string> = {
  dark: "btn",
  light: "btn btn--light",
  wine: "btn btn--wine",
  ghost: "btn btn--ghost",
  "ghost-dark": "btn btn--ghost-dark",
};

/** Site button: label + arrow tile. Name kept from v1 so call sites stay unchanged. */
export function PillButton({ href, onClick, children, variant = "dark", external, icon, className = "", ariaLabel, tabIndex }: Props) {
  const ref = useMagnetic<HTMLAnchorElement & HTMLButtonElement>();
  const glyph = icon ?? <ArrowRight size={17} weight="bold" />;
  const inner = (
    <>
      <span>{children}</span>
      <span className="btn-tile" aria-hidden>
        <span className="grid place-items-center">{glyph}</span>
        <span className="grid place-items-center">{glyph}</span>
      </span>
    </>
  );
  const c = `${cls[variant]} ${className}`;
  const common = { ref, className: c, "aria-label": ariaLabel, tabIndex };
  if (!href)
    return (
      <button type="button" onClick={onClick} {...common}>
        {inner}
      </button>
    );
  if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:"))
    return (
      <a href={href} {...common} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner}
      </a>
    );
  return (
    <Link href={href} onClick={onClick} {...common}>
      {inner}
    </Link>
  );
}
