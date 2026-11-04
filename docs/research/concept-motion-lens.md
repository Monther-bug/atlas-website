# Atlas Alshraa: two website concepts, seen through motion

A second opinion, 4 Nov 2026. I wrote this without reading `02-creative-direction.md`. Facts come only from `01-brand-and-asset-audit.md`, the contact sheet and a closer look at photos 6359, 6364, 6374, 6380, 6389, 6393 and 6398. Concept names are internal working titles. They are not customer copy.

Labels: **[fact]** = shown in a source. **[inference]** = drawn from evidence. Everything else is a design proposal.

---

## 0. What the material gives a motion designer

These are the things in the photos and the brand that can *move*. Both concepts are built from this list, not from a template.

| Evidence | Where | Why it matters for motion |
|---|---|---|
| **A real hook hanging against the sky** | 6359 (hook left, x≈33 %), 6398 (Faun hook right, x≈76 %), 6389 (hook over rebar, left), 6380 (hook + orange sling), 6364 (hook + red sling) | A real rope already sits in the frame. An SVG line can carry on from it, so the UI is "rigged" to a real Atlas crane |
| **Slings on hooks** | 6364, 6380 [fact] | Rigging and handling is one of their four services [fact]. A two-leg sling is honest imagery for it |
| **One symmetrical vertical boom** | 6374, Terex, centred in deep blue [fact] | A centred subject reads the same in RTL and LTR, so the photo never has to be mirrored |
| **"350 TON" printed on a boom** | 6389, GMK6350 [fact] | The only capacity written on a machine in the photos, so it is the natural climax of a "small to largest" scale |
| **Red and white hazard chevrons** | 6360, 6364, 6374, 6375, 6397, 6398 [fact] | Diagonal stripes for wipes, dividers and active states |
| **The watermark is the Atlas badge itself**, burned in at the same spot in every photo | bottom centre, about x 47–53 %, y 86–96 % [fact, measured on thumbnails] | Any design that puts a "ground" band or ruler along the bottom hides it for free while we wait for clean exports |
| **Low-angle shots, mostly sky** | 20 of 22 photos [fact] | Sky is the page's natural "air". Machines rise *into* it, so vertical and rotating motion feels native |
| **Their own words** | Tagline «من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة»; dialect CTA «شنو الرافعة اللي يحتاجها مشروعك؟ تواصلوا معانا وخلي الباقي علينا» [fact] | The range ("small to largest") becomes the scroll story. "Leave the rest to us" becomes the closing action |
| **Western digits on a Libyan plate** | 6364: «ليبيا» plate showing 4550 [fact] | Use 0–9 for tonnage in both languages [inference: confirm with Atlas] |
| **No loads, no people, no oil field, no transport rigs** | whole set [fact] | Motion must not pretend we have them. Oil services gets a line icon, not a photo |

---

## 1. Ground rules both concepts share

These apply to both concepts, so the concept sections can focus on the idea.

1. **Data-gated.** Fleet beats, cards, bands, the documents block and the phone/WhatsApp buttons all render from one `site-data` file. If an item has no confirmed data it does not render. Every number below shown as "X t" means *manufacturer's nominal rating for that model, shown only after Atlas confirms it owns or operates the machine*. The Kobelco CKE2500 stays out until ownership is checked.
2. **LCP is never animated in.** The hero `<img>` is painted at full opacity from the first frame (`fetchpriority="high"`, AVIF ≤ 220 KB). Only *transforms* run on it. Headline hiding happens only under an `html.motion` class set by an inline `<head>` script when `prefers-reduced-motion: no-preference`, and a 2.5 s CSS failsafe reveals the text if JS fails.
3. **Arabic text splitting.** SplitText uses `type: "lines,words"` with `mask: "lines"` and `autoSplit: true`, and runs after `document.fonts.ready`. **Never split Arabic into characters**: it breaks letter joining. **Never letter-space Arabic.** Uppercase and tracked "mono label" styling applies to Latin only.
4. **Three motion tiers through `gsap.matchMedia()`:**
   - *Full*: `(min-width: 900px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)`. One pinned stage, Lenis on (`lerp ≈ 0.085`).
   - *Touch/small*: below that, no-preference. **No pins, no Lenis**, native scrolling, one-shot enter reveals only.
   - *Reduced*: no smooth scroll, no pins, no scrubs. Content is shown at once and counters show their final values.
5. **Pinned stages stay usable.** In the DOM a stage is a plain `<ol>` of cranes, in reading order, all present for screen readers. The stage has `snap: "labelsDirectional"`, a visible "Skip to all cranes" link, and prev/next buttons that jump to each beat with `labelToScroll`.
6. **WhatsApp prefill.** Every "Request this crane" builds `wa.me/<number>?text=` with the model in the active language. Until Atlas gives a number, it falls back to the contact form with the model preselected.
7. **Budget (from the audit).** JS ≤ 110 KB gz. Estimate: GSAP core + ScrollTrigger + SplitText + DrawSVG + Flip + Lenis + app code ≈ 75–85 KB. LCP ≤ 2.0 s, CLS ≤ 0.05. **No preloader**: the hero *is* the intro. No custom cursor, no sound, no WebGL.
8. **Watermark plan.** Desktop 16:9 crops anchored to the top end at about 84 % of frame height, so they clear the badge (which starts at about 86 %). Mobile crops are art-directed per photo with `<picture>`. Both concepts also lay a solid band over the bottom of every hero and stage, which hides any leftover badge. Clean exports are still requested.
9. **Language switch.** `/` (AR) ↔ `/en/` uses cross-document View Transitions (`@view-transition { navigation: auto }`), so the hero photo morphs. Browsers without support do a normal page load.

---

## 2. Concept A: «على الخطّاف» / "On the Hook"

### One-line idea
The page is one lift. A rope continues from the **real hook in the hero photo**, the WhatsApp button hangs from it on a two-leg sling, and the crane you pick "rides the hook" down to the contact form, where Atlas says «خلّي الباقي علينا».

### Why it belongs to this company and no one else
- Five of their 22 photos show a real hook against the sky, two with slings (6359, 6364, 6380, 6389, 6398) [fact]. The UI starts *from Atlas's own rope*, not a generic line.
- Rigging/handling (المناولة) is in their legal name [fact]. The sling is the service drawn as an interface.
- "On the hook" in English means "responsible for". With «خلّي الباقي علينا» ("leave the rest to us") that becomes the brand promise: once your crane is on our hook, it's on us.
- Their range claim "small to largest" [fact] becomes a hoisting sequence that ends on the only capacity printed on a machine, **350 TON** on the GMK6350 (6389) [fact].

### Hero composition

The photo is picked **per language**, so the real hook always sits on the reading-start side and no photo is ever mirrored.

| | **Arabic (default, RTL)** | **English (LTR)** |
|---|---|---|
| Photo | **IMG_6398**: Grove RT + Faun on the beach, Faun hook at about x 76 % (the right side, where Arabic reading starts) | **IMG_6359**: yellow Grove RT cab, hook at about x 33 % (the left side, where English reading starts) |
| Desktop crop | Photo box is 74 svh tall with a strip crop at about y 6–80 % of the frame. The badge falls outside it and the crane bodies stay in. A navy "ground" band fills the bottom 26 svh | Same: a 74 svh box with a strip crop at about y 0–78 %. The hook sits at about 64 % of the box height |
| Mobile crop | Portrait crop at about x 55–90 %, y 0–72 % (Faun boom, rope, hook; badge excluded). Photo 60 svh, band 40 svh | Portrait crop at about x 10–45 %, y 0–72 % (boom tip, rope, hook, edge of the cab) |
| Text | **In the band**, right-aligned: H1 «لكل مشروع رافعته المناسبة». Above it, kicker «من الرافعات الصغيرة للكبيرات». Below it, a service line from the legal name: «تأجير رافعات · نقل ثقيل · مناولة ورفع · خدمات نفطية». Secondary button «تصفّح الرافعات» | Mirror: left-aligned. H1 "Every project has the right crane.", kicker "From smaller cranes to the largest ones.", service line "Crane hire · Heavy transport · Handling & rigging · Oil services", button "Browse cranes" |
| The sling | The **WhatsApp button** (red chip, white text, 1 px white ring) hangs about 110 px below the real hook on two SVG sling legs, over open sky | Same, under the 6359 hook |

**Technique that makes the sling stick to the hook at every size.** An overlay `<svg>` uses the *same* viewBox as the crop asset with `preserveAspectRatio="xMidYMin slice"`. That matches the image's `object-fit: cover; object-position: 50% 0` exactly. The hook point is stored once in image pixels per crop, so the sling stays pixel-locked to the real hook on any viewport. Each `<picture>` source gets a matching overlay toggled by the same media query.

**What moves in the first 2 seconds** (t = first paint):

| t (s) | Element | Motion |
|---|---|---|
| 0.00–2.40 | Photo | `scale 1.05 → 1`, `expo.out`. Transform only, so LCP stays safe |
| 0.15–0.85 | Sling legs | DrawSVG `0% 0% → 0% 100%` downward from the real hook, `power2.in` (like rope paying out) |
| 0.35–1.25 | H1 | Masked lines rise, `yPercent 105 → 0`, stagger 0.10, `power3.out`. Arabic split by words/lines only |
| 0.80–1.70 | WhatsApp chip | Settles onto the sling ends, then one damped swing around the hook pin (`svgOrigin`): 4° → −2.5° → 1° → 0, `sine.inOut`. It is tappable the whole time |
| 1.10–1.60 | Service line, secondary button, header | Words fade and rise (stagger 0.03); header fades in |
| 2.00 | — | Everything is still |

On scroll (scrubbed over the first 60 vh): the photo drifts up slower than the page (`yPercent 0 → −8`). The WhatsApp chip lifts off its sling and **docks into the sticky bar** (Flip, 0.6 s `power3.inOut`): the load is set down where it will stay.

### Signature interaction: "The Hoist" (fleet range, pinned on desktop only)

**Stage:** a full-viewport photo box (76 vh) over the same navy ground band (24 vh). A rope runs from the top edge (the boom is off-screen) to a red hook block. Under the hook hangs a **load tag**: the capacity number set huge in condensed type. The band holds the model (mono), the type in the active language, and «اطلب هذه الرافعة / Request this crane».

**Pin length:** about 30 vh in, 55 vh per crane, 30 vh out. With 5 confirmed cranes that is about 335 vh; with 3 it is about 225 vh. `scrub: 0.6` gives a weighty lag, and snap goes to each beat label (`duration {min .2, max .6}`, `power1.inOut`).

| Beat | Scroll | What moves | Ease | What the buyer learns |
|---|---|---|---|---|
| **0 · Enter** | 0–30 vh | The stage pins. The rope draws down from the top edge (DrawSVG). Heading «من الصغيرة للكبيرة» / "Small to largest" in masked lines | `power2.out` | "This is the range of cranes they run" |
| **1 · First load** | 30–85 vh | **0–30 %**: hook lowers into frame. **25–65 %**: crane 1's photo **rises up from the ground band** (a transform-only shutter: wrapper `y 100% → 0` with the inner image moving the opposite way). **50–85 %**: tag is set down, counter `0 → X` (`snap: 1`, `tabular-nums`). **85–100 %**: hold for reading | rise `power3.out`; set-down `power4.out` | Smallest confirmed class: model, type (rough-terrain / all-terrain / crawler), nominal max capacity |
| **2–4 · Heavier loads** | 55 vh each | **0–30 %**: the hook hoists the old tag up out of frame (`power2.in`; the rope shortens). **25–65 %**: the next photo rises. **50–85 %**: new tag set down; counter runs from the previous to the new value. *Optional polish*: the single rope splits into more parallel "falls" as tonnage grows (purely graphic, no numbers) | as above | Each step is bigger. Suggested order once confirmed: Faun ATF / Grove RT700E → Terex AC200-1 ("200T capacity class", 6375) → FW.China QUY250 (6385) |
| **5 · Climax** | 55 vh + 20 vh extra hold | GMK6350 (6389). The counter lands on 350, and "350 TON" is visible on the real boom. **The UI hook comes to rest exactly on the real hook hanging in 6389**, echoing the hero, which also began on a real hook | `power4.out` | The largest crane is 350 t: "from small to largest" is now proven, not claimed |
| **Exit** | 30 vh | The band swaps to "See all cranes ↓". The rope retracts into a thin line on the inline-start edge and becomes the page's **progress spine**: a 1 px rope whose hook position equals scroll progress (desktop only) | `power2.inOut` | Next: the full fleet |

### Section flow (all 9)

| # | Section | Content and motion |
|---|---|---|
| 1 | **Header** | Badge (48 px, paired with the name «أطلس الصحراء · Atlas Alshraa» set in type, because the badge is unreadable below about 56 px), AR/EN toggle, call icon. Transparent over the hero; turns solid deep navy after the hero (0.3 s CSS) |
| 2 | **Hero** | As above |
| 3 | **Fleet / capacity** | "The Hoist" (desktop) or the load stack (mobile) |
| 4 | **Services** | Deep navy band, four large rows (crane hire, heavy transport, handling & rigging, oil services). Rows are "set down" on enter (`y −24 → 0`, 0.8 s `power4.out`, stagger 0.1). On hover or focus, a short red sling line draws from the row title to the progress rope. Oil services gets the derrick-and-flame line drawing taken from their own logo, not a stock photo. Each row's 2–3 lines are **pending Atlas copy** |
| 5 | **Fleet grid** | White reading band. Filter chips by tonnage band, generated from data. Flip reflow (0.5 s `power2.inOut`, stagger 0.02). Card: top-cropped photo, capacity as the biggest element, model in mono, type. **"Request this crane"** makes the model chip **ride the hook**: Flip from the card into the sticky bar, 0.7 s `power3.inOut`. The bar then reads «على الخطّاف: GMK6350 · واتساب ✕», and the contact form is prefilled |
| 6 | **Sites gallery** | "Two sites": construction and coast, **unnamed** (no names or permissions yet). Native horizontal scroll-snap strips (RTL-safe, no second pin). Photos are lowered in on enter (clip from the top, 0.9 s `power4.out`). Tap opens a `<dialog>` lightbox |
| 7 | **Why / documents** | **Not rendered** until Atlas provides real items (inspection certificates, HSEQ, company profile, Arabic + English technical file). When present: rows of downloadable files that hang off the progress rope like tags. Nothing invented |
| 8 | **Contact** | Navy band. Heading in their own dialect: «شنو الرافعة اللي يحتاجها مشروعك؟», sub-line «خلّي الباقي علينا». Fields: load weight (t), radius (m), lift height (m), date, site/city, name, phone/WhatsApp, notes, crane (prefilled if one is on the hook). When the user types a weight, a small load block appears on the progress hook beside the form. On **send**, the hook hoists the block up out of view (0.8 s `power2.in`), then a success message appears. Two buttons: «أرسل على واتساب» (builds the message from the fields) and «أرسل» (form endpoint) |
| 9 | **Footer** | The rope ends at an outrigger pad drawn as a small chevron-striped plate. Badge at 80 px (readable), email atlasalsahralibya@gmail.com [fact], phone/address when supplied. "Back to top" is a hook icon that hoists you up (`lenis.scrollTo(0)`) |

### Colour and type
- **Colour.** Deep navy ground `#120F45` (brand navy darkened, for bands), brand navy `#23207A` for surfaces and borders, white, concrete grey `#E9EAEE` for card grounds, ink `#1E1E20`. **Red `#C9221C` is reserved for the rope, hook, sling and the primary CTA, nothing else.** Red on navy is only 2.4 : 1, so red is never used for text on navy, and the red chip always has a white 1 px ring.
- **Type** (at most 3 preloaded, per language):
  - Display AR: **Noto Kufi Arabic** 800. Its geometry suits steel.
  - Display EN and **all numbers**: **Barlow Condensed** 700. Tall and narrow like the "350 TON" stencil.
  - Body in both scripts: **IBM Plex Sans Arabic** 400/600 (it includes Latin).
  - Tonnage always in 0–9 digits with `tabular-nums`.

### Mobile version
- **Hero:** same sling trick on the art-directed crop. The chip hangs from the hook inside the 60 svh photo box; the H1 and browse button sit in the 40 svh band.
- **No pin.** "The Hoist" becomes a **load stack**: one card per crane in tonnage order, each a 4:5 top crop with the tag in a navy band. On enter (`start: "top 80%"`, plays once): the photo rises (0.7 s `power3.out`), the tag drops in on a short rope with a 2° settle (0.6 s `power4.out`), and the counter runs (0.8 s). A thin rope between cards draws with light scrub (no pin, cheap).
- **Sticky bottom bar** (64 px + `env(safe-area-inset-bottom)`): WhatsApp and call by default, or «على الخطّاف: model ✕ · واتساب» once a crane is picked. This builds on Johnson Arabia's always-visible WhatsApp (from the audit benchmarks), but the button also carries which crane you picked.
- The progress rope is **hidden** on mobile. Nothing interactive sits within 16 px of the screen edges, so nothing fights the iOS back-swipe.

### Reduced-motion fallback
No intro animation: the sling, rope and hook are drawn static and the chip hangs still. No Lenis, no pin: the Hoist renders as the static load stack with final numbers. The chip appears in the bar instantly, with no flight. Filters reflow without Flip. "Send" shows the success state with no hoist.

### Famous-site principle borrowed
- **Apple's AirPods Pro product page (2019):** one pinned stage whose state is *purely a function of scroll position*. It is scrubbed and reversible, and each caption is tied to a beat. We borrow the principle, not the image sequence. Our "frames" are five real photos and one number.
- **Q Industrial (Awwwards SOTD, Jun 2024):** one red accent on a dark ground, saved for the action. Here, red means "the lift" (rope, hook, sling and the WhatsApp button) and nothing else.

### Risks
1. **The hook coordinates must be measured per crop.** If Atlas sends clean re-exports with a different framing, those points are re-measured (about 10 minutes with sharp).
2. A swinging CTA can feel like a gimmick to procurement. The swing is capped at one damped cycle under 1 s and never repeats.
3. **Pin fatigue:** 335 vh is long. Mitigated by snap, the skip link, prev/next buttons and 55 vh beats. If Atlas confirms only 3 cranes, it shrinks on its own.
4. The "falls multiply with tonnage" visual could be nitpicked by a rigging engineer. It is optional and carries no numbers.
5. The English idiom "on the hook" can also mean "owing money". It is an internal name only; the customer-facing bar label is "Selected crane".
6. Fleet capacities and ownership are still unconfirmed. The stage has nothing to show until the fleet sheet arrives (risk to day 3).

### Build cost (whole site, 1 developer)
| Work | Days |
|---|---|
| Scaffold, data model, sharp crops (art-directed, hook points measured) | 1.0 |
| Header + hero + pixel-locked sling overlay, both languages | 1.5 |
| The Hoist (desktop pin) + load stack (mobile) | 2.0 |
| Services, fleet grid with Flip filter, the "on the hook" bar | 1.5 |
| Gallery + data-gated documents block | 0.5 |
| Contact form + WhatsApp compose + hook feedback | 1.0 |
| RTL/LTR pass, reduced motion, axe + Lighthouse QA | 1.5 |
| **Total** | **9.0** (1 day buffer) |

**What to drop if time runs short:** the multiplying falls, the progress spine, and the hook landing on the real hook in 6389.

### Self-score
| Uniqueness | Clarity for buyers | Feasibility in 10 days |
|---|---|---|
| **9** | **8** | **8** |

---

## 3. Concept B: «حامل السماء» / "Sky-Bearer"

### One-line idea
Atlas, the Titan who holds up the sky, becomes a crane boom. Each crane's sky is **lifted into view by a luffing boom** (a boom that tilts up and down) that sweeps a sector open from its pivot. The page speaks the crane's own drawing language, the load chart, and ends by letting the buyer **draw their own lift**.

### Why it belongs to this company and no one else
- **The name:** أطلس = the Titan who carries the sky. 20 of 22 photos are machines holding up a sky [fact].
- **6374**, the Terex boom standing dead-centre in deep blue [fact], *is* the Atlas pose, and because it is symmetrical it serves Arabic and English **without mirroring**.
- **Load charts** (radius × height, boom-angle rays, capacity arcs) are the industry's own diagrams. Libyan buyers' prequalification asks for technical files [fact, Mellitah call], and the benchmark enquiry forms ask for weight, radius and height [fact, Maxim/Ainscough]. So the chart grammar teaches the buyer the three questions Atlas needs answered.
- **The boom swings with the reading direction.** In Arabic the pivot is bottom-right and the boom reaches leftward; in English it is mirrored. The motion *reads* the same way the language does.
- **"الصحراء":** the reading ground is a warm sand-white taken from the beach-site sand (6364, 6395, 6398) [proposal: a neutral, not a new brand colour].

### Hero composition

| | **Arabic (default)** | **English** |
|---|---|---|
| Photo | **IMG_6374** (Terex boom, centred) | **IMG_6374** (same photo, same crop; only the text moves) |
| Desktop crop | 16:9 anchored to the top. It ends at about 84 % of frame height, so the badge is excluded while both "TEREX" lines on the counterweight stay in. Photo 78 svh; a sand-white **chart band** fills the bottom 22 svh | Identical |
| Text | **Split headline around the boom**, in reading order: «لكل مشروع» in the deep-blue sky to the **right** of the boom, «رافعته المناسبة» to the **left**. One `<h1>` (two spans), white, Alexandria 800, kept above y≈50 % to stay clear of the scaffold on the right. Chart band, right-aligned: kicker «من الرافعات الصغيرة للكبيرات», the service line, buttons «واتساب» (red) and «تصفّح الرافعات» (navy outline) | "Every project" left of the boom, "has the right crane." right of it. Chart band left-aligned |
| Overlay | A fine **load-chart grid** in white at 35 % opacity, pivoting from the boom's foot: angle rays plus 4–5 arcs. Labels name the axes only ("R · m", "H · m"), with no values, so there are no fake specs | Same |
| Mobile | Same photo cropped to about x 28–72 %, y 0–80 % (boom, jib and TEREX counterweight; badge excluded) in a 56 svh box. The headline is **not split** (the sky either side is too narrow); it sits in the 44 svh sand band. The arcs carry on from the photo into the band | Same, left-aligned |

**What moves in the first 2 seconds:**

| t (s) | Element | Motion |
|---|---|---|
| 0.00–1.60 | Photo | `yPercent 3 → 0`, `power3.out`: the boom *rises* a few pixels into place. Transform only |
| 0.10–1.10 | Angle rays | DrawSVG outward from the pivot, stagger 0.05, `power2.out` |
| 0.30–1.20 | Split H1 | Masked word reveal. The reading-start half moves first (AR: right half, EN: left half), then the second half 0.15 s later, `power3.out` |
| 0.50–1.30 | Capacity arcs | DrawSVG, stagger 0.08, `power2.out` |
| 1.20–1.60 | Band content | Kicker, service line and buttons rise (0.4 s, stagger 0.05) |
| 1.50–2.00 | **One red line** | Draws up the real boom's centre line (DrawSVG, 0.5 s, `power2.inOut`). It is the only red in the hero: "this is the lift" |

On scroll (scrubbed over the hero): the two headline halves drift **apart** by ±3 vw and fade, as if the boom is pushing the sky open. The chart grid rotates by 4° about the pivot.

### Signature interaction: "The Luff" (fleet range, pinned on desktop only)

**Stage:** the text column takes the inline-start 38 % (sand ground); the photo window takes the inline-end 62 %. The **pivot sits at the window's bottom corner next to the text column**. A **red lattice boom** (SVG line with a hatch pattern) rotates around it. A hook hangs from its tip and always stays vertical: its angle follows with a 0.15 s lag (`gsap.quickTo`), which gives a pendulum feel. Concentric **tonnage arcs** (scale ticks every 50 t, labels set horizontally on the window's bottom edge) sit behind it. A **red ring marker** slides along the boom to the arc that matches the current crane's rating.

**The reveal is transform-only.** A large "shutter" layer, a half-plane whose edge passes through the pivot, rotates by θ. The next photo inside it rotates by −θ, so the photo itself holds still. The opening between the edge and the window is exactly a sector sweeping out from the pivot. Both layers are composited `transform`s, so there is no per-frame clip-path repaint and it holds 60 fps on mid-range laptops. The boom line rides the shutter edge.

**Alternate up and down:** odd beats luff *up* (0° → 90°), even beats luff *down* (90° → 0°). A real luffing crane moves both ways, and the boom never has to "reset" visibly.

**Pin length:** 30 + 5 × 55 + 30 vh ≈ 335 vh, with `scrub: 0.8` (hydraulic smoothness) and snap to the labels.

| Beat | Scroll | What moves | Ease | What the buyer learns |
|---|---|---|---|---|
| **0 · Enter** | 0–30 vh | The stage pins. The arcs draw out from the pivot (stagger 0.08). The boom draws flat along the window's bottom edge. Mono label «S.03» + heading «من الصغيرة للكبيرة» | `power2.out` | "This is a scale from small to large" |
| **1 · Luff up** | 55 vh | **0–70 %**: boom 0° → 90°, sweeping open crane 1's photo. **20–70 %**: the marker slides out to arc X t; the counter runs 0 → X (`snap 1`, `tabular-nums`). **55–75 %**: the text column swaps to model (mono), type, «اطلب هذه الرافعة». **75–100 %**: hold | boom `sine.inOut`; marker `power2.out` | Smallest confirmed crane: what it is, and where it sits on the scale |
| **2 · Luff down** | 55 vh | Boom 90° → 0°, sweeping open crane 2. The marker slides further out | same | Next class up |
| **3 · Up** | 55 vh | Terex AC200-1 (6375, "200T capacity class" per the audit) | same | Mid-range all-terrain |
| **4 · Down** | 55 vh | FW.China QUY250 (6385) | same | Large crawler |
| **5 · Up and hold** | 55 vh + 20 vh hold | GMK6350 (6389, "350 TON" visible on the boom). The marker reaches the outer arc. The boom ends **vertical**, holding the sky, and the tagline returns under the number: «لكل مشروع رافعته المناسبة» | `sine.inOut` → `power4.out` | The top of the range is 350 t |
| **Exit** | 30 vh | The arcs collapse into the section divider (a fine chevron rule); unpin | `power2.inOut` | Next: the full fleet |

Window photos are pre-cropped close to square, anchored to the top, at ≤ 84 % of frame height, so the badge never appears.

### Section flow (all 9)

| # | Section | Content and motion |
|---|---|---|
| 1 | **Header** | Sand-white bar with a 1 px navy hairline. Badge (48 px) + typed name lockup, AR/EN, WhatsApp icon. Compacts after the hero |
| 2 | **Hero** | As above |
| 3 | **Fleet / capacity** | "The Luff" (desktop) or chart cards (mobile) |
| 4 | **Services** | Numbered «S.04». Four rows, each with a **line icon drawn from the logo's own illustrations**: crane truck (crane hire), derrick + flame (oil services), plus two new icons in the same line weight, a low-bed truck (heavy transport) and a shackle-and-sling (handling). Icons draw once on enter (DrawSVG 0.9 s `power2.out`); descriptions reveal word by word (lines for AR). Copy pending Atlas |
| 5 | **Fleet grid** | Cards on sand. Each card has a **mini boom gauge**: a quarter arc whose needle angle maps the rating (0 → 350 t), the same language as the Luff. Tonnage-band chips; Flip reflow (0.5 s `power2.inOut`). "Request this crane" scrolls to the lift sketch with the model preselected |
| 6 | **Sites gallery** | Two tabs, «موقع إنشاءات / Construction site» and «موقع ساحلي / Coastal site» (unnamed). Swipe, tap or arrow keys run **the same luff wipe** (0.9 s `sine.inOut`), mirrored in RTL. One gesture vocabulary across the whole site |
| 7 | **Why / documents** | Hidden until data. When present: a "prequalification sheet" laid out like a chart legend (document, issuer, file type, size). Only real files |
| 8 | **Contact: "Draw your lift" / «ارسم رفعتك»** | Heading «شنو الرافعة اللي يحتاجها مشروعك؟». Three large stepper inputs (`inputmode="decimal"`): **وزن الحمولة (طن)**, **المسافة الأفقية (م)**, **ارتفاع الرفع (م)**, plus date, site, name, phone. A **live SVG sketch** above them: pivot, a boom reaching just above the point (radius, height), the hook, and a load box sized by weight on a log scale. It updates with `gsap.to` 0.4 s `power2.out`. Caption: «رسم توضيحي فقط، فريق أطلس يختار الرافعة المناسبة» ("Illustration only; the Atlas team picks the right crane"). **No capacity check is calculated or suggested.** «أرسل على واتساب» sends: «الحمولة 12 طن · المسافة 18 م · الارتفاع 30 م · …» |
| 9 | **Footer** | Navy (the only dark band, so it reads as the page "ground"). The chart baseline ruler runs across it. Badge at 80 px, email, phone/address when supplied |

### Colour and type
- **Colour.** Ground **sand-white `#F5F2EC`** with text in brand navy `#23207A` (a very high contrast pair). Chart lines are navy at 15–25 % opacity on sand, or white at 35 % on photos. **Red `#C9221C` only for the boom line, the marker and the WhatsApp button.** Navy is used as a full band only in the footer. Photos stay full colour; the machines supply yellow, white, teal and red.
- **Type:**
  - **Alexandria** (variable 100–900; Arabic + Latin; Google Fonts, Mohamed Gaber & Julieta Ulanovsky; confirmed in the google/fonts METADATA). Display in both scripts at 700–800. One family keeps AR and EN headlines matched.
  - **IBM Plex Sans Arabic** for body.
  - **IBM Plex Mono** for Latin chart labels, model codes and tonnage digits.
  - Arabic labels use Plex Sans Arabic 500 at the label size, untracked.

### Mobile version
- **Hero:** unsplit headline in the sand band. The arcs and red boom line still draw (they are cheap SVG).
- **No pin.** The Luff becomes **chart cards**: one card per crane, each a top-cropped photo with a small boom gauge in the pivot corner. On enter (once): the gauge luffs to its angle (0.9 s `sine.inOut`), the counter runs (0.8 s), and the text rises. No shutter effect on mobile.
- **Gallery:** native horizontal scroll-snap (RTL-aware). The luff wipe runs only on a button tap, never on a swipe, so scrolling stays native.
- **Lift sketch:** the diagram is 200 px tall above the fields and **sticks** to the top while you edit (`position: sticky`), so the drawing stays visible while typing. Steppers are 48 px tall.
- **Sticky bottom bar:** WhatsApp + call.

### Reduced-motion fallback
No hero intro; grid and red line drawn static. No pin: the Luff renders as static chart cards with gauges already at their angles and final numbers. The gallery swaps photos instantly. **The lift sketch still updates** (it is information, not decoration) but jumps straight to each value with no tween.

### Famous-site principle borrowed
- **Bartosz Ciechanowski's explainers** (ciechanow.ski, e.g. "Mechanical Watch", 2022): mechanics are taught through a diagram the *reader* changes. The "Draw your lift" form applies this to the three questions every crane enquiry needs.
- **Q Industrial (Awwwards SOTD, Jun 2024):** a huge headline split around one central object. Here the object is the Terex boom, which literally holds the sentence up.
- **CoMinVi (Awwwards SOTD, 30 Sep 2026):** mono labels and numbered sections (S.01…). Used for the chart annotations, Latin only.

### Risks
1. **The most engineering-heavy concept.** The shutter math, alternating sweeps, the marker on a rotating boom and the live sketch are all custom. If they slip, the hero, services and gallery still work without them.
2. **Chart imagery implies engineering authority.** A buyer could read the arcs as Atlas load data. Mitigations: no values on the axes, scale ticks clearly labelled as tonnage, and the sketch disclaimer.
3. **Text over sky:** 6374's deep-blue sky passes easily, but clouds would not. The split headline is limited to the clean upper sky and must be re-checked on clean exports.
4. **The headline is split around the boom.** That is fine for sighted readers and for screen readers (one `<h1>`). On narrow tablets (900–1100 px) the halves may wrap badly, so the split only applies at ≥ 1100 px and narrower screens get the stacked version.
5. Sand-white plus navy is calmer and less "cinematic" than Concept A. It may feel like a spec sheet to some stakeholders, though buyers may like that.
6. The same fleet-data dependency as Concept A.

### Build cost (whole site, 1 developer)
| Work | Days |
|---|---|
| Scaffold, data model, sharp crops | 1.0 |
| Header + hero (split H1, chart DrawSVG), both languages | 1.0 |
| The Luff (shutter rig, alternating beats, marker, hook lag) + mobile chart cards | 2.5 |
| Services (4 line icons, 2 of them new) | 0.75 |
| Fleet grid + gauges + Flip filter | 1.0 |
| Gallery with the luff wipe + documents gating | 0.5 |
| Lift sketch form + WhatsApp compose | 1.5 |
| RTL/LTR, reduced motion, QA, Lighthouse | 1.5 |
| **Total** | **9.75** (almost no buffer) |

**What to drop if time runs short:** the gallery luff wipe (use a fade), the gauges on fleet cards, and the hook lag.

### Self-score
| Uniqueness | Clarity for buyers | Feasibility in 10 days |
|---|---|---|
| **8** | **8** (9 for the contact step) | **6.5** |

---

## 4. Side by side

| | A · On the Hook | B · Sky-Bearer |
|---|---|---|
| Core motion | **Hoist**: vertical, rope and load | **Luff**: rotation around a pivot |
| Mood | Cinematic, deep navy, letterboxed | Daylight engineering chart on sand-white |
| Hero photo | AR 6398 / EN 6359, chosen so the real hook sits on the reading-start side | 6374 for both languages (symmetrical, never mirrored) |
| Brand tie | Real hooks and slings, rigging service, «خلّي الباقي علينا» | Atlas myth, symmetrical boom, load-chart language |
| Signature | The Hoist (5 loads, ends on 350 TON with the UI hook landing on the real hook) | The Luff (alternating sector sweeps, marker on tonnage arcs) |
| Conversion idea | The chosen crane "rides the hook" into a sticky WhatsApp bar | "Draw your lift" sketch that turns into a WhatsApp message |
| Days | 9.0 | 9.75 |
| Uniqueness / clarity / feasibility | 9 / 8 / 8 | 8 / 8 / 6.5 |

## 5. Recommendation

**Build Concept A** within the 10 days. It has the stronger first two seconds: the WhatsApp button hangs from Atlas's own crane hook, which no other crane-hire site can copy because nobody else has those photos. It also turns the primary action into the visual hero and fits the schedule with a day to spare. If day 8 is on time, take **one piece of Concept B**: the "Draw your lift" diagram in the contact section (about 1.5 days). It is the most useful thing in either concept for a site manager on a phone, and it fits A's world, since the hook simply moves to the drawn radius and height.

## 6. What either concept needs from Atlas by day 3

1. The **fleet sheet** (model, owned or partner, count, max rating). Without it, neither signature scene has content.
2. **WhatsApp and phone numbers.** Both concepts' main action depends on them.
3. **Clean, unwatermarked exports** of 6359, 6374, 6389 and 6398 at minimum. The crops work without them, but they are tight (about 2 % margin above the badge).
4. An answer on the **Kobelco CKE2500** (it carries another company's logo).
5. 2–3 lines per service, and approval to use the Facebook tagline and the dialect line as on-page headlines.
