import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { CloseIcon, HookIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { cranes } from '@/content';
import type { CraneId } from '@/content/types';
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
export function RequestBar({ defaultCrane = null }: { defaultCrane?: CraneId | null } = {}) {
  const { copy } = useLang();
  const overHero = useOverHero();
  const requested = useRequestedCrane();
  const crane = requested ? (cranes.find((c) => c.id === requested) ?? null) : null;
  // A crane page's bar asks about that crane (template B) while nothing else is on the hook; no chip, nothing to clear.
  const about = crane ?? (defaultCrane ? (cranes.find((c) => c.id === defaultCrane) ?? null) : null);
  const message = about
    ? fillTemplate(copy.whatsapp.crane, { model: `${about.make} ${about.model}`, class: copy.craneTypes[about.type].chip })
    : copy.whatsapp.general;
  const tel = telHref();
  const whatsappRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);

  // Keyboard focus never lands under the floating bar (WCAG 2.4.11/2.4.12): when the focused control overlaps it,
  // scroll just enough to clear it (html's scroll-padding-bottom reserves the bar's height). A control taller than the
  // room left (a photo card on a 657 px laptop) can still touch it: the bar then steps aside (data-yield: faded and
  // click-through, still in the tab order) until keyboard focus moves on. Browsers leave a partly visible control where
  // it is, so without this a card in the photo strip was focused half under the bar (Q.1 keyboard walk).
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let focused: HTMLElement | null = null;
    let frame = 0;
    const overlaps = (el: HTMLElement) => {
      const a = el.getBoundingClientRect();
      const b = bar.getBoundingClientRect();
      return a.bottom > b.top && a.top < b.bottom && a.right > b.left && a.left < b.right;
    };
    const focusVisible = (el: HTMLElement) => {
      try {
        return el.matches(':focus-visible');
      } catch {
        return true; // an engine without :focus-visible: treat focus as visible
      }
    };
    const watched = (el: HTMLElement | null): el is HTMLElement =>
      !!el && !bar.contains(el) && !el.closest('dialog, .hoist--staged [data-hoist-stage]') && !bar.hasAttribute('data-over-hero');
    const sync = () => {
      frame = 0;
      const yieldNow = watched(focused) && focusVisible(focused) && overlaps(focused);
      bar.toggleAttribute('data-yield', yieldNow);
    };
    const onFocusIn = (event: FocusEvent) => {
      const el = event.target instanceof HTMLElement ? event.target : null;
      focused = el;
      if (watched(el) && overlaps(el)) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      sync();
    };
    const onFocusOut = () => {
      focused = null;
      bar.removeAttribute('data-yield');
    };
    const onScroll = () => {
      if (focused && !frame) frame = requestAnimationFrame(sync);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <aside
      ref={barRef}
      aria-label={copy.bar.tooltip}
      data-request-bar=""
      data-over-hero={overHero ? '' : undefined}
      data-testid="request-bar"
      data-ground="dark"
      // Phones: with a crane on the hook the bar spans the width (the chip needs the room); without one it is a compact
      // pill at the inline end, not a full-width bar with an empty half (Q.1 critique), and it covers less of the page.
      className={`glass-dark bg-black/80 fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 rounded-full text-white shadow-e3 ring-1 ring-white/10 transition-[opacity,visibility] duration-(--dur-ui) ease-ui lg:inset-x-auto lg:end-6 lg:bottom-6 lg:mx-0 lg:max-w-none ${crane ? 'inset-x-3 mx-auto max-w-md' : 'end-3 max-w-[calc(100%-1.5rem)]'}`}
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
