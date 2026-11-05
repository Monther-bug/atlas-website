# v2 hero: direction B "The Luff", with the WebGL depth layer (production)

- **Date:** 5 November 2026
- **Branch:** `task/H.1`. `feat/site-build` is merged twice, the last time with the first-visit loader, About, Services, Why Atlas and Find-your-crane.
- **Chosen by the user:**
  - B "The Luff";
  - the Lusion-style WebGL layer on desktop;
  - B's field stays black.
- **Design history:** `docs/reviews/hero-concepts.md`.
- **Evidence:** `docs/reviews/v2-hero/`, real Chrome, final fonts (Tajawal / Poppins):
  - stills `{ar,en}-{1440x900,1366x657,1440x790,390x844,390x664,768x1024}.jpg`;
  - reduced motion `*-reduced.jpg`;
  - intro `intro-ar-0000…2000.jpg`;
  - scroll and dock `scroll-ar-1/2/3.jpg`;
  - WebGL `webgl-{ar,en}-swing/parallax.jpg`;
  - loader hand-off `handoff-ar-0900…3600.jpg`;
  - measurements `metrics.json`, `motion.json`.

## What shipped

| Piece | Files |
|---|---|
| Hero | `src/sections/Hero.tsx`, `src/sections/hero.css` |
| Intro, hoist and dock | `src/motion/hero.ts`. `heroDock` is unchanged; core.ts still wraps the intro in `afterLoader` |
| Live hook | `src/motion/hero-live.ts` (core chunk) |
| WebGL layer | `src/motion/hero-gl.ts` (its own lazy chunk) |
| Header over the hero | `src/sections/Header.tsx` |
| Crop choice by shape | `src/components/Picture.tsx` (`mobileMedia`) |
| Curtain edge | the loader CSS variables in `index.html` and `en/index.html` |
| Crops | `assets-src/crops.json` + regenerated 9:16 images |

**Layout:**
- The real photo fills the first viewport under the header, bottom-anchored. Chrome treats a full-viewport image as background, so the **H1 is the LCP element**.
- **The cut:** a black field with a brand-navy plane along its edge is cut on one rake.
  - It passes just under the WhatsApp load, which hangs on two red legs from the real hook.
  - It falls toward the hook side, so the raked edge depends on where each crop puts the hook.
  - Slope `k`: 0.36 in Arabic landscape, 0.5 in English landscape, 0.12 in portrait (0.04 where the cut is on the text's end side: English phones).
- **The headline:**
  - It sits on the field, and in landscape its lines step along the cut.
  - Two main lines: «لكل مشروع / رافعته المناسبة».
  - The lead is the first clause, in white, at 0.5 F.
- **No JS needed:** the hook, the legs, the cut, the stairs and the foot are CSS `calc()` in container units, so they render in the prerender.
- **The crop is chosen by shape, not width:** portrait gets 9:16, landscape gets 16:9. Upright tablets keep the hook on screen.
- **Reading order:** H1 → WhatsApp → services → Browse.

**Motion:**
- **Intro, still by 1.85 s.** The cut opens part-raked. The start value is solved from the measured cut, so the navy plane never covers the raised load or the real hook. It luffs down to its rake while the hook line pays out and the load lowers, then one damped swing.
  - The H1 and the photo never move.
  - CSS pre-states before JS, with a 3 s failsafe.
- **Under the first-visit curtain:** the intro starts as the curtain lifts (`afterLoader`). The curtain's lower edge has the same rake and band.
- **Scroll, desktop:** the hoist. The load rises toward the hook, then `heroDock` flies its ghost into the bar's WhatsApp (and back on scroll back), then the field closes over the photo.
- **Live hook, desktop with a fine pointer, after the intro:** a damped pendulum kicked by cursor speed near the load, about ±1.7°.
- **WebGL layer.** Fetched on idle after the intro, raw WebGL 1, its own chunk of 2.4 KB gz.
  - **What it draws:**
    - depth parallax from a depth map derived from the photo;
    - the real rope and hook swinging about the boom tip, with the DOM sling following;
    - a faint navy edge grade.
  - **When it draws:** only on demand, with no loop when still, and it pauses off-screen and in hidden tabs.
  - **Fallback:** a first frame over 200 ms or a lost context removes it.
  - **Never runs on:** touch, reduced motion or no-JS.
- **Header:**
  - it keeps its dark glass over the photo;
  - the request pill is outlined while the hero's WhatsApp is the red action, and turns red once the load has docked.

## Verification (dev server on 4210 for layout and motion, production preview on 4211 for Lighthouse and the detector)

**First screen.** For AR and EN, at 1440×900, 1366×657, 1440×790, 390×844, 390×664 and 768×1024, every check passed in all **12 / 12** configurations:
- the H1, WhatsApp, services line and Browse are all in the first screen;
- no text sits off the field;
- the sling legs end on the button;
- the LCP element is an H1 span;
- CLS ≤ 0.001;
- no horizontal overflow;
- no console errors.

Data: `metrics.json`.

**Reduced motion:** the final state in all 4 configurations. No WebGL, no pin, no motion.

**Dock and reverse (1440 AR):**
- At scroll 0 and 280 the button shows and the bar is hidden.
- At 600 the ghost has landed: the button is at opacity 0 and the bar shows.
- Scrolling back to 0 restores the button.

**WebGL:**
- The canvas is ready on desktop AR and EN, and absent at 390 (touch) and under reduced motion.
- The headless run used the real GPU path: ANGLE Metal on an Apple M5.
- Frame time while the cursor sweeps was 33.3 ms median both with the layer and with its chunk blocked, so the layer adds no measurable frame time. The 30 fps ceiling is the headless page's, not the layer's.

**Loader hand-off:**
- With `html[data-loader]` the intro holds at 0 until the curtain lifts, then plays.
- With no loader it plays at once.
- `MotionEnv.late` still skips it.

**Lighthouse** (`qa/lighthouse.mjs`, mobile and desktop, median of 3):

| Page | Mobile perf | Mobile LCP | Desktop perf | Desktop LCP | CLS |
|---|---|---|---|---|---|
| AR | 99–100 | **1.71 s** (runs 0.90 / 1.71 / 1.71) | 100 | 0.42 s | 0 |
| EN | 99 | **1.70 s** | 100 | 0.42 s | 0 |
| AR, Slow 4G applied | 99 | 1.60 s | | | |

- a11y, best practices and SEO were 100 in every run.
- LCP equals FCP in every run, because the H1 is the LCP element. The 1.7 s runs come from the first-visit loader's first paint.
- Single runs that skip the loader (`/#top`, `/en/#top`, as on a repeat visit) give **0.90 s**.
- Before the loader was merged, all runs were 0.90 s. For comparison, the old hero measured 3.5–4.2 s.

**Bundle** (`qa/bundle-budget.mjs`), all within budget:

| Measure | Value | Budget |
|---|---|---|
| Initial JS | **101.2 KB gz** | 110 KB |
| CSS | 21.4 KB gz | 25 KB |
| First load, AR mobile | 456 KB | 1000 KB |
| Hero image, mobile | 39 KB | 80 KB |
| Hero image, desktop | 78.5 KB | 120 KB |

- On the same tree, initial JS was 101.0 before the merge and 101.3 for the old hero, so the hero's main-chunk cost did not rise.

**Impeccable detector:**
- `npx impeccable detect`, rendered `/#top` and `/en/#top` at 1440×900, 1366×657, 390×844 and 390×664: **8 × exit 0**. The only advisory is the site-wide `repeating-stripes-gradient` on `body` (the footer pad).
- Source scan of `Hero.tsx` and `hero.css`: `[]`.

**Tests:** `npx tsc --noEmit` and `npm test` passed: 63 files, 638 tests.

## Impeccable critique

The design review was isolated: agent `a41c9934fe46fd5fb`, working from the source and these screenshots, with no detector output.

- **Score: 25/32 (78 %), Good.**
- **Verdict:** authored, not interchangeable. In the reviewer's words, "Only a lifting company could use this hero". The rig is pinned to the real hook in container units, and each language has its own photo, so the rake runs with the reading direction.

**Fixed since the review** (commits `7950031`, `55b71cd`):
- **[P1] The intro's start state hid the real hook on desktop.** The start luff is now solved from the measured cut: 0.5 or as much more as keeps the raised load clear (about 0.8 at 1440×900).
- **[P2] The phone foot crowded the H1.** Added a headline–foot gap, and on portrait "Browse" sits at the end of its row.
- **[P2] Dead field on upright tablets.** Larger type in portrait from 600 px.
- **[P2] The lead read like a kicker.** It is now the first clause, in white, at 0.5 F.
- **[P2] WebGL extras.**
  - The dust is removed (it was an endless loop, floor §16.15).
  - Rendering is on demand.
  - The navy grade is fainter.
  - The swing is ±1.7°, and the landscape clearance grows by the same amount, so the load never touches the navy plane.
- **Floor §16.18:** the separator dots are neutral, so red only acts.

**Still open, for the coordinator:**
- **No capacity cue in the hero.** Add a verified maximum once the truth gate allows.
- **Procurement path:** a corporate buyer's "Request a crane" is the outlined header pill until the dock. That is by design (one red action), but a hero-level path to documents could follow when they exist.
- **English phones:** the 9:16 crop is mostly sky.
- **Repeated phrase:** the About heading repeats «من الرافعات الصغيرة إلى الكبيرة» right after the hero. That is copy, outside this task.
