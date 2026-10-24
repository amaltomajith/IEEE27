"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { site } from "@/content/site";
import { PillButton } from "@/components/ui/PillButton";

/** Navy block that opens from an inset clip as it scrolls in. */
export function CtaBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 35%"] });
  const inset = useTransform(scrollYProgress, [0, 1], [8, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [80, 40]);
  const clip = useTransform([inset, radius], ([i, r]) => `inset(0 ${i}% round ${r}px)`);

  return (
    <section className="pb-[clamp(80px,10vw,170px)]">
      <motion.div ref={ref} suppressHydrationWarning style={reduce ? undefined : { clipPath: clip }} className="tint-a relative mx-[clamp(8px,1.4vw,24px)] overflow-hidden rounded-[var(--radius-l)] ring-1 ring-amber/20 py-[clamp(80px,12vw,200px)] text-ink">
        <div className="wrap relative">
          <h2 className="t-xl max-w-[9ch] font-medium">
            Questions? Say <span className="em text-brand-ink">hello.</span>
          </h2>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <PillButton href="/contact/" variant="dark">Contact the team</PillButton>
            {/* Breaks only at the @ on narrow screens, never mid-word. */}
            <a href={`mailto:${site.email}`} className="text-lg text-ink/75 underline decoration-brand decoration-2 underline-offset-[6px] [overflow-wrap:anywhere] hover:text-brand-deep max-sm:text-base">
              {site.email.split("@")[0]}
              <wbr />@{site.email.split("@")[1]}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
