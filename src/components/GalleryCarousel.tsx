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

export type GalleryImage = { src: string; alt: string };

// Matches the site's existing ExperienceCarousel feel so both carousels read as
// one design language.
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION_MS = 650;

// The gallery is the fixed Figma row: three 460×663 slides with a 30px gap that
// fill the 1440px frame edge-to-edge. The slide width sets the drag threshold;
// the 490px pitch and 30px gap live in the CSS track transform.
const SLIDE_W = 460;

// The By Day / By Night image gallery.
//
// Mobile keeps the original native scroll-snap strip untouched (the brief: the
// mobile design must stay unaffected). Desktop upgrades the static row into a
// draggable, endlessly-looping carousel that keeps the exact 460×663 slide size
// and 1440px frame. Three copies of the set are rendered so the loop can wrap in
// either direction without ever revealing a gap; once a step lands outside the
// middle copy we silently jump back into it.
export default function GalleryCarousel({
  images,
}: {
  images: GalleryImage[];
}) {
  const n = images.length;
  const slides = [...images, ...images, ...images];

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
    const dragged = dragPxRef.current;
    // Advance only once dragged past half a slide.
    let delta = 0;
    if (dragged <= -SLIDE_W / 2) delta = 1;
    else if (dragged >= SLIDE_W / 2) delta = -1;
    step(delta);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
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
    <>
      {/* Mobile: original native snap-scroll strip — kept exactly as designed. */}
      <div
        className="flex snap-x snap-mandatory gap-[19px] overflow-x-auto px-[calc((100vw-278px)/2)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
      >
        {images.map((image) => (
          <div
            key={image.src}
            className="relative h-[400px] w-[278px] shrink-0 snap-center"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="278px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Desktop: looping, draggable carousel at the fixed 1440px frame. */}
      <div className="hidden md:flex md:justify-center">
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
                  sizes="460px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
