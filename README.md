# Atlas Alshraa website (v2)

The website of **شركة أطلس الصحراء المساهمة للخدمات النفطية والنقل الثقيل والمناولة وتأجير الرافعات** ("Atlas Alshraa"): crane hire, heavy transport, handling and oil services in Libya.

- One home page in two languages: **Arabic (right to left) at `/`**, **English at `/en/`**. Arabic is the default.
- A page per crane: **`/cranes/<id>/`** (Arabic) and **`/en/cranes/<id>/`** (English) for the five cranes on the site (`rt700e`, `atf60-3`, `ac200-1`, `quy250`, `gmk6350`; never the hidden Kobelco). See "Crane pages".
- A visitor can ask for a crane in one tap: WhatsApp, a call, or a short request form with the chosen crane already filled in.
- The output is **plain static files** (`dist/`). There is no server and no database.

Who this is for: the next developer, and Atlas's IT person who has to put it online. If you only need to know what Atlas must still answer before launch, read [`docs/atlas-content-checklist.md`](docs/atlas-content-checklist.md).

Other documents: [`PRODUCT.md`](PRODUCT.md) (who it is for and why), [`DESIGN.md`](DESIGN.md) (design system), [`docs/superpowers/specs/2026-11-05-atlas-v2-design.md`](docs/superpowers/specs/2026-11-05-atlas-v2-design.md) (full v2 design and motion spec), [`docs/superpowers/specs/2026-11-04-atlas-website-design.md`](docs/superpowers/specs/2026-11-04-atlas-website-design.md) (product truth, truth gate, SEO, analytics), [`docs/03-copy-deck.md`](docs/03-copy-deck.md) (all text, Arabic and English), [`docs/research/crane-specs.md`](docs/research/crane-specs.md) (where each crane figure comes from).

## Stack

Vite 8, React 19, TypeScript, Tailwind CSS 4. Motion: GSAP (with ScrollTrigger, SplitText, DrawSVG, Flip) and Lenis. Prerendered per language at build time, then hydrated in the browser. A raw-WebGL depth layer on the hero (desktop only). Tests: Vitest. QA: puppeteer-core + Lighthouse + axe-core.

**Requirements:** Node.js 22.12 or newer (developed on 24) and npm. Google Chrome for the QA scripts (set `CHROME_PATH` if it is not at the macOS default `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`).

## Commands

```bash
npm ci                     # install exactly what package-lock.json says
npm run dev                # dev server (http://localhost:5173), Arabic at /, English at /en/
npm run build              # tsc --noEmit, vite build, then the prerender. Output: dist/
npm run build:production   # the same with BUILD_TARGET=production (runs the truth gate for real)
npm run preview            # serves dist/ at http://localhost:4173
npm test                   # Vitest (63 files, 650 tests at the time of writing)
npm run typecheck          # tsc --noEmit
npm run assets             # rebuilds every photo from the originals (see "Photos")
npm run fonts              # rebuilds the font subsets (see "Fonts")
```

QA scripts. Start the built site first (`npm run build && npm run preview`), then in a second terminal:

```bash
node qa/smoke-prerender.mjs     # the prerendered HTML: SEO head, both languages, hydration (26 checks)
node qa/loader.mjs              # the first-visit loader
node qa/bundle-budget.mjs       # JS/CSS/first-load budgets (below)
npm run lighthouse              # Lighthouse, mobile and desktop, both pages, median of 3 runs; also runs the bundle budget
                                # LH_RUNS=1 for a quick run. Reports go to qa/reports/ (git-ignored). Exits 1 if a budget fails.
npm run qa                      # functional QA: both pages × 7 widths × desktop/touch/reduced motion + no-JS, every control,
                                # axe (WCAG 2.2 A/AA), keyboard walk, SEO head, truth gate, the vercel.json CSP (about 25 min).
                                # QA_ONLY=matrix,controls,keyboard,nojs,seo,truth,csp runs a part. Writes qa/reports/summary.md.
```

For the full `npm run qa`, build with every optional channel set to test values, so the WhatsApp, call, analytics and form paths are all exercised (the runner answers the form endpoint itself, 500 then 200):

```bash
SITE_URL=http://localhost:4173 VITE_WHATSAPP=218910000000 VITE_PHONE=+218910000000 \
  VITE_FORM_ENDPOINT=http://localhost:4173/__qa/form VITE_GA4_ID=G-QA00000000 npm run build
npm run preview &
QA_FORM_ENDPOINT=http://localhost:4173/__qa/form npm run qa
```

A plain staging build (none of those set) also works: the form is then checked for its WhatsApp / email hand-off.

All QA scripts take a base URL (argument or `QA_BASE`; default `http://localhost:4173`).

> `npm run qa` (preview running) drives every control on both pages across 7 widths and 3 motion modes, plus no-JS and a keyboard walk.
>
> `npm run pdf` (preview running) writes the screen exports to `docs/exports/atlas-{ar,en}-{desktop,mobile}.pdf` (one tall page each, drawn from browser captures, so the text is not selectable) with a first-screen PNG beside each.

## Environment variables

Set them in the shell, in a git-ignored `.env.local` / `.env.production`, or in the host's dashboard. Only these names are read (`vite.config.ts`, `src/env.ts`, `scripts/prerender.mjs`).

| Variable | What it does | When unset |
|---|---|---|
| `BUILD_TARGET` | `staging` or `production`. Production turns the **truth gate** on and hides the draft tags. | `staging` (also for any other value, with a warning). |
| `SITE_URL` (or `VITE_SITE_URL`) | Public address, e.g. `https://atlasalsahra.ly`, no trailing path. Used for canonical and `hreflang` links, Open Graph, the structured data, `sitemap.xml` and `robots.txt`. | On Vercel: `https://` + the project's production domain (Vercel's system variable `VERCEL_PROJECT_PRODUCTION_URL`, e.g. `https://atlas-websitely.vercel.app`). Elsewhere: `http://localhost:4173`, which is wrong for any real deployment. **Production build fails** without a public `https` URL. Set it once Atlas's own domain is live. |
| `VITE_WHATSAPP` | Atlas's WhatsApp number, **digits only with country code** (e.g. `2189XXXXXXXX`). Drives every WhatsApp button, the 404 page's contact button and the pre-filled messages (`https://wa.me/<number>?text=...`). | `218926367570`: the number Atlas confirmed on 11 Nov 2026 (`vite.config.ts`, `syncEnv`). Set the variable only to use a different number. |
| `VITE_PHONE` | Phone for the Call button, with `+` (e.g. `+2189XXXXXXXX`; spaces are fine). | `+218 92 636 7570`, the same confirmed number. |
| `VITE_FORM_ENDPOINT` | URL the request form POSTs JSON to (a form service or Atlas's own endpoint). Must answer 2xx. | No backend: the form validates, then opens WhatsApp (or an email in staging) with the request written out. This is a supported setup. If you set it, **add its origin to `connect-src` in `vercel.json`** or the browser will block the POST. |
| `VITE_GA4_ID` | Google Analytics 4 measurement ID (`G-XXXXXXXXXX`). | No analytics script loads and no event is sent. |

`SITE_URL`, `VITE_SITE_URL`, `VITE_WHATSAPP`, `VITE_PHONE` and `BUILD_TARGET` are also read by the build config and the truth gate. Variables are read **at build time** (they are baked into the static files), so changing one means rebuilding.

Example `.env.production` (never commit real values you do not want public; these are public anyway once shipped):

```
BUILD_TARGET=production
SITE_URL=https://example.ly
VITE_WHATSAPP=2189XXXXXXXX
VITE_PHONE=+2189XXXXXXXX
VITE_FORM_ENDPOINT=https://forms.example.com/atlas
VITE_GA4_ID=G-XXXXXXXXXX
```

## Staging, production and the truth gate

The site must never publish an unconfirmed fact. Two build targets enforce that:

- **Staging** (default): unverified values are shown with a red/white **"DRAFT · unverified"** tag, and unresolved `[[CONFIRM: ...]]` markers show in the text. The build prints a warning with the count. Use this to review with Atlas.
- **Production** (`BUILD_TARGET=production`): the build **fails and lists every problem** while any of these remain (`vite/truth-gate.ts`, rules in `src/lib/truth.ts`):
  1. a crane that is shown but has `verified: false` in `src/content/cranes.ts`;
  2. any `[[...]]` token left in `ar.ts`, `en.ts` (and, at prerender, in `why.ts` text);
  3. `SITE_URL` missing or not a public `https` address;
  4. `VITE_WHATSAPP` or `VITE_PHONE` missing (they default to Atlas's confirmed number, so only an override can empty them).

Try it any time: `npm run build:production`. The error is the to-do list.

**To clear each item** (the questions for Atlas are in [`docs/atlas-content-checklist.md`](docs/atlas-content-checklist.md)):

| Problem | Fix |
|---|---|
| `crane X: shown but not verified` | Atlas confirms ownership and rating. Set `verified: true` (and correct `capacityT` / `maxCapacityT` if it differs). |
| `[[CONFIRM: sentence]]` | If Atlas confirms: delete the `[[CONFIRM: ` and the closing `]]`, keep the sentence. If not: delete the whole clause. For a bare `[[CONFIRM]]` (the privacy line) just delete the token once the wording is approved. Do it in both `ar.ts` and `en.ts`, and in `why.ts`. |
| `services.items[].confirm` | A whole sentence that renders only when non-null. Confirmed: put the sentence there without `[[ ]]`. Not confirmed: set it to `null`. |
| `SITE_URL`, `VITE_WHATSAPP`, `VITE_PHONE` | Set the variables. |

**Staging is indexable on purpose** (robots allows it, no `noindex`) so Lighthouse SEO can be measured. **A public staging URL must therefore be password-protected** (on Vercel: Project Settings, Deployment Protection) or search engines may index a draft full of unconfirmed claims. Do not point the real domain at a staging build.

## Where things live

```
index.html, en/index.html     the two page shells (head, loader script); %SITE_URL% is filled at build
src/content/                  all text and data (below)
src/sections/                 one file per page section (Hero, About, Hoist, CraneGrid, Services, WhyAtlas, Sites, Documents, RequestForm, Footer ...)
src/components/ui/            the design-system primitives (see DESIGN.md)
src/motion/                   the motion layer (below)
src/lib/                      truth gate rules, WhatsApp links, analytics, request state, digits
src/generated/images.ts       the photo manifest written by `npm run assets`. Do not edit by hand.
src/assets/fonts/, src/fonts.css   the font subsets and their @font-face rules
vite/                         build plugins (truth gate, font preload, inline-script minify, site URL)
scripts/                      build-assets, subset-fonts, mark-hooks, prerender
qa/                           QA scripts and the performance budgets (qa/lib/budgets.mjs)
public/img/                   built photos (AVIF + WebP, hashed names). Generated; committed.
assets-src/                   crops.json (photo crops) and hook-points.json (where the hook sits in a photo)
```

## Editing content

### Text

All text is in **`src/content/ar.ts`** and **`src/content/en.ts`**. Both must satisfy the `Copy` type in `src/content/types.ts`, so a line missing in one language fails `tsc`. Some copy lives beside them so it stays out of the first JavaScript download:

- `src/content/why.ts`: the Why Atlas section (prerender-only);
- `src/content/crane-list-copy.ts`: the load check, detail sheet and comparison;
- `src/content/crane-spec-notes.ts`: maintainer notes on each figure, never rendered.

The approved wording is in [`docs/03-copy-deck.md`](docs/03-copy-deck.md). Change the deck and the code together. Copy rules are tested (`copy.test.ts`, `crane-list-copy.test.ts`): Arabic is composed first, Western digits are used, units follow a no-break space, Latin codes sit in `<bdi lang="en">`. Run `npm test` after any text edit; the font-coverage test (below) will also tell you if a new character is not in the fonts.

### Contact details and documents (`src/content/site.ts`)

```ts
export const siteInfo: SiteInfo = {
  email: 'atlasalsahralibya@gmail.com',
  facebook: 'https://www.facebook.com/share/19qKUy2hxg/',
  address: null,        // or { ar: '...', en: '...' } : appears in the footer and contact panel
  documents: [],        // empty = the Documents section is not on the page at all
};
```

Phone and WhatsApp come from the environment, not from this file (with Atlas's confirmed number as the default; see "Environment variables").

**To publish documents:** put the PDFs in `public/docs/` (create it) and add one entry each. The section appears (Arabic and English) as soon as the array has one entry; nothing else to change.

```ts
documents: [
  { id: 'profile', href: '/docs/atlas-company-profile-ar.pdf', lang: 'ar', date: '2026-11-20' },
  { id: 'hse',     href: '/docs/atlas-hse-en.pdf',            lang: 'both', date: '2026-10-01' },
],
```

`id` must be one of `profile`, `fleet-list`, `inspection`, `hse`, `iso`, `insurance`, `cr` (the names shown come from `documents.names` in `ar.ts` / `en.ts`). `lang` is `ar`, `en` or `both`; `date` is `YYYY-MM-DD`. Each card has a Download link and an "email us for this document" link. Only list files that exist and that Atlas approved to publish. Add a `/docs/` cache header to `vercel.json` if the files change often.

### Adding or changing a crane

Cranes are in **`src/content/cranes.ts`**; manufacturer details in **`src/content/crane-specs.ts`**.

1. **Photos.** Add the photo to `assets-src/crops.json` (the crops are `desktop_16x9`, `mobile_4x5` and `mobile_9x16`; every crop must exclude the burned-in watermark). Run `PHOTOS_DIR=/path/to/originals npm run assets` (see "Photos"). This regenerates `public/img/*` and `src/generated/images.ts`; the new id becomes a valid `PhotoId`.
2. **Hook point (only for photos that carry the hero or showcase hook).** `assets-src/hook-points.json` maps a photo id to the pixel `{x, y}` of the hook in the *original* image (today `6398`, `6359`, `6389`). `node scripts/mark-hooks.mjs` writes crosshair previews to `.work/hooks/` so you can check the point by eye.
3. **The crane.** Add an entry to `cranes.ts`: `id`, `make`, `model` (as printed on the machine), `type` (`rough-terrain`, `all-terrain`, `crawler`), `capacityT` in **metric tonnes**, `hoistPhoto` (the photo used in the showcase), `cardPhoto`, `verified: false`, `hidden: false`. Extend `CraneId` in `src/content/types.ts`. Order matters: the list runs smallest to largest.
4. **Specifications.** Add the entry to `crane-specs.ts` and `CraneSpecId`. Rules: every figure comes from the manufacturer's document or page (`official: true`) or is clearly marked from a secondary source (`official: false`); each field you fill has a `sources` entry with the URL; fields that cannot be sourced are **left out, never estimated**; imperial figures are converted and the conversion is noted in `crane-spec-notes.ts`. Add copy notes (for example the GMK6350 "350 is US tons" note under `hoist.ratingNotes`) in `ar.ts` / `en.ts`. Full provenance lives in `docs/research/crane-specs.md`.
5. **Verification.** `verified: false` shows the DRAFT tag in staging and **blocks production**. Set it `true` only after Atlas confirms ownership and capacity.
6. **Hide a crane** (for example one carrying another company's logo) with `hidden: true`; it is never rendered and does not trip the gate.
7. Run `npm test` (the crane, spec and copy tests cross-check each other) and `npm run build`.

## Photos

`npm run assets` reads Atlas's original JPEGs (`IMG_63*.JPG`, never modified) from **`PHOTOS_DIR`**, default the folder that contains this repository, applies `assets-src/crops.json`, and writes AVIF and WebP in several widths to `public/img/` (the folder is wiped first), `public/og-ar.jpg`, `public/og-en.jpg` and `src/generated/images.ts`. The three Kobelco photos (6367, 6370, 6371) are skipped on purpose. `sharp` is pinned to an exact version so output stays reproducible.

```bash
PHOTOS_DIR="/path/to/the/originals" npm run assets
```

Placeholders (tiny blurred previews) are only used in the prerender; never import them in client-only code.

## Fonts

Self-hosted, subset, never inlined into CSS: **Tajawal** (Arabic: 400, 500, 700, 800), **Poppins** (Latin and all numerals: 400, 500, 600, 700), **IBM Plex Mono** (500, only for model codes like GMK6350), plus two tiny "fill" faces (IBM Plex Sans Arabic for a few Arabic symbols Tajawal lacks; arrows for Poppins) that load only when one of their characters is on screen. Total about 61 KB.

- `npm run fonts` subsets the `@fontsource/*` packages into `src/assets/fonts/`. The character sets are at the top of `scripts/subset-fonts.mjs` and **must match the `unicode-range` lists in `src/fonts.css`**; the script fails if a family does not cover its set.
- `src/font-coverage.test.tsx` renders both pages, the component kitchen, the copy and the crane specs, and fails if any character falls outside the subsets (it has caught a wrong space character before). **If you add text with a new symbol, this test fails first: add the character to the set, run `npm run fonts`, commit the new files.**
- `vite/font-preload.ts` adds the preload links for the fonts each page needs first (Arabic: Tajawal 800/700/400; English: Poppins 700/600/400).

## Motion

Read [`docs/superpowers/specs/2026-11-05-atlas-v2-design.md`](docs/superpowers/specs/2026-11-05-atlas-v2-design.md) section 9 for the full rules. The architecture in short:

- **Three modes** (`src/motion/mode.ts`, one `gsap.matchMedia` each): `desktop` (width at least 64rem, fine pointer, motion allowed), `touch` (everything else with motion allowed), `reduced` (`prefers-reduced-motion: reduce`). Reduced motion gets the final state of everything and **never downloads GSAP or Lenis**. Without JavaScript the full content is visible.
- **The core chunk.** The main bundle contains only React and the page. `src/motion/index.ts` starts the motion layer after hydration with a dynamic `import('./core')`; GSAP, Lenis, ScrollTrigger and every timeline live in that lazy chunk. Do not import `gsap` from anywhere that ends up in the main bundle (the bundle budget will catch it).
- **Reveals and motion find their targets by data attributes** (`data-reveal`, `data-ticker`, `data-parallax`, `data-magnetic`), not by React state.
- **Static islands.** Services and Why Atlas hold no React state; on the client they keep the prerendered HTML (`src/sections/island.tsx`), which keeps their code out of the main JavaScript.
- **First-visit loader contract.** A small inline script in each page's `<head>` sets `js` and `motion-ok` on `<html>` and, only on the first visit of a tab session (not on a deep link, a hidden tab or with reduced motion), sets `data-loader`, which makes the CSS curtain `#al` cover the page. The curtain lifts when the fonts and the hero photo have arrived (held at most 0.95 s, never past 1.8 s after navigation, gone by 2.5 s; any key, press, wheel or touch lifts it at once; dropped unseen on a slow first frame). The moment it lifts, `data-loader` is removed and `atlas:loader-done` fires on `window`. Motion that would play unseen under the curtain waits for that event (`afterLoader` in `src/motion/loader.ts`, with a 2.6 s safety timer). If you add an intro animation, wrap it in `afterLoader`. This script is the one inline script on the page: see "Security headers".
- **WebGL depth layer** (`src/motion/hero-gl.ts`, raw WebGL, no library, about 2 KB gzip): desktop with a fine pointer and motion allowed only, loaded on idle after the intro as its own chunk. It sits on top of the hero photo (the `<img>` is always underneath and is never the thing being measured), is `aria-hidden`, fades in after its first frame, and removes itself if the first frame takes more than 200 ms or the context is lost. Touch and reduced motion never load it.

## Crane pages

`/cranes/<id>/` and `/en/cranes/<id>/`: one page per visible crane, Apple-product-page style, built from the same data as the home page's lineup. Hero (make and model, the capacity as the big number with its radius and rating label, the lead photo, three ways to ask), key figures set against the other four models, a photo story of all its photos, the full manufacturer specification (grouped, units, notes, sources; missing rows are left out), the honest load question, and the other four cranes.

- **Templates and prerender.** `cranes/index.html` and `en/cranes/index.html` are build inputs (`vite.config.ts`). `scripts/prerender.mjs` renders each crane with `renderCrane()` / `headCrane()` from `src/entry-server.tsx`, writes `dist[/en]/cranes/<id>/index.html`, then deletes the two templates. The dev server serves `/cranes/<id>/` from the template (`vite/crane-pages-dev.ts`).
- **Static island.** The page body (`src/crane-page/CraneBody.tsx`) is rendered only at build time (and by the dev server and tests, through `src/crane-page/register.ts`). In the browser it stays the prerendered HTML (`CraneIsland.tsx`), so the page ships only React, the header, footer and request bar (about 87 KB gz; home 105 KB). The photo story, click tracking and the view-transition name work on that HTML from `src/crane-page/CraneApp.tsx`; motion (`src/motion/crane.ts`: tickers, meters, reveals, Lenis on desktop) loads on idle. The hero's entrance is CSS.
- **Head.** `src/crane-page/head.ts`: title, description, canonical, hreflang (ar, en, x-default = Arabic), Open Graph and Twitter with the crane's own photo (`public/og/cranes/<id>.jpg`, made by `npm run og:cranes` from the processed card photo; rerun it after `npm run assets`), one preload for the hero photo (from 768 px), and a `BreadcrumbList`. No `Product` or `Offer` schema: there is no price, and no rating is invented. `sitemap.xml` lists all twelve pages with their hreflang pairs.
- **Fonts.** Three preloads per crane page, chosen for its first screen (`vite/font-preload.ts`): Plex Mono 500 (the model code), Poppins 700 (the number) and Tajawal 400 / Poppins 400.
- **No first-visit intro** on a crane page: it is a deep link like a `#section` link (the visitor came for that crane, and the curtain would hold back its first paint). It does not use up the intro either, so a later visit to the home page still gets it once.
- **Phones** open on the name, the number and the actions; the photo starts at the fold. That keeps the largest paint text (Lighthouse mobile LCP about 0.9 s).
- **Links from the home page.** Each lineup card's model name links to its page (prerendered, so crawlers find all ten), and the quick view (Details) has "Open the full page". On a crane page the header and footer section links go to `/#section` (or `/en/#section`), the logo to the home page, and the language switch to the same crane in the other language.
- **Deep links into the home page** (`src/lib/deep-link.ts`): `/?crane=<id>#request` puts the crane on the hook (request bar and the form's crane field); `/?compare=<id>#crane-compare` opens the comparison with it picked. The query is removed from the address bar once read.
- **View transition.** Where cross-document view transitions run (Chrome/Edge 126+, Safari 18.2+), the clicked card's photo grows into the crane page's hero (`src/lib/view-transition.ts`). The opt-in is an inline `<style>` in each template's head: from the bundled stylesheet Chrome often read it too late and aborted with a console error. Reduced motion: an instant swap.
- **Truth.** The same gate: the page copy (`src/content/crane-page-copy.ts`) is checked with `ar.ts` / `en.ts`, the prerender's token scan covers all twelve pages, and the capacities carry the DRAFT tag until Atlas confirms them. `/cranes` and `/en/cranes` redirect to the lineup (`vercel.json`).

## Performance budgets

Checked by `node qa/bundle-budget.mjs` and `npm run lighthouse` (limits in `qa/lib/budgets.mjs`; they exit non-zero on failure):

| Budget | Limit |
|---|---|
| Initial JavaScript (gzip) | at most 110 KB |
| CSS (gzip) | at most 25 KB |
| First load, Arabic page on a phone | at most 1000 KB |
| Hero image, mobile / desktop | at most 80 KB / 120 KB |
| Lighthouse (performance, accessibility, best practices, SEO) | at least 90 each |
| LCP / CLS / TBT | at most 2000 ms / 0.05 / 150 ms |

Never loosen a limit to make a failing run pass; fix the cause or write the failure down.

## Analytics

GA4 loads only if `VITE_GA4_ID` is set, after the page has loaded and the browser is idle. Events: `whatsapp_click`, `call_click`, `request_crane`, `form_submit`, `filter_use`, `lang_switch` (`src/lib/analytics.ts`).

**There is no consent banner and no consent gate.** If an ID is set, GA4 starts for every visitor, sets its cookies, and sends data to Google without asking. Whether that is acceptable for Atlas's audience and for any partner or tender requirement is Atlas's decision, not something the code decides. If a consent step is needed: leave `VITE_GA4_ID` unset until one exists, then add a banner that calls `loadAnalytics()` only after the visitor agrees, and consider GA4 Consent Mode (`gtag('consent', 'default', { analytics_storage: 'denied' })` before `config`). The privacy line on the form ("We use your details only to reply to your request") is about form data, not analytics.

## Deploying

The build output is `dist/`: `index.html` (Arabic), `en/index.html`, `cranes/<id>/index.html` and `en/cranes/<id>/index.html` (the ten crane pages), `404.html` (the not-found page: static, bilingual, noindex; Vercel serves it with status 404 for any unknown path, so add no catch-all redirect or rewrite), `og/cranes/<id>.jpg`, `assets/` (hashed JS, CSS, fonts), `img/` (hashed photos), `brand/`, `og-*.jpg`, `sitemap.xml`, `robots.txt`. **Any static host works** (Vercel, Netlify, Cloudflare Pages, nginx, S3 + CDN). Requirements for a host: serve `/en/` from `en/index.html`; send long immutable caching for `/assets/*` and `/img/*` (their names contain a content hash) and revalidation for the HTML; add the security headers below.

### Vercel (config included)

`vercel.json` already sets: build `npm run build`, output `dist`, clean URLs with trailing slash (`/en/`), cache headers and security headers.

1. Import the repository in Vercel. Framework preset: Other (the file already says so).
2. Project Settings > Environment Variables: set `SITE_URL` (once the real domain exists; until then the build uses the project's `*.vercel.app` production domain), `VITE_FORM_ENDPOINT`, `VITE_GA4_ID` (`VITE_WHATSAPP` and `VITE_PHONE` only to replace Atlas's number). **For the Production environment also set `BUILD_TARGET=production`.** Leave `BUILD_TARGET` unset (or `staging`) for Preview. Keep "Automatically expose System Environment Variables" on (the default) so the build can read `VERCEL_PROJECT_PRODUCTION_URL`.
3. Project Settings > Deployment Protection: password-protect **Preview** deployments (they are indexable drafts).
4. Add the real domain to the Production environment only.
5. Before pointing the domain, run `npm run build:production` locally or read the Production build log: it must pass the truth gate.

### Other hosts

Reproduce `vercel.json` in the host's own format: same headers, same caching, `/en` redirecting to `/en/`.

### Security headers and the Content-Security-Policy

`vercel.json` sends `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation, payment, usb off) and `X-Frame-Options: DENY`.

The CSP is strict about scripts: `script-src 'self' 'sha256-...' https://www.googletagmanager.com`. Every page has **one** classic inline script (the loader/mode/theme script in `<head>`: it also applies a saved dark theme before first paint), and it is **identical in all four HTML templates** (`index.html`, `en/index.html`, `cranes/index.html`, `en/cranes/index.html`, `404.html`), so one hash covers all thirteen pages (the twelve above and `404.html`, which has the same script). (A crane page's `<html data-no-intro>` is what keeps the first-visit intro off there; the script itself is the same.) `'unsafe-inline'` is **not** allowed for scripts. The hash is of the *minified* script in the built HTML, so **whenever the inline script in `index.html` / `en/index.html` changes (or the minifier is upgraded), regenerate the hash or the loader, the `js` / `motion-ok` classes and the saved dark theme will silently stop working** (the page then shows its no-JavaScript state, and a visitor who chose dark gets the light page). Regenerate:

```bash
npm run build
node -e '
const fs=require("fs"),c=require("crypto");
for (const f of ["dist/index.html","dist/en/index.html"]) {
  const html=fs.readFileSync(f,"utf8");
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))   // attribute-less inline scripts only
    console.log(f,"sha256-"+c.createHash("sha256").update(m[1]).digest("base64"));
}'
```

Both files must print the same value (and so must any `dist/cranes/<id>/index.html`); put it in the `script-src` of `vercel.json`. (The JSON-LD `<script type="application/ld+json">` is data, not executed, and needs no hash. The module scripts load from `'self'`.)

Other directives and why: `style-src 'self' 'unsafe-inline'` (React writes inline `style` attributes and the page has one inline `<style>`; styles are not a script-execution risk the way scripts are); `img-src 'self' data:` (tiny blurred placeholders are data URIs) plus the Google Analytics hosts; `font-src 'self'`; `connect-src 'self'` plus the GA4 hosts. **If you set `VITE_FORM_ENDPOINT`, add that endpoint's origin to `connect-src`**, or the form's POST is blocked. If you leave GA4 unused you can remove the three Google hosts. `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'none'` are fixed.

The CSP in `vercel.json` was checked by loading both built pages in headless Chrome under that exact header: no violations, the inline script ran (`js motion-ok` set), motion and the WebGL canvas started.

## Before launch

1. Everything in [`docs/atlas-content-checklist.md`](docs/atlas-content-checklist.md) answered and applied.
2. `npm test` and `npm run typecheck` pass.
3. `npm run build:production` passes (the truth gate is clean).
4. `npm run preview`, then `node qa/smoke-prerender.mjs`, `node qa/bundle-budget.mjs`, `npm run lighthouse`: all within budget.
5. A real-device check: Arabic on a phone (iOS Safari and Android Chrome), English on desktop, tap WhatsApp and Call, send a test request through the form.
6. If the CSP inline-script hash is stale, fix it (see above).
7. Staging is password-protected; only the Production environment has the real domain.
