=== Can Sakhara ===
Contributors: blueworx
Tags: marketing, landing page, villa, real estate, ibiza
Requires at least: 6.4
Tested up to: 7.0
Requires PHP: 8.1
Stable tag: 0.2.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

The Can Sakhara marketing site, as a self-contained WordPress plugin.

== Description ==

Can Sakhara is a private, art-filled villa overlooking Ibiza and Formentera.
This plugin ships its marketing site — Home, By Day and By Night — pixel-for-
pixel matched against the original Figma designs.

On activation the plugin creates its three pages and sets the site's home
page to Home. It renders those pages itself, end to end, independent of the
active theme, so the design is exact regardless of what else is installed.

== Installation ==

1. Upload the plugin to `wp-content/plugins/` and activate it, or install the
   zip through **Plugins → Add New → Upload Plugin**.
2. Activation creates the Home, By Day and By Night pages automatically and
   sets Home as the site's front page.
3. Set the site title under **Settings → General** (and, if you use one, your
   SEO plugin's site description) to match the original site's branding.

== Frequently Asked Questions ==

= Can I edit the page content? =

No. These pages are rendered directly by the plugin so the design matches
the Figma source exactly; the usual WordPress block editor content on them is
not used.

= What happens to the pages if I deactivate the plugin? =

They are left in place. Deactivating only stops the plugin rendering them;
nothing is deleted. Uninstalling removes only the plugin's own settings, not
the pages themselves.

== Changelog ==

= 0.2.0 =
* A Welcome page (`/welcome/`): the red splash with the Can Sakhara mark and
  two buttons, Login and Enquire.
* A Login popup, available from the Welcome page and the menu on every page.
  Guests sign in with the WordPress account they have been given and land on
  a page you choose. Wrong details show one short message and never say
  whether the address exists.
* An Enquire popup, opened from the Welcome page and the header's Enquire
  button (which no longer opens an email). It shows the SureForms form you
  choose, restyled to the site; until one is chosen it shows an email link.
* Settings → Can Sakhara: where guests go after signing in, and which
  enquiry form to show. Built from the shared admin design system, which
  the plugin now ships.
* Sites already running the plugin get the Welcome page on their next
  update without reactivating.

= 0.1.0 =
* First release: the Can Sakhara marketing site (Home, By Day, By Night) as a
  WordPress plugin, ported from the original Next.js build to match its
  Figma designs pixel-for-pixel.
