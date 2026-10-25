"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Monitor } from "@phosphor-icons/react/dist/ssr";
import { HeroEngine } from "./engine";
import { Loader, LOADER_SKEW } from "./Loader";
import { CampusFilmBeside, filmReady } from "@/components/home/CampusFilm";
import { Countdown } from "@/components/home/Countdown";
import { ThinkingSystem } from "@/components/scene/ThinkingSystem";
import { Field } from "@/components/ui/Field";
import { ConferenceLockup } from "@/components/ui/Lockup";
import { PillButton } from "@/components/ui/PillButton";
import { onFrame } from "@/lib/frame";
import { acquireScrollLock } from "@/lib/scroll";
import { clamp } from "@/lib/damp";
import { site, heroCampusPhoto } from "@/content/site";

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
  const engine = useRef<HeroEngine | null>(null);
  const scene = useRef<ThinkingSystem | null>(null);
  const loaderLock = useRef<(() => void) | null>(null);

  const [mode, setMode] = useState<"gl" | "static">("gl");
  const [heroIn, setHeroIn] = useState(false);
  const [loader, setLoader] = useState<"none" | "load" | "out">("none");
  const [open, setOpen] = useState(false);

  const sceneReady = useMemo(() => {
    let resolve!: () => void;
    const p = new Promise<void>((r) => (resolve = r));
    return { p, resolve };
  }, []);

  // The intro holds until the scene is built and the campus film is actually playing.
  const loaderReady = useMemo(() => Promise.all([sceneReady.p, filmReady]), [sceneReady]);

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
      } catch (err) {
        console.warn("[hero] ribbon engine unavailable, using the static slash:", err);
        eng = null;
      }
    }
    engine.current = eng;
    if (eng) {
      const photo = new Image();
      photo.decoding = "async";
      photo.src = heroCampusPhoto;
      eng.setPhoto(photo);
    }

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
        loaderTimeout = setTimeout(() => loaderLock.current?.(), 11000);
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
      const isOpen = !engine.current || slotEl.classList.contains("is-open");
      if (!visible || !isOpen) return;
      const r = slotEl.getBoundingClientRect();
      s.setSize(r.width, r.height);
      s.setMix(clamp((innerHeight * 0.5 - (r.top + r.height / 2)) / (innerHeight * 0.8)) * 0.35);
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

  const showCard = open || mode === "static";

  return (
    <>
      <section ref={root} id="hero" className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[100svh]">
          <Field />
        </div>
        {/* Campus film in the space right of the slash. */}
        <CampusFilmBeside />
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
                className="absolute top-[30svh] left-[82vw] h-[26svh] w-[15.6vw] -translate-x-1/2 -translate-y-1/2 -skew-x-[22deg] overflow-hidden rounded-[1.2svh] bg-brand md:top-[50svh] md:left-[57vw] md:h-[66svh] md:w-[14svh]"
              >
                {/* Same campus window as the WebGL slash: photo upright, bar slanted over it. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroCampusPhoto} alt="" className="absolute inset-y-0 left-1/2 h-full w-[400%] max-w-none -translate-x-1/2 skew-x-[22deg] object-cover" />
                <span className="absolute inset-0 bg-brand/45 mix-blend-multiply" />
              </span>
            )}
            {/* Lockup: conference label, title, theme line. */}
            <div className="relative my-auto">
              {/* Conference identity: the full event name leads, the host university sits under it.
                  It is the first dock for the name, which snaps into the nav once scrolled past. */}
              <div className="fade-up mb-[clamp(18px,3vh,40px)]">
                {/* The host's mark, part of the page: it scrolls away with the hero rather than riding in the nav. */}
                <a href={site.universityUrl} target="_blank" rel="noopener noreferrer" aria-label="CHRIST (Deemed to be University)" data-host-mark className="mb-[clamp(14px,2.4vh,28px)] block w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/brand/christ-logo.webp" alt="CHRIST (Deemed to be University)" width={480} height={153} className="h-[clamp(40px,4.6vw,68px)] w-auto" />
                </a>
                <div data-snap="up" className="w-fit">
                  <ConferenceLockup size="hero" host className="text-ink" />
                </div>
              </div>
              <h1 className="t-xl relative pb-[0.06em] font-semibold">
                <span className="line-mask">
                  <span>
                    Mind <span className="em">and</span>
                  </span>
                </span>
                <span className="line-mask">
                  <span>Machine</span>
                </span>
              </h1>
              <p className="fade-up mt-[clamp(14px,2.2vh,28px)] flex max-w-[34ch] items-start gap-4 text-[clamp(18px,1.55vw,26px)] leading-[1.35] text-ink/85 max-md:max-w-[62vw] max-md:text-[17px]">
                <span aria-hidden className="mt-[0.12em] inline-block h-[1.15em] w-[0.32em] shrink-0 -skew-x-[22deg] rounded-[3px] bg-[linear-gradient(180deg,var(--color-brand),var(--color-royal))]" />
                <span>Reimagining Human-AI Collaboration Across Sectors.</span>
              </p>
            </div>
            <div className="fade-up mt-10 flex flex-wrap items-end justify-between gap-8">
              <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
                <Countdown />
                <div className="flex items-center gap-3">
                  <span className="grid size-[clamp(44px,3.4vw,56px)] shrink-0 place-items-center rounded-[14px] bg-amber text-navy">
                    <Monitor size={24} weight="duotone" />
                  </span>
                  <p className="leading-tight">
                    <span className="block font-display text-[clamp(22px,1.8vw,30px)] leading-none font-medium">Hybrid Mode</span>
                    <span className="text-sm text-muted">Online + offline, {site.dates}</span>
                  </p>
                </div>
              </div>
              <PillButton href="/thematic-tracks/" variant="brand">View Tracks</PillButton>
            </div>
          </div>

          <div ref={introBlock} className="wrap pt-[clamp(90px,16vh,200px)] pb-[clamp(40px,8vh,100px)]">
            <p ref={introText} className="max-w-[34em] text-[clamp(20px,1.6vw,28px)] leading-[1.5] text-ink/90 max-md:pr-[20vw] md:max-w-[30em]">
              {site.short} brings engineering, business and psychology into one room to study the human side of intelligent systems.
            </p>
          </div>

          <div className="wrap pb-[clamp(60px,12vh,160px)]">
            <div ref={slot} id="slot" className="relative mx-auto aspect-video max-h-[78vh] w-full max-w-[1400px] rounded-[2.2vh] max-sm:aspect-square">
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
                aria-hidden={!showCard}
                className={`pointer-events-none absolute inset-0 flex flex-col justify-between rounded-[inherit] p-[clamp(20px,3vw,48px)] text-ink ring-1 ring-ink/[0.07] ring-inset transition-opacity duration-700 ${showCard ? "opacity-100" : "opacity-0"}`}
              >
                <p className="text-sm text-muted max-sm:hidden">Click a neuron to send a thought. Hold to watch the machine think.</p>
                <div className="mt-auto flex items-end justify-between gap-6 max-sm:justify-end">
                  <p className="t-h2 font-medium max-sm:hidden">
                    Mind <span className="em">and</span> Machine
                  </p>
                  {/* The theme on the card leads to the vision behind it. */}
                  <div className={showCard ? "pointer-events-auto" : "pointer-events-none"}>
                    <PillButton href="/about/" variant="dark" tabIndex={showCard ? 0 : -1}>
                      Read the Vision
                    </PillButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loader !== "none" && <Loader ready={loaderReady} onComplete={onLoaderDone} phase={loader === "out" ? "out" : "load"} />}
    </>
  );
}
