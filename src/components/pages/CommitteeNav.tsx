"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Leadership", href: "/committee/" },
  { label: "Advisory", href: "/committee/advisory/" },
  { label: "Technical", href: "/committee/technical/" },
  { label: "Organising", href: "/committee/organizing/" },
];

export function CommitteeNav() {
  const path = usePathname();
  const norm = (p: string) => (p.endsWith("/") ? p : p + "/");
  return (
    <nav aria-label="Committee sections" className="no-scrollbar -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)]">
      <ul className="inline-flex gap-1 rounded-full bg-white p-1 shadow-[0_10px_30px_-14px_rgb(10_26_64/0.25)]">
        {tabs.map((t) => {
          const active = norm(path) === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-brand text-paper" : "text-ink/70 hover:bg-gray hover:text-ink"
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
