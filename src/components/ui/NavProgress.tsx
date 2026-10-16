"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin aqua bar at the top of the viewport: starts on any click on an internal
 * link to another page and completes when the new route renders, so a slow
 * navigation never reads as a dead click.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const loading = useRef(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      loading.current = true;
      setState("loading");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!loading.current) return;
    loading.current = false;
    setState("done");
    const t = setTimeout(() => setState("idle"), 450);
    return () => clearTimeout(t);
  }, [pathname]);

  // Safety: never leave the bar hanging.
  useEffect(() => {
    if (state !== "loading") return;
    const t = setTimeout(() => {
      loading.current = false;
      setState("idle");
    }, 10000);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-[3px]">
      <div
        className="h-full origin-left bg-signal shadow-[0_0_12px_rgb(34_216_200/0.7)]"
        style={{
          transform: `scaleX(${state === "idle" ? 0 : state === "loading" ? 0.82 : 1})`,
          opacity: state === "idle" ? 0 : 1,
          transition:
            state === "loading"
              ? "transform 2.6s cubic-bezier(.08,.6,.2,1), opacity .15s ease"
              : state === "done"
                ? "transform .25s ease-out, opacity .3s ease .2s"
                : "none",
        }}
      />
    </div>
  );
}
