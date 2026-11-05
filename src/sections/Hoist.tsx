import type { CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { ArrowIcon } from '@/components/Icons';
import { LoadTag } from '@/components/LoadTag';
import { Picture } from '@/components/Picture';
import { reveal, Section, SectionHeader } from '@/components/ui';
import { visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { getImage, type CropImage } from '@/generated/images';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';

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

/** In-page id of a crane's item: the stage's progress links point at it. */
export const hoistItemId = (crane: Pick<Crane, 'id'>) => `hoist-${crane.id}`;

/**
 * The fleet showcase (v2 spec §10, "Fleet showcase"): the cranes from the smallest to the largest, the capacity as
 * the hero. React renders a complete, static list (no JS, reduced motion, phones). On desktop motion, src/motion/hoist.ts
 * turns [data-hoist-stage] into a sticky, scrubbed stage that snaps to each crane and shows the progress links
 * ([data-hoist-chapters], display: none until then). The DOM hooks are contract C9: data-hoist, data-hoist-list,
 * data-hoist-item, data-hoist-photo, data-load-tag, data-counter, data-hook-anchor.
 */
export function Hoist() {
  const { copy } = useLang();
  return (
    <Section
      surface="dark"
      id="cranes"
      data-hoist=""
      aria-labelledby="hoist-title"
      // Black with the night ground's navy glow at the top, sized in rem: the staged section is several screens tall,
      // so `night` (sized in %) would wash the whole stage and scroll its grid behind it. The stage has its own glow.
      className="bg-[radial-gradient(110%_44rem_at_50%_-6rem,rgb(46_42_153/0.55),rgb(35_32_122/0.22)_42%,rgb(10_10_10/0)_72%)] bg-no-repeat"
    >
      <SectionHeader
        id="hoist-title"
        title={copy.hoist.title}
        lead={copy.hoist.intro}
        actions={
          <Button href="#crane-list" variant="plain" iconEnd={<ArrowIcon direction="down" className="size-4" />}>
            {copy.hoist.skipToList}
          </Button>
        }
      />

      {/* The caveat comes before the numbers it qualifies, not after five screens of them. */}
      <p className="t-small measure -mt-4 mb-(--space-head) text-(--surface-fg-3)">{copy.hoist.footnote}</p>

      <h3 id="hoist-list-title" className="sr-only">
        {copy.hoist.listHeading}
      </h3>
      {/* The track holds the sticky stage and, on desktop motion, the scroll length it stays stuck for. */}
      <div data-hoist-track="">
        <div data-hoist-stage="" className="flex flex-col">
          <ol data-hoist-list="" role="list" aria-labelledby="hoist-list-title" className="m-0 grid list-none gap-16 p-0 md:gap-20 lg:gap-28">
            {visibleCranes.map((crane) => (
              <HoistItem key={crane.id} crane={crane} />
            ))}
          </ol>
          <HoistChapters />
        </div>
      </div>

      {/* Inverse, not red: the header and the request bar already carry the page's red primaries. */}
      <div
        {...reveal('rise')}
        className="mt-(--space-head) flex flex-col items-start gap-6 border-t border-(--surface-line) pt-10 md:flex-row md:items-center md:justify-between"
      >
        <p className="t-sub measure m-0">{copy.hoist.closing}</p>
        <Button href="#request" variant="inverse">
          {copy.hoist.closingButton}
        </Button>
      </div>
    </Section>
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
    <li
      data-hoist-item=""
      data-crane={crane.id}
      data-capacity={crane.capacityT}
      id={hoistItemId(crane)}
      className="grid gap-6 md:gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-12"
    >
      {/* Reading start holds the readout (right in Arabic), the photo takes the other seven columns. */}
      <div
        data-hoist-photo=""
        style={box}
        className="frame aspect-[var(--ar-m)] md:aspect-[var(--ar-d)] lg:col-span-7 lg:col-start-6 lg:row-start-1"
      >
        <Picture
          photo={crane.hoistPhoto}
          crop="desktop_16x9"
          mobileCrop="mobile_4x5"
          alt={copy.alt[crane.hoistPhoto]}
          sizes="(min-width: 1440px) 61rem, (min-width: 1024px) 66vw, 100vw"
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
      <LoadTag crane={crane} className="lg:col-span-5 lg:col-start-1 lg:row-start-1" />
    </li>
  );
}

/**
 * The five capacities as links to their cranes. In the static list (phones, reduced motion, no JS) it is an index
 * above the list, so the whole range is on one screen. On the desktop stage it moves to the bottom and becomes the
 * progress: a thin track per crane fills as the story reaches it, and a link glides to that crane's snap point.
 */
function HoistChapters() {
  const { copy, lang } = useLang();
  return (
    <nav data-hoist-chapters="" aria-label={copy.hoist.chapters} className="order-first mb-10 lg:mb-14">
      <ol role="list" className="m-0 grid list-none grid-cols-5 gap-1.5 p-0">
        {visibleCranes.map((crane) => (
          <li key={crane.id} className="min-w-0">
            <a
              href={`#${hoistItemId(crane)}`}
              data-chapter={crane.id}
              className="flex min-h-11 flex-col justify-center gap-1.5 rounded-xs px-1 py-1 text-(--surface-fg-3) no-underline transition-colors duration-(--dur-state) ease-ui hover:text-white aria-[current=step]:text-white"
            >
              <span aria-hidden="true" data-chapter-track="" className="relative hidden h-0.5 overflow-hidden rounded-full bg-white/20">
                <span data-chapter-fill="" className="absolute inset-0 rounded-full bg-brand-500" />
              </span>
              <span className="text-[0.9375rem] leading-tight font-semibold tabular-nums">
                {formatNumber(crane.capacityT, lang)}
                {' '}
                {copy.hoist.unit}
              </span>
              <bdi lang="en" dir="ltr" className="max-w-full self-start truncate text-[0.75rem] leading-tight">
                {crane.model}
              </bdi>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
