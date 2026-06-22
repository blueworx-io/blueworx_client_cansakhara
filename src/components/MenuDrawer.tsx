"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";

// Drawer links — exact Figma order/labels. Desktop tops 356/423/490 (67px
// pitch); mobile tops 261/318/375 (57px pitch). Rendered as a flow column with
// the gap that reproduces each pitch from the line box.
const menuLinks = [
  { label: "Experience", href: "/" },
  { label: "By Day", href: "/by-day" },
  { label: "By Night", href: "/by-night" },
];

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

// The slide-in menu: scrim + drawer. State is owned by the trigger so the same
// drawer can be driven from the home navbar or the subpage navbars. Pass the
// trigger's ref so focus returns to it on close.
export default function MenuDrawer({
  open,
  onClose,
  returnFocusRef,
  panelColor = "#422833",
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  panelColor?: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Esc to close; lock the scroll container while open; move focus to the
  // close button on open and back to the trigger on close.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const scroller =
      document.querySelector<HTMLElement>(".site-shell") ?? document.body;
    const previousOverflow = scroller.style.overflow;
    scroller.style.overflow = "hidden";

    const trigger = returnFocusRef?.current;
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      scroller.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <>
      {/* Scrim — rgba(0,0,0,0.35) (Figma 1:977). Sits above the navbar so the
          whole page including the header dims while the menu is open; only the
          drawer (z-50) stays above it. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/35 transition-opacity duration-500 ease-out ${
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
        style={{ backgroundColor: panelColor }}
        className={`fixed inset-y-0 left-0 z-50 w-full text-white transition-[translate] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:w-[450px] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button — floating corner control (Figma 1:415 mobile / 1:983
            desktop): right-20/top-19 size-33 on mobile, right-50/top-46 size-52
            on desktop. Absolute is justified as fixed corner UI. */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          className={`absolute right-[20px] top-[19px] grid size-[33px] place-items-center border border-white transition-[opacity,translate,background-color,color] duration-500 ease-out hover:bg-white hover:text-[#422833] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:right-[50px] md:top-[46px] md:size-[52px] ${
            open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          }`}
          style={{ transitionDelay: open ? "120ms" : "0ms" }}
        >
          <CloseIcon />
        </button>

        {/* Content stack — flow column. Mobile centres the logo and right-aligns
            the links; desktop left-aligns everything at the 50px gutter. */}
        <div className="flex h-full flex-col items-center pt-[64px] md:items-start md:pl-[50px] md:pt-[131px]">
          <span
            aria-hidden="true"
            className="h-px w-[362px] bg-white md:w-[350px]"
          />

          <span
            className={`relative mt-[51px] block h-[76px] w-[200px] transition-[opacity,translate] duration-500 ease-out md:mt-[70px] md:h-[85px] md:w-[251px] ${
              open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
            style={{ transitionDelay: open ? "160ms" : "0ms" }}
          >
            <Image
              src="/images/logo-stacked-white.svg"
              alt="Can Sakhara"
              fill
              sizes="(max-width: 767px) 200px, 251px"
            />
          </span>

          <ul className="mt-[70px] flex w-[200px] flex-col items-end gap-[34.6px] text-right md:w-auto md:items-start md:gap-[37.6px] md:text-left">
            {menuLinks.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  tabIndex={open ? 0 : -1}
                  className={`block font-display text-[16px] font-light uppercase leading-[1.4] tracking-[3.2px] text-white transition-[opacity,translate,color] duration-500 ease-out hover:text-white/70 md:text-[21px] md:tracking-[4.2px] ${
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                  style={{ transitionDelay: open ? `${220 + i * 70}ms` : "0ms" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
