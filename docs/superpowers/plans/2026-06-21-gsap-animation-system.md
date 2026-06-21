# GSAP Premium Animation System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an understated, luxury GSAP motion layer (page-load, scroll reveal, text, image, and a few micro-interactions) across the home, By Day, and By Night pages without changing layout, content, or responsive behaviour, and without regressing Core Web Vitals.

**Architecture:** A single client orchestrator (`MotionRoot`) mounted once in the server `layout.tsx`. It resolves the in-page scroll container (`.site-shell`), waits for `document.fonts.ready`, and — inside a `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` block — builds per-route choreography by querying *existing* class hooks plus a few inert `data-anim` attributes. Low-level reveal factories live in `src/lib/motion/`. The two carousels keep their own motion and gain a one-time in-component entrance reveal using the shared tokens.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · GSAP 3 (`gsap`, ScrollTrigger, SplitText) · `@gsap/react` (`useGSAP`).

## Global Constraints

- Animate only `transform`, `opacity`, `clip-path`. Never animate layout properties (width/height/top/left/margin/padding). CLS target ≈ 0.
- ScrollTriggers MUST set `scroller` to the `.site-shell` element (the page scrolls inside `<main>`, not the window). Default window scroller = nothing fires.
- All hiding (`autoAlpha:0` / initial states) happens ONLY inside the `(prefers-reduced-motion: no-preference)` matchMedia branch. Reduced-motion users therefore never receive a hidden state — content is static and fully visible with zero extra code.
- Home hero image (`/images/hero.png`, `priority`) is the LCP element — its opacity is NEVER animated. Only an optional transform-only 4% settle.
- SplitText is created only after `document.fonts.ready` and is `revert()`-ed once its reveal completes (clean DOM, no lingering spans).
- Do NOT override Figma-defined hover states on buttons/links/cards. Do NOT re-implement SiteHeader hide/show or MenuDrawer stagger (they stay CSS).
- No new wrapper DOM. Hook onto existing class names; add inert `data-anim` attributes only where no existing hook exists.
- Dependencies added: exactly `gsap` and `@gsap/react`. No others.
- Deployment is Netlify (builds from repo). Do NOT remove `node_modules` at session end; do run `npm run build` to verify.
- Tokens (use everywhere): ease `power3.out`; reveal ~0.9s; image reveal ~1.1s; stagger 0.08s; travel 28px desktop / 16px mobile; ScrollTrigger `start:"top 85%"`, `once:true`.

---

## Task 1: Dependencies + motion foundation module

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/lib/motion/gsap.ts`

**Interfaces:**
- Produces: `gsap`, `ScrollTrigger`, `SplitText`, `useGSAP` re-exports; `EASE` (string), `DUR` ({reveal,image,hero}), `DIST.y()` (number), `getScroller()` (`HTMLElement | null`), `scrollTriggerVars(trigger)` (object with scroller bound).

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install gsap @gsap/react
```
Expected: both added to `package.json` dependencies; no peer-dep errors (React 19 is supported by `@gsap/react`).

- [ ] **Step 2: Create the foundation module**

Create `src/lib/motion/gsap.ts`:
```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register plugins once. Safe to call repeatedly (GSAP de-dupes).
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };

// One house style for the whole site.
export const EASE = "power3.out";

export const DUR = {
  reveal: 0.9,
  image: 1.1,
  hero: 1.0,
} as const;

export const STAGGER = 0.08;

export const DIST = {
  // Subtle rise; lighter on mobile. Read at build time (reveals are one-shot).
  y(): number {
    if (typeof window === "undefined") return 28;
    return window.matchMedia("(min-width: 768px)").matches ? 28 : 16;
  },
} as const;

export const SCROLLER_SELECTOR = ".site-shell";

export function getScroller(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(SCROLLER_SELECTOR);
}

// ScrollTrigger config bound to the in-page scroll container.
export function scrollTriggerVars(trigger: Element) {
  return {
    trigger,
    scroller: getScroller() ?? undefined,
    start: "top 85%",
    once: true,
  };
}
```

- [ ] **Step 3: Verify it type-checks / builds**

Run:
```bash
npx tsc --noEmit
```
Expected: PASS (no type errors). If `gsap/ScrollTrigger` / `gsap/SplitText` type resolution complains, confirm `gsap` version is 3.13+ (SplitText is in the free package) with `npm ls gsap`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/motion/gsap.ts
git commit -m "feat(motion): add gsap deps and shared motion foundation"
```

---

## Task 2: Reveal factory functions

**Files:**
- Create: `src/lib/motion/animations.ts`

**Interfaces:**
- Consumes: everything from `./gsap`.
- Produces:
  - `fadeUp(target: Element, opts?: {delay?: number}): void`
  - `staggerReveal(items: Element[], opts?: {trigger?: Element; delay?: number}): void`
  - `splitLinesReveal(el: Element, opts?: {trigger?: Element}): void`
  - `charsReveal(el: Element, opts?: {trigger?: Element; immediate?: boolean; stagger?: number}): void`
  - `revealExistingChars(spans: Element[], opts?: {trigger?: Element; stagger?: number}): void`
  - `clipImageReveal(el: Element): void`
  - `drawLine(el: Element, axis?: "x" | "y"): void`

- [ ] **Step 1: Create the factories**

Create `src/lib/motion/animations.ts`:
```ts
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
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/motion/animations.ts
git commit -m "feat(motion): add reduced-motion-safe reveal factories"
```

---

## Task 3: Choreography module + MotionRoot orchestrator (wired, no targets yet)

**Files:**
- Create: `src/lib/motion/choreography.ts`
- Create: `src/components/MotionRoot.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `./animations`, `./gsap`.
- Produces: `buildCommonChoreography(shell)`, `buildHomeChoreography(shell)`, `buildDayNightChoreography(shell)` (all `(shell: HTMLElement) => void`); default-exported `<MotionRoot />` client component.

- [ ] **Step 1: Create the choreography stubs**

Create `src/lib/motion/choreography.ts`:
```ts
import { gsap, ScrollTrigger, EASE, DUR } from "./gsap";
import {
  fadeUp,
  staggerReveal,
  splitLinesReveal,
  charsReveal,
  revealExistingChars,
  clipImageReveal,
  drawLine,
} from "./animations";

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

// Filled in Tasks 4–7.
export function buildHomeChoreography(shell: HTMLElement): void {
  void shell;
}

// Filled in Tasks 9–10.
export function buildDayNightChoreography(shell: HTMLElement): void {
  void shell;
}

// Re-exported so callers need a single import surface.
export { gsap, ScrollTrigger, EASE, DUR, fadeUp, staggerReveal, splitLinesReveal, charsReveal, revealExistingChars, clipImageReveal, drawLine };
```

- [ ] **Step 2: Create MotionRoot**

Create `src/components/MotionRoot.tsx`:
```tsx
"use client";

import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import {
  buildCommonChoreography,
  buildHomeChoreography,
  buildDayNightChoreography,
} from "@/lib/motion/choreography";

// Single client island. Mounted once in the server layout. Resolves the
// in-page scroller, waits for fonts, and builds per-route choreography inside a
// reduced-motion-gated matchMedia block.
export default function MotionRoot() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const shell = document.querySelector<HTMLElement>(".site-shell");
      if (!shell) return;

      const mm = gsap.matchMedia();
      let cancelled = false;

      const build = () => {
        if (cancelled) return;
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          buildCommonChoreography(shell);
          if (pathname === "/") buildHomeChoreography(shell);
          else if (pathname === "/by-day" || pathname === "/by-night") {
            buildDayNightChoreography(shell);
          }
        });
        ScrollTrigger.refresh();
      };

      if (document.fonts?.status === "loaded") build();
      else document.fonts?.ready.then(build);

      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { dependencies: [pathname] },
  );

  return null;
}
```

- [ ] **Step 3: Mount it in the layout**

In `src/app/layout.tsx`, import and render `<MotionRoot />` inside `<body>` after `{children}`:
```tsx
import MotionRoot from "@/components/MotionRoot";
// ...
      <body>
        {children}
        <MotionRoot />
      </body>
```
(Layout stays a server component; `MotionRoot` is the only client child.)

- [ ] **Step 4: Verify build + clean console**

Run:
```bash
npm run build
```
Expected: build succeeds.

Then `npm run dev` and, with Playwright, load `/`, `/by-day`, `/by-night`:
```js
// browser_navigate to each route, then:
browser_console_messages  // expect no GSAP "target not found"/"invalid scope" errors
```
Expected: pages render unchanged (no targets wired yet), console clean.

- [ ] **Step 5: Commit**

```bash
git add src/lib/motion/choreography.ts src/components/MotionRoot.tsx src/app/layout.tsx
git commit -m "feat(motion): add MotionRoot orchestrator and per-route choreography scaffold"
```

---

## Task 4: Home hero page-load

**Files:**
- Modify: `src/lib/motion/choreography.ts` (`buildHomeChoreography`)
- Modify: `src/app/page.tsx` (no new elements; optional `data-anim` on the hero `<Image>` for the settle)

**Interfaces:**
- Consumes: `fadeUp`, `gsap`, `EASE`, `DUR` from choreography imports.
- Hooks (existing classes): `.hero-wordmark`, `.hero-actions`, `.hero-choice`, `.hero-section > img`.

- [ ] **Step 1: Implement the hero load timeline**

In `src/lib/motion/choreography.ts`, replace the body of `buildHomeChoreography` with the hero portion (more sections appended in later tasks):
```ts
export function buildHomeChoreography(shell: HTMLElement): void {
  // --- Hero (page load; plays immediately, not on scroll) ---
  const wordmark = one(shell, ".hero-wordmark");
  const choices = $(shell, ".hero-choice");
  const heroImg = one(shell, ".hero-section > img");

  const tl = gsap.timeline({ defaults: { ease: EASE } });

  // Optional transform-only settle on the LCP image (never opacity).
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
```

- [ ] **Step 2: Verify hero reveal + LCP-safety**

`npm run dev`, Playwright on `/`:
```js
// On load the hero background image must already be visible (opacity 1):
browser_evaluate(() => getComputedStyle(document.querySelector(".hero-section > img")).opacity)
// Expected: "1" immediately (image opacity never animated).
browser_evaluate(() => getComputedStyle(document.querySelector(".hero-wordmark")).visibility)
// Expected: eventually "visible"; take screenshots at 0ms and ~1200ms to confirm fade-rise.
```
Expected: wordmark + buttons fade/rise in; image is full-opacity from frame 1.

- [ ] **Step 3: Verify reduced-motion**

Playwright with `browser_emulate`/launch arg `--force-prefers-reduced-motion`, or set emulation, load `/`:
```js
browser_evaluate(() => getComputedStyle(document.querySelector(".hero-wordmark")).opacity)
// Expected: "1" (no hidden state under reduced motion).
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/motion/choreography.ts
git commit -m "feat(motion): home hero page-load reveal"
```

---

## Task 5: Home welcome section reveals

**Files:**
- Modify: `src/lib/motion/choreography.ts` (extend `buildHomeChoreography`)

**Interfaces:**
- Hooks (existing): `.welcome-line-top`, `.welcome-line-bottom`, `.welcome-heading .section-eyebrow`, `.welcome-lockup-line` (and its child `span`s), `.welcome-heading .section-subtitle`, `.map-art`, `.welcome-copy > p`, `.welcome-copy .outline-button`, `.features-title`, `.features-grid > div`.

- [ ] **Step 1: Append the welcome choreography**

At the end of `buildHomeChoreography`, append:
```ts
  // --- Welcome (scroll reveals) ---
  const wTop = one(shell, ".welcome-line-top");
  if (wTop) drawLine(wTop, "y");

  const wEyebrow = one(shell, ".welcome-heading .section-eyebrow");
  if (wEyebrow) fadeUp(wEyebrow);

  // Brand lockup: reveal the EXISTING per-char spans (layout untouched).
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
    staggerReveal(copyItems, { trigger: one(shell, ".welcome-copy") ?? copyItems[0] });
  }

  const featuresTitle = one(shell, ".features-title");
  if (featuresTitle) fadeUp(featuresTitle);
  const featureCells = $(shell, ".features-grid > div");
  if (featureCells.length) {
    staggerReveal(featureCells, { trigger: one(shell, ".features-grid") ?? featureCells[0] });
  }

  const wBottom = one(shell, ".welcome-line-bottom");
  if (wBottom) drawLine(wBottom, "y");
```

- [ ] **Step 2: Verify reveals + no layout shift on the lockup**

`npm run dev`, Playwright on `/`, scroll the `.site-shell` to the welcome section:
```js
browser_evaluate(() => {
  const shell = document.querySelector(".site-shell");
  shell.scrollTo({ top: shell.scrollHeight * 0.25, behavior: "instant" });
});
```
Take a screenshot; confirm eyebrow/title/subtitle/map/copy/features reveal. Confirm the "Introducing / Can Sakhara" lockup still renders at identical line widths (justify-between intact) — compare widths:
```js
browser_evaluate(() => {
  const lines = [...document.querySelectorAll(".welcome-lockup-line")];
  return lines.map((l) => Math.round(l.getBoundingClientRect().width));
});
// Expected: both line widths equal (layout preserved).
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/motion/choreography.ts
git commit -m "feat(motion): home welcome reveals (dividers, lockup, heading, copy, features)"
```

---

## Task 6: ExperienceCarousel entrance reveal (in-component)

**Files:**
- Modify: `src/components/ExperienceCarousel.tsx`

**Interfaces:**
- Consumes: `useGSAP`, `gsap`, factories from `@/lib/motion`.
- Adds a one-time entrance reveal of the FIRST (initially active) slide's heading + image when the section scrolls into view. Does not touch the track transform or drag logic.

- [ ] **Step 1: Add the entrance reveal**

In `src/components/ExperienceCarousel.tsx`, add imports:
```ts
import { useGSAP, gsap } from "@/lib/motion/gsap";
import { clipImageReveal, splitLinesReveal, fadeUp } from "@/lib/motion/animations";
```
Inside the component (after existing refs), add a ref for the section and a `useGSAP` hook scoped to it that reveals only the active slide's content:
```ts
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const active = section.querySelector<HTMLElement>(
          `.experience-slide:nth-child(${index + 1})`,
        );
        if (!active) return;
        const heading = active.querySelector(".experience-heading");
        const image = active.querySelector(".experience-image");
        if (heading) fadeUp(heading);
        if (image) clipImageReveal(image);
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [] },
  );
```
Attach the ref to the existing `<section ...>` (add `ref={sectionRef}` — attribute only, no structural change).

Note: `fadeUp`/`clipImageReveal` use the shared `.site-shell` scroller via `scrollTriggerVars`, so triggers fire correctly. `dependencies: []` so it runs once on mount, not on every slide step.

- [ ] **Step 2: Verify entrance + carousel still works**

`npm run dev`, Playwright on `/`, scroll to the Experience section. Confirm the active slide heading + image reveal once. Then drag/Arrow-key the carousel:
```js
// focus the viewport and press ArrowRight a few times; confirm the track still slides
// and looping/clones still behave (no console errors, no stuck hidden slides).
```
Expected: entrance reveal plays once; existing carousel behaviour unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/components/ExperienceCarousel.tsx
git commit -m "feat(motion): experience carousel entrance reveal"
```

---

## Task 7: Home Discover + Video sections

**Files:**
- Modify: `src/lib/motion/choreography.ts` (extend `buildHomeChoreography`)

**Interfaces:**
- Hooks (existing): `.discover-line-top`, `.discover-title`, `.discover-grid`, `.discover-card`, `.discover-card img`, `.video-section button`, `.discover-line-bottom`.

- [ ] **Step 1: Append discover + video choreography**

At the end of `buildHomeChoreography`, append:
```ts
  // --- Discover (scroll reveals + card-icon hover) ---
  const dTop = one(shell, ".discover-line-top");
  if (dTop) drawLine(dTop, "y");
  const dTitle = one(shell, ".discover-title");
  if (dTitle) fadeUp(dTitle);
  const cards = $(shell, ".discover-card");
  if (cards.length) {
    staggerReveal(cards, { trigger: one(shell, ".discover-grid") ?? cards[0] });
  }
  // Subtle card-icon hover (transform-only; does not touch Figma button states).
  cards.forEach((card) => {
    const icon = card.querySelector(".discover-card img");
    if (!icon) return;
    const enter = () => gsap.to(icon, { scale: 1.03, duration: 0.4, ease: EASE });
    const leave = () => gsap.to(icon, { scale: 1, duration: 0.4, ease: EASE });
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
  });

  // --- Video (play-button reveal) ---
  const playBtn = one(shell, ".video-section button");
  if (playBtn) fadeUp(playBtn);

  const dBottom = one(shell, ".discover-line-bottom");
  if (dBottom) drawLine(dBottom, "y");
```
Note: the card-hover listeners are added inside the matchMedia branch, so `mm.revert()` on route change removes their tweens; the listeners themselves are harmless and are GC'd with the detached nodes on navigation.

- [ ] **Step 2: Verify**

`npm run dev`, Playwright on `/`, scroll to Discover and Video. Confirm cards stagger in, dividers draw, play button reveals, and hovering a card scales its icon ~3% (screenshot before/after `browser_hover` on a card). Confirm the existing button hover (bg swap) is unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/lib/motion/choreography.ts
git commit -m "feat(motion): home discover + video reveals and card-icon hover"
```

---

## Task 8: Shared footer reveal

**Files:**
- Modify: `src/components/SiteFooter.tsx` (add inert `data-anim="footer-item"` to existing elements)

**Interfaces:**
- `buildCommonChoreography` (Task 3) already reveals `[data-anim='footer-item']` within `.site-footer`. This task supplies the targets.

- [ ] **Step 1: Mark footer items**

In `src/components/SiteFooter.tsx`, add `data-anim="footer-item"` to: the Mel de Magranetes logo wrapper `div`, the brand-links row `div`, and the bottom row `div`. Attributes only — no structural/visual change. Example for the logo wrapper:
```tsx
<div data-anim="footer-item" className="relative mt-[28px] h-[59px] w-[177px] md:mt-[20px] md:h-[86px] md:w-[259px]">
```
Apply the same attribute to the brand-links row (`<div className="mt-[40px] flex justify-center ...">`) and the bottom row (`<div className="flex flex-col-reverse items-center ...">`).

- [ ] **Step 2: Verify on all three routes**

`npm run dev`, Playwright: scroll to the footer on `/`, `/by-day`, `/by-night`. Confirm the logo, brand marks, and bottom row stagger-reveal once each. Confirm footer colours per theme are unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/components/SiteFooter.tsx
git commit -m "feat(motion): shared footer reveal across all pages"
```

---

## Task 9: By Day / By Night hero page-load

**Files:**
- Modify: `src/app/by-day/page.tsx` and `src/app/by-night/page.tsx` (add inert `data-anim` hooks to hero elements)
- Modify: `src/lib/motion/choreography.ts` (`buildDayNightChoreography`)

**Interfaces:**
- Hooks (added): `data-anim="hero-rule"` (the divider span), `data-anim="hero-icon"` (sun/moon Image), `data-anim="hero-title"` (the `<h1>`), `data-anim="hero-wordmark"` (the wordmark Image).

- [ ] **Step 1: Add hero hooks (both pages, identical)**

In both `by-day/page.tsx` and `by-night/page.tsx` hero section, add attributes (no structural change):
- divider `<span ...>` → add `data-anim="hero-rule"`
- sun/moon `<Image ...>` → add `data-anim="hero-icon"`
- `<h1 ...>` → add `data-anim="hero-title"`
- wordmark `<Image ...>` → add `data-anim="hero-wordmark"`

- [ ] **Step 2: Implement the day/night hero timeline**

In `src/lib/motion/choreography.ts`, set the body of `buildDayNightChoreography`:
```ts
export function buildDayNightChoreography(shell: HTMLElement): void {
  // --- Hero (page load) ---
  const rule = one(shell, "[data-anim='hero-rule']");
  const icon = one(shell, "[data-anim='hero-icon']");
  const title = one(shell, "[data-anim='hero-title']");
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
  // Character reveal on the headline; short + immediate (LCP-safe).
  if (title) charsReveal(title, { immediate: true, stagger: 0.04 });
  if (wordmark) {
    gsap.set(wordmark, { autoAlpha: 0, y: 14 });
    tl.to(wordmark, { autoAlpha: 1, y: 0, duration: DUR.reveal }, 0.5);
  }
}
```

- [ ] **Step 3: Verify both heroes + LCP fallback check**

`npm run dev`, Playwright on `/by-day` and `/by-night`. Confirm icon/title/wordmark reveal and the rule draws. Measure that the headline finishes quickly:
```js
// screenshot at ~0ms and ~900ms; the <h1> text should be fully visible by ~0.9s.
```
If a Lighthouse LCP check (optional) shows regression on the `<h1>`, apply the documented fallback: skip `charsReveal(title)` and instead `fadeUp` the surrounding `<div>` only. Note the result in the commit body if the fallback is used.

- [ ] **Step 4: Commit**

```bash
git add src/app/by-day/page.tsx src/app/by-night/page.tsx src/lib/motion/choreography.ts
git commit -m "feat(motion): by day/night hero page-load reveals"
```

---

## Task 10: By Day / By Night content sections + GalleryCarousel entrance

**Files:**
- Modify: `src/app/by-day/page.tsx`, `src/app/by-night/page.tsx` (inert `data-anim` hooks on content)
- Modify: `src/lib/motion/choreography.ts` (extend `buildDayNightChoreography`)
- Modify: `src/components/GalleryCarousel.tsx` (in-component entrance reveal)

**Interfaces:**
- Hooks (added): `data-anim="clip-image"` on each full-width image `<section>`; `data-anim="block-heading"`, `data-anim="block-subtitle"`, `data-anim="block-copy"` on the two text blocks and the Balearic/Solace blocks; `data-anim="block-button"` on the Enquire button.

- [ ] **Step 1: Add content hooks (both pages)**

In both pages:
- Each full-width image `<section className="relative ... ">` (estate view, terrace/pool view) → add `data-anim="clip-image"`.
- "Sun-Drenched Serenity"/"Glorious Afterhours" heading `<div className="text-center font-display ...">` → `data-anim="block-heading"`; the serif `<p>` → `data-anim="block-subtitle"`; the two-paragraph wrapper `<div>` → `data-anim="block-copy"`.
- "Balearic Bliss"/"Solace of Slumber" `<h2>` → `data-anim="block-heading"`; serif `<p>` → `data-anim="block-subtitle"`; `SecondaryButton` → wrap its rendered `<a>` by adding `data-anim="block-button"` (pass through `className`? No — instead add the attribute to the surrounding block). Simplest: add `data-anim="block-button"` to the `SecondaryButton` call site by adding it to the element. Since `SecondaryButton` renders an `<a>`, add a `data-anim` prop pass-through OR mark the parent container. Use the parent block container approach: the heading/subtitle/button share a flex column container — instead reveal them as a group by tagging each. For the button, add `data-anim="block-button"` to the `<a>` via a new optional prop on `SecondaryButton` (`data-anim`), forwarded to the `<a>`.

Concretely, extend `SecondaryButton` signature in both pages to forward an optional attribute:
```tsx
function SecondaryButton({ children, href, className = "", anim }: { children: React.ReactNode; href: string; className?: string; anim?: string; }) {
  return (
    <a href={href} data-anim={anim} className={`... ${className}`}>
      <span>{children}</span>
    </a>
  );
}
// call site:
<SecondaryButton anim="block-button" href="mailto:reservations@cansakhara.com">Enquire</SecondaryButton>
```

- [ ] **Step 2: Append content choreography**

At the end of `buildDayNightChoreography`:
```ts
  // --- Full-width image curtain reveals ---
  $(shell, "[data-anim='clip-image']").forEach((sec) => clipImageReveal(sec));

  // --- Text blocks ---
  $(shell, "[data-anim='block-heading']").forEach((el) => splitLinesReveal(el));
  $(shell, "[data-anim='block-subtitle']").forEach((el) => splitLinesReveal(el));
  $(shell, "[data-anim='block-copy']").forEach((el) => {
    const paras = Array.from(el.querySelectorAll(":scope > p"));
    if (paras.length) staggerReveal(paras, { trigger: el });
    else fadeUp(el);
  });
  $(shell, "[data-anim='block-button']").forEach((el) => fadeUp(el));
```
Note: `clip-image` on a `<section>` whose `<Image fill>` paints a full-bleed photo — the section box itself is clipped, giving a curtain reveal without revealing edges (the image fully covers the box at all clip stages).

- [ ] **Step 3: GalleryCarousel desktop entrance reveal**

In `src/components/GalleryCarousel.tsx`, add:
```ts
import { useGSAP, gsap } from "@/lib/motion/gsap";
import { clipImageReveal } from "@/lib/motion/animations";
```
Add a ref to the desktop viewport wrapper and a `useGSAP` that, on desktop + no-preference, staggers a clip reveal across the three initially-visible middle-copy slides once on scroll-in. Guard with `isDesktop` so the native mobile strip is untouched:
```ts
  const desktopRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!isDesktop) return;
      const root = desktopRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const visible = Array.from(
          root.querySelectorAll<HTMLElement>(".gallery-slide"),
        ).slice(n, n + 3); // the middle copy = the initially visible slides
        visible.forEach((slide, i) => {
          gsap.set(slide, { clipPath: "inset(0% 0% 100% 0%)" });
          gsap.to(slide, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: {
              trigger: root,
              scroller: document.querySelector(".site-shell") ?? undefined,
              start: "top 85%",
              once: true,
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: desktopRef, dependencies: [isDesktop] },
  );
```
Attach `ref={desktopRef}` to the existing desktop wrapper `<div className="hidden md:flex md:justify-center">` (attribute only). `void clipImageReveal;` is not needed — remove the unused import if not referenced, or use `clipImageReveal` instead of the inline version to stay DRY (preferred): replace the inline `gsap.set/to` with `clipImageReveal(slide)` plus a manual delay is not supported by the factory — keep the inline version and drop the `clipImageReveal` import to avoid an unused symbol.

- [ ] **Step 4: Verify both pages end-to-end**

`npm run dev`, Playwright on `/by-day` and `/by-night`: scroll through. Confirm full-width images curtain-reveal, text blocks reveal line-by-line, buttons reveal, and the desktop gallery slides stagger-reveal on entry. Confirm the mobile gallery strip (resize to 375px) still uses native snap-scroll and is NOT clip-revealed. Confirm autoplay still advances after entrance.

- [ ] **Step 5: Commit**

```bash
git add src/app/by-day/page.tsx src/app/by-night/page.tsx src/lib/motion/choreography.ts src/components/GalleryCarousel.tsx
git commit -m "feat(motion): by day/night content reveals and gallery entrance"
```

---

## Task 11: Full end-to-end verification + production build

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run:
```bash
npm run build
```
Expected: clean build, no type errors, no warnings about `useLayoutEffect` on the server (MotionRoot is client-only).

- [ ] **Step 2: Cross-route walkthrough (normal motion)**

`npm run dev`, Playwright at desktop (1440px) and mobile (375px) for `/`, `/by-day`, `/by-night`:
- All reveals fire (scroller correctly bound — nothing stuck hidden).
- No console errors/warnings.
- Carousels (Experience + Gallery) drag/keyboard/autoplay all still work.
- Figma hover states (buttons/links/cards) unchanged.

- [ ] **Step 3: Reduced-motion walkthrough**

Re-run with reduced motion forced (Playwright `--force-prefers-reduced-motion` or emulation). For each route assert no element is left hidden:
```js
browser_evaluate(() => {
  const hidden = [...document.querySelectorAll("*")].filter((el) => {
    const s = getComputedStyle(el);
    return s.visibility === "hidden" || s.opacity === "0";
  }).length;
  return hidden; // expect 0 from our animation layer (ignore pre-existing aria-hidden carousel clones)
});
```
Expected: content fully visible, no motion.

- [ ] **Step 4: CLS / LCP spot check**

In DevTools (or Playwright performance): confirm on `/` the LCP element is the hero image and is not delayed by animation; confirm CLS ≈ 0 across all routes (reveals are transform/opacity/clip-path only). Note results.

- [ ] **Step 5: Lint (final, single pass — present findings, do not auto-fix in a loop)**

Run:
```bash
npm run lint
```
Present any findings to the user for a decision (per project lint policy). Do not iterate fix→relint autonomously.

- [ ] **Step 6: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "test(motion): end-to-end verification fixes"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** Hero load (T4, T9) · "Introducing/Can Sakhara" char reveal via existing spans (T5) · section heading line reveals (T5, T10) · dividers draw (T5, T7, T9) · body/features staggers (T5) · experience image mask + entrance (T6) · discover cards + card-icon hover (T7) · footer (T8) · subpage hero char reveal + rule (T9) · full-width image clip reveals (T10) · text blocks (T10) · gallery entrance (T10) · CWV/reduced-motion/scroller constraints (T1–T3, T11) · intentionally-avoided items honoured (no MenuDrawer/Header GSAP, no count-up, no hover override). All spec sections map to a task.

**Placeholder scan:** No TBD/TODO; every code step contains real code; verification steps give exact commands and expected outcomes.

**Type consistency:** Factory names (`fadeUp`, `staggerReveal`, `splitLinesReveal`, `charsReveal`, `revealExistingChars`, `clipImageReveal`, `drawLine`) and build fns (`buildCommonChoreography`, `buildHomeChoreography`, `buildDayNightChoreography`) are used consistently across T2–T10. `scrollTriggerVars`/`getScroller` signatures stable from T1.
