"use client";

import { scrollToTarget } from "@/lib/scroll";

export function BackToTop({ icon }: { icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => scrollToTarget(0)}
      className="inline-flex items-center gap-3 rounded-full bg-navy py-1.5 pr-1.5 pl-5 text-white transition-transform active:scale-95"
    >
      Back to top
      <span className="grid size-9 place-items-center rounded-full bg-white/15 text-amber">{icon}</span>
    </button>
  );
}
