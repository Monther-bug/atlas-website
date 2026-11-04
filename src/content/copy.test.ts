import { describe, expect, it } from 'vitest';
import { ar } from './ar';
import type { GalleryPhotoId } from './types';
import { en } from './en';

interface Leaf {
  path: string;
  value: string;
}

function leaves(value: unknown, path = ''): Leaf[] {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => leaves(item, path ? `${path}.${key}` : key));
  }
  return [];
}

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, shape(record[key])]));
  }
  return typeof value;
}

const placeholders = (text: string) => Array.from(text.matchAll(/\{(\w+)\}/g), (m) => m[1] ?? '').sort();

/** Arabic singular and dual name the number in words, so they carry no {n}. */
const PLURAL_WORDS = new Set(['grid.count.one', 'grid.count.two']);

const REQUEST_FIELDS = ['name', 'company', 'phone', 'crane', 'weight', 'radius', 'height', 'site', 'start', 'duration', 'message'];

const GALLERY_IDS = ['6374', '6376', '6379', '6380', '6382', '6388', '6393', '6360', '6364', '6396', '6397', '6398'] as const satisfies readonly GalleryPhotoId[];

describe('copy', () => {
  it('declares its language', () => {
    expect(ar.lang).toBe('ar');
    expect(en.lang).toBe('en');
  });

  it('lists the four services in the same order in both languages', () => {
    const order = ['crane-hire', 'heavy-transport', 'handling', 'oil-services'];
    expect(ar.services.items.map((item) => item.id)).toEqual(order);
    expect(en.services.items.map((item) => item.id)).toEqual(order);
  });

  it('captions every gallery photo in both languages', () => {
    for (const copy of [ar, en]) {
      expect(Object.keys(copy.sites.captions).sort()).toEqual([...GALLERY_IDS].sort());
      for (const id of GALLERY_IDS) expect(copy.sites.captions[id].trim().length, id).toBeGreaterThan(0);
    }
  });

  it('never uses U+202F as a number-unit separator', () => {
    for (const { path, value } of [...leaves(ar), ...leaves(en)]) {
      expect(value, path).not.toMatch(/\u202F/);
    }
  });

  it('has the same key structure in both languages', () => {
    expect(shape(en)).toEqual(shape(ar));
  });

  it('has no empty strings', () => {
    for (const { path, value } of [...leaves(ar), ...leaves(en)]) {
      expect(value.trim().length, path).toBeGreaterThan(0);
    }
  });

  it('uses Atlas’s own tagline as the H1', () => {
    expect(`${ar.hero.h1Lead} ${ar.hero.h1Main}`).toBe('من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة');
    expect(`${en.hero.h1Lead} ${en.hero.h1Main}`).toBe('From smaller cranes to the largest ones, every project has the right crane.');
  });

  it('uses the same {placeholders} in both languages', () => {
    const english = new Map(leaves(en).map((leaf) => [leaf.path, leaf.value]));
    for (const { path, value } of leaves(ar)) {
      if (PLURAL_WORDS.has(path)) continue;
      expect(placeholders(english.get(path) ?? ''), path).toEqual(placeholders(value));
    }
  });

  it('gives every template the runtime variables it needs', () => {
    for (const copy of [ar, en]) {
      expect(placeholders(copy.whatsapp.crane)).toEqual(['class', 'model']);
      expect(placeholders(copy.whatsapp.service)).toEqual(['service']);
      expect(placeholders(copy.whatsapp.followUp)).toEqual(['name', 'phone']);
      expect(placeholders(copy.whatsapp.request)).toEqual([...REQUEST_FIELDS].sort());
      expect(placeholders(copy.header.call.label)).toEqual(['phone']);
      expect(placeholders(copy.form.success.text)).toEqual(['phone']);
    }
  });

  it('keeps runtime values out of [[tokens]]', () => {
    for (const { path, value } of [...leaves(ar), ...leaves(en)]) {
      expect(value, path).not.toMatch(/\[\[(PHONE|WHATSAPP|WHATSAPP_INTL)\]\]/);
    }
  });

  it('uses no letter-spacing hacks in Arabic strings', () => {
    const arabic = leaves(ar).filter(({ value }) => /[؀-ۿ]/.test(value));
    expect(arabic.length).toBeGreaterThan(100);
    for (const { path, value } of arabic) {
      expect(value, path).not.toMatch(/ـ/); // tatweel stretching
      expect(value, path).not.toMatch(/[  ​]/); // thin, hair or zero-width spaces as tracking
      expect(value, path).not.toMatch(/(?:[؀-ۿA-Za-z] ){3,}/); // s p a c e d letters
    }
  });

  it('uses Arabic punctuation, not ASCII, in Arabic strings', () => {
    for (const { path, value } of leaves(ar).filter(({ value }) => /[\u0600-\u06FF]/.test(value))) {
      expect(value.replace(/\{[a-zA-Z]+\}|\[\[[^\]]*\]\]/g, ''), path).not.toMatch(/[,;?]/);
    }
  });

  it('writes no dash ranges in Arabic strings', () => {
    for (const { path, value } of leaves(ar)) {
      expect(value, path).not.toMatch(/\}\s*[–-]\s*\{|\d\s*–\s*\d/);
    }
  });

  it('keeps dialect words to the form title and lead', () => {
    for (const { path, value } of leaves(ar)) {
      if (path === 'form.title' || path === 'form.lead') continue;
      expect(value, path).not.toMatch(/(?<![\u0600-\u06FF])(?:شنو|اللي|معانا|خلي)(?![\u0600-\u06FF])/);
    }
  });

  it('closes every [[ marker with ]]', () => {
    for (const { path, value } of [...leaves(ar), ...leaves(en)]) {
      const opens = (value.match(/\[\[/g) ?? []).length;
      const closes = (value.match(/\]\]/g) ?? []).length;
      expect(closes, path).toBe(opens);
    }
  });
});
