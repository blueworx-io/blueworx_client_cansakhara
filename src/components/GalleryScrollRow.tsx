"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, getScroller } from "@/lib/motion/gsap";
import type { GalleryImage } from "./GalleryCarousel";

// Desktop-only scroll-driven horizontal gallery.
//
// The band is held in place with native CSS `position: sticky`, NOT ScrollTrigger's
// JS pin. Inside the custom `.site-shell` scroller, ScrollTrigger's transform-pin has
// to rewrite a transform every frame to counteract the scroll, which lags real momentum
// scrolling by a frame and makes the band visibly bounce up and down. Sticky is handled
// by the browser on the compositor, so the band stays perfectly still and GSAP only has
// to scrub the row horizontally.
//
// Layout: the white band itself is the sticky element (so it lives here, not on the page
// <section>, letting the area below it stay transparent and show the page background —
// matching the existing By Day / By Night look). A transparent wrapper that is exactly
// `band height + travel` tall provides the scroll distance: the band sticks for `travel`
// px, then the wrapper ends and the next section follows immediately, so the bottom
// spacing is just the band's own padding (symmetric with the top) — no leftover gap.
// Mounted only at >=768px with motion allowed.
export default function GalleryScrollRow({ images }: { images: GalleryImage[] }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const outer = outerRef.current;
      const band = bandRef.current;
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!outer || !band || !track || !viewport) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, reduced } = ctx.conditions as {
            isDesktop: boolean;
            reduced: boolean;
          };
          if (!isDesktop || reduced) return;

          // How far the row must travel so the last slide reaches the frame's right edge.
          const travel = () => track.scrollWidth - viewport.clientWidth;
          // Wrapper = band height + travel, so the sticky band holds for exactly `travel`
          // px and the next section follows right after the band (no leftover gap).
          outer.style.height = `${band.offsetHeight + travel()}px`;

          gsap.to(track, {
            x: () => -travel(),
            ease: "none",
            scrollTrigger: {
              trigger: outer,
              scroller: getScroller() ?? undefined,
              start: "top top",
              end: () => "+=" + travel(),
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: outerRef },
  );

  return (
    <div ref={outerRef} className="relative">
      <div
        ref={bandRef}
        className="sticky top-0 bg-white py-[20px] md:py-[30px]"
      >
        <div className="flex justify-center">
          <div
            ref={viewportRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Gallery"
            className="gallery-viewport"
          >
            <div ref={trackRef} className="gallery-track">
              {images.map((image, i) => (
                <div
                  key={`${image.src}-${i}`}
                  aria-roledescription="slide"
                  className="gallery-slide"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    draggable={false}
                    sizes="460px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
