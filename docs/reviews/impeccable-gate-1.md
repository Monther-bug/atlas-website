# Impeccable gate 1: review of the static site

- **Date:** 4 November 2026
- **Branch:** `task/I1`, based on `feat/site-build` at `f504b05` (all Part C sections merged; motion, Part D, not built yet)
- **Skill:** Impeccable 4.8.0 (`.claude/skills/impeccable`), engine 0.1.18. The `/impeccable` commands were not invocable from the gate session, so `reference/critique.md`, `reference/audit.md` and `reference/craft-floor.md` were followed by hand. The detector ran from the CLI (`npx impeccable detect`).
- **Build under review:** `npm run build` (staging: 19 unverified items with draft badges, 5 AR / 6 EN `[[CONFIRM]]` tokens, all expected). Preview: `vite preview` on port 4198.
- **Evidence:** real Chrome screenshots (puppeteer-core) at 1440×900 and 390×844 for every target, plus extra checks at 320, 360×640, 390×664, 412×780, 640, 744×1133, 768, 844×390, 1024, 1280, 1366×657, 1440×790 and 1536×730. Screenshots are kept out of git, in `.work/shots/before` and `.work/shots/after`.

**Method:** Assessment A ran in an isolated sub-agent. It did the design review with no detector output. Assessment B, the detector plus browser evidence, ran in the parent only after A had returned.
- This is not the reference's "two parallel sub-agents" form, but A stayed isolated from the detector.
- The live-server overlay (`[Human]` tab) was **not** injected. The run was headless with no user browser, so no visual overlay exists. The detector's URL scan stands in for it.
- Critique snapshots were not written to `.impeccable/critique/`; this file is the archive.
- The critique's closing questions to the user were not asked. The gate runs as a delegated agent with no user channel, so the decisions are listed in "Open decisions for the client" below for the coordinator to relay.

**Instructions from the controller during the gate (4 Nov):**
1. The fixed RequestBar covering the hero's «تصفّح الرافعات» at 1440×900 is a P1. Fix it at bar or band level and keep the bar laid out for the Part D dock.
2. A full hero redesign starts on a separate branch. Do **not** restructure the hero layout. Fix only hero P0s that are pure a11y/contrast bugs, and write the hero critique in full as input for the redesign.

**Approved decisions not "fixed" here:**
- the hero photo box grows past 74/60 svh to keep the sling inside the photo;
- the off-centre clamped sling on tall Arabic tablets;
- Western digits;
- the Hoist is a single column below lg;
- brand colours, logo, square corners, no yellow;
- the oversized readout (spec §15.9);
- `[[CONFIRM]]` tokens and draft badges in staging.

---

## Result at a glance

| | Before | After |
|---|---|---|
| Audit P0 | 0 | 0 |
| Audit P1 | 2 (bar over hero; AR logo link label-in-name) | **0** |
| Critique P1 | 2 (bar over hero; hero H1 misses the first screen on laptop windows) | 0 in gate scope. **1 handed to the hero redesign** (H1 first screen, see "Deferred") |
| P1 from the critique, downgraded in synthesis | "Request this crane" gives weak feedback | P2; partly fixed (see the grid section) |
| axe (wcag2a/aa/21aa/22aa + best-practice), both pages × 320/390/768/1024/1440 | 1 serious (AR, all widths) | **0** |
| Detector `src/` | exit 0 | exit 0 |
| Detector rendered `/` and `/en/` | exit 2 (6 + 6 `buried-raster`) | **exit 0** |
| `npm test` · `tsc` · `npm run build` | build ok (tests not run before the first edit) | 330 pass · ok · ok |

Audit health score: **15/20 (Good)** before, **17/20 (Good)** after.

---

# Part 1: Critique (Task I1.2, Step 2)

Scores are Assessment A's (isolated design review). They are Nielsen heuristics, 0–4. For a Persuade surface, heuristics 7 and 10 are n/a and the total is renormalised. The severity column is the final synthesis. Where synthesis changed A's severity, the reason is given.

| # | Heuristic | Hero (AR) | Hoist | Grid (EN) | Form (AR) | Bar + footer (EN) |
|---|---|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 2 | 2 | 3 | 3 |
| 2 | Match system / real world | 3 | 4 | 2 | 4 | 3 |
| 3 | User control and freedom | 3 | 3 | 3 | 3 | 3 |
| 4 | Consistency and standards | 2 | 2 | 2 | 3 | 2 |
| 5 | Error prevention | 3 | 3 | 2 | 3 | 3 |
| 6 | Recognition rather than recall | 3 | 3 | 3 | 3 | 3 |
| 7 | Flexibility and efficiency | n/a | n/a | n/a | 3 | n/a |
| 8 | Aesthetic and minimalist design | 2 | 3 | 3 | 2 | 2 |
| 9 | Error recovery | n/a | n/a | 3 | 4 | 3 |
| 10 | Help and documentation | n/a | n/a | n/a | 3 | n/a |
| | **Total** | **19/28 (68%) Acceptable** | **20/28 (71%) Good** | **20/32 (63%) Acceptable** | **31/40 (78%) Good** | **22/32 (69%) Acceptable** |

**Why some heuristics are n/a:**
- 7 and 10 are n/a on the Persuade surfaces. They were scored for the form, where autocomplete, the WhatsApp alternative and the inline hints apply.
- 9 is n/a for the hero and the Hoist, which have no error states.

**What the rendered detector found (Assessment B, before fixes):** 6 `buried-raster` per page, 4–5 `straggler` advisories and 1 `repeating-stripes-gradient` advisory. Each is examined in Part 3.
- None of them is specific to one target. The stripes are the draft badges in the Hoist and the grid. The stragglers are the grid intro, card explainers and form hints.
- The detector found nothing the design review had flagged, and the design review flagged nothing the detector did. The one detector failure (`buried-raster`) is a false positive.

---

## 1. Hero on `/` (Arabic, RTL): full critique for the redesign

Source: `src/sections/Hero.tsx`, `src/components/Sling.tsx`. Score **19/28 (68%), Acceptable**. Cognitive load: **3 failures (moderate)**.

### Design-specificity verdict
The sling is authored work no other company could reuse: the WhatsApp button hangs by two red legs from the real hook in Atlas's own photo.

Take the sling away and what is left is a category template: full-bleed photo, flat dark band, big bold H1, outline secondary button. Any crane-hire, scaffolding or logistics site could ship that unchanged.

On the first screen the bar's identical WhatsApp button sat beside the sling (fixed in this gate). That weakened the one idea that is truly Atlas's.

### What feels generic or traditional (input for the redesign)

**1. The composition is "photo on top, headline slab below".**
- The photo box and the navy band are two stacked rectangles that never touch.
- The H1 does not use the photo, and the photo does not frame the H1.
- It is the most common industrial-hero layout there is.

**2. The photo is mostly sky.**
- At 1440×900 AR, cloud and sky fill about 65% of the photo box, and the two booms are cropped mid-height.
- The machine, its scale and the "small to very large" range are not felt.
- The photo reads as "cranes exist", not as "this company has the right one".

**3. The claim is not shown.**
- The H1 says "from smaller cranes to the largest ones", but nothing on the first screen shows range: no tonnage, no 55 → 350 t, no comparison of sizes.
- The proof only starts in the Hoist, one to two screens later.
- The site's own best asset, the giant condensed tonnage readout, is absent from the hero.

**4. The sling is too small to carry the concept.**
- At 1440 the legs are about 45–60 px on screen. With no motion they read as a small red "A" above a button.
- The hook pin is a 14-unit circle. The real hook is a few dozen pixels.
- The thread the spec promises ("from the real hook in the hero … to the request") is not visible as a thread.

**5. The type is a stock "big bold sans" headline.**
- Archivo 800 in Latin and Kufi in Arabic, two lines, right-aligned in AR.
- The lead line at 0.55em is a sound hierarchy, but nothing in the setting is tied to lifting: no load-tag framing, no hanging line, no measured baseline.

**6. The band reads like a generic template.**
- The services line is a `·`-separated list in steel (تأجير الرافعات · النقل الثقيل · المناولة · الخدمات النفطية), a stock pattern.
- The outline "Browse cranes ↓" is the stock secondary button.
- At 1440×900 AR both sit below the fold (question (a)), so the band shows only the H1.

**7. Too many red calls to action, and the same action has different names.**
- First screen before the fix: header «اطلب رافعة», sling «راسلنا على واتساب», bar «واتساب».
- The same WhatsApp action carries two labels (راسلنا على واتساب / واتساب).

**8. The planned motion (spec §5.2) is a familiar intro reel.**
- photo scale 1.05 → 1;
- masked H1 lines rising;
- a button settling.
- Only the sling drawing down and the damped swing are specific to Atlas. If the redesign keeps one motion idea (spec §15.4), it should be the load: the hook lowering into place, with the H1 or the range readout as what it carries.

### What works (keep in the redesign)
- On AR desktop the sling is centred on the real hook. The legs read as rigging, and the eye moves from hook to H1.
- The Arabic band is composed for RTL, not mirrored. The H1 is right-aligned, the lead line sits at 0.55em, and the line-height is 1.3.
- Text sits on a solid navy band, never on the sky (spec §6).
- The image pipeline is good:
  - art-directed 16:9 and 9:16 crops;
  - AVIF 23–46 KB on mobile;
  - `fetchpriority="high"`;
  - the hook geometry is stored per crop.

### Priority issues
| Sev | Issue | Evidence | Status |
|---|---|---|---|
| **P1** | The fixed RequestBar sits on the hero on first paint | EN 1440×900: the bar (x 1095–1416, y 812–876) hides "ne." of "crane." in the H1. AR 1440×900: the bar (x 24–263, y 812–876) sits on «تصفّح الرافعات» (x 56–236, y ≥ 875). AR 390×664: only about 20 px of the H1 is above the bar. EN 390×664, 360×640 and 844×390 landscape: the sling button is under the bar. | **Fixed** at bar level (see Fixes) |
| **P1** | The H1 misses the first screen on real laptop and phone windows | 1366×657: 19 px of the AR H1 visible; EN shows neither the H1 nor the whole sling. 1440×790 (a 13″ laptop with browser chrome): the AR main line is cut at the fold. EN 390×664: the H1 starts at y 666. Cause: `slingClearance` (`Sling.tsx:58-60`) is width-driven (`100vw`), so short, wide windows get the tallest photo box. | **Deferred to the hero redesign** (controller: no hero restructuring in this gate) |
| P2 | (a) The services line and «تصفّح الرافعات» are below the fold at 1440×900 AR | The band shows only the H1. The word "hire" (تأجير) is not on the first screen. | Deferred to the redesign |
| P2 | (b) Between 600 and 767 px the H1 starts below the first screen | It is not English-only. AR 700×900: H1 at y 903. AR 640×900: y 840. iPad mini 744×1133: AR y 990, EN y 1179. Cause: the 9:16 crop is about 1.78 × width tall. | Deferred to the redesign (see recommendation (b)) |
| P2 | Three red CTAs on one screen; WhatsApp has two labels | Header, sling and bar. «راسلنا على واتساب» vs «واتساب». | The bar part is fixed. The label is a copy decision. |
| P3 | Static sling legs are tiny at 1440 | About 45–60 px on screen | Redesign |

**Persona red flags:**
- **Jordan (first-timer):** at 1366×657 sees cranes and a WhatsApp button but no words saying he can hire one.
- **Casey (one-handed phone):** at 390×664 EN, the sling was half under the bar (fixed), and both buttons went to the same place.
- **Riley (stress tester):** 844×390 landscape shows only sky, with the sling under the bar (the bar part is fixed).
- **Libyan site manager (phone, from WhatsApp):** the first screen is sky plus two WhatsApp buttons; the brand promise was under the bar.

**Questions for the redesign:**
- What if the first screen shows the range (55 → 350 t) and not only the claim?
- What if the hook, not a band, is what holds the headline?
- Does the hero need a secondary "Browse cranes" at all, if the hook line can run straight into the Hoist?

---

## 2. Hoist load stack on `/`

Source: `src/sections/Hoist.tsx`, `src/components/LoadTag.tsx`. Score **20/28 (71%), Good**. Cognitive load: **2 failures** (grouping on mobile; working memory across about 5,600 px).

**Specificity:** This is the most product-specific piece of the site.
- The white load tag carries a huge condensed tonnage and the label «أقصى حمولة».
- The honest footnote says the figure is the maker's rating at the shortest radius.
- A rigger would recognise the tag.
- But the layout repeats the same photo-plus-tag row five times. Nothing except the digits shows that 350 t is bigger than 55 t.

**Strengths:**
- The footnote is real error prevention: it stops capacity being misread.
- Tabular Western digits, models in mono, `<bdi>`.
- RTL composition with the tag at the inline end.
- A real `<ol>` with a screen-reader skip link.

**Priority issues:**
| Sev | Issue | Evidence / fix | Status |
|---|---|---|---|
| P2 | (c) The rope hangs from nothing below lg | Measured at 390 in both languages: all 5 ropes start 24 px below the photo's bottom edge (`LoadTag.tsx:10-12`: `mt-14` and a `h-14` rope above the tag, plus `gap-6` in the item). On static desktop the rope also hangs into empty navy. The motif loses its physical logic, and it is unclear which photo a tag belongs to. Fix: overlap the tag onto the photo (about `-mt-16`, zero gap). Start the rope inside the photo at the existing `data-hook-anchor` where the crop has a hook; otherwise start it at the photo edge with a small red plate, the hero-pin language. Raise the item gap from `gap-24` to `gap-32`. | Recommended (P2; it also touches Part D's touch "tag drops on a rope" beat) |
| P2 | The mobile stack is long | 5,592 px of a 17,357 px AR page at 390 (about 895 px per crane). Photo and number never share one 390×664 screen. The grid then repeats the five cranes (3,633 px). Fix: overlapping tag, and a compact tag with readout and model on one row; aim for 600 px or less per crane. | Recommended |
| P3 | The unit «طن» / "t" is red text (`LoadTag.tsx:23`, `CraneGrid.tsx:161`) | Spec §6 keeps red for rope, hook, sling and primary buttons. Use navy. | Recommended |
| P3 | Two names for one attribute | "Class / الفئة" in the Hoist (`en.ts:70`) and "Type / النوع" in the grid (`en.ts:128`) | Copy decision |
| P3 | Desktop tag widths vary (397/456/496 px), so the ropes don't line up | Give the tag a fixed width | Recommended |

**Persona red flags:**
- **Casey:** about 4.5 screens of scrolling before the first request action; the Hoist has no per-crane action.
- **Jordan:** can't tell whether a tag belongs to the photo above it or below it.
- **Procurement (desktop):** works well.

---

## 3. Crane grid and filters on `/en/`

Source: `src/sections/CraneGrid.tsx`, `src/sections/crane-filters.ts`. Score **20/32 (63%), Acceptable**. Cognitive load: **1 failure** (two CTAs per card × 5, plus the bar).

**Specificity:** Mostly a generic card grid with filter chips. Only two things tie it to the crane world:
- capacity is the largest element on the card;
- the "On the hook" chip.

**Strengths:**
- Capacity is clearly the hero of each card.
- The count is a polite live region, keyed so a repeated count is still announced.
- Chips use `aria-pressed`.
- Chips list only the types on show, so dead-end filters can't happen.
- The empty state from spec §15.8 is designed: "No cranes match this filter" plus "Show all".

**Priority issues:**
| Sev | Issue | Evidence / fix | Status |
|---|---|---|---|
| **P2** (A: P1) | "Request this crane" gives weak feedback on the card | The button sets the crane on the hook (`CraneGrid.tsx:173-185`) and nothing else visibly changes on the card except a 1 px red border. Confirmation appears in the bar: about 700 px away at 1440, and on phones the bar chip truncated the model ("On the hook: GMK…"). **Synthesis downgrade:** this is the behaviour spec §5.5 asks for. The bar chip plus the polite live region ("On the hook: Grove GMK6350") confirm it, and the next step (WhatsApp) sits next to the chip. Part D's chip flight is the designed link from card to bar. Fix proposal: on the card itself, show a selected state ("On the hook" with the hook icon) and let a second press clear it. This needs a copy line from the deck. | **Partly fixed:** the bar chip no longer truncates the model on phones (see Fixes). The card state is recommended for Part D and copy. |
| P2 | Two actions per card set the same state but behave differently | The button stays put; the link scrolls to the form. That makes 10 actions and 5 solid red buttons in one section. Fix: one red action per card, plus the form link. | Recommended |
| P3 | The intro promises "Filter by type or capacity", but the capacity chips are gated until capacities are verified (`crane-filters.ts:21`) | Say "Filter by type" until the bands appear | Copy decision |
| P3 | The hook icon is drawn off-centre (x 4–12 of a 24 viewBox, `Icons.tsx:46-52`) | It reads as a "J", or close to «ل» | Recommended |
| P3 | At xl, 5 cards in 3 columns leave an empty slot | | Acceptable now |

**Persona red flags:**
- **Jordan:** taps "Request" and nothing visible happens on the card.
- **Riley:** tapping the same card twice does nothing, and the crane can only be cleared from the bar.
- **Procurement:** no proof (certificates) on cards yet. Expected: the documents section is gated.

---

## 4. Request form on `/` (Arabic)

Source: `src/sections/RequestForm.tsx`. Score **31/40 (78%), Good**. Cognitive load: **3 failures**:
- the two required fields are buried;
- the crane select has 10 options;
- all 11 fields show at once.

**Specificity:** The content is specific:
- hints that explain radius and lift height;
- طن / م units;
- Arabic-Indic digits accepted;
- Atlas's own dialect heading «شنو الرافعة اللي يحتاجها مشروعك؟», with the lead line below it (spec §15.1).

The visual form is generic stacked fields on dark, which is appropriate here.

**Strengths:**
- The error summary takes focus and links to each field.
- The messages say what is wrong and how to fix it.
- The failure state keeps the data and offers WhatsApp or email.
- The crane select stays in sync with the bar chip.
- `inputMode="decimal"` on the measurements.
- The phone field is `dir="ltr"` but aligned to the right.
- `autocomplete` is set.

**Priority issues:**
| Sev | Issue | Evidence / fix | Status |
|---|---|---|---|
| P2 | The submit label sat off-centre, about 9 px above and 26 px below, in both languages | The idle and loading labels used `` `[grid-area:1/1]${…}` ``. Tailwind's scanner never compiled that class, so the two labels stacked in two rows. | **Fixed** (`Button.tsx:133-138`); measured after: 19.5/19.5 px at 1440, 17.5/17.5 px at 390 |
| P2 | The contact email link was 25 px tall (spec §8: 44 px) | `RequestForm.tsx:74` | **Fixed** |
| P2 | The required fields are buried | Phone is the 3rd field and weight the 5th, among nine «اختياري» tags; the form is 2,941 px tall at 390. Fix: open with Phone, Load weight and Crane, then put the rest behind «أضف تفاصيل أكثر (اختياري)», and mark only the required fields. | Recommended (structure and copy) |
| P2 | With no form endpoint, submit sends the same tab to wa.me (`:189`) | Back may drop the entries if the page is not restored from the back/forward cache | Recommended: check on real phones |
| P3 | The left column ends about 1,300 px before the form on desktop | `lg:sticky lg:top-24 self-start` | Recommended |
| P3 | Field errors are white text marked only by weight and the red-bright border | Add the SVG alert icon (`RequestForm.tsx:577`) | Recommended |

**Persona red flags:**
- **Casey:** 11 fields on a phone.
- **Jordan:** «اختياري» appears nine times, though the hints help.
- **Site manager:** will use the bar's WhatsApp instead, and that is fine.

---

## 5. Request bar and footer on `/en/`

Source: `src/components/RequestBar.tsx`, `src/sections/Footer.tsx`. Score **22/32 (69%), Acceptable**. Cognitive load: **2 failures**:
- the email, the only confirmed contact channel, has the same weight as nav links;
- the footer has 10 links on a one-page site.

**Specificity:** The bar's "On the hook: GMK6350" chip is clever and belongs to this product. The footer is a generic four-column link footer. Its only tie to the brand world is the chevron outrigger pad, and with no rope reaching it (the progress rope is hidden until Part D) it is an orphan stripe.

**Strengths:**
- The chip's close control is 44 px, returns focus to WhatsApp and is announced.
- `scroll-padding-bottom` and the footer's `pb-28` keep the bar from hiding content.
- The desktop bar is compact at the inline end and carries the only shadow in the system.

**Priority issues:**
| Sev | Issue | Evidence / fix | Status |
|---|---|---|---|
| **P1** | The bar covers the hero on first paint | See hero issue 1 | **Fixed** |
| P2 | The chip truncated the model at 390 ("On the hook: RT7…") | It is the only confirmation a phone user gets | **Fixed:** below `sm` the hook icon stands for "On the hook:", which stays as screen-reader text (`RequestBar.tsx:60-62`) |
| P2 | The mobile bar is unbalanced | A single button at the inline end leaves about 60% of the bar empty. In Arabic the main action lands bottom-left, the far reach for a right thumb. Fix: below lg make the buttons `flex-1` (WhatsApp full width now; 50/50 with Call once a phone number exists). | Recommended (spec only fixes the desktop layout) |
| P2 | The footer email breaks mid-word at 1440 ("…@gmai / l.com", 181 px column) | `Footer.tsx:66-70`: make the column `md:col-span-3`, drop `break-all`, add `<wbr>` after "@" | **Handed to the integration agent:** `Footer.tsx` is reserved for it in this phase |
| P3 | All four Services links point to `#services`; "On this page" repeats the header nav; the chevron pad (`Footer.tsx:129`) has no rope | Collapse the footer to brand plus tagline, contact and back-to-top; draw a short static rope or hide the pad until Part D | Recommended |
| P3 | "Atlas Alshraa · For oil services" (`en.ts:331`) reads as a broken phrase | Copy deck §11 | Copy decision |
| P3 | The desktop bar text "Ask us about a crane" is static text inside a box that looks like a button | | Recommended |

**Persona red flags:**
- **Riley:** the footer name phrase.
- **Procurement:** the email, the only channel, broke mid-word.
- **Casey:** thumb reach in Arabic.

---

## Open decisions for the client

**(a) 1440×900 Arabic: the services line and «تصفّح الرافعات» fall below the fold.**
- On its own, at that nominal size, this is **P2**.
- But 1440×900 is a screen, not a browser window. At 1440×790 the Arabic H1 itself is cut, and at 1366×657 only 19 px of it shows, which makes the real problem **P1**.
- Recommendation for the hero redesign:
  - guarantee a minimum band (H1 + services line: about 13 rem desktop, 10 rem mobile);
  - cap the photo box at the window height minus that band;
  - when the cap applies, trim sky by moving the crop's `object-position` up, with matching anchor maths in `slingGeometry`, rather than losing the hook;
  - if the hook still won't fit, use the existing no-sling fallback (the WhatsApp button in the band).
  - Add 1366×657 and 1536×730 to the QA sizes.

**(b) 600–767 px: the hero photo pushes the H1 below the first screen.**
- It happens in both languages: AR 640×900 → H1 at y 840; iPad mini 744×1133 → AR y 990, EN y 1179.
- **P2**: few visitors are at that width, but the whole message is lost there.
- Recommendation (a crop decision, not done here): switch to the existing 16:9 desktop crop from 600 px (`min-[600px]` instead of `md`). Its hook points already exist and its height is about 0.56 × width, so no new asset is needed. A 4:5 tablet crop is the fallback option.

**(c) Mobile Hoist: the rope hangs from empty space.**
- Measured: 5 of 5 items at 390 in both languages. The rope starts 24 px below the photo edge.
- **P2**. Recommendation: Hoist issue 1 (overlap the tag onto the photo; start the rope at the hook anchor or at a red plate on the photo edge).

**Bar over «تصفّح الرافعات» (coordinator's finding):** confirmed.
- AR 1440×900 is flush: the bar's bottom edge meets the button's top, a 1 px overlap.
- EN 1440×900 is worse: the bar hides the last word of the H1.
- No overlap at 1920×1080.
- Fixed at bar level (see Fixes).

---

# Part 2: Technical audit of both pages (Task I1.2, Steps 3 and 5)

**Checks:**
- axe-core 4.14 (wcag2a/aa/21a/21aa/22aa + best-practice) on `/` and `/en/` at 320/390/768/1024/1440, and again scrolled past the hero with the bar shown;
- horizontal overflow;
- interactive targets under 44 px;
- 200% text-only scaling at 390/640/1280;
- computed font sizes;
- built bundle sizes;
- a grep for hard-coded colours;
- the rendered detector.

## Audit health score

| # | Dimension | Before | After | Key finding |
|---|---|---|---|---|
| 1 | Accessibility | 3 | 3 | Before: 1 serious axe violation (WCAG 2.5.3) and a bar over the hero. After: 0 axe violations; text-only 200% scaling (P2) remains. |
| 2 | Performance | 3 | 3 | JS 99.6 KB gz (budget 110), CSS 8.4 KB gz (budget 25). Lighthouse mobile LCP about 3.45 s against a 2.0 s budget (see LCP notes). |
| 3 | Theming | 3 | 4 | Tokens only: the palette is cleared, so stray colours don't compile, and the browser surfaces are themed. The inline chevron gradient moved into a class. `text-ink/75` is used 8× (a muted-ink token would be cleaner, P3). |
| 4 | Responsive | 3 | 3 | No overflow from 320 to 1440, and targets are 44 px or more after the fix. Hero first-screen issues are deferred; the header under text-only scaling is P2. |
| 5 | Implementation integrity | 3 | 4 | Coherent and product-specific. Before: an uncompiled Tailwind class on the submit button, and the detector's `buried-raster` hit. After: detector clean. |
| | **Total** | **15/20 Good** | **17/20 Good** | |

**Implementation integrity verdict: pass.**
- The system is specific to Atlas: the hook/sling geometry from per-crop hook points, the load tag, the chevron draft state, the truth-gated data and the composed RTL.
- No icon-tile cards, no gradients or glass, no eyebrows, no section numbers.
- Only one shadow (`shadow-bar`), square corners and SVG icons.

## Findings by severity (before the fixes)

**[P1] The RequestBar covers hero content on first paint**
- **Location:** `src/components/RequestBar.tsx:27` (fixed `bottom-0` / `lg:bottom-6 lg:end-6`).
- **Category:** Responsive / Accessibility.
- **Impact:** hides part of the EN H1 at 1440×900 and sits on «تصفّح الرافعات» in AR. On phones it covers the sling button (390×664, 360×640, 844×390).
- **Standard:** WCAG 2.4.11 Focus Not Obscured (the band button can receive focus under the bar).
- **Status: fixed.**

**[P1] The Arabic logo link's accessible name does not contain its visible text**
- **Location:** `src/sections/Header.tsx:68`, copy `src/content/ar.ts:23`.
- **Category:** Accessibility (axe `label-content-name-mismatch`, serious, every width).
- **Impact:** a speech-input user saying the visible name "Atlas Alshraa" can't activate the link. It also breaks the spec §1 success criterion of zero serious axe violations.
- **Standard:** WCAG 2.5.3 Label in Name (A).
- **Status: fixed.**

**[P2] The submit button label sat off-centre**
- **Location:** `src/components/Button.tsx:134-135` (class `[grid-area:1/1]` in a template literal was never compiled).
- **Category:** Implementation integrity. **Status: fixed.**

**[P2] The contact email link was 25 px tall**
- **Location:** `src/sections/RequestForm.tsx:74`.
- **Category:** Responsive.
- **Standard:** spec §8 (44 px); WCAG 2.5.8 passes at 24 px.
- **Status: fixed.**

**[P2] The bar chip truncated the crane model on phones**
- **Location:** `RequestBar.tsx:33`. **Status: fixed.**

**[P2] Text-only 200% scaling: the fixed header pushes its controls off-screen**
- **Location:** `src/sections/Header.tsx:67` (row `h-[4.5rem]`, rem-sized badge, no wrap).
- **Category:** Responsive / Accessibility.
- **Impact:** with root text at 200% (Chrome Android text scaling, Firefox zoom text only), the menu button and language switch go past the edge of a fixed header at 390 and 640 px (overflow 122 px and 33 px), and so does "Request a crane" at 1280.
- **Standard:** WCAG 1.4.4 is met through page zoom (G142): reflow at 320 px is clean. So this is P2 robustness, not an AA failure.
- **Recommendation:** for large text, let the header row drop the typeset name first (`min-w-0` + `truncate`, or hide it under a container query) and keep the controls `shrink-0`.
- **Suggested command:** `/impeccable adapt`.
- **Status: open.**

**[P2] LCP over budget (Lighthouse mobile about 3.45 s against 2.0 s)**
- See "LCP notes". Category: Performance.
- **Status:** handed to the perf fix loop (coordinator: don't chase in this gate).

**[P2] Hero first-screen issues (a)(b)**
- **Status:** deferred to the hero redesign.

**[P3] Global `prefers-reduced-motion` kill (`animation-duration` / `transition-duration: 0.01ms !important`)**
- **Location:** `src/styles.css`.
- **Impact:** none today (only colour and the new bar fade). Review when Part D adds motion, so reduced motion keeps meaningful state changes.

**[P3] `text-ink/75` repeated across `CraneGrid`, `Sites` and `Documents`**
- A `ink-muted` token would remove the opacity-modifier pattern.

**[P3] The footer pad still uses the inline chevron style**
- **Location:** `Footer.tsx:129`. It should use the new `chevron-stripes` class for consistency.
- Left for the integration agent, who owns `Footer.tsx` in this phase.

**Patterns:** none systemic.
- Hard-coded colours: 0. The only hex in components is in a comment.
- Arbitrary colour utilities: 0.
- Targets: all 44 px or more after the fix.
- Mono only for model codes and data.

**Positive findings:**
- the cleared Tailwind palette;
- themed `::selection`, caret, scrollbar and accent;
- the focus ring follows the ground;
- tabular numerals in data;
- real lists;
- a live region with a keyed count;
- `<bdi>` around models, phone numbers and email;
- `hreflang` on the language switch;
- the truth gate and draft badges.

## Fixes made in this gate (file:line in the final tree)

1. **P1, bar over hero:** `src/components/RequestBar.tsx:11-34` adds `useOverHero()`, an IntersectionObserver on `#top` with a −72 px top margin for the header. Line 52 adds `data-over-hero`, and the bar gets `transition-[opacity,visibility] duration-300`.
   - The CSS rule `.js [data-request-bar][data-over-hero] { visibility: hidden; opacity: 0 }` is in `src/styles.css:261-264`.
   - The bar waits while any part of the hero is on screen and appears once the hero has scrolled under the header.
   - It uses **visibility and opacity, not `display: none`**, so it stays laid out for Part D's sling-to-bar dock (D.4 can read `[data-over-hero]` or replace the hook).
   - Prerendered HTML ships the attribute, so with JS there is no flash of the bar on first paint. Without JS (`html.js` absent) the bar is always shown.
   - Hidden means out of the tab order and the accessibility tree.
   - Verified on `/` and `/en/` at 1440×900, 390×844 and 1366×657: hidden at the top, visible once the hero is past, hidden again on return. axe is clean with the bar visible.
   - Tests: `src/components/RequestBar.test.tsx:82-127` (prerender attribute; toggle on intersect; no hero means shown).
2. **P1, label in name:** `src/content/ar.ts:23` now reads `homeLabel: 'أطلس الصحراء Atlas Alshraa، العودة إلى أعلى الصفحة'`. The accessible name now holds both visible names.
   - This deviates slightly from copy deck §2 (Logo link `aria-label`). The deck should be updated to match. EN already passes ("Atlas Alshraa, back to top").
3. **P2, submit label off-centre:** `src/components/Button.tsx:133-138` uses whole-word `col-start-1 row-start-1` classes. The tests in `src/components/components.test.tsx:75-103` were updated: they had asserted the class that never compiled.
4. **P2, email target:** `src/sections/RequestForm.tsx:74` adds `inline-flex min-h-11 items-center`.
5. **P2, chip truncation:** `src/components/RequestBar.tsx:60-62`. "On the hook:" is `max-sm:sr-only`; the hook icon stands for it on phones.

## Won't fix, and deferred, with reasons

| Finding | Decision | Reason |
|---|---|---|
| Hero H1 / band below the first screen on laptop windows (P1), (a), (b), the three-CTA hierarchy, the small static sling | **Deferred to the hero redesign** | Controller instruction (4 Nov): the hero is being redesigned on a separate branch; no hero restructuring in this gate. The critique above is the redesign's input. |
| "Add a capacity range visual / colour the tonnage bands" (any suggestion that adds a hue) | Won't fix | Spec §6: tokens only, no yellow, red only for rope/hook/sling/primary buttons |
| Rounded or softer buttons and cards | Won't fix | Spec §6: 0–2 px radius, square corners |
| A second signature shape or icon tiles to "enrich" services and footer | Won't fix | Spec §6 and §15: one signature shape (the hook); craft-floor ban on icon-tile scaffolds |
| Eyebrow or kicker labels to add hierarchy | Won't fix | Spec §15.1 (Impeccable ban) |
| `repeating-stripes-gradient` advisory (chevrons) | Kept | Spec §6: the red/white chevron is the brand motif for draft and loading states and the footer pad |
| Footer email break, footer pad class | Handed over | `Footer.tsx` is reserved for the integration agent in this phase; P2 and P3 only |
| Hoist rope and stack length (c), card selected state, form progressive disclosure, mobile bar balance, header under text-only scaling | Recommended, not done | P2/P3: outside "fix every P0/P1". Several also change structure or copy that Part D or the client owns. |

## Re-audit after the fixes (Step 5)

- **P0: 0. P1: 0** in the gate's scope.
  - The one remaining P1 from the critique (the hero H1 missing the first screen on short laptop windows) is **open and handed to the hero redesign** by controller instruction. It is not fixed here.
- axe on both pages × 320/390/768/1024/1440: **0 violations**. Also 0 with the bar visible, at 1440×900, 390×844 and 1366×657.
- Horizontal overflow: 0 at every width.
- Targets under 44 px: none.

## LCP notes for the perf fix loop (observed, not changed)

**1. React 19 preloads the 77 KB `badge.png`.**
- The header `<img>` is eager, so React emits `<link rel="preload" as="image" href="/brand/badge.png">` ahead of the stylesheet.
- That is a 77 KB PNG for a 48 px badge.
- On Slow 4G it competes with the hero AVIF (mobile 9:16: 23–46 KB) and the three preloaded fonts (AR: Kufi 26 KB + Plex Arabic 16 KB + Archivo 55 KB).
- A 96/160 px WebP or AVIF badge (a few KB), or `fetchpriority="low"` on the header badge, would free that bandwidth.

**2. The hero image is found at parse time, but only after the header markup and the font and badge preloads.**
- It has `fetchpriority="high"` and `loading="eager"`.
- An `imagesrcset`/`media` preload for the two art-directed crops is the next lever.

**3. On narrow phones the LCP element may be the H1 text** (Kufi webfont, 26 KB) rather than the photo. Check in the Lighthouse trace before optimising either.

---

# Part 3: Detector scan (Task I1.3)

Engine: `npx impeccable detect` (CLI 4.8.0, engine 0.1.18). The rendered scans ran against `vite preview` on port 4198 (the same build as `npm run build`). The task's 4173 port was moved to 4198 to avoid clashing with the parallel sessions.

## Before

| Command | Exit | Findings |
|---|---|---|
| `npx impeccable detect src/` | **0** | none (78 files, regex rules only; the element rules need a parsed page) |
| `npx impeccable detect http://localhost:4198/` | **2** | 6 × `buried-raster`; advisories: 5 × `straggler`, 1 × `repeating-stripes-gradient` |
| `npx impeccable detect http://localhost:4198/en/` | **2** | 6 × `buried-raster`; advisories: 4 × `straggler`, 1 × `repeating-stripes-gradient` |

The contrast, heading-order and tiny-text rules ran on both rendered pages and found **nothing**.

## What each finding was, and what was done

**`buried-raster` (6 per page) was a false positive, but it was fixed in code, not ignored.**
- The detector reported "raster under a near-opaque gradient wash: `repeating-linear-gradient(135deg, var(--color-red) …)"\nsty`" on `body`.
- A minimal reproduction showed the rule matching **across two elements**: an inline chevron gradient on a draft badge (`style="background-image:repeating-linear-gradient(…)"`), followed in source order by the next `<img>` whose inline style carries the blur placeholder (`background-image:url(data:image/webp…)`).
  - Gradient then `url(` in two separate elements: flagged.
  - The same two in the opposite order: not flagged.
  - The gradient in a stylesheet class: not flagged.
- Nothing is actually buried. The gradient is a 12 px stripe inside the badge, and the placeholder sits under its own photo.
- **Fix:** the motif moved from an inline style to a class.
  - `.chevron-stripes` in `src/styles.css:255-258` and `CHEVRON_CLASS` in `src/components/stripes.ts:3-4`.
  - Used by `DraftBadge.tsx:14` and the Button loading strip (`Button.tsx:143`).
  - This also keeps the colour in CSS with the other tokens.
  - The footer pad (`Footer.tsx:129`) still uses the inline `CHEVRON_STRIPES`. No raster follows it in source order, so it does not trigger the rule. Switching it to the class is a P3 for the integration agent, who owns `Footer.tsx` now.

**`straggler` (advisory) was fixed.** Body copy (`p, dd, li`) gets `text-wrap: pretty` (`src/styles.css:78-83`). All 9 one-word last lines are gone in Chrome, Arabic included. Browsers without support ignore it.

**`repeating-stripes-gradient` (advisory, not counted) is kept, because the spec requires it.**
- The red/white chevron is the brand motif for draft and loading states and the footer pad (spec §6 "Motif: the red/white chevron, used only on the footer pad and draft/loading states", spec §4.3 DraftBadge).
- Advisories do not change the exit code, so no ignore entry was added and **no `.impeccable-ignores.md` was created**.
- No contrast, heading-order or tiny-text rule was ignored.

## After (final)

| Command | Exit | Output |
|---|---|---|
| `npx impeccable detect src/` | **0** | "78 files scanned with regex matching only (.css, .ts, .tsx)." No findings. |
| `npx impeccable detect http://localhost:4198/` | **0** | "0 anti-patterns found." Advisory: 1 × `repeating-stripes-gradient` (spec §6, kept). |
| `npx impeccable detect http://localhost:4198/en/` | **0** | "0 anti-patterns found." Advisory: 1 × `repeating-stripes-gradient` (spec §6, kept). |

Final output (`/`; `/en/` is identical apart from the URL):
```
0 anti-patterns found.

── Advisory (not counted as failures) ──

http://localhost:4198/
  [repeating-stripes-gradient] repeating-gradient decorative stripes
    → Repeating-gradient stripes used as surface decoration are a recurring generated-UI signature. Reach for a deliberate texture or leave the surface plain.

1 advisory note. Suppress with --no-advisory.
```

## Extra scan: static `dist/*.html` (not a gate command, for the record)

`npx impeccable detect dist/index.html dist/en/index.html` exits **2**. It reports `cramped-padding`, `tiny-text` ("8.8px body text") and `undersized-ui-text` ("5.76px «طن»").

These come from the static parser, which cannot resolve `clamp()`/`vw` sizes or real layout. The real values were measured in Chrome:

| Width | Hero lead line (0.55em) | «طن» unit (0.36em of the readout) | Smallest rendered text |
|---|---|---|---|
| 320 | 22 px | 25.9 px | 12 px |
| 390 | 22.5 px | 27.2 px | 12 px |
| 1440 | 41.8 px | 72 px | 12 px |

The rendered scans, which compute real styles, run the same rules and report nothing. Nothing was ignored.

## Commands and results (after all fixes)

| Command | Result |
|---|---|
| `npm test` | 34 files, **330 tests passed**. This includes 3 new RequestBar tests and 2 Button tests updated to the compiled classes. |
| `npx tsc --noEmit` | **ok**, no errors |
| `npm run build` (staging) | **ok**. JS 330.5 KB / **99.6 KB gz**, CSS 38.5 KB / **8.4 KB gz**. Prerender AR 102.0 KB, EN 94.4 KB. The truth gate lists 19 unverified items and the `[[CONFIRM]]` tokens (expected in staging). |
| axe (both pages × 320/390/768/1024/1440, and scrolled with the bar visible at 1440×900, 390×844 and 1366×657) | **0 violations** |
