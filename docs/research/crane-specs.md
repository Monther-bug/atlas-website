# Manufacturer specifications for the five fleet cranes

Manufacturer figures, not Atlas-confirmed fleet data. Mirrors `src/content/crane-specs.ts`. "official" = manufacturer product guide/datasheet (some are hosted on dealer or aggregator sites, but the document is the manufacturer's own). "secondary" = spec database or seller. Values converted from imperial are marked "converted".

Source keys:
- RT = Manitowoc "RT700E product guide" (imperial, with metric in brackets): https://cdn.cranemarket.com/specifications/grove-rough-terrain-cranes-spec-1c7ab0.pdf
- ATF = Tadano Faun "ATF 60-3" brochure (08/XII 08/1.5, publisher TADANO FAUN GmbH): https://www.kanizsakran.hu/assets/pdf/tadano-faun-atf-60-3.pdf
- AC = Terex Demag "AC 200-1" metric datasheet: https://www.hareket.com/uploads/vinçler/Ac200-1.pdf (US imperial edition: https://cdn.cranemarket.com/specifications/terex-demag-all-terrain-cranes-spec-322404.pdf)
- GMK = Manitowoc "Grove GMK6350 Product Guide" (imperial, 2020): https://www.manitowoc.com/sites/default/files/media/divers/file/2020-01/GMK6350-Product-Guide-Imperial.pdf

## 1. Grove RT700E (rough-terrain), "Rough Terrain Hydraulic Crane"

| Field | Value | Unit | Source | Type | Notes |
|---|---|---|---|---|---|
| Rated capacity | 50-60 ton (50-55 mt) | US ton / t | RT | official | 55 t = metric for the 60 US-ton rating |
| Capacity at radius | 120,000 lb at 10 ft (54.4 t at 3.05 m) | | RT | official | 36 ft boom; chart pages in the guide are headed RT750E / RT760E; not stored |
| Main boom | 11 - 33.5 | m | RT | official | 36-110 ft, 4-section |
| Max tip height, no jib | 36.4 | m | RT | official | 119 ft |
| Fixed swingaway | 10.1 (tip 45.8) | m | RT | official | optional |
| Bi-fold swingaway | 10.1 - 17.1 (tip 53.2) | m | RT | official | optional; with 6.1 m / 12.2 m inserts tip 59.1 / 65.2 m |
| Counterweight | 5.553 | t | RT | official | 12,242 lb pinned |
| Axles / drive / steer | 2 / 4x4 / 4 modes (front, rear, crab, coordinated) | | RT | official | |
| Engine | Cummins QSB 6.7, 6-cyl, Tier III, 179 kW (240 bhp) gross at 2,500 rpm | kW | RT | official | |
| Max travel speed | 37 | km/h | RT | official | 23 mph |
| Gradeability | 75 | % | RT | official | theoretical |
| Basic machine GVW | 38.618 | t | RT | official | 110 ft boom, full counterweight |
| Dimensions L x W x H | not extracted | | RT | | drawing only |

Conflict/doubt: the guide's own headline "50-60 ton (50-55 mt)" resolves Atlas's 55 t vs 60 t: same rating in metric vs US tons. Third-party pages also show 50 t for older units.

## 2. Tadano Faun ATF 60-3 (all-terrain), "ALL-TERRAIN"

| Field | Value | Unit | Source | Type | Notes |
|---|---|---|---|---|---|
| Max capacity | 60.0 at 2.5 m | t | ATF | official | over rear with additional equipment; 55.0 t at 2.5 m standard (10.4 m boom) |
| Main boom | 10.4 - 40.2 | m | ATF | official | 5 sections |
| Boom extension | 9.0 / 16.0, offset 5/20/40 deg | m | ATF | official | |
| Tip height with jib | 58.4 | m | https://cranepedia.com/spec/all-terrain-crane/tadano-atf60-3/ | secondary | diagram unreadable in brochure |
| Counterweight | 13.2 (standard 6.1 divisible + optional 7.1) | t | ATF | official | chart header |
| Axles / drive | 3 / 6x6, all axles steered and driven | | ATF | official | |
| Engine | Mercedes-Benz OM 926 LA, 240 kW (326 HP) at 2,200/min | kW | ATF | official | 200 kW at 1,500/min in crane mode |
| Max travel speed | 80 | km/h | ATF | official | |
| Gradeability | 66 (385/95 R25) / 59 (445/95 R25) | % | ATF | official | |
| Weight | 36 | t | ATF | official | 12 t per axle, incl. 5.0 t counterweight, 32 t hook block |
| Width | 2.55 | m | ATF | official | tyre width line; full L x H not extracted |
| Country | Germany | | ATF | official | publisher address, Lauf a.d. Pegnitz |

## 3. Terex Demag AC 200-1 (all-terrain)

| Field | Value | Unit | Source | Type | Notes |
|---|---|---|---|---|---|
| Capacity | 200 | t | AC | official | datasheet title; radius not readable from table |
| Main boom | 12.4 (shortest listed) - 68 | m | AC | official | 7-section, Unimec |
| Boom extension | 33 (combined 100 m); 9 / 17 m offsets in tables | m | AC | official | |
| Counterweight | 69 | t | AC | official | hydraulically stowed |
| Axles / drive | 5 / 10x8x8 | | AC | official | |
| Engine | Mercedes-Benz (DaimlerChrysler) OM 502 LA, 390 kW (530 HP) at 1,800/min | kW | AC | official | superstructure OM 906 LA 170 kW |
| Max travel speed | 85 | km/h | AC | official | |
| Gradeability | 71 | % | AC | official | |
| Weight | 60 (5 x 12 t axle loads) | t | AC | official | basic machine with hook block |
| Max tip height, dimensions | not found | | | | drawings only |

Conflict: the imperial edition headlines "240 t Lifting Capacity"; the metric edition says "200 t" (200 t = 220 US tons). Use 200 t.

## 4. Fuwa QUY250 (crawler)

| Field | Value | Unit | Source | Type | Notes |
|---|---|---|---|---|---|
| Max rated capacity | 260 | t | https://fuwaglobal.com/caseshow.php?cid=35&id=136 | official | seen via search excerpt only (page not fetchable) |
| Main boom | 15.2 - 72.2 | m | same | official | |
| Fly jib | 18 - 36 | m | https://cranepedia.com/spec/crawler-crane/fuwa-quy250 | secondary | |
| Counterweight | 88.5 | t | Cranepedia | secondary | |
| Engine | 242 kW at 2,100 rpm | kW | Cranepedia | secondary | Lectura says 246 kW |
| Travel speed | 0.8 / 1.2 | km/h | Cranepedia | secondary | |
| Gradeability | 30 | % | Cranepedia | secondary | |
| Operating weight | 225 | t | Cranepedia | secondary | |
| Dimensions | 12.31 x 3.28 x 3.552 | m | Cranepedia | secondary | |
| Ground pressure | 0.114 | MPa | Cranepedia | secondary | |
| Track shoe width | 1.2 | m | https://www.craneundercarriage.com/info/fuwa-quy250-undercarriage-parts-19741822.html | secondary | parts seller |
| Max lifting moment | not found | | | | 1,300 t.m is the QUY250-1, not this model |
| Country | China | | fuwaglobal.com | official | |

Conflict: 250 t (name, Lectura) vs 260 t (Fuwa, Cranepedia).

## 5. Grove GMK6350 (all-terrain)

| Field | Value | Unit | Source | Type | Notes |
|---|---|---|---|---|---|
| Rated capacity | 350 US tons = 700,000 lb at 8 ft | | GMK | official | converted: 317.5 t at 2.44 m |
| Main boom | 15.5 - 60 (51-197 ft), 5-section | m | GMK | official | |
| Max tip height | 63 | m | GMK | official | 207 ft |
| Swingaway / luffing jib | 11 - 19 m telescoping; 21 - 61 m luffing | m | GMK | official | jib tip height not extracted |
| Counterweight | 100 | t | GMK | official | |
| Axles / drive | 6 / 12x6x12 (opt. 12x8x12) | | GMK | official | |
| Engine | Mercedes-Benz OM502LA, 420 kW (563 hp) at 1,800 rpm | kW | GMK | official | superstructure OM906LA 205 kW |
| Max travel speed | 77 | km/h | GMK | official | |
| Gradeability | 46 | % | GMK | official | 20.5 R25 tires |
| Basic weight | 72.008 | t | GMK | official | 12x6, 20.5 R25 |
| Dimensions | 19.68 x 2.997 x 4.013 | m | GMK | official | width converted from 9 ft 10 in |

Model confusion: GMK6350 (this guide, 60 m boom, 100 t counterweight) is distinct from GMK6350L / GMK6300L (80 m boom, 92.5 t counterweight, "350 USt") and GMK6300L-1 (later upgrade). Atlas's current `capacityT: 350` for this crane is US tons; metric is about 317.5 t.
