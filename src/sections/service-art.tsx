import type { SVGProps } from 'react';
import { DerrickIcon } from '@/components/Icons';
import type { ServiceId } from '@/content/types';

/**
 * Authored art for the four services (Services bento, Why Atlas). Icons follow the site set (src/components/Icons.tsx):
 * 24 px grid, 1.75 stroke, square ends. Kept in the sections folder so the shared icon file stays untouched.
 *
 * The two line illustrations are drawn in their final state. The motion layer (src/motion/services.ts) may set a
 * from-state on them when they start below the fold: paths marked `data-draw` are drawn in (DrawSVG) and the load
 * marked `data-load` travels along `data-route`. No JS or reduced motion: the drawing is complete as rendered.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** A mobile crane: carrier, cab, raised boom and the hook line. */
export function CraneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 17.5h12.5v-3.5H2.5z" />
      <path d="M15 17.5h6v-3l-2-3h-4" />
      <circle cx="6" cy="20" r="1.5" />
      <circle cx="17.5" cy="20" r="1.5" />
      <path d="M5 14 15.5 3.5" />
      <path d="M15.5 3.5V9" />
      <path d="M15.5 9v1.25a1.25 1.25 0 0 1-2.5 0" />
    </Svg>
  );
}

/** A tractor unit pulling a flat trailer with a load. */
export function TransportIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 10.5h7.5v4.5H3.5z" />
      <path d="M1.5 15h13" />
      <path d="M14.5 17V9.5h3.5l3 3.5v4h-6.5" />
      <circle cx="5" cy="18.5" r="1.5" />
      <circle cx="11" cy="18.5" r="1.5" />
      <circle cx="18" cy="18.5" r="1.5" />
    </Svg>
  );
}

/** The hook, a two-leg sling and the load: handling, lifting and rigging. */
export function RiggingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="3.25" r="1.5" />
      <path d="M12 4.75V9" />
      <path d="M12 9 6 15M12 9l6 6" />
      <path d="M4 15h16v5.5H4z" />
    </Svg>
  );
}

export function ServiceIcon({ id, ...props }: IconProps & { id: ServiceId }) {
  switch (id) {
    case 'crane-hire':
      return <CraneIcon {...props} />;
    case 'heavy-transport':
      return <TransportIcon {...props} />;
    case 'handling':
      return <RiggingIcon {...props} />;
    case 'oil-services':
      return <DerrickIcon {...props} />;
  }
}

/**
 * Heavy transport: a route from where the load is to where it must go. The load (the one red mark) rests in the drop
 * zone at the end of the route. Flipped in Arabic so the route runs in the reading direction (there is no text in it).
 */
export const ROUTE_END = { x: 288, y: 52 } as const;
export const ROUTE_PATH = `M36 112 C 108 112 112 58 176 62 S 252 74 ${ROUTE_END.x} ${ROUTE_END.y}`;

export function RouteArt({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 150"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-service-art="route"
      className={`rtl:-scale-x-100 ${className}`.trim()}
    >
      <defs>
        <pattern id="route-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
      </defs>
      {/* the map: a faint dot grid */}
      <rect x="0" y="0" width="320" height="150" fill="url(#route-dots)" opacity="0.14" />
      {/* the road under the route, static */}
      <path d={ROUTE_PATH} stroke="currentColor" strokeOpacity="0.16" strokeWidth="10" strokeLinecap="round" />
      {/* the route, drawn behind the travelling load */}
      <path data-draw="" data-route="" d={ROUTE_PATH} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      {/* start: where the load is */}
      <circle data-draw="" cx="36" cy="112" r="7" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="36" cy="112" r="2.5" fill="currentColor" />
      {/* end: the drop zone */}
      <rect
        x={ROUTE_END.x - 15}
        y={ROUTE_END.y - 15}
        width="30"
        height="30"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      {/* the load, at rest in the drop zone (motion moves this group along the route) */}
      <g data-load="" transform={`translate(${ROUTE_END.x} ${ROUTE_END.y})`}>
        <rect x="-9" y="-9" width="18" height="18" rx="3.5" className="fill-red" />
        <path d="M-9 -3h18" stroke="var(--color-white)" strokeOpacity="0.55" strokeWidth="1.25" />
      </g>
    </svg>
  );
}

/** Oil services: a drilling derrick over the ground line, with a flanged pipe leaving it. Line drawing only. */
export function DerrickArt({ className = '' }: { className?: string }) {
  // Leg x at height y: left 70 + (238 - y) * 0.2, right 170 - (238 - y) * 0.2.
  const girts = [190, 140, 90, 50];
  const lx = (y: number) => 70 + (238 - y) * 0.2;
  const rx = (y: number) => 170 - (238 - y) * 0.2;
  const braces: string[] = [];
  for (let i = 0; i < girts.length - 1; i++) {
    const a = girts[i] ?? 0;
    const b = girts[i + 1] ?? 0;
    braces.push(`M${lx(a)} ${a} L${rx(b)} ${b}`, `M${rx(a)} ${a} L${lx(b)} ${b}`);
  }
  return (
    <svg
      viewBox="0 0 240 260"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      data-service-art="derrick"
      className={className}
    >
      <path data-draw="" d="M8 238 H232" strokeWidth="1.75" />
      <path data-draw="" d="M70 238 L112 28 M170 238 L128 28" strokeWidth="2.25" />
      <path data-draw="" d="M64 206 H176" strokeWidth="1.75" />
      {girts.map((y) => (
        <path key={y} data-draw="" d={`M${lx(y)} ${y} H${rx(y)}`} strokeWidth="1.5" />
      ))}
      {braces.map((d) => (
        <path key={d} data-draw="" d={d} strokeWidth="1" strokeOpacity="0.55" />
      ))}
      <path data-draw="" d="M106 28 V18 H134 V28 Z" strokeWidth="1.75" />
      <path d="M120 28 V196" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 5" />
      <path data-draw="" d="M170 226 H232 M204 219 V233 M210 219 V233" strokeWidth="1.75" />
    </svg>
  );
}
