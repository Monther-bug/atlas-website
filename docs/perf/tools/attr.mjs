// attribute bytes of a bundle to source packages via sourcemap (minified-size share by mapped segments)
import fs from 'node:fs'; import zlib from 'node:zlib';
const dir = process.argv[2]; const files = process.argv.slice(3);
for (const f of files) {
  const js = fs.readFileSync(`${dir}/assets/${f}`, 'utf8'); const map = JSON.parse(fs.readFileSync(`${dir}/assets/${f}.map`, 'utf8'));
  // decode mappings
  const B = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const dec = (s) => { const r = []; let sh = 0, v = 0; for (const c of s) { const d = B.indexOf(c); v += (d & 31) << sh; if (d & 32) sh += 5; else { r.push(v & 1 ? -(v >> 1) : v >> 1); v = 0; sh = 0; } } return r; };
  const lines = js.split('\n'); const mapLines = map.mappings.split(';');
  const by = {}; let src = 0;
  mapLines.forEach((ml, li) => {
    let col = 0; const segs = ml ? ml.split(',').map(dec) : []; const pts = [];
    for (const s of segs) { col += s[0]; if (s.length > 1) { src += s[1]; pts.push([col, src]); } else pts.push([col, -1]); }
    const len = (lines[li] ?? '').length;
    pts.forEach((p, i) => { const end = i + 1 < pts.length ? pts[i + 1][0] : len; const name = p[1] < 0 ? '(unmapped)' : map.sources[p[1]]; by[name] = (by[name] ?? 0) + (end - p[0]); });
  });
  const group = (n) => { const m = n.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/); if (m) return 'pkg:' + m[1]; n = n.replace(/^(\.\.\/)+/, ''); return n; };
  const g = {}; for (const [n, b] of Object.entries(by)) { const k = group(n); g[k] = (g[k] ?? 0) + b; }
  const tot = Object.values(g).reduce((a, b) => a + b, 0); const gzTot = zlib.gzipSync(js, { level: 9 }).length;
  console.log(`\n== ${f}: ${(js.length / 1000).toFixed(1)} KB min, ${(gzTot / 1000).toFixed(1)} KB gz`);
  Object.entries(g).sort((a, b) => b[1] - a[1]).slice(0, 28).forEach(([k, b]) => console.log(`${(b / tot * gzTot / 1000).toFixed(1).padStart(6)} KB gz~  ${(b / 1000).toFixed(1).padStart(6)} KB min  ${k}`));
}
