"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { PillButton } from "./PillButton";
import { MenuOverlay } from "./MenuOverlay";
import { useMagnetic } from "./Magnetic";
import { site } from "@/content/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const pathname = usePathname();
  const menuBtn = useMagnetic<HTMLButtonElement>();
  const sentinel = useRef<HTMLDivElement>(null);

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

  const onDark = dark && !open;

  return (
    <>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute top-0 h-[60px] w-px" />
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-500 ${
          open
            ? "bg-paper/85 backdrop-blur-xl"
            : !scrolled
            ? ""
            : onDark
              ? "bg-cocoa/60 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl backdrop-saturate-150"
              : "bg-paper/70 shadow-[0_1px_0_rgb(87_52_32/0.06)] backdrop-blur-xl backdrop-saturate-150"
        }`}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-4">
          <div className={`transition-colors duration-500 ${onDark ? "text-white" : "text-cocoa"}`}>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <PillButton href={site.portals.submission} variant={onDark ? "wine" : "light"} className="hidden md:inline-flex">
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
              className={`menu-trigger group inline-flex items-center gap-3 pl-2 text-[15px] font-medium transition-colors ${onDark ? "text-white" : "text-cocoa"}`}
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
          </div>
        </div>
      </header>
      <MenuOverlay open={open} onClose={close} />
    </>
  );
}
