"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { tracks } from "@/content/tracks";

const MARQUEE = ["Four tracks", "Twelve sub-tracks", "One shared question"];

function Marquee() {
  const row = (
    <span className="flex shrink-0 items-center">
      {MARQUEE.map((w, i) => (
        <span key={w} className="flex items-center">
          <span className={i === 1 ? "em" : ""}>{w}</span>
          <span aria-hidden className="node mx-[0.6em] translate-y-[-0.08em] text-[0.32em]" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden py-[clamp(24px,4vw,56px)]" aria-hidden>
      <div className="marquee t-xl font-medium whitespace-nowrap">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}

function Cards() {
  return (
    <>
      <li className="flex w-[min(78vw,420px)] shrink-0 snap-start flex-col justify-between rounded-[var(--radius-l)] bg-gray p-[clamp(24px,2.6vw,44px)] md:h-[min(74vh,700px)]">
        <h2 className="t-h2">
          Pick your <span className="em">track</span>
        </h2>
        <div className="mt-16">
          <p className="max-w-[28ch] text-navy/75">Every department runs its own call for papers, peer review and publication route.</p>
          <span className="mt-6 inline-grid size-20 place-items-center rounded-full bg-signal-soft text-2xl font-semibold text-signal-deep ring-1 ring-signal/30">12</span>
        </div>
      </li>
      {tracks.map((t) => (
        <li key={t.slug} className="w-[min(84vw,520px)] shrink-0 snap-start md:h-[min(74vh,700px)] md:w-[min(40vw,520px)]">
          <Link href={`/thematic-tracks/${t.slug}/`} className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-l)] bg-white text-navy ring-1 ring-navy/[0.06] transition-shadow duration-500 hover:shadow-[0_24px_60px_-30px_rgb(10_33_41/0.3)]">
            <div className="relative aspect-[16/10] shrink-0 overflow-hidden md:aspect-auto md:flex-1">
              <Image src={t.poster} alt={`${t.short} track poster`} fill sizes="(min-width:768px) 40vw, 84vw" className="object-cover object-top transition duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-105" />
              <span className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-signal text-navy shadow-lg transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-45">
                <ArrowUpRight size={20} weight="bold" />
              </span>
            </div>
            <div className="p-[clamp(20px,2vw,32px)]">
              <p className="text-sm text-muted">{t.short}</p>
              <h3 className="mt-1 text-[clamp(19px,1.45vw,24px)] leading-snug font-medium tracking-[-0.01em]">{t.title}</h3>
              <ul className="mt-4 flex flex-col gap-1 text-[14px] text-navy/70">
                {t.subTracks.map((s) => (
                  <li key={s.number} className="flex gap-3">
                    <span className="mono w-6 shrink-0 text-signal-ink">{String(s.number).padStart(2, "0")}</span>
                    {s.title}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        </li>
      ))}
      <li className="w-[min(78vw,380px)] shrink-0 snap-start md:h-[min(74vh,700px)]">
        <Link href="/thematic-tracks/" className="group flex h-full min-h-[300px] flex-col justify-between rounded-[var(--radius-l)] bg-signal p-[clamp(24px,2.6vw,44px)]">
          <p className="t-h2">
            All <span className="em">tracks</span>
          </p>
          <span className="grid size-16 place-items-center self-end rounded-full bg-navy text-signal transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight size={26} weight="bold" />
          </span>
        </Link>
      </li>
    </>
  );
}

export function TracksSection() {
  const target = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [dist, setDist] = useState(0);
  const [pin, setPin] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  useEffect(() => {
    const mq = matchMedia("(min-width: 768px)");
    const measure = () => {
      const p = mq.matches && !reduce;
      setPin(p);
      if (track.current) setDist(p ? Math.max(0, track.current.scrollWidth - innerWidth) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, [reduce]);

  return (
    <div className="relative">
      <Marquee />
      <section ref={target} aria-label="Thematic tracks" style={pin ? { height: `calc(100vh + ${dist}px)` } : undefined}>
        <div className={pin ? "sticky top-0 flex h-screen items-center overflow-hidden" : ""}>
          <motion.ul
            ref={track}
            style={pin ? { x } : undefined}
            className={`flex gap-3 px-[var(--gutter)] ${pin ? "" : "snap-x snap-mandatory overflow-x-auto pb-6 [scrollbar-width:none]"}`}
          >
            <Cards />
          </motion.ul>
        </div>
      </section>
    </div>
  );
}
