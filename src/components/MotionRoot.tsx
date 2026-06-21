"use client";

import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import {
  buildCommonChoreography,
  buildHomeChoreography,
  buildDayNightChoreography,
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

      const build = () => {
        if (cancelled) return;
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          buildCommonChoreography(shell);
          if (pathname === "/") buildHomeChoreography(shell);
          else if (pathname === "/by-day" || pathname === "/by-night") {
            buildDayNightChoreography(shell);
          }
        });
        ScrollTrigger.refresh();
      };

      if (document.fonts?.status === "loaded") build();
      else document.fonts?.ready.then(build);

      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { dependencies: [pathname] },
  );

  return null;
}
