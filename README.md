# Can Sakhara

A self-contained WordPress plugin that renders the Can Sakhara marketing site
(Home, By Day, By Night). It was ported from a Next.js build pixel-for-pixel
against Figma designs; the plugin owns rendering for its three pages end to
end, independent of the active theme.

## Site title and description

On activation the plugin creates its three pages and sets each one's excerpt
to its original marketing copy, so any SEO plugin can pick it up:

| Page | Excerpt |
|---|---|
| Home | Discover Can Sakhara, a private art-filled villa overlooking Ibiza and Formentera. |
| By Day | Sun-drenched serenity at Can Sakhara — a myriad of spaces, both inside and out, inviting each guest to shape the day as they choose. |
| By Night | As the sun sets over the island, Can Sakhara comes alive in the glow of the afterhours — a warm and cinematic retreat for nights to remember. |

The plugin does not render a hardcoded `<meta name="description">` — that
would fight a real SEO plugin. Set the site title itself (Settings → General,
or via your SEO plugin) to something like **"Can Sakhara | An Iconic Ibiza
Home"**, matching the original site.

## Building

```bash
npm install
npm run build      # compiles Tailwind CSS and bundles the JS into assets/
npm run lint        # ESLint over assets/js/src
npm run build:zip   # stages an allowlisted copy and zips it one level up
```

`npm run build` writes committed output (`assets/css/public.css`,
`assets/js/public.js`), so a plain checkout of the plugin needs no Node step
at runtime — Node is only needed to build or package it.

## Local WordPress test harness

Tests run against a disposable local WordPress instance, not a hosted
staging site. From the [BlueWorx Foundation](../bluegroup_core_foundation)
checked out as a sibling directory:

```bash
node ../bluegroup_core_foundation/scripts/wp-test-env.mjs up --plugin . --slug blueworx-client-cansakhara
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test --workers=1
```

Tear down with `... wp-test-env.mjs down`. See the Foundation's
`docs/wordpress-test-harness.md` for details (credentials, `--open` for
browsing signed in, CI wiring).

## Design fidelity (non-negotiable)

These rules governed the original Figma-to-Next.js build and still apply to
this plugin — any future change to markup or styling must honour them:

- **No fluid scaling unless the design shows it.** Do not fluidly scale
  between breakpoints. Elements keep their designed widths, spacing,
  proportions, and alignment until the next defined breakpoint.
- **No dynamic/viewport sizing where fixed values are designed.** Do not use
  percentage-based resizing, flexible stretching, or viewport-based sizing
  (`vw`/`vh`/fluid `clamp`) where Figma specifies fixed values. Use the exact
  fixed widths, paddings, and gaps from the design.
- **Breakpoint-specific layouts only.** Layout changes happen at defined
  breakpoints, not continuously.
- **Components must not scale with screen size.** Components are fixed to
  their designed sizes at each breakpoint — they do not grow, shrink, or
  stretch with the viewport between breakpoints.
- **Use exact Figma values, never approximations,** when exact values are
  available: container widths, component widths, section widths, font
  families, font sizes, font weights, line heights, letter spacing, text
  alignment, colors, button sizing, card/grid spacing, section padding,
  element alignment, icon sizing, image sizing, border radius, and shadows.
- **Match all interactive states from the design:** button hover, link
  hover, and active states.
- **Honour mobile and desktop spacing** exactly as designed at each
  breakpoint. There is no tablet design — tablet uses the **desktop**
  spacing and layout.

## Layout (non-negotiable)

- **Use flexbox and grid for layout and positioning.** Create spacing with
  `padding`, `margin`, and `gap`. Centre and align with flex/grid
  (`justify-*`/`align-*`/`margin: auto`), not with positional offsets.
- **Do not translate Figma coordinates into an absolute `top`/`left` canvas.**
  Express the design's fixed measurements as flow layout — exact fixed
  widths on elements, exact fixed gaps as `margin`/`padding`/`gap`. This
  still honours the "exact Figma values / no fluid scaling" rules above; it
  just expresses them in normal document flow so elements align by
  construction rather than by coincidental arithmetic.
- **Use `position: absolute` only when flex/grid genuinely cannot achieve
  the result** — e.g. overlaying content on a full-bleed background image.
  Prefer a grid stack or a `relative` + flow container first.

## Repository layout

```
blueworx-client-cansakhara.php   Plugin bootstrap
includes/                         Page registry, rendering, assets, components
templates/pages/                  Home, By Day, By Night full-page templates
templates/parts/                  Shared header/footer/nav/gallery parts
assets/css/src/app.css            Tailwind source (compiles to assets/css/public.css)
assets/js/src/                    JS source (bundles to assets/js/public.js)
assets/img/, assets/fonts/        Self-hosted images and web fonts
tests/                            Playwright specs, incl. the fidelity gate
```

## Fidelity gate

`tests/fidelity.spec.js` screenshots each page/viewport and compares it
against `tests/baselines/` — six PNGs captured from the original Next.js
build. **Never regenerate or overwrite those baselines**; they are the only
record of the reference build once removed from the repo.
