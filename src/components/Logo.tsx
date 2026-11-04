import { useLang } from '@/lib/lang';

// Temporary badge cropped from IMG_6363 by A2.4 until Atlas sends the vector (see README).
export const BADGE_SRC = '/brand/badge.png';

/** Header: 48 px badge + typeset name. Footer: 80 px badge + the name as on the logo. */
export function Logo({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const { copy, otherLang } = useLang();
  if (variant === 'footer') {
    return (
      <span className="flex items-center gap-4">
        <img src={BADGE_SRC} alt="" width={80} height={80} loading="lazy" decoding="async" className="size-20 shrink-0 object-contain" />
        <span className="font-display text-[1.25rem] leading-snug font-bold [&:lang(ar)]:leading-[1.4]">{copy.footer.name}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-3">
      <img src={BADGE_SRC} alt="" width={48} height={48} decoding="async" className="size-12 shrink-0 object-contain" />
      <span className="flex flex-col">
        <span className="font-display text-[1.0625rem] leading-tight font-bold [&:lang(ar)]:leading-[1.4]">{copy.header.name}</span>
        <span lang={otherLang} className="text-[0.75rem] leading-tight text-steel [&:lang(ar)]:leading-[1.4]">
          {copy.header.nameAlt}
        </span>
      </span>
    </span>
  );
}
