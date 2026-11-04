# Atlas Alshraa: Typography (type tests and decision)

Prepared 4 November 2026. This is a test and a recommendation only. Nothing has been built.
Facts and voice come from `01-brand-and-asset-audit.md`. The colours and the "Load Moment" direction come from `02-creative-direction.md`.

**Decision [proposal]: P1.** Archivo Variable (width axis) for Latin display and all numerals, Noto Kufi Arabic Variable for Arabic display, IBM Plex Sans Arabic for body text in both languages, and IBM Plex Mono for specs. It scored 37 of 40. Its only weak point was file size, and subsetting fixes that: 348 KB → 143 KB, with identical glyphs (measured).

---

## 1. How the test was run

- Fonts were installed from Fontsource into `.work/type/` (throwaway). Every package is **OFL-1.1** (checked in each `package.json`). Readex Pro and Dosis were not used.
- `build.js` writes one specimen page per pairing. Each page loads only the **latin + arabic** subset files through its own `@font-face` rules. `render.js` captures each page at 1440 px wide with headless Chrome (puppeteer-core) and also measures glyph heights with `canvas.measureText`.
- Each specimen shows the same content twice, on the dark ground `#0D0C2B` and on the light ground `#F3F2EE`:
  - header lockup and nav;
  - the Arabic tagline as hero (76 px, RTL) and the English tagline (68 px);
  - three readouts: «350 طن», «٣٥٠ طن» and "350 t";
  - the spec line in both languages;
  - a 17 px body paragraph in each language;
  - buttons «اطلب رافعة» / «واتساب» / "Request a crane" / "WhatsApp";
  - small labels.

  Arabic letter-spacing is 0 everywhere.
- Every PNG was inspected at full size and in close crops.

**Specimens:** `docs/research/type-specimens/P1.png`, `P2.png`, `P3.png`, `P4.png`, plus `arabic-display-candidates.png` (8 Arabic display faces beside Archivo).

### Measured proportions (em, from the rendered fonts)

The comparison that matters is the Arabic **bowl height** (the top of ص) against the Latin **x-height**, and the **alef** against the Latin **cap height**.

| Font (weight) | Latin x / H | Arabic ص / alef | Digit "3" or "٣" |
|---|---|---|---|
| Archivo 800 | 0.53 / 0.69 | — | 3 = 0.70 |
| Noto Kufi Arabic 800 | — | **0.51 / 0.76** | ٣ = 0.67 |
| Big Shoulders Display 800 | 0.60 / 0.80 | — | 3 = 0.80 |
| Changa 800 | — | 0.48 / 0.63 | ٣ = 0.63 |
| Alexandria 800 | — | 0.60 / 0.88 | ٣ = 0.84 |
| Saira 800 | 0.51 / 0.69 | — | 3 = 0.70 |
| IBM Plex Sans Arabic 400 (body) | 0.52 / 0.70 | **0.41** / 0.74 | — |
| Alexandria 400 (body) | — | 0.55 / 0.82 | — |
| Archivo 400 (body) | 0.53 / 0.69 | — | — |

Noto Kufi's bowl (0.51) almost equals Archivo's x-height (0.53), so the two read as the same size at the same pixel size. Plex Sans Arabic's Arabic bowl (0.41) is 21% shorter than its own Latin x-height (0.52), so **Arabic body text should be 1 px larger than English** (18 px vs 17 px).

---

## 2. Comparison

Scores are 1 to 5 (5 is best). Payload is the sum of the woff2 files each pairing would ship: latin + arabic subsets only, at the weights and axes used in the specimen.

| Criterion | **P1** Archivo + Noto Kufi + Plex Sans Arabic + Plex Mono | P2 Big Shoulders + Changa + Plex Sans Arabic + JetBrains Mono | P3 Archivo + Alexandria + Plex Mono | P4 Saira + Noto Kufi + Plex Sans Arabic + Plex Mono |
|---|:-:|:-:|:-:|:-:|
| AR/EN display weight and size harmony | **5** | 2 | 4 | 4 |
| Body size match (Arabic vs Latin x-height at 17 px) | **4** | 4 | 4 | 4 |
| Tonnage numerals (Western and Arabic-Indic) | **5** | 3 | 4 | 4 |
| Body readability at 17 px | **5** | 5 | 4 | 5 |
| Mixed-direction lines | **5** | 3 | 4 | 5 |
| Industrial character (not generic) | **5** | 4 | 3 | 3 |
| Small labels and UI (12–14 px) | **5** | 2 | 5 | 3 |
| Payload after subsetting | 3 | 4 | **5** | 3 |
| **Total / 40** | **37** | 27 | 33 | 31 |
| Files shipped | 7 | 7 | 3 | 7 |
| Payload, Fontsource files as-is | 348.5 KB | 221.9 KB | **133.1 KB** | 357.1 KB |
| Payload, subset to core Arabic + basic Latin | 142.5 KB | 125.6 KB | **84.5 KB** | 152.6 KB |

### What the specimens showed

**P1. Archivo + Noto Kufi Arabic + IBM Plex Sans Arabic + IBM Plex Mono (winner)**
- **Display.** Noto Kufi 800 and Archivo 800 have the same stroke weight and nearly the same proportions (see the table above). The Arabic hero and the English hero look like one family on both grounds. Kufi's square, geometric build reads as steel plate. Archivo's grotesque roots read as engineered rather than fashionable.
- **Numerals.** Archivo at width 75 and weight 800 gives tall, tight, heavy figures, like a crane-cab load display. Noto Kufi is declared for the Arabic Unicode range only, so the digits in «350 طن» come from Archivo. They are **the same glyphs as "350 t"**. Kufi's Arabic-Indic figures are solid (٣ is 0.67 em against Archivo's 0.70). Its zero ٠ is a small diamond, which leaves a hole in a giant readout.
- **Body.** Plex Sans Arabic is very clear at 17 px on navy and on concrete. It draws Arabic and Latin as one design, so "GMK6350" inside Arabic text sits naturally. The Arabic looks about 1 px smaller than the English, which is fixed in the scale below.
- **Labels.** Archivo at width 125, weight 600, in caps is crisp at 12 px. "01" never reads as "OI".
- **Weakness.** The stock Noto Kufi Arabic file is 121 KB because it covers Persian, Urdu, Sindhi and other extended letters. Subsetting brings it to 24 KB (section 5).

**P2. Big Shoulders Display + Changa + IBM Plex Sans Arabic + JetBrains Mono**
- The English is tall and very narrow (cap height 0.80). The Arabic is short and wide (alef 0.63). Side by side the two headlines fight: a thin column next to a squat block.
- Changa's rounded squares feel "gaming / tech" more than heavy lifting. Its Arabic-Indic ٣ reads like a Cyrillic "ш", and its zero is a tiny dot.
- **Big Shoulders *Display* fails at 12 px.** "FLEET · 01" reads as "FLEET · OI". Labels would need Big Shoulders *Text*, which is one more file.
- On the plus side, the Chicago-signage numerals are strongly industrial, and the files are small.

**P3. Archivo + Alexandria + IBM Plex Mono**
- Lightest and simplest: 3 files and 133 KB, or 84.5 KB subset.
- Alexandria 800 is big (bowl 0.60, alef 0.88 against Archivo's 0.53 / 0.69). Arabic reads 10–15% larger than English at the same size, so each language would need its own size tokens.
- Its Arabic-Indic digits are very tall (٣ is 0.84 em) and wide. «٣٥٠ طن» overflowed its column at 184 px.
- Body: Alexandria at 17 px is readable but wide and round. The Arabic paragraph took 4 lines where Plex needed 3. The tone is friendly, modern and real-estate-like, and it is very common in Gulf branding. It reads less like heavy industry.

**P4. Saira + Noto Kufi Arabic + IBM Plex Sans Arabic + IBM Plex Mono**
- Saira's squared shapes echo Kufi's geometry, and its proportions match Archivo (x-height 0.51). The harmony is good.
- The tone is motorsport / esports / tech rather than cranes. The condensed numerals have soft rounded corners and less punch than Archivo's.
- At width 125 in small caps, the squared zero looks like a letter O: "01" reads "O1".
- Heaviest payload as shipped: Saira's width-axis file alone is 96.6 KB.

### A fifth pairing? Tested, not adopted

I set 8 Arabic display faces beside Archivo (`arabic-display-candidates.png`): Noto Kufi, Changa, Alexandria, Kufam, Beiruti, Noto Sans Arabic at width 75, Tajawal 800 and Plex Sans Arabic 700. **None beat Noto Kufi**, so I am not adding a P5.

- **Noto Sans Arabic (width 75):** the best match for condensed Archivo, but the width-axis Arabic file is 276.5 KB.
- **Kufam:** quirky angular cuts and odd final forms at UI sizes.
- **Beiruti:** looks small at the same pixel size, and its tone is editorial rather than industrial.
- **Tajawal:** tiny files (9 KB per weight), but it is the default Gulf-corporate look and feels generic.
- **Plex Sans Arabic 700:** its top weight is only 700, so it lacks punch beside Archivo 800. It would save one family, but the hero would lose its weight.

---

## 3. Recommended setup (P1)

| Role | Fontsource package and file | Axes and weights to use |
|---|---|---|
| Latin display, **all numerals**, small caps labels | `@fontsource-variable/archivo`, `archivo-latin-wdth-normal.woff2` (from `wdth.css`; holds both the wght 100–900 and wdth 62–125 axes) | **Readouts:** wdth 75, wght 800, `tabular-nums`. **EN H1:** wdth 100, wght 800. **EN H2/H3:** wdth 100, wght 700. **Labels:** wdth 125, wght 600, caps, +0.14em |
| Arabic display | `@fontsource-variable/noto-kufi-arabic`, `noto-kufi-arabic-arabic-wght-normal.woff2`, **Arabic range only** (never load its Latin file) | **AR H1 and readout unit:** wght 800. **AR H2/H3 and header lockup:** wght 700 |
| Body and UI, both languages | `@fontsource/ibm-plex-sans-arabic`: arabic-400, arabic-600, latin-400, latin-600 | **400:** body, lead, meta. **600:** buttons, nav, Arabic labels, bold text |
| Specs and data | `@fontsource/ibm-plex-mono`, latin-500 | **500** (Arabic words in spec lines fall back to Plex Sans Arabic) |

**One display stack for both languages.** Declare Noto Kufi under its own family name with an Arabic-only `unicode-range`. Arabic letters then come from Kufi, while digits, Latin and spaces fall through to Archivo:

```css
@font-face {
  font-family: 'Atlas Kufi';
  src: url('/fonts/noto-kufi-arabic-core.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+0600-06FF, U+200C-200F;
}
:root {
  --ff-display: 'Atlas Kufi', 'Archivo Variable', system-ui, sans-serif;
  --ff-text:    'IBM Plex Sans Arabic', system-ui, sans-serif;
  --ff-mono:    'IBM Plex Mono', 'IBM Plex Sans Arabic', ui-monospace, monospace;
}
.readout        { font-family: var(--ff-display); font-stretch: 75%; font-weight: 800;
                  font-variant-numeric: tabular-nums lining-nums; letter-spacing: 0; }
.readout .unit  { font-size: .36em; font-stretch: 100%; font-weight: 700; color: var(--red-bright); }
.label:lang(en) { font-family: 'Archivo Variable'; font-stretch: 125%; font-weight: 600;
                  text-transform: uppercase; letter-spacing: .14em; }
.label:lang(ar) { font-family: var(--ff-text); font-weight: 600; letter-spacing: 0; }
```

- `font-stretch: 75%` condenses the Archivo digits. Kufi has no width axis, so it is left untouched; the browser does not fake a condensed version (checked in the specimen).
- **Turn on `tabular-nums` for the count-up.** Archivo's default digits are proportional: at 100 px, "111" is 135.5 px wide and "888" is 146.1 px. With `tabular-nums` both are 149.1 px, so the number does not jitter while counting. Kufi's Arabic-Indic digits are already tabular.
- **Preload at most 3 files** (the audit's budget). Arabic page: Kufi core, Archivo, Plex Sans Arabic arabic-400. English page: Archivo, Plex latin-400, Plex latin-600. Use `font-display: swap`, and give each face a size-adjusted local fallback to keep CLS ≤ 0.05.

---

## 4. Type scale

The fluid range runs from 360 px to 1440 px viewport (the value stays fixed above and below). Formula: `clamp(min, min − (max − min)/3 + (max − min)/10.8 vw, max)`. Arabic and English have separate tokens where the scripts need different sizes.

| Token | EN size | AR size | Font and axes | Line-height EN / AR | Tracking |
|---|---|---|---|---|---|
| `readout` (tonnage) | `clamp(4.5rem, 1.833rem + 11.852vw, 12.5rem)` 72→200 | same token (the digits are Archivo in both languages) | Archivo wdth 75 / 800, `tabular-nums`. Unit .36em: Archivo 700 (t) or Kufi 700 (طن) | 0.9 / 1.0 | EN digits −0.01em; Arabic 0 |
| `h1` (hero) | `clamp(2.375rem, 1.667rem + 3.148vw, 4.5rem)` 38→72 | `clamp(2.5rem, 1.75rem + 3.333vw, 4.75rem)` 40→76 | EN: Archivo wdth 100 / 800. AR: Kufi 800 | 1.04 / 1.3 | EN −0.01em; AR 0 |
| `h2` (section) | `clamp(1.875rem, 1.5rem + 1.667vw, 3rem)` 30→48 | `clamp(1.875rem, 1.458rem + 1.852vw, 3.125rem)` 30→50 | Archivo wdth 100 / 700. Kufi 700 | 1.08 / 1.35 | EN −0.005em; AR 0 |
| `h3` (card, model) | `clamp(1.3125rem, 1.167rem + 0.648vw, 1.75rem)` 21→28 | `clamp(1.375rem, 1.208rem + 0.741vw, 1.875rem)` 22→30 | Archivo wdth 100 / 700. Kufi 700 | 1.2 / 1.45 | 0 |
| `lead` | `clamp(1.125rem, 1.0625rem + 0.278vw, 1.3125rem)` 18→21 | `clamp(1.1875rem, 1.125rem + 0.278vw, 1.375rem)` 19→22 | Plex Sans Arabic 400 | 1.55 / 1.8 | 0 |
| `body` | `clamp(1rem, 0.979rem + 0.093vw, 1.0625rem)` 16→17 | `clamp(1.0625rem, 1.042rem + 0.093vw, 1.125rem)` 17→18 | Plex Sans Arabic 400 (600 for bold) | 1.6 / 1.85 | 0 |
| `button`, `nav` | same as EN body (16→17) | same as AR body (17→18) | Plex Sans Arabic 600 | 1 (button height 52–56 px) | 0 |
| `spec` (mono) | `clamp(0.875rem, 0.833rem + 0.185vw, 1rem)` 14→16 | same token | Plex Mono 500 (Arabic falls back to Plex Sans Arabic) | 1.5 / 1.6 | 0 |
| `small` (meta, captions) | 0.875rem (14) | 0.9375rem (15) | Plex Sans Arabic 400 | 1.5 / 1.7 | 0 |
| `label` (eyebrow) | `clamp(0.75rem, 0.729rem + 0.093vw, 0.8125rem)` 12→13, caps | `clamp(0.8125rem, 0.792rem + 0.093vw, 0.875rem)` 13→14, no caps | EN: Archivo wdth 125 / 600. AR: Plex Sans Arabic 600 | 1.3 / 1.5 | EN +0.14em; **AR 0** |

Rules:
- **Arabic letter-spacing is always 0.** Arabic has no capitals, and tracking breaks the joins. Arabic labels get emphasis from weight 600 and colour instead.
- **Always set an explicit line-height.** The subset fonts change the height of a `line-height: normal` line box by about 1 px.
- **Body line length:** about 60–75 characters for English and about 55–70 for Arabic, so max-width is roughly 36rem for English and 38rem for Arabic.

---

## 5. Payload: as shipped by Fontsource vs subset

The Fontsource "arabic" files cover every Arabic-script language. Atlas needs standard Arabic plus Western digits only. I subset each file with `subset-font` (HarfBuzz), keeping all layout features and every variation axis:

- **Arabic set:** U+0621–063A, U+0640–0655, U+0660–066D, U+060C, U+061B, U+061F, U+0670–0671, U+200C–200F.
- **Latin set:** U+0020–007E, plus nbsp, ·, ×, – —, curly quotes, …, •, ↑ ↓, ° and ©.

| P1 file | Fontsource | Subset |
|---|---|---|
| Archivo latin (wght + wdth) | 88.0 KB | 52.9 KB |
| Noto Kufi Arabic, arabic (wght) | 120.8 KB | **24.0 KB** |
| Plex Sans Arabic arabic 400 / 600 | 41.8 + 44.6 KB | 15.0 + 15.4 KB |
| Plex Sans Arabic latin 400 / 600 | 18.7 + 20.0 KB | 12.7 + 13.7 KB |
| Plex Mono latin 500 | 14.5 KB | 8.9 KB |
| **Total** | **348.5 KB** | **142.5 KB** |

**Checked, not assumed.** I rendered the P1 specimen with the stock files and with the subset files, then compared them pixel by pixel.
- **Kufi subset:** identical (1 pixel differed by 1/255).
- **Plex subsets:** anti-aliasing differences only (largest channel difference 31/255).
- **Archivo subset:** identical hero. The labels have identical measured widths; they move by about 1 px vertically only where `line-height` is `normal`.

Optional: also limiting the axes (Kufi wght 500–800, Archivo wdth 75–125 and wght 400–800) gives 17.7 KB and 48.2 KB, a total of about 132 KB. Archivo then renders slightly differently, so re-check it before using.

If content later needs Persian letters (پ چ گ ک ی) or accented Latin names, widen the character sets.

---

## 6. Numerals: use Western digits (0–9) in both languages

**Recommendation [proposal]:** set tonnage, radius, height, dates and phone numbers in **Western digits on the Arabic site too**: «350 طن», «55 طن», «GMK6350». Keep Arabic-Indic digits (٠–٩) out of the UI.

Why:
1. **It is how Libya writes numbers [fact].** Atlas's own photo `IMG_6364` shows a Libyan plate reading «ليبيا 8» / «أ 4550»: Arabic letters with Western digits, exactly the «350 طن» pattern. Libya follows the Maghreb habit. The Unicode locale data that every browser uses (CLDR) agrees. I checked in Node 24: `new Intl.NumberFormat('ar-LY').format(350)` gives "350" (numbering system `latn`), the same as ar-TN, ar-DZ and ar-MA. In contrast, ar-EG and ar-SA give "٣٥٠".
2. **The machines speak Western digits.** Model codes (GMK6350, RT700E), the load display in the crane cab and the makers' load-chart PDFs all use 0–9. One numeral system lets a site engineer match the website to the chart without converting.
3. **One animation, one glyph set.** The Capacity Scale count-up (55 → 350) uses the same Archivo condensed tabular digits in both languages, with no font switch and no layout shift.
4. **Better display type.** Archivo's width-75 figures are the strongest numerals in the test. Kufi's Arabic-Indic zero is a small diamond that leaves a gap in a 200 px readout.

Implementation notes:
- Format numbers with `Intl.NumberFormat('ar-LY')` or `{ numberingSystem: 'latn' }`. **Never use bare `'ar'`**: its default has changed between CLDR versions, and older browsers print ٣٥٠.
- In the form (load weight, phone), **accept both digit systems**. Normalise ٠–٩ (U+0660–0669) and ۰–۹ (U+06F0–06F9) to 0–9 before validation and before building the WhatsApp message. Use `inputmode="decimal"` for weight and `inputmode="tel"` for phone.

---

## 7. Mixed-direction rules (bugs caught in the test)

1. **Isolate Latin codes inside Arabic lines.** Without isolation, «جروف GMK6350 · 350 طن · لكل التضاريس» displays as «جروف 350 · GMK6350 طن …». The bidi algorithm joins "GMK6350 · 350" into one left-to-right run, so the reader sees the tonnage before the model. Every specimen shows this broken line in its dark-ground "✕" row. The fix: `جروف <bdi>GMK6350</bdi> · 350&nbsp;طن`. Wrap Arabic names in English text the same way: `Atlas Alshraa (<bdi lang="ar">أطلس الصحراء</bdi>)`.
2. **Put a non-breaking space between number and unit:** `350&nbsp;t`, `350&nbsp;طن`. The specimens use it, so "350" and its unit never land on separate lines. This matters most in narrow mobile columns.
3. **Set `lang` on every block.** Then `:lang(ar)` picks the Arabic line-heights, sizes and zero tracking automatically, including inside a mixed card.
4. **Keep the logical order "number, then unit"** in Arabic (`350 طن`). The browser places the number on the right, which is correct for Arabic reading.

---

## 8. Files

- Specimens: `docs/research/type-specimens/P1.png` … `P4.png` and `arabic-display-candidates.png`
- Throwaway test kit (not the site): `.work/type/`
  - `build.js` and `render.js`: specimens, PNG capture and glyph measurement;
  - `cand.js`: the Arabic display candidates;
  - `subset-all.js` and `verify.js`: subset payload and pixel check;
  - `specimens/*.html` and `specimens/payload.json`.
