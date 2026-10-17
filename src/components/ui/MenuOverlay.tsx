"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { nav, site } from "@/content/site";
import { acquireScrollLock } from "@/lib/scroll";
import { PillButton } from "./PillButton";

export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const norm = (p: string) => (p.endsWith("/") ? p : p + "/");

  // Warm every route as soon as the menu opens, so the switch is near-instant.
  useEffect(() => {
    if (!open) {
      setPending(null);
      return;
    }
    nav.forEach((n) => {
      router.prefetch(n.href);
      n.children?.forEach((c) => router.prefetch(c.href));
    });
  }, [open, router]);

  // Header closes the menu once the new route has rendered (pathname change).
  // Safety net: close anyway if navigation stalls.
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [pending, onClose]);

  /** Same page: close now. Other page: keep the menu up until that page is ready. */
  const go = (href: string) => (e: React.MouseEvent) => {
    if (pending) {
      e.preventDefault();
      return;
    }
    if (norm(href) === norm(pathname)) onClose();
    else setPending(href);
  };

  useEffect(() => {
    if (!open) return;
    const release = acquireScrollLock();
    const prev = document.activeElement as HTMLElement | null;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener("keydown", key);
    return () => {
      release();
      removeEventListener("keydown", key);
      prev?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  const tracks = nav.find((n) => n.href === "/thematic-tracks/")!;
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="glow-bottom fixed inset-0 z-40 overflow-y-auto bg-paper text-navy"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduce ? 0.2 : 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="wrap grid min-h-full gap-12 pt-[calc(var(--header-h)+3vh)] pb-12 lg:grid-cols-[1.4fr_1fr]">
            <nav aria-label="Primary">
              <ol className="grid border-t border-navy/10">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={reduce ? false : { y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.22 + i * 0.035, duration: 0.8, ease }}
                    className="border-b border-navy/10"
                  >
                    <Link
                      href={item.href}
                      onClick={go(item.href)}
                      aria-busy={pending === item.href || undefined}
                      className={`group flex items-baseline gap-5 transition-opacity duration-300 ${pending && pending !== item.href ? "opacity-35" : ""}  py-[clamp(6px,1.1vh,12px)] text-[clamp(26px,min(3.4vw,5.2vh),50px)] leading-[1.1] font-medium tracking-[-0.035em] ${pending === item.href ? "text-signal-ink" : "text-navy/80"} hover:text-signal-ink`}
                    >
                      <span className="mono relative w-8 shrink-0 text-[13px] text-muted transition-colors group-hover:text-signal-ink">
                        {pending === item.href ? (
                          <span aria-hidden className="absolute top-1/2 left-0 block h-[2px] w-6 -translate-y-1/2 overflow-hidden rounded-full bg-navy/10">
                            <span className="block h-full w-1/2 animate-[navload_0.9s_ease-in-out_infinite] rounded-full bg-signal" />
                          </span>
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>
                      <span className="transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-2">
                        {item.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <motion.div
              className="flex flex-col justify-end gap-10"
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease }}
            >
              <div>
                <p className="mb-4 text-sm text-muted">Thematic tracks</p>
                <ul className="flex flex-wrap gap-2">
                  {tracks.children!.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} onClick={go(c.href)} className={`inline-flex rounded-full px-4 py-2 ring-1 transition hover:bg-signal hover:text-navy hover:ring-signal ${pending === c.href ? "bg-signal text-navy ring-signal" : "ring-navy/15"}`}>
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1 text-navy/75">
                <p className="text-sm text-muted">Write to us</p>
                <a href={`mailto:${site.email}`} className="block text-lg break-words text-navy hover:text-signal-ink">
                  {site.email}
                </a>
                <p className="pt-2">{site.dates}, {site.mode}</p>
              </div>
              <PillButton href={site.portals.submission} variant="signal" className="self-start">Submit paper</PillButton>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
