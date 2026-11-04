import { DraftBadge } from '@/components/DraftBadge';
import type { Crane } from '@/content/types';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';

/** A white load tag on a short red rope. The counter holds the final value; Part D counts up to it. */
export function LoadTag({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  return (
    <div data-load-tag="" className="relative mt-14 w-fit min-w-[15rem] bg-white px-6 pt-6 pb-6 text-navy">
      <span aria-hidden="true" className="absolute bottom-full left-1/2 h-14 w-0.5 -translate-x-1/2 bg-red" />
      <span aria-hidden="true" className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 border-2 border-red bg-white" />
      {/* min-[26rem]: Model and Type sit side by side only once each column fits. */}
      <dl className="grid grid-cols-1 gap-x-6 min-[26rem]:grid-cols-2">
        <div className="min-[26rem]:col-span-2">
          <dt className="t-label text-ink">{copy.hoist.capacity}</dt>
          <dd className="t-readout mt-2 whitespace-nowrap">
            <span data-counter="" data-value={crane.capacityT} aria-hidden="true">
              {formatNumber(crane.capacityT, lang)}
            </span>
            <span className="sr-only">{formatNumber(crane.capacityT, lang)}</span>
            {' '}
            <span className="text-[0.36em] font-bold [font-stretch:100%] text-red">{copy.hoist.unit}</span>
          </dd>
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <dt className="t-label text-ink">{copy.hoist.model}</dt>
          <dd className="t-spec mt-1 text-ink">
            <bdi>
              {crane.make} {crane.model}
            </bdi>
          </dd>
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <dt className="t-label text-ink">{copy.hoist.type}</dt>
          <dd className="t-small mt-1 text-ink">{copy.craneTypes[crane.type].full}</dd>
        </div>
      </dl>
      <DraftBadge verified={crane.verified} className="mt-4" />
    </div>
  );
}
