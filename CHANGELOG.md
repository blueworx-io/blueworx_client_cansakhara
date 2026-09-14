# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-09-14

### Added

- A Theme tab under Settings → Can Sakhara: edit every text style's size, line
  height, letter-spacing and weight (desktop and mobile) and the twelve palette
  colours, with a reset to the Figma design.

### Fixed

- Mobile type sizes, labels and section spacing now match the Figma mobile
  frames; desktop body copy is the design's light weight.
- The footer keeps its 50px bottom padding on desktop.

### Removed

- The old Next.js screenshot comparison; the Figma file is the reference.

## [0.4.0] - 2026-09-14

### Added

- The site's fonts now come from the client's Adobe Fonts kit: Neulis Sans
  for headings, the wordmark and buttons, with Source Sans 3 and Source
  Serif 4 for text. The bundled Montserrat and Source font files are gone.

### Changed

- The enquiry popup now reads "Our team will assist you with availability and
  pricing for rentals, weddings, brand events and film/photoshoots".

### Fixed

- A theme's own "Skip to the content" link no longer shows above the page.

## [0.3.2] - 2026-09-14

### Changed

- The plugin is listed as "BlueWorx Clients | Can Sakhara" on the Plugins
  screen.

## [0.3.1] - 2026-09-13

### Fixed

- The experience carousel's mobile subtitle uses Tailwind's own balanced-text
  class. Same look; it no longer trips the admin-screen check in CI.

## [0.3.0] - 2026-09-13

### Changed

- The Welcome page is now the site's front page. Home lives at `/home/`.
- Home, By Day and By Night are private: anyone not signed in is sent to
  Welcome. Guests who sign in are taken to Home unless you choose another
  page in Settings → Can Sakhara. Logging out returns to Welcome.
- Guests no longer see the WordPress toolbar on the site; editors still do.
- The Welcome page plays the looping video behind the logo.
- The Login and Enquire popups stay centred on tall screens, and their
  Mel de Magranetes mark links to mdmsl.com in a new tab.
- Sites already running the plugin are moved to the new front page on
  their next update, unless they had chosen a different one themselves.

## [0.2.0] - 2026-09-12

### Added

- A Welcome page (`/welcome/`): the red splash with the Can Sakhara mark and
  two buttons, Login and Enquire.
- A Login popup, available from the Welcome page and the menu on every page.
  Guests sign in with the WordPress account they have been given and land on
  a page you choose. Wrong details show one short message and never say
  whether the address exists.
- An Enquire popup, opened from the Welcome page and the header's Enquire
  button (which no longer opens an email). It shows the SureForms form you
  choose, restyled to the site; until one is chosen it shows an email link.
- Settings → Can Sakhara: where guests go after signing in, and which
  enquiry form to show. Built from the shared admin design system, which
  the plugin now ships.
- Sites already running the plugin get the Welcome page on their next
  update without reactivating.

## [0.1.0] - 2026-08-25

### Added

- The plugin skeleton: plugin header, activation and uninstall handling, PHP
  coding standards, and the shared CI and release workflows.
- The Can Sakhara marketing site (Home, By Day, By Night), ported from the
  original Next.js build to match its Figma designs pixel-for-pixel, with a
  fidelity gate that screenshots each page and viewport against the original
  build.
- Page excerpts (Home, By Day, By Night) carried over from the original
  site's per-page metadata, set on each page on activation for SEO plugins
  to use.
- Self-updating from GitHub Releases via the vendored Plugin Update Checker.
- The release zip build (`npm run build:zip`), staged from an explicit
  allowlist and verified after packaging.
- A filter, `cansakhara_keep_styles`, for keeping a stylesheet a site needs
  (a consent banner, a chat widget) on the plugin's pages, which otherwise
  drop every stylesheet but their own.

### Fixed

- Pages render correctly for logged-in users: the WordPress admin bar no
  longer pushes the foot of the page off screen or covers the header.
- By Day and By Night links point at the pages the plugin created, so they
  work on a site that already uses those page names and on sites without
  pretty permalinks.
- The plugin no longer switches page titles on for the whole site, which on
  some themes produced two titles on every page.
- If the page's motion never starts — a caching or optimisation plugin
  breaking it, say — the page now falls back to its plain, fully visible
  state instead of showing the hero photograph with nothing on it.
- A tagged release now ships only what the site needs: the build inputs,
  Node tooling and developer dependencies are excluded from the zip.

### Removed

- The Next.js app the plugin was ported from. The WordPress plugin is now
  the only implementation.
