"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Drawer links — exact Figma order/labels. Tops are 356 / 423 / 490 (67px
// pitch); rendered as flow with a 37.6px gap (67 − 29.4px line box).
const menuLinks = [
  { label: "Experience", href: "/#experience" },
  { label: "By Day", href: "/by-day" },
  { label: "By Night", href: "/#discover" },
];

const ENQUIRE_HREF = "mailto:reservations@cansakhara.com";

// Two stacked bars — the hamburger from the Figma navbar (48px wide, 2px bars,
// 8px gap).
function MenuBars() {
  return (
    <span aria-hidden="true" className="flex w-12 flex-col gap-2">
      <span className="h-px w-full bg-current md:h-[2px]" />
      <span className="h-px w-full bg-current md:h-[2px]" />
    </span>
  );
}

// Thin white ✕ from the Figma close component (17×17 glyph).
function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 17 17"
      className="size-[17px] stroke-current"
      fill="none"
      strokeWidth="1.3"
    >
      <path d="M1 1 16 16M16 1 1 16" />
    </svg>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // The Menu control is a real anchor so it keeps working on mobile (where no
  // drawer design exists yet — it falls back to the #welcome jump). At the
  // tablet/desktop breakpoint it instead opens the drawer.
  const handleMenuClick = useCallback((event: React.MouseEvent) => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      event.preventDefault();
      setOpen(true);
    }
  }, []);

  // Esc to close; lock the scroll container while open; move focus to the
  // close button on open and back to the Menu trigger on close.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    const scroller =
      document.querySelector<HTMLElement>(".site-shell") ?? document.body;
    const previousOverflow = scroller.style.overflow;
    scroller.style.overflow = "hidden";

    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      scroller.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [open, close]);

  return (
    <>
      <nav className="hero-nav absolute inset-x-0 top-0 z-40 grid h-28 grid-cols-[1fr_auto_1fr] items-center px-6 text-white md:h-[131px] md:px-20">
        <a
          ref={menuButtonRef}
          href="#welcome"
          onClick={handleMenuClick}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="site-menu"
          className="flex items-center gap-5 justify-self-start font-display text-[11px] uppercase tracking-[0.42em] md:gap-6 md:text-sm"
        >
          <MenuBars />
          <span className="hidden sm:inline">Menu</span>
        </a>

        {/* Centre mark: the square logo sits in flow (defining the cell), the
            wordmark overlays it absolutely so the crossfade never shifts the
            layout. Open → wordmark, closed → square mark. */}
        <Link
          href="/"
          aria-label="Can Sakhara home"
          className="relative grid justify-self-center place-items-center"
        >
          <span
            className={`transition-[opacity,scale] duration-500 ease-out ${
              open ? "scale-90 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <Image
              src="/images/logo-white.svg"
              alt=""
              width={52}
              height={52}
            />
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
            className="outline-button inline-flex h-[54px] items-center justify-center gap-4 whitespace-nowrap border border-current px-8 font-display text-[14px] uppercase tracking-[0.4em] transition-colors duration-200 hover:text-[#500d20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Enquire
          </a>
        </div>
      </nav>

      {/* Scrim — rgba(0,0,0,0.35); dims the hero but sits below the navbar so
          the wordmark stays crisp while the menu is open. */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-30 bg-black/35 transition-opacity duration-500 ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-[450px] max-w-full bg-[#422833] text-white transition-[translate] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
            className={`absolute right-[50px] top-[46px] grid size-[52px] place-items-center border border-white transition-[opacity,translate,background-color,color] duration-500 ease-out hover:bg-white hover:text-[#422833] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
              open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
            }`}
            style={{ transitionDelay: open ? "120ms" : "0ms" }}
          >
            <CloseIcon />
          </button>

          <span
            aria-hidden="true"
            className="absolute left-[50px] top-[131px] h-px w-[350px] bg-white"
          />

          <span
            className={`absolute left-[50px] top-[201px] block h-[85px] w-[251px] transition-[opacity,translate] duration-500 ease-out ${
              open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
            style={{ transitionDelay: open ? "160ms" : "0ms" }}
          >
            <Image
              src="/images/logo-stacked-white.svg"
              alt="Can Sakhara"
              fill
              sizes="251px"
            />
          </span>

          <ul className="absolute left-[50px] top-[356px] flex flex-col gap-[37.6px]">
            {menuLinks.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                  className={`block font-display text-[21px] font-light uppercase leading-[1.4] tracking-[4.2px] text-white transition-[opacity,translate,color] duration-500 ease-out hover:text-white/70 ${
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                  style={{ transitionDelay: open ? `${220 + i * 70}ms` : "0ms" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
