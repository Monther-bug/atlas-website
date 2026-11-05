import type { SVGProps } from 'react';

/* A mark the shared set (src/components/Icons.tsx) does not have yet, drawn on the same 24 px grid, 1.75 stroke. */

function Svg({ children, ...props }: SVGProps<SVGSVGElement>) {
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

/** Rated for the load / picked for the comparison. */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

/** Opens a column's model list in the comparison. */
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Svg>
  );
}
