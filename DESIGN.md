---
name: Atlas Alshraa v2
description: "Yard and Chart": a crane lineup presented like a product lineup, in black and white, with a little navy and red.
colors:
  black: "#0A0A0A"
  neutral-900: "#171717"
  neutral-800: "#262626"
  ink: "#111111"
  ink-2: "#4A4A4A"
  ink-3: "#6B6B6B"
  line-control: "#8A8A8A"
  neutral-400: "#A3A3A3"
  neutral-300: "#D4D4D4"
  line: "#E5E5E5"
  neutral-100: "#EDEDED"
  mist: "#F5F5F5"
  white: "#FFFFFF"
  red: "#C9221C"
  red-600: "#A81B16"
  red-bright: "#FF5A4F"
  red-50: "#FCEDEC"
  brand: "#23207A"
  brand-900: "#1A1866"
  brand-950: "#100E3D"
  brand-300: "#A5A3F5"
  brand-200: "#C4C3E3"
  brand-100: "#E7E7F2"
  brand-50: "#F3F3F9"
  ok: "#1C7A45"
  ok-bright: "#5FD394"
typography:
  display:
    fontFamily: "Poppins Atlas, Tajawal Atlas, Poppins Fallback, Tajawal Fallback, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Poppins Atlas, Tajawal Atlas, Poppins Fallback, Tajawal Fallback, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Poppins Atlas, Tajawal Atlas, Poppins Fallback, Tajawal Fallback, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Poppins Atlas, Tajawal Atlas, Poppins Fallback, Tajawal Fallback, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.1vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.7
  label-code:
    fontFamily: "Plex Mono Atlas, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 500
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "20px to 28px"
  2xl: "24px to 36px"
  full: "9999px"
spacing:
  gap: "12px to 20px"
  tile: "24px to 40px"
  head: "40px to 64px"
  section: "80px to 144px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    height: "52px"
    padding: "0 28px"
  button-primary-hover:
    backgroundColor: "{colors.red-600}"
  button-secondary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    height: "52px"
  button-inverse:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: "52px"
  card-raised:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  card-on-dark:
    backgroundColor: "{colors.neutral-900}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "52px"
---

# Design System: Atlas Alshraa v2

This file is the short version. **The full specification, with every measured value, the contrast table and the reasoning, is [`docs/superpowers/specs/2026-11-05-atlas-v2-design.md`](docs/superpowers/specs/2026-11-05-atlas-v2-design.md)** (section numbers below point into it). The tokens live in `src/styles.css` (`@theme static`; Tailwind's default palette is cleared, so only the tokens above exist) and `src/components/ui/ui.css`. Product context: [`PRODUCT.md`](PRODUCT.md).

## Overview

**Creative North Star: "Yard and Chart."** Atlas is presented the way Apple presents a product lineup, but the lineup is cranes from 55 t to 317.5 t, read the way a lift planner reads a load chart (§2).

- **Yard** (white, mist): where machines are *looked at*. Big rounded photo frames, white tiles with soft elevation, large display type. The only strong colour here is the yellow of the cranes, and it comes from the photographs.
- **Chart** (black, night, brand): where numbers are *read* and requests are *made*. A navy glow over black, a faint load-chart grid, white numbers, light-navy accents, red actions.

Principles (from `PRODUCT.md`): prove the range, don't just claim it; one tap to ask; Arabic composed, not mirrored; truth over polish; fast on Libyan mobile networks. The user's brief for v2 was "white and black, and a little of the red and the blue", and "remove all the old look".

## Colors

Roughly **80 % black and white grounds, 10 to 15 % brand navy, about 5 % red** (§3, §16.18). Names are roles, not hues.

| Role | Tokens | Rule |
|---|---|---|
| Dark ground | `black` #0A0A0A, raised `neutral-900` #171717 | Chart sections, footer, request bar. On black, depth comes from `neutral-900` fills, not shadows. |
| Light ground | `mist` #F5F5F5, `white`, `neutral-100` tint | Yard sections. Tiles are white on mist. |
| Text | `ink` #111 / `ink-2` #4A4A4A / `ink-3` #6B6B6B on light; white / `neutral-300` / `neutral-400` on black | Body never lighter than `ink-3`. |
| **Action** | `red` #C9221C (hover `red-600`) | Primary buttons, the sling, hook and rope, key highlights. Fills only on black (3.5:1), `red-bright` #FF5A4F for red text on black. Never decorative. |
| **Secondary accent** | `brand` #23207A on light, **`brand-300` #A5A3F5 on dark** | Links, focus ring on light, selected segment/tab/chip, step numbers, icons, `.t-tag` data labels, Stat units, one `brand` section per page. Navy on black is 1.5:1: never. |
| Brand ground | `brand` to `brand-950` gradient (`--grad-brand`) | One signature section per page (Why Atlas). Never the hero, never behind a photo's sky. Secondary text tinted from navy (`brand-100`, `brand-200`), never grey. |
| Status | `ok` / `ok-bright`, `red-50` wash | Success and error states only. |

No yellow in the UI (the cranes supply it). No grey text on coloured grounds. Every foreground/background pair is listed with its contrast ratio in §3; body text is at least 4.5:1, large text and controls at least 3:1.

## Typography

**Poppins** (Latin and every numeral) and **Tajawal** (Arabic), self-hosted subsets, one stack for display and body. **IBM Plex Mono** only for model codes and machine formulas (GMK6350, 12x6x12) (§4).

| Role | Class | Notes |
|---|---|---|
| Display | `.t-display` | Hero H1. Latin 40 to 80 px / 700; Arabic 46 to 86 px / 800, line-height 1.25. Never above 5.375 rem. |
| Headline | `.t-headline` | H2. Latin 32 to 52 px / 600; Arabic 34 to 60 px / 700. |
| Title | `.t-title` | H3, tiles, sheet. |
| Lead, body, small | `.t-sub`, `.t-body`, `.t-small` / `.t-caption` | Body 16 to 17 px Latin, 18 to 20 px Arabic. |
| Figure, readout | `.t-figure`, `.t-readout` | Stats; the tonnage readout is the one thing allowed up to 9 rem. |
| Code | `.t-spec` | Plex Mono. |
| Two-tone | `.t-muted` | A heading's continuation in the third text tone. |

Arabic rules: Tajawal draws small for its size, so Arabic is set larger and looser than Latin; tracking 0; no caps tricks; never justified; Latin codes inside `<bdi lang="en">`; **Western digits** (as on manufacturer load charts); units after U+00A0. A test (`src/font-coverage.test.tsx`) fails if any character falls outside the subset fonts.

## Layout

- **Spacing:** 4 px base; fluid tokens `--space-section` (80 to 144 px), `--space-head`, `--space-gap`, `--space-tile` (§6).
- **Grid:** `.shell` 90 rem, `.shell-narrow` 64 rem, `.shell-wide` 100 rem; 12 columns from 64 rem. Bento grids are container-queried (1 column, then 2 at 40 rem, 6 tracks at 60 rem). Carousels bleed to the edge while the first slide aligns with the shell.
- **Surfaces** (`<Section surface>`): `white`, `mist`, `tint`, `dark`, `night` (black + navy glow from the top + a 4 rem load-chart grid), `brand`, `navy` (§5.1). Every surface sets the `--surface-*` variables (`-fg`, `-fg-2`, `-fg-3`, `-line`, `-control`, `-raised`, `-sunken`, `-accent`, `-on-accent`, `-danger`, `-ok`), so one component works on every ground.
- **Rhythm:** Hero, About (white), Fleet showcase (night), Find your crane (mist) and Compare (white), Services (night), Why Atlas (brand), On site (mist), Documents (tint, hidden until data), Request (night), Footer (black) (§5.3).
- **Arabic:** composed right to left, not mirrored. Photos are never flipped.
- **Touch:** tap targets at least 44 px; one primary button per view.

## Elevation & Depth

Four neutral steps, offset plus soft blur, black only: `shadow-e1` resting, `e2` hover/raised, `e3` floating control, `e4` sheet, plus `shadow-bar` for the request bar (§6). No halos, hard offsets or coloured glows. Dark grounds use `neutral-900` fills instead of shadows.

**Glass** (blur 20 px) only where content moves underneath: the header after the hero, the request bar, captions and controls over photographs, the sheet backdrop. It has a solid fallback without `backdrop-filter` and under `prefers-reduced-transparency` (§5.2).

## Shapes

Concentric radii: `xs` 6, `sm` 10, `md` 14 (inputs), `lg` 20 (cards, table), `xl` 20 to 28 (tiles and photo frames), `2xl` 24 to 36 (sheets, stage), `full` for buttons, chips, segmented controls and icon buttons. Photos always sit in a `.frame` (rounded `xl`, overflow clipped). Icons are authored SVG only.

## Components

All primitives are in `src/components/ui/` (plus `Button`, `DraftBadge`, `Picture`, `Lightbox` in `src/components/`). The table of keyboard, accessibility and motion behaviour for each is §8 of the spec. Summary:

- **Button:** pill; `primary` (red), `secondary` (black), `inverse` (white on dark), `ghost-light`, `ghost-dark`, `glass` (over photos), `plain` (accent text with an arrow). Sizes 56/52, 48, 44 px. `magnetic` for primary CTAs only.
- **Section / SectionHeader:** surface shell; heading first, two-tone continuation, lead, actions. **No eyebrow slot.**
- **Card / CardLink:** one thing per card; tones raised, outline, sunken, plain; never nested.
- **BentoGrid / BentoTile:** container-query grid; tiles in one grid differ in content type.
- **SegmentedControl, Tabs, Chip / ToggleChip:** selected state in the accent (navy thumb with white label; `brand-300` with black label on dark).
- **Sheet:** native `<dialog>`; bottom sheet on phones, side sheet from 48 rem (left in Arabic).
- **SpecList / CompareTable:** real `<dl>` and `<table>`; empty cell shows "—" with a screen-reader "Not stated".
- **Carousel, Marquee, StickyStory, Stat:** snap carousel with RTL-aware paddles; a strip that moves only while scrolling (no loop); sticky story with an inline fallback; a fact with a counting number.
- **Field, IconButton:** 52 px controls with borders at least 3:1; 44 px round icon buttons with a required label.
- **DraftBadge:** red/white chevron tag on every unverified value. Staging only.

Every control has hover, focus, active, disabled, loading, error, empty and success states (§16.11). Interactive previews of all of them: run `npm run dev` and open `/?v2=kitchen` (dev only; the kitchen is not in the production build).

## Motion

One authored moment per chapter, every other animation explains feedback, state or relationship (§9). Exponential ease-out entrances, exits about a third faster.

- **Durations:** press 120 ms, state 200, ui 320, layout 480, focal 800 to 900; stagger 40 ms, capped at 8.
- **Easings:** `ease-set` (entrances, FLIP, settle), `ease-ui` (state changes), `ease-swap` (crossfades), `ease-exit`.
- **Reveal patterns:** `rise`, `mask` (the "hoist"), `stagger`, `fade`, via `data-reveal`; tickers via `data-ticker`. From-states only below the fold. Never on the hero, header or request bar.
- **Three modes:** desktop (smooth scroll, one pinned section, scrubbed parallax, magnetic CTAs, optional WebGL), touch (native scroll, shorter reveals, snap carousel), reduced (final state of everything, no motion library downloaded). No JavaScript: all content visible.
- **WebGL:** an enhancement of a photo already on screen; desktop, fine pointer, motion allowed only; lazy chunk; removed if slow or lost; never the LCP element (§9.6).

## Do's and Don'ts

The **Impeccable floor v2** (spec §16; a ban cannot be overruled). Every section passes an Impeccable critique and `npx impeccable detect` (rendered at 1440 and 390 px, Arabic and English) before it merges.

**Do**
- Use only Atlas's real photos, in `.frame`, never flipped. Put text over a photo on a glass or solid band, never over sky.
- Show the DraftBadge on every unverified value and label specs "Manufacturer specification"; leave missing fields out.
- Take depth only from `shadow-e1` to `e4` and `shadow-bar`; radius only from the scale.
- Give every reduced-motion visitor the final state, and every no-JavaScript visitor the full content.
- Use `brand-300`, not `brand`, for the accent on dark grounds.
- Keep the display size at 6 rem or less (the tonnage readout is the one exception, 9 rem).

**Don't**
- **No eyebrow or kicker above any heading** (ban). No section numbers (process steps may be numbered).
- No monospace outside model codes; no gradient text; no gradient over sky behind text; only the night glow and the tile ramp are gradients.
- No hero-metric template (big number with small label in a row); numbers live in instruments beside what they measure.
- No grid of identical icon-plus-heading-plus-text cards; no nested cards.
- No autoplay loops. The Marquee moves only with scroll, one per page, real data only.
- No cursor followers; magnetic pull only on primary CTAs, 6 px at most.
- No navy text on dark; no grey text on coloured grounds; no yellow in the UI; red is for action and the hook only.
- Never invent a fact, number, client, year, certification or testimonial.
