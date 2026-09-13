# Can Sakhara as a WordPress plugin — design

**Date:** 2026-08-25
**Status:** approved design, pending implementation plan
**Repo:** `blueworx_client_cansakhara` (converted in place)

## Goal

Ship the Can Sakhara marketing site as a self-contained BlueWorx WordPress
plugin, with the rendered design identical to the current Next.js build at both
designed breakpoints.

The design is the hard constraint. Everything below is chosen to make fidelity a
property of the port rather than a thing to be re-checked by eye.

## What exists today

A Next.js App Router site, ~3,400 lines:

- Three routes: `/`, `/by-day`, `/by-night`.
- Nine React components: `SiteHeader`, `MenuDrawer`, `SiteFooter`,
  `SideProgressNav`, `SunMoonIcon`, `ExperienceCarousel`, `GalleryCarousel`,
  `GalleryPeekStrip`, `GalleryScrollRow`, plus `MotionRoot`.
- A GSAP motion layer in `src/lib/motion/` (`gsap.ts`, `animations.ts`,
  `choreography.ts`) — imperative, with no React inside it.
- Tailwind v4 with a 720-line `globals.css`, a single 796px mobile/desktop
  switch point, and an in-page scroll container (`.site-shell`) rather than
  window scroll.
- No forms. The only actions are `mailto:` and two outbound links.
- Fonts via `next/font/google`: Montserrat (100–500), Source Sans 3 (300/400),
  Source Serif 4 (300/400 plus italics).

## Approach

**PHP templates, Tailwind retained, GSAP reused.** Rejected alternatives:
wrapping the React app in a PHP shell (client-rendered only, no server HTML on a
site that depends on search), and baking in the Next.js static export (not a
maintainable plugin, and against the Foundation's no-page-builders rule).

This follows `bluegroup_project_blueworx`, which made the same move from headless
Next.js to a plugin and is the Foundation's worked example.

## Repo shape

The repo converts in place to a Foundation WordPress plugin project.

- Slug `blueworx-client-cansakhara`; main file `blueworx-client-cansakhara.php`
  at the repo root, carrying `Plugin Name:` and `Version:` headers plus a
  matching version constant.
- `includes/` — PHP, every global prefixed `cansakhara_`.
- `templates/pages/`, `templates/parts/` — markup.
- `assets/css/`, `assets/js/`, `assets/img/`, `assets/fonts/` — front-end assets.
- `uninstall.php` removing only this plugin's own options.
- Version starts at `0.1.0`, identical in the header, the constant and
  `package.json`.

Removed: `src/`, `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`,
`public/`, `.next/`, `tsconfig.json`, the Domscribe dev integration and the
Netlify deployment path.

**Before anything is deleted, the current commit is tagged `nextjs-final`** so
the reference build stays one checkout away. The screenshot baselines below are
captured from it first.

Carried in from `bluegroup_core_foundation` per the WordPress plugin starter
prompt: `CLAUDE.md`, `approved-deps.json`, PR and issue templates,
`.claude/settings.json`, the admin-UI adherence hook, the
`blueworx-admin-design` skill folder and its stylesheet/fonts/icons copies, the
CI and release caller workflows, and the Plugin Update Checker bootstrap.

## Routing and rendering

On activation the plugin creates three real WordPress Pages — `home`, `by-day`,
`by-night` — and stamps each with `_cansakhara_page` post meta. Ownership is
read from that meta, never from the slug: a slug is a coincidence, the stamp is a
fact. `home` is set as the site's front page.

Real Pages exist so permalinks, menus and SEO plugins behave normally. They are
not editable content — the markup lives in the templates, as agreed.

Rendering is taken over on `template_include` for owned pages, and the plugin
emits the **entire HTML document** — doctype, `<head>`, `<body>` — calling
`wp_head()` and `wp_footer()` so other plugins and the admin bar still work. The
active theme therefore has no influence on the design, on any host. This is the
mechanism that makes the fidelity guarantee hold.

Deactivation leaves the Pages in place. Uninstall removes the plugin's own
options only — deleting pages a site owner can see is not something to do
silently on uninstall.

## Markup

| Next.js | Plugin |
|---|---|
| `src/app/page.tsx` | `templates/pages/home.php` |
| `src/app/by-day/page.tsx` | `templates/pages/by-day.php` |
| `src/app/by-night/page.tsx` | `templates/pages/by-night.php` |
| `src/app/layout.tsx` | `includes/render.php` document open/close |
| `SiteHeader`, `MenuDrawer`, `SiteFooter`, `SideProgressNav` | `templates/parts/` |
| `ExperienceCarousel`, `GalleryPeekStrip`, `GalleryScrollRow`, `GalleryCarousel` | `templates/parts/` |
| `SunMoonIcon` and the inline JSX helpers (`OutlineButton`, `SecondaryButton`, `SectionLine`, `SectionHeading`) | prefixed PHP functions in `includes/components.php` |

**Tailwind class strings are copied character-for-character.** No re-expression,
no tidying, no consolidation. Where a class string was built conditionally in
JSX, the same condition is expressed in PHP producing the same string.

All output is escaped; the content is static, so there is no input to sanitise
beyond the plugin's own settings.

## Styles

Tailwind v4 stays, built by its CLI at build time.

- Entry: `assets/css/src/app.css` — the current `globals.css` moved verbatim,
  with a `@source` directive pointing at `templates/` and `includes/` so the
  scanner sees the PHP.
- Output: `assets/css/public.css`, **committed**, so the plugin renders from a
  plain checkout and the zip needs no Node step.
- The 796px breakpoint override, the `.site-shell` scroller, the
  `100dvh`/`overflow: hidden` body and every hand-written rule carry over
  unchanged.

Enqueued only on owned pages. On those pages the plugin also drops theme and
third-party front-end styles, matching the `bluegroup_project_blueworx` sweep,
so nothing can leak into the design.

### Fonts

`next/font/google` is replaced by self-hosted woff2 in `assets/fonts/`, declared
with `@font-face` and bound to the same `--font-display` / `--font-body` /
`--font-serif` variables. Same three families, same weights, same italics.

This is one of two places where the port is not literally identical, so it is an
explicit check in the screenshot diff rather than an assumption.

### Images

`public/images/` moves to `assets/img/`. `next/image` becomes plain `<img>` with
explicit `width`, `height` and `loading` attributes; the `fill` usages are
already `object-fit` behaviour and port directly. This is the second
non-identical change, and is covered by the same diff.

## Behaviour

One bundle, `assets/js/public.js`, built by esbuild from ES modules in
`assets/js/src/`.

- **Motion layer** — `gsap.ts`, `animations.ts` and `choreography.ts` port
  essentially verbatim (TypeScript annotations stripped). They are already plain
  imperative GSAP bound to the `.site-shell` scroller. GSAP itself, plus
  ScrollTrigger, SplitText and DrawSVGPlugin, is bundled in.
- **Interactive components** — the header, drawer, side nav and three carousels
  are rewritten as vanilla behaviours attached to the same DOM produced by the PHP templates. The
  three carousels are the substantial work: drag, snap, transition-end handling
  and the infinite loop.
- **`useGSAP` disappears**; its effect bodies become module init functions run on
  DOMContentLoaded, guarded by a check that the relevant element exists.
- The `prefers-reduced-motion` handling and the pre-paint `motion-ready` script
  that prevents hero flash both carry over as-is.

## Build

`npm run build` runs the Tailwind CLI and esbuild, then `npm run build:zip`
stages the plugin from an **explicit allowlist** and produces
`blueworx-client-cansakhara-<version>.zip`, one level up, verified with bsdtar
listing so every entry reads `blueworx-client-cansakhara/…` with forward
slashes, nested exactly one level. `Compress-Archive` is never used.

Dependencies to add to `approved-deps.json`:

- Runtime, bundled into the plugin: `gsap`.
- Build and test only: `tailwindcss`, `@tailwindcss/cli`, `esbuild`, `eslint`,
  `@playwright/test`.

`@gsap/react`, `next`, `react`, `react-dom`, `typescript`, `@domscribe/next` and
the Next.js type packages are dropped.

## Testing

**Fidelity gate.** Before the Next.js app is deleted, Playwright captures full-page
screenshots of all three routes at the mobile and desktop designed widths from
the running Next build. The plugin's output is diffed against those baselines.
The diff is the acceptance criterion — not a visual read-through.

**Functional specs** run against the Foundation's disposable local WordPress
(PHP + SQLite, no Docker) via `scripts/wp-test-env.mjs`. At minimum: the three
pages render and return 200, the menu drawer opens and closes, each carousel
advances, and the front page is the plugin's home. `workers: 1`, json reporter
retained. No `preview_url`, no `allow_zero_tests`.

**PHP**: `phpcs.xml.dist` on the WordPress standard, clean from the first PR.

## CI and releases

`.github/workflows/ci.yml` calls `ci-wordpress.yml@v1` with
`plugin_slug: blueworx-client-cansakhara`, `use_local_wordpress: true`,
`foundation_ref: v1`, `secrets: inherit`.

`.github/workflows/release.yml` calls `release-wordpress.yml@v1` with
`permissions: contents: write`. Sites update themselves from GitHub Releases via
the vendored Plugin Update Checker. Tagging is a release decision and is never
done unprompted.

`CHANGELOG.md` in Keep a Changelog format, touched by every PR.

## Out of scope

- Editable content, ACF, blocks or a page builder. Copy changes are code changes.
- Any change to the design itself.
- A contact form. The site's only actions remain `mailto:` and two outbound
  links.
- Multilingual, e-commerce, booking.

## Risks

- **The three carousels are a rewrite, not a port** — the drag, snap and
  infinite-loop logic is where the design could drift. Screenshot diffs catch
  layout drift but not interaction drift, so each carousel gets its own
  functional spec.
- **Font metrics** — self-hosted woff2 versus `next/font`. Checked explicitly in
  the diff.
- **The in-page scroller** — ScrollTrigger is bound to `.site-shell`, not the
  window, and the WordPress admin bar adds height above it for logged-in users.
  Verified logged in as well as out.
