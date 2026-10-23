"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { Hands } from "@/components/scene/Hands";
import { onFrame } from "@/lib/frame";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * "Reach": the poster's two hands, machine and human, built from the brain's
 * neurons. Scrolling the pinned stage brings their fingertips together; the
 * conference's question turns over as they meet.
 *
 * Modes: "scroll" (pinned, scrubbed), "still" (reduced motion: one composed frame,
 * no pin) and "text" (no WebGL).
 */
export function ReachSection() {
  const sec = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const lineA = useRef<HTMLParagraphElement>(null);
  const lineB = useRef<HTMLDivElement>(null);
  const hands = useRef<Hands | null>(null);
  const [mode, setMode] = useState<"scroll" | "still" | "text">("scroll");
  const { scrollYProgress } = useScroll({ target: sec, offset: ["start start", "end end"] });

  useEffect(() => {
    const el = sec.current, stage = host.current;
    if (!el || !stage) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) setMode("still");
    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!visible || hands.current) return;
        try {
          hands.current = new Hands({ dense: matchMedia("(pointer: fine)").matches && innerWidth > 900, frozen: still });
          stage.appendChild(hands.current.canvas);
        } catch {
          setMode("text");
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    const off = onFrame((now) => {
      const h = hands.current;
      if (!h || !visible) return;
      const r = stage.getBoundingClientRect();
      h.setSize(r.width, r.height);
      const p = still ? 0.9 : scrollYProgress.get();
      h.setProgress(p);
      h.render(now);
      if (still) return;
      const a = 1 - smooth(0.5, 0.7, p), b = smooth(0.76, 0.9, p);
      if (lineA.current) {
        lineA.current.style.opacity = String(a);
        lineA.current.style.transform = `translate3d(0, ${(1 - a) * -28}px, 0)`;
      }
      if (lineB.current) {
        lineB.current.style.opacity = String(b);
        lineB.current.style.transform = `translate3d(0, ${(1 - b) * 28}px, 0)`;
      }
    });
    return () => {
      off();
      io.disconnect();
      hands.current?.dispose();
      hands.current = null;
    };
  }, [scrollYProgress]);

  const pinned = mode === "scroll";
  const final = !pinned;

  return (
    <section ref={sec} className={`relative ${pinned ? "h-[260svh]" : ""}`}>
      <div className={`${pinned ? "sticky top-0" : "relative"} h-[100svh] overflow-hidden`}>
        <div
          ref={host}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            hands.current?.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
          }}
          onPointerLeave={() => hands.current?.setPointer(0, 0)}
          onClick={() => hands.current?.tap()}
          className="absolute inset-0 [&>canvas]:block [&>canvas]:size-full"
        />
        <div className="pointer-events-none absolute inset-0">
          <div className="wrap flex h-full flex-col justify-end pb-[clamp(36px,9vh,110px)]">
            <div className="grid max-w-[min(100%,900px)]">
              <p ref={lineA} className={`t-h1 col-start-1 row-start-1 self-end max-w-[13ch] ${final ? "invisible" : ""}`}>
                We have asked what AI <span className="em">can do</span>.
              </p>
              <div ref={lineB} className="col-start-1 row-start-1 self-end" style={final ? undefined : { opacity: 0 }}>
                <p className="t-h1 max-w-[19ch]">
                  It is time to ask what AI <span className="bg-[linear-gradient(90deg,var(--color-brand),var(--color-royal))] bg-clip-text pr-[0.06em] italic text-transparent">does to us</span>.
                </p>
                <p className="mt-5 text-[clamp(15px,1.1vw,18px)] text-ink/70">The question at the centre of IIC 2027.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
