# Welcome Page, Login Popup & Enquire Popup — Design Spec

**Date:** 2026-09-12
**Branch:** `welcome-login-enquire`
**Version:** 0.1.0 → 0.2.0 (minor: new features)

## Goal

Add a red "welcome" splash page and two popups — guest login and enquiry —
to the Can Sakhara plugin, matching three Figma frames. Login uses real
WordPress accounts and sends guests to a page chosen in a new settings
screen. The enquiry form is a SureForms form the site owner picks in the
same settings screen.

Source of truth — Figma file `zKsmL3KCTPUaunvBaVY1Eq`:

| Frame     | Node    | Becomes                          |
|-----------|---------|----------------------------------|
| LOGIN 01  | `1:30`  | Welcome page (`/welcome/`)       |
| LOGIN 02  | `1:67`  | Login popup                      |
| LOGIN 03  | `1:109` | Enquire popup                    |

Only desktop (1440) frames exist. Mobile follows the patterns the existing
pages already use (stacked, `px-5`, smaller type/tracking).

## Decisions taken with Luke

- Welcome is its own page, not the front page. The current home stays.
- Login and Enquire are popups, not pages. They are rendered on every owned
  page, not just Welcome: the header's Enquire button opens the Enquire
  popup (replacing the `mailto:`), and the menu drawer gains a Login entry.
- Login is a real WordPress login (`wp_signon`). Where the guest lands
  afterwards is a backend setting.
- "Request private access password" swaps the Login popup for the Enquire
  popup. No automated password email — the team sends it by hand.
- The enquiry form is SureForms; which form is a backend setting.

## Welcome page

New owned page, slug `welcome`, registered in `cansakhara_pages()` exactly
like the other three (stamped, tracked in `cansakhara_page_ids`, rendered by
`templates/pages/welcome.php`). Not set as front page.

Layout (Figma `1:30`):

- Full-viewport red background image (Figma `Rectangle 5`, exported and
  committed as `assets/img/welcome-bg.png`), no header, no footer, no side
  nav. The page does not scroll.
- Centred stack: logo mark (`55px`, existing `logo-white.svg`), wordmark
  (`379×29`, existing `hero-wordmark.svg`), then "IBIZA" — `font-display`
  regular `22px`, tracking `33px`, colour `#bf2c08`.
- Bottom row, ~`95px` from the bottom: two buttons, LOGIN (`font-display`
  light) and ENQUIRE (`font-display` thin), `18px`, tracking `8.1px`, white,
  uppercase. Each opens its popup.
- Mobile: same stack scaled down; buttons stay on one row.

The page uses `cansakhara_document_open( [ 'theme' => 'welcome' ] )` and
then renders the popups part directly (there is no header on this page to
bring them in).

## Popups

One template part, `templates/parts/popups.php`, renders both popups. The
header part includes it on every owned page; the Welcome template includes
it directly. Each popup is a full-viewport `#5b0a00` panel — hidden by
default, opened by a `data-cansakhara-popup-open="login|enquire"` trigger.

Shared behaviour (`assets/js/src/popups.js`, initialised from `main.js`):

- Open: show panel, move focus to its heading, trap Tab inside, lock page
  scroll (same `.site-shell` overflow handling the drawer uses), set
  `aria-hidden` / `aria-expanded` / `role="dialog"` correctly.
- Close: ✕ button (same white-bordered box as the drawer's), Escape, or a
  `data-cansakhara-popup-close` trigger. Focus returns to what opened it.
- A `data-cansakhara-popup-open` trigger inside a popup (the "request
  password" link) closes the current one and opens the other.
- Opening a popup closes the menu drawer if it is open.
- No GSAP: a plain opacity transition. The popups must work without the
  motion layer, so they use CSS transitions only.

Shared layout (Figma `1:67` / `1:109`):

- Heading: `font-display` thin `32px`, tracking `12.8px`, white, uppercase,
  top ~`118px`.
- Intro: `font-serif` light italic `14px`, tracking `1.4px`, white, centred,
  `443px` wide.
- Fields: `443px` wide, `#490500` background, `16px 32px` padding, centred
  placeholder text in `font-body` light `16px`, tracking `0.8px`, white.
- SUBMIT: `443px` wide, `1px` `#42071a` border, `font-display` regular
  `14px`, tracking `5.6px`, white, uppercase.
- Mel de Magranetes mark (`150×50`, existing `mel-de-magranetes.svg`)
  pinned near the bottom.
- Mobile: `443px` becomes `100%` inside `px-5`; type steps down as the
  existing pages do.

### Login popup

Heading LOGIN. Intro: "Please enter your email address, and the private
access password that was emailed to you." Fields: Email, Password. Link
below: REQUEST PRIVATE ACCESS PASSWORD (`font-display` regular `12px`,
tracking `1.2px`, underlined) — opens the Enquire popup. SUBMIT.

Submission is in the background so the popup stays open on failure:

- JS posts `email` and `password` to a REST route `cansakhara/v1/login`
  (`POST`, permission: anyone) with the standard `X-WP-Nonce` header — the
  `wp_rest` nonce printed into the page via `wp_localize_script`. The nonce
  is what stops a third-party site posting logins through the route.
- Server: `wp_signon()` with the email as the login. WordPress already
  accepts an email address in `user_login`. On success respond
  `{ redirect: <url> }`; on failure respond `403` with one generic message
  — "Those details didn't match. Please try again." — never WordPress's
  own errors, which reveal whether the email exists.
- Rate limiting is left to the host / existing login protection; the route
  is no more exposed than `wp-login.php`. Login is treated as
  security-sensitive: `security-review` runs before commit.
- Client: on success `location.assign(redirect)`; on failure show the
  message under the fields (`font-body` `12px`, white, `role="alert"`) and
  keep the typed email.
- Already-logged-in guests: the popup renders a short "You're signed in."
  line and a button to the destination page instead of the form.
- No JS: the form still `POST`s to the same page, where a request handler
  on `template_redirect` performs the same login and redirects; failure
  redirects back with `?cansakhara_login=failed`, which reopens the popup
  with the message. This keeps the popup usable if the bundle is broken by
  a caching plugin — the same failure mode the hero watchdog exists for.

Destination: the page set in settings. If none is set, `home_url( '/' )`.

### Enquire popup

Heading ENQUIRE. Intro: "Let us know a few details and our team will
personally assist you with availability, pricing, tailored recommendations
and Private Web Access Password". Body: the SureForms form chosen in
settings, rendered with `do_shortcode( '[sureforms id="N"]' )`.

- SureForms' own stylesheet handles are added to the `cansakhara_keep_styles`
  list, so its layout and error states keep working; a scoped stylesheet
  (`.cansakhara-popup .srfm-form …`) restyles fields, checkbox, label and
  submit button to the Figma values above.
- If no form is set, or SureForms is not active: the popup shows the
  heading and intro, plus — for users who can `manage_options` only — a
  one-line pointer to the settings screen. Everyone else sees the intro
  and a `mailto:reservations@cansakhara.com` link so the popup is never a
  dead end.

## Settings screen

`Settings → Can Sakhara`, `manage_options`, built with the
`blueworx-admin-design` skill (this is the plugin's first admin screen, so
the plugin starts shipping `assets/blueworx-admin-design.css`,
`assets/fonts/` and `assets/blueworx-admin-icons.js` from the design
system, enqueued only on this screen).

Two fields, stored in one option `cansakhara_settings` via the Settings API
with a sanitize callback:

| Field                         | Key             | Control                                  |
|-------------------------------|-----------------|------------------------------------------|
| After login, send guests to   | `login_redirect`| Page dropdown (`wp_dropdown_pages`), 0 = home |
| Enquiry form                  | `enquiry_form`  | Dropdown of published `sureforms_form` posts; disabled with a note if SureForms is inactive |

## Navigation changes

- Header Enquire button: the `mailto:` link becomes a `<button>` with
  `data-cansakhara-popup-open="enquire"`. Visual unchanged.
- Menu drawer: new last entry "Login" (`data-cansakhara-popup-open="login"`).
  Shown as "Log out" (`wp_logout_url`) when the visitor is logged in.
- `cansakhara_secondary_button( 'Enquire', 'mailto:…' )` calls on By Day /
  By Night stay as they are — they are in-page CTAs, not the header.

## Assets to commit

- `assets/img/welcome-bg.png` — from Figma (download the exported PNG;
  never redraw).
- Everything else reuses existing SVGs.
- Design-system files listed above.

## Testing (Playwright, local harness)

New `tests/welcome.spec.js`, `tests/popups.spec.js`, `tests/login.spec.js`,
`tests/settings.spec.js`:

- Welcome page renders the mark, wordmark, IBIZA, and both buttons.
- LOGIN / ENQUIRE open their popups; ✕ and Escape close; focus returns to
  the trigger; "request password" swaps to Enquire.
- Header Enquire button opens the Enquire popup on Home.
- Login: wrong password → message shown, popup stays open, URL unchanged.
  Right password (the harness `admin` user) → lands on the page chosen in
  settings (the test sets it to By Day via the settings screen first), and
  on `/` when unset.
- Logged-in visitor sees the signed-in state, not the form.
- Settings screen saves both fields and reflects them after reload.
- Enquire popup: with SureForms installed in the harness and a form
  created by the test, the form renders inside the popup; without a form
  set, the fallback mailto renders.

Fidelity baselines are not extended — the existing gate covers the ported
pages only.

## Out of scope

- Password reset emails, account creation, and gating existing pages
  behind login.
- Any change to the Home / By Day / By Night content.
- The Figma header component (Nunito Sans, "Reserve now", phone icon) —
  that is the design-kit header, not this site's.

## Recipe Book

The Recipe Book lists both Login and Contact form as unwritten. Once this
ships and Luke is happy, the login popup (REST + no-JS fallback + generic
error) and the "SureForms inside a plugin-owned page" pattern are proposed
as those two recipes.
