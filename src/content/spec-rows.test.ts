import { describe, expect, it } from 'vitest';
import { ar } from './ar';
import { craneSpecs } from './crane-specs';
import { en } from './en';
import { SPEC_ORDER, sharedFields, specRows } from './spec-rows';

describe('specRows', () => {
  it('labels and formats the GMK6350 in English, with units and sources', () => {
    const rows = specRows(craneSpecs.gmk6350, en, 'en');
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(byId.maxCapacity).toMatchObject({ label: 'Max capacity', value: '317.5', unit: 't' });
    expect(byId.boom).toMatchObject({ value: '15.5–60', unit: 'm' });
    expect(byId.dimensions?.value).toBe('19.68 × 2.997 × 4.013');
    expect(byId.engine).toMatchObject({ latin: true });
    expect(byId.maxCapacity?.source?.official).toBe(true);
  });

  it('writes Arabic ranges as «من … إلى …» with Western digits', () => {
    const boom = specRows(craneSpecs.rt700e, ar, 'ar').find((r) => r.id === 'boom');
    expect(boom).toMatchObject({ value: 'من 11 إلى 33.5', unit: 'م', label: 'طول الذراع الرئيسي' });
  });

  it('omits fields the manufacturer data does not have (never estimates)', () => {
    const ids = specRows(craneSpecs['ac200-1'], en, 'en').map((r) => r.id);
    expect(ids).not.toContain('tipHeight');
    expect(ids).not.toContain('dimensions');
    expect(ids).not.toContain('country'); // not in the default order
  });

  it('keeps SPEC_ORDER order and builds a compare row set from the union of fields', () => {
    const ids = specRows(craneSpecs.quy250, en, 'en').map((r) => r.id);
    expect(ids).toEqual(SPEC_ORDER.filter((id) => ids.includes(id)));
    const shared = sharedFields(Object.values(craneSpecs), en, 'en');
    expect(shared).toContain('groundPressure'); // only the crawler has it
    expect(shared).not.toContain('maxRadius'); // nobody has it
  });

  it('translates known countries when asked for explicitly', () => {
    expect(specRows(craneSpecs.quy250, ar, 'ar', ['country'])[0]?.value).toBe('الصين');
  });
});
