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

/** Fixed bar on every screen (spec §5): 64 px + safe area; compact at the inline end on desktop. */
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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line-dark bg-navy-950 pb-[env(safe-area-inset-bottom)] text-white shadow-bar transition-[opacity,visibility] duration-300 lg:start-auto lg:end-6 lg:bottom-6 lg:border-t-0 lg:pb-0"
    >
      <div className="flex h-16 items-center gap-2 ps-3 pe-2 lg:gap-3 lg:ps-5">
        {crane ? (
          <span data-bar-chip="" data-testid="bar-chip" className="flex min-w-0 items-center gap-2 border border-line-dark ps-3">
            <HookIcon className="size-4 shrink-0 text-red-bright" />
            {/* Below sm the hook icon stands for "On the hook:" so the model itself is never truncated. */}
            <span className="min-w-0 truncate text-[0.9375rem]">
              <span className="max-sm:sr-only">{copy.bar.onHook}</span> <bdi className="t-spec">{crane.model}</bdi>
            </span>
            <button
              type="button"
              data-testid="bar-chip-clear"
              aria-label={copy.bar.clear}
              onClick={() => {
                setRequestedCrane(null);
                whatsappRef.current?.querySelector<HTMLElement>('[data-bar-whatsapp]')?.focus();
              }}
              className="inline-flex size-11 shrink-0 items-center justify-center transition-colors hover:bg-white/10"
            >
              <CloseIcon className="size-4" />
            </button>
          </span>
        ) : (
          <p className="hidden text-[0.9375rem] text-steel lg:block">{copy.bar.tooltip}</p>
        )}

        <div ref={whatsappRef} className="ms-auto flex shrink-0 items-center gap-2">
          {tel && env.phone && (
            <Button
              href={tel}
              variant="outline-on-dark"
              size="md"
              icon={<PhoneIcon className="size-5" />}
              aria-label={fillTemplate(copy.header.call.label, { phone: env.phone })}
              data-testid="bar-call"
              onClick={() => track('call_click')}
            >
              <span className="max-sm:sr-only">{copy.header.call.text}</span>
            </Button>
          )}
          <Button
            href={whatsappHref(message)}
            external
            size="md"
            icon={<WhatsAppIcon className="size-5" />}
            data-testid="bar-whatsapp"
            data-bar-whatsapp=""
            onClick={() => track('whatsapp_click', { location: 'bar' })}
          >
            <span className="sr-only">{copy.bar.whatsappLabel}</span>
            <span aria-hidden="true">{copy.bar.whatsapp}</span>
          </Button>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {crane ? `${copy.bar.onHook} ${crane.make} ${crane.model}` : ''}
      </p>
    </aside>
  );
}
