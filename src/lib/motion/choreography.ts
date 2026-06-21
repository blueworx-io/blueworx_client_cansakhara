// Per-route choreography. Each build function wires the reveal factories to a
// page's existing elements (found by class hook or inert `data-anim` attribute).
// MotionRoot calls these inside a reduced-motion-gated matchMedia block: the
// `*Hero` builds run immediately (pre-paint page load), the `*Scroll` builds run
// after webfonts settle (so SplitText measures real font metrics).
import { gsap, ScrollTrigger, EASE, DUR } from "./gsap";
import {
  fade,
  fadeUp,
  staggerReveal,
  splitLinesReveal,
  charsReveal,
  revealExistingChars,
  clipImageReveal,
  drawLine,
} from "./animations";

// Scoped query helpers: `$` returns all matches as an array, `one` the first.
const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  Array.from(root.querySelectorAll<T>(sel));
const one = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);

// Shared across every page (the footer is on all three routes).
export function buildCommonChoreography(shell: HTMLElement): void {
  const footer = one(shell, ".site-footer");
  if (footer) {
    const marks = $(footer, "[data-anim='footer-item']");
    if (marks.length) staggerReveal(marks, { trigger: footer });
  }
}

// --- Home ---

// Above-the-fold page load. Runs immediately (pre-paint), no font wait.
export function buildHomeHero(shell: HTMLElement): void {
  const wordmark = one(shell, ".hero-wordmark");
  const choices = $(shell, ".hero-choice");
  const heroImg = one(shell, ".hero-section > img");

  const tl = gsap.timeline({ defaults: { ease: EASE } });

  // Transform-only settle on the LCP image (never opacity).
  if (heroImg) {
    gsap.set(heroImg, { scale: 1.04, transformOrigin: "center center" });
    tl.to(heroImg, { scale: 1, duration: 1.6 }, 0);
  }
  if (wordmark) {
    gsap.set(wordmark, { autoAlpha: 0, y: 20 });
    tl.to(wordmark, { autoAlpha: 1, y: 0, duration: DUR.hero }, 0.1);
  }
  if (choices.length) {
    gsap.set(choices, { autoAlpha: 0, y: 16 });
    tl.to(
      choices,
      { autoAlpha: 1, y: 0, duration: DUR.reveal, stagger: 0.1 },
      0.5,
    );
  }
}

// Below-the-fold scroll/text reveals. Runs after webfonts settle.
export function buildHomeScroll(shell: HTMLElement): void {
  // --- Welcome ---
  const wTop = one(shell, ".welcome-line-top");
  if (wTop) drawLine(wTop, "y");

  const wEyebrow = one(shell, ".welcome-heading .section-eyebrow");
  if (wEyebrow) fadeUp(wEyebrow);

  // Brand lockup: reveal the EXISTING per-char spans (justify layout untouched).
  const lockupChars = $(shell, ".welcome-lockup-line > span");
  if (lockupChars.length) {
    revealExistingChars(lockupChars, {
      trigger: one(shell, ".welcome-lockup") ?? lockupChars[0],
    });
  }

  const wSubtitle = one(shell, ".welcome-heading .section-subtitle");
  if (wSubtitle) splitLinesReveal(wSubtitle);

  const mapArt = one(shell, ".map-art");
  if (mapArt) fadeUp(mapArt);

  const copyItems = [
    ...$(shell, ".welcome-copy > p"),
    ...$(shell, ".welcome-copy .outline-button"),
  ];
  if (copyItems.length) {
    staggerReveal(copyItems, {
      trigger: one(shell, ".welcome-copy") ?? copyItems[0],
    });
  }

  const featuresTitle = one(shell, ".features-title");
  if (featuresTitle) fadeUp(featuresTitle);
  const featureCells = $(shell, ".features-grid > div");
  if (featureCells.length) {
    staggerReveal(featureCells, {
      trigger: one(shell, ".features-grid") ?? featureCells[0],
    });
  }

  const wBottom = one(shell, ".welcome-line-bottom");
  if (wBottom) drawLine(wBottom, "y");

  // --- Discover ---
  const dTop = one(shell, ".discover-line-top");
  if (dTop) drawLine(dTop, "y");
  const dTitle = one(shell, ".discover-title");
  if (dTitle) fadeUp(dTitle);
  const cards = $(shell, ".discover-card");
  if (cards.length) {
    staggerReveal(cards, { trigger: one(shell, ".discover-grid") ?? cards[0] });
  }
  // Subtle card-icon hover (transform-only; does not touch the Figma button
  // states). Listeners live on the home nodes, which unmount on navigation.
  cards.forEach((card) => {
    const icon = card.querySelector(".discover-card img");
    if (!icon) return;
    card.addEventListener("pointerenter", () =>
      gsap.to(icon, { scale: 1.03, duration: 0.4, ease: EASE }),
    );
    card.addEventListener("pointerleave", () =>
      gsap.to(icon, { scale: 1, duration: 0.4, ease: EASE }),
    );
  });

  // --- Video ---
  // Opacity-only so the button's own `hover:scale-105` transform still works.
  const playBtn = one(shell, ".video-section button");
  if (playBtn) fade(playBtn);

  const dBottom = one(shell, ".discover-line-bottom");
  if (dBottom) drawLine(dBottom, "y");
}

// --- By Day / By Night (identical structure) ---

export function buildDayNightHero(shell: HTMLElement): void {
  const rule = one(shell, "[data-anim='hero-rule']");
  const icon = one(shell, "[data-anim='hero-icon']");
  const wordmark = one(shell, "[data-anim='hero-wordmark']");

  const tl = gsap.timeline({ defaults: { ease: EASE } });
  if (rule) {
    gsap.set(rule, { transformOrigin: "center center", scaleX: 0 });
    tl.to(rule, { scaleX: 1, duration: DUR.hero }, 0);
  }
  if (icon) {
    gsap.set(icon, { autoAlpha: 0, y: 16 });
    tl.to(icon, { autoAlpha: 1, y: 0, duration: DUR.reveal }, 0.15);
  }
  // NB: the headline char reveal is deliberately NOT built here. It uses
  // SplitText, which must measure against the loaded webfont — running it in the
  // pre-font hero phase splits on fallback metrics, so the wide letter-spacing
  // shows oversized gaps until the font swaps in and reflows ("snaps back").
  // It is built in buildDayNightHeroTitle from the fonts-ready phase instead.
  if (wordmark) {
    gsap.set(wordmark, { autoAlpha: 0, y: 14 });
    tl.to(wordmark, { autoAlpha: 1, y: 0, duration: DUR.reveal }, 0.5);
  }
}

// Hero headline char reveal. Split here, after webfonts settle, so SplitText
// measures the real font and the tracked-out letters never reflow mid-reveal.
// Still plays immediately (it is above the fold), the host stays hidden via the
// `data-hero-hide` no-FOUC guard until then.
export function buildDayNightHeroTitle(shell: HTMLElement): void {
  const title = one(shell, "[data-anim='hero-title']");
  if (title) charsReveal(title, { immediate: true, stagger: 0.04 });
}

export function buildDayNightScroll(shell: HTMLElement): void {
  // Full-width image curtain reveals.
  $(shell, "[data-anim='clip-image']").forEach((sec) => clipImageReveal(sec));

  // Headings: stagger the line elements where present (two-line lockups),
  // otherwise a line-split reveal.
  $(shell, "[data-anim='block-heading']").forEach((el) => {
    const lines = $(el, ":scope > p");
    if (lines.length > 1) staggerReveal(lines, { trigger: el });
    else splitLinesReveal(el);
  });

  // Serif subtitles: line reveal.
  $(shell, "[data-anim='block-subtitle']").forEach((el) => splitLinesReveal(el));

  // Body copy: stagger the paragraphs.
  $(shell, "[data-anim='block-copy']").forEach((el) => {
    const paras = $(el, ":scope > p");
    if (paras.length) staggerReveal(paras, { trigger: el });
    else fadeUp(el);
  });

  // Enquire buttons.
  $(shell, "[data-anim='block-button']").forEach((el) => fadeUp(el));
}

// Re-exported so callers need a single import surface.
export {
  gsap,
  ScrollTrigger,
  EASE,
  DUR,
  fade,
  fadeUp,
  staggerReveal,
  splitLinesReveal,
  charsReveal,
  revealExistingChars,
  clipImageReveal,
  drawLine,
};
