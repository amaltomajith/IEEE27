"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { campusVideo } from "@/content/site";
import { SLASH, slashX } from "@/components/hero/slash";

// Sits beside the hero slash (hero/slash.ts), vertically centred on the viewport like it.
const SKEW = Math.tan((SLASH.skewDeg * Math.PI) / 180);
const GAP = 18;

// The intro loader counts the film in: it is the heaviest thing on the page, so the ring should
// only reach 100 once a few seconds of it are buffered and it can play straight through the reveal.
const AHEAD = 2.5;
let film: HTMLVideoElement | null = null;
let filmSettled = typeof window === "undefined";
const settleFilm = () => void (filmSettled = true);

/** 0 to 1: how much of the film's opening the browser holds. 1 also when there is no film to wait on. */
export function filmProgress() {
  const v = film;
  if (filmSettled) return 1;
  if (!v) return 0;
  if (v.readyState >= 4) return 1;
  const end = v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0;
  const p = Math.min(1, end / Math.min(AHEAD, v.duration || AHEAD));
  return v.readyState >= 2 ? p : Math.min(p, 0.9);
}

/**
 * The self-hosted campus loop: muted, inline, no controls. The poster (its first frame) sits
 * underneath, so the space is never empty. It starts from the top once revealed (`live`) and
 * pauses while the hero is off screen.
 */
function Film({ live }: { live: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const started = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    film = v;
    if (reduce) settleFilm();
    // A failed source fires on the <source> element and does not bubble, so listen in the capture phase.
    v.addEventListener("error", settleFilm, true);
    return () => {
      v.removeEventListener("error", settleFilm, true);
      if (film === v) film = null;
    };
  }, [reduce]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !live || reduce) return;
    if (!started.current) {
      started.current = true;
      v.currentTime = 0;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [live, reduce]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="auto"
      poster={campusVideo.poster}
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      // Pinned top-right so the CHRIST mark in the frame's corner stays whole; the slanted edge hides the rest.
      className="absolute inset-0 size-full object-cover object-right-top"
    >
      <source src={campusVideo.webm} type='video/webm; codecs="vp9"' />
      <source src={campusVideo.mp4} type="video/mp4" />
    </video>
  );
}

/**
 * The Kengeri campus film filling the space right of the hero slash: its left edge runs parallel
 * to the slash, the rest bleeds off the viewport. Landscape screens only.
 *
 * It stays shut while the intro's slash travels into the hero, then opens once it lands (`shown`):
 * a brand-blue sheet slides out from the slash's edge, front parallel to it, and clears to the film.
 */
export function CampusFilmBeside({ shown }: { shown: boolean }) {
  const [geo, setGeo] = useState<{ left: number; top: number; w: number; h: number; t: number; clip: string } | null>(null);
  // Already open on mount (intro seen, reduced motion, static hero): no reveal.
  const [settled, setSettled] = useState(shown);
  const wasShut = useRef(false);

  useEffect(() => {
    const measure = () => {
      const W = document.documentElement.clientWidth, H = innerHeight;
      // Portrait screens (phones) have no room beside the slash: no film, and nothing for the loader to wait on.
      if (W / H < 1) {
        settleFilm();
        return setGeo(null);
      }
      const hero = document.getElementById("hero")?.getBoundingClientRect().top ?? 0;
      const cx = slashX(W, H, hero + scrollY + H / 2), hx = SLASH.hx * H, hy = SLASH.hy * H, r = 0.012 * H;
      const gx = GAP / Math.cos(Math.atan(SKEW));
      const xT = cx + SKEW * hy + hx + gx, xB = cx - SKEW * hy + hx + gx;
      const left = xB, w = W - left, h = 2 * hy, t = xT - left;
      // Unit vector up the slanted edge, for rounding its two corners like the slash.
      const len = Math.hypot(t, h), ux = t / len, uy = -h / len;
      const clip = `path('M ${t + r} 0 L ${w} 0 L ${w} ${h} L ${r} ${h} Q 0 ${h} ${ux * r} ${h + uy * r} L ${t - ux * r} ${-uy * r} Q ${t} 0 ${t + r} 0 Z')`;
      setGeo({ left, top: H / 2 - hy, w, h, t, clip });
    };
    measure();
    // The slash makes room for the headline, so follow it once the display font has loaded.
    document.fonts?.ready.then(measure);
    const late = setTimeout(measure, 1200);
    addEventListener("resize", measure);
    return () => {
      clearTimeout(late);
      removeEventListener("resize", measure);
    };
  }, []);

  // Only a panel that was actually painted shut plays the reveal; one opened before it ever showed just appears.
  useEffect(() => {
    if (!geo) return;
    if (!shown) wasShut.current = true;
    else if (!wasShut.current) setSettled(true);
  }, [geo, shown]);

  if (!geo) return null;
  const { w, h, t } = geo;
  // The reveal front, d px out from the slanted edge and parallel to it. Shut sits just outside the
  // edge (d < 0), so not even an antialiased hairline shows.
  const front = (d: number) => `polygon(-12px 0, ${t + d}px 0, ${d}px ${h}px, -12px ${h}px)`;
  const ease = "cubic-bezier(.76,0,.24,1)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-[1] overflow-hidden"
      style={{ left: geo.left, top: geo.top, width: w, height: h, clipPath: geo.clip }}
    >
      <div
        className="absolute inset-0 bg-navy/[0.06]"
        style={settled ? undefined : { clipPath: front(shown ? w + 2 : -6), transition: `clip-path 1.15s ${ease}` }}
        onTransitionEnd={(e) => e.target === e.currentTarget && shown && setSettled(true)}
      >
        <div
          className="absolute inset-0"
          style={settled ? undefined : { transform: shown ? "none" : "scale(1.08)", transformOrigin: "0 50%", transition: `transform 1.8s cubic-bezier(.16,1,.3,1)` }}
        >
          <Film live={shown} />
        </div>
        {!settled && (
          <div
            className="absolute inset-0 bg-brand"
            style={{ opacity: shown ? 0 : 1, transition: `opacity .9s ease .5s` }}
          />
        )}
      </div>
    </div>
  );
}
