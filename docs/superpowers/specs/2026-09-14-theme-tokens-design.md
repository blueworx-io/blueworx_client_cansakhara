# Theme tokens and Theme tab — design

Date: 2026-09-14. Ships as 0.5.0.

## Goal

The client signs off on spacing, kerning, font sizes and colours against the
Figma file (zKsmL3KCTPUaunvBaVY1Eq). Luke needs to change those values without
a code change. Today every value is a hardcoded Tailwind utility spread across
the templates, and the desktop/mobile values drift from Figma.

This work:

1. Puts every typography role and palette colour behind a named token.
2. Adds a **Theme** tab to the plugin's settings screen to edit the tokens.
3. Sets the token defaults to the Figma values, which fixes review findings
   4 (desktop body weight), 8 (mobile body size) and 9 (mobile label sizes).
4. Fixes the footer bottom padding and the mobile section spacing (finding 14).
5. Retires the Next.js screenshot gate (tests/fidelity.spec.js + baselines).

Out of scope: the dismissed review findings, hover states, the animation
frame, editing spacing from the Theme tab.

## Tokens

### Typography roles

Seven roles, each with size, line height, letter-spacing and weight, for
desktop (≥796px) and mobile (<796px). Family is fixed per role.

| Role   | Family                 | Used for                                   | Desktop (size / lh / ls / weight) | Mobile           |
| ------ | ---------------------- | ------------------------------------------ | --------------------------------- | ---------------- |
| H1     | neulis-sans            | Page intro lockup ("INTRODUCING / CAN SAKHARA"), By Day / By Night page titles | 48 / 1 / 9.6 / 300 | 30 / 1 / 6 / 300 |
| H2     | neulis-sans            | Section titles ("AN ISLAND ORIGINAL", "SUN-DRENCHED SERENITY", card titles) | 48 / 1 / 9.6 / 300 | 24 / 1 / 4.8 / 300 |
| H3     | neulis-sans            | Eyebrows (WELCOME, EXPERIENCE, DISCOVER, FEATURING) | 21 / 1 / 4.2 / 400 | 12 / 1 / 2.4 / 400 |
| H4     | source-serif-4-variable, italic | Section subtitles                | 28 / 1.8 / 2.8 / 300 | 13 / 1.8 / 1.3 / 300 |
| Body   | source-sans-3          | Paragraph copy                             | 16 / 1.6 / 0.8 / 300 | 11 / 1.6 / 0.55 / 300 |
| Small  | source-sans-3          | Stat labels, captions                      | 15 / 1 / 1.5 / 300 | 10 / 1 / 1 / 300 |
| Label  | neulis-sans            | Buttons, footer text, header MENU, popup links | 14 / 1.4 / 5.6 / 400 | 10 / 1.4 / 4 / 400 |

The menu drawer links are 16px in Figma (desktop menus 5:1090 / 5:1376 /
5:1533) and fit no role; they keep fixed utilities (finding 7 was dismissed).

The first line of a two-line H1/H2 lockup ("INTRODUCING", "SUN-DRENCHED",
"GLORIOUS") uses the kit's hairline family `neulis-sans-hairline` (weight
100). That is a fixed modifier class, not a token.

Known Figma inconsistencies, resolved as: the mobile intro subtitle is 15px in
Figma where the section subtitles are 13px — H4 mobile defaults to 13 and the
intro follows it. The mobile footer text is 8px where Label is 10 — the
footer keeps an 8px override on mobile. Both are noted in the Theme tab help
text so nobody hunts for a bug.

### Colours

Twelve named swatches, straight from the mini style guide:

- Home: `#ffffff`, `#42081a`, `#422833`, `#f2ebe2`, `#5b0a00`, `#bf2c08`
- By Day: `#ac9a8c`, `#918074`, `#5f5146`
- By Night: `#031927`, `#000e16`, `#33545a`

Templates reference swatches by name, never by hex.

## Storage and output

- One option, `cansakhara_theme`, holding only values that differ from the
  defaults. Defaults live in one PHP array (`includes/theme.php`) — the single
  source for the Theme tab, the sanitiser and the front-end output.
- On owned pages the plugin prints the tokens as CSS custom properties on
  `:root` via `wp_add_inline_style( 'cansakhara-public', … )`: desktop values
  unguarded, mobile values inside `@media (max-width: 795px)`. Names:
  `--cs-h1-size`, `--cs-h1-lh`, `--cs-h1-ls`, `--cs-h1-weight` … and
  `--cs-color-home-1` … `--cs-color-night-3`.
- `assets/css/src/app.css` defines one class per role (`.cs-h1` … `.cs-label`)
  reading those variables, plus `.cs-hairline`. Tailwind's `@theme` maps the
  swatches so `bg-home-2`/`text-home-2` style utilities exist for templates.
- Templates swap every hardcoded `text-[…px]`, `tracking-[…]`, `leading-[…]`,
  `font-light` and hex colour for the role class / swatch utility. A value that
  fits no role (e.g. the footer's 8px mobile text) keeps a fixed utility with a
  comment naming the Figma node.

Sanitising: sizes 6–120px, line height 0.8–3, letter-spacing −5–20px, weight
one of 100–700 in hundreds, colours a 6-digit hex. Anything invalid falls back
to the default for that token.

## Theme tab

Settings → Can Sakhara gains tabs: **General** (today's fields) and **Theme**.
Built with the blueworx-admin-design skill only.

Theme tab layout:

1. **Typography** — two cards, Desktop and Mobile, each a table: rows are the
   seven roles, columns Size (px), Line height, Letter-spacing (px), Weight
   (select). Family shown read-only per row.
2. **Colours** — three cards (Home, By Day, By Night), each swatch a colour
   input paired with a hex text field, labelled with its name and where it is
   used.
3. **Reset to design defaults** — a secondary button that clears the option,
   with a confirm.

Save uses the Settings API with its own option group; success/error notices
from the design system.

## Review fixes folded in

- Footer: remove the desktop `height: 858px` / `padding-top: 164px` override
  (app.css ~line 848) and the orphaned `.footer-brands` / `.footer-bottom`
  rules; the template's `pt-144 / gap-80 / pb-50` already match Figma 5:994.
- Mobile spacing: audit every section of Mobile - Home (5:386), Mobile - BY
  DAY (5:583) and Mobile - BY NIGHT (5:717) against `get_design_context`, and
  set paddings, gaps and hero/media heights to the Figma values so a full-page
  capture at 402px matches the frame height (4554 / 3308 / 3332).

## Testing

Playwright, in the local harness:

- Theme tab renders from the design system (existing admin-UI check applies).
- Saving a Body desktop size of 18 makes `--cs-body-size` resolve to 18px on
  /home/ at 1440; Reset restores 16px.
- Saving an invalid colour keeps the default.
- Front-end defaults: at 1440 body copy is 16px/300; at 402 body copy is 11px
  and the intro eyebrow 12px.
- Footer: copyright row bottom is 50px above the footer bottom at 1440.
- Mobile page heights at 402 equal the Figma frame heights ±8px.
- Delete tests/fidelity.spec.js and tests/baselines/; drop the snapshot
  settings from playwright.config.js.

## Version

0.5.0; changelog and readme updated in the same PR.
