"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { Hands } from "@/components/scene/Hands";
import { onFrame } from "@/lib/frame";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// One scale for the whole pinned scroll (0..1). The stage is 100svh and overlaps the hero by 100svh of the
// section's 310svh, so the hero ends at 100/210 at every viewport and these stay in step with the card.
const HANDS_FROM = 0.1; // the hands start gliding in as the card begins to lift
const LINE_A_IN: [number, number] = [0.24, 0.36]; // in the space the card leaves
const LINE_A_OUT: [number, number] = [0.62, 0.74];
const LINE_B_IN: [number, number] = [0.68, 0.82]; // crosses line A and lands on the touch, so the stage never sits without words
const REST_POLL = 350; // ms between checks for a pause in the scroll

/**
 * "Reach": the poster's two hands, machine and human, built from the brain's
 * neurons. The stage pins behind the hero's brain card, so the card lifts away
 * over it rather than one section following another. Scrolling on brings the
 * fingertips together; the conference's question turns over as they meet.
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
    let visible = false, failed = false;
    // Building the hands is the page's heaviest single task, so it waits for a pause in the scroll, past the
    // intro. Whoever reaches the stage first (or reduced motion, which has no pin) builds it on the way in.
    const build = () => {
      if (hands.current || failed) return;
      try {
        const h = new Hands({ dense: matchMedia("(pointer: fine)").matches && innerWidth > 900, frozen: still });
        const r = stage.getBoundingClientRect();
        h.warm(r.width, r.height);
        stage.appendChild(h.canvas);
        hands.current = h;
      } catch {
        failed = true;
        setMode("text");
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && still) build();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    let lastY = -1;
    const rest = setInterval(() => {
      const paused = scrollY === lastY && !document.documentElement.classList.contains("is-locked");
      lastY = scrollY;
      if (hands.current || failed) clearInterval(rest);
      else if (paused && !still) build();
    }, REST_POLL);
    const off = onFrame((now) => {
      if (failed) return;
      const p = scrollYProgress.get();
      if (!still) {
        if (p > 0) build();
        const aIn = smooth(LINE_A_IN[0], LINE_A_IN[1], p), aOut = smooth(LINE_A_OUT[0], LINE_A_OUT[1], p), b = smooth(LINE_B_IN[0], LINE_B_IN[1], p);
        if (lineA.current) {
          lineA.current.style.opacity = String(aIn * (1 - aOut));
          lineA.current.style.transform = `translate3d(0, ${(1 - aIn) * 28 - aOut * 28}px, 0)`;
        }
        if (lineB.current) {
          lineB.current.style.opacity = String(b);
          lineB.current.style.transform = `translate3d(0, ${(1 - b) * 28}px, 0)`;
        }
      }
      const h = hands.current;
      if (!h || !visible) return;
      const r = stage.getBoundingClientRect();
      const resized = Math.round(r.width) !== h.w || Math.round(r.height) !== h.h;
      h.setSize(r.width, r.height);
      h.setProgress(still ? 0.9 : Math.max(0, (p - HANDS_FROM) / (1 - HANDS_FROM)));
      // Behind the card there is nothing to see: skip the frame so two scenes never draw at once.
      if (still || resized || !h.atRest) h.render(now);
    });
    return () => {
      off();
      io.disconnect();
      clearInterval(rest);
      hands.current?.dispose();
      hands.current = null;
    };
  }, [scrollYProgress]);

  const pinned = mode === "scroll";
  const final = !pinned;

  return (
    <section ref={sec} className={`relative ${pinned ? "-mt-[100svh] h-[310svh]" : ""}`}>
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
              <p ref={lineA} className={`t-h1 col-start-1 row-start-1 self-end max-w-[13ch] ${final ? "invisible" : ""}`} style={final ? undefined : { opacity: 0 }}>
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
