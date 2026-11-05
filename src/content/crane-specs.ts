/**
 * MANUFACTURER SPECIFICATIONS, NOT ATLAS-CONFIRMED FLEET DATA.
 *
 * Every figure here comes from the manufacturer's published product guide or
 * datasheet (official: true) or, where marked official: false, from a
 * secondary spec database. Atlas's actual machines may be older/newer
 * variants, differently equipped, or derated. Do not present these as
 * Atlas-verified ratings. Fields that could not be sourced are omitted rather
 * than estimated. Values converted from the source's imperial units are
 * flagged in the research notes (crane-spec-notes.ts, kept out of the client
 * bundle). Full provenance: docs/research/crane-specs.md.
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
