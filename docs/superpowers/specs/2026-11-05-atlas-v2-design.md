# Atlas Alshraa v2: Design language and component system

- **Date:** 5 November 2026 (revised the same day for the user's font, palette, motion and reference instructions)
- **Status:** foundation on `task/V.1`: tokens, fonts, Button, `src/components/ui/*`, `src/motion/reveals.ts`, `src/content/spec-rows.ts`, dev kitchen. Section agents build on it and merge `task/V.1` again before finishing.
- **Why v2:** the user's verdict on v1 was "the website looks old". They want every section at the level of apple.com/iphone, stripe.com, land-book.com's featured pages, lusion.co and the Awwwards / School of Motion / DesignRush animated-site lists: modern components, modern animation, more sections, real crane details, and the Impeccable process on every section.
- **User decisions folded in (5 Nov):** fonts **Tajawal** (Arabic) + **Poppins** (Latin, numerals); palette **"white and black, and a little of the red and the blue"**; "remove all the old look"; references add **land-book.com** and **lusion.co**; "add animations and Impeccable".
- **Relationship to v1:** `2026-11-04-atlas-website-design.md` still owns product truth, architecture, truth gate, SEO, analytics and the hook concept. This document **replaces** its §6 (visual system), §7 (motion) and §15 (craft floor). On look and motion this document wins; on facts and truth, v1 wins.
- **Evidence:** `docs/research/v2-references.md` + `docs/research/v2-refs/*.jpg`; kitchen and type screenshots in `docs/reviews/v2-kitchen/`.

---

## 1. What changes and what does not

| The user overruled (v1 → v2) | Stays hard |
|---|---|
| Square corners → concentric radii, pill buttons | Truth: no invented facts, numbers, clients, years, certifications, testimonials, logos |
| "No shadows except the bar" → 4-step neutral elevation | `[[CONFIRM]]` tokens and DraftBadges until Atlas confirms |
| Navy grounds → **white and black** grounds; navy becomes a small accent | Arabic-first composition (RTL composed, not mirrored); photos never flipped |
| Archivo / Noto Kufi / IBM Plex → **Poppins + Tajawal** (Plex Mono only for model codes) | WCAG 2.2 AA; reduced motion = final state; no-JS = complete content |
| Small motion → a motion system: reveals, tickers, sticky storytelling, FLIP reflows, scroll-driven strip, sheets, micro-interactions, optional WebGL depth (§9.6) | SSR/prerender-safe; initial JS ≤ 110 KB gz; CSS ≤ 25 KB gz; mobile LCP ≤ 2.0 s |
| No carousels/marquee/magnetic → allowed under §16 | The logo as is; red #C9221C = action; no yellow in the UI |

## 2. Direction: "Yard and Chart", in black and white

**Thesis.** Atlas is presented the way Apple presents a lineup, but the lineup is cranes from 55 t to 317.5 t, read the way a lift planner reads a load chart. Two grounds carry the page:

- **Yard** (white, mist): where machines are *looked at*. Big rounded photo frames, white tiles with soft elevation, large display type. The yellow of the cranes is the only strong colour on these pages, and it comes from the photographs.
- **Chart** (black, night): where numbers are *read* and requests are *made*. A graphite glow over black, a faint load-chart grid, numbers in white, actions in red.

**Colour has three jobs and nothing else:** black/white (and neutrals) build the page; **red** acts (primary buttons, the sling, the hook, key highlights) and is rare; **brand navy** is a small accent on light grounds (links, focus ring, the tab ink, the picked column, at most one accent tile per page). The logo carries the rest of the brand.

**Refused category defaults:** black + safety yellow + hazard stripes (Mammoet's world; our photos are yellow already); the SaaS gradient-blob hero; same-size icon cards as structure; a "trusted by" logo strip (Atlas has no publishable clients); a stats band of invented numbers; a custom cursor for its own sake.

**Signature (kept):** the hook. WhatsApp hangs from the real hook in the hero photo and docks into the request bar; "Request this crane" rides the hook into the bar.

**Principles**
1. **Prove the range like a lineup.** Each crane: photo, name, capacity, type, full manufacturer specification, one tap to request.
2. **Grounds have jobs.** Yard = look; Chart = measure and act. Alternate by chapter (§5.3).
3. **Colour has jobs.** Black/white build; red acts; navy points. Nothing else is coloured except the photographs.
4. **Engineered softness.** Concentric radii, shadows with offset + soft blur, glass only where content moves underneath.
5. **Loads are lifted and set down.** Motion rises and settles (expo-out), never bounces; one authored moment per chapter.
6. **Truth is a designed state.** Draft badges, "manufacturer specification" labels, empty cells and hidden-until-data blocks are components.
7. **Arabic composed.** Layouts drawn RTL first; carousels, tabs, sheets and arrows follow the reading direction.

## 3. Palette

Tokens in `src/styles.css` (`@theme static`; Tailwind's palette is cleared). **v1 names are remapped** so every unmigrated section already looks v2: `navy` → ink #111111, `navy-950` → black #0A0A0A, `navy-900/800` → neutral-900/800, `concrete` → mist #F5F5F5, `steel` → neutral-400 #A3A3A3, `ink`/`line` → neutral values. New code uses the v2 names; the aliases go in the cleanup pass (§12).

| Token | Hex | Role |
|---|---|---|
| `black` (= `neutral-950`) | #0A0A0A | **Dark ground** (chart sections, footer, request bar) |
| `neutral-900` | #171717 | Raised surface on black (cards, fields) |
| `neutral-800` | #262626 | Hover on black buttons |
| `neutral-700` / `ink-2` | #4A4A4A | Secondary text on light |
| `neutral-600` / `ink-3` | #6B6B6B | Tertiary text on light, two-tone heading continuation |
| `neutral-500` / `line-control` | #8A8A8A | Control boundaries on light |
| `neutral-400` | #A3A3A3 | Tertiary text on black |
| `neutral-300` | #D4D4D4 | Secondary text on black; `line-strong` |
| `neutral-200` / `line` | #E5E5E5 | Hairlines on light |
| `neutral-100` | #EDEDED | Segmented track, tint ground, light icon buttons |
| `mist` | #F5F5F5 | **Light ground** |
| `white` | #FFFFFF | Tiles, sheets, cards |
| `ink` | #111111 | Text on light; secondary (black) button |
| `red` | #C9221C | **Action**: primary buttons, sling, hook, rope, key highlights |
| `red-600` | #A81B16 | Primary hover |
| `red-bright` | #FF5A4F | Red text/lines on black (units, small highlights) |
| `red-50` | #FCEDEC | Error wash |
| `brand` | #23207A | **Accent on light only**: links (`plain` buttons), focus ring, light selection, tab ink, logo context, one accent tile |
| `brand-50` / `brand-100` | #F3F3F9 / #E7E7F2 | Picked compare column; secondary text on a brand tile |
| `ok` / `ok-bright` | #1C7A45 / #5FD394 | Success on light / on black |
| `line-dark` / `line-dark-strong` | white 14 % / 24 % | Hairlines on black |

**Contrast (computed; body ≥ 4.5, large ≥ 3, controls/focus ≥ 3):**

| Pair | Ratio | | Pair | Ratio |
|---|---|---|---|---|
| ink on white / mist | 18.9 / 17.3 | | white on black / neutral-900 | 19.8 / 17.9 |
| ink-2 on white / mist | 8.9 / 8.1 | | neutral-300 on black / neutral-900 | 13.4 / 12.1 |
| ink-3 on white / mist / neutral-100 | 5.3 / 4.9 / 4.6 | | neutral-400 on black / neutral-900 | 7.9 / 7.1 |
| brand on white / mist / brand-50 | 13.5 / 12.4 / 12.2 | | red-bright on black / neutral-900 | 6.4 / 5.8 |
| red on white / mist | 5.6 / 5.2 | | ok-bright on black | 10.6 |
| white on red / red-600 | 5.6 / 7.4 | | white 40 % border on black | 3.8 |
| ok on white / mist | 5.4 / 4.9 | | brand-100 on brand (accent tile) | 11.0 |
| line-control on white / mist | 3.5 / 3.2 | | white on glass-dark over white (worst) | 5.7 |
| red on black | 3.5 (fills only, never text) | | ink-2 on glass-light over black (worst) | 5.6 |
| brand on black | **1.5: never** | | focus: brand on white 13.5, white on black 19.8 | |

**Browser surfaces:** selection = brand bg + white text on light, white bg + black text on black; caret red; focus ring 2 px + offset (brand on light, white on dark); scrollbar neutral-600 on mist; `accent-color` red.

## 4. Type: Poppins + Tajawal

**Faces** (subset by `npm run fonts`, self-hosted, `font-display: swap`, metric-matched fallbacks):

| Family | Files | Role |
|---|---|---|
| **Poppins Atlas** | 400, 500, 600, 700 (+ `fill-la` for U+2191/2193, which Poppins lacks) | Latin, **every numeral** (Western digits are Latin), display and body |
| **Tajawal Atlas** | 400, 500, 700 (serves 600), 800 (+ `fill-ar` from IBM Plex Sans Arabic for U+066B-066C, U+0671, U+06F0-06F9, which Tajawal lacks) | Arabic, display and body |
| **Plex Mono Atlas** | 500 | **Model codes and machine formulas only** (GMK6350, 12x6x12). Poppins ships no `tnum`/mono figures in these files, so codes that read "as printed on the machine" keep a mono face. All other numbers are Poppins (proportional): tickers reserve the final width; tables align per cell. |

One stack for display and body: `'Poppins Atlas', 'Tajawal Atlas', 'Poppins Fallback', 'Tajawal Fallback', system-ui`. Each family is split by unicode-range, so a mixed line («الطراز GMK6350 بسعة 317.5 طن») picks the right face per character. The fill faces share the family names and load only when one of their characters is on screen. `src/font-coverage.test.tsx` fails if any rendered character falls outside the subsets; the subset script asserts each family covers its whole set.

**Bytes:** preloads AR = Tajawal 800/700/400 = **23.2 KB** (v1: Kufi + Plex AR 400 + Archivo = 96.4 KB); EN = Poppins 700/600/400 = **14.4 KB** (v1: 81.7 KB). All 11 files together are 61 KB (v1: 143 KB). Fonts are never inlined into CSS.

**Roles** (`src/components/ui/ui.css` for v2, `src/styles.css` for the v1 classes, both re-tuned; fluid 360 → 1440 px):

| Role | Class | Latin (Poppins) | Arabic (Tajawal) |
|---|---|---|---|
| Display (hero H1) | `.t-display` | 40 → 80 px, 700, lh 1.04, −0.03em | 46 → 86 px, 800, lh 1.25 |
| Headline (H2) | `.t-headline` | 32 → 52 px, 600, lh 1.1, −0.025em | 34 → 60 px, 700, lh 1.35 |
| Title (H3, tiles, sheet) | `.t-title` | 20 → 28 px, 600, lh 1.25 | 22 → 30 px, 700, lh 1.45 |
| Sub / lead | `.t-sub` | 18 → 24 px, 400, lh 1.45 | 20 → 26 px, 500, lh 1.65 |
| Body | `.t-body` | 16 → 17 px, 400, lh 1.7 | 18 → 20 px, 400, lh 1.8 |
| Small / caption | `.t-small` / `.t-caption` | 14 / 13 px | 15 / 15 px |
| Figure (stats) | `.t-figure` | 36 → 64 px, 600, −0.03em | digits are Poppins |
| Readout (tonnage) | `.t-readout` | 64 → 144 px, 700, −0.035em (Poppins is wide: was 200 px in Archivo condensed) | |
| Spec (codes) | `.t-spec` | Plex Mono 500, 14 → 16 px | Latin codes only |
| Two-tone | `.t-muted` | heading continuation in `--surface-fg-3` | same |

Rules: Tajawal draws small for its em (x-height 0.45): Arabic sizes run larger and looser than Latin; Arabic tracking 0, no caps, never justified; Latin codes in `<bdi lang="en">`; Western digits via `formatNumber`; units after U+00A0 (U+202F is in no font; the coverage test caught one in the v1 crane card); Arabic ranges «من 11 إلى 33.5 م», English "11–33.5 m".

## 5. Surfaces, grounds and rhythm

### 5.1 Surfaces (`<Section surface>`)

| Surface | Ground | Background | Use |
|---|---|---|---|
| `white` | light | #FFFFFF | About, compare, why |
| `mist` | light | #F5F5F5 | explorer, gallery (tiles sit on it) |
| `tint` | light | neutral-100 | documents |
| `dark` | dark | black | footer, flat chart ground |
| `night` | dark | black + graphite glow from the top + 4 rem load-chart grid (white 4.5 %, masked) | fleet showcase, services, request |
| `navy` | dark | brand navy | one accent tile or band per page, at most |

Every surface sets `--surface-fg/-fg-2/-fg-3/-line/-control/-raised/-sunken/-accent/-danger/-ok`; primitives read them, so one component works on every ground. `--surface-accent` is brand navy on light and **white on dark**. `data-ground` drives focus ring, caret and selection.

### 5.2 Glass
Only where content moves underneath: header after the hero, request bar, captions/controls over photographs, sheet backdrop. `glass-dark` = black 62 % + blur 20 px + saturate 1.5; `glass-light` = white 80 % + blur 20 px + saturate 1.6; solid fallback without `backdrop-filter` and with `prefers-reduced-transparency`.

### 5.3 Rhythm (target order)
Hero (photo + black band) → **About** (white) → **Fleet showcase** (night) → **Find your crane** (mist) + **Compare** (white) → **Services** (night) → **Why Atlas** (white) → **On site** (mist) → Documents (tint, hidden until data) → **Request** (night) → Footer (black).

## 6. Spacing, grid, radii, elevation

- **Spacing:** 4 px base. `--space-section` 80 → 144 px (Apple 112/144; v1 `.section-y` now uses it), `--space-head` 40 → 64 px, `--space-gap` 12 → 20 px, `--space-tile` 24 → 40 px.
- **Grid:** `.shell` 90 rem, `.shell-narrow` 64 rem, `.shell-wide` 100 rem; 12 columns from 64 rem; bento grids are container-queried (1 → 2 at 40 rem → 6 tracks at 60 rem); carousels bleed while the first slide aligns with the shell.
- **Radii (concentric):** `rounded-xs` 6 · `sm` 10 · `md` 14 (inputs) · `lg` 20 (cards, table, captions) · `xl` 20 → 28 (tiles, photo frames; Apple 28) · `2xl` 24 → 36 (sheets, stage) · `full` (buttons, chips, segmented, icon buttons).
- **Elevation (neutral black, offset + soft blur):** `shadow-e1` resting · `e2` hover/raised · `e3` floating control/popover · `e4` sheet · `shadow-bar`. Dark grounds use neutral-900 fills instead of shadows.

## 7. Imagery
Only Atlas's photos, never flipped. Photos live in `.frame` (rounded xl, overflow clip). Text over a photo sits on a glass or solid band over the machine or ground, never over sky, never on a gradient scrim over sky. Crane → photos (copy deck §6; first = lead): RT700E 6363 6364 6359 6360 · ATF 60-3 6397 6395 6396 · AC200-1 6376 6375 6374 6379 · QUY250 6380 6385 6382 · GMK6350 6392 6389 6388 6393.

## 8. Components (`@/components/ui`)

Labels come from `copy.ui` (prev, next, pause, play, close, carousel, slide, slideOf, scrollTable, details, notStated, specification); spec labels from `copy.specs`.

| Component | What it is | Keyboard / a11y | Motion (§9) |
|---|---|---|---|
| **Button** (`@/components/Button`) | Pill; `primary` (red), `secondary` (black), `inverse` (white on dark), `ghost-light`, `ghost-dark`, `glass` (over photos), `plain` (accent text + arrow). Sizes lg 52/56, md 48, sm 44. v1 names alias v2 looks. `magnetic` for primary CTAs | native button/link; busy = `aria-busy` + stacked label; never two primaries side by side | colour 200 ms ease-ui; press scale .98 / 120 ms; magnetic ≤ 6 px (desktop); `.ui-nudge` arrow 3 px |
| **Section / SectionHeader** | Surface shell; heading first (no eyebrow slot), two-tone continuation, `t-sub` lead, actions | landmark via `aria-labelledby` | header may take `rise` |
| **Card / CardLink** | One thing (crane, document, step); tones raised/outline/sunken/plain; full-bleed `media`; never nested | stretched primary link; inner controls `relative z-10` | `interactive`: lift 2 px + e2, 320 ms ease-ui; `.ui-zoom` on media |
| **BentoGrid / BentoTile** | Container-query grid, spans third/half/half-wide/two-thirds/full, `rows={2}`; tones raised/tile/night/navy/photo | DOM order = reading order | `stagger` on the grid; `.ui-zoom` on photo tiles |
| **SegmentedControl** | Pill track, sliding white thumb, native radios | arrows/announcements from the platform; works without JS; keeps the checked option in view (track only) | thumb 320 ms ease-ui; first paint never animates |
| **Tabs** | APG tabs, automatic activation, roving tabindex, Home/End, ArrowLeft = next in Arabic, sliding ink | no JS: list hides, all panels show | ink 320 ms ease-ui |
| **Sheet** + `sheetTrigger(id)` | `<dialog>` bottom sheet (phones) / inline-end side sheet (≥ 48 rem; left in Arabic); invoker commands + click fallback; `closedby="any"`, backdrop click, Esc | focus trap/return from the platform; Lenis stops; page locks | in 480 ms ease-set (`@starting-style`), backdrop fade; reduced = instant |
| **SpecList / CompareTable** | `<dl>` rows; real `<table>` with caption, scope, sticky header and first column inside a focusable labelled region; empty cell "—" + sr "Not stated"; `highlight` column (brand-50) | region scrolls with arrows | `fade` reveal; picked column tint 200 ms |
| **Carousel** | scroll-snap `<ul>`, slides "i of n", paddles page by whole slides, `aria-disabled` at the ends, RTL-aware | track is a focusable region | native smooth scroll (none when reduced); first slides `stagger` |
| **Marquee** | Real facts only; **moves only while scrolling** (CSS `animation-timeline: view()`, no loop, no JS) | duplicate copy `aria-hidden` + `inert`; static wrapped list without support or with reduced motion | 25 % of one copy across the strip's pass |
| **Stat** | Fact + unit + label (+ DraftBadge); digits `aria-hidden`, sr-only final value; reserves its final width | | `data-ticker`: counts once on entry, 1.2 s expo-out |
| **StickyStory** | Steps scroll past a sticky media stage (≥ 64 rem); inline media on phones and without JS | ordered list, labelled; stage `aria-hidden` | active step: media crossfade 480 ms ease-swap + settle 1.04 → 1 over 800 ms ease-set; inactive steps at 35 % |
| **useFlip(ref, key)** | FLIP for filtered/reordered lists (`data-flip-id`) via the Web Animations API (no GSAP in the main bundle) | DOM order follows the data | moves 480 ms ease-set; entering items fade-rise 12 px; reduced = instant |
| **Chip / ToggleChip** | Static tag / filter toggle (`aria-pressed`, 44 px) | group with `role="group"` + label | colour 200 ms |
| **Field / fieldClass** | Label, tag, hint, control, error; describedby + invalid wiring; 52 px controls, borders ≥ 3:1 | form owns the live region | border/focus 200 ms |
| **IconButton** | Round 44 px; light/dark/glass/outline | label required (sr-only) | press scale .95 |
| **Reveal helpers** | `reveal(kind)`, `<Reveal>`, `magnetic`, `parallax` | content visible without JS | §9.2 |
| **Micro-interaction classes** | `.ui-zoom` (photo 1.035 on hover/focus), `.ui-nudge` (arrow 3 px), `.ui-underline` (underline draws from the reading start) | hover = fine pointers only | 200–800 ms; none when reduced |
| **DraftBadge** (v1) | Red/white chevron tag on every unverified value; spec blocks add "Manufacturer specification" + `copy.specs.disclaimer` | | none |

## 9. Motion system

Built per `.claude/skills/impeccable/reference/animate.md`: one focal moment per chapter, every other animation explains feedback, state or relationship; exponential ease-out from an already-visible default; exits faster than entrances; a reduced-motion answer for everything; expensive effects bounded to small regions. GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, Flip) + Lenis live in the lazy `core` chunk; three `gsap.matchMedia` contexts (D-notes); the shared hooks are `src/motion/reveals.ts`; CSS handles state transitions.

### 9.1 Tokens

| Token | Value | GSAP | Use |
|---|---|---|---|
| `--dur-press` | 120 ms | | press scale |
| `--dur-state` | 200 ms | | hover, colour, chip state, underline |
| `--dur-ui` | 320 ms | | thumb, tab ink, card lift (Apple measured 0.32 s) |
| `--dur-layout` | 480 ms | | sheet, FLIP, story crossfade |
| `--dur-focal` | 800 ms | 0.8–0.9 s | entrances, mask reveals, story settle |
| `--stagger` | 40 ms | 0.04 | list items, capped at 8 (Apple 20 ms) |
| `ease-set` | cubic-bezier(.16,1,.3,1) | `expo.out` | every entrance, FLIP, settle |
| `ease-ui` | cubic-bezier(.25,1,.5,1) | `power3.out` | state changes (Stripe measured) |
| `ease-swap` | cubic-bezier(.65,0,.35,1) | `power2.inOut` | crossfades, scrubbed swaps |
| `ease-exit` | cubic-bezier(.5,0,.75,0) | `power3.in` | exits ≈ 0.66 × entrance |

### 9.2 Patterns

| Pattern | How | Timing | Reduced motion | No JS |
|---|---|---|---|---|
| Entry reveal `rise` | `data-reveal="rise"`: from 28 px + opacity 0 (touch 16 px), only if below the fold | 900 ms expo-out (touch 600) | final state | visible |
| Entry reveal `mask` (the "hoist") | frame opens bottom-up with clip-path; image settles 1.06 → 1 | 1.0 s / 1.25 s expo-out | final | visible |
| Entry reveal `stagger` | children rise 40 ms apart, cap 8 | 900 ms each | final | visible |
| Entry reveal `fade` | opacity only (tables, forms) | 900 ms | final | visible |
| Number ticker | `data-ticker` (Stat `from`) | 1.2 s expo-out, once | final value | final value |
| Scroll-linked media | `data-parallax`: media 1.08 → 1 scrubbed across its pass (desktop) | scrub 0.6 | none | static |
| Scroll-driven strip | Marquee: CSS `animation-timeline: view()` | whole pass | static list | moves (CSS) |
| Sticky storytelling (light) | StickyStory: IO-driven active step, sticky stage | 480/800 ms | instant swap | inline |
| Sticky storytelling (pinned) | Fleet showcase only: GSAP pin + scrub + snap, mask swaps, readout ticks | ~55 vh per crane, scrub 0.6 | static list | static list |
| FLIP reflow | `useFlip` (WAAPI) or GSAP Flip inside core | 480 ms ease-set | instant | instant |
| Sheet | `@starting-style` + transitions | 480 ms in, backdrop fade | instant | invoker opens it where supported |
| Hover / press | Button, Card, `.ui-zoom`, `.ui-nudge`, `.ui-underline` | 120–800 ms | colour only | n/a |
| Magnetic | `data-magnetic`, primary CTAs, desktop fine pointer | quickTo 0.5 s, ≤ 6 px | none | none |
| Section transitions | the ground changes at chapter edges; the next section's heading block rises; the night grid fades in with its section (no page-wide wipes) | 800 ms | none | none |

### 9.3 Per context

| | desktop (≥ 64 rem, fine pointer) | touch | reduced |
|---|---|---|---|
| Smooth scroll | Lenis (lerp .085) | native | native |
| Pin | fleet showcase only | none (snap carousel) | none |
| Scrub | showcase, parallax (≤ 1 per section), progress rope | none | none |
| Reveals / tickers | yes | yes, shorter | final state |
| Magnetic, hover zoom/nudge | yes | no | no |
| CSS state transitions | yes | yes | `transition: none` |
| WebGL depth (§9.6) | optional, lazy | never | never |

### 9.4 Per section (authored moments)

| Section | Focal moment | Supporting motion |
|---|---|---|
| Header | none | condenses 64 → 56 px after the hero (320 ms); nav ink follows the section in view |
| Hero (separate agent) | intro: photo settles 1.05 → 1, H1 lines rise (masked), sling draws, button settles with one damped swing; dock into the bar (kept) | magnetic WhatsApp (desktop); optional WebGL depth (§9.6) |
| About | photo `mask` reveal | two-tone headline `rise`; chips `stagger` |
| Fleet showcase | pinned stage: each crane hoisted by mask, readout ticks from the previous capacity, chapter chips track progress | progress rope; touch: snap carousel, readouts tick once |
| Find your crane | segmented thumb slides, photo `mask` swaps, Stat ticks to the new capacity, "Request this crane" rides the hook into the bar | type filters reflow with FLIP; sheet slides in; compare column tint follows the pick |
| Services | bento `stagger` | `.ui-zoom` on the photo tile; `plain` links nudge |
| Why Atlas | range ruler ticks draw (DrawSVG) and the two Stats tick | steps `stagger`; StickyStory for the request steps on desktop |
| On site | first slides `stagger` | carousel snap; gallery switch crossfades; lightbox opens from the tapped frame |
| Request | the chosen crane already sits on the hook chip | fields `fade`; submit busy strip; success state rises |
| Footer | v1 outrigger pad + hoist back-to-top | none |
| Request bar | dock and ride (kept) | glass appears after the hero |

### 9.5 Impeccable process for motion
Every section rebuild ships with: the motion thesis (focal moment, continuity, feedback, budget, per `animate.md`), a check against `craft-floor.md`, `npx impeccable detect` on the rendered section at 1440 and 390 in both languages, and an Impeccable critique. Results for the foundation are in §17.

### 9.6 WebGL depth (lusion.co reference): rules
Allowed only as an enhancement of a photograph that is already on screen (pointer-reactive depth/parallax on the hero or showcase media, a subtle displacement on hover), never as content and never as the LCP element.
- **Desktop + fine pointer + motion allowed only**; touch and reduced motion keep the static photo.
- **Lazy:** a separate chunk loaded after first paint and idle (`requestIdleCallback`), only when the target is near; no WebGL code in the main bundle (main JS stays ≤ 110 KB gz; the chunk has its own budget ≤ 60 KB gz, no three.js-sized dependency without the user's approval).
- **Static fallback first:** the `<img>` renders and stays in the DOM; the canvas sits on top with `aria-hidden` and fades in only after its first frame; WebGL context loss or a slow first frame (> 200 ms) removes the canvas.
- Pauses when offscreen or the tab is hidden; caps devicePixelRatio at 2; no custom cursor unless it explains something (e.g. a "drag" hint on the pinned stage), and never replacing the system cursor.
- Section transitions stay CSS/GSAP (ground changes, rises); no page-wide WebGL transitions on a one-page site.

## 10. Section map (summary; rationale in `docs/research/v2-references.md` §4)

| Section | Surface | v2 components |
|---|---|---|
| Header | glass-light over light, glass-dark over dark | pill nav with section ink, `primary sm` Request, language pill; menu = full-height dialog |
| Hero (separate agent) | photo + black band | `t-display` two-tone H1, sling `primary`, `glass` secondary; optional WebGL depth (§9.6) |
| About Atlas [new] | white | SectionHeader (two-tone: name + positioning line), 4 service Chips, legal name small print, framed photo 6398 or StickyStory |
| Fleet showcase (Hoist) | night | pinned rounded stage, chapter chips, `t-readout` + ticker, glass caption; touch: Carousel |
| Find your crane | mist | SegmentedControl + type ToggleChips (useFlip), photo frame + glass caption, Card with Stat + Tabs, Sheet |
| Compare | white | CompareTable from `sharedFields()` |
| Services [bento] | night | BentoGrid: crane hire photo two-thirds×2, transport tile, handling raised, oil services navy accent tile |
| Why Atlas [new, truthful] | white | capacity-range instrument (ruler + Stats, draft), crane types + chips, four services, response channels (configured only), process steps (StickyStory on desktop) |
| On site | mist | SegmentedControl (Building/Coastal) + bleeding Carousel + captions; Lightbox restyled |
| Documents | tint | Card rows; hidden until data |
| Request form | night | two-tone heading, Field primitives on neutral-900 card, crane ToggleChips/select, `primary` submit |
| Footer | black | positioning line at headline size, columns, glass back-to-top, chevron pad |
| Request bar | glass-dark pill | WhatsApp `primary md`, Call `ghost-dark md`, on-hook Chip + close IconButton |

## 11. Product details: explorer, detail sheet, compare

Data: `visibleCranes` (card capacities; GMK6350 = 317.5 t metric) + `craneSpecs` through `specRows(spec, copy, lang, fields?)` / `sharedFields()`.
1. `SectionHeader title={copy.grid.title} continuation="55 t to 317.5 t"` (from data) `lead={copy.grid.availability}`.
2. SegmentedControl of model codes (`<span lang="en" dir="ltr">`) + type ToggleChips (empty state from v1); results reflow with `useFlip`.
3. Stage: photo `.frame` (7 cols) with glass caption (make + model `t-spec`, type Chip); raised Card (5) with Stat (capacity, DraftBadge), Tabs Overview / Specification (heading + DraftBadge + first 6 rows) / Photos (mini Carousel); `primary` Request this crane (hook store + ride) + `ghost-light` Details (`sheetTrigger`).
4. Sheet: make + model, lead photo, explainer, "Manufacturer specification" + DraftBadge + disclaimer, full SpecList, sources (hostname + official/secondary), sticky `primary` request. The English research `notes` never render on the Arabic page.
5. CompareTable with every visible crane (picked column highlighted).
6. No JS: one stage panel per crane with `data-inactive` on the others (Tabs pattern) so all show; the compare table holds every fact.
7. Truth: never present manufacturer figures as Atlas's; omit missing fields; `country` is out of the default rows. Open: QUY250 250 t (card) vs 260 t (Fuwa data, read from a search excerpt).

## 12. Migration and cleanup

- v1 tokens are remapped (§3), so unmigrated sections already read black/white/red. v1 type classes `.t-h1/.t-h2/.t-h3/.t-lead/.t-label/.t-readout` are re-tuned for Poppins/Tajawal; new code uses `.t-display/.t-headline/.t-title/.t-sub/.t-figure`.
- Buttons: v1 variant names render v2 pills; switch to v2 names when touching a section.
- `App.test.tsx` asserts the v2 floor (shadows from the elevation scale; reveals use the vocabulary, never in `#top`).
- **Delete after all sections merge** (cleanup pass): token aliases `navy`, `navy-700`, `navy-900`, `navy-800`, `navy-950`, `concrete`, `steel`; v1 classes `.t-h1 .t-h2 .t-h3 .t-lead .t-label` (keep `.t-body .t-small .t-spec .t-readout` if still used), `.section-y`, `.measure`; the `bg-concrete`/`bg-navy*` entries in the ground selectors; the `rounded-none` field class in `RequestForm`; `.progress-rope` and service-sling CSS if the new sections drop them; `CHEVRON_STRIPES` inline style (the class stays for DraftBadge and loading); the Button alias names; v1 LoadTag/Hoist square tag styles if the showcase replaces them.

## 13. Accessibility
WCAG 2.2 AA as v1 §8, plus the patterns in §8 (keyboard, focus, roles, labels); 44 px targets; focus ring visible on white (brand 13.5:1) and black (white 19.8:1); motion never required to read content; no autoplay loops; glass with solid fallbacks; scrollable regions focusable and labelled; no fact only inside a closed dialog.

## 14. Performance
Initial JS 101.8 KB gz (budget 110; primitives are tree-shaken until sections import them, so each section must keep the total ≤ 110). CSS 14.8 KB gz (budget 25). Fonts: AR preloads 23.2 KB, EN 14.4 KB. Motion stays in the lazy core chunk; WebGL (if any) in its own lazy chunk (§9.6). Blur limited to small fixed surfaces.

## 15. Open decisions for the user
1. Show the full manufacturer specification (labelled, draft-badged) in staging now; production stays gated.
2. QUY250 capacity: 250 t (model/copy) vs 260 t (Fuwa data, unverified source).
3. New copy for About and Why Atlas (drafted from existing facts only; needs Atlas's approval).
4. Why Atlas in staging with derived, draft-badged instruments (the copy deck holds the block until three points are confirmed).
5. WebGL depth on the hero/showcase (§9.6): worth the chunk, or keep CSS/GSAP only?
6. Removing the unused `@fontsource-variable/archivo` and `@fontsource-variable/noto-kufi-arabic` packages needs an `npm uninstall` in the main checkout (node_modules is shared); `ibm-plex-sans-arabic` and `ibm-plex-mono` stay (fill faces, codes).

## 16. Impeccable floor v2 (replaces v1 §15)

Checked against `.claude/skills/impeccable/reference/craft-floor.md`, `animate.md`, `layout.md`, `typeset.md`, `colorize.md`. **Ban** = cannot be overruled.
1. **No eyebrow or kicker above any heading** (ban). `SectionHeader` has no slot; deck "Eyebrow" strings become leads or two-tone continuations.
2. **No section numbers.** Process steps may be numbered (the order is the information).
3. **Mono only for codes** (model codes, drive formulas).
4. **Motion budget:** one authored moment per chapter (§9.4) + at most one reveal pattern per section; never a reveal on every heading; never on the hero, header or request bar; from-states only below the fold; reduced = final; no-JS = visible.
5. **Browser surfaces themed** (§3).
6. **Depth** only from `shadow-e1…e4`/`shadow-bar`: offset + soft blur; no halos, hard offsets or coloured glows.
7. **Radius** from the scale, concentric; photos always in `.frame`.
8. **Glass** only where content moves underneath, with a solid fallback.
9. **Gradients:** the night glow and the tile ramp only; never gradient text; never a gradient over sky behind text.
10. **Icons:** authored SVG only.
11. **States:** hover, focus, active, disabled, loading, error, empty, success on every control.
12. **Display ≤ 6 rem** (t-display max 5.375 rem); the tonnage readout is the one exception (≤ 9 rem).
13. **Cards and bento:** no grid of identical icon+heading+text cards; tiles in one grid differ in content type; cards never nest.
14. **No hero-metric template.** Numbers live in instruments beside what they measure.
15. **No autoplay loops.** The Marquee moves only with scroll; one per page; real data only.
16. **Cursor:** magnetic pull only on primary CTAs (≤ 6 px, desktop); no cursor followers; a custom cursor only if it explains an interaction (§9.6).
17. **Truth floor:** DraftBadge on every unverified value; "manufacturer specification" label; HIDDEN UNTIL DATA not rendered; missing fields omitted; nothing invented.
18. **Colour discipline:** black/white grounds; red only for action and the hook (rare); brand navy only as a small accent on light grounds; no grey text on coloured grounds (tint from the hue).
19. **Arabic:** composed RTL; tracking 0; no caps tricks; Latin codes in `<bdi>`; Western digits.
20. **Every section rebuild passes** an Impeccable critique and `npx impeccable detect` (rendered, 1440 + 390, AR + EN) before merge.

## 17. Impeccable record for the foundation (5 Nov 2026)

| Command | Result |
|---|---|
| `npx impeccable detect src/components/ui src/kitchen src/styles.css src/fonts.css` | exit 0, no findings (regex rules; element rules need a page) |
| `npx impeccable detect http://localhost:4220/?v2=kitchen --viewport 1440x900` and `390x844`, same for `/en/?v2=kitchen` | **0 anti-patterns** at both sizes in both languages. Advisory: `repeating-stripes-gradient` (the red/white chevron of the DraftBadge and loading strip, a brand motif kept by decision) |
| `npx impeccable detect http://localhost:4220/` and `/en/` (v1 sections on v2 tokens) | 0 anti-patterns; same chevron advisory |

Fixed on the way: `marquee` (the first Marquee was an infinite CSS loop with a pause button; it is now scroll-driven, no loop) and `gray-on-color` (neutral secondary text on the brand-navy tile; brand tiles now tint secondary text from navy). The design hook and the full `/impeccable critique` run on each section rebuild (§16.20).
