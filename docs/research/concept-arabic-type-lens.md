# Atlas Alshraa: two concepts through an Arabic-type lens

Second opinion, written on 4 Nov 2026. This is art direction only. No code is included.

**What I read:** `01-brand-and-asset-audit.md`, `photo-contact-sheet.jpg`, and reduced copies of nine originals (IMG_6359, 6364, 6371, 6374, 6380, 6385, 6389, 6393, 6398) so I could check crops and hook positions. I did **not** read `02-creative-direction.md`.

**Markers:** **[fact]** comes from the audit or the photos. **[checked today]** means I verified it in this session. **[proposal]** is a design choice. No capacity, client, certificate or date appears here unless it is printed on a machine or listed in the audit. Every capacity still needs Atlas's fleet sheet.

---

## 0. Ground rules for both concepts

### 0.1 The name points in two directions

- **أطلس** has two meanings. It is the Titan who holds up the sky, which is a vertical act, the same thing a crane does. In Arabic, as in English, it is also *a bound book of maps*. The logo already shows a world map circled by an orbit arrow **[fact]**.
- **الصحراء**, the desert, is horizontal: open ground and a horizon.

The two concepts take one direction each:
- **Concept A, «مَدّ»**, is horizontal. It uses the stretched Arabic stroke (*madd*, or kashida) as both a horizon and a capacity scale, and it moves in the reading direction.
- **Concept B, «أطلس»**, is vertical and works like a book. The site is a bilingual atlas, and its spine is a crane boom.

### 0.2 Numbers use Western digits, not Eastern digits

| Evidence | What it shows |
|---|---|
| Libyan plate in IMG_6364 | «ليبيا» with **4550** in Western digits **[fact, seen]** |
| Machine markings: "350 TON" on the GMK6350 boom (IMG_6389), RT700E, AC200-1, QUY250 | All Western digits **[fact]** |
| noc.ly, Arabic homepage of the National Oil Corporation | «بتاريخ 02/11/2026», «1.4 م/يوم»: Western digits **with a decimal point** **[checked today]** |
| alwasat.ly, Libyan news | «بـ60 ميدالية»: Western digits **[checked today]** |
| ICU `Intl.NumberFormat` (Node 24) | `ar-LY` gives Latin digits but **"350,5" with a comma decimal**. `ar-SA` and `ar-EG` give «٣٥٠٫٥» **[checked today]** |

**Decision (both concepts):**
- Use Western digits 0–9 in both languages, with a decimal point (the NOC style). Dates are dd/mm/yyyy on the Arabic pages and "3 Nov 2026" on the English pages.
- Format every number with explicit options (`numberingSystem: 'latn'`, a fixed decimal separator). Never trust the locale default, because browsers ship different ICU versions.
- **Accept Eastern digits in form fields.** Arabic phone keyboards often type ٠–٩ (and Persian ۰–۹, «٫», «٬»). Convert them on input.

*Why a buyer cares:* procurement staff check our figures against manufacturer load charts and NOC paperwork, and both use Western digits. Eastern digits would read as Gulf or Egyptian, and they would force a mental conversion at the exact moment the buyer is comparing capacities.

### 0.3 Arabic typesetting rules (both concepts)

1. **No letter-spacing on Arabic.** Some engines apply it and break the joins between letters. Set `letter-spacing: 0` on `:lang(ar)`.
2. **Split text into lines (or words) only, never into characters.** Splitting by character breaks cursive joining. Use GSAP SplitText with `type: "lines"` and `mask: "lines"`.
3. **Never justify Arabic body text.** Browsers don't justify with kashida; they only widen the spaces, which creates rivers. Keep the text ragged (aligned right, ragged left).
4. **Size and leading:** set Arabic about 110–125 % of the Latin size for the same role. Use line-height 1.7–1.85 for body and 1.2–1.35 for display, because the dots and the descenders of ي ن ق need room.
5. **Bidirectional text:**
   - Wrap model codes, phone numbers and emails in `<bdi>` or `dir="ltr"`.
   - In logical order, «350 طن» displays with 350 on the right, which is correct.
   - **Never write a range as "45–350" inside Arabic text.** The en dash is a neutral character, and between two numbers in an RTL paragraph the bidi algorithm shows it as "350–45". Write «من 45 إلى 350 طن» instead, or isolate the range as LTR. (An ASCII hyphen survives the reordering, but it looks typographically cheap.)
6. **Mirror only what has a direction:** arrows, progress bars, carousels, "next" chevrons. Never mirror photos (GROVE, TEREX and FW.CHINA lettering would reverse), the logo, the WhatsApp icon or tick marks.
7. **Arabic punctuation:** use ، ؛ ؟ and «».
8. **Two registers:**
   - Modern Standard Arabic for specs, forms and documents.
   - Libyan dialect only where Atlas already uses it (their post: «شنو الرافعة اللي يحتاجها مشروعك؟ … وخلي الباقي علينا»). Any new dialect line needs Atlas's approval.
9. **Search terms:** the legal name says «تأجير الرافعات (الكرينات)» **[fact]**. Use both رافعة and كرين in the copy and in the meta tags.
10. **Font files:**
    - Subset with OpenType layout features kept (`pyftsubset --layout-features='*'`).
    - Give each font a metric-matched fallback (`size-adjust`, `ascent-override`) so CLS stays at or below 0.05.
    - Arabic fallbacks: Geeza Pro or SF Arabic on Apple, Noto Naskh Arabic on Android.
11. **Contrast:** red #C9221C on navy is 2.4 : 1. That also fails the 3 : 1 rule for meaningful graphics (WCAG 1.4.11). Red tick marks that carry data appear only on white or sand. On navy, red is decoration only.
12. **Never fake a kashida in Latin text**, and never letter-space Arabic to imitate Latin width. Each script grows in its own way.
13. **Motion follows the reading direction:**
    - Text reveals, progress, scales and carousels move toward the reading end (left in Arabic, right in English).
    - Lifts are vertical and work the same in both directions.
    - Drive this with CSS logical properties plus one `dir` sign in JavaScript, so one stylesheet serves both pages.

### 0.4 Font files checked today (Fontsource woff2, one subset each)

| File | Size |
|---|---|
| Kufam variable, Arabic | 54 KB |
| IBM Plex Sans Arabic 400, Arabic | 42 KB (600: 45 KB) |
| Archivo variable wdth+wght, Latin | 88 KB (wght only: 34 KB) |
| IBM Plex Mono 500, Latin | 15 KB |
| Markazi Text variable, Arabic / Latin | 40 KB / 25 KB |
| Aref Ruqaa 700, Arabic | 45 KB (subset to three phrases: about 10 KB, estimate) |
| Atkinson Hyperlegible Mono variable, Latin | 17 KB |

All of these are OFL, on Google Fonts, and on Fontsource. None of them is Readex Pro or Dosis. I also skipped Cairo, Tajawal and Almarai on purpose: they are the regional defaults, and using them would make Atlas look like everyone else.

---

## Concept A: «مَدّ» Madd, the stretch

### One-line idea
The Arabic *madd* (kashida), the stroke a calligrapher stretches to give a word weight, becomes the capacity scale. As the visitor reads from the smallest crane to the largest, **the word «للكبيرات» itself stretches in the reading direction**, and the whole fleet stands on that one stretched stroke.

### Why it belongs to Atlas and no one else
- **Their tagline is a range sentence:** «من الرافعات الصغيرة للكبيرات» **[fact, Facebook 29 Oct 2026]**. The line moves from small to large, and its last word contains joining letters that can take a kashida: «للكبيــــرات». No other company's own words do this.
- **«الصحراء»** means expanse and horizon. The kashida is Arabic's horizon line, and two of the beach shots have a real sea horizon (IMG_6364, 6398) **[fact]**.
- **The machines have the right mechanics.** IMG_6359 shows a *telescopic* Grove RT700E: its boom extends in sections, just as the kashida extends in steps. IMG_6380 shows a *lattice* crawler (QUY250), whose boom rises in one smooth motion **[fact]**. Each hero's motion copies its own crane.
- **Libyan numbers are Western digits** (section 0.2), so the scale's figures read the same as the machine markings.

### Hero composition

**Why the two languages use different photos:** I never mirror a photo, so each language gets a photo whose **boom points in that language's reading direction**.
- In IMG_6359 the boom runs from the machine on the right to the hook on the left, which is the Arabic direction.
- In IMG_6380 the boom climbs from left to right, which is the English direction.

**Arabic hero, desktop (`/ar/`):**
- **Photo: IMG_6359, 16:9, top-anchored crop.** The crop keeps the top 84 % of the frame. The audit tested this crop: it removes the watermark.
- **Hook position:** about 33 % across and 52 % down the full frame, which is about 33 % across and 62 % down the crop.
- **Ground band:** a navy band (#23207A, 0 → 88 % opacity) rises over the bottom 45 %, so the type sits on "ground" and the crane stands above it.
- **Headline:** two lines at the bottom, aligned to the right margin. Kufam 800, about 96 px.
  - Line 1: «من الرافعات الصغيرة»
  - Line 2: «للكبيــــرات»
- **The key move:** line 2's kashida carries the word's tail «ـرات» leftward until it ends **directly under the photographed hook**.
  - Line 2 becomes the longest line. "The largest" is literally the longest.
  - The hook's position is stored in image coordinates and mapped through the `object-fit: cover` maths on resize. If the mapping fails, the stroke simply ends at its default length.
- **Buttons, under line 2 on the right side:** [واتساب] in red with white text (5.6 : 1) and [تصفّح الأسطول] as a white outline.
- **Header:** white, over the sky.

**English hero, desktop (`/en/`):**
- **Photo: IMG_6380, 16:9, top-anchored crop.** The left half is almost cloudless blue. The hook block hangs at about 64 % across and 41 % down.
- **Layout:** the same navy ground, with the headline aligned to the left margin.
  - Line 1: "From smaller cranes"
  - Line 2: "to the largest ones."
  - Set in Archivo 800.
- "largest" widens along Archivo's width axis (62 → 125) until line 2 ends under the hook.

**First 2 seconds (Arabic)**

| Time | What happens |
|---|---|
| 0 ms | Photo painted at full opacity. It is the LCP element and is never faded in. Ground band and header are already visible. |
| 0–650 ms | Line 1 rises inside its line mask (power3.out). |
| 400–900 ms | Line 2 rises at its natural width. |
| 900–1750 ms | The kashida extends in **three steps**, about 230 ms each with a 40 ms hold (power2.inOut), like boom sections locking out. The tail slides left to the hook. |
| 1750–2000 ms | A small red rhombus (the calligrapher's *nuqta*, decorative, aria-hidden) lands on the baseline under the hook. The buttons fade up 12 px. |

**First 2 seconds (English):** the same until 900 ms. Then "largest" widens in **one continuous ease** (the lattice crane's luff), and the same ending follows.

**Mobile hero:**
- **Layout:** the photo comes first (top 56 svh), then a navy band with the headline (Kufam 44 px, or Archivo 40 px) and full-width buttons.
- **Arabic crop:** IMG_6359 cut to 2:3, x 18–55 %, y 0–84 %. It keeps the boom tip, rope, hook and cab top, and it drops the watermark.
- **English crop:** IMG_6380 cut to 2:3, x 30–67 %, y 0–84 %.
- **The kashida** grows toward the end margin of the band. On mobile there is no hook alignment.

### Signature interaction: "The Long Stroke" (section 3, fleet and capacity)

The scene sits on white or sand, so red ticks pass contrast.

1. **Opening.** A small line at the top reads «من الرافعات الصغيرة للكبيرات». Below it, one navy baseline crosses the screen at about 62 % of the height.
2. **The section pins** for about 250 vh. «للكبيـرات» sits at huge size (Kufam 800, up to 160 px). Its head is fixed at the start edge (the right in Arabic), and the kashida starts at zero length.
3. **Scrolling stretches the stroke toward the reading end, and the stroke *is* the baseline.**
   - Each crane has a tick (a red rhombus) on the line. Its position is **proportional to the crane's confirmed capacity** on a linear scale, so the jump to the largest crane reads as a real jump.
   - The label hangs under each tick:
     - model in mono, e.g. «GMK6350»
     - type in Arabic, e.g. «رافعة لكل التضاريس»
     - capacity in big condensed digits
4. **One photo frame (about 40 vw × 48 vh) rides above the moving tail.**
   - Each time the tail passes a tick, the next crane rises into the frame with a bottom-to-top wipe, like a lift.
   - The frame shows the right crop for each crane. The largest is IMG_6389, the GMK6350 with "350 TON" printed on its boom, the only capacity printed on a machine in the shoot.
5. **A fixed readout at the end edge** rolls like an odometer between confirmed values only (tabular digits, about 300 ms per step). It never counts up from zero, which would feel like an invented statistic.
6. **The stroke reaches the end margin and «ـرات» completes the word.**
   - The pin releases into the line «لكل مشروع رافعته المناسبة».
   - Two buttons follow: «شوف الأسطول كامل» and «اسأل على رافعة في واتساب».
   - (Both are dialect lines and need Atlas's approval. Modern Standard Arabic fallbacks: «تصفّح الأسطول كاملًا» and «استفسر عبر واتساب».)

**English version:** the same scene runs left to right. "to the largest" stays fixed at the start. A rule extends rightward from the word as the baseline, and "largest" widens through Archivo's width axis as the capacity rises. Latin gets no fake kashida.

**Data rules:**
- A tick appears only for a confirmed capacity. Cranes with the same capacity share one tick with stacked labels.
- The Kobelco CKE2500 stays hidden until Atlas confirms they own it (audit warning).
- The Faun appears in the fleet grid only once its model and capacity are known.
- The signature needs **at least 4 confirmed capacities**. Below that, ship a static ladder (see the reduced-motion version).

**How to build the stretch:**
- Split the word into two live-text halves: «للكبيـ» + ZWJ and ZWJ + «ـرات». The zero-width joiner (ZWJ) forces the joining shapes at the cut.
- Between the halves sits an `aria-hidden` bar. Its thickness is measured once from Kufam's tatweel stroke and set on the baseline. It animates with `scaleX`.
- Screen readers get the whole word «للكبيرات» as visually hidden text.
- An accessible table (model, type, capacity) follows the scene for screen readers and copy-paste.

### How Arabic and English type relate

| Role | Family | Weights | Size / line-height | Why |
|---|---|---|---|---|
| Arabic display | **Kufam** (variable 400–900) | 800 hero, 700 headings | hero clamp(44px, 6.6vw, 104px) / 1.2; H2 40–64 / 1.25 | Its Kufi tatweel is a **straight bar**, which reads as a ruler or a boom section, not a brush stroke. Google Fonts describes it as built "for contemporary information design such as signage and wayfinding", so it reads industrial. I rejected Reem Kufi because its own description says it feels "old, historical, or Islamic". Kufam is condensed, so long Arabic words fit. Arabic by Wael Morcos. |
| Arabic body and UI | **IBM Plex Sans Arabic** | 400, 600 | 18 / 1.75 mobile, 19 / 1.8 desktop; labels 15 / 1.5 | Co-designed by Wael Morcos and Khajag Apelian with Bold Monday (Google Fonts metadata), so the **same hand drew both Arabic faces**. Low contrast survives cheap Android screens. |
| Latin display | **Archivo** (variable wdth 62–125, wght 100–900) | 800; caps labels 600 at wdth 112, +0.08em | hero clamp(40px, 6vw, 96px) / 1.0 | **The width axis is how Latin grows natively, the English twin of the kashida.** A grotesque from Omnibus-Type, with an industrial feel. |
| Latin body and UI | **IBM Plex Sans** (variable) | 400, 600 | 16 / 1.55; labels 14 / 1.4 | The Latin sibling of Plex Sans Arabic. Buttons, fields and chips keep the same rhythm when the language switches. |
| Mono / data | **IBM Plex Mono** | 500 | 14–16 | Model codes and units, from the same family. |
| Big numbers | Archivo, wdth 75, wght 800, tabular | — | up to 160 px | Condensed digits echo the condensed "350 TON" on the GMK6350 boom (IMG_6389). |

- **Size ratio:** Arabic display about 1.1 × Latin. Kufam is dark and condensed, so it needs less of a boost than a Naskh would. Arabic body is 2–3 px larger than Latin body.
- **Preloads:** at most 3 per page.
  - `/ar/`: Kufam Arabic (54 KB), Plex Sans Arabic 400 (42 KB), and an Archivo digits-only subset (about 4 KB).
  - `/en/`: Archivo limited to wght 700–900 with full width, Latin basic only (about 40 KB, estimate to verify), and Plex Sans 400.
  - Everything else loads lazily.

### Numbers
- Western digits everywhere.
- Capacity numbers are set in condensed Archivo. «طن» is set in Kufam 700 at 45 % of the number's height, placed on the end side, so it reads «350 طن» correctly. English uses "350 t".
- Odometer roll between confirmed values only. Tabular figures so digits don't jitter.
- Ranges are written in words in Arabic (section 0.3, rule 5).

### Section flow (9)
1. **Header:**
   - The round badge (at least 56 px on desktop, per the audit), then «أطلس الصحراء» set in Kufam 800, with "ATLAS ALSHRAA" below in wide Archivo caps (wdth 125, +0.12em), echoing the capitals on the logo's arc.
   - Nav: الأسطول · الخدمات · المواقع · تواصل.
   - The language link is written in the *target* language ("English" / «العربية»), never shown as a flag.
   - WhatsApp stays on screen.
   - *Don't put a kashida into the name lockup without Atlas's approval.*
2. **Hero:** as described above.
3. **Fleet and capacity:** The Long Stroke.
4. **Services, as four "lines":**
   - Each row has a Kufam title on the start side and a hairline running in reading direction to a red rhombus, then 2–3 lines of text (copy pending from Atlas). Hover or focus extends the hairline, a small echo of the stroke.
   - Crane hire uses IMG_6398. Handling and rigging uses IMG_6364 (the sling on the hook).
   - Heavy transport and oil services have **no photos, so they stay typographic** (no stock).
5. **Fleet grid:**
   - Cards are sorted small to large in reading direction.
   - The tonnage filter is a segmented bar laid along a line, with bands generated from the fleet sheet, growing toward the reading end.
   - Card hierarchy: capacity number (largest), then model (mono), then type in Arabic.
   - Primary button «اطلب هذه الرافعة» opens WhatsApp prefilled: «السلام عليكم، نبي نستفسر على الرافعة GMK6350» (dialect, needs approval). A secondary link prefills the form.
6. **Sites gallery:**
   - Two horizontal scroll-snap strips, construction site and coast. They are native RTL on `/ar/`.
   - Captions give model names only; the sites are not named.
   - In the coast strip, **crops are aligned so the sea horizon sits at the same height in every frame**: one continuous horizon, the concept's line. This works fully only once clean exports arrive.
   - Detail shots (6376, 6379, 6382, 6393) open the section.
7. **Why / Documents:** hidden by a data flag until real files exist. Then each document is one row: name · issuer · valid until (dd/mm/yyyy) · PDF size. There are no placeholder claims.
8. **Contact, a sentence form:**
   - «نبي نرفع حمولة وزنها [ ] طن، على بُعد [ ] متر، لارتفاع [ ] متر، في [المدينة]، يوم [التاريخ].» (Modern Standard Arabic option: «نحتاج إلى رفع حمولة…».)
   - English: "We need to lift [ ] t, at a radius of [ ] m, to a height of [ ] m, in [city], on [date]."
   - Each blank has a visible small label and a «مش متأكد» / "not sure" chip.
   - Number fields use `inputmode="decimal"`, `dir="ltr"`, and digit conversion.
   - Then name and phone.
   - [ابعث على واتساب] is primary; [أرسل الطلب] is secondary.
   - The request reads as **one line**, true to the concept.
9. **Footer:**
   - A closing line «لكل مشروع رافعته المناسبة» with the stroke at rest.
   - The full legal name (Arabic and English) and atlasalsahralibya@gmail.com **[fact]**.
   - Phone, WhatsApp and address appear only when supplied.

### Mobile
- **Hero:** as described above.
- **Signature:** no pin on mobile. Cranes sit in a **native RTL scroll-snap strip**, and the stroke under the strip grows with `scaleX` from scroll progress. That needs one passive listener and causes no layout work.
- **Bottom bar after the hero:** [WhatsApp] on the start side and [Call] (when supplied), both at least 48 px tall.

### Reduced motion
- The hero shows the kashida at full length immediately. No step animation; the buttons are visible.
- The capacity section is not pinned. It shows the full stroke with every tick and label, a static row of crane frames, and no odometer.
- Smooth scrolling is turned off explicitly. View transitions are turned off.

### Borrowed principle
From **neal.fun, "The Deep Sea"** (neal.fun/deep-sea, still live **[checked today]**): a single continuous scale, items placed at their *true* value, and a readout that never leaves the screen. We borrow those three things for the tonnage ticks and the fixed capacity readout. The kashida is our own.

### Risks
1. **Kashida placement must be calligraphically right**, or Arab readers will see an amateur job. I chose ي→ر in «للكبيــرات» (and ح→ر in «الصحــراء»). A native Arabic typographer should approve both on day 1.
2. **Different hero photos per language** may surprise the client. Fallback: IMG_6398 for both, losing the "boom points in reading direction" idea.
3. **The signature needs at least 4 confirmed capacities.** Without the fleet sheet it falls back to a static ladder.
4. Animating the width axis triggers layout every frame. Keep it to one word inside `contain: layout paint`, and test on a mid-range Android phone.
5. Mapping the hook through `cover` can drift at extreme aspect ratios. The fallback is no alignment.
6. All dialect copy needs Atlas's sign-off.

### Build plan (10 working days)

| Day | Work |
|---|---|
| 1 | Tokens, font subsetting and instancing, an AR/EN type specimen page. **Kashida prototype (ZWJ + bar) in Chrome, Safari, Firefox and Android Chrome.** Image pipeline. |
| 2 | Layout skeleton for `/ar/` and `/en/`, header and footer, bidi and number-format helpers. |
| 3 | Both heroes, art-directed crops, hook mapping, the 2-second timelines. |
| 4–5 | The Long Stroke: pin, ticks, frame, odometer, mobile strip, reduced-motion version. |
| 6 | Services and fleet grid with filter and WhatsApp prefill. |
| 7 | Sites strips, documents (behind the flag), sentence form with validation and digit conversion. |
| 8 | Copy in both languages, SEO, JSON-LD, GA4. |
| 9 | Lighthouse, axe, devices, RTL edge cases, font-fallback CLS. |
| 10 | Client fixes and deploy. |

### Self-score
- **Uniqueness: 9.** No crane site, and few sites anywhere, use the kashida as a data scale.
- **Buyer clarity: 7.** The poetry is in front; the data comes through the ticks.
- **10-day feasibility: 7.** The stretch and the hook mapping are the risky parts.

---

## Concept B: «أطلس» The Atlas, a bilingual book of plates

### One-line idea
Take the name literally. An atlas is a bound reference book of plates, and Atlas the Titan is a pillar holding up the sky. **The site is a bilingual atlas whose spine is a crane boom.** Arabic sits to its right and English to its left, and **the numbers, which are identical in both languages, sit on the spine itself.**

### Why it belongs to Atlas and no one else
- **The logo contains a world map** inside an orbit arrow **[fact]**. "Atlas" already means a book of maps on their own badge.
- **The buyer asks for a book.** Mellitah's prequalification calls for an **Arabic + English technical file** **[fact, audit]**. This site looks and behaves like one: plates, a legend, an index and an appendix.
- **Numbers are shared between the languages.** Libya writes Western digits in Arabic (NOC, plates, machines, section 0.2), so "350" is literally the same word in both languages. That is why the numbers can sit *between* the columns. With Eastern digits this layout could not work.
- **IMG_6374 shows a literal pillar against the sky.** The Terex boom rises vertically in deep blue above a counterweight lettered TEREX TEREX and edged with red chevrons **[fact]**. It is Atlas holding up the sky, and it is direction-neutral, so both languages use the same photo.
- **The hazard chevrons on every outrigger** (6360, 6364, 6374, 6375, 6397, 6398) alternate red and white just like a **map's scale bar**. That gives the filter its visual language.

### Hero composition

**Desktop (`/ar/`), on sand paper #F4F1EA (navy on it is about 12 : 1, calculated):**

```
[ EN gloss column ~26vw ][ SPINE ~20vw ][ AR main column ~54vw ]
  set flush to the spine     IMG_6374      set flush to the spine
                             slit crop     section mark «أ» at top
                                           headline, 3 lines
                                           [WhatsApp] [Browse fleet]
                                           red Ruqʿah margin note
```

- **The spine:** IMG_6374 as a tall slit, cropped to x 36–64 % and y 0–84 % (about 1:2).
  - The white mast runs up the middle.
  - The TEREX counterweight sits at the bottom like a base.
  - The watermark (bottom centre, y 86 % and below) is cut off. Manufacturer names are fine (audit).
- **Arabic column (main):**
  - The section mark «أ», which is also the first letter of أطلس.
  - The headline «من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة», set in Markazi Text 700 at about 96 px with line-height 1.3, **flush against the spine**.
  - Under it: [واتساب] and [تصفّح الأسطول].
  - Beside the WhatsApp button, a red **margin note in Ruqʿah**: «شنو الرافعة اللي يحتاجها مشروعك؟», their own sentence, as if someone at Atlas had annotated the file.
- **English column (gloss):** the English tagline in Markazi Text (Latin) 600 at about 34 px, also flush against the spine.
  - Both scripts' line endings meet the mast from opposite sides.
  - Each language reads *toward the crane*.
- **`/en/`:** the same spread, but **the English column takes the main width on the left and the Arabic narrows to a gloss on the right**. The spine sits at about 54–74 % across. Arabic always stays on the right, the convention of bilingual contracts. Only the emphasis changes.

**First 2 seconds (both languages)**

| Time | What happens |
|---|---|
| 0 ms | Paper, header, headline, gloss and buttons are painted. **The headline is the LCP element and does not animate.** A document is already printed. |
| 0–900 ms | **The mast rises:** the slit opens from the bottom up (a clip-path reveal, power3.out). The counterweight appears first and the sky last. |
| 600–1300 ms | Under the slit, the plate caption «لوحة 1 · Terex AC200-1» wipes **right to left**, and "Plate 1 · Terex AC200-1" wipes **left to right**. Each script is revealed in its own reading direction. |
| 1300–2000 ms | The red Ruqʿah note fades in with a 6 px rise. |

**Mobile:** the spread becomes one column.
- The Arabic headline goes full width, then the spine as a full-width plate (IMG_6374 at 4:5, x 27–73 %, y 0–84 %), then the English gloss in smaller type.
- The language swap is a crossfade.

### Signature interaction, part 1: "The Mast Gauge" (section ب, capacity)

1. The spine moves to the page centre. Arabic captions sit on its right and English captions on its left.
2. **The section pins** (about 300 vh for 4–5 cranes). The spine shows the smallest *confirmed* crane as a portrait plate, every crop cut at 84 % height or less.
   - A vertical rail of **red rhombic dots** runs up each inner edge of the spine.
   - The rhombus is the calligrapher's measuring *nuqta*, and it is also the diagonal of the chevrons.
   - Each dot is 10 t, and a digit label sits every 50 t **on the spine**, shared by both languages.
3. **Scrolling fills the dots from the bottom up** to that crane's capacity.
   - The spine numeral rolls to the value, set in Atkinson Hyperlegible Mono at about 120 px.
   - **The units sit on either side of the number:** «طن» on the Arabic side and "t" on the English side. It reads as a balanced scale: `t 350 طن`.
4. **Captions wipe in their own reading directions:**
   - Arabic: model (mono) and type («رافعة لكل التضاريس»), right to left.
   - English: "All-terrain crane", left to right.
5. **Next stop:** the following crane rises into the plate from below, and the dots keep filling upward.
6. **The top:** the largest confirmed crane. In the material we have, that is the GMK6350, IMG_6389, with "350 TON" printed on its boom.
   - The rail is full.
   - «لكل مشروع رافعته المناسبة / Every project has the right crane» is set across the spine.
   - The pin releases into the services section.

**Data rule:** dots fill only to confirmed values. Unconfirmed cranes appear in the fleet plates but stay off the gauge.

### Signature interaction, part 2: "The Slew" (language switch, desktop and tablet ≥ 1024 px)

1. The visitor taps "English" in the header. It is a real link to `/en/`, so both pages can be crawled.
2. A **cross-document View Transition** runs.
   - **The spine** (`view-transition-name: spine`) glides about 28 vw across the page in 800 ms with a heavy ease, **like a crane slewing**.
   - The columns crossfade. Morphing the text would scale it as images and blur it, so it isn't morphed.
3. On arrival, `html[dir]` has flipped, the header has mirrored, and the main and gloss roles have swapped.
4. Browsers without cross-document view transitions, and reduced-motion visitors, get an instant page swap. Chromium and Safari support the transition.

### How Arabic and English type relate

| Role | Family | Weights | Size / line-height | Why |
|---|---|---|---|---|
| Arabic display | **Markazi Text** (variable 400–700) | 700 hero, 600 headings | hero clamp(44px, 6.4vw, 104px) / 1.3; H2 44–56 / 1.35 | **Naskh is the voice of official Arabic documents.** Tenders and letters across the region are set in Naskh-style faces, so Naskh reads as "the file". Markazi is a contemporary, readable Naskh with moderate contrast and no liturgical feel. |
| Arabic body | **Markazi Text** | 400, 500 | 20 / 1.8 desktop, 19 / 1.75 mobile; measure 50–65 characters | It is the same family, so the display and body sizes share the same tone. The Arabic is small on the em, so it needs 20 px. |
| Latin display and body | **Markazi Text (Latin)** | 600 display, 400 body | display 34–64 / 1.1; body 17 / 1.55 | **One family designed as a bilingual pair** in a University of Reading and Google project: Arabic by Borna Izadpanah under Fiona Ross, Latin by Florian Runge, "echoing" the Arabic **[checked today]**. Both sides of the spine have the same weight and contrast. |
| Mono / data | **Atkinson Hyperlegible Mono** (variable 200–800) | 500 labels, 700 numbers | numbers up to 120 px; legend caps 13 px +0.08em | Built for legibility (Braille Institute). Model codes mix letters and digits (CKE2500, AC200-1), so telling 0 from O and 1 from I matters when a buyer copies them into a tender. |
| Voice accent | **Aref Ruqaa** | 700 | 22–28 px | **Ruqʿah is everyday Arabic handwriting**, which echoes the hand-lettered logo. Used *only* for the 2–3 dialect lines Atlas already wrote, always in red on paper. Loaded lazily after LCP and subset to those strings. |

- **Paragraph pairs:** each Arabic paragraph and its English counterpart share one CSS grid row, so they **start at the same height**, like clauses in a bilingual contract. They don't line up line by line, because the leading differs between scripts.
- **Preloads:**
  - `/ar/`: Markazi Arabic (40 KB), Markazi Latin (25 KB, because the gloss is visible in the hero), and Atkinson Mono (17 KB). Three files, 82 KB.
  - `/en/`: the same three.
- **Fallback:** if Markazi's Latin looks too plain at display size in the day-1 test, swap Latin display to **Source Serif 4** (opsz 8–60) and keep Markazi for everything else.

### Numbers
- **Western digits are the one bilingual word.** They live on the spine, with units on each side: «طن» / "t", «م» / "m".
- **Section ordinals use Abjad letters in Arabic:** «أ ب ج د هـ و ز», the order of أبجد هوز. Arabic tender clauses are numbered this way. English uses the legal equivalent, (a)–(g). The fifth letter is written **«هـ»**, the standard way to keep it from being read as a word.
  - Letters are assigned at build time from the *visible* sections. If documents are hidden, contact takes the next letter, and the sequence never has a gap.
- **Plate numbers** use digits: «لوحة 4» / "Plate 4".
- **Dates:** dd/mm/yyyy in Arabic, "3 Nov 2026" in English. **Decimals:** a point.

### Section flow (9)
1. **Header, "Index":**
   - The badge, then «أطلس الصحراء» in Markazi 700, with "ATLAS ALSHRAA" in Atkinson Mono caps.
   - The navigation is the Abjad index.
   - The language link is written in the target language.
   - WhatsApp.
2. **أ Hero:** the title spread.
3. **ب Capacity:** the Mast Gauge.
4. **ج Services, a "Legend" (مفتاح):**
   - Four legend entries. Each has a simple line pictogram and a bilingual name with Arabic and English sharing a row, plus 2–3 lines of copy (pending).
   - Handling and rigging uses IMG_6364 (the sling).
   - The pictograms for oil services (a derrick) and heavy transport (a low-bed) are inspired by the logo's drawings and need Atlas's approval. There are no photos for those services, and no stock.
5. **د Fleet, "Plates":**
   - Portrait plate cards. Each **spec row is mirrored**: the Arabic label on the right, the number in the centre, the English label on the left.
   - **The filter is a scale bar:** alternating red and white segments, like the outrigger chevrons and like a map scale. Each segment is a capacity band (`<button aria-pressed>`), ordered small to large in reading direction, plus "All".
   - Every card has «اطلب هذه الرافعة / Request this crane», which opens WhatsApp with the model filled in.
6. **هـ Sites, "Two spreads":**
   - Construction site and coast. Each spread is one large plate plus 3–4 small ones, captioned with model names only.
   - Moving between spreads follows **book binding**: the next spread comes from the left in Arabic and from the right in English.
   - Native horizontal scroll-snap does this for free under `dir="rtl"`.
7. **و Documents, "Appendix":**
   - Hidden until data exists.
   - The structure follows the public prequalification list: inspection certificates, HSEQ/ISO, company profile, references.
   - It shows only documents Atlas actually holds, each with issuer and validity date.
8. **ز Contact, "Request form":**
   - Bilingual labels: «وزن الحمولة · Load weight (t)», «نصف قطر العمل · Radius (m)», «ارتفاع الرفع · Lift height (m)», date, city, name, phone.
   - Digit conversion on every number field.
   - WhatsApp is the primary button and builds the message in the page's language.
   - A Ruqʿah margin note beside it: «خلي الباقي علينا».
9. **Footer, "Colophon":**
   - The full legal name in Arabic and English, the email **[fact]**, and contact details once supplied.
   - The typefaces credited, and "photographs taken 3 Nov 2026" (EXIF **[fact]**).

### Mobile
- One column, read in pairs: Arabic line, then a small English gloss line.
- Spec rows stack: «قدرة الرفع 350 طن» on one line, "Max capacity · 350 t" beneath it.
- **The Mast Gauge still works:** a single column pins cleanly. The dot rail runs along the start edge of the plate, and the number sits above it.
- The bottom bar has WhatsApp and Call.

### Reduced motion
- The plates appear as a static list, each with its own gauge already filled.
- No slit reveal, no wipes, no view transitions (`@view-transition { navigation: none }` under reduced motion).
- Smooth scrolling is off.

### Borrowed principle
From **Mophradat** (mophradat.org, site by **mgmt. design**). Their case study describes "a bifurcated site with a vertical line that can be pulled to either side to reveal the chosen language", with the other language "always visible on the side" **[checked today: the case study and that the site exists; I could not confirm the split view is still live]**.
- **We borrow:** both languages are always present, and the divider is the language control.
- **We add:** the divider is a real crane boom, the numbers live on it, and switching languages makes it slew.
- **Secondary source:** Mind the gap's Sursock Museum stationery, where margins switch sides "to indicate the alternation between Arabic and Latin scripts". This is the logic behind setting each language flush to the spine.

### Risks
1. **About 40 strings need both languages:** headlines, labels and buttons. That means more approvals, and a half-translated gloss would hurt trust. Freeze the string list on day 2.
2. **The calm, editorial look could read as "museum".** Counter it with large plates, the red scale bar and hard numbers. Test it on one Libyan site manager, not only on procurement.
3. Markazi's Latin may look plain at display size. The Source Serif 4 swap is ready.
4. Cross-document view transitions are not supported in every browser. The fallback is a normal page swap.
5. Each page contains both languages. Mark every gloss span with `lang`, set hreflang, and keep the main content in the page's own language.
6. Portrait plates of centred subjects need clean exports. Until then, every crop stops at 84 % height or less.
7. The Ruqʿah note may look too informal. It can be removed without breaking anything.

### Build plan (10 working days)

| Day | Work |
|---|---|
| 1 | Tokens and fonts. **Spread prototype plus a cross-document view-transition test.** Markazi display test (Latin swap decision). |
| 2 | `/ar/` and `/en/` skeleton, paired-paragraph grid, number and Abjad helpers. **Freeze the bilingual string list.** |
| 3 | Hero spread, slit crop, caption wipes, mobile pairs. |
| 4–5 | Mast Gauge (pin, dot rail, odometer, plate wipes), the Slew, reduced-motion version. |
| 6 | Legend pictograms and fleet plates with the scale-bar filter and WhatsApp prefill. |
| 7 | Spreads, appendix (behind the flag), request form. |
| 8 | Copy, SEO (hreflang, JSON-LD), GA4. |
| 9 | Lighthouse, axe, devices, bidi edge cases. |
| 10 | Client fixes and deploy. |

### Self-score
- **Uniqueness: 8.** The bilingual split has a precedent; a boom as the split, with shared numbers, does not.
- **Buyer clarity: 9.** It looks like the technical file the buyer has to assemble anyway.
- **10-day feasibility: 8.** Light fonts, a light hero image, and a direction-neutral photo.

---

## Side by side

| | A «مَدّ» | B «أطلس» |
|---|---|---|
| Direction | Horizontal, follows reading direction | Vertical lift plus a bilingual spine |
| Mood | Cinematic, kinetic, heroic | Calm, documentary, authoritative |
| Strongest with | Site and project managers on phones | Procurement teams forwarding links |
| Hero photo | Different per language (6359 / 6380) | Same for both (6374) |
| Numbers | Odometer readout on a horizon line | The shared word on the spine |
| Hardest part | Kashida craft and the hook mapping | Bilingual copy volume |
| First-paint fonts / hero image | ~100 KB / ≤220 KB AVIF | ~82 KB / ~70 KB (a narrow slit) |

**My recommendation:** **B**, for the buyer the brief describes, because it matches how Libyan oil and gas procurement actually works. The two concepts can be combined in one direction: B's hero could use A's kashida once, in «للكبيــرات» flush to the spine, as a single gesture without the hook alignment. Don't mix them further, or both ideas weaken.

## Questions for Atlas that change the typography
1. Approval of a typed lockup (badge plus «أطلس الصحراء» set in type), and whether a kashida may ever touch the name.
2. The preferred English spelling (ALSHRAA / Al-Sahraa).
3. Approval of each dialect line, and whether they say «رافعة» or «كرين» to customers, and «مجنزرة» or «زاحفة» for crawlers.
4. **The fleet sheet** (model, type, confirmed maximum capacity, owned or partner). Both signatures depend on it.
5. Clean photo exports without the watermark (unlocks centred portrait crops and the aligned coastal horizons).
6. Whether the Kobelco CKE2500 is theirs.
