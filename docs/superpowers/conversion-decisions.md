# Decisions taken during the WordPress plugin conversion

Every judgement call made without asking, in the order made, with what it costs if wrong.
Written 2026-08-26. Plan: docs/superpowers/plans/2026-08-25-wordpress-plugin-conversion.md

Ruling: T2's pages.php stub must define a no-op cansakhara_install_pages() so activation
succeeds in T2 Step 10; T3 replaces it wholesale. — Without it T2's own verification step
fatals on an undefined function and the implementer invents a workaround. — Cost if wrong:
one throwaway stub function, deleted in T3.

Ruling: T4 derives the page slug itself inside cansakhara_document_open() via
cansakhara_page_slug( get_queried_object_id() ) and emits page-cansakhara-<slug> on the body
from the start. T12 only reads that class; it does not change the signature and does not edit
the page templates. — Removes a cross-task signature change and three template edits; the
renderer already knows the slug. — Cost if wrong: one line in render.php.

Ruling: baselines and the fidelity diff both neutralise the in-page scroller before capture
(set html/body/.site-shell to height:auto, max-height:none, overflow:visible) and then take
page.screenshot({ fullPage: true }). Applied identically in T1 and T18. — An element
screenshot of a 100dvh scroll container captures only the first screen, which would make the
acceptance gate cover roughly a tenth of each page. — Cost if wrong: scroll-driven and pinned
sections are compared in their un-scrolled state; that is still like-for-like across both
shots, and interaction drift is covered by the functional specs in T13-T17.

Ruling: T16's instruction not to share code between the carousels stands; a reviewer finding
of duplication there is plan-mandated and will be adjudicated, not fixed. — The two carousels
differ in pitch, peek and wrap behaviour, and merging them is the likeliest way to lose design
fidelity. — Cost if wrong: some duplicated logic that a later pass can extract once both are
proven identical to the baselines.

Ruling: version starts at 0.1.0 as the plan says, even though main's package.json already
reads 0.1.0. — The Foundation's bump check reads the plugin header, which does not exist on
main, so this is a new plugin rather than an unbumped one. — Cost if wrong: one version bump
to 0.1.1 when CI says so.

Ruling: both lockfiles are committed (package-lock.json regenerated for the plugin dependency
set, composer.lock new for the PHPCS toolchain). — They pin what CI installs, and leaving them
untracked would pollute every later task's diff with the same churn. — Cost if wrong: a lockfile
in the repo that someone would rather regenerate; the zip allowlist excludes both anyway.
Note: the Next.js dev server (used only for Task 1's baselines) died when Task 2 replaced
package.json. Expected and harmless — Task 18 diffs against the committed PNGs, not a live server.
Note: the WordPress harness does NOT re-run a plugin's activation hook on `down`/`up` — it reuses
the WP install. Tasks 4+ must deactivate/reactivate the plugin to pick up activation-hook changes.
Ruling: Task 3's reuse branch must re-check the CANSAKHARA_PAGE_META stamp before adopting an id
from the cansakhara_page_ids option, and must re-stamp a reused page. The finding is against the
plan's own reference code, but the spec is the binding authority and it says ownership is read
from the stamp, never inferred — an option map trusted alone can hand the plugin an unstamped page
as its front page, which is exactly the failure the stamp exists to prevent. — Cost if wrong: one
extra meta read per page per activation.
Task 3: fix round 1/5 (2 addressed, 0 open — ownership stamp now required before reusing a tracked page; commits c10eeba..9117fc3)
Task 3: complete (commits 9b62a0a..9117fc3, review clean)
Task 3: minor (deferred): the update_post_meta re-stamp added in the fix is dead code — it sits inside a branch whose guard already requires the stamp to match, so it can never write a different value. Harmless, but it reads as a fix while doing nothing. One-line deletion for the final review to triage.
Task 3: minor (deferred): if a page's stamp is deleted out-of-band, the tightened guard abandons it as an orphan holding the plugin's slug, so the replacement page gets a suffixed slug (by-day-2) until cleaned up manually. Converges in one activation cycle; no unbounded growth.
Task 3: implementer agent a3780bb343fab3fcb
Task 4: complete (commits 9117fc3..2470ab5, review clean — spec PASS, quality PASS)
Task 4: minor (deferred): cansakhara_part() does not sanitise $name against path traversal; harmless while every caller is a hardcoded internal string
Task 4: implementer agent ae622926d0dabd1e1

Ruling: phpcs.xml.dist must be restricted to PHP files only (extensions arg, plus excludes for
tests/ and assets/js/). Task 2's config scans the whole repo with no language restriction, so the
WordPress standard's JavaScript sniffs fire on tests/pages.spec.js — the reviewer confirmed 68
ERROR-level violations on a committed file, which fails shared CI, and assets/js/ will hit the
same wall in Task 12. This is a config-scope defect, not a lint backlog: I am changing WHAT PHPCS
looks at, and fixing zero actual violations. Folded into Task 5's dispatch as the next task to
touch the repo. — Cost if wrong: PHPCS covers less than someone intended, visible in one config file.

Ruling: Task 5 sources the webfonts from .next/dev/static/media/ (48 woff2 files cached by
next/font) rather than downloading them from Google Fonts, and generates its @font-face blocks
from the three per-family CSS files in .next/dev/static/chunks/, preserving font-family,
font-style, font-weight, font-display and unicode-range exactly and rewriting only the src URL.
— These are the exact files the Task 1 baselines were rendered with, so this removes the largest
single fidelity risk in the project (font metrics differing from the reference) and needs no
network. The spec named font metrics as one of only two deliberate non-identical changes; this
ruling makes it identical instead. — Cost if wrong: a larger fonts directory than a latin-only
subset would give; browsers still fetch only the ranges they need.
Task 5: complete (commits 2470ab5..d0a4312, review clean — spec PASS, quality PASS)
Task 5: note — reviewer verified programmatically: app.css is byte-identical to nextjs-final:globals.css apart from the @source and font additions; all 63 @font-face blocks map back to the cached Next.js CSS with 0 mismatches; all 24 woff2 are byte-identical copies, none orphaned. Font fidelity is now exact rather than approximate.
Task 5: note — build-assets.mjs shell:true is OS-gated to win32, so Linux CI behaviour is unchanged.
Task 5: note — assets/js/public.js is enqueued but does not exist until Task 12, so it 404s on owned pages until then. Expected.
Task 5: implementer agent a7c3da9e067ff08ec

Ruling: the asset sweep stays styles-only; it will not dequeue foreign scripts. The reviewer is
right that a theme or plugin script can still execute on an owned page, but the guarantee this
project makes is about the rendered design, and the spec and the bluegroup_project_blueworx
precedent both sweep styles alone. A blanket script dequeue would trade a small risk for a worse
one — it breaks the admin bar for logged-in editors, and kills consent banners, analytics and
anything else the client deliberately installs. — Cost if wrong: a third-party script could inject
visible markup on a page; it would be immediately visible and the sweep can be extended then.

Ruling: cansakhara_secondary_button's hover colour becomes a REQUIRED third positional parameter,
signature ( $label, $href, $hover_class, $class = '', $anim = '' ). The by-day and by-night copies
of SecondaryButton genuinely differ only in that hover token, so the parameter is right — but
defaulting it to by-day's value means a forgotten argument on by-night renders the wrong colour
with nothing to catch it: Task 18's screenshot diff does not capture hover states, and no
functional spec asserts one. Required-and-loud beats defaulted-and-silent. — Cost if wrong: a
parameter reshuffle in one function whose only callers are Tasks 7-11, all of which I dispatch.
Task 6: fix round 1/5 (1 addressed, 0 open — secondary button hover colour now a required 3rd parameter; commits 431dead..db0fbba)
Task 6: complete (commits d0a4312..db0fbba, review clean)
Task 6: note — helper signatures Tasks 7-11 must use:
  cansakhara_outline_button( $label, $href, $class = '', $anim = '' )
  cansakhara_secondary_button( $label, $href, $hover_class, $class = '', $anim = '' )   <-- hover_class REQUIRED, 3rd
  cansakhara_section_line( $class = '' )
  cansakhara_section_heading( array $args )  keys: eyebrow, title, subtitle, class
  cansakhara_sun_icon( $class = '' ) / cansakhara_moon_icon( $class = '' )
  by-day hover value: hover:text-[#ac9a8c]   by-night hover value: hover:text-[#031927]
Task 6: note — section_heading echoes title/subtitle unescaped by design (static plugin-authored content, matches the JSX ReactNode trust model); eyebrow is escaped. phpcs:ignore scoped to the two echo lines.
Task 6: implementer agent ab4745dafca16fa0d
Task 7: complete (commits db0fbba..3381fbe, review clean — spec PASS, quality PASS)
Task 7: note — reviewer independently re-derived every class string incl. the deliberate double space in the solid nav branch; all six behaviour hooks present and correctly spelled for Task 13
Task 7: minor (deferred): closed drawer carries aria-hidden="true" over links with tabindex="-1" — normally an anti-pattern, but a faithful reproduction of the JSX's own design
Task 7: implementer agent a4cdfd36be8787b1c
Task 8: complete (commits 3381fbe..45243fc, review clean — spec PASS, quality PASS)
Task 8: note — the next/image `fill` port was assessed as faithful: `fill` emits only absolute/inset-0/100% and injects no object-fit, none of the three footer images specified one, so `absolute inset-0 h-full w-full` reproduces the same default. 28 images moved to assets/img/; the 5 stock Next.js SVGs remain under public/ for Task 19.
Task 8: note — a third footer logo (can-ergah.svg -> canergah.com) exists in the JSX that the plan's prose omitted; ported correctly, source markup is authoritative over the plan's summary.
Task 8: minor (deferred): an unnecessary phpcs:ignore on the $class line in one part, with an inaccurate justification; the cited sniff never fires there
Task 8: implementer agent af875f51c74bb6c95

Ruling: the plan's Task 15 and 16 tests are wrong and will be rewritten in those dispatches. They
click [data-cansakhara-next], but no carousel in the source has a next or prev control — the
Experience carousel advances by pointer drag and keyboard (onPointerDown/Move/Up/Cancel plus
onKeyDown, role="group", aria-label "Experience N of M"), and the galleries by drag and scroll.
Task 9 was right not to invent a button. Tasks 15-17 will assert drag and keyboard advance and
observe the index via a data attribute on the root instead. — Inventing a control would have added
UI the design does not have, which is a worse failure than a wrong test. — Cost if wrong: the
carousel specs test the real interaction rather than a synthetic one.

Ruling: GalleryCarousel is a responsive SWITCHER, not a pass-through: it duplicates the 3 designed
images to 6 and renders exactly ONE child — the pinned scroll row on desktop when motion is
allowed, the peek strip otherwise (mobile, and the reduced-motion desktop fallback). Its SSR value
is false, so first paint is always the peek strip. Port: Tasks 10/11 render BOTH parts with the
scroll row initially hidden, and the Task 16/17 behaviour removes the unused one on load. That
reproduces both "exactly one child's effects run" and the peek-strip first paint. The 3->6
duplication happens at the call site, as the wrapper did it. — Cost if wrong: briefly both sets of
markup exist in the DOM before the JS prunes one.

Ruling (consequence for Task 18): the Task 1 baselines were captured with reducedMotion:'reduce',
so useScrollRow was false and the baselines show the PEEK STRIP at BOTH mobile and desktop widths.
Task 18 must expect that, and must not treat a missing desktop scroll row as drift. — Cost if
wrong: the fidelity diff chases a difference that is an artefact of the capture setting.

Ruling: gallery-scroll-row's $args gains an 'alt' array beyond the plan's images-only signature.
The source needs per-slide alt text and dropping it would ship inaccessible images. — Cost if
wrong: one extra documented array key.
Task 9: complete (commits 45243fc..142dba6, review clean — spec PASS, quality PASS, zero findings)
Task 9: note — reviewer byte-compared the Experience copy by codepoint: apostrophes and em dashes intact. Clone order [2,0,1,2,0,1] matches source; peek strip triples and starts index=n; scroll row correctly emits no inline style.
Task 9: implementer agent a33c615e7858ad246
Task 10: complete (commits 142dba6..5e5ab54, review clean — spec PASS, quality PASS)
Task 10: note — reviewer verified 5 top-level sections match the source, every choreography selector survives, and all prose byte-matches including the U+00A0 in the lockup (ported as &nbsp;)
Task 10: minor (deferred): hero-wordmark.svg is loading="lazy" above the fold — faithful to the source, which never marks it priority. Real LCP risk, worth Luke's sign-off rather than a silent change.
Task 10: CARRY INTO TASK 13 — the JSX had SiteHeader INSIDE hero-section; the PHP calls the header part before <main>. The header is position:fixed, so this is invisible normally, BUT a transformed ancestor captures fixed positioning, and the choreography uses data-hero-scale on the hero. If the hero is ever scaled, the JSX header would scale with it and the ported one would not. The Task 1 baselines were captured under reduced motion, so no transform ran and the screenshot diff CANNOT catch this. Task 13 must verify it explicitly with motion enabled.
Task 10: implementer agent a5cad70479490731d
Task 11: complete (commits 5e5ab54..09dfc5a, review clean — spec PASS, quality PASS)
Task 11: note — hover colours verified per page against each page's own JSX (day #ac9a8c, night #031927), not swapped, not defaulted. 6 top-level sections per page match source. All buildDayNight* motion selectors present. by-night's U+2019 hex-verified in both source and port.
Task 11: note — gallery hooks for Task 17: data-cansakhara-gallery-peek (visible) and data-cansakhara-gallery-scroll-row (hidden via Tailwind `hidden`, removable with classList.remove). 3->6 duplication via array_merge, same order as the JSX spread.
Task 11: implementer agent a032a4882e13fbd6a

Ruling: the page meta descriptions are being lost and Task 19 will carry them. The Next.js
layout.tsx had title "Can Sakhara | An Iconic Ibiza Home" and a site description, and each page had
its own descriptive copy; nothing in the port writes a description, excerpt or SEO value anywhere,
and no remaining task would pick it up. Not rendering a hardcoded <meta name="description"> is the
right structural call — it would fight a real SEO plugin, and the spec wants SEO plugins to behave
normally — but the COPY still has to survive. Task 19 adds the per-page description to the page
registry as post_excerpt so it reaches the database on activation, and records the site title and
description in the README as a setup step. — Cost if wrong: three strings stored that a site owner
may overwrite in their SEO plugin anyway.
Task 12: complete (commits 09dfc5a..521d10c, review clean — spec PASS, quality PASS)
Task 12: note — reviewer line-diffed all three motion modules against their .ts sources: every changed line is type syntax only, zero logic/ordering/default/guard changes. Bundle 132,463 bytes with ScrollTrigger, SplitText and DrawSVG all verified present. Every ScrollTrigger still bound to .site-shell.
Task 12: RESOLVED — the fixed-header concern carried from Task 10 is closed. Neither version ever transforms .hero-section or .site-shell, only descendants, so the header's containing block was never at risk. The DOM relocation is real but behaviourally inert.
Task 12: note — dropping the `cancelled` guard verified safe: no client-side routing, so nothing can resolve document.fonts.ready against a torn-down page.
Task 12: minor (deferred): indentation is 2-space in the three ported modules and tabs in the two new ones, inherited from the plan's own code blocks; no eslint indent rule configured
Task 12: note — the PHP dev-server harness (php -S, single-threaded) crashed intermittently under request bursts during verification, on tests with no JS involvement. Pre-existing infra flakiness; watch for it in CI at Task 19.
Task 12: implementer agent a9ad375b42dbc73a8
Task 13: review — spec PASS, quality PASS with 1 Important (drawer open idempotency: overflow value
clobbered and a leaked Escape listener when the trigger is re-activated while open) plus a fragility.
Ruling: add an explicit `@source "../../js/src";` to app.css. The runtime-toggled classes
(translate-x-0, opacity-100, -translate-y-full) exist in the built CSS today ONLY because Tailwind's
automatic content detection reaches assets/js/src — the reviewer proved it by disabling auto-detect
and watching them vanish. Tasks 14-17 all add more runtime class toggling, so leaving this to luck
means a future config change silently empties those rules with no error and no failing test. — Cost
if wrong: one redundant source directive.
Task 13: implementer agent af642bfca804d6a45
Task 13: fix round 1/5 (2 addressed, 0 open — drawer state guard via isOpen() reading aria-hidden; explicit @source for assets/js/src proven by rebuilding with auto-detection off; commits 37fbe19..c4d66d8)
Task 13: complete (commits 521d10c..c4d66d8, review clean)
Task 13: note — the @source "../../js/src" line now guarantees runtime-toggled Tailwind classes for Tasks 14-17. Reviewer independently reproduced the proof: remove that line with auto-detect off and translate-x-0 / opacity-100 / -translate-y-full all vanish from public.css.
Task 13: note — stray .invisible utility traced to the word "invisible" inside a bundled GSAP warning string, not a class-scanning problem
CARRY INTO TASK 19: the Next.js src/ tree is still on disk, and Tailwind's automatic content
detection can read it. Classes could be reaching public.css from the OLD JSX rather than from the
shipped plugin source — which would silently empty those rules the moment Task 19 deletes src/.
Task 14's implementer proved its own classes survive with src/ hidden; Task 19 must rebuild AFTER
the deletion and diff public.css to confirm nothing else was depending on it.
Task 14: review — spec PASS, quality PASS with 2 Important. Investigated the 6 classes that vanish
when src/ is removed: size-33, size-52 and invert are FALSE POSITIVES from code comments in the old
JSX (dead rules, correctly disappear). cursor-grabbing and select-none are the Experience carousel's
drag state — Task 15 must write them as literals in assets/js/src. antialiased is a REAL DEFECT.
Ruling: `antialiased` was on <html> in the original layout.tsx and the plugin never ported it. It
currently exists in public.css only because Tailwind reads the old src/ tree, and nothing in the
plugin applies it — so text renders with different font smoothing than the Task 1 baselines, on
every page. Fixing it now rather than discovering it as diff noise at Task 18. Folded into Task 14's
fix round because that agent is live; it is a one-line change to render.php. — Cost if wrong: one
class on the html element.
Ruling: the side-nav test is strengthened to assert the active dot INDEX CHANGES between two scroll
positions. The plan's test only asserts exactly one dot is active, which a hard-coded "dot 0 always
active" implementation would pass — the reviewer is right that it proves almost nothing. — Cost if
wrong: a slightly longer test.
Task 14: fix round 1/5 (3 addressed, 0 open — side-nav test now asserts the active index changes and was proven to fail against a stubbed always-index-0 build; antialiased restored on <html>; report corrected; commits 31e0787..852f077)
Task 14: complete (commits c4d66d8..852f077, review clean)
Task 14: note — antialiased verified to survive with src/ hidden, so it now comes from includes/ rather than the old JSX
Task 14: minor (deferred): resize triggers a full rebuild rather than the source's recalculation-only update; harmless while the section count is fixed
Task 14: implementer agent a56d3dd0413128410
Task 15: review — spec PASS, quality PASS with 2 Important.
Task 15: note — reviewer traced a14c1dc's two fixes (extra leading clone; the settle-guarantee for the
drag-snap lockup) line by line against the port: both preserved, including that `reduced` is
deliberately absent from the settle effect's dependency array. 12ff3d8 confirmed to touch only
GalleryScrollRow, so nothing applied from it. All verbatim constants verified: DURATION_MS=650,
easing, 1ms reduced-motion substitution, propertyName!=='transform' guard, width/4 drag threshold,
full setPointerCapture handling.
Task 15: useGSAP INVENTORY across the original components — only four exist:
  MotionRoot       -> ported in Task 12
  SiteHeader       -> ported in Task 13 (drawSelf)
  ExperienceCarousel -> ORPHAN, no remaining task covers it. Fixing in Task 15 fix round 1.
  GalleryScrollRow -> TASK 17 MUST PORT ITS OWN useGSAP BLOCK. Do not let this one become an orphan too.
Ruling: the Experience entrance animation is restored inside experience-carousel.js, not
choreography.js. choreography.js is a scoped port of MotionRoot's site-wide orchestration, and the
precedent is already set — header.js carries SiteHeader's own local drawSelf hook. The Task 1
baselines were captured under reduced motion, so Task 18's diff cannot catch this; it would ship
silently missing. — Cost if wrong: the animation lives beside the component it shipped with rather
than in the shared choreography file.
Task 15: fix round 1/5 (2 addressed, 0 open — wrap test now asserts change AND return-to-start, proven red against a stubbed never-advancing step(); Experience entrance reveal restored in experience-carousel.js; commits f9f1393..8cd6f93)
Task 15: complete (commits 852f077..8cd6f93, review clean)
Task 15: note — the source's useGSAP had no dependency array, so it ran once on mount and never re-ran on index change; the port matches that. No mm.revert() needed since init runs once per page load, same precedent as header.js.
Task 15: implementer agent a84defb3cbcf0c59b
Task 16: complete (commits 8cd6f93..80172f4, review clean — spec PASS, quality PASS, zero findings)
Task 16: note — the peek strip's constants genuinely differ from the Experience carousel's and were NOT copied across: drag threshold width/2 vs width/4, and the peek strip has AUTOPLAY (AUTOPLAY_MS) which the Experience carousel does not. Source confirmed to have no settle-guarantee and no useGSAP block.
Task 16: note — wrap math ((index % n) + n) % n + n matches source exactly against the tripled markup starting at index n.
Task 16: implementer agent a945753cfb3eea5e0

Ruling: both residual differences are accepted, neither is a plugin defect. (1) The badge and cyan
icon appear ONLY in the baselines — next.config.ts wrapped itself in withDomscribe() when
NODE_ENV === 'development' and Task 1 captured from `next dev`, so the baselines carry the Next.js
dev indicator plus the Domscribe dev overlay. The plugin has no dev tooling and is correct not to
render them. (2) Scattered single-pixel noise on photographs is recompression/antialiasing. — Cost
if wrong: a genuine sub-1% localised regression could hide under a whole-page ratio gate; that limit
is inherent to the plan's chosen method, not to this implementation.
Task 18: review — spec PASS, quality TRUSTWORTHY with 1 Important (platform-suffixed snapshots would
fail on a Linux CI runner; fixing via snapshotPathTemplate also removes a 14MB duplicate reference
that could drift). Fix round 1 dispatched.
Task 18: implementer agent adcb6fcdbda4e9abb
Task 18: fix round 1/5 (1 addressed, 0 open — snapshotPathTemplate now '{testDir}/baselines/{arg}{ext}', platform-agnostic; 14MB duplicate removed; --update-snapshots warnings added; commits 3cefd26..42d5300)
Task 18: complete (commits ef1dbd3..42d5300, review clean). Six numbers unchanged after the path change; baselines re-checksummed byte-identical to Task 1's commit 7473d2b.

Ruling (CORRECTION of an earlier ruling of mine): my "PHPCS CRLF error is a genuine PR blocker" was
WRONG on both halves. The committed blob has ZERO CR bytes — the CRLF existed only in my Windows
working copy via core.autocrlf. And the Foundation's PHPCS step is skipped entirely for this repo:
its guard is `ls phpcs.xml phpcs.xml.dist .phpcs.xml`, which exits 2 when any listed file is absent,
and this repo has only phpcs.xml.dist. I verified both directly. Fixed the local churn with
.gitattributes; the inert PHPCS gate is a Foundation bug, not this branch's, and is for Luke to raise.

Ruling: three residuals are PARKED, not fixed — the process allows one fix wave and it is spent.
All three go to Luke rather than dying here.
 1. title-tag withdrawal edge: a third party registering title-tag support after priority 99 but
    before wp_loaded (an SEO plugin on `init`) would have it withdrawn on non-owned pages, dropping
    titles site-wide. Narrow, but a path that did not exist before the fix. The reviewer named a
    side-effect-free alternative — the plugin renders its own document, so it could print its own
    <title> on owned pages and never touch global theme support. That is the better design and is
    what I would do next. — Cost if wrong: an SEO plugin loses titles on the host site's other pages.
 2. playwright.config.js's comment claims `updateSnapshots: 'none'` makes a stray `-u` fail. It does
    not — the CLI flag wins in Playwright 1.62. The setting is harmless but the comment is actively
    misleading about an irreplaceable asset. Real protection is that the baselines are committed, so
    `git checkout tests/baselines` recovers them. — Cost if wrong: someone trusts the comment, runs
    -u on a failure, and overwrites the reference; recoverable from git, but only if noticed.
 3. chrome.spec.js "header hides on scroll down" flakes ~1 in 3 because .site-shell has
    scroll-behavior: smooth and back-to-back scrollTop writes coalesce. No retries are configured, so
    it would red roughly a third of PRs on a required check. Test defect, not product defect; the fix
    is one line (settle the scroll, or retries on CI). — Cost if wrong: a flaky required check trains
    people to re-run rather than read, which is how real failures get waved through.

## Still open — for Luke

All three go to Luke rather than dying here.
 1. title-tag withdrawal edge: a third party registering title-tag support after priority 99 but
    before wp_loaded (an SEO plugin on `init`) would have it withdrawn on non-owned pages, dropping
    titles site-wide. Narrow, but a path that did not exist before the fix. The reviewer named a
    side-effect-free alternative — the plugin renders its own document, so it could print its own
    <title> on owned pages and never touch global theme support. That is the better design and is
