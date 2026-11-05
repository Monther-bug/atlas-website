import { Suspense, lazy, useEffect, useRef, useState, type ComponentType } from 'react';
import type { Crane } from '@/content/types';

type CompareProps = { cranes: readonly Crane[] };

/**
 * The comparison for static rendering, filled only by server-islands.ts (prerender and tests). Kept here, not in
 * island-registry.ts, so the main bundle exports nothing new for the lineup chunk.
 */
export const compareRegistry: { component?: ComponentType<CompareProps> } = {};

const LiveCompare = lazy(() => import('./CompareModels').then((m) => ({ default: m.CompareModels })));

/**
 * «قارن الطرازات» as its own lazy chunk. The prerender and the tests render the component in place (server-islands.ts
 * registers it). In the browser the lineup island keeps the prerendered comparison as static HTML (`kept`, read by
 * mount.tsx before it renders) and loads the live one when it comes within a viewport, so a visitor who never scrolls
 * that far never downloads it. The live comparison has the same boxes as the prerender, so the swap shifts nothing.
 */
export function CompareSlot({ cranes, kept = '' }: { cranes: readonly Crane[]; kept?: string }) {
  const Static = compareRegistry.component;
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (Static || near || !el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setNear(true);
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [Static, near]);
  if (Static) return <Static cranes={cranes} />;
  const placeholder = <div ref={ref} dangerouslySetInnerHTML={{ __html: kept }} />;
  return near ? (
    <Suspense fallback={placeholder}>
      <LiveCompare cranes={cranes} />
    </Suspense>
  ) : (
    placeholder
  );
}
