# Atlas Alshraa Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved "On the Hook" one-page website for Atlas Alshraa. It is Arabic-first (RTL, at `/`), with English at `/en/`. The site is static and fast (≤ 1 MB first load, LCP ≤ 2.0 s), and a truth gate stops any unverified fact from reaching production.

**Architecture:**
- **Build:** Vite 8 + React 19 + TypeScript + Tailwind 4. There are two HTML entries, and each page is **prerendered to static HTML at build time** and then hydrated.
- **Content:** lives in typed data files (`src/content/*`). Components read it through a `useLang()` context. The site works fully with no motion.
- **Motion:** GSAP + Lenis are added afterwards by one isolated module (`src/motion/*`). It finds its targets through data attributes and never edits React-owned DOM.
- **Pipelines:** build-time scripts produce the images (sharp) and fonts (HarfBuzz subsetting).

**Tech stack:** Vite 8.3 · React 19.3 · TypeScript 7 · Tailwind CSS 4.3 · GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, Flip) · Lenis 1.3 · Vitest 5 · sharp · subset-font · puppeteer-core + axe-core · Lighthouse 13.

**Spec:** `docs/superpowers/specs/2026-11-04-atlas-website-design.md`. Read it first. Supporting docs are in `docs/` (copy deck `03`, crops `asset-crops.json`, typography `05`).

**Working directory for every command:** `/Users/montheribrahim/Downloads/atlas-website`. The original photos are in the parent folder `/Users/montheribrahim/Downloads/IMG_63*.JPG`. **Never modify them.**

---

## Schedule (10 working days)

| Day | Part |
|---|---|
| 1 | **A1** Foundation: scaffold, tokens, fonts, env |
| 2 | **B** Content, data and core library (TDD) |
| 2–3 | **A2** Truth gate, image pipeline, `<Picture>` |
| 3–5 | **C** Sections and components, static and fully working |
| 5 | **Gate I1** Impeccable critique + audit + detector on the static site |
| 6–8 | **D** Motion: the hook system, the Hoist, docking, reveals (plus stretch: lift sketch) |
| 8 | **Gate I2** Impeccable polish / harden / adapt / optimize + detector |
| 9 | **E** Prerender, SEO, QA script, Lighthouse |
| 10 | **E** Handover docs, PDF exports, final verification |

Execute the parts in this order: **A1 → B → A2 → C → I1 → D → I2 → E**. The task IDs are prefixed by part (A1.1, B.3, I1.2, …).

**Design quality tool:** Impeccable (`npx impeccable …`). The detector CLI needs no install. The `/impeccable` commands need the project install in Task I1.1, which requires the user's go-ahead.

---

## Global rules (every task)

1. **SSR-safe code.** No access to `window`, `document`, `localStorage` or `matchMedia` at module top level or during render. Use them only inside effects, event handlers or functions those call. The pages are prerendered in Node.
2. **Content is visible without JS and without motion.** Motion may only set "from" states right before it plays. The hero `<img>` is never hidden (that protects LCP).
3. **Truth.** Never hard-code a fact that isn't in `docs/03-copy-deck.md`, `src/content/*` or the spec. Unknown values stay as `[[TOKEN]]` strings in content or as `null` in data.
4. **Numbers** are always rendered through `formatNumber` / `formatTonnes` (Western digits). Model codes, phone numbers and emails inside Arabic text are wrapped in `<bdi>`.
5. **Arabic:** no `letter-spacing`, no `text-transform`, no `text-align: justify`. Split text only by lines or words.
6. **Motion never reparents or deletes React nodes.** For flights it animates **clones** (ghosts) appended to `document.body` and removed afterwards.
7. **Commit after every task**, with conventional-commit messages. End each message with:
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
8. **Unit tests** are co-located as `src/**/*.test.ts(x)` and run with `npm test` (Vitest, `jsdom` environment for `.tsx` tests).

---

## File structure (who creates what)

```
atlas-website/
  package.json  tsconfig.json  vite.config.ts  vitest.config.ts  .env.example      [A1]
  index.html  en/index.html                                                       [A1, head SEO in E]
  vite/truth-gate.ts  vite/font-preload.ts                                        [A2 / A1]
  scripts/subset-fonts.mjs                                                        [A1]
  scripts/build-assets.mjs  scripts/mark-hooks.mjs                                [A2]
  scripts/prerender.mjs  scripts/export-pdf.mjs                                   [E]
  assets-src/crops.json (copy of docs/asset-crops.json)  assets-src/hook-points.json [A2]
  public/img/*  (generated, committed)   public/og-ar.jpg  public/og-en.jpg       [A2]
  public/robots.txt  public/sitemap.xml (generated)                               [E]
  src/
    styles.css            tokens (@theme), type classes, layout classes            [A1]
    fonts.css             @font-face for subset fonts + metric fallbacks           [A1]
    assets/fonts/*.woff2  (generated, committed)                                   [A1]
    env.ts                build target + env values                               [A1]
    generated/images.ts   (generated) image manifest                              [A2]
    components/Picture.tsx                                                         [A2]
    lib/truth.ts (+test)                                                           [A2]
    content/types.ts  ar.ts  en.ts  index.ts  cranes.ts  sites.ts  site.ts (+tests) [B]
    lib/numbers.ts  digits.ts  whatsapp.ts  request.ts  analytics.ts  lang.tsx (+tests) [B]
    main.tsx  App.tsx                                                              [C]
    sections/Header.tsx Hero.tsx Hoist.tsx Services.tsx CraneGrid.tsx Sites.tsx
             Documents.tsx RequestForm.tsx Footer.tsx                              [C]
    components/Sling.tsx LoadTag.tsx RequestBar.tsx Lightbox.tsx DraftBadge.tsx
               Button.tsx Icons.tsx Logo.tsx                                       [C]
    motion/index.ts (useSiteMotion)  core.ts  hero.ts  hoist.ts  reveal.ts
           ride.ts  rope.ts  motion.css  sketch.ts (stretch)                       [D]
    entry-server.tsx                                                               [E]
  qa/run-qa.mjs  qa/lighthouse.mjs  qa/reports/ (gitignored)                       [E]
  README.md  DESIGN.md  docs/atlas-content-checklist.md                            [E]
```

Logo: there is no file yet, only a pasted image. `public/brand/badge.png` is **cropped from IMG_6363's watermark** by A2.4 as a temporary stand-in, flagged in the README. It is replaced when Atlas sends the vector.

---

## Contracts (all parts MUST use these exact names)

### C1. `package.json` (created in A1.1, exactly this)
```json
{
  "name": "atlas-website",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "fonts": "node scripts/subset-fonts.mjs",
    "assets": "node scripts/build-assets.mjs",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit && vite build && node scripts/prerender.mjs",
    "build:production": "BUILD_TARGET=production npm run build",
    "preview": "vite preview --port 4173",
    "qa": "node qa/run-qa.mjs",
    "lighthouse": "node qa/lighthouse.mjs",
    "pdf": "node scripts/export-pdf.mjs"
  },
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "gsap": "^3.15.1",
    "lenis": "^1.3.27",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@fontsource-variable/archivo": "^5.3.0",
    "@fontsource-variable/noto-kufi-arabic": "^5.3.0",
    "@fontsource/ibm-plex-mono": "^5.3.0",
    "@fontsource/ibm-plex-sans-arabic": "^5.3.0",
    "@tailwindcss/vite": "^4.3.4",
    "@types/node": "^26.6.6",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.2.1",
    "axe-core": "^4.14.0",
    "jsdom": "^30.1.3",
    "lighthouse": "^13.6.0",
    "puppeteer-core": "^25.16.0",
    "sharp": "^0.35.5",
    "subset-font": "^2.9.0",
    "tailwindcss": "^4.3.4",
    "typescript": "^7.0.2",
    "vite": "^8.3.5",
    "vitest": "^5.1.0"
  }
}
```
`build` runs `scripts/prerender.mjs`, which is created in Part E. Until then, use `npx tsc --noEmit && npx vite build` as the build check.

### C2. Path alias
`@/` → `src/`. Set it in `vite.config.ts` (`resolve.alias`), `vitest.config.ts` and `tsconfig.json` (`paths`).

### C3. `src/env.ts` (A1)
```ts
export type BuildTarget = 'staging' | 'production';
declare const __BUILD_TARGET__: BuildTarget;          // injected by vite `define`
export const env = {
  target: __BUILD_TARGET__,
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) || 'http://localhost:4173', // '' counts as unset (amended after A1.3 review)
  whatsapp: (import.meta.env.VITE_WHATSAPP as string | undefined) || null, // digits only, e.g. 2189XXXXXXXX
  phone: (import.meta.env.VITE_PHONE as string | undefined) || null,       // e.g. +2189XXXXXXXX
  formEndpoint: (import.meta.env.VITE_FORM_ENDPOINT as string | undefined) || null,
  ga4Id: (import.meta.env.VITE_GA4_ID as string | undefined) || null,
} as const;
/** True when an unverified value must show the DraftBadge (staging only). */
export const isDraft = (verified: boolean) => !verified && env.target !== 'production';
```
`vite.config.ts` sets `define: { __BUILD_TARGET__: JSON.stringify(process.env.BUILD_TARGET === 'production' ? 'production' : 'staging') }` and maps `SITE_URL` to `VITE_SITE_URL` (`process.env.VITE_SITE_URL ??= process.env.SITE_URL`). Vitest defines `__BUILD_TARGET__` as `"staging"`.

### C4. Design tokens and classes (A1, `src/styles.css`)
- **Tailwind 4 `@theme` colours** (utilities `bg-*`, `text-*`, `border-*`):
  `--color-navy-950: #0D0C2B; --color-navy: #23207A; --color-red: #C9221C; --color-red-bright: #FF5A4F; --color-concrete: #F3F2EE; --color-white: #FFFFFF; --color-steel: #A6A6C8; --color-ink: #14131F; --color-line: #D9D8E3; --color-line-dark: rgb(255 255 255 / 0.14);`
- **Font families** (utilities `font-display`, `font-body`, `font-mono`). Archivo has no Arabic glyphs, so Arabic display text falls through to Kufi while digits stay Archivo:
  `--font-display: "Archivo Atlas", "Kufi Atlas", "Archivo Fallback", "Kufi Fallback", system-ui, sans-serif;`
  `--font-body: "Plex Atlas", "Plex Fallback", system-ui, sans-serif;`
  `--font-mono: "Plex Mono Atlas", "Plex Atlas", ui-monospace, monospace;`
- **Type classes** (plain CSS, with `:lang(ar)` overrides; values from `docs/05-typography.md` §4):
  `.t-readout .t-h1 .t-h2 .t-h3 .t-lead .t-body .t-spec .t-small .t-label`.
  `.t-readout` sets `font-family: var(--font-display); font-stretch: 75%; font-weight: 800; font-variant-numeric: tabular-nums lining-nums;`.
- **Layout classes:**
  - `.shell`: `margin-inline: auto; max-width: 90rem; padding-inline: clamp(1rem, 4vw, 3.5rem);`
  - `.section-y`: `padding-block: clamp(5rem, 12vw, 11rem);`
  - `.measure`: `max-width: 36rem` (and 38rem with `:lang(ar)`)
- **Focus ring:** `:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }`. On dark grounds the ring is white (inherits `text-white`).
- **Browser surfaces** (spec §15):
  - `::selection` is navy with white text; on dark grounds (`[data-ground="dark"]`) it is red-bright with navy-950 text.
  - `:root { caret-color: var(--color-red); scrollbar-color: var(--color-navy) var(--color-concrete); accent-color: var(--color-red); }`
  - `a { text-underline-offset: .22em; text-decoration-thickness: 1px; }`
  - `.t-spec, [data-counter] { font-variant-numeric: tabular-nums lining-nums; }`
- **The only shadow:** `--shadow-bar: 0 -8px 24px rgb(13 12 43 / .18)`, used by the RequestBar only.
- **Dark sections** carry `data-ground="dark"` on their root (Hero band, Hoist, Services, RequestForm), so selection colours switch.
- **Impeccable bans** that hold in every part: no eyebrow above a heading, no section numbers, no Unicode or emoji icons, and mono only for data.
- **Base styles:** `html { scroll-padding-top: 5rem; scroll-padding-bottom: 6rem; }`, `body { font-family: var(--font-body); background: var(--color-concrete); color: var(--color-ink); }`, and `:lang(ar) { letter-spacing: 0 !important; }`.

### C5. Fonts (A1)
Subset woff2 files in `src/assets/fonts/`:
- `archivo-wght-wdth.woff2`
- `kufi-wght.woff2`
- `plex-ar-400.woff2`, `plex-ar-600.woff2` (Arabic range)
- `plex-la-400.woff2`, `plex-la-600.woff2` (Latin range)
- `plex-mono-500.woff2`

Family names are `"Archivo Atlas"`, `"Kufi Atlas"`, `"Plex Atlas"` (one family, two `unicode-range` blocks per weight) and `"Plex Mono Atlas"`. Fallback families: `"Archivo Fallback"`, `"Kufi Fallback"`, `"Plex Fallback"`.

### C6. Images (A2)
`src/generated/images.ts` is written by `scripts/build-assets.mjs`:
```ts
export type PhotoId = '6359'|'6360'|'6363'|'6364'|'6374'|'6375'|'6376'|'6379'|'6380'|'6382'|'6385'|'6388'|'6389'|'6392'|'6393'|'6395'|'6396'|'6397'|'6398';
export type CropName = 'desktop_16x9' | 'mobile_4x5' | 'mobile_9x16';
export interface ImageSource { url: string; width: number }
export interface CropImage {
  photo: PhotoId; crop: CropName;
  rect: { left: number; top: number; width: number; height: number }; // in source pixels
  avif: ImageSource[]; webp: ImageSource[];                          // ascending width
  hook: { x: number; y: number } | null;                            // source-pixel hook point, if any
}
export const images: Partial<Record<`${PhotoId}:${CropName}`, CropImage>>;
export function getImage(photo: PhotoId, crop: CropName): CropImage; // throws if missing
```
Kobelco photos (6367, 6370, 6371) are not processed. URLs look like `/img/<photo>-<crop>-<width>.<hash8>.<ext>`.

`src/components/Picture.tsx` (A2):
```tsx
export interface PictureProps {
  photo: PhotoId;
  crop: CropName;                 // used ≥ 768px (or always, when mobileCrop is absent)
  mobileCrop?: CropName;          // used < 768px
  alt: string;
  sizes: string;
  priority?: boolean;             // fetchpriority="high", loading="eager", decoding="sync"
  className?: string;             // applied to <img>
  pictureClassName?: string;      // applied to <picture>
}
export function Picture(props: PictureProps): JSX.Element
```
It renders `<picture>` with AVIF and WebP `<source>`s (with a media query when `mobileCrop` is set) and an `<img>` with `width`/`height` from `rect`, `object-fit: cover` and `object-position: 50% 0`.
The 24 px blur placeholders live in `src/generated/placeholders.ts` (`placeholders["<photo>:<crop>"]`), not in the manifest. On the server (`import.meta.env.SSR`) the `<img>` gets them as an inline `background-image` (+ `background-size: cover`, `background-position: 50% 0`); the client bundle omits them and the `<img>` has `suppressHydrationWarning`.

### C7. Content types (B, `src/content/types.ts`)
B owns the full `Copy` interface. These pieces are fixed:
```ts
import type { PhotoId } from '@/generated/images';
export type Lang = 'ar' | 'en';
export type CraneId = 'rt700e' | 'atf60-3' | 'ac200-1' | 'quy250' | 'gmk6350' | 'cke2500';
export type CraneType = 'rough-terrain' | 'all-terrain' | 'crawler';
export interface Crane {
  id: CraneId; make: string; model: string; type: CraneType;
  capacityT: number;            // manufacturer max rating used on the site
  hoistPhoto: PhotoId; cardPhoto: PhotoId;
  verified: boolean;            // Atlas confirmed ownership + capacity
  hidden: boolean;              // never rendered (cke2500)
}
export interface DocumentFile { id: string; href: string; lang: 'ar' | 'en' | 'both'; date: string }
export interface SiteInfo {
  email: string;                // 'atlasalsahralibya@gmail.com'
  facebook: string;             // the share URL from the brief
  address: { ar: string; en: string } | null;
  documents: DocumentFile[];    // [] until real files exist
}
export interface Copy {
  meta: { title: string; description: string; ogTitle: string; ogDescription: string; ogImageAlt: string };
  // …everything else defined by Part B from copy deck §2–§12, grouped as:
  // header, hero, hoist, services, grid, sites, documents, form, whatsapp, bar, footer, alt (Record<PhotoId, string>), misc (draftBadge, etc.)
}
```
`src/content/index.ts` (B): `export function getCopy(lang: Lang): Copy`, plus re-exports of `cranes`, `visibleCranes` (not hidden, sorted by `capacityT`), `sites`, `siteInfo`.

### C8. Library API (B)
```ts
// src/lib/numbers.ts
export function formatNumber(n: number, lang: Lang, opts?: { maximumFractionDigits?: number }): string; // Western digits, '.' decimal, ',' grouping (EN) / '٬'-free ',' (AR)
export function formatTonnes(n: number, lang: Lang): string;   // "350 t" | "350 طن" (no-break space U+00A0; U+202F exists in none of the fonts — decided after A1.5 review)
export function formatMetres(n: number, lang: Lang): string;   // "12 m" | "12 م"
// src/lib/digits.ts
export function toAsciiDigits(input: string): string;          // ٠-٩ ۰-۹ → 0-9, ٫ → '.', ٬ → ''
export function parseDecimal(input: string): number | null;     // after toAsciiDigits; null if empty/invalid
// src/lib/whatsapp.ts
export function fillTemplate(template: string, vars: Record<string, string>): string; // replaces {key}
export function whatsappHref(message: string): string;         // wa.me/<env.whatsapp>?text=… ; if env.whatsapp is null → mailto:siteInfo.email?subject=…&body=…
export function telHref(): string | null;                      // null if env.phone is null
// src/lib/request.ts
export const HOOK_EVENT = 'atlas:hook';
export interface HookEventDetail { craneId: CraneId | null; source: HTMLElement | null }
export function getRequestedCrane(): CraneId | null;
export function setRequestedCrane(id: CraneId | null, source?: HTMLElement | null): void; // updates store, then window.dispatchEvent(new CustomEvent<HookEventDetail>(HOOK_EVENT, { detail }))
export function useRequestedCrane(): CraneId | null;           // useSyncExternalStore, server snapshot null
// src/lib/analytics.ts
export type AnalyticsEvent = 'whatsapp_click' | 'call_click' | 'request_crane' | 'form_submit' | 'filter_use' | 'lang_switch';
export function track(event: AnalyticsEvent, params?: Record<string, string>): void; // no-op without env.ga4Id
export function loadAnalytics(): void;                         // injects gtag after load + idle; called once from App effect
// src/lib/lang.tsx
export function LangProvider(props: { lang: Lang; children: React.ReactNode }): JSX.Element;
export function useLang(): { lang: Lang; dir: 'rtl' | 'ltr'; copy: Copy; otherLang: Lang; otherHref: string /* '/en/' or '/' */ };
```

### C9. DOM contract (C renders these; D and E rely on them)
**Section ids:** `#main` (wraps the sections), `#top` (hero), `#cranes` (Hoist), `#services`, `#crane-list` (grid), `#sites`, `#documents`, `#request` (form).
**Nav targets:** Services → `#services` · Cranes → `#cranes` · On site → `#sites` · Contact → `#request`. The hero's "Browse cranes" → `#cranes`; the header's "Request a crane" → `#request`.

| Element | Required attributes |
|---|---|
| Hero section root | `data-hero` |
| Hero photo `<picture>` wrapper | `data-hero-photo` |
| Hero H1 | `data-split` |
| Hero lines / buttons after the H1 | `data-intro` |
| Hero sling `<svg>` | `data-sling`, `viewBox` = crop rect, with `<path data-sling-leg>` ×2 and `<circle data-hook-pin>` |
| WhatsApp button on the sling | `data-sling-button`, `data-testid="sling-whatsapp"` |
| Hoist section | `<section id="cranes" data-hoist>` |
| Hoist list and items | `<ol data-hoist-list>` → `<li data-hoist-item data-crane={id} data-capacity={capacityT}>` |
| Inside each Hoist item | `<div data-hoist-photo>` (wraps `<Picture>`), `<div data-load-tag>`, `<span data-counter data-value={capacityT}>` (text already the final formatted number), `<span data-hook-anchor>` (empty element placed at the real hook point when known) |
| Section headings / blocks that reveal | `data-reveal` (elements with it may be faded/raised in by D) |
| Service rows | `<li data-service-row>` |
| Crane grid | `<div data-crane-grid>`; card `<article data-testid="crane-card" data-crane={id}>`; its button `data-testid="request-crane-button" data-crane={id}`; filter chip `<button data-testid="filter-chip" data-value={'all'|'rough-terrain'|'all-terrain'|'crawler'|'band:0-60'|'band:61-200'|'band:201+'} aria-pressed>` |
| Sites strip and photo buttons | strip `data-sites-strip`; each photo button `data-testid="site-photo"` |
| Lightbox | `<dialog data-testid="lightbox">` |
| Request bar | `<div data-request-bar data-testid="request-bar">` with `data-testid="bar-whatsapp"` (also `data-bar-whatsapp`), `data-testid="bar-call"`, and when a crane is chosen `<span data-bar-chip data-testid="bar-chip">` + `<button data-testid="bar-chip-clear">` |
| Form | `<form data-testid="request-form">`; inputs `name` = `weight radius height site start duration crane name company phone message`; test ids `form-weight`, `form-phone`, `form-submit`, `form-error-summary`, `form-success` |
| Header | `<header data-header>`; language link `data-testid="lang-switch"`; menu `data-testid="menu-open"` + `<dialog data-testid="menu-dialog">` |
| Progress rope | rendered by App: `<div data-progress-rope aria-hidden="true" class="progress-rope"></div>` (hidden by default CSS, shown by D's CSS when `html[data-motion="desktop"]`) |
| Footer | `<footer data-footer>`; back to top `<a href="#top" data-testid="back-to-top" data-back-to-top>` |
| Draft badge | `<span data-testid="draft-badge">` |

### C10. Motion API (D)
- `src/motion/index.ts` exports `useSiteMotion(): void`. App calls it once. Inside a `useEffect` it does `import('./core').then(m => m.startMotion())` and returns the cleanup.
- `core.ts` sets `document.documentElement.dataset.motion` to `'desktop' | 'touch' | 'reduced'`, creates Lenis (desktop only, `anchors: true`), registers the plugins, and runs `gsap.matchMedia` with these contexts:
  - `desktop`: `(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)`
  - `touch`: `(prefers-reduced-motion: no-preference) and (max-width: 1023.98px), (prefers-reduced-motion: no-preference) and (pointer: coarse), (prefers-reduced-motion: no-preference) and (pointer: none)`. The original `… and not (…)` form was invalid Media Queries 4 grammar and was corrected in D.1, where a test proves the three contexts never overlap and cover every case.
  - `reduced`: `(prefers-reduced-motion: reduce)`
- The Hoist desktop timeline (`hoist.ts`) is loaded with `import()` when `#cranes` is within one viewport of the screen (IntersectionObserver, `rootMargin: '100% 0px'`).
- `index.html` contains an inline script (A1) that adds `js` to `<html>`, and `motion-ok` when `prefers-reduced-motion` is not `reduce`. `motion.css` may hide `[data-intro]` only under `.motion-ok` and must un-hide everything after 3 s if `html` still lacks `data-motion` (a CSS animation fallback).

### C11. Accepted contract additions (merged 4 Nov 2026 from Parts A1/A2)
- **TypeScript:** `tsconfig.json` sets `"allowImportingTsExtensions": true`. Vite-side files import `./vite/*.ts` and `../src/lib/truth.ts` with the extension; app code stays extensionless.
- **Image manifest stub:** A1.7 creates a stub `src/generated/images.ts` (exact C6 declarations, `images = {}`), so Part B type-checks before A2.3 generates the real file.
- **Theme reset:** Tailwind's default palette and shadow scales are cleared. **Only the C4 colours exist, plus the single `shadow-bar` utility.** Default Tailwind colours and shadows compile to nothing, so never use them.
- **Body base:** `body` uses the `.t-body` values. `:lang(ar) { text-transform: none !important }` sits next to the letter-spacing rule.
- **Env files:** `vite.config.ts` loads `.env*` files into `process.env` for `BUILD_TARGET`, `SITE_URL`, `VITE_SITE_URL`, `VITE_WHATSAPP` and `VITE_PHONE`; the shell wins. Vitest also runs `vite/**/*.test.ts` and `scripts/**/*.test.mjs`.
- **Truth gate:** `vite/truth-gate.ts` exports `truthGate({ target, env }): Plugin` and loads content with Vite's `runnerImport`. `ar.ts`, `en.ts` and `cranes.ts` must keep the named exports `ar`, `en` and `cranes`. `src/lib/truth.ts` exports `TruthInput`.
- **Asset helpers:** `scripts/lib/assets-helpers.mjs` exports `widthsFor`, `encodePlan`, `hookInRect` and `imageFileName`.
- **Mobile hero crops:** the 9:16 hero crops for 6398 and 6359 contain the real hook, so **phones get the sling too**. They ship at 640/828/1080 px with AVIF q45 to stay ≤ 80 KB.
- **Hook points** (source px): 6398 (3226, 1300), 6359 (1391, 1600), 6389 (885, 1868).
- **`<Picture>`:**
  - The mobile `<source>`s carry the mobile crop's `width`/`height`.
  - The `<img src>` is the WebP closest to 1280 px.
  - The mobile media query is `(max-width: 767.98px)`.

### C12. Accepted contract additions from Parts B, C, D and E (merged 4 Nov 2026)
Each part's own "Proposed contract additions" section gives the details. All of them are **accepted**, with these headlines:
- **B:** `mailtoHref(subject, body)` in `src/lib/whatsapp.ts`. `Copy.lang`. The hero H1 copy is split into `h1Lead` + `h1Main`.
- **C:**
  - Additions: `src/components/Fill.tsx`, extra `Button` exports and props, Sling helpers, `src/test/render.tsx` (test render helper), `data-footer-pad`, analytics locations `menu` and `services`.
  - `App` is exported both named and default.
  - The hero photo starts below the header.
  - Dark section roots carry `data-ground="dark"`.
  - Number–unit separator is U+00A0 (no-break space), not U+202F, which exists in none of the source fonts (A1.5 review). The font subsets add «» (U+00AB/U+00BB) and Eastern Arabic-Indic digits U+06F0–06F9.
- **D:**
  1. The corrected `touch` query (C10 above).
  2. Motion may pre-hide `[data-split]`, `[data-sling-leg]` and `[data-sling-button]`, and pre-scale the hero photo and sling, **only under `.motion-ok`** and with the 3 s CSS fallback. The hero `<img>` itself is never hidden.
  3. Narrow, reversible React-DOM edits are allowed: SplitText on the static H1, counter text, motion-owned child elements, and inline layout styles that are reverted on cleanup. Never on elements whose content React re-renders.
  4. **No `overflow: hidden|auto|scroll` on any ancestor of the Hoist list.** The desktop Hoist uses CSS `position: sticky` with a scroll runway instead of a GSAP pin, so React nodes are never reparented. That makes C's `[data-hoist-band]` proposal unnecessary.
  5. C's sling, Hoist-item and `data-footer-pad` markup is part of C9.
  6. `data-lift-sketch` only if the optional D.9 runs.
- **E:**
  - `<!--app-->` and `<!--head-->` markers in both HTML entries.
  - `main.tsx` uses `hydrateRoot` when `#root` has children, and `App` never renders its own `LangProvider`.
  - The sitemap is written to `dist/`.
  - `PHOTOS_DIR` env in `build-assets.mjs`.
  - `dist-ssr/` is gitignored.
  - Add `chrome-launcher` to devDependencies if it doesn't resolve through `lighthouse`.
  - Vitest `include` widened to `scripts/`, `qa/` and `vite/` tests.


---

## Part A1 — Foundation (Day 1)

**Outcome:** an empty but complete toolchain. Vite 8 builds two pages (`/` Arabic RTL, `/en/` English LTR), Vitest runs, `src/env.ts` exists, the design tokens and type scale are in `src/styles.css`, the seven subset fonts are committed with metric-matched fallbacks, and each built page preloads its three fonts.

**Before you start:** read the plan header (`00-header-contracts.md`, contracts C1–C5 and C10) and the spec. Every command runs in `/Users/montheribrahim/Downloads/atlas-website`. Node is 24.22 (`node --version` prints `v24.22.1`).

Everything below was dry-run on a scratch copy on 4 Nov 2026 with the exact C1 versions; the expected outputs are the real ones.

---

### Task A1.1: Scaffold the project

**Files:**
- Create: `package.json`, `package-lock.json` (by npm), `tsconfig.json`, `vitest.config.ts`, `.env.example`
- Test: `src/env.test.ts` (smoke test; Task A1.3 extends it)
- Check (no change expected): `.gitignore`

- [ ] **Step 1: Create `package.json` exactly as contract C1**

```json
{
  "name": "atlas-website",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "fonts": "node scripts/subset-fonts.mjs",
    "assets": "node scripts/build-assets.mjs",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit && vite build && node scripts/prerender.mjs",
    "build:production": "BUILD_TARGET=production npm run build",
    "preview": "vite preview --port 4173",
    "qa": "node qa/run-qa.mjs",
    "lighthouse": "node qa/lighthouse.mjs",
    "pdf": "node scripts/export-pdf.mjs"
  },
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "gsap": "^3.15.1",
    "lenis": "^1.3.27",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@fontsource-variable/archivo": "^5.3.0",
    "@fontsource-variable/noto-kufi-arabic": "^5.3.0",
    "@fontsource/ibm-plex-mono": "^5.3.0",
    "@fontsource/ibm-plex-sans-arabic": "^5.3.0",
    "@tailwindcss/vite": "^4.3.4",
    "@types/node": "^26.6.6",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.2.1",
    "axe-core": "^4.14.0",
    "jsdom": "^30.1.3",
    "lighthouse": "^13.6.0",
    "puppeteer-core": "^25.16.0",
    "sharp": "^0.35.5",
    "subset-font": "^2.9.0",
    "tailwindcss": "^4.3.4",
    "typescript": "^7.0.2",
    "vite": "^8.3.5",
    "vitest": "^5.1.0"
  }
}
```

`npm run build` calls `scripts/prerender.mjs`, which Part E creates. Until then the build check is `npx tsc --noEmit && npx vite build`.

- [ ] **Step 2: Install**

Run: `npm install`
Expected: ends with `added <N> packages …` and no `npm ERR!` lines. Then:

Run: `npm ls vite vitest typescript sharp subset-font --depth=0`
Expected (versions):
```
├── sharp@0.35.5
├── subset-font@2.9.0
├── typescript@7.0.2
├── vite@8.3.5
└── vitest@5.1.0
```

- [ ] **Step 3: Create `tsconfig.json`**

Based on the AFHAM config. Notes for TypeScript 7: `baseUrl` is gone (use `paths` alone, relative to this file), and `types` defaults to none, so `vite/client` and `node` are listed. `allowImportingTsExtensions` lets `vite.config.ts` import `./vite/*.ts` with the extension, which Vite 8's config loader wants (Task A1.6). Scripts in `scripts/*.mjs` are plain JavaScript and are not type-checked.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "types": ["vite/client", "node"],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "vite", "vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Write the failing smoke test `src/env.test.ts`**

```ts
import { describe, expect, it } from 'vitest';

declare const __BUILD_TARGET__: string;

describe('test setup', () => {
  it('runs with the staging build target defined', () => {
    expect(__BUILD_TARGET__).toBe('staging');
  });

  it('runs in a DOM environment', () => {
    expect(typeof document.createElement).toBe('function');
  });
});
```

- [ ] **Step 5: Run it and watch it fail**

Run: `npx vitest run`
Expected: FAIL, 2 tests failed: `ReferenceError: __BUILD_TARGET__ is not defined` and `ReferenceError: document is not defined` (there is no Vitest config yet, so there is no `define` and the environment is Node).

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define: { __BUILD_TARGET__: JSON.stringify('staging') },
  test: {
    environment: 'jsdom',
    // App tests live in src/; the Vite plugins (vite/) and build scripts (scripts/) have pure helpers with tests too.
    include: ['src/**/*.test.{ts,tsx}', 'vite/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
});
```

Node-only tests opt out of jsdom with a first line `// @vitest-environment node`.

- [ ] **Step 7: Run the tests and the type check**

Run: `npm test`
Expected: `Test Files  1 passed (1)` and `Tests  2 passed (2)`.

Run: `npx tsc --noEmit`
Expected: no output, exit code 0.

- [ ] **Step 8: Create `.env.example`**

```bash
# Copy to .env for local overrides (.env is git-ignored). A staging build needs none of these.
# Values set in the shell win over .env.

# Canonical site address (canonical, Open Graph, sitemap, hreflang). Required for production.
SITE_URL=
# WhatsApp number: digits only, international format, e.g. 2189XXXXXXXX. Required for production.
VITE_WHATSAPP=
# Click-to-call number, e.g. +2189XXXXXXXX. Required for production.
VITE_PHONE=
# Optional JSON POST endpoint for the request form (Formspree or similar).
VITE_FORM_ENDPOINT=
# Optional GA4 measurement ID (G-XXXXXXXXXX). Without it analytics stay off.
VITE_GA4_ID=
# staging (default) or production. A production build fails while anything is unverified.
BUILD_TARGET=staging
```

- [ ] **Step 9: Check `.gitignore` (already correct)**

Run: `cat .gitignore`
Expected (unchanged, nothing to add):
```
.work/
node_modules/
dist/
.env
.env.*
!.env.example
.DS_Store
qa/reports/
```
Generated files that ARE committed (`src/assets/fonts/*.woff2`, `public/img/*`, `src/generated/images.ts`) are deliberately not ignored.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts .env.example src/env.test.ts
git commit -m "chore: scaffold Vite 8, React 19, TypeScript 7 and Vitest" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A1.2: Two HTML entries and the Vite config

**Files:**
- Create: `index.html`, `en/index.html`, `vite.config.ts`, `src/main.tsx` (temporary; Part C replaces it)

The SEO head tags (description, canonical, hreflang, Open Graph, icons) are added in Part E. Here the head is minimal.

- [ ] **Step 1: Create `index.html` (Arabic, the default page)**

The inline script is contract C10: it runs before first paint and adds `js`, plus `motion-ok` unless the visitor asks for reduced motion.

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>أطلس الصحراء · Atlas Alshraa</title>
    <meta name="theme-color" content="#0D0C2B" />
    <script>
      // Before first paint: `js` = scripts run; `motion-ok` = the visitor allows motion.
      (function (d) {
        var c = d.documentElement.classList;
        c.add('js');
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) c.add('motion-ok');
      })(document);
    </script>
  </head>
  <body>
    <div id="root"><!--app--></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `en/index.html` (English)**

```html
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Atlas Alshraa</title>
    <meta name="theme-color" content="#0D0C2B" />
    <script>
      // Before first paint: `js` = scripts run; `motion-ok` = the visitor allows motion.
      (function (d) {
        var c = d.documentElement.classList;
        c.add('js');
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) c.add('motion-ok');
      })(document);
    </script>
  </head>
  <body>
    <div id="root"><!--app--></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create the temporary `src/main.tsx`**

```tsx
// TEMPORARY entry (Part A1). Part C replaces this whole file with the real app.
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (root) createRoot(root).render(<p>Atlas Alshraa: build OK</p>);
```

- [ ] **Step 4: Create `vite.config.ts`**

`syncEnv` copies the build settings from `.env*` files into `process.env`, so that the `define` (contract C3) and the Node-side plugins added later (the truth gate in A2.2) see exactly what the client sees. Shell values win. It also maps `SITE_URL` to `VITE_SITE_URL` (C3).

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Copy the build settings from `.env*` files into process.env, so that the
 * `define` below and the Node-side plugins see the same values as the client.
 * Values already in the shell environment win.
 */
function syncEnv(mode: string) {
  const all = loadEnv(mode, process.cwd(), '');
  for (const key of ['BUILD_TARGET', 'SITE_URL', 'VITE_SITE_URL', 'VITE_WHATSAPP', 'VITE_PHONE']) {
    if (all[key] && !process.env[key]) process.env[key] = all[key];
  }
  // SITE_URL is the documented name; the client reads it as VITE_SITE_URL.
  if (!process.env.VITE_SITE_URL && process.env.SITE_URL) process.env.VITE_SITE_URL = process.env.SITE_URL;
}

export default defineConfig(({ mode }) => {
  syncEnv(mode);
  const target = process.env.BUILD_TARGET === 'production' ? 'production' : 'staging';
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path('./src') } },
    define: { __BUILD_TARGET__: JSON.stringify(target) },
    build: {
      rollupOptions: { input: { ar: path('./index.html'), en: path('./en/index.html') } },
    },
  };
});
```

Never assign `undefined` to a `process.env` key: Node stores it as the string `"undefined"`. That is why the loop checks `all[key]` first.

- [ ] **Step 5: Type-check and build**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npx vite build`
Expected (hashes differ):
```
vite v8.3.5 building client environment for production...
✓ 15 modules transformed.
dist/en/index.html                0.73 kB │ gzip:  0.44 kB
dist/index.html                   0.75 kB │ gzip:  0.48 kB
dist/assets/main-<hash>.js      219.49 kB │ gzip: 68.60 kB
✓ built in …ms
```

- [ ] **Step 6: Check both built pages**

Run: `grep -o '<html[^>]*>' dist/index.html dist/en/index.html && grep -c "c.add('motion-ok')" dist/index.html dist/en/index.html`
Expected:
```
dist/index.html:<html lang="ar" dir="rtl">
dist/en/index.html:<html lang="en" dir="ltr">
dist/index.html:1
dist/en/index.html:1
```

- [ ] **Step 7: Commit**

```bash
git add index.html en/index.html vite.config.ts src/main.tsx
git commit -m "build: add Arabic and English HTML entries and Vite config" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A1.3: `src/env.ts`

**Files:**
- Create: `src/env.ts`
- Test: `src/env.test.ts` (replace the smoke test with the full file below; the smoke tests stay in it)

- [ ] **Step 1: Write the failing tests (replace the whole of `src/env.test.ts`)**

`vi.stubEnv` changes `import.meta.env`, and `vi.stubGlobal('__BUILD_TARGET__', …)` changes the define (Vitest exposes `define` values as globals, checked in the dry run). Each test re-imports `env.ts` so it reads the stubbed values.

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';

declare const __BUILD_TARGET__: string;

/** Re-import env.ts so it reads the stubbed import.meta.env values. */
async function freshEnv() {
  vi.resetModules();
  return import('./env');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('test setup', () => {
  it('runs with the staging build target defined', () => {
    expect(__BUILD_TARGET__).toBe('staging');
  });

  it('runs in a DOM environment', () => {
    expect(typeof document.createElement).toBe('function');
  });
});

describe('env', () => {
  it('targets staging under Vitest', async () => {
    const { env } = await freshEnv();
    expect(env.target).toBe('staging');
  });

  it('defaults siteUrl to the local preview server', async () => {
    vi.stubEnv('VITE_SITE_URL', undefined);
    const { env } = await freshEnv();
    expect(env.siteUrl).toBe('http://localhost:4173');
  });

  it('reads VITE_SITE_URL when set', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://staging.example.ly');
    const { env } = await freshEnv();
    expect(env.siteUrl).toBe('https://staging.example.ly');
  });

  it('turns empty optional values into null', async () => {
    vi.stubEnv('VITE_WHATSAPP', '');
    vi.stubEnv('VITE_PHONE', '');
    vi.stubEnv('VITE_FORM_ENDPOINT', '');
    vi.stubEnv('VITE_GA4_ID', '');
    const { env } = await freshEnv();
    expect(env.whatsapp).toBeNull();
    expect(env.phone).toBeNull();
    expect(env.formEndpoint).toBeNull();
    expect(env.ga4Id).toBeNull();
  });

  it('keeps optional values that are set', async () => {
    vi.stubEnv('VITE_WHATSAPP', '218900000000');
    vi.stubEnv('VITE_PHONE', '+218900000000');
    const { env } = await freshEnv();
    expect(env.whatsapp).toBe('218900000000');
    expect(env.phone).toBe('+218900000000');
  });
});

describe('isDraft (staging)', () => {
  it('is true for an unverified value', async () => {
    const { isDraft } = await freshEnv();
    expect(isDraft(false)).toBe(true);
  });

  it('is false for a verified value', async () => {
    const { isDraft } = await freshEnv();
    expect(isDraft(true)).toBe(false);
  });
});

describe('isDraft (production)', () => {
  it('is false even for an unverified value', async () => {
    vi.stubGlobal('__BUILD_TARGET__', 'production');
    const { isDraft, env } = await freshEnv();
    expect(env.target).toBe('production');
    expect(isDraft(false)).toBe(false);
  });
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `npx vitest run src/env.test.ts`
Expected: FAIL. The file does not load: `Error: Failed to resolve import "./env" from "src/env.test.ts". Does the file exist?` (no tests run).

- [ ] **Step 3: Create `src/env.ts` exactly as contract C3**

```ts
export type BuildTarget = 'staging' | 'production';
declare const __BUILD_TARGET__: BuildTarget;          // injected by vite `define`
export const env = {
  target: __BUILD_TARGET__,
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) || 'http://localhost:4173', // '' counts as unset (amended after A1.3 review)
  whatsapp: (import.meta.env.VITE_WHATSAPP as string | undefined) || null, // digits only, e.g. 2189XXXXXXXX
  phone: (import.meta.env.VITE_PHONE as string | undefined) || null,       // e.g. +2189XXXXXXXX
  formEndpoint: (import.meta.env.VITE_FORM_ENDPOINT as string | undefined) || null,
  ga4Id: (import.meta.env.VITE_GA4_ID as string | undefined) || null,
} as const;
/** True when an unverified value must show the DraftBadge (staging only). */
export const isDraft = (verified: boolean) => !verified && env.target !== 'production';
```

- [ ] **Step 4: Run and watch it pass**

Run: `npx vitest run src/env.test.ts`
Expected: `Tests  10 passed (10)`.

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/env.ts src/env.test.ts
git commit -m "feat: add build target and environment values (env.ts)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A1.4: Design tokens, type scale and layout classes

**Files:**
- Create: `src/styles.css`, `src/fonts.css` (placeholder; Task A1.5 fills it)
- Modify: `src/main.tsx` (temporary type specimen, still replaced by Part C)

Sources: contract C4, spec §6 and §15 (craft-floor amendments), `docs/05-typography.md` §4. Type and layout classes sit in `@layer components`, so Tailwind utilities can still override them.

- [ ] **Step 1: Create the placeholder `src/fonts.css`**

```css
/* The @font-face rules for the subset fonts are added in Task A1.5. */
```

- [ ] **Step 2: Create `src/styles.css`**

`--color-*: initial` clears Tailwind's default palette, so only the brand colours exist (a stray `bg-yellow-400` compiles to nothing; spec §6 bans yellow). The shadow scales are cleared the same way: the RequestBar shadow is the only one in the system (spec §15.6).

```css
@import 'tailwindcss';
@import './fonts.css';

/* ── Tokens (spec §6). Only these colours exist: the default palette is cleared,
   so a stray `bg-yellow-400` simply does not compile to anything. ─────────── */
@theme {
  --color-*: initial;
  --color-navy-950: #0d0c2b;
  --color-navy: #23207a;
  --color-red: #c9221c;
  --color-red-bright: #ff5a4f;
  --color-concrete: #f3f2ee;
  --color-white: #ffffff;
  --color-steel: #a6a6c8;
  --color-ink: #14131f;
  --color-line: #d9d8e3;
  --color-line-dark: rgb(255 255 255 / 0.14);

  /* Archivo has no Arabic glyphs, so Arabic display text falls through to Kufi
     while digits stay Archivo. */
  --font-display: 'Archivo Atlas', 'Kufi Atlas', 'Archivo Fallback', 'Kufi Fallback', system-ui, sans-serif;
  --font-body: 'Plex Atlas', 'Plex Fallback', system-ui, sans-serif;
  --font-mono: 'Plex Mono Atlas', 'Plex Atlas', ui-monospace, monospace;

  /* The only shadow in the system: the RequestBar (spec §15.6), utility `shadow-bar`.
     Tailwind's default shadow scales are cleared. */
  --shadow-*: initial;
  --inset-shadow-*: initial;
  --drop-shadow-*: initial;
  --text-shadow-*: initial;
  --shadow-bar: 0 -8px 24px rgb(13 12 43 / 0.18);
}

/* ── Base ─────────────────────────────────────────────────────────────── */
@layer base {
  /* Themed browser surfaces (spec §15.5). */
  :root {
    caret-color: var(--color-red);
    scrollbar-color: var(--color-navy) var(--color-concrete);
    accent-color: var(--color-red);
  }
  ::selection {
    background: var(--color-navy);
    color: var(--color-white);
  }
  .bg-navy-950 ::selection,
  [data-ground='dark'] ::selection {
    background: var(--color-red-bright);
    color: var(--color-navy-950);
  }
  a {
    text-underline-offset: 0.22em;
    text-decoration-thickness: 1px;
  }
  /* All numerals in data are tabular (spec §15.5). */
  .t-spec,
  [data-counter],
  table {
    font-variant-numeric: tabular-nums lining-nums;
  }

  html {
    scroll-padding-top: 5rem;
    scroll-padding-bottom: 6rem;
  }
  body {
    font-family: var(--font-body);
    font-size: clamp(1rem, 0.979rem + 0.093vw, 1.0625rem);
    line-height: 1.6;
    background: var(--color-concrete);
    color: var(--color-ink);
  }
  body:lang(ar) {
    font-size: clamp(1.0625rem, 1.042rem + 0.093vw, 1.125rem);
    line-height: 1.85;
  }
  /* Arabic: tracking breaks the joins and there are no capitals (spec §6, global rule 5). */
  :lang(ar) {
    letter-spacing: 0 !important;
    text-transform: none !important;
  }
  /* White on dark grounds, ink/navy on light: the ring follows the text colour. */
  :focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
}

/* ── Type scale (docs/05-typography.md §4). Fluid from 360 px to 1440 px.
   Every class sets an explicit line-height (the subset fonts change `normal`). ── */
@layer components {
  .t-readout {
    font-family: var(--font-display);
    font-stretch: 75%;
    font-weight: 800;
    font-variant-numeric: tabular-nums lining-nums;
    font-size: clamp(4.5rem, 1.833rem + 11.852vw, 12.5rem);
    line-height: 0.9;
    letter-spacing: -0.01em;
  }
  .t-readout:lang(ar) {
    line-height: 1;
  }

  .t-h1 {
    font-family: var(--font-display);
    font-stretch: 100%;
    font-weight: 800;
    font-size: clamp(2.375rem, 1.667rem + 3.148vw, 4.5rem);
    line-height: 1.04;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .t-h1:lang(ar) {
    font-size: clamp(2.5rem, 1.75rem + 3.333vw, 4.75rem);
    line-height: 1.3;
  }

  .t-h2 {
    font-family: var(--font-display);
    font-stretch: 100%;
    font-weight: 700;
    font-size: clamp(1.875rem, 1.5rem + 1.667vw, 3rem);
    line-height: 1.08;
    letter-spacing: -0.005em;
    text-wrap: balance;
  }
  .t-h2:lang(ar) {
    font-size: clamp(1.875rem, 1.458rem + 1.852vw, 3.125rem);
    line-height: 1.35;
  }

  .t-h3 {
    font-family: var(--font-display);
    font-stretch: 100%;
    font-weight: 700;
    font-size: clamp(1.3125rem, 1.167rem + 0.648vw, 1.75rem);
    line-height: 1.2;
    letter-spacing: 0;
  }
  .t-h3:lang(ar) {
    font-size: clamp(1.375rem, 1.208rem + 0.741vw, 1.875rem);
    line-height: 1.45;
  }

  .t-lead {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: clamp(1.125rem, 1.0625rem + 0.278vw, 1.3125rem);
    line-height: 1.55;
  }
  .t-lead:lang(ar) {
    font-size: clamp(1.1875rem, 1.125rem + 0.278vw, 1.375rem);
    line-height: 1.8;
  }

  .t-body {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: clamp(1rem, 0.979rem + 0.093vw, 1.0625rem);
    line-height: 1.6;
  }
  .t-body:lang(ar) {
    font-size: clamp(1.0625rem, 1.042rem + 0.093vw, 1.125rem);
    line-height: 1.85;
  }

  .t-spec {
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: clamp(0.875rem, 0.833rem + 0.185vw, 1rem);
    line-height: 1.5;
  }
  .t-spec:lang(ar) {
    line-height: 1.6;
  }

  .t-small {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .t-small:lang(ar) {
    font-size: 0.9375rem;
    line-height: 1.7;
  }

  /* DATA LABEL ONLY, e.g. «السعة / Capacity» inside a load tag. Never place it
     above a heading: no eyebrows or kickers (spec §15.1, Impeccable ban). */
  .t-label {
    font-family: var(--font-display);
    font-stretch: 125%;
    font-weight: 600;
    font-size: clamp(0.75rem, 0.729rem + 0.093vw, 0.8125rem);
    line-height: 1.3;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .t-label:lang(ar) {
    font-family: var(--font-body);
    font-stretch: 100%;
    font-size: clamp(0.8125rem, 0.792rem + 0.093vw, 0.875rem);
    line-height: 1.5;
  }

  /* ── Layout (spec §6) ── */
  .shell {
    margin-inline: auto;
    max-width: 90rem;
    padding-inline: clamp(1rem, 4vw, 3.5rem);
  }
  .section-y {
    padding-block: clamp(5rem, 12vw, 11rem);
  }
  .measure {
    max-width: 36rem;
  }
  .measure:lang(ar) {
    max-width: 38rem;
  }

  /* Rendered by App (C9); Part D's motion.css shows it on desktop motion only. */
  .progress-rope {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Replace `src/main.tsx` with a temporary type specimen**

```tsx
// TEMPORARY entry (Part A1). Part C replaces this whole file with the real app.
// It proves the build works and shows the type scale for the font checks in A1.5.
import { createRoot } from 'react-dom/client';
import './styles.css';

function Specimen() {
  return (
    <main className="shell section-y">
      <h1 className="t-h1">من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة</h1>
      <h1 className="t-h1" lang="en">Every project has the right crane</h1>
      <p className="t-label">السعة</p>
      <p className="t-readout">350 طن</p>
      <p className="t-spec" lang="en">GMK6350 · 350 t · all-terrain</p>
      <p className="t-body measure">تأجير الرافعات والنقل الثقيل والمناولة وخدمات النفط، من 55 إلى 350 طن.</p>
      <p className="t-body measure" lang="en">Crane hire, heavy transport, handling and oil services, from 55 to 350 t.</p>
    </main>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<Specimen />);
```

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit && npx vite build`
Expected: no type errors; the build now also lists `dist/assets/main-<hash>.css` (about 10 kB, under 3 kB gzip).

- [ ] **Step 5: Check the compiled tokens**

Run: `grep -o -- '--color-navy-950:[^;]*' dist/assets/*.css; grep -o '\.t-h1:lang(ar){[^}]*}' dist/assets/*.css; grep -c 'yellow' dist/assets/*.css`
Expected:
```
--color-navy-950:#0d0c2b
.t-h1:lang(ar){font-size:clamp(2.5rem,1.75rem + 3.333vw,4.75rem);line-height:1.3}
0
```

- [ ] **Step 6: Look at it**

Run: `npm run dev`, open `http://localhost:5173/`.
Expected: concrete (#F3F2EE) background, ink text, right-to-left layout, a large readout «350 طن». Fonts are still system fonts (A1.5 adds them). Select some text: the selection is navy with white text. Stop the server (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add src/styles.css src/fonts.css src/main.tsx
git commit -m "feat: add design tokens, type scale and layout classes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A1.5: Subset fonts and metric-matched fallbacks

**Files:**
- Create: `scripts/subset-fonts.mjs`, `src/assets/fonts/*.woff2` (7 generated files, committed)
- Modify: `src/fonts.css` (replace the placeholder)

`subset-font` drives HarfBuzz. With no `keepFeatures` option it keeps **every** OpenType layout feature (it inverts the feature set, like `--layout-features=*`), and with no `variationAxes` option it keeps **every** variation axis. That is exactly what `docs/05-typography.md` §5 measured: same glyphs, 348.5 KB → 142.5 KB.

- [ ] **Step 1: List the Fontsource source files**

Run:
```bash
ls node_modules/@fontsource-variable/archivo/files | grep '^archivo-latin-wdth-normal'
ls node_modules/@fontsource-variable/noto-kufi-arabic/files | grep 'arabic-wght-normal'
ls node_modules/@fontsource/ibm-plex-sans-arabic/files | grep -E '^ibm-plex-sans-arabic-(arabic|latin)-(400|600)-normal\.woff2$'
ls node_modules/@fontsource/ibm-plex-mono/files | grep '^ibm-plex-mono-latin-500-normal\.woff2$'
```
Expected:
```
archivo-latin-wdth-normal.woff2
noto-kufi-arabic-arabic-wght-normal.woff2
ibm-plex-sans-arabic-arabic-400-normal.woff2
ibm-plex-sans-arabic-arabic-600-normal.woff2
ibm-plex-sans-arabic-latin-400-normal.woff2
ibm-plex-sans-arabic-latin-600-normal.woff2
ibm-plex-mono-latin-500-normal.woff2
```
Use Archivo's **`wdth`** file: it carries both axes (wght 100–900 and wdth 62–125). The `wght` file has no width axis, and the readouts need width 75. Never use Kufi's `latin` file: Kufi is for Arabic letters only.

- [ ] **Step 2: Create `scripts/subset-fonts.mjs`**

```js
// Subsets the Fontsource woff2 files to the characters the site uses and
// writes them to src/assets/fonts/ (committed). Run with `npm run fonts`.
// HarfBuzz (subset-font) keeps every OpenType layout feature and every
// variation axis by default, so the glyphs render exactly as the full files.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const OUT = new URL('../src/assets/fonts/', import.meta.url);

const range = (from, to) => {
  let s = '';
  for (let c = from; c <= to; c++) s += String.fromCodePoint(c);
  return s;
};

// Keep in sync with the unicode-range lists in src/fonts.css.
// Arabic: standard Arabic letters, tatweel, harakat, Arabic-Indic digits and
// punctuation (، ؛ ؟ ٪ ٫ ٬ ٭), superscript alef, alef wasla, ZWNJ/ZWJ/LRM/RLM.
const ARABIC =
  range(0x0621, 0x063a) + range(0x0640, 0x0655) + range(0x0660, 0x066d) +
  '،؛؟' + range(0x0670, 0x0671) + range(0x200c, 0x200f);
// Latin: printable ASCII plus nbsp © ° · × – — ‘ ’ “ ” • … narrow nbsp ↑ ↓.
// U+202F is the narrow no-break space formatTonnes() puts between number and unit.
const LATIN =
  range(0x0020, 0x007e) +
  ' ©°·×–—‘’“”•… ↑↓';

/** [output file, Fontsource file, character set] */
const JOBS = [
  ['archivo-wght-wdth.woff2', '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2', LATIN],
  ['kufi-wght.woff2', '@fontsource-variable/noto-kufi-arabic/files/noto-kufi-arabic-arabic-wght-normal.woff2', ARABIC],
  ['plex-ar-400.woff2', '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2', ARABIC],
  ['plex-ar-600.woff2', '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2', ARABIC],
  ['plex-la-400.woff2', '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-400-normal.woff2', LATIN],
  ['plex-la-600.woff2', '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-600-normal.woff2', LATIN],
  ['plex-mono-500.woff2', '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', LATIN],
];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`.padStart(9);

await mkdir(OUT, { recursive: true });
let before = 0;
let after = 0;
for (const [out, source, chars] of JOBS) {
  const input = await readFile(require.resolve(source));
  const output = await subsetFont(input, chars, { targetFormat: 'woff2' });
  await writeFile(new URL(out, OUT), output);
  before += input.length;
  after += output.length;
  console.log(`${out.padEnd(24)} ${kb(input.length)} -> ${kb(output.length)}`);
}
console.log(`${'total'.padEnd(24)} ${kb(before)} -> ${kb(after)}`);
```

- [ ] **Step 3: Run it**

Run: `npm run fonts`
Expected (under a second; matches docs/05 §5, total ≈ 143 KB):
```
archivo-wght-wdth.woff2    88.0 KB ->   52.9 KB
kufi-wght.woff2           120.8 KB ->   23.9 KB
plex-ar-400.woff2          41.8 KB ->   14.9 KB
plex-ar-600.woff2          44.6 KB ->   15.4 KB
plex-la-400.woff2          18.7 KB ->   12.7 KB
plex-la-600.woff2          20.0 KB ->   13.7 KB
plex-mono-500.woff2        14.5 KB ->    8.9 KB
total                     348.5 KB ->  142.4 KB
```
The output is deterministic: running it twice gives byte-identical files (so the hashed asset names stay stable).

- [ ] **Step 4: Replace `src/fonts.css`**

Families and file names are contract C5. Plex is **one** family (`Plex Atlas`) split by `unicode-range`, so a model code such as GMK6350 inside Arabic text uses Plex's own Latin. The fallback faces are tuned in Chrome on macOS against Arial (Latin) and Geeza Pro (Arabic; also on iOS). Where those local fonts are missing (Android), the fallback face fails to load and the browser moves on to `system-ui`, unadjusted. Each fallback face carries the same `unicode-range` as its web font: Arial also contains Arabic glyphs, and without the range it would draw Arabic with Archivo's metrics.

```css
/* Self-hosted subset fonts, built by `npm run fonts` (scripts/subset-fonts.mjs).
   The unicode-range lists below match the character sets in that script.
   LATIN:  U+0020-007E, U+00A0, U+00A9, U+00B0, U+00B7, U+00D7, U+2013-2014, U+2018-2019,
           U+201C-201D, U+2022, U+2026, U+202F, U+2191, U+2193
   ARABIC: U+060C, U+061B, U+061F, U+0621-063A, U+0640-0655, U+0660-066D, U+0670-0671, U+200C-200F */

/* Display, Latin and every numeral: Archivo with both axes (wght 100–900, wdth 62–125). */
@font-face {
  font-family: 'Archivo Atlas';
  src: url('./assets/fonts/archivo-wght-wdth.woff2') format('woff2');
  font-weight: 100 900;
  font-stretch: 62% 125%;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007E, U+00A0, U+00A9, U+00B0, U+00B7, U+00D7, U+2013-2014, U+2018-2019, U+201C-201D, U+2022, U+2026, U+202F, U+2191, U+2193;
}

/* Display, Arabic letters only: Noto Kufi Arabic (wght 100–900). */
@font-face {
  font-family: 'Kufi Atlas';
  src: url('./assets/fonts/kufi-wght.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+060C, U+061B, U+061F, U+0621-063A, U+0640-0655, U+0660-066D, U+0670-0671, U+200C-200F;
}

/* Body and UI in both scripts: IBM Plex Sans Arabic as ONE family, split by script. */
@font-face {
  font-family: 'Plex Atlas';
  src: url('./assets/fonts/plex-ar-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+060C, U+061B, U+061F, U+0621-063A, U+0640-0655, U+0660-066D, U+0670-0671, U+200C-200F;
}
@font-face {
  font-family: 'Plex Atlas';
  src: url('./assets/fonts/plex-ar-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+060C, U+061B, U+061F, U+0621-063A, U+0640-0655, U+0660-066D, U+0670-0671, U+200C-200F;
}
@font-face {
  font-family: 'Plex Atlas';
  src: url('./assets/fonts/plex-la-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007E, U+00A0, U+00A9, U+00B0, U+00B7, U+00D7, U+2013-2014, U+2018-2019, U+201C-201D, U+2022, U+2026, U+202F, U+2191, U+2193;
}
@font-face {
  font-family: 'Plex Atlas';
  src: url('./assets/fonts/plex-la-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007E, U+00A0, U+00A9, U+00B0, U+00B7, U+00D7, U+2013-2014, U+2018-2019, U+201C-201D, U+2022, U+2026, U+202F, U+2191, U+2193;
}

/* Specs: IBM Plex Mono 500, Latin only (Arabic words fall through to Plex Atlas). */
@font-face {
  font-family: 'Plex Mono Atlas';
  src: url('./assets/fonts/plex-mono-500.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007E, U+00A0, U+00A9, U+00B0, U+00B7, U+00D7, U+2013-2014, U+2018-2019, U+201C-201D, U+2022, U+2026, U+202F, U+2191, U+2193;
}

/* ── Metric-matched fallbacks ───────────────────────────────────────────
   While a web font loads (font-display: swap), text is drawn in a local system
   font scaled to the web font's average advance width (size-adjust) and given
   its ascent and descent, so lines keep their length and baseline when the web
   font swaps in (CLS ≤ 0.05). Measured in Chrome (macOS) against Arial and
   Geeza Pro; re-measure with the snippet in plan step A1.5 Step 7. */
@font-face {
  font-family: 'Archivo Fallback';
  src: local('Arial Bold'), local('Arial-BoldMT');
  font-weight: 100 900;
  size-adjust: 102.97%;
  ascent-override: 85.26%;
  descent-override: 20.39%;
  line-gap-override: 0%;
  unicode-range: U+0020-007E, U+00A0, U+00A9, U+00B0, U+00B7, U+00D7, U+2013-2014, U+2018-2019, U+201C-201D, U+2022, U+2026, U+202F, U+2191, U+2193;
}
@font-face {
  font-family: 'Kufi Fallback';
  src: local('Geeza Pro Bold'), local('GeezaPro-Bold');
  font-weight: 100 900;
  size-adjust: 123.63%;
  ascent-override: 103.69%;
  descent-override: 49.74%;
  line-gap-override: 0%;
  unicode-range: U+060C, U+061B, U+061F, U+0621-063A, U+0640-0655, U+0660-066D, U+0670-0671, U+200C-200F;
}
@font-face {
  font-family: 'Plex Fallback';
  src: local('Arial'), local('ArialMT');
  size-adjust: 100.17%;
  ascent-override: 108.32%;
  descent-override: 41.43%;
  line-gap-override: 0%;
  unicode-range: U+0020-007E, U+00A0, U+00A9, U+00B0, U+00B7, U+00D7, U+2013-2014, U+2018-2019, U+201C-201D, U+2022, U+2026, U+202F, U+2191, U+2193;
}
@font-face {
  font-family: 'Plex Fallback';
  src: local('Geeza Pro'), local('GeezaPro');
  size-adjust: 108.38%;
  ascent-override: 100.11%;
  descent-override: 38.29%;
  line-gap-override: 0%;
  unicode-range: U+060C, U+061B, U+061F, U+0621-063A, U+0640-0655, U+0660-066D, U+0670-0671, U+200C-200F;
}
```

Why these weights: display text is always 600–800, so `Archivo Fallback` and `Kufi Fallback` use the bold system faces and claim the whole weight range (no synthetic bold on top). `Plex Fallback` declares no weight, so 600 text gets the browser's synthetic bold, which is closer to Plex 600 than the regular face.

- [ ] **Step 5: Build and check the fonts are emitted**

Run: `npx vite build && ls dist/assets | grep woff2 && grep -o '@font-face' dist/assets/*.css | wc -l`
Expected: 7 font files, named `<C5 name>-<hash>.woff2` (Vite keeps the name, so Task A1.6 can find them), and 11 `@font-face` rules:
```
archivo-wght-wdth-<hash>.woff2
kufi-wght-<hash>.woff2
plex-ar-400-<hash>.woff2
plex-ar-600-<hash>.woff2
plex-la-400-<hash>.woff2
plex-la-600-<hash>.woff2
plex-mono-500-<hash>.woff2
      11
```

- [ ] **Step 6: Check the fonts render**

Run: `npm run dev`, open `http://localhost:5173/` in Chrome. In DevTools, select the Arabic H1, open the **Computed** tab and scroll to **Rendered Fonts**.
Expected: `Kufi Atlas` for the Arabic letters and `Archivo Atlas` for the spaces and the comma. On the readout «350 طن», the digits come from `Archivo Atlas` (condensed) and «طن» from `Kufi Atlas`. On the English body line: `Plex Atlas`.

- [ ] **Step 7: Verify the fallback metrics (and re-measure if a font changes)**

Keep the dev server running and the page open in **Chrome on macOS** (Arial and Geeza Pro are installed there). Paste this into the DevTools console. It loads each subset file under a probe name, measures a sample line against the local font with `canvas.measureText`, and prints the four values each fallback face should have. Probes avoid the `unicode-range` on the real faces, which would otherwise make the canvas report the space character's font.

```js
(async () => {
  const LA = 'From smaller cranes to the largest ones, every project has the right crane. Crane hire, heavy transport, handling and rigging, oil services.';
  const AR = 'من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة، تأجير الرافعات والنقل الثقيل والمناولة وخدمات النفط';
  const ctx = document.createElement('canvas').getContext('2d');
  const measure = (font, text) => {
    ctx.font = font;
    const m = ctx.measureText(text);
    return { w: m.width, a: m.fontBoundingBoxAscent, d: m.fontBoundingBoxDescent };
  };
  // [fallback face, subset file, weight, local font measured against, sample]
  const rows = [
    ['Archivo Fallback', 'archivo-wght-wdth', 800, '700 1000px Arial', LA],
    ['Kufi Fallback', 'kufi-wght', 800, '700 1000px "Geeza Pro"', AR],
    ['Plex Fallback (Latin)', 'plex-la-400', 400, '400 1000px Arial', LA],
    ['Plex Fallback (Arabic)', 'plex-ar-400', 400, '400 1000px "Geeza Pro"', AR],
  ];
  const out = {};
  for (const [name, file, weight, local, text] of rows) {
    const face = new FontFace(`probe-${file}`, `url(/src/assets/fonts/${file}.woff2)`, { weight: '100 900' });
    document.fonts.add(await face.load());
    const web = measure(`${weight} 1000px "probe-${file}"`, text);
    const sys = measure(local, text);
    const s = web.w / sys.w;
    out[name] = {
      'size-adjust': `${(s * 100).toFixed(2)}%`,
      'ascent-override': `${((web.a / 1000 / s) * 100).toFixed(2)}%`,
      'descent-override': `${((web.d / 1000 / s) * 100).toFixed(2)}%`,
    };
  }
  console.table(out);
})();
```

Expected table (matches `src/fonts.css`):

| face | size-adjust | ascent-override | descent-override |
|---|---|---|---|
| Archivo Fallback | 102.97% | 85.26% | 20.39% |
| Kufi Fallback | 123.63% | 103.69% | 49.74% |
| Plex Fallback (Latin) | 100.17% | 108.32% | 41.43% |
| Plex Fallback (Arabic) | 108.38% | 100.11% | 38.29% |

If any value differs from `src/fonts.css` by more than 0.5 percentage points (for example after a Fontsource update), copy the new values into `src/fonts.css`.

Then compare **rendered line heights** with the web font and with its fallback. Paste:

```js
for (const el of document.querySelectorAll('.t-h1, .t-body')) {
  const web = el.getBoundingClientRect().height;
  el.style.fontFamily = getComputedStyle(el).fontFamily.includes('Archivo')
    ? '"Archivo Fallback", "Kufi Fallback", system-ui'
    : '"Plex Fallback", system-ui';
  const fallback = el.getBoundingClientRect().height;
  el.style.fontFamily = '';
  console.log(el.className, el.lang || document.documentElement.lang, { web, fallback });
}
```

Expected: `web` and `fallback` are equal for all four elements (same number of lines; in the dry run at 1440 px: Arabic H1 213.14 / 213.14, English H1 107.84 / 107.84). If a pair differs, a line wrapped differently: lower that face's `size-adjust` by 1 percentage point, reload and re-check; repeat until equal. Also resize the window to 375 px wide and re-run the second snippet. Stop the server.

- [ ] **Step 8: Run the tests and type check**

Run: `npm test && npx tsc --noEmit`
Expected: `Tests  10 passed (10)`, no type errors.

- [ ] **Step 9: Commit (including the generated fonts)**

```bash
git add scripts/subset-fonts.mjs src/assets/fonts src/fonts.css
git commit -m "feat: subset and self-host fonts with metric-matched fallbacks" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A1.6: Per-page font preloads (`vite/font-preload.ts`)

**Files:**
- Create: `vite/font-preload.ts`
- Test: `vite/font-preload.test.ts`
- Modify: `vite.config.ts`

Like AFHAM's inline plugin, but per page and with the logic in a pure, tested function. AR page: `kufi-wght`, `plex-ar-400`, `archivo-wght-wdth`. EN page: `archivo-wght-wdth`, `plex-la-400`, `plex-la-600` (spec §4.5). The links are injected with Vite's tag API at the top of `<head>` (`head-prepend`): the browser requests them before it even sees the stylesheet. The `<meta charset>` stays well inside the first 1024 bytes.

- [ ] **Step 1: Write the failing test `vite/font-preload.test.ts`**

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { fontPreloadTags } from './font-preload';

const BUNDLE = [
  'assets/main-CoU9e-14.js',
  'assets/main-DJFV_b92.css',
  'assets/archivo-wght-wdth-BJLyxoHe.woff2',
  'assets/kufi-wght-Bf_xsutm.woff2',
  'assets/plex-ar-400-DPfaHKGf.woff2',
  'assets/plex-ar-600--Q2n8xaD.woff2',
  'assets/plex-la-400-BA30v0Pd.woff2',
  'assets/plex-la-600-DyUes8Yx.woff2',
  'assets/plex-mono-500-cj9RCqy4.woff2',
];

const hrefs = (path: string) => fontPreloadTags(path, BUNDLE).map((t) => t.attrs?.href);

describe('fontPreloadTags', () => {
  it('preloads Kufi, Plex Arabic 400 and Archivo on the Arabic page', () => {
    expect(hrefs('/index.html')).toEqual([
      '/assets/kufi-wght-Bf_xsutm.woff2',
      '/assets/plex-ar-400-DPfaHKGf.woff2',
      '/assets/archivo-wght-wdth-BJLyxoHe.woff2',
    ]);
  });

  it('preloads Archivo, Plex Latin 400 and Plex Latin 600 on the English page', () => {
    expect(hrefs('/en/index.html')).toEqual([
      '/assets/archivo-wght-wdth-BJLyxoHe.woff2',
      '/assets/plex-la-400-BA30v0Pd.woff2',
      '/assets/plex-la-600-DyUes8Yx.woff2',
    ]);
  });

  it('emits crossorigin font preload links at the top of <head>', () => {
    const [tag] = fontPreloadTags('/index.html', BUNDLE);
    expect(tag).toEqual({
      tag: 'link',
      attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: '/assets/kufi-wght-Bf_xsutm.woff2', crossorigin: true },
      injectTo: 'head-prepend',
    });
  });

  it('honours a non-root base path', () => {
    expect(fontPreloadTags('/en/index.html', BUNDLE, '/site/')[0].attrs?.href).toBe(
      '/site/assets/archivo-wght-wdth-BJLyxoHe.woff2',
    );
  });

  it('fails the build when a wanted font is missing from the bundle', () => {
    const withoutKufi = BUNDLE.filter((f) => !f.includes('kufi'));
    expect(() => fontPreloadTags('/index.html', withoutKufi)).toThrow(/kufi-wght/);
  });
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `npx vitest run vite`
Expected: FAIL, `Cannot find module './font-preload'`.

- [ ] **Step 3: Create `vite/font-preload.ts`**

```ts
import type { HtmlTagDescriptor, Plugin } from 'vite';

/**
 * The three font files each page preloads (spec §4.5), by the name they are
 * emitted under (`assets/<name>-<hash>.woff2`). The others load on demand
 * through unicode-range.
 */
const PRELOADS = {
  ar: ['kufi-wght', 'plex-ar-400', 'archivo-wght-wdth'],
  en: ['archivo-wght-wdth', 'plex-la-400', 'plex-la-600'],
} as const;

/** Builds the preload tags for one HTML page from the emitted bundle file names. */
export function fontPreloadTags(htmlPath: string, bundleFiles: string[], base = '/'): HtmlTagDescriptor[] {
  const lang = htmlPath.startsWith('/en/') ? 'en' : 'ar';
  return PRELOADS[lang].map((name) => {
    const file = bundleFiles.find((f) => f.endsWith('.woff2') && f.split('/').pop()!.startsWith(`${name}-`));
    if (!file) throw new Error(`font-preload: no emitted .woff2 for "${name}". Did src/fonts.css change?`);
    return {
      tag: 'link',
      attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `${base}${file}`, crossorigin: true },
      injectTo: 'head-prepend',
    };
  });
}

/** Vite plugin: adds the per-page font preloads to the built HTML (build only). */
export function fontPreload(): Plugin {
  let base = '/';
  return {
    name: 'atlas-font-preload',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        return { html, tags: fontPreloadTags(ctx.path, Object.keys(ctx.bundle), base) };
      },
    },
  };
}
```

- [ ] **Step 4: Run and watch it pass**

Run: `npx vitest run vite`
Expected: `Tests  5 passed (5)`.

- [ ] **Step 5: Wire it into `vite.config.ts` (full file)**

The local import uses the `.ts` extension: Vite 8 otherwise warns that the config "uses features that are unsupported by `configLoader: 'native'`".

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fontPreload } from './vite/font-preload.ts';

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Copy the build settings from `.env*` files into process.env, so that the
 * `define` below and the Node-side plugins see the same values as the client.
 * Values already in the shell environment win.
 */
function syncEnv(mode: string) {
  const all = loadEnv(mode, process.cwd(), '');
  for (const key of ['BUILD_TARGET', 'SITE_URL', 'VITE_SITE_URL', 'VITE_WHATSAPP', 'VITE_PHONE']) {
    if (all[key] && !process.env[key]) process.env[key] = all[key];
  }
  // SITE_URL is the documented name; the client reads it as VITE_SITE_URL.
  if (!process.env.VITE_SITE_URL && process.env.SITE_URL) process.env.VITE_SITE_URL = process.env.SITE_URL;
}

export default defineConfig(({ mode }) => {
  syncEnv(mode);
  const target = process.env.BUILD_TARGET === 'production' ? 'production' : 'staging';
  return {
    plugins: [react(), tailwindcss(), fontPreload()],
    resolve: { alias: { '@': path('./src') } },
    define: { __BUILD_TARGET__: JSON.stringify(target) },
    build: {
      rollupOptions: { input: { ar: path('./index.html'), en: path('./en/index.html') } },
    },
  };
});
```

- [ ] **Step 6: Build and check both pages**

Run: `npx tsc --noEmit && npx vite build && grep -o '<link rel="preload"[^>]*>' dist/index.html && echo --- && grep -o '<link rel="preload"[^>]*>' dist/en/index.html`
Expected (hashes differ):
```
<link rel="preload" as="font" type="font/woff2" href="/assets/kufi-wght-<hash>.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/plex-ar-400-<hash>.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/archivo-wght-wdth-<hash>.woff2" crossorigin>
---
<link rel="preload" as="font" type="font/woff2" href="/assets/archivo-wght-wdth-<hash>.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/plex-la-400-<hash>.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/plex-la-600-<hash>.woff2" crossorigin>
```
The build output must not contain the `configLoader: 'native'` warning.

- [ ] **Step 7: Commit**

```bash
git add vite/font-preload.ts vite/font-preload.test.ts vite.config.ts
git commit -m "build: preload each page's three fonts" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A1.7: Image manifest stub (unblocks Part B)

**Files:**
- Create: `src/generated/images.ts` (stub; Task A2.3's `npm run assets` overwrites it with the real manifest)

Part B's `src/content/types.ts` does `import type { PhotoId } from '@/generated/images'` (contract C7), but the real file is generated in Part A2, which runs after B. This stub has the exact C6 declarations and an empty `images` object, so `npx tsc --noEmit` passes during Part B. If Part B's plan also creates this stub, keep one copy; the content is the same.

- [ ] **Step 1: Create `src/generated/images.ts`**

```ts
// STUB until Task A2.3: scripts/build-assets.mjs overwrites this file with the real manifest.
// It exists so Part B's `import type { PhotoId } from '@/generated/images'` type-checks.
export type PhotoId = '6359'|'6360'|'6363'|'6364'|'6374'|'6375'|'6376'|'6379'|'6380'|'6382'|'6385'|'6388'|'6389'|'6392'|'6393'|'6395'|'6396'|'6397'|'6398';
export type CropName = 'desktop_16x9' | 'mobile_4x5' | 'mobile_9x16';
export interface ImageSource { url: string; width: number }
export interface CropImage {
  photo: PhotoId; crop: CropName;
  rect: { left: number; top: number; width: number; height: number }; // in source pixels
  avif: ImageSource[]; webp: ImageSource[];                          // ascending width
  hook: { x: number; y: number } | null;                            // source-pixel hook point, if any
}

export const images: Partial<Record<`${PhotoId}:${CropName}`, CropImage>> = {};

export function getImage(photo: PhotoId, crop: CropName): CropImage {
  const image = images[`${photo}:${crop}`];
  if (!image) throw new Error(`No image ${photo}:${crop}. Run npm run assets (Task A2.3).`);
  return image;
}
```

- [ ] **Step 2: Type-check, test, build**

Run: `npx tsc --noEmit && npm test && npx vite build`
Expected: no type errors, `Tests  15 passed (15)`, `✓ built`.

- [ ] **Step 3: Commit**

```bash
git add src/generated/images.ts
git commit -m "chore: add image manifest stub so content types compile" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Part A1 done when

- `npm test` → 15 passed; `npx tsc --noEmit` → clean; `npx vite build` → two pages, 7 fonts, 3 preloads per page.
- `git log --oneline` shows 7 new commits (A1.1–A1.7).

### Proposed contract additions (Part A1)

1. **`tsconfig.json`: `"allowImportingTsExtensions": true`.** `vite.config.ts` imports `./vite/*.ts` (and `vite/truth-gate.ts` imports `../src/lib/truth.ts`) with the `.ts` extension to avoid Vite 8's native-config-loader warning. App code can keep extensionless imports.
2. **Task A1.7: stub `src/generated/images.ts`** (exact C6 declarations, `images = {}`), created in A1 so Part B type-checks before A2.3 generates the real file.
3. **Theme reset in `src/styles.css`:** Tailwind's default palette (`--color-*: initial`) and default shadow scales are cleared. Only the C4 colours and the single `--shadow-bar` token (utility `shadow-bar`, spec §15.6) exist. Other parts must not use default Tailwind colours or shadows (they compile to nothing).
4. **`body` base font size and line height** use the `.t-body` values (EN 16→17 px / 1.6, AR 17→18 px / 1.85). Base also sets `:lang(ar) { text-transform: none !important }` next to the C4 letter-spacing rule (global rule 5).
5. **`vite.config.ts` reads `.env` files too:** `syncEnv` copies `BUILD_TARGET`, `SITE_URL`, `VITE_SITE_URL`, `VITE_WHATSAPP` and `VITE_PHONE` from `.env*` into `process.env` (shell wins), then applies C3's `SITE_URL → VITE_SITE_URL` mapping. C3's semantics are unchanged.
6. **Vitest `include`** also covers `vite/**/*.test.ts` and `scripts/**/*.test.mjs` (global rule 8 names only `src/**`).


---

## Part B — Content, data and core library (Day 2)

**Depends on:** A1 is finished: `package.json` (C1), the `@/` alias (C2), `src/env.ts` (C3), a Vitest config that defines `__BUILD_TARGET__` as `"staging"`, and the C6 stub `src/generated/images.ts` (A1.7, contract C11). Part B runs **before** A2, which overwrites that stub with the real manifest. `ar.ts`, `en.ts` and `cranes.ts` must keep the named exports `ar`, `en` and `cranes`, because A2's truth gate loads them (C11).

**Produces:** `src/content/*` and `src/lib/*`, exactly as contracts C7 and C8 describe, covered by Vitest.

**Conventions in this part**
- A test that touches `window` or `document` starts with the docblock `// @vitest-environment jsdom`. It then runs in jsdom whatever the global Vitest config says.
- `[[TOKEN]]` marks a fact Atlas has not supplied yet. It stays in the copy **verbatim**. The truth gate (A2) reports every `[[` and blocks a production build.
- `{name}` marks a runtime variable, filled by `fillTemplate()` (B.6). The copy deck sometimes wrote a runtime value as a token (`[[PHONE]]` comes from `env.phone` at runtime) or used language-suffixed names (`{class_ar}`). B.2 normalises these; the full list is in B.2 under "Normalisations".
- Spec §15 (Impeccable amendments) wins over the copy deck. The deck's "Eyebrow" strings are stored as **lead lines** that render *below* their heading (`hero.servicesLine`, `form.lead`). The deck's Hoist section label «السعة» is not stored, because it would only ever sit above a heading.

---

### Task B.1: Content types (`src/content/types.ts`)

**Files:**
- Create: `src/content/types.ts`
- Create (only if A1.7's stub is missing): `src/generated/images.ts` (C6-conformant stub; A2 overwrites it)

- [ ] **Step 1: Check whether the image manifest exists yet**

Run: `ls src/generated/images.ts`
Expected: `src/generated/images.ts` (A1.7 wrote the stub, C11). Then **skip Step 2**. Only if `ls` reports `No such file or directory` do you write the stub in Step 2.

- [ ] **Step 2: Write the C6 stub (only if Step 1 found no file)**

Create `src/generated/images.ts`:
```ts
// STUB written by Part B (B.1) so `tsc` passes before the image pipeline exists.
// scripts/build-assets.mjs (A2) overwrites this whole file. Do not edit by hand.
export type PhotoId =
  | '6359' | '6360' | '6363' | '6364' | '6374' | '6375' | '6376' | '6379' | '6380' | '6382'
  | '6385' | '6388' | '6389' | '6392' | '6393' | '6395' | '6396' | '6397' | '6398';
export type CropName = 'desktop_16x9' | 'mobile_4x5' | 'mobile_9x16';
export interface ImageSource { url: string; width: number }
export interface CropImage {
  photo: PhotoId;
  crop: CropName;
  rect: { left: number; top: number; width: number; height: number };
  avif: ImageSource[];
  webp: ImageSource[];
  placeholder: string;
  hook: { x: number; y: number } | null;
}
export const images: Partial<Record<`${PhotoId}:${CropName}`, CropImage>> = {};
export function getImage(photo: PhotoId, crop: CropName): CropImage {
  const image = images[`${photo}:${crop}`];
  if (!image) throw new Error(`No image for ${photo}:${crop}. Run npm run assets.`);
  return image;
}
```

- [ ] **Step 3: Write the content types**

Create `src/content/types.ts`:
```ts
import type { PhotoId } from '@/generated/images';

/* ------------------------------------------------------------------ */
/* Fixed by contract C7                                                */
/* ------------------------------------------------------------------ */

export type Lang = 'ar' | 'en';
export type CraneId = 'rt700e' | 'atf60-3' | 'ac200-1' | 'quy250' | 'gmk6350' | 'cke2500';
export type CraneType = 'rough-terrain' | 'all-terrain' | 'crawler';

export interface Crane {
  id: CraneId;
  make: string;
  model: string;
  type: CraneType;
  capacityT: number; // manufacturer max rating used on the site
  hoistPhoto: PhotoId;
  cardPhoto: PhotoId;
  verified: boolean; // Atlas confirmed ownership + capacity
  hidden: boolean; // never rendered (cke2500)
}

export interface DocumentFile {
  id: string; // one of DocumentSlot below
  href: string;
  lang: 'ar' | 'en' | 'both';
  date: string; // YYYY-MM-DD
}

export interface SiteInfo {
  email: string; // 'atlasalsahralibya@gmail.com'
  facebook: string; // the share URL from the brief
  address: { ar: string; en: string } | null;
  documents: DocumentFile[]; // [] until real files exist
}

/* ------------------------------------------------------------------ */
/* Part B additions                                                    */
/* ------------------------------------------------------------------ */

/** Service rows, form options and footer links share these ids (copy deck §5). */
export type ServiceId = 'crane-hire' | 'heavy-transport' | 'handling' | 'oil-services';

/** Capacity bands (copy deck §6). C9 filter values are `band:${CapacityBand}`. */
export type CapacityBand = '0-60' | '61-200' | '201+';

/** Duration choices in the request form. No choice (value '') shows `unsure`. */
export type DurationId = 'day' | 'week' | 'month' | 'long';

/** Document slots (copy deck §8b). `DocumentFile.id` uses these values. */
export type DocumentSlot = 'profile' | 'fleet-list' | 'inspection' | 'hse' | 'iso' | 'insurance' | 'cr';

export type SiteGalleryId = 'construction' | 'coast';
export interface SiteGallery {
  id: SiteGalleryId;
  photos: readonly PhotoId[];
}

export interface ServiceCopy {
  id: ServiceId;
  title: string;
  body: string;
  /** A whole sentence that ships only once Atlas confirms it (deck "Add if confirmed"). */
  confirm?: string;
}

export interface CraneTypeCopy {
  full: string; // "Rough-terrain crane"
  chip: string; // "Rough-terrain"
  explainer: string; // one line
}

export interface FieldCopy {
  label: string;
  hint: string;
}

/**
 * Every string the site renders. `ar.ts` and `en.ts` both satisfy this type,
 * so a missing line fails type-checking. `{x}` = runtime variable (fillTemplate),
 * `[[X]]` = fact Atlas has not supplied (blocked by the truth gate).
 */
export interface Copy {
  lang: Lang;

  /** Fixed by C7. Copy deck §1. */
  meta: { title: string; description: string; ogTitle: string; ogDescription: string; ogImageAlt: string };

  /** Copy deck §2. */
  header: {
    skipLink: string;
    homeLabel: string; // logo link aria-label
    name: string; // typeset name beside the badge
    nameAlt: string; // the same name in the other language (second line of the lockup)
    nav: { services: string; cranes: string; sites: string; contact: string };
    langSwitch: { text: string; label: string }; // both in the OTHER language
    request: string;
    call: { text: string; label: string }; // label has {phone}
    menu: { open: string; close: string; whatsapp: string };
  };

  /** Copy deck §3 + spec §5.2 and §15.1. */
  hero: {
    h1Lead: string; // first clause, set smaller
    h1Main: string; // second clause, set large
    servicesLine: string; // renders BELOW the H1 (deck "Eyebrow"; spec §15.1)
    whatsapp: string; // the button on the sling
    browse: string; // secondary button → #cranes (spec §5.2)
  };

  /** Copy deck §4 "Class names". Used by the Hoist, the grid, the form and template B. */
  craneTypes: Record<CraneType, CraneTypeCopy>;

  /** Copy deck §4 (the Capacity Scale is the Hoist). */
  hoist: {
    title: string;
    intro: string;
    listHeading: string; // visually hidden heading of the <ol>
    skipToList: string; // "See all cranes" skip link → #crane-list (spec §14)
    capacity: string; // data label inside each load tag
    model: string;
    type: string;
    unit: string; // 'طن' | 't'
    footnote: string;
    closing: string;
    closingButton: string;
  };

  /** Copy deck §5. */
  services: {
    title: string;
    intro: string;
    ask: string; // link → WhatsApp template C
    items: readonly [ServiceCopy, ServiceCopy, ServiceCopy, ServiceCopy];
  };

  /** Copy deck §6 + spec §15.8 (empty state). */
  grid: {
    title: string;
    intro: string;
    availability: string;
    typeLabel: string;
    bandLabel: string;
    all: string;
    bands: Record<CapacityBand, string>; // {min} / {max} are formatted numbers
    count: { one: string; two: string; few: string; many: string }; // few = 3–10, many = 11+
    empty: string;
    showAll: string;
    card: { type: string; capacity: string; request: string; formLink: string }; // the model code is the card's heading
  };

  /** Copy deck §7. */
  sites: {
    title: string;
    intro: string;
    galleries: Record<SiteGalleryId, string>;
    swipeHint: string;
    open: string;
    prev: string;
    next: string;
    counter: string; // {i} / {n}
    close: string;
    captions: Partial<Record<PhotoId, string>>;
  };

  /** Copy deck §8b. Rendered only when siteInfo.documents is not empty. */
  documents: {
    title: string;
    intro: string;
    meta: string; // {language} {date}
    languages: { ar: string; en: string; both: string };
    download: string;
    emailRequest: string;
    emailSubject: string; // {document}
    names: Record<DocumentSlot, string>;
  };

  /** Copy deck §9 + spec §5.8 and §15.1. */
  form: {
    title: string; // the dialect question (spec §5.8)
    lead: string; // the dialect line, BELOW the title (deck "Eyebrow"; spec §15.1)
    intro: string;
    contact: { email: string; phone: string; whatsapp: string; address: string; facebook: string };
    groups: { details: string; lift: string; site: string };
    required: string;
    optional: string;
    submit: string;
    busy: string;
    whatsappAlt: string;
    privacy: string;
    errorSummary: string;
    fields: {
      name: FieldCopy & { tooLong: string };
      company: FieldCopy & { tooLong: string };
      phone: FieldCopy & { empty: string; format: string };
      crane: FieldCopy & { unsure: string; servicesGroup: string; cranesGroup: string };
      weight: FieldCopy & { unit: string; empty: string; format: string };
      radius: FieldCopy & { unit: string; format: string };
      height: FieldCopy & { unit: string; format: string };
      site: FieldCopy & { tooLong: string };
      start: FieldCopy & { past: string };
      duration: FieldCopy & { unsure: string; options: Record<DurationId, string> };
      message: FieldCopy & { counter: string; tooLong: string }; // counter: {n} / {max}
    };
    success: { title: string; text: string; nudge: string; button: string }; // text has {phone}
    failure: { title: string; text: string; retry: string; whatsapp: string; email: string; offline: string };
    emailSubject: string; // {crane}
  };

  /** Copy deck §10. Multi-line templates joined with '\n'. */
  whatsapp: {
    general: string; // A
    crane: string; // B: {model} {class}
    service: string; // C: {service}
    request: string; // D: one line per form field; lines with an empty field are dropped
    followUp: string; // E: {name} {phone}
  };

  /** Copy deck §10 "Floating WhatsApp button" + spec §5 RequestBar. */
  bar: {
    onHook: string;
    clear: string; // aria-label of the chip's Close icon button
    whatsapp: string; // visible
    whatsappLabel: string; // accessible name (contains the visible text)
    tooltip: string; // shown as a line of text on desktop
  };

  /** Copy deck §11. */
  footer: {
    name: string;
    legalName: string;
    tagline: string;
    servicesHeading: string;
    pageHeading: string;
    pageLinks: { cranes: string; sites: string; request: string };
    contactHeading: string;
    followHeading: string;
    facebook: string;
    copyright: string; // {year}
    backToTop: string;
  };

  /** Copy deck §12. Kobelco photos are not PhotoIds, so they cannot appear here. */
  alt: Record<PhotoId, string>;

  misc: {
    draftBadge: string; // spec §4.3
    newTab: string;
  };
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no output, exit code 0.

- [ ] **Step 5: Commit**

The stub is committed only if A1 did not gitignore `src/generated/`.
```bash
git add src/content/types.ts
git check-ignore -q src/generated/images.ts || git add src/generated/images.ts
git commit -m "feat(content): add content and copy types" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task B.2: Arabic and English copy (`ar.ts`, `en.ts`) with structure tests

**Files:**
- Create: `src/content/ar.ts`
- Create: `src/content/en.ts`
- Test: `src/content/copy.test.ts`

**Normalisations** (the spec and contracts win over the deck; tell the agency in the handover):
1. Runtime values: `[[PHONE]]` in the Call `aria-label` → `{phone}` (from `env.phone`; the Call control is not rendered without it). The deck's contact lines `الهاتف: [[PHONE]]`, `واتساب: [[WHATSAPP]]` and `البريد الإلكتروني: atlas…` are split into a label (`form.contact.*`) and a value read from `env` / `siteInfo`.
2. Template variables: `{class_ar}` / `{class_en}` → `{class}`; `{service_ar}` / `{service_en}` → `{service}`; `{crane_or_service}` → `{crane}`; `{start_date}` → `{start}`. Template D's variables are now exactly the form's field names (C9).
3. Numbers move out of strings so they go through `formatNumber` / `formatTonnes` (global rule 4): band chips use `{min}` / `{max}`, result counts use `{n}` (EN "1 crane" → `{n} crane`), the message counter is `{n} / {max}`.
4. Documents meta drops `{size}`: `DocumentFile` (C7) has no size.
5. Spec overrides: hero button 2 = «تصفّح الرافعات» / "Browse cranes"; the H1 is split into `h1Lead` + `h1Main`; the form title is «شنو الرافعة اللي يحتاجها مشروعك؟»; the deck eyebrows become lead lines below headings (§15.1); the grid empty state and "Show all" use §15.8's wording.

**New UI strings not in the deck** (flag them for the copy review):
- `hoist.listHeading`: «الرافعات من الأصغر إلى الأكبر» / "Cranes from smallest to largest"
- `hoist.skipToList`: «عرض كل الرافعات» / "See all cranes" (EN from spec §14)
- `form.title` EN: "Which crane does your project need?"
- `bar.onHook` EN: "On the hook:" (AR from spec §5.5)
- `bar.clear`: «إزالة الرافعة من الطلب» / "Remove this crane from the request"
- `misc.draftBadge` AR: «مسودة · غير مؤكد» (EN from spec §4.3)

**Deck strings deliberately not carried** (no element renders them in this build): hero sub-line, scroll cue and capacity chip; the «السعة» section label (§15.1); "Capacity: ask us"; the card's "Model" label (the model code is the card heading, and a label above a heading is banned by §15.1); card units / main boom / load chart rows and the card's WhatsApp `aria-label` (the card button puts the crane on the hook instead, spec §5.5); the whole §8a "Why Atlas" block; contact hours and map link; the success reply-time line; the registration line; the gallery "All" tab.

- [ ] **Step 1: Write the failing test**

Create `src/content/copy.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { ar } from './ar';
import { en } from './en';

interface Leaf {
  path: string;
  value: string;
}

function leaves(value: unknown, path = ''): Leaf[] {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => leaves(item, path ? `${path}.${key}` : key));
  }
  return [];
}

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, shape(record[key])]));
  }
  return typeof value;
}

const placeholders = (text: string) => Array.from(text.matchAll(/\{(\w+)\}/g), (m) => m[1] ?? '').sort();

/** Arabic singular and dual name the number in words, so they carry no {n}. */
const PLURAL_WORDS = new Set(['grid.count.one', 'grid.count.two']);

const REQUEST_FIELDS = ['name', 'company', 'phone', 'crane', 'weight', 'radius', 'height', 'site', 'start', 'duration', 'message'];

describe('copy', () => {
  it('has the same key structure in both languages', () => {
    expect(shape(en)).toEqual(shape(ar));
  });

  it('has no empty strings', () => {
    for (const { path, value } of [...leaves(ar), ...leaves(en)]) {
      expect(value.trim().length, path).toBeGreaterThan(0);
    }
  });

  it('uses Atlas’s own tagline as the H1', () => {
    expect(`${ar.hero.h1Lead} ${ar.hero.h1Main}`).toBe('من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة');
    expect(`${en.hero.h1Lead} ${en.hero.h1Main}`).toBe('From smaller cranes to the largest ones, every project has the right crane.');
  });

  it('uses the same {placeholders} in both languages', () => {
    const english = new Map(leaves(en).map((leaf) => [leaf.path, leaf.value]));
    for (const { path, value } of leaves(ar)) {
      if (PLURAL_WORDS.has(path)) continue;
      expect(placeholders(english.get(path) ?? ''), path).toEqual(placeholders(value));
    }
  });

  it('gives every template the runtime variables it needs', () => {
    for (const copy of [ar, en]) {
      expect(placeholders(copy.whatsapp.crane)).toEqual(['class', 'model']);
      expect(placeholders(copy.whatsapp.service)).toEqual(['service']);
      expect(placeholders(copy.whatsapp.followUp)).toEqual(['name', 'phone']);
      expect(placeholders(copy.whatsapp.request)).toEqual([...REQUEST_FIELDS].sort());
      expect(placeholders(copy.header.call.label)).toEqual(['phone']);
      expect(placeholders(copy.form.success.text)).toEqual(['phone']);
    }
  });

  it('keeps runtime values out of [[tokens]]', () => {
    for (const { path, value } of [...leaves(ar), ...leaves(en)]) {
      expect(value, path).not.toMatch(/\[\[(PHONE|WHATSAPP|WHATSAPP_INTL)\]\]/);
    }
  });

  it('uses no letter-spacing hacks in Arabic strings', () => {
    const arabic = leaves(ar).filter(({ value }) => /[؀-ۿ]/.test(value));
    expect(arabic.length).toBeGreaterThan(100);
    for (const { path, value } of arabic) {
      expect(value, path).not.toMatch(/ـ/); // tatweel stretching
      expect(value, path).not.toMatch(/[  ​]/); // thin, hair or zero-width spaces as tracking
      expect(value, path).not.toMatch(/(?:[؀-ۿA-Za-z] ){3,}/); // s p a c e d letters
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/content/copy.test.ts`
Expected: FAIL with `Failed to resolve import "./ar" from "src/content/copy.test.ts"` (the files do not exist yet).

- [ ] **Step 3: Write the Arabic copy**

Create `src/content/ar.ts`:
```ts
import type { Copy } from './types';

// Transcribed verbatim from docs/03-copy-deck.md (section numbers in comments).
// Normalisations and new strings are listed in the plan, Part B, task B.2.
// Do not reword here without updating the deck.

export const ar: Copy = {
  lang: 'ar',

  // §1
  meta: {
    title: 'أطلس الصحراء | تأجير الرافعات والنقل الثقيل في ليبيا',
    description:
      'تأجير الرافعات (الكرينات) من الصغيرة إلى الكبيرة، ونقل ثقيل ومناولة وخدمات نفطية في ليبيا. أرسل وزن الحمولة وموقع العمل عبر واتساب.',
    ogTitle: 'أطلس الصحراء: لكل مشروع رافعته المناسبة',
    ogDescription: 'تأجير الرافعات والنقل الثقيل والمناولة والخدمات النفطية. أخبرنا بحمولتك، ونخبرك بالرافعة التي تناسبها.',
    ogImageAlt: 'رافعتان صفراوان منصوبتان جنباً إلى جنب على الشاطئ وذراعاهما مرفوعان نحو سماء زرقاء.',
  },

  // §2
  header: {
    skipLink: 'انتقل إلى المحتوى',
    homeLabel: 'أطلس الصحراء، العودة إلى أعلى الصفحة',
    name: 'أطلس الصحراء',
    nameAlt: 'Atlas Alshraa',
    nav: { services: 'الخدمات', cranes: 'الرافعات', sites: 'مواقع العمل', contact: 'تواصل معنا' },
    langSwitch: { text: 'English', label: 'View this page in English' },
    request: 'اطلب رافعة',
    call: { text: 'اتصل', label: 'اتصل بنا على {phone}' },
    menu: { open: 'القائمة', close: 'إغلاق القائمة', whatsapp: 'راسلنا على واتساب' },
  },

  // §3 + spec §5.2, §15.1
  hero: {
    h1Lead: 'من الرافعات الصغيرة للكبيرات،',
    h1Main: 'لكل مشروع رافعته المناسبة',
    servicesLine: 'تأجير الرافعات · النقل الثقيل · المناولة · الخدمات النفطية',
    whatsapp: 'راسلنا على واتساب',
    browse: 'تصفّح الرافعات',
  },

  // §4 class names
  craneTypes: {
    'rough-terrain': {
      full: 'رافعة للأراضي الوعرة',
      chip: 'أراضٍ وعرة',
      explainer: 'تعمل على الأرض غير الممهدة داخل موقع العمل.',
    },
    'all-terrain': {
      full: 'رافعة لكل التضاريس',
      chip: 'كل التضاريس',
      explainer: 'تسير على الطرق العامة وتعمل في الموقع.',
    },
    crawler: {
      full: 'رافعة مجنزرة',
      chip: 'مجنزرة',
      explainer: 'تتحرك على جنازير توزّع وزنها على الأرض، للرفعات الثقيلة.',
    },
  },

  // §4
  hoist: {
    title: 'اختر رافعتك حسب السعة',
    intro: 'مرّر لترى الرافعات مرتّبة من الأصغر إلى الأكبر. الرقم الكبير هو أقصى حمولة لكل رافعة.',
    listHeading: 'الرافعات من الأصغر إلى الأكبر',
    skipToList: 'عرض كل الرافعات',
    capacity: 'أقصى حمولة',
    model: 'الطراز',
    type: 'الفئة',
    unit: 'طن',
    footnote:
      'أقصى حمولة هي تصنيف الشركة المصنّعة عند أقصر نصف قطر. ما ترفعه الرافعة في موقعك يعتمد على نصف القطر والارتفاع، لذلك نسألك عنهما.',
    closing: 'لست متأكداً من الحجم؟ أرسل لنا تفاصيل الحمولة ونختار معك.',
    closingButton: 'أرسل التفاصيل',
  },

  // §5
  services: {
    title: 'خدماتنا',
    intro: 'أربع خدمات في شركة واحدة. اطلب خدمة واحدة، أو اجمع أكثر من خدمة في طلب واحد.',
    ask: 'اسأل عن هذه الخدمة',
    items: [
      {
        id: 'crane-hire',
        title: 'تأجير الرافعات',
        body: 'رافعات للإيجار، من الرافعات الصغيرة إلى الكبيرة. أرسل لنا وزن الحمولة ونصف القطر وارتفاع الرفع، ونقترح عليك الرافعة المناسبة لعملك.',
        confirm: '[[CONFIRM: كل رافعة تأتي مع مشغّل ذي خبرة.]]',
      },
      {
        id: 'heavy-transport',
        title: 'النقل الثقيل',
        body: 'ننقل الأحمال الثقيلة والمعدات الكبيرة [[CONFIRM: براً، على مقطورات منخفضة (لوبد)]]. أخبرنا بنوع الحمولة ووزنها ووجهتها، ونخطط معك لعملية النقل.',
      },
      {
        id: 'handling',
        title: 'المناولة',
        body: 'نرفع الأحمال ونربطها ونحرّكها داخل موقع العمل [[CONFIRM: فريق ربط، ومعدات الربط والرفع، وخطة رفع]]. اطلب المناولة وحدها، أو مع تأجير الرافعة والنقل في طلب واحد.',
      },
      {
        id: 'oil-services',
        title: 'الخدمات النفطية',
        body: 'خدمات مساندة لأعمال النفط والغاز [[CONFIRM: النطاق بالتحديد، مثل الرفع والنقل في الحقول]]. أخبرنا بطبيعة العمل وموقعه، ونجيبك بوضوح عمّا نستطيع تقديمه.',
      },
    ],
  },

  // §6 + spec §15.8
  grid: {
    title: 'اعثر على رافعتك',
    intro: 'صنّف الرافعات حسب النوع أو السعة، ثم اطلب الرافعة التي تناسبك عبر واتساب بضغطة واحدة.',
    availability: 'أخبرنا بالتاريخ، ونؤكد لك التوفر.',
    typeLabel: 'النوع',
    bandLabel: 'السعة',
    all: 'الكل',
    bands: {
      '0-60': 'حتى {max}',
      '61-200': 'من {min} إلى {max}',
      '201+': 'أكثر من {min}',
    },
    count: { one: 'رافعة واحدة', two: 'رافعتان', few: '{n} رافعات', many: '{n} رافعة' },
    empty: 'لا توجد رافعة بهذا التصنيف.',
    showAll: 'اعرض الكل',
    card: {
      type: 'النوع',
      capacity: 'أقصى حمولة',
      request: 'اطلب هذه الرافعة',
      formLink: 'أو استخدم نموذج الطلب',
    },
  },

  // §7
  sites: {
    title: 'من مواقع العمل',
    intro: 'كل الصور في هذه الصفحة حقيقية، التُقطت في موقعين: موقع إنشاءات وموقع ساحلي.',
    galleries: { construction: 'موقع إنشاءات', coast: 'موقع ساحلي' },
    swipeHint: 'اسحب لرؤية المزيد',
    open: 'تكبير الصورة',
    prev: 'السابق',
    next: 'التالي',
    counter: '{i} من {n}',
    close: 'إغلاق',
    captions: {
      '6398': 'موقع ساحلي · رافعتان على مساندهما فوق الرمل',
      '6364': 'موقع ساحلي · المساند ممدودة وحزام الرفع على الخطاف',
      '6360': 'موقع ساحلي · ثقلا الموازنة لرافعتين جنباً إلى جنب',
      '6395': 'موقع ساحلي · رافعة لكل التضاريس بجانب مقطورة قلّابة',
      '6396': 'موقع ساحلي · رافعة لكل التضاريس والبحر خلفها',
      '6397': 'موقع ساحلي · المساند على قواعدها قرب البحر',
      '6380': 'موقع إنشاءات · رافعة مجنزرة بجانب مبنى من عدة طوابق',
      '6385': 'موقع إنشاءات · رافعة مجنزرة وكتل الموازنة مركّبة',
      '6388': 'موقع إنشاءات · رافعة لكل التضاريس على قواعد المساند بجانب السقالات',
      '6389': 'موقع إنشاءات · الذراع مرفوع والخطاف جاهز',
      '6375': 'موقع إنشاءات · المساند على ألواح فولاذية',
      '6376': 'موقع إنشاءات · كابينة المشغّل وبابها مفتوح',
    },
  },

  // §8b
  documents: {
    title: 'وثائق التأهيل المسبق',
    intro: 'لفرق المشتريات والتأهيل. حمّل الملفات، أو اطلبها بالبريد الإلكتروني.',
    meta: 'PDF · {language} · آخر تحديث {date}',
    languages: { ar: 'عربي', en: 'إنجليزي', both: 'عربي وإنجليزي' },
    download: 'تحميل',
    emailRequest: 'اطلبه بالبريد',
    emailSubject: 'طلب وثيقة: {document}',
    names: {
      profile: 'ملف الشركة',
      'fleet-list': 'قائمة الرافعات وسعاتها',
      inspection: 'شهادات الفحص من طرف ثالث',
      hse: 'سياسة الصحة والسلامة والبيئة',
      iso: 'شهادات ISO',
      insurance: 'شهادة التأمين',
      cr: 'السجل التجاري',
    },
  },

  // §9 + spec §5.8, §15.1
  form: {
    title: 'شنو الرافعة اللي يحتاجها مشروعك؟',
    lead: 'تواصلوا معانا وخلي الباقي علينا',
    intro: 'املأ ما تعرفه فقط. نحتاج رقم هاتفك ووزن الحمولة، وسنسألك عن الباقي.',
    contact: {
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      whatsapp: 'واتساب',
      address: 'العنوان',
      facebook: 'صفحتنا على فيسبوك',
    },
    groups: { details: 'بياناتك', lift: 'تفاصيل الرفع', site: 'الموقع والموعد' },
    required: 'مطلوب',
    optional: 'اختياري',
    submit: 'أرسل الطلب',
    busy: 'جارٍ الإرسال…',
    whatsappAlt: 'أو أرسل التفاصيل نفسها عبر واتساب',
    privacy: 'نستخدم بياناتك للرد على طلبك فقط. [[CONFIRM]]',
    errorSummary: 'بعض الحقول تحتاج إلى تصحيح. راجع الرسائل أدناه، ثم أرسل مرة أخرى.',
    fields: {
      name: {
        label: 'الاسم',
        hint: 'كما تحب أن نناديك.',
        tooLong: 'الاسم طويل جداً. اكتبه في 80 حرفاً أو أقل.',
      },
      company: {
        label: 'الشركة',
        hint: 'اسم الشركة أو الجهة، إن وُجد.',
        tooLong: 'الاسم طويل جداً. اكتبه في 120 حرفاً أو أقل.',
      },
      phone: {
        label: 'رقم الهاتف أو واتساب',
        hint: 'نتصل بك أو نراسلك على هذا الرقم. أضف رمز الدولة إن كنت خارج ليبيا.',
        empty: 'أدخل رقم هاتف لنتواصل معك.',
        format: 'يبدو أن الرقم غير مكتمل. تأكد من الأرقام وحاول مرة أخرى.',
      },
      crane: {
        label: 'الرافعة أو الخدمة',
        hint: 'إن ضغطت «اطلب هذه الرافعة»، ستجدها مختارة هنا.',
        unsure: 'لست متأكداً، ساعدوني في الاختيار',
        servicesGroup: 'الخدمات',
        cranesGroup: 'الرافعات',
      },
      weight: {
        label: 'وزن الحمولة (طن)',
        hint: 'يكفي رقم تقريبي.',
        unit: 'طن',
        empty: 'أدخل وزن الحمولة بالطن. يكفي رقم تقريبي.',
        format: 'أدخل رقماً أكبر من صفر، مثل 12 أو 7.5',
      },
      radius: {
        label: 'نصف قطر الرفع (م)',
        hint: 'المسافة الأفقية من مركز الرافعة إلى الحمولة. اتركه فارغاً إن لم تعرفه.',
        unit: 'م',
        format: 'أدخل رقماً بالمتر، أو اترك الحقل فارغاً.',
      },
      height: {
        label: 'ارتفاع الرفع (م)',
        hint: 'أعلى نقطة يجب أن تصل إليها الحمولة، من سطح الأرض.',
        unit: 'م',
        format: 'أدخل رقماً بالمتر، أو اترك الحقل فارغاً.',
      },
      site: {
        label: 'موقع العمل',
        hint: 'المدينة أو المنطقة. يمكنك لصق رابط من خرائط جوجل.',
        tooLong: 'النص طويل جداً. اختصره إلى 200 حرف.',
      },
      start: {
        label: 'تاريخ البدء',
        hint: 'متى تحتاج الرافعة في الموقع؟',
        past: 'اختر تاريخ اليوم أو تاريخاً لاحقاً.',
      },
      duration: {
        label: 'المدة',
        hint: 'تقديرك يكفي.',
        unsure: 'لا أعرف بعد',
        options: {
          day: 'يوم واحد أو أقل',
          week: 'من يومين إلى أسبوع',
          month: 'من أسبوع إلى شهر',
          long: 'أكثر من شهر',
        },
      },
      message: {
        label: 'رسالة',
        hint: 'أي تفاصيل أخرى: نوع الحمولة ومقاساتها، وصعوبة الوصول إلى الموقع، وهل تحتاج إلى نقل أيضاً.',
        counter: '{n} / {max}',
        tooLong: 'الرسالة طويلة. اختصرها إلى 1000 حرف.',
      },
    },
    success: {
      title: 'وصل طلبك',
      text: 'شكراً لك. سنتصل بك أو نراسلك على الرقم {phone}.',
      nudge: 'مستعجل؟ راسلنا على واتساب.',
      button: 'واتساب',
    },
    failure: {
      title: 'لم يصل طلبك',
      text: 'حدثت مشكلة أثناء الإرسال، وبياناتك ما زالت في النموذج. حاول مرة أخرى، أو أرسلها عبر واتساب أو البريد الإلكتروني.',
      retry: 'حاول مرة أخرى',
      whatsapp: 'أرسل عبر واتساب',
      email: 'أرسل بالبريد الإلكتروني',
      offline: 'لا يوجد اتصال بالإنترنت. تحقق من الاتصال، ثم حاول مرة أخرى.',
    },
    emailSubject: 'طلب رافعة: {crane}',
  },

  // §10
  whatsapp: {
    general: ['السلام عليكم، أطلس الصحراء.', 'وصلت إليكم من موقعكم الإلكتروني، وأريد الاستفسار عن خدماتكم.'].join('\n'),
    crane: [
      'السلام عليكم، أطلس الصحراء.',
      'أريد الاستفسار عن الرافعة {model} ({class}).',
      'وزن الحمولة: ___ طن',
      'موقع العمل: ___',
      'تاريخ البدء: ___',
    ].join('\n'),
    service: ['السلام عليكم، أطلس الصحراء.', 'أريد الاستفسار عن خدمة {service}.', 'التفاصيل: ___'].join('\n'),
    request: [
      'السلام عليكم، أطلس الصحراء.',
      'طلب من الموقع الإلكتروني:',
      'الاسم: {name}',
      'الشركة: {company}',
      'الهاتف: {phone}',
      'الرافعة أو الخدمة: {crane}',
      'وزن الحمولة: {weight} طن',
      'نصف قطر الرفع: {radius} م',
      'ارتفاع الرفع: {height} م',
      'موقع العمل: {site}',
      'تاريخ البدء: {start}',
      'المدة: {duration}',
      'ملاحظات: {message}',
    ].join('\n'),
    followUp: ['السلام عليكم، أطلس الصحراء.', 'أرسلت الآن طلب رافعة من موقعكم باسم {name}، ورقمي {phone}.'].join('\n'),
  },

  // §10 floating button + spec §5.5
  bar: {
    onHook: 'على الخطّاف:',
    clear: 'إزالة الرافعة من الطلب',
    whatsapp: 'واتساب',
    whatsappLabel: 'راسلنا على واتساب',
    tooltip: 'اسألنا عن رافعة',
  },

  // §11
  footer: {
    name: 'أطلس الصحراء للخدمات النفطية',
    legalName: 'شركة أطلس الصحراء المساهمة للخدمات النفطية والنقل الثقيل والمناولة وتأجير الرافعات (الكرينات).',
    tagline: 'لكل مشروع رافعته المناسبة.',
    servicesHeading: 'الخدمات',
    pageHeading: 'في هذه الصفحة',
    pageLinks: { cranes: 'الرافعات', sites: 'مواقع العمل', request: 'اطلب رافعة' },
    contactHeading: 'تواصل معنا',
    followHeading: 'تابعنا',
    facebook: 'فيسبوك',
    copyright: '© {year} أطلس الصحراء. جميع الحقوق محفوظة.',
    backToTop: 'العودة إلى الأعلى',
  },

  // §12
  alt: {
    '6359': 'رافعة متحركة صفراء من زاوية منخفضة: كابينة المشغّل والذراع التلسكوبي والخطاف أمام سماء زرقاء وغيوم بيضاء.',
    '6360': 'الجهة الخلفية لرافعتين صفراوين على الشاطئ: ثقل موازنة عليه اسم Grove وعلامة RT700E، وثقل موازنة Faun بخطوط حمراء وبيضاء، وشريط تحذير على الرمل.',
    '6363': 'لقطة قريبة لكابينة رافعة Grove صفراء للأراضي الوعرة، والذراع يرتفع فوقها في سماء زرقاء غائمة.',
    '6364': 'مؤخرة رافعة Grove RT700E على الشاطئ ومساندها ممدودة على قواعد، وحزام رفع برتقالي معلّق في الخطاف، والبحر في الخلفية.',
    '6374': 'نظرة من الأسفل إلى ثقل الموازنة الأبيض لرافعة Terex، وعليه اسم TEREX وخطوط حمراء وبيضاء، والذراع يرتفع مستقيماً في سماء زرقاء صافية.',
    '6375': 'رافعة Terex بيضاء لكل التضاريس في موقع إنشاءات، مساندها على ألواح فولاذية وكتل الموازنة مركّبة في الخلف، وذراع رافعة صفراء يرتفع خلفها.',
    '6376': 'كابينة المشغّل في رافعة Terex AC200-1 بيضاء وبابها مفتوح، وعلى جانبها ملصق مكتوب عليه 200T capacity class.',
    '6379': 'لقطة قريبة من الأسفل لكابينة رافعة Terex AC200-1، ببابها المفتوح ودرجتها المعدنية وأضوائها الحمراء والبرتقالية والخضراء.',
    '6380': 'رافعة مجنزرة حمراء FW.China QUY250 بذراع شبكي طويل بجانب مبنى خرساني متعدد الطوابق، وبرج مكاتب في الأفق.',
    '6382': 'لقطة قريبة لجسم رافعة مجنزرة حمراء مكتوب عليه FW.CHINA وQUY250، تحت ذراعها الشبكي.',
    '6385': 'رافعة مجنزرة حمراء FW.China QUY250 على جنازيرها وكتل الموازنة مركّبة، بجانب مبنى خرساني قيد الإنشاء.',
    '6388': 'رافعة Grove GMK6350 صفراء لكل التضاريس، على ذراعها عبارة 350 TON، منصوبة على قواعد المساند بجانب سقالات زرقاء وحمراء.',
    '6389': 'رافعة Grove GMK6350 صفراء ذراعها مرفوع والخطاف معلّق، تؤطّرها بلاطة خرسانية تبرز منها قضبان حديد التسليح في أعلى الصورة.',
    '6392': 'رافعة Grove صفراء لكل التضاريس من الأمام بزاوية جانبية، على أرضية خرسانية وذراعها مرفوع، ومواد بناء مكدّسة إلى اليسار.',
    '6393': 'لقطة قريبة لاسم GROVE على جسم رافعة صفراء، والذراع الممتد يرتفع في سماء زرقاء.',
    '6395': 'رافعة Faun صفراء لكل التضاريس ذراعها مرفوع على شاطئ رملي، تحيط بها أقماع مرورية وشريط تحذير، وبجانبها مقطورة قلّابة.',
    '6396': 'رافعة Faun صفراء مكتوب على كابينتها ATF 60-3، تظهر من خلف هيكل فولاذي رمادي على شاطئ رملي، والبحر إلى اليسار.',
    '6397': 'مؤخرة رافعة Faun صفراء لكل التضاريس قرب البحر، مساندها ممدودة وعليها خطوط سوداء وبيضاء.',
    '6398': 'رافعتان صفراوان، Grove وFaun، منصوبتان جنباً إلى جنب على الشاطئ وذراعاهما مرفوعان نحو سماء زرقاء، وحولهما أقماع مرورية.',
  },

  misc: {
    draftBadge: 'مسودة · غير مؤكد',
    newTab: 'يفتح في نافذة جديدة',
  },
};
```

- [ ] **Step 4: Write the English copy**

Create `src/content/en.ts`:
```ts
import type { Copy } from './types';

// Transcribed verbatim from docs/03-copy-deck.md (section numbers in comments).
// Normalisations and new strings are listed in the plan, Part B, task B.2.
// Do not reword here without updating the deck.

export const en: Copy = {
  lang: 'en',

  // §1
  meta: {
    title: 'Atlas Alshraa | Crane Hire and Heavy Transport in Libya',
    description:
      'Crane hire from smaller cranes to the largest ones, plus heavy transport, handling and oil services in Libya. Send your load details on WhatsApp.',
    ogTitle: 'Atlas Alshraa: Every project has the right crane',
    ogDescription:
      'Crane hire, heavy transport, handling and oil services. Tell us about your load and we will tell you which crane fits.',
    ogImageAlt: 'Two yellow cranes set up side by side on a beach, booms raised against a blue sky.',
  },

  // §2
  header: {
    skipLink: 'Skip to content',
    homeLabel: 'Atlas Alshraa, back to top',
    name: 'Atlas Alshraa',
    nameAlt: 'أطلس الصحراء',
    nav: { services: 'Services', cranes: 'Cranes', sites: 'On site', contact: 'Contact' },
    langSwitch: { text: 'عربي', label: 'اعرض الصفحة بالعربية' },
    request: 'Request a crane',
    call: { text: 'Call', label: 'Call us on {phone}' },
    menu: { open: 'Menu', close: 'Close menu', whatsapp: 'Message us on WhatsApp' },
  },

  // §3 + spec §5.2, §15.1
  hero: {
    h1Lead: 'From smaller cranes to the largest ones,',
    h1Main: 'every project has the right crane.',
    servicesLine: 'Crane hire · Heavy transport · Handling · Oil services',
    whatsapp: 'WhatsApp us',
    browse: 'Browse cranes',
  },

  // §4 class names
  craneTypes: {
    'rough-terrain': {
      full: 'Rough-terrain crane',
      chip: 'Rough-terrain',
      explainer: 'Built for uneven ground inside the site.',
    },
    'all-terrain': {
      full: 'All-terrain crane',
      chip: 'All-terrain',
      explainer: 'Drives on public roads and works on site.',
    },
    crawler: {
      full: 'Crawler crane',
      chip: 'Crawler',
      explainer: 'Moves on tracks that spread its weight, for heavy lifts.',
    },
  },

  // §4
  hoist: {
    title: 'Choose your crane by capacity',
    intro: "Scroll to see the cranes from smallest to largest. The big number is each crane's maximum capacity.",
    listHeading: 'Cranes from smallest to largest',
    skipToList: 'See all cranes',
    capacity: 'Max capacity',
    model: 'Model',
    type: 'Class',
    unit: 't',
    footnote:
      "Maximum capacity is the maker's rating at the shortest radius. What a crane can lift on your site depends on radius and height, which is why we ask for both.",
    closing: 'Not sure which size you need? Send us the load details and we will choose with you.',
    closingButton: 'Send the details',
  },

  // §5
  services: {
    title: 'Our services',
    intro: 'Four services from one company. Ask for one, or put several in a single request.',
    ask: 'Ask about this service',
    items: [
      {
        id: 'crane-hire',
        title: 'Crane hire',
        body: 'Cranes for hire, from smaller cranes to the largest ones. Send us the load weight, radius and lift height, and we will suggest the right crane for your job.',
        confirm: '[[CONFIRM: Every crane comes with an experienced operator.]]',
      },
      {
        id: 'heavy-transport',
        title: 'Heavy transport',
        body: 'We move heavy loads and large equipment [[CONFIRM: by road, on low-bed trailers]]. Tell us what the load is, what it weighs and where it needs to go, and we will plan the move with you.',
      },
      {
        id: 'handling',
        title: 'Handling and rigging',
        body: 'We lift, rig and move loads on site [[CONFIRM: rigging crew, slings and lifting gear, lift plans]]. Book handling on its own, or with crane hire and transport in one request.',
      },
      {
        id: 'oil-services',
        title: 'Oil services',
        body: 'Support for oil and gas work [[CONFIRM: exact scope, for example lifting and transport at oil fields]]. Tell us about the work and where it is, and we will tell you clearly what we can do.',
      },
    ],
  },

  // §6 + spec §15.8
  grid: {
    title: 'Find your crane',
    intro: 'Filter by type or capacity. Then request the crane you need on WhatsApp in one tap.',
    availability: 'Tell us your dates and we will confirm availability.',
    typeLabel: 'Type',
    bandLabel: 'Capacity',
    all: 'All',
    bands: {
      '0-60': 'Up to {max}',
      '61-200': '{min}–{max}',
      '201+': 'Over {min}',
    },
    count: { one: '{n} crane', two: '{n} cranes', few: '{n} cranes', many: '{n} cranes' },
    empty: 'No cranes match this filter.',
    showAll: 'Show all',
    card: {
      type: 'Type',
      capacity: 'Max capacity',
      request: 'Request this crane',
      formLink: 'Or use the request form',
    },
  },

  // §7
  sites: {
    title: 'On site',
    intro: 'Every photo on this page is real. They were taken at two places: a building site and a coastal site.',
    galleries: { construction: 'Building site', coast: 'Coastal site' },
    swipeHint: 'Swipe for more',
    open: 'View larger',
    prev: 'Previous',
    next: 'Next',
    counter: '{i} of {n}',
    close: 'Close',
    captions: {
      '6398': 'Coastal site · Two cranes set up on the sand',
      '6364': 'Coastal site · Outriggers out, sling on the hook',
      '6360': 'Coastal site · Two counterweights side by side',
      '6395': 'Coastal site · All-terrain crane beside a tipper trailer',
      '6396': 'Coastal site · All-terrain crane with the sea behind',
      '6397': 'Coastal site · Outriggers on pads near the water',
      '6380': 'Building site · Crawler crane beside a multi-storey frame',
      '6385': 'Building site · Crawler crane with its counterweight in place',
      '6388': 'Building site · All-terrain crane on outrigger pads by the scaffolding',
      '6389': 'Building site · Boom up, hook ready',
      '6375': 'Building site · Outriggers on steel pads',
      '6376': "Building site · The operator's cab, door open",
    },
  },

  // §8b
  documents: {
    title: 'Prequalification documents',
    intro: 'For procurement and prequalification teams. Download the files, or ask for them by email.',
    meta: 'PDF · {language} · Updated {date}',
    languages: { ar: 'Arabic', en: 'English', both: 'Arabic and English' },
    download: 'Download',
    emailRequest: 'Request by email',
    emailSubject: 'Document request: {document}',
    names: {
      profile: 'Company profile',
      'fleet-list': 'Crane list with capacities',
      inspection: 'Third-party inspection certificates',
      hse: 'HSE policy',
      iso: 'ISO certificates',
      insurance: 'Insurance certificate',
      cr: 'Commercial registration',
    },
  },

  // §9 + spec §5.8, §15.1
  form: {
    title: 'Which crane does your project need?',
    lead: 'Get in touch and leave the rest to us.',
    intro: 'Fill in only what you know. We need your phone number and the load weight. We will ask about the rest.',
    contact: {
      email: 'Email',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      address: 'Address',
      facebook: 'Our Facebook page',
    },
    groups: { details: 'Your details', lift: 'Lift details', site: 'Site and dates' },
    required: 'Required',
    optional: 'Optional',
    submit: 'Send request',
    busy: 'Sending…',
    whatsappAlt: 'Or send the same details on WhatsApp',
    privacy: 'We use your details only to reply to your request. [[CONFIRM]]',
    errorSummary: 'Some fields need a fix. Check the messages below, then send again.',
    fields: {
      name: {
        label: 'Your name',
        hint: 'So we know who to ask for.',
        tooLong: 'That name is too long. Keep it to 80 characters or fewer.',
      },
      company: {
        label: 'Company',
        hint: 'Company or organisation, if any.',
        tooLong: 'That name is too long. Keep it to 120 characters or fewer.',
      },
      phone: {
        label: 'Phone or WhatsApp number',
        hint: 'We will call or message you on this number. Add the country code if you are outside Libya.',
        empty: 'Enter a phone number so we can reach you.',
        format: 'This number looks incomplete. Check the digits and try again.',
      },
      crane: {
        label: 'Crane or service',
        hint: 'If you tapped "Request this crane", it is already selected here.',
        unsure: 'Not sure, help me choose',
        servicesGroup: 'Services',
        cranesGroup: 'Cranes',
      },
      weight: {
        label: 'Load weight (t)',
        hint: 'A rough figure is fine.',
        unit: 't',
        empty: 'Enter the load weight in tonnes. A rough figure is fine.',
        format: 'Enter a number above zero, such as 12 or 7.5.',
      },
      radius: {
        label: 'Lift radius (m)',
        hint: "The flat distance from the centre of the crane to the load. Leave it blank if you don't know.",
        unit: 'm',
        format: 'Enter a number in metres, or leave this blank.',
      },
      height: {
        label: 'Lift height (m)',
        hint: 'The highest point the load must reach, measured from the ground.',
        unit: 'm',
        format: 'Enter a number in metres, or leave this blank.',
      },
      site: {
        label: 'Site location',
        hint: 'City or area. You can paste a Google Maps link.',
        tooLong: 'That is too long. Keep it to 200 characters.',
      },
      start: {
        label: 'Start date',
        hint: 'When do you need the crane on site?',
        past: 'Pick today or a later date.',
      },
      duration: {
        label: 'Duration',
        hint: 'Your best guess is fine.',
        unsure: 'Not sure yet',
        options: {
          day: 'One day or less',
          week: '2 days to a week',
          month: '1 week to a month',
          long: 'More than a month',
        },
      },
      message: {
        label: 'Message',
        hint: 'Anything else: what the load is, its size, site access, or whether you also need transport.',
        counter: '{n} / {max}',
        tooLong: 'Your message is too long. Keep it to 1,000 characters.',
      },
    },
    success: {
      title: 'We have your request',
      text: 'Thank you. We will call or message you on {phone}.',
      nudge: 'In a hurry? Message us on WhatsApp.',
      button: 'WhatsApp',
    },
    failure: {
      title: 'Your request did not go through',
      text: 'Something went wrong while sending. Your details are still in the form. Try again, or send them on WhatsApp or by email.',
      retry: 'Try again',
      whatsapp: 'Send on WhatsApp',
      email: 'Send by email',
      offline: 'You seem to be offline. Check your connection and try again.',
    },
    emailSubject: 'Crane request: {crane}',
  },

  // §10
  whatsapp: {
    general: ['Hello Atlas Alshraa,', 'I found you through your website and would like to ask about your services.'].join('\n'),
    crane: [
      'Hello Atlas Alshraa,',
      'I would like to ask about the {model} ({class}).',
      'Load weight: ___ t',
      'Site location: ___',
      'Start date: ___',
    ].join('\n'),
    service: ['Hello Atlas Alshraa,', 'I would like to ask about {service}.', 'Details: ___'].join('\n'),
    request: [
      'Hello Atlas Alshraa,',
      'Crane request from your website:',
      'Name: {name}',
      'Company: {company}',
      'Phone: {phone}',
      'Crane or service: {crane}',
      'Load weight: {weight} t',
      'Lift radius: {radius} m',
      'Lift height: {height} m',
      'Site location: {site}',
      'Start date: {start}',
      'Duration: {duration}',
      'Notes: {message}',
    ].join('\n'),
    followUp: ['Hello Atlas Alshraa,', 'I just sent a request through your website. Name: {name}, phone: {phone}.'].join('\n'),
  },

  // §10 floating button + spec §5.5
  bar: {
    onHook: 'On the hook:',
    clear: 'Remove this crane from the request',
    whatsapp: 'WhatsApp',
    whatsappLabel: 'Message us on WhatsApp',
    tooltip: 'Ask us about a crane',
  },

  // §11
  footer: {
    name: 'Atlas Alshraa · For oil services',
    legalName:
      'Atlas Alshraa Joint-Stock Company for Oil Services, Heavy Transport, Handling and Crane Hire. [[CONFIRM: English spelling]]',
    tagline: 'Every project has the right crane.',
    servicesHeading: 'Services',
    pageHeading: 'On this page',
    pageLinks: { cranes: 'Cranes', sites: 'On site', request: 'Request a crane' },
    contactHeading: 'Contact',
    followHeading: 'Follow us',
    facebook: 'Facebook',
    copyright: '© {year} Atlas Alshraa. All rights reserved.',
    backToTop: 'Back to top',
  },

  // §12
  alt: {
    '6359': "A yellow mobile crane seen from below: the operator's cab, the telescopic boom and the hook against a blue sky with white clouds.",
    '6360': 'The back of two yellow cranes on a beach: a Grove counterweight marked RT700E and a Faun counterweight with red and white chevrons, with barrier tape on the sand.',
    '6363': 'Close view of the yellow cab of a Grove rough-terrain crane, with the boom rising above it into a cloudy blue sky.',
    '6364': 'The back of a Grove RT700E crane on a beach with its outriggers extended on pads; an orange lifting sling hangs from the hook and the sea is behind.',
    '6374': 'Looking up at the white counterweight of a Terex crane, lettered TEREX with red and white chevrons, as the boom rises straight into a deep blue sky.',
    '6375': 'A white Terex all-terrain crane on a building site, outriggers on steel pads and counterweight blocks stacked at the back, with a yellow crane boom rising behind it.',
    '6376': `The operator's cab of a white Terex AC200-1 crane with the door open; a label on the side reads "200T capacity class".`,
    '6379': 'A close view from below of the Terex AC200-1 cab, with its open door, steel step and red, amber and green lights.',
    '6380': 'A red FW.China QUY250 crawler crane with a tall lattice boom beside a multi-storey concrete building, with an office tower in the distance.',
    '6382': 'A close view of the red body of a crawler crane, lettered FW.CHINA and QUY250, under its lattice boom.',
    '6385': 'A red FW.China QUY250 crawler crane on its tracks with its counterweight blocks in place, next to a concrete building under construction.',
    '6388': 'A yellow Grove GMK6350 all-terrain crane, its boom marked "350 TON", set up on outrigger pads beside blue and red scaffolding.',
    '6389': 'A yellow Grove GMK6350 crane with its boom raised and the hook hanging, framed by a concrete slab with steel rebar sticking out at the top of the picture.',
    '6392': 'A yellow Grove all-terrain crane seen from the front corner on a concrete yard, boom raised, with building materials stacked on the left.',
    '6393': 'A close-up of the GROVE name on a yellow crane body, with the extended boom rising into a blue sky.',
    '6395': 'A yellow Faun all-terrain crane with its boom raised on a sandy shore, ringed by traffic cones and barrier tape, with a tipper trailer beside it.',
    '6396': 'A yellow Faun crane marked "ATF 60-3" on its cab, seen past a grey steel structure on a sandy shore, with the sea on the left.',
    '6397': 'The back of a yellow Faun all-terrain crane by the sea, outriggers extended, with black and white stripes on the beams.',
    '6398': 'Two yellow cranes, a Grove and a Faun, set up side by side on a beach with their booms raised against a blue sky, ringed by traffic cones.',
  },

  misc: {
    draftBadge: 'DRAFT · unverified',
    newTab: 'opens in a new tab',
  },
};
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `npx vitest run src/content/copy.test.ts`
Expected: PASS, `Tests  7 passed (7)`.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no output. (A missing key in either file is a type error against `Copy`; a Kobelco key in `alt` is an excess-property error.)

- [ ] **Step 7: Commit**
```bash
git add src/content/ar.ts src/content/en.ts src/content/copy.test.ts
git commit -m "feat(content): add Arabic and English copy from the copy deck" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task B.3: Cranes, sites, site info and the content index

**Files:**
- Create: `src/content/cranes.ts`
- Create: `src/content/sites.ts`
- Create: `src/content/site.ts`
- Create: `src/content/index.ts`
- Test: `src/content/content.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/content/content.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { cranes, getCopy, siteInfo, sites, visibleCranes } from './index';

describe('cranes', () => {
  it('lists the visible cranes from smallest to largest', () => {
    expect(visibleCranes.map((c) => c.id)).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(visibleCranes.map((c) => c.capacityT)).toEqual([55, 60, 200, 250, 350]);
  });

  it('never shows the Kobelco', () => {
    expect(visibleCranes.some((c) => c.id === 'cke2500')).toBe(false);
    expect(cranes.find((c) => c.id === 'cke2500')?.hidden).toBe(true);
  });

  it('keeps make and model exactly as printed on the machines', () => {
    expect(cranes.map((c) => [c.id, c.make, c.model, c.type])).toEqual([
      ['rt700e', 'Grove', 'RT700E', 'rough-terrain'],
      ['atf60-3', 'Tadano Faun', 'ATF 60-3', 'all-terrain'],
      ['ac200-1', 'Terex', 'AC200-1', 'all-terrain'],
      ['quy250', 'Fuwa (FW.China)', 'QUY250', 'crawler'],
      ['gmk6350', 'Grove', 'GMK6350', 'all-terrain'],
      ['cke2500', 'Kobelco', 'CKE2500', 'crawler'],
    ]);
  });

  it('uses the photos from spec §3', () => {
    expect(visibleCranes.map((c) => [c.hoistPhoto, c.cardPhoto])).toEqual([
      ['6364', '6363'],
      ['6395', '6397'],
      ['6375', '6376'],
      ['6385', '6380'],
      ['6389', '6392'],
    ]);
  });

  it('marks every crane unverified until Atlas confirms', () => {
    expect(cranes.every((c) => c.verified === false)).toBe(true);
  });
});

describe('sites', () => {
  it('has the two galleries from spec §4.2', () => {
    expect(sites.map((g) => [g.id, [...g.photos]])).toEqual([
      ['construction', ['6374', '6376', '6379', '6380', '6382', '6388', '6393']],
      ['coast', ['6360', '6364', '6396', '6397', '6398']],
    ]);
  });

  it('contains no Kobelco photos', () => {
    const all: string[] = sites.flatMap((g) => [...g.photos]);
    for (const kobelco of ['6367', '6370', '6371']) expect(all).not.toContain(kobelco);
  });
});

describe('site info and copy', () => {
  it('holds only confirmed contact facts', () => {
    expect(siteInfo).toEqual({
      email: 'atlasalsahralibya@gmail.com',
      facebook: 'https://www.facebook.com/share/19qKUy2hxg/',
      address: null,
      documents: [],
    });
  });

  it('returns the copy for each language', () => {
    expect(getCopy('ar').lang).toBe('ar');
    expect(getCopy('en').lang).toBe('en');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/content/content.test.ts`
Expected: FAIL with `Failed to resolve import "./index"`.

- [ ] **Step 3: Write the crane data**

Create `src/content/cranes.ts`:
```ts
import type { PhotoId } from '@/generated/images';
import type { Crane } from './types';

/**
 * Kobelco photos (6367, 6370, 6371) are never processed (C6), so they are not
 * PhotoIds. The ids are kept only as a record of the source photos; getImage()
 * would throw if this crane were ever rendered, which is the safe failure.
 */
const unprocessed = (id: string) => id as PhotoId;

/**
 * Models are as printed on the machines in Atlas's photos. Capacities are the
 * manufacturers' max ratings (spec §3), NOT confirmed by Atlas: verified stays
 * false until they are, and the truth gate blocks production until then.
 */
export const cranes: readonly Crane[] = [
  { id: 'rt700e', make: 'Grove', model: 'RT700E', type: 'rough-terrain', capacityT: 55, hoistPhoto: '6364', cardPhoto: '6363', verified: false, hidden: false },
  { id: 'atf60-3', make: 'Tadano Faun', model: 'ATF 60-3', type: 'all-terrain', capacityT: 60, hoistPhoto: '6395', cardPhoto: '6397', verified: false, hidden: false },
  { id: 'ac200-1', make: 'Terex', model: 'AC200-1', type: 'all-terrain', capacityT: 200, hoistPhoto: '6375', cardPhoto: '6376', verified: false, hidden: false },
  { id: 'quy250', make: 'Fuwa (FW.China)', model: 'QUY250', type: 'crawler', capacityT: 250, hoistPhoto: '6385', cardPhoto: '6380', verified: false, hidden: false },
  { id: 'gmk6350', make: 'Grove', model: 'GMK6350', type: 'all-terrain', capacityT: 350, hoistPhoto: '6389', cardPhoto: '6392', verified: false, hidden: false },
  // Hidden: carries another company's logo. Capacity unknown ([[CAPACITY:CKE2500]]); 0 is a placeholder that is never shown.
  { id: 'cke2500', make: 'Kobelco', model: 'CKE2500', type: 'crawler', capacityT: 0, hoistPhoto: unprocessed('6370'), cardPhoto: unprocessed('6367'), verified: false, hidden: true },
];
```

- [ ] **Step 4: Write the galleries and site facts**

Create `src/content/sites.ts`:
```ts
import type { SiteGallery } from './types';

/** Spec §4.2. Kobelco photos 6367, 6370 and 6371 are excluded. */
export const sites: readonly SiteGallery[] = [
  { id: 'construction', photos: ['6374', '6376', '6379', '6380', '6382', '6388', '6393'] },
  { id: 'coast', photos: ['6360', '6364', '6396', '6397', '6398'] },
];
```

Create `src/content/site.ts`:
```ts
import type { SiteInfo } from './types';

/** Confirmed facts only (spec §3). Phone and WhatsApp come from env (C3). */
export const siteInfo: SiteInfo = {
  email: 'atlasalsahralibya@gmail.com',
  facebook: 'https://www.facebook.com/share/19qKUy2hxg/',
  address: null,
  documents: [],
};
```

- [ ] **Step 5: Write the index**

Create `src/content/index.ts`:
```ts
import { ar } from './ar';
import { cranes } from './cranes';
import { en } from './en';
import type { Copy, Crane, Lang } from './types';

export { cranes } from './cranes';
export { siteInfo } from './site';
export { sites } from './sites';
export type {
  CapacityBand,
  Copy,
  Crane,
  CraneId,
  CraneType,
  CraneTypeCopy,
  DocumentFile,
  DocumentSlot,
  DurationId,
  FieldCopy,
  Lang,
  ServiceCopy,
  ServiceId,
  SiteGallery,
  SiteGalleryId,
  SiteInfo,
} from './types';

const COPY: Record<Lang, Copy> = { ar, en };

export function getCopy(lang: Lang): Copy {
  return COPY[lang];
}

/** Cranes that may be rendered, smallest capacity first (the Hoist order). */
export const visibleCranes: readonly Crane[] = cranes.filter((c) => !c.hidden).sort((a, b) => a.capacityT - b.capacityT);
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run src/content`
Expected: PASS, `Test Files  2 passed (2)`, `Tests  16 passed (16)`.

- [ ] **Step 7: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: no output.
```bash
git add src/content/cranes.ts src/content/sites.ts src/content/site.ts src/content/index.ts src/content/content.test.ts
git commit -m "feat(content): add cranes, site galleries, site info and content index" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task B.4: Number formatting (`src/lib/numbers.ts`)

**Files:**
- Create: `src/lib/numbers.ts`
- Test: `src/lib/numbers.test.ts`

Why this is not a one-liner: `ar-LY` with Western digits uses `,` as its **decimal** separator (Maghreb style, "350,5"), and its minus sign carries a bidi mark. The spec wants Western digits, a `.` decimal and `,` grouping in both languages, so the output is rebuilt from `formatToParts`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/numbers.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { formatMetres, formatNumber, formatTonnes } from './numbers';

const NBSP = '\u00A0'; // no-break space (U+202F is in none of the fonts)

describe('formatNumber', () => {
  it('formats English with comma groups and a dot decimal', () => {
    expect(formatNumber(1250.5, 'en')).toBe('1,250.5');
    expect(formatNumber(350, 'en')).toBe('350');
  });

  it('formats Arabic with Western digits and a dot decimal', () => {
    expect(formatNumber(350.5, 'ar')).toBe('350.5');
    expect(formatNumber(350.5, 'ar')).not.toBe('350,5');
    const big = formatNumber(1250.5, 'ar');
    expect(big).toMatch(/^[0-9.,]+$/);
    expect(big.endsWith('.5')).toBe(true);
  });

  it('never prints Arabic-Indic digits or separators', () => {
    for (const n of [0, 7.5, 55, 350, 1250.5]) {
      expect(formatNumber(n, 'ar')).not.toMatch(/[٠-٩۰-۹٫٬]/);
    }
  });

  it('rounds to maximumFractionDigits (default 2)', () => {
    expect(formatNumber(7.456, 'en')).toBe('7.46');
    expect(formatNumber(7.456, 'ar', { maximumFractionDigits: 0 })).toBe('7');
  });

  it('uses a plain hyphen-minus with no bidi marks', () => {
    expect(formatNumber(-5, 'ar')).toBe('-5');
    expect(formatNumber(-5, 'en')).toBe('-5');
  });
});

describe('formatTonnes and formatMetres', () => {
  it('joins number and unit with a no-break space (U+00A0)', () => {
    expect(formatTonnes(350, 'en')).toBe(`350${NBSP}t`);
    expect(formatTonnes(350, 'ar')).toBe(`350${NBSP}طن`);
    expect(formatMetres(12, 'en')).toBe(`12${NBSP}m`);
    expect(formatMetres(12, 'ar')).toBe(`12${NBSP}م`);
  });

  it('keeps Arabic tonnage in Western digits', () => {
    const value = formatTonnes(350, 'ar');
    expect(value).not.toContain('٣');
    expect(value).toMatch(/^[0-9.,  طن]+$/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/numbers.test.ts`
Expected: FAIL with `Failed to resolve import "./numbers"`.

- [ ] **Step 3: Implement**

Create `src/lib/numbers.ts`:
```ts
import type { Lang } from '@/content/types';

/**
 * Spec §3: Western digits in both languages, a fixed '.' decimal and ',' grouping.
 * The `-u-nu-latn` extension is the same as `{ numberingSystem: 'latn' }`. Never use bare 'ar'.
 */
const LOCALE: Record<Lang, string> = { ar: 'ar-LY-u-nu-latn', en: 'en-GB-u-nu-latn' };
const UNITS = {
  tonnes: { ar: 'طن', en: 't' },
  metres: { ar: 'م', en: 'm' },
} as const;
const NBSP = '\u00A0'; // no-break space (U+202F is in none of the fonts)
const BIDI_MARKS = /[؜‎‏]/g;

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(lang: Lang, maximumFractionDigits: number): Intl.NumberFormat {
  const key = `${lang}:${maximumFractionDigits}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits, minimumFractionDigits: 0 });
    formatters.set(key, f);
  }
  return f;
}

export function formatNumber(n: number, lang: Lang, opts: { maximumFractionDigits?: number } = {}): string {
  return formatter(lang, opts.maximumFractionDigits ?? 2)
    .formatToParts(n)
    .map((part) => {
      if (part.type === 'decimal') return '.';
      if (part.type === 'group') return ',';
      if (part.type === 'minusSign') return '-';
      return part.value;
    })
    .join('')
    .replace(BIDI_MARKS, '');
}

export function formatTonnes(n: number, lang: Lang): string {
  return `${formatNumber(n, lang)}${NBSP}${UNITS.tonnes[lang]}`;
}

export function formatMetres(n: number, lang: Lang): string {
  return `${formatNumber(n, lang)}${NBSP}${UNITS.metres[lang]}`;
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/lib/numbers.test.ts`
Expected: PASS, `Tests  7 passed (7)`.

- [ ] **Step 5: Commit**
```bash
git add src/lib/numbers.ts src/lib/numbers.test.ts
git commit -m "feat(lib): format numbers with Western digits in both languages" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task B.5: Digit normalisation (`src/lib/digits.ts`)

**Files:**
- Create: `src/lib/digits.ts`
- Test: `src/lib/digits.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/digits.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { parseDecimal, toAsciiDigits } from './digits';

describe('toAsciiDigits', () => {
  it('converts Arabic-Indic digits', () => {
    expect(toAsciiDigits('٣٥٠')).toBe('350');
  });

  it('converts Persian digits and the Arabic decimal separator', () => {
    expect(toAsciiDigits('۱۲٫۵')).toBe('12.5');
  });

  it('drops the Arabic thousands separator', () => {
    expect(toAsciiDigits('1٬250')).toBe('1250');
  });

  it('leaves everything else alone', () => {
    expect(toAsciiDigits('+٢١٨ 91-abc')).toBe('+218 91-abc');
  });
});

describe('parseDecimal', () => {
  it('parses plain and Arabic-digit numbers', () => {
    expect(parseDecimal('350')).toBe(350);
    expect(parseDecimal('٣٥٠')).toBe(350);
    expect(parseDecimal('۱۲٫۵')).toBe(12.5);
    expect(parseDecimal(' 7.5 ')).toBe(7.5);
  });

  it('accepts a comma decimal and comma grouping', () => {
    expect(parseDecimal('7,5')).toBe(7.5);
    expect(parseDecimal('1,250')).toBe(1250);
    expect(parseDecimal('1,250.5')).toBe(1250.5);
    expect(parseDecimal('1٬250')).toBe(1250);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('   ')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('12abc')).toBeNull();
    expect(parseDecimal('1.2.3')).toBeNull();
    expect(parseDecimal('-5')).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/digits.test.ts`
Expected: FAIL with `Failed to resolve import "./digits"`.

- [ ] **Step 3: Implement**

Create `src/lib/digits.ts`:
```ts
const ARABIC_INDIC = /[٠-٩]/g; // ٠–٩
const PERSIAN = /[۰-۹]/g; // ۰–۹

/** ٠–٩ and ۰–۹ → 0–9, '٫' → '.', '٬' → ''. Everything else is unchanged. */
export function toAsciiDigits(input: string): string {
  return input
    .replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(PERSIAN, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, '.')
    .replace(/٬/g, '');
}

/**
 * Parses a non-negative decimal typed by a visitor, in any digit system.
 * Accepts "12", "12.5", ".5", "7,5" (comma decimal, 1–2 places) and "1,250"
 * (comma grouping). Returns null for empty or anything else.
 */
export function parseDecimal(input: string): number | null {
  const s = toAsciiDigits(input).replace(/[\s  ]/g, '');
  if (s === '') return null;
  let normalised: string;
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) normalised = s.replace(/,/g, '');
  else if (/^\d+,\d{1,2}$/.test(s)) normalised = s.replace(',', '.');
  else if (/^(\d+\.?\d*|\.\d+)$/.test(s)) normalised = s;
  else return null;
  const n = Number(normalised);
  return Number.isFinite(n) ? n : null;
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/lib/digits.test.ts`
Expected: PASS, `Tests  7 passed (7)`.

- [ ] **Step 5: Commit**
```bash
git add src/lib/digits.ts src/lib/digits.test.ts
git commit -m "feat(lib): normalise Arabic-Indic and Persian digits in form input" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task B.6: WhatsApp, mailto and tel links (`src/lib/whatsapp.ts`)

**Files:**
- Create: `src/lib/whatsapp.ts`
- Test: `src/lib/whatsapp.test.ts`

`mailtoHref()` is an addition to C8 (see "Proposed contract additions"): the form's "Send by email" button and the documents' "Request by email" need a mailto with their own subject.

- [ ] **Step 1: Write the failing test**

Create `src/lib/whatsapp.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified }));

import { fillTemplate, mailtoHref, telHref, whatsappHref } from './whatsapp';

const message = 'السلام عليكم، أطلس الصحراء.\nأريد الاستفسار عن الرافعة Grove GMK6350 (رافعة لكل التضاريس).';

beforeEach(() => {
  mockEnv.whatsapp = null;
  mockEnv.phone = null;
});

describe('fillTemplate', () => {
  it('replaces every {key}', () => {
    expect(fillTemplate('{a} and {a}, then {b}', { a: '1', b: '2' })).toBe('1 and 1, then 2');
  });

  it('leaves unknown keys visible', () => {
    expect(fillTemplate('Call {phone}', {})).toBe('Call {phone}');
  });

  it('does not read inherited properties', () => {
    expect(fillTemplate('{toString}', {})).toBe('{toString}');
  });
});

describe('whatsappHref', () => {
  it('builds a wa.me link with the message encoded', () => {
    mockEnv.whatsapp = '218911234567';
    const href = whatsappHref(message);
    expect(href).toBe(`https://wa.me/218911234567?text=${encodeURIComponent(message)}`);
    expect(href).toContain('%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85'); // السلام
    expect(href).toContain('%0A'); // the line break
    expect(new URL(href).searchParams.get('text')).toBe(message);
  });

  it('keeps only digits of the number', () => {
    mockEnv.whatsapp = '+218 91-123-4567';
    expect(whatsappHref('Hi')).toBe('https://wa.me/218911234567?text=Hi');
  });

  it('falls back to mailto when there is no WhatsApp number', () => {
    const href = whatsappHref(message);
    expect(href.startsWith('mailto:atlasalsahralibya@gmail.com?subject=')).toBe(true);
    const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));
    expect(query.get('subject')).toBe('السلام عليكم، أطلس الصحراء.');
    expect(query.get('body')).toBe(message);
  });
});

describe('mailtoHref', () => {
  it('encodes subject and body', () => {
    expect(mailtoHref('Crane request: Grove GMK6350', 'a b\nc')).toBe(
      'mailto:atlasalsahralibya@gmail.com?subject=Crane%20request%3A%20Grove%20GMK6350&body=a%20b%0Ac',
    );
  });
});

describe('telHref', () => {
  it('is null without a phone number', () => {
    expect(telHref()).toBeNull();
  });

  it('keeps digits and the leading plus', () => {
    mockEnv.phone = '+218 91 123 4567';
    expect(telHref()).toBe('tel:+218911234567');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/whatsapp.test.ts`
Expected: FAIL with `Failed to resolve import "./whatsapp"`.

- [ ] **Step 3: Implement**

Create `src/lib/whatsapp.ts`:
```ts
import { siteInfo } from '@/content/site';
import { env } from '@/env';

/** Replaces each {key} with vars[key]. Unknown keys stay visible so a gap shows in staging. */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? (vars[key] ?? match) : match,
  );
}

export function mailtoHref(subject: string, body: string): string {
  return `mailto:${siteInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * wa.me link with the message. Without VITE_WHATSAPP (staging) it opens an
 * email to Atlas instead, with the message's first line as the subject.
 */
export function whatsappHref(message: string): string {
  const number = env.whatsapp?.replace(/\D/g, '');
  if (number) return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return mailtoHref(message.split('\n')[0] ?? '', message);
}

export function telHref(): string | null {
  return env.phone ? `tel:${env.phone.replace(/[^\d+]/g, '')}` : null;
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/lib/whatsapp.test.ts`
Expected: PASS, `Tests  9 passed (9)`.

- [ ] **Step 5: Commit**
```bash
git add src/lib/whatsapp.ts src/lib/whatsapp.test.ts
git commit -m "feat(lib): build WhatsApp, mailto and tel links from templates" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task B.7: The "on the hook" store (`src/lib/request.ts`)

**Files:**
- Create: `src/lib/request.ts`
- Test: `src/lib/request.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/lib/request.test.tsx`:
```tsx
// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { HOOK_EVENT, getRequestedCrane, setRequestedCrane, useRequestedCrane, type HookEventDetail } from './request';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Probe() {
  return <span>{useRequestedCrane() ?? 'none'}</span>;
}

afterEach(() => setRequestedCrane(null));

describe('request store', () => {
  it('names the event atlas:hook', () => {
    expect(HOOK_EVENT).toBe('atlas:hook');
  });

  it('sets and clears the crane on the hook', () => {
    setRequestedCrane('gmk6350');
    expect(getRequestedCrane()).toBe('gmk6350');
    setRequestedCrane(null);
    expect(getRequestedCrane()).toBeNull();
  });

  it('dispatches atlas:hook with the crane and the source element', () => {
    const seen: HookEventDetail[] = [];
    const onHook = (event: Event) => seen.push((event as CustomEvent<HookEventDetail>).detail);
    window.addEventListener(HOOK_EVENT, onHook);
    const button = document.createElement('button');
    setRequestedCrane('quy250', button);
    setRequestedCrane(null);
    window.removeEventListener(HOOK_EVENT, onHook);
    expect(seen).toEqual([
      { craneId: 'quy250', source: button },
      { craneId: null, source: null },
    ]);
  });

  it('re-renders subscribers when the crane changes', async () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => root.render(<Probe />));
    expect(host.textContent).toBe('none');
    await act(async () => setRequestedCrane('rt700e'));
    expect(host.textContent).toBe('rt700e');
    await act(async () => setRequestedCrane(null));
    expect(host.textContent).toBe('none');
    await act(async () => root.unmount());
  });

  it('renders null on the server', () => {
    setRequestedCrane('ac200-1');
    expect(renderToStaticMarkup(<Probe />)).toBe('<span>none</span>');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/request.test.tsx`
Expected: FAIL with `Failed to resolve import "./request"`.

- [ ] **Step 3: Implement**

Create `src/lib/request.ts`:
```ts
import { useSyncExternalStore } from 'react';
import type { CraneId } from '@/content/types';

export const HOOK_EVENT = 'atlas:hook';

export interface HookEventDetail {
  craneId: CraneId | null;
  source: HTMLElement | null;
}

let current: CraneId | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRequestedCrane(): CraneId | null {
  return current;
}

/** Puts a crane on the hook (or clears it), then tells the motion layer via HOOK_EVENT. */
export function setRequestedCrane(id: CraneId | null, source: HTMLElement | null = null): void {
  current = id;
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<HookEventDetail>(HOOK_EVENT, { detail: { craneId: id, source } }));
  }
}

/** The crane on the hook. Always null while prerendering. */
export function useRequestedCrane(): CraneId | null {
  return useSyncExternalStore(subscribe, getRequestedCrane, () => null);
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/lib/request.test.tsx`
Expected: PASS, `Tests  5 passed (5)`.

- [ ] **Step 5: Commit**
```bash
git add src/lib/request.ts src/lib/request.test.tsx
git commit -m "feat(lib): add the requested-crane store and hook event" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task B.8: Analytics (`src/lib/analytics.ts`)

**Files:**
- Create: `src/lib/analytics.ts`
- Test: `src/lib/analytics.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/analytics.test.ts`:
```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified }));

// A fresh module per test, because loadAnalytics() runs only once per page.
const load = () => import('./analytics');
const entries = () => (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  // Force the setTimeout fallback so fake timers control it, whether or not this jsdom has requestIdleCallback.
  Object.defineProperty(window, 'requestIdleCallback', { value: undefined, configurable: true, writable: true });
  delete window.gtag;
  delete window.dataLayer;
  document.head.innerHTML = '';
  mockEnv.ga4Id = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('analytics', () => {
  it('does nothing without a GA4 id', async () => {
    const { loadAnalytics, track } = await load();
    track('whatsapp_click', { location: 'hero' });
    loadAnalytics();
    window.dispatchEvent(new Event('load'));
    vi.runAllTimers();
    expect(window.dataLayer).toBeUndefined();
    expect(window.gtag).toBeUndefined();
    expect(document.querySelector('script')).toBeNull();
  });

  it('queues events in the dataLayer before gtag.js arrives', async () => {
    mockEnv.ga4Id = 'G-TEST123';
    const { track } = await load();
    track('whatsapp_click', { location: 'hero' });
    track('call_click');
    const queued = entries();
    expect(queued[0]?.[0]).toBe('js');
    expect(queued[1]).toEqual(['config', 'G-TEST123']);
    expect(queued[2]).toEqual(['event', 'whatsapp_click', { location: 'hero' }]);
    expect(queued[3]).toEqual(['event', 'call_click', {}]);
    expect(document.querySelector('script')).toBeNull();
  });

  it('injects gtag.js once, after load and idle time', async () => {
    mockEnv.ga4Id = 'G-TEST123';
    const { loadAnalytics } = await load();
    loadAnalytics();
    loadAnalytics();
    window.dispatchEvent(new Event('load'));
    expect(document.querySelectorAll('script')).toHaveLength(0);
    vi.runAllTimers();
    const scripts = document.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute('src')).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123');
    expect(scripts[0]?.async).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/analytics.test.ts`
Expected: FAIL with `Failed to resolve import "./analytics"`.

- [ ] **Step 3: Implement**

Create `src/lib/analytics.ts`:
```ts
import { env } from '@/env';

export type AnalyticsEvent = 'whatsapp_click' | 'call_click' | 'request_crane' | 'form_submit' | 'filter_use' | 'lang_switch';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let started = false;

/** Creates the gtag queue the first time it is needed. gtag.js later drains it. */
function ensureGtag(id: string): Gtag {
  if (window.gtag) return window.gtag;
  const dataLayer = (window.dataLayer ??= []);
  // gtag.js reads `arguments` objects from the dataLayer, not arrays.
  const gtag: Gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
  return gtag;
}

/** Sends a GA4 event (queued until gtag.js loads). No-op without VITE_GA4_ID. */
export function track(event: AnalyticsEvent, params: Record<string, string> = {}): void {
  if (!env.ga4Id || typeof window === 'undefined') return;
  ensureGtag(env.ga4Id)('event', event, params);
}

/** Loads gtag.js after `load` and an idle slot, once. Call it from App's effect. */
export function loadAnalytics(): void {
  const id = env.ga4Id;
  if (!id || started || typeof window === 'undefined') return;
  started = true;

  const inject = () => {
    ensureGtag(id);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
  };

  const whenIdle = () => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(inject, { timeout: 5000 });
    else window.setTimeout(inject, 1);
  };

  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/lib/analytics.test.ts`
Expected: PASS, `Tests  3 passed (3)`.

- [ ] **Step 5: Commit**
```bash
git add src/lib/analytics.ts src/lib/analytics.test.ts
git commit -m "feat(lib): add GA4 event queue and idle loader" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task B.9: Language context (`src/lib/lang.tsx`)

**Files:**
- Create: `src/lib/lang.tsx`
- Test: `src/lib/lang.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/lib/lang.test.tsx`:
```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LangProvider, useLang } from './lang';

function Probe() {
  const { lang, dir, otherLang, otherHref, copy } = useLang();
  return <p>{[lang, dir, otherLang, otherHref, copy.header.request].join('|')}</p>;
}

describe('LangProvider', () => {
  it('provides the Arabic page context', () => {
    expect(
      renderToStaticMarkup(
        <LangProvider lang="ar">
          <Probe />
        </LangProvider>,
      ),
    ).toBe('<p>ar|rtl|en|/en/|اطلب رافعة</p>');
  });

  it('provides the English page context', () => {
    expect(
      renderToStaticMarkup(
        <LangProvider lang="en">
          <Probe />
        </LangProvider>,
      ),
    ).toBe('<p>en|ltr|ar|/|Request a crane</p>');
  });

  it('fails loudly outside a provider', () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(/LangProvider/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/lang.test.tsx`
Expected: FAIL with `Failed to resolve import "./lang"`.

- [ ] **Step 3: Implement**

Create `src/lib/lang.tsx`:
```tsx
import { createContext, useContext, useMemo, type JSX, type ReactNode } from 'react';
import { getCopy } from '@/content';
import type { Copy, Lang } from '@/content/types';

export interface LangValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  copy: Copy;
  otherLang: Lang;
  otherHref: string; // '/en/' or '/'
}

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }): JSX.Element {
  const value = useMemo<LangValue>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      copy: getCopy(lang),
      otherLang: lang === 'ar' ? 'en' : 'ar',
      otherHref: lang === 'ar' ? '/en/' : '/',
    }),
    [lang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error('useLang() must be called inside <LangProvider>.');
  return value;
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/lib/lang.test.tsx`
Expected: PASS, `Tests  3 passed (3)`.

- [ ] **Step 5: Run the whole Part B suite and type-check**

Run: `npm test && npx tsc --noEmit`
Expected: every test file passes (Part B adds 8 files and 50 tests, on top of any A1 tests); `tsc` prints nothing.

- [ ] **Step 6: Commit**
```bash
git add src/lib/lang.tsx src/lib/lang.test.tsx
git commit -m "feat(lib): add language context with copy and direction" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Proposed contract additions (Part B)

1. **`mailtoHref(subject: string, body: string): string`** exported from `src/lib/whatsapp.ts` (C8). Used by `whatsappHref`'s staging fallback, the form's "Send by email" and the documents' "Request by email". When there is no WhatsApp number, `whatsappHref` uses the message's first line as the mail subject.
2. **`Copy.lang: Lang`**, so pure helpers that receive a `Copy` (Part C's form logic) can format numbers. Plus the exported helper types `ServiceId`, `CapacityBand`, `DurationId`, `DocumentSlot`, `SiteGalleryId`, `SiteGallery`, `ServiceCopy`, `CraneTypeCopy`, `FieldCopy` (re-exported from `src/content/index.ts`).
3. **`src/generated/images.ts` stub**: now accepted as C11 (A1.7 writes it). B.1 only re-creates it if it is missing.
4. ~~Font subsets must include U+202F~~ **Superseded (A1.5 review): the separator is U+00A0, which every font has.** `formatTonnes`/`formatMetres` use it per C8, but the Latin set in `05-typography.md` §5 lists only U+00A0. A1's `subset-fonts.mjs` should add U+202F, or the space falls back to a system font.
5. **Copy keys renamed for spec §15.1:** the deck's eyebrows are `hero.servicesLine` and `form.lead`, and both render *below* their heading. The deck's Hoist section label «السعة» is not in `Copy`; the capacity data label inside each load tag is `hoist.capacity` («أقصى حمولة» / "Max capacity").
6. **Hidden crane placeholders:** `cke2500` has `capacityT: 0` and casts its unprocessed Kobelco photo ids to `PhotoId`, because C7 makes those fields required. The cast is safe only because the crane is never rendered; `getImage()` would throw if it were.


---

## Part A2 — Truth gate, image pipeline, Picture (Day 2–3)

**Outcome:** the build refuses to ship unverified facts to production (truth gate). Atlas's photos are cropped, encoded and committed with a typed manifest, and `<Picture>` renders them. Hook points are checked by eye, and a temporary badge logo exists.

**Runs after Part B.** These files must exist: `src/content/ar.ts` and `src/content/en.ts` (exporting `ar` / `en` of type `Copy`) and `src/content/cranes.ts` (exporting `cranes: Crane[]`). Part A1 must be complete too: `vite.config.ts`, the Vitest setup, and the `src/generated/images.ts` stub from A1.7.

Every command runs in `/Users/montheribrahim/Downloads/atlas-website`. The originals are `/Users/montheribrahim/Downloads/IMG_63*.JPG`. They are read, **never written**. The expected outputs below come from a dry run on 4 Nov 2026 with the real photos.

---

### Task A2.1: Truth rules (`src/lib/truth.ts`)

**Files:**
- Create: `src/lib/truth.ts`
- Test: `src/lib/truth.test.ts`

These are the gate's rules from spec §4.3, kept as a pure function so they can be unit-tested:
- any string in the copy that contains `[[`, reported with its key path;
- any shown crane with `verified: false`;
- any missing `SITE_URL`, `VITE_WHATSAPP` or `VITE_PHONE`.

- [ ] **Step 1: Write the failing test `src/lib/truth.test.ts`**

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { findTruthProblems } from './truth';

const READY_ENV = { siteUrl: 'https://atlas.example.ly', whatsapp: '218910000000', phone: '+218910000000' };
const check = (input: Partial<Parameters<typeof findTruthProblems>[0]>) =>
  findTruthProblems({ copies: [], cranes: [], env: READY_ENV, ...input });

describe('findTruthProblems', () => {
  it('returns nothing when copy, cranes and env are ready', () => {
    expect(
      check({
        copies: [{ hero: { title: 'Every project has the right crane' }, count: 5, ok: true, none: null }],
        cranes: [{ id: 'gmk6350', verified: true, hidden: false }],
      }),
    ).toEqual([]);
  });

  it('reports a [[TOKEN]] with its key path', () => {
    expect(check({ copies: [{ footer: { phone: 'Call [[PHONE]]' } }] })).toEqual([
      'copies[0].footer.phone: unresolved [[PHONE]]',
    ]);
  });

  it('walks arrays and every copy, and lists every token in a string', () => {
    const ar = { services: { items: [{ text: 'ok' }, { text: '[[CONFIRM]] و [[HOURS]]' }] } };
    const en = { alt: { '6398': 'Two cranes [[CONFIRM]]' } };
    expect(check({ copies: [ar, en] })).toEqual([
      'copies[0].services.items[1].text: unresolved [[CONFIRM]], [[HOURS]]',
      'copies[1].alt.6398: unresolved [[CONFIRM]]',
    ]);
  });

  it('reports a dangling "[[" that never closes', () => {
    expect(check({ copies: [{ a: 'broken [[TOKEN' }] })).toEqual(['copies[0].a: unresolved [[TOKEN']);
  });

  it('ignores numbers, booleans, null and functions', () => {
    expect(check({ copies: [{ n: 1, b: false, z: null, f: () => '[[X]]' }] })).toEqual([]);
  });

  it('reports cranes that are shown but not verified, and skips hidden ones', () => {
    const cranes = [
      { id: 'rt700e', verified: false, hidden: false },
      { id: 'gmk6350', verified: true, hidden: false },
      { id: 'cke2500', verified: false, hidden: true },
    ];
    expect(check({ cranes })).toEqual(['crane rt700e: shown but not verified (set verified: true once Atlas confirms)']);
  });

  it('reports each missing env value, treating blanks as missing', () => {
    expect(check({ env: { siteUrl: '', whatsapp: null, phone: '  ' } })).toEqual([
      'SITE_URL is not set',
      'VITE_WHATSAPP is not set',
      'VITE_PHONE is not set',
    ]);
    expect(check({ env: {} })).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `npx vitest run src/lib/truth.test.ts`
Expected: FAIL, `Error: Cannot find module './truth'`.

- [ ] **Step 3: Create `src/lib/truth.ts`**

`TruthInput` is the exact parameter shape from the brief: `{ copies: unknown[]; cranes: { id; verified; hidden }[]; env: { siteUrl?; whatsapp?; phone? } }`.

```ts
/**
 * The truth gate's rules (spec §4.3), as a pure function so they are unit-tested.
 * vite/truth-gate.ts feeds it the real content and env at build time.
 */
export interface TruthInput {
  copies: unknown[];
  cranes: { id: string; verified: boolean; hidden: boolean }[];
  env: { siteUrl?: string | null; whatsapp?: string | null; phone?: string | null };
}

const TOKEN = /\[\[[^\]]*(?:\]\]|$)/g;

/** Every string under `value` that contains "[[", as "path: unresolved [[A]], [[B]]". */
function findTokens(value: unknown, path: string, out: string[]): void {
  if (typeof value === 'string') {
    if (value.includes('[[')) out.push(`${path}: unresolved ${(value.match(TOKEN) ?? []).join(', ')}`);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => findTokens(item, `${path}[${i}]`, out));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) findTokens(child, `${path}.${key}`, out);
  }
}

const missing = (v: string | null | undefined) => !v || v.trim() === '';

/** Lists everything that must not reach production. Empty array = ready to ship. */
export function findTruthProblems(input: TruthInput): string[] {
  const problems: string[] = [];
  input.copies.forEach((copy, i) => findTokens(copy, `copies[${i}]`, problems));
  for (const crane of input.cranes) {
    if (!crane.hidden && !crane.verified) {
      problems.push(`crane ${crane.id}: shown but not verified (set verified: true once Atlas confirms)`);
    }
  }
  if (missing(input.env.siteUrl)) problems.push('SITE_URL is not set');
  if (missing(input.env.whatsapp)) problems.push('VITE_WHATSAPP is not set');
  if (missing(input.env.phone)) problems.push('VITE_PHONE is not set');
  return problems;
}
```

- [ ] **Step 4: Run and watch it pass**

Run: `npx vitest run src/lib/truth.test.ts`
Expected: `Tests  7 passed (7)`.

Run: `npm test && npx tsc --noEmit`
Expected: every test file passes (Part B's tests included); no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/truth.ts src/lib/truth.test.ts
git commit -m "feat: add truth rules for unverified copy, cranes and env" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A2.2: The truth gate Vite plugin (`vite/truth-gate.ts`)

**Files:**
- Create: `vite/truth-gate.ts`
- Modify: `vite.config.ts`

**How the content is loaded, and why.** The gate must read `src/content/ar.ts`, `en.ts` and `cranes.ts` (TypeScript) from inside a running build. It uses Vite's own **module runner**, `runnerImport()` from `vite`. That is the loader behind `vite --configLoader runner`; it exists in Vite 8.3.5 and needs no dev server (≈ 30 ms per file in the dry run). It resolves the `@/` alias, extensionless relative imports and `define`d globals exactly as the app build does.

The two alternatives were rejected:
- **Node 24.22's built-in type stripping** (`await import(pathToFileURL(...))`) works only for files without runtime imports. In the dry run it failed with `ERR_MODULE_NOT_FOUND` as soon as a content file imported `./site` without an extension, and it cannot resolve `@/…` at all. Part B is free to use both.
- **`createServer()` + `ssrLoadModule()`** also works, but it starts a whole second dev server inside the build.

`runnerImport` is marked `@experimental` in Vite 8. If a future Vite removes it, swap the body of `load()` for `createServer({ configFile: false, root, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', resolve, define })` → `server.ssrLoadModule(file)` → `server.close()`. Type-only imports in the content files must use `import type` (they do, per C7).

- [ ] **Step 1: Create `vite/truth-gate.ts`**

```ts
import path from 'node:path';
import { runnerImport, type Plugin } from 'vite';
import { findTruthProblems, type TruthInput } from '../src/lib/truth.ts';

export interface TruthGateOptions {
  target: 'staging' | 'production';
  env: TruthInput['env'];
}

/**
 * Truth gate (spec §4.3). At the start of every build it loads the real content
 * (src/content/ar.ts, en.ts, cranes.ts) and checks it with findTruthProblems():
 * production builds FAIL and list every problem; staging builds warn with a count.
 *
 * The content is TypeScript that may use `@/` imports and extensionless relative
 * imports, so it is loaded with Vite's own module runner (runnerImport), the same
 * loader `vite --configLoader runner` uses. Node's built-in type stripping cannot
 * resolve `@/…` or `./site` (no extension), so it is not used.
 */
export function truthGate({ target, env }: TruthGateOptions): Plugin {
  let root = process.cwd();
  return {
    name: 'atlas-truth-gate',
    apply: 'build',
    configResolved(config) {
      root = config.root;
    },
    async buildStart() {
      const load = async <T>(file: string): Promise<T> => {
        const { module } = await runnerImport<T>(path.join(root, file), {
          configFile: false,
          root,
          logLevel: 'silent',
          resolve: { alias: { '@': path.join(root, 'src') } },
          define: { __BUILD_TARGET__: JSON.stringify(target) },
        });
        return module;
      };
      const { ar } = await load<{ ar: unknown }>('src/content/ar.ts');
      const { en } = await load<{ en: unknown }>('src/content/en.ts');
      const { cranes } = await load<{ cranes: TruthInput['cranes'] }>('src/content/cranes.ts');

      const problems = findTruthProblems({ copies: [ar, en], cranes, env });
      if (problems.length === 0) return;
      if (target === 'production') {
        this.error(
          `Truth gate: ${problems.length} problem(s) block the production build:\n  - ${problems.join('\n  - ')}`,
        );
      }
      this.warn(
        `Truth gate: ${problems.length} unverified item(s). Staging shows them with DraftBadges; ` +
          '`npm run build:production` lists them.',
      );
    },
  };
}
```

`configFile: false` matters: the runner must not load `vite.config.ts` again, or it would start the gate inside the gate.

- [ ] **Step 2: Wire it into `vite.config.ts` (full file)**

The gate gets the same `target` as the `define`. The env values come from `process.env` after `syncEnv` (shell or `.env`). `VITE_SITE_URL` is set whenever `SITE_URL` is.

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fontPreload } from './vite/font-preload.ts';
import { truthGate } from './vite/truth-gate.ts';

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Copy the build settings from `.env*` files into process.env, so that the
 * `define` below and the Node-side plugins see the same values as the client.
 * Values already in the shell environment win.
 */
function syncEnv(mode: string) {
  const all = loadEnv(mode, process.cwd(), '');
  for (const key of ['BUILD_TARGET', 'SITE_URL', 'VITE_SITE_URL', 'VITE_WHATSAPP', 'VITE_PHONE']) {
    if (all[key] && !process.env[key]) process.env[key] = all[key];
  }
  // SITE_URL is the documented name; the client reads it as VITE_SITE_URL.
  if (!process.env.VITE_SITE_URL && process.env.SITE_URL) process.env.VITE_SITE_URL = process.env.SITE_URL;
}

export default defineConfig(({ mode }) => {
  syncEnv(mode);
  const target = process.env.BUILD_TARGET === 'production' ? 'production' : 'staging';
  return {
    plugins: [
      react(),
      tailwindcss(),
      fontPreload(),
      truthGate({
        target,
        env: { siteUrl: process.env.VITE_SITE_URL, whatsapp: process.env.VITE_WHATSAPP, phone: process.env.VITE_PHONE },
      }),
    ],
    resolve: { alias: { '@': path('./src') } },
    define: { __BUILD_TARGET__: JSON.stringify(target) },
    build: {
      rollupOptions: { input: { ar: path('./index.html'), en: path('./en/index.html') } },
    },
  };
});
```

- [ ] **Step 3: Staging build passes with a warning**

Run: `npx tsc --noEmit && npx vite build`
Expected: no type errors, then:
```
vite v8.3.5 building client environment for production...
[plugin atlas-truth-gate] Truth gate: <N> unverified item(s). Staging shows them with DraftBadges; `npm run build:production` lists them.
…
✓ built in …ms
```
`<N>` counts every `[[TOKEN]]` string in `ar` and `en`, plus 5 unverified cranes, plus 3 missing env values.

- [ ] **Step 4: Production build fails and lists the problems (the expected result today)**

Run: `BUILD_TARGET=production npx vite build; echo "exit $?"`
Expected: the build stops before transforming anything:
```
✗ Build failed in …ms
error during build:
Build failed with 1 error:

[plugin atlas-truth-gate]
RolldownError: Truth gate: <N> problem(s) block the production build:
  - copies[0].<path>: unresolved [[…]]
  - …
  - copies[1].<path>: unresolved [[…]]
  - crane rt700e: shown but not verified (set verified: true once Atlas confirms)
  - crane atf60-3: shown but not verified (set verified: true once Atlas confirms)
  - crane ac200-1: shown but not verified (set verified: true once Atlas confirms)
  - crane quy250: shown but not verified (set verified: true once Atlas confirms)
  - crane gmk6350: shown but not verified (set verified: true once Atlas confirms)
  - SITE_URL is not set
  - VITE_WHATSAPP is not set
  - VITE_PHONE is not set
…
exit 1
```
There is no `cke2500` line, because it is hidden. This failure is the proof that the gate works (spec §11.1).

- [ ] **Step 5: Show the gate reads the environment**

Run: `SITE_URL=https://staging.example.ly VITE_WHATSAPP=218900000000 VITE_PHONE=+218900000000 BUILD_TARGET=production npx vite build 2>&1 | grep -E 'problem\(s\)|is not set'`
Expected: one line, `RolldownError: Truth gate: <N − 3> problem(s) block the production build:`, and **no** `is not set` lines.

- [ ] **Step 6: Commit**

```bash
git add vite/truth-gate.ts vite.config.ts
git commit -m "build: add truth gate that blocks unverified production builds" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A2.3: Image pipeline (`scripts/build-assets.mjs`)

**Files:**
- Create: `assets-src/crops.json` (copy of `docs/asset-crops.json`), `assets-src/hook-points.json`
- Create: `scripts/lib/assets-helpers.mjs`, `scripts/build-assets.mjs`
- Test: `scripts/lib/assets-helpers.test.mjs`
- Generated (committed): `public/img/*.avif`, `public/img/*.webp`, `public/og-ar.jpg`, `public/og-en.jpg`, `src/generated/images.ts` (overwrites the A1.7 stub; contract C6)

The pipeline:
- For every photo except the Kobelco ones (6367, 6370, 6371) and every crop with `status: "OK"`, it writes AVIF (quality 50, effort 4) and WebP (quality 72) at 640 / 1280 / 1920 px, plus 2560 for the hero photos 6398 and 6359, and never upscales.
- Each crop also gets a 24 px WebP placeholder and its hook point, if the hook lies inside the crop.
- It writes the 1200×630 Open Graph JPEGs.
- File names are `/img/<photo>-<crop>-<width>.<hash8>.<ext>`, where the hash is the first 8 hex characters of the file's SHA-256.

- [ ] **Step 1: Copy the crops**

Run: `mkdir -p assets-src && cp docs/asset-crops.json assets-src/crops.json && cmp docs/asset-crops.json assets-src/crops.json && echo same`
Expected: `same`. Rectangles are `photos[id].crops[desktop_16x9|mobile_4x5|mobile_9x16] = { status, left, top, width, height }` in source pixels.

- [ ] **Step 1b: Move the two mobile hero crops so they contain the real hook** (decided 4 Nov 2026; without this, phones get no sling)

The original 9:16 crops for 6398 and 6359 sit right of centre and miss the hook. Both new crops end at y = 2401, above the watermark's top edge (y = 2567 − 135 = 2432, minus 30 px clearance = 2402). So they stay watermark-free at any x.
- 6398 (Arabic hero): x 2290–3641 contains the Faun hook at x ≈ 3226.
- 6359 (English hero): x 604–1955 contains the Grove hook at x ≈ 1391.

Run:
```bash
node -e "
const fs=require('fs');const f='assets-src/crops.json';const j=JSON.parse(fs.readFileSync(f,'utf8'));
j.photos['6398'].crops.mobile_9x16={status:'OK',left:2290,top:0,width:1351,height:2401};
j.photos['6359'].crops.mobile_9x16={status:'OK',left:604,top:0,width:1351,height:2401};
fs.writeFileSync(f,JSON.stringify(j,null,1)+'\n');
console.log(JSON.stringify(j.photos['6398'].crops.mobile_9x16),JSON.stringify(j.photos['6359'].crops.mobile_9x16));"
```
Expected: `{"status":"OK","left":2290,"top":0,"width":1351,"height":2401} {"status":"OK","left":604,"top":0,"width":1351,"height":2401}`

- [ ] **Step 2: Create `assets-src/hook-points.json` (first estimates, checked in A2.4)**

These are source-pixel estimates measured from thumbnails. Task A2.4 checks them by eye and refines them.

```json
{
  "6398": { "x": 3219, "y": 1234 },
  "6359": { "x": 1407, "y": 1523 },
  "6389": { "x": 894, "y": 1804 }
}
```

- [ ] **Step 3: Write the failing helper tests `scripts/lib/assets-helpers.test.mjs`**

Width rule: use every ladder width the crop can fill. If the crop is too narrow for the next ladder width, also ship the crop's own full width, unless that is within 10% of the last width (a 1-px-larger file is pointless). Never upscale.

```js
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { encodePlan, hookInRect, imageFileName, widthsFor } from './assets-helpers.mjs';

describe('encodePlan', () => {
  it('caps the 9:16 mobile hero at 1080 px with AVIF q45', () => {
    expect(encodePlan('mobile_9x16', 1351, true)).toEqual({ widths: [640, 828, 1080], avifQuality: 45 });
  });
  it('uses widthsFor and q50 for every other crop', () => {
    expect(encodePlan('desktop_16x9', 4240, true)).toEqual({ widths: [640, 1280, 1920, 2560], avifQuality: 50 });
    expect(encodePlan('mobile_4x5', 1921, false)).toEqual({ widths: [640, 1280, 1920], avifQuality: 50 });
  });
});

describe('widthsFor', () => {
  it('uses 640/1280/1920 for a wide crop', () => {
    expect(widthsFor(4240, false)).toEqual([640, 1280, 1920]);
  });
  it('adds 2560 for hero photos', () => {
    expect(widthsFor(4240, true)).toEqual([640, 1280, 1920, 2560]);
  });
  it('never upscales: a narrow crop stops at its own width', () => {
    expect(widthsFor(1889, false)).toEqual([640, 1280, 1889]);
    expect(widthsFor(500, false)).toEqual([500]);
  });
  it('skips the crop width when it is within 10% of the last ladder width', () => {
    expect(widthsFor(1921, true)).toEqual([640, 1280, 1920]);
    expect(widthsFor(1351, true)).toEqual([640, 1280]);
  });
});

describe('hookInRect', () => {
  const rect = { left: 1160, top: 0, width: 1921, height: 2401 };
  it('returns the hook when it lies inside the crop', () => {
    expect(hookInRect({ x: 1407, y: 1523 }, rect)).toEqual({ x: 1407, y: 1523 });
  });
  it('returns null when the hook is outside the crop', () => {
    expect(hookInRect({ x: 3219, y: 1234 }, rect)).toBeNull();
    expect(hookInRect({ x: 1407, y: 2500 }, rect)).toBeNull();
  });
  it('treats the right and bottom edges as outside', () => {
    expect(hookInRect({ x: 3081, y: 10 }, rect)).toBeNull();
    expect(hookInRect({ x: 1160, y: 0 }, rect)).toEqual({ x: 1160, y: 0 });
  });
  it('returns null when there is no hook', () => {
    expect(hookInRect(undefined, rect)).toBeNull();
  });
});

describe('imageFileName', () => {
  it('builds <photo>-<crop>-<width>.<hash8>.<ext> from the file bytes', () => {
    const name = imageFileName('6398', 'desktop_16x9', 1920, 'avif', Buffer.from('abc'));
    expect(name).toBe('6398-desktop_16x9-1920.ba7816bf.avif');
  });
});
```

- [ ] **Step 4: Run and watch it fail**

Run: `npx vitest run scripts`
Expected: FAIL, `Error: Failed to resolve import "./assets-helpers.mjs" from "scripts/lib/assets-helpers.test.mjs". Does the file exist?`

- [ ] **Step 5: Create `scripts/lib/assets-helpers.mjs`**

```js
// Pure helpers for scripts/build-assets.mjs and scripts/mark-hooks.mjs (tested in assets-helpers.test.mjs).
import { createHash } from 'node:crypto';

/**
 * Output widths for one crop. Every ladder width the crop can fill is used. If the crop is
 * too narrow for the next ladder width, its own full width is added too, unless that is
 * within 10% of the last width (no visible gain). Never upscales.
 */
export function widthsFor(cropWidth, isHero) {
  const ladder = isHero ? [640, 1280, 1920, 2560] : [640, 1280, 1920];
  const widths = ladder.filter((w) => w <= cropWidth);
  const last = widths.at(-1) ?? 0;
  if (widths.length < ladder.length && cropWidth > last * 1.1) widths.push(cropWidth);
  return widths;
}

/**
 * Widths and AVIF quality for one crop. The 9:16 mobile hero is capped at 1080 px with AVIF q45,
 * so a 390 px-wide 3x phone (needs 1170) picks 1080 instead of 1280. That keeps it inside the
 * 80 KB mobile-hero budget (spec §9); the 8% resolution shortfall is not visible. Other crops
 * use widthsFor() at q50.
 */
export function encodePlan(cropName, cropWidth, isHero) {
  if (cropName === 'mobile_9x16') {
    return { widths: [640, 828, 1080].filter((w) => w <= cropWidth), avifQuality: 45 };
  }
  return { widths: widthsFor(cropWidth, isHero), avifQuality: 50 };
}

/** The hook point (source pixels) if it lies inside the crop rectangle, else null. */
export function hookInRect(hook, rect) {
  if (!hook) return null;
  const inside =
    hook.x >= rect.left && hook.x < rect.left + rect.width && hook.y >= rect.top && hook.y < rect.top + rect.height;
  return inside ? { x: hook.x, y: hook.y } : null;
}

/** `<photo>-<crop>-<width>.<hash8>.<ext>`; the hash is the first 8 hex chars of the file's SHA-256. */
export function imageFileName(photo, crop, width, ext, bytes) {
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
  return `${photo}-${crop}-${width}.${hash}.${ext}`;
}
```

- [ ] **Step 6: Run and watch it pass**

Run: `npx vitest run scripts`
Expected: `Tests  11 passed (11)`.

- [ ] **Step 7: Create `scripts/build-assets.mjs`**

How it works:
- Each crop is decoded once to raw pixels, and every size is resized from that buffer, so the 4240 px JPEG is not decoded again per width.
- It checks that every original exists **before** wiping `public/img`, so a wrong `PHOTOS_DIR` cannot leave you with an empty folder.
- It refuses an original whose size or EXIF orientation differs from `crops.json`, for example a clean export that arrives at a different size. Re-measure the crops first in that case.

```js
// Builds every shipped photo from Atlas's originals. Run with `npm run assets`.
// Reads:  assets-src/crops.json (copy of docs/asset-crops.json), assets-src/hook-points.json,
//         the original JPEGs in PHOTOS_DIR (default: the folder that contains this repo). Never modified.
// Writes: public/img/*.avif + *.webp (folder wiped first), public/og-ar.jpg, public/og-en.jpg,
//         src/generated/images.ts (the manifest <Picture> reads).
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { encodePlan, hookInRect, imageFileName } from './lib/assets-helpers.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PHOTOS_DIR = path.resolve(process.env.PHOTOS_DIR ?? path.join(ROOT, '..'));
const OUT_IMG = path.join(ROOT, 'public/img');
const OUT_TS = path.join(ROOT, 'src/generated/images.ts');

const SKIP = new Set(['6367', '6370', '6371']); // Kobelco: carries another company's logo (spec §3)
const HERO = new Set(['6398', '6359']); // hero photos also get 2560 px
const CROP_NAMES = ['desktop_16x9', 'mobile_4x5', 'mobile_9x16'];
const OG = { 'og-ar.jpg': '6398', 'og-en.jpg': '6359' }; // from each photo's desktop_16x9 crop

const crops = JSON.parse(await readFile(path.join(ROOT, 'assets-src/crops.json'), 'utf8'));
const hooks = JSON.parse(await readFile(path.join(ROOT, 'assets-src/hook-points.json'), 'utf8'));
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

/** Decodes one crop of an original to raw pixels and returns a factory for fresh sharp pipelines. */
async function loadCrop(photo, rect) {
  const file = path.join(PHOTOS_DIR, photo.file);
  const meta = await sharp(file).metadata();
  if (meta.width !== photo.source.width || meta.height !== photo.source.height || (meta.orientation ?? 1) !== 1) {
    throw new Error(
      `${file} is ${meta.width}x${meta.height} (EXIF orientation ${meta.orientation ?? 1}), but crops.json ` +
        `expects ${photo.source.width}x${photo.source.height}. Re-measure the crops before rebuilding.`,
    );
  }
  const { data, info } = await sharp(file).extract(rect).raw().toBuffer({ resolveWithObject: true });
  const raw = { width: info.width, height: info.height, channels: info.channels };
  return () => sharp(data, { raw });
}

// Check every original is there before wiping the previous output.
const used = Object.entries(crops.photos).filter(([id]) => !SKIP.has(id));
for (const [, photo] of used) {
  await access(path.join(PHOTOS_DIR, photo.file)).catch(() => {
    throw new Error(`Missing original ${photo.file} in ${PHOTOS_DIR}. Set PHOTOS_DIR to the folder with the IMG_63*.JPG files.`);
  });
}

await rm(OUT_IMG, { recursive: true, force: true });
await mkdir(OUT_IMG, { recursive: true });
await mkdir(path.dirname(OUT_TS), { recursive: true });

const images = {};
const photoIds = [];
let total = 0;

for (const [id, photo] of used) {
  photoIds.push(id);
  for (const cropName of CROP_NAMES) {
    const crop = photo.crops[cropName];
    if (crop?.status !== 'OK') continue;
    const rect = { left: crop.left, top: crop.top, width: crop.width, height: crop.height };
    const pipeline = await loadCrop(photo, rect);
    const entry = { photo: id, crop: cropName, rect, avif: [], webp: [], placeholder: '', hook: hookInRect(hooks[id], rect) };
    const sizes = [];
    const plan = encodePlan(cropName, rect.width, HERO.has(id));
    for (const width of plan.widths) {
      const [avif, webp] = await Promise.all([
        pipeline().resize({ width }).avif({ quality: plan.avifQuality, effort: 4 }).toBuffer(),
        pipeline().resize({ width }).webp({ quality: 72 }).toBuffer(),
      ]);
      for (const [format, bytes] of [['avif', avif], ['webp', webp]]) {
        const name = imageFileName(id, cropName, width, format, bytes);
        await writeFile(path.join(OUT_IMG, name), bytes);
        entry[format].push({ url: `/img/${name}`, width });
        total += bytes.length;
      }
      sizes.push(`${width}: ${kb(avif.length)}`);
    }
    const tiny = await pipeline().resize({ width: 24 }).webp({ quality: 50 }).toBuffer();
    entry.placeholder = `data:image/webp;base64,${tiny.toString('base64')}`;
    images[`${id}:${cropName}`] = entry;
    console.log(`${id} ${cropName.padEnd(12)} avif ${sizes.join(' · ')}${entry.hook ? '  [hook]' : ''}`);
  }
}

for (const [file, id] of Object.entries(OG)) {
  const { rect } = images[`${id}:desktop_16x9`];
  const pipeline = await loadCrop(crops.photos[id], rect);
  const bytes = await pipeline().resize({ width: 1200, height: 630, fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  await writeFile(path.join(ROOT, 'public', file), bytes);
  console.log(`public/${file} 1200x630 ${kb(bytes.length)}`);
}

const union = photoIds.map((id) => `'${id}'`).join(' | ');
const ts = `// Generated by scripts/build-assets.mjs. Do not edit: change assets-src/* and run \`npm run assets\`.
export type PhotoId = ${union};
export type CropName = 'desktop_16x9' | 'mobile_4x5' | 'mobile_9x16';
export interface ImageSource { url: string; width: number }
export interface CropImage {
  photo: PhotoId; crop: CropName;
  rect: { left: number; top: number; width: number; height: number }; // in source pixels
  avif: ImageSource[]; webp: ImageSource[];                          // ascending width
  hook: { x: number; y: number } | null;                            // source-pixel hook point, if any
}

export const images: Partial<Record<\`\${PhotoId}:\${CropName}\`, CropImage>> = ${JSON.stringify(images, null, 2)};

export function getImage(photo: PhotoId, crop: CropName): CropImage {
  const image = images[\`\${photo}:\${crop}\`];
  if (!image) throw new Error(\`No image \${photo}:\${crop}. Add the crop to assets-src/crops.json and run npm run assets.\`);
  return image;
}
`;
await writeFile(OUT_TS, ts);
console.log(`\n${Object.keys(images).length} crops, ${kb(total)} of AVIF + WebP in public/img; wrote src/generated/images.ts`);
```

- [ ] **Step 8: Run it**

Run: `npm run assets` (about 75 s on an M-series Mac; `PHOTOS_DIR` defaults to `/Users/montheribrahim/Downloads`)
Expected (abridged; 43 crop lines, then the OG lines):
```
6359 desktop_16x9 avif 640: 16.6 KB · 1280: 42.3 KB · 1920: 70.6 KB · 2560: 101.9 KB  [hook]
6359 mobile_4x5   avif 640: 27.3 KB · 1280: 64.5 KB · 1920: 107.0 KB  [hook]
6359 mobile_9x16  avif 640: … · 828: … · 1080: …  [hook]   (re-measure: new crop x 604–1955, q45; expect ≤ 80 KB at 1080)
6360 desktop_16x9 avif 640: 19.3 KB · 1280: 47.5 KB · 1920: 82.4 KB
…
6374 desktop_16x9 avif 640: 11.5 KB · 1280: 33.9 KB · 1920: 64.3 KB
6374 mobile_4x5   avif 640: 24.8 KB · 1280: 71.8 KB · 1889: 138.2 KB
…
6389 desktop_16x9 avif 640: 21.1 KB · 1280: 60.5 KB · 1920: 106.4 KB  [hook]
…
6398 desktop_16x9 avif 640: 16.5 KB · 1280: 44.5 KB · 1920: 76.6 KB · 2560: 113.0 KB  [hook]
6398 mobile_4x5   avif 640: 34.6 KB · 1280: 85.9 KB · 1920: 147.6 KB
6398 mobile_9x16  avif 640: … · 828: … · 1080: …  [hook]   (re-measure: new crop x 2290–3641, q45; expect ≤ 80 KB at 1080)
public/og-ar.jpg 1200x630 82.6 KB
public/og-en.jpg 1200x630 83.9 KB

43 crops, 20249.9 KB of AVIF + WebP in public/img; wrote src/generated/images.ts
```
The hero AVIFs at 1920 are 70.6 KB (6359) and 76.6 KB (6398), within docs/04's measured 64–77 KB. A wrong `PHOTOS_DIR` stops immediately with `Missing original IMG_6359.JPG in <dir>. Set PHOTOS_DIR …`, and `public/img` is left untouched.

**Mobile hero budget (resolved 4 Nov 2026):** the original 6398 9:16 crop was 103.9 KB AVIF at 1280 px, over spec §9's 80 KB. Step 1b moved both 9:16 hero crops onto the hook, and `encodePlan` caps them at 1080 px, AVIF q45. **Record the real 1080 px AVIF sizes for 6398 and 6359 here.** If either is still above 80 KB, change `avifQuality: 45` to `40` in `encodePlan`, update its test, and re-run.

- [ ] **Step 9: Verify the output**

Run: `ls public/img | wc -l && du -sh public/img && grep -c '"hook": {' src/generated/images.ts && grep '^export type PhotoId' src/generated/images.ts`
Expected:
```
     252
 20M	public/img
4
export type PhotoId = '6359' | '6360' | '6363' | '6364' | '6374' | '6375' | '6376' | '6379' | '6380' | '6382' | '6385' | '6388' | '6389' | '6392' | '6393' | '6395' | '6396' | '6397' | '6398';
```
That is C6's `PhotoId` union, with no Kobelco photos. There are 6 crops with a hook: 6359 desktop, 4:5 and 9:16; 6389 desktop; 6398 desktop and 9:16.

The re-run is deterministic: running `npm run assets` again rewrites byte-identical files with the same hashed names, so `git status --short public/img` shows nothing.

The manifest adds ≈ 15 KB gzip to the JS bundle. About 12 KB of that is the 43 inline placeholders; count it in the Part E budget check.

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass (Part B's types now use the real `PhotoId`).

- [ ] **Step 10: Commit (generated files included)**

```bash
git add assets-src scripts/build-assets.mjs scripts/lib public/img public/og-ar.jpg public/og-en.jpg src/generated/images.ts
git commit -m "feat: add image pipeline with AVIF/WebP crops, OG images and typed manifest" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A2.4: Check the hook points, and the temporary badge

**Files:**
- Create: `scripts/mark-hooks.mjs`, `public/brand/badge.png` (generated, committed; temporary logo stand-in)
- Modify: `assets-src/hook-points.json`, `src/generated/images.ts` (re-generated)
- Output, not committed: `.work/hooks/*.jpg` (`.work/` is git-ignored)

**What a hook point is:** the source pixel where a sling would hang. That is the bottom inside of the hook's curve (its saddle), not the hook block above it. The sling legs (`<path data-sling-leg>`) and the pin (`<circle data-hook-pin>`) start there.

- [ ] **Step 1: Create `scripts/mark-hooks.mjs`**

```js
// Visual check for assets-src/hook-points.json, plus the temporary logo stand-in.
// Run: node scripts/mark-hooks.mjs   (PHOTOS_DIR as in build-assets.mjs)
// Writes .work/hooks/<photo>-<crop>.jpg (whole crop, 1200 px wide, red crosshair on the hook)
// and .work/hooks/<photo>-zoom.jpg (600x600 source pixels around the hook, 1:1),
// then public/brand/badge.png (the round badge cut from IMG_6363's watermark, 512 px).
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { hookInRect } from './lib/assets-helpers.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PHOTOS_DIR = path.resolve(process.env.PHOTOS_DIR ?? path.join(ROOT, '..'));
const OUT = path.join(ROOT, '.work/hooks');
const crops = JSON.parse(await readFile(path.join(ROOT, 'assets-src/crops.json'), 'utf8'));
const hooks = JSON.parse(await readFile(path.join(ROOT, 'assets-src/hook-points.json'), 'utf8'));
await mkdir(OUT, { recursive: true });

/** A red crosshair with a centre ring, as an SVG the size of the image it is laid over. */
const crosshair = (w, h, x, y) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<g stroke="#ff2a1f" stroke-width="2" fill="none">` +
      `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/><line x1="0" y1="${y}" x2="${w}" y2="${y}"/>` +
      `<circle cx="${x}" cy="${y}" r="12"/></g></svg>`,
  );

for (const [id, hook] of Object.entries(hooks)) {
  const photo = crops.photos[id];
  const file = path.join(PHOTOS_DIR, photo.file);
  for (const [cropName, crop] of Object.entries(photo.crops)) {
    const rect = { left: crop.left, top: crop.top, width: crop.width, height: crop.height };
    if (crop.status !== 'OK' || !hookInRect(hook, rect)) {
      console.log(`${id} ${cropName}: hook outside the crop, no sling on this crop`);
      continue;
    }
    const scale = 1200 / rect.width;
    const h = Math.round(rect.height * scale);
    const x = Math.round((hook.x - rect.left) * scale);
    const y = Math.round((hook.y - rect.top) * scale);
    await sharp(file).extract(rect).resize({ width: 1200 })
      .composite([{ input: crosshair(1200, h, x, y) }]).jpeg({ quality: 82 })
      .toFile(path.join(OUT, `${id}-${cropName}.jpg`));
    const pct = `${(((hook.x - rect.left) / rect.width) * 100).toFixed(1)}% × ${(((hook.y - rect.top) / rect.height) * 100).toFixed(1)}%`;
    console.log(`${id} ${cropName}: hook at ${pct} of the crop -> .work/hooks/${id}-${cropName}.jpg`);
  }
  const zoom = {
    left: Math.max(0, hook.x - 300),
    top: Math.max(0, hook.y - 300),
    width: Math.min(600, photo.source.width - Math.max(0, hook.x - 300)),
    height: Math.min(600, photo.source.height - Math.max(0, hook.y - 300)),
  };
  await sharp(file).extract(zoom)
    .composite([{ input: crosshair(zoom.width, zoom.height, hook.x - zoom.left, hook.y - zoom.top) }])
    .jpeg({ quality: 90 }).toFile(path.join(OUT, `${id}-zoom.jpg`));
  console.log(`${id} zoom (1:1 around the hook) -> .work/hooks/${id}-zoom.jpg`);
}

// TEMPORARY logo stand-in (flagged in the README, Part E): the round badge burned into
// every photo as a watermark, cut from IMG_6363 using the watermark model in
// docs/04-asset-plan.md (centre x = w/2, y = h − 265·(w/4240), radius 135·(w/4240)).
// Replace public/brand/badge.png when Atlas sends the vector logo.
const badgeSrc = crops.photos['6363'];
const k = badgeSrc.source.width / 4240;
const cx = Math.round(badgeSrc.source.width / 2);
const cy = Math.round(badgeSrc.source.height - 265 * k);
const r = Math.round(135 * k);
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><circle cx="256" cy="256" r="256"/></svg>`);
await mkdir(path.join(ROOT, 'public/brand'), { recursive: true });
await sharp(path.join(PHOTOS_DIR, badgeSrc.file))
  .extract({ left: cx - r, top: cy - r, width: 2 * r, height: 2 * r })
  .resize(512, 512, { kernel: 'lanczos3' })
  .ensureAlpha()
  .composite([{ input: mask, blend: 'dest-in' }])
  .png({ palette: true, compressionLevel: 9 })
  .toFile(path.join(ROOT, 'public/brand/badge.png'));
console.log(`public/brand/badge.png 512x512 (cut from ${badgeSrc.file}, centre ${cx},${cy}, r ${r})`);
```

- [ ] **Step 2: Run it with the first estimates**

Run: `node scripts/mark-hooks.mjs`
Expected (numeric JSON keys come out in ascending order):
```
6359 desktop_16x9: hook at 33.2% × 63.9% of the crop -> .work/hooks/6359-desktop_16x9.jpg
6359 mobile_4x5: hook at 12.9% × 63.4% of the crop -> .work/hooks/6359-mobile_4x5.jpg
6359 mobile_9x16: hook at ~58.5% × 66.6% of the crop -> .work/hooks/6359-mobile_9x16.jpg
6359 zoom (1:1 around the hook) -> .work/hooks/6359-zoom.jpg
6389 desktop_16x9: hook at 21.1% × 75.6% of the crop -> .work/hooks/6389-desktop_16x9.jpg
6389 mobile_4x5: hook outside the crop, no sling on this crop
6389 mobile_9x16: hook outside the crop, no sling on this crop
6389 zoom (1:1 around the hook) -> .work/hooks/6389-zoom.jpg
6398 desktop_16x9: hook at 75.9% × 51.7% of the crop -> .work/hooks/6398-desktop_16x9.jpg
6398 mobile_4x5: hook outside the crop, no sling on this crop
6398 mobile_9x16: hook at ~69.3% × 54.1% of the crop -> .work/hooks/6398-mobile_9x16.jpg
6398 zoom (1:1 around the hook) -> .work/hooks/6398-zoom.jpg
public/brand/badge.png 512x512 (cut from IMG_6363.JPG, centre 2120,2567, r 135)
```

- [ ] **Step 3: Look at the marks and correct the points**

Run: `open .work/hooks/6398-zoom.jpg .work/hooks/6359-zoom.jpg .work/hooks/6389-zoom.jpg .work/hooks/6398-desktop_16x9.jpg`

What the planning check saw: all three first estimates sit on the **hook block** (the striped sheave block), 65–75 source px above the hook's saddle. Replace `assets-src/hook-points.json` with the corrected points:

```json
{
  "6398": { "x": 3226, "y": 1300 },
  "6359": { "x": 1391, "y": 1600 },
  "6389": { "x": 885, "y": 1868 }
}
```

Run `node scripts/mark-hooks.mjs` again and re-open the three zoom images. Expected: the ring sits in the bottom inside of the hook's curve. 6389's hook is soft (out of focus); there, use the lowest point of the hook's dark silhouette. If a ring is off, move that point a few source pixels (one zoom pixel = one source pixel) and repeat.

The 6398 desktop crop must still read "hook at ≈ 76% × ≈ 54%" (right-hand crane, AR hero). 6359 desktop must read ≈ 33% × ≈ 67% (left side, EN hero).

**For Part C:** the hook lies **outside both mobile 9:16 hero crops** (6398 and 6359), so with the current crops the phone hero has no sling. Per spec §5.2 the WhatsApp button then sits in the band. 6359's `mobile_4x5` does contain the hook (≈ 12% from its left edge).

- [ ] **Step 4: Refresh the manifest with the corrected hooks**

Run: `npm run assets && git status --short public/img && git diff --stat src/generated/images.ts`
Expected: the same 43 lines as A2.3, no changes under `public/img` (the encodes are deterministic), and `src/generated/images.ts` changes only in the 4 `hook` blocks (`1 file changed, 8 insertions(+), 8 deletions(-)`).

- [ ] **Step 5: Look at the badge**

Run: `open public/brand/badge.png && ls -l public/brand/badge.png`
Expected: the round Atlas badge (Arabic name, globe, crane, "ATLAS ALSHRAA") on a transparent background with clean round edges, 512×512 px, ≈ 77 KB. It is upscaled from a 270 px watermark, so it is soft. That is acceptable for a stand-in shown at 56–80 px. The README (Part E) must flag it as temporary.

- [ ] **Step 6: Commit**

```bash
git add scripts/mark-hooks.mjs assets-src/hook-points.json src/generated/images.ts public/brand/badge.png
git commit -m "feat: check hook points visually and add temporary badge logo" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task A2.5: `<Picture>` (`src/components/Picture.tsx`)

**Files:**
- Create: `src/components/Picture.tsx`
- Test: `src/components/Picture.test.tsx`

Contract C6:
- The component renders `<picture>` with AVIF and WebP `<source>`s. When `mobileCrop` is set, the mobile crop comes first behind `(max-width: 767.98px)`; the `.98` keeps 768 px itself on the desktop crop.
- The `<img>` gets `width` and `height` from the main crop's `rect`, the 24 px placeholder as its background, and `object-fit: cover; object-position: 50% 0`. The hero sling overlay depends on that framing (`preserveAspectRatio="xMidYMin slice"`).
- The mobile `<source>`s carry the mobile crop's own `width`/`height`, so the browser reserves the right aspect ratio when art direction switches crops (no CLS).
- The `<img>` `src` fallback is the WebP closest to 1280 px.
- React 19 renders `fetchPriority` as `fetchpriority` and does not add an image preload for an `<img>` inside `<picture>`.

- [ ] **Step 1: Write the failing test `src/components/Picture.test.tsx`**

It renders with `react-dom/server` (as the prerender will) and parses the markup back into DOM nodes with jsdom. It uses the real manifest from A2.3.

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getImage } from '@/generated/images';
import { Picture } from './Picture';

/** Renders on the "server" and parses the markup back into DOM nodes. */
function render(ui: React.ReactElement) {
  const html = renderToStaticMarkup(ui);
  const host = document.createElement('div');
  host.innerHTML = html;
  const picture = host.querySelector('picture')!;
  return { html, picture, sources: [...host.querySelectorAll('source')], img: host.querySelector('img')! };
}

const srcset = (list: { url: string; width: number }[]) => list.map((s) => `${s.url} ${s.width}w`).join(', ');

describe('Picture', () => {
  const desktop = getImage('6398', 'desktop_16x9');
  const mobile = getImage('6398', 'mobile_9x16');

  it('renders AVIF then WebP sources for one crop', () => {
    const { html, sources } = render(<Picture photo="6398" crop="desktop_16x9" alt="Two cranes" sizes="100vw" />);
    expect(html.startsWith('<picture')).toBe(true);
    expect(sources.map((s) => s.getAttribute('type'))).toEqual(['image/avif', 'image/webp']);
    expect(sources[0].getAttribute('srcset')).toBe(srcset(desktop.avif));
    expect(sources[1].getAttribute('srcset')).toBe(srcset(desktop.webp));
    expect(sources.every((s) => !s.hasAttribute('media') && s.getAttribute('sizes') === '100vw')).toBe(true);
  });

  it('puts the mobile crop first behind a < 768px media query', () => {
    const { sources } = render(
      <Picture photo="6398" crop="desktop_16x9" mobileCrop="mobile_9x16" alt="Two cranes" sizes="100vw" />,
    );
    expect(sources.map((s) => `${s.getAttribute('media')} ${s.getAttribute('type')}`)).toEqual([
      '(max-width: 767.98px) image/avif',
      '(max-width: 767.98px) image/webp',
      'null image/avif',
      'null image/webp',
    ]);
    expect(sources[0].getAttribute('srcset')).toBe(srcset(mobile.avif));
    expect(sources[0].getAttribute('width')).toBe(String(mobile.rect.width));
    expect(sources[0].getAttribute('height')).toBe(String(mobile.rect.height));
  });

  it('gives the <img> the crop size, alt, placeholder and cover/top framing', () => {
    const { img } = render(<Picture photo="6398" crop="desktop_16x9" alt="Two cranes" sizes="100vw" />);
    expect(img.getAttribute('width')).toBe(String(desktop.rect.width));
    expect(img.getAttribute('height')).toBe(String(desktop.rect.height));
    expect(img.getAttribute('alt')).toBe('Two cranes');
    expect(img.getAttribute('src')).toMatch(/^\/img\/6398-desktop_16x9-\d+\.[0-9a-f]{8}\.webp$/);
    expect(img.style.backgroundImage).toContain('data:image/webp;base64,');
    expect(img.style.backgroundSize).toBe('cover');
    expect(img.style.objectFit).toBe('cover');
    expect(img.style.objectPosition).toBe('50% 0');
  });

  it('loads lazily by default', () => {
    const { img } = render(<Picture photo="6359" crop="desktop_16x9" alt="" sizes="50vw" />);
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.hasAttribute('fetchpriority')).toBe(false);
  });

  it('loads eagerly with high fetch priority when priority is set', () => {
    const { img } = render(<Picture photo="6359" crop="desktop_16x9" alt="" sizes="100vw" priority />);
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('decoding')).toBe('sync');
  });

  it('applies className to <img> and pictureClassName to <picture>', () => {
    const { img, picture } = render(
      <Picture photo="6359" crop="desktop_16x9" alt="" sizes="100vw" className="h-full w-full" pictureClassName="block" />,
    );
    expect(img.getAttribute('class')).toBe('h-full w-full');
    expect(picture.getAttribute('class')).toBe('block');
  });
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `npx vitest run src/components/Picture.test.tsx`
Expected: FAIL, `Error: Failed to resolve import "./Picture" from "src/components/Picture.test.tsx". Does the file exist?`

- [ ] **Step 3: Create `src/components/Picture.tsx`**

```tsx
import type { JSX } from 'react';
import { getImage, type CropName, type ImageSource, type PhotoId } from '@/generated/images';

export interface PictureProps {
  photo: PhotoId;
  crop: CropName;                 // used ≥ 768px (or always, when mobileCrop is absent)
  mobileCrop?: CropName;          // used < 768px
  alt: string;
  sizes: string;
  priority?: boolean;             // fetchpriority="high", loading="eager", decoding="sync"
  className?: string;             // applied to <img>
  pictureClassName?: string;      // applied to <picture>
}

const MOBILE = '(max-width: 767.98px)';
const srcSet = (list: ImageSource[]) => list.map((s) => `${s.url} ${s.width}w`).join(', ');

/** Art-directed, responsive photo from the generated manifest (scripts/build-assets.mjs). */
export function Picture({ photo, crop, mobileCrop, alt, sizes, priority = false, className, pictureClassName }: PictureProps): JSX.Element {
  const main = getImage(photo, crop);
  const mobile = mobileCrop ? getImage(photo, mobileCrop) : null;
  // The <img> fallback: the WebP closest to 1280 px (every current browser picks a <source>).
  const fallback = main.webp.find((s) => s.width >= 1280) ?? main.webp[main.webp.length - 1];
  return (
    <picture className={pictureClassName}>
      {mobile && (
        <>
          <source media={MOBILE} type="image/avif" srcSet={srcSet(mobile.avif)} sizes={sizes} width={mobile.rect.width} height={mobile.rect.height} />
          <source media={MOBILE} type="image/webp" srcSet={srcSet(mobile.webp)} sizes={sizes} width={mobile.rect.width} height={mobile.rect.height} />
        </>
      )}
      <source type="image/avif" srcSet={srcSet(main.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(main.webp)} sizes={sizes} />
      <img
        src={fallback.url}
        alt={alt}
        width={main.rect.width}
        height={main.rect.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={className}
        style={{
          backgroundImage: `url(${main.placeholder})`,
          backgroundSize: 'cover',
          objectFit: 'cover',
          objectPosition: '50% 0',
        }}
      />
    </picture>
  );
}
```

The component is SSR-safe (global rule 1): it only reads the static manifest during render.

- [ ] **Step 4: Run and watch it pass**

Run: `npx vitest run src/components/Picture.test.tsx`
Expected: `Tests  6 passed (6)`.

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected: all tests pass, no type errors, and the staging build passes with the truth-gate warning.

- [ ] **Step 5: Commit**

```bash
git add src/components/Picture.tsx src/components/Picture.test.tsx
git commit -m "feat: add art-directed Picture component" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Part A2 done when

- `npm test` passes: A1 (15) + A2 (7 truth + 9 helpers + 6 Picture) + Part B's tests.
- `npx tsc --noEmit && npx vite build` passes in staging with the truth-gate warning, and `BUILD_TARGET=production npx vite build` exits 1, listing every problem.
- `public/img` holds 252 files (≈ 20 MB); `public/og-ar.jpg`, `public/og-en.jpg` and `public/brand/badge.png` exist; `src/generated/images.ts` has 43 crops and 4 hooks.
- `git log --oneline` shows 5 new commits (A2.1–A2.5).

### Proposed contract additions (Part A2)

1. **`vite/truth-gate.ts` exports `truthGate({ target, env }: TruthGateOptions): Plugin`.** `vite.config.ts` passes the same `target` as the `define` and the env values from `process.env`. `src/lib/truth.ts` also exports `interface TruthInput` (the exact parameter shape of `findTruthProblems`).
2. **The truth gate loads content with Vite's `runnerImport`** (see A2.2 for why). Part B's content files may use `@/` and extensionless imports. `ar.ts`/`en.ts`/`cranes.ts` must keep the named exports `ar`, `en` and `cranes`.
3. **New file `scripts/lib/assets-helpers.mjs` (+ `.test.mjs`)**, which is not in the header's file map: `widthsFor(cropWidth, isHero)`, `hookInRect(hook, rect)` and `imageFileName(photo, crop, width, ext, bytes)`.
4. **Width rule:** clamp to the crop width, and add the crop's own width only when it is more than 10% above the last ladder width. So `mobile_9x16` crops (1328–1351 px wide) ship 640/1280 only, and `mobile_4x5` crops ship 640/1280/1920 or 640/1280/<own width>.
5. **`<Picture>` details beyond C6:** the mobile `<source>`s carry the mobile crop's `width`/`height`, the `<img>` `src` is the WebP closest to 1280 px, and the mobile media query is `(max-width: 767.98px)`.
6. **Decision needed (spec conflict):** 6398 `mobile_9x16` at 1280 px is 103.9 KB AVIF at q50 (spec §4.5), above the 80 KB mobile hero budget (spec §9). Options: hero mobile crops at AVIF q42 (≈ 75 KB), or `sizes` that cap the request at 640 px.
7. **Design note for Part C:** with the current crops the hook is outside both 9:16 hero crops (6398, 6359), so phones get no sling (the button sits in the band). The corrected hook points are 6398 (3226, 1300), 6359 (1391, 1600) and 6389 (885, 1868).


---

## Part C — Sections and components, static (Days 3–5)

**Depends on:** Parts A1, B and A2 are finished:
- `src/styles.css` with the C4 tokens and classes;
- `src/content/*` and `src/lib/*` (Part B);
- `src/generated/images.ts` with real data, `public/img/*` and `public/brand/badge.png` (A2);
- `src/components/Picture.tsx` (C6).

**Produces:** the complete page, fully working **with no motion**. Every element carries the C9 DOM attributes that Parts D and E rely on.

**Rules for every component in this part** (on top of the global rules):
- **SSR-safe.** `window`/`document` only inside effects and handlers. `env` (C3) is a build-time constant, so reading it during render is safe.
- **Spec §15 (Impeccable floor):**
  - no eyebrow or label above any heading;
  - no section numbers;
  - mono (`.t-spec`, `font-mono`) only for model codes, capacities and measurements;
  - icons are the authored SVGs in `Icons.tsx`, never Unicode glyphs;
  - every button has hover, focus-visible, disabled and loading states;
  - the RequestBar is the only element with a shadow, and it uses the `shadow-bar` token (C11);
  - `data-reveal` is **not** put on generic headings (Part D adds motion only through the C9 attributes);
  - all numerals in data use `tabular-nums`.
- **Craft floor:** no coloured side border thicker than 1 px on alerts, cards or list items. Error and failure boxes use a full 1 px border.
- **Tokens only (C11).** Tailwind's default palette and shadow scale are cleared. Use only the C4 colours (`navy-950 navy red red-bright concrete white steel ink line line-dark`, with `/opacity` modifiers) and `shadow-bar`. Do not use `transparent`, `black`, `gray-*` or any other default name.
- **Type classes.** A1 puts the `.t-*` classes in `@layer components`, so a utility on the same element would override them. Do not do that for font size or line height; size a child instead (for example `<span class="text-[0.55em]">` inside `.t-h1`).
- **Boolean data attributes** are written `data-x=""` so the HTML reads `data-x=""` (React would print `"true"` for a bare `data-x`).
- **Tests** live next to the code. A test that renders to the DOM starts with `// @vitest-environment jsdom` and uses the helpers in `src/test/render.tsx` (C.1).

---

### Task C.1: Entry, App shell, stubs and test helpers

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/test/render.tsx`
- Create (temporary stubs, replaced by later tasks): `src/sections/Header.tsx`, `Hero.tsx`, `Hoist.tsx`, `Services.tsx`, `CraneGrid.tsx`, `Sites.tsx`, `Documents.tsx`, `RequestForm.tsx`, `Footer.tsx`, `src/components/RequestBar.tsx`
- Modify (only if the rules are missing): `src/styles.css`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Check what A1 left in place**

Run: `grep -n 'id="root"\|src/main.tsx' index.html en/index.html; grep -n "fonts.css\|progress-rope\|::selection" src/styles.css`
Expected:
- both HTML files have `<div id="root">` (with Part E's `<!--app-->` placeholder inside, if E has run) and `<script type="module" src="/src/main.tsx">`;
- `src/styles.css` has `@import './fonts.css';`, a `.progress-rope` rule and a `::selection` rule. A1.x writes all three, so Step 3 is normally a no-op.

If either rule is **missing**, Step 3 adds it. If `fonts.css` is not imported by `styles.css`, add `import './fonts.css';` as the first import in `src/main.tsx` in Step 6.

- [ ] **Step 2: Write the test helpers**

Create `src/test/render.tsx`:
```tsx
import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Lang } from '@/content/types';
import { LangProvider } from '@/lib/lang';

/** Static HTML, as the prerender produces it, inside a detached <div> for DOM queries. Needs jsdom. */
export function renderHtml(node: ReactNode, lang: Lang = 'ar'): HTMLDivElement {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<LangProvider lang={lang}>{node}</LangProvider>);
  return host;
}

/** A live render: effects run and clicks work. Always await unmount() at the end. */
export async function mount(node: ReactNode, lang: Lang = 'ar'): Promise<{ host: HTMLDivElement; unmount: () => Promise<void> }> {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(<LangProvider lang={lang}>{node}</LangProvider>);
  });
  return {
    host,
    unmount: async () => {
      await act(async () => root.unmount());
      host.remove();
    },
  };
}

/** Clicks inside act() so React flushes the update. */
export async function click(element: Element | null): Promise<void> {
  if (!(element instanceof HTMLElement)) throw new Error('click(): element not found');
  await act(async () => {
    element.click();
  });
}

/** Sets a controlled input, textarea or select the way a user would (React sees the change). */
export async function changeValue(element: Element | null, value: string): Promise<void> {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
    throw new Error('changeValue(): not a form control');
  }
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element) as object, 'value')?.set;
  await act(async () => {
    setter?.call(element, value);
    element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
}
```

- [ ] **Step 3: Add the missing base rules (only those Step 1 found missing)**

If `progress-rope` was missing, append to `src/styles.css`:
```css
/* C9: the progress rope is hidden until Part D's motion.css shows it (html[data-motion="desktop"]). */
@layer base {
  .progress-rope { display: none; }
}
```
If `::selection` was missing, append to `src/styles.css`:
```css
/* Spec §15.5: themed browser surfaces. */
@layer base {
  ::selection { background: var(--color-navy); color: var(--color-white); }
  .bg-navy-950 ::selection { background: var(--color-red-bright); color: var(--color-navy-950); }
  html { caret-color: var(--color-red); accent-color: var(--color-red); scrollbar-color: var(--color-navy) var(--color-concrete); }
  a { text-underline-offset: 0.22em; text-decoration-thickness: 1px; }
}
```

- [ ] **Step 4: Write the stubs so the App compiles from day one**

Each later task replaces its stub with the full component. Run:
```bash
mkdir -p src/sections src/components
for name in Header Hero Hoist Services CraneGrid Sites Documents RequestForm Footer; do
  printf '// Temporary stub (C.1). Replaced by the full component later in Part C.\nexport function %s() {\n  return null;\n}\n' "$name" > "src/sections/$name.tsx"
done
printf '// Temporary stub (C.1). Replaced by the full component in C.11.\nexport function RequestBar() {\n  return null;\n}\n' > src/components/RequestBar.tsx
```
Expected: 10 files, each exporting one function that returns `null`.

- [ ] **Step 5: Write the failing App test**

Create `src/App.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { App } from './App';

describe('App', () => {
  it('renders the skip link, main and the progress rope', () => {
    const html = renderHtml(<App />, 'ar');
    expect(html.querySelector('a[href="#main"]')?.textContent).toBe('انتقل إلى المحتوى');
    expect(html.querySelector('main#main')).not.toBeNull();
    const rope = html.querySelector('[data-progress-rope]');
    expect(rope?.getAttribute('aria-hidden')).toBe('true');
    expect(rope?.className).toBe('progress-rope');
  });

  it('uses the English skip link on the English page', () => {
    expect(renderHtml(<App />, 'en').querySelector('a[href="#main"]')?.textContent).toBe('Skip to content');
  });
});
```

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL with `Failed to resolve import "./App"`.

- [ ] **Step 6: Write `App.tsx` and `main.tsx`**

Create `src/App.tsx`:
```tsx
import { useEffect } from 'react';
import { RequestBar } from '@/components/RequestBar';
import { loadAnalytics } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { CraneGrid } from '@/sections/CraneGrid';
import { Documents } from '@/sections/Documents';
import { Footer } from '@/sections/Footer';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { Hoist } from '@/sections/Hoist';
import { RequestForm } from '@/sections/RequestForm';
import { Services } from '@/sections/Services';
import { Sites } from '@/sections/Sites';

export function App() {
  const { copy } = useLang();

  // PART D: add `useSiteMotion();` on this line (import { useSiteMotion } from '@/motion'). Part C must not.

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="fixed start-3 top-3 z-50 -translate-y-24 bg-white px-5 py-3 font-semibold text-navy transition-transform focus:translate-y-0"
      >
        {copy.header.skipLink}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Hoist />
        <Services />
        <CraneGrid />
        <Sites />
        <Documents />
        <RequestForm />
      </main>
      <Footer />
      <RequestBar />
      <div data-progress-rope="" aria-hidden="true" className="progress-rope" />
    </>
  );
}

export default App;
```

Create `src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from '@/App';
import type { Lang } from '@/content/types';
import { LangProvider } from '@/lib/lang';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from the page');

// Each HTML entry declares its language on <html> (index.html = ar, en/index.html = en).
const lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'ar';

const app = (
  <StrictMode>
    <LangProvider lang={lang}>
      <App />
    </LangProvider>
  </StrictMode>
);

// Prerendered pages (Part E) already hold the markup: hydrate it. Before prerendering, #root holds
// nothing or only E's `<!--app-->` comment (not an element), so createRoot is used and clears it.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
```

- [ ] **Step 7: Run the tests and the build**

Run: `npx vitest run src/App.test.tsx && npx tsc --noEmit && npx vite build`
Expected: `Tests  2 passed (2)`; `tsc` prints nothing; Vite prints `✓ built in …` for both entries.

- [ ] **Step 8: Commit**
```bash
git add src/main.tsx src/App.tsx src/App.test.tsx src/test/render.tsx src/sections src/components/RequestBar.tsx src/styles.css
git commit -m "feat(app): add entry, App shell with section order and test helpers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.2: Shared components (Icons, Button, Fill, Logo, DraftBadge)

**Files:**
- Create: `src/components/Icons.tsx`
- Create: `src/components/Button.tsx`
- Create: `src/components/Fill.tsx`
- Create: `src/components/Logo.tsx`
- Create: `src/components/DraftBadge.tsx`
- Test: `src/components/components.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/components.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { Button } from './Button';
import { DraftBadge } from './DraftBadge';
import { Fill } from './Fill';
import { ArrowIcon, CloseIcon } from './Icons';
import { Logo } from './Logo';

describe('Button', () => {
  it('opens http links in a new tab and says so', () => {
    const a = renderHtml(<Button href="https://wa.me/218911234567" external>WhatsApp</Button>, 'en').querySelector('a');
    expect(a?.getAttribute('target')).toBe('_blank');
    expect(a?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a?.textContent).toBe('WhatsApp (opens in a new tab)');
  });

  it('keeps mailto and tel links in the same tab', () => {
    const a = renderHtml(<Button href="mailto:atlasalsahralibya@gmail.com" external>Email</Button>, 'en').querySelector('a');
    expect(a?.hasAttribute('target')).toBe(false);
    expect(a?.textContent).toBe('Email');
  });

  it('is a type="button" by default and has hover, focus and disabled styles', () => {
    const button = renderHtml(<Button>Go</Button>).querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.className).toContain('hover:');
    expect(button?.className).toContain('disabled:opacity-60');
  });

  it('shows a busy state while loading', () => {
    const button = renderHtml(<Button type="submit" loading>Sending…</Button>).querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(button?.querySelector('span[aria-hidden="true"]')).not.toBeNull();
  });

  it('turns the focus ring navy on light grounds', () => {
    const button = renderHtml(<Button ground="light">Go</Button>).querySelector('button');
    expect(button?.getAttribute('style')).toContain('outline-color:var(--color-navy)');
  });
});

describe('Icons', () => {
  it('mirrors the forward arrow in RTL only', () => {
    const svg = renderHtml(<ArrowIcon />).querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('rtl:-scale-x-100');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the close icon as SVG, not a glyph', () => {
    const html = renderHtml(<CloseIcon />);
    expect(html.querySelector('svg path')).not.toBeNull();
    expect(html.textContent).toBe('');
  });
});

describe('Fill', () => {
  it('puts nodes where the {placeholders} are', () => {
    expect(renderHtml(<Fill template="Call {phone} now" vars={{ phone: <bdi>+218 91</bdi> }} />).innerHTML).toBe(
      'Call <bdi>+218 91</bdi> now',
    );
  });
});

describe('Logo', () => {
  it('sets the name in the page language with the other language beside it', () => {
    const html = renderHtml(<Logo />, 'ar');
    expect(html.querySelector('img')?.getAttribute('src')).toBe('/brand/badge.png');
    expect(html.textContent).toContain('أطلس الصحراء');
    expect(html.querySelector('[lang="en"]')?.textContent).toBe('Atlas Alshraa');
  });

  it('uses the 80 px badge and the full name in the footer', () => {
    const html = renderHtml(<Logo variant="footer" />, 'en');
    expect(html.querySelector('img')?.getAttribute('width')).toBe('80');
    expect(html.textContent).toBe('Atlas Alshraa · For oil services');
  });
});

describe('DraftBadge', () => {
  it('marks an unverified value in staging', () => {
    const badge = renderHtml(<DraftBadge verified={false} />, 'en').querySelector('[data-testid="draft-badge"]');
    expect(badge?.textContent).toBe('DRAFT · unverified');
  });

  it('renders nothing for a verified value', () => {
    expect(renderHtml(<DraftBadge verified />, 'en').innerHTML).toBe('');
  });
});
```

Run: `npx vitest run src/components/components.test.tsx`
Expected: FAIL with `Failed to resolve import "./Button"`.

- [ ] **Step 2: Write the icons**

Create `src/components/Icons.tsx`:
```tsx
import type { SVGProps } from 'react';

// One authored set on a 24 px grid, 1.75 stroke, square ends (spec §15.7: no Unicode glyphs as icons).
type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Svg strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.6 20.4l1.2-4.1A8.5 8.5 0 1 1 8 19.3z" />
      <path d="M9.1 8.4c.2-.4.6-.5 1-.4l.6.2.8 1.9-.7.9c.5 1.1 1.4 2 2.5 2.5l.9-.7 1.9.8.2.6c.1.4 0 .8-.4 1-.6.4-1.4.6-2.2.4a7.2 7.2 0 0 1-4.9-4.9c-.2-.8 0-1.6.3-2.3z" />
    </Svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </Svg>
  );
}

/** The site's signature shape: a crane hook on its eye. */
export function HookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="3.5" r="1.5" />
      <path d="M12 5v7a4 4 0 0 1-8 0v-2l2 2" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

/** 'forward' points the reading direction (mirrored in RTL); 'back' the opposite; 'down' never mirrors. */
export function ArrowIcon({ direction = 'forward', className = '', ...props }: IconProps & { direction?: 'forward' | 'back' | 'down' }) {
  const turn = direction === 'down' ? 'rotate-90' : direction === 'back' ? '-scale-x-100 rtl:scale-x-100' : 'rtl:-scale-x-100';
  return (
    <Svg className={`${turn} ${className}`.trim()} {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Svg>
  );
}

/** Simplified oil derrick, after the one in the logo (spec §5.4). */
export function DerrickIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 21h14" />
      <path d="M8 21 11 3h2l3 18" />
      <path d="M9.5 12h5M10.25 7.5h3.5M8.75 16.5h6.5" />
      <path d="M8.75 16.5 14.5 12M9.5 12l4.25-4.5" />
    </Svg>
  );
}
```

- [ ] **Step 3: Write the button**

Create `src/components/Button.tsx`:
```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { useLang } from '@/lib/lang';

export type ButtonVariant = 'primary-red' | 'outline-on-dark' | 'outline-on-light';
export type ButtonSize = 'lg' | 'md';

/** The red/white chevron motif (spec §6): only on draft badges, loading states and the footer pad. */
export const CHEVRON_STRIPES: CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(135deg, var(--color-red) 0 4px, var(--color-white) 4px 8px)',
};

const BASE =
  'relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-none font-body font-semibold leading-none whitespace-nowrap transition-[background-color,border-color,color,filter] duration-200 [&:lang(ar)]:text-[1.0625rem]';
const SIZES: Record<ButtonSize, string> = {
  lg: 'min-h-[3.25rem] px-6 text-base md:min-h-14', // 52–56 px (typography §4)
  md: 'min-h-12 px-4 text-base', // 48 px, for the 64 px request bar
};
const VARIANTS: Record<ButtonVariant, string> = {
  'primary-red': 'bg-red text-white hover:brightness-90 active:brightness-75',
  'outline-on-dark': 'border border-white/70 text-white hover:border-white hover:bg-white hover:text-navy-950',
  'outline-on-light': 'border border-navy text-navy hover:bg-navy hover:text-white',
};
const IDLE = 'disabled:cursor-not-allowed disabled:opacity-60';
const BUSY = 'cursor-progress';

export function buttonClass(variant: ButtonVariant = 'primary-red', size: ButtonSize = 'lg', extra = ''): string {
  return [BASE, SIZES[size], VARIANTS[variant], extra].filter(Boolean).join(' ');
}

/** target/rel for http(s) links; mailto: and tel: stay in place. */
export function externalProps(href: string): { target?: '_blank'; rel?: string } {
  return /^https?:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

/** Screen-reader note for links that open a new tab. */
export function NewTabNote() {
  const { copy } = useLang();
  return <span className="sr-only"> ({copy.misc.newTab})</span>;
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 'light' on concrete or white: the focus ring turns navy (spec §6 "white on dark, navy on light"). */
  ground?: 'dark' | 'light';
  icon?: ReactNode;
  iconEnd?: ReactNode;
  className?: string;
  children: ReactNode;
}

export type AnchorButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & {
    href: string;
    /** http(s) links open in a new tab and say so. */
    external?: boolean;
  };

export type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    href?: undefined;
    /** Busy: disabled, aria-busy and a chevron strip along the bottom edge. */
    loading?: boolean;
  };

export type ButtonProps = AnchorButtonProps | NativeButtonProps;

// Inline style beats the global `:focus-visible { outline: 2px solid currentColor }` whatever layer it lives in.
const LIGHT_RING: CSSProperties = { outlineColor: 'var(--color-navy)' };
const ringStyle = (ground: CommonProps['ground'], style: CSSProperties | undefined) =>
  ground === 'light' ? { ...LIGHT_RING, ...style } : style;

function isAnchor(props: ButtonProps): props is AnchorButtonProps {
  return typeof props.href === 'string';
}

/** Square-cornered button or link (spec §6). */
export function Button(props: ButtonProps) {
  if (isAnchor(props)) {
    const { variant, size, ground, icon, iconEnd, className, children, external, style, ...rest } = props;
    const ext = external === true ? externalProps(rest.href) : {};
    return (
      <a {...rest} {...ext} className={buttonClass(variant, size, className)} style={ringStyle(ground, style)}>
        {icon}
        <span>{children}</span>
        {iconEnd}
        {ext.target && <NewTabNote />}
      </a>
    );
  }
  const { variant, size, ground, icon, iconEnd, className, children, style, loading = false, disabled, type = 'button', ...rest } = props;
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, `${loading ? BUSY : IDLE} ${className ?? ''}`)}
      style={ringStyle(ground, style)}
    >
      {icon}
      <span>{children}</span>
      {iconEnd}
      {loading && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1" style={CHEVRON_STRIPES} />}
    </button>
  );
}
```

- [ ] **Step 4: Write Fill, Logo and DraftBadge**

Create `src/components/Fill.tsx`:
```tsx
import { Fragment, type ReactNode } from 'react';

/** Like fillTemplate(), but the values may be nodes (for <bdi> around numbers and codes). */
export function Fill({ template, vars }: { template: string; vars: Record<string, ReactNode> }) {
  return (
    <>
      {template.split(/(\{\w+\})/g).map((part, i) => {
        const key = /^\{(\w+)\}$/.exec(part)?.[1];
        const value = key !== undefined && Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : part;
        return <Fragment key={i}>{value}</Fragment>;
      })}
    </>
  );
}
```

Create `src/components/Logo.tsx`:
```tsx
import { useLang } from '@/lib/lang';

// Temporary badge cropped from IMG_6363 by A2.4 until Atlas sends the vector (see README).
export const BADGE_SRC = '/brand/badge.png';

/** Header: 48 px badge + typeset name. Footer: 80 px badge + the name as on the logo. */
export function Logo({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const { copy, otherLang } = useLang();
  if (variant === 'footer') {
    return (
      <span className="flex items-center gap-4">
        <img src={BADGE_SRC} alt="" width={80} height={80} loading="lazy" decoding="async" className="size-20 shrink-0" />
        <span className="font-display text-[1.25rem] leading-snug font-bold">{copy.footer.name}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-3">
      <img src={BADGE_SRC} alt="" width={48} height={48} decoding="async" className="size-12 shrink-0" />
      <span className="flex flex-col">
        <span className="font-display text-[1.0625rem] leading-tight font-bold">{copy.header.name}</span>
        <span lang={otherLang} className="text-[0.75rem] leading-tight text-steel">
          {copy.header.nameAlt}
        </span>
      </span>
    </span>
  );
}
```

Create `src/components/DraftBadge.tsx`:
```tsx
import { CHEVRON_STRIPES } from '@/components/Button';
import { isDraft } from '@/env';
import { useLang } from '@/lib/lang';

/** Red/white chevron tag on every unverified value. Staging only (spec §4.3). */
export function DraftBadge({ verified, className = '' }: { verified: boolean; className?: string }) {
  const { copy } = useLang();
  if (!isDraft(verified)) return null;
  return (
    <span
      data-testid="draft-badge"
      className={`inline-flex items-stretch border border-red bg-white text-[0.75rem] leading-none font-semibold text-red ${className}`}
    >
      <span aria-hidden="true" className="w-3 shrink-0" style={CHEVRON_STRIPES} />
      <span className="px-2 py-1">{copy.misc.draftBadge}</span>
    </span>
  );
}
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `npx vitest run src/components/components.test.tsx`
Expected: PASS, `Tests  12 passed (12)`.

- [ ] **Step 6: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: no output.
```bash
git add src/components/Icons.tsx src/components/Button.tsx src/components/Fill.tsx src/components/Logo.tsx src/components/DraftBadge.tsx src/components/components.test.tsx
git commit -m "feat(ui): add icons, button states, logo lockup, draft badge and Fill" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.3: Header with mobile menu

**Files:**
- Modify (replace the stub): `src/sections/Header.tsx`
- Test: `src/sections/Header.test.tsx`

Layout decision: white header text never sits over the photo's sky (spec §6: "text over photos sits on solid bands"). The hero's ground is `navy-950` and its photo starts **below** the 4.5 rem header (C.4), so the header can be transparent over the hero. After the hero it turns solid `navy-950` with a hairline.

- [ ] **Step 1: Write the failing test**

Create `src/sections/Header.test.tsx`:
```tsx
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified && mockEnv.target !== 'production' }));

import { renderHtml } from '@/test/render';
import { Header } from './Header';

beforeEach(() => {
  mockEnv.phone = null;
  mockEnv.whatsapp = null;
});

describe('Header', () => {
  it('is the C9 header with the four nav targets in order', () => {
    const html = renderHtml(<Header />, 'ar');
    expect(html.querySelector('header[data-header]')).not.toBeNull();
    const links = [...html.querySelectorAll('header > div nav a')].map((a) => [a.getAttribute('href'), a.textContent]);
    expect(links).toEqual([
      ['#services', 'الخدمات'],
      ['#cranes', 'الرافعات'],
      ['#sites', 'مواقع العمل'],
      ['#request', 'تواصل معنا'],
    ]);
    expect(html.querySelector('header > div > div a[href="#request"]')?.textContent).toBe('اطلب رافعة');
  });

  it('switches to the other language with lang and hreflang set', () => {
    const ar = renderHtml(<Header />, 'ar').querySelector('[data-testid="lang-switch"]');
    expect([ar?.getAttribute('href'), ar?.getAttribute('hreflang'), ar?.getAttribute('lang'), ar?.textContent]).toEqual([
      '/en/',
      'en',
      'en',
      'English',
    ]);
    const en = renderHtml(<Header />, 'en').querySelector('[data-testid="lang-switch"]');
    expect([en?.getAttribute('href'), en?.getAttribute('lang'), en?.textContent]).toEqual(['/', 'ar', 'عربي']);
  });

  it('has a native dialog menu with WhatsApp and no Call without a phone', () => {
    const html = renderHtml(<Header />, 'en');
    expect(html.querySelector('button[data-testid="menu-open"]')).not.toBeNull();
    const dialog = html.querySelector('dialog[data-testid="menu-dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.querySelector('a[href^="mailto:"]')?.textContent).toContain('Message us on WhatsApp');
    expect(dialog?.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it('adds Call to the menu when a phone number is set', () => {
    mockEnv.phone = '+218 91 123 4567';
    const call = renderHtml(<Header />, 'en').querySelector('dialog a[href="tel:+218911234567"]');
    expect(call?.getAttribute('aria-label')).toBe('Call us on +218 91 123 4567');
  });
});
```

Run: `npx vitest run src/sections/Header.test.tsx`
Expected: FAIL, because the stub renders nothing (`expected null not to be null`).

- [ ] **Step 2: Implement**

Replace `src/sections/Header.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { CloseIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';

/** C9 nav targets. */
export const NAV = [
  { key: 'services', href: '#services' },
  { key: 'cranes', href: '#cranes' },
  { key: 'sites', href: '#sites' },
  { key: 'contact', href: '#request' },
] as const;

const HEADER_HEIGHT_PX = 72; // h-[4.5rem]

export function Header() {
  const { copy, otherLang, otherHref } = useLang();
  const [solid, setSolid] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const tel = telHref();

  // Transparent over the hero (#top), solid navy once the hero has scrolled under the header.
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) {
      setSolid(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setSolid(!(entry?.isIntersecting ?? false)), {
      rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px`,
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => menu.current?.close();

  return (
    <header
      data-header=""
      data-solid={solid ? '' : undefined}
      className="fixed inset-x-0 top-0 z-40 border-b border-navy-950/0 text-white transition-colors duration-300 data-[solid]:border-line-dark data-[solid]:bg-navy-950"
    >
      <div className="shell flex h-[4.5rem] items-center gap-4">
        <a href="#top" aria-label={copy.header.homeLabel} className="shrink-0">
          <Logo />
        </a>

        <nav className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-semibold text-white/85 underline-offset-[0.4em] transition-colors hover:text-white hover:underline"
                >
                  {copy.header.nav[item.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-2">
          <a
            href={otherHref}
            hrefLang={otherLang}
            lang={otherLang}
            aria-label={copy.header.langSwitch.label}
            data-testid="lang-switch"
            onClick={() => track('lang_switch')}
            className="inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-semibold transition-colors hover:bg-white/10"
          >
            {copy.header.langSwitch.text}
          </a>
          <div className="hidden sm:block">
            <Button href="#request" size="md">
              {copy.header.request}
            </Button>
          </div>
          <button
            type="button"
            data-testid="menu-open"
            aria-haspopup="dialog"
            onClick={() => menu.current?.showModal()}
            className="inline-flex size-11 items-center justify-center transition-colors hover:bg-white/10 lg:hidden"
          >
            <MenuIcon className="size-6" />
            <span className="sr-only">{copy.header.menu.open}</span>
          </button>
        </div>
      </div>

      <dialog
        ref={menu}
        data-testid="menu-dialog"
        aria-label={copy.header.menu.open}
        data-lenis-prevent=""
        className="m-0 h-dvh max-h-none w-full max-w-none bg-navy-950 p-0 text-white backdrop:bg-navy-950"
      >
        <div className="flex min-h-full flex-col">
          <div className="shell flex h-[4.5rem] w-full items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex size-11 items-center justify-center transition-colors hover:bg-white/10"
            >
              <CloseIcon className="size-6" />
              <span className="sr-only">{copy.header.menu.close}</span>
            </button>
          </div>
          <nav className="shell w-full flex-1 pt-6">
            <ul className="border-t border-line-dark">
              {NAV.map((item) => (
                <li key={item.key} className="border-b border-line-dark">
                  <a href={item.href} onClick={closeMenu} className="t-h3 flex min-h-16 items-center hover:underline">
                    {copy.header.nav[item.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="shell flex w-full flex-col gap-3 pt-8 pb-10">
            <Button
              href={whatsappHref(copy.whatsapp.general)}
              external
              icon={<WhatsAppIcon className="size-5" />}
              onClick={() => track('whatsapp_click', { location: 'menu' })}
            >
              {copy.header.menu.whatsapp}
            </Button>
            {tel && env.phone && (
              <Button
                href={tel}
                variant="outline-on-dark"
                icon={<PhoneIcon className="size-5" />}
                aria-label={fillTemplate(copy.header.call.label, { phone: env.phone })}
                onClick={() => track('call_click')}
              >
                {copy.header.call.text}
              </Button>
            )}
          </div>
        </div>
      </dialog>
    </header>
  );
}
```

- [ ] **Step 3: Run the test and watch it pass**

Run: `npx vitest run src/sections/Header.test.tsx`
Expected: PASS, `Tests  4 passed (4)`.

- [ ] **Step 4: Commit**
```bash
git add src/sections/Header.tsx src/sections/Header.test.tsx
git commit -m "feat(header): add header, language switch and dialog menu" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.4: Hero and the sling

**Files:**
- Create: `src/components/Sling.tsx`
- Modify (replace the stub): `src/sections/Hero.tsx`
- Test: `src/components/Sling.test.ts`, `src/sections/Hero.test.tsx`

How the sling stays on the real hook:
- Each overlay `<svg>` uses the crop rect as its `viewBox`, in source pixels, with `preserveAspectRatio="xMidYMin slice"`. That is the same mapping as the image's `object-fit: cover; object-position: 50% 0`, so the hook point (`image.hook`, source px) lands on the real hook.
- The HTML button is positioned with the same mapping in CSS. The photo box is a size container; one source pixel is `max(100cqw / rect.width, 100cqh / rect.height)`.
- Two SVGs (desktop crop, mobile crop) are switched by CSS (`hidden md:block` / `md:hidden`), so the prerendered HTML is identical everywhere. Picture's mobile media query is `(max-width: 767.98px)` (C11), which is exactly the complement of Tailwind's `md` (`width >= 48rem`).
- **Both hero crops have a hook point (C11):** the 9:16 crops of 6398 (x 2290–3641) and 6359 (x 604–1955) were moved to contain the real hook. The hook points are 6398 (3226, 1300) and 6359 (1391, 1600). So phones get the sling too: both SVGs render, and the single sling button is positioned by `--sx-m/--sy-m` below 768 px and `--sx-d/--sy-d` above.
- **Fallback, kept for safety:** if `image.hook` is ever null for a crop, there is no sling at that width and the WhatsApp button sits in the band instead.

- [ ] **Step 1: Write the failing geometry test**

Create `src/components/Sling.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import type { CropImage } from '@/generated/images';
import { cropVisibility, slingGeometry } from './Sling';

const image = (hook: CropImage['hook']): CropImage => ({
  photo: '6398',
  crop: 'desktop_16x9',
  rect: { left: 0, top: 0, width: 4240, height: 2385 },
  avif: [],
  webp: [],
  placeholder: '',
  hook,
});

describe('slingGeometry', () => {
  it('is null when the crop has no hook point', () => {
    expect(slingGeometry(image(null))).toBeNull();
  });

  it('hangs two legs ~110 source px below the hook and anchors the button there', () => {
    expect(slingGeometry(image({ x: 3000, y: 400 }))).toEqual({
      viewBox: '0 0 4240 2385',
      pin: { x: 3000, y: 400 },
      legEnds: [
        { x: 2966.2, y: 509.3 },
        { x: 3033.8, y: 509.3 },
      ],
      pinRadius: 13.9,
      anchorLeft: 'calc(50cqw + 880 * max(100cqw / 4240, 100cqh / 2385))',
      anchorTop: 'calc(509.3 * max(100cqw / 4240, 100cqh / 2385))',
    });
  });

  it('measures from the crop centre and top, so offset crops work', () => {
    // Shaped like 6398's 9:16 crop (x 2290–3641) with its C11 hook point, plus a 100 px top offset.
    const offset: CropImage = { ...image({ x: 3226, y: 1300 }), crop: 'mobile_9x16', rect: { left: 2290, top: 100, width: 1351, height: 2401 } };
    const g = slingGeometry(offset);
    expect(g?.viewBox).toBe('2290 100 1351 2401');
    expect(g?.legEnds).toEqual([
      { x: 3192, y: 1410 },
      { x: 3260, y: 1410 },
    ]);
    expect(g?.anchorLeft).toBe('calc(50cqw + 260.5 * max(100cqw / 1351, 100cqh / 2401))');
    expect(g?.anchorTop).toBe('calc(1310 * max(100cqw / 1351, 100cqh / 2401))');
  });
});

describe('cropVisibility', () => {
  it('maps which crops have a value to CSS visibility classes', () => {
    expect(cropVisibility(true, true)).toBe('');
    expect(cropVisibility(true, false)).toBe('hidden md:block');
    expect(cropVisibility(false, true)).toBe('md:hidden');
    expect(cropVisibility(false, false)).toBeNull();
  });
});
```

Check of the numbers: scale = 2385 / 2400 = 0.99375; drop = 110 × 0.99375 = 109.3; spread = 34 × 0.99375 = 33.8; pin r = 14 × 0.99375 = 13.9; 3000 − 2120 = 880. For the offset crop: scale = 2401 / 2400, so drop rounds to 110 and spread to 34; centre = 2290 + 675.5 = 2965.5, so 3226 − 2965.5 = 260.5; the leg ends sit at 1300 + 110 = 1410, which is 1310 below the crop top.

Run: `npx vitest run src/components/Sling.test.ts`
Expected: FAIL with `Failed to resolve import "./Sling"`.

- [ ] **Step 2: Implement the sling**

Create `src/components/Sling.tsx`:
```tsx
import type { CropImage } from '@/generated/images';

/** Leg length and half-spread in source pixels for a ~2400 px tall crop. */
export const LEG_DROP = 110;
export const LEG_SPREAD = 34;
export const PIN_RADIUS = 14;

export interface Point {
  x: number;
  y: number;
}

export interface SlingGeometry {
  viewBox: string;
  pin: Point;
  legEnds: [Point, Point];
  pinRadius: number;
  /** CSS lengths that put the button's top-centre on the legs' ends inside a `container-type: size` box. */
  anchorLeft: string;
  anchorTop: string;
}

const round = (n: number) => Math.round(n * 10) / 10;

export function slingGeometry(image: CropImage): SlingGeometry | null {
  const { rect, hook } = image;
  if (!hook) return null;
  const scale = rect.height / 2400;
  const drop = round(LEG_DROP * scale);
  const spread = round(LEG_SPREAD * scale);
  const endY = round(hook.y + drop);
  const centreX = rect.left + rect.width / 2;
  // One source pixel on screen under object-fit: cover (the larger of the two scale factors).
  const px = `max(100cqw / ${rect.width}, 100cqh / ${rect.height})`;
  return {
    viewBox: `${rect.left} ${rect.top} ${rect.width} ${rect.height}`,
    pin: hook,
    legEnds: [
      { x: round(hook.x - spread), y: endY },
      { x: round(hook.x + spread), y: endY },
    ],
    pinRadius: round(PIN_RADIUS * scale),
    anchorLeft: `calc(50cqw + ${round(hook.x - centreX)} * ${px})`,
    anchorTop: `calc(${round(endY - rect.top)} * ${px})`,
  };
}

/** '' = show at all widths; 'hidden md:block' = desktop crop only; 'md:hidden' = mobile crop only; null = never. */
export function cropVisibility(desktop: boolean, mobile: boolean): string | null {
  if (desktop && mobile) return '';
  if (desktop) return 'hidden md:block';
  if (mobile) return 'md:hidden';
  return null;
}

/** The two sling legs and the hook pin, drawn in the crop's own source-pixel space (C9). */
export function SlingSvg({ geometry, className = '' }: { geometry: SlingGeometry; className?: string }) {
  const { viewBox, pin, legEnds, pinRadius } = geometry;
  return (
    <svg
      data-sling=""
      viewBox={viewBox}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {legEnds.map((end, i) => (
        <path
          key={i}
          data-sling-leg=""
          d={`M${pin.x} ${pin.y}L${end.x} ${end.y}`}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-red"
        />
      ))}
      <circle data-hook-pin="" cx={pin.x} cy={pin.y} r={pinRadius} className="fill-red" />
    </svg>
  );
}
```

Run: `npx vitest run src/components/Sling.test.ts`
Expected: PASS, `Tests  4 passed (4)`.

- [ ] **Step 3: Write the failing hero test**

Create `src/sections/Hero.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getImage } from '@/generated/images';
import { renderHtml } from '@/test/render';
import { HERO_PHOTO, Hero } from './Hero';

describe('Hero', () => {
  it('is #top with one H1 that holds both clauses, the services line below it', () => {
    const html = renderHtml(<Hero />, 'ar');
    expect(html.querySelector('section#top[data-hero]')).not.toBeNull();
    const h1 = html.querySelector('h1[data-split]');
    expect(h1?.textContent).toBe('من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة');
    expect(h1?.previousElementSibling).toBeNull(); // nothing above the heading (spec §15.1)
    const intro = html.querySelectorAll('[data-intro]');
    expect(intro[0]?.textContent).toBe('تأجير الرافعات · النقل الثقيل · المناولة · الخدمات النفطية');
    expect(h1!.compareDocumentPosition(intro[0]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('uses 6398 in Arabic and 6359 in English, eagerly loaded', () => {
    for (const lang of ['ar', 'en'] as const) {
      const photo = renderHtml(<Hero />, lang).querySelector('[data-hero-photo]');
      expect(photo?.innerHTML).toContain(`/img/${HERO_PHOTO[lang]}-`);
      expect(photo?.querySelector('img')?.getAttribute('fetchpriority')).toBe('high');
    }
  });

  it('hangs the WhatsApp button on the sling only where the crop has a hook point', () => {
    for (const lang of ['ar', 'en'] as const) {
      const desktop = getImage(HERO_PHOTO[lang], 'desktop_16x9');
      const mobile = getImage(HERO_PHOTO[lang], 'mobile_9x16');
      const html = renderHtml(<Hero />, lang);
      const slings = [...html.querySelectorAll('svg[data-sling]')];
      expect(slings).toHaveLength(Number(Boolean(desktop.hook)) + Number(Boolean(mobile.hook)));
      for (const svg of slings) {
        expect(svg.querySelectorAll('path[data-sling-leg]')).toHaveLength(2);
        expect(svg.querySelectorAll('circle[data-hook-pin]')).toHaveLength(1);
      }
      const onSling = html.querySelector('a[data-sling-button][data-testid="sling-whatsapp"]');
      expect(Boolean(onSling)).toBe(Boolean(desktop.hook || mobile.hook));
      expect(Boolean(html.querySelector('[data-testid="hero-whatsapp"]'))).toBe(!(desktop.hook && mobile.hook));
    }
  });

  it('has a hook point in both hero crops, so phones get the sling too (C11)', () => {
    for (const lang of ['ar', 'en'] as const) {
      expect(getImage(HERO_PHOTO[lang], 'desktop_16x9').hook, `${lang} desktop`).not.toBeNull();
      expect(getImage(HERO_PHOTO[lang], 'mobile_9x16').hook, `${lang} mobile`).not.toBeNull();
      const html = renderHtml(<Hero />, lang);
      expect(html.querySelectorAll('svg[data-sling]')).toHaveLength(2);
      expect(html.querySelector('[data-testid="hero-whatsapp"]')).toBeNull();
    }
  });

  it('links Browse cranes to the Hoist', () => {
    const browse = [...renderHtml(<Hero />, 'en').querySelectorAll('a')].find((a) => a.textContent === 'Browse cranes');
    expect(browse?.getAttribute('href')).toBe('#cranes');
  });
});
```

Run: `npx vitest run src/sections/Hero.test.tsx`
Expected: FAIL with `does not provide an export named 'HERO_PHOTO'` (the stub has none).

- [ ] **Step 4: Implement the hero**

Replace `src/sections/Hero.tsx`:
```tsx
import type { CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { ArrowIcon, WhatsAppIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { SlingSvg, cropVisibility, slingGeometry } from '@/components/Sling';
import type { Lang } from '@/content/types';
import { getImage, type PhotoId } from '@/generated/images';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { whatsappHref } from '@/lib/whatsapp';

/** Spec §5.2: the real hook is on the right in 6398 (AR) and on the left in 6359 (EN). */
export const HERO_PHOTO: Record<Lang, PhotoId> = { ar: '6398', en: '6359' };

export function Hero() {
  const { copy, lang } = useLang();
  const photo = HERO_PHOTO[lang];
  const desktop = slingGeometry(getImage(photo, 'desktop_16x9'));
  const mobile = slingGeometry(getImage(photo, 'mobile_9x16'));
  const slingVisibility = cropVisibility(desktop !== null, mobile !== null);
  const bandVisibility = cropVisibility(desktop === null, mobile === null);
  const href = whatsappHref(copy.whatsapp.general);
  const onWhatsApp = () => track('whatsapp_click', { location: 'hero' });
  const anchor = {
    ...(desktop ? { '--sx-d': desktop.anchorLeft, '--sy-d': desktop.anchorTop } : {}),
    ...(mobile ? { '--sx-m': mobile.anchorLeft, '--sy-m': mobile.anchorTop } : {}),
  } as CSSProperties;

  return (
    <section id="top" data-hero="" data-ground="dark" aria-labelledby="hero-title" className="bg-navy-950 pt-[4.5rem] text-white">
      {/* Photo box: 60/40 on mobile, 74/26 from md (spec §5.2), minus the header strip. */}
      <div className="relative h-[calc(60svh-4.5rem)] [container-type:size] md:h-[calc(74svh-4.5rem)]">
        <div data-hero-photo="" className="absolute inset-0 overflow-hidden">
          <Picture
            photo={photo}
            crop="desktop_16x9"
            mobileCrop="mobile_9x16"
            alt={copy.alt[photo]}
            sizes="100vw"
            priority
            pictureClassName="block h-full w-full"
            className="h-full w-full"
          />
        </div>
        {desktop && <SlingSvg geometry={desktop} className="hidden md:block" />}
        {mobile && <SlingSvg geometry={mobile} className="md:hidden" />}
        {slingVisibility !== null && (
          // Physical `left`: photos are never mirrored, so the hook is at the same x in both languages.
          <div
            style={anchor}
            className={`absolute top-[var(--sy-m)] left-[var(--sx-m)] z-10 -translate-x-1/2 md:top-[var(--sy-d)] md:left-[var(--sx-d)] ${slingVisibility}`}
          >
            <Button
              href={href}
              external
              icon={<WhatsAppIcon className="size-5" />}
              onClick={onWhatsApp}
              data-sling-button=""
              data-testid="sling-whatsapp"
            >
              {copy.hero.whatsapp}
            </Button>
          </div>
        )}
      </div>

      <div className="shell flex min-h-[40svh] flex-col justify-center py-8 md:min-h-[26svh]">
        <h1 id="hero-title" data-split="" className="t-h1 text-balance">
          <span className="block text-[0.55em]">{copy.hero.h1Lead}</span> <span className="block">{copy.hero.h1Main}</span>
        </h1>
        <div className="mt-6 flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
          <p data-intro="" className="t-lead text-steel">
            {copy.hero.servicesLine}
          </p>
          <div data-intro="" className="flex flex-wrap gap-3">
            {bandVisibility !== null && (
              <div className={bandVisibility}>
                <Button href={href} external icon={<WhatsAppIcon className="size-5" />} onClick={onWhatsApp} data-testid="hero-whatsapp">
                  {copy.hero.whatsapp}
                </Button>
              </div>
            )}
            <Button href="#cranes" variant="outline-on-dark" iconEnd={<ArrowIcon direction="down" className="size-5" />}>
              {copy.hero.browse}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the tests and watch them pass**

Run: `npx vitest run src/components/Sling.test.ts src/sections/Hero.test.tsx`
Expected: PASS, `Tests  9 passed (9)`. If the C11 test fails, A2's `assets-src/crops.json` or `hook-points.json` does not yet carry the moved 9:16 crops and hook points: fix A2's data and re-run `npm run assets`. Do not weaken the test.

- [ ] **Step 6: Commit**
```bash
git add src/components/Sling.tsx src/components/Sling.test.ts src/sections/Hero.tsx src/sections/Hero.test.tsx
git commit -m "feat(hero): add hero with the WhatsApp button hanging on the real hook" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.5: Load tag and the Hoist (static load stack)

**Files:**
- Create: `src/components/LoadTag.tsx`
- Modify (replace the stub): `src/sections/Hoist.tsx`
- Test: `src/sections/Hoist.test.tsx`

The static Hoist is the touch and reduced-motion "load stack" from spec §5.3. Part D pins and animates the same DOM on desktop. Each photo box takes the exact aspect ratio of its crop, so `object-fit: cover` does not crop further. That makes the hook point a simple percentage.

- [ ] **Step 1: Write the failing test**

Create `src/sections/Hoist.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import type { CropImage } from '@/generated/images';
import { renderHtml } from '@/test/render';
import { Hoist, hookPosition } from './Hoist';

describe('hookPosition', () => {
  it('turns a source-pixel hook point into percentages of the crop', () => {
    const image: CropImage = {
      photo: '6389',
      crop: 'desktop_16x9',
      rect: { left: 0, top: 100, width: 4240, height: 2385 },
      avif: [],
      webp: [],
      placeholder: '',
      hook: { x: 2120, y: 577 },
    };
    expect(hookPosition(image)).toEqual({ left: '50%', top: '20%' });
    expect(hookPosition({ ...image, hook: null })).toBeNull();
  });
});

describe('Hoist', () => {
  const html = renderHtml(<Hoist />, 'ar');
  const items = [...html.querySelectorAll('section#cranes[data-hoist] ol[data-hoist-list] > li[data-hoist-item]')];

  it('is an ordered list of the visible cranes, smallest first', () => {
    expect(items.map((li) => li.getAttribute('data-crane'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(items.map((li) => li.getAttribute('data-capacity'))).toEqual(['55', '60', '200', '250', '350']);
  });

  it('gives every item a photo box, a load tag and a final-value counter', () => {
    for (const li of items) {
      expect(li.querySelector('[data-hoist-photo] img')).not.toBeNull();
      const counter = li.querySelector('[data-load-tag] [data-counter]');
      expect(counter?.getAttribute('data-value')).toBe(li.getAttribute('data-capacity'));
      expect(counter?.textContent).toBe(li.getAttribute('data-capacity')); // Western digits, already final
    }
  });

  it('labels the capacity inside the tag and isolates model codes', () => {
    const tag = items[4]?.querySelector('[data-load-tag]');
    expect(tag?.textContent).toContain('أقصى حمولة');
    expect(tag?.textContent).toContain('طن');
    expect(tag?.querySelector('bdi')?.textContent).toBe('Grove GMK6350');
  });

  it('shows a draft badge on every unverified crane in staging', () => {
    expect(html.querySelectorAll('[data-hoist-item] [data-testid="draft-badge"]')).toHaveLength(5);
  });

  it('puts nothing above the heading and offers a skip link to the full list', () => {
    expect(html.querySelector('h2#hoist-title')?.previousElementSibling).toBeNull();
    expect(html.querySelector('a[href="#crane-list"]')?.textContent).toBe('عرض كل الرافعات');
    expect(html.querySelector('ol[data-hoist-list]')?.getAttribute('aria-labelledby')).toBe('hoist-list-title');
  });
});
```

Run: `npx vitest run src/sections/Hoist.test.tsx`
Expected: FAIL with `does not provide an export named 'hookPosition'`.

- [ ] **Step 2: Write the load tag**

Create `src/components/LoadTag.tsx`:
```tsx
import { DraftBadge } from '@/components/DraftBadge';
import type { Crane } from '@/content/types';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';

/** A white load tag on a short red rope. The counter holds the final value; Part D counts up to it. */
export function LoadTag({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  return (
    <div data-load-tag="" className="relative mt-14 w-fit min-w-[15rem] bg-white px-6 pt-6 pb-6 text-navy">
      <span aria-hidden="true" className="absolute bottom-full left-1/2 h-14 w-0.5 -translate-x-1/2 bg-red" />
      <span aria-hidden="true" className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full border-2 border-red bg-white" />
      <dl className="grid grid-cols-2 gap-x-6">
        <div className="col-span-2">
          <dt className="t-label text-ink">{copy.hoist.capacity}</dt>
          <dd className="t-readout mt-2 whitespace-nowrap">
            <span data-counter="" data-value={crane.capacityT}>
              {formatNumber(crane.capacityT, lang)}
            </span>
            {' '}
            <span className="text-[0.36em] font-bold [font-stretch:100%] text-red">{copy.hoist.unit}</span>
          </dd>
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <dt className="t-label text-ink">{copy.hoist.model}</dt>
          <dd className="t-spec mt-1 text-ink">
            <bdi>
              {crane.make} {crane.model}
            </bdi>
          </dd>
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <dt className="t-label text-ink">{copy.hoist.type}</dt>
          <dd className="t-small mt-1 text-ink">{copy.craneTypes[crane.type].full}</dd>
        </div>
      </dl>
      <DraftBadge verified={crane.verified} className="mt-4" />
    </div>
  );
}
```

- [ ] **Step 3: Write the Hoist**

Replace `src/sections/Hoist.tsx`:
```tsx
import type { CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { LoadTag } from '@/components/LoadTag';
import { Picture } from '@/components/Picture';
import { cropVisibility } from '@/components/Sling';
import { visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { getImage, type CropImage } from '@/generated/images';
import { useLang } from '@/lib/lang';

/** The hook point as left/top percentages of its crop (the photo box has the crop's exact aspect ratio). */
export function hookPosition(image: CropImage): { left: string; top: string } | null {
  if (!image.hook) return null;
  const pct = (ratio: number) => `${Math.round(ratio * 10000) / 100}%`;
  return {
    left: pct((image.hook.x - image.rect.left) / image.rect.width),
    top: pct((image.hook.y - image.rect.top) / image.rect.height),
  };
}

export function Hoist() {
  const { copy } = useLang();
  return (
    <section id="cranes" data-hoist="" data-ground="dark" aria-labelledby="hoist-title" className="section-y bg-navy-950 text-white">
      <div className="shell">
        <h2 id="hoist-title" className="t-h2 text-balance">
          {copy.hoist.title}
        </h2>
        <p className="t-lead measure mt-5 text-steel">{copy.hoist.intro}</p>
        <a
          href="#crane-list"
          className="sr-only focus:not-sr-only focus:mt-6 focus:inline-flex focus:min-h-11 focus:items-center focus:font-semibold focus:underline"
        >
          {copy.hoist.skipToList}
        </a>

        <h3 id="hoist-list-title" className="sr-only">
          {copy.hoist.listHeading}
        </h3>
        <ol data-hoist-list="" aria-labelledby="hoist-list-title" className="mt-16 grid gap-24">
          {visibleCranes.map((crane) => (
            <HoistItem key={crane.id} crane={crane} />
          ))}
        </ol>

        <p className="t-small measure mt-20 text-steel">{copy.hoist.footnote}</p>
        <div className="mt-10 flex flex-col items-start gap-5 border-t border-line-dark pt-10 md:flex-row md:items-center md:justify-between">
          <p className="t-lead measure">{copy.hoist.closing}</p>
          <Button href="#request" variant="outline-on-dark">
            {copy.hoist.closingButton}
          </Button>
        </div>
      </div>
    </section>
  );
}

function HoistItem({ crane }: { crane: Crane }) {
  const { copy } = useLang();
  const desktop = getImage(crane.hoistPhoto, 'desktop_16x9');
  const mobile = getImage(crane.hoistPhoto, 'mobile_4x5');
  const hookD = hookPosition(desktop);
  const hookM = hookPosition(mobile);
  const anchorVisibility = cropVisibility(hookD !== null, hookM !== null);
  const box = {
    '--ar-d': `${desktop.rect.width} / ${desktop.rect.height}`,
    '--ar-m': `${mobile.rect.width} / ${mobile.rect.height}`,
    ...(hookD ? { '--hx-d': hookD.left, '--hy-d': hookD.top } : {}),
    ...(hookM ? { '--hx-m': hookM.left, '--hy-m': hookM.top } : {}),
  } as CSSProperties;

  return (
    <li data-hoist-item="" data-crane={crane.id} data-capacity={crane.capacityT} className="grid items-end gap-6 md:grid-cols-12 md:gap-10">
      <div
        data-hoist-photo=""
        style={box}
        className="relative aspect-[var(--ar-m)] overflow-hidden md:col-span-7 md:aspect-[var(--ar-d)]"
      >
        <Picture
          photo={crane.hoistPhoto}
          crop="desktop_16x9"
          mobileCrop="mobile_4x5"
          alt={copy.alt[crane.hoistPhoto]}
          sizes="(min-width: 768px) 58vw, 100vw"
          pictureClassName="block h-full w-full"
          className="h-full w-full"
        />
        {anchorVisibility !== null && (
          <span
            data-hook-anchor=""
            aria-hidden="true"
            className={`absolute top-[var(--hy-m)] left-[var(--hx-m)] size-0 md:top-[var(--hy-d)] md:left-[var(--hx-d)] ${anchorVisibility}`}
          />
        )}
      </div>
      <div className="md:col-span-5">
        <LoadTag crane={crane} />
      </div>
    </li>
  );
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/sections/Hoist.test.tsx`
Expected: PASS, `Tests  6 passed (6)`.

- [ ] **Step 5: Commit**
```bash
git add src/components/LoadTag.tsx src/sections/Hoist.tsx src/sections/Hoist.test.tsx
git commit -m "feat(hoist): add the static load stack with load tags and hook anchors" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.6: Services

**Files:**
- Modify (replace the stub): `src/sections/Services.tsx`
- Test: `src/sections/Services.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/sections/Services.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { Services } from './Services';

describe('Services', () => {
  const html = renderHtml(<Services />, 'en');
  const rows = [...html.querySelectorAll('section#services li[data-service-row]')];

  it('has four service rows in deck order, without section numbers', () => {
    expect(rows.map((row) => row.querySelector('h3')?.textContent)).toEqual([
      'Crane hire',
      'Heavy transport',
      'Handling and rigging',
      'Oil services',
    ]);
    expect(html.textContent).not.toMatch(/\b0[1-4]\b/);
  });

  it('draws the derrick only on oil services', () => {
    expect(rows.map((row) => Boolean(row.querySelector('h3 svg')))).toEqual([false, false, false, true]);
  });

  it('keeps the [[CONFIRM]] sentence for crane hire until Atlas answers', () => {
    expect(rows[0]?.textContent).toContain('[[CONFIRM: Every crane comes with an experienced operator.]]');
  });

  it('links each row to a WhatsApp message about that service', () => {
    const link = rows[3]?.querySelector('a');
    expect(link?.textContent).toContain('Ask about this service');
    expect(decodeURIComponent(link?.getAttribute('href') ?? '')).toContain('I would like to ask about Oil services.');
  });
});
```

Run: `npx vitest run src/sections/Services.test.tsx`
Expected: FAIL, the stub renders no rows (`expected [] to deeply equal [...]`).

- [ ] **Step 2: Implement**

Replace `src/sections/Services.tsx`:
```tsx
import { NewTabNote, externalProps } from '@/components/Button';
import { ArrowIcon, DerrickIcon } from '@/components/Icons';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { fillTemplate, whatsappHref } from '@/lib/whatsapp';

export function Services() {
  const { copy } = useLang();
  return (
    <section id="services" data-ground="dark" aria-labelledby="services-title" className="section-y bg-navy-950 text-white">
      <div className="shell">
        <h2 id="services-title" className="t-h2 text-balance">
          {copy.services.title}
        </h2>
        <p className="t-lead measure mt-5 text-steel">{copy.services.intro}</p>
        <ul className="mt-14 border-t border-line-dark">
          {copy.services.items.map((service) => {
            const href = whatsappHref(fillTemplate(copy.whatsapp.service, { service: service.title }));
            const ext = externalProps(href);
            return (
              <li
                key={service.id}
                data-service-row=""
                className="grid gap-4 border-b border-line-dark py-8 md:grid-cols-12 md:gap-10 md:py-10"
              >
                <h3 className="t-h3 flex items-center gap-3 md:col-span-4">
                  {service.id === 'oil-services' && <DerrickIcon className="size-8 shrink-0 text-steel" />}
                  <span>{service.title}</span>
                </h3>
                <div className="md:col-span-8">
                  <p className="t-body measure text-white/90">{service.body}</p>
                  {service.confirm && <p className="t-body measure mt-3 text-white/90">{service.confirm}</p>}
                  <a
                    href={href}
                    {...ext}
                    onClick={() => track('whatsapp_click', { location: 'services' })}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-red-bright hover:decoration-2"
                  >
                    {copy.services.ask}
                    <span className="sr-only">: {service.title}</span>
                    <ArrowIcon className="size-4" />
                    {ext.target && <NewTabNote />}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run the test and watch it pass**

Run: `npx vitest run src/sections/Services.test.tsx`
Expected: PASS, `Tests  4 passed (4)`.

- [ ] **Step 4: Commit**
```bash
git add src/sections/Services.tsx src/sections/Services.test.tsx
git commit -m "feat(services): add the four service rows" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.7: Crane grid with filters

**Files:**
- Create: `src/sections/crane-filters.ts`
- Modify (replace the stub): `src/sections/CraneGrid.tsx`
- Test: `src/sections/crane-filters.test.ts`, `src/sections/CraneGrid.test.tsx`

- [ ] **Step 1: Write the failing logic test**

Create `src/sections/crane-filters.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getCopy, visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { applyFilter, availableFilters, bandLabel, bandOf, resultCount } from './crane-filters';

const NBSP = '\u00A0'; // no-break space (U+202F is in none of the fonts)
const verified = (cranes: readonly Crane[]) => cranes.map((c) => ({ ...c, verified: true }));
const ids = (cranes: readonly Crane[]) => cranes.map((c) => c.id);

describe('bandOf', () => {
  it('follows the deck band rule (60 is in the first band)', () => {
    expect([55, 60, 61, 200, 201, 350].map(bandOf)).toEqual(['0-60', '0-60', '61-200', '61-200', '201+', '201+']);
  });
});

describe('availableFilters', () => {
  it('always offers the types present, in a fixed order', () => {
    expect(availableFilters(visibleCranes).types).toEqual(['rough-terrain', 'all-terrain', 'crawler']);
    expect(availableFilters(visibleCranes.filter((c) => c.type !== 'crawler')).types).toEqual(['rough-terrain', 'all-terrain']);
  });

  it('hides tonnage bands while any visible crane is unverified', () => {
    expect(availableFilters(visibleCranes).bands).toEqual([]);
    const mixed = verified(visibleCranes).map((c) => (c.id === 'quy250' ? { ...c, verified: false } : c));
    expect(availableFilters(mixed).bands).toEqual([]);
  });

  it('shows the bands that have cranes once every crane is verified', () => {
    expect(availableFilters(verified(visibleCranes)).bands).toEqual(['0-60', '61-200', '201+']);
    expect(availableFilters(verified(visibleCranes.filter((c) => c.capacityT <= 60))).bands).toEqual(['0-60']);
  });
});

describe('applyFilter', () => {
  it('filters by type and by band, keeping the capacity order', () => {
    expect(ids(applyFilter(visibleCranes, 'all'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(ids(applyFilter(visibleCranes, 'all-terrain'))).toEqual(['atf60-3', 'ac200-1', 'gmk6350']);
    expect(ids(applyFilter(visibleCranes, 'crawler'))).toEqual(['quy250']);
    expect(ids(applyFilter(visibleCranes, 'band:0-60'))).toEqual(['rt700e', 'atf60-3']);
    expect(ids(applyFilter(visibleCranes, 'band:61-200'))).toEqual(['ac200-1']);
    expect(ids(applyFilter(visibleCranes, 'band:201+'))).toEqual(['quy250', 'gmk6350']);
  });
});

describe('labels', () => {
  it('counts cranes with Arabic plural forms', () => {
    const ar = getCopy('ar');
    expect([1, 2, 3, 10, 11, 100].map((n) => resultCount(n, ar))).toEqual([
      'رافعة واحدة',
      'رافعتان',
      '3 رافعات',
      '10 رافعات',
      '11 رافعة',
      '100 رافعة',
    ]);
  });

  it('counts cranes in English', () => {
    const en = getCopy('en');
    expect([1, 2, 5].map((n) => resultCount(n, en))).toEqual(['1 crane', '2 cranes', '5 cranes']);
  });

  it('formats band chips through formatNumber/formatTonnes', () => {
    expect(bandLabel('0-60', getCopy('ar'))).toBe(`حتى 60${NBSP}طن`);
    expect(bandLabel('61-200', getCopy('ar'))).toBe(`من 60 إلى 200${NBSP}طن`);
    expect(bandLabel('61-200', getCopy('en'))).toBe(`60–200${NBSP}t`);
    expect(bandLabel('201+', getCopy('en'))).toBe(`Over 200${NBSP}t`);
  });
});
```

Run: `npx vitest run src/sections/crane-filters.test.ts`
Expected: FAIL with `Failed to resolve import "./crane-filters"`.

- [ ] **Step 2: Implement the filter logic**

Create `src/sections/crane-filters.ts`:
```ts
import type { CapacityBand, Copy, Crane, CraneType } from '@/content/types';
import { formatNumber, formatTonnes } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';

/** C9 filter chip values. */
export type FilterValue = 'all' | CraneType | `band:${CapacityBand}`;

export const TYPE_ORDER: readonly CraneType[] = ['rough-terrain', 'all-terrain', 'crawler'];
export const BAND_ORDER: readonly CapacityBand[] = ['0-60', '61-200', '201+'];

/** Deck §6: "Up to 60 t" includes 60; "60–200 t" means above 60 up to 200. */
export function bandOf(capacityT: number): CapacityBand {
  if (capacityT <= 60) return '0-60';
  if (capacityT <= 200) return '61-200';
  return '201+';
}

/** Type chips for every type on show; band chips only once every visible crane is verified (spec §5.5). */
export function availableFilters(cranes: readonly Crane[]): { types: CraneType[]; bands: CapacityBand[] } {
  const types = TYPE_ORDER.filter((type) => cranes.some((c) => c.type === type));
  const allVerified = cranes.length > 0 && cranes.every((c) => c.verified);
  const bands = allVerified ? BAND_ORDER.filter((band) => cranes.some((c) => bandOf(c.capacityT) === band)) : [];
  return { types, bands };
}

export function applyFilter(cranes: readonly Crane[], value: FilterValue): Crane[] {
  if (value === 'all') return [...cranes];
  if (value.startsWith('band:')) {
    const band = value.slice('band:'.length) as CapacityBand;
    return cranes.filter((c) => bandOf(c.capacityT) === band);
  }
  return cranes.filter((c) => c.type === value);
}

/** Arabic: 1 and 2 are words; 3–10 take the plural; 11 and up take the singular. */
export function resultCount(n: number, copy: Copy): string {
  const { one, two, few, many } = copy.grid.count;
  const template = n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? few : many;
  return fillTemplate(template, { n: formatNumber(n, copy.lang) });
}

export function bandLabel(band: CapacityBand, copy: Copy): string {
  const { lang } = copy;
  const template = copy.grid.bands[band];
  if (band === '0-60') return fillTemplate(template, { max: formatTonnes(60, lang) });
  if (band === '61-200') return fillTemplate(template, { min: formatNumber(60, lang), max: formatTonnes(200, lang) });
  return fillTemplate(template, { min: formatTonnes(200, lang) });
}
```

Run: `npx vitest run src/sections/crane-filters.test.ts`
Expected: PASS, `Tests  8 passed (8)`.

- [ ] **Step 3: Write the failing component test**

Create `src/sections/CraneGrid.test.tsx`:
```tsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { HOOK_EVENT, getRequestedCrane, setRequestedCrane, type HookEventDetail } from '@/lib/request';
import { click, mount, renderHtml } from '@/test/render';
import { CraneGrid } from './CraneGrid';

afterEach(() => setRequestedCrane(null));

describe('CraneGrid', () => {
  it('renders one card per visible crane with the C9 attributes', () => {
    const html = renderHtml(<CraneGrid />, 'ar');
    expect(html.querySelector('section#crane-list [data-crane-grid]')).not.toBeNull();
    const cards = [...html.querySelectorAll('article[data-testid="crane-card"]')];
    expect(cards.map((card) => card.getAttribute('data-crane'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    const button = cards[4]?.querySelector('button[data-testid="request-crane-button"]');
    expect(button?.getAttribute('data-crane')).toBe('gmk6350');
    expect(cards[4]?.querySelector('h3 bdi')?.textContent).toBe('Grove GMK6350');
  });

  it('shows type chips only while capacities are unverified', () => {
    const chips = [...renderHtml(<CraneGrid />, 'en').querySelectorAll('button[data-testid="filter-chip"]')];
    expect(chips.map((chip) => [chip.getAttribute('data-value'), chip.getAttribute('aria-pressed')])).toEqual([
      ['all', 'true'],
      ['rough-terrain', 'false'],
      ['all-terrain', 'false'],
      ['crawler', 'false'],
    ]);
  });

  it('filters by type and announces the new count', async () => {
    const { host, unmount } = await mount(<CraneGrid />, 'ar');
    const chip = host.querySelector('[data-testid="filter-chip"][data-value="crawler"]');
    await click(chip);
    expect(host.querySelectorAll('[data-testid="crane-card"]')).toHaveLength(1);
    expect(chip?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[aria-live="polite"]')?.textContent).toBe('رافعة واحدة');
    await unmount();
  });

  it('puts the crane on the hook and fires the hook event from the button', async () => {
    const { host, unmount } = await mount(<CraneGrid />, 'en');
    const seen: HookEventDetail[] = [];
    const onHook = (event: Event) => seen.push((event as CustomEvent<HookEventDetail>).detail);
    window.addEventListener(HOOK_EVENT, onHook);
    const button = host.querySelector('[data-testid="request-crane-button"][data-crane="gmk6350"]');
    await click(button);
    window.removeEventListener(HOOK_EVENT, onHook);
    expect(getRequestedCrane()).toBe('gmk6350');
    expect(seen).toEqual([{ craneId: 'gmk6350', source: button }]);
    await unmount();
  });
});
```

Run: `npx vitest run src/sections/CraneGrid.test.tsx`
Expected: FAIL, the stub renders nothing (`expected null not to be null`).

- [ ] **Step 4: Implement the grid**

Replace `src/sections/CraneGrid.tsx`:
```tsx
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { DraftBadge } from '@/components/DraftBadge';
import { HookIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { setRequestedCrane, useRequestedCrane } from '@/lib/request';
import { applyFilter, availableFilters, bandLabel, resultCount, type FilterValue } from './crane-filters';

export function CraneGrid() {
  const { copy } = useLang();
  const [filter, setFilter] = useState<FilterValue>('all');
  const { types, bands } = availableFilters(visibleCranes);
  const shown = applyFilter(visibleCranes, filter);
  const choose = (value: FilterValue) => {
    setFilter(value);
    track('filter_use');
  };

  return (
    <section id="crane-list" aria-labelledby="grid-title" className="section-y bg-concrete text-ink">
      <div className="shell">
        <h2 id="grid-title" className="t-h2 text-balance text-navy">
          {copy.grid.title}
        </h2>
        <p className="t-lead measure mt-5">{copy.grid.intro}</p>
        <p className="t-small measure mt-3 text-ink/75">{copy.grid.availability}</p>

        <div className="mt-10 flex flex-col gap-5">
          <FilterGroup id="grid-filter-type" label={copy.grid.typeLabel}>
            <Chip value="all" current={filter} onChoose={choose}>
              {copy.grid.all}
            </Chip>
            {types.map((type) => (
              <Chip key={type} value={type} current={filter} onChoose={choose}>
                {copy.craneTypes[type].chip}
              </Chip>
            ))}
          </FilterGroup>
          {bands.length > 0 && (
            <FilterGroup id="grid-filter-band" label={copy.grid.bandLabel}>
              {bands.map((band) => (
                <Chip key={band} value={`band:${band}`} current={filter} onChoose={choose}>
                  {bandLabel(band, copy)}
                </Chip>
              ))}
            </FilterGroup>
          )}
        </div>

        {/* The count doubles as the empty-state message (spec §15.8). */}
        <p aria-live="polite" className={shown.length > 0 ? 't-small mt-8 tabular-nums text-ink/75' : 't-body mt-8'}>
          {shown.length > 0 ? resultCount(shown.length, copy) : copy.grid.empty}
        </p>

        <div data-crane-grid="" className="mt-4">
          {shown.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((crane) => (
                <li key={crane.id}>
                  <CraneCard crane={crane} />
                </li>
              ))}
            </ul>
          ) : (
            <Button variant="outline-on-light" onClick={() => setFilter('all')}>
              {copy.grid.showAll}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <span id={id} className="t-label min-w-16 text-ink/75">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  value,
  current,
  onChoose,
  children,
}: {
  value: FilterValue;
  current: FilterValue;
  onChoose: (value: FilterValue) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      data-testid="filter-chip"
      data-value={value}
      aria-pressed={current === value}
      onClick={() => onChoose(value)}
      className="min-h-11 border border-navy px-4 text-[0.9375rem] font-semibold text-navy transition-colors hover:bg-navy/10 aria-pressed:bg-navy aria-pressed:text-white"
    >
      {children}
    </button>
  );
}

function CraneCard({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  const onHook = useRequestedCrane() === crane.id;
  const titleId = `crane-${crane.id}-model`;
  const type = copy.craneTypes[crane.type];

  return (
    <article
      data-testid="crane-card"
      data-crane={crane.id}
      aria-labelledby={titleId}
      className={`flex h-full flex-col border bg-white transition-colors ${onHook ? 'border-red' : 'border-line'}`}
    >
      <Picture
        photo={crane.cardPhoto}
        crop="desktop_16x9"
        alt={copy.alt[crane.cardPhoto]}
        sizes="(min-width: 1280px) 28rem, (min-width: 640px) 45vw, 100vw"
        pictureClassName="block aspect-[16/9] overflow-hidden"
        className="h-full w-full"
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 id={titleId} className="t-spec text-ink">
          <bdi>
            {crane.make} {crane.model}
          </bdi>
        </h3>
        <dl className="mt-4 grid gap-4">
          <div>
            <dt className="t-label text-ink/75">{copy.grid.card.capacity}</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              {/* Capacity is the biggest element on the card (spec §5.5). */}
              <span className="font-display text-[clamp(3rem,2.5rem+2.2vw,4.5rem)] leading-[0.9] font-extrabold tabular-nums [font-stretch:75%] text-navy">
                {formatNumber(crane.capacityT, lang)}
                {' '}
                <span className="text-[0.36em] font-bold [font-stretch:100%] text-red">{copy.hoist.unit}</span>
              </span>
              <DraftBadge verified={crane.verified} />
            </dd>
          </div>
          <div>
            <dt className="t-label text-ink/75">{copy.grid.card.type}</dt>
            <dd className="t-body mt-1">{type.full}</dd>
            <dd className="t-small mt-1 text-ink/75">{type.explainer}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-col items-start gap-3 pt-6">
          <Button
            ground="light"
            className="w-full"
            icon={<HookIcon className="size-5" />}
            data-testid="request-crane-button"
            data-crane={crane.id}
            aria-describedby={titleId}
            onClick={(event) => {
              setRequestedCrane(crane.id, event.currentTarget);
              track('request_crane', { crane_id: crane.id });
            }}
          >
            {copy.grid.card.request}
          </Button>
          <a
            href="#request"
            onClick={() => setRequestedCrane(crane.id)}
            className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-navy underline hover:decoration-2"
          >
            {copy.grid.card.formLink}
          </a>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Run the tests and watch them pass**

Run: `npx vitest run src/sections/crane-filters.test.ts src/sections/CraneGrid.test.tsx`
Expected: PASS, `Tests  12 passed (12)`.

- [ ] **Step 6: Commit**
```bash
git add src/sections/crane-filters.ts src/sections/crane-filters.test.ts src/sections/CraneGrid.tsx src/sections/CraneGrid.test.tsx
git commit -m "feat(grid): add crane cards, type filters, plural counts and empty state" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.8: Site galleries and the lightbox

**Files:**
- Create: `src/components/Lightbox.tsx`
- Modify (replace the stub): `src/sections/Sites.tsx`
- Test: `src/components/Lightbox.test.ts`, `src/sections/Sites.test.tsx`

- [ ] **Step 1: Write the failing keyboard-logic test**

Create `src/components/Lightbox.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { stepFor, wrapIndex } from './Lightbox';

describe('stepFor', () => {
  it('moves forward with the arrow that points the reading direction', () => {
    expect(stepFor('ArrowRight', 'ltr')).toBe(1);
    expect(stepFor('ArrowLeft', 'ltr')).toBe(-1);
    expect(stepFor('ArrowLeft', 'rtl')).toBe(1);
    expect(stepFor('ArrowRight', 'rtl')).toBe(-1);
  });

  it('ignores other keys', () => {
    expect(stepFor('Enter', 'rtl')).toBe(0);
    expect(stepFor('Escape', 'ltr')).toBe(0);
  });
});

describe('wrapIndex', () => {
  it('wraps around both ends', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(2, 5)).toBe(2);
  });
});
```

Run: `npx vitest run src/components/Lightbox.test.ts`
Expected: FAIL with `Failed to resolve import "./Lightbox"`.

- [ ] **Step 2: Implement the lightbox**

Create `src/components/Lightbox.tsx`:
```tsx
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { ArrowIcon, CloseIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import type { PhotoId } from '@/generated/images';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';

/** +1 = next. In RTL the next photo is to the left, so ArrowLeft moves forward. */
export function stepFor(key: string, dir: 'rtl' | 'ltr'): -1 | 0 | 1 {
  if (key === 'ArrowRight') return dir === 'rtl' ? -1 : 1;
  if (key === 'ArrowLeft') return dir === 'rtl' ? 1 : -1;
  return 0;
}

export function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

export interface LightboxProps {
  photos: readonly PhotoId[];
  index: number | null; // null = closed
  title: string; // the gallery's name, used as the dialog label
  onIndexChange: (index: number) => void;
  onClose: () => void; // fires on Esc, the close button and close()
}

/** Native modal <dialog>: Esc closes it and the browser returns focus to the opener. */
export function Lightbox({ photos, index, title, onIndexChange, onClose }: LightboxProps) {
  const { copy, dir, lang } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const isOpen = index !== null && photos.length > 0;

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  const photo = index === null ? undefined : photos[index];
  const go = (delta: number) => {
    if (index !== null) onIndexChange(wrapIndex(index + delta, photos.length));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const step = stepFor(event.key, dir);
    if (step !== 0) {
      event.preventDefault();
      go(step);
    }
  };

  return (
    <dialog
      ref={dialog}
      data-testid="lightbox"
      aria-label={title}
      onClose={onClose}
      onKeyDown={onKeyDown}
      data-lenis-prevent=""
      className="m-0 h-dvh max-h-none w-full max-w-none bg-navy-950 p-0 text-white backdrop:bg-navy-950"
    >
      {photo !== undefined && index !== null && (
        <div className="flex h-full flex-col">
          <div className="shell flex h-[4.5rem] w-full shrink-0 items-center justify-between gap-4">
            <p className="t-small tabular-nums text-steel" aria-live="polite">
              {fillTemplate(copy.sites.counter, { i: formatNumber(index + 1, lang), n: formatNumber(photos.length, lang) })}
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex size-11 items-center justify-center transition-colors hover:bg-white/10"
            >
              <CloseIcon className="size-6" />
              <span className="sr-only">{copy.sites.close}</span>
            </button>
          </div>
          <figure className="flex min-h-0 flex-1 flex-col">
            <Picture
              key={photo}
              photo={photo}
              crop="desktop_16x9"
              alt={copy.alt[photo]}
              sizes="100vw"
              pictureClassName="block min-h-0 flex-1"
              className="h-full w-full object-contain! object-center!"
            />
            <figcaption className="shell t-small w-full py-4 text-steel">{copy.sites.captions[photo] ?? title}</figcaption>
          </figure>
          <div className="shell flex w-full shrink-0 items-center justify-between gap-4 pb-6">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex min-h-11 items-center gap-2 px-3 font-semibold transition-colors hover:bg-white/10"
            >
              <ArrowIcon direction="back" className="size-5" />
              {copy.sites.prev}
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex min-h-11 items-center gap-2 px-3 font-semibold transition-colors hover:bg-white/10"
            >
              {copy.sites.next}
              <ArrowIcon className="size-5" />
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
```

Run: `npx vitest run src/components/Lightbox.test.ts`
Expected: PASS, `Tests  3 passed (3)`.

- [ ] **Step 3: Write the failing gallery test**

Create `src/sections/Sites.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { Sites } from './Sites';

describe('Sites', () => {
  const html = renderHtml(<Sites />, 'ar');

  it('renders the two galleries as scroll-snap strips', () => {
    const strips = [...html.querySelectorAll('section#sites ul[data-sites-strip]')];
    expect(strips).toHaveLength(2);
    expect(strips.map((strip) => strip.querySelectorAll('button[data-testid="site-photo"]').length)).toEqual([7, 5]);
  });

  it('never loads a Kobelco photo', () => {
    expect(html.innerHTML).not.toMatch(/\/img\/(6367|6370|6371)-/);
  });

  it('captions from the deck, and falls back to the site name with full alt text', () => {
    const buttons = [...html.querySelectorAll('button[data-testid="site-photo"]')];
    const first = buttons[0]; // 6374: no deck caption
    expect(first?.querySelector('span.t-small')?.textContent).toBe('موقع إنشاءات');
    expect(first?.querySelector('img')?.getAttribute('alt')).toContain('Terex');
    const second = buttons[1]; // 6376: has a caption, so the image is decorative inside the button
    expect(second?.querySelector('span.t-small')?.textContent).toBe('موقع إنشاءات · كابينة المشغّل وبابها مفتوح');
    expect(second?.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('includes one closed lightbox dialog', () => {
    const dialog = html.querySelector('dialog[data-testid="lightbox"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute('open')).toBe(false);
  });
});
```

Run: `npx vitest run src/sections/Sites.test.tsx`
Expected: FAIL, the stub renders no strips (`expected [] to have a length of 2`).

- [ ] **Step 4: Implement the galleries**

Replace `src/sections/Sites.tsx`:
```tsx
import { useRef, useState } from 'react';
import { Lightbox } from '@/components/Lightbox';
import { Picture } from '@/components/Picture';
import { sites } from '@/content';
import type { SiteGallery } from '@/content/types';
import { useLang } from '@/lib/lang';

export function Sites() {
  const { copy } = useLang();
  const [open, setOpen] = useState<{ gallery: SiteGallery; index: number } | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  return (
    <section id="sites" aria-labelledby="sites-title" className="section-y bg-concrete text-ink">
      <div className="shell">
        <h2 id="sites-title" className="t-h2 text-balance text-navy">
          {copy.sites.title}
        </h2>
        <p className="t-lead measure mt-5">{copy.sites.intro}</p>
      </div>

      {sites.map((gallery) => {
        const titleId = `sites-${gallery.id}`;
        const title = copy.sites.galleries[gallery.id];
        return (
          <div key={gallery.id} className="mt-14">
            <div className="shell flex items-baseline justify-between gap-4">
              <h3 id={titleId} className="t-h3 text-navy">
                {title}
              </h3>
              <p aria-hidden="true" className="t-small text-ink/75 md:hidden">
                {copy.sites.swipeHint}
              </p>
            </div>
            {/* Flex + overflow scroll flows in the page direction, so the Arabic strip starts at the right. */}
            <ul
              data-sites-strip=""
              aria-labelledby={titleId}
              className="mt-6 flex snap-x snap-mandatory scroll-px-[clamp(1rem,4vw,3.5rem)] gap-4 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-4"
            >
              {gallery.photos.map((photo, index) => {
                const caption = copy.sites.captions[photo];
                return (
                  <li key={photo} className="w-[78vw] max-w-[22rem] shrink-0 snap-start">
                    <button
                      type="button"
                      data-testid="site-photo"
                      onClick={(event) => {
                        opener.current = event.currentTarget;
                        setOpen({ gallery, index });
                      }}
                      className="group block w-full text-start"
                    >
                      <Picture
                        photo={photo}
                        crop="mobile_4x5"
                        alt={caption ? '' : copy.alt[photo]}
                        sizes="(min-width: 640px) 22rem, 78vw"
                        pictureClassName="block aspect-[4/5] overflow-hidden"
                        className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="t-small mt-3 block group-hover:underline">{caption ?? title}</span>
                      <span className="sr-only"> {copy.sites.open}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <Lightbox
        photos={open?.gallery.photos ?? []}
        index={open?.index ?? null}
        title={open ? copy.sites.galleries[open.gallery.id] : ''}
        onIndexChange={(index) => setOpen((current) => (current ? { ...current, index } : current))}
        onClose={() => {
          setOpen(null);
          opener.current?.focus();
        }}
      />
    </section>
  );
}
```

- [ ] **Step 5: Run the tests and watch them pass**

Run: `npx vitest run src/components/Lightbox.test.ts src/sections/Sites.test.tsx`
Expected: PASS, `Tests  7 passed (7)`.

- [ ] **Step 6: Commit**
```bash
git add src/components/Lightbox.tsx src/components/Lightbox.test.ts src/sections/Sites.tsx src/sections/Sites.test.tsx
git commit -m "feat(sites): add the two site strips and an RTL-aware dialog lightbox" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.9: Documents (hidden until data)

**Files:**
- Modify (replace the stub): `src/sections/Documents.tsx`
- Test: `src/sections/Documents.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/sections/Documents.test.tsx`:
```tsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DocumentFile } from '@/content/types';

const mockSite = vi.hoisted(() => ({
  email: 'atlasalsahralibya@gmail.com',
  facebook: 'https://www.facebook.com/share/19qKUy2hxg/',
  address: null,
  documents: [] as DocumentFile[],
}));
vi.mock('@/content/site', () => ({ siteInfo: mockSite }));

import { renderHtml } from '@/test/render';
import { Documents } from './Documents';

afterEach(() => {
  mockSite.documents = [];
});

describe('Documents', () => {
  it('renders nothing while there are no real files', () => {
    expect(renderHtml(<Documents />, 'ar').innerHTML).toBe('');
  });

  it('lists each file with its language and date once one exists', () => {
    mockSite.documents = [{ id: 'profile', href: '/docs/atlas-profile.pdf', lang: 'both', date: '2026-11-01' }];
    const html = renderHtml(<Documents />, 'ar');
    expect(html.querySelector('section#documents')).not.toBeNull();
    const row = html.querySelector('li');
    expect(row?.textContent).toContain('ملف الشركة');
    expect(row?.textContent).toContain('PDF · عربي وإنجليزي · آخر تحديث 2026-11-01');
    expect(row?.querySelector('a[download]')?.getAttribute('href')).toBe('/docs/atlas-profile.pdf');
    expect(row?.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toContain(encodeURIComponent('طلب وثيقة: ملف الشركة'));
  });
});
```

Run: `npx vitest run src/sections/Documents.test.tsx`
Expected: FAIL in the second test, because the stub renders nothing (`expected null not to be null`).

- [ ] **Step 2: Implement**

Replace `src/sections/Documents.tsx`:
```tsx
import { Fill } from '@/components/Fill';
import { siteInfo } from '@/content';
import type { DocumentFile } from '@/content/types';
import { useLang } from '@/lib/lang';
import { fillTemplate, mailtoHref } from '@/lib/whatsapp';

/** Spec §5.7: not rendered until site.ts lists real files. */
export function Documents() {
  const { copy } = useLang();
  if (siteInfo.documents.length === 0) return null;
  return (
    <section id="documents" aria-labelledby="documents-title" className="section-y bg-white text-ink">
      <div className="shell">
        <h2 id="documents-title" className="t-h2 text-balance text-navy">
          {copy.documents.title}
        </h2>
        <p className="t-lead measure mt-5">{copy.documents.intro}</p>
        <ul className="mt-12 border-t border-line">
          {siteInfo.documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function DocumentRow({ doc }: { doc: DocumentFile }) {
  const { copy } = useLang();
  const d = copy.documents;
  const name = (d.names as Record<string, string>)[doc.id] ?? doc.id;
  const link = 'inline-flex min-h-11 items-center font-semibold text-navy underline hover:decoration-2';
  return (
    <li className="grid gap-3 border-b border-line py-6 md:grid-cols-12 md:items-center md:gap-8">
      <p className="t-h3 text-navy md:col-span-5">{name}</p>
      <p className="t-small text-ink/75 md:col-span-4">
        <Fill template={d.meta} vars={{ language: d.languages[doc.lang], date: <bdi className="tabular-nums">{doc.date}</bdi> }} />
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 md:col-span-3 md:justify-end">
        <a href={doc.href} download className={link}>
          {d.download}
          <span className="sr-only">: {name}</span>
        </a>
        <a href={mailtoHref(fillTemplate(d.emailSubject, { document: name }), '')} className={link}>
          {d.emailRequest}
          <span className="sr-only">: {name}</span>
        </a>
      </div>
    </li>
  );
}
```

- [ ] **Step 3: Run the test and watch it pass**

Run: `npx vitest run src/sections/Documents.test.tsx`
Expected: PASS, `Tests  2 passed (2)`.

- [ ] **Step 4: Commit**
```bash
git add src/sections/Documents.tsx src/sections/Documents.test.tsx
git commit -m "feat(documents): add data-driven documents list, hidden until files exist" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.10: Request form

**Files:**
- Create: `src/sections/request-form-logic.ts`
- Modify (replace the stub): `src/sections/RequestForm.tsx`
- Test: `src/sections/request-form-logic.test.ts`, `src/sections/RequestForm.test.tsx`

- [ ] **Step 1: Write the failing logic test**

Create `src/sections/request-form-logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getCopy } from '@/content';
import {
  REQUEST_FIELDS,
  buildFollowUpMessage,
  buildRequestMessage,
  craneFromOption,
  emailSubject,
  emptyRequest,
  localIsoDate,
  requestPayload,
  validateRequest,
  type RequestValues,
} from './request-form-logic';

const ar = getCopy('ar');
const en = getCopy('en');
const TODAY = '2026-11-04';
const values = (overrides: Partial<RequestValues>): RequestValues => ({ ...emptyRequest(), ...overrides });
const valid = values({ weight: '12', phone: '0912345678' });

describe('fields', () => {
  it('lists the C9 field names in form order', () => {
    expect(REQUEST_FIELDS).toEqual(['name', 'company', 'phone', 'crane', 'weight', 'radius', 'height', 'site', 'start', 'duration', 'message']);
    expect(Object.keys(emptyRequest())).toEqual([...REQUEST_FIELDS]);
  });

  it('formats a local ISO date', () => {
    expect(localIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('reads a crane id back from its option value', () => {
    expect(craneFromOption('crane:gmk6350')).toBe('gmk6350');
    expect(craneFromOption('crane:nope')).toBeNull();
    expect(craneFromOption('service:handling')).toBeNull();
    expect(craneFromOption('')).toBeNull();
  });
});

describe('validateRequest', () => {
  it('requires only phone and load weight, with the language’s messages', () => {
    const errors = validateRequest(emptyRequest(), 'ar', TODAY);
    expect(Object.keys(errors)).toEqual(['phone', 'weight']);
    expect(errors.phone).toBe(ar.form.fields.phone.empty);
    expect(errors.weight).toBe(ar.form.fields.weight.empty);
    expect(validateRequest(emptyRequest(), 'en', TODAY).weight).toBe(en.form.fields.weight.empty);
  });

  it('accepts Arabic-Indic digits in weight and phone', () => {
    expect(validateRequest(values({ weight: '٣٥٠', phone: '٠٩١٢٣٤٥٦٧٨' }), 'ar', TODAY)).toEqual({});
    expect(validateRequest(values({ weight: '7,5', phone: '+218 91 234 5678' }), 'ar', TODAY)).toEqual({});
  });

  it('rejects a weight that is not a number above zero', () => {
    for (const weight of ['0', 'abc', '-3', '1.2.3']) {
      expect(validateRequest(values({ ...valid, weight }), 'en', TODAY).weight, weight).toBe(en.form.fields.weight.format);
    }
  });

  it('rejects an incomplete phone number', () => {
    for (const phone of ['12', '091-234', 'call me']) {
      expect(validateRequest(values({ ...valid, phone }), 'en', TODAY).phone, phone).toBe(en.form.fields.phone.format);
    }
  });

  it('checks optional numbers only when they are filled in', () => {
    expect(validateRequest(values({ ...valid, radius: '', height: '' }), 'en', TODAY)).toEqual({});
    const errors = validateRequest(values({ ...valid, radius: 'x', height: '٠' }), 'en', TODAY);
    expect(errors.radius).toBe(en.form.fields.radius.format);
    expect(errors.height).toBe(en.form.fields.height.format);
  });

  it('enforces the length limits from the deck', () => {
    const errors = validateRequest(
      values({ ...valid, name: 'a'.repeat(81), company: 'b'.repeat(121), site: 'c'.repeat(201), message: 'd'.repeat(1001) }),
      'en',
      TODAY,
    );
    expect(Object.keys(errors)).toEqual(['name', 'company', 'site', 'message']);
    expect(validateRequest(values({ ...valid, name: 'a'.repeat(80), message: 'd'.repeat(1000) }), 'en', TODAY)).toEqual({});
  });

  it('refuses a start date in the past', () => {
    expect(validateRequest(values({ ...valid, start: '2026-11-03' }), 'en', TODAY).start).toBe(en.form.fields.start.past);
    expect(validateRequest(values({ ...valid, start: TODAY }), 'en', TODAY)).toEqual({});
  });
});

describe('buildRequestMessage', () => {
  it('writes template D, normalising digits and dropping empty lines', () => {
    const message = buildRequestMessage(values({ weight: '٣٥٠', phone: '٠٩١٢٣٤٥٦٧٨', crane: 'crane:gmk6350' }), ar);
    expect(message).toBe(
      [
        'السلام عليكم، أطلس الصحراء.',
        'طلب من الموقع الإلكتروني:',
        'الهاتف: 0912345678',
        'الرافعة أو الخدمة: Grove GMK6350',
        'وزن الحمولة: 350 طن',
      ].join('\n'),
    );
  });

  it('labels services, durations and formatted numbers in English', () => {
    const message = buildRequestMessage(
      values({ weight: '1250.5', phone: '+218 91 234 5678', crane: 'service:oil-services', duration: 'week', radius: '۱۲٫۵', start: '2026-11-20' }),
      en,
    );
    expect(message).toContain('Crane or service: Oil services');
    expect(message).toContain('Load weight: 1,250.5 t');
    expect(message).toContain('Lift radius: 12.5 m');
    expect(message).toContain('Duration: Two days to a week');
    expect(message).toContain('Start date: 2026-11-20');
    expect(message).not.toContain('Lift height:');
    expect(message).not.toContain('{');
  });
});

describe('follow-up, email subject and payload', () => {
  it('uses template E when there is a name, else the general message', () => {
    expect(buildFollowUpMessage(values({ ...valid, name: 'Salem' }), en)).toBe(
      'Hello Atlas Alshraa,\nI just sent a request through your website. Name: Salem, phone: 0912345678.',
    );
    expect(buildFollowUpMessage(valid, en)).toBe(en.whatsapp.general);
  });

  it('names the crane or service in the email subject', () => {
    expect(emailSubject(values({ crane: 'crane:quy250' }), en)).toBe('Website request: Fuwa (FW.China) QUY250');
    expect(emailSubject(emptyRequest(), ar)).toBe('طلب من الموقع: لست متأكداً، ساعدوني في الاختيار');
  });

  it('posts normalised values, the language and the message', () => {
    const payload = requestPayload(values({ weight: '٣٥٠', phone: '٠٩١٢٣٤٥٦٧٨' }), ar);
    expect(payload).toMatchObject({ lang: 'ar', weight: '350', phone: '0912345678', crane: '' });
    expect(payload.summary).toBe(buildRequestMessage(values({ weight: '٣٥٠', phone: '٠٩١٢٣٤٥٦٧٨' }), ar));
    expect(payload._subject).toBe('طلب من الموقع: لست متأكداً، ساعدوني في الاختيار');
  });
});
```

Run: `npx vitest run src/sections/request-form-logic.test.ts`
Expected: FAIL with `Failed to resolve import "./request-form-logic"`.

- [ ] **Step 2: Implement the logic**

Create `src/sections/request-form-logic.ts`:
```ts
import { cranes, getCopy } from '@/content';
import type { Copy, CraneId, DurationId, Lang, ServiceId } from '@/content/types';
import { parseDecimal, toAsciiDigits } from '@/lib/digits';
import { formatNumber } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';

/** C9 input names, in the order the form shows them. */
export const REQUEST_FIELDS = ['name', 'company', 'phone', 'crane', 'weight', 'radius', 'height', 'site', 'start', 'duration', 'message'] as const;
export type RequestField = (typeof REQUEST_FIELDS)[number];
export type RequestValues = Record<RequestField, string>;
export type RequestErrors = Partial<Record<RequestField, string>>;

/** Copy deck §9 limits. */
export const LIMITS = { name: 80, company: 120, site: 200, message: 1000 } as const;
export const DURATIONS: readonly DurationId[] = ['day', 'week', 'month', 'long'];

export function emptyRequest(): RequestValues {
  return { name: '', company: '', phone: '', crane: '', weight: '', radius: '', height: '', site: '', start: '', duration: '', message: '' };
}

/** YYYY-MM-DD in the visitor's own time zone (what <input type="date"> uses). */
export function localIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function craneOptionValue(id: CraneId): string {
  return `crane:${id}`;
}

export function serviceOptionValue(id: ServiceId): string {
  return `service:${id}`;
}

export function craneFromOption(value: string): CraneId | null {
  if (!value.startsWith('crane:')) return null;
  const id = value.slice('crane:'.length);
  return cranes.some((c) => c.id === id && !c.hidden) ? (id as CraneId) : null;
}

export function craneOrServiceLabel(value: string, copy: Copy): string {
  const craneId = craneFromOption(value);
  if (craneId) {
    const crane = cranes.find((c) => c.id === craneId);
    return crane ? `${crane.make} ${crane.model}` : '';
  }
  return copy.services.items.find((s) => serviceOptionValue(s.id) === value)?.title ?? '';
}

const isPositive = (raw: string) => {
  const n = parseDecimal(raw);
  return n !== null && n > 0;
};

/**
 * Copy-deck §9 rules: only phone and weight are required; Arabic-Indic digits
 * are accepted. Keys come back in form order, so the error summary follows it.
 */
export function validateRequest(values: RequestValues, lang: Lang, today: string = localIsoDate(new Date())): RequestErrors {
  const f = getCopy(lang).form.fields;
  const v = (key: RequestField) => values[key].trim();
  const errors: RequestErrors = {};

  if (v('name').length > LIMITS.name) errors.name = f.name.tooLong;
  if (v('company').length > LIMITS.company) errors.company = f.company.tooLong;

  const phone = toAsciiDigits(v('phone'));
  const digits = phone.replace(/\D/g, '').length;
  if (!phone) errors.phone = f.phone.empty;
  else if (!/^\+?[\d\s\-().]+$/.test(phone) || digits < 7 || digits > 15) errors.phone = f.phone.format;

  if (!v('weight')) errors.weight = f.weight.empty;
  else if (!isPositive(v('weight'))) errors.weight = f.weight.format;
  if (v('radius') && !isPositive(v('radius'))) errors.radius = f.radius.format;
  if (v('height') && !isPositive(v('height'))) errors.height = f.height.format;

  if (v('site').length > LIMITS.site) errors.site = f.site.tooLong;
  if (v('start') && v('start') < today) errors.start = f.start.past;
  if (values.message.length > LIMITS.message) errors.message = f.message.tooLong;

  return errors;
}

/** Normalised, human-readable values: ASCII digits, formatted numbers, labels instead of option values. */
export function requestVars(values: RequestValues, copy: Copy): RequestValues {
  const num = (raw: string) => {
    const n = parseDecimal(raw);
    return n === null ? '' : formatNumber(n, copy.lang);
  };
  const duration = (DURATIONS as readonly string[]).includes(values.duration)
    ? copy.form.fields.duration.options[values.duration as DurationId]
    : '';
  return {
    name: values.name.trim(),
    company: values.company.trim(),
    phone: toAsciiDigits(values.phone).trim(),
    crane: craneOrServiceLabel(values.crane, copy),
    weight: num(values.weight),
    radius: num(values.radius),
    height: num(values.height),
    site: values.site.trim(),
    start: values.start,
    duration,
    message: values.message.trim(),
  };
}

/** WhatsApp template D: a line whose field is empty is dropped (deck §10). */
export function buildRequestMessage(values: RequestValues, copy: Copy): string {
  const vars: Record<string, string> = requestVars(values, copy);
  return copy.whatsapp.request
    .split('\n')
    .filter((line) => Array.from(line.matchAll(/\{(\w+)\}/g), (m) => m[1] ?? '').every((key) => Boolean(vars[key])))
    .map((line) => fillTemplate(line, vars))
    .join('\n');
}

/** Template E after a successful send; the general message when no name was given. */
export function buildFollowUpMessage(values: RequestValues, copy: Copy): string {
  const { name, phone } = requestVars(values, copy);
  return name ? fillTemplate(copy.whatsapp.followUp, { name, phone }) : copy.whatsapp.general;
}

export function emailSubject(values: RequestValues, copy: Copy): string {
  return fillTemplate(copy.form.emailSubject, { crane: craneOrServiceLabel(values.crane, copy) || copy.form.fields.crane.unsure });
}

/** JSON body for VITE_FORM_ENDPOINT (Formspree-style `_subject`). */
export function requestPayload(values: RequestValues, copy: Copy) {
  return {
    lang: copy.lang,
    ...requestVars(values, copy),
    _subject: emailSubject(values, copy),
    summary: buildRequestMessage(values, copy),
  };
}
```

Run: `npx vitest run src/sections/request-form-logic.test.ts`
Expected: PASS, `Tests  15 passed (15)`.

- [ ] **Step 3: Write the failing component test**

Create `src/sections/RequestForm.test.tsx`:
```tsx
// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified && mockEnv.target !== 'production' }));

import { setRequestedCrane } from '@/lib/request';
import { changeValue, click, mount, renderHtml } from '@/test/render';
import { RequestForm } from './RequestForm';
import { REQUEST_FIELDS } from './request-form-logic';

afterEach(() => setRequestedCrane(null));

describe('RequestForm', () => {
  it('is #request with the heading first and the dialect line below it', () => {
    const html = renderHtml(<RequestForm />, 'ar');
    const h2 = html.querySelector('section#request h2');
    expect(h2?.textContent).toBe('شنو الرافعة اللي يحتاجها مشروعك؟');
    expect(h2?.previousElementSibling).toBeNull();
    expect(h2?.nextElementSibling?.textContent).toBe('تواصلوا معانا وخلي الباقي علينا');
  });

  it('has the C9 fields in order, with hints wired to every control', () => {
    const form = renderHtml(<RequestForm />, 'en').querySelector('form[data-testid="request-form"]');
    const controls = [...(form?.querySelectorAll<HTMLElement>('[name]') ?? [])];
    expect(controls.map((el) => el.getAttribute('name'))).toEqual([...REQUEST_FIELDS]);
    for (const el of controls) {
      const hint = el.getAttribute('aria-describedby');
      expect(hint).toBe(`${el.id}-hint`);
      expect(form?.querySelector(`#${hint}`)).not.toBeNull();
    }
    const weight = form?.querySelector('[data-testid="form-weight"]');
    expect([weight?.getAttribute('inputmode'), weight?.getAttribute('aria-required')]).toEqual(['decimal', 'true']);
    const phone = form?.querySelector('[data-testid="form-phone"]');
    expect([phone?.getAttribute('type'), phone?.getAttribute('aria-required')]).toEqual(['tel', 'true']);
    expect(form?.querySelector('[data-testid="form-submit"]')?.textContent).toBe('Send request');
    expect(form?.querySelector('[data-testid="form-error-summary"]')).toBeNull();
  });

  it('offers every service and every visible crane', () => {
    const options = [...renderHtml(<RequestForm />, 'en').querySelectorAll('select[name="crane"] option')];
    expect(options.map((o) => o.getAttribute('value'))).toEqual([
      '',
      'service:crane-hire',
      'service:heavy-transport',
      'service:handling',
      'service:oil-services',
      'crane:rt700e',
      'crane:atf60-3',
      'crane:ac200-1',
      'crane:quy250',
      'crane:gmk6350',
    ]);
  });

  it('pre-fills the crane on the hook and clears it when the hook is cleared', async () => {
    const { host, unmount } = await mount(<RequestForm />, 'en');
    const select = host.querySelector<HTMLSelectElement>('select[name="crane"]');
    await act(async () => setRequestedCrane('gmk6350'));
    expect(select?.value).toBe('crane:gmk6350');
    await act(async () => setRequestedCrane(null));
    expect(select?.value).toBe('');
    await unmount();
  });

  it('shows and focuses an error summary, then clears it as fields are fixed', async () => {
    const { host, unmount } = await mount(<RequestForm />, 'ar');
    await click(host.querySelector('[data-testid="form-submit"]'));
    const summary = host.querySelector<HTMLElement>('[data-testid="form-error-summary"]');
    expect(summary).not.toBeNull();
    expect(document.activeElement).toBe(summary);
    expect([...(summary?.querySelectorAll('a') ?? [])].map((a) => a.getAttribute('href'))).toEqual(['#request-phone', '#request-weight']);
    expect(host.querySelector('[data-testid="form-weight"]')?.getAttribute('aria-invalid')).toBe('true');
    await changeValue(host.querySelector('[data-testid="form-weight"]'), '٣٥٠');
    await changeValue(host.querySelector('[data-testid="form-phone"]'), '0912345678');
    expect(host.querySelector('[data-testid="form-error-summary"]')).toBeNull();
    expect(host.querySelector('[data-testid="form-weight"]')?.hasAttribute('aria-invalid')).toBe(false);
    await unmount();
  });
});
```

Run: `npx vitest run src/sections/RequestForm.test.tsx`
Expected: FAIL, the stub renders nothing (`expected undefined to be 'شنو الرافعة اللي يحتاجها مشروعك؟'`).

- [ ] **Step 4: Implement the form**

Replace `src/sections/RequestForm.tsx`:
```tsx
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Button, NewTabNote, externalProps } from '@/components/Button';
import { Fill } from '@/components/Fill';
import { WhatsAppIcon } from '@/components/Icons';
import { siteInfo, visibleCranes } from '@/content';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { toAsciiDigits } from '@/lib/digits';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { getRequestedCrane, setRequestedCrane, useRequestedCrane } from '@/lib/request';
import { mailtoHref, telHref, whatsappHref } from '@/lib/whatsapp';
import {
  DURATIONS,
  LIMITS,
  REQUEST_FIELDS,
  buildFollowUpMessage,
  buildRequestMessage,
  craneFromOption,
  craneOptionValue,
  emailSubject,
  emptyRequest,
  localIsoDate,
  requestPayload,
  serviceOptionValue,
  validateRequest,
  type RequestErrors,
  type RequestField,
  type RequestValues,
} from './request-form-logic';

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'offline';
const TIMEOUT_MS = 10_000;

const CONTROL =
  'block w-full rounded-none border border-white/40 bg-navy-950 ps-4 text-base text-white transition-colors hover:border-white/70 focus:border-white aria-invalid:border-2 aria-invalid:border-red-bright';
function controlClass({ unit = false, multiline = false }: { unit?: boolean; multiline?: boolean } = {}): string {
  return `${CONTROL} ${unit ? 'pe-14' : 'pe-4'} ${multiline ? 'min-h-36 py-3' : 'h-13'}`;
}
const TEXT_LINK = 'inline-flex min-h-11 items-center font-semibold underline hover:decoration-2';

export function RequestForm() {
  const { copy } = useLang();
  const f = copy.form;
  return (
    <section id="request" data-ground="dark" aria-labelledby="request-title" className="section-y bg-navy-950 text-white">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 id="request-title" className="t-h2 text-balance">
            {f.title}
          </h2>
          <p className="t-lead measure mt-5">{f.lead}</p>
          <p className="t-body measure mt-4 text-steel">{f.intro}</p>
          <ContactPanel />
        </div>
        <div className="lg:col-span-7">
          <RequestFormBody />
        </div>
      </div>
    </section>
  );
}

function ContactPanel() {
  const { copy, lang } = useLang();
  const c = copy.form.contact;
  const tel = telHref();
  const whatsapp = env.whatsapp ? whatsappHref(copy.whatsapp.general) : null;
  return (
    <div className="mt-12 border-t border-line-dark pt-8">
      <dl className="grid gap-5">
        <ContactRow label={c.email}>
          <a href={`mailto:${siteInfo.email}`} className="break-all underline hover:decoration-2">
            <bdi>{siteInfo.email}</bdi>
          </a>
        </ContactRow>
        {tel && env.phone && (
          <ContactRow label={c.phone}>
            <a href={tel} onClick={() => track('call_click')} className="underline hover:decoration-2">
              <bdi dir="ltr">{env.phone}</bdi>
            </a>
          </ContactRow>
        )}
        {whatsapp && env.whatsapp && (
          <ContactRow label={c.whatsapp}>
            <a
              href={whatsapp}
              {...externalProps(whatsapp)}
              onClick={() => track('whatsapp_click', { location: 'form' })}
              className="underline hover:decoration-2"
            >
              <bdi dir="ltr">+{env.whatsapp.replace(/\D/g, '')}</bdi>
              <NewTabNote />
            </a>
          </ContactRow>
        )}
        {siteInfo.address && <ContactRow label={c.address}>{siteInfo.address[lang]}</ContactRow>}
      </dl>
      <a href={siteInfo.facebook} {...externalProps(siteInfo.facebook)} className={`${TEXT_LINK} mt-6`}>
        {c.facebook}
        <NewTabNote />
      </a>
    </div>
  );
}

function ContactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="t-label text-steel">{label}</dt>
      <dd className="t-body mt-1">{children}</dd>
    </div>
  );
}

function RequestFormBody() {
  const { copy, lang } = useLang();
  const f = copy.form;
  const requested = useRequestedCrane();
  const [values, setValues] = useState<RequestValues>(emptyRequest);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [today, setToday] = useState<string | undefined>(undefined);
  const summary = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLDivElement>(null);

  // `min` for the date field. Set after hydration so the prerendered HTML never holds a stale date.
  useEffect(() => {
    setToday(localIsoDate(new Date()));
  }, []);

  // Keep the crane field in step with the crane on the hook (card button, bar chip clear).
  useEffect(() => {
    setValues((v) => {
      if (requested) {
        const option = craneOptionValue(requested);
        return v.crane === option ? v : { ...v, crane: option };
      }
      return craneFromOption(v.crane) ? { ...v, crane: '' } : v;
    });
  }, [requested]);

  // After a failed submit, move focus to the summary so it is read out.
  useEffect(() => {
    if (attempts > 0 && Object.keys(errors).length > 0) summary.current?.focus();
    // Runs once per submit attempt only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts]);

  useEffect(() => {
    if (status === 'sent' || status === 'failed' || status === 'offline') result.current?.focus();
  }, [status]);

  const message = buildRequestMessage(values, copy);
  const errorKeys = REQUEST_FIELDS.filter((key) => errors[key]);

  const update = (key: RequestField) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next: RequestValues = { ...values, [key]: event.target.value };
    setValues(next);
    if (attempts > 0) setErrors(validateRequest(next, lang, today));
    if (key === 'crane') {
      const crane = craneFromOption(event.target.value);
      if (crane !== getRequestedCrane()) setRequestedCrane(crane);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const found = validateRequest(values, lang, today);
    setErrors(found);
    setAttempts((n) => n + 1);
    if (Object.keys(found).length > 0) return;

    if (!env.formEndpoint) {
      // No backend: hand the written-out request to WhatsApp (or mailto in staging).
      track('form_submit', { result: 'whatsapp' });
      window.location.assign(whatsappHref(message));
      return;
    }

    setStatus('sending');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(env.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(requestPayload(values, copy)),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus('sent');
      track('form_submit', { result: 'sent' });
    } catch {
      setStatus(navigator.onLine ? 'failed' : 'offline');
      track('form_submit', { result: 'failed' });
    } finally {
      window.clearTimeout(timer);
    }
  };

  if (status === 'sent') {
    return (
      <div ref={result} tabIndex={-1} role="status" data-testid="form-success" className="border border-line-dark p-8 md:p-10">
        <h3 className="t-h3">{f.success.title}</h3>
        <p className="t-body mt-3">
          <Fill template={f.success.text} vars={{ phone: <bdi dir="ltr">{toAsciiDigits(values.phone).trim()}</bdi> }} />
        </p>
        <p className="t-body mt-6 text-steel">{f.success.nudge}</p>
        <Button
          href={whatsappHref(buildFollowUpMessage(values, copy))}
          external
          className="mt-4"
          icon={<WhatsAppIcon className="size-5" />}
          onClick={() => track('whatsapp_click', { location: 'form' })}
        >
          {f.success.button}
        </Button>
      </div>
    );
  }

  const whatsappAlt = whatsappHref(message);
  const altExt = externalProps(whatsappAlt);

  return (
    <form noValidate onSubmit={onSubmit} data-testid="request-form" aria-describedby="request-privacy" className="grid gap-12">
      {attempts > 0 && errorKeys.length > 0 && (
        <div ref={summary} tabIndex={-1} role="alert" data-testid="form-error-summary" className="border border-red-bright p-5">
          <p className="font-semibold">{f.errorSummary}</p>
          <ul className="mt-3 grid gap-2">
            {errorKeys.map((key) => (
              <li key={key}>
                <a
                  href={`#request-${key}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(`request-${key}`)?.focus();
                  }}
                  className="underline hover:decoration-2"
                >
                  {errors[key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(status === 'failed' || status === 'offline') && (
        <div ref={result} tabIndex={-1} role="alert" className="border border-red-bright p-5">
          <p className="font-semibold">{f.failure.title}</p>
          <p className="t-body mt-2">{status === 'offline' ? f.failure.offline : f.failure.text}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="submit" variant="outline-on-dark" size="md">
              {f.failure.retry}
            </Button>
            <Button
              href={whatsappAlt}
              external
              size="md"
              icon={<WhatsAppIcon className="size-5" />}
              onClick={() => track('whatsapp_click', { location: 'form' })}
            >
              {f.failure.whatsapp}
            </Button>
            <Button href={mailtoHref(emailSubject(values, copy), message)} variant="outline-on-dark" size="md">
              {f.failure.email}
            </Button>
          </div>
        </div>
      )}

      <fieldset>
        <legend className="t-h3">{f.groups.details}</legend>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Field name="name" label={f.fields.name.label} hint={f.fields.name.hint} error={errors.name}>
            {(a11y) => (
              <input {...a11y} type="text" autoComplete="name" dir="auto" value={values.name} onChange={update('name')} className={controlClass()} />
            )}
          </Field>
          <Field name="company" label={f.fields.company.label} hint={f.fields.company.hint} error={errors.company}>
            {(a11y) => (
              <input
                {...a11y}
                type="text"
                autoComplete="organization"
                dir="auto"
                value={values.company}
                onChange={update('company')}
                className={controlClass()}
              />
            )}
          </Field>
          <Field name="phone" required label={f.fields.phone.label} hint={f.fields.phone.hint} error={errors.phone} className="sm:col-span-2">
            {(a11y) => (
              // dir="ltr" keeps a leading "+" before the digits in an RTL page.
              <input
                {...a11y}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                data-testid="form-phone"
                value={values.phone}
                onChange={update('phone')}
                className={`${controlClass()} tabular-nums rtl:text-right`}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-h3">{f.groups.lift}</legend>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <Field name="crane" label={f.fields.crane.label} hint={f.fields.crane.hint} className="sm:col-span-3">
            {(a11y) => (
              <select {...a11y} value={values.crane} onChange={update('crane')} className={`${controlClass()} [color-scheme:dark]`}>
                <option value="">{f.fields.crane.unsure}</option>
                <optgroup label={f.fields.crane.servicesGroup}>
                  {copy.services.items.map((service) => (
                    <option key={service.id} value={serviceOptionValue(service.id)}>
                      {service.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={f.fields.crane.cranesGroup}>
                  {visibleCranes.map((crane) => (
                    <option key={crane.id} value={craneOptionValue(crane.id)}>
                      {`${crane.make} ${crane.model}`}
                    </option>
                  ))}
                </optgroup>
              </select>
            )}
          </Field>
          <Field name="weight" required unit={f.fields.weight.unit} label={f.fields.weight.label} hint={f.fields.weight.hint} error={errors.weight}>
            {(a11y) => (
              <input
                {...a11y}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                data-testid="form-weight"
                value={values.weight}
                onChange={update('weight')}
                className={`${controlClass({ unit: true })} tabular-nums`}
              />
            )}
          </Field>
          <Field name="radius" unit={f.fields.radius.unit} label={f.fields.radius.label} hint={f.fields.radius.hint} error={errors.radius}>
            {(a11y) => (
              <input
                {...a11y}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={values.radius}
                onChange={update('radius')}
                className={`${controlClass({ unit: true })} tabular-nums`}
              />
            )}
          </Field>
          <Field name="height" unit={f.fields.height.unit} label={f.fields.height.label} hint={f.fields.height.hint} error={errors.height}>
            {(a11y) => (
              <input
                {...a11y}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={values.height}
                onChange={update('height')}
                className={`${controlClass({ unit: true })} tabular-nums`}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-h3">{f.groups.site}</legend>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Field name="site" label={f.fields.site.label} hint={f.fields.site.hint} error={errors.site} className="sm:col-span-2">
            {(a11y) => <input {...a11y} type="text" dir="auto" value={values.site} onChange={update('site')} className={controlClass()} />}
          </Field>
          <Field name="start" label={f.fields.start.label} hint={f.fields.start.hint} error={errors.start}>
            {(a11y) => (
              <input
                {...a11y}
                type="date"
                min={today}
                value={values.start}
                onChange={update('start')}
                className={`${controlClass()} tabular-nums [color-scheme:dark]`}
              />
            )}
          </Field>
          <Field name="duration" label={f.fields.duration.label} hint={f.fields.duration.hint}>
            {(a11y) => (
              <select {...a11y} value={values.duration} onChange={update('duration')} className={`${controlClass()} [color-scheme:dark]`}>
                <option value="">{f.fields.duration.unsure}</option>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {f.fields.duration.options[d]}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </fieldset>

      <div>
        <Field name="message" label={f.fields.message.label} hint={f.fields.message.hint} error={errors.message}>
          {(a11y) => (
            <textarea {...a11y} rows={5} dir="auto" value={values.message} onChange={update('message')} className={controlClass({ multiline: true })} />
          )}
        </Field>
        <p className="t-small mt-1 text-end tabular-nums text-steel">
          <Fill
            template={f.fields.message.counter}
            vars={{ n: formatNumber(values.message.length, lang), max: formatNumber(LIMITS.message, lang) }}
          />
        </p>
      </div>

      <div className="flex flex-col items-start gap-5">
        <p id="request-privacy" className="t-small measure text-steel">
          {f.privacy}
        </p>
        <Button type="submit" loading={status === 'sending'} data-testid="form-submit">
          {status === 'sending' ? f.busy : f.submit}
        </Button>
        <a href={whatsappAlt} {...altExt} onClick={() => track('whatsapp_click', { location: 'form' })} className={TEXT_LINK}>
          {f.whatsappAlt}
          {altExt.target && <NewTabNote />}
        </a>
      </div>
    </form>
  );
}

interface FieldA11y {
  id: string;
  name: RequestField;
  'aria-describedby': string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

function Field({
  name,
  label,
  hint,
  required = false,
  error,
  unit,
  className = '',
  children,
}: {
  name: RequestField;
  label: string;
  hint: string;
  required?: boolean;
  error?: string;
  unit?: string;
  className?: string;
  children: (a11y: FieldA11y) => ReactNode;
}) {
  const { copy } = useLang();
  const id = `request-${name}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const a11y: FieldA11y = {
    id,
    name,
    'aria-describedby': error ? `${errorId} ${hintId}` : hintId,
    ...(error ? { 'aria-invalid': true as const } : {}),
    ...(required ? { 'aria-required': true as const } : {}),
  };
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <span className="t-small text-steel">{required ? copy.form.required : copy.form.optional}</span>
      </div>
      <p id={hintId} className="t-small mt-1 text-steel">
        {hint}
      </p>
      <div className="relative mt-2">
        {children(a11y)}
        {unit && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-steel">
            {unit}
          </span>
        )}
      </div>
      {/* White text, not red: red on navy fails contrast (spec §6). The red-bright border marks the field. */}
      <p id={errorId} aria-live="polite" className="t-small mt-2 font-semibold text-white">
        {error ?? ''}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Run the tests and watch them pass**

Run: `npx vitest run src/sections/request-form-logic.test.ts src/sections/RequestForm.test.tsx`
Expected: PASS, `Tests  20 passed (20)`.

- [ ] **Step 6: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: no output.
```bash
git add src/sections/request-form-logic.ts src/sections/request-form-logic.test.ts src/sections/RequestForm.tsx src/sections/RequestForm.test.tsx
git commit -m "feat(form): add request form with Arabic-digit validation, error summary and WhatsApp fallback" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.11: Request bar and footer

**Files:**
- Modify (replace the stub): `src/components/RequestBar.tsx`
- Modify (replace the stub): `src/sections/Footer.tsx`
- Test: `src/components/RequestBar.test.tsx`, `src/sections/Footer.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/RequestBar.test.tsx`:
```tsx
// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified && mockEnv.target !== 'production' }));

import { getRequestedCrane, setRequestedCrane } from '@/lib/request';
import { click, mount, renderHtml } from '@/test/render';
import { RequestBar } from './RequestBar';

beforeEach(() => {
  mockEnv.whatsapp = '218911234567';
  mockEnv.phone = null;
});
afterEach(() => setRequestedCrane(null));

describe('RequestBar', () => {
  it('offers WhatsApp with the general message and no Call without a phone', () => {
    const html = renderHtml(<RequestBar />, 'en');
    const bar = html.querySelector('[data-request-bar][data-testid="request-bar"]');
    const whatsapp = bar?.querySelector('a[data-testid="bar-whatsapp"][data-bar-whatsapp]');
    expect(whatsapp?.getAttribute('href')).toBe(
      `https://wa.me/218911234567?text=${encodeURIComponent('Hello Atlas Alshraa,\nI found you through your website and would like to ask about your services.')}`,
    );
    expect(bar?.querySelector('[data-testid="bar-call"]')).toBeNull();
    expect(bar?.querySelector('[data-testid="bar-chip"]')).toBeNull();
  });

  it('adds Call when a phone number is set', () => {
    mockEnv.phone = '+218 91 123 4567';
    const call = renderHtml(<RequestBar />, 'ar').querySelector('a[data-testid="bar-call"]');
    expect(call?.getAttribute('href')).toBe('tel:+218911234567');
    expect(call?.getAttribute('aria-label')).toBe('اتصل بنا على +218 91 123 4567');
  });

  it('uses the one shadow token from spec §15.6 (C11 `shadow-bar`)', () => {
    const bar = renderHtml(<RequestBar />).querySelector('[data-request-bar]');
    expect(bar?.className.split(' ')).toContain('shadow-bar');
  });

  it('shows the crane on the hook, switches to template B and clears with an SVG close button', async () => {
    const { host, unmount } = await mount(<RequestBar />, 'en');
    await act(async () => setRequestedCrane('gmk6350'));
    const chip = host.querySelector('[data-bar-chip][data-testid="bar-chip"]');
    expect(chip?.textContent).toContain('On the hook:');
    expect(chip?.querySelector('bdi')?.textContent).toBe('GMK6350');
    const href = host.querySelector('[data-testid="bar-whatsapp"]')?.getAttribute('href') ?? '';
    expect(new URL(href).searchParams.get('text')).toContain('I would like to ask about the Grove GMK6350 (All-terrain crane).');
    const clear = host.querySelector('button[data-testid="bar-chip-clear"]');
    expect(clear?.getAttribute('aria-label')).toBe('Remove this crane from the request');
    expect(clear?.querySelector('svg')).not.toBeNull();
    expect(clear?.textContent).toBe('');
    await click(clear);
    expect(getRequestedCrane()).toBeNull();
    expect(host.querySelector('[data-testid="bar-chip"]')).toBeNull();
    await unmount();
  });
});
```

Create `src/sections/Footer.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified && mockEnv.target !== 'production' }));

import { renderHtml } from '@/test/render';
import { Footer } from './Footer';

describe('Footer', () => {
  const html = renderHtml(<Footer />, 'ar');

  it('is the C9 footer with a back-to-top link and the outrigger pad', () => {
    expect(html.querySelector('footer[data-footer]')).not.toBeNull();
    const top = html.querySelector('a[data-testid="back-to-top"][data-back-to-top]');
    expect(top?.getAttribute('href')).toBe('#top');
    expect(top?.textContent).toBe('العودة إلى الأعلى');
    expect(html.querySelector('svg[data-footer-pad]')).not.toBeNull();
  });

  it('shows only confirmed contact facts', () => {
    expect(html.querySelector('a[href="mailto:atlasalsahralibya@gmail.com"]')).not.toBeNull();
    expect(html.querySelector('a[href^="tel:"]')).toBeNull();
    const facebook = html.querySelector('a[href="https://www.facebook.com/share/19qKUy2hxg/"]');
    expect(facebook?.getAttribute('target')).toBe('_blank');
  });

  it('prints the copyright with the current year', () => {
    expect(html.textContent).toContain(`© ${new Date().getFullYear()} أطلس الصحراء. جميع الحقوق محفوظة.`);
  });
});
```

Run: `npx vitest run src/components/RequestBar.test.tsx src/sections/Footer.test.tsx`
Expected: FAIL, both stubs render nothing (`expected null not to be null` / `expected undefined to be …`).

- [ ] **Step 2: Implement the request bar**

Replace `src/components/RequestBar.tsx`:
```tsx
import { Button } from '@/components/Button';
import { CloseIcon, HookIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { cranes } from '@/content';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { setRequestedCrane, useRequestedCrane } from '@/lib/request';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';

/** Fixed bar on every screen (spec §5): 64 px + safe area; compact at the inline end on desktop. */
export function RequestBar() {
  const { copy } = useLang();
  const requested = useRequestedCrane();
  const crane = requested ? (cranes.find((c) => c.id === requested) ?? null) : null;
  const message = crane
    ? fillTemplate(copy.whatsapp.crane, { model: `${crane.make} ${crane.model}`, class: copy.craneTypes[crane.type].full })
    : copy.whatsapp.general;
  const tel = telHref();

  return (
    <div
      data-request-bar=""
      data-testid="request-bar"
      className="fixed inset-x-0 bottom-0 z-30 bg-navy-950 pb-[env(safe-area-inset-bottom)] text-white shadow-bar lg:start-auto lg:end-6 lg:bottom-6 lg:pb-0"
    >
      <div className="flex h-16 items-center gap-2 ps-3 pe-2 lg:gap-3 lg:ps-5">
        {crane ? (
          <span data-bar-chip="" data-testid="bar-chip" className="flex min-w-0 items-center gap-2 border border-line-dark ps-3">
            <HookIcon className="size-4 shrink-0 text-red-bright" />
            <span className="min-w-0 truncate text-[0.9375rem]">
              {copy.bar.onHook} <bdi className="t-spec">{crane.model}</bdi>
            </span>
            <button
              type="button"
              data-testid="bar-chip-clear"
              aria-label={copy.bar.clear}
              onClick={() => setRequestedCrane(null)}
              className="inline-flex size-11 shrink-0 items-center justify-center transition-colors hover:bg-white/10"
            >
              <CloseIcon className="size-4" />
            </button>
          </span>
        ) : (
          <p className="hidden text-[0.9375rem] text-steel lg:block">{copy.bar.tooltip}</p>
        )}

        <div className="ms-auto flex shrink-0 items-center gap-2">
          {tel && env.phone && (
            <Button
              href={tel}
              variant="outline-on-dark"
              size="md"
              icon={<PhoneIcon className="size-5" />}
              aria-label={fillTemplate(copy.header.call.label, { phone: env.phone })}
              data-testid="bar-call"
              onClick={() => track('call_click')}
            >
              {copy.header.call.text}
            </Button>
          )}
          <Button
            href={whatsappHref(message)}
            external
            size="md"
            icon={<WhatsAppIcon className="size-5" />}
            data-testid="bar-whatsapp"
            data-bar-whatsapp=""
            onClick={() => track('whatsapp_click', { location: 'bar' })}
          >
            <span className="sr-only">{copy.bar.whatsappLabel}</span>
            <span aria-hidden="true">{copy.bar.whatsapp}</span>
          </Button>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {crane ? `${copy.bar.onHook} ${crane.make} ${crane.model}` : ''}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Implement the footer**

Replace `src/sections/Footer.tsx`:
```tsx
import { NewTabNote, externalProps } from '@/components/Button';
import { HookIcon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { siteInfo } from '@/content';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';

const LINK = 'inline-flex min-h-11 items-center hover:underline';
const HEADING = 'text-[0.9375rem] font-semibold text-steel';

export function Footer() {
  const { copy, lang } = useLang();
  const tel = telHref();
  const whatsapp = env.whatsapp ? whatsappHref(copy.whatsapp.general) : null;

  return (
    <footer data-footer="" data-ground="dark" className="bg-navy-950 pb-28 text-white lg:pb-12">
      <OutriggerPad />
      <div className="shell grid gap-12 pt-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo variant="footer" />
          <p className="t-small measure mt-6 text-steel">{copy.footer.legalName}</p>
          <p className="t-lead mt-4">{copy.footer.tagline}</p>
        </div>

        <nav aria-labelledby="footer-services" className="md:col-span-2">
          <h2 id="footer-services" className={HEADING}>
            {copy.footer.servicesHeading}
          </h2>
          <ul className="mt-3">
            {copy.services.items.map((service) => (
              <li key={service.id}>
                <a href="#services" className={LINK}>
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-page" className="md:col-span-2">
          <h2 id="footer-page" className={HEADING}>
            {copy.footer.pageHeading}
          </h2>
          <ul className="mt-3">
            <li>
              <a href="#cranes" className={LINK}>
                {copy.footer.pageLinks.cranes}
              </a>
            </li>
            <li>
              <a href="#sites" className={LINK}>
                {copy.footer.pageLinks.sites}
              </a>
            </li>
            <li>
              <a href="#request" className={LINK}>
                {copy.footer.pageLinks.request}
              </a>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className={HEADING}>{copy.footer.contactHeading}</h2>
          <ul className="mt-3">
            <li>
              <a href={`mailto:${siteInfo.email}`} className={`${LINK} break-all`}>
                <bdi>{siteInfo.email}</bdi>
              </a>
            </li>
            {tel && env.phone && (
              <li>
                <a href={tel} onClick={() => track('call_click')} className={LINK}>
                  <bdi dir="ltr">{env.phone}</bdi>
                </a>
              </li>
            )}
            {whatsapp && env.whatsapp && (
              <li>
                <a
                  href={whatsapp}
                  {...externalProps(whatsapp)}
                  onClick={() => track('whatsapp_click', { location: 'footer' })}
                  className={LINK}
                >
                  <bdi dir="ltr">+{env.whatsapp.replace(/\D/g, '')}</bdi>
                  <NewTabNote />
                </a>
              </li>
            )}
            {siteInfo.address && <li className="py-2">{siteInfo.address[lang]}</li>}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className={HEADING}>{copy.footer.followHeading}</h2>
          <ul className="mt-3">
            <li>
              <a href={siteInfo.facebook} {...externalProps(siteInfo.facebook)} className={LINK}>
                {copy.footer.facebook}
                <NewTabNote />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell mt-14 flex flex-col-reverse gap-4 border-t border-line-dark pt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* The year is plain digits (formatNumber would group it). Prerendered at build time, so it may differ once a year. */}
        <p className="t-small text-steel" suppressHydrationWarning>
          {fillTemplate(copy.footer.copyright, { year: String(new Date().getFullYear()) })}
        </p>
        <a href="#top" data-testid="back-to-top" data-back-to-top="" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">
          <HookIcon className="size-5 text-red-bright" />
          {copy.footer.backToTop}
        </a>
      </div>
    </footer>
  );
}

/** Where the rope ends: an outrigger pad in red/white chevrons (spec §5.9). Physical drawing, never mirrored. */
function OutriggerPad() {
  return (
    <div className="shell" aria-hidden="true">
      <svg data-footer-pad="" viewBox="0 0 160 28" width="160" height="28" focusable="false" className="block h-7 w-40">
        <defs>
          <pattern id="footer-chevron" width="16" height="28" patternUnits="userSpaceOnUse">
            <rect width="16" height="28" className="fill-white" />
            <path d="M0 0h8l8 14-8 14H0l8-14z" className="fill-red" />
          </pattern>
        </defs>
        <rect x="70" y="0" width="20" height="4" className="fill-steel" />
        <rect x="0" y="4" width="160" height="20" fill="url(#footer-chevron)" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `npx vitest run src/components/RequestBar.test.tsx src/sections/Footer.test.tsx`
Expected: PASS, `Tests  7 passed (7)`.

- [ ] **Step 5: Commit**
```bash
git add src/components/RequestBar.tsx src/components/RequestBar.test.tsx src/sections/Footer.tsx src/sections/Footer.test.tsx
git commit -m "feat(bar): add request bar with hook chip, and footer with outrigger pad" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task C.12: Integration check

**Files:**
- Modify: `src/App.test.tsx` (add page-level checks)

- [ ] **Step 1: Add the page-level tests**

Append inside the `describe('App', …)` block of `src/App.test.tsx`:
```tsx
  it('renders the sections in spec order (documents hidden until files exist)', () => {
    const ids = [...renderHtml(<App />, 'ar').querySelectorAll('main#main > section[id]')].map((s) => s.id);
    expect(ids).toEqual(['top', 'cranes', 'services', 'crane-list', 'sites', 'request']);
  });

  it('meets the spec §15 floor on both pages', () => {
    for (const lang of ['ar', 'en'] as const) {
      const html = renderHtml(<App />, lang);
      for (const heading of html.querySelectorAll('main h1, main h2')) {
        expect(heading.previousElementSibling, heading.textContent ?? '').toBeNull(); // no eyebrow above a heading
      }
      expect(html.querySelector('main')?.textContent).not.toMatch(/\b0[1-9]\b/); // no section numbers
      expect(html.innerHTML).not.toMatch(/[✕✖×✓→←]/); // icons are SVG, not glyphs
      const shadowed = [...html.querySelectorAll('[class*="shadow-"]')];
      expect(shadowed.map((el) => el.getAttribute('data-testid'))).toEqual(['request-bar']);
      expect(html.querySelectorAll('[data-reveal]')).toHaveLength(0);
    }
  });

  it('gives every image alt text from the deck or an explicit empty alt', () => {
    for (const img of renderHtml(<App />, 'en').querySelectorAll('img')) {
      expect(img.hasAttribute('alt')).toBe(true);
    }
  });
```

- [ ] **Step 2: Run everything**

Run: `npx tsc --noEmit && npm test`
Expected: `tsc` prints nothing; every test file passes (Part C adds 16 test files and 88 tests; `src/App.test.tsx` now has 5).

- [ ] **Step 3: Build**

Run: `npx vite build`
Expected: `✓ built in …`, with `dist/index.html` and `dist/en/index.html`. The JS for the entry should be well under 110 KB gzip (the Hoist motion chunk does not exist yet). Note the gzip sizes Vite prints in the commit message body.

- [ ] **Step 4: Preview and check both pages in the browser**

Run: `npx vite preview --port 4173`
Expected: `Local: http://localhost:4173/`. Until Part E prerenders, `#root` is empty and `main.tsx` takes the `createRoot` path.

Open `http://localhost:4173/` (Arabic) and check, at 1440 px and again at 375 px:
1. `<html lang="ar" dir="rtl">`. Tab once: the skip link «انتقل إلى المحتوى» appears; Enter moves focus to `main`.
2. **Header:** badge with «أطلس الصحراء» and "Atlas Alshraa" beneath. Over the hero the header is transparent on the navy strip; after scrolling past the hero it is solid `navy-950` with a hairline. At 375 px the menu icon opens a full-screen dialog with the four links, WhatsApp, and Call only if `VITE_PHONE` is set. Esc closes it and focus returns to the menu button.
3. **Hero:** photo 6398 fills the box with no white text on the sky. The two red legs start at the real hook (source point 3226, 1300) and the WhatsApp button hangs from them. Resize between 360 and 1920 px: the button stays under the hook at every width; below 768 px the 9:16 crop and its own sling are used. On short phones the button may hang a little past the photo into the band; it must not cover the H1. The H1 reads «من الرافعات الصغيرة للكبيرات،» (smaller) then «لكل مشروع رافعته المناسبة». The services line sits **below** it. «تصفّح الرافعات» jumps to the Hoist.
4. **Hoist:** five items 55 → 350, Western digits. Each tag reads «أقصى حمولة», a big number with «طن», and the model, e.g. «Grove GMK6350», in the right order (not reversed). The red/white «مسودة · غير مؤكد» badge shows on each. Tab into the section: «عرض كل الرافعات» appears and jumps to the grid.
5. **Services:** four rows on navy with no numbers; the derrick drawing appears only on «الخدمات النفطية»; `[[CONFIRM: …]]` text is visible (staging).
6. **Grid:** only type chips (no tonnage chips while unverified). Press «مجنزرة»: one card, the count reads «رافعة واحدة». Press «اطلب هذه الرافعة» on GMK6350: the card border turns red, and the bar shows the hook icon, «على الخطّاف: GMK6350» and an SVG close button. The bar's WhatsApp link now carries the per-crane message: hover it and check the status-bar URL, which is `mailto:` in staging without `VITE_WHATSAPP`. Scroll to the form: the crane field shows "Grove GMK6350". Press the bar's close button: the chip disappears and the field returns to «لست متأكداً، ساعدوني في الاختيار».
7. **Sites:** two strips start at the **right** edge and scroll leftwards. Open a photo: the lightbox shows «1 من 7». **ArrowLeft** moves to the next photo, ArrowRight to the previous one; Esc closes it and focus returns to the photo you opened.
8. **Documents:** not present (no `#documents` in the DOM).
9. **Form:** the heading «شنو الرافعة…» comes first, with «تواصلوا معانا وخلي الباقي علينا» under it. Press «أرسل الطلب» with nothing filled in: a 1 px red-bright bordered summary takes focus and lists the phone and weight errors as links; each link focuses its field. Type «٣٥٠» in the weight and a phone number: the errors clear as you type. Submit: the browser opens the written-out request (mailto in staging).
10. **Footer:** chevron pad at the reading-start edge, 80 px badge, email, Facebook (new tab), ©, and the hook-icon «العودة إلى الأعلى» link back to the hero.
11. **Request bar:** 64 px at the bottom on mobile, with the safe area respected. On desktop it is compact at the inline-end corner, which is the **left** on the Arabic page. It is the only element with a shadow, and it never hides a focused form field.
12. DevTools console: no errors, no React warnings. No horizontal scroll at 320 px.

Then open `http://localhost:4173/en/` and repeat items 1–12. Differences to expect: `<html lang="en" dir="ltr">`, hero photo 6359, strips start at the left, **ArrowRight** = next, the bar sits at the bottom-right on desktop, and band labels and counts read "1 crane" and so on.

Stop the preview with Ctrl-C.

- [ ] **Step 5: Commit**
```bash
git add src/App.test.tsx
git commit -m "test(app): check section order and the spec §15 craft floor on both pages" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Proposed contract additions (Part C)

1. **`src/components/Fill.tsx`** (new shared component): `Fill({ template, vars: Record<string, ReactNode> })`. It works like `fillTemplate`, but values may be nodes, so numbers and phone numbers can be wrapped in `<bdi>` inside a sentence.
2. **`src/components/Button.tsx` extra exports:** `buttonClass(variant, size, extra)`, `externalProps(href)`, `NewTabNote`, `CHEVRON_STRIPES`. Button props add `size: 'lg' | 'md'`, `ground: 'dark' | 'light'` (navy focus ring on light grounds), `iconEnd`, `external` (anchors), and `loading` (native buttons: disabled + `aria-busy` + a chevron strip).
3. **`src/components/Sling.tsx` extra exports:** `slingGeometry(image)`, `cropVisibility(desktop, mobile)` and `SlingSvg`. The sling WhatsApp button lives in `Hero.tsx`, positioned with container-query units in the hero photo box (`container-type: size`). With the C11 data, both hero crops have hooks, so there are two `svg[data-sling]` (one hidden by CSS per width) and one `[data-sling-button]`. The band fallback (`data-testid="hero-whatsapp"`, no `data-sling-button`) appears only if a hook point is ever null.
4. **New files** not in the file map: `src/sections/crane-filters.ts`, `src/sections/request-form-logic.ts`, `src/test/render.tsx` (`renderHtml`, `mount`, `click`, `changeValue`).
5. **`App.tsx`** exports `App` both as a named and as the default export. Part E's `entry-server.tsx` should render `<LangProvider lang={lang}><App /></LangProvider>`, the same tree as `main.tsx` minus `StrictMode`.
6. **`data-footer-pad`** on the footer's outrigger-pad `<svg>`, for Part D's "footer pad" moment (spec §15.4). **No `data-reveal` is used anywhere in Part C** (spec §15.4 and coordinator note 6). If Part D wants a reveal, it should target the C9 attributes (`data-service-row`, `data-load-tag`, `data-hoist-item`, `data-footer-pad`).
7. **Header layout:** the hero's photo box starts *below* the 4.5 rem header strip, on the navy ground (`pt-[4.5rem]`), so white header text never sits on the sky (spec §6). The header gets `data-solid=""` once `#top` scrolls under it.
8. **Analytics `location` values** add `menu` (header dialog) and `services` (service rows) to spec §4.6's list. `card` is unused, because the card's button puts the crane on the hook instead of opening WhatsApp (spec §5.5).
9. **`styles.css`:** A1 already writes `.progress-rope { display: none; }` and the spec §15.5 browser-surface rules, so C.1 Step 3 is a guarded no-op that only fills a gap if one is found.
10. **Hoist hook anchor:** `[data-hook-anchor]` is rendered only when the hoist photo's crop has a hook point (C11: 6389 at 885, 1868). It uses `hidden md:block` / `md:hidden` when only one crop has one.
11. **`[data-hoist-band]`:** Part D's checklist lists it as a pending contract addition. Part C does not render it yet. Once its meaning is in the contracts, add it in `Hoist.tsx` (C.5).


---

## Gate I1: Impeccable design review of the static site (end of Day 5, after Part C)

Impeccable (impeccable.style · github.com/pbakaus/impeccable, Apache-2.0) gives the agent named design commands and a deterministic 62-rule detector for "AI slop" and quality problems. The detector runs from the CLI with no install. The `/impeccable …` commands need the skill installed in the project (see I1.1).

### Task I1.1: Install Impeccable for this project (only with the user's go-ahead)

**Files:**
- Create (by the installer): `.claude/skills/impeccable/**` and project hook settings under `.claude/`
- Create: `PRODUCT.md` (written by `/impeccable init`)

- [x] **Step 1: User approved installing Impeccable** (4 Nov 2026).

- [x] **Step 2: Installed for this project only, for Claude Code.** Done on 4 Nov 2026, commit `fb83758`:
  - Command: `npx --yes impeccable@4.8.0 install --providers=claude --scope=project --yes`
  - Added the skill in `.claude/skills/impeccable/` and 4 helper agents in `.claude/agents/`.
  - The hooks (detector after Edit/Write, deep pass on Stop) are in `.claude/settings.local.json`. That file stays local and is gitignored.
  - The native engine in `scripts/bin/` is gitignored and downloads on first run.
  - On another machine, re-run the same install command.

- [ ] **Step 3: Check the skill is live.** In a Claude Code session started in `/Users/montheribrahim/Downloads/atlas-website`, type `/impeccable`.
Expected: the list of commands appears. If it doesn't, start a new session; skills load at session start.

- [ ] **Step 4: Run `/impeccable init`.** `PRODUCT.md` was already drafted on 4 Nov 2026 from the confirmed facts, so init should **update** it, not replace it. Answer its questions from the spec. Give these answers:
  - **Users:** contractors, oil & gas procurement teams and project managers in Libya, mostly on phones and arriving from WhatsApp/Facebook. Arabic first.
  - **Purpose:** show that Atlas Alshraa has the right crane from small to very large (their own tagline) and turn that into a WhatsApp message or request in one tap.
  - **Job type:** Persuade.
  - **Constraints:** ≤ 1 MB first load, about 17 Mbps median mobile, RTL, no invented facts, brand navy #23207A and red #C9221C, no yellow in the UI, square corners, the hook as the one signature shape.

  Expected: `PRODUCT.md` is written at the repository root.

- [ ] **Step 5: Commit**
```bash
git add PRODUCT.md .claude
git commit -m "chore: add Impeccable design skill and product context

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task I1.2: Critique and audit each section, then fix P0/P1

**Files:**
- Modify: whichever `src/sections/*.tsx`, `src/components/*.tsx` or `src/styles.css` the findings point at
- Create: `docs/reviews/impeccable-gate-1.md`

- [ ] **Step 1: Start the preview**

Run: `npx tsc --noEmit && npx vite build && npx vite preview --port 4173`
Expected: `Local: http://localhost:4173/`

- [ ] **Step 2: Critique one target at a time.** Narrow targets give better results. In the agent, run:
```
/impeccable critique the hero on http://localhost:4173/ (Arabic, RTL)
/impeccable critique the hoist load stack on http://localhost:4173/
/impeccable critique the crane grid and its filters on http://localhost:4173/en/
/impeccable critique the request form on http://localhost:4173/
/impeccable critique the request bar and footer on http://localhost:4173/en/
```
Copy each score and its ranked findings into `docs/reviews/impeccable-gate-1.md`, under one heading per target.

- [ ] **Step 3: Technical audit of both pages**
```
/impeccable audit http://localhost:4173/
/impeccable audit http://localhost:4173/en/
```
Record every finding with its severity (P0–P3) in the same file.

- [ ] **Step 4: Fix every P0 and P1 finding.** Each fix must stay inside the approved spec (tokens, type scale, hook system). If a finding asks for something the spec forbids, record it as "won't fix, by spec" with the spec section. Examples: adding yellow, rounding corners, adding a second signature shape.

- [ ] **Step 5: Re-run the two audits.**
Expected: 0 P0, 0 P1. Record the new results.

- [ ] **Step 6: Commit**
```bash
git add -A src docs/reviews/impeccable-gate-1.md
git commit -m "fix: resolve Impeccable gate 1 findings (P0/P1)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task I1.3: Detector scan (no install needed)

**Files:**
- Create: `.impeccable-ignores.md` only if a finding is a deliberate, spec-backed choice
- Modify: `docs/reviews/impeccable-gate-1.md`

- [ ] **Step 1: Scan the source**

Run: `npx impeccable detect src/`
Expected: exit code 0 (no findings). Exit code 2 means findings; they are listed by rule id.

- [ ] **Step 2: Scan the rendered pages** (preview still running)

Run: `npx impeccable detect http://localhost:4173/ && npx impeccable detect http://localhost:4173/en/`
Expected: exit code 0 for both. Rendered scans also run the contrast and tiny-text rules.

- [ ] **Step 3: Fix the findings**, or ignore one only if the spec requires the flagged choice. Example: `npx impeccable ignores add-value <rule-id> <value> --reason "<spec section>"`. Never ignore contrast, heading-order or tiny-text rules. Re-run Steps 1–2 until both exit 0.

- [ ] **Step 4: Record the final detector output in `docs/reviews/impeccable-gate-1.md` and commit**
```bash
git add -A src docs/reviews .impeccable* 2>/dev/null; git add -A src docs/reviews
git commit -m "chore: Impeccable detector clean on source and rendered pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```


---

## Part D — Motion (Days 6–8)

**Runs after Part C.** Part C must be merged: every section renders the C9 attributes, App renders `<div data-progress-rope aria-hidden="true" class="progress-rope">`, and the site works fully with no motion. Part D adds the motion layer on top. It never changes what a screen reader or a no-JS visitor gets.

**Sources for this part:** spec §5 (page design) and §7 (motion system). Choreography comes from `docs/research/concept-motion-lens.md` §2 (the hero's first 2 s table, the Hoist beats table, the mobile load stack, and reduced motion), adapted to contracts C9/C10. Where the concept doc and the spec disagree, the spec wins. For example, the pin length is 30 + 55 × n + 30 vh with no extra 20 vh hold.

**Before you start (2 min):** run `npm test && npx tsc --noEmit && npx vite build`. All three must pass on the Part C head. If they don't, stop and fix Part C first.

### Files in this part

| File | Created in | What it does |
|---|---|---|
| `src/motion/mode.ts` (+ `mode.test.ts`) | D.1 | The three media queries, `detectMotionMode()` and `langOf()`. Pure code. |
| `src/motion/shared.ts` | D.1 | The `Dispose` and `MotionModule` types, `lenisRef`, `runAll`, `safely` and `whenNear`. |
| `src/motion/core.ts` | D.1 (wired in D.3–D.8) | `startMotion()`. Sets the mode, registers the plugins, runs Lenis on desktop only and sets up the `gsap.matchMedia` contexts. |
| `src/motion/index.ts` | D.1 | `useSiteMotion()`. Imports only React at top level. |
| `src/motion/motion.css` | D.1 (appended in D.3, D.5, D.8) | Pre-hide rules and the 3 s fallback, Lenis rules, the progress rope, the staged Hoist, the service sling and the ghosts. |
| `src/motion/math.ts` (+ `math.test.ts`) | D.2 | `hookToBox`, `viewBoxToBox`, `hoistPinUnits`, `hoistPinLength`, `hoistSnapPoints`, `counterSteps`, `counterText`, `flightDelta`, `centerOn`. Pure code. |
| `src/motion/ghost.ts` (+ `ghost.test.ts`) | D.2 | `makeGhost()`. Makes an inert clone, appended to `<body>`, for every flight. |
| `src/motion/hero.ts` | D.3, D.4 | `heroIntro` and `heroDock`. |
| `src/motion/hoist.ts` | D.5, D.6 | `hoistDesktop` and `hoistTouch` (a lazy chunk). |
| `src/motion/ride.ts` | D.7 | `startRide`. The bar chip flies in on `HOOK_EVENT`. |
| `src/motion/reveal.ts` | D.8 | `startServiceSetDown` and `startServiceSlings`. These are the *only* entrance effects outside the hero and the Hoist. |
| `src/motion/rope.ts` | D.8 | `startProgressRope`, `startFooterPad` and `startBackToTop`. |
| `src/motion/sketch.ts` | D.9 (OPTIONAL) | The lift sketch. |
| `src/App.tsx` | D.1 (modified) | Calls `useSiteMotion()` and imports `motion.css`. |

### Conventions used by every task in this part

- **One authored motion idea: the hook (spec §15.4, Impeccable craft floor).** Motion exists only for:
  - the hero intro, the sling and its dock;
  - the Hoist (desktop) and the load stack (touch);
  - the ride into the bar;
  - service rows being set down, the service sling, the progress rope, and the footer pad with the back-to-top hoist.

  Everything else stays static and visible. In particular:
  - **There is no generic reveal.** Part D never touches `[data-reveal]`, section headings, the crane grid (no Flip reflow: spec §15.4 overrides §5.5), the sites strip or the documents.
  - Entrances use **exponential ease-out** (`expo.out`) from an **already-visible default**. Outside the hero intro and the Hoist, nothing is set to `opacity: 0`; set-downs move a visible element by a few pixels. Lifts out of frame use `power2.in`; the sling swing uses `sine.inOut`.
- **Module shape.** Every motion feature is a `MotionModule = (env: MotionEnv) => Dispose`.
  - It looks up its own targets by C9 attributes. If a target is missing, it returns `noop`.
  - It returns a cleanup function that puts the DOM back exactly as React rendered it.
  - `core.ts` lists the modules per `gsap.matchMedia` context and wraps each one in `safely()`, so a module that throws is logged and skipped. This is the AFHAM `useMotion` pattern.
- **GSAP contexts.** Each module creates its own `gsap.context()` and calls `ctx.revert()` in its `Dispose`, because many tweens are created later, inside callbacks.
- **DOM rules (global rules 2 and 6):**
  - Motion only *adds* nodes that it owns: ghosts in `<body>`, the Hoist rig `<li>` and runway, and the service sling SVGs. Every cleanup removes them.
  - It never moves or deletes a React node.
  - Only two edits touch React-owned content, and both are listed under "Proposed contract additions":
    - SplitText on the hero `<h1>`, reverted on cleanup;
    - the `nodeValue` of the text node inside `[data-counter]`, restored on cleanup.
- **No pin-spacer.** ScrollTrigger's `pin` wraps the pinned element in a new `<div>`, which reparents a React node. The Hoist therefore uses CSS `position: sticky`, a scroll "runway" `<div>` that motion owns, and a scrubbed ScrollTrigger with no `pin`. The visual result is the same, and it is still the one pinned scene.
- **Only `transform`, `opacity` and `clip-path` animate.** Static layout (the staged Hoist, the runway height) is set once, when the mode is entered.
- **Commits:** one per task. Use this exact form (with a heredoc, so the trailer is its own paragraph):
  ```bash
  git commit -m "$(cat <<'MSG'
  feat(motion): <summary>

  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  MSG
  )"
  ```
- **Manual checks:**
  - Run `npm run dev` and open `http://localhost:5173/` (AR) and `http://localhost:5173/en/` (EN) in the browser preview.
  - Desktop context: a window 1440 px wide with a mouse.
  - Touch context: DevTools device toolbar → "iPhone 12 Pro" (390 px, touch). **Reload after switching** so the page starts in that context.
  - Reduced motion: DevTools → ⋮ → More tools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → `reduce`.

---

### Task D.1: Motion core — mode detection, plugins, Lenis, matchMedia, CSS base, App hook

**Files:**
- Create: `src/motion/mode.ts`
- Create: `src/motion/mode.test.ts`
- Create: `src/motion/shared.ts`
- Create: `src/motion/core.ts`
- Create: `src/motion/index.ts`
- Create: `src/motion/motion.css`
- Modify: `src/App.tsx`

**Decision: where `motion.css` is imported.** `src/App.tsx` imports it statically.
- It cannot be imported by `core.ts`. Core is a dynamic chunk, so its CSS would arrive *after* first paint, and the `.motion-ok [data-intro]` pre-hide would come too late.
- It cannot be imported by `index.ts`. Global rule: `index.ts` imports only React.
- App is shared by the client entry and Part E's `entry-server.tsx`, so the CSS ends up in the page's main stylesheet on both pages.

**A contract bug found while planning (fixed here, listed in Proposed contract additions):**
- C10 writes the touch query as `(prefers-reduced-motion: no-preference) and not ((min-width: 1024px) and (pointer: fine))`. That is **invalid** Media Queries 4 grammar. After `and`, only a parenthesised condition may follow, and `not (...)` is not one. Browsers parse the whole query as `not all`, so the touch context would never run.
- `mode.ts` uses the exact complement written as a comma list: max-width 1023.98 px, *or* a coarse pointer, *or* no pointer, always together with no-preference.
- The test below proves that the three queries are mutually exclusive and cover every case.

- [ ] **Step 1: Write the failing test** `src/motion/mode.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { MOTION_QUERIES, detectMotionMode, langOf, type MotionMode } from './mode';

type Pointer = 'fine' | 'coarse' | 'none';
interface Env { width: number; pointer: Pointer; reduced: boolean }

const FEATURE = /^\(([a-z-]+):\s*([a-z0-9.-]+)\)$/;
const KNOWN = new Set(['min-width', 'max-width', 'pointer', 'prefers-reduced-motion']);

/** Every feature in a query: "," = or, "and" = and. Nothing else is allowed (no `not`, no `only`). */
function features(query: string): string[] {
  return query.split(',').flatMap((part) => part.trim().split(/\s+and\s+/)).map((f) => f.trim());
}

/** A tiny matchMedia stand-in for the plain features above. */
function evaluate(query: string, env: Env): boolean {
  return query.split(',').some((part) =>
    part.trim().split(/\s+and\s+/).every((raw) => {
      const [, name, value] = FEATURE.exec(raw.trim()) ?? [];
      switch (name) {
        case 'min-width': return env.width >= parseFloat(value);
        case 'max-width': return env.width <= parseFloat(value);
        case 'pointer': return env.pointer === value;
        case 'prefers-reduced-motion': return value === 'reduce' ? env.reduced : !env.reduced;
        default: throw new Error(`unsupported media feature: ${raw}`);
      }
    }),
  );
}

const MODES = Object.keys(MOTION_QUERIES) as MotionMode[];
const widths = [320, 375, 768, 1023, 1023.5, 1024, 1280, 1920];
const pointers: Pointer[] = ['fine', 'coarse', 'none'];
const envs: Env[] = widths.flatMap((width) =>
  pointers.flatMap((pointer) => [false, true].map((reduced) => ({ width, pointer, reduced }))),
);

describe('MOTION_QUERIES', () => {
  it('uses only plain features joined by "and" and ","', () => {
    for (const query of Object.values(MOTION_QUERIES)) {
      for (const feature of features(query)) {
        const match = FEATURE.exec(feature);
        expect(match, feature).not.toBeNull();
        expect(KNOWN.has(match![1]), feature).toBe(true);
      }
    }
  });

  it('keeps the desktop and reduced queries exactly as contract C10 writes them', () => {
    expect(MOTION_QUERIES.desktop).toBe('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    expect(MOTION_QUERIES.reduced).toBe('(prefers-reduced-motion: reduce)');
  });

  it('matches exactly one context in every environment', () => {
    for (const env of envs) {
      const hits = MODES.filter((mode) => evaluate(MOTION_QUERIES[mode], env));
      expect(hits, JSON.stringify(env)).toHaveLength(1);
    }
  });

  it('gives desktop only to wide screens with a fine pointer and no reduced motion', () => {
    expect(evaluate(MOTION_QUERIES.desktop, { width: 1440, pointer: 'fine', reduced: false })).toBe(true);
    expect(evaluate(MOTION_QUERIES.touch, { width: 1440, pointer: 'coarse', reduced: false })).toBe(true);
    expect(evaluate(MOTION_QUERIES.touch, { width: 800, pointer: 'fine', reduced: false })).toBe(true);
  });
});

describe('detectMotionMode', () => {
  it('agrees with the query that matches, for every environment', () => {
    for (const env of envs) {
      const expected = MODES.find((mode) => evaluate(MOTION_QUERIES[mode], env));
      expect(detectMotionMode((query) => evaluate(query, env)), JSON.stringify(env)).toBe(expected);
    }
  });

  it('lets reduced motion win over everything', () => {
    expect(detectMotionMode(() => true)).toBe('reduced');
  });

  it('falls back to touch when nothing matches', () => {
    expect(detectMotionMode(() => false)).toBe('touch');
  });
});

describe('langOf', () => {
  it('reads the html lang attribute', () => {
    expect(langOf('ar')).toBe('ar');
    expect(langOf('ar-LY')).toBe('ar');
    expect(langOf('AR')).toBe('ar');
    expect(langOf('en')).toBe('en');
    expect(langOf('')).toBe('en');
    expect(langOf(null)).toBe('en');
    expect(langOf(undefined)).toBe('en');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/motion/mode.test.ts`
Expected: FAIL. Vitest reports that `./mode` cannot be resolved ("Failed to resolve import" / "Cannot find module"), and 0 tests pass.

- [ ] **Step 3: Write `src/motion/mode.ts`**

```ts
import type { Lang } from '@/content/types';

export type MotionMode = 'desktop' | 'touch' | 'reduced';

const NO_PREF = '(prefers-reduced-motion: no-preference)';

/**
 * The three gsap.matchMedia contexts (contract C10).
 * `touch` is written as a comma list (OR) because C10's
 * `… and not ((min-width: 1024px) and (pointer: fine))` is not valid MQ4 grammar.
 * This list is its exact complement: narrower than 1024px, or a coarse pointer, or no pointer.
 */
export const MOTION_QUERIES: Record<MotionMode, string> = {
  desktop: `(min-width: 1024px) and (pointer: fine) and ${NO_PREF}`,
  touch: [
    `${NO_PREF} and (max-width: 1023.98px)`,
    `${NO_PREF} and (pointer: coarse)`,
    `${NO_PREF} and (pointer: none)`,
  ].join(', '),
  reduced: '(prefers-reduced-motion: reduce)',
};

/** Pure: pass `(q) => window.matchMedia(q).matches` in the browser, a stub in tests. */
export function detectMotionMode(matches: (query: string) => boolean): MotionMode {
  if (matches(MOTION_QUERIES.reduced)) return 'reduced';
  if (matches(MOTION_QUERIES.desktop)) return 'desktop';
  return 'touch';
}

/** `<html lang>` → content language. */
export function langOf(tag: string | null | undefined): Lang {
  return (tag ?? '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}
```

- [ ] **Step 4: Run the test again**

Run: `npx vitest run src/motion/mode.test.ts`
Expected: PASS. 1 test file and 8 tests pass.

- [ ] **Step 5: Write `src/motion/shared.ts`**

```ts
import type Lenis from 'lenis';
import type { Lang } from '@/content/types';

export type Dispose = () => void;
export const noop: Dispose = () => {};

export interface MotionEnv {
  lang: Lang;
  rtl: boolean;
}

/** One motion feature. Finds its own targets, returns a cleanup that restores React's DOM. */
export type MotionModule = (env: MotionEnv) => Dispose;

/** The desktop Lenis instance (null on touch and reduced). */
export const lenisRef: { current: Lenis | null } = { current: null };

/** Runs cleanups in reverse order of creation; one failing cleanup never blocks the others. */
export function runAll(disposers: Dispose[]): void {
  for (const dispose of [...disposers].reverse()) {
    try {
      dispose();
    } catch (error) {
      console.error('[motion]', error);
    }
  }
}

/** A module that throws is logged and skipped. The content is already visible without it. */
export function safely(module: MotionModule, env: MotionEnv): Dispose {
  try {
    return module(env);
  } catch (error) {
    console.error('[motion]', error);
    return noop;
  }
}

/** Calls `run` once, when `el` comes within one viewport of the screen (C10). */
export function whenNear(el: Element, run: () => void): Dispose {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        io.disconnect();
        run();
      }
    },
    { rootMargin: '100% 0px' },
  );
  io.observe(el);
  return () => io.disconnect();
}
```

- [ ] **Step 6: Write `src/motion/core.ts`** (first version: Lenis and the contexts only; D.3–D.8 add modules to `DESKTOP` and `TOUCH`)

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';
import { MOTION_QUERIES, detectMotionMode, langOf, type MotionMode } from './mode';
import { lenisRef, runAll, safely, type Dispose, type MotionEnv, type MotionModule } from './shared';

/** Smooth scroll, desktop only, driven by GSAP's ticker so ScrollTrigger stays in sync (spec §7). */
const startLenis: MotionModule = () => {
  const lenis = new Lenis({
    autoRaf: false,
    anchors: true,
    lerp: 0.085,
    // Menus and the lightbox are native <dialog>s: let them scroll natively.
    prevent: (node) => node.closest('dialog') !== null,
  });
  const onTick = (time: number) => lenis.raf(time * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);
  lenisRef.current = lenis;
  return () => {
    gsap.ticker.remove(onTick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
    if (lenisRef.current === lenis) lenisRef.current = null;
  };
};

/** Desktop context. Order matters: Lenis first, then the hero intro (it must set its from-states in this same task). */
const DESKTOP: MotionModule[] = [startLenis];

/** Touch context: no Lenis, no sticky stage, one-shot reveals. */
const TOUCH: MotionModule[] = [];

function setMode(mode: MotionMode): void {
  document.documentElement.dataset.motion = mode;
}

function run(modules: MotionModule[], env: MotionEnv): Dispose {
  const disposers = modules.map((module) => safely(module, env));
  return () => runAll(disposers);
}

export function startMotion(): Dispose {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const root = document.documentElement;
  const env: MotionEnv = { lang: langOf(root.lang), rtl: root.dir === 'rtl' };

  // Set the mode before any context runs. The CSS pre-hide stops here, so every module
  // that wants a from-state sets it synchronously, in this same task, before the next paint.
  setMode(detectMotionMode((query) => window.matchMedia(query).matches));

  const mm = gsap.matchMedia();
  mm.add(MOTION_QUERIES.desktop, () => {
    setMode('desktop');
    return run(DESKTOP, env);
  });
  mm.add(MOTION_QUERIES.touch, () => {
    setMode('touch');
    return run(TOUCH, env);
  });
  mm.add(MOTION_QUERIES.reduced, () => {
    setMode('reduced'); // no timelines: React already rendered the final state
  });

  return () => {
    mm.revert();
    delete root.dataset.motion;
  };
}
```

- [ ] **Step 7: Write `src/motion/index.ts`**

```ts
import { useEffect } from 'react';

/**
 * Starts the motion layer once, after hydration (contract C10).
 * Only React is imported at top level, so this file is safe in the Node prerender.
 * GSAP, Lenis and every timeline arrive in the separate `core` chunk.
 */
export function useSiteMotion(): void {
  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    import('./core')
      .then(({ startMotion }) => {
        if (!cancelled) stop = startMotion();
      })
      .catch((error: unknown) => {
        console.error('[motion]', error);
        // Un-hide the intro now, instead of waiting for the 3 s CSS fallback.
        document.documentElement.dataset.motion = 'reduced';
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);
}
```

- [ ] **Step 8: Write `src/motion/motion.css`** (base; later tasks append sections 4–6 below the marked line)

```css
/* Motion layer (Part D).
   Hidden states exist only under html.motion-ok. The inline <head> script (A1) adds it
   when JS runs and prefers-reduced-motion is not "reduce". No JS → nothing is hidden.
   The hero <img> is never hidden (LCP). */

/* 1. Before core.ts sets html[data-motion]: pre-hide the hero's intro targets.
      If motion never starts, the keyframe un-hides them after 3 s. */
html.motion-ok:not([data-motion]) :is([data-intro], [data-split], [data-sling-button], [data-sling-leg]) {
  opacity: 0;
  animation: atlas-motion-failsafe 0.01s linear 3s forwards;
}
/* The sling button stays tappable while transparent; it is never invisible while focused. */
html.motion-ok [data-sling-button]:focus-visible {
  opacity: 1 !important;
}
@keyframes atlas-motion-failsafe {
  to {
    opacity: 1;
  }
}

/* 2. Lenis (desktop only; rules from lenis/dist/lenis.css). */
html.lenis,
html.lenis body {
  height: auto;
}
html.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-stopped {
  overflow: clip;
}
.lenis.lenis-smooth iframe {
  pointer-events: none;
}

/* 3. Progress rope: hidden by Part C's CSS; shown on desktop only. rope.ts drives scaleY and .is-live. */
html[data-motion="desktop"] .progress-rope {
  display: block;
  position: fixed;
  inset-block: 0;
  inset-inline-start: clamp(0.375rem, 1vw, 1rem);
  inline-size: 1px;
  background: var(--color-red);
  transform-origin: 50% 0;
  transform: scaleY(0);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 30;
}
html[data-motion="desktop"] .progress-rope.is-live {
  opacity: 1;
}

/* 7. Ghosts (clones that fly; created by ghost.ts, removed after landing). */
.motion-ghost {
  position: fixed;
  margin: 0;
  pointer-events: none;
  z-index: 70;
  will-change: transform;
}

/* 8. Reduced motion: belt and braces. */
html[data-motion="reduced"] .progress-rope {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .motion-ghost,
  .service-sling,
  .hoist-rig {
    display: none !important;
  }
}

/* ---- sections appended by later tasks go below this line ---- */
```

- [ ] **Step 9: Modify `src/App.tsx`**

Part C (C.1) left a marked line for this. Add the two imports after the last existing import (`import { Sites } from '@/sections/Sites';`), and replace the `// PART D: …` comment with the call. Do not change anything else.

```diff
@@
 import { Services } from '@/sections/Services';
 import { Sites } from '@/sections/Sites';
+import { useSiteMotion } from '@/motion';
+import '@/motion/motion.css';
 
 export function App() {
   const { copy } = useLang();
 
-  // PART D: add `useSiteMotion();` on this line (import { useSiteMotion } from '@/motion'). Part C must not.
+  useSiteMotion();
 
   useEffect(() => {
     loadAnalytics();
   }, []);
```

- [ ] **Step 10: Run the checks**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected:
- Vitest: all files pass, including `src/motion/mode.test.ts` (8 tests).
- `tsc`: no output, exit code 0.
- Vite: `✓ built in …`. The output lists a separate `assets/core-<hash>.js` chunk, about 45–60 KB gzip (GSAP, ScrollTrigger, SplitText, DrawSVG and Lenis). The entry chunk does **not** grow by more than 1 KB gzip compared with the Part C build.

- [ ] **Step 11: Manual check in the browser preview**

Run `npm run dev`, then:
1. At 1440 px with a mouse, open `/`. In the console, `document.documentElement.dataset.motion` → `'desktop'` and `document.documentElement.classList.contains('lenis')` → `true`. A wheel scroll glides; it does not step.
2. Paste this into the console. Every count must be ≥ 1. Expect 2 `svg[data-sling]`, one per crop, with one hidden by CSS at each width:
   ```js
   ['[data-hero]','[data-hero-photo]','[data-split]','svg[data-sling]','[data-sling-leg]','[data-hook-pin]','[data-sling-button]','[data-intro]','[data-hoist]','[data-hoist-list]','[data-hoist-item]','[data-hoist-photo]','[data-load-tag]','[data-counter]','[data-hook-anchor]','[data-service-row]','[data-crane-grid]','[data-bar-whatsapp]','[data-progress-rope]','[data-back-to-top]','[data-footer-pad]'].map(s => [s, document.querySelectorAll(s).length])
   ```
3. Drag the window to 900 px wide. `dataset.motion` switches live to `'touch'`, and `classList.contains('lenis')` → `false`. Drag back to 1440 px → `'desktop'` again. There are no console errors.
4. Device toolbar → iPhone 12 Pro, reload → `'touch'`.
5. Rendering → emulate `prefers-reduced-motion: reduce`, reload → `'reduced'`. The H1, the sling button and the lines under the H1 are visible immediately.
6. DevTools → Network → request blocking: add the pattern `core-` and reload. The console shows `[motion]` with the load error, `dataset.motion` is `'reduced'`, and all hero text is visible at once. Remove the block.
7. DevTools → ⋮ → Run command → "Disable JavaScript", reload: all content is visible (no `motion-ok` class). Re-enable JavaScript.

- [ ] **Step 12: Commit**

```bash
git add src/motion/mode.ts src/motion/mode.test.ts src/motion/shared.ts src/motion/core.ts src/motion/index.ts src/motion/motion.css src/App.tsx
git commit -m "$(cat <<'MSG'
feat(motion): add motion core with mode detection, Lenis and matchMedia contexts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---
### Task D.2: Pure motion math and the ghost helper (TDD)

**Files:**
- Create: `src/motion/math.test.ts`
- Create: `src/motion/math.ts`
- Create: `src/motion/ghost.test.ts`
- Create: `src/motion/ghost.ts`

**Why these functions exist:**
- `hookToBox` puts the swing pivot and the Hoist's "real hook" on the photo at any viewport size. It uses `object-fit: cover` with `object-position: 50% 0` (contract C6).
- `viewBoxToBox` is the same mapping, written the way SVG 2 computes `preserveAspectRatio="xMidYMin slice"`. The test proves the two give the same result, so the HTML button and the SVG sling can never drift apart.
- The pin length, the snap points and the counter steps drive the Hoist.
- `makeGhost` is the single place where clones are made (global rule 6).

- [ ] **Step 1: Write the failing test** `src/motion/math.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import {
  HOIST,
  centerOn,
  counterSteps,
  counterText,
  flightDelta,
  hoistPinLength,
  hoistPinUnits,
  hoistSnapPoints,
  hookToBox,
  viewBoxToBox,
  type Point,
} from './math';

function expectPoint(p: Point, x: number, y: number, digits = 6) {
  expect(p.x).toBeCloseTo(x, digits);
  expect(p.y).toBeCloseTo(y, digits);
}

describe('hookToBox (object-fit: cover; object-position: 50% 0)', () => {
  it('cuts the sides equally when the box is taller than the crop', () => {
    // scale = max(400/1000, 400/500) = 0.8 → drawn 800 wide, 200 px cut from each side
    expectPoint(hookToBox({ x: 600, y: 250 }, { left: 100, top: 0, width: 1000, height: 500 }, { width: 400, height: 400 }), 200, 200);
  });

  it('cuts only the bottom when the box is wider than the crop (top-anchored)', () => {
    // scale = max(1000/1000, 200/500) = 1 → drawn 1000×500, anchored at the top
    expectPoint(hookToBox({ x: 600, y: 250 }, { left: 100, top: 0, width: 1000, height: 500 }, { width: 1000, height: 200 }), 500, 250);
  });

  it('maps the crop corners onto the box corners when the aspect ratios match', () => {
    const rect = { left: 1160, top: 0, width: 1921, height: 2401 };
    const box = { width: 1921 / 5, height: 2401 / 5 };
    expectPoint(hookToBox({ x: 1160, y: 0 }, rect, box), 0, 0);
    expectPoint(hookToBox({ x: 1160 + 1921, y: 2401 }, rect, box), 384.2, 480.2);
  });

  it('honours another object-position when asked', () => {
    // 50% 50%: crop 1000×500 in a 400×400 box → scale 0.8, offset (-200, 0)
    expectPoint(hookToBox({ x: 500, y: 250 }, { left: 0, top: 0, width: 1000, height: 500 }, { width: 400, height: 400 }, { x: 0.5, y: 0.5 }), 200, 200);
  });
});

describe('viewBoxToBox (SVG preserveAspectRatio="xMidYMin slice")', () => {
  it('gives exactly the same point as hookToBox for 500 random crops, boxes and points', () => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 500; i++) {
      const rect = {
        left: Math.round(rand() * 2000),
        top: Math.round(rand() * 500),
        width: 300 + Math.round(rand() * 4000),
        height: 300 + Math.round(rand() * 3000),
      };
      const box = { width: 280 + rand() * 1800, height: 200 + rand() * 1200 };
      const p = { x: rect.left + rand() * rect.width, y: rect.top + rand() * rect.height };
      const a = hookToBox(p, rect, box);
      const b = viewBoxToBox(p, { x: rect.left, y: rect.top, width: rect.width, height: rect.height }, box);
      expectPoint(b, a.x, a.y);
    }
  });

  it('also works when the viewBox starts at 0 0 and the point is relative to the crop', () => {
    expectPoint(viewBoxToBox({ x: 500, y: 250 }, { x: 0, y: 0, width: 1000, height: 500 }, { width: 400, height: 400 }), 200, 200);
  });
});

describe('Hoist pin length (spec §5: 30 vh in, 55 vh per crane, 30 vh out)', () => {
  it('counts vh units from the number of cranes', () => {
    expect(HOIST).toEqual({ inUnits: 30, beatUnits: 55, outUnits: 30, setDownAt: 0.85 });
    expect(hoistPinUnits(5)).toBe(335);
    expect(hoistPinUnits(3)).toBe(225);
    expect(hoistPinUnits(0)).toBe(60);
  });

  it('converts units to pixels for a viewport height', () => {
    expect(hoistPinLength(5, 900)).toBe(3015);
    expect(hoistPinLength(3, 1000)).toBe(2250);
  });

  it('treats negative and fractional counts safely', () => {
    expect(hoistPinUnits(-2)).toBe(60);
    expect(hoistPinUnits(2.7)).toBe(170);
  });
});

describe('hoistSnapPoints', () => {
  it('snaps to the start, to each crane once its tag is set down, and to the end', () => {
    const points = hoistSnapPoints(5);
    expect(points).toHaveLength(7);
    expect(points[0]).toBe(0);
    expect(points[6]).toBe(1);
    expect(points[1]).toBeCloseTo((30 + 55 * 0.85) / 335, 10);
    expect(points[5]).toBeCloseTo((30 + 4 * 55 + 55 * 0.85) / 335, 10);
    for (let i = 1; i < points.length; i++) expect(points[i]).toBeGreaterThan(points[i - 1]);
  });

  it('returns just the two ends for an empty list', () => {
    expect(hoistSnapPoints(0)).toEqual([0, 1]);
  });
});

describe('counterSteps', () => {
  it('runs each counter from the previous capacity to its own', () => {
    expect(counterSteps([55, 60, 200, 250, 350])).toEqual([
      { from: 0, to: 55 },
      { from: 55, to: 60 },
      { from: 60, to: 200 },
      { from: 200, to: 250 },
      { from: 250, to: 350 },
    ]);
  });

  it('returns nothing for no cranes', () => {
    expect(counterSteps([])).toEqual([]);
  });
});

describe('counterText', () => {
  it('rounds to whole tonnes with Western digits in both languages', () => {
    expect(counterText(349.6, 'en')).toBe('350');
    expect(counterText(54.4, 'ar')).toBe('54');
    expect(counterText(-0.3, 'en')).toBe('0');
  });
});

describe('flightDelta and centerOn', () => {
  it('maps one rect onto another with a 0 0 transform origin', () => {
    expect(flightDelta({ left: 10, top: 20, width: 100, height: 40 }, { left: 210, top: 620, width: 50, height: 40 })).toEqual({
      x: 200,
      y: 600,
      scaleX: 0.5,
      scaleY: 1,
    });
  });

  it('never divides by zero', () => {
    expect(flightDelta({ left: 0, top: 0, width: 0, height: 0 }, { left: 5, top: 5, width: 10, height: 10 })).toEqual({ x: 5, y: 5, scaleX: 1, scaleY: 1 });
  });

  it('centres a size on an anchor rect', () => {
    expect(centerOn({ left: 100, top: 100, width: 200, height: 50 }, { width: 80, height: 30 })).toEqual({ left: 160, top: 110, width: 80, height: 30 });
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/motion/math.test.ts`
Expected: FAIL. `./math` cannot be resolved, and 0 tests pass.

- [ ] **Step 3: Write `src/motion/math.ts`**

```ts
import type { Lang } from '@/content/types';
import { formatNumber } from '@/lib/numbers';

export interface Point { x: number; y: number }
export interface Size { width: number; height: number }
/** Same shape as a DOMRect's left/top/width/height and as C6's crop `rect`. */
export interface Rect { left: number; top: number; width: number; height: number }
/** Same shape as `SVGSVGElement.viewBox.baseVal`. */
export interface ViewBox { x: number; y: number; width: number; height: number }

/**
 * A point given in source pixels (inside the crop `rect`), mapped to CSS pixels inside
 * an element of size `box` that shows the crop with `object-fit: cover` and
 * `object-position: position.x position.y` (default 50% 0, contract C6).
 * This is the CSS Images 3 formula: concrete size = rect × max scale, offset = (box − size) × position.
 */
export function hookToBox(hook: Point, rect: Rect, box: Size, position: Point = { x: 0.5, y: 0 }): Point {
  const scale = Math.max(box.width / rect.width, box.height / rect.height);
  const offsetX = (box.width - rect.width * scale) * position.x;
  const offsetY = (box.height - rect.height * scale) * position.y;
  return { x: offsetX + (hook.x - rect.left) * scale, y: offsetY + (hook.y - rect.top) * scale };
}

/**
 * The same mapping, as SVG 2 §8.2 computes `preserveAspectRatio="xMidYMin slice"`.
 * Kept separate on purpose: the test proves both give the same point.
 */
export function viewBoxToBox(point: Point, viewBox: ViewBox, box: Size): Point {
  // Steps 1–2: per-axis scale factors.
  const sx = box.width / viewBox.width;
  const sy = box.height / viewBox.height;
  // Step 3: "slice" uses the larger factor for both axes.
  const scale = Math.max(sx, sy);
  // Step 4: translate so the viewBox origin lands on the viewport origin.
  let tx = -viewBox.x * scale;
  const ty = -viewBox.y * scale;
  // Step 5: xMid centres horizontally; YMin keeps the top edge.
  tx += (box.width - viewBox.width * scale) / 2;
  return { x: point.x * scale + tx, y: point.y * scale + ty };
}

/** Hoist timeline units, in vh of scroll (spec §5: 30 in, 55 per crane, 30 out). */
export const HOIST = { inUnits: 30, beatUnits: 55, outUnits: 30, setDownAt: 0.85 } as const;

export function hoistPinUnits(count: number): number {
  const n = Math.max(0, Math.floor(count));
  return HOIST.inUnits + n * HOIST.beatUnits + HOIST.outUnits;
}

/** Scroll distance of the sticky stage, in px, for a viewport `vh` px tall. */
export function hoistPinLength(count: number, vh: number): number {
  return (hoistPinUnits(count) * vh) / 100;
}

/** Scroll progress values to snap to: 0, each crane once its tag is set down, 1. */
export function hoistSnapPoints(count: number): number[] {
  const n = Math.max(0, Math.floor(count));
  const total = hoistPinUnits(n);
  const beats = Array.from({ length: n }, (_, i) => (HOIST.inUnits + i * HOIST.beatUnits + HOIST.beatUnits * HOIST.setDownAt) / total);
  return [0, ...beats, 1];
}

/** Each counter runs from the previous crane's capacity to its own; the first starts at 0. */
export function counterSteps(values: number[]): Array<{ from: number; to: number }> {
  return values.map((to, i) => ({ from: i === 0 ? 0 : values[i - 1], to }));
}

/** What a counter shows mid-run: whole tonnes, Western digits (global rule 4). */
export function counterText(value: number, lang: Lang): string {
  return formatNumber(Math.max(0, Math.round(value)), lang);
}

/** Transform (with transform-origin 0 0) that moves and scales `from` onto `to`. */
export function flightDelta(from: Rect, to: Rect): { x: number; y: number; scaleX: number; scaleY: number } {
  return {
    x: to.left - from.left,
    y: to.top - from.top,
    scaleX: from.width ? to.width / from.width : 1,
    scaleY: from.height ? to.height / from.height : 1,
  };
}

/** A rect of `size`, centred on `anchor`. */
export function centerOn(anchor: Rect, size: Size): Rect {
  return {
    left: anchor.left + anchor.width / 2 - size.width / 2,
    top: anchor.top + anchor.height / 2 - size.height / 2,
    width: size.width,
    height: size.height,
  };
}
```

- [ ] **Step 4: Run it again**

Run: `npx vitest run src/motion/math.test.ts`
Expected: PASS. 1 file and 17 tests pass.

- [ ] **Step 5: Write the failing ghost test** `src/motion/ghost.test.ts`

```ts
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { makeGhost } from './ghost';

const AT = { left: 10, top: 20, width: 120, height: 48 };

function source(): HTMLElement {
  document.body.innerHTML =
    '<a id="wa" href="https://wa.me/1" data-testid="sling-whatsapp" data-sling-button class="btn" style="opacity:0;transform:rotate(4deg)">' +
    '<svg data-icon><path d="M0 0"></path></svg><span data-label>WhatsApp</span></a>';
  return document.getElementById('wa')!;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('makeGhost', () => {
  it('appends an inert clone, hidden from assistive tech, to <body> at the given rect', () => {
    const ghost = makeGhost(source(), AT);
    expect(ghost.parentElement).toBe(document.body);
    expect(ghost.getAttribute('aria-hidden')).toBe('true');
    expect(ghost.hasAttribute('inert')).toBe(true);
    expect(ghost.classList.contains('motion-ghost')).toBe(true);
    expect(ghost.classList.contains('btn')).toBe(true);
    expect(ghost.style.position).toBe('fixed');
    expect([ghost.style.left, ghost.style.top, ghost.style.width, ghost.style.height]).toEqual(['10px', '20px', '120px', '48px']);
    expect(ghost.style.opacity).toBe('1');
    expect(ghost.style.transform).toBe('none');
    expect(ghost.textContent).toBe('WhatsApp');
  });

  it('strips ids, links and every data-* attribute, so selectors and tests never find two', () => {
    const ghost = makeGhost(source(), AT);
    expect(ghost.id).toBe('');
    expect(ghost.hasAttribute('href')).toBe(false);
    for (const el of [ghost, ...Array.from(ghost.querySelectorAll('*'))]) {
      expect(el.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual([]);
    }
    expect(document.querySelectorAll('[data-testid="sling-whatsapp"]')).toHaveLength(1);
    expect(document.querySelectorAll('#wa')).toHaveLength(1);
  });

  it('leaves the source node untouched', () => {
    const el = source();
    const before = el.outerHTML;
    makeGhost(el, AT);
    expect(el.outerHTML).toBe(before);
    expect(el.parentElement).toBe(document.body);
  });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npx vitest run src/motion/ghost.test.ts`
Expected: FAIL. `./ghost` cannot be resolved.

- [ ] **Step 7: Write `src/motion/ghost.ts`**

```ts
import type { Rect } from './math';

const STRIP = new Set(['id', 'href', 'for', 'name', 'tabindex']);

/**
 * The only way motion makes a flying element (global rule 6): a deep clone that keeps
 * the source's classes (so it looks the same), loses every id, link and data-* hook
 * (so tests and selectors never see two), is inert and aria-hidden, and sits fixed
 * at `at` in <body>. The caller removes it after landing.
 */
export function makeGhost(source: HTMLElement, at: Rect): HTMLElement {
  const ghost = source.cloneNode(true) as HTMLElement;
  for (const el of [ghost, ...Array.from(ghost.querySelectorAll('*'))]) {
    for (const name of el.getAttributeNames()) {
      if (name.startsWith('data-') || STRIP.has(name)) el.removeAttribute(name);
    }
  }
  ghost.classList.add('motion-ghost');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.setAttribute('inert', '');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${at.left}px`,
    top: `${at.top}px`,
    width: `${at.width}px`,
    height: `${at.height}px`,
    margin: '0',
    boxSizing: 'border-box',
    opacity: '1',
    visibility: 'visible',
    transform: 'none',
    pointerEvents: 'none',
    zIndex: '70',
  });
  document.body.append(ghost);
  return ghost;
}
```

- [ ] **Step 8: Run all checks**

Run: `npm test && npx tsc --noEmit`
Expected:
- Vitest: every file passes, including `mode.test.ts` (8 tests), `math.test.ts` (17) and `ghost.test.ts` (3).
- `tsc`: no output, exit code 0.

- [ ] **Step 9: Commit**

```bash
git add src/motion/math.ts src/motion/math.test.ts src/motion/ghost.ts src/motion/ghost.test.ts
git commit -m "$(cat <<'MSG'
feat(motion): add hook mapping, Hoist pin math, counter steps and ghost helper

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---
### Task D.3: Hero intro — photo settle, sling pays out, masked H1, one damped swing

**Files:**
- Create: `src/motion/hero.ts`
- Modify: `src/motion/core.ts` (add `heroIntro` to both contexts)
- Modify: `src/motion/motion.css` (append the hero block)

**Choreography (concept §2 "What moves in the first 2 seconds"; eases per spec §15.4):**

| t (s) | Target | Motion |
|---|---|---|
| 0.00–2.00 | `[data-hero-photo]` and `svg[data-sling]` (same box) | `scale 1.05 → 1`, `expo.out`, origin `50% 100%`. Transform only; the `<img>` is never hidden. |
| 0.15–0.85 | `[data-sling-leg]` ×2 | DrawSVG pays out from the hook end, `power2.in`, like rope running off a drum. |
| 0.35–1.25 | `[data-split]` H1 | SplitText masked lines, `yPercent 105 → 0`, stagger 0.10, `expo.out`. EN `type: 'lines'`; AR `type: 'lines,words'`; never chars. Reverted when done. |
| 0.80–1.20 | `[data-sling-button]` | Settles onto the sling: `y −18 → 0`, `opacity 0 → 1`, `expo.out`. It is tappable the whole time. |
| 1.20–1.70 | button + legs | One damped swing about the hook pin: `rotation 0 → 4 → −2.5 → 1 → 0`, `sine.inOut` per segment. The button's `transformOrigin` comes from `hookToBox`; the legs use `svgOrigin` = pin `cx cy`. |
| 1.10–1.75 | `[data-intro]` | `opacity 0 → 1`, `y 16 → 0`, stagger 0.08, `expo.out`. |
| 2.00 | — | Everything is still. |

**Late start:** motion arrives after hydration. To hide that delay:
- CSS pre-states, which apply only before `html[data-motion]` exists: the H1, the intro lines, the sling legs and the button are transparent, and the photo and sling are pre-scaled to 1.05. Each has a 3 s CSS fallback (proposed C10 amendment).
- `core.ts` sets `data-motion` and runs `heroIntro` in the same task, so the GSAP from-states replace the CSS pre-states before the next paint.
- If the intro would start after 2.95 s, the fallback has already shown everything, so the intro is skipped.

- [ ] **Step 1: Append the hero block to `src/motion/motion.css`** (below the "sections appended" line)

```css
/* Hero (D.3). The photo and its sling overlay start 5 % large before motion starts, so the
   intro settles them without a jump. Not hidden: the LCP image paints at once.
   The 3 s fallback puts them at rest if motion never starts. */
html.motion-ok:not([data-motion]) :is([data-hero-photo], svg[data-sling]) {
  transform: scale(1.05);
  transform-origin: 50% 100%;
  animation: atlas-motion-settle 0.01s linear 3s forwards;
}
@keyframes atlas-motion-settle {
  to {
    transform: none;
  }
}
html.motion-ok [data-hero] {
  overflow-x: clip;
}
/* SplitText line masks: room for Arabic marks above and below the line box while lines rise. */
.split-line-mask {
  padding-block: 0.15em;
  margin-block: -0.15em;
}
```

- [ ] **Step 2: Write `src/motion/hero.ts`**

```ts
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { hookToBox } from './math';
import { noop, type MotionModule } from './shared';

/** The intro plays once per page load, and never again after a context switch. */
let introStarted = false;
/** The running intro, so the dock (D.4) can finish it before measuring the button. */
let introTimeline: gsap.core.Timeline | null = null;

export function finishIntro(): void {
  introTimeline?.progress(1);
}

/** Draw a sling leg from whichever end is higher on screen: that end is on the hook. */
function drawFrom(leg: SVGPathElement): string {
  const length = leg.getTotalLength();
  const start = leg.getPointAtLength(0);
  const end = leg.getPointAtLength(length);
  return start.y <= end.y ? '0% 0%' : '100% 100%';
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/**
 * Hero, first 2 s (concept §2 table, spec §5.2). Desktop and touch contexts only.
 * Never hides the hero <img>: only its wrapper scales.
 */
export const heroIntro: MotionModule = ({ lang }) => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return noop;
  // Too late: the 3 s CSS fallback has shown everything already. Do not hide it again.
  if (introStarted || performance.now() > 2950) {
    introStarted = true;
    return noop;
  }
  introStarted = true;

  const photo = hero.querySelector<HTMLElement>('[data-hero-photo]');
  // Part C renders one sling per crop and hides the other with CSS: use the one that is laid out.
  const sling =
    Array.from(hero.querySelectorAll<SVGSVGElement>('svg[data-sling]')).find((svg) => svg.getBoundingClientRect().width > 0) ?? null;
  const legs = sling ? Array.from(sling.querySelectorAll<SVGPathElement>('[data-sling-leg]')) : [];
  const pin = sling?.querySelector<SVGCircleElement>('[data-hook-pin]') ?? null;
  const button = hero.querySelector<HTMLElement>('[data-sling-button]');
  const h1 = hero.querySelector<HTMLElement>('[data-split]');
  const intro = Array.from(hero.querySelectorAll<HTMLElement>('[data-intro]'));

  // Measure now: data-motion is already set, so the CSS pre-scale is gone and nothing is transformed yet.
  let svgOrigin: string | null = null;
  let buttonOrigin: string | null = null;
  if (sling && pin) {
    const box = sling.getBoundingClientRect();
    const vb = sling.viewBox.baseVal;
    const cx = pin.cx.baseVal.value;
    const cy = pin.cy.baseVal.value;
    svgOrigin = `${cx} ${cy}`;
    if (button && box.width > 0 && vb.width > 0) {
      const hook = hookToBox({ x: cx, y: cy }, { left: vb.x, top: vb.y, width: vb.width, height: vb.height }, { width: box.width, height: box.height });
      const b = button.getBoundingClientRect();
      buttonOrigin = `${box.left + hook.x - b.left}px ${box.top + hook.y - b.top}px`;
    }
  }

  let split: SplitText | null = null;
  let cancelled = false;
  const startedAt = performance.now();

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        introTimeline = null;
      },
    });
    introTimeline = tl;

    // 0.00–2.00 The photo and its sling overlay settle about the same point, so the legs stay on the real hook.
    const settle = [photo, sling].filter((el): el is HTMLElement | SVGSVGElement => el !== null);
    if (settle.length) {
      tl.fromTo(settle, { scale: 1.05, transformOrigin: '50% 100%' }, { scale: 1, duration: 2, ease: 'expo.out', immediateRender: true }, 0);
    }

    // 0.15–0.85 The sling legs pay out downward from the hook.
    if (legs.length) {
      gsap.set(legs, { opacity: 0 });
      tl.set(legs, { opacity: 1 }, 0.15);
      for (const leg of legs) {
        tl.fromTo(leg, { drawSVG: drawFrom(leg) }, { drawSVG: '0% 100%', duration: 0.7, ease: 'power2.in', immediateRender: true }, 0.15);
      }
    }

    // 0.80–1.20 The button settles onto the sling ends…
    if (button) {
      tl.fromTo(button, { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out', immediateRender: true }, 0.8);
      // …1.20–1.70 then one damped swing about the hook pin. Capped at one cycle (concept risk 2).
      if (buttonOrigin) {
        gsap.set(button, { transformOrigin: buttonOrigin });
        tl.to(button, { keyframes: { rotation: [0, 4, -2.5, 1, 0], easeEach: 'sine.inOut' }, duration: 0.5, ease: 'none' }, 1.2);
      }
      if (svgOrigin && legs.length) {
        gsap.set(legs, { svgOrigin });
        tl.to(legs, { keyframes: { rotation: [0, 4, -2.5, 1, 0], easeEach: 'sine.inOut' }, duration: 0.5, ease: 'none' }, 1.2);
      }
    }

    // 1.10–1.75 The services line and "Browse cranes" rise.
    if (intro.length) {
      tl.fromTo(intro, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.08, immediateRender: true }, 1.1);
    }

    // The H1 stays hidden until it is split (CSS hid it before data-motion; this keeps it hidden).
    if (h1) gsap.set(h1, { autoAlpha: 0 });
  });

  // 0.35–1.25 The H1 rises in masked lines once fonts are ready (spec §7). If fonts are slow, split
  // after 1.2 s anyway: autoSplit re-splits when they arrive.
  if (h1) {
    void Promise.race([document.fonts.ready, wait(1200)]).then(() => {
      if (cancelled) return;
      ctx.add(() => {
        split = SplitText.create(h1, {
          type: lang === 'ar' ? 'lines,words' : 'lines',
          linesClass: 'split-line',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            gsap.set(h1, { autoAlpha: 1 });
            const elapsed = (performance.now() - startedAt) / 1000;
            return gsap.from(self.lines, {
              yPercent: 105,
              duration: 0.9,
              ease: 'expo.out',
              stagger: 0.1,
              delay: Math.max(0, 0.35 - elapsed),
              // Hand the H1 back to React's plain markup: no masks left to clip Arabic marks.
              onComplete: () => split?.revert(),
            });
          },
        });
      });
    });
  }

  return () => {
    cancelled = true;
    introTimeline = null;
    split?.revert();
    ctx.revert();
  };
};
```

- [ ] **Step 3: Wire it into `src/motion/core.ts`**

Add this import below the `./shared` import:

```ts
import { heroIntro } from './hero';
```

Replace the two module lists:

```ts
const DESKTOP: MotionModule[] = [startLenis];
```
```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro];
```

```ts
const TOUCH: MotionModule[] = [];
```
```ts
const TOUCH: MotionModule[] = [heroIntro];
```

- [ ] **Step 4: Run the checks**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected: all tests pass, `tsc` prints nothing, and the build ends with `✓ built in …`.

- [ ] **Step 5: Manual check (browser preview)**

1. **Desktop, 1440 px, `/`:** reload and watch the first 2 s.
   - The photo settles from slightly large, without a jump at the moment JS arrives.
   - The two sling legs draw *downward* from the real hook.
   - The H1 lines rise out of their masks, right-aligned, with Arabic letters joined.
   - The WhatsApp button drops onto the sling ends and swings once. Its top stays on the hook pin through the swing, and the legs swing with it.
   - The services line and "Browse cranes" rise.
   - Nothing moves after 2 s.
2. **Accessibility tree during the intro:** inspect the H1. It has `aria-label` with the full sentence, and its split children have `aria-hidden="true"`. After 1.3 s the H1 contains Part C's original markup again (SplitText reverted).
3. **Keyboard:** reload and press Tab straight away until the sling button is reached. It is fully visible with its focus ring, even mid-intro.
4. **EN, `/en/`:** the same, mirrored. The hook is on the left (IMG_6359).
5. **Widths:** check at 375 (touch, reload) and at 1024, 1280 and 1920. The button's swing pivot stays on the hook at every width.
6. **Reduced motion:** emulate `reduce` and reload. Nothing moves, and everything is visible at once.
7. **Performance:** DevTools Performance, reload with "Screenshots" on.
   - The LCP marker is on the hero `<img>`.
   - The "Layout shifts" track is empty.
   - Compare with the core chunk blocked (D.1 Step 11.6): the LCP time differs by less than 100 ms.

- [ ] **Step 6: Commit**

```bash
git add src/motion/hero.ts src/motion/core.ts src/motion/motion.css
git commit -m "$(cat <<'MSG'
feat(motion): hero intro with sling pay-out, masked H1 and one damped swing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---

### Task D.4: Sling dock — the WhatsApp button lands in the request bar

**Files:**
- Modify: `src/motion/hero.ts` (append `heroDock`)
- Modify: `src/motion/core.ts` (add `heroDock` to both contexts)

**Behaviour (spec §5.2 "On scroll: the button docks into the RequestBar"):**
- When the bottom of the hero passes 65 % of the viewport height, a **ghost** (a `makeGhost` clone) of the sling button flies into `[data-bar-whatsapp]`: 0.6 s, `power2.inOut` (a transition, spec §7).
- The real sling button goes `autoAlpha 0`. When the ghost lands, it is removed, and the bar button gets one emphasis pulse (`scale 1 → 1.08 → 1`, 0.36 s).
- Scrolling back reverses it: a ghost flies from the bar to the sling, then the real button shows again.
- If the page loads already scrolled past the hero, the button is simply hidden, with no flight.
- No React node moves. Only the clone flies.

- [ ] **Step 1: Append to `src/motion/hero.ts`**

Add these imports to the top of the file, beside the existing ones:

```ts
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { makeGhost } from './ghost';
import { flightDelta } from './math';
```

(Change the existing `import { hookToBox } from './math';` to `import { flightDelta, hookToBox } from './math';` rather than adding a second import from `./math`.)

Append at the end of the file:

```ts
/** The bar's WhatsApp button, if it is laid out. */
function barWhatsapp(): HTMLElement | null {
  const el = document.querySelector<HTMLElement>('[data-bar-whatsapp]');
  return el && el.getBoundingClientRect().width > 0 ? el : null;
}

/**
 * On scroll past the hero, the WhatsApp button "is set down where it will stay":
 * a ghost flies from the sling into the bar's WhatsApp button. Reverses on scroll back.
 */
export const heroDock: MotionModule = () => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const button = hero?.querySelector<HTMLElement>('[data-sling-button]') ?? null;
  if (!hero || !button) return noop;

  let ghost: HTMLElement | null = null;
  let flight: gsap.core.Timeline | null = null;
  let pulse: gsap.core.Tween | null = null;
  let armed = false;

  const land = () => {
    flight?.kill();
    flight = null;
    ghost?.remove();
    ghost = null;
  };

  const dock = (animate: boolean) => {
    land();
    finishIntro();
    const bar = barWhatsapp();
    const from = button.getBoundingClientRect();
    gsap.set(button, { autoAlpha: 0 });
    if (!animate || !bar || from.width === 0) return;
    const d = flightDelta(from, bar.getBoundingClientRect());
    ghost = makeGhost(button, from);
    flight = gsap
      .timeline({
        onComplete: () => {
          land();
          pulse?.kill();
          pulse = gsap.fromTo(bar, { scale: 1 }, { scale: 1.08, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1, clearProps: 'transform' });
        },
      })
      .to(ghost, { x: d.x, y: d.y, scaleX: d.scaleX, scaleY: d.scaleY, transformOrigin: '0 0', duration: 0.6, ease: 'power2.inOut' }, 0)
      .to(ghost, { opacity: 0, duration: 0.15, ease: 'none' }, 0.45);
  };

  const undock = (animate: boolean) => {
    land();
    const bar = barWhatsapp();
    const to = button.getBoundingClientRect(); // still laid out while visibility: hidden
    if (!animate || !bar || to.width === 0) {
      gsap.set(button, { autoAlpha: 1 });
      return;
    }
    const d = flightDelta(to, bar.getBoundingClientRect());
    ghost = makeGhost(button, to);
    flight = gsap
      .timeline({
        onComplete: () => {
          gsap.set(button, { autoAlpha: 1 });
          land();
        },
      })
      .fromTo(ghost, { x: d.x, y: d.y, scaleX: d.scaleX, scaleY: d.scaleY, transformOrigin: '0 0' }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: 'power2.inOut' }, 0)
      .fromTo(ghost, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, 0);
  };

  const st = ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 65%',
    end: 'max',
    onEnter: () => dock(armed),
    onLeaveBack: () => undock(armed),
  });
  // Loaded mid-page: hide the sling button without a flight.
  if (st.isActive) dock(false);
  const frame = requestAnimationFrame(() => {
    armed = true;
  });

  return () => {
    cancelAnimationFrame(frame);
    st.kill();
    land();
    pulse?.kill();
    gsap.set(button, { clearProps: 'opacity,visibility' });
    const bar = document.querySelector<HTMLElement>('[data-bar-whatsapp]');
    if (bar) gsap.set(bar, { clearProps: 'transform' });
  };
};
```

- [ ] **Step 2: Wire it into `src/motion/core.ts`**

Change the hero import to:

```ts
import { heroDock, heroIntro } from './hero';
```

Replace the lists:

```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro];
```
```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro, heroDock];
```

```ts
const TOUCH: MotionModule[] = [heroIntro];
```
```ts
const TOUCH: MotionModule[] = [heroIntro, heroDock];
```

- [ ] **Step 3: Run the checks**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected: all pass. The build ends with `✓ built in …`.

- [ ] **Step 4: Manual check (browser preview)**

1. **Desktop 1440, `/`:** wait 2 s, then scroll down slowly.
   - When the hero's bottom passes about two-thirds of the screen, a copy of the WhatsApp button flies down into the bar's WhatsApp button in about 0.6 s, and the bar button pulses once.
   - The sling in the hero is now empty.
   - While it flies, Elements shows one `.motion-ghost` as the last child of `<body>`. It disappears on landing.
2. **Scroll back up past the same point:** a copy flies from the bar back onto the sling, and the real button reappears on the hook.
3. **Console check while docked:** `document.querySelectorAll('[data-testid="sling-whatsapp"]').length` → `1`, and `document.querySelectorAll('.motion-ghost').length` → `0`.
4. **Fast scrolling:** flick down and up quickly five times. There is never more than one ghost, and the button ends visible when the hero is in view and hidden when it is not.
5. **Mid-page reload:** reload while scrolled to the services section. There is no flight, and scrolling up to the hero brings the button back with a flight.
6. **Touch 390 px:** reload and do the same. It works, and the bar's WhatsApp button pulses.
7. **Reduced:** no flight. The sling button simply stays in the hero (the bar always has its own WhatsApp).
8. **Resize** from 1440 to 900 while docked. Nothing is left hidden: in the touch context the dock re-applies its state from the scroll position.

- [ ] **Step 5: Commit**

```bash
git add src/motion/hero.ts src/motion/core.ts
git commit -m "$(cat <<'MSG'
feat(motion): dock the sling WhatsApp button into the request bar with a ghost flight

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---
### Task D.5: The Hoist, desktop — sticky stage, rope, five loads, counters, real hook, hand-off to the progress rope

**Files:**
- Modify: `src/motion/math.test.ts`, `src/motion/math.ts` (add `nearestSnap`, TDD)
- Create: `src/motion/hoist.ts` (a lazy chunk)
- Modify: `src/motion/core.ts` (add the lazy loader)
- Modify: `src/motion/motion.css` (append the staged Hoist block)

**Part C markup this task drives** (C.5, `Hoist.tsx` and `LoadTag.tsx`):
- `section#cranes[data-hoist] > .shell` contains the heading, intro, skip link, `<ol data-hoist-list>`, and then a footnote and a closing button.
- Each `li[data-hoist-item]` has:
  - `div[data-hoist-photo]` (`overflow-hidden`), which holds one `<picture>` (`desktop_16x9` / `mobile_4x5`) and, on GMK6350, `span[data-hook-anchor]`;
  - a wrapper `div` holding `div[data-load-tag]`. The white tag carries the capacity counter, the model and the type, and has its **own** short red rope (3.5 rem, `bottom-full`) and ring.
- There is no per-item button and no band, so Part D needs no extra markup here. See "Proposed contract additions" item 5.

**Design (spec §5.3, concept §2 beats table):**
- **Staging, which happens once on entering desktop mode:**
  - `hoist.ts` adds `.hoist--staged` to `[data-hoist]`. Motion CSS turns `[data-hoist-list]` into a 100 vh `position: sticky` stage on navy. Every item is stacked absolutely inside it: the photo fills the top 76 %, and the tag hangs under the rope.
  - It appends a motion-owned `<li class="hoist-rig" aria-hidden="true">` (the rope, the red hook block and the faint load-chart arcs) inside the list. The accessibility tree still says "list, 5 items".
  - It inserts a motion-owned `<div class="hoist-runway">` after the list, with height `hoistPinUnits(n)` vh, so the stage stays stuck for exactly the pin length. No pin-spacer, no reparenting.
  - It gives the list a bottom margin equal to the height of the content after the runway (the footnote and the closing button). That content then scrolls in *below* the released stage instead of passing unseen underneath it.
- **Timeline** in vh units: 30 in, 55 per crane, 30 out. `scrub: 0.6`.
  - Its `start` and `end` are absolute scroll positions computed from the runway, which is not sticky. ScrollTrigger measures sticky elements wrongly while they are stuck.
  - Snapping comes from a `scrollEnd` listener that calls `lenis.scrollTo(nearestSnap(...))`. ScrollTrigger's own `snap` would fight Lenis.

| Units | What moves | Ease |
|---|---|---|
| 0–30 (enter) | The load-chart arcs draw (DrawSVG). | `expo.out` |
| beat 0–30 % | The hook hoists the previous tag up out of frame (the rope shortens). | `power2.in` |
| beat 25–65 % | The photo rises out of the ground. The wrapper goes `yPercent 100 → 0` and the `<picture>` goes `−100 → 0`, so the image holds still while its window opens upward. | `expo.out` |
| beat 50–85 % | The hook lowers with the new tag and sets it down. The counter runs from the previous to the new capacity (`counterSteps`). | `expo.out` |
| beat 85–100 % | Hold. This is the snap point. | — |
| last beat 50–70 % / 70–85 % | The GMK6350 tag is set down. Then the hook lets go and settles onto the real hook in IMG_6389, at `[data-hook-anchor]`, which `hoist.ts` places with `hookToBox`. At (885, 1868) source px that is near the bottom of the photo, so the tag could not hang from it. | `expo.out` |
| out 30 | The hook and rope travel to the reading-start edge (the `.progress-rope` x) and fade out. The progress rope takes over (D.8). | `power2.inOut` |

- **Leaving desktop** (resize to < 1024 px, a touch pointer, or reduced motion): `Dispose`:
  - reverts every tween and restores the counters' text;
  - removes the rig, the runway, the class, the CSS variables and the margin;
  - refreshes ScrollTrigger.

  The DOM is then exactly as React rendered it.

- [ ] **Step 1: Add the failing test** — append to `src/motion/math.test.ts`

Add `nearestSnap` to the import list from `'./math'` at the top of the file, then append:

```ts
describe('nearestSnap', () => {
  it('returns the closest snap point to the current progress', () => {
    expect(nearestSnap([0, 0.25, 0.5, 1], 0.3)).toBe(0.25);
    expect(nearestSnap([0, 0.25, 0.5, 1], 0.4)).toBe(0.5);
    expect(nearestSnap([0, 0.25, 0.5, 1], 0.97)).toBe(1);
  });

  it('returns the progress itself when there are no points', () => {
    expect(nearestSnap([], 0.3)).toBe(0.3);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/motion/math.test.ts`
Expected: FAIL. `TypeError: nearestSnap is not a function` (or "does not provide an export named 'nearestSnap'"), and the other 17 tests pass.

- [ ] **Step 3: Append to `src/motion/math.ts`**

```ts
/** The snap point closest to `progress` (0–1). */
export function nearestSnap(points: number[], progress: number): number {
  return points.reduce((best, p) => (Math.abs(p - progress) < Math.abs(best - progress) ? p : best), points[0] ?? progress);
}
```

- [ ] **Step 4: Run it again**

Run: `npx vitest run src/motion/math.test.ts`
Expected: PASS, 19 tests.

- [ ] **Step 5: Append the staged Hoist block to `src/motion/motion.css`**

```css
/* The Hoist, desktop (D.5). hoist.ts adds .hoist--staged, the rig <li> and the runway <div>.
   The list becomes a sticky 100vh stage; nothing is pinned with a pin-spacer. */
.hoist--staged [data-hoist-list] {
  position: sticky;
  top: 0;
  display: block;
  block-size: 100vh;
  overflow: clip;
  padding: 0;
  list-style: none;
  background: var(--color-navy-950);
}
.hoist--staged [data-hoist-item] {
  position: absolute;
  inset: 0;
  display: block;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
}
/* Photo box = the top 76 % of the stage. Keep in sync with STAGE_PHOTO in hoist.ts. */
.hoist--staged [data-hoist-photo] {
  position: absolute;
  inset: 0 0 24% 0;
  inline-size: auto;
  block-size: auto;
  aspect-ratio: auto;
  margin: 0;
  overflow: clip;
}
.hoist--staged [data-hoist-photo] picture {
  display: block;
  inline-size: 100%;
  block-size: 100%;
}
.hoist--staged [data-hoist-photo] img {
  inline-size: 100%;
  block-size: 100%;
  max-inline-size: none;
  object-fit: cover;
  object-position: 50% 0;
}
/* The load tag hangs under the hook: its own 3.5rem rope (Part C) reaches up to the hook point.
   hoist.ts moves it with transforms only. */
.hoist--staged [data-load-tag] {
  position: absolute;
  left: var(--rope-x, 30%);
  top: calc(var(--hook-y, 20%) + 3.5rem);
  translate: -50% 0;
  margin: 0;
  z-index: 2;
}
/* The real hook, placed by hoist.ts from the image manifest (hookToBox). */
.hoist--staged [data-hook-anchor] {
  left: var(--hook-ax, -100vw) !important;
  top: var(--hook-ay, 0) !important;
}
.hoist-runway {
  display: block;
  pointer-events: none;
}
.hoist-rig {
  position: absolute;
  inset: 0;
  z-index: 3;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
}
.hoist-rig__curves {
  position: absolute;
  inset: 0 0 24% 0;
  inline-size: 100%;
  block-size: 76%;
  fill: none;
  stroke: rgb(255 255 255 / 0.18);
  stroke-width: 1px;
}
.hoist-rig__curves path,
.hoist-rig__rope line {
  vector-effect: non-scaling-stroke;
}
.hoist-rig__hook {
  position: absolute;
  left: var(--rope-x, 30%);
  top: var(--hook-y, 20%);
  inline-size: 0;
  block-size: 0;
}
.hoist-rig__rope {
  position: absolute;
  left: -1px;
  bottom: 40px;
  inline-size: 2px;
  block-size: 110vh;
  overflow: visible;
  stroke: var(--color-red);
  stroke-width: 2px;
}
.hoist-rig__block {
  position: absolute;
  left: -14px;
  top: -40px;
  inline-size: 28px;
  block-size: 40px;
  overflow: visible;
}
.hoist-rig__block rect {
  fill: var(--color-red);
}
.hoist-rig__block path {
  fill: none;
  stroke: var(--color-red);
  stroke-width: 3px;
  stroke-linecap: round;
}
```

- [ ] **Step 6: Write `src/motion/hoist.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '@/content/types';
import { cranes } from '@/content';
import { getImage, type CropName } from '@/generated/images';
import {
  HOIST,
  counterSteps,
  counterText,
  hoistPinLength,
  hoistPinUnits,
  hoistSnapPoints,
  hookToBox,
  nearestSnap,
  type Point,
  type Rect,
} from './math';
import { lenisRef, noop, type Dispose } from './shared';

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Share of the stage height given to the photo. Keep in sync with `inset: 0 0 24% 0` in motion.css. */
const STAGE_PHOTO = 0.76;
/** The crop Part C's Hoist <Picture> shows at ≥ 768 px (C.5: crop="desktop_16x9"). */
const HOIST_CROP: CropName = 'desktop_16x9';

interface ItemParts {
  item: HTMLElement;
  photo: HTMLElement | null;
  picture: HTMLElement | null;
  tag: HTMLElement | null;
  counter: HTMLElement | null;
  anchor: HTMLElement | null;
}

function partsOf(item: HTMLElement): ItemParts {
  const photo = item.querySelector<HTMLElement>('[data-hoist-photo]');
  return {
    item,
    photo,
    picture: photo?.querySelector<HTMLElement>('picture') ?? null,
    tag: item.querySelector<HTMLElement>('[data-load-tag]'),
    counter: item.querySelector<HTMLElement>('[data-counter]'),
    anchor: item.querySelector<HTMLElement>('[data-hook-anchor]'),
  };
}

interface CounterWriter {
  write(value: number): void;
  restore(): void;
}

/** Rewrites only the nodeValue of the counter's own text node; React's nodes are never replaced. */
function counterWriter(counter: HTMLElement | null, lang: Lang): CounterWriter {
  const node = counter?.firstChild ?? null;
  if (!node || node.nodeType !== Node.TEXT_NODE) return { write: () => {}, restore: () => {} };
  const final = node.nodeValue ?? '';
  return {
    write: (value) => {
      node.nodeValue = counterText(value, lang);
    },
    restore: () => {
      node.nodeValue = final;
    },
  };
}

/** The real hook in this item's photo (source pixels), when the crop has one and Part C rendered the anchor. */
function realHookOf(parts: ItemParts): { hook: Point; rect: Rect } | null {
  if (!parts.anchor) return null;
  const crane = cranes.find((c) => c.id === parts.item.dataset.crane);
  if (!crane) return null;
  try {
    const image = getImage(crane.hoistPhoto, HOIST_CROP);
    return image.hook ? { hook: image.hook, rect: image.rect } : null;
  } catch {
    return null;
  }
}

interface Rig {
  li: HTMLLIElement;
  hook: HTMLElement;
  curves: SVGPathElement[];
}

/** Motion-owned, decorative: faint load-chart arcs plus the rope and the hook block. */
function buildRig(rtl: boolean): Rig {
  const li = document.createElement('li');
  li.className = 'hoist-rig';
  li.setAttribute('aria-hidden', 'true');

  // Arcs about the bottom inline-end corner. No values, no axes: nothing reads as Atlas load data.
  const chart = document.createElementNS(SVG_NS, 'svg');
  chart.setAttribute('class', 'hoist-rig__curves');
  chart.setAttribute('viewBox', '0 0 1000 760');
  chart.setAttribute('preserveAspectRatio', rtl ? 'xMinYMax slice' : 'xMaxYMax slice');
  const curves = [260, 420, 580, 740].map((r) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', rtl ? `M ${r} 760 A ${r} ${r} 0 0 0 0 ${760 - r}` : `M ${1000 - r} 760 A ${r} ${r} 0 0 1 1000 ${760 - r}`);
    chart.append(path);
    return path;
  });

  // One zero-size point: the rope runs up past the top edge, the block hangs just above the point.
  const hook = document.createElement('div');
  hook.className = 'hoist-rig__hook';
  hook.innerHTML =
    '<svg class="hoist-rig__rope" viewBox="0 0 2 100" preserveAspectRatio="none"><line x1="1" y1="0" x2="1" y2="100"/></svg>' +
    '<svg class="hoist-rig__block" viewBox="0 0 28 40"><rect x="7" y="0" width="14" height="14" rx="1"/><path d="M14 14v9a7 7 0 1 1-7 7"/></svg>';

  li.append(chart, hook);
  return { li, hook, curves };
}

/** The Hoist, desktop (spec §5.3). One sticky, scrubbed stage that snaps to each crane. */
export function hoistDesktop(section: HTMLElement, lang: Lang, rtl: boolean): Dispose {
  const list = section.querySelector<HTMLElement>('[data-hoist-list]');
  const host = list?.parentElement ?? null;
  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-hoist-item]'));
  if (!list || !host || items.length === 0) return noop;

  const parts = items.map(partsOf);
  const writers = parts.map((p) => counterWriter(p.counter, lang));
  const steps = counterSteps(items.map((el) => Number(el.dataset.capacity ?? 0)));
  const snaps = hoistSnapPoints(items.length);
  const last = parts[parts.length - 1];
  const lastHook = realHookOf(last);

  // Static staging, set once.
  section.classList.add('hoist--staged');
  const rig = buildRig(rtl);
  list.append(rig.li);
  const runway = document.createElement('div');
  runway.className = 'hoist-runway';
  runway.setAttribute('aria-hidden', 'true');
  runway.style.blockSize = `${hoistPinUnits(items.length)}vh`;
  list.after(runway);

  // Geometry in px; re-measured at the start of every ScrollTrigger refresh.
  const geo = { h: 0, ropeX: 0, hookY: 0, lastDx: 0, lastDy: 0, exitDx: 0, tail: 0 };
  const measure = () => {
    // Content after the runway (footnote, closing button) must not pass unseen under the stuck stage:
    // a bottom margin of the same height releases the stage just before that content arrives.
    list.style.marginBlockEnd = '0px';
    const hostEnd = host.getBoundingClientRect().bottom - parseFloat(getComputedStyle(host).paddingBlockEnd || '0');
    geo.tail = Math.max(0, Math.round(hostEnd - runway.getBoundingClientRect().bottom));
    list.style.marginBlockEnd = `${geo.tail}px`;

    const w = list.clientWidth;
    geo.h = list.clientHeight;
    geo.ropeX = Math.round(w * (rtl ? 0.7 : 0.3)); // the rope hangs in the reading-start third
    geo.hookY = Math.round(geo.h * STAGE_PHOTO * 0.26);
    list.style.setProperty('--rope-x', `${geo.ropeX}px`);
    list.style.setProperty('--hook-y', `${geo.hookY}px`);

    geo.lastDx = 0;
    geo.lastDy = 0;
    if (lastHook) {
      const p = hookToBox(lastHook.hook, lastHook.rect, { width: w, height: geo.h * STAGE_PHOTO });
      last.item.style.setProperty('--hook-ax', `${p.x}px`);
      last.item.style.setProperty('--hook-ay', `${p.y}px`);
      geo.lastDx = p.x - geo.ropeX;
      geo.lastDy = p.y - geo.hookY;
    }

    const rope = document.querySelector<HTMLElement>('[data-progress-rope]');
    const stageLeft = list.getBoundingClientRect().left;
    geo.exitDx = rope ? rope.getBoundingClientRect().left - stageLeft - geo.ropeX : rtl ? w - geo.ropeX : -geo.ropeX;
  };
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);

  // The stage's document top, from the (non-sticky) runway: runway top − margin − stage height.
  const stageTop = () => runway.getBoundingClientRect().top + window.scrollY - geo.tail - list.offsetHeight;
  const up = () => -geo.h; // fully above the stage
  let st: ScrollTrigger | undefined;

  const ctx = gsap.context(() => {
    // Start: every load above the frame, every photo below the ground.
    gsap.set(rig.hook, { x: 0, y: up, opacity: 1 });
    gsap.set(rig.curves, { drawSVG: '0% 0%' });
    for (const p of parts) {
      if (p.tag) gsap.set(p.tag, { y: up });
      if (p.photo && p.picture) {
        gsap.set(p.photo, { yPercent: 100 });
        gsap.set(p.picture, { yPercent: -100 });
      }
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none', immediateRender: false },
      scrollTrigger: {
        start: () => stageTop(),
        end: () => stageTop() + hoistPinLength(items.length, window.innerHeight),
        scrub: 0.6,
        invalidateOnRefresh: true,
        refreshPriority: 1,
      },
    });
    st = tl.scrollTrigger;

    // Enter (0–30): the faint load-chart arcs draw.
    tl.fromTo(rig.curves, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 24, stagger: 2, ease: 'expo.out' }, 0);

    parts.forEach((p, i) => {
      const s = HOIST.inUnits + i * HOIST.beatUnits;
      const b = HOIST.beatUnits;
      const prev = parts[i - 1];
      const landsOnRealHook = i === parts.length - 1 && lastHook !== null;

      // 0–30 %: the hook hoists the previous tag out of frame.
      if (prev) {
        tl.fromTo(rig.hook, { x: 0, y: 0 }, { x: 0, y: up, duration: b * 0.3, ease: 'power2.in' }, s);
        if (prev.tag) tl.fromTo(prev.tag, { y: 0 }, { y: up, duration: b * 0.3, ease: 'power2.in' }, s);
      }

      // 25–65 %: the photo rises out of the ground (transform-only shutter).
      if (p.photo && p.picture) {
        tl.fromTo(p.photo, { yPercent: 100 }, { yPercent: 0, duration: b * 0.4, ease: 'expo.out' }, s + b * 0.25);
        tl.fromTo(p.picture, { yPercent: -100 }, { yPercent: 0, duration: b * 0.4, ease: 'expo.out' }, s + b * 0.25);
      }

      // 50–85 % (last crane: 50–70 %): the hook lowers with the new tag and sets it down; the counter runs.
      const at = s + b * 0.5;
      const lower = landsOnRealHook ? b * 0.2 : b * (HOIST.setDownAt - 0.5);
      tl.fromTo(rig.hook, { x: 0, y: up }, { x: 0, y: 0, duration: lower, ease: 'expo.out' }, at);
      if (p.tag) tl.fromTo(p.tag, { y: up }, { y: 0, duration: lower, ease: 'expo.out' }, at);
      const proxy = { value: steps[i].from };
      tl.fromTo(
        proxy,
        { value: steps[i].from },
        { value: steps[i].to, duration: b * (HOIST.setDownAt - 0.5), ease: 'expo.out', onUpdate: () => writers[i].write(proxy.value) },
        at,
      );

      // Last crane, 70–85 %: the hook lets go of the tag and settles on the real hook in the photo.
      if (landsOnRealHook) {
        tl.fromTo(rig.hook, { x: 0, y: 0 }, { x: () => geo.lastDx, y: () => geo.lastDy, duration: b * 0.15, ease: 'expo.out' }, s + b * 0.7);
      }
    });

    // Out (30): the rope travels to the reading-start edge and hands over to the progress rope.
    tl.fromTo(
      rig.hook,
      { x: () => geo.lastDx, y: () => geo.lastDy, opacity: 1 },
      { x: () => geo.exitDx, opacity: 0, duration: HOIST.outUnits, ease: 'power2.inOut' },
      HOIST.inUnits + parts.length * HOIST.beatUnits,
    );
  });

  // Snap to the nearest crane once scrolling stops inside the stage.
  const snap = () => {
    if (!st || !st.isActive) return;
    const target = nearestSnap(snaps, st.progress);
    const distance = Math.abs(target - st.progress) * (st.end - st.start);
    if (distance <= 4) return;
    const y = st.start + (st.end - st.start) * target;
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 0.5 });
    else window.scrollTo({ top: y });
  };
  ScrollTrigger.addEventListener('scrollEnd', snap);

  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  return () => {
    ScrollTrigger.removeEventListener('scrollEnd', snap);
    ScrollTrigger.removeEventListener('refreshInit', measure);
    ctx.revert();
    writers.forEach((w) => w.restore());
    rig.li.remove();
    runway.remove();
    section.classList.remove('hoist--staged');
    for (const name of ['--rope-x', '--hook-y', 'margin-block-end']) list.style.removeProperty(name);
    for (const name of ['--hook-ax', '--hook-ay']) last.item.style.removeProperty(name);
    ScrollTrigger.refresh();
  };
}
```

- [ ] **Step 7: Wire the lazy loader into `src/motion/core.ts`**

Replace the `./shared` import line with:

```ts
import { lenisRef, noop, runAll, safely, whenNear, type Dispose, type MotionEnv, type MotionModule } from './shared';
```

Add this function directly above `const DESKTOP`:

```ts
/** The Hoist chunk loads when #cranes is within one viewport (C10). */
const hoistLazy: MotionModule = (env) => {
  const section = document.querySelector<HTMLElement>('[data-hoist]');
  if (!section) return noop;
  let dispose: Dispose = noop;
  let alive = true;
  const stop = whenNear(section, () => {
    import('./hoist')
      .then((m) => {
        if (!alive) return;
        try {
          dispose = m.hoistDesktop(section, env.lang, env.rtl);
        } catch (error) {
          console.error('[motion] hoist', error);
        }
      })
      .catch((error: unknown) => console.error('[motion] hoist', error));
  });
  return () => {
    alive = false;
    stop();
    dispose();
  };
};
```

Replace the desktop list:

```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro, heroDock];
```
```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro, heroDock, hoistLazy];
```

- [ ] **Step 8: Run the checks**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected:
- All tests pass (math: 19), and `tsc` prints nothing.
- The build lists a **separate** `assets/hoist-<hash>.js` chunk (a few KB gzip), apart from `core-<hash>.js`.

- [ ] **Step 9: Manual check (browser preview, desktop 1440, then `/en/`)**

1. **Sticky works:** paste this into the console. Expected `[]` (an ancestor with `overflow: hidden/auto/scroll` would break sticky):
   ```js
   (() => { const bad = []; let el = document.querySelector('[data-hoist-list]').parentElement; while (el) { const s = getComputedStyle(el); if (/hidden|auto|scroll/.test(s.overflowX + s.overflowY)) bad.push(el); el = el.parentElement; } return bad; })()
   ```
2. **Scroll into Cranes:**
   - The heading and intro scroll normally, then the navy stage sticks to the top. The faint arcs draw in the bottom corner on the inline-end side (left in AR, right in EN).
   - The Grove RT700E photo opens upward from the bottom: the image itself does not slide.
   - The rope and red hook lower from the top with the white tag on its own short rope. The tag shows capacity, model and type, and its counter runs 0 → 55.
3. **Snap:** stop scrolling halfway through a beat. About 0.3 s later the page eases to the nearest crane, or to the start or end of the stage.
4. **Next beats:** the hook hoists the old tag out (the rope shortens), the next photo opens upward, and the new tag is set down. The counters run 55 → 60, 60 → 200, 200 → 250 and 250 → 350, with tabular digits and no change in width.
5. **Last beat:** the GMK6350 tag is set down, then the red hook block lets go and settles on the real hook in IMG_6389, low in the photo. In the console, the distance between the hook block's bottom point and `[data-hook-anchor]` is under 4 px:
   ```js
   (() => { const a = document.querySelector('.hoist--staged [data-hook-anchor]').getBoundingClientRect(); const h = document.querySelector('.hoist-rig__hook').getBoundingClientRect(); return Math.hypot(a.left - h.left, a.top - h.top); })()
   ```
   Check at 1024, 1280, 1440 and 1920 wide.
6. **Exit:** the rope and hook slide to the reading-start edge and fade. The stage releases, and the footnote and the closing button scroll in **below** it. They are never hidden under the stage. With D.8 done, the 1 px progress rope appears at that edge.
7. **Reverse:** scroll back up through the whole stage. Every beat reverses cleanly, and the counters show the right numbers at each snap.
8. **Keyboard:** Tab from the hero. The Hoist's "skip to all cranes" link appears, and Enter jumps to `#crane-list` past the stage.
9. **Accessibility pane:** the `<ol>` is announced as "list, 5 items" (the rig `<li>` is aria-hidden). Each tag's capacity, model and type are present.
10. **Leaving desktop:** drag the window to 900 px wide in the middle of the stage.
    - The stage disappears and Part C's static stack returns.
    - `document.querySelector('.hoist--staged, .hoist-rig, .hoist-runway')` → `null`.
    - `document.querySelector('[data-hoist-list]').style.cssText` → `''`.
    - Every counter shows its final number.
    - `[...document.querySelectorAll('[data-hoist-photo], [data-load-tag]')].map(e => e.style.transform)` → all `''`.
    - Drag back to 1440: the stage rebuilds.
11. **Reduced:** emulate `reduce` and reload. The static stack shows final numbers, with no stage, rig or runway.
12. **Performance:** record a scroll through the whole stage with CPU 4× slowdown. There are no long tasks over 50 ms during the scroll, and the "Layout shifts" track is empty.

- [ ] **Step 10: Commit**

```bash
git add src/motion/math.ts src/motion/math.test.ts src/motion/hoist.ts src/motion/core.ts src/motion/motion.css
git commit -m "$(cat <<'MSG'
feat(motion): the Hoist desktop stage with rope, five loads, counters and real-hook landing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---

### Task D.6: Touch "load stack" — each crane is set down once

**Files:**
- Modify: `src/motion/hoist.ts` (append `hoistTouch`)
- Modify: `src/motion/core.ts` (the lazy loader picks desktop or touch)

**Behaviour (concept §2 "Mobile version", spec §5.3 "Touch or < 1024 px"):**
- No sticky stage and no scrub. For each card, once, when its top reaches 80 % of the viewport:
  - the photo opens upward from the bottom: the same transform-only shutter, 0.7 s, `expo.out`. Part C's `[data-hoist-photo]` is already `overflow-hidden`;
  - the tag, which hangs on its own short red rope (Part C), drops 40 px and settles 2° about the top of that rope (`transformOrigin: 50% -3.5rem`), 0.6 s, `expo.out`;
  - the counter runs from the previous crane's capacity to its own (0.8 s).
- Cards already on screen when motion starts are left exactly as rendered.
- The tag stays visible throughout: it is displaced, never faded. Motion adds no nodes here and needs no CSS.

- [ ] **Step 1: Append `hoistTouch` to `src/motion/hoist.ts`**

```ts
/** Touch / narrow: the "load stack". Each card plays once as it comes into view. */
export function hoistTouch(section: HTMLElement, lang: Lang): Dispose {
  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-hoist-item]'));
  if (items.length === 0) return noop;
  const parts = items.map(partsOf);
  const writers = parts.map((p) => counterWriter(p.counter, lang));
  const steps = counterSteps(items.map((el) => Number(el.dataset.capacity ?? 0)));

  const ctx = gsap.context(() => {
    parts.forEach((p, i) => {
      // Already on screen when motion starts: leave it exactly as React rendered it.
      if (p.item.getBoundingClientRect().top < window.innerHeight * 0.8) return;

      const tl = gsap.timeline({ paused: true, onComplete: () => writers[i].restore() });
      if (p.photo && p.picture) {
        tl.fromTo(p.photo, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', immediateRender: true }, 0);
        tl.fromTo(p.picture, { yPercent: -100 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', immediateRender: true }, 0);
      }
      if (p.tag) {
        // The tag swings from the top of its own 3.5rem rope, i.e. from the hook.
        tl.fromTo(
          p.tag,
          { y: -40, rotation: 2, transformOrigin: '50% -3.5rem' },
          { y: 0, rotation: 0, duration: 0.6, ease: 'expo.out', immediateRender: true },
          0.3,
        );
      }
      if (p.counter) {
        const proxy = { value: steps[i].from };
        writers[i].write(steps[i].from);
        tl.to(proxy, { value: steps[i].to, duration: 0.8, ease: 'expo.out', onUpdate: () => writers[i].write(proxy.value) }, 0.35);
      }
      ScrollTrigger.create({ trigger: p.item, start: 'top 80%', once: true, onEnter: () => tl.play() });
    });
  });

  return () => {
    ctx.revert();
    writers.forEach((w) => w.restore());
  };
}
```

- [ ] **Step 2: Let the lazy loader serve both contexts** — in `src/motion/core.ts`, replace the whole `hoistLazy` constant with:

```ts
/** The Hoist chunk loads when #cranes is within one viewport (C10): the stage on desktop, the load stack on touch. */
function hoistLazy(kind: 'desktop' | 'touch'): MotionModule {
  return (env) => {
    const section = document.querySelector<HTMLElement>('[data-hoist]');
    if (!section) return noop;
    let dispose: Dispose = noop;
    let alive = true;
    const stop = whenNear(section, () => {
      import('./hoist')
        .then((m) => {
          if (!alive) return;
          try {
            dispose = kind === 'desktop' ? m.hoistDesktop(section, env.lang, env.rtl) : m.hoistTouch(section, env.lang);
          } catch (error) {
            console.error('[motion] hoist', error);
          }
        })
        .catch((error: unknown) => console.error('[motion] hoist', error));
    });
    return () => {
      alive = false;
      stop();
      dispose();
    };
  };
}
```

Replace the lists:

```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro, heroDock, hoistLazy];
```
```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro, heroDock, hoistLazy('desktop')];
```

```ts
const TOUCH: MotionModule[] = [heroIntro, heroDock];
```
```ts
const TOUCH: MotionModule[] = [heroIntro, heroDock, hoistLazy('touch')];
```

- [ ] **Step 3: Run the checks**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected: all pass. The `hoist-<hash>.js` chunk is still separate.

- [ ] **Step 4: Manual check (device toolbar, iPhone 12 Pro 390 px, reload; then 768 px tablet, reload)**

1. Scroll to Cranes. As each card's top reaches about four-fifths of the screen:
   - its photo opens upward from the bottom;
   - the white tag drops on its short red rope and settles with a small 2° swing about the rope's top;
   - the counter runs from the previous capacity to its own.

   Each card plays once: scrolling up and down again does not replay it.
2. After it finishes, each counter shows its final number, and no element in the Hoist keeps an inline `transform` other than `none`/empty.
3. Reload with the page scrolled so that the second card is already in view. That card is static, and the cards below still play.
4. Rotate the device toolbar to landscape (844 × 390). Nothing breaks, and no card is left half-played.
5. At 1024 px wide with the device toolbar's touch emulation on (coarse pointer), reload: the load stack runs, not the sticky stage.
6. **Reduced:** the static stack shows final numbers, with no movement.
7. **Desktop regression:** at 1440 with a mouse, reload. The D.5 stage still works.

- [ ] **Step 5: Commit**

```bash
git add src/motion/hoist.ts src/motion/core.ts
git commit -m "$(cat <<'MSG'
feat(motion): touch load stack where each crane is set down once

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---

### Task D.7: The ride — the chosen crane rides the hook into the bar

**Files:**
- Create: `src/motion/ride.ts`
- Modify: `src/motion/core.ts` (add `startRide` to both contexts)

**Behaviour (spec §5.5 "Pressing it"):**
- Part B's `setRequestedCrane(id, source)` updates the store and then dispatches `HOOK_EVENT` with `{ craneId, source }`. React renders `[data-bar-chip]` with the model.
- `ride.ts` waits a frame (and up to 10 frames) for that chip, then:
  - clones **the bar chip itself** (so the flying chip shows exactly the model text that will land), placed centred on the pressed card button;
  - flies it along a slight arc into the chip: `x` with `power2.inOut` and `y` with `power2.in` over 0.7 s, so the path bows like a load swinging in;
  - removes the clone.
- The real chip is `opacity 0` while the clone flies, and shown when it lands.
- Clearing (`craneId: null`) or a missing `source` does nothing.
- This module is not registered in the reduced context, so the chip just appears.

- [ ] **Step 1: Write `src/motion/ride.ts`**

```ts
import { gsap } from 'gsap';
import { HOOK_EVENT, type HookEventDetail } from '@/lib/request';
import { makeGhost } from './ghost';
import { centerOn } from './math';
import type { MotionModule } from './shared';

/** "Request this crane" → a ghost of the model chip rides the hook from the card into the bar. */
export const startRide: MotionModule = () => {
  let ghost: HTMLElement | null = null;
  let flight: gsap.core.Timeline | null = null;
  let chipShown: HTMLElement | null = null;
  let frame = 0;

  const land = () => {
    flight?.kill();
    flight = null;
    ghost?.remove();
    ghost = null;
    if (chipShown) gsap.set(chipShown, { clearProps: 'opacity' });
    chipShown = null;
  };

  const fly = (chip: HTMLElement, from: DOMRect) => {
    land();
    const to = chip.getBoundingClientRect();
    const start = centerOn(from, to);
    ghost = makeGhost(chip, start);
    chipShown = chip;
    gsap.set(chip, { opacity: 0 });
    flight = gsap
      .timeline({ onComplete: land })
      .to(ghost, { x: to.left - start.left, duration: 0.7, ease: 'power2.inOut' }, 0)
      .to(ghost, { y: to.top - start.top, duration: 0.7, ease: 'power2.in' }, 0)
      .fromTo(ghost, { scale: 1.06 }, { scale: 1, duration: 0.7, ease: 'expo.out' }, 0);
  };

  const onHook = (event: Event) => {
    const { craneId, source } = (event as CustomEvent<HookEventDetail>).detail;
    cancelAnimationFrame(frame);
    if (!craneId || !source || !source.isConnected) return;
    const from = source.getBoundingClientRect();
    let tries = 0;
    // Wait for React to render the chip (normally the next frame).
    const waitForChip = () => {
      const chip = document.querySelector<HTMLElement>('[data-bar-chip]');
      if (chip && chip.getBoundingClientRect().width > 0) {
        fly(chip, from);
        return;
      }
      if (++tries < 10) frame = requestAnimationFrame(waitForChip);
    };
    frame = requestAnimationFrame(waitForChip);
  };

  window.addEventListener(HOOK_EVENT, onHook);
  return () => {
    window.removeEventListener(HOOK_EVENT, onHook);
    cancelAnimationFrame(frame);
    land();
  };
};
```

- [ ] **Step 2: Wire it into `src/motion/core.ts`**

Add the import below the hero import:

```ts
import { startRide } from './ride';
```

Replace the lists:

```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro, heroDock, hoistLazy('desktop')];
```
```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro, heroDock, startRide, hoistLazy('desktop')];
```

```ts
const TOUCH: MotionModule[] = [heroIntro, heroDock, hoistLazy('touch')];
```
```ts
const TOUCH: MotionModule[] = [heroIntro, heroDock, startRide, hoistLazy('touch')];
```

- [ ] **Step 3: Run the checks**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected: all pass.

- [ ] **Step 4: Manual check (browser preview)**

1. **Desktop 1440, `/`:** scroll to the crane grid and press "Request this crane" (اطلب هذه الرافعة) on GMK6350.
   - A chip reading `GMK6350` leaves the button and swings along a gentle curve into the bar in about 0.7 s.
   - The bar reads «على الخطّاف: GMK6350 · واتساب» with the clear control.
   - During the flight Elements shows exactly one `.motion-ghost`, and none after.
2. **Another crane:** press another card's button. The chip text changes and the flight starts from the new card. Press two buttons within 0.3 s: only one ghost exists at a time, and the chip ends fully visible.
3. **Clear** (the bar's close icon): the chip disappears with no flight.
4. **Header and form are unaffected:** choosing a crane in the form's crane field (if Part C wires it to `setRequestedCrane` with no `source`) shows the chip with no flight.
5. **Keyboard:** Tab to a card button and press Enter. Same flight. Focus stays on the card button.
6. **Touch 390 px, reload:** same flight, ending in the mobile bar.
7. **Reduced:** the chip appears in the bar at once, with no ghost.
8. **QA selectors:** `document.querySelectorAll('[data-testid="bar-chip"]').length` → `1` during and after the flight.

- [ ] **Step 5: Commit**

```bash
git add src/motion/ride.ts src/motion/core.ts
git commit -m "$(cat <<'MSG'
feat(motion): the chosen crane rides the hook into the request bar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---
### Task D.8: Service set-down, service sling, progress rope, footer pad and back-to-top hoist

**Scope (spec §15.4):** these are the only effects outside the hero, the Hoist and the ride. There is **no generic reveal**: Part D never touches `[data-reveal]`, section headings, the grid, the sites strip or the documents. Every effect here starts from an **already-visible** element and uses `expo.out`.

**Files:**
- Create: `src/motion/reveal.ts` (`startServiceSetDown`, `startServiceSlings`)
- Create: `src/motion/rope.ts` (`startProgressRope`, `startFooterPad`, `startBackToTop`)
- Modify: `src/motion/core.ts` (final module lists)
- Modify: `src/motion/motion.css` (append the service-sling block)

**Behaviour:**

| Effect | Contexts | What happens |
|---|---|---|
| Service rows set down (spec §5.4) | desktop, touch | Rows below the fold start 16 px high, fully visible. On entry (`top 85%`), they settle (`y −16 → 0`), 1 s `expo.out`, stagger 0.1. Rows already on screen are untouched. |
| Service sling (spec §5.4) | desktop | On hover or focus of a row, a short red-bright sagging line (an SVG owned by motion, aria-hidden) draws from the progress rope to the row's reading-start edge, 0.45 s. It retracts on leave or blur. |
| Progress rope (spec §5.3 exit) | desktop | `[data-progress-rope]` `scaleY` = page scroll progress (scrub 0.3). It goes `.is-live` (fades in) once `#services` enters the viewport, which is where the Hoist's rope hands over. |
| Footer pad (spec §5.9) | desktop, touch | `[data-footer-pad]` (contract addition) starts 12 px high, visible. When the footer enters (`top 95%`), it is set down, 0.9 s `expo.out`. |
| Back to top (spec §5.9) | desktop, touch | Click `[data-back-to-top]`: its hook icon lifts 8 px and drops back (0.44 s). On desktop, `preventDefault` + `lenis.scrollTo(0)`, then `#top` goes into the URL and focus moves to the first header control. On touch, the browser follows `href="#top"` natively. Reduced: native and instant, since no module runs. |

- [ ] **Step 1: Append the service-sling block to `src/motion/motion.css`**

```css
/* Services (D.8): the hover/focus sling from the progress rope to the row, desktop only. */
html[data-motion="desktop"] [data-service-row] {
  position: relative;
}
.service-sling {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: calc(-1 * var(--sling-reach, 0px));
  inline-size: var(--sling-reach, 0px);
  block-size: 1.5rem;
  margin-block-start: -0.75rem;
  overflow: visible;
  pointer-events: none;
  fill: none;
  stroke: var(--color-red-bright);
  stroke-width: 1.5px;
  stroke-linecap: round;
}
.service-sling path {
  vector-effect: non-scaling-stroke;
}
/* The path is drawn rope-side first; in RTL the rope is on the right. */
[dir="rtl"] .service-sling {
  transform: scaleX(-1);
}
```

- [ ] **Step 2: Write `src/motion/reveal.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { noop, type Dispose, type MotionModule } from './shared';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Service rows are "set down" as they enter (spec §5.4). Visible throughout: only a 16 px settle. */
export const startServiceSetDown: MotionModule = () => {
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-service-row]'));
  // Rows already on screen when motion starts stay exactly as rendered.
  const below = rows.filter((row) => row.getBoundingClientRect().top > window.innerHeight);
  if (below.length === 0) return noop;
  const ctx = gsap.context(() => {
    gsap.set(below, { y: -16 });
    ScrollTrigger.batch(below, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, duration: 1, ease: 'expo.out', stagger: 0.1, overwrite: true });
      },
    });
  });
  return () => ctx.revert();
};

/** Desktop: hovering or focusing a service row draws a short sling from the progress rope to the row. */
export const startServiceSlings: MotionModule = ({ rtl }) => {
  const rope = document.querySelector<HTMLElement>('[data-progress-rope]');
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-service-row]'));
  if (!rope || rows.length === 0) return noop;

  const measure = () => {
    const ropeX = rope.getBoundingClientRect().left;
    for (const row of rows) {
      const r = row.getBoundingClientRect();
      const reach = Math.max(0, Math.round(rtl ? ropeX - r.right : r.left - ropeX));
      row.style.setProperty('--sling-reach', `${reach}px`);
    }
  };

  const offs: Dispose[] = rows.map((row) => {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'service-sling');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 100 24');
    svg.setAttribute('preserveAspectRatio', 'none');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M0 6 Q50 22 100 12'); // rope side (x 0) → row side (x 100), with a little sag
    svg.append(path);
    row.append(svg);
    gsap.set(path, { drawSVG: '0% 0%' });

    const show = () => {
      gsap.to(path, { drawSVG: '0% 100%', duration: 0.45, ease: 'expo.out', overwrite: true });
    };
    const hide = (event: Event) => {
      if (event instanceof FocusEvent && event.relatedTarget instanceof Node && row.contains(event.relatedTarget)) return;
      gsap.to(path, { drawSVG: '0% 0%', duration: 0.25, ease: 'power2.in', overwrite: true });
    };
    row.addEventListener('pointerenter', show);
    row.addEventListener('pointerleave', hide);
    row.addEventListener('focusin', show);
    row.addEventListener('focusout', hide);

    return () => {
      row.removeEventListener('pointerenter', show);
      row.removeEventListener('pointerleave', hide);
      row.removeEventListener('focusin', show);
      row.removeEventListener('focusout', hide);
      gsap.killTweensOf(path);
      svg.remove();
      row.style.removeProperty('--sling-reach');
    };
  });

  measure();
  ScrollTrigger.addEventListener('refresh', measure);
  return () => {
    ScrollTrigger.removeEventListener('refresh', measure);
    offs.forEach((off) => off());
  };
};
```

- [ ] **Step 3: Write `src/motion/rope.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenisRef, noop, type MotionModule } from './shared';

/** Desktop: a 1 px rope on the reading-start edge whose length is the page's scroll progress. */
export const startProgressRope: MotionModule = () => {
  const rope = document.querySelector<HTMLElement>('[data-progress-rope]');
  if (!rope) return noop;
  // The Hoist's rope hands over here (D.5 exit). Without a Services section, go live after the Hoist.
  const handover = document.getElementById('services') ?? document.getElementById('cranes');
  const ctx = gsap.context(() => {
    gsap.fromTo(rope, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    if (handover) {
      ScrollTrigger.create({ trigger: handover, start: 'top bottom', end: 'max', toggleClass: { targets: rope, className: 'is-live' } });
    }
  });
  return () => {
    ctx.revert();
    rope.classList.remove('is-live');
  };
};

/** The rope ends at the outrigger pad: the pad is set down as the footer arrives (spec §5.9). */
export const startFooterPad: MotionModule = () => {
  const pad = document.querySelector<HTMLElement | SVGElement>('[data-footer-pad]');
  if (!pad || pad.getBoundingClientRect().top < window.innerHeight) return noop;
  const ctx = gsap.context(() => {
    gsap.set(pad, { y: -12 });
    ScrollTrigger.create({
      trigger: pad,
      start: 'top 95%',
      once: true,
      onEnter: () => {
        gsap.to(pad, { y: 0, duration: 0.9, ease: 'expo.out' });
      },
    });
  });
  return () => ctx.revert();
};

/** "Back to top" is a hook that hoists you up: the icon lifts; on desktop Lenis glides to 0. */
export const startBackToTop: MotionModule = () => {
  const onClick = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-back-to-top]') : null;
    if (!link) return;
    const icon = link.querySelector('svg') ?? link;
    gsap.fromTo(icon, { y: 0 }, { y: -8, duration: 0.22, ease: 'power2.in', yoyo: true, repeat: 1, clearProps: 'transform' });

    const lenis = lenisRef.current;
    if (!lenis) return; // touch: the browser follows href="#top" itself
    event.preventDefault();
    lenis.scrollTo(0, {
      duration: 1.4,
      onComplete: () => {
        history.replaceState(null, '', '#top');
        document.querySelector<HTMLElement>('[data-header] a[href], [data-header] button')?.focus({ preventScroll: true });
      },
    });
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
};
```

Note: Lenis's own `anchors` handler may also see this click. Both target scroll position 0, so the result is the same.

- [ ] **Step 4: Final module lists in `src/motion/core.ts`**

Add the imports below the ride import:

```ts
import { startServiceSetDown, startServiceSlings } from './reveal';
import { startBackToTop, startFooterPad, startProgressRope } from './rope';
```

Replace the lists:

```ts
const DESKTOP: MotionModule[] = [startLenis, heroIntro, heroDock, startRide, hoistLazy('desktop')];
```
```ts
const DESKTOP: MotionModule[] = [
  startLenis,
  heroIntro,
  heroDock,
  startProgressRope,
  startServiceSetDown,
  startServiceSlings,
  startFooterPad,
  startBackToTop,
  startRide,
  hoistLazy('desktop'),
];
```

```ts
const TOUCH: MotionModule[] = [heroIntro, heroDock, startRide, hoistLazy('touch')];
```
```ts
const TOUCH: MotionModule[] = [heroIntro, heroDock, startServiceSetDown, startFooterPad, startBackToTop, startRide, hoistLazy('touch')];
```

- [ ] **Step 5: Run the checks**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected: all pass.

Then run: `grep -rn "data-reveal" src/motion`
Expected: no output. Part D does not animate generic reveals (spec §15.4).

- [ ] **Step 6: Manual check (browser preview)**

1. **Progress rope, desktop 1440, `/`:**
   - From the top, no rope is visible.
   - As the Hoist exits and Services enters, a 1 px red line fades in on the reading-start edge (right in AR, left in EN), just where the Hoist's rope slid to.
   - Its length follows the scroll: about half the screen height at mid-page, full height at the footer.
   - Scroll back above Services and it fades out.
2. **Service rows:** scroll into Services from above. The rows, visible as they arrive, settle a few pixels down onto their lines one after another. Nothing fades. Reload with Services on screen: the rows are static.
3. **Service sling:** hover each row. A short red-bright sagging line draws from the progress rope to the row's start edge and retracts on leave. If a row has a focusable link, focusing it with Tab draws the line too. In `/en/` the line runs left; in `/` it runs right.
4. **Static elsewhere:** scroll the whole page. Section headings, the grid, the sites strip and the documents never move.
5. **Footer pad:** scroll to the end. The outrigger pad is set down 12 px as the footer appears, and the rope (desktop) reaches the bottom edge.
6. **Back to top, desktop:** click the hook icon.
   - The icon lifts and drops.
   - The page glides to the top in about 1.4 s.
   - The URL ends with `#top`.
   - Pressing Enter on the link with the keyboard leaves a visible focus ring on the first header control.
7. **Touch 390 px, reload:**
   - There is no rope and no service sling.
   - Service rows and the pad still settle.
   - Back to top jumps natively, and the icon lifts.
8. **Reduced:** no rope, no settle, no lift. Back to top jumps instantly.

- [ ] **Step 7: Commit**

```bash
git add src/motion/reveal.ts src/motion/rope.ts src/motion/core.ts src/motion/motion.css
git commit -m "$(cat <<'MSG'
feat(motion): service set-down and sling, progress rope, footer pad and back-to-top hoist

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---
### Task D.9 (OPTIONAL STRETCH — only if Day 8 starts on schedule): the "your lift" sketch

> **Skip this whole task** if D.1–D.8 are not all committed by the start of Day 8. Nothing else depends on it, and Gate I2 and Part E work without it.

**What it is (spec §5.8 stretch, concept §5 recommendation):**
- A small SVG in the request section draws a crane silhouette: a pivot, a boom, a rope and the hook with a load block. The boom reaches to the **radius** and **lift height** typed into the form, and the load block grows with the **weight** on a log scale.
- Labels show only the user's own numbers (`formatTonnes`, `formatMetres`). There are no axes, no capacities and no advice. It is an illustration only.
- It is information, not decoration, so it also updates under reduced motion, but instantly (duration 0).
- It is aria-hidden, because the same values are already in the labelled inputs.

**Contract addition:** `<div data-lift-sketch aria-hidden="true">` inside `#request`, with a fixed 8:5 box so it never shifts layout. This task adds it to Part C's `RequestForm.tsx`.

**Files:**
- Modify: `src/motion/math.test.ts`, `src/motion/math.ts` (add `liftSketch`, TDD)
- Create: `src/motion/sketch.ts`
- Modify: `src/sections/RequestForm.tsx` (add the container)
- Modify: `src/motion/core.ts` (lazy-load the sketch in every mode)
- Modify: `src/motion/motion.css` (append the sketch block)

- [ ] **Step 1: Add the failing test** — add `liftSketch` to the import list in `src/motion/math.test.ts`, then append:

```ts
describe('liftSketch (illustration only, 320×200 viewBox, pivot 40,180)', () => {
  it('draws a default lift when nothing is entered', () => {
    const g = liftSketch({ weight: null, radius: null, height: null });
    expect(g.hookX).toBeGreaterThan(40);
    expect(g.hookY).toBeLessThan(180);
    expect(g.loadScale).toBeCloseTo(0.6, 10);
  });

  it('reaches further for a larger radius and higher for a larger lift height', () => {
    const base = liftSketch({ weight: 10, radius: 12, height: 10 });
    expect(liftSketch({ weight: 10, radius: 30, height: 10 }).hookX).toBeGreaterThan(base.hookX);
    expect(liftSketch({ weight: 10, radius: 12, height: 40 }).hookY).toBeLessThan(base.hookY);
  });

  it('keeps the drawing inside the viewBox for any input', () => {
    for (const radius of [0, 2, 12, 80, 500]) {
      for (const height of [0, 2, 10, 120, 900]) {
        for (const weight of [null, 0, 5000]) {
          const g = liftSketch({ weight, radius, height });
          expect(g.hookX).toBeGreaterThanOrEqual(40);
          expect(g.hookX).toBeLessThanOrEqual(280);
          expect(g.hookY).toBeGreaterThanOrEqual(30);
          expect(g.hookY).toBeLessThanOrEqual(180);
          expect(g.tipY).toBeGreaterThanOrEqual(8);
          expect(g.ropeLength).toBeGreaterThanOrEqual(0);
          expect(g.loadScale).toBeGreaterThanOrEqual(0.6);
          expect(g.loadScale).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('points the boom from the pivot to the tip', () => {
    const g = liftSketch({ weight: 10, radius: 12, height: 10 });
    const rad = (g.boomAngle * Math.PI) / 180;
    expect(40 + Math.cos(rad) * g.boomLength).toBeCloseTo(g.tipX, 6);
    expect(180 + Math.sin(rad) * g.boomLength).toBeCloseTo(g.tipY, 6);
  });

  it('scales the load block with weight on a log scale', () => {
    expect(liftSketch({ weight: 500, radius: 12, height: 10 }).loadScale).toBeCloseTo(1, 10);
    const mid = liftSketch({ weight: 50, radius: 12, height: 10 }).loadScale;
    expect(mid).toBeGreaterThan(0.6);
    expect(mid).toBeLessThan(1);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/motion/math.test.ts`
Expected: FAIL. `liftSketch is not a function`, and the other 19 tests pass.

- [ ] **Step 3: Append to `src/motion/math.ts`**

```ts
export interface LiftInput {
  weight: number | null;
  radius: number | null;
  height: number | null;
}

export interface LiftGeometry {
  hookX: number;
  hookY: number;
  tipX: number;
  tipY: number;
  /** Degrees; negative = above the horizontal (SVG y points down). */
  boomAngle: number;
  boomLength: number;
  ropeLength: number;
  loadScale: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * The "your lift" sketch in a 320×200 viewBox with the boom pivot at (40, 180).
 * Illustration only: no capacity is computed or suggested.
 */
export function liftSketch({ weight, radius, height }: LiftInput): LiftGeometry {
  const r = clamp(radius ?? 12, 2, 80);
  const h = clamp(height ?? 10, 2, 120);
  const scale = Math.min(240 / r, 150 / (h + 6));
  const hookX = 40 + r * scale;
  const hookY = 180 - h * scale;
  const tipX = hookX;
  const tipY = Math.max(8, hookY - 24);
  const dx = tipX - 40;
  const dy = tipY - 180;
  return {
    hookX,
    hookY,
    tipX,
    tipY,
    boomAngle: (Math.atan2(dy, dx) * 180) / Math.PI,
    boomLength: Math.hypot(dx, dy),
    ropeLength: hookY - tipY,
    loadScale: 0.6 + (0.4 * Math.log10(1 + clamp(weight ?? 0, 0, 500))) / Math.log10(501),
  };
}
```

- [ ] **Step 4: Run it again**

Run: `npx vitest run src/motion/math.test.ts`
Expected: PASS, 24 tests.

- [ ] **Step 5: Add the container to `src/sections/RequestForm.tsx`**

Directly before the `<form data-testid="request-form" …>` element, in the same column, add:

```tsx
<div data-lift-sketch aria-hidden="true" className="mb-8 aspect-[8/5] w-full max-w-80 text-steel" />
```

- [ ] **Step 6: Append the sketch block to `src/motion/motion.css`**

```css
/* Lift sketch (D.9, optional). The box is reserved only when JS runs, so no-JS pages have no gap. */
html:not(.js) [data-lift-sketch] {
  display: none;
}
.lift-sketch {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  overflow: visible;
}
.lift-sketch line,
.lift-sketch path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5px;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.lift-sketch__boom line,
.lift-sketch__rope line,
.lift-sketch__hook > path {
  stroke: var(--color-red-bright);
}
.lift-sketch__load rect {
  fill: none;
  stroke: var(--color-white);
  stroke-width: 1.5px;
  vector-effect: non-scaling-stroke;
}
.lift-sketch text {
  fill: var(--color-steel);
  font: 500 12px/1 var(--font-mono);
  font-variant-numeric: tabular-nums lining-nums;
  text-anchor: middle;
}
```

- [ ] **Step 7: Write `src/motion/sketch.ts`**

```ts
import { gsap } from 'gsap';
import { parseDecimal } from '@/lib/digits';
import { formatMetres, formatTonnes } from '@/lib/numbers';
import { MOTION_QUERIES } from './mode';
import { liftSketch } from './math';
import { noop, type Dispose, type MotionEnv } from './shared';

const SVG_NS = 'http://www.w3.org/2000/svg';

const ART =
  '<line class="lift-sketch__ground" x1="16" y1="180" x2="304" y2="180"/>' +
  '<g class="lift-sketch__boom"><line x1="0" y1="0" x2="1" y2="0"/></g>' +
  '<g class="lift-sketch__rope"><line x1="0" y1="0" x2="0" y2="1"/></g>' +
  '<g class="lift-sketch__hook"><path d="M0 0v5a4 4 0 1 1-4 4"/>' +
  '<g class="lift-sketch__load"><rect x="-12" y="12" width="24" height="16" rx="1"/></g></g>';

const LABELS =
  '<text class="lift-sketch__weight"></text><text class="lift-sketch__radius"></text><text class="lift-sketch__height"></text>';

/** Draws the "your lift" sketch inside [data-lift-sketch] and follows the form's weight, radius and height. */
export function startSketch(env: MotionEnv): Dispose {
  const host = document.querySelector<HTMLElement>('[data-lift-sketch]');
  const form = document.querySelector<HTMLFormElement>('form[data-testid="request-form"]');
  if (!host || !form) return noop;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'lift-sketch');
  svg.setAttribute('viewBox', '0 0 320 200');
  svg.setAttribute('aria-hidden', 'true');
  // The drawing mirrors in RTL; the labels never do (their x is mirrored instead).
  svg.innerHTML = `<g${env.rtl ? ' transform="translate(320 0) scale(-1 1)"' : ''}>${ART}</g>${LABELS}`;
  host.append(svg);

  const pick = <T extends Element>(selector: string) => svg.querySelector<T>(selector)!;
  const boom = pick<SVGGElement>('.lift-sketch__boom');
  const rope = pick<SVGGElement>('.lift-sketch__rope');
  const hook = pick<SVGGElement>('.lift-sketch__hook');
  const load = pick<SVGGElement>('.lift-sketch__load');
  const weightLabel = pick<SVGTextElement>('.lift-sketch__weight');
  const radiusLabel = pick<SVGTextElement>('.lift-sketch__radius');
  const heightLabel = pick<SVGTextElement>('.lift-sketch__height');
  const mx = (x: number) => (env.rtl ? 320 - x : x);

  const field = (name: string): number | null => {
    const el = form.elements.namedItem(name);
    return el instanceof HTMLInputElement ? parseDecimal(el.value) : null;
  };
  const label = (el: SVGTextElement, text: string, x: number, y: number) => {
    el.textContent = text;
    el.setAttribute('x', String(Math.round(x)));
    el.setAttribute('y', String(Math.round(y)));
  };

  const update = (instant: boolean) => {
    const weight = field('weight');
    const radius = field('radius');
    const height = field('height');
    const g = liftSketch({ weight, radius, height });
    const duration = instant || window.matchMedia(MOTION_QUERIES.reduced).matches ? 0 : 0.4;
    const vars = { duration, ease: 'expo.out', overwrite: 'auto' as const };
    gsap.to(boom, { x: 40, y: 180, rotation: g.boomAngle, scaleX: g.boomLength, transformOrigin: '0 0', ...vars });
    gsap.to(rope, { x: g.tipX, y: g.tipY, scaleY: Math.max(g.ropeLength, 0.001), transformOrigin: '0 0', ...vars });
    gsap.to(hook, { x: g.hookX, y: g.hookY, ...vars });
    gsap.to(load, { scale: g.loadScale, transformOrigin: '50% 0', ...vars });
    label(weightLabel, weight === null ? '' : formatTonnes(weight, env.lang), mx(g.hookX), g.hookY + 44);
    label(radiusLabel, radius === null ? '' : formatMetres(radius, env.lang), mx((40 + g.hookX) / 2), 196);
    label(heightLabel, height === null ? '' : formatMetres(height, env.lang), mx(Math.min(g.hookX + 34, 300)), g.hookY + 4);
  };

  const onInput = () => update(false);
  form.addEventListener('input', onInput);
  update(true);

  return () => {
    form.removeEventListener('input', onInput);
    gsap.killTweensOf([boom, rope, hook, load]);
    svg.remove();
  };
}
```

- [ ] **Step 8: Lazy-load it in every mode** — in `src/motion/core.ts`, add this constant above `const DESKTOP`:

```ts
/** Optional lift sketch: information, so it runs in every mode (instant under reduced motion). */
const sketchLazy: MotionModule = (env) => {
  const host = document.querySelector<HTMLElement>('[data-lift-sketch]');
  if (!host) return noop;
  let dispose: Dispose = noop;
  let alive = true;
  const stop = whenNear(host, () => {
    import('./sketch')
      .then((m) => {
        if (alive) dispose = m.startSketch(env);
      })
      .catch((error: unknown) => console.error('[motion] sketch', error));
  });
  return () => {
    alive = false;
    stop();
    dispose();
  };
};
```

Then, in `startMotion()`, replace:

```ts
  return () => {
    mm.revert();
    delete root.dataset.motion;
  };
```

with:

```ts
  const stopSketch = safely(sketchLazy, env);

  return () => {
    stopSketch();
    mm.revert();
    delete root.dataset.motion;
  };
```

- [ ] **Step 9: Run the checks**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected:
- All tests pass (math: 24), and `tsc` prints nothing.
- The build lists a separate small `sketch-<hash>.js` chunk.

- [ ] **Step 10: Manual check (browser preview)**

1. **Desktop, `/`:** scroll to the form. A small line drawing (ground, red boom, rope, hook, load block) sits above the form.
2. **Typing:**
   - Type `12` into the weight field: the load block grows and «12 طن» appears under it.
   - Type `18` into radius: the boom reaches further and «18 م» appears on the ground line.
   - Type `30` into height: the hook rises.
   - Each change glides in about 0.4 s.
3. **Arabic digits:** type `٣٥٠` into weight. It is read as 350, and the label shows Western digits.
4. **`/en/`:** labels read `12 t`, `18 m`, `30 m`, and the drawing faces the other way (pivot on the left).
5. **Reduced:** the drawing jumps to each new value instantly.
6. **No JS:** there is no empty gap above the form.
7. **Accessibility tree:** the sketch is not present (aria-hidden).

- [ ] **Step 11: Commit**

```bash
git add src/motion/math.ts src/motion/math.test.ts src/motion/sketch.ts src/motion/core.ts src/motion/motion.css src/sections/RequestForm.tsx
git commit -m "$(cat <<'MSG'
feat(motion): optional lift sketch that follows weight, radius and height

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

---
### Task D.10: Motion QA pass

**Files:** none planned. Fixes found here go into the file they belong to, each in its own `fix(motion): …` commit. For a pure-logic bug (in `math.ts` or `mode.ts`), first write a failing test in its test file.

- [ ] **Step 1: Automated checks and bundle sizes**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected:
- All tests pass: mode 8, math 19 (24 with D.9), ghost 3, plus Parts A–C.
- `tsc` prints nothing.
- The Vite chunk list shows `core-<hash>.js` ≤ 60 KB gzip, `hoist-<hash>.js` ≤ 8 KB gzip, and (if D.9) `sketch-<hash>.js` ≤ 3 KB gzip.
- The entry chunk is within 1 KB gzip of the Part C build.

Write the gzip sizes into the D.10 commit body. Part E checks them against spec §9 (JS ≤ 110 KB gz).

- [ ] **Step 2: Static guards**

Run this block. Every command must print nothing:

```bash
grep -rn "chars" src/motion --include=*.ts            # text is never split into characters
grep -rn "data-reveal" src/motion                     # no generic reveal (spec §15.4)
grep -rn "Flip" src/motion                            # no Flip reflow (spec §15.4)
grep -rnE "pin:|pinSpacing|pinReparent" src/motion    # no pin-spacer, so no reparenting
grep -rnE "letter-?[sS]pacing|text-transform|justify" src/motion   # Arabic rules
grep -nE "from '(gsap|lenis)" src/motion/index.ts     # index.ts imports only React
```

Then open every `gsap.to/from/fromTo/set` call in `src/motion/*.ts` (`grep -rnE "gsap\.(to|from|fromTo|set)\(|tl\.(to|from|fromTo|set)\(" src/motion`). Confirm the animated properties are only:
- `x`, `y`, `xPercent`, `yPercent`;
- `scale`, `scaleX`, `scaleY`, `rotation`;
- `opacity`, `autoAlpha`;
- `drawSVG`.

Plus the non-animated `transformOrigin`, `svgOrigin`, `clearProps` and `keyframes` of `rotation`.

- [ ] **Step 3: The width × language matrix (desktop and touch)**

For each row below, run the checklist on `/` (AR) and on `/en/` (EN). Touch rows use the device toolbar and a **reload**. Desktop rows use a real window and a mouse.

| Width | Context | How to get it |
|---|---|---|
| 375 | touch | device toolbar "iPhone SE"-size 375×667, reload |
| 768 | touch | device toolbar 768×1024 ("iPad Mini"), reload |
| 1024 | desktop | window 1024 px wide, mouse; and once with device toolbar touch emulation at 1024 (→ touch) |
| 1440 | desktop | window 1440 px wide, mouse |
| 1920 | desktop | window 1920 px wide (or device toolbar "Responsive" 1920×1080 without touch), mouse |

Checklist for each width and language:
- [ ] **Hero:**
  - Still by 2.0 s.
  - The sling legs start on the real hook.
  - The swing pivots on the hook pin.
  - The H1 lines are intact; Arabic is joined, with no clipped marks above or below.
  - The H1 is back to plain markup after the intro.
- [ ] **Dock:** the ghost flies into the bar's WhatsApp button and back. There is never more than one `.motion-ghost`.
- [ ] **Hoist:**
  - Desktop: the stage sticks, five beats run, the counters run from the previous value, it snaps to each crane, the last hook lands on the real hook within 4 px, and the exit slides to the progress-rope edge.
  - Touch: each card is set down once, with a short rope and a 2° settle.
- [ ] **Ride:** "Request this crane" in the grid makes a chip fly into the bar along a curve. The chip ends visible.
- [ ] **Services:**
  - Rows settle on entry and never fade.
  - Desktop only: the hover sling draws from the rope.
- [ ] **Rope, pad and back to top:**
  - Desktop: the progress rope is live after the Hoist.
  - The footer pad is set down.
  - Back to top hoists (desktop: Lenis glide and focus on the header; touch: native).
- [ ] **No horizontal overflow:** `document.documentElement.scrollWidth === window.innerWidth` → `true`. Check it at the top, mid-Hoist and at the footer.
- [ ] **Console:** no errors and no `[motion]` messages.
- [ ] **Static elsewhere:** headings, the grid, the sites strip and the documents never move.

- [ ] **Step 4: Reduced motion** (Rendering → `prefers-reduced-motion: reduce`, reload) at 375 and 1440, AR and EN:
- `document.documentElement.dataset.motion` → `'reduced'`.
- Nothing moves, and all hero content is visible at first paint.
- The Hoist is the static stack with final numbers (no `.hoist--staged`, `.hoist-rig` or `.hoist-runway`).
- The bar chip appears instantly.
- Back to top jumps instantly.
- There is no progress rope.

- [ ] **Step 5: Slow CPU, no jank**
1. Desktop 1440, AR: DevTools → Performance → CPU **4× slowdown**. Record a reload, then a steady wheel-scroll from top to footer and back.
   - The "Layout shifts" track is **empty**.
   - Apart from the single task where the motion chunk starts (≤ 150 ms), there are no long tasks over 50 ms.
   - The frame rate through the Hoist is mostly at 50 fps or above.
   - There are no "Forced reflow" violations inside scroll callbacks.
2. Repeat on touch 390 px with 4× slowdown, scrolling through the load stack.
3. CLS cross-check: after a full scroll, paste
   ```js
   new PerformanceObserver((l) => console.table(l.getEntries().map((e) => ({ value: e.value, input: e.hadRecentInput, nodes: e.sources?.map((s) => s.node?.nodeName).join(' ') })))).observe({ type: 'layout-shift', buffered: true })
   ```
   Expected: an empty table, or a total value < 0.01 with no motion-owned nodes or hero, Hoist or bar nodes in `nodes`.

- [ ] **Step 6: JS disabled and failure modes**
1. DevTools → Run command → "Disable JavaScript", reload `/` and `/en/`. Every word is visible: the hero, the Hoist as a list with final numbers, services, grid, form and footer. There is no blank gap where the sketch would be. Re-enable JS.
2. Network request blocking `core-`, reload: all hero content is visible straight away (`data-motion="reduced"` from the catch).
3. Network "Slow 3G" with no blocking, reload: the hero H1 and lines appear by 3 s even if the core chunk has not arrived. When the chunk arrives later, nothing hides again.

- [ ] **Step 7: Fix, re-check, commit**

Fix each issue found and commit it separately (`fix(motion): <what>`, with the trailer). Then re-run Step 1 and the affected rows of Step 3. Finish with a commit marking the pass (it may be empty):

```bash
git commit --allow-empty -m "$(cat <<'MSG'
test(motion): QA pass at 375–1920 in AR and EN, reduced motion, 4x CPU and no-JS

Gzip: core <n> KB, hoist <n> KB, sketch <n> KB (fill in from Step 1).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
)"
```

(Replace each `<n>` with the measured number before running. Gate I2 runs the Impeccable polish and detector on this result.)

---

### Proposed contract additions (Part D assumes these are adopted)

Checked against Part C's plan (`40-C-sections.md`): items 4, 5 and 7 already match Part C's markup and only need recording in C9. Part C's proposal 11 (`data-hoist-band`) can be **closed**: Part D does not need a band.

1. **C10: fix the touch query.**
   - C10's `(prefers-reduced-motion: no-preference) and not ((min-width: 1024px) and (pointer: fine))` is invalid Media Queries 4 grammar. A `not` after `and` must sit in its own parentheses. Browsers read the query as `not all`, so the touch context would never run.
   - Replace it with the exact complement used by `src/motion/mode.ts`:
     `(prefers-reduced-motion: no-preference) and (max-width: 1023.98px), (prefers-reduced-motion: no-preference) and (pointer: coarse), (prefers-reduced-motion: no-preference) and (pointer: none)`.
   - The desktop and reduced queries are unchanged.
2. **C10: pre-states beyond `[data-intro]`.** Under `html.motion-ok:not([data-motion])`, `motion.css` may also:
   - set `opacity: 0` on `[data-split]`, `[data-sling-leg]` and `[data-sling-button]`. The button stays tappable and is forced visible on `:focus-visible`;
   - pre-scale `[data-hero-photo]` and `svg[data-sling]` to `scale(1.05)` (transform only; the `<img>` itself is never hidden).

   All of these use the same 3 s CSS fallback.
3. **Architecture line "never edits React-owned DOM": three narrow, reversible exceptions.**
   - SplitText on `[data-split]`, reverted when the intro ends.
   - The `nodeValue` of the single text node inside `[data-counter]`, restored on cleanup.
   - Motion-owned children appended inside React containers and removed on cleanup: the `.hoist-rig` `<li>` (aria-hidden) in `[data-hoist-list]`, the `.hoist-runway` `<div>` after it, `.service-sling` in `[data-service-row]`, and the sketch `<svg>` in `[data-lift-sketch]`.
   - Static inline layout set once and removed on cleanup: `margin-block-end` and CSS variables on `[data-hoist-list]`, CSS variables on the last `[data-hoist-item]`, and `--sling-reach` on service rows.

   Therefore: the hero H1 and the Hoist must be static after hydration (no state-driven text), and `[data-counter]` must contain exactly one text node. Part C's `LoadTag` already does this; the unit is a sibling span.
4. **C9: hero sling geometry (matches Part C).**
   - Each `svg[data-sling]` covers exactly the box of the hero `<img>` (`absolute inset-0` in the photo box).
   - There may be one per crop, with the inactive one hidden by CSS. `hero.ts` uses the one that is laid out.
   - Each leg path starts at the pin (`M pin L end`).
   - The `[data-sling-button]` sits in a positioned wrapper, so motion transforms only the button itself.
5. **C9: Hoist item structure (matches Part C's C.5).**
   - `[data-hoist-photo]` wraps one `<picture>` (crop `desktop_16x9`, `mobileCrop` `mobile_4x5`) and, when the crop has a hook point, `[data-hook-anchor]`. `hoist.ts` reads the hook from `getImage(crane.hoistPhoto, 'desktop_16x9')`.
   - `[data-load-tag]` holds the counter, model and type, plus its own short rope (3.5 rem, `bottom-full`).
   - No element between `[data-load-tag]` and `[data-hoist-item]` is positioned, so the staged CSS can place the tag in the stage.
   - There is no per-item button. If one is added later, it must sit inside `[data-load-tag]` so it travels with the tag.
6. **Layout: sticky stage.** No ancestor of `[data-hoist-list]` (including `html`, `body`, `#main`, the section and `.shell`) may use `overflow: hidden | auto | scroll`. Use `overflow-x: clip` for horizontal clipping.
7. **C9: footer pad (matches Part C).** The footer's outrigger-pad `<svg>` carries **`data-footer-pad`**.
8. **C9 (optional, D.9): lift sketch.** `<div data-lift-sketch aria-hidden="true">` inside `#request`, sized `aspect-[8/5] w-full max-w-80`, rendered empty. D.9 adds it itself if the stretch is taken.
9. **Spec consistency (no action for Part C):**
   - `data-reveal` is not used by Part D (spec §15.4), and Part C renders none.
   - The crane-grid Flip reflow in §5.5 is dropped by §15.4, so the filter changes statically.
   - The header file map gains `src/motion/mode.ts`, `shared.ts`, `math.ts` and `ghost.ts` (with `mode.test.ts`, `math.test.ts` and `ghost.test.ts`).


---

## Gate I2: Impeccable finish pass with motion on (end of Day 8, after Part D)

### Task I2.1: Polish, harden, adapt, optimize

**Files:**
- Modify: whichever `src/**` files the commands point at
- Create: `docs/reviews/impeccable-gate-2.md`

- [ ] **Step 1: Rebuild and preview**

Run: `npx tsc --noEmit && npm test && npx vite build && npx vite preview --port 4173`
Expected: types and tests pass; preview at `http://localhost:4173/`

- [ ] **Step 2: Polish within the design system.** Paste this exact instruction so the command keeps the approved system:
```
/impeccable polish http://localhost:4173/ — keep our square corners, navy/red palette with no yellow, Archivo + Noto Kufi + IBM Plex type, and the hook as the only signature shape. Remove AI tells only.
```
Record the changes it proposes and applies. Reject any change that breaks spec §6–§7, and note it.

- [ ] **Step 3: Harden.** Edge cases: long Arabic strings, missing data, offline form send, RTL overflow.
```
/impeccable harden the request form and request bar on http://localhost:4173/
/impeccable harden the crane grid on http://localhost:4173/en/
```

- [ ] **Step 4: Adapt** across screen sizes (320–1920 px, touch versus pointer):
```
/impeccable adapt http://localhost:4173/
```

- [ ] **Step 5: Optimize** loading and rendering against the budget in spec §9:
```
/impeccable optimize http://localhost:4173/ — budgets: ≤1 MB first load, JS ≤110 KB gz, LCP ≤2.0 s, CLS ≤0.05
```

- [ ] **Step 6: Final critique scores** for the record:
```
/impeccable critique http://localhost:4173/
/impeccable critique http://localhost:4173/en/
```
Expected: no P0/P1 left. Record the final scores in `docs/reviews/impeccable-gate-2.md`.

- [ ] **Step 7: Detector clean again**

Run: `npx impeccable detect src/ && npx impeccable detect http://localhost:4173/ && npx impeccable detect http://localhost:4173/en/`
Expected: exit code 0 for all three.

- [ ] **Step 8: Re-run unit tests and build, then commit**

Run: `npm test && npx tsc --noEmit && npx vite build`
Expected: PASS
```bash
git add -A src docs/reviews
git commit -m "polish: Impeccable gate 2 (polish, harden, adapt, optimize)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

> Without the installed skill (I1.1 skipped), do Steps 2–6 by hand. Use the design-superpowers `design-review` skill and the `web-design-guidelines` skill as the reviewers. Step 7, the detector, is unchanged.


---

## Part E — Prerender, SEO, QA, handover (Days 9–10)

**Runs after:** Part D and Gate I2. The full order is A1 → B → A2 → C → I1 → D → I2 → **E**. The two Impeccable gates are in `45-impeccable-gate-1.md` and `55-impeccable-gate-2.md`. E.3 and E.8 rerun their detector, and E.6 can use the `/impeccable document` command if Task I1.1 installed the skill.

**Starting state:** `npx tsc --noEmit && npx vite build` succeeds, motion works, and the DOM contract (C9) is in place.

**End state:**
- Both pages are prerendered to static HTML and hydrate cleanly.
- The SEO head, JSON-LD, sitemap and robots files are complete.
- `npm run qa` and `npm run lighthouse` run and write reports.
- The handover docs, PDF screen exports and `docs/qa-report.md` hold the real results.

> **Honest reporting rule, for every task in Part E.** Record what you actually observed: real numbers, real exit codes, real error text. If a check fails, the report says FAIL and gives the number. Never change a threshold, a test or a QA check to turn a failure into a pass. Never write PASS for something you did not run. A failure that can't be fixed within the spec is written down as an open item, with its reason.

### Conventions for Part E

- **Working directory:** `/Users/montheribrahim/Downloads/atlas-website` for every command.
- **Chrome:** `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Every script also accepts `CHROME_PATH` to override it.
- **Node:** 22.12 or newer. This machine has v24.
- **Reports** go to `qa/reports/`, which is gitignored. Final copies are committed under `docs/qa/` in E.8.
- **Start the preview.** Use this block every time a step says "start the preview". It serves `dist/` exactly as built.
  ```bash
  lsof -ti tcp:4173 | xargs kill 2>/dev/null || true
  mkdir -p qa/reports
  npx vite preview --port 4173 --strictPort > qa/reports/preview.log 2>&1 &
  for i in $(seq 1 60); do curl -sf http://localhost:4173/ > /dev/null && break; sleep 0.5; done
  curl -sI http://localhost:4173/ | head -1
  ```
  Expected last line: `HTTP/1.1 200 OK`.
- **Stop the preview:** `lsof -ti tcp:4173 | xargs kill 2>/dev/null || true`.
- **Restart the preview after every build.** Stopping it first also guarantees no stale server keeps serving an old `dist/`.
- **`SITE_URL`** is unset for every local build, QA and Lighthouse run in Part E, so it defaults to `http://localhost:4173`. The QA SEO checks compare the canonical URL with `SITE_URL`, so the build and the QA run must use the same value.

**New files in Part E:**
```
src/entry-server.tsx  src/seo/jsonld.ts (+test)  src/seo/head.test.ts
scripts/prerender.mjs  scripts/export-pdf.mjs
scripts/lib/prerender-helpers.mjs (+test)  scripts/lib/seo.mjs (+test, .d.mts)  scripts/lib/head.mjs (+test, .d.mts)
vite/site-url.ts (+test)
public/robots.txt
qa/smoke-prerender.mjs  qa/run-qa.mjs  qa/lighthouse.mjs  qa/bundle-budget.mjs  qa/find-overflow.mjs
qa/lib/checks.mjs (+test)  qa/lib/report.mjs (+test)  qa/lib/budgets.mjs (+test)
vercel.json  README.md  DESIGN.md  docs/atlas-content-checklist.md  docs/qa-report.md  docs/qa/*  docs/exports/*.pdf
```

---

### Task E.1: Prerender both pages and hydrate

**Files:**
- Create: `scripts/lib/prerender-helpers.mjs`, `scripts/lib/prerender-helpers.test.mjs`, `src/entry-server.tsx`, `scripts/prerender.mjs`, `qa/smoke-prerender.mjs`
- Modify: `src/main.tsx` (hydrate instead of render), `index.html` + `en/index.html` (add two markers), `.gitignore` (add `dist-ssr/`), `vitest.config.ts` (only if it restricts `include`)

- [ ] **Step 1: Make sure Vitest runs tests outside `src/`**

Run: `grep -n "include" vitest.config.ts`
- **No output:** Vitest's default include (`**/*.{test,spec}.?(c|m)[jt]s?(x)`) already covers `scripts/**/*.test.mjs`, `qa/**/*.test.mjs` and `vite/**/*.test.ts`. Change nothing.
- **An `include` line is printed** (for example `include: ['src/**/*.test.{ts,tsx}']`): replace that array with:
  ```ts
  include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs', 'qa/**/*.test.mjs', 'vite/**/*.test.ts'],
  ```
  Keep every other option as it is.

- [ ] **Step 2: Write the failing test for the prerender helpers**

Create `scripts/lib/prerender-helpers.test.mjs`:
```js
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { extractLeadingLinks, findTokens, injectApp, injectHead } from './prerender-helpers.mjs';

const PAGE =
  '<!doctype html><html lang="ar" dir="rtl"><head><title>t</title><!--head--></head>' +
  '<body><div id="root"><!--app--></div></body></html>';

describe('injectApp', () => {
  it('puts the rendered app inside #root in place of the marker', () => {
    expect(injectApp(PAGE, '<header data-header></header>')).toContain('<div id="root"><header data-header></header></div>');
  });
  it('leaves no marker behind', () => {
    expect(injectApp(PAGE, '<main></main>')).not.toContain('<!--app-->');
  });
  it('copies $ sequences literally (no String.replace patterns)', () => {
    expect(injectApp(PAGE, '<p>$& $1 $$ $`</p>')).toContain('<div id="root"><p>$& $1 $$ $`</p></div>');
  });
  it('throws when the marker is missing', () => {
    expect(() => injectApp('<div id="root"></div>', '<main></main>')).toThrow(/<!--app-->/);
  });
  it('throws when the marker appears twice', () => {
    expect(() => injectApp(PAGE + '<!--app-->', '<main></main>')).toThrow(/more than once/);
  });
  it('throws when the rendered app is empty', () => {
    expect(() => injectApp(PAGE, '   ')).toThrow(/empty/);
  });
});

describe('injectHead', () => {
  it('puts tags where <!--head--> was', () => {
    expect(injectHead(PAGE, '<script type="application/ld+json">{}</script>')).toContain(
      '<title>t</title><script type="application/ld+json">{}</script></head>',
    );
  });
  it('accepts an empty string and removes the marker', () => {
    expect(injectHead(PAGE, '')).not.toContain('<!--head-->');
  });
  it('throws when the marker is missing', () => {
    expect(() => injectHead('<head></head>', '')).toThrow(/<!--head-->/);
  });
});

describe('extractLeadingLinks', () => {
  it('moves resource hints that React put before the app markup', () => {
    const r = extractLeadingLinks(
      '<link rel="preload" as="image" href="/brand/badge.png"/><link rel="preload" as="image" href="/x.png"/><a href="#main">Skip</a>',
    );
    expect(r.links).toBe('<link rel="preload" as="image" href="/brand/badge.png"/><link rel="preload" as="image" href="/x.png"/>');
    expect(r.body).toBe('<a href="#main">Skip</a>');
  });
  it('returns the html untouched when nothing precedes it', () => {
    expect(extractLeadingLinks('<a href="#main">Skip</a><link rel="x">')).toEqual({
      links: '',
      body: '<a href="#main">Skip</a><link rel="x">',
    });
  });
});

describe('findTokens', () => {
  it('lists each unresolved token once, sorted', () => {
    expect(findTokens('<p>[[PHONE]]</p><p>[[CAPACITY:RT700E]]</p><a>[[PHONE]]</a>')).toEqual(['[[CAPACITY:RT700E]]', '[[PHONE]]']);
  });
  it('catches CONFIRM markers with spaces', () => {
    expect(findTokens('Name [[CONFIRM: English spelling]].')).toEqual(['[[CONFIRM: English spelling]]']);
  });
  it('reports a stray opening bracket pair', () => {
    expect(findTokens('<p>broken [[PHO</p>')).toEqual(['[[PHO</p>']);
  });
  it('returns [] for clean html', () => {
    expect(findTokens('<p>350 t</p>')).toEqual([]);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run scripts/lib/prerender-helpers.test.mjs`
Expected: FAIL. The module `./prerender-helpers.mjs` cannot be resolved ("Failed to load url" / "Cannot find module").

- [ ] **Step 4: Implement the helpers**

Create `scripts/lib/prerender-helpers.mjs`:
```js
// Pure helpers for scripts/prerender.mjs (unit-tested in prerender-helpers.test.mjs).
export const APP_MARKER = '<!--app-->';
export const HEAD_MARKER = '<!--head-->';

function replaceOnce(html, marker, content) {
  const at = html.indexOf(marker);
  if (at === -1) throw new Error(`prerender: marker ${marker} not found in the page`);
  if (html.indexOf(marker, at + marker.length) !== -1) throw new Error(`prerender: marker ${marker} appears more than once`);
  // slice + concat, not String.replace: app HTML may contain "$&" and similar sequences.
  return html.slice(0, at) + content + html.slice(at + marker.length);
}

/** Replaces <!--app--> (inside <div id="root">) with the server-rendered app. */
export function injectApp(html, appHtml) {
  if (!appHtml || !appHtml.trim()) throw new Error('prerender: render() returned empty HTML');
  return replaceOnce(html, APP_MARKER, appHtml);
}

/** Replaces <!--head--> (just before </head>) with extra head tags; '' just removes the marker. */
export function injectHead(html, headHtml) {
  return replaceOnce(html, HEAD_MARKER, headHtml);
}

/** React 19 may emit <link rel="preload"> hints before the app markup. They belong in <head>,
 *  and #root must start with the app's first element or hydration will not match. */
export function extractLeadingLinks(appHtml) {
  const match = appHtml.match(/^(?:\s*<link\b[^>]*>)+/);
  if (!match) return { links: '', body: appHtml };
  return { links: match[0].trim(), body: appHtml.slice(match[0].length) };
}

/** Unresolved [[TOKEN]]s in rendered HTML. The truth gate fails a production build on any. */
export function findTokens(html) {
  const found = new Set(html.match(/\[\[[^\]\n]{0,80}\]\]/g) ?? []);
  if (found.size === 0 && html.includes('[[')) {
    const at = html.indexOf('[[');
    found.add(html.slice(at, at + 30));
  }
  return [...found].sort();
}
```

- [ ] **Step 5: Run the test again**

Run: `npx vitest run scripts/lib/prerender-helpers.test.mjs`
Expected: PASS, `15 passed`.

- [ ] **Step 6: Add the two prerender markers to both HTML entries**

A1 created `<div id="root"></div>`. The prerender needs `<div id="root"><!--app--></div>`, plus a `<!--head-->` marker just before `</head>`. Run:
```bash
perl -0pi -e 's#<div id="root">\s*</div>#<div id="root"><!--app--></div>#; s#</head>#  <!--head-->\n  </head>#' index.html en/index.html
grep -c '<!--app-->' index.html en/index.html
grep -c '<!--head-->' index.html en/index.html
```
Expected: `index.html:1` and `en/index.html:1` for both greps. If either count is `0`, open the file and check that the root element really is `<div id="root">` (C10 and `src/main.tsx` use `root`). Then add the marker by hand.

- [ ] **Step 7: Check how `App` is exported**

Run: `grep -n "export" src/App.tsx`
- If it prints `export default function App`, use `import App from './App';` in Steps 8 and 9 (as written below).
- If it prints `export function App`, use `import { App } from './App';` in both files instead.

- [ ] **Step 8: Create the server entry**

Create `src/entry-server.tsx`:
```tsx
// Server entry for the build-time prerender (scripts/prerender.mjs). Never shipped to browsers.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { LangProvider } from '@/lib/lang';
import type { Lang } from '@/content/types';

/** Static HTML for one page: the same tree src/main.tsx hydrates. */
export function render(lang: Lang): string {
  return renderToString(
    <StrictMode>
      <LangProvider lang={lang}>
        <App />
      </LangProvider>
    </StrictMode>,
  );
}
```

- [ ] **Step 9: Hydrate in the browser**

First run `grep -n "import .*css" src/main.tsx` and note every CSS import line Part C added. Then replace `src/main.tsx` with the code below. Put those CSS import lines exactly where the comment says, replacing the two shown if they differ.
```tsx
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { LangProvider } from '@/lib/lang';
import type { Lang } from '@/content/types';
// CSS imports: keep exactly the lines Part C had here.
import './fonts.css';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from the page');

const lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
const tree = (
  <StrictMode>
    <LangProvider lang={lang}>
      <App />
    </LangProvider>
  </StrictMode>
);

if (container.firstElementChild) {
  // Built pages: the HTML was prerendered by scripts/prerender.mjs, so React adopts it.
  hydrateRoot(container, tree, {
    onRecoverableError(error, info) {
      // Make every hydration mismatch visible to QA (qa/smoke-prerender.mjs, qa/run-qa.mjs).
      console.error('[hydration]', error, info.componentStack ?? '');
    },
  });
} else {
  // Dev server: #root only holds <!--app-->, so render from scratch.
  createRoot(container).render(tree);
}
```

- [ ] **Step 10: Create the prerender script**

Create `scripts/prerender.mjs`:
```js
// Build-time prerender: renders both pages with React on the server and writes the HTML
// into dist/. Runs after `vite build` (package.json "build"). Set KEEP_SSR=1 to keep
// dist-ssr/ for debugging a crash.
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { extractLeadingLinks, findTokens, injectApp, injectHead } from './lib/prerender-helpers.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SSR_DIR = path.join(ROOT, 'dist-ssr');
const TARGET = process.env.BUILD_TARGET === 'production' ? 'production' : 'staging';
const PAGES = [
  { lang: 'ar', file: 'index.html' },
  { lang: 'en', file: path.join('en', 'index.html') },
];

// A string `ssr` entry replaces the two HTML inputs from vite.config.ts for this build.
const result = await build({
  root: ROOT,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', emptyOutDir: true, copyPublicDir: false, minify: false, sourcemap: false },
});
const chunks = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output ?? []);
const entry = chunks.find((chunk) => chunk.type === 'chunk' && chunk.isEntry);
if (!entry) throw new Error('prerender: the SSR build produced no entry chunk');

try {
  const server = await import(pathToFileURL(path.join(SSR_DIR, entry.fileName)).href);
  for (const page of PAGES) {
    const file = path.join(DIST, page.file);
    const html = await readFile(file, 'utf8');
    const { links, body } = extractLeadingLinks(server.render(page.lang));
    const out = injectHead(injectApp(html, body), links);
    const tokens = findTokens(out);
    if (tokens.length && TARGET === 'production') throw new Error(`truth gate: ${page.file} still contains ${tokens.join(', ')}`);
    if (tokens.length) console.warn(`prerender: ${page.file} shows ${tokens.length} draft token(s) (allowed in staging): ${tokens.join(', ')}`);
    await writeFile(file, out);
    console.log(`prerender: ${page.file} (${page.lang}) ${(Buffer.byteLength(out) / 1024).toFixed(1)} KB`);
  }
} finally {
  if (!process.env.KEEP_SSR) await rm(SSR_DIR, { recursive: true, force: true });
}
```

- [ ] **Step 11: Ignore the temporary SSR folder**

Run: `grep -qx 'dist-ssr/' .gitignore || echo 'dist-ssr/' >> .gitignore && tail -3 .gitignore`
Expected: the last lines include `dist-ssr/`.

- [ ] **Step 12: Build**

Run: `npm run build`
Expected: tsc passes, then Vite's client build, then the prerender's lines:
```
prerender: index.html (ar) NN.N KB
prerender: en/index.html (en) NN.N KB
```
The prerender may also print `prerender: … shows N draft token(s) (allowed in staging)`. Copy that line into your notes; E.8 records it.

If the prerender crashes, rerun with `KEEP_SSR=1 npm run build` and read the stack trace. It points into `dist-ssr/entry-server.js`, which is unminified.

| Error | Cause | Fix |
|---|---|---|
| `window is not defined` / `document is not defined` / `matchMedia is not defined` | Something touches the browser at module top level or during render (breaks Global rule 1) | Move that code into a `useEffect`, or into an event handler, in the file the stack trace names |
| `localStorage is not defined` | Same | Same |
| `Cannot find module '…/App'` / no default export | Wrong import form | Redo Step 7 |
| `marker <!--app--> not found` | Step 6 missed a file | Redo Step 6 |
| `getImage: … missing` | Image manifest out of date | `npm run assets`, then rebuild |

- [ ] **Step 13: Check the static output**

```bash
grep -c "data-hero" dist/index.html dist/en/index.html
grep -c "<!--app-->" dist/index.html dist/en/index.html
grep -o 'fetchpriority="high"' dist/index.html | wc -l
ls dist-ssr 2>/dev/null || echo "dist-ssr removed"
```
Expected:
- `data-hero`: 1 or more per file.
- `<!--app-->`: 0 per file (grep prints `:0` and exits 1).
- `fetchpriority`: 1 (the hero image).
- `dist-ssr removed`.

- [ ] **Step 14: Create the prerender smoke test**

Create `qa/smoke-prerender.mjs`:
```js
// Checks the prerendered pages: the page is complete with JavaScript off, then React hydrates
// the server DOM without errors or warnings. Usage (preview running):
//   node qa/smoke-prerender.mjs [baseUrl]
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENS = new URL('./reports/screens/', import.meta.url).pathname;
const PAGES = [
  { id: 'ar', path: '/', lang: 'ar', dir: 'rtl' },
  { id: 'en', path: '/en/', lang: 'en', dir: 'ltr' },
];
const HYDRATION = /hydrat|did not match|server rendered html|server-rendered/i;
let failures = 0;
const report = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

await mkdir(SCREENS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] });

for (const p of PAGES) {
  // 1. JavaScript off: the static HTML alone must show the whole page.
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(BASE + p.path, { waitUntil: 'load' });
    const s = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll('[data-intro], [data-split], [data-reveal], [data-hero-photo] img')]
        .filter((e) => {
          const cs = getComputedStyle(e);
          return cs.opacity !== '1' || cs.visibility === 'hidden';
        })
        .map((e) => e.tagName.toLowerCase());
      return {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        hero: !!document.querySelector('[data-hero]'),
        heroImg: !!document.querySelector('[data-hero-photo] img'),
        h1: document.querySelector('h1')?.textContent?.trim() ?? '',
        hoist: document.querySelectorAll('[data-hoist-item]').length,
        cards: document.querySelectorAll('[data-testid="crane-card"]').length,
        form: !!document.querySelector('[data-testid="request-form"]'),
        hidden,
      };
    });
    report(s.lang === p.lang && s.dir === p.dir, `${p.id} no-JS: lang/dir`, `${s.lang}/${s.dir}`);
    report(s.hero && s.heroImg && s.h1.length > 10, `${p.id} no-JS: hero, hero photo and H1 are in the HTML`, s.h1.slice(0, 60));
    report(s.hoist > 0 && s.hoist === s.cards, `${p.id} no-JS: Hoist items and crane cards rendered`, `hoist=${s.hoist} cards=${s.cards}`);
    report(s.form, `${p.id} no-JS: request form rendered`);
    report(s.hidden.length === 0, `${p.id} no-JS: nothing hidden waiting for motion`, s.hidden.join(', '));
    await page.screenshot({ path: `${SCREENS}nojs-${p.id}-390.png`, fullPage: true });
    await context.close();
  }
  // 2. JavaScript on: React must adopt the server DOM (no client re-render) with a clean console.
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => {
      if (m.type() === 'error' || (m.type() === 'warning' && HYDRATION.test(m.text()))) errors.push(`${m.type()}: ${m.text()}`);
    });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e}`));
    // Tag the server-rendered hero node while the HTML is parsed, before any script runs.
    await page.evaluateOnNewDocument(() => {
      new MutationObserver((_, observer) => {
        const hero = document.querySelector('[data-hero]');
        if (hero) {
          hero.__qaServerNode = true;
          observer.disconnect();
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(BASE + p.path, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 3000));
    const kept = await page.evaluate(() => document.querySelector('[data-hero]')?.__qaServerNode === true);
    report(kept, `${p.id} hydration kept the server DOM (no client re-render)`);
    report(errors.length === 0, `${p.id} no console errors or hydration warnings`, errors.join(' | '));
    await context.close();
  }
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nAll prerender checks passed');
process.exit(failures ? 1 : 0);
```

- [ ] **Step 15: Run the smoke test against the production build**

Start the preview (Conventions), then run: `node qa/smoke-prerender.mjs`
Expected: 14 `PASS` lines, then `All prerender checks passed`, exit code 0.

Any `FAIL` is real. Fix it before moving on:
- **no-JS checks:** content is missing from the server render, or CSS hides it without the `js` / `motion-ok` classes. Look in `src/motion/motion.css` and `src/styles.css`.
- **hydration:** see E.5 row "Hydration mismatch".

Stop the preview.

- [ ] **Step 16: Look at the no-JS screenshots**

Open `qa/reports/screens/nojs-ar-390.png` and `qa/reports/screens/nojs-en-390.png`. In this environment, use the Read tool on each path.
Expected: the full page is visible without JavaScript: hero photo and H1, the Hoist list, the crane cards, sites, the form and the footer. Note anything missing.

- [ ] **Step 17: Hydration check with React's development build (attribute mismatches)**

Production React reports only text and structure mismatches. The development build also reports attribute mismatches.
```bash
NODE_ENV=development npx vite build && NODE_ENV=development node scripts/prerender.mjs
grep -l "hydrated but" dist/assets/*.js | head -1
```
Expected: one file name is printed. That proves the bundle uses React's development build. Then start the preview and run `node qa/smoke-prerender.mjs`.
Expected: `All prerender checks passed`. Every React warning (`A tree hydrated but some attributes …`) arrives as a console error and fails the run, with its text in the output. Fix and repeat until the run is clean. Then stop the preview.

- [ ] **Step 18: Rebuild for real and commit**

```bash
npm run build
npm test
git add scripts/lib/prerender-helpers.mjs scripts/lib/prerender-helpers.test.mjs scripts/prerender.mjs src/entry-server.tsx src/main.tsx index.html en/index.html qa/smoke-prerender.mjs .gitignore vitest.config.ts
git commit -m "feat(build): prerender both pages to static HTML and hydrate

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
Expected: the build passes, all tests pass, and the commit is created. If `vitest.config.ts` was not changed, git simply skips it.

---
### Task E.2: SEO head, JSON-LD, sitemap and robots

**Files:**
- Create: `scripts/lib/seo.mjs`, `scripts/lib/seo.d.mts`, `scripts/lib/seo.test.mjs`, `scripts/lib/head.mjs`, `scripts/lib/head.d.mts`, `scripts/lib/head.test.mjs`, `vite/site-url.ts`, `vite/site-url.test.ts`, `src/seo/jsonld.ts`, `src/seo/jsonld.test.ts`, `src/seo/head.test.ts`, `public/robots.txt`
- Modify: `vite.config.ts` (register the plugin), `index.html`, `en/index.html` (full head), `src/entry-server.tsx` (add `head()`), `scripts/prerender.mjs` (inject head tags, write the sitemap, fill robots)

**Decisions taken here.** The spec wins over the copy deck:
- **Page addresses:** Arabic at `/` and English at `/en/`. Copy deck §1's `og:url` row (AR `/ar/`) is out of date.
- **`x-default`** points at the Arabic root.
- **Sitemap:** generated into `dist/sitemap.xml` at build time. It needs the real `SITE_URL`, so there is no `public/sitemap.xml`.
- **JSON-LD:** built at prerender time from `siteInfo` and `env`. So the Facebook URL is never typed twice, and phone and address appear on their own once Atlas verifies them.

- [ ] **Step 1: Write the failing SEO helper tests**

Create `scripts/lib/seo.test.mjs`:
```js
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildSitemap, fillSiteUrl, normalizeSiteUrl } from './seo.mjs';

const EXPECTED_SITEMAP =
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    '  <url>',
    '    <loc>https://atlas.example/</loc>',
    '    <lastmod>2026-11-13</lastmod>',
    '    <xhtml:link rel="alternate" hreflang="ar" href="https://atlas.example/" />',
    '    <xhtml:link rel="alternate" hreflang="en" href="https://atlas.example/en/" />',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="https://atlas.example/" />',
    '  </url>',
    '  <url>',
    '    <loc>https://atlas.example/en/</loc>',
    '    <lastmod>2026-11-13</lastmod>',
    '    <xhtml:link rel="alternate" hreflang="ar" href="https://atlas.example/" />',
    '    <xhtml:link rel="alternate" hreflang="en" href="https://atlas.example/en/" />',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="https://atlas.example/" />',
    '  </url>',
    '</urlset>',
  ].join('\n') + '\n';

describe('normalizeSiteUrl', () => {
  it('defaults to the local preview address', () => {
    expect(normalizeSiteUrl(undefined)).toBe('http://localhost:4173');
    expect(normalizeSiteUrl('  ')).toBe('http://localhost:4173');
  });
  it('drops trailing slashes and spaces', () => {
    expect(normalizeSiteUrl(' https://atlas.example// ')).toBe('https://atlas.example');
  });
  it('rejects a value without a scheme', () => {
    expect(() => normalizeSiteUrl('atlas.example')).toThrow(/http/);
  });
});

describe('fillSiteUrl', () => {
  it('replaces every placeholder', () => {
    expect(fillSiteUrl('Sitemap: %SITE_URL%/sitemap.xml\n%SITE_URL%/', 'https://atlas.example')).toBe(
      'Sitemap: https://atlas.example/sitemap.xml\nhttps://atlas.example/',
    );
  });
});

describe('buildSitemap', () => {
  it('lists both pages with hreflang alternates and x-default on the Arabic root', () => {
    expect(buildSitemap('https://atlas.example/', '2026-11-13')).toBe(EXPECTED_SITEMAP);
  });
  it('rejects a malformed lastmod', () => {
    expect(() => buildSitemap('https://atlas.example', '13/11/2026')).toThrow(/YYYY-MM-DD/);
  });
  it('escapes XML special characters in the address', () => {
    expect(buildSitemap('https://atlas.example/a&b', '2026-11-13')).toContain('<loc>https://atlas.example/a&amp;b/</loc>');
  });
});
```

- [ ] **Step 2: Write the failing head-parser tests**

Create `scripts/lib/head.test.mjs`:
```js
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseAttrs, parseHead } from './head.mjs';

const SAMPLE = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>أطلس الصحراء | تأجير</title>
    <meta name="description" content="وصف &amp; نص" />
    <meta property="og:title" content="عنوان" />
    <link rel="canonical" href="https://atlas.example/" />
    <link rel="alternate" hreflang="ar" href="https://atlas.example/" />
    <link rel="alternate" hreflang="en" href="https://atlas.example/en/" />
    <link rel="alternate" hreflang="x-default" href="https://atlas.example/" />
    <link rel="icon" href="/brand/badge.png" type="image/png" />
    <script type="application/ld+json">{"@type":["Organization","LocalBusiness"],"email":"a@b.c"}</script>
  </head>
  <body><header data-header><title>not this</title></header></body>
</html>`;

describe('parseAttrs', () => {
  it('reads quoted, unquoted and empty attributes', () => {
    expect(parseAttrs(`<link rel="preload" as=font crossorigin href='/a.woff2'>`)).toEqual({
      rel: 'preload',
      as: 'font',
      crossorigin: '',
      href: '/a.woff2',
    });
  });
});

describe('parseHead', () => {
  const h = parseHead(SAMPLE);
  it('reads lang and dir from <html>', () => {
    expect([h.lang, h.dir]).toEqual(['ar', 'rtl']);
  });
  it('reads the head title only, decoding entities in meta', () => {
    expect(h.title).toBe('أطلس الصحراء | تأجير');
    expect(h.meta.description).toBe('وصف & نص');
    expect(h.meta['og:title']).toBe('عنوان');
  });
  it('reads canonical, hreflang alternates and icons', () => {
    expect(h.canonical).toBe('https://atlas.example/');
    expect(h.alternates).toEqual({ ar: 'https://atlas.example/', en: 'https://atlas.example/en/', 'x-default': 'https://atlas.example/' });
    expect(h.icons).toEqual(['/brand/badge.png']);
  });
  it('parses JSON-LD blocks', () => {
    expect(h.jsonLd).toEqual([{ '@type': ['Organization', 'LocalBusiness'], email: 'a@b.c' }]);
    expect(h.jsonLdErrors).toEqual([]);
  });
  it('reports JSON-LD that does not parse', () => {
    const bad = parseHead('<html><head><script type="application/ld+json">{oops}</script></head></html>');
    expect(bad.jsonLd).toEqual([]);
    expect(bad.jsonLdErrors).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run both and watch them fail**

Run: `npx vitest run scripts/lib/seo.test.mjs scripts/lib/head.test.mjs`
Expected: FAIL. `./seo.mjs` and `./head.mjs` cannot be resolved.

- [ ] **Step 4: Implement `scripts/lib/seo.mjs` and its type declarations**

Create `scripts/lib/seo.mjs`:
```js
// SEO helpers shared by the Vite site-url plugin (vite/site-url.ts) and scripts/prerender.mjs.
export const DEFAULT_SITE_URL = 'http://localhost:4173';

/** Both pages. x-default points at the Arabic root (spec §10). */
export const PAGES = [
  { lang: 'ar', path: '/' },
  { lang: 'en', path: '/en/' },
];

/** SITE_URL without trailing slash; the local preview address when unset. */
export function normalizeSiteUrl(raw) {
  const value = String(raw ?? '').trim() || DEFAULT_SITE_URL;
  if (!/^https?:\/\/[^/\s]+/i.test(value)) throw new Error(`SITE_URL must start with http:// or https:// (got "${value}")`);
  return value.replace(/\/+$/, '');
}

/** Replaces every %SITE_URL% placeholder (index.html heads, public/robots.txt). */
export function fillSiteUrl(text, siteUrl) {
  return text.replaceAll('%SITE_URL%', siteUrl);
}

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** sitemap.xml for both pages with hreflang alternates. lastmod is YYYY-MM-DD. */
export function buildSitemap(siteUrl, lastmod) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) throw new Error(`lastmod must be YYYY-MM-DD (got "${lastmod}")`);
  const base = normalizeSiteUrl(siteUrl);
  const alternates = [
    ...PAGES.map((p) => `    <xhtml:link rel="alternate" hreflang="${p.lang}" href="${xml(base + p.path)}" />`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(base + '/')}" />`,
  ].join('\n');
  const urls = PAGES.map((p) =>
    ['  <url>', `    <loc>${xml(base + p.path)}</loc>`, `    <lastmod>${lastmod}</lastmod>`, alternates, '  </url>'].join('\n'),
  ).join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    `${urls}\n</urlset>\n`
  );
}
```

Create `scripts/lib/seo.d.mts` (types for `vite/site-url.ts`):
```ts
export declare const DEFAULT_SITE_URL: string;
export declare const PAGES: ReadonlyArray<{ lang: 'ar' | 'en'; path: string }>;
export declare function normalizeSiteUrl(raw: string | null | undefined): string;
export declare function fillSiteUrl(text: string, siteUrl: string): string;
export declare function buildSitemap(siteUrl: string, lastmod: string): string;
```

- [ ] **Step 5: Implement `scripts/lib/head.mjs` and its type declarations**

Create `scripts/lib/head.mjs`:
```js
// A small, dependency-free reader for the <head> of our own HTML (QA + head consistency test).
// It is not a general HTML parser: it expects double- or single-quoted attributes like Vite writes.
const NAMED = { '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&lt;': '<', '&gt;': '>' };

export function decodeEntities(s) {
  return String(s)
    .replace(/&(quot|#39|#x27|lt|gt);/g, (m) => NAMED[m])
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

/** Attributes of one start tag, keys lower-cased, values entity-decoded ('' for bare attributes). */
export function parseAttrs(tag) {
  const inner = String(tag).replace(/^<\s*[a-zA-Z][\w-]*/, '').replace(/\/?\s*>$/, '');
  const attrs = {};
  for (const m of inner.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
}

export function parseHead(html) {
  const htmlAttrs = parseAttrs(html.match(/<html\b[^>]*>/i)?.[0] ?? '<html>');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const title = decodeEntities(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '');
  const meta = {};
  for (const m of head.matchAll(/<meta\b[^>]*>/gi)) {
    const a = parseAttrs(m[0]);
    const key = a.name ?? a.property;
    if (key && a.content !== undefined) meta[key] = a.content;
  }
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => parseAttrs(m[0]));
  const canonical = links.find((l) => l.rel === 'canonical')?.href ?? null;
  const alternates = Object.fromEntries(links.filter((l) => l.rel === 'alternate' && l.hreflang).map((l) => [l.hreflang, l.href]));
  const icons = links.filter((l) => /(^|\s)(icon|apple-touch-icon)(\s|$)/.test(l.rel ?? '')).map((l) => l.href);
  const jsonLd = [];
  const jsonLdErrors = [];
  for (const m of head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      jsonLd.push(JSON.parse(m[1]));
    } catch (e) {
      jsonLdErrors.push(String(e));
    }
  }
  return { lang: htmlAttrs.lang ?? null, dir: htmlAttrs.dir ?? null, title, meta, canonical, alternates, icons, jsonLd, jsonLdErrors };
}
```

Create `scripts/lib/head.d.mts`:
```ts
export interface ParsedHead {
  lang: string | null;
  dir: string | null;
  title: string;
  meta: Record<string, string>;
  canonical: string | null;
  alternates: Record<string, string>;
  icons: string[];
  jsonLd: unknown[];
  jsonLdErrors: string[];
}
export declare function decodeEntities(s: string): string;
export declare function parseAttrs(tag: string): Record<string, string>;
export declare function parseHead(html: string): ParsedHead;
```

- [ ] **Step 6: Run the helper tests**

Run: `npx vitest run scripts/lib/seo.test.mjs scripts/lib/head.test.mjs`
Expected: PASS. 7 tests in `seo.test.mjs` and 6 in `head.test.mjs`.

- [ ] **Step 7: Write the failing plugin test**

Create `vite/site-url.test.ts`:
```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { siteUrl } from './site-url';

type HtmlHook = { order: 'pre'; handler: (html: string) => string };

describe('siteUrl plugin', () => {
  it('fills every %SITE_URL% before other HTML transforms run', () => {
    const hook = siteUrl('https://atlas.example/').transformIndexHtml as unknown as HtmlHook;
    expect(hook.order).toBe('pre');
    expect(hook.handler('<link rel="canonical" href="%SITE_URL%/"><meta property="og:image" content="%SITE_URL%/og-ar.jpg">')).toBe(
      '<link rel="canonical" href="https://atlas.example/"><meta property="og:image" content="https://atlas.example/og-ar.jpg">',
    );
  });
  it('falls back to the local preview address', () => {
    const hook = siteUrl('').transformIndexHtml as unknown as HtmlHook;
    expect(hook.handler('%SITE_URL%/en/')).toBe('http://localhost:4173/en/');
  });
});
```
Run: `npx vitest run vite/site-url.test.ts`
Expected: FAIL. `./site-url` cannot be resolved.

- [ ] **Step 8: Implement the plugin and register it**

Create `vite/site-url.ts`:
```ts
import type { Plugin } from 'vite';
import { fillSiteUrl, normalizeSiteUrl } from '../scripts/lib/seo.mjs';

/**
 * Writes the site address into both HTML entries (canonical, hreflang, Open Graph, Twitter).
 * SITE_URL (or VITE_SITE_URL) sets it; without one the local preview address is used.
 */
export function siteUrl(raw: string | undefined = process.env.VITE_SITE_URL ?? process.env.SITE_URL): Plugin {
  const url = normalizeSiteUrl(raw);
  return {
    name: 'atlas-site-url',
    transformIndexHtml: { order: 'pre', handler: (html: string) => fillSiteUrl(html, url) },
  };
}
```

Edit `vite.config.ts`:
1. Run `grep -n "SITE_URL" vite.config.ts`. Keep the A1 line `process.env.VITE_SITE_URL ??= process.env.SITE_URL`. If any inline plugin already replaces `%SITE_URL%`, delete that plugin object.
2. Add this import next to the other `./vite/…` imports:
   ```ts
   import { siteUrl } from './vite/site-url';
   ```
3. Make `siteUrl()` the **first** entry of the `plugins: [` array. For example, `plugins: [react(), tailwindcss(), …]` becomes `plugins: [siteUrl(), react(), tailwindcss(), …]`. Leave every other plugin where it is.

Run: `npx vitest run vite/site-url.test.ts && npx tsc --noEmit`
Expected: PASS (2 tests), and tsc prints nothing.

- [ ] **Step 9: Write the failing JSON-LD test**

Create `src/seo/jsonld.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { buildJsonLd, jsonLdScript } from './jsonld';

// Test fixtures only: none of these values is an Atlas fact.
const base = {
  siteUrl: 'https://atlas.example',
  email: 'atlasalsahralibya@gmail.com',
  facebook: 'https://www.facebook.com/example-page',
  phone: null,
  address: null,
};

describe('buildJsonLd', () => {
  it('has only confirmed fields while phone and address are unknown', () => {
    const ld = buildJsonLd({ ...base, lang: 'ar' });
    expect(Object.keys(ld).sort()).toEqual(['@context', '@id', '@type', 'alternateName', 'email', 'logo', 'name', 'sameAs', 'url'].sort());
    expect(ld['@type']).toEqual(['Organization', 'LocalBusiness']);
    expect(ld.name).toBe('أطلس الصحراء');
    expect(ld.alternateName).toBe('Atlas Alshraa');
    expect(ld.url).toBe('https://atlas.example/');
    expect(ld.logo).toBe('https://atlas.example/brand/badge.png');
    expect(ld.email).toBe('atlasalsahralibya@gmail.com');
    expect(ld.sameAs).toEqual(['https://www.facebook.com/example-page']);
  });
  it('names the English page in English first', () => {
    const ld = buildJsonLd({ ...base, lang: 'en' });
    expect([ld.name, ld.alternateName]).toEqual(['Atlas Alshraa', 'أطلس الصحراء']);
  });
  it('adds telephone and address once they are verified', () => {
    const ld = buildJsonLd({ ...base, lang: 'en', phone: '+218900000000', address: { ar: 'عنوان تجريبي', en: 'Test address' } });
    expect(ld.telephone).toBe('+218900000000');
    expect(ld.address).toEqual({ '@type': 'PostalAddress', streetAddress: 'Test address', addressCountry: 'LY' });
  });
});

describe('jsonLdScript', () => {
  it('escapes < so the JSON cannot close the script tag', () => {
    const s = jsonLdScript({ x: '</script><b>' });
    expect(s.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(s).not.toContain('</script><b>');
    expect(JSON.parse(s.replace(/^<script[^>]*>|<\/script>$/g, ''))).toEqual({ x: '</script><b>' });
  });
});
```
Run: `npx vitest run src/seo/jsonld.test.ts`
Expected: FAIL. `./jsonld` cannot be resolved.

- [ ] **Step 10: Implement JSON-LD**

Create `src/seo/jsonld.ts`:
```ts
import type { Lang } from '@/content/types';

/** og:site_name values from copy deck §1. */
export const ORG_NAME = { ar: 'أطلس الصحراء', en: 'Atlas Alshraa' } as const;

export interface JsonLdInput {
  lang: Lang;
  siteUrl: string; // no trailing slash
  email: string; // siteInfo.email (confirmed)
  facebook: string; // siteInfo.facebook (confirmed)
  phone: string | null; // env.phone: set only once Atlas supplies it (production requires it)
  address: { ar: string; en: string } | null; // siteInfo.address: null until verified
}

/** Organization + LocalBusiness with confirmed fields only (spec §10). Phone and address join
 *  automatically when their data exists. Geo and opening hours are added the same way later. */
export function buildJsonLd(input: JsonLdInput): Record<string, unknown> {
  const other: Lang = input.lang === 'ar' ? 'en' : 'ar';
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${input.siteUrl}/#organization`,
    name: ORG_NAME[input.lang],
    alternateName: ORG_NAME[other],
    url: `${input.siteUrl}/`,
    logo: `${input.siteUrl}/brand/badge.png`,
    email: input.email,
    sameAs: [input.facebook],
  };
  if (input.phone) data.telephone = input.phone;
  if (input.address) data.address = { '@type': 'PostalAddress', streetAddress: input.address[input.lang], addressCountry: 'LY' };
  return data;
}

/** The <script> tag. '<' is escaped so no string inside can end the script early. */
export function jsonLdScript(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}
```
Run: `npx vitest run src/seo/jsonld.test.ts`
Expected: PASS (4 tests).

> **How phone and address will be added (no code change needed):**
> - **Phone:** set `VITE_PHONE` (for example `+2189XXXXXXXX`), and `telephone` appears in both pages' JSON-LD.
> - **Address:** set `siteInfo.address = { ar: '…', en: '…' }` in `src/content/site.ts`, and `address` appears with `addressCountry: 'LY'`.
> - **Map pin and hours, when Atlas sends them:**
>   1. Add the optional fields `geo?: { lat: number; lng: number } | null` and `openingHours?: string | null` to `JsonLdInput`.
>   2. Add a test that expects them.
>   3. Add these two lines before `return data;`:
>      `if (input.geo) data.geo = { '@type': 'GeoCoordinates', latitude: input.geo.lat, longitude: input.geo.lng };`
>      `if (input.openingHours) data.openingHours = input.openingHours;`
>   4. Pass the values from `siteInfo` in `src/entry-server.tsx` `head()`.

- [ ] **Step 11: Write the failing head consistency test**

This test ties the static `<head>` of both HTML files to the copy deck §1 strings that Part B put in `getCopy(lang).meta`. If one changes without the other, `npm test` fails.

Create `src/seo/head.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import arHtml from '../../index.html?raw';
import enHtml from '../../en/index.html?raw';
import { parseHead } from '../../scripts/lib/head.mjs';
import { getCopy } from '@/content';
import type { Lang } from '@/content/types';

const PAGES: { lang: Lang; html: string; path: string; dir: string; locale: string; altLocale: string; siteName: string }[] = [
  { lang: 'ar', html: arHtml, path: '/', dir: 'rtl', locale: 'ar_LY', altLocale: 'en_GB', siteName: 'أطلس الصحراء' },
  { lang: 'en', html: enHtml, path: '/en/', dir: 'ltr', locale: 'en_GB', altLocale: 'ar_LY', siteName: 'Atlas Alshraa' },
];

describe.each(PAGES)('$lang page head', (p) => {
  const head = parseHead(p.html);
  const meta = getCopy(p.lang).meta;

  it('declares language and direction', () => {
    expect(head.lang).toBe(p.lang);
    expect(head.dir).toBe(p.dir);
  });
  it('uses the copy deck §1 strings from src/content', () => {
    expect(head.title).toBe(meta.title);
    expect(head.meta.description).toBe(meta.description);
    expect(head.meta['og:title']).toBe(meta.ogTitle);
    expect(head.meta['og:description']).toBe(meta.ogDescription);
    expect(head.meta['og:image:alt']).toBe(meta.ogImageAlt);
    expect(head.meta['twitter:title']).toBe(meta.ogTitle);
    expect(head.meta['twitter:description']).toBe(meta.ogDescription);
    expect(head.meta['twitter:image:alt']).toBe(meta.ogImageAlt);
    expect(head.meta['og:site_name']).toBe(p.siteName);
  });
  it('links canonical, og:url and hreflang through %SITE_URL%', () => {
    expect(head.canonical).toBe(`%SITE_URL%${p.path}`);
    expect(head.meta['og:url']).toBe(`%SITE_URL%${p.path}`);
    expect(head.alternates).toEqual({ ar: '%SITE_URL%/', en: '%SITE_URL%/en/', 'x-default': '%SITE_URL%/' });
  });
  it('uses its own 1200×630 Open Graph image', () => {
    expect(head.meta['og:image']).toBe(`%SITE_URL%/og-${p.lang}.jpg`);
    expect(head.meta['og:image:type']).toBe('image/jpeg');
    expect(head.meta['og:image:width']).toBe('1200');
    expect(head.meta['og:image:height']).toBe('630');
    expect(head.meta['twitter:card']).toBe('summary_large_image');
    expect(head.meta['twitter:image']).toBe(`%SITE_URL%/og-${p.lang}.jpg`);
  });
  it('sets locales, theme colour and the temporary badge icon', () => {
    expect(head.meta['og:locale']).toBe(p.locale);
    expect(head.meta['og:locale:alternate']).toBe(p.altLocale);
    expect(head.meta['theme-color']).toBe('#0D0C2B');
    expect(head.icons).toEqual(['/brand/badge.png', '/brand/badge.png']);
  });
  it('keeps the prerender markers and the module entry', () => {
    expect(p.html).toContain('<div id="root"><!--app--></div>');
    expect(p.html.match(/<!--head-->/g)).toHaveLength(1);
    expect(p.html).toContain('<script type="module" src="/src/main.tsx"></script>');
  });
});

describe('Arabic search terms (spec §10)', () => {
  const head = parseHead(arHtml);
  it('meta keywords carry both رافعة and كرين', () => {
    expect(head.meta.keywords).toContain('رافعة');
    expect(head.meta.keywords).toContain('كرين');
  });
  it('meta description carries كرين (الكرينات)', () => {
    expect(head.meta.description).toContain('كرين');
  });
});
```
Run: `npx vitest run src/seo/head.test.ts`
Expected: FAIL. A1's heads lack most of these tags, so expect failures such as `expected null to be '%SITE_URL%/'`.

If a failure is about `meta.title`, `meta.description` or another `meta.*` value, compare `src/content/ar.ts` / `en.ts` with copy deck §1, character for character. The deck is the source. Fix whichever side differs from the deck. Never edit the deck to match the code.

- [ ] **Step 12: Check the Open Graph images match their alt text**

Open `public/og-ar.jpg` and `public/og-en.jpg` (made by A2). Copy deck §1 says both show IMG_6398: two yellow cranes on a beach.
- **If both show that:** continue.
- **If one shows something else** (for example IMG_6359, a single crane seen from below): use that photo's alt line from copy deck §12 instead. Put it in that language's `meta.ogImageAlt` in `src/content/<lang>.ts`, and in the matching `og:image:alt` and `twitter:image:alt` in Step 13. Note the change for the E.8 report.

- [ ] **Step 13: Write the complete heads**

First run `sed -n '/<script>/,/<\/script>/p' index.html`. That prints A1's inline script (C10). If it differs from the `<script>` block below, use A1's block verbatim in both files.

Replace `index.html` with:
```html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>أطلس الصحراء | تأجير الرافعات والنقل الثقيل في ليبيا</title>
    <meta name="description" content="تأجير الرافعات (الكرينات) من الصغيرة إلى الكبيرة، ونقل ثقيل ومناولة وخدمات نفطية في ليبيا. أرسل وزن الحمولة وموقع العمل عبر واتساب." />
    <meta name="keywords" content="تأجير رافعات، رافعة، رافعات، كرين، كرينات، معدات ثقيلة، مشاريع إنشائية، نقل ثقيل، ليبيا" />
    <meta name="theme-color" content="#0D0C2B" />
    <meta name="color-scheme" content="light" />
    <link rel="canonical" href="%SITE_URL%/" />
    <link rel="alternate" hreflang="ar" href="%SITE_URL%/" />
    <link rel="alternate" hreflang="en" href="%SITE_URL%/en/" />
    <link rel="alternate" hreflang="x-default" href="%SITE_URL%/" />
    <!-- Temporary icon cropped from IMG_6363 (A2.4). Replace with the vector logo: see README. -->
    <link rel="icon" href="/brand/badge.png" type="image/png" />
    <link rel="apple-touch-icon" href="/brand/badge.png" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="%SITE_URL%/" />
    <meta property="og:site_name" content="أطلس الصحراء" />
    <meta property="og:locale" content="ar_LY" />
    <meta property="og:locale:alternate" content="en_GB" />
    <meta property="og:title" content="أطلس الصحراء: لكل مشروع رافعته المناسبة" />
    <meta property="og:description" content="تأجير الرافعات والنقل الثقيل والمناولة والخدمات النفطية. أخبرنا بحمولتك، ونخبرك بالرافعة التي تناسبها." />
    <meta property="og:image" content="%SITE_URL%/og-ar.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="رافعتان صفراوان منصوبتان جنباً إلى جنب على الشاطئ وذراعاهما مرفوعان نحو سماء زرقاء." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="أطلس الصحراء: لكل مشروع رافعته المناسبة" />
    <meta name="twitter:description" content="تأجير الرافعات والنقل الثقيل والمناولة والخدمات النفطية. أخبرنا بحمولتك، ونخبرك بالرافعة التي تناسبها." />
    <meta name="twitter:image" content="%SITE_URL%/og-ar.jpg" />
    <meta name="twitter:image:alt" content="رافعتان صفراوان منصوبتان جنباً إلى جنب على الشاطئ وذراعاهما مرفوعان نحو سماء زرقاء." />

    <script>
      // C10 (A1): before first paint, mark that JS runs and whether motion is allowed.
      (function () {
        var c = document.documentElement.classList;
        c.add('js');
        try {
          if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) c.add('motion-ok');
        } catch (e) {}
      })();
    </script>
    <!--head-->
  </head>
  <body>
    <div id="root"><!--app--></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Replace `en/index.html` with:
```html
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Atlas Alshraa | Crane Hire and Heavy Transport in Libya</title>
    <meta name="description" content="Crane hire from smaller cranes to the largest ones, plus heavy transport, handling and oil services in Libya. Send your load details on WhatsApp." />
    <meta name="keywords" content="crane hire Libya, heavy transport Libya, crane hire, cranes, handling and rigging, oil services" />
    <meta name="theme-color" content="#0D0C2B" />
    <meta name="color-scheme" content="light" />
    <link rel="canonical" href="%SITE_URL%/en/" />
    <link rel="alternate" hreflang="ar" href="%SITE_URL%/" />
    <link rel="alternate" hreflang="en" href="%SITE_URL%/en/" />
    <link rel="alternate" hreflang="x-default" href="%SITE_URL%/" />
    <!-- Temporary icon cropped from IMG_6363 (A2.4). Replace with the vector logo: see README. -->
    <link rel="icon" href="/brand/badge.png" type="image/png" />
    <link rel="apple-touch-icon" href="/brand/badge.png" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="%SITE_URL%/en/" />
    <meta property="og:site_name" content="Atlas Alshraa" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:locale:alternate" content="ar_LY" />
    <meta property="og:title" content="Atlas Alshraa: Every project has the right crane" />
    <meta property="og:description" content="Crane hire, heavy transport, handling and oil services. Tell us about your load and we will tell you which crane fits." />
    <meta property="og:image" content="%SITE_URL%/og-en.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Two yellow cranes set up side by side on a beach, booms raised against a blue sky." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Atlas Alshraa: Every project has the right crane" />
    <meta name="twitter:description" content="Crane hire, heavy transport, handling and oil services. Tell us about your load and we will tell you which crane fits." />
    <meta name="twitter:image" content="%SITE_URL%/og-en.jpg" />
    <meta name="twitter:image:alt" content="Two yellow cranes set up side by side on a beach, booms raised against a blue sky." />

    <script>
      // C10 (A1): before first paint, mark that JS runs and whether motion is allowed.
      (function () {
        var c = document.documentElement.classList;
        c.add('js');
        try {
          if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) c.add('motion-ok');
        } catch (e) {}
      })();
    </script>
    <!--head-->
  </head>
  <body>
    <div id="root"><!--app--></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Run: `npx vitest run src/seo/head.test.ts`
Expected: PASS (14 tests). A remaining failure on `meta.*` means `src/content/*.ts` differs from copy deck §1. Fix it as Step 11 says.

- [ ] **Step 14: robots.txt**

Create `public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: %SITE_URL%/sitemap.xml
```
(Vite copies it to `dist/`, and the prerender fills in `%SITE_URL%`.)

- [ ] **Step 15: Add `head()` to the server entry**

Replace `src/entry-server.tsx` with the code below. Keep the `App` import form from E.1 Step 7.
```tsx
// Server entry for the build-time prerender (scripts/prerender.mjs). Never shipped to browsers.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { LangProvider } from '@/lib/lang';
import { siteInfo } from '@/content';
import type { Lang } from '@/content/types';
import { env } from '@/env';
import { buildJsonLd, jsonLdScript } from '@/seo/jsonld';

/** Static HTML for one page: the same tree src/main.tsx hydrates. */
export function render(lang: Lang): string {
  return renderToString(
    <StrictMode>
      <LangProvider lang={lang}>
        <App />
      </LangProvider>
    </StrictMode>,
  );
}

/** Extra <head> tags for one page, injected at <!--head-->: the JSON-LD block. */
export function head(lang: Lang): string {
  return jsonLdScript(
    buildJsonLd({
      lang,
      siteUrl: env.siteUrl.replace(/\/+$/, ''),
      email: siteInfo.email,
      facebook: siteInfo.facebook,
      phone: env.phone,
      address: siteInfo.address,
    }),
  );
}
```

- [ ] **Step 16: Final prerender script (head tags, sitemap, robots)**

Replace `scripts/prerender.mjs` with:
```js
// Build-time prerender: renders both pages with React on the server, injects the JSON-LD,
// and writes sitemap.xml + robots.txt for SITE_URL. Runs after `vite build` (package.json
// "build"). Set KEEP_SSR=1 to keep dist-ssr/ for debugging a crash.
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { extractLeadingLinks, findTokens, injectApp, injectHead } from './lib/prerender-helpers.mjs';
import { buildSitemap, fillSiteUrl, normalizeSiteUrl } from './lib/seo.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SSR_DIR = path.join(ROOT, 'dist-ssr');
const TARGET = process.env.BUILD_TARGET === 'production' ? 'production' : 'staging';
const SITE_URL = normalizeSiteUrl(process.env.VITE_SITE_URL ?? process.env.SITE_URL);
const LASTMOD = process.env.SITEMAP_LASTMOD ?? new Date().toISOString().slice(0, 10);
const PAGES = [
  { lang: 'ar', file: 'index.html' },
  { lang: 'en', file: path.join('en', 'index.html') },
];

// A string `ssr` entry replaces the two HTML inputs from vite.config.ts for this build.
const result = await build({
  root: ROOT,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', emptyOutDir: true, copyPublicDir: false, minify: false, sourcemap: false },
});
const chunks = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output ?? []);
const entry = chunks.find((chunk) => chunk.type === 'chunk' && chunk.isEntry);
if (!entry) throw new Error('prerender: the SSR build produced no entry chunk');

try {
  const server = await import(pathToFileURL(path.join(SSR_DIR, entry.fileName)).href);
  for (const page of PAGES) {
    const file = path.join(DIST, page.file);
    const html = await readFile(file, 'utf8');
    const { links, body } = extractLeadingLinks(server.render(page.lang));
    const headTags = [links, server.head(page.lang)].filter(Boolean).join('\n    ');
    const out = injectHead(injectApp(html, body), headTags);
    const tokens = findTokens(out);
    if (tokens.length && TARGET === 'production') throw new Error(`truth gate: ${page.file} still contains ${tokens.join(', ')}`);
    if (tokens.length) console.warn(`prerender: ${page.file} shows ${tokens.length} draft token(s) (allowed in staging): ${tokens.join(', ')}`);
    await writeFile(file, out);
    console.log(`prerender: ${page.file} (${page.lang}) ${(Buffer.byteLength(out) / 1024).toFixed(1)} KB`);
  }
  await writeFile(path.join(DIST, 'sitemap.xml'), buildSitemap(SITE_URL, LASTMOD));
  const robots = path.join(DIST, 'robots.txt');
  await writeFile(robots, fillSiteUrl(await readFile(robots, 'utf8'), SITE_URL));
  console.log(`prerender: sitemap.xml and robots.txt for ${SITE_URL}`);
} finally {
  if (!process.env.KEEP_SSR) await rm(SSR_DIR, { recursive: true, force: true });
}
```

- [ ] **Step 17: Build with a test address and inspect the output**

```bash
SITE_URL=https://staging.atlas.example npm run build
grep -o '<link rel="canonical" href="[^"]*"' dist/index.html dist/en/index.html
grep -c '%SITE_URL%' dist/index.html dist/en/index.html dist/robots.txt
cat dist/robots.txt
grep -c '<loc>' dist/sitemap.xml
node -e "const h=require('fs').readFileSync('dist/index.html','utf8');const m=h.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/);console.log(JSON.stringify(JSON.parse(m[1]),null,2))"
grep -o 'rel="preload" as="font"' dist/index.html | wc -l
grep -o 'rel="preload" as="font"' dist/en/index.html | wc -l
```
Expected:
- **Canonical:** `dist/index.html:<link rel="canonical" href="https://staging.atlas.example/"` and `dist/en/index.html:<link rel="canonical" href="https://staging.atlas.example/en/"`.
- **`%SITE_URL%` count:** `:0` for all three files.
- **robots.txt** ends with `Sitemap: https://staging.atlas.example/sitemap.xml`.
- **`<loc>` count:** `2`.
- **JSON-LD:** `"name": "أطلس الصحراء"`, `"email": "atlasalsahralibya@gmail.com"`, `sameAs` holding the Facebook URL from `src/content/site.ts`, and **no** `telephone` or `address` (while `VITE_PHONE` is unset and `siteInfo.address` is `null`).
- **Font preloads:** `3` on each page.

If the font-preload count is `0`, the A1 plugin (`vite/font-preload.ts`) is looking for a string the new head no longer has. Run `grep -n "replace(" vite/font-preload.ts` to see the anchor it uses (for example `</title>` or a comment marker). Restore that anchor in both HTML files, then rebuild.

- [ ] **Step 18: Rebuild with the default address, run all tests, commit**

```bash
npm run build
npm test
git add scripts/lib/seo.mjs scripts/lib/seo.d.mts scripts/lib/seo.test.mjs scripts/lib/head.mjs scripts/lib/head.d.mts scripts/lib/head.test.mjs vite/site-url.ts vite/site-url.test.ts vite.config.ts src/seo index.html en/index.html public/robots.txt src/entry-server.tsx scripts/prerender.mjs src/content
git commit -m "feat(seo): complete head, JSON-LD, sitemap and robots for both pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
Expected: the build passes, all tests pass, and the commit is created. `src/content` is staged only if Step 11 or Step 12 changed it.

---
### Task E.3: Functional QA script (pages × widths × motion, every control)

Adapted from `afham-site/qa/run-qa.mjs`. It keeps the same skeleton:
- puppeteer-core on the installed Chrome;
- a fresh isolated browser context per case;
- `console` / `pageerror` / `requestfailed` / `response` listeners;
- axe-core injected from `node_modules`;
- `results.json` plus screenshots.

The controls are rewritten for the Atlas DOM contract (C9).

**Files:**
- Create: `qa/lib/checks.mjs`, `qa/lib/checks.test.mjs`, `qa/lib/report.mjs`, `qa/lib/report.test.mjs`, `qa/run-qa.mjs`

- [ ] **Step 1: Write the failing tests for the pure QA helpers**

Create `qa/lib/checks.test.mjs`:
```js
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  decodedHref,
  expectedForFilter,
  expectedMotion,
  isEncodedHref,
  matchesFilter,
  nextKey,
  normModel,
  photoIdFromUrl,
  prevKey,
  CRANES,
} from './checks.mjs';

const ALL = ['ac200-1', 'atf60-3', 'gmk6350', 'quy250', 'rt700e'];

describe('expectedForFilter', () => {
  it('keeps every crane for "all"', () => expect(expectedForFilter(ALL, 'all')).toEqual(ALL));
  it('filters by type', () => {
    expect(expectedForFilter(ALL, 'rough-terrain')).toEqual(['rt700e']);
    expect(expectedForFilter(ALL, 'all-terrain')).toEqual(['ac200-1', 'atf60-3', 'gmk6350']);
    expect(expectedForFilter(ALL, 'crawler')).toEqual(['quy250']);
  });
  it('filters by tonnage band (≤ 60 · 61–200 · > 200)', () => {
    expect(expectedForFilter(ALL, 'band:0-60')).toEqual(['atf60-3', 'rt700e']);
    expect(expectedForFilter(ALL, 'band:61-200')).toEqual(['ac200-1']);
    expect(expectedForFilter(ALL, 'band:201+')).toEqual(['gmk6350', 'quy250']);
  });
  it('only expects cranes that are on the page', () => expect(expectedForFilter(['gmk6350'], 'all-terrain')).toEqual(['gmk6350']));
  it('expects nothing for an unknown id under a real filter', () => expect(expectedForFilter(['x'], 'crawler')).toEqual([]));
});

describe('matchesFilter', () => {
  it('rejects an unknown filter value', () => expect(matchesFilter('weird', CRANES.gmk6350)).toBe(false));
});

describe('normModel', () => {
  it('ignores spaces, no-break spaces, bidi isolates and case', () => {
    expect(normModel(' gmk 6350 ')).toBe('GMK6350');
    expect(normModel('⁦ATF 60-3⁩')).toBe('ATF60-3');
  });
});

describe('decodedHref', () => {
  it('decodes percent-encoded Arabic text', () => {
    expect(decodedHref('https://wa.me/218900000000?text=%D8%A7%D9%84%D8%B1%D8%A7%D9%81%D8%B9%D8%A9%20GMK6350')).toBe(
      'https://wa.me/218900000000?text=الرافعة GMK6350',
    );
  });
  it('treats + as a space (form encoding)', () => expect(decodedHref('mailto:a@b.c?body=ATF+60-3')).toBe('mailto:a@b.c?body=ATF 60-3'));
  it('returns malformed input unchanged', () => expect(decodedHref('x%E0%A4%A')).toBe('x%E0%A4%A'));
  it('returns "" for nothing', () => expect(decodedHref(null)).toBe(''));
});

describe('isEncodedHref', () => {
  it('accepts a fully percent-encoded link', () => expect(isEncodedHref('https://wa.me/1?text=%D8%A7%20x')).toBe(true));
  it('rejects raw Arabic, spaces and new lines', () => {
    expect(isEncodedHref('https://wa.me/1?text=ا')).toBe(false);
    expect(isEncodedHref('https://wa.me/1?text=a b')).toBe(false);
    expect(isEncodedHref('https://wa.me/1?text=a\nb')).toBe(false);
    expect(isEncodedHref(null)).toBe(false);
  });
});

describe('photoIdFromUrl', () => {
  it('reads the photo id from image URLs and srcsets', () => {
    expect(photoIdFromUrl('/img/6398-desktop_16x9-1920.ab12cd34.avif')).toBe('6398');
    expect(photoIdFromUrl('http://localhost:4173/img/6359-mobile_9x16-640.ab12cd34.webp 640w')).toBe('6359');
    expect(photoIdFromUrl('/brand/badge.png')).toBeNull();
  });
});

describe('arrow keys follow the reading direction', () => {
  it('rtl: ArrowLeft is next', () => expect([nextKey('rtl'), prevKey('rtl')]).toEqual(['ArrowLeft', 'ArrowRight']));
  it('ltr: ArrowRight is next', () => expect([nextKey('ltr'), prevKey('ltr')]).toEqual(['ArrowRight', 'ArrowLeft']));
});

describe('expectedMotion (C10 contexts)', () => {
  it('maps viewport, pointer and preference to the context', () => {
    expect(expectedMotion({ width: 1440, touch: false, reduced: false })).toBe('desktop');
    expect(expectedMotion({ width: 1024, touch: false, reduced: false })).toBe('desktop');
    expect(expectedMotion({ width: 768, touch: true, reduced: false })).toBe('touch');
    expect(expectedMotion({ width: 1440, touch: false, reduced: true })).toBe('reduced');
    expect(expectedMotion({ width: 375, touch: true, reduced: true })).toBe('reduced');
  });
});
```

Create `qa/lib/report.test.mjs`:
```js
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { summarize } from './report.mjs';

const RESULTS = [
  { area: 'layout', name: 'ar @320 motion on no horizontal overflow', pass: true, detail: '' },
  { area: 'layout', name: 'en @320 motion on no horizontal overflow', pass: false, detail: '12px wider than the viewport' },
  { area: 'axe', name: 'ar @375 motion off no serious or critical axe violations', pass: true, detail: '' },
];

describe('summarize', () => {
  const md = summarize(RESULTS, { base: 'http://localhost:4173', date: '2026-11-13T10:00:00.000Z', target: 'staging' });
  it('gives the overall count', () => expect(md).toContain('- Checks: 2/3 passed'));
  it('tables each area alphabetically', () => expect(md).toContain('| axe | 1 | 0 |\n| layout | 1 | 1 |'));
  it('lists each failure verbatim', () =>
    expect(md).toContain('- [layout] en @320 motion on no horizontal overflow — 12px wider than the viewport'));
  it('says None when nothing failed', () => expect(summarize([RESULTS[0]])).toContain('## Failures\n\nNone.'));
});
```

Run: `npx vitest run qa/lib`
Expected: FAIL. `./checks.mjs` and `./report.mjs` cannot be resolved.

- [ ] **Step 2: Implement the helpers**

Create `qa/lib/checks.mjs`:
```js
// Pure helpers for qa/run-qa.mjs (tested in checks.test.mjs).

/** Cranes as the spec (§3) lists them. If src/content/cranes.ts changes, update this too (README "Add a crane"). */
export const CRANES = {
  rt700e: { model: 'RT700E', type: 'rough-terrain', t: 55 },
  'atf60-3': { model: 'ATF 60-3', type: 'all-terrain', t: 60 },
  'ac200-1': { model: 'AC200-1', type: 'all-terrain', t: 200 },
  quy250: { model: 'QUY250', type: 'crawler', t: 250 },
  gmk6350: { model: 'GMK6350', type: 'all-terrain', t: 350 },
};

/** Filter chip values from C9: 'all' | type | 'band:0-60' | 'band:61-200' | 'band:201+'. */
export function matchesFilter(value, crane) {
  if (value === 'all') return true;
  if (value === 'band:0-60') return crane.t <= 60;
  if (value === 'band:61-200') return crane.t >= 61 && crane.t <= 200;
  if (value === 'band:201+') return crane.t >= 201;
  if (value === 'rough-terrain' || value === 'all-terrain' || value === 'crawler') return crane.type === value;
  return false;
}

/** Crane ids that should stay visible for a chip, given the ids shown under "all". */
export function expectedForFilter(allIds, value) {
  return allIds.filter((id) => value === 'all' || (CRANES[id] !== undefined && matchesFilter(value, CRANES[id]))).sort();
}

/** Compare model codes regardless of spaces, bidi isolates and case. */
export function normModel(s) {
  return String(s ?? '')
    .normalize('NFKC')
    .replace(/[\s  ‎‏⁦-⁩]/g, '')
    .toUpperCase();
}

/** URL-decoded href (wa.me or mailto); '+' counts as a space. */
export function decodedHref(href) {
  if (!href) return '';
  try {
    return decodeURIComponent(String(href).replace(/\+/g, ' '));
  } catch {
    return String(href);
  }
}

/** True when an href is fully encoded: printable ASCII only, no spaces, no raw Arabic. */
export function isEncodedHref(href) {
  return typeof href === 'string' && /^[\x21-\x7e]+$/.test(href);
}

/** '6398' from '/img/6398-desktop_16x9-1920.<hash>.avif' (C6 URL scheme). */
export function photoIdFromUrl(s) {
  return String(s ?? '').match(/\/img\/(\d{4})-/)?.[1] ?? null;
}

export const nextKey = (dir) => (dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
export const prevKey = (dir) => (dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft');

/** The html[data-motion] value C10 should set for a test case. */
export function expectedMotion({ width, touch, reduced }) {
  if (reduced) return 'reduced';
  return width >= 1024 && !touch ? 'desktop' : 'touch';
}
```

Create `qa/lib/report.mjs`:
```js
// Markdown summary of qa/run-qa.mjs results (tested in report.test.mjs).
export function summarize(results, meta = {}) {
  const areas = new Map();
  for (const r of results) {
    const a = areas.get(r.area) ?? { pass: 0, fail: 0 };
    if (r.pass) a.pass++;
    else a.fail++;
    areas.set(r.area, a);
  }
  const failed = results.filter((r) => !r.pass);
  const lines = ['# QA summary', ''];
  if (meta.date) lines.push(`- Date: ${meta.date}`);
  if (meta.base) lines.push(`- Base URL: ${meta.base}`);
  if (meta.site) lines.push(`- SITE_URL expected in the head: ${meta.site}`);
  if (meta.target) lines.push(`- Expected build target: ${meta.target}`);
  lines.push(`- Checks: ${results.length - failed.length}/${results.length} passed`, '', '| Area | Passed | Failed |', '|---|---|---|');
  for (const [area, a] of [...areas].sort(([x], [y]) => x.localeCompare(y))) lines.push(`| ${area} | ${a.pass} | ${a.fail} |`);
  lines.push('', '## Failures', '');
  if (failed.length) lines.push(...failed.map((r) => `- [${r.area}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
  else lines.push('None.');
  return lines.join('\n') + '\n';
}
```

Run: `npx vitest run qa/lib`
Expected: PASS. 17 tests in `checks.test.mjs` and 4 in `report.test.mjs`.

- [ ] **Step 3: Write the QA runner**

Create `qa/run-qa.mjs`:
```js
// Functional QA for the Atlas Alshraa site (adapted from afham-site/qa/run-qa.mjs).
// Drives the installed Chrome through both pages × 8 widths × motion on/off, exercises every
// control in the DOM contract (C9), runs axe-core and checks the SEO head.
// Usage: npm run build, start `npx vite preview --port 4173`, then `npm run qa` (or node qa/run-qa.mjs [baseUrl]).
// Env: CHROME_PATH; SITE_URL (must match the build, default http://localhost:4173);
//      QA_TARGET=staging|production (draft badges expected or forbidden, default staging).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { parseHead } from '../scripts/lib/head.mjs';
import { normalizeSiteUrl } from '../scripts/lib/seo.mjs';
import {
  CRANES,
  decodedHref,
  expectedForFilter,
  expectedMotion,
  isEncodedHref,
  nextKey,
  normModel,
  photoIdFromUrl,
  prevKey,
} from './lib/checks.mjs';
import { summarize } from './lib/report.mjs';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const SITE = normalizeSiteUrl(process.env.SITE_URL);
const TARGET = process.env.QA_TARGET === 'production' ? 'production' : 'staging';
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('./reports/', import.meta.url).pathname;
const SCREENS = `${OUT}screens/`;
const PAGES = [
  { id: 'ar', path: '/', lang: 'ar', dir: 'rtl', other: '/en/', otherLang: 'en' },
  { id: 'en', path: '/en/', lang: 'en', dir: 'ltr', other: '/', otherLang: 'ar' },
];
const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 1920];
const HEIGHTS = { 320: 640, 375: 812, 414: 896, 768: 1024, 1024: 768, 1280: 800, 1440: 900, 1920: 1080 };
const MOTIONS = ['on', 'off'];
const CONTROL_CASES = [
  { width: 1440, touch: false, reduced: false },
  { width: 1440, touch: false, reduced: true },
  { width: 375, touch: true, reduced: false },
];

const results = [];
function record(area, name, pass, detail = '') {
  results.push({ area, name, pass: !!pass, detail: String(detail ?? '') });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${area}] ${name}${detail ? ` — ${detail}` : ''}`);
}
async function step(area, name, fn) {
  try {
    const r = await fn();
    record(area, name, r.pass, r.detail ?? '');
  } catch (e) {
    record(area, name, false, `threw: ${e instanceof Error ? e.message : String(e)}`);
  }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Preflight ────────────────────────────────────────────────────────────────
const ping = await fetch(`${BASE}/`).catch(() => null);
if (!ping?.ok) {
  console.error(`Cannot reach ${BASE}/. Build, then start the preview: npx vite preview --port 4173`);
  process.exit(2);
}
const axeSource = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
await mkdir(SCREENS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run', '--no-default-browser-check'] });

/** A fresh, isolated page with listeners for errors, failed requests and external opens. */
async function open(path, { width = 1440, height = 900, touch = false, reduced = false, js = true, intercept = false } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const problems = { console: [], page: [], requests: [], external: [] };
  page.on('console', (m) => {
    const text = m.text();
    if (m.type() === 'error') {
      // Headless Chrome cannot launch mailto:/whatsapp: handlers; that is the form working, not an error.
      if (/Failed to launch '(mailto|whatsapp|tel):/i.test(text)) problems.external.push(text);
      else problems.console.push(text);
    } else if (m.type() === 'warning' && /hydrat|did not match|server rendered/i.test(text)) {
      problems.console.push(`warning: ${text}`);
    }
  });
  page.on('pageerror', (e) => problems.page.push(String(e)));
  page.on('requestfailed', (r) => {
    if (!r.url().startsWith('data:')) problems.requests.push(`${r.failure()?.errorText ?? 'failed'} ${r.url()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) problems.requests.push(`${r.status()} ${r.url()}`);
  });
  if (intercept) {
    // Navigations to WhatsApp are recorded and answered with 204, so the page stays put.
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(url)) {
        problems.external.push(url);
        req.respond({ status: 204, body: '' });
      } else {
        req.continue();
      }
    });
  }
  await page.setJavaScriptEnabled(js);
  await page.setViewport({ width, height, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);
  await page.evaluateOnNewDocument(() => {
    window.__opened = [];
    window.open = (...args) => {
      window.__opened.push(String(args[0] ?? ''));
      return null;
    };
  });
  await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 60000 });
  await wait(2600); // the hero intro is still by 2.0 s; the CSS fallback un-hides at 3 s
  return { page, context, problems };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await wait(600);
}

/** Real click after centring the element, so the fixed request bar never covers it. */
async function tap(page, target) {
  const el = typeof target === 'string' ? await page.$(target) : target;
  if (!el) throw new Error(`not found: ${target}`);
  await el.evaluate((e) => e.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await wait(400);
  await el.click();
  return el;
}

async function firstVisible(page, selector) {
  for (const h of await page.$$(selector)) if (await h.evaluate((e) => e.checkVisibility())) return h;
  return null;
}

const errorsOf = (s) => [...s.problems.console, ...s.problems.page].join(' | ');

// ── 1. Every page × width × motion ──────────────────────────────────────────
for (const p of PAGES) {
  for (const width of WIDTHS) {
    for (const motion of MOTIONS) {
      const touch = width < 1024;
      const reduced = motion === 'off';
      const tag = `${p.id} @${width} motion ${motion}`;
      const s = await open(p.path, { width, height: HEIGHTS[width], touch, reduced });
      const { page, problems } = s;
      try {
        if (width >= 1024) {
          await step('hero', `${tag} sling WhatsApp button hangs in the hero, ≥ 44 px`, async () => {
            const r = await page.evaluate(() => {
              const b = document.querySelector('[data-testid="sling-whatsapp"]');
              const hero = document.querySelector('[data-hero]');
              if (!b || !hero) return { ok: false, detail: b ? 'no [data-hero]' : 'no [data-testid="sling-whatsapp"]' };
              const r = b.getBoundingClientRect();
              const h = hero.getBoundingClientRect();
              const href = b.getAttribute('href') ?? '';
              const inHero = r.top >= h.top - 1 && r.bottom <= h.bottom + 1 && r.left >= h.left - 1 && r.right <= h.right + 1;
              const big = r.width >= 44 && r.height >= 44;
              const link = href ? /^(https:\/\/wa\.me\/|mailto:)/.test(href) : b.tagName === 'BUTTON';
              return {
                ok: b.checkVisibility() && inHero && big && link,
                detail: `${Math.round(r.width)}×${Math.round(r.height)} inHero=${inHero} href=${href.slice(0, 48)}`,
              };
            });
            return { pass: r.ok, detail: r.detail };
          });
        }
        const motionAttr = await page.evaluate(() => document.documentElement.dataset.motion ?? null);
        const want = expectedMotion({ width, touch, reduced });
        record('motion', `${tag} motion context is "${want}"`, motionAttr === want, `data-motion=${motionAttr}`);

        await scrollThrough(page);
        const m = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
          missingAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          hidden: [...document.querySelectorAll('[data-intro], [data-split], [data-reveal]')].filter((e) => {
            const cs = getComputedStyle(e);
            return cs.opacity !== '1' || cs.visibility === 'hidden';
          }).length,
          lenis: document.documentElement.classList.contains('lenis'),
        }));
        record('layout', `${tag} no horizontal overflow`, m.overflow <= 0, m.overflow > 0 ? `${m.overflow}px wider than the viewport` : '');
        record('page', `${tag} lang="${p.lang}" dir="${p.dir}"`, m.lang === p.lang && m.dir === p.dir, `${m.lang}/${m.dir}`);
        record('assets', `${tag} images load`, m.brokenImages.length === 0, m.brokenImages.join(', '));
        record('a11y', `${tag} every <img> has alt`, m.missingAlt === 0, m.missingAlt ? `${m.missingAlt} missing` : '');
        if (reduced) {
          record('motion', `${tag} reduced motion: all content visible, no smooth scroll`, m.hidden === 0 && !m.lenis, `hidden=${m.hidden} lenis=${m.lenis}`);
        } else {
          record('motion', `${tag} reveals have finished after scrolling through`, m.hidden === 0, `hidden=${m.hidden}`);
        }

        await page.evaluate(axeSource);
        const violations = await page.evaluate(async () => {
          const r = await window.axe.run(document, { resultTypes: ['violations'] });
          return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, where: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
        });
        const fmt = (vs) => vs.map((v) => `${v.id} (${v.impact}) ×${v.nodes}: ${v.where.join(' ; ')}`).join(' | ');
        const severe = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        const minor = violations.filter((v) => v.impact !== 'serious' && v.impact !== 'critical');
        record('axe', `${tag} no serious or critical axe violations`, severe.length === 0, fmt(severe));
        if (minor.length) record('info', `${tag} axe moderate/minor (not blocking, review)`, true, fmt(minor));

        await page.screenshot({ path: `${SCREENS}${p.id}-${width}-${motion}.png`, fullPage: true });
        record('errors', `${tag} no console errors, page errors or hydration warnings`, !problems.console.length && !problems.page.length, errorsOf(s));
        record('network', `${tag} no failed requests or 4xx/5xx`, problems.requests.length === 0, problems.requests.join(' | '));
      } catch (e) {
        record('run', `${tag} case completed`, false, e instanceof Error ? e.message : String(e));
      } finally {
        await s.context.close();
      }
    }
  }
}

// ── 2. Controls (desktop motion on/off, phone) ─────────────────────────────
async function lightboxCheck(page, dir) {
  const strip = await page.$('[data-sites-strip]');
  if (!strip) return { pass: false, detail: 'no [data-sites-strip]' };
  const buttons = await strip.$$('[data-testid="site-photo"]');
  if (buttons.length < 2) return { pass: false, detail: `${buttons.length} site photo(s) in the first strip` };
  const ids = [];
  for (const b of buttons) {
    ids.push(
      photoIdFromUrl(
        await b.evaluate((el) => {
          const img = el.querySelector('img');
          return img?.currentSrc || img?.getAttribute('src') || el.querySelector('source')?.getAttribute('srcset') || '';
        }),
      ),
    );
  }
  const shown = () =>
    page.evaluate(() => {
      const d = document.querySelector('dialog[data-testid="lightbox"]');
      const img = d ? [...d.querySelectorAll('img')].find((i) => i.checkVisibility()) : null;
      return { open: !!d?.open, src: img ? img.currentSrc || img.getAttribute('src') || '' : '' };
    });
  await buttons[0].evaluate((el) => {
    el.setAttribute('data-qa-opener', '');
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    el.focus();
  });
  await wait(300);
  await page.keyboard.press('Enter');
  await wait(700);
  const s0 = await shown();
  await page.keyboard.press(nextKey(dir));
  await wait(600);
  const s1 = await shown();
  await page.keyboard.press(prevKey(dir));
  await wait(600);
  const s2 = await shown();
  await page.keyboard.press('Escape');
  await wait(500);
  const after = await page.evaluate(() => ({
    open: !!document.querySelector('dialog[data-testid="lightbox"]')?.open,
    focusBack: !!document.activeElement?.hasAttribute('data-qa-opener'),
  }));
  await buttons[0].evaluate((el) => el.removeAttribute('data-qa-opener'));
  const got = [s0, s1, s2].map((s) => photoIdFromUrl(s.src));
  const pass = s0.open && got[0] === ids[0] && got[1] === ids[1] && got[2] === ids[0] && !after.open && after.focusBack;
  return { pass, detail: `strip ${ids.slice(0, 3).join(',')}… shown ${got.join('→')} opened=${s0.open} closed=${!after.open} focusBack=${after.focusBack}` };
}

async function filterCheck(page) {
  const visible = () =>
    page.$$eval('[data-testid="crane-card"]', (cards) => cards.filter((c) => c.checkVisibility()).map((c) => c.dataset.crane).sort());
  const all = await visible();
  const values = await page.$$eval('[data-testid="filter-chip"]', (chips) => chips.map((c) => c.dataset.value));
  if (!values.includes('all')) return { pass: false, detail: `chips: ${values.join(', ') || 'none'} (no "all")` };
  const lines = [];
  let ok = true;
  let changed = false;
  for (const value of [...values.filter((v) => v !== 'all'), 'all']) {
    const chip = await page.$(`[data-testid="filter-chip"][data-value="${value}"]`);
    await tap(page, chip);
    await wait(1200); // Flip reflow
    const got = await visible();
    const want = expectedForFilter(all, value);
    const pressed = await chip.evaluate((c) => c.getAttribute('aria-pressed'));
    const same = got.join() === want.join();
    if (got.length !== all.length) changed = true;
    ok = ok && same && pressed === 'true';
    lines.push(`${value}: ${got.length}${same ? '' : ` (want ${want.join('/')})`}${pressed === 'true' ? '' : ' aria-pressed≠true'}`);
  }
  return { pass: ok && changed, detail: `all=${all.length}; ${lines.join('; ')}` };
}

async function emptySubmitCheck(page) {
  await tap(page, '[data-testid="form-submit"]');
  await wait(600);
  return page.evaluate(() => {
    const sum = document.querySelector('[data-testid="form-error-summary"]');
    const links = sum ? [...sum.querySelectorAll('a[href^="#"]')] : [];
    const targetsOk = links.every((a) => !!document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))));
    const invalid = ['weight', 'phone'].filter(
      (n) => document.querySelector(`[data-testid="request-form"] [name="${n}"]`)?.getAttribute('aria-invalid') === 'true',
    );
    const focus = document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName;
    return {
      pass: !!sum && sum.checkVisibility() && links.length >= 2 && targetsOk && invalid.length === 2,
      detail: `summary=${!!sum} links=${links.length} targetsOk=${targetsOk} invalid=${invalid.join(',')} focus=${focus}`,
    };
  });
}

async function chooseCrane(page) {
  const buttons = await page.$$('[data-testid="request-crane-button"]');
  if (!buttons.length) throw new Error('no [data-testid="request-crane-button"]');
  const ids = await Promise.all(buttons.map((b) => b.evaluate((e) => e.dataset.crane)));
  const index = Math.max(0, ids.indexOf('gmk6350'));
  await tap(page, buttons[index]);
  await wait(1800); // chip flight into the bar
  return ids[index];
}

async function barHref(page) {
  const href = await page.$eval('[data-testid="bar-whatsapp"]', (a) => a.getAttribute('href'));
  if (href) return href;
  await page.evaluate(() => {
    window.__opened = [];
  });
  await page.$eval('[data-testid="bar-whatsapp"]', (b) => b.click());
  await wait(300);
  return page.evaluate(() => window.__opened.at(-1) ?? '');
}

const formCrane = (page) =>
  page
    .$eval('[data-testid="request-form"] [name="crane"]', (el) => ({ value: el.value, text: el.selectedOptions?.[0]?.textContent ?? '' }))
    .catch(() => null);

async function requestFlowCheck(page) {
  const id = await chooseCrane(page);
  const model = CRANES[id]?.model ?? id;
  const chip = await page.$eval('[data-testid="bar-chip"]', (e) => e.textContent ?? '').catch(() => null);
  const href = await barHref(page);
  const form = await formCrane(page);
  const chipOk = chip !== null && normModel(chip).includes(normModel(model));
  const hrefOk = normModel(decodedHref(href)).includes(normModel(model)) && isEncodedHref(href);
  const formOk = !!form && (form.value === id || normModel(form.value + form.text).includes(normModel(model)));
  return {
    pass: chipOk && hrefOk && formOk,
    detail: `crane=${id} chip="${(chip ?? 'none').trim()}" hrefOk=${hrefOk} (${href.slice(0, 60)}…) form=${JSON.stringify(form)}`,
  };
}

async function clearChipCheck(page) {
  await tap(page, '[data-testid="bar-chip-clear"]');
  await wait(800);
  const chip = await page.$('[data-testid="bar-chip"]');
  const chipVisible = chip ? await chip.evaluate((e) => e.checkVisibility()) : false;
  const decoded = normModel(decodedHref(await barHref(page)));
  const stillNamed = Object.values(CRANES).some((c) => decoded.includes(normModel(c.model)));
  const form = await formCrane(page);
  return { pass: !chipVisible && !stillNamed, detail: `chip=${chipVisible ? 'still visible' : 'gone'} hrefNamesCrane=${stillNamed} formCrane=${JSON.stringify(form)}` };
}

async function validSubmitCheck(page, problems) {
  const id = await chooseCrane(page);
  const model = CRANES[id]?.model ?? id;
  const weight = await page.$('[data-testid="form-weight"]');
  const phone = await page.$('[data-testid="form-phone"]');
  if (!weight || !phone) return { pass: false, detail: 'form-weight or form-phone missing' };
  // Focus and select any existing text, so typing replaces it (works for React-controlled inputs).
  await weight.evaluate((e) => {
    e.scrollIntoView({ block: 'center', behavior: 'instant' });
    e.focus();
    e.select?.();
  });
  await weight.type('٣٥٠');
  await phone.evaluate((e) => {
    e.focus();
    e.select?.();
  });
  await phone.type('0912345678');
  await page.evaluate(() => {
    window.__opened = [];
  });
  const externalBefore = problems.external.length;
  await tap(page, '[data-testid="form-submit"]');
  await wait(1200);
  const state = await page.evaluate(() => ({
    weightInvalid: document.querySelector('[data-testid="form-weight"]')?.getAttribute('aria-invalid') === 'true',
    phoneInvalid: document.querySelector('[data-testid="form-phone"]')?.getAttribute('aria-invalid') === 'true',
    success: !!document.querySelector('[data-testid="form-success"]')?.checkVisibility(),
    opened: window.__opened.slice(),
  }));
  const form = await formCrane(page);
  const sent = [...state.opened, ...problems.external.slice(externalBefore)].map(decodedHref).join('\n');
  const carries350 = /(^|\D)350(\D|$)/.test(sent);
  const carriesModel = normModel(sent).includes(normModel(model));
  const westernDigits = !/[٠-٩]/.test(sent);
  const prefilled = !!form && (form.value === id || normModel(form.value + form.text).includes(normModel(model)));
  const delivered = (sent.length > 0 && carries350 && carriesModel && westernDigits) || state.success;
  return {
    pass: !state.weightInvalid && !state.phoneInvalid && prefilled && delivered,
    detail: `weightInvalid=${state.weightInvalid} phoneInvalid=${state.phoneInvalid} prefilled=${prefilled} success=${state.success} message350=${carries350} messageModel=${carriesModel} westernDigits=${westernDigits} opened=${sent.slice(0, 80).replace(/\n/g, ' / ')}`,
  };
}

async function backToTopCheck(page, reduced) {
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await wait(1200);
  const before = await page.evaluate(() => Math.round(window.scrollY));
  await tap(page, '[data-testid="back-to-top"]');
  await wait(reduced ? 800 : 2800);
  const after = await page.evaluate(() => Math.round(window.scrollY));
  return { pass: before > 500 && after <= 2, detail: `scrollY ${before} → ${after}` };
}

async function langSwitchCheck(page, p) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await wait(500);
  let link = await firstVisible(page, '[data-testid="lang-switch"]');
  let viaMenu = false;
  if (!link) {
    const menu = await firstVisible(page, '[data-testid="menu-open"]');
    if (menu) {
      await menu.click();
      await wait(600);
      link = await firstVisible(page, '[data-testid="lang-switch"]');
      viaMenu = true;
    }
  }
  if (!link) return { pass: false, detail: 'no visible [data-testid="lang-switch"] in the header or the menu' };
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }), link.click()]);
  const after = await page.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang, dir: document.documentElement.dir }));
  return { pass: after.path === p.other && after.lang === p.otherLang, detail: `${JSON.stringify(after)}${viaMenu ? ' (via menu)' : ''}` };
}

for (const p of PAGES) {
  for (const c of CONTROL_CASES) {
    const tag = `${p.id} @${c.width} motion ${c.reduced ? 'off' : 'on'}`;
    const s = await open(p.path, { width: c.width, height: HEIGHTS[c.width], touch: c.touch, reduced: c.reduced, intercept: true });
    const { page } = s;
    const dir = await page.evaluate(() => document.documentElement.dir);
    if (c === CONTROL_CASES[0]) {
      await step('truth', `${p.id} draft badges ${TARGET === 'staging' ? 'shown (staging)' : 'absent (production)'}`, async () => {
        const n = await page.$$eval('[data-testid="draft-badge"]', (els) => els.length);
        return { pass: TARGET === 'staging' ? n >= 1 : n === 0, detail: `${n} badge(s)` };
      });
      await step('links', `${p.id} every in-page #link has a target`, async () => {
        const missing = await page.$$eval('a[href^="#"]', (as) =>
          [...new Set(as.map((a) => a.getAttribute('href')))].filter((h) => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))),
        );
        return { pass: missing.length === 0, detail: missing.join(', ') };
      });
    }
    await step('lightbox', `${tag} lightbox: Enter opens, arrows follow ${dir}, Esc closes and returns focus`, () => lightboxCheck(page, dir));
    await step('filters', `${tag} filter chips show the right cranes and change the count`, () => filterCheck(page));
    await step('form', `${tag} empty submit shows the error summary with working links`, () => emptySubmitCheck(page));
    await step('request', `${tag} Request this crane → bar chip, encoded WhatsApp text, form pre-fill`, () => requestFlowCheck(page));
    await step('request', `${tag} bar chip ✕ clears the crane`, () => clearChipCheck(page));
    await step('form', `${tag} weight «٣٥٠» + phone accepted; message carries 350 and the crane`, () => validSubmitCheck(page, s.problems));
    await step('nav', `${tag} back to top returns to scrollY 0`, () => backToTopCheck(page, c.reduced));
    await step('lang', `${tag} language switch opens ${p.other}`, () => langSwitchCheck(page, p));
    record('errors', `${tag} interaction run has no console/page errors`, !s.problems.console.length && !s.problems.page.length, errorsOf(s));
    await s.context.close();
  }
}

// ── 3. Phone menu: opens as a modal, Esc closes, focus returns ─────────────
for (const p of PAGES) {
  for (const width of [320, 375, 414]) {
    const tag = `${p.id} @${width}`;
    const s = await open(p.path, { width, height: HEIGHTS[width], touch: true });
    const { page } = s;
    await step('menu', `${tag} menu button opens the menu as a modal dialog`, async () => {
      const btn = await firstVisible(page, '[data-testid="menu-open"]');
      if (!btn) return { pass: false, detail: 'no visible [data-testid="menu-open"]' };
      await btn.focus();
      await page.keyboard.press('Enter');
      await wait(600);
      const r = await page.evaluate(() => {
        const d = document.querySelector('dialog[data-testid="menu-dialog"]');
        return { open: !!d?.open, modal: !!d?.matches(':modal') };
      });
      return { pass: r.open && r.modal, detail: JSON.stringify(r) };
    });
    await step('menu', `${tag} Esc closes the menu and focus returns to the menu button`, async () => {
      await page.keyboard.press('Escape');
      await wait(500);
      const r = await page.evaluate(() => ({
        open: !!document.querySelector('dialog[data-testid="menu-dialog"]')?.open,
        focus: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
      }));
      return { pass: !r.open && r.focus === 'menu-open', detail: JSON.stringify(r) };
    });
    record('errors', `${tag} menu run has no console/page errors`, !s.problems.console.length && !s.problems.page.length, errorsOf(s));
    await s.context.close();
  }
}

// ── 4. Keyboard: skip link, visible focus, focus never under the bar ──────
for (const p of PAGES) {
  for (const c of [{ width: 1440, touch: false }, { width: 375, touch: true }]) {
    const tag = `${p.id} @${c.width}`;
    const s = await open(p.path, { width: c.width, height: HEIGHTS[c.width], touch: c.touch });
    const { page } = s;
    await step('keyboard', `${tag} first Tab reaches the skip link to #main`, async () => {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => ({ href: document.activeElement?.getAttribute('href') ?? null, visible: !!document.activeElement?.checkVisibility() }));
      return { pass: f.href === '#main' && f.visible, detail: JSON.stringify(f) };
    });
    await step('keyboard', `${tag} focus ring visible on the next 12 tab stops`, async () => {
      let visible = 0;
      const misses = [];
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        await wait(120);
        const r = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return { ok: false, who: 'body' };
          const cs = getComputedStyle(el);
          const ok = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
          return { ok, who: el.getAttribute('data-testid') ?? ((el.textContent ?? '').trim().slice(0, 20) || el.tagName) };
        });
        if (r.ok) visible++;
        else misses.push(r.who);
      }
      return { pass: visible === 12, detail: `${visible}/12${misses.length ? ` without ring: ${misses.join(', ')}` : ''}` };
    });
    await step('keyboard', `${tag} focused form fields are never hidden by the request bar`, async () => {
      const fields = await page.$$('[data-testid="request-form"] :is(input:not([type=hidden]), select, textarea, button)');
      if (!fields.length) return { pass: false, detail: 'no form fields' };
      await fields[0].focus();
      await wait(400);
      const hidden = [];
      for (let i = 0; i < fields.length; i++) {
        const who = await page.evaluate(() => {
          const el = document.activeElement;
          const bar = document.querySelector('[data-request-bar]');
          if (!el || el === document.body || !bar || el.closest('[data-request-bar]')) return '';
          const a = el.getBoundingClientRect();
          const b = bar.getBoundingClientRect();
          const underBar = a.bottom > b.top && a.top < b.bottom && a.right > b.left && a.left < b.right;
          const offScreen = a.top < 0 || a.bottom > window.innerHeight;
          return underBar || offScreen ? el.getAttribute('name') ?? el.getAttribute('data-testid') ?? el.tagName.toLowerCase() : '';
        });
        if (who) hidden.push(who);
        await page.keyboard.press('Tab');
        await wait(400);
      }
      return { pass: hidden.length === 0, detail: hidden.join(', ') };
    });
    await s.context.close();
  }
}

// ── 5. Without JavaScript the prerendered page is complete ─────────────────
for (const p of PAGES) {
  for (const width of [375, 1440]) {
    const s = await open(p.path, { width, height: HEIGHTS[width], touch: width < 1024, js: false });
    await step('nojs', `${p.id} @${width} no-JS: hero, Hoist, cards and form present and visible`, async () => {
      const m = await s.page.evaluate(() => ({
        hero: !!document.querySelector('[data-hero]'),
        h1: (document.querySelector('h1')?.textContent ?? '').trim().length,
        hoist: document.querySelectorAll('[data-hoist-item]').length,
        cards: document.querySelectorAll('[data-testid="crane-card"]').length,
        form: !!document.querySelector('[data-testid="request-form"]'),
        hidden: [...document.querySelectorAll('[data-intro], [data-split], [data-reveal], [data-hero-photo] img')].filter((e) => {
          const cs = getComputedStyle(e);
          return cs.opacity !== '1' || cs.visibility === 'hidden';
        }).length,
      }));
      return { pass: m.hero && m.h1 > 10 && m.hoist > 0 && m.hoist === m.cards && m.form && m.hidden === 0, detail: JSON.stringify(m) };
    });
    await s.context.close();
  }
}

// ── 6. Head, SEO files and search terms ─────────────────────────────────────
for (const p of PAGES) {
  await step('seo', `${p.id} head: lang, title, description, canonical, hreflang, Open Graph, JSON-LD, prerendered`, async () => {
    const res = await fetch(BASE + p.path);
    const html = await res.text();
    const h = parseHead(html);
    const bad = [];
    if (h.lang !== p.lang || h.dir !== p.dir) bad.push(`lang/dir ${h.lang}/${h.dir}`);
    if (h.title.length < 20 || h.title.length > 70) bad.push(`title length ${h.title.length}`);
    const d = h.meta.description ?? '';
    if (d.length < 60 || d.length > 160) bad.push(`description length ${d.length}`);
    if (h.canonical !== SITE + p.path) bad.push(`canonical ${h.canonical}`);
    if (h.meta['og:url'] !== SITE + p.path) bad.push(`og:url ${h.meta['og:url']}`);
    const want = { ar: `${SITE}/`, en: `${SITE}/en/`, 'x-default': `${SITE}/` };
    for (const [k, v] of Object.entries(want)) if (h.alternates[k] !== v) bad.push(`hreflang ${k}=${h.alternates[k]}`);
    if (Object.keys(h.alternates).length !== 3) bad.push(`${Object.keys(h.alternates).length} hreflang links`);
    if (h.meta['og:image'] !== `${SITE}/og-${p.lang}.jpg`) bad.push(`og:image ${h.meta['og:image']}`);
    if (h.meta['og:image:width'] !== '1200' || h.meta['og:image:height'] !== '630') bad.push('og:image size');
    if (h.meta['twitter:card'] !== 'summary_large_image') bad.push('twitter:card');
    if (html.includes('%SITE_URL%')) bad.push('unfilled %SITE_URL%');
    if (html.includes('<!--app-->') || html.includes('<!--head-->')) bad.push('prerender marker left in HTML');
    if (!html.includes('data-hero')) bad.push('not prerendered (no data-hero in the HTML)');
    const ld = h.jsonLd[0];
    if (!ld || h.jsonLdErrors.length) bad.push(`JSON-LD ${h.jsonLdErrors.join(', ') || 'missing'}`);
    else {
      const types = [].concat(ld['@type']);
      if (!types.includes('Organization') || !types.includes('LocalBusiness')) bad.push(`@type ${types.join(',')}`);
      if (ld.email !== 'atlasalsahralibya@gmail.com') bad.push(`email ${ld.email}`);
      if (!Array.isArray(ld.sameAs) || !ld.sameAs.some((u) => /facebook\.com|fb\.com/.test(u))) bad.push('sameAs has no Facebook URL');
      if (ld.url !== `${SITE}/`) bad.push(`url ${ld.url}`);
    }
    return { pass: res.ok && bad.length === 0, detail: bad.join('; ') };
  });
}
await step('seo', 'ar: «رافعة» and «كرين» in the meta tags and in the page text (spec §10)', async () => {
  const html = await (await fetch(`${BASE}/`)).text();
  const h = parseHead(html);
  const metaText = `${h.meta.keywords ?? ''} ${h.meta.description ?? ''}`;
  const body = html.replace(/<head[\s\S]*?<\/head>/i, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
  const inMeta = ['رافعة', 'كرين'].filter((w) => metaText.includes(w));
  const inBody = ['رافعة', 'كرين'].filter((w) => body.includes(w));
  return { pass: inMeta.length === 2 && inBody.length === 2, detail: `meta: ${inMeta.join(',') || 'none'} · body: ${inBody.join(',') || 'none'}` };
});
for (const [path, type] of [
  ['/robots.txt', 'text/plain'],
  ['/sitemap.xml', 'xml'],
  ['/og-ar.jpg', 'image/jpeg'],
  ['/og-en.jpg', 'image/jpeg'],
  ['/brand/badge.png', 'image/png'],
]) {
  await step('seo', `${path} is served as ${type}`, async () => {
    const r = await fetch(BASE + path);
    const ct = r.headers.get('content-type') ?? '';
    return { pass: r.ok && ct.includes(type), detail: `${r.status} ${ct}` };
  });
}
await step('seo', 'robots.txt points at the sitemap; the sitemap lists both pages', async () => {
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const ok =
    robots.includes(`Sitemap: ${SITE}/sitemap.xml`) &&
    !robots.includes('%SITE_URL%') &&
    sitemap.includes(`<loc>${SITE}/</loc>`) &&
    sitemap.includes(`<loc>${SITE}/en/</loc>`);
  return { pass: ok, detail: ok ? '' : `robots: ${robots.trim().replace(/\n/g, ' / ')}` };
});

// ── Results ─────────────────────────────────────────────────────────────────
await browser.close();
const failed = results.filter((r) => !r.pass);
const meta = { date: new Date().toISOString(), base: BASE, site: SITE, target: TARGET };
await writeFile(`${OUT}results.json`, JSON.stringify({ ...meta, total: results.length, failed: failed.length, results }, null, 2));
await writeFile(`${OUT}summary.md`, summarize(results, meta));
console.log(`\n${results.length - failed.length}/${results.length} checks passed. See qa/reports/summary.md`);
process.exit(failed.length ? 1 : 0);
```

- [ ] **Step 4: Syntax check**

Run: `node --check qa/run-qa.mjs && echo ok`
Expected: `ok`.

- [ ] **Step 5: Run the QA**

In short: `npm run build && npx vite preview --port 4173 &`, then `npm run qa`. The longer form below also stops any stale preview, waits for the server and keeps a log:
```bash
npm run build
```
Start the preview (Conventions), then:
```bash
(set -o pipefail; npm run qa 2>&1 | tee qa/reports/qa-console.txt); echo "exit=$?"
```
Expected:
- `PASS` / `FAIL` lines stream while it runs (about 8–12 minutes).
- At the end: `N/M checks passed. See qa/reports/summary.md`.
- Files written: `qa/reports/results.json`, `qa/reports/summary.md`, and 32 screenshots `qa/reports/screens/<ar|en>-<width>-<on|off>.png`. Check with `ls qa/reports/screens | wc -l`, which should give 32 plus the 2 `nojs-*` files from E.1.

`pipefail` makes `exit=` the QA script's own exit code: 0 means every check passed, 1 means at least one FAIL, and 2 means the preview could not be reached.

Do not fix anything in this task. Copy the final summary line and the "Failures" list from `qa/reports/summary.md` into your notes for E.5. Leave the preview running for Step 6.

- [ ] **Step 6: Run the Impeccable design detector (no install needed)**

The preview is still running.
```bash
npx impeccable detect src/ > qa/reports/impeccable-src.txt 2>&1; echo "exit=$?"
npx impeccable detect http://localhost:4173/ > qa/reports/impeccable-ar.txt 2>&1; echo "exit=$?"
npx impeccable detect http://localhost:4173/en/ > qa/reports/impeccable-en.txt 2>&1; echo "exit=$?"
cat qa/reports/impeccable-src.txt qa/reports/impeccable-ar.txt qa/reports/impeccable-en.txt
```
Expected: `exit=0` for all three, meaning no findings.
- `exit=2`: there are findings, listed by rule id. Fix them in E.5, or ignore one only if the spec requires the flagged choice. Use `npx impeccable ignores add-value <rule-id> <value> --reason "<spec section>"`. Never ignore contrast, heading-order or tiny-text rules.
- `exit=1`: the target could not be scanned. Check that the preview answers.

Record the three exit codes and the findings. E.8 copies them into `docs/qa-report.md` §6. Stop the preview.

- [ ] **Step 7: Run the unit tests and commit**

```bash
npm test
git add qa/lib qa/run-qa.mjs
git commit -m "test(qa): functional QA across pages, widths and motion with axe and SEO checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
Expected: all unit tests pass and the commit is created. QA failures are not a reason to hold this commit: the script is the deliverable here, and the fixes come in E.5.

---
### Task E.4: Lighthouse medians and the bundle budget

**Budgets** (spec §1 and §9):
- Lighthouse scores: ≥ 90 in all four categories, on mobile and desktop, for both pages.
- LCP ≤ 2000 ms. CLS ≤ 0.05. TBT ≤ 150 ms.
- JS ≤ 110 KB gzip (the Hoist chunk is lazy and excluded). CSS ≤ 25 KB gzip.
- First load for the Arabic page on mobile ≤ 1 MB.
- Hero AVIF ≤ 80 KB on mobile and ≤ 120 KB on desktop.

**Notes:**
- **KB is 1,000 bytes and MB is 1,000,000 bytes.** This is stricter than the binary units, and the report states it.
- **INP ≤ 150 ms cannot be measured in a Lighthouse navigation run.** It is checked on real phones (E.8 §11). TBT is its lab proxy.

**Files:**
- Create: `qa/lib/budgets.mjs`, `qa/lib/budgets.test.mjs`, `qa/bundle-budget.mjs`, `qa/lighthouse.mjs`

- [ ] **Step 1: Write the failing tests for the pure budget helpers**

Create `qa/lib/budgets.test.mjs`:
```js
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { BUDGETS, assetRefs, checkBudgets, checkBundle, firstSnippet, median, medianResult, toMarkdown } from './budgets.mjs';

const GOOD = { performance: 95, accessibility: 100, bestPractices: 100, seo: 100, lcp: 1800, cls: 0.01, tbt: 90 };

describe('median', () => {
  it('takes the middle of an odd list', () => expect(median([3, 1, 2])).toBe(2));
  it('averages the middle pair of an even list', () => expect(median([4, 1, 3, 2])).toBe(2.5));
  it('ignores runs that produced no number', () => expect(median([NaN, 5, undefined, 7])).toBe(6));
  it('is NaN when nothing is left', () => expect(median([])).toBeNaN());
  it('does not reorder the input', () => {
    const xs = [3, 1, 2];
    median(xs);
    expect(xs).toEqual([3, 1, 2]);
  });
});

describe('checkBudgets', () => {
  it('passes a result inside every budget', () => expect(checkBudgets(GOOD, BUDGETS).every((c) => c.pass)).toBe(true));
  it('treats the limits as inclusive', () => {
    const edge = { performance: 90, accessibility: 90, bestPractices: 90, seo: 90, lcp: 2000, cls: 0.05, tbt: 150 };
    expect(checkBudgets(edge, BUDGETS).every((c) => c.pass)).toBe(true);
  });
  it('fails each metric that is over its budget', () => {
    const bad = checkBudgets({ ...GOOD, performance: 89, lcp: 2001, cls: 0.06, tbt: 151 }, BUDGETS)
      .filter((c) => !c.pass)
      .map((c) => c.metric);
    expect(bad).toEqual(['performance', 'lcp', 'cls', 'tbt']);
  });
  it('fails a missing value instead of passing it', () => {
    expect(checkBudgets({ ...GOOD, seo: NaN }, BUDGETS).find((c) => c.metric === 'seo')?.pass).toBe(false);
  });
});

describe('medianResult', () => {
  it('takes the median of each metric separately', () => {
    const runs = [
      { ...GOOD, performance: 90, lcp: 2100 },
      { ...GOOD, performance: 99, lcp: 1500 },
      { ...GOOD, performance: 95, lcp: 1800 },
    ];
    const m = medianResult(runs);
    expect([m.performance, m.lcp]).toEqual([95, 1800]);
  });
  it('skips a run that errored', () => expect(medianResult([{ error: 'x' }, GOOD]).performance).toBe(95));
});

describe('assetRefs', () => {
  it('finds the entry script, module preloads and stylesheets', () => {
    const html =
      '<script type="module" crossorigin src="/assets/index-a1.js"></script>' +
      '<link rel="modulepreload" crossorigin href="/assets/react-b2.js">' +
      '<link rel="stylesheet" crossorigin href="/assets/index-c3.css">' +
      '<link rel="preload" as="font" href="/assets/kufi.woff2" crossorigin>' +
      '<script src="/legacy.js"></script>';
    expect(assetRefs(html)).toEqual({ js: ['/assets/index-a1.js', '/assets/react-b2.js'], css: ['/assets/index-c3.css'] });
  });
});

describe('checkBundle', () => {
  it('compares each measure with its budget in KB', () => {
    const rows = checkBundle({ initialJsKB: 109.9, cssKB: 25.1, firstLoadKB: 850, heroMobileKB: 64, heroDesktopKB: 77 });
    expect(rows.map((r) => [r.metric, r.pass])).toEqual([
      ['initial JS (gzip)', true],
      ['CSS (gzip)', false],
      ['first load, AR mobile', true],
      ['hero image, mobile', true],
      ['hero image, desktop', true],
    ]);
  });
  it('fails a measure that could not be taken', () => {
    expect(checkBundle({ initialJsKB: NaN, cssKB: 1, firstLoadKB: 1, heroMobileKB: 1, heroDesktopKB: 1 })[0].pass).toBe(false);
  });
});

describe('firstSnippet', () => {
  it('finds the LCP element snippet however deeply Lighthouse nests it', () => {
    const details = { type: 'list', items: [{ type: 'table', items: [{ node: { type: 'node', snippet: '<img src="/img/6398.avif">' } }] }] };
    expect(firstSnippet(details)).toBe('<img src="/img/6398.avif">');
  });
  it('returns null when there is none', () => expect(firstSnippet({ items: [] })).toBeNull());
});

describe('toMarkdown', () => {
  it('writes a PASS/FAIL row per configuration, the bundle table and the diagnostics', () => {
    const report = {
      date: '2026-11-13T10:00:00.000Z',
      base: 'http://localhost:4173',
      runsPerConfig: 3,
      budgets: BUDGETS,
      configs: [
        { page: 'ar', formFactor: 'mobile', runs: [GOOD], median: GOOD, checks: checkBudgets(GOOD, BUDGETS), lcpElement: '<img>', failingAudits: [] },
        {
          page: 'en',
          formFactor: 'mobile',
          runs: [GOOD],
          median: { ...GOOD, lcp: 2400 },
          checks: checkBudgets({ ...GOOD, lcp: 2400 }, BUDGETS),
          lcpElement: null,
          failingAudits: ['performance: largest-contentful-paint (0.6) 2.4 s'],
        },
      ],
      slow4g: [{ page: 'ar', result: GOOD, checks: checkBudgets(GOOD, BUDGETS) }],
      bundle: { rows: checkBundle({ initialJsKB: 100, cssKB: 20, firstLoadKB: 800, heroMobileKB: 60, heroDesktopKB: 90 }) },
    };
    const md = toMarkdown(report);
    expect(md).toContain('| ar | mobile | 95 | 100 | 100 | 100 | 1800 | 0.010 | 90 | PASS |');
    expect(md).toContain('| en | mobile | 95 | 100 | 100 | 100 | 2400 | 0.010 | 90 | FAIL (lcp) |');
    expect(md).toContain('| first load, AR mobile | 800.0 | ≤ 1000 KB | PASS |');
    expect(md).toContain('  - performance: largest-contentful-paint (0.6) 2.4 s');
  });
});
```

Run: `npx vitest run qa/lib/budgets.test.mjs`
Expected: FAIL. `./budgets.mjs` cannot be resolved.

- [ ] **Step 2: Implement the budget helpers**

Create `qa/lib/budgets.mjs`:
```js
// Pure helpers for qa/lighthouse.mjs and qa/bundle-budget.mjs (tested in budgets.test.mjs).

/** Spec §1 and §9. Scores are 0–100. */
export const BUDGETS = { minScore: 90, maxLcpMs: 2000, maxCls: 0.05, maxTbtMs: 150 };
/** Spec §9, in KB of 1,000 bytes. JS = what the page loads up front (the Hoist chunk is lazy). */
export const BUNDLE_LIMITS = { initialJsKB: 110, cssKB: 25, firstLoadKB: 1000, heroMobileKB: 80, heroDesktopKB: 120 };

const SCORE_KEYS = ['performance', 'accessibility', 'bestPractices', 'seo'];
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

/** Median of the finite numbers; NaN when there are none. Does not mutate the input. */
export function median(nums) {
  const xs = nums.filter(finite).sort((a, b) => a - b);
  if (!xs.length) return NaN;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

/** Median of each metric across runs, taken separately. */
export function medianResult(runs) {
  const keys = [...SCORE_KEYS, 'lcp', 'cls', 'tbt', 'fcp', 'si'];
  return Object.fromEntries(keys.map((k) => [k, median(runs.map((r) => r[k]))]));
}

/** One row per budget. A missing value fails. Limits are inclusive. */
export function checkBudgets(result, budgets = BUDGETS) {
  const rows = SCORE_KEYS.map((k) => ({
    metric: k,
    value: result[k],
    limit: `≥ ${budgets.minScore}`,
    pass: finite(result[k]) && result[k] >= budgets.minScore,
  }));
  rows.push({ metric: 'lcp', value: result.lcp, limit: `≤ ${budgets.maxLcpMs} ms`, pass: finite(result.lcp) && result.lcp <= budgets.maxLcpMs });
  rows.push({ metric: 'cls', value: result.cls, limit: `≤ ${budgets.maxCls}`, pass: finite(result.cls) && result.cls <= budgets.maxCls });
  rows.push({ metric: 'tbt', value: result.tbt, limit: `≤ ${budgets.maxTbtMs} ms`, pass: finite(result.tbt) && result.tbt <= budgets.maxTbtMs });
  return rows;
}

/** Up-front assets referenced by a built HTML page: module entry + modulepreloads, stylesheets. */
export function assetRefs(html) {
  const js = [];
  const css = [];
  for (const m of html.matchAll(/<script\b[^>]*>/g)) {
    const src = m[0].match(/\bsrc="([^"]+)"/)?.[1];
    if (src && /\btype="module"/.test(m[0]) && !js.includes(src)) js.push(src);
  }
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const href = m[0].match(/\bhref="([^"]+)"/)?.[1];
    if (!href) continue;
    if (/\brel="modulepreload"/.test(m[0]) && !js.includes(href)) js.push(href);
    else if (/\brel="stylesheet"/.test(m[0]) && !css.includes(href)) css.push(href);
  }
  return { js, css };
}

const round1 = (v) => (finite(v) ? Math.round(v * 10) / 10 : NaN);

export function checkBundle(m, limits = BUNDLE_LIMITS) {
  const row = (metric, value, limit) => ({ metric, value: round1(value), limit: `≤ ${limit} KB`, pass: finite(value) && value <= limit });
  return [
    row('initial JS (gzip)', m.initialJsKB, limits.initialJsKB),
    row('CSS (gzip)', m.cssKB, limits.cssKB),
    row('first load, AR mobile', m.firstLoadKB, limits.firstLoadKB),
    row('hero image, mobile', m.heroMobileKB, limits.heroMobileKB),
    row('hero image, desktop', m.heroDesktopKB, limits.heroDesktopKB),
  ];
}

/** First `snippet` string anywhere inside a Lighthouse details object (LCP element). */
export function firstSnippet(node) {
  if (!node || typeof node !== 'object') return null;
  if (typeof node.snippet === 'string') return node.snippet;
  for (const value of Object.values(node)) {
    const found = firstSnippet(value);
    if (found) return found;
  }
  return null;
}

const fmt = (v, digits = 0) => (finite(v) ? v.toFixed(digits) : 'n/a');

export function toMarkdown(r) {
  const out = [
    '# Lighthouse and budget report',
    '',
    `- Date: ${r.date}`,
    `- Base URL: ${r.base}`,
    `- Runs per configuration: ${r.runsPerConfig} (median of each metric, taken separately)`,
    `- Budgets: scores ≥ ${r.budgets.minScore}; LCP ≤ ${r.budgets.maxLcpMs} ms; CLS ≤ ${r.budgets.maxCls}; TBT ≤ ${r.budgets.maxTbtMs} ms`,
    '- Sizes: KB = 1,000 bytes; text files measured as gzip -9 of the built file',
    '',
    '## Medians',
    '',
    '| Page | Form factor | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) | Result |',
    '|---|---|---|---|---|---|---|---|---|---|',
  ];
  for (const c of r.configs) {
    const m = c.median;
    const bad = c.checks.filter((x) => !x.pass).map((x) => x.metric);
    out.push(
      `| ${c.page} | ${c.formFactor} | ${fmt(m.performance)} | ${fmt(m.accessibility)} | ${fmt(m.bestPractices)} | ${fmt(m.seo)} | ${fmt(m.lcp)} | ${fmt(m.cls, 3)} | ${fmt(m.tbt)} | ${bad.length ? `FAIL (${bad.join(', ')})` : 'PASS'} |`,
    );
  }
  out.push('', '## Slow 4G, applied throttling (1 run, informational)', '', '| Page | Perf | LCP (ms) | CLS | TBT (ms) | FCP (ms) |', '|---|---|---|---|---|---|');
  for (const s of r.slow4g) {
    out.push(
      s.error
        ? `| ${s.page} | error: ${s.error} | | | | |`
        : `| ${s.page} | ${fmt(s.result.performance)} | ${fmt(s.result.lcp)} | ${fmt(s.result.cls, 3)} | ${fmt(s.result.tbt)} | ${fmt(s.result.fcp)} |`,
    );
  }
  out.push('', '## Bundle budget', '', '| Measure | Value (KB) | Budget | Result |', '|---|---|---|---|');
  for (const b of r.bundle.rows) out.push(`| ${b.metric} | ${fmt(b.value, 1)} | ${b.limit} | ${b.pass ? 'PASS' : 'FAIL'} |`);
  out.push('', '## Diagnostics', '');
  for (const c of r.configs) {
    out.push(`### ${c.page} ${c.formFactor}`, '', `- LCP element: ${c.lcpElement ? '`' + c.lcpElement.replace(/`/g, "'") + '`' : 'n/a'}`);
    const errors = c.runs.filter((x) => x.error || x.runtimeError).map((x) => x.error ?? x.runtimeError);
    if (errors.length) out.push(`- Run errors: ${errors.join(' | ')}`);
    if (c.failingAudits.length) out.push('- Audits below 0.9:', ...c.failingAudits.map((a) => `  - ${a}`));
    else out.push('- Audits below 0.9: none');
    out.push('');
  }
  return out.join('\n') + '\n';
}
```

Run: `npx vitest run qa/lib/budgets.test.mjs`
Expected: PASS (17 tests).

- [ ] **Step 3: Confirm the Lighthouse toolchain on this machine**

```bash
npx lighthouse --version
node -e "import('chrome-launcher').then((m) => console.log('chrome-launcher', typeof m.launch))"
node -e "import('lighthouse/core/config/constants.js').then((m) => console.log(JSON.stringify({ slow4g: m.throttling.mobileSlow4G, desktop: m.throttling.desktopDense4G, screen: m.screenEmulationMetrics.desktop })))"
```
Expected:
- **Version:** `13.x.x`.
- **chrome-launcher:** `chrome-launcher function`. Lighthouse depends on it, so npm installs it alongside.
- **Presets:** a JSON line with the Slow 4G and desktop presets. `qa/lighthouse.mjs` reads them from Lighthouse at run time. It falls back to a built-in copy (the values in Step 5) only if this import fails.

If chrome-launcher fails with `ERR_MODULE_NOT_FOUND`, run `npm i -D chrome-launcher@^1`. Note it in "Proposed contract additions" (C1). If the constants import fails, read `sed -n '1,120p' node_modules/lighthouse/core/config/constants.js` and check the built-in copy in Step 5 against it.

- [ ] **Step 4: Write the bundle budget measurement**

Create `qa/bundle-budget.mjs`:
```js
// Bundle and first-load budget (spec §9). Static part: gzip sizes of the JS/CSS the Arabic page
// loads up front (from dist/index.html). Network part: every response while the Arabic page
// loads on a phone (375×812, DPR 2, touch) and on desktop (1440×900), with no scrolling.
// Text responses count as gzip -9 of the built file (vite preview does not compress); binary
// files count at their real size. Usage (preview running): node qa/bundle-budget.mjs [baseUrl]
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import puppeteer from 'puppeteer-core';
import { assetRefs, checkBundle } from './lib/budgets.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const DEFAULT_CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TEXT_TYPES = new Set(['document', 'script', 'stylesheet', 'xhr', 'fetch', 'manifest']);
const TEXT_EXT = /\.(js|mjs|css|html|svg|json|xml|txt|webmanifest)$/i;

const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const kb = (bytes) => bytes / 1000;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

async function distFile(urlPath) {
  const rel = decodeURIComponent(urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath);
  try {
    return await readFile(path.join(DIST, rel));
  } catch {
    return null;
  }
}

async function capture(browser, base, { width, height, touch }) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height, isMobile: touch, hasTouch: touch, deviceScaleFactor: touch ? 2 : 1 });
  const origin = new URL(base).origin;
  const responses = [];
  const pending = [];
  page.on('response', (res) => {
    pending.push(
      (async () => {
        const url = new URL(res.url());
        if (url.protocol === 'data:' || res.status() >= 300) return;
        const type = res.request().resourceType();
        const local = url.origin === origin ? await distFile(url.pathname) : null;
        let bytes;
        if (local) bytes = TEXT_TYPES.has(type) || TEXT_EXT.test(url.pathname) ? gz(local) : local.length;
        else bytes = (await res.buffer().catch(() => Buffer.alloc(0))).length;
        responses.push({ url: url.origin === origin ? url.pathname : url.href, type, bytes });
      })(),
    );
  });
  await page.goto(`${base}/`, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000)); // motion core loads after hydration
  const heroSrc = await page.evaluate(() => {
    const img = document.querySelector('[data-hero-photo] img');
    return img ? new URL(img.currentSrc || img.src, location.href).pathname : null;
  });
  const fontPreloads = await page.$$eval('link[rel="preload"][as="font"]', (ls) => ls.length);
  await Promise.all(pending);
  await context.close();
  return { responses, heroSrc, fontPreloads };
}

export async function measureBundle({ base = 'http://localhost:4173', chrome = DEFAULT_CHROME } = {}) {
  const html = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const refs = assetRefs(html);
  const sized = async (ref) => {
    const buf = await distFile(new URL(ref, 'http://x').pathname);
    return { file: ref, gzipKB: buf ? kb(gz(buf)) : NaN };
  };
  const initialJs = await Promise.all(refs.js.map(sized));
  const css = await Promise.all(refs.css.map(sized));
  const jsFiles = (await readdir(path.join(DIST, 'assets'))).filter((f) => f.endsWith('.js'));
  const lazyJs = [];
  for (const f of jsFiles) {
    const ref = `/assets/${f}`;
    if (!refs.js.includes(ref)) lazyJs.push({ file: ref, gzipKB: kb(gz(await readFile(path.join(DIST, 'assets', f)))) });
  }

  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-first-run'] });
  let mobile;
  let desktop;
  try {
    mobile = await capture(browser, base, { width: 375, height: 812, touch: true });
    desktop = await capture(browser, base, { width: 1440, height: 900, touch: false });
  } finally {
    await browser.close();
  }
  const byType = (cap) => {
    const t = {};
    for (const r of cap.responses) t[r.type] = Math.round(((t[r.type] ?? 0) + kb(r.bytes)) * 10) / 10;
    return t;
  };
  const heroKB = (cap) => kb(cap.responses.find((r) => r.url === cap.heroSrc)?.bytes ?? NaN);
  const measure = {
    initialJsKB: sum(initialJs.map((f) => f.gzipKB)),
    cssKB: sum(css.map((f) => f.gzipKB)),
    firstLoadKB: kb(sum(mobile.responses.map((r) => r.bytes))),
    heroMobileKB: heroKB(mobile),
    heroDesktopKB: heroKB(desktop),
  };
  return {
    measure,
    rows: checkBundle(measure),
    details: {
      initialJs,
      css,
      lazyJs,
      mobile: { requests: mobile.responses.length, byTypeKB: byType(mobile), hero: mobile.heroSrc, fontPreloads: mobile.fontPreloads },
      desktop: { requests: desktop.responses.length, firstLoadKB: kb(sum(desktop.responses.map((r) => r.bytes))), byTypeKB: byType(desktop), hero: desktop.heroSrc },
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const base = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
  const r = await measureBundle({ base });
  console.table(r.rows);
  console.log(JSON.stringify(r.details, null, 2));
  process.exit(r.rows.every((x) => x.pass) ? 0 : 1);
}
```

- [ ] **Step 5: Write the Lighthouse runner**

Create `qa/lighthouse.mjs`:
```js
// Lighthouse medians and performance budgets (spec §1, §9). For both pages it runs mobile and
// desktop, LH_RUNS times each (default 3), with a fresh Chrome per run, and takes the median
// of each metric. It adds one applied-throttling Slow 4G run of the Arabic page (informational)
// and the bundle budget. Writes qa/reports/lighthouse.json and lighthouse.md. Exit 1 if any
// budget fails. Usage (preview running): npm run lighthouse [-- baseUrl]
import { mkdir, writeFile } from 'node:fs/promises';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { measureBundle } from './bundle-budget.mjs';
import { BUDGETS, checkBudgets, firstSnippet, medianResult, toMarkdown } from './lib/budgets.mjs';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RUNS = Number(process.env.LH_RUNS ?? 3);
const OUT = new URL('./reports/', import.meta.url).pathname;
const PAGES = [
  { id: 'ar', path: '/' },
  { id: 'en', path: '/en/' },
];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

// Presets from Lighthouse itself; the built-in copy is used only if that import fails (E.4 Step 3).
const constants = await import('lighthouse/core/config/constants.js').catch(() => null);
const SLOW_4G = constants?.throttling?.mobileSlow4G ?? {
  rttMs: 150,
  throughputKbps: 1638.4,
  requestLatencyMs: 562.5,
  downloadThroughputKbps: 1474.56,
  uploadThroughputKbps: 675,
  cpuSlowdownMultiplier: 4,
};
const DESKTOP_THROTTLING = constants?.throttling?.desktopDense4G ?? {
  rttMs: 40,
  throughputKbps: 10240,
  cpuSlowdownMultiplier: 1,
  requestLatencyMs: 0,
  downloadThroughputKbps: 0,
  uploadThroughputKbps: 0,
};
const DESKTOP_SCREEN = constants?.screenEmulationMetrics?.desktop ?? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false };
const DESKTOP_UA =
  constants?.userAgents?.desktop ??
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
console.log(`Throttling presets: ${constants ? 'from Lighthouse' : 'built-in copy'}`);

const CONFIGS = {
  mobile: { extends: 'lighthouse:default' }, // Lighthouse default: mobile, simulated Slow 4G
  desktop: {
    extends: 'lighthouse:default',
    settings: { formFactor: 'desktop', throttling: DESKTOP_THROTTLING, screenEmulation: DESKTOP_SCREEN, emulatedUserAgent: DESKTOP_UA },
  },
  slow4g: { extends: 'lighthouse:default', settings: { throttlingMethod: 'devtools', throttling: SLOW_4G } },
};

function pick(lhr) {
  const score = (id) => (lhr.categories[id]?.score == null ? NaN : Math.round(lhr.categories[id].score * 100));
  const num = (id) => lhr.audits[id]?.numericValue ?? NaN;
  const failing = [];
  for (const cat of Object.values(lhr.categories)) {
    for (const ref of cat.auditRefs) {
      const a = lhr.audits[ref.id];
      if (ref.weight > 0 && a && a.score !== null && a.score < 0.9) failing.push(`${cat.id}: ${a.id} (${a.score}) ${a.displayValue ?? ''}`.trim());
    }
  }
  return {
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    lcp: num('largest-contentful-paint'),
    cls: num('cumulative-layout-shift'),
    tbt: num('total-blocking-time'),
    fcp: num('first-contentful-paint'),
    si: num('speed-index'),
    lcpElement: firstSnippet(lhr.audits['largest-contentful-paint-element']?.details),
    failing,
    runtimeError: lhr.runtimeError?.message ?? null,
    version: lhr.lighthouseVersion,
  };
}

async function runOnce(url, config) {
  const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-first-run', '--no-default-browser-check'] });
  try {
    const result = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: CATEGORIES }, config);
    if (!result) throw new Error('Lighthouse returned no result');
    return pick(result.lhr);
  } finally {
    await chrome.kill();
  }
}

const ping = await fetch(`${BASE}/`).catch(() => null);
if (!ping?.ok) {
  console.error(`Cannot reach ${BASE}/. Build, then start the preview: npx vite preview --port 4173`);
  process.exit(2);
}
await mkdir(OUT, { recursive: true });

console.log('Bundle budget…');
const bundle = await measureBundle({ base: BASE, chrome: CHROME });
console.table(bundle.rows);

const configs = [];
for (const p of PAGES) {
  for (const formFactor of ['mobile', 'desktop']) {
    const runs = [];
    for (let i = 1; i <= RUNS; i++) {
      process.stdout.write(`${p.id} ${formFactor} run ${i}/${RUNS}… `);
      try {
        const r = await runOnce(BASE + p.path, CONFIGS[formFactor]);
        runs.push(r);
        console.log(`perf ${r.performance} a11y ${r.accessibility} bp ${r.bestPractices} seo ${r.seo} LCP ${Math.round(r.lcp)} ms CLS ${r.cls.toFixed(3)} TBT ${Math.round(r.tbt)} ms`);
      } catch (e) {
        runs.push({ error: e instanceof Error ? e.message : String(e) });
        console.log(`ERROR ${e instanceof Error ? e.message : e}`);
      }
    }
    const med = medianResult(runs);
    configs.push({
      page: p.id,
      formFactor,
      runs,
      median: med,
      checks: checkBudgets(med, BUDGETS),
      lcpElement: runs.find((r) => r.lcpElement)?.lcpElement ?? null,
      failingAudits: [...new Set(runs.flatMap((r) => r.failing ?? []))],
    });
  }
}

const slow4g = [];
try {
  process.stdout.write('ar mobile Slow 4G (applied throttling)… ');
  const r = await runOnce(`${BASE}/`, CONFIGS.slow4g);
  slow4g.push({ page: 'ar', result: r, checks: checkBudgets(r, BUDGETS) });
  console.log(`perf ${r.performance} LCP ${Math.round(r.lcp)} ms`);
} catch (e) {
  slow4g.push({ page: 'ar', error: e instanceof Error ? e.message : String(e) });
  console.log('ERROR');
}

const report = { date: new Date().toISOString(), base: BASE, runsPerConfig: RUNS, budgets: BUDGETS, configs, slow4g, bundle };
await writeFile(`${OUT}lighthouse.json`, JSON.stringify(report, null, 2));
await writeFile(`${OUT}lighthouse.md`, toMarkdown(report));

const failed = [
  ...configs.flatMap((c) => c.checks.filter((x) => !x.pass).map((x) => `${c.page} ${c.formFactor} ${x.metric}=${x.value}`)),
  ...bundle.rows.filter((r) => !r.pass).map((r) => `bundle ${r.metric}=${r.value} KB`),
];
console.log(failed.length ? `\nFAIL: ${failed.join(', ')}` : '\nAll budgets met.');
console.log('Report: qa/reports/lighthouse.md');
process.exit(failed.length ? 1 : 0);
```

- [ ] **Step 6: Run the bundle budget on its own**

```bash
node --check qa/bundle-budget.mjs && node --check qa/lighthouse.mjs && echo ok
npm run build
```
Start the preview (Conventions), then:
```bash
node qa/bundle-budget.mjs; echo "exit=$?"
```
Expected:
- A table of 5 rows with `pass` true or false, then JSON details.
- `details.mobile.fontPreloads` should be `3`.
- `details.lazyJs` should list a separate chunk whose name contains `hoist`.
- `exit=0` if every row passes, `exit=1` otherwise.

Write the five values and the exit code in your notes, exactly as printed.

- [ ] **Step 7: Run Lighthouse (about 10–15 minutes)**

The preview is still running.
```bash
(set -o pipefail; npm run lighthouse 2>&1 | tee qa/reports/lighthouse-console.txt); echo "exit=$?"
cat qa/reports/lighthouse.md
```
Expected:
- One line per run: 12 main runs plus 1 Slow 4G run.
- Then either `All budgets met.` or `FAIL: …` with every failing metric and its value.
- `qa/reports/lighthouse.json` and `qa/reports/lighthouse.md` are written.
- `exit=0` only when every budget passes.

Copy the "Medians" table and the "Bundle budget" table into your notes, unchanged. Stop the preview.

If a run prints `ERROR`, rerun once. If it fails again, the error text stays in the report as "Run errors". Do not drop the run.

- [ ] **Step 8: Run the unit tests and commit**

```bash
npm test
git add qa/lib/budgets.mjs qa/lib/budgets.test.mjs qa/bundle-budget.mjs qa/lighthouse.mjs package.json package-lock.json
git commit -m "test(perf): Lighthouse medians, Slow 4G run and bundle budget report

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
Expected: the commit is created. `package*.json` only changes if Step 3 had to install chrome-launcher.

---
### Task E.5: Fix loop (QA, Lighthouse, budgets)

Work through every FAIL from E.1 (smoke), E.3 (QA and the Impeccable detector) and E.4 (Lighthouse and the bundle).

**Rules:**
- **One cause per commit.** Log each fix with before and after numbers.
- **Never relax a budget, a test or a QA check.** If something can't be fixed within the spec, log it as **open**, with the reason and the spec section.

**Files:**
- Create: `qa/find-overflow.mjs`, and `docs/qa-report.md` if it doesn't exist yet (template in Task E.8 Step 1)
- Modify: only the files the checklist below names for the failures you actually have

- [ ] **Step 1: Open the report file and log every failure**

If `docs/qa-report.md` does not exist, create it now with the exact template from **Task E.8 Step 1**. Then, for every FAIL in `qa/reports/summary.md`, `qa/reports/lighthouse.md`, the E.1 smoke output and the Impeccable output:
- add one row to **§9 Fix log**;
- copy the check name and the measured value verbatim into "Finding" and "Before".

- [ ] **Step 2: Create the overflow finder (used by the "overflow" rows below)**

Create `qa/find-overflow.mjs`:
```js
// Lists the elements that stick out sideways at one width.
// Usage (preview running): node qa/find-overflow.mjs <path> <width> [baseUrl]
//   e.g. node qa/find-overflow.mjs /en/ 320
import puppeteer from 'puppeteer-core';

const [pagePath = '/', widthArg = '320', baseArg] = process.argv.slice(2);
const BASE = (baseArg ?? 'http://localhost:4173').replace(/\/$/, '');
const width = Number(widthArg);
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] });
const page = await browser.newPage();
await page.setViewport({ width, height: 800, isMobile: width < 1024, hasTouch: width < 1024, deviceScaleFactor: 1 });
await page.goto(BASE + pagePath, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 2500));
const report = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const rows = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || (r.right <= vw + 1 && r.left >= -1)) continue;
    let clipped = false; // inside an element that scrolls or clips sideways (e.g. the sites strip)
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) {
        clipped = true;
        break;
      }
    }
    if (clipped) continue;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
    rows.push({ el: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''}`, left: Math.round(r.left), right: Math.round(r.right), text: (el.textContent ?? '').trim().slice(0, 40) });
  }
  return { vw, scrollWidth: document.documentElement.scrollWidth, rows: rows.slice(0, 30) };
});
console.log(`viewport ${report.vw}px · document scrollWidth ${report.scrollWidth}px`);
console.table(report.rows);
await browser.close();
```
Run (preview running): `node qa/find-overflow.mjs / 320`
Expected: a table. It is empty when there is no overflow at that width.

- [ ] **Step 3: Triage with this checklist** (symptom → where to look → fix)

| # | Symptom (where you see it) | Likely cause | Files to touch | Fix |
|---|---|---|---|---|
| 1 | LH mobile LCP > 2000 ms, and the LCP element in `lighthouse.md` → Diagnostics is the hero `<img>` | Hero image found late or at low priority | `src/sections/Hero.tsx`, `src/entry-server.tsx` | Check that `<Picture … priority>` is set on the hero (check **K1** below gives `1`). If it already is, apply **F1** (preload links) |
| 2 | LCP element is the H1 or other text, with a long "element render delay" | Text hidden until JS or motion runs, or a font blocks paint | `src/motion/motion.css`, `src/motion/hero.ts`, `src/fonts.css` | `[data-split]` must never be hidden by CSS. Only `.motion-ok [data-intro]` may be. Every `@font-face` in `src/fonts.css` needs `font-display: swap` (`grep -c "font-display: swap" src/fonts.css` = number of faces) |
| 3 | LCP worse with motion than with `prefers-reduced-motion` | `hero.ts` sets `opacity: 0` on the photo, or delays the H1 too long | `src/motion/hero.ts` | Animate the photo with `scale` only (1.05 → 1). Set H1 "from" states right before playing (Global rule 2) |
| 4 | CLS > 0.05; `layout-shifts` audit lists text blocks | Web-font swap without matched fallback metrics | `src/fonts.css`, `scripts/subset-fonts.mjs` | Every family needs its `"… Fallback"` `@font-face` with `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override`. Rerun `npm run fonts` and check the overrides were written |
| 5 | CLS > 0.05; the shifting element is an image | `<img>` without `width`/`height` | `src/components/Picture.tsx` and any raw `<img>` (`grep -rn "<img" src --include=*.tsx`) | Give every `<img>` its `width` and `height` (from `rect`, or the file's real size for the badge) |
| 6 | CLS from header, bar, chips or badges appearing after load | Markup that exists only on the client (rendered after an effect) | The component named in `layout-shifts` | Render the same markup on the server. Reserve the space (fixed height), or put late UI in `position: fixed` elements |
| 7 | TBT > 150 ms | Hydration and motion start run in the same long task | `src/motion/index.ts` | Apply **F2** (start motion when idle). Then confirm QA's "reveals have finished" and hero checks still pass |
| 8 | Initial JS > 110 KB gzip | GSAP, Lenis or the Hoist code in the up-front bundle | any `src/**` importing them | Run check **K2** below; it should print nothing. Move any hit behind `src/motion/index.ts`'s dynamic `import('./core')` |
| 9 | No separate `hoist` chunk in `details.lazyJs` | `hoist.ts` imported statically | `src/motion/core.ts` | Apply **F3** (dynamic import on approach) |
| 10 | CSS > 25 KB gzip | Tailwind scanning `docs/` markdown and generating unused classes | `src/styles.css` | Apply **F4** (limit Tailwind's sources to `src/`) |
| 11 | First load > 1 MB, or hero AVIF over budget | Images too wide for the viewport, or lazy images loading above the fold | `src/sections/*.tsx` (`sizes` props), `scripts/build-assets.mjs` (quality) | Read `details.mobile.byTypeKB`. Make each `<Picture sizes>` match the real rendered width (for example `(min-width: 1024px) 50vw, 100vw`). Only the hero is `priority`. Lower AVIF quality in `build-assets.mjs` only if the photo still looks right, then rerun `npm run assets` |
| 12 | axe `color-contrast` (serious) | Token pair outside spec §6 | the section's `.tsx` / `src/styles.css` | Red text on navy is never allowed. On dark grounds use `text-red-bright`, `text-white` or `text-steel`. On light grounds use `text-ink` or `text-navy` |
| 13 | axe `button-name` / `link-name` (critical/serious) | Icon-only control with no label | `src/components/Icons.tsx` users: `RequestBar.tsx`, `Header.tsx`, `Lightbox.tsx`, `Footer.tsx` | Add `aria-label` from the copy deck string (§2, §10, §11) through `copy.*`. Never type the label inline |
| 14 | axe `aria-hidden-focus` (serious) | A ghost or clone left in the DOM with focusable children | `src/motion/ride.ts` | Clones get `aria-hidden="true"` **and** `inert`, and are removed in the animation's `onComplete` |
| 15 | axe `scrollable-region-focusable` (serious) | Sites strip scrolls but holds nothing focusable | `src/sections/Sites.tsx` | Give the strip `tabIndex={0}`, `role="region"` and an `aria-label` from copy deck §7 |
| 16 | QA "no horizontal overflow" FAIL | `100vw` widths, fixed widths, or long unbroken strings (email, model codes) | element named by `node qa/find-overflow.mjs <path> <width>` | Replace `w-screen`/`100vw` with `w-full`/`100%`. Add `min-w-0` on flex/grid children. Add `overflow-wrap: anywhere` on the email line |
| 17 | Smoke or QA: hydration error/warning, or "hydration kept the server DOM" FAIL | Render output differs between server and browser | the component in the warning text | Common causes: `new Date()` in render (pass the build year as a constant), `typeof window` branches in render, reading `localStorage` or `matchMedia` in render. Move them into `useEffect`, or into `useSyncExternalStore` with a server snapshot |
| 18 | QA "Request this crane → bar chip…" FAIL, `hrefOk=false` | Message not URL-encoded, or not built from the store | `src/lib/whatsapp.ts` | `whatsappHref` must use `encodeURIComponent(message)` (never `encodeURI`) for `text=`, and for `subject=` / `body=` of the mailto fallback |
| 19 | QA "weight «٣٥٠» …" FAIL, `weightInvalid=true` | Validation reads the raw value | `src/sections/RequestForm.tsx` | Validate with `parseDecimal(value)` from `src/lib/digits.ts`. Build the message from the parsed number |
| 20 | QA lightbox FAIL: arrows go the wrong way on `ar` | Key handler ignores `dir` | `src/components/Lightbox.tsx` | Apply **F5** |
| 21 | QA lightbox or menu FAIL: `focusBack=false` | Dialog closed by toggling `open` instead of `dialog.close()`, or the opener re-rendered | `src/components/Lightbox.tsx`, `src/sections/Header.tsx` | Open with `showModal()` and close with `close()`. Native `<dialog>` then returns focus to the opener. Keep the opener element mounted |
| 22 | QA "back to top" FAIL with motion on | Anchor prevented but Lenis not asked to scroll | `src/sections/Footer.tsx`, `src/motion/core.ts` | On click with Lenis present: `lenis.scrollTo(0)`. Otherwise leave the native `#top` anchor alone (spec §5.9) |
| 23 | QA "focused form fields are never hidden by the request bar" FAIL | Focus scroll ignores `scroll-padding-bottom` | `src/components/RequestBar.tsx` | Apply **F6** (`focusin` guard) |
| 24 | QA "focus ring visible" FAIL | A component sets `outline: none` | file named by the `without ring` list | Remove the override. The global `:focus-visible` rule from C4 must apply |
| 25 | LH SEO < 90: `canonical` / `hreflang` audit | Build `SITE_URL` differs from the served host | none (environment) | Rebuild with `SITE_URL` unset for local runs. On staging, set `SITE_URL` to the staging address |
| 26 | LH Best Practices < 90: `errors-in-console` | Real console error | wherever the QA "errors" line points | Fix the error. Never silence `console.error` |
| 27 | LH Best Practices: `image-size-responsive` / `image-aspect-ratio` | srcset lacks a wide-enough source, or `width`/`height` don't match the crop | `src/components/Picture.tsx`, `scripts/build-assets.mjs` | `width`/`height` must be the crop `rect` size. Add the 2560 hero width if DPR 2 needs it (spec §4.5 lists it) |
| 28 | Impeccable `exit=2` | Rule finding | file and rule in the output | Fix within spec §6–§7. Only spec-required choices may be ignored (E.3 Step 6) |
| 29 | QA "draft badges shown (staging)" FAIL | `isDraft` not used where a value is unverified | `src/sections/Hoist.tsx`, `src/sections/CraneGrid.tsx` | Render `<DraftBadge/>` when `isDraft(crane.verified)` |
| 30 | QA "every #link has a target" FAIL | Nav `href` doesn't match a C9 section id | `src/sections/Header.tsx`, `src/sections/Footer.tsx` | Use only the C9 ids (`#services`, `#cranes`, `#sites`, `#request`, `#top`, `#main`) |

Checks used in the table:
```bash
# K1: how many images load at high priority (expected 1, the hero)
grep -o 'fetchpriority="high"' dist/index.html | wc -l
# K2: GSAP/Lenis imported outside src/motion (expected: no output)
grep -rlE "from ['\"](gsap|lenis|@gsap/react)" src --include=*.ts --include=*.tsx | grep -v '^src/motion/'
```

- [ ] **Step 4: Fix recipes referenced above** (apply only for a failure that needs them)

**F1 — Preload the hero image (row 1).**

In `src/entry-server.tsx`, add the import, the constant and the function below, and change `head()` to include the preloads. The `sizes` values must equal the `sizes` prop passed to the hero `<Picture>` in `src/sections/Hero.tsx`. The crops must equal its `crop` and `mobileCrop` props. Check both with `grep -n "<Picture" -A6 src/sections/Hero.tsx`.
```tsx
import { getImage, type PhotoId } from '@/generated/images';

const HERO_PHOTO: Record<Lang, PhotoId> = { ar: '6398', en: '6359' }; // spec §5.2
const HERO_SIZES = '100vw'; // must equal the hero <Picture sizes>

function heroPreloads(lang: Lang): string {
  const srcset = (img: ReturnType<typeof getImage>) => img.avif.map((s) => `${s.url} ${s.width}w`).join(', ');
  const mobile = getImage(HERO_PHOTO[lang], 'mobile_9x16');
  const desktop = getImage(HERO_PHOTO[lang], 'desktop_16x9');
  return [
    `<link rel="preload" as="image" type="image/avif" fetchpriority="high" media="(max-width: 767px)" imagesrcset="${srcset(mobile)}" imagesizes="${HERO_SIZES}">`,
    `<link rel="preload" as="image" type="image/avif" fetchpriority="high" media="(min-width: 768px)" imagesrcset="${srcset(desktop)}" imagesizes="${HERO_SIZES}">`,
  ].join('\n    ');
}

export function head(lang: Lang): string {
  const jsonLd = jsonLdScript(
    buildJsonLd({ lang, siteUrl: env.siteUrl.replace(/\/+$/, ''), email: siteInfo.email, facebook: siteInfo.facebook, phone: env.phone, address: siteInfo.address }),
  );
  return [heroPreloads(lang), jsonLd].join('\n    ');
}
```
Verify:
- `grep -c 'rel="preload" as="image"' dist/index.html` → `2` after `npm run build`.
- Rerun Lighthouse. The hero must not be downloaded twice: in Chrome DevTools → Network, filter `img/6398`, and expect one request at the current width.

**F2 — Start motion when the main thread is idle (row 7).**

Replace the body of `useSiteMotion` in `src/motion/index.ts` with the code below. It keeps C10's contract (dynamic `import('./core')`, cleanup on unmount):
```ts
import { useEffect } from 'react';

export function useSiteMotion(): void {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const start = () => {
      import('./core').then((m) => {
        if (!cancelled) cleanup = m.startMotion();
      });
    };
    const idle = 'requestIdleCallback' in window;
    const handle = idle ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 200);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      cleanup?.();
    };
  }, []);
}
```
If `startMotion` returns `void` rather than a cleanup function (check `grep -n "export function startMotion" src/motion/core.ts`), make it return its cleanup, as C10 states.

Verify:
- TBT drops in `lighthouse.md`.
- QA checks "motion context is …" and "reveals have finished" still pass.
- The hero intro is still finished by about 2 s on desktop. Watch it once in the browser pane.

**F3 — Load the Hoist timeline only on approach (row 9).**

In `src/motion/core.ts`, replace any static `import … from './hoist'` with this block inside the desktop `matchMedia` context. Use the function name `hoist.ts` actually exports; check with `grep -n "^export" src/motion/hoist.ts`.
```ts
const cranes = document.getElementById('cranes');
if (cranes) {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      import('./hoist').then((m) => m.initHoist());
    },
    { rootMargin: '100% 0px' },
  );
  io.observe(cranes);
  cleanups.push(() => io.disconnect());
}
```
(`cleanups` is the array of teardown functions that `core.ts` runs on context revert. Use the name the file already has for it.)

Verify: `npm run build && ls dist/assets | grep -i hoist` prints one file, and `grep -c hoist dist/index.html` → `0`.

**F4 — Limit Tailwind to `src/` (row 10).**

In `src/styles.css`, change the Tailwind import line to:
```css
@import "tailwindcss" source("../src");
```
Verify: rebuild, then rerun `node qa/bundle-budget.mjs`. The CSS row drops, and the QA screenshots look unchanged.

**F5 — Lightbox arrows follow the reading direction (row 20).**

In `src/components/Lightbox.tsx`, use this handler on the `<dialog>` (`onKeyDown={onKeyDown}`). `go(step)` stands for the lightbox's existing next/previous function; use its real name.
```tsx
const { dir } = useLang();
function onKeyDown(e: React.KeyboardEvent<HTMLDialogElement>) {
  const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  if (e.key === forward) {
    e.preventDefault();
    go(1);
  } else if (e.key === back) {
    e.preventDefault();
    go(-1);
  }
}
```

**F6 — Keep focused fields clear of the request bar (row 23).**

In `src/components/RequestBar.tsx`, add this effect inside the component (`barRef` is a `useRef<HTMLDivElement>(null)` on the `[data-request-bar]` element):
```tsx
useEffect(() => {
  const onFocusIn = (e: FocusEvent) => {
    const el = e.target as HTMLElement | null;
    const bar = barRef.current;
    if (!el || !bar || bar.contains(el)) return;
    const a = el.getBoundingClientRect();
    const b = bar.getBoundingClientRect();
    if (a.bottom > b.top && a.top < b.bottom) el.scrollIntoView({ block: 'center' });
  };
  document.addEventListener('focusin', onFocusIn);
  return () => document.removeEventListener('focusin', onFocusIn);
}, []);
```

- [ ] **Step 5: Loop**

For each fix:
1. Run `npm test && npm run build`, and restart the preview.
2. Rerun **only** the script that failed:
   - `node qa/smoke-prerender.mjs`
   - `npm run qa`
   - `node qa/bundle-budget.mjs`
   - `npm run lighthouse`
   - or the three `npx impeccable detect` commands.
3. Fill "After" in §9 Fix log with the new measured value.
4. Commit that fix alone:
   ```bash
   git add <the files you changed> docs/qa-report.md
   git commit -m "fix(<area>): <what changed, e.g. preload hero image for LCP>

   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
   ```
5. Put the commit's short hash (`git rev-parse --short HEAD`) in the Fix log row.

Stop when every check passes, or when each remaining FAIL is logged as **open**: what it is, why it can't be fixed within the spec, and what would fix it. A full QA + Lighthouse rerun happens in E.8.

---
### Task E.6: Handover docs (README, DESIGN, Atlas content checklist) and deploy config

**Files:**
- Create: `vercel.json`, `README.md`, `DESIGN.md`, `docs/atlas-content-checklist.md`
- Modify: `scripts/build-assets.mjs` (make the photo folder configurable with `PHOTOS_DIR`)

- [ ] **Step 1: Deploy config for Vercel**

Create `vercel.json`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "trailingSlash": true,
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/img/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/en/", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] }
  ]
}
```
What each setting does:
- **Cache headers:** spec §9 says hashed assets are served `immutable` and HTML `no-cache`. Both `/assets/*` (Vite) and `/img/*` (A2, `<name>.<hash8>.<ext>`) are content-hashed.
- **`trailingSlash: true`:** sends `/en` to `/en/`, so the canonical URL is the only form.

Run: `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8')); console.log('ok')"`
Expected: `ok`.

- [ ] **Step 2: Make the photo folder configurable**

Run: `grep -n "Downloads" scripts/build-assets.mjs`
Expected: one line that sets the folder of original photos. For example `const SRC_DIR = '/Users/montheribrahim/Downloads';`; the name may differ.

Change only its right-hand side to:
```js
process.env.PHOTOS_DIR ?? '/Users/montheribrahim/Downloads'
```
Then run `npm run assets && git status --short public/img src/generated public/og-ar.jpg public/og-en.jpg`.
Expected: no changes listed, because the same inputs give the same outputs.

If files changed, the encoder isn't byte-stable. Discard the changes with `git checkout -- public/img src/generated public/og-ar.jpg public/og-en.jpg`, and note it in the README "Photos" section.

- [ ] **Step 3: Write `README.md`**

Create `README.md`:
````markdown
# Atlas Alshraa · أطلس الصحراء: website

A one-page bilingual website for شركة أطلس الصحراء المساهمة للخدمات النفطية والنقل الثقيل والمناولة وتأجير الرافعات: crane hire, heavy transport, handling and oil services in Libya.

- **Pages:** Arabic, right-to-left, at `/` (the default page). English at `/en/`.
- **Build:** a static site (Vite, React 19, TypeScript, Tailwind CSS 4). Both pages are **prerendered to plain HTML** at build time, then React hydrates them. Everything works without JavaScript and without motion.
- **Motion:** GSAP and Lenis, loaded after the page is interactive. With `prefers-reduced-motion` the page is static.
- **Truth gate:** stops unverified facts from reaching the live site. That covers crane capacities Atlas hasn't confirmed, a missing phone or WhatsApp number, and any `[[TOKEN]]` left in the copy.

Further reading:
- `DESIGN.md`: the design system.
- `docs/superpowers/specs/2026-11-04-atlas-website-design.md`: the approved spec.
- `docs/atlas-content-checklist.md`: what Atlas still has to send.
- `docs/qa-report.md`: the latest QA results.

## Quick start

Requires Node 22.12 or newer, and Google Chrome for the QA, Lighthouse and PDF scripts.

```bash
npm install
npm run dev        # http://localhost:5173 (dev renders in the browser; no prerender)
npm test           # unit tests (Vitest)
npm run typecheck
npm run build      # staging build into dist/ (typecheck → Vite → prerender + sitemap + robots)
npm run preview    # serves dist/ at http://localhost:4173
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run fonts` | Subsets the fonts into `src/assets/fonts/` and writes the metric-matched fallbacks in `src/fonts.css` |
| `npm run assets` | Rebuilds every photo (AVIF + WebP at 640/1280/1920, plus 2560 for heroes), the placeholders, `src/generated/images.ts` and the two Open Graph images |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript |
| `npm run build` | Typecheck → Vite build → `scripts/prerender.mjs`. That last step renders both pages, injects the JSON-LD, and writes `dist/sitemap.xml` and `dist/robots.txt` |
| `npm run build:production` | The same, with `BUILD_TARGET=production`. **Fails** while any fact is unverified (see "Truth gate") |
| `npm run preview` | Serves `dist/` on port 4173 |
| `npm run qa` | Functional, accessibility and SEO QA: both pages × 8 widths × motion on/off, plus every control. Needs the preview running |
| `npm run lighthouse` | Lighthouse medians (3 runs), one Slow 4G run and the bundle budget. Needs the preview |
| `npm run pdf` | PDF screen exports into `docs/exports/`. Needs the preview |

## Environment variables

Set them in the shell for local builds, or in Vercel → Project → Settings → Environment Variables.

| Variable | Used for | When unset | Production build |
|---|---|---|---|
| `SITE_URL` | Canonical, `og:url`, `hreflang`, sitemap, robots, JSON-LD (`VITE_SITE_URL` also works) | `http://localhost:4173` | **required** |
| `VITE_WHATSAPP` | Every WhatsApp button and message. International format, digits only, e.g. `2189XXXXXXXX` | WhatsApp buttons open `mailto:atlasalsahralibya@gmail.com` with the same message (staging) | **required** |
| `VITE_PHONE` | Call buttons, `tel:` links, JSON-LD `telephone`. E.g. `+2189XXXXXXXX` | Call buttons are hidden | **required** |
| `VITE_FORM_ENDPOINT` | The form POSTs JSON here (Formspree or similar) | The form opens WhatsApp (or mailto) with the request written out | optional |
| `VITE_GA4_ID` | Google Analytics 4 | Analytics off | optional |
| `BUILD_TARGET` | `staging` or `production` | `staging` | `production` |
| `SITEMAP_LASTMOD` | `<lastmod>` in the sitemap (YYYY-MM-DD) | the build date | optional |
| `PHOTOS_DIR` | Folder of original photos for `npm run assets` | `/Users/montheribrahim/Downloads` | — |
| `CHROME_PATH`, `QA_TARGET`, `LH_RUNS` | QA scripts: Chrome binary; expect draft badges (`staging`) or none (`production`); Lighthouse runs per configuration | installed Chrome; `staging`; `3` | — |

## Truth gate: staging and production

Every fact the site shows is either confirmed by Atlas or marked unverified in the data:
- each crane in `src/content/cranes.ts` has `verified: true | false`;
- unknown copy stays a `[[TOKEN]]` in `src/content/*.ts`;
- phone, WhatsApp and the site address come from the environment.

**Staging** (`npm run build`, the default) builds anyway:
- Every unverified value shows a red-and-white **DRAFT · unverified** badge.
- With no `VITE_WHATSAPP`, WhatsApp buttons open an email to atlasalsahralibya@gmail.com instead.
- With no `VITE_PHONE`, the Call buttons are hidden.
- The prerender prints how many draft tokens each page shows.

**Production** (`npm run build:production`, or `BUILD_TARGET=production` in Vercel) **fails** and lists the reasons if:
- a crane that is shown has `verified: false`;
- the rendered HTML still contains `[[` (checked twice: once by the gate in `vite/truth-gate.ts`, and again on the final HTML in `scripts/prerender.mjs`);
- `SITE_URL`, `VITE_WHATSAPP` or `VITE_PHONE` is missing.

This failure is the gate working. Production stays blocked until Atlas sends the data in `docs/atlas-content-checklist.md`.

## Deploy on Vercel

1. Import the Git repository in Vercel. `vercel.json` sets everything: framework **Vite**, build command `npm run build`, output directory **`dist`**, cache headers and trailing slashes.
2. **Staging** is the preview deployments, built as staging by default. Set `SITE_URL` in the **Preview** environment to the staging address you share (e.g. the branch alias `https://<project>-git-main-<team>.vercel.app`). Without it, the canonical tags point at `http://localhost:4173`.
3. Check that staging is not indexed: `curl -sI https://<staging-address>/ | grep -i x-robots-tag`. Vercel normally answers `x-robots-tag: noindex` on preview deployments. If the header is missing, turn on Vercel Deployment Protection for previews.
4. **Production:** only once Atlas's data is in (see "Going live"). In the **Production** environment set:
   - `BUILD_TARGET=production`;
   - `SITE_URL=https://<domain>`;
   - `VITE_WHATSAPP` and `VITE_PHONE`;
   - optionally `VITE_FORM_ENDPOINT` and `VITE_GA4_ID`.

   Then deploy. A failed production build means a fact is still unverified. Read the build log.
5. After the first production deploy:
   - `curl -sI https://<domain>/assets/<any file>` shows `cache-control: public, max-age=31536000, immutable`.
   - `curl -sI https://<domain>/` shows `cache-control: no-cache`.
   - `curl -sI https://<domain>/en` redirects to `/en/`.
   - `curl -sI https://<domain>/robots.txt` returns 200.

**Any other static host:** upload `dist/`. Serve `/assets/*` and `/img/*` with `Cache-Control: public, max-age=31536000, immutable`, and HTML with `no-cache`.

## Going live (when Atlas's answers arrive)

1. Fill in the content:
   - Replace each `[[TOKEN]]` in `src/content/ar.ts` and `src/content/en.ts` with Atlas's answer, or remove the line if Atlas says no. For `[[CONFIRM: …]]`, keep the words and delete the marker if confirmed; cut the clause if not.
   - Set `siteInfo.address` and, when they exist, `siteInfo.documents` in `src/content/site.ts`.
2. In `src/content/cranes.ts`:
   - set each confirmed crane's `capacityT` and `verified: true`;
   - set `hidden: true` for any crane Atlas does not want shown;
   - the Kobelco stays hidden unless Atlas says otherwise.
3. Wording: if Atlas confirms they own the cranes, switch «الرافعات» / "Cranes" to «الأسطول» / "Fleet" where copy deck §2 marks it.
4. Build locally exactly as production will:
   ```bash
   SITE_URL=https://<domain> VITE_WHATSAPP=<digits> VITE_PHONE=<+218…> npm run build:production
   ```
   It must pass.
5. Then QA it as production:
   - Start the preview.
   - Run `QA_TARGET=production SITE_URL=https://<domain> npm run qa`. It now expects **no** draft badges.
   - Run `npm run lighthouse`.
6. Set the Production environment variables in Vercel (above), deploy, then run the checks from "Deploy on Vercel" step 5.
7. Check the live site:
   - Google Rich Results Test on `https://<domain>/` (JSON-LD);
   - Facebook Sharing Debugger on both pages (Open Graph image and text);
   - a WhatsApp button on a phone opens the chat with the message;
   - add `https://<domain>/sitemap.xml` in Google Search Console.

## Edit the copy

- **All visible text** lives in `src/content/ar.ts` and `src/content/en.ts`. Both satisfy the same `Copy` type (`src/content/types.ts`), so a line missing in one language fails `npm run typecheck`.
- **Unknown facts** stay as `[[TOKEN]]`. The component hides the element in production, or shows the draft badge in staging. Never invent a value.
- **Numbers:** always go through `formatNumber` / `formatTonnes` (`src/lib/numbers.ts`), with Western digits in both languages. Model codes, phone numbers and emails inside Arabic text are wrapped in `<bdi>`.
- **Page titles, descriptions and Open Graph text** exist twice: in `meta` in `src/content/<lang>.ts`, and in the `<head>` of `index.html` / `en/index.html` (link previews need them in the static HTML). `src/seo/head.test.ts` fails if the two differ. Edit both, then run `npm test`.
- **WhatsApp message templates** are in the `whatsapp` group of the copy files. `{model}`, `{phone}` and similar placeholders are filled by `fillTemplate` (`src/lib/whatsapp.ts`).

## Add a crane

1. **Photos:**
   - Put the original photo(s) in the photo folder (`PHOTOS_DIR`).
   - Add crop entries for the new photo id to `assets-src/crops.json`, copying the structure of an existing entry such as `"6389"`. Every crop must stay clear of the watermark.
   - Run `npm run assets`. That regenerates `src/generated/images.ts`, and the new id joins `PhotoId`.
2. **Hook point** (optional): record it in `assets-src/hook-points.json` with `node scripts/mark-hooks.mjs`. Without a hook point, the Hoist simply draws no hook anchor for that crop.
3. **Id:** add the new id to the `CraneId` union in `src/content/types.ts` (lower-case model code, e.g. `| 'abc100'`).
4. **Data:** add the crane to `src/content/cranes.ts`. The shape is below; the angle-bracket values are placeholders, not data:
   ```ts
   { id: '<id>', make: '<Make>', model: '<Model code as printed on the machine>', type: '<rough-terrain | all-terrain | crawler>',
     capacityT: <max capacity in t>, hoistPhoto: '<photo id>', cardPhoto: '<photo id>', verified: false, hidden: false },
   ```
   Keep `verified: false` until Atlas confirms ownership and capacity. The Hoist, the grid, the filters and the form's crane list all sort and filter by `capacityT` and `type` automatically.
5. **Alt text:** add Arabic and English alt text for each new photo to the `alt` maps in `src/content/ar.ts` and `en.ts`. TypeScript fails until both exist. Describe only what is visible; no ownership claims.
6. **QA:** add the crane to `CRANES` in `qa/lib/checks.mjs` (model, type, tonnes). The filter and request checks use that list.
7. Run `npm run typecheck && npm test && npm run build`, start the preview, and run `npm run qa`.

## Photos

- **Rules:** only Atlas's own photos, never mirrored. Crops are defined in `assets-src/crops.json` and stay clear of the burned-in watermark.
- **Replace a photo, or add a clean export without the watermark:**
  1. Put the file in a folder, with the same file name as the original (e.g. `IMG_6398.JPG`).
  2. Run `PHOTOS_DIR=/path/to/that/folder npm run assets`. The originals in `~/Downloads` are never modified.
- If a clean export has a different pixel size from the original:
  - the crop rectangles (in source pixels) in `assets-src/crops.json` must be scaled to the new size;
  - the hook points must be re-marked (`node scripts/mark-hooks.mjs`);
  - then check the hook alignment in the browser at all 8 widths.
- Commit the regenerated `public/img/*`, `public/og-*.jpg` and `src/generated/images.ts`.

## Logo: replace the temporary badge

`public/brand/badge.png` is a stand-in **cropped from the watermark in IMG_6363**. When Atlas sends the vector logo:
1. Save it as `public/brand/logo.svg`.
2. Make raster copies:
   ```bash
   node -e "const s=require('sharp');Promise.all([s('public/brand/logo.svg',{density:600}).resize(180,180,{fit:'contain',background:'#ffffff'}).png().toFile('public/brand/apple-touch-icon.png'),s('public/brand/logo.svg',{density:600}).resize(512,512,{fit:'contain',background:'#ffffff'}).png().toFile('public/brand/logo-512.png')]).then(()=>console.log('ok'))"
   ```
3. In `src/components/Logo.tsx`, change the badge image source from `/brand/badge.png` to `/brand/logo.svg`. Keep its `width`, `height` and `alt`.
4. In **both** `index.html` and `en/index.html`, replace the two icon lines with:
   ```html
   <link rel="icon" href="/brand/logo.svg" type="image/svg+xml" />
   <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
   ```
   Also delete the "Temporary icon" comment above them.
5. In `src/seo/jsonld.ts`, change `logo` to `${input.siteUrl}/brand/logo-512.png`.
6. Update the expectations that name the old file:
   - `src/seo/head.test.ts` (`icons`): `['/brand/logo.svg', '/brand/apple-touch-icon.png']`;
   - `src/seo/jsonld.test.ts` (`logo`);
   - the file list in section 6 of `qa/run-qa.mjs` (`/brand/badge.png` → `/brand/logo.svg`).
7. Run `npm test && npm run build`, then QA.

## Analytics (GA4)

Analytics load only when `VITE_GA4_ID` is set, after the page's `load` event and an idle callback (`src/lib/analytics.ts`). Events:

| Event | Parameters | Fired when |
|---|---|---|
| `whatsapp_click` | `location`: `hero`, `bar`, `card`, `form` or `footer` | A WhatsApp button is used |
| `call_click` | — | A Call button is used |
| `request_crane` | `crane_id` | "Request this crane" is pressed |
| `form_submit` | `result` | The request form is sent (success, failure or WhatsApp fallback) |
| `filter_use` | — | A crane filter chip is pressed |
| `lang_switch` | — | The language link is used |

## Quality checks

Build first, then start the preview: `npx vite preview --port 4173`.

| Command | Output |
|---|---|
| `node qa/smoke-prerender.mjs` | No-JS rendering and clean hydration, for both pages |
| `npm run qa` | `qa/reports/results.json`, `qa/reports/summary.md`, `qa/reports/screens/<page>-<width>-<on\|off>.png` |
| `npm run lighthouse` | `qa/reports/lighthouse.json`, `qa/reports/lighthouse.md` (medians, Slow 4G, bundle budget, diagnostics) |
| `node qa/bundle-budget.mjs` | The bundle budget alone |
| `node qa/find-overflow.mjs /en/ 320` | Which elements overflow sideways at a width |
| `npx impeccable detect src/` and `npx impeccable detect http://localhost:4173/` | Design-quality detector (exit 0 = clean) |
| `npm run pdf` | `docs/exports/atlas-<ar\|en>-<desktop\|mobile>.pdf` |

`qa/reports/` is not committed. The final results are copied to `docs/qa/`, and summarised in `docs/qa-report.md`.

## Project layout

```
index.html, en/index.html   the two pages (static <head>, prerender markers)
src/content/                every word and fact (ar.ts, en.ts, cranes.ts, sites.ts, site.ts)
src/sections/, components/  the page, in order; shared components
src/lib/                    numbers, digits, WhatsApp links, the requested-crane store, analytics, language
src/motion/                 GSAP + Lenis, loaded after hydration; never edits React-owned DOM
src/seo/jsonld.ts           structured data; src/entry-server.tsx: prerender entry
scripts/                    fonts, images, hook points, prerender, PDF export
vite/                       truth gate, font preload, SITE_URL plugins
qa/                         QA, Lighthouse, bundle budget, smoke test
```
````

- [ ] **Step 4: Write `DESIGN.md`**

**Option A, if the Impeccable skill was installed in Gate I1** (Task I1.1 in `45-impeccable-gate-1.md`; `ls .claude/skills/impeccable` lists files):
1. Run `/impeccable document` in the agent. It writes a `DESIGN.md` from the code.
2. Compare it with the Option B content below. It must contain every section heading listed there (1–10) and agree with every value: tokens, sizes, rules.
3. Wherever it disagrees with the spec or omits a rule, replace that part with the Option B text. The spec wins.
4. Note in the commit message that the base came from `/impeccable document`.

**Option B, without the skill:** create `DESIGN.md` with exactly this content:
````markdown
# Atlas Alshraa: design system ("On the Hook")

This is the system behind the site, summarised from the approved spec (`docs/superpowers/specs/2026-11-04-atlas-website-design.md` §5–§8) and `docs/05-typography.md`. Where they differ, the spec wins. Tokens live in `src/styles.css` (`@theme`) and fonts in `src/fonts.css`.

## 1. The idea

Atlas's own line: «من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة» ("From smaller cranes to the largest ones, every project has the right crane").

The **crane hook** is the thread through the page:
- the real hook in the hero photo;
- the Hoist, where the cranes rise in order of capacity;
- the request, where the chosen crane rides "on the hook" into the request bar.

## 2. Colour

| Token | Value | Use |
|---|---|---|
| `navy-950` | #0D0C2B | Cinematic grounds: hero band, Hoist, services, form, footer |
| `navy` | #23207A | Brand on light: links, headings, borders, focus ring on light |
| `red` | #C9221C | Rope, hook, sling, primary buttons only |
| `red-bright` | #FF5A4F | Red text or lines on dark (6.2 : 1 on navy-950) |
| `concrete` | #F3F2EE | Reading grounds |
| `white` | #FFFFFF | Text on dark |
| `steel` | #A6A6C8 | Secondary text on dark (8 : 1) |
| `ink` | #14131F | Body text on light |
| `line` / `line-dark` | #D9D8E3 / rgba(255,255,255,.14) | Hairlines on light / dark |

**Rules:**
- Never red text on navy (2.4 : 1).
- **No yellow anywhere in the UI.** The machines' yellow comes only from the photos, which keep their original grading.
- Text over photos sits on solid bands, never on gradients over the sky.

## 3. Type

| Role | Font | Notes |
|---|---|---|
| Display (Latin) and **all numerals** | Archivo (variable: wght, wdth) | Readouts at wdth 75 / 800 with `tabular-nums` |
| Display (Arabic) | Noto Kufi Arabic (variable wght) | Arabic letters fall through to Kufi inside the display stack; digits stay Archivo |
| Body and UI, both scripts | IBM Plex Sans Arabic 400 / 600 | One family, Arabic and Latin ranges |
| Specs and data | IBM Plex Mono 500 | Model codes: "GMK6350 · 350 t" |

**Scale** (fluid from 360 to 1440 px). Each token has a class in `src/styles.css`.

| Class | EN | AR | Line-height EN / AR |
|---|---|---|---|
| `.t-readout` | 72 → 200 px | same | 0.9 / 1.0 |
| `.t-h1` | 38 → 72 px | 40 → 76 px | 1.04 / 1.3 |
| `.t-h2` | 30 → 48 px | 30 → 50 px | 1.08 / 1.35 |
| `.t-h3` | 21 → 28 px | 22 → 30 px | 1.2 / 1.45 |
| `.t-lead` | 18 → 21 px | 19 → 22 px | 1.55 / 1.8 |
| `.t-body` | 16 → 17 px | 17 → 18 px | 1.6 / 1.85 |
| `.t-spec` | 14 → 16 px | same | 1.5 / 1.6 |
| `.t-small` | 14 px | 15 px | 1.5 / 1.7 |
| `.t-label` | 12 → 13 px, caps, +0.14em | 13 → 14 px, no caps | 1.3 / 1.5 |

**Arabic rules:**
- letter-spacing is always 0;
- never `text-transform`;
- never justified;
- split text only by lines or words, never characters;
- emphasis comes from weight 600 and colour.

**Numbers:**
- Western digits in both languages, through `formatNumber` / `formatTonnes`;
- a no-break space between number and unit («350 طن», "350 t");
- ranges in Arabic read «من 55 إلى 350 طن».

**Bidi:**
- wrap model codes, phone numbers and emails inside Arabic text in `<bdi>`;
- set `lang` on mixed-language spans.

Each page preloads 3 font files. Every face has a metric-matched fallback (`size-adjust`, `ascent-override`) to keep CLS ≤ 0.05.

## 4. Layout

- 12 columns.
- `.shell`: max 90rem, margins `clamp(1rem, 4vw, 3.5rem)`.
- `.section-y`: padding `clamp(5rem, 12vw, 11rem)`.
- Breakpoints 360 / 640 / 768 / 1024 / 1280 / 1536.
- Body measure about 36rem EN / 38rem AR.
- Arabic is composed for RTL, not mirrored by default. **Photos are never flipped.**

## 5. Shape

- Corner radius 0–2 px, like steel plate.
- Hairline rules.
- No shadows except the request bar. No glass, no glow.
- Touch targets at least 44 px.

## 6. The hook: the one signature shape

- **One signature shape only.** No second motif competes with it.
- **Hero:** the WhatsApp button hangs from the **real hook in the photo** on two red SVG sling legs (`data-sling`). The overlay SVG shares the crop's viewBox with `preserveAspectRatio="xMidYMin slice"`, matching the image's `object-fit: cover; object-position: 50% 0`.
  - Hook points are stored per crop in `assets-src/hook-points.json`.
  - **If a crop has no hook point, no sling is drawn** and the button sits in the band.
- **Hoist:** the rope draws from the top. On the last crane (GMK6350) the UI hook settles on the real hook in the photo. On exit, the rope becomes the 1 px progress line on the reading-start edge.
- **Request:** the chosen crane's model chip flies along the hook path into the request bar: «على الخطّاف: GMK6350 ✕».
- **Footer:** "Back to top" is a hook icon. The rope ends at the outrigger pad.
- Colour: `red` on light, `red-bright` on dark. Never decorative repetition, never as a pattern.

## 7. The chevron motif

- Red/white chevrons are used **only** in two places:
  - the footer's outrigger pad;
  - draft and loading states (the `DraftBadge`: "DRAFT · unverified").
- Never as decoration elsewhere. Never yellow/black hazard stripes.

## 8. Motion

**Principle:** loads rise slowly, settle, and never bounce.

| Item | Rule |
|---|---|
| Easing | `power3.out` / `expo.out` for entrances; `power2.inOut` for transitions |
| Durations | 0.6–1.2 s; stagger 0.06–0.1 s |
| Properties | Only `transform`, `opacity` and `clip-path` animate |

**Contexts** (`gsap.matchMedia`; the current one is in `html[data-motion]`):

| Context | When | What runs |
|---|---|---|
| `desktop` | ≥ 1024 px, fine pointer, motion allowed | Lenis smooth scroll, the pinned Hoist with scrub (≈30 vh in, 55 vh per crane, 30 vh out, snapping to each crane) |
| `touch` | Motion allowed, not desktop | No Lenis, no pinning; a "load stack" where tags drop on a short rope and count up once |
| `reduced` | `prefers-reduced-motion: reduce` | No timelines; final states rendered |

**Hero** (everything is still by 2.0 s):
- the photo scales 1.05 → 1;
- the sling draws downward;
- the H1 rises in masked lines;
- the button settles with one damped swing.

**SplitText:**
- `type: "lines"` (plus words in Arabic, never characters);
- `mask: "lines"`;
- runs only after `document.fonts.ready`;
- the full sentence stays in `aria-label`.

**Limits and safety:**
- One pinned scene per page.
- No custom cursor, no magnetic buttons, no sound, no 3D.
- Content is visible without JS and without motion. Motion only sets "from" states right before playing. **The hero image is never hidden.**
- Motion never reparents or deletes React nodes. Flights animate clones appended to `<body>`, which are removed afterwards.

## 9. Accessibility (WCAG 2.2 AA)

- **Focus:** 2 px outline with a 3 px offset, white on dark and navy on light. Never hidden by the request bar (`scroll-padding-bottom`).
- **Navigation:** a skip link to `#main`. Native `<dialog>` for the menu and the lightbox. Arrow keys follow the reading direction.
- **Content:** the Hoist and the grid are real lists. Alt text comes from copy deck §12.
- **Forms:** labels, hints, `aria-describedby`, `aria-invalid`, an error summary with links. Arabic digits are accepted («٣٥٠»).

## 10. Components (DOM contract)

The stable hooks that motion and QA rely on (`data-*` attributes and `data-testid`) are listed in the implementation plan, contract C9 (`docs/superpowers/plans/parts/00-header-contracts.md`). Keep them when you restyle a component.
````

- [ ] **Step 5: Write the Atlas content checklist**

Create `docs/atlas-content-checklist.md`. It comes from spec §13 and copy deck §13; nothing new is asked.
````markdown
# قائمة ما نحتاجه من أطلس الصحراء · What we need from Atlas Alshraa

> **كيف تستخدمون هذه القائمة:** اكتبوا الإجابة تحت كل بند أو أرسلوا الملف المطلوب، ثم ضعوا علامة ✔ في المربّع. الموقع يعمل الآن نسخةً تجريبية تظهر عليها شارة «مسودة» بجانب كل معلومة لم تُؤكَّد بعد. لن يُنشر الموقع الرسمي قبل اكتمال القسم (أ) وتأكيد الرافعات في القسم (ب).
>
> **How to use this list:** write the answer under each item, or send the file, then tick the box. The site now runs as a staging draft that shows a "DRAFT" badge next to every fact not yet confirmed. The live site is published only after section A is complete and the cranes in section B are confirmed.

## أ. ما يمنع الإطلاق · A. Blocks launch

- [ ] **رقم الهاتف** · Phone number
  يظهر في: زر «اتصل»، قسم التواصل، أسفل الصفحة · Used in: Call button, contact section, footer
  الإجابة · Answer: ______________________
- [ ] **رقم واتساب بالصيغة الدولية، أرقام فقط** (مثل 2189XXXXXXXX) · WhatsApp number, international format, digits only
  يظهر في: كل أزرار واتساب ورسائلها الجاهزة · Used in: every WhatsApp button and ready-made message
  الإجابة · Answer: ______________________
- [ ] **المدينة والعنوان** · City and address
  يظهر في: قسم التواصل، أسفل الصفحة، بيانات جوجل · Used in: contact section, footer, Google structured data
  الإجابة · Answer: ______________________
- [ ] **موقع الشركة على الخريطة** (رابط من خرائط جوجل) · Map pin (Google Maps link)
  الإجابة · Answer: ______________________
- [ ] **ساعات العمل** · Working hours
  الإجابة · Answer: ______________________
- [ ] **رابط صفحة فيسبوك الرسمية** (للتأكيد) · Official Facebook page link (to confirm)
  الإجابة · Answer: ______________________
- [ ] **اسم النطاق (الدومين) للموقع** · Domain name for the site
  الإجابة · Answer: ______________________
- [ ] **كتابة الاسم بالإنجليزية** · English spelling of the name
  ☐ Atlas Alshraa (كما في الشعار · as on the logo) ☐ Atlas Al-Sahraa ☐ Atlas Alsahra (كما في البريد · as in the email) ☐ غير ذلك · other: __________
- [ ] **الموافقة على وصف النشاط:** تأجير الرافعات، النقل الثقيل، المناولة، الخدمات النفطية (وليس تجارة المعدات) · Approve the positioning: crane hire, heavy transport, handling, oil services (not equipment trading)
  ☐ موافق · Approved ☐ ملاحظات · Notes: __________
- [ ] **الموافقة على العنوان الرئيسي** «من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة» · Approve the main headline (Atlas's own Facebook line)
  ☐ موافق · Approved
- [ ] **الموافقة على جملتي قسم التواصل** «تواصلوا معانا وخلي الباقي علينا» و«شنو الرافعة اللي يحتاجها مشروعك؟» · Approve the two dialect lines in the contact section
  ☐ موافق · Approved
- [ ] **ملف الشعار الأصلي** (SVG أو PDF أو AI)، والموافقة على وضع الشعار بجانب الاسم المكتوب «أطلس الصحراء · Atlas Alshraa» · Logo source file (SVG, PDF or AI), and approval of the badge next to the typeset name
- [ ] **صور أصلية بدون العلامة المائية** للصور IMG_6398 وIMG_6389 وIMG_6374 وIMG_6380 (والباقي إن أمكن) · Clean exports without the watermark of IMG_6398, IMG_6389, IMG_6374 and IMG_6380 (others if possible)

## ب. الرافعات · B. Cranes

الأرقام في العمود الثاني مأخوذة من الصور أو من تصنيف الشركة المصنّعة، **وليست مؤكَّدة لكم**. نرجو تصحيحها أو تأكيدها.
The numbers in the second column come from the photos or the maker's rating and **are not confirmed for Atlas**. Please correct or confirm them.

| الرافعة · Crane | ما تُظهره الصور · What the photos show | أقصى حمولة (طن) · Max capacity (t) | ملك أم شريك؟ · Owned or partner? | العدد · Units | طول الذراع الرئيسي (م) · Main boom (m) | جدول الأحمال PDF · Load chart PDF |
|---|---|---|---|---|---|---|
| Grove RT700E | تصنيف المصنّع 60 طناً أمريكياً ≈ 55 طن · maker's rating 60 US tons ≈ 55 t | | | | | ☐ |
| Faun ATF 60-3 (يُرجى تأكيد الطراز · confirm the model) | على الكابينة «ATF 60-3» · cab reads "ATF 60-3" (60 t) | | | | | ☐ |
| Terex AC200-1 | ملصق «200T capacity class» · label reads "200T capacity class" | | | | | ☐ |
| FW.China (Fuwa) QUY250 | اسم الطراز فقط (250 طن؛ بعض المصادر 260) · model name only (250 t; some listings 260 t) | | | | | ☐ |
| Grove GMK6350 | على الذراع «350 TON» · boom reads "350 TON" | | | | | ☐ |
| Kobelco CKE2500 | تحمل شعار شركة أخرى وموقعها · carries another company's logo and website | | | | | ☐ |

- [ ] **رافعة Kobelco CKE2500: هل نعرضها في الموقع؟** · Kobelco CKE2500: may we show it at all?
  ☐ نعم · Yes ☐ لا · No
- [ ] **هل الرافعات ملك لكم؟** إذا كانت كذلك نكتب «أسطولنا» بدل «الرافعات» · Are the cranes yours? If so, the site can say "Our fleet" instead of "Cranes"
  ☐ نعم · Yes ☐ بعضها · Some (حدّدوها · which: ________) ☐ لا · No
- [ ] **العدد الإجمالي للرافعات** (إن كانت ملكاً لكم) · Total number of cranes (if owned): ______
- [ ] **أصغر وأكبر سعة مؤكَّدة** · Smallest and largest confirmed capacity: من · from ______ إلى · to ______ طن · t
- [ ] **رافعات أخرى لديكم غير موجودة في الصور** (الطراز والسعة، مع صورة) · Other cranes you have that are not in these photos (model, capacity, a photo)
  الإجابة · Answer: ______________________

## ج. تفاصيل الخدمات · C. Service details

- [ ] **تأجير الرافعات:** هل يشمل التأجير المشغّل؟ هل يمكن أن نكتب «كل رافعة تأتي مع مشغّل ذي خبرة»؟ · Crane hire: is an operator included? May we say "Every crane comes with an experienced operator"?
  الإجابة · Answer: ______________________
- [ ] **النقل الثقيل:** هل هو على الطرق؟ ما نوع المقطورات (منخفضة «لوبد» أو غيرها)؟ هل هناك حدّ للوزن أو المقاس نذكره؟ · Heavy transport: by road? Which trailers (low-bed or others)? Any weight or size limit worth stating?
  الإجابة · Answer: ______________________
- [ ] **المناولة:** ماذا تشمل؟ (فريق ربط، حبال وأدوات رفع، خطة رفع، تحميل وتنزيل) · Handling: what does it cover? (rigging crew, slings and lifting gear, lift plans, loading and unloading)
  الإجابة · Answer: ______________________
- [ ] **الخدمات النفطية:** النطاق الدقيق في سطرين أو ثلاثة · Oil services: the exact scope in 2–3 lines
  الإجابة · Answer: ______________________
- [ ] **هل يبقى «وزن الحمولة» حقلاً إلزامياً عند طلب الخدمات النفطية؟** · Should "load weight" stay required for oil-services requests?
  ☐ نعم · Yes ☐ لا · No

## د. إثباتات ووثائق · D. Proof and documents

القسم الخاص بهذه المعلومات مخفي في الموقع حتى تصل. · This section of the site stays hidden until these arrive.

- [ ] **سنة التأسيس** · Founding year: ______
- [ ] **المدن أو المناطق التي تعملون فيها** · Cities or regions you work in: ______________________
- [ ] **تدريب أو شهادات المشغّلين** (إن وُجدت) · Operator training or certification (if any): ______________________
- [ ] **جهة فحص الرافعات** (إن وُجدت) · Third-party crane inspection body (if any): ______________________
- [ ] **التأمين** (الجهة أو نوع التغطية، إن رغبتم في ذكره) · Insurance (insurer or cover type, if you want it shown): ______________________
- [ ] **عملاء أو مشاريع يمكن ذكرها** (بموافقة مكتوبة منهم) · Clients or projects you may name (with their written permission): ______________________
- [ ] **وثائق PDF الموجودة فعلاً فقط**، مع لغة كل وثيقة وتاريخها · Documents as PDF, only those that exist, with each one's language and date:
  - ☐ ملف تعريف الشركة · Company profile (اللغة · language: ____ التاريخ · date: ____)
  - ☐ قائمة الرافعات · Fleet list (____ / ____)
  - ☐ شهادات الفحص · Inspection certificates (____ / ____)
  - ☐ الصحة والسلامة والبيئة · HSE (____ / ____)
  - ☐ شهادة ISO · ISO certificate (____ / ____)
  - ☐ التأمين · Insurance (____ / ____)
  - ☐ السجل التجاري · Commercial registration (____ / ____)
- [ ] **رقم السجل التجاري** (إن رغبتم في عرضه أسفل الصفحة) · Commercial registration number, if you want it in the footer: ______

## هـ. نموذج الطلب والردود · E. Request form and replies

- [ ] **مدة الرد المعتادة** (إن رغبتم في ذكرها) · How fast you usually reply (if you want to promise it): ______
- [ ] **من يستلم الطلبات؟** (بريد إلكتروني أو رقم واتساب) · Who receives requests (which inbox or WhatsApp number)? ______________________
- [ ] **الموافقة على جملة الخصوصية:** «نستخدم بياناتك للرد على طلبك فقط.» · Approve the privacy line: "We use your details only to reply to your request."
  ☐ موافق · Approved
- [ ] **طريقة استلام الطلبات عند الإطلاق** · How requests are sent at launch
  ☐ واتساب فقط · WhatsApp only ☐ بريد إلكتروني عبر خدمة نماذج (مثل Formspree) · Email through a form service (e.g. Formspree)
- [ ] **إحصاءات الزيارات (اختياري):** هل تريدون ربط Google Analytics؟ · Visit statistics (optional): do you want Google Analytics connected?
  ☐ نعم، معرّف GA4 · Yes, GA4 ID: ________ ☐ لا · No

## و. الصور والمواقع · F. Photos and sites

- [ ] **الإذن بعرض موقعي التصوير كما هما دون ذكر اسميهما** · Permission to show the two shoot sites as they are, unnamed
  ☐ موافق · Approved
- [ ] **صور Kobelco (IMG_6367 وIMG_6370 وIMG_6371): نعرضها أم نستبعدها؟** · Kobelco photos: show them or leave them out?
  ☐ نعرضها · Show ☐ نستبعدها · Leave out
- [ ] **ملف الفيديو الأصلي (41 ثانية) المنشور على فيسبوك** (اختياري) · Source file of the 41-second Facebook video (optional)
- [ ] **اسم المصوّر** إن كان يجب ذكره · Photographer credit, if one is required: ______________________

## ماذا يحدث بعد ذلك · What happens next

1. نُدخل إجاباتكم في الموقع، فتختفي شارات «مسودة» من المعلومات المؤكَّدة. · We enter your answers; the DRAFT badges disappear from confirmed facts.
2. نرسل لكم رابط النسخة التجريبية للمراجعة. · We send you the staging link to review.
3. بعد موافقتكم ننشر الموقع على النطاق الرسمي. · After your approval we publish the site on your domain.
````

- [ ] **Step 6: Check every path the docs mention**

```bash
for f in DESIGN.md docs/atlas-content-checklist.md docs/superpowers/specs/2026-11-04-atlas-website-design.md \
  src/content/ar.ts src/content/en.ts src/content/cranes.ts src/content/site.ts src/content/types.ts \
  src/lib/numbers.ts src/lib/whatsapp.ts src/lib/analytics.ts src/components/Logo.tsx src/seo/jsonld.ts src/seo/head.test.ts \
  assets-src/crops.json assets-src/hook-points.json scripts/mark-hooks.mjs scripts/build-assets.mjs vite/truth-gate.ts \
  scripts/prerender.mjs qa/lib/checks.mjs qa/run-qa.mjs qa/smoke-prerender.mjs qa/bundle-budget.mjs qa/find-overflow.mjs \
  public/brand/badge.png vercel.json; do test -e "$f" || echo "MISSING $f"; done; echo checked
```
Expected: only `checked`.

For every `MISSING` line, open the doc that names the path. Change the doc to the real path, or note that the item comes later (for example `docs/qa-report.md` comes in E.8).

- [ ] **Step 7: Commit**

```bash
git add vercel.json README.md DESIGN.md docs/atlas-content-checklist.md scripts/build-assets.mjs
git commit -m "docs: README, DESIGN and Atlas content checklist; Vercel config with cache headers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
If DESIGN.md came from `/impeccable document`, add a line to the message body: `DESIGN.md base generated by /impeccable document, checked against the spec.`

---
### Task E.7: PDF screen exports (in place of Figma files)

The spec (§2) replaces the proposal's "approved design files (Figma)" with **PDF screen exports**: desktop and mobile, AR and EN.

**How the PDF is laid out.** Each PDF page is exactly one screen high (900 px desktop, 844 px mobile), and the pages run down the whole site. A single giant page would resize every `vh`/`svh` unit to the page height, which would stretch the hero. Viewport-high pages keep the layout identical to the screen. Fixed elements (header, request bar) repeat on every page, as they do on a real screen.

**Files:**
- Create: `scripts/export-pdf.mjs`, `docs/exports/atlas-ar-desktop.pdf`, `docs/exports/atlas-ar-mobile.pdf`, `docs/exports/atlas-en-desktop.pdf`, `docs/exports/atlas-en-mobile.pdf`

- [ ] **Step 1: Write the export script**

Create `scripts/export-pdf.mjs`:
```js
// PDF screen exports (spec §2: in place of Figma files). Each page × desktop 1440 / mobile 390,
// with reduced motion so every element shows its final state. One PDF page per screen height,
// so vh/svh units keep their on-screen size. Usage (preview running): npm run pdf [-- baseUrl]
import { mkdir, readFile, stat } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('../docs/exports/', import.meta.url).pathname;
const PAGES = [
  { lang: 'ar', path: '/' },
  { lang: 'en', path: '/en/' },
];
const DEVICES = [
  { id: 'desktop', width: 1440, height: 900, mobile: false },
  { id: 'mobile', width: 390, height: 844, mobile: true },
];

const ping = await fetch(`${BASE}/`).catch(() => null);
if (!ping?.ok) {
  console.error(`Cannot reach ${BASE}/. Build, then start the preview: npx vite preview --port 4173`);
  process.exit(2);
}
await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] });
let failed = 0;

for (const p of PAGES) {
  for (const d of DEVICES) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: d.width, height: d.height, isMobile: d.mobile, hasTouch: d.mobile, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE + p.path, { waitUntil: 'networkidle0', timeout: 60000 });
    // Load every lazy image and the fonts, then return to the top.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
      });
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))));
      await document.fonts.ready;
    });
    await page.emulateMediaType('screen');
    const file = `${OUT}atlas-${p.lang}-${d.id}.pdf`;
    await page.pdf({
      path: file,
      width: `${d.width}px`,
      height: `${d.height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    const { size } = await stat(file);
    const head = (await readFile(file)).subarray(0, 5).toString('latin1');
    const pages = ((await readFile(file)).toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
    const ok = head === '%PDF-' && size > 50_000;
    if (!ok) failed++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${file.replace(OUT, 'docs/exports/')} ${(size / 1e6).toFixed(2)} MB, ~${pages} page(s)`);
    await context.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Export**

```bash
node --check scripts/export-pdf.mjs && npm run build
```
Start the preview (Conventions), then:
```bash
npm run pdf; echo "exit=$?"
```
Expected: four `OK` lines, then `exit=0`.
```
OK   docs/exports/atlas-ar-desktop.pdf N.NN MB, ~N page(s)
OK   docs/exports/atlas-ar-mobile.pdf …
OK   docs/exports/atlas-en-desktop.pdf …
OK   docs/exports/atlas-en-mobile.pdf …
```
Stop the preview.

- [ ] **Step 3: Verify the files exist and open**

```bash
ls -la docs/exports/
for f in docs/exports/*.pdf; do printf '%s ' "$(head -c 5 "$f")"; mdls -raw -name kMDItemNumberOfPages "$f"; echo "  $f"; done
open docs/exports/atlas-ar-mobile.pdf docs/exports/atlas-en-desktop.pdf
```
Expected:
- 4 files.
- Each line starts with `%PDF-` and a page count. `mdls` may print `(null)` for a minute until Spotlight indexes the file; the script's `~N page(s)` is the fallback.
- Preview opens both files.

Look through every page of all four files and record in `docs/qa-report.md` §8:
- **Arabic:** letters joined (no broken shaping), text right-to-left, model codes in the right order («جروف GMK6350 · 350 طن» style lines intact).
- **Clipping:** no text clipped at page edges in the middle of a line. A page break through a section is expected; text cut in half is not.
- **Photos:** loaded everywhere, including the sites strips.
- **Draft badges:** visible (this is a staging build). Tell Atlas these are staging screens.

- [ ] **Step 4: Commit**

Check the sizes first: `ls -la docs/exports`. The PDFs embed the photos at the resolution the page loaded them, so 5–25 MB per file is normal. GitHub warns above 50 MB and rejects files above 100 MB. Do not commit a file over 50 MB: deliver it separately (for example in the agency's shared drive), and add one line to the README "Quality checks" section saying where it is.
```bash
git add scripts/export-pdf.mjs docs/exports/*.pdf
git commit -m "docs: PDF screen exports, AR/EN × desktop/mobile (in place of Figma)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task E.8: Final verification, report and release checklist

Run everything once more, from a clean build, in a fixed order, and write the real results into `docs/qa-report.md`. **Every cell is something you observed.** Write `not run` where a step was not run, and paste error text verbatim.

**Files:**
- Create: `docs/qa-report.md` (if E.5 didn't), `docs/qa/qa-summary.md`, `docs/qa/qa-results.json`, `docs/qa/lighthouse.md`, `docs/qa/lighthouse.json`, `docs/qa/impeccable.txt`, `docs/qa/build-production.txt`
- Modify: `docs/qa-report.md` (fill every section)

- [ ] **Step 1: The report template**

If `docs/qa-report.md` doesn't exist yet, create it with exactly this content. If E.5 created it, keep its Fix log rows and fill the rest.
````markdown
# Atlas Alshraa website: QA report

> Every value below was observed on the date shown. "not run" means the step was not run. Failures are listed as failures, with their numbers. Thresholds come from the spec (§1, §8, §9, §11) and were not changed.

## 1. Build under test

| Item | Value |
|---|---|
| Date | |
| Commit (`git rev-parse --short HEAD`) | |
| Node (`node -v`) | |
| Chrome (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version`) | |
| Lighthouse (`npx lighthouse --version`) | |
| Build target | staging |
| `SITE_URL` used for the build | http://localhost:4173 (unset) |
| Draft tokens reported by the prerender | |

## 2. Commands and exit codes

| # | Command | Exit code | Result line (copied from the terminal) |
|---|---|---|---|
| 1 | `npm run typecheck` | | |
| 2 | `npm test` | | |
| 3 | `npm run build` | | |
| 4 | `node qa/smoke-prerender.mjs` | | |
| 5 | `npm run qa` | | |
| 6 | `npm run lighthouse` | | |
| 7 | `npm run pdf` | | |
| 8 | `npx impeccable detect src/` | | |
| 9 | `npx impeccable detect http://localhost:4173/` | | |
| 10 | `npx impeccable detect http://localhost:4173/en/` | | |
| 11 | `npm run build:production` (expected to FAIL until Atlas data arrives) | | |

## 3. Functional QA (`docs/qa/qa-summary.md`)

| Area | Passed | Failed |
|---|---|---|
| (copy every row from the summary) | | |

**Total:** __ / __ checks passed.

Failures (verbatim from the summary, or "None."):

## 4. Lighthouse medians (3 runs each, `docs/qa/lighthouse.md`)

| Page | Form factor | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) | Result |
|---|---|---|---|---|---|---|---|---|---|
| ar | mobile | | | | | | | | |
| ar | desktop | | | | | | | | |
| en | mobile | | | | | | | | |
| en | desktop | | | | | | | | |

Slow 4G with applied throttling (1 run, Arabic page, informational):

| Perf | LCP (ms) | CLS | TBT (ms) | FCP (ms) |
|---|---|---|---|---|
| | | | | |

## 5. Budgets (spec §1, §8, §9)

| Measure | Budget | Measured | Pass? |
|---|---|---|---|
| First load, AR mobile | ≤ 1 MB (1,000 KB) | | |
| Initial JS (gzip) | ≤ 110 KB | | |
| CSS (gzip) | ≤ 25 KB | | |
| Hero AVIF, mobile | ≤ 80 KB | | |
| Hero AVIF, desktop | ≤ 120 KB | | |
| Fonts preloaded per page | 3 | | |
| Hoist code in a separate lazy chunk | yes | | |
| LCP, mobile median (both pages) | ≤ 2000 ms | | |
| CLS (all configurations) | ≤ 0.05 | | |
| TBT (all configurations) | ≤ 150 ms | | |
| INP | ≤ 150 ms | not measurable in Lighthouse navigation runs; see §11 | |
| Lighthouse categories | ≥ 90 × 4 categories × 4 configurations | | |
| axe serious/critical violations | 0 (all 32 page/width/motion cases) | | |

## 6. Impeccable detector

| Target | Exit code | Findings (rule ids) or "none" |
|---|---|---|
| `src/` | | |
| `http://localhost:4173/` | | |
| `http://localhost:4173/en/` | | |

## 7. Truth gate in production mode

- Command: `npm run build:production`
- Exit code:
- What the gate listed (verbatim, from `docs/qa/build-production.txt`):

```
(paste)
```

- Expected while Atlas data is outstanding: a non-zero exit that lists the unverified cranes and the missing `SITE_URL` / `VITE_WHATSAPP` / `VITE_PHONE`. A **zero** exit here before Atlas's data arrives would be a bug in the gate.

## 8. PDF screen exports

| File | Pages | Size | Opened and checked (Arabic shaping, RTL order, no clipped lines, photos loaded) |
|---|---|---|---|
| docs/exports/atlas-ar-desktop.pdf | | | |
| docs/exports/atlas-ar-mobile.pdf | | | |
| docs/exports/atlas-en-desktop.pdf | | | |
| docs/exports/atlas-en-mobile.pdf | | | |

## 9. Fix log

| # | Finding (check name) | Cause | Fix (files) | Before | After | Commit | Status (fixed / open + reason) |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## 10. Visual check in the browser pane (spec §11.4)

| Check | AR | EN | Notes |
|---|---|---|---|
| Hook alignment (sling on the real hook) at 320 / 375 / 414 / 768 / 1024 / 1280 / 1440 / 1920 | | | |
| RTL details: arrows, strip direction, `<bdi>` model codes, number + unit order | | | |
| Hoist beats on desktop: rope draws, tags hoist and set down, counter runs, last hook settles on the GMK6350's hook | | | |
| Touch load stack (375): tags drop once, count up once | | | |
| Reduced motion: static, final numbers, nothing missing | | | |

## 11. Not covered here: check on real phones

The agency should check these on a real iPhone (Safari) and a real Android phone (Chrome):

| # | Check | iPhone | Android |
|---|---|---|---|
| 1 | WhatsApp buttons open the WhatsApp app with the message (production numbers) | | |
| 2 | Call button dials the number | | |
| 3 | Request bar sits above the home indicator (`safe-area-inset-bottom`) and never covers a focused field | | |
| 4 | Arabic keyboard digits («٣٥٠») accepted in weight and phone | | |
| 5 | Menu opens, closes, and the page doesn't scroll behind it | | |
| 6 | Sites strips swipe in the reading direction; lightbox opens and closes | | |
| 7 | Hero hook alignment in portrait and landscape | | |
| 8 | Scrolling feels smooth with motion on; INP feels instant on buttons and chips | | |
| 9 | Link preview when the URL is pasted into WhatsApp (image, title, description in the right language) | | |

## 12. Open items from Atlas (production is blocked until these arrive)

See `docs/atlas-content-checklist.md`. At the date of this report, outstanding:
- [ ] Phone and WhatsApp numbers
- [ ] Address / city / map pin, hours
- [ ] Crane ownership, confirmed capacities and quantities; the Kobelco decision
- [ ] Logo vector file
- [ ] Clean exports of 6398, 6389, 6374, 6380
- [ ] Service details (`[[CONFIRM]]` items)
- [ ] Founding year, regions, clients, documents
- [ ] English name spelling and the domain
- [ ] Approval of the positioning and the dialect lines
````

- [ ] **Step 2: Static checks**

```bash
git status --short
node -v
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version
npx lighthouse --version
npm run typecheck; echo "exit=$?"
npm test; echo "exit=$?"
```
Expected:
- `git status --short` prints nothing (clean tree).
- Both `exit=0`.
- `npm test` ends with a summary like `Test Files  NN passed`.

Write the versions in §1. Write the exit codes and result lines in §2 rows 1–2.

- [ ] **Step 3: Staging build**

```bash
unset SITE_URL VITE_SITE_URL BUILD_TARGET
npm run build; echo "exit=$?"
```
Expected:
- `exit=0`.
- The prerender lines for both pages.
- `prerender: sitemap.xml and robots.txt for http://localhost:4173`.
- Possibly a `draft token(s)` line. Copy it into §1.

- [ ] **Step 4: Runtime checks, all against the same build**

Start the preview (Conventions), then run these one after another:
```bash
node qa/smoke-prerender.mjs; echo "exit=$?"
(set -o pipefail; npm run qa 2>&1 | tee qa/reports/qa-console.txt); echo "exit=$?"
(set -o pipefail; npm run lighthouse 2>&1 | tee qa/reports/lighthouse-console.txt); echo "exit=$?"
npm run pdf; echo "exit=$?"
npx impeccable detect src/ > qa/reports/impeccable-src.txt 2>&1; echo "exit=$?"
npx impeccable detect http://localhost:4173/ > qa/reports/impeccable-ar.txt 2>&1; echo "exit=$?"
npx impeccable detect http://localhost:4173/en/ > qa/reports/impeccable-en.txt 2>&1; echo "exit=$?"
```
Expected: each command prints its own summary, and every `exit=` is recorded in §2 rows 4–10.

The target is `exit=0` everywhere. Any non-zero value is written down as it is, and its failures are copied into §3–§6. Do not rerun a command only to get a better number. If you rerun for a real reason (for example a crashed run), write both results and the reason.

Then stop the preview.

- [ ] **Step 5: Keep copies of the reports in the repository**

```bash
mkdir -p docs/qa
cp qa/reports/summary.md docs/qa/qa-summary.md
cp qa/reports/results.json docs/qa/qa-results.json
cp qa/reports/lighthouse.md docs/qa/lighthouse.md
cp qa/reports/lighthouse.json docs/qa/lighthouse.json
cat qa/reports/impeccable-src.txt qa/reports/impeccable-ar.txt qa/reports/impeccable-en.txt > docs/qa/impeccable.txt
ls docs/qa
```
Expected: the six files are listed.

- [ ] **Step 6: Prove the production gate blocks unverified data**

```bash
npm run build:production > docs/qa/build-production.txt 2>&1; echo "exit=$?"
tail -40 docs/qa/build-production.txt
```
Expected: `exit=` with a **non-zero** value, and output from the truth gate (`vite/truth-gate.ts`, A2) that lists:
- each shown crane with `verified: false` (`rt700e`, `atf60-3`, `ac200-1`, `quy250`, `gmk6350`);
- the missing variables (`SITE_URL`, `VITE_WHATSAPP`, `VITE_PHONE`).

Paste the listed items verbatim into §7.

If the exit code is `0`, that is a **bug in the gate**, not a pass. Log it in §9 as open with severity "blocks release", and fix it in `vite/truth-gate.ts` (A2's task) before handover.

Restore the staging build, because the failed production build may have left `dist/` half-written:
```bash
npm run build; echo "exit=$?"
```
Expected: `exit=0`.

- [ ] **Step 7: Fill in the report**

Fill §1–§8 from the outputs above:
- §3 from `docs/qa/qa-summary.md`;
- §4 and §5 from `docs/qa/lighthouse.md` (Medians, Slow 4G and Bundle budget tables) and from `node qa/bundle-budget.mjs` details (`fontPreloads`, the `hoist` chunk in `lazyJs`);
- §5 "axe" from the `[axe]` rows of the summary;
- §6 from `docs/qa/impeccable.txt`;
- §8 from E.7 Step 3.

Keep §9 from E.5, and add any new failure from this run as a row.

- [ ] **Step 8: Visual check in the browser pane (spec §11.4)**

Start the preview, and open `http://localhost:4173/` and `http://localhost:4173/en/` in the browser pane. For each width in the §10 row, resize the pane (`resize_window` with `width`/`height`, or the pane's viewport menu). Check:
- the sling legs meet the real hook in the photo;
- the RTL details;
- on desktop width, the Hoist beats as you scroll through `#cranes`.

Record what you saw in §10, with a screenshot path for every problem. Reset the viewport to desktop when done, then stop the preview.

- [ ] **Step 9: Release checklist** (tick each item in your notes; the answers go in the report or the commit)

- [ ] `git status` is clean apart from the report files of this task.
- [ ] README "Going live" matches the actual env vars in `src/env.ts` (`grep -n "import.meta.env" src/env.ts` lists `VITE_SITE_URL`, `VITE_WHATSAPP`, `VITE_PHONE`, `VITE_FORM_ENDPOINT`, `VITE_GA4_ID`).
- [ ] Staging deploy:
  - push the branch;
  - in Vercel set `SITE_URL` for Preview to the staging address;
  - open the preview URL, and check `curl -sI <preview>/ | grep -i x-robots-tag` → `noindex`;
  - check `view-source:` shows the prerendered HTML and the canonical on the staging address.
- [ ] Sent to Atlas, with the agency's go-ahead (this deliverable is not sent by the engineer on their own): the staging link, `docs/atlas-content-checklist.md` and the four PDFs from `docs/exports/`, with a note that the draft badges mark facts waiting for their confirmation.
- [ ] **Go-live is blocked until Atlas data arrives.** When it does, follow README → "Going live". In short:
  1. replace the tokens and set `siteInfo.address`;
  2. mark confirmed cranes `verified: true` with their confirmed `capacityT`, and hide what Atlas does not want shown;
  3. set `SITE_URL`, `VITE_WHATSAPP` and `VITE_PHONE` (plus optional `VITE_FORM_ENDPOINT` and `VITE_GA4_ID`) and `BUILD_TARGET=production` in Vercel Production;
  4. run `SITE_URL=… VITE_WHATSAPP=… VITE_PHONE=… npm run build:production` locally until it passes;
  5. run `QA_TARGET=production SITE_URL=… npm run qa` and `npm run lighthouse` against that build;
  6. deploy;
  7. run the post-deploy header checks, the Rich Results Test, the Facebook Sharing Debugger, the phone checks in §11, and submit the sitemap in Search Console.

- [ ] **Step 10: Commit**

```bash
git add docs/qa-report.md docs/qa docs/exports
git commit -m "docs: final QA report with measured results, production gate check and release checklist

PDF screen exports regenerated from the final staging build.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline -12
```
Expected: the commit is created, and the log shows the Part E commits (E.1–E.4, the E.5 fixes, E.6, E.7, E.8).

---

### Proposed contract additions (from Part E)

These extend `00-header-contracts.md`. Nothing here changes an existing contract name.

1. **HTML markers (C10/C1).**
   - `index.html` and `en/index.html` contain exactly one `<div id="root"><!--app--></div>` and one `<!--head-->` just before `</head>`.
   - `scripts/prerender.mjs` replaces both. In dev, the comments stay and are harmless.
   - Part E rewrites both heads in full. A1's inline script (C10) is kept verbatim.
2. **`src/main.tsx` hydrates.**
   - It uses `hydrateRoot` when `#root` has an element child (prerendered pages), with `onRecoverableError` logging `console.error('[hydration]', …)`. Otherwise it uses `createRoot` (dev).
   - It wraps `<StrictMode><LangProvider lang={document.documentElement.lang}><App/></LangProvider></StrictMode>`, the same tree as `src/entry-server.tsx`.
   - `App` must therefore **not** render its own `LangProvider`.
3. **`src/entry-server.tsx`** exports `render(lang: Lang): string` and `head(lang: Lang): string` (JSON-LD, plus the hero preloads if E.5 F1 is applied).
4. **`src/seo/jsonld.ts`** exports `ORG_NAME`, `buildJsonLd(input: JsonLdInput)` and `jsonLdScript(data)`. The JSON-LD is built at prerender time from `siteInfo` and `env`, not hand-written in the HTML. `telephone` appears only when `env.phone` is set; `address` only when `siteInfo.address` is non-null.
5. **Sitemap location.** It is generated into **`dist/sitemap.xml`** at build time by `buildSitemap(siteUrl, lastmod)` (`scripts/lib/seo.mjs`). The file map's `public/sitemap.xml` is not created. `public/robots.txt` holds `%SITE_URL%`, which the prerender fills.
6. **Shared script helpers:**
   - `scripts/lib/prerender-helpers.mjs` (`injectApp`, `injectHead`, `extractLeadingLinks`, `findTokens`);
   - `scripts/lib/seo.mjs` (`DEFAULT_SITE_URL`, `PAGES`, `normalizeSiteUrl`, `fillSiteUrl`, `buildSitemap`);
   - `scripts/lib/head.mjs` (`parseHead`, `parseAttrs`, `decodeEntities`).

   The last two ship with `.d.mts` declarations so TypeScript files can import them.
7. **`vite/site-url.ts`** exports `siteUrl(raw?)`, registered **first** in `vite.config.ts` `plugins`. It replaces `%SITE_URL%` in both HTML entries (`order: 'pre'`).
8. **Second truth check.** `scripts/prerender.mjs` fails a `BUILD_TARGET=production` build if the final rendered HTML contains `[[` (on top of A2's `vite/truth-gate.ts`). In staging it prints the token count.
9. **Vitest include.** If `vitest.config.ts` restricts `include`, it must also cover `scripts/**/*.test.mjs`, `qa/**/*.test.mjs` and `vite/**/*.test.ts`. Script and QA tests declare `// @vitest-environment node`.
10. **`.gitignore`** adds `dist-ssr/` (the prerender's temporary SSR build, deleted after each run; kept with `KEEP_SSR=1`).
11. **`scripts/build-assets.mjs`** reads originals from `process.env.PHOTOS_DIR ?? '/Users/montheribrahim/Downloads'` (E.6 Step 2).
12. **`chrome-launcher`** is imported by `qa/lighthouse.mjs` as Lighthouse's own dependency. If it doesn't resolve, add `"chrome-launcher": "^1"` to C1's devDependencies (E.4 Step 3).
13. **New deploy and QA files:**
   - `vercel.json` (framework vite, output `dist`, `trailingSlash: true`, `immutable` for `/assets/*` and `/img/*`, `no-cache` for `/` and `/en/`);
   - `qa/smoke-prerender.mjs`, `qa/bundle-budget.mjs`, `qa/find-overflow.mjs`, `qa/lib/{checks,report,budgets}.mjs`;
   - `docs/qa-report.md`, `docs/qa/*`, `docs/exports/*.pdf`.

   No new npm scripts: C1 is unchanged. The extra scripts run with `node`.
14. **QA environment variables:** `SITE_URL` (must match the build), `QA_TARGET=staging|production`, `QA_BASE`, `CHROME_PATH`, `LH_RUNS`, `SITEMAP_LASTMOD`, `KEEP_SSR`.
15. **Test ids relied on beyond the C9 table:**
   - `request-form [name="crane"]` is a `<select>` (or input) whose value is the crane id, or whose selected text contains the model;
   - `form-weight` and `form-phone` are the `<input>` elements themselves;
   - `[data-sites-strip]` contains its `site-photo` buttons, each with an `<img>` from `<Picture>`;
   - `lang-switch` may appear in both the header and the menu; QA uses the first visible one.


---

## Appendix: spec → task coverage

| Spec section | Tasks |
|---|---|
| §1 Goal / success criteria | E.4 (Lighthouse + budgets), E.8 (final verification) |
| §3 Facts, cranes, numbers, photos | B.3 (cranes/sites/site info), B.4–B.5 (numbers, digits), A2.3 (crops) |
| §4.1–4.2 Stack, layout | A1.1–A1.2, C.1 |
| §4.3 Truth gate | A2.1–A2.2, E.8 (production build must fail until verified) |
| §4.4 Environment | A1.2–A1.3 |
| §4.5 Image and font pipelines | A1.5–A1.6, A2.3–A2.5 |
| §4.6 Form + analytics | B.6–B.8, C.10, C.11 |
| §5 Page design (9 sections + bar) | C.2–C.11; motion D.1–D.8 (D.9 optional) |
| §6 Visual system | A1.4, C.2 |
| §7 Motion system | D.1–D.8, D.10 |
| §8 Accessibility | C.2–C.11 (markup), E.3 (axe + controls), D.10 (reduced motion) |
| §9 Performance budget | A2.3 (image sizes), A1.6 (preloads), E.1 (prerender), E.4–E.5 |
| §10 SEO | E.2 |
| §11 Testing and acceptance | unit tests throughout, E.3, E.4, E.8, Gates I1/I2 |
| §12 Handover | E.6 (README, DESIGN.md, content checklist), E.7 (PDF exports) |
| §13 Open items from Atlas | E.6 (checklist), E.8 (go-live steps) |
| §15 Impeccable amendments | A1.4, C.2–C.11, D (scope), Gates I1, I2, E.3/E.8 (detector) |
