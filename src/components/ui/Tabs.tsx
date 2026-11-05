import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { useLang } from '@/lib/lang';
import { cx, useMeasure } from './util';

export interface TabItem {
  id: string;
  label: ReactNode;
  panel: ReactNode;
}

export interface TabsProps {
  items: readonly TabItem[];
  /** Accessible name of the tab list. */
  label: string;
  /** Controlled selection. Omit for uncontrolled (starts at `defaultValue` or the first tab). */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
  listClassName?: string;
  panelClassName?: string;
}

/** ArrowRight moves forward in LTR and backward in RTL (the tabs are laid out in reading order). */
export function tabStep(key: string, dir: 'rtl' | 'ltr'): -1 | 0 | 1 {
  if (key === 'ArrowRight') return dir === 'rtl' ? -1 : 1;
  if (key === 'ArrowLeft') return dir === 'rtl' ? 1 : -1;
  return 0;
}

/**
 * WAI-ARIA tabs with automatic activation, roving tabindex, Home/End and a sliding ink bar.
 * No JS: the tab list is hidden and every panel shows (each panel should open with its own heading).
 * With JS, inactive panels get `data-inactive` and the `.js` rule in ui.css hides them, so the prerendered markup
 * and the first client render are identical.
 */
export function Tabs({ items, label, value, defaultValue, onChange, className, listClassName, panelClassName }: TabsProps) {
  const { dir } = useLang();
  const base = useId();
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id ?? '');
  const selected = value ?? inner;
  const list = useRef<HTMLDivElement>(null);
  const tabs = useRef(new Map<string, HTMLButtonElement>());
  const box = useMeasure(list, () => tabs.current.get(selected) ?? null, [selected, items.length]);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!box || settled) return;
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, [box, settled]);

  const select = (id: string, focus = false) => {
    if (value === undefined) setInner(id);
    onChange?.(id);
    if (focus) tabs.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = items.findIndex((item) => item.id === selected);
    let next = -1;
    const step = tabStep(event.key, dir);
    if (step !== 0) next = (index + step + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    if (next < 0) return;
    event.preventDefault();
    const item = items[next];
    if (item) select(item.id, true);
  };

  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = (id: string) => `${base}-panel-${id}`;
  const style = box ? ({ '--tab-x': `${box.x}px`, '--tab-w': `${box.w}px` } as CSSProperties) : undefined;

  return (
    <div className={className}>
      <div
        ref={list}
        role="tablist"
        aria-label={label}
        data-measured={box ? '' : undefined}
        className={cx('ui-tabs__list', listClassName)}
        style={style}
      >
        {items.map((item) => {
          const on = item.id === selected;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) tabs.current.set(item.id, el);
                else tabs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-selected={on}
              aria-controls={panelId(item.id)}
              tabIndex={on ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={onKeyDown}
              className="ui-tabs__tab"
            >
              {item.label}
            </button>
          );
        })}
        <span className="ui-tabs__ink" aria-hidden="true" style={settled ? undefined : { transition: 'none' }} />
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={panelId(item.id)}
          aria-labelledby={tabId(item.id)}
          tabIndex={0}
          data-inactive={item.id === selected ? undefined : ''}
          className={cx('ui-tabs__panel', panelClassName)}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
