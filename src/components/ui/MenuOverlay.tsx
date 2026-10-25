"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { nav, navGroups, site } from "@/content/site";
import { venue } from "@/content/venue";
import { milestones } from "@/content/dates";
import { acquireScrollLock } from "@/lib/scroll";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Countdown } from "@/components/home/Countdown";
import { PillButton } from "./PillButton";
import { MailLink } from "./MailLink";
import { useNextDeadline } from "./NextDeadline";
import { keep } from "@/lib/keep";
import { EmailText } from "@/components/ui/EmailText";

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

  // Header closes the menu once the new route has rendered (pathname change), so the menu never
  // drops back onto the old page. Safety net for a stalled client navigation: load the page outright.
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => location.assign(pending), 15000);
    return () => clearTimeout(t);
  }, [pending]);

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

  const next = useNextDeadline();
  const after = next?.m ? milestones[milestones.indexOf(next.m) + 1] : undefined;
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
          // Lenis stops the page while the menu is open and would swallow this panel's own scroll too.
          data-lenis-prevent
          className="glow-bottom fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-paper text-ink"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduce ? 0.2 : 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="wrap grid min-h-full gap-12 pt-[calc(var(--header-h)+3vh)] pb-12 max-md:pt-[calc(var(--header-h)+8px)] lg:grid-cols-[1.4fr_1fr]">
            <nav aria-label="Primary" className="grid content-start">
              {navGroups.map((group, g) => (
                <section
                  key={group.title}
                  aria-labelledby={`menu-group-${g}`}
                  className="grid border-t border-ink/15 pt-2 pb-[clamp(8px,1.4vh,16px)] max-md:pt-1 max-md:pb-2 lg:grid-cols-[10.5rem_1fr] lg:gap-4"
                >
                  <motion.p
                    id={`menu-group-${g}`}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + g * 0.08, duration: 0.8, ease }}
                    className="flex items-baseline gap-2.5 whitespace-nowrap pt-[clamp(10px,1.6vh,16px)] text-xs font-semibold tracking-[0.18em] text-amber-ink uppercase max-lg:pb-1"
                  >
                    <span className="mono text-[13px] tracking-normal text-ink/35">{String(g + 1).padStart(2, "0")}</span>
                    {group.title}
                  </motion.p>
                  <ul className="grid divide-y divide-ink/[0.07]">
                    {group.items.map((item) => {
                      const i = nav.indexOf(item);
                      const current = norm(item.href) === norm(pathname);
                      return (
                        <motion.li
                          key={item.href}
                          initial={reduce ? false : { y: 24, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.22 + i * 0.035, duration: 0.8, ease }}
                          className={`py-[clamp(4px,0.8vh,9px)] max-md:py-[3px] transition-opacity duration-300 ${pending && pending !== item.href ? "opacity-35" : ""}`}
                        >
                          <Link
                            href={item.href}
                            onClick={go(item.href)}
                            aria-busy={pending === item.href || undefined}
                            aria-current={current ? "page" : undefined}
                            className={`group flex items-center gap-5 font-display text-[clamp(28px,min(3.2vw,4.4vh),46px)] leading-[1.1] max-md:text-[26px] font-semibold transition-colors duration-300 ${current ? "text-royal italic" : pending === item.href ? "text-brand-ink" : "text-ink"} hover:text-royal`}
                          >
                            <span className="transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-2">
                              {item.label}
                            </span>
                            {pending === item.href ? (
                              <span aria-hidden className="ml-auto block h-[2px] w-8 overflow-hidden rounded-full bg-ink/10">
                                <span className="block h-full w-1/2 animate-[navload_0.9s_ease-in-out_infinite] rounded-full bg-brand" />
                              </span>
                            ) : (
                              <ArrowUpRight
                                aria-hidden
                                size={22}
                                weight="bold"
                                className="ml-auto -translate-x-3 text-amber opacity-0 transition duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-0 group-hover:opacity-100 max-md:hidden"
                              />
                            )}
                          </Link>
                          {item.children && (
                            <ul aria-label={`${item.label} pages`} className="mt-1.5 mb-0.5 flex flex-wrap gap-1.5">
                              {item.children.map((c) => {
                                const on = norm(c.href) === norm(pathname);
                                return (
                                  <li key={c.href}>
                                    <Link
                                      href={c.href}
                                      onClick={go(c.href)}
                                      aria-busy={pending === c.href || undefined}
                                      aria-current={on ? "page" : undefined}
                                      className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ring-1 transition-colors duration-300 ${on ? "bg-royal text-white ring-royal" : pending === c.href ? "bg-brand/10 text-brand-ink ring-brand/30" : "text-ink/70 ring-ink/[0.12] hover:bg-white hover:text-brand-ink hover:ring-brand/30"}`}
                                    >
                                      {c.label}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </nav>
            <motion.aside
              aria-label="Conference at a glance"
              className="flex flex-col gap-3"
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9, ease }}
            >
              {/* Countdown, level with the first menu item. */}
              <div className="navy-grad relative overflow-hidden rounded-[var(--radius-l)] p-[clamp(20px,2vw,32px)] text-white">
                <Countdown label="IIC 2027 Begins In" dark stretch />
                <p className="mt-5 text-sm text-white/70">{keep(site.dates)}, {site.mode}</p>
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/important-dates/"
                  onClick={go("/important-dates/")}
                  className="group relative flex min-h-[176px] flex-col justify-between rounded-[var(--radius-m)] bg-white p-5 ring-1 ring-ink/[0.06] transition hover:ring-brand/30"
                >
                  <span className="text-xs font-semibold tracking-[0.18em] text-amber-ink uppercase">Next Deadline</span>
                  {next?.m ? (
                    <span className="mt-6 flex flex-col gap-5 [@media(max-height:760px)]:mt-3">
                      <span>
                        <span className="block font-display text-[clamp(24px,1.9vw,32px)] leading-[1.1] font-semibold">{next.m.label}</span>
                        <span className="mt-1 block text-sm text-muted">
                          {keep(next.m.display)}, {next.days === 0 ? "today" : `in ${next.days} day${next.days === 1 ? "" : "s"}`}
                        </span>
                      </span>
                      {after && (
                        <span className="border-t border-ink/10 pt-4 text-sm text-muted [@media(max-height:760px)]:hidden">
                          Then <span className="font-display text-[17px] font-semibold text-ink">{after.label}</span>, {keep(after.display)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="block h-12 w-3/4 animate-pulse rounded-lg bg-ink/5" />
                  )}
                  <ArrowUpRight aria-hidden size={20} className="absolute top-5 right-5 text-brand transition-transform group-hover:rotate-45" />
                </Link>
                <Link
                  href="/venue/"
                  onClick={go("/venue/")}
                  className="group relative flex min-h-[176px] flex-col overflow-hidden rounded-[var(--radius-m)] bg-white ring-1 ring-ink/[0.06] transition hover:ring-brand/30"
                >
                  <span className="relative block min-h-[92px] flex-1 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/venue/campus-poster.webp" alt="" width={960} height={260} className="absolute inset-0 size-full object-cover object-[50%_65%] transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-105" />
                  </span>
                  <span className="flex flex-col p-5 pt-3">
                    <span className="text-xs font-semibold tracking-[0.18em] text-amber-ink uppercase">Venue</span>
                    <span className="mt-1 block font-display text-[clamp(18px,1.3vw,21px)] leading-[1.15] font-semibold">{keep(venue.name)}</span>
                  </span>
                </Link>
              </div>

              {/* Directly under the cards, so short laptop screens see it without scrolling the menu. */}
              <div className="mt-2 flex flex-wrap items-end justify-between gap-5 border-t border-ink/10 pt-4">
                  <div className="min-w-0">
                    <p className="text-sm text-muted">Write to Us</p>
                    <MailLink to={site.email} className="block font-display text-[clamp(19px,1.4vw,23px)] font-semibold [font-variant-numeric:lining-nums] [overflow-wrap:anywhere] hover:text-brand-ink">
                      <EmailText email={site.email} />
                    </MailLink>
                  </div>
                  {/* The header carries Submit paper on desktop; phones get it here. */}
                  <PillButton href={site.portals.submission} variant="brand" className="md:hidden">Submit Paper</PillButton>
              </div>
            </motion.aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
