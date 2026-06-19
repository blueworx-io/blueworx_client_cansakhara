"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import MenuDrawer from "@/components/MenuDrawer";

const ENQUIRE_HREF = "mailto:reservations@cansakhara.com";

export type SiteTheme = "home" | "day" | "night";

// Per-page drawer panel colour (Figma: home 1:979, day 1:1273, night 1:1373).
const DRAWER_COLORS: Record<SiteTheme, string> = {
  home: "#422833",
  day: "#ac9a8c",
  night: "#031927",
};

// Two stacked 2px bars, 48px wide, 8px gap — the Figma navbar hamburger.
function MenuBars() {
  return (
    <span aria-hidden="true" className="flex w-12 flex-col gap-2">
      <span className="h-px w-full bg-current md:h-[2px]" />
      <span className="h-px w-full bg-current md:h-[2px]" />
    </span>
  );
}

export default function SiteHeader({ theme = "home" }: { theme?: SiteTheme }) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <nav className="absolute inset-x-0 top-0 z-40 flex h-28 items-center bg-white/5 px-6 text-white backdrop-blur-[3px] md:h-[131px] md:px-20">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="site-menu"
            className="flex items-center gap-5 justify-self-start font-display text-[11px] uppercase tracking-[0.42em] md:gap-6 md:text-[14px] md:tracking-[5.6px]"
          >
            <MenuBars />
            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* Centre mark: square logo in flow defines the cell; wordmark overlays
              absolutely so the crossfade never shifts layout. */}
          <Link
            href="/"
            aria-label="Can Sakhara home"
            className="relative grid place-items-center justify-self-center"
          >
            <span
              className={`transition-[opacity,scale] duration-500 ease-out ${
                open ? "scale-90 opacity-0" : "scale-100 opacity-100"
              }`}
            >
              <Image src="/images/logo-white.svg" alt="" width={52} height={52} />
            </span>
            <span
              aria-hidden={!open}
              className={`pointer-events-none absolute left-1/2 top-1/2 w-[180px] -translate-x-1/2 -translate-y-1/2 transition-[opacity,scale] duration-500 ease-out md:w-[262px] ${
                open ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <Image
                src="/images/hero-wordmark.svg"
                alt=""
                width={262}
                height={20}
                className="w-full"
              />
            </span>
          </Link>

          <div className="hidden justify-self-end sm:block">
            <a
              href={ENQUIRE_HREF}
              className="inline-flex items-center justify-center whitespace-nowrap border border-current px-8 py-4 font-display text-[14px] uppercase tracking-[5.6px] transition-colors duration-200 hover:bg-white hover:text-[#42081a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
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
