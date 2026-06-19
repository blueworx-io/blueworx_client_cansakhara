# Unified Header & Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the site to one `SiteHeader` and one `MenuDrawer`, themed per page (home / By Day / By Night).

**Architecture:** A single client `SiteHeader` takes a `theme` prop, owns the open/close state, and passes the page's panel colour to a single `MenuDrawer`. Each page (server component) renders `<SiteHeader theme=… />`. The duplicated subpage navs and `SubpageMenu` are removed.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.

## Global Constraints

- Match the three Figma menu designs exactly (file `GUaeepCiqEjAUkIQrW2kff`): home `1-930`, By Day `1-1216`, By Night `1-1373`. Use exact values; never approximate.
- Drawer panel colours: home `#422833`, By Day `#ac9a8c`, By Night `#031927`.
- Navbar: `h-[131px]`, horizontal padding `80px` (desktop), inner max width `1280px`, `backdrop-blur-[3px]`, `bg-white/5`. White hamburger (two `2px` bars, `48px` wide, `8px` gap) + "Menu" (Neulis Regular `14px`, tracking `5.6px`). Centre `52px` square logo crossfading to `hero-wordmark.svg` on open. Bordered **ENQUIRE** button — white border, `14px`, tracking `5.6px`, padding `32px/16px`, **no icon**.
- No new dependencies. Tailwind-first. Keep changes focused; do not alter unrelated page content (hero sections, footers, divider lines).
- Mobile menu UX is out of scope — preserve existing responsive padding/height; do not redesign mobile.
- There is no test framework. Verification gate for every task: `npm run build` passes (typecheck + compile) and visual parity with the referenced Figma node. Run `npm run lint` once at the end and report findings (do not auto-fix in a loop).
- Commit message trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Add `panelColor` prop to `MenuDrawer`

**Files:**
- Modify: `src/components/MenuDrawer.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `MenuDrawer` accepts `panelColor: string` (a hex colour) applied to the panel background, in addition to existing `open`, `onClose`, `returnFocusRef`.

- [ ] **Step 1: Add the prop to the component signature**

In `src/components/MenuDrawer.tsx`, extend the props type and destructure:

```tsx
export default function MenuDrawer({
  open,
  onClose,
  returnFocusRef,
  panelColor,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  panelColor: string;
}) {
```

- [ ] **Step 2: Apply the colour to the panel, removing the hardcoded value**

Change the `<aside>` className — remove `bg-[#422833]` and add an inline style. The class string currently is:

```tsx
className={`fixed inset-y-0 left-0 z-50 w-[450px] max-w-full bg-[#422833] text-white transition-[translate] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
  open ? "translate-x-0" : "-translate-x-full"
}`}
```

Replace with (drop `bg-[#422833]`, add `style`):

```tsx
style={{ backgroundColor: panelColor }}
className={`fixed inset-y-0 left-0 z-50 w-[450px] max-w-full text-white transition-[translate] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
  open ? "translate-x-0" : "-translate-x-full"
}`}
```

Note: the `hover:text-[#422833]` on the close button (`hover:bg-white hover:text-[#422833]`) is the icon-recolour-on-hover. Leave it as-is for now — it only shows on the home theme and is visually acceptable on all three; it is not worth threading the theme colour through for a 52px icon hover. (If a reviewer flags it, a follow-up can bind it to `panelColor`.)

- [ ] **Step 3: Build to verify types compile**

Run: `npm run build`
Expected: build fails in `SiteHeader.tsx` (it calls `MenuDrawer` without the now-required `panelColor`) — this is expected and fixed in Task 2. Confirm `MenuDrawer.tsx` itself has no type error. If you want a clean isolated check first, temporarily ensure no other caller — but do not commit until Task 2. Proceed to Task 2 in the same working session before committing, OR temporarily give `panelColor` a default for an isolated green build:

For an isolated green build in this task, give the prop a safe default so existing callers still compile:

```tsx
  panelColor = "#422833",
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  panelColor?: string;
}) {
```

Then `npm run build` should PASS. (Task 2 will pass the colour explicitly; the default stays as a harmless fallback.)

- [ ] **Step 4: Commit**

```bash
git add src/components/MenuDrawer.tsx
git commit -m "Add panelColor prop to MenuDrawer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Unify `SiteHeader` with a `theme` prop

**Files:**
- Modify: `src/components/SiteHeader.tsx`

**Interfaces:**
- Consumes: `MenuDrawer` (`panelColor` from Task 1).
- Produces: `SiteHeader` accepts `theme: "home" | "day" | "night"` (default `"home"`); exports `type SiteTheme = "home" | "day" | "night"`.

- [ ] **Step 1: Replace the whole file with the unified header**

Overwrite `src/components/SiteHeader.tsx` with:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import MenuDrawer from "@/components/MenuDrawer";

const ENQUIRE_HREF = "mailto:reservations@cansakhara.com";

export type SiteTheme = "home" | "day" | "night";

// Per-page drawer panel colour (Figma: home 1:979, day 1:1273, night 1:1373).
const DRAWER_COLORS: Record<SiteTheme, string> = {
  home: "#422833",
  day: "#ac9a8c",
  night: "#031927",
};

// Two stacked 2px bars, 48px wide, 8px gap — the Figma navbar hamburger.
function MenuBars() {
  return (
    <span aria-hidden="true" className="flex w-12 flex-col gap-2">
      <span className="h-px w-full bg-current md:h-[2px]" />
      <span className="h-px w-full bg-current md:h-[2px]" />
    </span>
  );
}

export default function SiteHeader({ theme = "home" }: { theme?: SiteTheme }) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <nav className="absolute inset-x-0 top-0 z-40 flex h-28 items-center bg-white/5 px-6 text-white backdrop-blur-[3px] md:h-[131px] md:px-20">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="site-menu"
            className="flex items-center gap-5 justify-self-start font-display text-[11px] uppercase tracking-[0.42em] md:gap-6 md:text-[14px] md:tracking-[5.6px]"
          >
            <MenuBars />
            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* Centre mark: square logo in flow defines the cell; wordmark overlays
              absolutely so the crossfade never shifts layout. */}
          <Link
            href="/"
            aria-label="Can Sakhara home"
            className="relative grid place-items-center justify-self-center"
          >
            <span
              className={`transition-[opacity,scale] duration-500 ease-out ${
                open ? "scale-90 opacity-0" : "scale-100 opacity-100"
              }`}
            >
              <Image src="/images/logo-white.svg" alt="" width={52} height={52} />
            </span>
            <span
              aria-hidden={!open}
              className={`pointer-events-none absolute left-1/2 top-1/2 w-[180px] -translate-x-1/2 -translate-y-1/2 transition-[opacity,scale] duration-500 ease-out md:w-[262px] ${
                open ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <Image
                src="/images/hero-wordmark.svg"
                alt=""
                width={262}
                height={20}
                className="w-full"
              />
            </span>
          </Link>

          <div className="hidden justify-self-end sm:block">
            <a
              href={ENQUIRE_HREF}
              className="inline-flex items-center justify-center whitespace-nowrap border border-current px-8 py-4 font-display text-[14px] uppercase tracking-[5.6px] transition-colors duration-200 hover:bg-white hover:text-[#42081a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Enquire
            </a>
          </div>
        </div>
      </nav>

      <MenuDrawer
        open={open}
        onClose={close}
        returnFocusRef={menuButtonRef}
        panelColor={DRAWER_COLORS[theme]}
      />
    </>
  );
}
```

Key changes from the previous version: `theme` prop + `DRAWER_COLORS`; the menu control is now a `<button>` (no mobile `#welcome` fallback — the drawer opens at all sizes); ENQUIRE loses the icon and adopts `tracking-[5.6px]` / `py-4`; navbar gains `bg-white/5 backdrop-blur-[3px]` and an inner `max-w-[1280px]` grid; `panelColor` passed to the drawer.

- [ ] **Step 2: Build to verify it compiles**

Run: `npm run build`
Expected: PASS (home page still imports `SiteHeader` with no props → defaults to `theme="home"`).

- [ ] **Step 3: Commit**

```bash
git add src/components/SiteHeader.tsx
git commit -m "Unify SiteHeader with per-page theme prop

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Wire all pages to the shared header; remove the subpage navs and `SubpageMenu`

**Files:**
- Modify: `src/app/page.tsx` (home — set explicit theme)
- Modify: `src/app/by-day/page.tsx` (replace inline nav)
- Modify: `src/app/by-night/page.tsx` (replace inline nav)
- Delete: `src/components/SubpageMenu.tsx`

**Interfaces:**
- Consumes: `SiteHeader` (`theme` prop from Task 2).
- Produces: nothing downstream.

- [ ] **Step 1: Set the explicit home theme**

In `src/app/page.tsx`, change the header usage from `<SiteHeader />` to:

```tsx
<SiteHeader theme="home" />
```

(Leaving it as `<SiteHeader />` also works via the default, but be explicit for parity with the subpages.)

- [ ] **Step 2: Replace the By Day inline nav with the shared header**

In `src/app/by-day/page.tsx`:

1. Replace the import `import SubpageMenu from "@/components/SubpageMenu";` with `import SiteHeader from "@/components/SiteHeader";`.
2. Delete the entire `<nav>…</nav>` block (the one containing `<SubpageMenu />`, the centre logo `Link`, and the `SecondaryButton` "Enquire"). It currently sits at the top of the hero `<section>`.
3. In its place put:

```tsx
<SiteHeader theme="day" />
```

Leave everything else in the hero untouched: the white divider line (`<span … top-[131px] … bg-white />`) and the sun/By Day/wordmark block remain page content.

- [ ] **Step 3: Replace the By Night inline nav with the shared header**

In `src/app/by-night/page.tsx`, apply the identical change as Step 2 but with the night theme:

1. Replace `import SubpageMenu from "@/components/SubpageMenu";` with `import SiteHeader from "@/components/SiteHeader";`.
2. Delete the entire `<nav>…</nav>` block containing `<SubpageMenu />`.
3. In its place put:

```tsx
<SiteHeader theme="night" />
```

Leave the divider line and moon/By Night/wordmark hero block untouched.

- [ ] **Step 4: Remove now-unused `SecondaryButton`/`PhoneIcon` only if they became unused**

In `by-day/page.tsx` and `by-night/page.tsx`, `SecondaryButton` is still used lower down (the "Enquire" CTA in the Balearic Bliss / Solace sections), so keep it. Confirm by searching each file for `SecondaryButton` — if it still appears outside the deleted nav, leave the helper and its `PhoneIcon`. Do not delete code that is still referenced.

- [ ] **Step 5: Delete `SubpageMenu.tsx`**

```bash
git rm src/components/SubpageMenu.tsx
```

- [ ] **Step 6: Build to verify everything compiles and there are no dangling imports**

Run: `npm run build`
Expected: PASS, with no "SubpageMenu is not defined" or unused-import errors.

- [ ] **Step 7: Visual parity check**

Run `npm run dev` and verify against Figma:
- Home `/` — open menu → drawer is `#422833`, navbar crossfades square logo → wordmark, ENQUIRE has no icon. (node `1-930`)
- `/by-day` — open menu → drawer is `#ac9a8c`. (node `1-1216`)
- `/by-night` — open menu → drawer is `#031927`. (node `1-1373`)
- All three: hamburger + "Menu", links EXPERIENCE / BY DAY / BY NIGHT, white ✕, stacked logo — unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx src/app/by-day/page.tsx src/app/by-night/page.tsx
git commit -m "Use shared SiteHeader on all pages; remove SubpageMenu

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 9: Final lint (report only)**

Run: `npm run lint`
Present any findings to the user; do not auto-fix without approval.

---

## Self-Review notes

- **Spec coverage:** one `SiteHeader` (Task 2) + one `MenuDrawer` (Task 1) used on all pages (Task 3); per-page drawer colours via `DRAWER_COLORS` (Task 2); `SubpageMenu` and inline navs removed (Task 3); crossfade on all pages (Task 2); icon-less ENQUIRE (Task 2); mobile out of scope (preserved responsive padding). All covered.
- **Type consistency:** `SiteTheme` and `DRAWER_COLORS` defined in Task 2; `panelColor: string` defined in Task 1 and supplied in Task 2. `menuButtonRef` is `useRef<HTMLButtonElement>` to match the `<button>` element and `returnFocusRef?: RefObject<HTMLElement | null>`.
- **Placeholders:** none — every code change is shown in full.
```
