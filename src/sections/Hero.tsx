import type { CSSProperties } from 'react';
import { BUTTON_LG_HEIGHT, Button } from '@/components/Button';
import { ArrowIcon, WhatsAppIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { SlingSvg, cropVisibility, slingClearance, slingGeometry, slingMaxHeight } from '@/components/Sling';
import type { Lang } from '@/content/types';
import { getImage, type PhotoId } from '@/generated/images';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { whatsappHref } from '@/lib/whatsapp';

/** Spec §5.2: the real hook is on the right in 6398 (AR) and on the left in 6359 (EN). */
export const HERO_PHOTO: Record<Lang, PhotoId> = { ar: '6398', en: '6359' };

export function Hero() {
  const { copy, lang } = useLang();
  const photo = HERO_PHOTO[lang];
  const desktopImage = getImage(photo, 'desktop_16x9');
  const mobileImage = getImage(photo, 'mobile_9x16');
  const desktop = slingGeometry(desktopImage);
  const mobile = slingGeometry(mobileImage);
  // Photo-box bounds: room below the leg ends for the lg button plus a margin, and (md) a cap that keeps the
  // hook inside the side edges once a tall box makes the image height-driven and wider than the screen.
  const box = {
    ...(desktop
      ? {
          '--clear-d': slingClearance(desktop, desktopImage.rect, `${BUTTON_LG_HEIGHT.md} + 1.5rem`),
          '--max-d': slingMaxHeight(desktop, desktopImage.rect, '1rem'),
        }
      : {}),
    ...(mobile ? { '--clear-m': slingClearance(mobile, mobileImage.rect, `${BUTTON_LG_HEIGHT.base} + 1rem`) } : {}),
  } as CSSProperties;
  const slingVisibility = cropVisibility(desktop !== null, mobile !== null);
  const bandVisibility = cropVisibility(desktop === null, mobile === null);
  const href = whatsappHref(copy.whatsapp.general);
  const onWhatsApp = () => track('whatsapp_click', { location: 'hero' });
  const anchor = {
    ...(desktop ? { '--sx-d': desktop.anchorLeft, '--sy-d': desktop.anchorTop } : {}),
    ...(mobile ? { '--sx-m': mobile.anchorLeft, '--sy-m': mobile.anchorTop } : {}),
  } as CSSProperties;
  // Physical `left`: photos are never mirrored, so the hook is at the same x in both languages. --sx/--sy pick the
  // crop's anchor per breakpoint. The holder's left edge goes to the hook, then translate centres it (-50% of its
  // own width) but is clamped so both edges stay 1rem inside the photo whatever the label's width; max-w keeps
  // that clamp solvable (a longer label wraps instead). w-max: the absolute box must not squeeze the label.
  const holder = [
    'absolute z-10 w-max max-w-[calc(100cqw-2rem)]',
    '[--sx:var(--sx-m)] [--sy:var(--sy-m)] md:[--sx:var(--sx-d)] md:[--sy:var(--sy-d)]',
    'top-[var(--sy)] left-[var(--sx)] translate-x-[clamp(calc(1rem-var(--sx)),-50%,calc(100cqw-1rem-var(--sx)-100%))]',
    slingVisibility,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="top" data-hero="" data-ground="dark" aria-labelledby="hero-title" className="bg-navy-950 pt-[4.5rem] text-white">
      {/*
        Photo box: 60/40 on mobile, 74/26 from md (spec §5.2), minus the header strip. It grows past that only when
        the hook sits too low for the legs and the button to fit (6359 on wide screens and phones), and from md it
        never gets so tall that the height-driven image pushes the hook out at the side (tall portrait tablets).
      */}
      <div
        style={box}
        className="relative h-[max(calc(60svh-4.5rem),var(--clear-m,0px))] [container-type:size] md:h-[min(max(calc(74svh-4.5rem),var(--clear-d,0px)),var(--max-d,100svh))]"
      >
        <div data-hero-photo="" className="absolute inset-0 overflow-hidden">
          <Picture
            photo={photo}
            crop="desktop_16x9"
            mobileCrop="mobile_9x16"
            alt={copy.alt[photo]}
            sizes="100vw"
            priority
            pictureClassName="block h-full w-full"
            className="h-full w-full"
          />
        </div>
        {desktop && <SlingSvg geometry={desktop} className="hidden md:block" />}
        {mobile && <SlingSvg geometry={mobile} className="md:hidden" />}
        {slingVisibility !== null && (
          <div style={anchor} className={holder}>
            {/*
              The global ring sits 3px outside the button, on the photo, where white fails 3:1 against the clouds
              (WCAG 1.4.11). Here it is drawn inside the red instead: white on #C9221C is about 5.6:1.
            */}
            <Button
              href={href}
              external
              icon={<WhatsAppIcon className="size-5" />}
              onClick={onWhatsApp}
              className="focus-visible:outline-offset-[-6px]"
              data-sling-button=""
              data-testid="sling-whatsapp"
            >
              {copy.hero.whatsapp}
            </Button>
          </div>
        )}
      </div>

      <div className="shell flex min-h-[40svh] flex-col justify-center py-8 md:min-h-[26svh]">
        <h1 id="hero-title" data-split="" className="t-h1">
          <span className="block text-[0.55em]">{copy.hero.h1Lead}</span> <span className="block">{copy.hero.h1Main}</span>
        </h1>
        <div className="mt-6 flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
          <p data-intro="" className="t-lead text-steel">
            {copy.hero.servicesLine}
          </p>
          <div data-intro="" className="flex flex-wrap gap-3">
            {bandVisibility !== null && (
              <div className={bandVisibility}>
                <Button href={href} external icon={<WhatsAppIcon className="size-5" />} onClick={onWhatsApp} data-testid="hero-whatsapp">
                  {copy.hero.whatsapp}
                </Button>
              </div>
            )}
            <Button href="#cranes" variant="outline-on-dark" iconEnd={<ArrowIcon direction="down" className="size-5" />}>
              {copy.hero.browse}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
