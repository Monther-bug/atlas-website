# Atlas Alshraa: Creative Direction, Information Architecture and Motion (Phases 3–5)

Draft of 4 November 2026. This is for approval only; nothing has been built.
Every factual claim comes from `01-brand-and-asset-audit.md`. Design ideas are labelled **[proposal]**.

---

## The idea in one line

> **«لكل مشروع رافعته المناسبة» / "Every project has the right crane."**

This line is Atlas's own. The site should *prove* it rather than just say it: let the visitor travel through the fleet from the smallest crane to the largest, and land on the one that fits their job.

## Three directions to choose from

### A. "Load Moment" (recommended)
A cinematic, dark navy page. It borrows from the display inside a crane cab, the **load-moment indicator (LMI)**, which shows tonnes, radius and boom angle as clean numeric readouts.

- **Signature scene: The Capacity Scale.** A pinned, scroll-driven sequence. A vertical tonnage ruler sits on the reading-start edge (the right side in Arabic, the left in English). As you scroll, the readout climbs: **55 t → 60 t → 200 t → 250 t → 350 t**. At each stop a different crane photo is revealed by a diagonal **hazard-chevron wipe**, with its model and class in mono type. The number is the headline.
- Big, slightly condensed numerals. Thin red rules. Sky photography fills most of the frame.
- Dark sections are for storytelling. Light concrete-white sections are for reading (services, contact).
- **Why it fits:** it turns the one thing Atlas says about itself, *the range*, into an experience. It is built entirely from their own machines and photos, and no other crane company in the benchmark set does it.

### B. "Sky & Steel Editorial"
A light, magazine-like page. A white and concrete-grey ground, very large photos with generous margins, and captions in the style of an engineering catalogue ("PLATE 04 · Terex AC200-1 · Site A"). Calm, premium, architectural.
- Quieter and very readable. Safe for a procurement audience.
- It does less to show the *range*, and could look like a well-made architecture portfolio rather than a lifting company.

### C. "Blueprint"
A technical drawing look: a navy grid, crane silhouettes drawn in fine lines with DrawSVG, and specs in data tables.
- Distinctive in a still image, but the crane drawings would have to be invented line art, not Atlas's photos. It can also tip into a "tech template" feel. **Not recommended** as the main idea, though its fine line work is reused inside A.

**Recommendation: A, with B's calm reading sections.** The page opens cinematic, tells the range story, then settles into clear and readable sections where people decide and act.

## Information architecture (one page, matching the proposal's 9 sections)

| # | Section | Content source | Notes |
|---|---|---|---|
| 01 | **Header** | Logo badge + typeset name, links (Services · Fleet · Sites · Contact), عربي/EN switch, primary button «اطلب رافعة / Request a crane» | Turns solid on scroll. Mobile: full-screen menu with large tap targets and WhatsApp |
| 02 | **Hero** | Tagline (Facebook), photo 6398 or 6359, buttons: WhatsApp + Request a quote | Masked line-by-line headline reveal. Photo settles from 1.06 to 1.0 scale. A live "readout" chip shows the fleet range |
| 03 | **The Capacity Scale** (proposal's "Equipment", upgraded) | Fleet models from the photos, **capacities only once Atlas confirms them** | The signature scene. Becomes a horizontal swipe strip on mobile and a static list with reduced motion |
| 04 | **Services** | Crane hire · Heavy transport · Handling & rigging · Oil services (Facebook intro) | Four rows, each with a short description from Atlas. A photo shows on hover or focus only where real photos exist |
| 05 | **Fleet grid** | Cards: photo, model, type, max capacity, "Ask about this crane" | Filter by class: up to 60 t · 60–200 t · 200 t+ · Crawler. Each card opens WhatsApp with the model filled in |
| 06 | **Sites** (proposal's "Projects") | Construction site A and coastal site B | Shown **without project names** until Atlas gives permission. A pinned horizontal gallery on desktop |
| 07 | **Why Atlas + Documents** | **Hidden until real facts arrive.** Documents block lists the company profile, inspection certificates and HSE policy as PDFs, **only those Atlas actually has** | Built for oil & gas prequalification. Mellitah's public crane-hire call asks for exactly these in Arabic + English. No invented numbers |
| 08 | **Contact / "Request a crane"** | Email (confirmed). Phone, WhatsApp, address and map once supplied | Form fields follow Maxim and Ainscough: **load weight (t), lift radius (m), lift height (m)**, site location, start date, duration, crane (pre-filled from the card), name, company, phone. Every field except weight and phone is optional. Falls back to a pre-written WhatsApp message if no form backend |
| 09 | **Footer** | Name, services, contact, socials (Facebook), © | Plus a floating WhatsApp button on every screen (proposal item 09) |

## Design system (draft tokens) [proposal]

**Colour.** All colours derive from the logo samples #23207A and #C9221C.

| Token | Value | Role | Contrast |
|---|---|---|---|
| `navy-950` | #0D0C2B | Cinematic grounds (hero, Capacity Scale) | white text 19 : 1 |
| `navy` | #23207A | Brand colour: header lockup, links on light, focus ring on light | white text 13.5 : 1 |
| `red` | #C9221C | Primary action on light, chevron motif | white text 5.6 : 1 |
| `red-bright` | #FF5A4F | Red **text or lines on dark** only | 6.2 : 1 on navy-950 |
| `concrete` | #F3F2EE | Reading grounds | navy text 12 : 1 |
| `steel` | #A6A6C8 | Secondary text on dark | 8 : 1 on navy-950 |
| `ink` | #14131F | Body text on light | — |

**Rules.** Never put red text on navy (2.4 : 1). The yellow of the machines comes **only** from the photos; the interface does not use yellow. This keeps Atlas visually apart from Mammoet's red, yellow and dark-navy scheme.

**Type** (all self-hosted through Fontsource, all OFL licence; to be confirmed after the inspiration research):
- **Latin display:** Archivo Variable. Its width axis runs 62–125, so we get condensed numerals for tonnage and expanded caps for labels.
- **Arabic display:** Noto Kufi Arabic Variable, heavy weights. Its geometric Kufi forms match the weight of steel.
- **Body (both scripts):** IBM Plex Sans Arabic. It includes Latin, so mixed lines match in tone.
- **Data and specs:** IBM Plex Mono ("GMK6350 · 350 t · Site A").
- **Arabic rules:** letter-spacing always 0, with looser line heights (headings 1.3, body 1.85).

**Shape.** Square corners (0–2 px), like steel plate. Hairline rules. No glow, no glassmorphism, except one frosted header bar over photos.
**Grid.** 12 columns, a max container of 90 rem, fluid margins `clamp(1rem, 4vw, 3.5rem)`.
**Space.** 4 px base. Section padding `clamp(5rem, 12vw, 11rem)`.
**Breakpoints.** 360 · 640 · 768 · 1024 · 1280 · 1536.

## Motion system [proposal]

**Principle: everything moves like a load on a hook.** It lifts slowly, settles, and never bounces. One easing family: `power3.out` and `expo.out`, durations 0.6–1.2 s.

| Moment | Technique | Purpose |
|---|---|---|
| Page open | Masked headline lines rise (SplitText `mask: "lines"`). Photo settles 1.06 → 1.0. Readout chip counts up | Give the main message in about 2 seconds |
| Capacity Scale | ScrollTrigger pin and scrub. Clip-path diagonal chevron wipe between photos. Tonnage counts. Ruler ticks fill in | Show the range story |
| Section entrances | Images revealed from the bottom edge upwards, like being lifted. Text fades in 12 px | Rhythm without distraction |
| Scroll progress | A 3 px red chevron-striped bar under the header | Wayfinding, on brand |
| Fleet cards | On hover or focus the photo scales 1.03 and the spec line slides in. Filter changes use GSAP Flip | Feedback |
| Primary button | A gentle magnetic pull, desktop pointer only | A premium touch, kept to 1 element |
| Load-chart lines | DrawSVG traces fine curves behind the fleet data | Technical atmosphere |
| Smooth scroll | Lenis, synced with ScrollTrigger | A weighty feel |

- **Reduced motion:** no pinning, no scrub, no smooth scroll and no magnet. Content appears immediately (Lenis already respects this by default).
- **Low-power devices:** Capacity Scale becomes a swipe strip under 768 px, with no pinning on touch.
- **Sound:** not included. 3D: not included. Reasons are in the audit, Phase 2-C.
