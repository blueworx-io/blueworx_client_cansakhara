// Per-route choreography. Each build function wires the reveal factories to a
// page's existing elements (found by class hook or inert `data-anim` attribute).
// MotionRoot calls these inside a reduced-motion-gated matchMedia block: the
// `*Hero` builds run immediately (pre-paint page load), the `*Scroll` builds run
// after webfonts settle (so SplitText measures real font metrics).
import { gsap, ScrollTrigger, EASE, DUR, scrollTriggerVars } from "./gsap";
import {
  fade,
  fadeUp,
  staggerReveal,
  splitLinesReveal,
  charsReveal,
  revealExistingChars,
  clipImageReveal,
  drawLine,
  drawSelf,
} from "./animations";

// Scoped query helpers: `$` returns all matches as an array, `one` the first.
const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  Array.from(root.querySelectorAll<T>(sel));
const one = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);

// Self-drawing sun / moon icons (DrawSVG), via the shared `drawSelf` helper —
// faster than the header logo and looping (the header draws once). Each icon's
// paths draw on together, then repeat with a pause. Found by the inert
// `data-anim="draw-icon"` hook on each inlined SVG. With `onScroll`, the draw is
// held (paused at 0%) until the icon scrolls into view, so a below-the-fold icon
// (the home Discover cards) is caught from the start rather than mid-loop; the
// above-the-fold hero icons draw immediately on load.
function drawIcons(root: ParentNode, opts: { onScroll?: boolean } = {}): void {
  $(root, "[data-anim='draw-icon']").forEach((icon) => {
    const paths = $(icon, "path");
    if (!paths.length) return;
    const tl = drawSelf(paths, { duration: 2.5, loop: true });
    if (!opts.onScroll) return;
    tl.pause();
    ScrollTrigger.create({
      ...scrollTriggerVars(icon),
      onEnter: () => tl.play(),
    });
  });
}

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

  // Brand lockup: reveal the EXISTING per-char spans (justify layout untouched)
  // one LINE at a time — "Introducing" lands first, then "Can Sakhara" — so the
  // two never read as a single block. Both lines share the lockup trigger; the
  // second line is delayed until the first has largely settled.
  const lockupLines = $(shell, ".welcome-lockup-line");
  if (lockupLines.length) {
    const lockupTrigger = one(shell, ".welcome-lockup") ?? lockupLines[0];
    lockupLines.forEach((line, i) => {
      const chars = $(line, ":scope > span");
      if (chars.length) {
        revealExistingChars(chars, { trigger: lockupTrigger, delay: i * 0.6 });
      }
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
  // The card sun / moon marks self-draw (DrawSVG), held until each scrolls into
  // view so the draw is caught from the start (they sit below the fold).
  drawIcons(shell, { onScroll: true });
  // Subtle card-icon hover (transform-only; does not touch the Figma button
  // states). Listeners live on the home nodes, which unmount on navigation.
  cards.forEach((card) => {
    const icon = card.querySelector("svg");
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
  const wordmark = one(shell, "[data-anim='hero-wordmark']");

  const tl = gsap.timeline({ defaults: { ease: EASE } });
  if (rule) {
    gsap.set(rule, { transformOrigin: "center center", scaleX: 0 });
    tl.to(rule, { scaleX: 1, duration: DUR.hero }, 0);
  }
  // The hero sun / moon mark self-draws (DrawSVG), the same as the header logo,
  // instead of a fade + rise.
  drawIcons(shell);
  // NB: the headline char reveal is built in buildDayNightHeroTitle (fonts-ready
  // phase), not here, so SplitText splits against the real webfont metrics rather
  // than the fallback. (The "letters expand then snap back" bug was NOT a font
  // issue — see buildDayNightHeroTitle for the actual cause and fix.)
  if (wordmark) {
    gsap.set(wordmark, { autoAlpha: 0, y: 14 });
    tl.to(wordmark, { autoAlpha: 1, y: 0, duration: DUR.reveal }, 0.5);
  }
}

// Hero headline char reveal. The headline is heavily letter-spaced (17px/28px),
// so the chars are split into `display:inline` spans (`inline: true`): inline-block
// char boxes would re-space the tracking around every box, expanding the line ~25%
// and snapping it back to the designed width on revert. Inline spans render at the
// un-split width, so there is no expand/snap. Inline chars can't be transformed, so
// they fade in (opacity only) while the gentle rise is applied to the whole <h1>
// host, which is block-level and safe to transform.
export function buildDayNightHeroTitle(shell: HTMLElement): void {
  const title = one(shell, "[data-anim='hero-title']");
  if (!title) return;
  charsReveal(title, { immediate: true, stagger: 0.04, inline: true });
  gsap.from(title, { y: 12, duration: DUR.hero, ease: EASE });
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
  drawSelf,
};
