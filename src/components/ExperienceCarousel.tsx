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
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { clipImageReveal, fadeUp } from "@/lib/motion/animations";

type Experience = {
  title: string;
  subtitle: React.ReactNode;
  image: string;
  alt: string;
  paragraphs: string[];
};

const experiences: Experience[] = [
  {
    title: "An island original",
    subtitle: (
      <>
        {/* Mobile: auto-balanced into three even lines with no widow (the fixed
            340px card can't fit the longest sentence on one line at 17px, so
            hard breaks would widow). Desktop keeps its existing two-line layout. */}
        <span className="block [text-wrap:balance] md:hidden">
          Can Sakhara is a magnet for non-conformists. Innovators.
          Individuals. Much like the island herself
        </span>
        <span className="hidden md:inline">
          Can Sakhara is a magnet for non-conformists.
          <br />
          Innovators. Individuals. Much like the island herself
        </span>
      </>
    ),
    image: "/images/experience-1.png",
    alt: "The white exterior of Can Sakhara framed by palm trees",
    paragraphs: [
      "From the highest house on the hill in Sa Carroca, the island below is yours. From shimmering Salinas salt-flats to Formentera, meandering boats drifting on the sparkling sea, and the patterns of the stars. A heavenly hideaway.",
      "It’s a feeling to step into, an immersion into our art, culture and vibe — seamlessly intertwined into one home. This is where space transforms to ever-changing needs. An experience that morphs through the hours to become everything you want it to be and more. Join us for a new chapter.",
      "Your ultimate island home.",
    ],
  },
  {
    title: "Boldly beautiful",
    subtitle: (
      <>
        {/* Mobile: auto-balanced into three even lines with no widow. Desktop
            keeps its existing two-line layout. */}
        <span className="block [text-wrap:balance] md:hidden">
          So much more than a conventional luxury villa rental. Tune-in to
          your personal Ibiza experience, unique in every way
        </span>
        <span className="hidden md:inline">
          So much more than a conventional luxury villa rental.
          <br />
          Tune-in to your personal Ibiza experience, unique in every way
        </span>
      </>
    ),
    image: "/images/experience-2.png",
    alt: "The sculptural timber entrance to Can Sakhara",
    paragraphs: [
      "True sanctuary begins with space. Space to rest, to play, to revive.",
      "Wrapped by lush gardens and terraces, the house unfolds from the moment you step in. Greeted by a statement staircase and triple-height ceilings into an open living space, straight into our world of art and colour.",
      "Can Sakhara features a stunning Primary Suite and seven additional individually designed bedrooms, sleeping up to 16 guests.",
    ],
  },
  {
    title: "Heart of a home",
    subtitle: (
      <>
        {/* Mobile: auto-balanced into three even lines with no widow. Desktop
            keeps its existing two-line layout. */}
        <span className="block [text-wrap:balance] md:hidden">
          Just as our changing moods shape how we use a space, so Can
          Sakhara shifts alongside us to match the tempo
        </span>
        <span className="hidden md:inline">
          Just as our changing moods shape how we use a space,
          <br />
          so Can Sakhara shifts alongside us to match the tempo
        </span>
      </>
    ),
    image: "/images/experience-3.png",
    alt: "An art-filled lounge inside Can Sakhara",
    paragraphs: [
      "Iconic contemporary furniture and tactile fabrics. Tongue in cheek touches. A vintage jukebox. Eames lounge chairs. Limited edition disco ball sculptures.",
      "Discover the pulse of our place in bronze, travertine, smoked mirror glass, curated art and installations handpicked from artists across the globe.",
      "Rich, calm, beautiful, and bold.",
    ],
  },
];

const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION_MS = 650;

// Clones bracket the real slides so the track can wrap seamlessly in either
// direction. The last real slide is prepended for the backward wrap. For the
// forward wrap the first TWO real slides are appended: the desktop layout
// reveals a peek of the *next* slide on the right, so animating onto the leading
// clone (a clone of the first slide) needs the slide after it to exist —
// otherwise the peek strip renders blank as you pass the last real slide. The
// wrap still teleports from the leading clone (index n + 1) back to the first
// real slide; the extra clone at index n + 2 only ever fills that peek.
const n = experiences.length;
const slides: Experience[] = [
  experiences[n - 1],
  ...experiences,
  experiences[0],
  experiences[1],
];

export default function ExperienceCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragPxRef = useRef(0);

  // `index` points into `slides` (the cloned list). It starts at 1 — the first
  // real slide (slides[0] is the trailing clone used for backwards wrap).
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [reduced, setReduced] = useState(false);
  const indexRef = useRef(index);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Settle guarantee. Once a pointer interaction has ended and nothing is
  // animating, the track MUST rest on a real slide with no drag offset. This is
  // the safety net for an interrupted wrap (a pointerdown cancels the wrap's
  // transition before onTransitionEnd can swap the clone for its real slide,
  // stranding the index on a clone) and for any leftover drag a fast/again-
  // interrupted gesture failed to snap — without it the track can freeze
  // half-exposed at `clone + drag`, which never recovers. It never interferes
  // with the live wrap (that runs with `animate` true and is left untouched).
  useEffect(() => {
    if (isDragging || animate) return;
    if (index === 0 || index === n + 1) {
      // Stranded on a clone: teleport to the identical real slide (invisible).
      // Any residual drag offset is carried and snapped out on the next pass.
      setIndex(index === 0 ? n : 1);
    } else if (dragPx !== 0) {
      // Leftover offset at a real slide: animate it back to a clean rest.
      dragPxRef.current = 0;
      setDragPx(0);
      setAnimate(true);
    }
  }, [index, animate, isDragging, dragPx]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // One-time entrance reveal of the initially-visible slide's heading + image
  // when the section scrolls into view. Targets the active (non-clone) slide via
  // its aria-hidden state so it never depends on `index` (runs once on mount),
  // and never touches the track transform or drag logic.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const active = section.querySelector<HTMLElement>(
          '.experience-slide[aria-hidden="false"]',
        );
        if (!active) return;
        const heading = active.querySelector(".experience-heading");
        const image = active.querySelector(".experience-image");
        // Trigger both off the section entering, so the (lower) image can't be
        // left clipped if the carousel is advanced before it scrolls into view.
        if (heading) fadeUp(heading, { trigger: section });
        if (image) clipImageReveal(image, { trigger: section });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  const logical = ((index - 1) % n + n) % n;

  // Step the carousel by ±1 (or 0 to settle back to the current slide). Always
  // settle the drag offset and re-enable the transition first so the track snaps
  // to a slide even when the index change below is ignored — a released drag must
  // never be left frozen at a half-exposed offset.
  const step = useCallback((delta: number) => {
    setAnimate(true);
    dragPxRef.current = 0;
    setDragPx(0);
    // Ignore index changes while resting on a clone (a wrap is about to fire) so
    // a fast second input can't overshoot the rendered range.
    if (indexRef.current === 0 || indexRef.current === n + 1) return;
    if (delta !== 0) setIndex((current) => current + delta);
  }, []);

  // When a transition lands on a clone, jump (without animation) to the
  // matching real slide so the loop is endless and invisible.
  const handleTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform") return;
    if (index === 0) {
      setAnimate(false);
      setIndex(n);
    } else if (index === n + 1) {
      setAnimate(false);
      setIndex(1);
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
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
    // Snap relative to the rendered slide width (the viewport is wider than a
    // slide on desktop, where a peek of the neighbouring slides is visible).
    const slide = viewport?.querySelector<HTMLElement>(".experience-slide");
    const width = slide?.offsetWidth ?? viewport?.clientWidth ?? 1;
    const dragged = dragPxRef.current;
    // Snap to the next/previous slide once dragged past a quarter of the slide
    // width — half the previous half-width threshold, so it takes half the swipe
    // distance to move between items (mobile and desktop).
    let delta = 0;
    if (dragged <= -width / 4) delta = 1;
    else if (dragged >= width / 4) delta = -1;
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

  // The track's transform lives in CSS so the per-slide step can change at the
  // desktop breakpoint (full-width slides on mobile, fixed peek pitch on
  // desktop). The component only supplies the current index and drag offset.
  const trackStyle = {
    "--carousel-i": index,
    "--carousel-drag": `${dragPx}px`,
    transition,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="experience-section relative overflow-hidden bg-[#f2ebe2] py-28 md:py-0"
      aria-roledescription="carousel"
      aria-label="Experience Can Sakhara"
    >
      <div
        ref={viewportRef}
        role="group"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label={`Experience ${logical + 1} of ${n}`}
        className={`experience-viewport md:cursor-grab focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#42081a] ${
          isDragging ? "cursor-grabbing select-none" : ""
        }`}
      >
        <div
          className="experience-track"
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((experience, slideIndex) => (
            <article
              key={`${experience.title}-${slideIndex}`}
              aria-roledescription="slide"
              aria-hidden={slideIndex !== index}
              className="experience-slide"
            >
              <div className="experience-card-inner px-6 md:px-0">
                <header className="section-heading experience-heading mx-auto w-full min-w-0 max-w-5xl text-center text-[#42081a]">
                  <p className="section-eyebrow font-display text-[12px] uppercase leading-none tracking-[2.4px] md:text-[22px] md:tracking-[4.4px]">
                    Experience
                  </p>
                  <h2 className="section-title mx-auto mt-[20px] max-w-full break-words font-display text-[24px] font-light uppercase leading-none tracking-[4.8px] md:mt-[50px] md:text-5xl md:leading-none md:tracking-[0.2em]">
                    {experience.title}
                  </h2>
                  <p className="section-subtitle mx-auto mt-[20px] max-w-[calc(100vw-3rem)] break-words font-serif text-[13px] font-light italic leading-[1.8] tracking-[1.3px] md:mt-[50px] md:max-w-4xl md:text-[28px] md:tracking-[2.8px]">
                    {experience.subtitle}
                  </p>
                </header>
                <div className="experience-layout mx-auto mt-10 grid max-w-6xl items-center gap-12 min-[1440px]:mt-0 min-[1440px]:grid-cols-[652px_304px] min-[1440px]:gap-[90px]">
                  <div className="experience-image relative aspect-[1.3/1] overflow-hidden">
                    <Image
                      src={experience.image}
                      alt={experience.alt}
                      fill
                      draggable={false}
                      sizes="(max-width: 768px) 90vw, 55vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="experience-copy w-full min-w-0 max-w-[calc(100vw-3rem)] break-words text-center font-body text-[15px] font-light leading-[1.6] tracking-[0.05em] md:text-left min-[1440px]:max-w-none min-[1440px]:text-[16px]">
                    {experience.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="mt-6 first:mt-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
