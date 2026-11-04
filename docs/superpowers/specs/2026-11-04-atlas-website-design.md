# Atlas Alshraa website: Design Spec

- **Date:** 4 November 2026
- **Status:** design approved in four parts by the agency (user). Awaiting spec review.
- **Client:** شركة أطلس الصحراء المساهمة للخدمات النفطية والنقل الثقيل والمناولة وتأجير الرافعات, "Atlas Alshraa" (Libya)
- **Commercial frame:** proposal PRP-ATL-2611-001. One-page bilingual site, 10 working days, 4,000 LYD.

Supporting documents (all in `docs/`). This spec wins wherever they disagree.
`01-brand-and-asset-audit.md` · `03-copy-deck.md` · `04-asset-plan.md` + `asset-crops.json` · `05-typography.md` · `06-direction-options.md` · `research/*`

---

## 1. Goal

A visitor (a contractor, an oil & gas buyer or a project manager, mostly on a phone) should understand within 3 seconds that **Atlas hires cranes from small to very large, plus heavy transport, handling and oil services**. They should be able to ask for the right crane in one tap.

The site proves Atlas's own line, «من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة» ("From smaller cranes to the largest ones, every project has the right crane"), through the **"On the Hook"** concept. The crane hook is the thread through the page: from the real hook in the hero photo, through the fleet, to the request.

**Success criteria:**
- Lighthouse ≥ 90 in all four categories on mobile and desktop for both pages.
- First load ≤ 1 MB.
- Zero axe violations at serious or critical level.
- No unverified fact can reach the live site.

## 2. Scope

**In:**
- Arabic page at `/` (default, RTL) and English page at `/en/`.
- 9 sections plus a sticky request bar.
- Request form with WhatsApp fallback.
- SEO basics, GA4 events, image and font pipelines, QA scripts, README, DESIGN.md and an Atlas content checklist.

**Out:**
- CMS, product detail pages, shop, logins.
- Logo redesign.
- Photography.
- 3D / WebGL, sound.

**Changed deliverable:** the proposal's "approved design files (Figma)" will be delivered as **PDF screen exports** (desktop + mobile, AR + EN). The agency to tell Atlas.

## 3. Settled facts and rules

- **Positioning:** crane hire · heavy transport · handling (lifting & rigging) · oil services. Never "equipment trading".
- **Confirmed contact:** atlasalsahralibya@gmail.com and the Facebook page. Everything else is a token until Atlas supplies it.
- **Cranes** (models visible in Atlas's photos; capacities from manufacturer ratings, *unverified for Atlas*):

| id | Make / model | Type | Max capacity used | Basis | Hoist photo | Card photo |
|---|---|---|---|---|---|---|
| `rt700e` | Grove RT700E | Rough-terrain | **55 t** | 60 US tons (Bigge, Cranepedia) | IMG_6364 | IMG_6363 |
| `atf60-3` | Tadano Faun ATF 60-3 | All-terrain | **60 t** | Model rating; "ATF 60-3" on the cab, IMG_6396 | IMG_6395 | IMG_6397 |
| `ac200-1` | Terex AC200-1 | All-terrain | **200 t** | "200T capacity class" printed on the machine | IMG_6375 | IMG_6376 |
| `quy250` | Fuwa (FW.China) QUY250 | Crawler | **250 t** | Model rating (some listings say 260 t for QUY250-1) | IMG_6385 | IMG_6380 |
| `gmk6350` | Grove GMK6350 | All-terrain | **350 t** | "350 TON" printed on the boom | IMG_6389 | IMG_6392 |
| `cke2500` | Kobelco CKE2500 | Crawler | — | **Hidden**: carries another company's logo | — | — |

- **Hoist order:** 55 → 60 → 200 → 250 → 350 t. Wording on the site is "Cranes" / «الرافعات», not "Our fleet", until ownership is confirmed.
- **Numbers:**
  - Western digits in both languages, formatted with `Intl.NumberFormat(lang, { numberingSystem: 'latn' })` and a fixed `.` decimal.
  - Ranges in Arabic are written «من 55 إلى 350 طن».
  - Model codes, phone numbers and emails are wrapped in `<bdi>`.
- **Photos:**
  - Only Atlas's own; no stock. Never mirrored.
  - Crops come from `asset-crops.json`, all clear of the burned-in watermark.
  - Clean exports of 6398, 6389, 6374 and 6380 are requested; when they arrive the pipeline re-runs.
- **Copy:** from `03-copy-deck.md`. The dialect line «شنو الرافعة اللي يحتاجها مشروعك؟ … وخلّي الباقي علينا» is used only in the contact section; it is Atlas's own wording.

## 4. Architecture

### 4.1 Stack (versions checked on npm on 4 Nov 2026)

| Purpose | Choice |
|---|---|
| Build and UI | Vite 8.3 · React 19.3 · TypeScript · Tailwind CSS 4.3 (`@tailwindcss/vite`) |
| Motion | GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, Flip) + `@gsap/react` · Lenis 1.3 |
| Fonts | Fontsource packages, subset at build time: Archivo Variable (wght + wdth), Noto Kufi Arabic Variable, IBM Plex Sans Arabic 400/600, IBM Plex Mono 500 |
| Dev and QA only | sharp, subset-font, puppeteer-core + axe-core (installed Chrome), Lighthouse CLI |

No UI kit, no Motion/Framer, no Lottie, no Three.js.

### 4.2 Repository layout
```
atlas-website/
  index.html                  Arabic entry (lang="ar" dir="rtl")
  en/index.html               English entry (lang="en" dir="ltr")
  src/
    main.tsx  App.tsx  styles.css (tokens via @theme)
    content/  types.ts  ar.ts  en.ts  site.ts  cranes.ts  sites.ts
    sections/ Header Hero Hoist Services CraneGrid Sites Documents RequestForm Footer
    components/ Rope Sling Hook LoadTag RequestBar Picture Lightbox DraftBadge Button Icons
    lib/ motion.ts  numbers.ts  digits.ts  whatsapp.ts  request.ts  analytics.ts  lang.ts
  scripts/ build-assets.mjs  subset-fonts.mjs  truth-gate.mjs
  assets-src/ crops.json (copied from docs/asset-crops.json) + hook-points.json
  qa/ run-qa.mjs  lighthouse.mjs  reports/
  docs/ (research and specs)
```

**Units and boundaries:**
- **`content/*`:** pure data, no React. `ar.ts` and `en.ts` satisfy the same `Copy` type, so a missing line fails type-checking.
- **`cranes.ts`:** exports `Crane[]` with `{ id, make, model, type, capacityT, hoistPhoto, cardPhoto, hookPoint?, verified }`.
- **`sites.ts`:** two galleries.
  - Site A, construction: 6374, 6376, 6379, 6380, 6382, 6388, 6393.
  - Site B, coast: 6360, 6364, 6396, 6397, 6398.
  - Kobelco photos 6367, 6370 and 6371 are excluded.
- **`lib/request.ts`:** one tiny store (`useSyncExternalStore`) holding the crane "on the hook". It is read by the card, the request bar, the form and the WhatsApp builders.
- **`lib/motion.ts`:** the only place that creates Lenis, registers GSAP plugins and defines the three `gsap.matchMedia` contexts (§7). Sections ask it for timelines and never create their own Lenis.
- **`lib/whatsapp.ts`:** builds `https://wa.me/<number>?text=` URLs from the copy-deck templates.
- **`lib/digits.ts`:** converts ٠–٩ and ۰–۹ (and ٫ ٬) to ASCII on form input.

### 4.3 Truth gate (`scripts/truth-gate.mjs`, part of `npm run build`)
- **`BUILD_TARGET=production`:** **fails** if any of these hold:
  - a shown crane has `verified: false`;
  - the rendered copy contains `[[`;
  - `SITE_URL`, `VITE_WHATSAPP` or `VITE_PHONE` is missing.
- **`BUILD_TARGET=staging`** (default): builds anyway and shows a `DraftBadge` (red–white chevron tag, "DRAFT · unverified") on every unverified value.
  - In staging without `VITE_WHATSAPP`, WhatsApp buttons open `mailto:atlasalsahralibya@gmail.com` with the same message.

### 4.4 Environment
| Variable | Purpose | Default |
|---|---|---|
| `SITE_URL` | Canonical, Open Graph, sitemap, hreflang | `http://localhost:4173` locally; the staging deploy sets its own URL |
| `VITE_WHATSAPP` | Number, international format | none (mailto fallback in staging) |
| `VITE_PHONE` | Click-to-call | none (Call button hidden in staging) |
| `VITE_FORM_ENDPOINT` | JSON POST (Formspree or similar) | none (form opens WhatsApp or mailto with the message) |
| `VITE_GA4_ID` | Analytics | none (analytics off) |

### 4.5 Pipelines
- **Images (`npm run assets`):**
  - Reads `assets-src/crops.json` and the originals in `~/Downloads`, which are never modified.
  - Writes AVIF (q≈50) and WebP (q≈72) at 640 / 1280 / 1920 (+ 2560 for heroes), a 24 px blurred placeholder, and width/height for every file.
  - Also writes the 1200×630 Open Graph image.
  - Measured hero size: 64–77 KB AVIF at 1920.
- **Fonts (`npm run fonts`):**
  - Subsets with HarfBuzz, keeping all layout features and axes, to the Arabic and Latin ranges listed in `05-typography.md`. Total ≈ 143 KB.
  - Generates metric-matched fallback `@font-face` rules (`size-adjust`, `ascent-override`).
  - Each page preloads 3 files: AR preloads Kufi, Plex Arabic 400 and Archivo; EN preloads Archivo, Plex Latin 400 and Plex Latin 600.

### 4.6 Form and analytics
- **Fields:**
  - required: **load weight (t)** and **phone**;
  - optional: radius (m), lift height (m), site location, start date, duration, crane (pre-filled), name, company, message.
- **Validation:** inline errors with `aria-live="polite"` and a summary on submit.
- **Submit:**
  - With an endpoint: POST, then show the success or failure message from the copy deck; on failure, offer WhatsApp.
  - Without an endpoint: open WhatsApp (or mailto in staging) with the request written out.
- **GA4:** loaded after `load` + `requestIdleCallback`. Events:

| Event | Parameters |
|---|---|
| `whatsapp_click` | `location` (hero, bar, card, form, footer) |
| `call_click` | — |
| `request_crane` | `crane_id` |
| `form_submit` | `result` |
| `filter_use` | — |
| `lang_switch` | — |

## 5. Page design ("On the Hook")

Sections in order. The Arabic layout is composed for RTL, not mirrored by default; photos are never flipped.

1. **Header**
   - The badge sits next to the name set in type: «أطلس الصحراء · Atlas Alshraa». The badge is too detailed to read below about 56 px.
   - Nav: four links with labels from copy deck §2 (Services · Cranes · On site · Contact). AR/EN switch.
   - Primary button «اطلب رافعة / Request a crane», which scrolls to the form.
   - Transparent over the hero; solid `navy-950` after it.
   - Mobile: a full-screen menu (native `<dialog>`) with WhatsApp and Call.
2. **Hero**
   - Photo per language: **AR = IMG_6398** (the real hook is on the right) and **EN = IMG_6359** (the hook is on the left). The photo box is 74 svh with a `navy-950` band of 26 svh. Mobile: 60/40, using the 9:16 crops.
   - H1 holds both clauses: a smaller first line «من الرافعات الصغيرة للكبيرات،» and a large second line «لكل مشروع رافعته المناسبة».
   - Below the H1: the services line and a secondary button «تصفّح الرافعات / Browse cranes». This replaces the copy deck's «اطلب عرض سعر / Request a quote» hero button, because the header already carries "Request a crane" and WhatsApp now hangs on the sling.
   - **The sling:** the **WhatsApp button hangs from the real hook** on two SVG sling legs. An overlay `<svg>` shares the crop's viewBox with `preserveAspectRatio="xMidYMin slice"`, matching the image's `object-fit: cover; object-position: 50% 0`. The hook point is stored per crop in `hook-points.json`. If no hook point exists for a crop, the button sits in the band and no sling is drawn.
   - **Motion:**
     - the photo scales 1.05 → 1;
     - the sling draws downward;
     - the H1 rises in masked lines;
     - the button settles with one damped swing;
     - everything is still by 2.0 s.
   - **On scroll:** the button docks into the RequestBar (Flip).
3. **The Hoist** (`#cranes`)
   - A real `<ol>` of the verified cranes, ordered by capacity.
   - **Desktop (pointer: fine, ≥ 1024 px):**
     - The scene pins. A rope draws from the top, and faint load-chart curves sit behind.
     - For each crane: the old load tag hoists out, the photo rises from the ground band (a transform-only shutter), the new tag is set down, and the counter runs from the previous to the new value.
     - On the last crane (GMK6350, IMG_6389) the UI hook settles on the real hook and "350 TON" is readable on the boom.
     - On exit, the rope becomes the 1 px progress line on the reading-start edge.
     - Pin length is about 30 vh in, 55 vh per crane and 30 vh out; `scrub 0.6`, snapping to each crane.
   - **Touch or < 1024 px:** a "load stack". One card per crane; each tag drops on a short rope and counts up once when it enters view.
   - **Reduced motion:** a static stack with final numbers.
   - The Hoist's code is a dynamic import, loaded when the section is 1 viewport away.
4. **Services:** four rows on `navy-950`: Crane hire · Heavy transport · Handling & rigging · Oil services, with copy-deck text and its `[[CONFIRM]]` items resolved.
   - Rows are set down on entry.
   - On hover or focus, a short red sling line joins the row to the progress line.
   - Oil services uses the derrick line drawing taken from the logo.
5. **Crane grid** (concrete ground)
   - Type chips, plus tonnage-band chips that appear once capacities are verified (≤ 60 t · 61–200 t · > 200 t). Flip reflow.
   - Card: photo, **capacity as the biggest element** (Archivo condensed, tabular), model in mono, type, and a **«اطلب هذه الرافعة / Request this crane»** button.
   - **Pressing it:** the model chip flies along the hook path into the RequestBar. The bar then reads «على الخطّاف: GMK6350 ✕ · واتساب». The form's crane field and the WhatsApp text are pre-filled; ✕ clears it.
6. **Two sites:** unnamed captions from the copy deck. Native horizontal scroll-snap strips that flow in the reading direction. Tapping opens a `<dialog>` lightbox with arrows and Esc.
7. **Documents:** **not rendered** until `site.ts` lists real files (profile, inspection certificates, HSE, ISO, insurance, CR). Then a list of PDF rows with language and date.
8. **Request form** (`navy-950`): eyebrow «تواصلوا معانا وخلي الباقي علينا», heading «شنو الرافعة اللي يحتاجها مشروعك؟», fields as §4.6. *Stretch, only if day 8 is on schedule:* a small "your lift" SVG sketch drawn from the weight, radius and height entered.
9. **Footer:**
   - The rope ends at an outrigger pad drawn in red/white chevrons.
   - Badge at 80 px; services; email; phone and address when supplied; Facebook; ©.
   - "Back to top" is a hook icon that runs `lenis.scrollTo(0)` (instant with reduced motion).
- **RequestBar** (all pages, fixed at the bottom):
  - WhatsApp + Call. It shows the crane on the hook once one is chosen. Height 64 px + `env(safe-area-inset-bottom)`.
  - Pages use `scroll-padding-bottom` so the bar never hides a focused field.
  - Desktop: compact and inline-end aligned.

## 6. Visual system

**Colour:**

| Token | Value | Use |
|---|---|---|
| `navy-950` | #0D0C2B | Cinematic grounds |
| `navy` | #23207A | Brand on light: links, headings, borders |
| `red` | #C9221C | Rope, hook, sling, primary buttons only |
| `red-bright` | #FF5A4F | Red text or lines on dark (6.2 : 1) |
| `concrete` | #F3F2EE | Reading grounds |
| `white` | #FFFFFF | |
| `steel` | #A6A6C8 | Secondary text on dark (8 : 1) |
| `ink` | #14131F | Body text on light |
| `line` / `line-dark` | #D9D8E3 / rgba(255,255,255,.14) | Hairlines |

Rules: never red text on navy (2.4 : 1). No yellow anywhere in the UI. Photos keep their original grading. Text over photos sits on solid bands, never on gradients over the sky.

**Type:** the scale table in `05-typography.md` §4 is part of this spec.
- Readout 72 → 200 px Archivo wdth 75/800 with `tabular-nums`.
- H1 EN 38 → 72 / AR 40 → 76 px.
- H2 30 → 48 px.
- Body EN 17 / AR 18 px, line-height 1.6 / 1.85.
- Spec 14 → 16 px Plex Mono.
- Arabic letter-spacing is 0, Arabic is never justified, and Arabic labels get no caps tricks.

**Layout:**
- 12 columns, max 90 rem, margins `clamp(1rem, 4vw, 3.5rem)`.
- Section padding `clamp(5rem, 12vw, 11rem)`.
- Breakpoints 360/640/768/1024/1280/1536.
- Body measure about 36 rem EN / 38 rem AR.

**Shape:**
- 0–2 px radius, hairline rules.
- No shadows except the RequestBar.
- No glass, no glow.
- Signature shape: **the hook**. Motif: **the red/white chevron**, used only on the footer pad and draft/loading states.

**Focus:** 2 px outline with 3 px offset, white on dark and navy on light.

## 7. Motion system

**Principle:** loads rise slowly, settle and never bounce.
- **Easing:** `power3.out` / `expo.out` for entrances and `power2.inOut` for transitions. Durations 0.6–1.2 s, stagger 0.06–0.1 s.
- **Only `transform`, `opacity` and `clip-path` animate.**

**`gsap.matchMedia` contexts:**
1. **`desktop`:** `(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)`. Lenis, pinning and scrub.
2. **`touch`:** `(prefers-reduced-motion: no-preference)` and not desktop. No Lenis, no pinning; entry reveals play once.
3. **`reduced`:** `(prefers-reduced-motion: reduce)`. No timelines; final states rendered.

**Lenis:** synced with `ScrollTrigger.update` on the GSAP ticker, with `lagSmoothing(0)`.

**SplitText:** `type: "lines"` (plus words in Arabic, never chars), `mask: "lines"`, `autoSplit: true`, and only after `document.fonts.ready`.

**Limits:** one pinned scene per page. No custom cursor, no magnetic buttons, no sound.

## 8. Accessibility (WCAG 2.2 AA)
- **Contrast:** every token pair is checked (values in §6).
- **Navigation and focus:**
  - Skip link to the main content.
  - Every control works by keyboard, with a visible focus ring.
  - Focus is never hidden by the bar.
  - Native `<dialog>` for the menu and lightbox.
- **Content:**
  - The Hoist and grid are real lists. The animation adds nothing a screen reader needs.
  - SplitText keeps an `aria-label` with the full sentence.
- **Targets:** at least 44 px.
- **Forms:** labels, hints, `aria-describedby` and `aria-invalid`; announced errors; Arabic digits accepted.
- **Language:** `lang` and `dir` per page, `lang` on mixed-language spans, and `hreflang` links between pages.
- **Images:** alt text from the copy deck §13.

## 9. Performance budget
| Measure | Budget |
|---|---|
| First load (AR, mobile) | ≤ 1 MB |
| JS | ≤ 110 KB gz (Hoist chunk lazy) |
| CSS | ≤ 25 KB gz |
| Fonts | ≈ 143 KB, 3 preloaded |
| Hero image | AVIF ≤ 120 KB desktop / ≤ 80 KB mobile, `fetchpriority="high"`, visible without JS |
| LCP (Lighthouse mobile) | ≤ 2.0 s |
| CLS | ≤ 0.05 |
| INP | ≤ 150 ms |
| TBT | ≤ 150 ms |

Hashed assets are served `immutable`; HTML is served `no-cache`.

## 10. SEO
- **Per-page tags:** title, meta description and Open Graph/Twitter tags from the copy deck §1. Canonical, `hreflang` ar/en/x-default.
- **Files:** `sitemap.xml`, `robots.txt`.
- **Structured data:** JSON-LD `Organization` + `LocalBusiness` with confirmed fields only (name in both languages, email, Facebook `sameAs`). Phone, address and geo are added when verified.
- **Search terms:** both «رافعة» and «كرين» appear in the copy and meta tags.

## 11. Testing and acceptance

The agency receives real numbers, whether they pass or fail.
1. `npm run typecheck && npm run build`. The truth gate passes in staging and **fails in production while data is unverified**. That failure is the expected result and shows the gate works.
2. `qa/run-qa.mjs` (adapted from AFHAM): both pages × widths 320/375/414/768/1024/1280/1440/1920 × motion on/off.
   - **Checks:** console errors, failed requests, horizontal overflow and axe violations.
   - **Controls:** language switch, menu, filters, Request this crane → bar chip → form pre-fill → WhatsApp URL encoding, form validation (including ٣٥٠), lightbox (keyboard), back to top.
   - Screenshots of every case.
3. `qa/lighthouse.mjs`: mobile and desktop × both pages, median of 3 runs, plus a Slow-4G throttled run. Thresholds are in §1 and §9.
4. Visual check in the browser pane: hook alignment at every width, RTL details, Hoist beats.
5. **Not covered here:** physical phones. The report lists what the agency should check on a real iPhone and Android.

## 12. Handover
- Git repository with full source.
- `README.md`: run, build, deploy to Vercel or any static host, environment variables, edit copy, **add a crane**, how the truth gate works.
- `DESIGN.md`: the system.
- `docs/atlas-content-checklist.md`.
- PDF screen exports in place of Figma.
- QA and Lighthouse reports.

## 13. Open items from Atlas (the site works in staging without them; production waits)
| Item | Needed for |
|---|---|
| Phone and WhatsApp numbers | Live build |
| Address / city / map pin, hours | Contact, structured data |
| Crane ownership, confirmed capacities and quantities; whether the Kobelco is theirs | `verified` flags, Hoist, grid |
| Logo vector file | Sharp header and footer, favicon |
| Clean exports of 6398, 6389, 6374, 6380 (others optional); the Facebook video source | Better crops |
| Service details, especially oil services and handling, and whether operators are included | Services copy `[[CONFIRM]]` |
| Founding year, regions, clients they can name, documents (PDF) | Why / Documents |
| English name spelling and domain | Header, SEO, `SITE_URL` |
| Approval of the corrected positioning and of the dialect lines | Copy |

## 14. Risks and mitigations
| Risk | Mitigation |
|---|---|
| The hook doesn't line up on some crops | Hook points are stored per crop and checked at 8 widths in QA; if a crop has no hook point, the sling is hidden and the button sits in the band |
| The Hoist pin feels long with 5 cranes | Snap to each crane, a skip link "See all cranes", and a pin length driven by the data |
| Atlas data arrives late | Truth gate plus the draft badge: the staging link stays useful, and production is blocked until the data is confirmed |
| Arabic rendering bugs (bidi, digits) | `<bdi>`, explicit number formatting, digit conversion; tested in QA |
| 10-day timeline | The "your lift" sketch is a stretch; the documents section is data-driven; no 3D |
