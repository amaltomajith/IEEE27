"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConferenceLockup } from "./Lockup";
import { PillButton } from "./PillButton";
import { MenuOverlay } from "./MenuOverlay";
import { useMagnetic } from "./Magnetic";
import { site } from "@/content/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [docked, setDocked] = useState(true);
  const pathname = usePathname();
  const menuBtn = useMagnetic<HTMLButtonElement>();
  const sentinel = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  // Stable identity: MenuOverlay's effect depends on it (scroll lock, focus restore).
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Invert the header while a [data-header="dark"] section sits under it.
  useEffect(() => {
    const hits = new Set<Element>();
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => (e.isIntersecting ? hits.add(e.target) : hits.delete(e.target)));
        setDark(hits.size > 0);
      },
      { rootMargin: "0px 0px -94% 0px" },
    );
    const scan = () => document.querySelectorAll('[data-header="dark"]').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  /*
   * The conference name has three homes: the home hero, the nav and the footer ([data-snap] marks the
   * hero and footer copies). It lives in the nav whenever neither is on screen. Moves use the site's
   * own heading reveal: lines rise out of a mask and the gold rule draws in; leaving, they drop away.
   * Only one copy is ever on show, so nothing doubles up mid-move.
   */
  useEffect(() => {
    const seen = new Set<Element>();
    const h = bar.current?.offsetHeight ?? 72;
    const sync = () => setDocked(seen.size > 0);
    // Hero: docked until its name has slid fully under the header. Footer: docked once it is well into view.
    const up = new IntersectionObserver((es) => (es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target))), sync()), {
      rootMargin: `-${h}px 0px 0px 0px`,
    });
    const down = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          e.target.classList.toggle("is-in", e.isIntersecting);
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        });
        sync();
      },
      { rootMargin: "0px 0px -16% 0px" },
    );
    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-snap]").forEach((el) => (el.dataset.snap === "down" ? down : up).observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      up.disconnect();
      down.disconnect();
      mo.disconnect();
      seen.clear();
      setDocked(false);
    };
  }, [pathname]);

  const onDark = dark && !open;
  const inNav = open || !docked;

  return (
    <>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute top-0 h-[60px] w-px" />
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-500 ${
          open
            ? "bg-paper/85 backdrop-blur-xl"
            : !scrolled
            ? ""
            : onDark
              ? "bg-ink/60 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl backdrop-saturate-150"
              : "bg-paper/70 shadow-[0_1px_0_rgb(10_26_64/0.06)] backdrop-blur-xl backdrop-saturate-150"
        }`}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-3">
          <Link
            href="/"
            aria-label={`${site.name}, home`}
            tabIndex={inNav ? undefined : -1}
            className={`min-w-0 transition-colors duration-500 ${inNav ? "" : "pointer-events-none"} ${onDark ? "text-white [&_span]:text-[#a9c0ff]" : "text-ink"}`}
          >
            <ConferenceLockup size="nav" masked className={inNav ? "is-in" : ""} />
          </Link>
          <div className="flex items-center">
            <PillButton href={site.portals.submission} variant={onDark ? "brand" : "light"} className="mr-2 hidden md:inline-flex">
              Submit paper
            </PillButton>
            <button
              ref={menuBtn}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              data-dark={onDark || undefined}
              className={`menu-trigger group inline-flex items-center gap-3 pl-2 text-[15px] font-medium transition-colors ${onDark ? "text-white" : "text-ink"}`}
            >
              <span className="roll max-sm:hidden" aria-hidden>
                <span>{open ? "Close" : "Menu"}</span>
                <span>{open ? "Close" : "Menu"}</span>
              </span>
              <span className="menu-btn" aria-hidden>
                <i />
                <i />
              </span>
            </button>
            {/* The host university arrives with the name; its column opens, so Submit paper and Menu ease left. */}
            <div
              className={`grid transition-[grid-template-columns,opacity] duration-[0.9s] [transition-timing-function:var(--ease-out)] ${inNav ? "grid-cols-[1fr] opacity-100 delay-100" : "grid-cols-[0fr] opacity-0"}`}
            >
              <div className="min-w-0 overflow-hidden">
                <a
                  href={site.universityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={inNav ? undefined : -1}
                  aria-label="CHRIST (Deemed to be University)"
                  className="flex w-max items-center pl-[clamp(10px,1.2vw,18px)]"
                >
                  <span aria-hidden className={`mr-[clamp(10px,1.2vw,18px)] h-8 w-px transition-colors duration-500 ${onDark ? "bg-white/20" : "bg-ink/12"}`} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/brand/christ-logo.webp"
                    alt="CHRIST (Deemed to be University)"
                    width={480}
                    height={153}
                    className={`h-[clamp(24px,2.9vw,44px)] w-auto max-w-none transition-[filter] duration-500 ${onDark ? "brightness-0 invert" : ""}`}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
      <MenuOverlay open={open} onClose={close} />
    </>
  );
}
