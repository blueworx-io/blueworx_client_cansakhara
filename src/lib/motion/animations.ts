// Reusable, low-level reveal factories. Each animates only transform / opacity /
// clip-path (never layout, so no CLS), and the SplitText-based ones revert to
// clean DOM when finished. They do NOT gate reduced-motion themselves — the
// MotionRoot orchestrator only ever calls them inside a `prefers-reduced-motion:
// no-preference` matchMedia branch, so reduced-motion users never get a hidden
// initial state.
import {
  gsap,
  SplitText,
  EASE,
  DUR,
  STAGGER,
  DIST,
  scrollTriggerVars,
} from "./gsap";

// Fade + subtle rise, triggered when the element (or an explicit trigger)
// scrolls into view.
export function fadeUp(
  target: Element,
  opts: { delay?: number; trigger?: Element } = {},
): void {
  gsap.set(target, { autoAlpha: 0, y: DIST.y() });
  gsap.to(target, {
    autoAlpha: 1,
    y: 0,
    duration: DUR.reveal,
    ease: EASE,
    delay: opts.delay ?? 0,
    scrollTrigger: scrollTriggerVars(opts.trigger ?? target),
  });
}

// Opacity-only reveal. Use for elements whose own hover/active state animates
// `transform` (e.g. the video play button's `hover:scale-105`), so no leftover
// inline transform from the reveal can shadow that hover.
export function fade(target: Element, opts: { trigger?: Element } = {}): void {
  gsap.set(target, { autoAlpha: 0 });
  gsap.to(target, {
    autoAlpha: 1,
    duration: DUR.reveal,
    ease: EASE,
    scrollTrigger: scrollTriggerVars(opts.trigger ?? target),
  });
}

// A group of items revealing together with a stagger, triggered by the first
// item (or an explicit container trigger).
export function staggerReveal(
  items: Element[],
  opts: { trigger?: Element; delay?: number } = {},
): void {
  if (items.length === 0) return;
  const trigger = opts.trigger ?? items[0];
  gsap.set(items, { autoAlpha: 0, y: DIST.y() });
  gsap.to(items, {
    autoAlpha: 1,
    y: 0,
    duration: DUR.reveal,
    ease: EASE,
    stagger: STAGGER,
    delay: opts.delay ?? 0,
    scrollTrigger: scrollTriggerVars(trigger),
  });
}

// Line-by-line reveal for headings/subtitles. Reverts to clean DOM on finish.
export function splitLinesReveal(
  el: Element,
  opts: { trigger?: Element } = {},
): void {
  const split = new SplitText(el, { type: "lines", linesClass: "split-line" });
  gsap.set(split.lines, { autoAlpha: 0, y: DIST.y() });
  gsap.to(split.lines, {
    autoAlpha: 1,
    y: 0,
    duration: DUR.reveal,
    ease: EASE,
    stagger: STAGGER,
    scrollTrigger: scrollTriggerVars(opts.trigger ?? el),
    onComplete: () => split.revert(),
  });
}

// Character reveal using SplitText (for plain-text headlines, e.g. "By Day").
// `immediate` plays on creation (hero page-load) instead of on scroll.
//
// `inline` wraps each char in a `display:inline` <span> instead of GSAP's default
// `inline-block` <div>. This is essential for LETTER-SPACED headlines: inline-block
// char boxes are atomic inlines, so the tracking is re-applied around every box and
// the line measures markedly wider than the un-split run (~25% for "By Day" at 28px
// tracking — measured). The chars hold that expanded layout while hidden, so the
// reveal shows over-tracked text, then it snaps back to the designed width when
// SplitText reverts. Inline spans are layout-transparent — identical width to the
// un-split text — so there is no expansion and nothing to snap back from. Inline
// elements ignore `transform`, so the inline reveal is opacity-only; lift any rise
// onto the (block-level) host instead (see buildDayNightHeroTitle).
export function charsReveal(
  el: Element,
  opts: {
    trigger?: Element;
    immediate?: boolean;
    stagger?: number;
    inline?: boolean;
  } = {},
): void {
  // Reveal the host (it may be pre-hidden by the no-FOUC CSS guard); the chars
  // now carry the hidden state.
  gsap.set(el, { autoAlpha: 1 });
  const split = new SplitText(el, {
    type: "chars",
    charsClass: "split-char",
    ...(opts.inline ? { tag: "span" } : {}),
  });
  gsap.set(
    split.chars,
    opts.inline ? { autoAlpha: 0 } : { autoAlpha: 0, y: DIST.y() * 0.5 },
  );
  gsap.to(split.chars, {
    autoAlpha: 1,
    ...(opts.inline ? {} : { y: 0 }),
    duration: DUR.reveal,
    ease: EASE,
    stagger: opts.stagger ?? 0.03,
    ...(opts.immediate
      ? {}
      : { scrollTrigger: scrollTriggerVars(opts.trigger ?? el) }),
    onComplete: () => split.revert(),
  });
}

// Character reveal over PRE-EXISTING per-char spans (the JustifiedLine lockup),
// so the justify-between layout is never re-wrapped. Opacity + tiny y only.
export function revealExistingChars(
  spans: Element[],
  opts: { trigger?: Element; stagger?: number; delay?: number } = {},
): void {
  if (spans.length === 0) return;
  gsap.set(spans, { autoAlpha: 0, y: DIST.y() * 0.4 });
  gsap.to(spans, {
    autoAlpha: 1,
    y: 0,
    duration: DUR.reveal,
    ease: EASE,
    stagger: opts.stagger ?? 0.04,
    delay: opts.delay ?? 0,
    scrollTrigger: scrollTriggerVars(opts.trigger ?? spans[0]),
  });
}

// Elegant curtain unveil via clip-path. The element/section must visually clip
// (images use object-cover; sections reveal their own box).
export function clipImageReveal(el: Element, opts: { trigger?: Element } = {}): void {
  gsap.set(el, { clipPath: "inset(0% 0% 100% 0%)" });
  gsap.to(el, {
    clipPath: "inset(0% 0% 0% 0%)",
    duration: DUR.image,
    ease: EASE,
    scrollTrigger: scrollTriggerVars(opts.trigger ?? el),
  });
}

// Self-drawing stroke reveal (DrawSVG). The stroke draws on with any fill faded
// out, then the fill fades in. The single source of truth for the site's "draw"
// effect — used by the header centre logo mark and the By Day / By Night sun &
// moon icons. `duration` sets the draw speed; `loop` makes it repeat with a long
// pause between redraws (the icons loop; the header draws once and is replayed on
// its scroll-up reveal). The fill step is a no-op on stroke-only marks (the
// sun/moon are `fill="none"`); it only animates the filled logo. Returns the
// timeline so callers can hold/replay it. Gated to no-reduced-motion by the caller.
export function drawSelf(
  targets: gsap.TweenTarget,
  opts: { duration?: number; loop?: boolean } = {},
): gsap.core.Timeline {
  const tl = gsap.timeline(opts.loop ? { repeat: -1, repeatDelay: 5 } : {});
  tl.fromTo(
    targets,
    { drawSVG: "0%", fillOpacity: 0 },
    { drawSVG: "100%", duration: opts.duration ?? 4.8, ease: "power1.inOut" },
  ).to(targets, { fillOpacity: 1, duration: 0.8, ease: "power1.out" }, "-=0.5");
  return tl;
}

// Decorative divider "draw" from its origin edge.
export function drawLine(el: Element, axis: "x" | "y" = "y"): void {
  const origin = axis === "y" ? "top center" : "center left";
  gsap.set(el, { transformOrigin: origin, [`scale${axis.toUpperCase()}`]: 0 });
  gsap.to(el, {
    [`scale${axis.toUpperCase()}`]: 1,
    duration: DUR.reveal,
    ease: EASE,
    scrollTrigger: scrollTriggerVars(el),
  });
}
