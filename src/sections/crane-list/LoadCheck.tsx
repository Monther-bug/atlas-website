import { useEffect, useRef, useState } from 'react';
import { ArrowIcon, CloseIcon } from '@/components/Icons';
import { craneListCopy } from '@/content/crane-list-copy';
import type { Crane } from '@/content/types';
import { useLang } from '@/lib/lang';
import { loadResult } from './lineup-data';
import { loadStore, parseLoad, ratedFor, useLoadText } from './load';

/** Quiet time before the result is written (and announced), so typing "120" is announced once, not three times. */
const SETTLE_MS = 450;

/**
 * "Check your load against the ratings": a dark instrument strip (Chart ground). Typing a weight highlights the cards
 * whose maximum rating is at least that weight (they read the same store). The caveat is always visible: a maximum
 * rating holds only at the shortest radius, so the strip never says a crane "can lift" anything; it invites the
 * weight and radius instead. Prerendered, then mounted as a lazy island (load-island.tsx). One per page: fixed ids.
 */
export function LoadCheck({ cranes }: { cranes: readonly Crane[] }) {
  const { lang } = useLang();
  const text = craneListCopy[lang].load;
  const value = useLoadText();
  const load = parseLoad(value);
  const input = useRef<HTMLInputElement>(null);
  const rated = load.state === 'ok' ? cranes.filter((c) => ratedFor(c, load.tonnes)).length : 0;

  const message = load.state === 'ok' ? loadResult(rated, load.tonnes, craneListCopy[lang], lang) : load.state === 'invalid' ? text.invalid : '';
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (message === '') {
      setShown('');
      return;
    }
    const timer = window.setTimeout(() => setShown(message), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <div className="lineup-load surface-dark" data-ground="dark" role="group" aria-labelledby="load-check-title">
      <h3 id="load-check-title" className="t-title lineup-load__title">
        {text.title}
      </h3>
      <div className="lineup-load__field">
        <label htmlFor="load-check-input" className="t-small lineup-load__label">
          {text.label}
          <span className="sr-only"> ({text.unit})</span>
        </label>
        <div className="lineup-load__control" data-invalid={load.state === 'invalid' ? '' : undefined}>
          <input
            ref={input}
            id="load-check-input"
            name="load-check"
            type="text"
            inputMode="decimal"
            size={6}
            autoComplete="off"
            spellCheck={false}
            value={value}
            aria-invalid={load.state === 'invalid' || undefined}
            aria-describedby="load-check-result load-check-caveat"
            onChange={(event) => loadStore.set(event.currentTarget.value)}
            className="t-title lineup-load__input"
          />
          <span className="t-sub lineup-load__unit" aria-hidden="true">
            {text.unit}
          </span>
          {value !== '' ? (
            // A plain 44 px button rather than ui/IconButton: that primitive would pull a shared chunk into the first load.
            <button
              type="button"
              className="lineup-load__clear"
              onClick={() => {
                loadStore.set('');
                input.current?.focus();
              }}
            >
              <CloseIcon className="size-4" />
              <span className="sr-only">{text.clear}</span>
            </button>
          ) : null}
        </div>
        <p id="load-check-result" aria-live="polite" className="t-body lineup-load__result" data-state={load.state}>
          {shown}
        </p>
      </div>
      <div className="lineup-load__note">
        <p id="load-check-caveat" className="t-small lineup-load__caveat">
          {text.caveat}
        </p>
        <a href="#request" className="t-small lineup-load__cta">
          {text.cta}
          <ArrowIcon direction="down" className="size-4" />
        </a>
      </div>
    </div>
  );
}
