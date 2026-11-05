import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '..');
const read = (file: string) => readFileSync(path.join(SRC, file), 'utf8');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

describe('one language per page', () => {
  it('the Arabic entry imports only the Arabic copy, the English entry only the English copy', () => {
    expect(read('main-ar.tsx')).toMatch(/content\/ar'/);
    expect(read('main-ar.tsx')).not.toMatch(/content\/(en|all)'/);
    expect(read('main-en.tsx')).toMatch(/content\/en'/);
    expect(read('main-en.tsx')).not.toMatch(/content\/(ar|all)'/);
  });

  it('only the server entry (and tests) may import the both-languages module or either deck by name', () => {
    const offenders = sourceFiles(SRC)
      .filter((f) => !/[\\/]test[\\/]/.test(f))
      .filter((f) => !/[\\/](entry-server|main-ar|main-en)\.tsx$/.test(f) && !/[\\/]content[\\/](all|ar|en)\.ts$/.test(f))
      .filter((f) => /content\/(all|ar|en)'|from '\.\/(all|ar|en)'/.test(readFileSync(f, 'utf8')))
      .map((f) => path.relative(SRC, f));
    expect(offenders).toEqual([]);
  });
});
