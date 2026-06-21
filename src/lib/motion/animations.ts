import {
  gsap,
  SplitText,
  EASE,
  DUR,
  STAGGER,
  DIST,
  scrollTriggerVars,
} from "./gsap";

// Fade + subtle rise, triggered when the element scrolls into view.
export function fadeUp(target: Element, opts: { delay?: number } = {}): void {
  gsap.set(target, { autoAlpha: 0, y: DIST.y() });
  gsap.to(target, {
    autoAlpha: 1,
    y: 0,
    duration: DUR.reveal,
    ease: EASE,
    delay: opts.delay ?? 0,
    scrollTrigger: scrollTriggerVars(target),
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
export function charsReveal(
  el: Element,
  opts: { trigger?: Element; immediate?: boolean; stagger?: number } = {},
): void {
  const split = new SplitText(el, { type: "chars", charsClass: "split-char" });
  gsap.set(split.chars, { autoAlpha: 0, y: DIST.y() * 0.5 });
  gsap.to(split.chars, {
    autoAlpha: 1,
    y: 0,
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
  opts: { trigger?: Element; stagger?: number } = {},
): void {
  if (spans.length === 0) return;
  gsap.set(spans, { autoAlpha: 0, y: DIST.y() * 0.4 });
  gsap.to(spans, {
    autoAlpha: 1,
    y: 0,
    duration: DUR.reveal,
    ease: EASE,
    stagger: opts.stagger ?? 0.04,
    scrollTrigger: scrollTriggerVars(opts.trigger ?? spans[0]),
  });
}

// Elegant curtain unveil via clip-path. The element/section must visually clip
// (images use object-cover; sections reveal their own box).
export function clipImageReveal(el: Element): void {
  gsap.set(el, { clipPath: "inset(0% 0% 100% 0%)" });
  gsap.to(el, {
    clipPath: "inset(0% 0% 0% 0%)",
    duration: DUR.image,
    ease: EASE,
    scrollTrigger: scrollTriggerVars(el),
  });
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
