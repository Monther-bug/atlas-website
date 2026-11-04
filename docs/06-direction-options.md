# Atlas Alshraa: Direction Options (synthesis of the multi-agent research)

4 November 2026. This is for decision; no website code exists yet.

**Inputs:**
- `01-brand-and-asset-audit.md`: facts, competitors, award references, Libya.
- `02-creative-direction.md`: first draft.
- `03-copy-deck.md`: bilingual copy, with tokens for every missing fact.
- `04-asset-plan.md`: 49 watermark-free crops plus size tests.
- `05-typography.md`: 4 font pairings rendered and scored.
- `research/concept-motion-lens.md`: two concepts from the motion-lens agent.
- `research/concept-arabic-type-lens.md`: two concepts from the Arabic-typography agent.
- `research/reference-styles.md`: 6 reference sites measured.

---

## Part 1. Already settled by evidence (applies to every option)

| Topic | Decision | Evidence |
|---|---|---|
| Positioning | Crane hire · heavy transport · handling · oil services. **Not** "equipment trading" | Atlas's Facebook intro, logo and photos |
| Hero line | «من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة», verbatim | Atlas's own post, 29 Oct 2026 |
| Type | **Archivo Variable** (Latin display; condensed numerals at width 75) + **Noto Kufi Arabic** (Arabic display) + **IBM Plex Sans Arabic** (body: Arabic 18 px, English 17 px) + **IBM Plex Mono** (specs). About **143 KB** after subsetting | Won the specimen test 37/40 against 3 other pairings |
| Numbers | **Western digits** in both languages, with a decimal point. Every number is formatted explicitly (the browser default for `ar-LY` gives "350,5") | Libyan plate in IMG_6364; noc.ly; Libyan news sites |
| Bidi | Model codes and phone numbers are isolated (`<bdi>`). Ranges in Arabic are written «من 55 إلى 350 طن», never "55–350" | Specimen test showed the broken order without isolation |
| Colour | Navy #23207A / deep navy grounds, red #C9221C for action only, white and concrete. **Never red text on navy** (2.4 : 1). **No yellow in the UI** | Logo samples; Mammoet uses dark navy + red + yellow, so we must look different |
| Photos | Desktop and mobile crops are ready and clear of the watermark. Hero AVIF at 1920 px is **64–77 KB** (budget 220). **Clean exports needed** for 6398, 6389, 6374 and 6380 | Asset agent; previews checked |
| Conversion | WhatsApp-first sticky bar with click-to-call. "Request this crane" on every card. Form asks load weight, radius and height. Documents block appears only when real documents exist | Maxim, Ainscough, Johnson Arabia; Mellitah prequalification call |
| Speed | Target **under 1 MB** first load and about 1.5 s LCP on 4G. The benchmarks we measured range from **2.6 MB (Mammoet) to 19.5 MB (CoMinVi)** | Reference agent's measurements |
| Truth | No invented numbers, clients or certificates. Pages say "Cranes" (not "Our fleet") until ownership is confirmed. Kobelco is hidden until confirmed | Copy deck rules |

---

## Part 2. Three directions

### Option A: «على الخطّاف» "On the Hook" ★ recommended
**Idea:** the crane hook is the thread through the whole page.
- **Hero:** an SVG rope continues from the **real hook in the photo**. The WhatsApp button hangs from it on a two-leg sling. Arabic uses IMG_6398 and English uses IMG_6359, so the hook sits where reading starts.
- **Signature, "The Hoist":** pinned on desktop. Cranes are lowered in one at a time in order of capacity. Each hangs a **load tag** with a huge condensed number counting up. The last crane is the GMK6350, where the UI hook settles on the real hook and "350 TON" is visible on the actual boom. *Range proven, not claimed.*
- **Conversion:** "Request this crane" makes the model chip **ride the hook** into the sticky WhatsApp bar.
- **Throughline:** the rope becomes a 1 px progress spine and ends in the footer at an outrigger pad drawn with the chevron stripes.
- **Mobile:** no pinning. A "load stack" of cards whose tags drop in on a short rope.
- **Folded in from other concepts:**
  - mono readouts in the style of a crane's load-moment indicator (my first draft);
  - faint Heron-style load-chart lines behind the Hoist;
  - CoMinVi-style "next" cards;
  - the "Draw your lift" sketch from "Sky-Bearer", which shows the weight, radius and height you type, as an extra if time allows.
- **Why it wins:** the most original idea (no competitor or award site does it), and it turns the brand's own claim into an experience. The conversion path *is* the animation. It is built from Atlas's real photos, has one signature shape (the hook), and is clear for buyers.
- **Risks:** the hook must line up with the photo at every crop (set per crop, with a fallback). Pin length grows with fleet size. **About 9 of 10 days.** Agent score 9/8/8.

### Option B: «أطلس» "The Atlas", a bilingual book of plates
**Idea:** the site is an atlas of plates. A vertical crane boom (the Terex, IMG_6374) is the **spine**: Arabic on its right, English on its left, and numbers *on* the spine because they are the same in both languages. When you switch language the spine **slews** across. The capacity "Mast Gauge" climbs the spine.
- **Why it's good:** calm, editorial and very trustworthy for procurement. Arabic-first in a way no benchmark is. The best clarity score (9).
- **Risks:**
  - It needs the **clean export of IMG_6374**: its centred subject can't avoid the watermark.
  - It proposes a different font set (Markazi, Aref Ruqaa), which was not tested.
  - It is less dramatic in the first 3 seconds.
- **About 9 days.** Agent score 8/9/8.

### Option C: «مَدّ» "Madd, the stretch"
**Idea:** the kashida in «للكبيــــرات» stretches in the reading direction and becomes the capacity scale. The cranes stand on that one stroke. Each language gets a photo whose boom points the way it reads.
- **Why it's good:** the most culturally unique; it could only exist in Arabic.
- **Risks:**
  - Browsers stretch kashida poorly, so it needs custom handling and a native typographer's sign-off.
  - English has no equivalent (it uses the Archivo width axis instead).
  - It is the hardest for a quick buyer to read.
- **About 10 days, tight.** Agent score 9/7/7.

**Considered and not chosen as the main idea:**
- "Load Moment": became A's readouts.
- "Sky-Bearer": its sketch is folded into A.
- "Blueprint" and the photo-to-blueprint frame sequence: too heavy for 17 Mbps mobile as a main device.
- A Libya route map: needs Atlas to confirm where it works.

---

## Part 3. Recommendation
**Option A, "On the Hook"**, built on the settled foundation in Part 1. It is the most memorable, the most conversion-led and fits the 10 days. If Atlas sends the clean IMG_6374, B's "spine slews on language switch" could become a small extra in A's header.
