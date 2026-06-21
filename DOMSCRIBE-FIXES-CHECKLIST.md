# DomScribe fixes — visual checklist

Branch: `domscribe-fixes` · Dev server: http://localhost:3000

Toggle the Cursor browser between a **mobile width (~390–460px, e.g. iPhone)** and
**desktop**. Most fixes are mobile-specific — check those at mobile width.

## Mobile (~390–460px)

- [ ] **Discover buttons** (Home → *Discover*): the **By day** "Explore" button has a
      solid taupe **#918074** fill; the **By night** "Explore" button is deep teal
      **#255A6B**. Hover/tap → fills white.
- [ ] **Featuring circles** (Home → *Featuring*): in every cream circle the number sits
      **dead-centre vertically** — check both the single numbers (8, 16, 7, 1) and the
      stacked ones (**6061 m²**, **1261 m²**). None should float high.
- [ ] **Experience subtitles** (Home → *Experience* carousel): swipe through all 3 slides —
      each italic subtitle is **3 centred lines with no lone-word widow**. (Lines are
      auto-balanced to keep the Figma 17px size; the exact break points may differ slightly
      from the ones suggested in the note because the longest sentence is wider than the
      fixed 340px mobile card. Verified 3 lines at 462px and ~393px; on sub-375px phones the
      longest slide can spill to 4 lines — see the note below if that matters.)
- [ ] **Footer not clipped** (any page → scroll to the very bottom): the
      **© 2026 Mel de Magranetes SL** line and **Terms / Cookies / Privacy** sit fully
      above the browser's bottom toolbar (previously hidden behind it).
- [ ] **Gallery — peeks** (By Day **and** By Night → white gallery band): always shows a
      **left peek + centre + right peek** (3 images visible), including on the first/last
      image — never a blank edge.
- [ ] **Gallery — infinite auto-rotate** (By Day **and** By Night): leave it untouched — it
      **auto-advances and loops forever** with no jump/gap; swiping also wraps seamlessly.
- [ ] **By Night white borders**: the **aerial night** image and the **pool** image each
      have a thin **white line above and below**; they stay put while scrolling.

## Desktop (regression check — should be unchanged)

- [ ] Discover buttons show the same two colours (#918074 / #255A6B).
- [ ] Featuring circles centred.
- [ ] Experience subtitles keep their original 2-line desktop layout.
- [ ] Gallery carousel still shows the 3-up row in the fixed frame and still loops.
- [ ] By Night image white borders present top & bottom (as before).

---
**Verified in-browser (Playwright, Chrome 144):**
- Discover buttons measured `rgb(145,128,116)` = #918074 and `rgb(37,90,107)` = #255A6B.
- All six Featuring numerals measured **0.0px** offset from their circle centre.
- By-night image sections both report a white border top **and** bottom.
- Mobile gallery: 9 slides rendered (3 copies → endless loop), exactly **3 visible**
  (left/centre/right) with the centre slide centred.
- Footer scroll container confirmed on `100dvh`; legal row sits 50px clear of the bottom.

**Open decision — Experience subtitle:** I kept the Figma **17px** mobile size and let the
browser auto-balance into 3 widow-free lines. If you'd rather have the *exact* break points
you listed (e.g. "Can Sakhara is a magnet for non-conformists." on its own line), that needs a
smaller mobile font (~13–14px) so the long sentences fit the 340px card — say the word and
I'll switch it.

*Note: "centre-perfect" numerals use `text-box-trim`, supported in your Chrome 144; older
browsers fall back to the existing flex-centring (no regression). This file is a review aid —
delete it before merging if you don't want it in the repo.*
