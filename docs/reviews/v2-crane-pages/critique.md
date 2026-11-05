# Impeccable critique: crane pages (/cranes/<id>/, /en/cranes/<id>/)

Date: 5 November 2026. Target: `src/crane-page/` rendered at http://localhost:4320 (gmk6350, rt700e, quy250, atf60-3; AR + EN; 1440 × 900 and 390 × 844). Screenshots in this folder.

## Design-specificity verdict

Specific to Atlas, not a template. The page reads like a lift planner's product sheet: the model code in the machine's own mono, the capacity as the one giant number with its radius and rating status beside it, every other figure set against the other four models on the same site (bars, "longest of the five"), the manufacturer's sheet grouped the way the home page's comparison groups it, and an honest load question instead of a promise. Colour keeps its jobs: white/black grounds, navy for the accent (units, the current bar, the one brand band), red only for the request. The draft tags and "From the model name, to be confirmed" (QUY250) are designed states, not afterthoughts.

## Heuristics (0–4)

| # | Heuristic | Before | After | Key issue (after) |
|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 3 | Breadcrumb `aria-current`, active story step, request bar carries this crane; no "you are here" in the header nav (it points to the home page's sections). |
| 2 | Match with the real world | 3 | 4 | Units, radius and US-ton notes in the lift planner's terms; Arabic composed (name now at the right edge). |
| 3 | User control and freedom | 3 | 3 | Breadcrumb, language switch to the same crane, back to the lineup, compare with this crane picked. |
| 4 | Consistency and standards | 3 | 4 | Same header, footer, bar and labels as the home page; header glass now light from the first paint over the white hero. |
| 5 | Error prevention | 3 | 3 | The load block says the maximum applies only at the shortest radius before anyone sends a request. |
| 6 | Recognition rather than recall | 3 | 3 | Notes sit beside the figures they qualify; sources listed under the table. |
| 7 | Flexibility and efficiency | 3 | 4 | One tap to WhatsApp with the crane's message, or the home form with the crane already chosen; the bar asks about this crane. |
| 8 | Aesthetic and minimalist design | 2 | 3 | Key figures still repeat the hero's capacity (it is there as the instrument's headline). |
| 9 | Recognise and recover from errors | 3 | 3 | Few error states on the page; the form it hands off to owns them. |
| 10 | Help and documentation | 3 | 3 | "About this rating", sources with document type, the * and † marks explained. |
| | **Total** | **29/40** | **33/40** | Good → Good (82 %) |

## Issues found and fixed (P0–P1 first)

| Sev | Issue | Fix |
|---|---|---|
| P1 | Arabic page: the model name (an LTR run) sat at the left edge of its column. | `[dir=rtl] .cp-title > bdi { text-align: right }`. |
| P1 | English phones: the hero photo peeked above the fold and became the LCP element (Lighthouse mobile first visit 2.8 s). | Phones open on name, number and actions at full first-screen height; the photo starts at the fold; mobile preload dropped. LCP is text: 0.9 s. |
| P1 | Cross-document view transition aborted with a console error ("ViewTransition opt-in disabled") on 7 of 10 navigations. | Opt-in moved to an inline `<style>` in each template's head: 10/10 transitions, no errors. |
| P1 | English breadcrumb "Home" was 41.8 px wide (target floor 44 px). | `min-inline-size: 2.75rem` on the crumbs. |
| P1 | Header painted dark glass over the white hero until hydration (flash). | The header's server state is light on crane pages. |
| P2 | The capacity tile repeated "Max capacity" under its own "Max capacity" heading; the draft tag wrapped mid-label. | Tile shows "At 2.44 m radius · Manufacturer rating" + tag. |
| P2 | Phone first screen had one large empty gap above the actions. | The three groups share the height (`space-between`); room left for the floating bar. |
| P2 | Font swap reflowed the hero type line (CLS 0.0004–0.001) and the header language link. | Hero line uses only preloaded weights; language link keeps a 4.5 rem minimum. CLS 0 on English pages, 0.0004 on Arabic under a throttled real-time load. |
| P2 | The QUY250 † fell back to a system font (U+2020 is in no subset). | Drawn as an SVG mark with the same screen-reader text. (The home page's comparison and quick view still use the glyph; owner: lineup/compare.) |

## Remaining (P2–P3, not fixed)

- P2: on 768–1023 px tablets the hero photo is on the first screen and may be the LCP element (not a Lighthouse form factor; desktop LCP is 0.6 s).
- P3: the story's inactive steps are long on desktop (72 vh each), so a 2-photo crane (ATF 60-3, QUY250) has a short story; acceptable.
- P3: the "Key figures" headline runs to two lines at 1440.

## Persona red flags

- Site engineer on a phone in the sun: the number, the radius and both actions are on the first screen; good. The photo needs one swipe.
- Procurement reviewer: wants proof; every figure has a source host and its type, and the draft tag says what is unconfirmed.

## Detector

`npx --no-install impeccable detect` on /cranes/gmk6350/, /cranes/rt700e/, /en/cranes/gmk6350/, /en/cranes/rt700e/ (1440 × 900), /cranes/gmk6350/ and /en/cranes/rt700e/ (390 × 844), /cranes/quy250/: **0 anti-patterns** on every page. One advisory each: `repeating-stripes-gradient`, the red/white chevron of the DraftBadge (a brand motif kept by decision, v2 spec §17).
