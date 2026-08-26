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

### Removed

- The Next.js app the plugin was ported from. The WordPress plugin is now
  the only implementation.
