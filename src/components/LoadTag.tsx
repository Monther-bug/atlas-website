import { Button } from '@/components/Button';
import { DraftBadge } from '@/components/DraftBadge';
import { HookIcon } from '@/components/Icons';
import { fill } from '@/components/ui';
import type { Crane } from '@/content/types';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { setRequestedCrane, useRequestedCrane } from '@/lib/request';

/**
 * The readout of one crane in the fleet showcase (v2): the capacity as the hero numeral, its make and model, its type
 * and, where the machine shows a different number (the GMK6350's boom reads "350 TON"), a line that explains it. Then
 * one tap to ask for this crane: it goes on the hook (the request bar and WhatsApp text name it; ride.ts flies it).
 * The counter already holds the final value; the motion layer counts up to it on its aria-hidden copy only.
 * `data-load-tag` is the C9 hook the stage hangs from its rope.
 */
export function LoadTag({ crane, className = '' }: { crane: Crane; className?: string }) {
  const { copy, lang } = useLang();
  const capacity = formatNumber(crane.capacityT, lang);
  const note = copy.hoist.ratingNotes[crane.id];
  const name = `${crane.make} ${crane.model}`;
  const onHook = useRequestedCrane() === crane.id;
  return (
    <div data-load-tag="" className={`@container min-w-0 ${className}`}>
      <dl className="m-0 flex flex-wrap items-center gap-x-4 gap-y-4">
        <div className="basis-full">
          <dt className="t-tag flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span>{copy.hoist.capacity}</span>
            <DraftBadge verified={crane.verified} />
          </dt>
          {/* Poppins figures; 26cqi keeps "317.5 t" on one line in any column. */}
          <dd data-readout="" className="t-readout m-0 mt-2 text-[length:clamp(4rem,26cqi,9rem)] whitespace-nowrap">
            <span data-counter="" data-value={crane.capacityT} aria-hidden="true">
              {capacity}
            </span>
            <span className="sr-only">{capacity}</span>
            <span className="t-accent ms-[0.12em] text-[0.3em] font-medium tracking-normal">
              {' '}
              {copy.hoist.unit}
            </span>
          </dd>
        </div>
        <div>
          <dt className="sr-only">{copy.hoist.model}</dt>
          {/* A heading per crane, so screen-reader users can jump crane to crane (h2 > sr-only h3 list > h4). */}
          <dd className="m-0">
            <h4 className="t-title m-0">
              <bdi lang="en" dir="ltr">
                {name}
              </bdi>
            </h4>
          </dd>
        </div>
        <div>
          <dt className="sr-only">{copy.hoist.type}</dt>
          {/* Brand navy fill, white text (9.3:1); brand-600 so the pill still reads as blue on black. */}
          <dd className="m-0">
            <span className="ui-chip bg-brand-600! text-white!">{copy.craneTypes[crane.type].chip}</span>
          </dd>
        </div>
      </dl>
      {note ? (
        <p className="t-small mt-5 mb-0 max-w-[30rem] text-(--surface-fg-2)">{fill(note, { capacity: `${capacity} ${copy.hoist.unit}` })}</p>
      ) : null}
      {/* Pressed while this crane is on the hook (the request bar names it); WhatsApp or the form then sends it. */}
      <Button
        variant="ghost-dark"
        size="sm"
        className="mt-6 aria-pressed:border-(--surface-accent) aria-pressed:text-(--surface-accent)"
        aria-pressed={onHook}
        icon={<HookIcon className="size-5" />}
        data-hoist-request={crane.id}
        onClick={(event) => {
          setRequestedCrane(crane.id, event.currentTarget);
          track('request_crane', { crane_id: crane.id, location: 'hoist' });
        }}
      >
        {copy.grid.card.request}
        <span className="sr-only">
          : <bdi>{name}</bdi>
        </span>
      </Button>
    </div>
  );
}
