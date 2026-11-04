import type { CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { LoadTag } from '@/components/LoadTag';
import { Picture } from '@/components/Picture';
import { visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { getImage, type CropImage } from '@/generated/images';
import { useLang } from '@/lib/lang';

/** The hook point as left/top percentages of its crop (the photo box has the crop's exact aspect ratio). */
export function hookPosition(image: CropImage): { left: string; top: string } | null {
  if (!image.hook) return null;
  const pct = (ratio: number) => `${Math.round(ratio * 10000) / 100}%`;
  return {
    left: pct((image.hook.x - image.rect.left) / image.rect.width),
    top: pct((image.hook.y - image.rect.top) / image.rect.height),
  };
}

/** Which viewports show the anchor, from whether each crop has a known hook point. */
export function cropVisibility(desktop: boolean, mobile: boolean): string | null {
  if (desktop && mobile) return '';
  if (desktop) return 'max-md:hidden';
  if (mobile) return 'md:hidden';
  return null;
}

export function Hoist() {
  const { copy } = useLang();
  return (
    <section id="cranes" data-hoist="" data-ground="dark" aria-labelledby="hoist-title" className="section-y bg-navy-950 text-white">
      <div className="shell">
        <h2 id="hoist-title" className="t-h2 text-balance">
          {copy.hoist.title}
        </h2>
        <p className="t-lead measure mt-5 text-steel">{copy.hoist.intro}</p>
        <a
          href="#crane-list"
          className="sr-only focus:not-sr-only focus:mt-6 focus:inline-flex focus:min-h-11 focus:items-center focus:font-semibold focus:underline"
        >
          {copy.hoist.skipToList}
        </a>

        <h3 id="hoist-list-title" className="sr-only">
          {copy.hoist.listHeading}
        </h3>
        <ol data-hoist-list="" role="list" aria-labelledby="hoist-list-title" className="mt-16 grid gap-24">
          {visibleCranes.map((crane) => (
            <HoistItem key={crane.id} crane={crane} />
          ))}
        </ol>

        <p className="t-small measure mt-20 text-steel">{copy.hoist.footnote}</p>
        <div className="mt-10 flex flex-col items-start gap-5 border-t border-line-dark pt-10 md:flex-row md:items-center md:justify-between">
          <p className="t-lead measure">{copy.hoist.closing}</p>
          <Button href="#request" variant="outline-on-dark">
            {copy.hoist.closingButton}
          </Button>
        </div>
      </div>
    </section>
  );
}

function HoistItem({ crane }: { crane: Crane }) {
  const { copy } = useLang();
  const desktop = getImage(crane.hoistPhoto, 'desktop_16x9');
  const mobile = getImage(crane.hoistPhoto, 'mobile_4x5');
  const hookD = hookPosition(desktop);
  const hookM = hookPosition(mobile);
  const anchorVisibility = cropVisibility(hookD !== null, hookM !== null);
  const box = {
    '--ar-d': `${desktop.rect.width} / ${desktop.rect.height}`,
    '--ar-m': `${mobile.rect.width} / ${mobile.rect.height}`,
    ...(hookD ? { '--hx-d': hookD.left, '--hy-d': hookD.top } : {}),
    ...(hookM ? { '--hx-m': hookM.left, '--hy-m': hookM.top } : {}),
  } as CSSProperties;

  return (
    <li data-hoist-item="" data-crane={crane.id} data-capacity={crane.capacityT} className="grid items-end gap-6 lg:grid-cols-12 lg:gap-10">
      <div
        data-hoist-photo=""
        style={box}
        className="relative aspect-[var(--ar-m)] overflow-hidden lg:col-span-7 md:aspect-[var(--ar-d)]"
      >
        <Picture
          photo={crane.hoistPhoto}
          crop="desktop_16x9"
          mobileCrop="mobile_4x5"
          alt={copy.alt[crane.hoistPhoto]}
          sizes="(min-width: 1024px) 58vw, 100vw"
          pictureClassName="block h-full w-full"
          className="h-full w-full"
        />
        {anchorVisibility !== null && (
          <span
            data-hook-anchor=""
            aria-hidden="true"
            className={`absolute top-[var(--hy-m)] left-[var(--hx-m)] size-0 md:top-[var(--hy-d)] md:left-[var(--hx-d)] ${anchorVisibility}`}
          />
        )}
      </div>
      <div className="lg:col-span-5">
        <LoadTag crane={crane} />
      </div>
    </li>
  );
}
