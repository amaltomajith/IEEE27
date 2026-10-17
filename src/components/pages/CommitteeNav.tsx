"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Leadership", href: "/committee/" },
  { label: "Advisory", href: "/committee/advisory/" },
  { label: "Technical", href: "/committee/technical/" },
  { label: "Organizing", href: "/committee/organizing/" },
  { label: "Publicity", href: "/committee/publicity/" },
];

export function CommitteeNav() {
  const path = usePathname();
  const norm = (p: string) => (p.endsWith("/") ? p : p + "/");
  return (
    <nav aria-label="Committee sections" className="no-scrollbar -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)]">
      <ul className="inline-flex gap-1 rounded-full bg-white p-1 shadow-[0_10px_30px_-14px_rgb(10_33_41/0.25)]">
        {tabs.map((t) => {
          const active = norm(path) === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-signal text-navy" : "text-navy/70 hover:bg-gray hover:text-navy"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
