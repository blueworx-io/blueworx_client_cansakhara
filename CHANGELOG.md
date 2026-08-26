# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
