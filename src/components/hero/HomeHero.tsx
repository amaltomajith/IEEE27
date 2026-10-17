"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowsOutSimple } from "@phosphor-icons/react/dist/ssr";
import { HeroEngine } from "./engine";
import { Loader, LOADER_SKEW } from "./Loader";
import { Counter } from "./Counter";
import { ThinkingSystem } from "@/components/scene/ThinkingSystem";
import { Takeover, type Rect } from "@/components/scene/Takeover";
import { Field } from "@/components/ui/Field";
import { PillButton } from "@/components/ui/PillButton";
import { onFrame } from "@/lib/frame";
import { acquireScrollLock } from "@/lib/scroll";
import { clamp } from "@/lib/damp";
import { site } from "@/content/site";

const INTRO_KEY = "iic-intro-seen";

/**
 * Press-and-hold that survives touch scrolling: mouse/pen hold immediately; touch
 * only counts after 280ms without moving more than 8px. Any cancel releases.
 */
function useHold(onHold: (on: boolean) => void, onTap: () => void) {
  const st = useRef({ id: -1, x: 0, y: 0, timer: 0 as unknown as ReturnType<typeof setTimeout>, held: false });
  const release = useCallback(() => {
    const s = st.current;
    clearTimeout(s.timer);
    if (s.held) onHold(false);
    s.held = false;
    s.id = -1;
  }, [onHold]);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      const s = st.current;
      s.id = e.pointerId;
      s.x = e.clientX;
      s.y = e.clientY;
      onTap();
      const go = () => {
        s.held = true;
        onHold(true);
      };
      if (e.pointerType === "touch") s.timer = setTimeout(go, 280);
      else go();
    },
    onPointerMove: (e: React.PointerEvent) => {
      const s = st.current;
      if (s.id === e.pointerId && !s.held && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) release();
    },
    onPointerUp: release,
    onPointerCancel: release,
    onPointerLeave: release,
    onLostPointerCapture: release,
  };
}

export function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const introText = useRef<HTMLParagraphElement>(null);
  const introBlock = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const sceneHost = useRef<HTMLDivElement>(null);
  const takeHost = useRef<HTMLDivElement>(null);
  const engine = useRef<HeroEngine | null>(null);
  const scene = useRef<ThinkingSystem | null>(null);
  const takeRef = useRef(false);
  const loaderLock = useRef<(() => void) | null>(null);

  const [mode, setMode] = useState<"gl" | "static">("gl");
  const [heroIn, setHeroIn] = useState(false);
  const [loader, setLoader] = useState<"none" | "load" | "out">("none");
  const [open, setOpen] = useState(false);
  const [take, setTake] = useState<Rect | null>(null);

  const sceneReady = useMemo(() => {
    let resolve!: () => void;
    const p = new Promise<void>((r) => (resolve = r));
    return { p, resolve };
  }, []);

  const setHold = useCallback((on: boolean) => scene.current?.setHold(on), []);
  const poke = useCallback(() => scene.current?.poke(), []);
  const hold = useHold(setHold, poke);

  useEffect(() => {
    // Capture elements once: React clears refs on unmount before passive-effect
    // cleanup runs, and a frame can fire in between.
    const slotEl = slot.current!, hostEl = sceneHost.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
    let ts: ThinkingSystem | null = null;
    try {
      ts = new ThinkingSystem({ dense: fine && innerWidth > 900, frozen: reduce });
      hostEl.appendChild(ts.canvas);
      const r = slotEl.getBoundingClientRect();
      ts.setSize(r.width, r.height);
      ts.render(performance.now());
    } catch {
      ts = null;
    }
    scene.current = ts;
    sceneReady.resolve();

    let eng: HeroEngine | null = null;
    if (!reduce) {
      try {
        eng = new HeroEngine({ root: root.current!, canvas: canvas.current!, introText: introText.current!, introBlock: introBlock.current!, slot: slotEl });
      } catch {
        eng = null;
      }
    }
    engine.current = eng;

    let loaderTimeout: ReturnType<typeof setTimeout> | undefined;
    if (!eng) {
      setMode("static");
      setHeroIn(true);
      setOpen(true);
    } else {
      if (ts) {
        const s = ts;
        eng.texSource = {
          canvas: s.canvas,
          render: (now) => {
            const r = slotEl.getBoundingClientRect();
            s.setSize(r.width, r.height);
            s.render(now);
          },
          width: () => s.canvas.width,
          height: () => s.canvas.height,
        };
      }
      eng.onOpenChange = setOpen;
      eng.start();
      let seen = false;
      try {
        seen = sessionStorage.getItem(INTRO_KEY) === "1";
      } catch {
        /* storage blocked: play the intro */
      }
      if (!seen && scrollY < innerHeight * 0.15) {
        try {
          history.scrollRestoration = "manual";
        } catch {}
        scrollTo(0, 0);
        loaderLock.current = acquireScrollLock();
        // The loader owns this lock; the timeout only ever releases the loader's own token.
        loaderTimeout = setTimeout(() => loaderLock.current?.(), 9000);
        setLoader("load");
      } else {
        eng.intro = 1;
        setHeroIn(true);
      }
    }

    // Render the scene directly while the card is open (the engine only renders it during power-up).
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(slotEl);
    const off = onFrame((now) => {
      const s = scene.current;
      if (!s) return;
      const taking = takeRef.current;
      const isOpen = !engine.current || slotEl.classList.contains("is-open");
      if (!taking && (!visible || !isOpen)) return;
      if (taking) {
        s.setSize(innerWidth, innerHeight);
        s.setMix(0);
      } else {
        const r = slotEl.getBoundingClientRect();
        s.setSize(r.width, r.height);
        s.setMix(clamp((innerHeight * 0.5 - (r.top + r.height / 2)) / (innerHeight * 0.8)) * 0.35);
      }
      s.render(now);
    });

    return () => {
      off();
      io.disconnect();
      clearTimeout(loaderTimeout);
      loaderLock.current?.();
      loaderLock.current = null;
      eng?.destroy();
      ts?.dispose();
    };
  }, [sceneReady]);

  const onLoaderDone = useCallback((slash: HTMLElement) => {
    const eng = engine.current;
    loaderLock.current?.();
    loaderLock.current = null;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    if (!eng) {
      setHeroIn(true);
      setLoader("none");
      return;
    }
    setLoader("out");
    eng.handoff(slash, LOADER_SKEW, () => setHeroIn(true), () => setLoader("none"));
  }, []);

  const pointer = (e: React.PointerEvent<HTMLElement>, el: HTMLElement | null) => {
    if (!el || !scene.current) return;
    const r = el.getBoundingClientRect();
    scene.current.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1), true);
  };

  const enter = () => {
    const el = slot.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    takeRef.current = true;
    scene.current?.setFocus(1);
    scene.current?.setHold(false);
    setTake({ top: r.top, left: r.left, width: r.width, height: r.height, radius: innerHeight * 0.022 });
  };

  useEffect(() => {
    if (take && takeHost.current && scene.current) takeHost.current.appendChild(scene.current.canvas);
  }, [take]);

  const close = useCallback(() => {
    scene.current?.setFocus(0);
    scene.current?.setHold(false);
    setTake(null);
  }, []);

  const showCard = open || mode === "static";

  return (
    <>
      <section ref={root} id="hero" className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[100svh]">
          <Field />
        </div>
        {mode === "gl" && (
          <div aria-hidden className="pointer-events-none sticky top-0 z-[1] -mb-[100lvh] h-[100lvh]">
            <canvas ref={canvas} className="block size-full" />
          </div>
        )}

        <div className="relative z-[2]">
          <div className={`wrap relative flex min-h-[100svh] flex-col pt-[calc(var(--header-h)+clamp(24px,6vh,80px))] pb-[clamp(28px,6vh,80px)] ${heroIn ? "is-in" : ""}`}>
            {mode === "static" && (
              <span
                aria-hidden
                className="absolute top-[38svh] left-[62vw] h-[30svh] w-[15.6vw] -translate-x-1/2 -translate-y-1/2 -skew-x-[22deg] rounded-[1.2svh] bg-signal md:top-[50svh] md:left-[57vw] md:h-[66svh] md:w-[14svh]"
              />
            )}
            <h1 className="t-xl relative my-auto pb-[0.06em] font-semibold">
              <span className="sr-only">{site.short}: </span>
              <span className="line-mask">
                <span>
                  <span className="grad-text">Mind</span> and
                </span>
              </span>
              <span className="line-mask">
                <span className="em text-[1.12em] leading-[1.08]">Machine</span>
              </span>
            </h1>
            <div className="fade-up mt-10 flex flex-wrap items-end justify-between gap-8">
              <div className="flex flex-col gap-5 md:max-w-[46%]">
                <Counter />
                <p className="t-h5 max-w-[34ch] text-navy/85">
                  Reimagining human-AI collaboration across sectors. {site.dates}, Bengaluru and online.
                </p>
              </div>
              <PillButton href="/thematic-tracks/" variant="signal">View tracks</PillButton>
            </div>
          </div>

          <div ref={introBlock} className="wrap pt-[clamp(90px,16vh,200px)] pb-[clamp(40px,8vh,100px)]">
            <p ref={introText} className="max-w-[34em] text-[clamp(20px,1.6vw,28px)] leading-[1.5] text-navy/90 max-md:pr-[20vw] md:max-w-[30em]">
              {site.tagline} {site.short} brings engineering, business and psychology into one room to study the human side of intelligent systems.
            </p>
            <div className="mt-8">
              <PillButton href="/about/" variant="ghost">About IIC 2027</PillButton>
            </div>
          </div>

          <div className="wrap pb-[clamp(60px,12vh,160px)]">
            <div ref={slot} id="slot" className="relative mx-auto aspect-video max-h-[78vh] w-full max-w-[1400px] rounded-[2.2vh]">
              <div
                ref={sceneHost}
                className={`absolute inset-0 touch-pan-y overflow-hidden rounded-[inherit] bg-paper transition-opacity duration-500 [&>canvas]:block [&>canvas]:size-full ${showCard ? "opacity-100" : "pointer-events-none opacity-0"}`}
                {...hold}
                onPointerMove={(e) => {
                  pointer(e, sceneHost.current);
                  hold.onPointerMove(e);
                }}
                onPointerDown={(e) => {
                  pointer(e, sceneHost.current);
                  hold.onPointerDown(e);
                }}
                onPointerLeave={(e) => {
                  scene.current?.setPointer(0, 0, false);
                  hold.onPointerLeave();
                  void e;
                }}
              />
              <div
                aria-hidden={!showCard || !!take}
                className={`pointer-events-none absolute inset-0 flex flex-col justify-between rounded-[inherit] p-[clamp(20px,3vw,48px)] text-navy ring-1 ring-navy/[0.07] ring-inset transition-opacity duration-700 ${showCard && !take ? "opacity-100" : "opacity-0"}`}
              >
                <p className="text-sm text-muted max-sm:hidden">Move to spark a thought. Hold to watch the machine think.</p>
                <div className="flex items-end justify-between gap-6">
                  <p className="t-h2 font-medium max-sm:invisible">
                    Mind and <span className="em text-signal-ink">Machine</span>
                  </p>
                  <div className={showCard && !take ? "pointer-events-auto" : "pointer-events-none"}>
                    <PillButton onClick={enter} variant="dark" tabIndex={showCard && !take ? 0 : -1} icon={<ArrowsOutSimple size={17} weight="bold" />}>
                      Enter
                    </PillButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loader !== "none" && <Loader ready={sceneReady.p} onComplete={onLoaderDone} phase={loader === "out" ? "out" : "load"} />}

      <AnimatePresence
        onExitComplete={() => {
          takeRef.current = false;
          if (scene.current && sceneHost.current) sceneHost.current.appendChild(scene.current.canvas);
        }}
      >
        {take && (
          <Takeover
            key="take"
            from={take}
            hostRef={takeHost}
            onClose={close}
            onPointer={(e) => pointer(e, e.currentTarget)}
            onHold={setHold}
            onPoke={poke}
          />
        )}
      </AnimatePresence>
    </>
  );
}
