"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import MenuDrawer from "@/components/MenuDrawer";

const ENQUIRE_HREF = "mailto:reservations@cansakhara.com";

export type SiteTheme = "home" | "day" | "night";

// Per-page drawer panel colour (Figma: home 1:979, day 1:1273, night 1:1373).
const DRAWER_COLORS: Record<SiteTheme, string> = {
  home: "#422833",
  day: "#ac9a8c",
  night: "#031927",
};

// Two stacked 2px bars, 8px gap — the Figma navbar hamburger (28px wide on
// mobile / 48px on desktop).
function MenuBars() {
  return (
    <span aria-hidden="true" className="flex w-7 flex-col gap-2 md:w-12">
      <span className="h-[2px] w-full bg-current" />
      <span className="h-[2px] w-full bg-current" />
    </span>
  );
}

export default function SiteHeader({ theme = "home" }: { theme?: SiteTheme }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // The centre logo mark draws itself (DrawSVG) on load and on a loop; the
  // running timeline is held here so a scroll-up reveal can replay it.
  const logoPathRef = useRef<SVGPathElement>(null);
  const drawTlRef = useRef<gsap.core.Timeline | null>(null);

  const close = useCallback(() => setOpen(false), []);

  // Logo self-draw: the stroke draws on (fill faded out), then the fill fades
  // in, with a 5s pause between redraws (3.1s draw + 5s gap). Gated to
  // no-reduced-motion via matchMedia, so
  // reduced-motion users keep the static filled mark. useGSAP sets the hidden
  // "from" state pre-paint, so the solid logo never flashes before drawing.
  useGSAP(() => {
    const path = logoPathRef.current;
    if (!path) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 5 });
      tl.fromTo(
        path,
        { drawSVG: "0%", fillOpacity: 0 },
        { drawSVG: "100%", duration: 3.0, ease: "power1.inOut" },
      ).to(path, { fillOpacity: 1, duration: 0.8, ease: "power1.out" }, "-=0.5");
      drawTlRef.current = tl;
    });
    return () => {
      drawTlRef.current = null;
      mm.revert();
    };
  });

  // The home hero is a photo, so the header stays transparent over it until you
  // scroll. The day/night heroes are solid colours, so the header takes that
  // page colour by default to blend with the hero.
  const solid = scrolled || theme !== "home";

  // Hide the header when scrolling down, slide it back in when scrolling up.
  // The page scrolls inside the `.site-shell` element, not the window.
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(".site-shell");
    if (!scroller) return;

    let lastY = scroller.scrollTop;
    let wasHidden = false;
    const onScroll = () => {
      const y = scroller.scrollTop;
      // Past the hero the bar gets a solid page-colour background so its white
      // content stays legible over the light sections.
      setScrolled(y > 100);
      // Ignore tiny jitter; keep the bar pinned near the very top.
      if (Math.abs(y - lastY) > 4) {
        const nowHidden = y > lastY && y > 100;
        // Header re-appearing on scroll-up: replay the logo draw from the top.
        if (wasHidden && !nowHidden) drawTlRef.current?.restart(true);
        wasHidden = nowHidden;
        setHidden(nowHidden);
        lastY = y;
      }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        style={solid ? { backgroundColor: DRAWER_COLORS[theme] } : undefined}
        className={`fixed inset-x-0 top-0 z-30 flex h-28 items-center px-5 text-white transition-[translate,background-color] duration-500 ease-out md:h-[131px] md:px-20 ${
          solid ? "" : "bg-white/5 backdrop-blur-[3px]"
        } ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="site-menu"
            className="flex items-center gap-6 justify-self-start font-display text-[10px] uppercase tracking-[4px] md:text-[14px] md:tracking-[5.6px]"
          >
            <MenuBars />
            <span>Menu</span>
          </button>

          {/* Centre mark: the square logo (Figma navbar 1:962 desktop 52px /
              1:389 mobile ~31px). Stays put when the menu opens — the drawer's
              scrim dims it along with the rest of the header. Inlined (vs the
              logo-white.svg asset) so DrawSVG can animate the path stroke. */}
          <Link
            href="/"
            aria-label="Can Sakhara home"
            className="grid place-items-center justify-self-center"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-[31px] w-[31px] md:h-[52px] md:w-[52px]"
            >
              <path
                ref={logoPathRef}
                d="M0 52H39.0067L0 13.0067V52.0135V52ZM0.728594 14.7608L37.2392 51.2714H0.728594V14.7608ZM52 0H38.9933L52 13.0067V0ZM12.4805 0L52 39.5195V38.494L13.5195 0H12.494H12.4805Z"
                fill="white"
                stroke="white"
                strokeWidth={1}
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <div className="justify-self-end">
            <a
              href={ENQUIRE_HREF}
              className="inline-flex items-center justify-center whitespace-nowrap border border-current px-4 py-[10px] font-display text-[10px] uppercase tracking-[4px] transition-colors duration-200 hover:bg-white hover:text-[#42081a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:px-8 md:py-4 md:text-[14px] md:tracking-[5.6px]"
            >
              Enquire
            </a>
          </div>
        </div>
      </nav>

      <MenuDrawer
        open={open}
        onClose={close}
        returnFocusRef={menuButtonRef}
        panelColor={DRAWER_COLORS[theme]}
      />
    </>
  );
}
