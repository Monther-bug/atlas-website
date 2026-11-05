# Hero concepts (H.1): three directions for the "On the Hook" hero

- **Date:** 5 November 2026
- **Branch:** `task/H.1`, on `feat/site-build` at `91ee4b2`, which includes the D.3 intro, the D.4 dock, the 65 % bar line and the gate-1 fixes
- **Skill:** Impeccable 4.8.0, engine 0.1.18 (`.claude/skills/impeccable`). The `/impeccable` commands could not be invoked from this delegated session, so I followed `reference/critique.md`, `bolder.md`, `overdrive.md`, `layout.md`, `typeset.md`, `animate.md`, `delight.md` and `craft-floor.md` by hand.
  - The detector ran through the bundled launcher: `.claude/skills/impeccable/scripts/impeccable detect`. That is the same engine `npx impeccable detect` resolves to, but run from the cached binary, so nothing was downloaded.
- **How to see the prototypes:** run `npm run dev` and open `/?hero=a`, `/?hero=b` or `/?hero=c`. For English, use `/en/?hero=…`.
  - Add `&sb` to build the intro paused at 0 (`window.__hc.intro` can then be seeked). This is how the storyboards were taken.
  - With no parameter, or an unknown one, the page shows the current hero.
- **Production is unchanged.** `npm run build` output is byte-identical to the base commit: 279 files with the same SHA-256 (see "Commands").
  - The prototypes load only on the dev server. A `serve`-only Vite plugin (`vite/hero-concepts-dev.ts`) loads `src/sections/hero-concepts/register.ts`.
  - `Hero.tsx` asks `window.__heroConcept` inside `if (import.meta.env.DEV)`. That block folds away in production.
  - Concept CSS is a string inside the dev module, and `@source not` keeps it out of the Tailwind scan.

**What changed in the brief while this was being built:**
- **v1 visual rules lifted (coordinator, 5 Nov).** Radii, elevation, glass, large display type, pinned scroll storytelling and pointer interactions are allowed now.
- **Still hard rules:**
  - truth;
  - Arabic-first composition;
  - WCAG 2.2 AA;
  - reduced motion shows the final state;
  - no-JS shows a complete hero;
  - prerender-safe;
  - main JS ≤ 110 KB gz;
  - mobile LCP must improve.
- **References:** stripe.com, apple.com/iphone, land-book.com and lusion.co (immersive WebGL). §5 is the Lusion-lens direction.
- **Palette (user, 5 Nov):**
  - mostly white and black;
  - red is the action colour (the sling and WhatsApp);
  - navy #23207A is a visible secondary accent at about 10–15 %: A's lead line and plate edge, B's plane along the cut, C's panel and the WebGL grade.
- **Fonts move to Tajawal (Arabic) and Poppins (Latin and numerals)**, on `task/V.1`. That branch has no font commit yet, so the screenshots use today's Kufi / Archivo / Plex.
  - Every concept uses the `--font-display` / `--font-body` tokens, so the new fonts will flow through.
  - No concept depends on Archivo's width axis any more. C's "tension" is expressed as weight steps.

---

## 1. The current hero, scored (Impeccable critique)

**Method:** dual-agent. A: `ae01ba04ac274b9a3`, isolated design review from real Chrome screenshots, with no detector output. B: `a83f412fb157971c6`, detector plus browser evidence. A finished before B's findings were used.
- Live-server overlay: not injected (headless, no user browser).
- Closing questions: not asked (delegated run). The decisions are in §7 for the coordinator.

Screenshots: `docs/reviews/hero-concepts/current-{ar,en}-{1440,390,1366x657}.jpg`.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | The header's "transparent over the hero" state can't be seen: the hero has `pt-[4.5rem]` on navy |
| 2 | Match with the real world | 3 | The hook metaphor is native to the trade. No range or place on the first screen |
| 3 | User control | 3 | Language switch and nav are visible; nothing traps the user |
| 4 | Consistency | 2 | «راسلنا على واتساب» vs «واتساب»: two labels for one action; three red CTAs |
| 5 | Error prevention | 3 | Little input; the duplicate buttons do no harm |
| 6 | Recognition | 3 | Services are visible, but the range (small → large) is not |
| 7 | Flexibility | n/a | One-screen Persuade surface |
| 8 | Aesthetic and minimalist | 2 | Three red primaries; the bar sat on content; the English mobile crop is about 80 % sky |
| 9 | Error recovery | 3 | Staging WhatsApp links fall back to email without saying so |
| 10 | Help | n/a | Persuade surface |
| **Total** | | **22/32 (69 %), Acceptable** (top of band) | Gate 1 scored the same hero 19/28 before its bar fix |

**Design specificity: half-authored.**
- The sling on the real hook is the only thing no other company could ship.
- Everything around it is a category template: a photo box between two navy slabs, then an H1, a lead and an outline button set with `justify-between`.
- On screen the legs are about 35–40 px, so from a distance the idea reads as "a red button on the sky".
- The top-anchored crop cuts away the ground and the machines.

**Priority issues (A and B agree on all of them):**
- **[P1] The H1 misses the first screen on real windows.** It is open since gate 1. Measured in Chrome (`.work/metrics/current.json`):

  | Window | Arabic H1 bottom | English H1 bottom |
  |---|---|---|
  | 1366×657 | 786 | 847 |
  | 1440×790 | 816 | 881 |
  | 390×664 | 715 | 791 |

  All of these are below the fold. At 1440×900 the services line and «تصفّح الرافعات» are below the fold in both languages. "Browse cranes" is never visible at scroll 0 at any of the six sizes.
- **[P1] The template composition hides the signature.** The headline and the hook live in two separate rectangles.
- **[P2] The claim is not shown.** The range is not felt on the first screen. The site has no verified tonnage yet, so the fix has to be visual (scale, the machine in frame), not a number.
- **[P2] Mobile LCP is the photo.** The `<img>` is the LCP element at every size (B: `6398-mobile_9x16-828.avif` at 390). That is why Lighthouse mobile LCP is 3.4 s against a 2.0 s budget.

**Detector:**
- Hero sources: `[]`, exit 0. That scan is regex-only for `.tsx`, so it is a partial check.
- URL scans: exit 0. The only hero finding is the services-line `straggler` at 390, where "Oil / services" and «الخدمات / النفطية» split across lines.
- axe on `#top`: 0 violations in all four configurations.

**Persona red flags:**
- **Libyan site manager (Arabic, phone, arriving from Facebook):** sees two WhatsApp buttons with different labels and nothing local. Browse is below the fold.
- **Procurement (desktop, English):** the H1 was clipped by the bar (fixed since), and there is no proof on the first screen.

---

## 2. What all three directions share

These choices answer the critique. They are the same in A, B and C, so the comparison in §6 is about the idea itself.

1. **The photo covers the whole viewport, under the solid header.** That ends "photo on top, band below". It also has one measured side effect that matters more than any animation: **the H1 becomes the LCP element.**
   - Chrome ignores an image that covers the full viewport when it picks the LCP candidate.
   - Test page at 390×844 (a scratch test page, not committed):
     - a 100vw × 100vh `<img>`, or a larger one clipped, gave LCP = the `<h1>` at first paint;
     - the same image 72 px shorter gave LCP = the `<img>` at its load time (840 ms with an 800 ms image delay).
   - In the prototypes, the LCP element is an H1 span at all six sizes in both languages. The current hero's is the `<img>` (table in §6).
2. **Bottom-anchored framing, `object-position: 50% 100%`.** On short, wide windows the sky is trimmed from the top, and the cranes, the Grove badge and the "CRANE HIRE" cab stay in frame.
   - This is gate 1's recommendation (a), done in the framing instead of in a band.
   - Where the hook still sits too low (6359 on phones, B and C on phones), the framing zooms about the bottom edge (`--z` 1.12–1.75).
   - A re-cut 9:16 crop at the full source height would do the same without zoom. Both mobile crops already clear the watermark horizontally, so it needs only a crop change in `assets-src/crops.json`, not new photos.
3. **One geometry for the real hook,** `hero-concepts/geometry.ts::hookCss`. It is the CSS Images 3 cover formula, for a bottom-anchored, zoomable image, written as `calc()` in container units.
   - No JS is needed. It renders in the prerender, and the sling stays on the hook at every size.
   - A test pins the 6398 numbers.
4. **The rig.** A zero-size box sits on the hook. The pin, the legs and the load hang from it, so rotating the rig swings the load about the real hook.
   - The legs are 3–8 × longer than today: `--drop` is 6–10 svh.
5. **First screen, measured.** H1, WhatsApp, the services line and "Browse cranes" are all inside the first screen in **every** direction, both languages, at 1440×900, 1366×657, 1440×790, 390×844, 390×664 and 768×1024. This closes the gate-1 P1. Numbers: `.work/metrics/{a,b,c}.json`, summarised in §6.
6. **One WhatsApp action on the first screen.**
   - The bar stays hidden while the hero reaches below the 65 % line (merged `RequestBar`).
   - Each direction docks its WhatsApp load into the bar with a ghost flight. `hero-concepts/motion/dock.ts` is `heroDock` with a root and button passed in. The concepts carry no `data-hero` / `data-sling-button`, so the production `heroIntro` leaves them alone.
7. **States.**
   - **Reduced motion:** no timelines and no pin; the final state as rendered.
   - **No JS:** a complete static hero. C does not pin, and the CSS final values apply.
   - **Text never sits on the sky:** every line of type is on navy (plate, field or frosted panel).
   - **Services line:** one span per item, so "Oil services" never splits. Screen readers get commas, not dots.
   - **Focus:** the focus ring on the WhatsApp button is drawn inside the red.
8. **Detector on every variant.**
   - Source scan of `src/sections/hero-concepts`: `[]`, exit 0.
   - 32 URL scans (current, a, b, c × AR/EN × four sizes): all exit 0.
   - The only advisory is the site-wide `repeating-stripes-gradient` on `body`, the footer's chevron pad, outside the hero.
   - Findings fixed on the way are listed in "Commands".

9. **Hand-off from the first-visit loader** (the coordinator's loader task: a black curtain, the badge, a hook and rope; the hook lifts the curtain; it fires `atlas:loader-done`).
   - While a loader shows (`html[data-loader]` or a visible `[data-loader]`), each intro is built and held at its first frame under the curtain.
   - It starts the moment `atlas:loader-done` fires. If the event never comes, it starts after 2.6 s.
   - "Late" is not applied under the curtain, because the hero is not visible yet.
   - Preview it on the dev server with `?hero=a|b|c&loader`, which simulates a 1.2 s loader. Checked in Chrome: intro progress is 0 at 0.7 s, then the intro plays to the end after the event.
   - **The visual hand-off, per direction:**
     - **A:** as the loader's hook rises off-screen with the curtain, the hero's sling legs pay out from the real hook down to the plate, and the plate is lifted. The rope in the loader becomes the rope in the photo.
     - **B:** the curtain's lower edge clears to reveal the half-raked cut. The cut continues the lift as the luff, and the load lowers.
     - **C:** the curtain lifts onto the hook close-up. The loader's hook and the photo's hook share the frame centre-right, so the pin can take over the loader's hook position. For an exact match, the loader should end its hook at the hero's hook point: the CSS `--hx` / `--hy`, or the pin's `getBoundingClientRect()`.

---

## 3. Direction A: «الحِمل» / "The Load"

**The idea in one line:** the headline *is* the load. A white steel plate carrying the H1, the services and both actions hangs from the real hook on two long red sling legs.

**Evidence:**
- Stills: `a-ar-1440.jpg` · `a-en-1440.jpg` · `a-ar-390.jpg` · `a-en-390.jpg` · `a-ar-1366x657.jpg` · `a-en-1366x657.jpg`
- Intro: `a-intro-0000/0300/0700/1200/2000.jpg`
- Scroll: `a-scroll-1/2/3.jpg`
- Reduced motion: `a-reduced-ar-1440.jpg`

**Why it is not a traditional hero.** There is no band and no stack of headline, subtext and buttons over a dimmed photo. The text block is a physical object in the photo's world, rigged to a real Atlas crane.
- It is centred under the hook, because a load hangs under its hook.
- When it is wider than the room, it runs off the screen edge: a load bigger than the frame.

**Layout:**
- **Arabic:** the hook is at about 77 % of the width. The plate's left edge is at 34 % (desktop) or 1 rem (phone), so it runs off the right edge (the reading start).
- **English:** at 1440 it runs off the left edge; on phones, off the right.
- The text stays inside the visible part of the plate. CSS computes the padding from the hook and the plate width.
- Two red lugs take the legs. The plate has square corners and a 6 px navy bottom edge for thickness.
- **Palette:** white plate, black type, a navy lead line (13.5 : 1), and red only for the sling and WhatsApp.

**Type:**
- H1 `min(4.4vw, 6.1svh)` on desktop (56 px at 1440×900), `min(9.6vw, 5.1svh)` on phones.
- Lead at 0.5 em. Services in grey at 7.4 : 1 on white.

**Motion (`motion/a.ts`), still by 2.0 s:**

| Time | What happens |
|---|---|
| 0.10–0.70 | The legs pay out from the hook (DrawSVG) to the plate, which rests about 10 % lower, "on the ground" |
| 0.50–1.45 | The crane takes the load. The plate lifts into its hang while the legs shorten to match |
| 1.35–2.00 | One damped swing of the whole rig about the hook: 1.6° → −0.9° → 0.4° → 0 |

- **Scroll (scrub 0.6):** the hoist. The legs shorten to 32 % and the plate rises 68 % of the drop toward the hook, lifting the headline out of the page. The WhatsApp ghost docks into the bar at the dock line.
- **Pointer:** none.

**Accessibility and RTL:**
- DOM order: H1, services, WhatsApp, Browse.
- The plate is a light ground (`data-ground="light"`), so the focus ring and selection switch to their light-ground colours.
- CLS ≤ 0.001.

**Budget and LCP:**
- **Main JS:** the component is 1.86 KB gz against today's Hero + Sling at 2.35 KB gz.
- **Lazy core:** the motion is about 0.5 KB gz plus the shared dock glue, replacing `heroIntro` (1.58 KB gz).
- **CSS:** about +1.6 KB gz.
- **LCP:** the H1 text at every size.

**Risks:**
- The plate still covers part of the machine.
- **Open review point:** the WhatsApp button is *inside* the plate, so the button itself is no longer the load. The fix would be to hang it under the plate on two short legs.
- On EN phones the framing zooms 1.35×, which is soft.
- **Tablet portrait (768×1024):** the 16:9 crop puts the hook off-screen right. The fix is to choose the crop by aspect ratio, not width.
- After the dock, the plate's WhatsApp slot is empty until the hero leaves.

---

## 4. Direction B: «زاوية الرفع» / "The Luff"

**The idea in one line:** the old flat band is *luffed* into a raked black field, and a navy plane rides just above it along the cut.
- The cut passes just under the hanging WhatsApp load.
- The headline is set on the cut, so each line starts on the rake.
- The WhatsApp button itself is the load, hanging into the sky the cut opens.

**Evidence:**
- Stills: `b-ar-1440.jpg` · `b-en-1440.jpg` · `b-ar-390.jpg` · `b-en-390.jpg` · `b-ar-1366x657.jpg` · `b-en-1366x657.jpg`
- Intro: `b-intro-0000…2000.jpg`
- Scroll: `b-scroll-1/2/3.jpg`
- Reduced motion: `b-reduced-ar-1440.jpg`

**Why it is not a traditional hero.**
- The photo and the type share one plane, divided by a single diagonal. The diagonal is set by the hanging load, not by a grid.
- The type is display-scale and stepped along the cut, so the headline's shape is the rake.
- Nothing is centred, nothing is boxed, and nothing sits on the sky.

**Layout:**
- **Arabic:** the cut rises from the hook side (right) toward the left at slope 0.36 (desktop) or 0.46 (phone).
- **English:** it rises toward the right.
- **The staircase:** the last (longest) H1 line starts on the cut, and each line above it starts further along the cut by its height ÷ slope.
  - Pure CSS, in units of the main size F. No JS, no `shape-outside`.
  - The steps shrink by any slack where the cut runs off-screen.
  - On phones the start edge is flush; the rake stays in the field's shape.
- The services line and "Browse" sit at the foot, also kept inside the field.
- The 1.75 rem navy plane above the black field is the brand blue, about 10 % of the frame.

**Type:**
- The largest of the three: F is `min(5.2vw, 7.8svh)` (70 px at 1440×900 AR).
- Lines never wrap.
- The lead is in navy-tinted grey (8.7 : 1 on black).

**Motion (`motion/b.ts`), still by 1.85 s:**

| Time | What happens |
|---|---|
| 0.00 | The field is half-raked: the cut already clears the real hook, so the sling never hangs from nothing. The headline is already there |
| 0.15–1.25 | The cut luffs down on the hook side to its full rake (`--luff` drives both clip-path polygons). The hook line pays out with it, and the WhatsApp load lowers into the sky the cut opens. One move, two meanings |
| 1.25–1.85 | One damped swing (3°) |

- **Scroll (scrub 0.6):** A's hoist first. The legs shorten and the load rises to the hook. Then, after the load has docked into the bar, the field closes over the photo and the hero becomes the ground of the next section.
- **Pointer:** none in the static build. §5's WebGL layer can sit on B's photo unchanged (see §7).

**Accessibility and RTL:**
- DOM order: H1, WhatsApp, services, Browse. This fixes the review's WCAG 2.4.3 point.
- The explicit line spans read as one sentence.
- Each language's cut is built from its own photo's hook.
- CLS ≤ 0.001.

**Budget and LCP:**
- **Main JS:** the component is 1.92 KB gz (−0.4 KB).
- **Lazy core:** the motion is about 0.45 KB gz.
- **CSS:** about +1.9 KB gz.
- **LCP:** the H1 text everywhere. Its first frame is black, navy and white type, the cheapest possible first paint.

**Risks:**
- **The staircase depends on line widths.** F must be re-tuned when Tajawal and Poppins land, because Poppins is wider than Archivo.
- The field covers the smaller Grove crane on desktop AR.
- On EN phones the framing zooms 1.75×, which is soft until the full-height 9:16 crop exists.
- The phone H1 (about 34 px) is the smallest of the three. It can grow to about 37 px.

---

## 5. Direction C: «العمق» / "Depth": the immersive one (Lusion lens)

**The idea in one line:** a camera move plus a live photo.
- The hero opens on the real hook and the scroll pulls the camera back to the whole crane.
- On desktop, a WebGL layer turns Atlas's own photo into a scene:
  - the cursor moves the cranes in depth;
  - the cursor's speed sets the **real rope and hook** swinging about the boom tip, and the WhatsApp sling swings with them;
  - dust drifts in the light under a navy grade.

**Evidence:**
- Stills: `c-ar-1440.jpg` · `c-en-1440.jpg` · `c-ar-390.jpg` · `c-en-390.jpg` · `c-ar-1366x657.jpg` · `c-en-1366x657.jpg`
- Intro: `c-intro-0000…2000.jpg`
- Scroll (close-up → whole crane): `c-scroll-1/2/3.jpg`
- WebGL under the cursor: `c-gl-ar-1-parallax-left.jpg` · `c-gl-ar-2-swing.jpg` · `c-gl-ar-3-parallax-right.jpg`, plus the same three for `-en`
- Reduced motion: `c-reduced-ar-1440.jpg`

**Why it is not a traditional hero.** The first screen is a frame of a scene, not a layout. It borrows three studio techniques and applies them to the one asset Atlas has, its photo:
- the pinned, scrubbed reveal from apple.com/iphone;
- Lusion's pointer-reactive depth;
- the physical, damped motion Stripe uses for its interface.

The swinging rope is the hook idea carried into the photograph itself.

**Layout:**
- The panel sits at the reading-end bottom: bottom-left in AR, bottom-right in EN.
- It has a fixed width, `min(46rem, 58cqw)`, and is solid black at 94 %. The review called the earlier glass "decoration", so it is not glass now.
- It has a 1 rem radius, a 3 px navy top edge and a navy-tinted, offset shadow.
- The zoom (`--zc`) runs on an inner photo layer whose transform-origin is the hook, so the hook, sling and load never move while the camera does.

**Type:**
- H1 `min(4.5vw, 7svh)` on desktop, two fixed main lines.
- The lead is in navy-tinted grey.
- The earlier weight steps and size ramp are gone. The review counted four competing motions; now the hook is the only one.

**Motion (`motion/c.ts`):**

| Time | What happens |
|---|---|
| 0.00 | The camera is on the hook: `--zc` 2.0 on desktop, 1.25 on touch |
| 0.10–0.70 | The legs pay out |
| 0.55–1.00 | The load settles |
| 1.00–1.70 | One damped swing |

- **Scroll, desktop:** pinned for 90 svh more while `--zc` scrubs 2 → 1 about the hook.
- **Scroll, touch:** no pin. A short pull-back, 1.25 → 1, as the hero leaves.
- **Desktop, after the intro:** the live hook.
  - A damped pendulum, kicked by the cursor's speed near the load (Gaussian reach of 320 px).
  - With WebGL the period is 2.6 s, about the boom tip, and the DOM rig is translated to the hook's new place and rotated with the rope.
  - Without WebGL, the period is 1.7 s, about the hook.

**The WebGL layer (`motion/gl.ts`), measured.** Raw WebGL 1, no library.
- **Size:** a separate lazy chunk of **3.4 KB gz** (8.4 KB raw). For scale, three.js is about 150 KB gz and ogl about 10–25 KB gz.
- **When it loads:** only in the desktop context (≥ 64 rem, fine pointer, motion allowed), after the intro. Touch, reduced motion and no-JS never fetch it.
- **First paint:** the `<img>` paints first and stays underneath. The canvas fades in only after its first frame is drawn. It is `aria-hidden`, has no pointer events, and causes no layout shift.
- **Depth map:** derived at runtime from a 160 px copy of the photo. No new asset.
  - Yellow steel and dark machinery are near; sky is far; the ground is nearest. Box-blurred.
  - It is a colour heuristic, not ML. It reads correctly on these two photos: booms near, sky far.
- **The real rope swing:** pixels in a capsule from the boom tip to just below the hook are sampled through an inverse rotation about the boom tip. The boom tips are read off the photos like `hook-points.json`: 6398 (3041, 27) and 6359 (1646, 248).
  - The sky is smooth, so the capsule edge doesn't show.
  - In the frames the DOM pin stays on the moving real hook (`c-gl-ar-2-swing.jpg`).
- **Dust:** 140 additive points drifting upward, pushed by the cursor.
- **Navy grade:** vignette plus far sky.
- **Cost controls:**
  - DPR is capped at 1.5;
  - `powerPreference: 'low-power'`;
  - rendering stops off-screen (IntersectionObserver) and in hidden tabs;
  - the WebGL context is released on cleanup.

**Cost and benefit, honestly:**
- **Benefit:** a "wow" no crane company has. The photo answers the cursor, and the hook visibly swings. It costs 3.4 KB on desktop only, after first paint, so LCP and main JS are untouched.
- **Cost:**
  - **GPU:** a full-screen fragment shader runs every frame while the hero is in view, a laptop battery cost.
  - **Image:** the close-up needs the 2560 px image (116 KB AVIF) on desktop.
  - **Close-up softness:** at 2× it is soft on a 2560 px source. A dedicated close-up crop from the 4240 px original would fix that.
  - **Mask tuning:** the rope capsule must be tuned per photo; a new hero photo needs its boom-tip point.
  - **Desktop pin:** 90 svh of extra scroll before the Hoist, which also pins.
  - **Testing:** headless capture ran on SwiftShader. Real-GPU checks are still needed on a mid-range Windows laptop and in Safari.

**Accessibility and RTL:**
- The panel passes over the worst case, a white cloud behind it: white about 13 : 1, grey about 6 : 1.
- The pendulum is mouse only; keyboard and touch get a still load.
- Reduced motion: no pin, zoom 1, no WebGL.
- CLS ≤ 0.001.
- DOM order is H1, services, Browse, then WhatsApp. That is still open from the review: the panel holds the foot.

**Budget and LCP:**
- **Main JS:** the component is 2.03 KB gz (−0.3 KB).
- **Lazy core:** the motion is about 1.3 KB gz.
- **WebGL:** +3.4 KB gz, lazy, desktop only.
- **CSS:** about +1.5 KB gz.
- **LCP:** the H1 text everywhere.

---

## 6. Side by side

### 6.1 Impeccable critique scores

**Method:**
- Assessment A was one isolated design-review sub-agent, `a28a6a9020fac250c`. It read the source and all 45 concept stills and storyboards, saw no detector output, and did not read this file.
- Assessment B is the detector on every variant (§2.8 and "Commands").
- This is not the reference's full form (one A/B pair per target): one reviewer scored all three. That keeps the three on one scale.
- The reviewer scored the version before its own fixes. The fixes were applied afterwards (listed below) and were **not** re-reviewed. The "after fixes" column is my estimate and is labelled as such.

| | A · The Load | B · The Luff | C · Depth |
|---|---|---|---|
| Design specificity (reviewer) | half-authored ("white card on a photo", 390 reads as a bottom sheet) | **most authored**; the button is the load; trope risk if the rake reads as a generic angled divider | mixed: the pull-back is owned; the glass card, size ramp and weight ramp were generic |
| H1 status / H2 real world / H3 control | 3 / 3 / 3 | 3 / 3 / 3 | 2 / 3 / 2 |
| H4 consistency / H5 errors / H6 recognition | 3 / 3 / 4 | 2 / 3 / 3 | 2 / 3 / 3 |
| H8 minimalist / H9 recovery | 3 / 2 | 3 / 2 | 2 / 2 |
| **Total (reviewer, before fixes)** | **24/32 (75 %), Good** | **22/32 (69 %), Acceptable** | **19/32 (59 %), Acceptable** |
| Cognitive load | 1 failure | 2 failures | 3 failures |
| Fixes applied since | square plate with a navy edge (it is no longer a card); one red primary on screen (header CTA outlined over the hero); no dangling separator dots on phones | the cut starts half-raked, so the real hook shows from frame 0; the hoist runs before the field closes, so the sling never hangs from nothing; DOM order is H1 → WhatsApp → services; flush start edge on phones; navy plane; header CTA outlined | the sling misalignment was a GSAP/`translate` conflict, now fixed with an outer centring box; no pin and zoom ≤ 1.25 on touch; solid navy panel instead of glass; weight steps and size ramp removed; WebGL depth layer added |
| **After fixes (my estimate, not re-reviewed)** | about 25/32 (H8 3 → 3, H4 3 → 4) | about 25/32 (H4 2 → 3, H6 3 → 4, H2 stays 3) | about 23/32 (H1 2 → 3 on touch, H4 2 → 3, H8 2 → 3) |
| Still open from the review | the WhatsApp button is inside the plate, so it is not the load; an empty slot after the dock | the rake has no visible relation to the 60° boom (it follows the load, not the boom); the phone H1 is about 34 px | the desktop pin cannot be skipped; DOM order puts WhatsApp last; the close-up is soft |

**The reviewer's ranking: B, then A, then C.** In its words: B is "the only direction that is non-traditional at first glance and makes the WhatsApp button itself the load". It would "build B; borrow A's hoist (done) and C's desktop pendulum; leave out C's glass, weight steps and pin (done for touch)".

### 6.2 Measured in Chrome, on real screenshots (`.work/metrics/*.json`)

**H1, WhatsApp, services line and "Browse cranes" in the first screen.** Checked at 1440×900, 1366×657, 1440×790, 390×844, 390×664 and 768×1024, in both languages:

| | Current | A | B | C |
|---|---|---|---|---|
| H1 in the first screen | 6 / 12 | **12 / 12** | **12 / 12** | **12 / 12** |
| Services line in the first screen | 2 / 12 | 12 / 12 | 12 / 12 | 12 / 12 |
| "Browse cranes" in the first screen | 0 / 12 | 12 / 12 | 12 / 12 | 12 / 12 |
| LCP element | hero `<img>`, 12 / 12 | H1 span, 12 / 12 | H1 span, 12 / 12 | H1 span, 12 / 12 |
| Max CLS during the intro | 0 | 0.001 | 0.001 | 0.001 |
| Horizontal overflow | none | none | none | none |
| Detector (URL scans, 8 per variant) | exit 0 | exit 0 | exit 0 | exit 0 |

**Budget, measured with a Vite library build of each piece.** React, GSAP, Lenis and shared modules are external, so each number is what the piece itself adds:

| | Current | A | B | C |
|---|---|---|---|---|
| Hero component in main JS | Hero + Sling 2.35 KB gz | 1.86 | 1.92 | 2.03 |
| Intro / scroll motion in the lazy core | `heroIntro` 1.58 | about 0.5 | about 0.45 | about 1.3 |
| WebGL layer, its own lazy chunk (desktop only) | — | — | — | 3.4 |
| CSS (main stylesheet) | — | about +1.6 | about +1.9 | about +1.5 |

- Main JS is 100.51 KB gz now, measured on this branch, against a budget of 110. Every direction lowers it slightly.
- The dock already exists (`heroDock`). The concepts' copy (`dock.ts`) would merge back into it.

### 6.3 Lighthouse: the LCP effect, measured

**Setup:** Lighthouse 13, mobile preset with simulated throttling, performance category only, Arabic page, 3 runs each, alternating. Output: `.work/lh-results.txt`.
- **"Current":** this branch's production build (`npm run build`, byte-identical to the base), served by `vite preview`.
- **"B probe":** the same tree in a scratch copy, where `Hero.tsx` renders `HeroB` statically, prerendered by the real prerender script.
  - The probe is valid only for paint timings. It inlines the concept CSS, Tailwind scanned the concept folder, and the dev motion loaders came along, so its CSS and JS sizes are not representative.

| Run | Current: FCP / LCP / score | B probe: FCP / LCP / score |
|---|---|---|
| 1 | 1.6 s / **4.2 s** / 0.85 | 0.9 s / **0.9 s** / 1.00 |
| 2 | 1.6 s / **4.2 s** / 0.85 | 1.7 s / **1.7 s** / 0.99 |
| 3 | 0.9 s / **3.5 s** / 0.91 | 0.9 s / **0.9 s** / 1.00 |
| **Median** | **1.6 s / 4.2 s / 0.85** | **0.9 s / 0.9 s / 1.00** |

- With the photo covering the whole first viewport, **LCP equals FCP:** the H1 is the LCP element. Mobile LCP drops from about 4.2 s to about 0.9 s, against the 2.0 s budget.
- Gate 1 recorded 3.4 s on its own runs; here it is 3.5–4.2 s on a busy machine.
- A and C use the same full-viewport photo and an LCP H1, so the same effect applies to them. That was checked in Chrome (§6.2), not with Lighthouse.
- **Caveat:** this rests on Chrome's rule that an image covering the full viewport is background, not content. A later layout that shortens the photo below the viewport would bring the image back as the LCP.

---

## 7. Recommendation

**Build B ("The Luff") as the hero, with three borrowed parts:**
1. **A's hoist** as the scroll move. It is already merged into B's prototype: the load rises to the hook and docks, and only then does the field close.
2. **C's WebGL depth layer** as a desktop-only progressive enhancement on B's photo.
   - It replaces only the photo layer, so it works on any of the three compositions.
   - What it adds: depth parallax from the photo, the real rope and hook swinging, dust in the light, and a navy grade.
   - It costs 3.4 KB gz in a lazy chunk, nothing on phones, and nothing for LCP.
3. **C's cursor pendulum,** which in the WebGL version swings the real rope with the WhatsApp load. It is the same single idea, the load on the hook, made physical.

**Leave out** A's plate, C's panel and C's desktop pin. Two pinned scenes back to back (hero, then Hoist) is too much scroll for a site manager.

**Why B:**
- **It is the most authored and the least traditional at first glance.** The isolated reviewer ranked it first.
- **It keeps the signature literal.** The WhatsApp button is still the load, hanging from the real hook, never inside a box.
- **It has the strongest reveal.** The cut luffs open, the hook line pays out and the load lowers into the new sky: one move, two meanings.
- **It is the boldest type.** The display-scale headline is stepped on the rake, in a palette that is mostly black and white, with navy as the plane behind the cut and red only for the load.
- **It passes every measured check:**
  - all four first-screen items at every tested size, in both languages;
  - LCP is the H1 text;
  - CLS ≤ 0.001;
  - detector exit 0;
  - main JS goes down.
- **With the WebGL layer on desktop** it reaches the level of immersion the Lusion reference asks for, without paying for it on phones.

**Fallback: A.** If the client wants a lighter, whiter first screen, A's white plate is the calmest of the three and has the best phone ergonomics (reviewer). Its open point is that the button sits inside the plate rather than hanging as the load.

**Before building, whichever is chosen:**
1. **Fonts:** re-tune the type sizes after the Tajawal / Poppins merge from `task/V.1`. B's staircase depends on line widths.
2. **Mobile crops:** re-cut both 9:16 crops at full source height. They clear the watermark horizontally, so this is a `crops.json` change, not new photos. It removes the 1.12–1.75× mobile zooms and their softness.
3. **Tablets:** choose the crop by aspect ratio, not width, so tablets in portrait keep the hook on screen.
4. **WebGL hardware check:** test on a real GPU (mid-range Windows laptop, Safari, Firefox). The capture here ran on SwiftShader.
5. **Rake and boom:** decide whether the rake should visibly pivot like a boom (the reviewer's question), for example from a drawn pivot pin at the reading-end edge.
6. **Phone H1:** raise B's phone H1 from about 34 px to about 37 px.

**Decisions for the user (the critique's closing questions; not asked here because this is a delegated run):**
1. Pick B (recommended), A or C.
2. Approve the full-height 9:16 re-crops.
3. Should the WebGL layer ship (desktop only, about 3.4 KB, a GPU cost while the hero is in view)?
4. Should B's field be white instead of black, to fit "mostly white"? It is a one-line change in the prototype; the type would turn black.

---

## Commands and results

All commands run in `/Users/montheribrahim/Downloads/atlas-wt/H.1`.

**Servers and caches:**
- Dev server: `npx vite --config .work/vite.private.config.ts --port 4210`. The config is untracked and imports the project config with `cacheDir: '.work/vite-cache'`.
- Previews: ports 4211 (this build) and 4212 (scratch probe).
- All three were stopped by PID at the end.

| Command | Result |
|---|---|
| `git merge --no-edit feat/site-build` | merged (D.3 intro, D.4 dock, the 65 % bar line, gate-1 fixes) |
| `npx tsc --noEmit` | exit 0 |
| `npm test` | **48 files, 452 tests passed**. Adds `src/sections/hero-concepts/concepts.test.tsx`: the switch renders the current hero by default and for unknown values; each concept is `#top` with the full H1, services, WhatsApp and Browse, H1 before WhatsApp, and no `data-hero`; plus the `hookCss` maths |
| `npm run build` | exit 0. `main-DuO-E_V1.js` 100.51 KB gz, `core-CNLgTbxa.js` 58.26 KB gz, `main-CYFnm2uZ.css` 8.95 KB gz |
| `dist/` against a build of the base commit (`git archive HEAD` in the scratchpad) | **byte-identical: 279 files, same SHA-256** |
| `npx impeccable detect --json src/sections/hero-concepts` | `[]`, exit 0 |
| `npx impeccable detect --json --viewport <W×H> <url>` for current, a, b and c × AR/EN × 1440×900, 1366×657, 390×844, 390×664 (32 URL scans) | **32 × exit 0**. Only advisory: site-wide `repeating-stripes-gradient` on `body` (the footer's chevron pad, outside the hero). Full list: `.work/detect/summary.txt` |
| Detector findings fixed on the way | C `oversized-h1` (72 px, 32 vh → `min(4.5vw, 7svh)`); C EN 390 `text-overflow` (smaller H1); C ramp `undersized-ui-text` (ramp removed); A and C `border-accent-on-rounded`, and C `dark-glow`, from the first navy accents (now a navy `::after` edge on A and a solid navy panel on C) |
| Chrome metrics, `.work/evidence.mjs <id> metrics` | §6.2 table (`.work/metrics/{current,a,b,c}.json`) |
| Lighthouse | §6.3 (`.work/lh-results.txt`) |

**Screenshots** are in `docs/reviews/hero-concepts/`: 58 JPEGs, each 128 KB or less. Taken in headless Chrome at device scale 1, after fonts load plus 3.5 s.
- Intro storyboards use `?hero=X&sb`, seeking the paused intro to 0 / 0.3 / 0.7 / 1.2 / 2.0 s.
- Scroll storyboards: A and B at 0 / 280 / 560 px; C at 0 / 42 % / 90 % of its pin.
- WebGL frames: real mouse moves (puppeteer), rendered with SwiftShader.
- Current hero: `current-*.jpg`.

**Not done, and why:**
- **Not done:** the live-server overlay (`[Human]` tab) and the critique snapshot in `.impeccable/critique/`. **Why:** headless, delegated run.
- **Not done:** asking the user the critique's closing questions. **Why:** they are in §7 for the coordinator.
- **Not done:** merging `task/V.1`. **Why:** it has no font commit yet; the concepts already use the font tokens.
- **Not done:** pulling up land-book.com's current featured pages. **Why:** the scraping service had no credits, so Land-book is used as a reference lens only.
