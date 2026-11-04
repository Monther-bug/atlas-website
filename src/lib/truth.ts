/**
 * The truth gate's rules (spec §4.3), as a pure function so they are unit-tested.
 * vite/truth-gate.ts feeds it the real content and env at build time.
 */
export interface TruthInput {
  copies: unknown[];
  cranes: { id: string; verified: boolean; hidden: boolean }[];
  env: { siteUrl?: string | null; whatsapp?: string | null; phone?: string | null };
}

const TOKEN = /\[\[[^\]]*(?:\]\]|$)/g;

/** Every string under `value` that contains "[[", as "path: unresolved [[A]], [[B]]". */
function findTokens(value: unknown, path: string, out: string[]): void {
  if (typeof value === 'string') {
    if (value.includes('[[')) out.push(`${path}: unresolved ${(value.match(TOKEN) ?? []).join(', ')}`);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => findTokens(item, `${path}[${i}]`, out));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) findTokens(child, `${path}.${key}`, out);
  }
}

const missing = (v: string | null | undefined) => !v || v.trim() === '';

/** Lists everything that must not reach production. Empty array = ready to ship. */
export function findTruthProblems(input: TruthInput): string[] {
  const problems: string[] = [];
  input.copies.forEach((copy, i) => findTokens(copy, `copies[${i}]`, problems));
  for (const crane of input.cranes) {
    if (!crane.hidden && !crane.verified) {
      problems.push(`crane ${crane.id}: shown but not verified (set verified: true once Atlas confirms)`);
    }
  }
  if (missing(input.env.siteUrl)) problems.push('SITE_URL is not set');
  if (missing(input.env.whatsapp)) problems.push('VITE_WHATSAPP is not set');
  if (missing(input.env.phone)) problems.push('VITE_PHONE is not set');
  return problems;
}
