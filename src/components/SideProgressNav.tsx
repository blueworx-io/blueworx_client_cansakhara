"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// Left-rail section indicator, on every page — Rolls-Royce style: a vertical
// column of small dots, one per section, with a thin ring drawn around the dot
// of the section currently in view. Icon/marker only, no labels or connecting
// line; position down the page is read from which dot is ringed.
//
// Sections are discovered automatically (the top-level <section> elements of the
// page's scroll container), so the rail adapts to whatever page it's on without
// per-page wiring.
//
// Colour: the marks use `mix-blend-mode: difference`, so the white dots invert
// against whatever is behind them. That keeps them legible on every surface the
// site uses — the light home sections, the tan By Day panels, the dark By Night
// navy, the white gallery bands and the full-bleed photographs alike — with no
// theme-specific colours to maintain.
//
// Desktop only: a side rail would crowd the mobile layout, so it is hidden below
// the 796px breakpoint (the site's single mobile/desktop switch).

const SCROLLER = ".site-shell";

export default function SideProgressNav() {
  const pathname = usePathname();
  const sectionsRef = useRef<HTMLElement[]>([]);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(0);
  // Reveals once the visitor has scrolled past the hero, so the dots arrive as
  // they move into the page rather than sitting over the opening image.
  const [visible, setVisible] = useState(false);

  // Top of a section within the scroller's scroll space. getBoundingClientRect
  // keeps this correct regardless of each section's offsetParent.
  const topOf = useCallback((scroller: HTMLElement, el: HTMLElement) => {
    return (
      el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop
    );
  }, []);

  // Re-run on navigation: the persistent rail (mounted in the layout) must
  // re-discover the incoming page's sections and rebind its scroll listener.
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(SCROLLER);
    if (!scroller) return;

    const update = () => {
      const y = scroller.scrollTop;
      setVisible(y > scroller.clientHeight * 0.6);

      // Active = the last section whose top has crossed a line 40% down the view.
      const line = y + scroller.clientHeight * 0.4;
      let current = 0;
      sectionsRef.current.forEach((el, i) => {
        if (topOf(scroller, el) <= line) current = i;
      });
      setActive(current);
    };

    const scan = () => {
      sectionsRef.current = Array.from(
        scroller.querySelectorAll<HTMLElement>(":scope > section"),
      );
      setCount(sectionsRef.current.length);
      update();
    };

    // Wait a frame so the incoming route's markup is committed before scanning.
    const raf = requestAnimationFrame(scan);
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname, topOf]);

  const goTo = useCallback(
    (i: number) => {
      const scroller = document.querySelector<HTMLElement>(SCROLLER);
      const el = sectionsRef.current[i];
      if (!scroller || !el) return;
      scroller.scrollTo({ top: topOf(scroller, el), behavior: "smooth" });
    },
    [topOf],
  );

  if (count === 0) return null;

  return (
    <nav
      aria-label="Page progress"
      className={`fixed left-7 top-1/2 z-30 hidden -translate-y-1/2 mix-blend-difference transition-opacity duration-700 ease-out md:block lg:left-10 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ul className="flex flex-col items-center gap-[18px] text-white">
        {Array.from({ length: count }).map((_, i) => {
          const isActive = i === active;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to section ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                className="group relative grid size-6 place-items-center"
              >
                {/* Ring around the active dot (Rolls-Royce style) — blooms out
                    from the dot when its section comes into view. */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white transition-all duration-300 ease-out ${
                    isActive ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                />
                {/* Dot. */}
                <span
                  aria-hidden="true"
                  className={`size-[5px] rounded-full bg-white transition-opacity duration-300 ease-out ${
                    isActive ? "opacity-100" : "opacity-45 group-hover:opacity-90"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
