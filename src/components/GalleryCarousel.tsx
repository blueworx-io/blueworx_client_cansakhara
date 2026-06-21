"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { gsap, useGSAP, EASE, DUR, scrollTriggerVars } from "@/lib/motion/gsap";

export type GalleryImage = { src: string; alt: string };

// Matches the site's existing ExperienceCarousel feel so both carousels read as
// one design language.
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION_MS = 650;
// Dwell between automatic advances. The carousel auto-loops endlessly; manual
// input simply resets this timer.
const AUTOPLAY_MS = 4000;

// Desktop slide width — the fixed Figma row is three 460×663 slides with a 30px
// gap filling the 1440px frame edge-to-edge. Used only as the drag-threshold
// fallback; the live threshold is measured from the rendered slide so it adapts
// to the 278px mobile slide. The pitch and gap live in the CSS track transform.
const SLIDE_W = 460;

// The By Day / By Night image gallery — a draggable, endlessly-looping carousel
// that auto-rotates on every breakpoint. Mobile shows a centred 278px slide with
// a peek of the previous slide on the left and the next on the right (always
// left/centre/right visible); desktop shows the fixed 460×663 row in the 1440px
// frame. Three copies of the set are rendered so the loop can wrap in either
// direction without ever revealing a gap; once a step lands outside the middle
// copy we silently jump back into it.
export default function GalleryCarousel({
  images,
}: {
  images: GalleryImage[];
}) {
  const n = images.length;
  const slides = [...images, ...images, ...images];

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragPxRef = useRef(0);

  // `index` is the leftmost visible slide in the cloned list. It starts at `n`
  // (the first slide of the middle copy) so there is a full copy to wrap into on
  // both sides.
  const [index, setIndex] = useState(n);
  const [animate, setAnimate] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  // Bumped on manual input so the autoplay timer restarts from a fresh dwell.
  const [autoplayNonce, setAutoplayNonce] = useState(0);
  const indexRef = useRef(index);
  // True while a no-animation wrap is settling, so a fast second input can't
  // fire mid-jump and overshoot the rendered range.
  const settlingRef = useRef(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // The carousel only renders (and so only needs to autoplay) at the desktop
  // breakpoint; mobile uses the native snap strip.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const logical = ((index % n) + n) % n;

  // Step the carousel by ±1 (or 0 to settle back to the current slide).
  const step = useCallback((delta: number) => {
    if (settlingRef.current) return;
    setAnimate(true);
    dragPxRef.current = 0;
    setDragPx(0);
    if (delta !== 0) setIndex((current) => current + delta);
  }, []);

  // When a transition lands outside the middle copy, jump (without animation) to
  // the matching slide inside it so the loop is endless and invisible.
  const handleTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform") return;
    if (index < n || index >= 2 * n) {
      settlingRef.current = true;
      setAnimate(false);
      setIndex((((index % n) + n) % n) + n);
    }
  };

  // Once the no-animation jump has painted, release the input guard.
  useEffect(() => {
    if (!animate && settlingRef.current) {
      const id = requestAnimationFrame(() => {
        settlingRef.current = false;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [animate, index]);

  // Endless auto-loop on every breakpoint: advance one slide every dwell,
  // forever. Paused while the user drags and disabled under reduced-motion; any
  // manual input resets the dwell via `autoplayNonce` so it never double-steps
  // right after a swipe.
  useEffect(() => {
    if (reduced || isDragging) return;
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduced, isDragging, autoplayNonce, step]);

  // Desktop-only one-time entrance: stagger a clip reveal across the three
  // initially-visible (middle-copy) slides when the gallery scrolls into view.
  // The native mobile strip is left untouched.
  useGSAP(
    () => {
      if (!isDesktop) return;
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const visible = Array.from(
          root.querySelectorAll<HTMLElement>(".gallery-slide"),
        ).slice(n, n + 3);
        visible.forEach((slide, i) => {
          gsap.set(slide, { clipPath: "inset(0% 0% 100% 0%)" });
          gsap.to(slide, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: DUR.image,
            ease: EASE,
            delay: i * 0.08,
            scrollTrigger: scrollTriggerVars(root),
          });
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [isDesktop] },
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if (settlingRef.current) return;
    dragStartX.current = event.clientX;
    dragPxRef.current = 0;
    setIsDragging(true);
    setAnimate(false);
    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = event.clientX - dragStartX.current;
    dragPxRef.current = delta;
    setDragPx(delta);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    const viewport = viewportRef.current;
    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    // Threshold off the rendered slide width so the swipe feels right at the
    // 278px mobile size as well as the 460px desktop size.
    const slide = viewport?.querySelector<HTMLElement>(".gallery-slide");
    const width = slide?.offsetWidth ?? SLIDE_W;
    const dragged = dragPxRef.current;
    // Advance only once dragged past half a slide.
    let delta = 0;
    if (dragged <= -width / 2) delta = 1;
    else if (dragged >= width / 2) delta = -1;
    step(delta);
    setAutoplayNonce((k) => k + 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
      setAutoplayNonce((k) => k + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
      setAutoplayNonce((k) => k + 1);
    }
  };

  const transition = isDragging
    ? "none"
    : animate
      ? `transform ${reduced ? 1 : DURATION_MS}ms ${EASING}`
      : "none";

  const trackStyle = {
    "--gallery-i": index,
    "--gallery-drag": `${dragPx}px`,
    transition,
  } as CSSProperties;

  return (
    // Looping, draggable, auto-rotating carousel at every breakpoint (centred
    // 278px peek strip on mobile, fixed 1440px frame on desktop).
    <div ref={rootRef} className="flex justify-center">
      <div
        ref={viewportRef}
        role="group"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={`Gallery image ${logical + 1} of ${n}`}
        onKeyDown={handleKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`gallery-viewport cursor-grab focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
          isDragging ? "cursor-grabbing select-none" : ""
        }`}
      >
        <div
          className="gallery-track"
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((image, slideIndex) => (
            <div
              key={`${image.src}-${slideIndex}`}
              aria-roledescription="slide"
              className="gallery-slide"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                draggable={false}
                sizes="(max-width: 767px) 278px, 460px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
