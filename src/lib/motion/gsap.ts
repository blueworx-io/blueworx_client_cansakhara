import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register plugins once. Safe to call repeatedly (GSAP de-dupes).
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };

// One house style for the whole site.
export const EASE = "power3.out";

export const DUR = {
  reveal: 0.9,
  image: 1.1,
  hero: 1.0,
} as const;

export const STAGGER = 0.08;

export const DIST = {
  // Subtle rise; lighter on mobile. Read at build time (reveals are one-shot).
  y(): number {
    if (typeof window === "undefined") return 28;
    return window.matchMedia("(min-width: 768px)").matches ? 28 : 16;
  },
} as const;

export const SCROLLER_SELECTOR = ".site-shell";

export function getScroller(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(SCROLLER_SELECTOR);
}

// ScrollTrigger config bound to the in-page scroll container.
export function scrollTriggerVars(trigger: Element) {
  return {
    trigger,
    scroller: getScroller() ?? undefined,
    start: "top 85%",
    once: true,
  };
}
