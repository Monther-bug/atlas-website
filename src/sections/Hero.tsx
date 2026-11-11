import type { CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { ArrowIcon, WhatsAppIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import type { Lang } from '@/content/types';
import { getImage, type CropImage, type PhotoId } from '@/generated/images';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { whatsappHref } from '@/lib/whatsapp';
import './hero.css';

/** Spec §5.2: the real hook is on the right in 6398 (AR) and on the left in 6359 (EN). Photos are never mirrored. */
/**
 * The 9:16 crop is chosen by shape, not width: any portrait viewport (phones, tablets upright) gets it, so the real
 * hook is always on screen (the 16:9 crop in a tall box would push it off the side). hero.css uses the same query.
 */
export const PORTRAIT = '(max-aspect-ratio: 1/1)';
export const HERO_PHOTO: Record<Lang, PhotoId> = { ar: '6398', en: '6359' };

/**
 * The real hook of a crop, mapped into the hero box for the hero's bottom-anchored `object-fit: cover` photo, which
 * fills the first screen: the hero's width (100cqw) by its `--stage` height (hero.css; in portrait the hero itself may
 * run taller, the photo does not). CSS Images 3: scale = max(W / w, H / h), x centred, y from the stage's bottom.
 * Pure CSS: it renders in the prerender and stays on the hook at every size, with no JS.
 */
export function hookCss(image: CropImage): { x: string; y: string } | null {
  const { rect, hook } = image;
  if (!hook) return null;
  const px = `max(100cqw / ${rect.width}, var(--stage) / ${rect.height})`;
  const dx = Math.round(hook.x - (rect.left + rect.width / 2));
  const dy = Math.round(rect.top + rect.height - hook.y);
  return { x: `calc(50cqw + ${dx} * ${px})`, y: `calc(var(--stage) - ${dy} * ${px})` };
}

/** Which physical side of the frame the hook is on: the cut passes under the load there and rises to the other side. */
export function hookSide(image: CropImage): 'left' | 'right' | null {
  const { rect, hook } = image;
  if (!hook) return null;
  return hook.x - rect.left > rect.width / 2 ? 'right' : 'left';
}

/**
 * The hero, direction B «زاوية الرفع» / "The Luff" (docs/reviews/hero-concepts.md, chosen 5 Nov 2026).
 * The real photo fills the first screen (so the H1, not the image, is the LCP element: full-viewport images are
 * background to Chrome's LCP). A black field, with a brand-navy plane riding along its edge, is cut on one straight
 * rake that passes just under the WhatsApp load hanging from the real hook; the headline sits on the field, its lines
 * starting on the cut. Text never sits on the sky. Motion (src/motion/hero.ts) luffs the cut and pays out the load.
 * Copy: Atlas's direction of 11 Nov 2026 (deck §3): a two-line H1, a thin lead under it, then "Browse cranes".
 */
export function Hero() {
  const { copy, lang } = useLang();
  const photo = HERO_PHOTO[lang];
  const desktop = getImage(photo, 'desktop_16x9');
  const mobile = getImage(photo, 'mobile_9x16');
  const d = hookCss(desktop);
  const m = hookCss(mobile);
  const start = lang === 'ar' ? 'right' : 'left';
  const sideD = hookSide(desktop);
  const sideM = hookSide(mobile);
  const vars = {
    ...(d ? { '--hx-d': d.x, '--hy-d': d.y } : {}),
    ...(m ? { '--hx-m': m.x, '--hy-m': m.y } : {}),
  } as CSSProperties;
  const href = whatsappHref(copy.whatsapp.general);
  const onWhatsApp = () => track('whatsapp_click', { location: 'hero' });
  // Two lines, short then long, so the lines climb the rake: «شريك تشغيلي / يواكب احتياجات المشاريع».
  const [line1, line2] = copy.hero.h1;

  return (
    <section
      id="top"
      data-hero=""
      data-ground="dark"
      aria-labelledby="hero-title"
      className="hero"
      style={vars}
      // Per breakpoint: the hook's side, and whether the cut is on the reading-start side of the text ("start":
      // the lines step along it) or on its end side ("end": the cut runs nearly flat above the text).
      data-near-d={sideD ?? undefined}
      data-near-m={sideM ?? undefined}
      data-cut-d={sideD === start ? 'start' : 'end'}
      data-cut-m={sideM === start ? 'start' : 'end'}
      data-sling-d={d ? '' : undefined}
      data-sling-m={m ? '' : undefined}
    >
      <div className="hero-photo" data-hero-photo="">
        <Picture
          photo={photo}
          crop="desktop_16x9"
          mobileCrop="mobile_9x16"
          mobileMedia={PORTRAIT}
          alt={copy.alt[photo]}
          sizes="100vw"
          priority
          pictureClassName="hero-picture"
          className="hero-img"
        />
      </div>
      {/* The WebGL depth layer's slot (desktop, fine pointer, after the intro: src/motion/hero-gl.ts). */}
      <div className="hero-gl" data-hero-gl="" aria-hidden="true" />
      <div className="hero-fields" data-hero-field="" aria-hidden="true">
        <div className="hero-field hero-field--accent" />
        <div className="hero-field" />
      </div>

      <div className="hero-text">
        <h1 id="hero-title" className="hero-h1">
          <span className="hero-line hero-line-1">{line1}</span>{' '}
          <span className="hero-line hero-line-2">{line2}</span>
        </h1>
      </div>

      {/* The load: the WhatsApp button on two sling legs from the real hook (only where the crop has a hook point). */}
      <div className="hero-rig" data-hero-rig="">
        <svg className="hero-legs" data-sling="" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path data-sling-leg="" d="M50 0L0 100" vectorEffect="non-scaling-stroke" />
          <path data-sling-leg="" d="M50 0L100 100" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="hero-pin" data-hook-pin="" aria-hidden="true" />
        {/* The outer box centres and clamps the load in CSS; motion only ever moves the inner one. */}
        <div className="hero-load">
          <div data-hero-load="">
            <Button
              href={href}
              external
              icon={<WhatsAppIcon className="size-5" />}
              onClick={onWhatsApp}
              className="hero-whatsapp"
              data-sling-button=""
              data-testid="sling-whatsapp"
            >
              {copy.hero.whatsapp}
            </Button>
          </div>
        </div>
      </div>

      <div className="hero-foot">
        {/* The lead (thin, small), then "Browse cranes" on its own row. */}
        <p className="hero-sub">{copy.hero.lead}</p>
        {/* Without a hook point for this crop, the WhatsApp button sits here instead of on the sling. */}
        {(!d || !m) && (
          <div className="hero-foot-whatsapp">
            <Button href={href} external icon={<WhatsAppIcon className="size-5" />} onClick={onWhatsApp} data-testid="hero-whatsapp">
              {copy.hero.whatsapp}
            </Button>
          </div>
        )}
        <a href="#cranes" className="hero-browse">
          <span>{copy.hero.browse}</span>
          <ArrowIcon direction="down" className="size-5" />
        </a>
      </div>
    </section>
  );
}
