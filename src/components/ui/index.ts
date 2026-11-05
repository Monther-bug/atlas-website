/* v2 shared primitives. Spec: docs/superpowers/specs/2026-11-05-atlas-v2-design.md §8. Styles: ./ui.css (imported by
   src/styles.css). Motion hooks (data-reveal, data-ticker, data-magnetic, data-parallax): src/motion/reveals.ts. */
export { BentoGrid, BentoTile, type BentoSpan, type BentoTone } from './Bento';
export { Card, CardLink, type CardTone } from './Card';
export { Carousel, pageStep, readingOffset } from './Carousel';
export { Chip, ToggleChip } from './Chip';
export { Field, fieldClass, type FieldControlProps } from './Field';
export { IconButton } from './IconButton';
export { Marquee } from './Marquee';
export { Reveal, REVEAL_KINDS, magnetic, parallax, reveal, type RevealKind } from './Reveal';
export { Section, SectionHeader, groundOf, type Ground, type Surface } from './Section';
export { SegmentedControl, type SegmentOption } from './SegmentedControl';
export { Sheet, sheetTrigger } from './Sheet';
export { CompareTable, SpecList, type CompareColumn, type CompareRow, type SpecItem } from './SpecTable';
export { Stat } from './Stat';
export { StickyStory, type StoryStep } from './StickyStory';
export { Tabs, tabStep, type TabItem } from './Tabs';
export { FLIP_EASE, FLIP_MS, invert, useFlip } from './useFlip';
export { cx, fill } from './util';
