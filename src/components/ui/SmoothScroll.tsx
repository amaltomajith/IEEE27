"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { getLenis, setLenis } from "@/lib/scroll";
import { tickFrame } from "@/lib/damp";
import { runFrame } from "@/lib/frame";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduce ? null : new Lenis({ lerp: 0.11, wheelMultiplier: 1.1, smoothWheel: true });
    setLenis(lenis);
    let raf = 0;
    const loop = (t: number) => {
      tickFrame(t);
      lenis?.raf(t);
      runFrame(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  // App Router navigation: Lenis keeps its own animated scroll target, so a new page
  // can open mid-scroll or snap back. Reset it, then re-measure the new page height.
  useEffect(() => {
    const l = getLenis();
    if (!l) return;
    l.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => l.resize());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
