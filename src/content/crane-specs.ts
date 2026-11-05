/**
 * MANUFACTURER SPECIFICATIONS, NOT ATLAS-CONFIRMED FLEET DATA.
 *
 * Every figure here comes from the manufacturer's published product guide or
 * datasheet (official: true) or, where marked official: false, from a
 * secondary spec database. Atlas's actual machines may be older/newer
 * variants, differently equipped, or derated. Do not present these as
 * Atlas-verified ratings. Fields that could not be sourced are omitted rather
 * than estimated. Values converted from the source's imperial units are
 * flagged in `notes`. Full provenance: docs/research/crane-specs.md.
 */

export type CraneSpecId = 'rt700e' | 'atf60-3' | 'ac200-1' | 'quy250' | 'gmk6350';

export interface CraneSpecSource {
  /** The CraneSpec field name this source backs. */
  field: string;
  url: string;
  /** true = manufacturer document or manufacturer's own page; false = secondary database/dealer. */
  official: boolean;
}

export interface CraneSpec {
  /** Name as the manufacturer writes it. */
  officialName: string;
  manufacturer: string;
  /** Short descriptor as printed by the manufacturer, when it gives one. */
  descriptor?: string;
  maxCapacityT?: number;
  maxCapacityRadiusM?: number;
  boomMinM?: number;
  boomMaxM?: number;
  /** Max boom tip height without jib. */
  tipHeightM?: number;
  /** Longest jib/extension offered. */
  jibMaxM?: number;
  /** Max tip height with jib. */
  tipHeightJibM?: number;
  maxRadiusM?: number;
  counterweightT?: number;
  axles?: number;
  drive?: string;
  engineMake?: string;
  enginePowerKw?: number;
  travelSpeedKmh?: number;
  gradeabilityPct?: number;
  /** Weight as stated by the manufacturer for a basic road-ready configuration (see notes per model). */
  transportWeightT?: number;
  dimensionsM?: { l: number; w: number; h: number };
  trackWidthM?: number;
  groundPressureMpa?: number;
  countryOfManufacture?: string;
  notes: string[];
  sources: CraneSpecSource[];
}

const RT = 'https://cdn.cranemarket.com/specifications/grove-rough-terrain-cranes-spec-1c7ab0.pdf';
const ATF = 'https://www.kanizsakran.hu/assets/pdf/tadano-faun-atf-60-3.pdf';
const ATF2 = 'https://cranepedia.com/spec/all-terrain-crane/tadano-atf60-3/';
const AC = 'https://www.hareket.com/uploads/vinçler/Ac200-1.pdf';
const GMK = 'https://www.manitowoc.com/sites/default/files/media/divers/file/2020-01/GMK6350-Product-Guide-Imperial.pdf';
const FUWA = 'https://fuwaglobal.com/caseshow.php?cid=35&id=136';
const QUY2 = 'https://cranepedia.com/spec/crawler-crane/fuwa-quy250';
const QUY3 = 'https://www.craneundercarriage.com/info/fuwa-quy250-undercarriage-parts-19741822.html';

export const craneSpecs: Record<CraneSpecId, CraneSpec> = {
  rt700e: {
    officialName: 'Grove RT700E',
    manufacturer: 'Manitowoc (Grove)',
    descriptor: 'Rough Terrain Hydraulic Crane',
    maxCapacityT: 55,
    boomMinM: 11,
    boomMaxM: 33.5,
    tipHeightM: 36.4,
    jibMaxM: 17.1,
    tipHeightJibM: 53.2,
    counterweightT: 5.553,
    axles: 2,
    drive: '4x4',
    engineMake: 'Cummins QSB 6.7 (Tier III)',
    enginePowerKw: 179,
    travelSpeedKmh: 37,
    gradeabilityPct: 75,
    transportWeightT: 38.618,
    notes: [
      'Guide states "50-60 ton (50-55 mt)": 55 t is the metric-tonne figure for the 60 US-ton rating, so Atlas 55 t and 60 t are the same rating in different units.',
      'tipHeightJibM is the optional 33-56 ft bi-fold swingaway (10.1-17.1 m); 20 ft / 40 ft inserts raise it to 59.1 m / 65.2 m.',
      'Power is gross at 2,500 rpm. Gradeability is theoretical (guide).',
      'transportWeightT is the guide GVW for the basic machine with 110 ft boom and full pinned counterweight.',
      'Overall L x W x H not extracted: the guide gives them only in a drawing.',
    ],
    sources: [
      { field: 'maxCapacityT', url: RT, official: true },
      { field: 'boomMinM', url: RT, official: true },
      { field: 'boomMaxM', url: RT, official: true },
      { field: 'tipHeightM', url: RT, official: true },
      { field: 'jibMaxM', url: RT, official: true },
      { field: 'tipHeightJibM', url: RT, official: true },
      { field: 'counterweightT', url: RT, official: true },
      { field: 'axles', url: RT, official: true },
      { field: 'enginePowerKw', url: RT, official: true },
      { field: 'travelSpeedKmh', url: RT, official: true },
      { field: 'gradeabilityPct', url: RT, official: true },
      { field: 'transportWeightT', url: RT, official: true },
    ],
  },
  'atf60-3': {
    officialName: 'Tadano Faun ATF 60-3',
    manufacturer: 'Tadano Faun GmbH',
    descriptor: 'All-Terrain',
    maxCapacityT: 60,
    maxCapacityRadiusM: 2.5,
    boomMinM: 10.4,
    boomMaxM: 40.2,
    jibMaxM: 16,
    tipHeightJibM: 58.4,
    counterweightT: 13.2,
    axles: 3,
    drive: '6x6',
    engineMake: 'Mercedes-Benz OM 926 LA',
    enginePowerKw: 240,
    travelSpeedKmh: 80,
    gradeabilityPct: 66,
    transportWeightT: 36,
    countryOfManufacture: 'Germany',
    notes: [
      '60 t at 2.5 m is "over rear, with additional equipment"; over the standard working range the chart shows 55 t at 2.5 m (10.4 m boom).',
      'Counterweight 13.2 t is the chart total (standard 6.1 t + optional 7.1 t). transportWeightT 36 t includes only 5.0 t counterweight, 9/16 m extension, 32 t hook block.',
      'Gradeability 66% on 385/95 R25; 59% on 445/95 R25. Top speed 80 km/h.',
      'Carrier engine 240 kW at 2,200 rpm; 200 kW at 1,500 rpm during crane operation. All three axles steered and driven.',
      'tipHeightJibM (58.4 m) is secondary (Cranepedia); the brochure working-range diagram was not machine-readable.',
      'Country is taken from the publisher address (Tadano Faun GmbH, Lauf a.d. Pegnitz, Germany), not from an explicit "made in" statement.',
      'Not the ATF 60G-3 (a different, later model).',
    ],
    sources: [
      { field: 'maxCapacityT', url: ATF, official: true },
      { field: 'maxCapacityRadiusM', url: ATF, official: true },
      { field: 'boomMinM', url: ATF, official: true },
      { field: 'boomMaxM', url: ATF, official: true },
      { field: 'jibMaxM', url: ATF, official: true },
      { field: 'tipHeightJibM', url: ATF2, official: false },
      { field: 'counterweightT', url: ATF, official: true },
      { field: 'axles', url: ATF, official: true },
      { field: 'enginePowerKw', url: ATF, official: true },
      { field: 'travelSpeedKmh', url: ATF, official: true },
      { field: 'gradeabilityPct', url: ATF, official: true },
      { field: 'transportWeightT', url: ATF, official: true },
      { field: 'countryOfManufacture', url: ATF, official: true },
    ],
  },
  'ac200-1': {
    officialName: 'AC 200-1',
    manufacturer: 'Terex Demag',
    descriptor: 'All Terrain Crane, 200 t Lifting Capacity',
    maxCapacityT: 200,
    boomMinM: 12.4,
    boomMaxM: 68,
    jibMaxM: 33,
    counterweightT: 69,
    axles: 5,
    drive: '10x8x8',
    engineMake: 'Mercedes-Benz (DaimlerChrysler) OM 502 LA',
    enginePowerKw: 390,
    travelSpeedKmh: 85,
    gradeabilityPct: 71,
    transportWeightT: 60,
    notes: [
      'Metric datasheet says "200 t Lifting Capacity"; the imperial (US) datasheet headline says "240 t". 200 t is used here (metric sheet).',
      'The 200 t duty needs a special attachment and applies at a short radius that could not be read reliably from the table; first standard row shown is about 147 t at 13 m.',
      'boomMinM is the shortest main-boom column (12.4 m) in the lifting-capacity table; boomMaxM is the 68 m 7-section boom. jibMaxM is the 33 m boom extension (9 m / 17 m offsets are also listed).',
      'Counterweight 69 t maximum. transportWeightT is 5 x 12,000 kg basic machine with hook block. Engine 390 kW at 1,800 rpm (carrier); superstructure 170 kW.',
      'Max tip height and overall dimensions are only in drawings; omitted.',
    ],
    sources: [
      { field: 'maxCapacityT', url: AC, official: true },
      { field: 'boomMinM', url: AC, official: true },
      { field: 'boomMaxM', url: AC, official: true },
      { field: 'jibMaxM', url: AC, official: true },
      { field: 'counterweightT', url: AC, official: true },
      { field: 'axles', url: AC, official: true },
      { field: 'enginePowerKw', url: AC, official: true },
      { field: 'travelSpeedKmh', url: AC, official: true },
      { field: 'gradeabilityPct', url: AC, official: true },
      { field: 'transportWeightT', url: AC, official: true },
    ],
  },
  quy250: {
    officialName: 'QUY250',
    manufacturer: 'Fuwa',
    descriptor: '250 t hydraulic crawler crane',
    maxCapacityT: 260,
    boomMinM: 15.2,
    boomMaxM: 72.2,
    jibMaxM: 36,
    counterweightT: 88.5,
    enginePowerKw: 242,
    travelSpeedKmh: 1.2,
    gradeabilityPct: 30,
    transportWeightT: 225,
    dimensionsM: { l: 12.31, w: 3.28, h: 3.552 },
    trackWidthM: 1.2,
    groundPressureMpa: 0.114,
    countryOfManufacture: 'China',
    notes: [
      'Conflict: model name and Atlas copy say 250 t; Fuwa and Cranepedia state max rated capacity 260 t. Lectura lists 250 t.',
      'The Fuwa page could not be fetched directly (connection refused); its figures (260 t, 15.2-72.2 m) were read from a search-result excerpt. Verify before publishing.',
      'Engine 242 kW (Cranepedia) vs 246 kW (Lectura): sources disagree. Engine make not found.',
      'Track shoe width 1.2 m is from a spare-parts seller (secondary).',
      'transportWeightT is "total operating weight" 225 t (not a shipping weight); dimensions are the stated overall dimensions.',
      'Max lifting moment was not found for QUY250 (1,300 t.m belongs to the QUY250-1, a different model); omitted.',
    ],
    sources: [
      { field: 'maxCapacityT', url: FUWA, official: true },
      { field: 'boomMinM', url: FUWA, official: true },
      { field: 'boomMaxM', url: FUWA, official: true },
      { field: 'jibMaxM', url: QUY2, official: false },
      { field: 'counterweightT', url: QUY2, official: false },
      { field: 'enginePowerKw', url: QUY2, official: false },
      { field: 'travelSpeedKmh', url: QUY2, official: false },
      { field: 'gradeabilityPct', url: QUY2, official: false },
      { field: 'transportWeightT', url: QUY2, official: false },
      { field: 'dimensionsM', url: QUY2, official: false },
      { field: 'trackWidthM', url: QUY3, official: false },
      { field: 'groundPressureMpa', url: QUY2, official: false },
      { field: 'countryOfManufacture', url: FUWA, official: true },
    ],
  },
  gmk6350: {
    officialName: 'Grove GMK6350',
    manufacturer: 'Manitowoc (Grove)',
    maxCapacityT: 317.5,
    maxCapacityRadiusM: 2.44,
    boomMinM: 15.5,
    boomMaxM: 60,
    tipHeightM: 63,
    jibMaxM: 61,
    counterweightT: 100,
    axles: 6,
    drive: '12x6x12',
    engineMake: 'Mercedes-Benz OM502LA',
    enginePowerKw: 420,
    travelSpeedKmh: 77,
    gradeabilityPct: 46,
    transportWeightT: 72.008,
    dimensionsM: { l: 19.68, w: 2.997, h: 4.013 },
    notes: [
      'Guide is imperial: rating is 350 US tons (700,000 lb at 8 ft with 51 ft boom). 317.5 t metric and 2.44 m are CONVERTED (700,000 lb / 2,204.62; 8 ft x 0.3048). Do not display 350 as "t" without "US tons".',
      'This is the 5-section, 60 m GMK6350 guide (Manitowoc, 2020). The GMK6350L / GMK6300L (80 m seven-section boom, 92.5 t counterweight) is a different machine; GMK6300L-1 is the later upgrade.',
      'jibMaxM is the 21-61 m luffing jib; telescoping swingaway is 11-19 m.',
      'Engine: carrier OM502LA 420 kW at 1,800 rpm (superstructure OM906LA 205 kW). Gradeability 46% on 20.5 R25 tires. Optional 12x8x12.',
      'Width 2.997 m converted from 9 ft 10 in (16.00 R25 tires). Length 19,680 mm and height 4,013 mm are stated in the dimension drawing. transportWeightT is basic weight, 12x6, 20.5 R25 tires.',
    ],
    sources: [
      { field: 'maxCapacityT', url: GMK, official: true },
      { field: 'maxCapacityRadiusM', url: GMK, official: true },
      { field: 'boomMinM', url: GMK, official: true },
      { field: 'boomMaxM', url: GMK, official: true },
      { field: 'tipHeightM', url: GMK, official: true },
      { field: 'jibMaxM', url: GMK, official: true },
      { field: 'counterweightT', url: GMK, official: true },
      { field: 'axles', url: GMK, official: true },
      { field: 'enginePowerKw', url: GMK, official: true },
      { field: 'travelSpeedKmh', url: GMK, official: true },
      { field: 'gradeabilityPct', url: GMK, official: true },
      { field: 'transportWeightT', url: GMK, official: true },
      { field: 'dimensionsM', url: GMK, official: true },
    ],
  },
};
