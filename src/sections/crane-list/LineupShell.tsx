import { useEffect, useRef } from 'react';
import type { Crane } from '@/content/types';
import { useLang } from '@/lib/lang';
import { SECTION_PROPS } from './section';
// The section's styles ship with the page, so the prerendered HTML is styled before (and without) its lazy code.
import './crane-list.css';

const KEEP = { __html: '' };

/**
 * The browser side of «اعثر على رافعتك» (main bundle: this file only). Hydration keeps the prerendered section as is:
 * its innerHTML is declared empty, which React does not patch, so the page is complete before any of the section's
 * code loads. When the section comes within a viewport of the screen, mount.tsx loads (lineup, load check) and
 * renders the live body into the same <section>; the comparison (with crane-specs) is its own chunk, loaded when it
 * comes near (CompareSlot.tsx). Like Astro's client:visible.
 */
export function LineupShell({ cranes }: { cranes: readonly Crane[] }) {
  const { copy } = useLang();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    let alive = true;
    let dispose: (() => void) | undefined;
    const start = () => {
      import('./mount')
        .then((m) => {
          if (alive) dispose = m.mountLineup(section, copy, cranes);
        })
        .catch((error: unknown) => console.error('[crane-list]', error));
    };
    if (typeof IntersectionObserver === 'undefined') {
      start();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          start();
        },
        { rootMargin: '100% 0px' },
      );
      io.observe(section);
      return () => {
        alive = false;
        io.disconnect();
        dispose?.();
      };
    }
    return () => {
      alive = false;
      dispose?.();
    };
  }, [copy, cranes]);
  return <section ref={ref} {...SECTION_PROPS} suppressHydrationWarning dangerouslySetInnerHTML={KEEP} />;
}
