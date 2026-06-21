# Unified Header & Menu — Design Spec

**Date:** 2026-06-19
**Branch:** `feat/unified-header-menu`

## Goal

Consolidate the site to **one header component and one menu drawer**, used across
all pages, that **switch colours depending on which page the user is on**.

Source of truth — three Figma "open menu" designs (desktop, 1440):

- Home menu — node `1-930`
- By Day menu — node `1-1216`
- By Night menu — node `1-1373`

File key: `GUaeepCiqEjAUkIQrW2kff`.

## Current state (to be replaced)

- `src/components/SiteHeader.tsx` — home-only navbar; square-logo↔wordmark
  crossfade on open; icon-less "Enquire".
- `src/components/SubpageMenu.tsx` — partial duplicate menu trigger.
- Inline `<nav>` blocks duplicated in `src/app/by-day/page.tsx` and
  `src/app/by-night/page.tsx` (square logo, phone-icon "ENQUIRE").
- `src/components/MenuDrawer.tsx` — shared drawer, but panel colour hardcoded
  `#422833`.

## What the designs establish

All three menu designs are **structurally identical**; they differ only in the
drawer panel / page theme colour:

| Page    | Drawer panel bg | Figma node |
|---------|-----------------|------------|
| Home    | `#422833`       | `1:979`    |
| By Day  | `#ac9a8c`       | `1:1273`   |
| By Night| `#031927`       | `1:1373`   |

Shared values (already match today's `MenuDrawer`, no change needed):

- Scrim: `rgba(0,0,0,0.35)`, full viewport.
- Panel: `450px` wide (`max-w-full`), full height, white foreground.
- Stacked white logo (`logo-stacked-white.svg`) at `left-[50px] top-[201px]`,
  `251×85`.
- Divider line `left-[50px] top-[131px] w-[350px]`, white.
- Close ✕: white-bordered `52px` box, top `46px`, right edge at `400px`.
- Links EXPERIENCE / BY DAY / BY NIGHT at `left-[50px]`, tops `356 / 423 / 490`,
  Neulis Sans Light `21px`, tracking `4.2px`, white.

Navbar (shared across all three menu designs):

- `h-[131px]`, horizontal padding `80px`, inner content max width `1280px`.
- `backdrop-blur-[3px]`, faint `bg-white/5` (per home menu node `1:960`).
- White hamburger (two `2px` bars, `48px` wide, `8px` gap) + "Menu" label,
  Neulis Regular `14px`, tracking `5.6px`.
- Centre: `52px` square logo.
- Right: bordered **ENQUIRE** button — white border, Neulis Regular `14px`,
  tracking `5.6px`, padding `32px / 16px`. **No phone icon** (per user
  instruction, overriding the icon shown in the Figma component).

## Design

### Theme mechanism

A single theme map, keyed by page:

```
{ home: "#422833", day: "#ac9a8c", night: "#031927" }
```

Each page renders `<SiteHeader theme="home" | "day" | "night" />`. The header
passes the resolved panel colour to `MenuDrawer`. An explicit prop (rather than
`usePathname()`) keeps the page files as server components and makes the mapping
explicit at each call site.

### Components

1. **`SiteHeader`** (`theme` prop) — the single navbar for every page.
   - White hamburger + "Menu" (`14px`, tracking `5.6px`).
   - Centre square logo (`logo-white.svg`, `52px`) that **crossfades to the
     horizontal wordmark** (`hero-wordmark.svg`) when the menu opens — the
     existing home behaviour, now applied on **all** pages (explicit user
     request; an intentional enhancement over the static designs, which keep the
     square logo).
   - **ENQUIRE** button: white border, "ENQUIRE", `14px`, tracking `5.6px`,
     padding `32/16`, no icon. Hover matches existing outline-button behaviour.
   - `backdrop-blur-[3px]`, `bg-white/5`.
   - Owns the open/close state; renders `MenuDrawer` with the theme colour.
   - Keeps the current responsive mobile padding/height; **mobile menu UX is out
     of scope for this change** (to be designed later). The drawer still opens
     and is usable on mobile because it is `max-w-full`.

2. **`MenuDrawer`** — unchanged except it gains a `panelColor` prop used for the
   panel background (replacing the hardcoded `#422833`). All other markup,
   transitions, focus handling, and scroll-lock behaviour are preserved.

3. **Removals / wiring**
   - Delete `src/components/SubpageMenu.tsx`.
   - Replace the inline `<nav>` in `by-day/page.tsx` and `by-night/page.tsx`
     with `<SiteHeader theme="day" />` / `<SiteHeader theme="night" />`.
   - The subpage hero divider line and sun/moon hero content remain page
     content (not part of the header).

## Out of scope

- The cream `#f7f2ec` "Reserve now" sticky bottom bar (off-brand teal/orange
  palette) present in the Figma files — confirmed ignored.
- Mobile-specific menu/header layout — deferred.

## Acceptance

- One `SiteHeader` and one `MenuDrawer` used on home, By Day, and By Night.
- Drawer panel colour matches the table above per page.
- Navbar identical across pages: white hamburger + "Menu", crossfade
  square↔wordmark on open, icon-less ENQUIRE button.
- `SubpageMenu` and the inline subpage navs are gone.
- No visual regression to the shared drawer (links, logo, ✕, transitions).
