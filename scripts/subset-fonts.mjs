// Subsets the Fontsource woff2 files to the characters the site uses and
// writes them to src/assets/fonts/ (committed). Run with `npm run fonts`.
// HarfBuzz (subset-font) keeps every OpenType layout feature and every
// variation axis by default, so the glyphs render exactly as the full files.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';
import * as fontverter from 'fontverter';

const require = createRequire(import.meta.url);
const OUT = new URL('../src/assets/fonts/', import.meta.url);

const range = (from, to) => {
  let s = '';
  for (let c = from; c <= to; c++) s += String.fromCodePoint(c);
  return s;
};

// Keep in sync with the unicode-range lists in src/fonts.css.
// Arabic: standard Arabic letters, tatweel, harakat, Arabic-Indic digits and
// punctuation (U+060C U+061B U+061F, U+066A-066D), superscript alef, alef wasla,
// Eastern Arabic-Indic digits U+06F0-06F9 (no Persian letters), ZWNJ/ZWJ/LRM/RLM.
const ARABIC =
  range(0x0621, 0x063a) + range(0x0640, 0x0655) + range(0x0660, 0x066d) +
  '\u060C\u061B\u061F' + range(0x0670, 0x0671) + range(0x06f0, 0x06f9) +
  range(0x200c, 0x200f);
// Latin: printable ASCII plus nbsp, copyright, degree, middle dot, multiplication,
// en/em dash, curly quotes, bullet, ellipsis, arrows, and guillemets (U+00AB, U+00BB).
// U+00A0 (no-break space) goes between a number and its unit (formatTonnes()).
const LATIN =
  range(0x0020, 0x007e) +
  '\u00A0\u00A9\u00AB\u00B0\u00B7\u00BB\u00D7\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u2191\u2193';

// Default-ignorable code points: fonts need not carry a glyph for them.
const EXEMPT = new Set([0x200c, 0x200d, 0x200e, 0x200f]);

/** Returns the set of code points mapped by a TrueType/OpenType cmap (formats 4 and 12). */
function cmapCodepoints(sfnt) {
  const dv = new DataView(sfnt.buffer, sfnt.byteOffset, sfnt.byteLength);
  const numTables = dv.getUint16(4);
  let cmapOff = -1;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (String.fromCharCode(...sfnt.subarray(rec, rec + 4)) === 'cmap') cmapOff = dv.getUint32(rec + 8);
  }
  if (cmapOff < 0) throw new Error('no cmap table');
  const set = new Set();
  const n = dv.getUint16(cmapOff + 2);
  for (let i = 0; i < n; i++) {
    const off = cmapOff + dv.getUint32(cmapOff + 4 + i * 8 + 4);
    const format = dv.getUint16(off);
    if (format === 4) {
      const segX2 = dv.getUint16(off + 6);
      const endO = off + 14;
      const startO = endO + segX2 + 2;
      const deltaO = startO + segX2;
      const rangeO = deltaO + segX2;
      for (let s = 0; s < segX2 / 2; s++) {
        const end = dv.getUint16(endO + s * 2);
        const start = dv.getUint16(startO + s * 2);
        const delta = dv.getInt16(deltaO + s * 2);
        const ro = dv.getUint16(rangeO + s * 2);
        for (let c = start; c <= end && c !== 0xffff; c++) {
          let g;
          if (ro === 0) g = (c + delta) & 0xffff;
          else {
            g = dv.getUint16(rangeO + s * 2 + ro + (c - start) * 2);
            if (g !== 0) g = (g + delta) & 0xffff;
          }
          if (g !== 0) set.add(c);
        }
      }
    } else if (format === 12) {
      const groups = dv.getUint32(off + 12);
      for (let g = 0; g < groups; g++) {
        const o = off + 16 + g * 12;
        const start = dv.getUint32(o);
        const end = dv.getUint32(o + 4);
        const gid = dv.getUint32(o + 8);
        for (let c = start; c <= end; c++) if (gid + (c - start) !== 0) set.add(c);
      }
    }
  }
  return set;
}

/** Throws if the subset lacks a glyph for any requested code point. */
async function assertCoverage(name, woff2, chars) {
  const sfnt = await fontverter.convert(woff2, 'sfnt');
  const have = cmapCodepoints(new Uint8Array(sfnt));
  const missing = [...new Set(chars)]
    .map((ch) => ch.codePointAt(0))
    .filter((cp) => !EXEMPT.has(cp) && !have.has(cp));
  if (missing.length) {
    throw new Error(`${name}: no glyph for ${missing.map((c) => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')).join(' ')}`);
  }
}

// v2 type system: Cairo for Arabic (client, 11 Nov 2026; Tajawal before), Poppins for Latin and every numeral.
// Measured gaps (cmap of the Fontsource files): Cairo covers the whole Arabic set, separators, alef wasla and
// Eastern Arabic-Indic digits included. Poppins has no U+2191/U+2193: those come from IBM Plex Sans Arabic in a tiny
// "fill" face that shares the family name and loads only when one is on screen (unicode-range in src/fonts.css).
const without = (set, gaps) => [...set].filter((ch) => !gaps.includes(ch)).join('');
const POPPINS_GAPS = '\u2191\u2193';
const POPPINS = without(LATIN, POPPINS_GAPS);

/** [output file, Fontsource file, character set] */
const JOBS = [
  ['cairo-ar-400.woff2', '@fontsource/cairo/files/cairo-arabic-400-normal.woff2', ARABIC],
  ['cairo-ar-500.woff2', '@fontsource/cairo/files/cairo-arabic-500-normal.woff2', ARABIC],
  ['cairo-ar-700.woff2', '@fontsource/cairo/files/cairo-arabic-700-normal.woff2', ARABIC],
  ['cairo-ar-800.woff2', '@fontsource/cairo/files/cairo-arabic-800-normal.woff2', ARABIC],
  ['poppins-400.woff2', '@fontsource/poppins/files/poppins-latin-400-normal.woff2', POPPINS],
  ['poppins-500.woff2', '@fontsource/poppins/files/poppins-latin-500-normal.woff2', POPPINS],
  ['poppins-600.woff2', '@fontsource/poppins/files/poppins-latin-600-normal.woff2', POPPINS],
  ['poppins-700.woff2', '@fontsource/poppins/files/poppins-latin-700-normal.woff2', POPPINS],
  ['fill-la.woff2', '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-400-normal.woff2', POPPINS_GAPS],
  // Model codes and machine formulas only (Poppins has no tabular/mono figures in these files).
  ['plex-mono-500.woff2', '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', LATIN],
];

/** Every script's full set must be covered by its family (main faces plus the fill face). */
const FAMILIES = [
  ['Cairo Atlas', ARABIC, ['cairo-ar-400.woff2']],
  ['Poppins Atlas', LATIN, ['poppins-400.woff2', 'fill-la.woff2']],
];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`.padStart(9);

await mkdir(OUT, { recursive: true });
let before = 0;
let after = 0;
const built = new Map();
for (const [out, source, chars] of JOBS) {
  const input = await readFile(require.resolve(source));
  const output = await subsetFont(input, chars, { targetFormat: 'woff2' });
  await assertCoverage(out, output, chars);
  await writeFile(new URL(out, OUT), output);
  built.set(out, output);
  before += input.length;
  after += output.length;
  console.log(`${out.padEnd(24)} ${kb(input.length)} -> ${kb(output.length)}`);
}
for (const [family, chars, files] of FAMILIES) {
  const have = new Set();
  for (const f of files) for (const cp of cmapCodepoints(new Uint8Array(await fontverter.convert(built.get(f), 'sfnt')))) have.add(cp);
  const missing = [...new Set(chars)].map((ch) => ch.codePointAt(0)).filter((cp) => !EXEMPT.has(cp) && !have.has(cp));
  if (missing.length) throw new Error(`${family}: no glyph for ${missing.map((c) => 'U+' + c.toString(16).toUpperCase()).join(' ')}`);
  console.log(`${family.padEnd(24)} covers its full set (${files.join(' + ')})`);
}
console.log(`${'total'.padEnd(24)} ${kb(before)} -> ${kb(after)}`);
