import { describe, expect, it } from 'vitest';
import { getImage, type CropImage } from '@/generated/images';
import { cropVisibility, slingClearance, slingGeometry, slingMaxHeight } from './Sling';

const image = (hook: CropImage['hook']): CropImage => ({
  photo: '6398',
  crop: 'desktop_16x9',
  rect: { left: 0, top: 0, width: 4240, height: 2385 },
  avif: [],
  webp: [],
  hook,
});

describe('slingGeometry', () => {
  it('is null when the crop has no hook point', () => {
    expect(slingGeometry(image(null))).toBeNull();
  });

  it('hangs two legs ~110 source px below the hook and anchors the button there', () => {
    expect(slingGeometry(image({ x: 3000, y: 400 }))).toEqual({
      viewBox: '0 0 4240 2385',
      pin: { x: 3000, y: 400 },
      legEnds: [
        { x: 2966.2, y: 509.3 },
        { x: 3033.8, y: 509.3 },
      ],
      pinRadius: 13.9,
      anchorLeft: 'calc(50cqw + 880 * max(100cqw / 4240, 100cqh / 2385))',
      anchorTop: 'calc(509.3 * max(100cqw / 4240, 100cqh / 2385))',
    });
  });

  it('measures from the crop centre and top, so offset crops work', () => {
    // Shaped like 6398's 9:16 crop (x 2290–3641) with its C11 hook point, plus a 100 px top offset.
    const offset: CropImage = { ...image({ x: 3226, y: 1300 }), crop: 'mobile_9x16', rect: { left: 2290, top: 100, width: 1351, height: 2401 } };
    const g = slingGeometry(offset);
    expect(g?.viewBox).toBe('2290 100 1351 2401');
    expect(g?.legEnds).toEqual([
      { x: 3192, y: 1410 },
      { x: 3260, y: 1410 },
    ]);
    expect(g?.anchorLeft).toBe('calc(50cqw + 260.5 * max(100cqw / 1351, 100cqh / 2401))');
    expect(g?.anchorTop).toBe('calc(1310 * max(100cqw / 1351, 100cqh / 2401))');
  });
});

/** Evaluates the helpers' CSS lengths in px for a viewport `vw` px wide (1rem = 16px). */
const px = (css: string, vw: number): number =>
  Function(
    `return ${css
      .replace(/calc\(/g, '(')
      .replace(/(\d+(?:\.\d+)?)vw/g, (_, n: string) => `(${n} * ${vw} / 100)`)
      .replace(/(\d+(?:\.\d+)?)rem/g, (_, n: string) => `(${n} * 16)`)}`,
  )() as number;

describe('slingClearance', () => {
  it('is the full-width box height that keeps the leg ends plus the given space below them inside the photo', () => {
    // Leg ends at 509.3 source px; a full-width box shows the crop at 100vw / 4240 per source pixel.
    const desktop = image({ x: 3000, y: 400 });
    expect(slingClearance(slingGeometry(desktop)!, desktop.rect, '3.5rem + 1.5rem')).toBe('calc(509.3 * 100vw / 4240 + 3.5rem + 1.5rem)');
    const offset: CropImage = { ...image({ x: 3226, y: 1300 }), rect: { left: 2290, top: 100, width: 1351, height: 2401 } };
    expect(slingClearance(slingGeometry(offset)!, offset.rect, '4.25rem')).toBe('calc(1310 * 100vw / 1351 + 4.25rem)');
  });
});

describe('slingMaxHeight', () => {
  it('caps the box so the height-driven, centred image keeps the pin and both legs `margin` inside the side edges', () => {
    // dx = 3000 - 2120 = 880, spread 33.8: H <= (50vw - margin) * 2385 / 913.8 = 2.6099…, floored to 2.609.
    const desktop = image({ x: 3000, y: 400 });
    expect(slingMaxHeight(slingGeometry(desktop)!, desktop.rect, '1rem')).toBe('calc((50vw - 1rem) * 2.609)');
    // A hook left of centre measures the same way (|dx| = 2120 - 1391 = 729).
    const left = image({ x: 1391, y: 1600 });
    expect(slingMaxHeight(slingGeometry(left)!, left.rect, '1rem')).toBe('calc((50vw - 1rem) * 3.126)');
  });

  it('never undercuts the clearance, and keeps the legs on screen, for the real hero crops at md widths', () => {
    for (const photo of ['6398', '6359'] as const) {
      const crop = getImage(photo, 'desktop_16x9');
      const g = slingGeometry(crop)!;
      for (const w of [768, 800, 1024, 1280, 1440, 1920, 2560]) {
        const cap = px(slingMaxHeight(g, crop.rect, '1rem'), w);
        expect(cap, `${photo} @${w}`).toBeGreaterThanOrEqual(px(slingClearance(g, crop.rect, '3.5rem + 1.5rem'), w));
        // At the cap the scale is height-driven (the cap is above the width-driven threshold) ...
        expect(cap / crop.rect.height, `${photo} @${w}`).toBeGreaterThanOrEqual(w / crop.rect.width);
        // ... and the outer leg end sits at least 1rem inside the edge.
        const s = cap / crop.rect.height;
        const centre = crop.rect.left + crop.rect.width / 2;
        for (const end of g.legEnds) {
          const x = w / 2 + (end.x - centre) * s;
          expect(x, `${photo} @${w}`).toBeGreaterThanOrEqual(16 - 0.5);
          expect(x, `${photo} @${w}`).toBeLessThanOrEqual(w - 16 + 0.5);
        }
      }
    }
  });
});

describe('cropVisibility', () => {
  it('maps which crops have a value to CSS visibility classes', () => {
    expect(cropVisibility(true, true)).toBe('');
    expect(cropVisibility(true, false)).toBe('hidden md:block');
    expect(cropVisibility(false, true)).toBe('md:hidden');
    expect(cropVisibility(false, false)).toBeNull();
  });
});
