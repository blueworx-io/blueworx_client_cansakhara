"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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

  const close = useCallback(() => setOpen(false), []);

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
    const onScroll = () => {
      const y = scroller.scrollTop;
      // Past the hero the bar gets a solid page-colour background so its white
      // content stays legible over the light sections.
      setScrolled(y > 100);
      // Ignore tiny jitter; keep the bar pinned near the very top.
      if (Math.abs(y - lastY) > 4) {
        setHidden(y > lastY && y > 100);
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
              scrim dims it along with the rest of the header. */}
          <Link
            href="/"
            aria-label="Can Sakhara home"
            className="grid place-items-center justify-self-center"
          >
            <Image
              src="/images/logo-white.svg"
              alt=""
              width={52}
              height={52}
              className="h-[31px] w-[31px] md:h-[52px] md:w-[52px]"
            />
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
