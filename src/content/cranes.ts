import type { PhotoId } from '@/generated/images';
import type { Crane } from './types';

/**
 * Kobelco photos (6367, 6370, 6371) are never processed (C6), so they are not
 * PhotoIds. The ids are kept only as a record of the source photos; getImage()
 * would throw if this crane were ever rendered, which is the safe failure.
 */
const unprocessed = (id: string) => id as PhotoId;

/**
 * Models are as printed on the machines in Atlas's photos. Capacities are the
 * manufacturers' max ratings (spec §3), NOT confirmed by Atlas: verified stays
 * false until they are, and the truth gate blocks production until then.
 */
export const cranes: readonly Crane[] = [
  { id: 'rt700e', make: 'Grove', model: 'RT700E', type: 'rough-terrain', capacityT: 55, hoistPhoto: '6364', cardPhoto: '6363', verified: false, hidden: false },
  { id: 'atf60-3', make: 'Tadano Faun', model: 'ATF 60-3', type: 'all-terrain', capacityT: 60, hoistPhoto: '6395', cardPhoto: '6397', verified: false, hidden: false },
  { id: 'ac200-1', make: 'Terex', model: 'AC200-1', type: 'all-terrain', capacityT: 200, hoistPhoto: '6375', cardPhoto: '6376', verified: false, hidden: false },
  { id: 'quy250', make: 'Fuwa (FW.China)', model: 'QUY250', type: 'crawler', capacityT: 250, hoistPhoto: '6385', cardPhoto: '6380', verified: false, hidden: false },
  { id: 'gmk6350', make: 'Grove', model: 'GMK6350', type: 'all-terrain', capacityT: 350, hoistPhoto: '6389', cardPhoto: '6392', verified: false, hidden: false },
  // Hidden: carries another company's logo. Capacity unknown ([[CAPACITY:CKE2500]]); 0 is a placeholder that is never shown.
  { id: 'cke2500', make: 'Kobelco', model: 'CKE2500', type: 'crawler', capacityT: 0, hoistPhoto: unprocessed('6370'), cardPhoto: unprocessed('6367'), verified: false, hidden: true },
];
