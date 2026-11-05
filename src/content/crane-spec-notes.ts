import type { CraneSpecId } from './crane-specs';

/**
 * Research notes behind each manufacturer specification in crane-specs.ts: unit conversions, conflicts between
 * sources, and what each figure covers. English, for maintainers; never rendered (the site shows the curated
 * bilingual copy.grid.capacityNotes instead). A separate module so the notes stay out of the client bundle.
 */
export const craneSpecNotes: Record<CraneSpecId, readonly string[]> = {
  rt700e: [
    'Guide states "50-60 ton (50-55 mt)": 55 t is the metric-tonne figure for the 60 US-ton rating, so Atlas 55 t and 60 t are the same rating in different units.',
    'tipHeightJibM is the optional 33-56 ft bi-fold swingaway (10.1-17.1 m); 20 ft / 40 ft inserts raise it to 59.1 m / 65.2 m.',
    'Power is gross at 2,500 rpm. Gradeability is theoretical (guide).',
    'transportWeightT is the guide GVW for the basic machine with 110 ft boom and full pinned counterweight.',
    'Overall L x W x H not extracted: the guide gives them only in a drawing.',
  ],
  'atf60-3': [
    '60 t at 2.5 m is "over rear, with additional equipment"; over the standard working range the chart shows 55 t at 2.5 m (10.4 m boom).',
    'Counterweight 13.2 t is the chart total (standard 6.1 t + optional 7.1 t). transportWeightT 36 t includes only 5.0 t counterweight, 9/16 m extension, 32 t hook block.',
    'Gradeability 66% on 385/95 R25; 59% on 445/95 R25. Top speed 80 km/h.',
    'Carrier engine 240 kW at 2,200 rpm; 200 kW at 1,500 rpm during crane operation. All three axles steered and driven.',
    'tipHeightJibM (58.4 m) is secondary (Cranepedia); the brochure working-range diagram was not machine-readable.',
    'Country is taken from the publisher address (Tadano Faun GmbH, Lauf a.d. Pegnitz, Germany), not from an explicit "made in" statement.',
    'Not the ATF 60G-3 (a different, later model).',
  ],
  'ac200-1': [
    'Metric datasheet says "200 t Lifting Capacity"; the imperial (US) datasheet headline says "240 t". 200 t is used here (metric sheet).',
    'The 200 t duty needs a special attachment and applies at a short radius that could not be read reliably from the table; first standard row shown is about 147 t at 13 m.',
    'boomMinM is the shortest main-boom column (12.4 m) in the lifting-capacity table; boomMaxM is the 68 m 7-section boom. jibMaxM is the 33 m boom extension (9 m / 17 m offsets are also listed).',
    'Counterweight 69 t maximum. transportWeightT is 5 x 12,000 kg basic machine with hook block. Engine 390 kW at 1,800 rpm (carrier); superstructure 170 kW.',
    'Max tip height and overall dimensions are only in drawings; omitted.',
  ],
  quy250: [
    'Conflict: model name and Atlas copy say 250 t; Fuwa and Cranepedia state max rated capacity 260 t. Lectura lists 250 t.',
    'The Fuwa page could not be fetched directly (connection refused); its figures (260 t, 15.2-72.2 m) were read from a search-result excerpt. Verify before publishing.',
    'Engine 242 kW (Cranepedia) vs 246 kW (Lectura): sources disagree. Engine make not found.',
    'Track shoe width 1.2 m is from a spare-parts seller (secondary).',
    'transportWeightT is "total operating weight" 225 t (not a shipping weight); dimensions are the stated overall dimensions.',
    'Max lifting moment was not found for QUY250 (1,300 t.m belongs to the QUY250-1, a different model); omitted.',
  ],
  gmk6350: [
    'Guide is imperial: rating is 350 US tons (700,000 lb at 8 ft with 51 ft boom). 317.5 t metric and 2.44 m are CONVERTED (700,000 lb / 2,204.62; 8 ft x 0.3048). Do not display 350 as "t" without "US tons".',
    'This is the 5-section, 60 m GMK6350 guide (Manitowoc, 2020). The GMK6350L / GMK6300L (80 m seven-section boom, 92.5 t counterweight) is a different machine; GMK6300L-1 is the later upgrade.',
    'jibMaxM is the 21-61 m luffing jib; telescoping swingaway is 11-19 m.',
    'Engine: carrier OM502LA 420 kW at 1,800 rpm (superstructure OM906LA 205 kW). Gradeability 46% on 20.5 R25 tires. Optional 12x8x12.',
    'Width 2.997 m converted from 9 ft 10 in (16.00 R25 tires). Length 19,680 mm and height 4,013 mm are stated in the dimension drawing. transportWeightT is basic weight, 12x6, 20.5 R25 tires.',
  ],
};
