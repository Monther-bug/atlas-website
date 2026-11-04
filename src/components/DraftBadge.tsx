import { CHEVRON_CLASS } from '@/components/stripes';
import { isDraft } from '@/env';
import { useLang } from '@/lib/lang';

/** Red/white chevron tag on every unverified value. Staging only (spec §4.3). */
export function DraftBadge({ verified, className = '' }: { verified: boolean; className?: string }) {
  const { copy } = useLang();
  if (!isDraft(verified)) return null;
  return (
    <span
      data-testid="draft-badge"
      className={`inline-flex items-stretch border border-red bg-white text-[0.75rem] leading-none font-semibold text-red ${className}`}
    >
      <span aria-hidden="true" className={`w-3 shrink-0 ${CHEVRON_CLASS}`} />
      <span className="px-2 py-1">{copy.misc.draftBadge}</span>
    </span>
  );
}
