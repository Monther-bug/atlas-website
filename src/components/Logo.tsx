import { useLang } from '@/lib/lang';

// Temporary badge cropped from IMG_6363 by A2.4 until Atlas sends the vector (see README).
export const BADGE_SRC = '/brand/badge.png';
/** 192 px WebP (10 KB) for the 96 px About badge and the loader. */
export const BADGE_MEDIUM = '/brand/badge-192.webp';
/** The same badge at 128 px (WebP, ~6 KB instead of 79 KB): enough for the 40 px header and 64 px footer up to 3x / 2x. */
export const BADGE_SMALL = '/brand/badge-128.webp';

/**
 * Header: 40 px badge + the name over its other-language twin. Footer: 64 px badge + the name as on the logo.
 * `tone` is the ground the lockup sits on ('dark' = black or glass-dark, 'light' = white): it only changes the
 * second line, which must keep 4.5:1 on either. On dark it is neutral-200: the glass-dark bar over the hero's bright
 * sky measured 2.8:1 with neutral-400 (Q.1); neutral-200 keeps ≥ 5:1 there and 16.3:1 on black. Ink-3 on white 5.3:1.
 */
export function Logo({ variant = 'header', tone = 'dark' }: { variant?: 'header' | 'footer'; tone?: 'dark' | 'light' }) {
  const { copy, otherLang, crane } = useLang();
  if (variant === 'footer') {
    return (
      <span className="flex items-center gap-4">
        <img src={BADGE_SMALL} alt="" width={64} height={64} loading="lazy" decoding="async" className="size-16 shrink-0 rounded-full object-contain" />
        <span className="text-[1.125rem] leading-snug font-bold [&:lang(ar)]:text-[1.25rem] [&:lang(ar)]:leading-[1.4]">{copy.footer.name}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-3">
      {/* On a crane page the badge is low priority, so React emits no preload for it: the hero photo and the three
          fonts are the only preloads there. */}
      <img
        src={BADGE_SMALL}
        alt=""
        width={40}
        height={40}
        decoding="async"
        fetchPriority={crane ? 'low' : undefined}
        className="size-10 shrink-0 rounded-full object-contain"
      />
      <span className="flex flex-col">
        <span className="text-[1rem] leading-tight font-bold [&:lang(ar)]:text-[1.125rem] [&:lang(ar)]:leading-[1.35]">{copy.header.name}</span>
        <span
          lang={otherLang}
          className={`text-[0.75rem] leading-tight transition-colors duration-(--dur-ui) [&:lang(ar)]:text-[0.8125rem] [&:lang(ar)]:leading-[1.4] ${tone === 'light' ? 'text-ink-3' : 'text-neutral-200'}`}
        >
          {copy.header.nameAlt}
        </span>
      </span>
    </span>
  );
}
