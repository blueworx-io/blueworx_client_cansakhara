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
        Can Sakhara is a magnet for non-conformists.
        <br />
        Innovators. Individuals. Much like the island herself
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
        So much more than a conventional luxury villa rental.
        <br />
        Tune-in to your personal Ibiza experience, unique in every way
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
        Just as our changing moods shape how we use a space,
        <br />
        so Can Sakhara shifts alongside us to match the tempo
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

// A clone of the last slide is prepended and a clone of the first appended so
// the track can wrap seamlessly in either direction.
const n = experiences.length;
const slides: Experience[] = [
  experiences[n - 1],
  ...experiences,
  experiences[0],
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

  // Step the carousel by ±1 (or 0 to settle back to the current slide).
  const step = useCallback((delta: number) => {
    // Ignore input while resting on a clone (a wrap is about to fire) so a
    // fast second press can't overshoot the rendered range.
    if (indexRef.current === 0 || indexRef.current === n + 1) return;
    setAnimate(true);
    dragPxRef.current = 0;
    setDragPx(0);
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
    // Snap to the next/previous slide only once dragged past the halfway mark.
    let delta = 0;
    if (dragged <= -width / 2) delta = 1;
    else if (dragged >= width / 2) delta = -1;
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
                  <p className="section-eyebrow font-display text-sm uppercase tracking-[0.34em] md:text-[21px]">
                    Experience
                  </p>
                  <h2 className="section-title mx-auto mt-9 max-w-full break-words font-display text-[22px] font-light uppercase leading-[1.3] tracking-[0.1em] md:text-5xl md:leading-none md:tracking-[0.2em]">
                    {experience.title}
                  </h2>
                  <p className="section-subtitle mx-auto mt-8 max-w-[calc(100vw-3rem)] break-words font-serif text-[17px] font-light italic leading-[1.8] tracking-[0.02em] md:mt-10 md:max-w-4xl md:text-[28px] md:tracking-[0.1em]">
                    {experience.subtitle}
                  </p>
                </header>
                <div className="experience-layout mx-auto mt-20 grid max-w-6xl items-center gap-12 min-[1440px]:mt-0 min-[1440px]:grid-cols-[652px_304px] min-[1440px]:gap-[90px]">
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
                  <div className="experience-copy w-full min-w-0 max-w-[calc(100vw-3rem)] break-words font-body text-[15px] font-light leading-[1.6] tracking-[0.05em] min-[1440px]:max-w-none min-[1440px]:text-[16px]">
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
