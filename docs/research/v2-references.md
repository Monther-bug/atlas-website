# v2 reference study: what to borrow, what to leave, and where it goes on Atlas

- **Date:** 5 November 2026
- **Why:** the user's verdict on v1 was "the website looks old". References named by the user: apple.com/iphone, stripe.com, awwwards.com (annual winners, Sites of the Year), School of Motion's "10 websites with great animation in 2026", DesignRush's "best animated websites", and later land-book.com and lusion.co.
- **Method:** puppeteer-core in installed Chrome, desktop 1440×900 and mobile 390×844, several scroll positions; public pages only, no logins, nothing accepted (cookie notices hidden or declined). On each page a **computed-style census** (fonts, heading sizes, radii, shadows, blur, backgrounds, transition durations and easings) and, for Apple and Stripe, a **motion probe** that recorded every `transitionstart`/`animationstart` while scrolling and hovering. Scripts: `.work/capture-refs.mjs`, `capture-extra.mjs`, `motion-probe.mjs`, `landbook2.mjs`, `capture-more.mjs` (untracked).
- **Not reachable (not bypassed):** DesignRush on desktop and land-book's search/detail pages answered with a Cloudflare bot check; intercom.com returned a CloudFront error. DesignRush was read from its mobile page; land-book from its public home feed plus the live sites of the featured entries that resolved (Billdr, Relume). Firecrawl was out of credits.
- **Images:** `docs/research/v2-refs/*.jpg` (all ≤ 110 KB). `atlas-v1-before-ar-*.jpg` shows the v1 build for comparison.

---

## 1. Measured values (the numbers behind the v2 tokens)

| | Apple iPhone | Stripe | Awwwards SOTY | School of Motion | Atlas v2 decision |
|---|---|---|---|---|---|
| Display / H1 | 80 px / lh 84 / 600 / −1.2 px (mobile 48) | 48 px / 300 / −0.96 px (mobile 34) | 14 px (UI site) | 69 px / 770 (mobile 41) | 40 → 80 px Poppins 700, −0.03em; AR 46 → 86 px Tajawal 800 |
| Section H2 | 56 px / 600 (mobile 32); lineup 48 px | 32–56 px / 300, −0.02em; two-tone continuation in grey | | 50 px | 32 → 52 px; two-tone `.t-muted` continuation |
| Tile pitch line | 28 px / 600 (mobile 19–21) | 26 px / 300 | | | `.t-sub` 18 → 24 px |
| Body | 17 px (14 small) | 16–18 px | 14 px | 16 px | 16 → 17 px EN, 18 → 20 px AR |
| Section padding | 144 px desktop / 112 mobile | ~ 96–128 px | | | `--space-section` 80 → 144 px |
| Radius | **28 px tiles** (60×), 980 px pills, 36 px, 50 % paddles | 4–8 px | 8 px | 8 px, 999 px | `xl` 20 → 28 px tiles; pills for buttons |
| Shadows | almost none (tiles are flat grey on white) | `0 30px 60px -10px rgba(50,50,93,.25)` layered, `0 16px 32px rgba(50,50,93,.12)` | `0 0 6px` (halo) | `0 18px 44px rgba(0,0,0,.5)` | neutral e1–e4, offset + soft blur, no halos |
| Backdrop blur | 14–20 px (nav, controls) | 12 px | none | 18 px | 20 px glass on bar/header/captions only |
| Grounds | #FFF, #F5F5F7, #E8E8ED, #FAFAFC; black sections | #FFF, #F8FAFD, gradient ribbon | #222, #F8F8F8 | #101014 | white, #F5F5F5, black #0A0A0A |
| Transition durations | **0.32 s** (266×), 0.24 s, 0.3 s | **0.3 s** (511×), 0.8 s, 0.15 s | 0.3 s, 0.6 s | 0.16 s, 0.62 s | 120 / 200 / 320 / 480 / 800 ms |
| Easings | `cubic-bezier(.4,0,.6,1)`, `ease`, `(0,0,.5,1)` | **`(.25,1,.5,1)`** (509×), `(.165,.84,.44,1)`, `(.16,1,.3,1)` | `ease`, `(.22,1,.36,1)` 0.9 s | `(.16,1,.3,1)` 0.62 s | set `(.16,1,.3,1)`, ui `(.25,1,.5,1)`, swap `(.65,0,.35,1)` |
| Stagger (probe) | reveals: opacity+transform 0.32 s `ease`, delays stepping **20 ms** (0.16 → 0.32 s); link-ins the same | hover fills/colours 0.3 s; opacity 0.5 s `(.33,1,.68,1)` | | | 40 ms, capped at 8 |
| Sticky / snap elements | 13 sticky, 5 snap containers | 1 sticky, 2 snap | | | sticky stage, snap carousels |

## 2. References

### 2.1 Apple, iPhone (`apple-01` … `apple-07`)
**Borrow**
- **Chapter nav of product thumbnails** under a short H1 ("iPhone"): every model one tap away, plus "Compare". For Atlas: a row of the five cranes (photo chip + model + capacity) that jumps to the explorer with that crane picked.
- **Rounded product tiles** (28 px, light grey #F5F5F7 on white, no shadow) with name, one-line pitch, and **two actions side by side** (primary pill "Learn more" + quiet "Buy ›"). Atlas: crane tile with "Request this crane" (primary) + "Details" (quiet).
- **"Explore the lineup" carousel**: snap cards, colour dots, round paddles (36 px, bottom-right), "Compare all models ›" link top-right of the heading. Atlas: the On-site carousel and the touch fleet showcase; compare link beside the explorer heading.
- **Card carousels for reasons to buy** ("Why Apple is the best place…"): tile = small label line, big statement, short body, picture. Atlas: Why Atlas tiles built from facts (range, types, services, channels, steps).
- **Accordion** for secondary content ("Significant others"). Atlas: crane FAQ-like details stay in the sheet; an accordion is optional for Documents.
- **Motion:** 0.32 s transitions, staggered tile reveals 20 ms apart, sticky chapter nav; no bounce.
- **Spec/comparison presentation:** the lineup shows 3 facts per model (pitch, price, dots), and a separate Compare page holds the full table. Atlas mirrors this: explorer card with a few rows, sheet with all rows, compare table for side by side.

**Leave**
- Apple's blue as an accent (the user wants white/black with a little navy).
- Legal footnote walls; price/lease language (Atlas has no prices).
- Product renders on infinite white: Atlas has real photographs with skies and sites, so frames are photographic, not cut-outs.

### 2.2 Stripe (`stripe-01` … `stripe-07`)
**Borrow**
- **Two-tone headings:** the first sentence in ink, the continuation in grey within the same heading ("Flexible solutions for every business model. Grow your business…"). Atlas: `SectionHeader continuation`.
- **Bento of product tiles**, each with a different kind of content (a phone mock, a chart, a card, a globe), not one recipe repeated. Atlas: services bento (photo tile, light tile, dark tile, accent tile).
- **Data as instruments:** the stats row cycles one highlighted value while others dim; a globe of real traffic. Atlas: the capacity ruler (55 → 317.5 t with a tick per crane) instead of a stats band.
- **Story list with "+" disclosure** and logo/metric line (case studies). Atlas has no publishable clients; the pattern is reserved for Documents once real files exist.
- **Easing** `cubic-bezier(.25,1,.5,1)` 0.3 s for every state change (measured 509 times): adopted as `ease-ui`.
- **Hairline grid guides** framing the page. Atlas: the faint load-chart grid on night grounds.

**Leave**
- The gradient ribbon hero (a SaaS signature, and the user asked for black/white).
- Purple/indigo palette; 4 px radius buttons (Atlas uses pills, closer to Apple).
- Logo marquees of customers (no clients may be shown).

### 2.3 Awwwards: Annual winners and Sites of the Year (`awwwards-01` … `04`)
**Borrow**
- What the winners share (OFF+BRAND, abeto, Lusion, Locomotive, Active Theory, Monks, Hello Monday): one strong idea per site, big confident type, full-bleed media, motion that carries the story, and dense **grids of rounded 8 px cards** for listings.
- The winners page itself is a full-screen black menu of categories in large white type: a clean model for the mobile menu (black, big links, generous spacing).
- Easing `cubic-bezier(.22,1,.36,1)` 0.9 s on reveals: close to our `ease-set` 0.8–0.9 s.

**Leave**
- WebGL-first art direction as the content (Atlas sells cranes; the photograph is the proof).
- Cursor followers, scroll-jacking of the whole page.

### 2.4 School of Motion, "10 websites with great animation in 2026" (`som-01`, `som-02`)
The article lists Epic, BDSN Club, Dropbox Brand, Eszter Bial, Apple, Unseen Studio, Rive, Lusion, Uncommon Studio and Active Theory. Its recurring lessons:
- **"Let typography be the star"** with seamless section transitions (Epic). Atlas: display type over black, ground changes at chapter edges.
- **Restraint** and timing/easing choices that create elegance (Eszter Bial). Atlas: one authored moment per chapter.
- **Apple:** dedicate the viewport to one message at a time; performance on older devices. Atlas: pinned showcase on desktop only; touch gets a carousel.
- **Uncommon Studio:** staggered grid entrances that create rhythm without chaos. Atlas: `stagger` capped at 8 × 40 ms.
- **Lusion / Active Theory:** 3D that responds to the pointer, with usability intact. Atlas: optional WebGL depth on a photograph, desktop only (§2.7).

**Leave:** experimental "playground" motion (BDSN), character animation (Dropbox, Rive): wrong register for an industrial buyer.

### 2.5 DesignRush, "9 best animated websites in 2026" (`designrush-01`, `02`)
Deed Delivery, Wimpy Kid, QuadAngles, Ockom, Buzzworthy, The Quake, Poppr, Roger Junior, Wildcatter. Patterns worth taking:
- **Deed Delivery:** "animated paths trace down the page like a delivery route" + light-to-dark transitions between sections. Atlas already has the equivalent: the **rope** (progress line) and the hook path; v2 adds deliberate light ↔ black chapter changes.
- **The Quake:** motion tied to the subject (shaking type for an earthquake). Atlas: loads are lifted and set down (mask "hoist" reveals, settle easing), never bounced.
- **Ockom:** symbols that change form as you scroll. Atlas: the capacity readout ticking from one crane to the next.

**Leave:** dynamite intros, playful illustration, neon palettes, custom cursors.

### 2.6 land-book.com (`landbook-01` … `07`)
The public home feed (20 entries on 5 Nov) is mostly SaaS, studios and templates; the entries that fit an industrial, heavy-equipment brand are **Fourlines** (logistics and transport template), **Billdr** (AI operating system for general contractors), **Capricorn 01 Zagato** (a machine sold as an object), **Clap Studio** (products and installations) and, for component craft, **Relume**, **Symmetry** and **Intercom**. Captured: the feed, the Fourlines entry, and the live Billdr and Relume sites (the other entries were behind the bot check).

**Borrow**
- **Fourlines:** a huge, short, two-line headline set over a full-bleed operational photo (a container ship), then a plain-language manifesto paragraph at large size ("We don't sell trucks… we sell the hand-off"). Atlas: the hero line over the crane photo and a large About statement in the same register, from Atlas's own words.
- **Billdr:** construction-site photography as the ground of the hero (a blueprint on a desk), the product UI placed *in* the photo, a "trusted by" row (not usable by Atlas), warm real light. Atlas: put the interface (request chip, sling) *on* the real photograph, as the hook already does.
- **Relume:** neutral off-white ground, a centred input as the hero action, small mono "trusted by" kicker (an eyebrow: banned here), and component-system pages with rounded panels.

**Leave:** template sameness (centred headline + subline + two buttons + logo row), eyebrow labels, stock-photo moods.

### 2.7 Lusion (`lusion-01` … `03`)
**What it does:** a light page with a large rounded frame that holds a real-time WebGL scene (glossy navy, black and white parts) reacting to the pointer; a minimal header of pill buttons ("Let's talk", "Menu"); corner "+" registration marks and "Scroll to explore"; the intro stays pinned while the statement fades in; fluid, cinematic transitions between projects.

**Borrow for Atlas**
- **Pointer-reactive depth on a real photograph** (hero or showcase stage): a subtle parallax/depth displacement of the crane photo toward the pointer, desktop only.
- **The rounded media frame on a light page** as the stage (matches our `.frame` / `rounded-2xl`).
- **Intro choreography:** the first screen settles in one sequence (photo, then headline lines, then the action), finished by ~2 s; never blocking content.
- **Registration marks / grid**: echoes the load-chart grid on night grounds.
- **Pill controls** in the header.

**Rules for any WebGL on Atlas** (spec §9.6): desktop + fine pointer + motion allowed only; separate lazy chunk after first paint and idle, only when near; static `<img>` stays (never the LCP element); canvas `aria-hidden`, fades in after its first frame, removed on context loss or a slow first frame; pauses offscreen; DPR ≤ 2; main JS stays ≤ 110 KB gz; no custom cursor unless it explains an interaction.

**Leave:** abstract 3D as content, scroll-jacked full-page transitions, a menu that hides the navigation.

## 3. What NOT to copy, overall
- Category defaults: black + safety yellow + hazard stripes; gradient-blob heroes; logo walls; invented stats bands; same-size icon cards; eyebrow labels above headings; custom cursors; autoplay loops.
- Anything that implies facts Atlas has not given: client logos, testimonials, years, fleet counts, certifications, prices.
- Performance-heavy decoration on phones (Libyan median ~17 Mbps): no video backgrounds, no WebGL on touch.

## 4. Mapping to Atlas, section by section

| Atlas section | Borrowed from | v2 components | Motion |
|---|---|---|---|
| **Header** | Apple local nav, Lusion pill controls, Awwwards black menu | glass bar after the hero (light/dark by ground), pill nav links with section ink, `primary sm` Request, language pill; mobile menu = full-height black dialog with large links | condenses 64 → 56 px; ink follows the section in view; menu slides in 480 ms |
| **Hero** (separate agent; system constraints) | Apple one-message viewport, Fourlines headline-over-photo, Lusion intro choreography | photo + black band, `t-display` two-tone H1, sling WhatsApp `primary`, `glass` secondary; optional WebGL depth (desktop) | intro ≤ 2 s (photo settle, masked lines, sling, one damped swing), dock to bar |
| **About Atlas** [new] | Fourlines manifesto paragraph, Stripe two-tone heading | SectionHeader (name + positioning line in two tones), legal name, 4 service Chips, framed photo 6398 (or StickyStory: site → machine → request) | photo `mask`; chips `stagger` |
| **Fleet showcase (Hoist)** | Apple one-message-per-viewport, Lusion pinned stage, Ockom changing symbol | pinned rounded stage on night, chapter chips (5 cranes), `t-readout` + ticker, glass caption; touch: Carousel of crane slides | pin + mask swaps + readout ticks (desktop); snap + one-shot ticks (touch); static list (reduced) |
| **Find your crane: explorer** [rebuilt] | Apple lineup tiles + chapter nav + "Compare all models" | SegmentedControl (models), type ToggleChips (`useFlip`), photo frame + glass caption, Card with Stat + Tabs (Overview / Specification / Photos), Sheet with the full manufacturer specification | thumb slide, photo mask swap, Stat tick, ride to bar, sheet in 480 ms |
| **Compare** [new] | Apple compare page, Stripe tables | CompareTable from `sharedFields()`, picked column highlighted, sticky row heads | `fade`; column tint follows the pick |
| **Services** [bento] | Stripe bento (different content per tile) | BentoGrid: crane hire photo tile, heavy transport light tile, handling dark tile, oil services navy accent tile with the derrick | `stagger`; photo `.ui-zoom`; arrow nudge on "Ask about this service" |
| **Why Atlas** [new, truthful] | Stripe instruments, Apple reasons-to-buy cards | capacity-range ruler + two Stats (draft-badged), crane types + chips, four services in one request, response channels (configured only), 3 request steps (StickyStory on desktop) | ruler ticks draw, Stats tick, steps crossfade |
| **On site gallery** | Apple lineup carousel, Awwwards card grids | SegmentedControl (Building / Coastal), bleeding Carousel of 4:5 frames + captions, restyled Lightbox | first slides `stagger`, snap, crossfade on switch |
| **Documents** | Stripe story list | Card rows (PDF, language, date, Download / Request by email); hidden until data | `fade` |
| **Request form** | Apple/Stripe forms; Billdr's interface-on-photo idea for the on-hook chip | two-tone heading, Field primitives on a neutral-900 card, crane ToggleChips/select, contact list, `primary` submit | `fade`; busy strip; success rises |
| **Footer** | Awwwards black footer, Apple footer columns | positioning line at headline size, columns, glass back-to-top, chevron pad | none beyond v1 pad + hoist |
| **Request bar** | Apple sticky purchase bar | glass-dark pill above the safe area (phones), compact at inline end (desktop): WhatsApp `primary md`, Call `ghost-dark md`, on-hook Chip | appears after the hero; dock and ride kept |
