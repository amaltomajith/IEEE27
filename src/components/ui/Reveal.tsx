"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Adds `is-in` once the element enters the viewport (drives .line-mask / .fade-up).
 * The flag lives in React state so a re-render can never strip it, and elements
 * already on screen at mount reveal immediately instead of waiting on the observer.
 */
export function Reveal({
  as: Tag = "div",
  className = "",
  children,
  amount = 0,
  ...rest
}: { as?: React.ElementType; className?: string; children: React.ReactNode; amount?: number } & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > 0) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, inView]);
  return (
    <Tag ref={ref} className={`${className}${inView ? " is-in" : ""}`} {...rest}>
      {children}
    </Tag>
  );
}

/** Splits text into masked lines that rise on reveal. */
export function Lines({ lines, className = "" }: { lines: React.ReactNode[]; className?: string }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className={`line-mask ${className}`}>
          <span>{l}</span>
        </span>
      ))}
    </>
  );
}
