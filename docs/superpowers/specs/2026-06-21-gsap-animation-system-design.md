# Can Sakhara — GSAP Premium Animation System

**Date:** 2026-06-21
**Status:** Approved (design) — ready for implementation planning
**Author:** Motion/frontend pass

---

## 1. Goal

Add a premium, understated GSAP animation layer across the entire Can Sakhara
marketing site (home `/`, `/by-day`, `/by-night` and shared components) that
feels appropriate for an ultra-high-end brand: elegant, intentional, expensive,
and quiet. Motion must enhance the existing design without altering layout,
spacing, typography, colour, content, component structure, or responsive
behaviour, and without regressing Core Web Vitals.

## 2. Constraints (non-negotiable)

- **No structural/layout change.** Animation attaches to *existing* elements via
  data attributes. No new wrapper DOM, no changes to widths, gaps, flow, or the
  fixed-width Figma layout. (Chosen architecture: attribute-driven orchestrator.)
- **Animated properties are limited to `transform`, `opacity`, and `clip-path`.**
  No animation of width/height/top/left/margin/padding → no layout thrash, no CLS.
- **`prefers-reduced-motion: reduce`** users receive the final visual state
  instantly, with no motion. All GSAP work is wrapped in `gsap.matchMedia()`.
- **Core Web Vitals must not regress.**
  - The home hero image (`hero.png`, `priority`) is the LCP element — its
    **opacity is never animated**; it paints immediately at full opacity.
  - Subpage hero `<h1>` is a likely LCP element — its reveal begins immediately
    on load and is short; if Lighthouse shows an LCP regression, the fallback is
    to not hide the `<h1>` (reveal only its surrounding elements).
  - SplitText runs only after `document.fonts.ready` (avoids mis-split reflow)
    and is reverted to clean DOM once its reveal completes.
  - No permanent `will-change`; scroll reveals use `once: true` so triggers
    self-disable.
- **Match, do not override, the Figma-defined interactive states.** Existing
  button/link/card hover states are part of the design spec and stay as-is.
- **Dependencies:** add `gsap` and `@gsap/react` (the `useGSAP()` hook) — the
  only additions. (Approved; overrides the AGENTS.md "ask before adding
  libraries" gate for these two.)

## 3. The single most important technical fact

The page **scrolls inside `.site-shell` (the `<main>` element), not the window**
(`body` is `overflow:hidden; height:100vh`). Every ScrollTrigger MUST be
configured with `scroller: ".site-shell"` (resolved to the current `<main>`),
or no scroll animation will fire. The orchestrator resolves and sets this once
per route.

## 4. Motion language (shared tokens)

A single token set, used everywhere, so the whole site reads as one
choreography:

| Token | Value | Rationale |
|---|---|---|
| Entrance ease | `power3.out` | Matches existing carousel easing `cubic-bezier(0.22,1,0.36,1)`; calm decel, no overshoot. |
| Reveal duration | 0.8–1.1s | Reads as deliberate/expensive, not sluggish. |
| Text / line reveal | ~0.9s, stagger 0.08s | Measured and legible. |
| Image mask reveal | ~1.1s, `clip-path` | Elegant unveil, GPU-composited. |
| Travel distance | 16–28px desktop / 12–18px mobile | Subtle rise; never "flying". |
| Scroll trigger | `start: "top 85%"`, `once: true` | Reveal once; never re-hide on scroll-up. |

Explicitly excluded easings/effects: bounce, elastic, back/overshoot, spin,
large scale, exaggerated parallax, flying elements.

## 5. Architecture

### 5.1 Modules

- **`src/lib/motion/gsap.ts`**
  - Registers plugins once: `ScrollTrigger`, `SplitText`, `useGSAP`.
  - Exports tokens: `EASE`, `DUR`, `DIST` (responsive distance helper).
  - `getScroller()` → the current `.site-shell` element.
  - `reducedMotion()` helper / shared `matchMedia` conditions.

- **`src/lib/motion/animations.ts`** — pure factory functions, each
  reduced-motion-aware and each returning a tween/timeline:
  - `fadeUp(targets, opts)` — opacity 0→1 + y rise.
  - `staggerReveal(targets, opts)` — grouped `fadeUp` with stagger.
  - `splitLinesReveal(el)` — SplitText by lines, stagger rise, **revert on
    complete**.
  - `charsReveal(el)` — character stagger (used where per-char spans exist or via
    SplitText chars; revert on complete).
  - `clipImageReveal(el)` — `clip-path` inset curtain reveal.
  - `drawLine(el)` — `scaleY`/`scaleX` 0→1 from origin (decorative dividers).

- **`src/components/MotionRoot.tsx`** — `"use client"`, mounted once in
  `src/app/layout.tsx` alongside `{children}` (layout stays a server component).
  - Keyed on `usePathname()`; re-initialises on route change.
  - Uses `useGSAP({ scope })` for automatic cleanup of tweens, ScrollTriggers,
    and SplitText instances on unmount/route change.
  - On run: `await document.fonts.ready` → resolve scroller → build choreography
    → `ScrollTrigger.refresh()`.
  - Generic reveals are declared via `data-anim` attributes on existing
    elements; a few bespoke timelines (hero page-load) are keyed by pathname.

### 5.2 Declarative attribute vocabulary (added to existing elements only)

- `data-anim="fade-up"` — single element fade + rise.
- `data-anim="split-lines"` — heading/subtitle line reveal.
- `data-anim="chars"` — character reveal (brand headlines).
- `data-anim="clip-image"` — image/section curtain reveal.
- `data-anim="draw-line"` — divider draw.
- `data-anim-group` + `data-anim="stagger-item"` — grouped staggered reveal.
- Optional `data-anim-delay` / ordering hooks where a sequence needs it.

These attributes are visually inert; adding them changes nothing about layout or
appearance.

### 5.3 Carousels & header (motion stays in-component)

- **ExperienceCarousel** / **GalleryCarousel**: a one-time **entrance reveal**
  when scrolled into view, implemented *inside* the component with `useGSAP`
  using the shared tokens, so it never conflicts with the existing track
  transform or gallery autoplay.
- **SiteHeader** (hide/show) and **MenuDrawer** (staggered links) keep their
  existing CSS motion — not re-implemented in GSAP.

## 6. Per-area choreography

### Home `/`
- **Hero (Page Load):** wordmark fade + rise (begins immediately); By Day / By
  Night buttons staggered after; optional 4% transform-only image settle
  (1.04→1, never opacity).
- **"Introducing / Can Sakhara" (Text):** per-character stagger using the
  *existing* per-char spans rendered by `JustifiedLine` (no SplitText, justify
  layout untouched — animate opacity + tiny y only, never width).
- **Section heading (Text/Scroll):** eyebrow/title/subtitle line reveals.
- **Dividers (Scroll):** `scaleY` draw from top.
- **Map / body copy / Enquire (Scroll):** staggered fade + rise.
- **Features (Scroll):** left-to-right staggered fade + rise. (No count-up.)
- **Experience image (Image Reveal):** `clip-path` mask (the
  `.experience-image` already has `overflow:hidden`).
- **Discover cards (Scroll):** staggered fade + rise.

### By Day / By Night (shared)
- **Hero (Page Load + Text):** sun/moon icon fade-rise, `<h1>` character reveal
  (short, immediate — LCP-safe), wordmark fade, divider draw-in.
- **Full-width estate/terrace/pool images (Image Reveal):** `clip-path` curtain
  reveal animated on the section (no wrapper).
- **"Sun-Drenched Serenity" / "Glorious Afterhours" (Text):** two-line heading
  stagger, serif subtitle line reveal, paragraph fade-rise.
- **"Balearic Bliss" / "Solace of Slumber" (Text/Scroll):** heading + subtitle +
  button reveal.
- **Footer (Scroll):** logo + brand marks staggered fade-rise, divider draw.

## 7. Impact ranking

- **High:** ① home hero page-load · ② "Introducing / Can Sakhara" character
  reveal · ③ subpage hero headline reveal + divider draw · ④ section-heading line
  reveals (site-wide) · ⑤ full-width image clip reveals.
- **Medium:** ⑥ divider draws · ⑦ body/features staggers · ⑧ discover cards · ⑨
  footer · ⑩ gallery/experience entrance reveal.
- **Low / optional:** ⑪ hero 4% settle · ⑫ subtle card-icon hover · ⑬ video
  play-button reveal · ⑭ per-slide carousel text re-animation.

### Decisions on optional items (this build)
- **Include (low-risk):** ⑪ hero settle, ⑫ card-icon hover, ⑬ video play-button
  reveal — all transform/opacity only, all reduced-motion-aware.
- **Defer / exclude:** ⑭ per-slide carousel text re-animation (entrance reveal
  only, to avoid fighting the track) and any scrubbed/pinned parallax. May
  revisit if desired after the core build lands.

## 8. Intentionally NOT animated (and why)

1. **Figma-defined hover states** on buttons/links/cards — part of the design
   spec; overriding them contradicts the design.
2. **Features numbers count-up** — CLS risk from digit-width jitter; reads
   "techy," not luxury.
3. **MenuDrawer / SiteHeader** — already refined in CSS; duplication causes
   conflict.
4. **Home hero image opacity** — LCP element; only an optional transform settle.
5. **Aggressive parallax / pinned-scrubbed timelines** — CWV/layout risk with
   the custom scroller and fixed-width design.
6. **Mobile** stays lighter (shorter travel, no parallax); the native-scroll
   mobile gallery strip is untouched.

## 9. Performance & CWV safeguards

- Animate only `transform` / `opacity` / `clip-path`.
- SplitText created after `document.fonts.ready`, reverted to clean DOM on
  complete.
- `ScrollTrigger` reveals use `once: true`; `ScrollTrigger.refresh()` after fonts
  load and on the orchestrator re-init.
- No permanent `will-change`; rely on GSAP's transient handling.
- GSAP/ScrollTrigger/SplitText load only client-side (within `"use client"`
  modules), so no SSR cost; gsap core tree-shakes.
- Hero/above-the-fold initial hidden states are set inside `useGSAP`'s layout
  effect (pre-paint after hydration) to avoid FOUC; below-the-fold elements are
  off-screen so any single-frame set is invisible.

## 10. Testing & verification

- `npm run dev` walkthrough of all three routes (Playwright MCP available):
  - No FOUC; reveals fire (custom scroller wired correctly).
  - No layout shift (DevTools Performance / Layout Shift regions).
  - `prefers-reduced-motion: reduce` → content visible instantly, no motion.
  - Keyboard navigation, focus states, carousels, and Figma hover states all
    unchanged.
  - Console clean (no GSAP target/plugin warnings).
- `npm run build` to confirm a clean production compile.
- Spot-check CWV (LCP unaffected on home; CLS ~0).

## 11. Out of scope

- New content, copy, imagery, or pages.
- Redesigning existing CSS transitions (header/drawer/buttons).
- Any video playback wiring for the play button (animation only).
- Tablet-specific design (uses desktop, per project rules).
