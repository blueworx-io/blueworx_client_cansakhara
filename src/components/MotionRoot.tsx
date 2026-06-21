"use client";

import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import {
  buildCommonChoreography,
  buildHomeHero,
  buildHomeScroll,
  buildDayNightHero,
  buildDayNightHeroTitle,
  buildDayNightScroll,
} from "@/lib/motion/choreography";

// Single client island. Mounted once in the server layout. Resolves the
// in-page scroller, waits for fonts, and builds per-route choreography inside a
// reduced-motion-gated matchMedia block.
export default function MotionRoot() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const shell = document.querySelector<HTMLElement>(".site-shell");
      if (!shell) return;

      const mm = gsap.matchMedia();
      let cancelled = false;
      const isDayNight = pathname === "/by-day" || pathname === "/by-night";

      // Phase 1 — above-the-fold page load. Runs now, in the layout effect
      // (pre-paint), so hero elements never flash visible before animating.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (pathname === "/") buildHomeHero(shell);
        else if (isDayNight) buildDayNightHero(shell);
      });

      // Phase 2 — scroll/text reveals. Deferred until webfonts settle so
      // SplitText line breaks are measured against the real fonts.
      const buildScroll = () => {
        if (cancelled) return;
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          buildCommonChoreography(shell);
          if (pathname === "/") buildHomeScroll(shell);
          else if (isDayNight) {
            // Hero headline splits here (fonts settled) so its tracked-out
            // letters don't reflow mid-reveal; then the scroll reveals.
            buildDayNightHeroTitle(shell);
            buildDayNightScroll(shell);
          }
        });
        ScrollTrigger.refresh();
      };

      if (document.fonts?.status === "loaded") buildScroll();
      else document.fonts?.ready.then(buildScroll);

      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { dependencies: [pathname] },
  );

  return null;
}
