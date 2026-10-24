"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { campusVideo } from "@/content/site";

// Must match the hero slash in hero/engine.ts build(): centre .57W/.5H, half-size .07H x .33H, 22deg.
const SKEW = Math.tan((22 * Math.PI) / 180);
const GAP = 18;

let resolveFilm: (() => void) | undefined;
/** Settles once the campus film has a frame on screen, so the intro loader can wait for it. */
export const filmReady: Promise<void> = typeof window === "undefined" ? Promise.resolve() : new Promise((r) => (resolveFilm = r));

/**
 * The self-hosted campus loop: muted, inline, no controls. The poster (its first frame) sits
 * underneath, so the space is never empty, and playback pauses while the hero is off screen.
 */
function Film() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduce) {
      v.pause();
      resolveFilm?.();
      return;
    }
    const ready = () => resolveFilm?.();
    if (v.readyState >= 2) ready();
    v.addEventListener("loadeddata", ready, { once: true });
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("loadeddata", ready);
    };
  }, [reduce]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      autoPlay={!reduce}
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
 */
export function CampusFilmBeside() {
  const [geo, setGeo] = useState<{ left: number; top: number; w: number; h: number; clip: string } | null>(null);

  useEffect(() => {
    const measure = () => {
      const W = document.documentElement.clientWidth, H = innerHeight;
      // Portrait screens (phones) have no room beside the slash: no film, and nothing for the loader to wait on.
      if (W / H < 1) {
        resolveFilm?.();
        return setGeo(null);
      }
      const cx = W * 0.57, hx = 0.07 * H, hy = 0.33 * H, r = 0.012 * H;
      const gx = GAP / Math.cos(Math.atan(SKEW));
      const xT = cx + SKEW * hy + hx + gx, xB = cx - SKEW * hy + hx + gx;
      const left = xB, w = W - left, h = 2 * hy, t = xT - left;
      // Unit vector up the slanted edge, for rounding its two corners like the slash.
      const len = Math.hypot(t, h), ux = t / len, uy = -h / len;
      const clip = `path('M ${t + r} 0 L ${w} 0 L ${w} ${h} L ${r} ${h} Q 0 ${h} ${ux * r} ${h + uy * r} L ${t - ux * r} ${-uy * r} Q ${t} 0 ${t + r} 0 Z')`;
      setGeo({ left, top: H / 2 - hy, w, h, clip });
    };
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, []);

  if (!geo) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-[1] overflow-hidden bg-navy/[0.06]"
      style={{ left: geo.left, top: geo.top, width: geo.w, height: geo.h, clipPath: geo.clip }}
    >
      <Film />
    </div>
  );
}
