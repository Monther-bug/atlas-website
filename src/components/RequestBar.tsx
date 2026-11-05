import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { CloseIcon, HookIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { cranes } from '@/content';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { setRequestedCrane, useRequestedCrane } from '@/lib/request';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';

/** The dock line (spec §5.2, motion D.4): the sling button docks into the bar once the hero's bottom edge rises
 *  above 65 % of the viewport height. The bar appears at that same moment, so the dock always lands on a visible bar. */
const DOCK_LINE = '-65% 0px 0px 0px';

/**
 * True while the hero (#top) still reaches below the dock line (65 % of the viewport). The bar then waits (invisible,
 * still laid out) so it never covers the hero's H1, its band button or the sling button, which is the bar's WhatsApp
 * on its way down. Above that line the hero sits clear of the bar (bottom 64–88 px), so the bar can show.
 * Server render and first client render say true; without JS the CSS rule never applies (it needs `html.js`).
 */
function useOverHero(): boolean {
  const [overHero, setOverHero] = useState(true);
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero || typeof IntersectionObserver === 'undefined') {
      setOverHero(false);
      return;
    }
    const observer = new IntersectionObserver((entries) => setOverHero(entries.at(-1)?.isIntersecting ?? false), {
      rootMargin: DOCK_LINE,
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  return overHero;
}

/**
 * v2 request bar: a glass-dark pill that floats above the safe area on phones (inset 12 px from the sides) and sits
 * compact at the inline end on desktop. The crane on the hook is a solid chip, so the ride ghost (a clone that keeps
 * its classes) looks the same in flight. Opacity and visibility only: the dock and the ride measure this bar's
 * buttons, so nothing here may move with a transform while they land.
 */
export function RequestBar() {
  const { copy } = useLang();
  const overHero = useOverHero();
  const requested = useRequestedCrane();
  const crane = requested ? (cranes.find((c) => c.id === requested) ?? null) : null;
  const message = crane
    ? fillTemplate(copy.whatsapp.crane, { model: `${crane.make} ${crane.model}`, class: copy.craneTypes[crane.type].chip })
    : copy.whatsapp.general;
  const tel = telHref();
  const whatsappRef = useRef<HTMLDivElement>(null);

  return (
    <aside
      aria-label={copy.bar.tooltip}
      data-request-bar=""
      data-over-hero={overHero ? '' : undefined}
      data-testid="request-bar"
      data-ground="dark"
      className="glass-dark bg-black/80 fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-md rounded-full text-white shadow-e3 ring-1 ring-white/10 transition-[opacity,visibility] duration-(--dur-ui) ease-ui lg:inset-x-auto lg:end-6 lg:bottom-6 lg:mx-0 lg:max-w-none"
    >
      <div className="flex items-center gap-2 p-2 lg:gap-3">
        {crane ? (
          <span
            data-bar-chip=""
            data-testid="bar-chip"
            className="flex min-h-12 min-w-0 items-center gap-2 rounded-full bg-neutral-800 ps-4 pe-1 text-white"
          >
            <HookIcon className="size-4 shrink-0 text-red-bright" />
            {/* Below sm the hook icon stands for "On the hook:" so the model itself is never truncated. */}
            <span className="min-w-0 truncate text-[0.9375rem] [&:lang(ar)]:text-base">
              <span className="max-sm:sr-only">{copy.bar.onHook}</span> <bdi className="font-semibold">{crane.model}</bdi>
            </span>
            <button
              type="button"
              data-testid="bar-chip-clear"
              aria-label={copy.bar.clear}
              onClick={() => {
                setRequestedCrane(null);
                whatsappRef.current?.querySelector<HTMLElement>('[data-bar-whatsapp]')?.focus();
              }}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-(--dur-state) ease-ui hover:bg-white/15 active:scale-95"
            >
              <CloseIcon className="size-4" />
            </button>
          </span>
        ) : (
          <p className="hidden ps-4 text-[0.9375rem] text-neutral-300 lg:block [&:lang(ar)]:text-base">{copy.bar.tooltip}</p>
        )}

        <div ref={whatsappRef} className="ms-auto flex shrink-0 items-center gap-2">
          {tel && env.phone && (
            <Button
              href={tel}
              variant="ghost-dark"
              size="md"
              icon={<PhoneIcon className="size-5" />}
              aria-label={fillTemplate(copy.header.call.label, { phone: env.phone })}
              data-testid="bar-call"
              className="max-sm:w-12 max-sm:px-0"
              onClick={() => track('call_click')}
            >
              <span className="max-sm:sr-only">{copy.header.call.text}</span>
            </Button>
          )}
          <Button
            href={whatsappHref(message)}
            external
            size="md"
            // With a crane on the hook, phones show the WhatsApp icon alone so the model keeps its room (the name stays).
            className={crane ? 'max-sm:w-12 max-sm:px-0' : undefined}
            icon={<WhatsAppIcon className="size-5" />}
            data-testid="bar-whatsapp"
            data-bar-whatsapp=""
            onClick={() => track('whatsapp_click', { location: 'bar' })}
          >
            <span className="sr-only">{copy.bar.whatsappLabel}</span>
            <span aria-hidden="true" className={crane ? 'max-sm:hidden' : undefined}>
              {copy.bar.whatsapp}
            </span>
          </Button>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {crane ? `${copy.bar.onHook} ${crane.make} ${crane.model}` : ''}
      </p>
    </aside>
  );
}
