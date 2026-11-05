import type { SVGProps } from 'react';

// One authored set on a 24 px grid, 1.75 stroke, square ends (spec §15.7: no Unicode glyphs as icons).
type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
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
      aria-hidden={labelled ? undefined : 'true'}
      role={labelled ? 'img' : undefined}
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Svg strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.6 20.4l1.2-4.1A8.5 8.5 0 1 1 8 19.3z" />
      <path d="M9.1 8.4c.2-.4.6-.5 1-.4l.6.2.8 1.9-.7.9c.5 1.1 1.4 2 2.5 2.5l.9-.7 1.9.8.2.6c.1.4 0 .8-.4 1-.6.4-1.4.6-2.2.4a7.2 7.2 0 0 1-4.9-4.9c-.2-.8 0-1.6.3-2.3z" />
    </Svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </Svg>
  );
}

/** The site's signature shape: a crane hook on its eye. */
export function HookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="3.5" r="1.5" />
      <path d="M12 5v7a4 4 0 0 1-8 0v-2l2 2" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

/** Theme toggle: a sun in the light theme, a moon in the dark one (CSS picks the shape from html[data-theme]). */
export function ThemeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <g className="dark:hidden">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" />
      </g>
      <path className="hidden dark:block" d="M20 15A8.5 8.5 0 1 1 9 4a7 7 0 0 0 11 11z" />
    </Svg>
  );
}

/** 'forward' points the reading direction (mirrored in RTL); 'back' the opposite; 'down' never mirrors. */
export function ArrowIcon({ direction = 'forward', className = '', ...props }: IconProps & { direction?: 'forward' | 'back' | 'down' }) {
  const turn = direction === 'down' ? 'rotate-90' : direction === 'back' ? '-scale-x-100 rtl:scale-x-100' : 'rtl:-scale-x-100';
  return (
    <Svg className={`${turn} ${className}`.trim()} {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Svg>
  );
}

/** Points up (back to top). Never mirrored. */
export function ArrowUpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20V5M6 11l6-6 6 6" />
    </Svg>
  );
}

/** Simplified oil derrick, after the one in the logo (spec §5.4). */
export function DerrickIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 21h14" />
      <path d="M8 21 11 3h2l3 18" />
      <path d="M9.5 12h5M10.25 7.5h3.5M8.75 16.5h6.5" />
      <path d="M8.75 16.5 14.5 12M9.5 12l4.25-4.5" />
    </Svg>
  );
}
