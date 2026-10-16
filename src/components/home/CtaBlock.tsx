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
      <motion.div ref={ref} data-header="dark" suppressHydrationWarning style={reduce ? undefined : { clipPath: clip }} className="glow-bottom relative mx-[clamp(8px,1.4vw,24px)] overflow-hidden rounded-[var(--radius-l)] bg-navy py-[clamp(80px,12vw,200px)] text-white">
        <span aria-hidden className="absolute top-[-20%] right-[8%] h-[140%] w-[clamp(60px,8vw,140px)] -skew-x-[22deg] rounded-[clamp(12px,1.4vw,24px)] bg-signal" />
        <div className="wrap relative">
          <h2 className="t-xl max-w-[9ch] font-medium">
            Questions? Say <span className="em text-signal">hello.</span>
          </h2>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <PillButton href="/contact/" variant="signal">Contact the team</PillButton>
            <a href={`mailto:${site.email}`} className="text-lg break-all text-white/80 underline decoration-signal decoration-2 underline-offset-[6px] hover:text-white">
              {site.email}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
