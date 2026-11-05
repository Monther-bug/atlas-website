// Production-like static server: brotli, vercel.json cache headers. COMP=0 disables compression (like vite preview).
import http from 'node:http';
import http2 from 'node:http2';
import { readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
const DIST = path.resolve(process.argv[2] ?? 'dist');
const PORT = Number(process.argv[3] ?? 4380);
const COMP = process.env.COMP !== '0';
const T = { '.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2','.avif':'image/avif','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.xml':'application/xml','.txt':'text/plain','.ico':'image/x-icon' };
const cache = new Map();
const H2 = process.env.H2 === '1';
const handler = async (req, res) => {
  req.headers.host ??= 'x';
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DIST, p);
  if (!f.startsWith(DIST)) { res.writeHead(403).end(); return; }
  try {
    const st = await stat(f); if (!st.isFile()) throw 0;
    const ext = path.extname(f);
    let body = await readFile(f);
    const h = { 'Content-Type': T[ext] ?? 'application/octet-stream' };
    if (p.startsWith('/assets/') || p.startsWith('/img/')) h['Cache-Control'] = 'public, max-age=31536000, immutable';
    else if (p.startsWith('/brand/')) h['Cache-Control'] = 'public, max-age=86400';
    else if (p.endsWith('index.html')) h['Cache-Control'] = 'public, max-age=0, must-revalidate';
    else h['Cache-Control'] = 'public, max-age=3600';
    if (COMP && /\.(html|js|css|svg|json|xml|txt)$/.test(ext) && /br/.test(req.headers['accept-encoding'] ?? '')) {
      const ck = f + st.mtimeMs; if (!cache.has(ck)) cache.set(ck, zlib.brotliCompressSync(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }));
      body = cache.get(ck); h['Content-Encoding'] = 'br'; h.Vary = 'Accept-Encoding';
    }
    h['Content-Length'] = body.length;
    res.writeHead(200, h).end(body);
  } catch { res.writeHead(404).end('not found'); }
};
const srv = H2 ? http2.createSecureServer({ key: readFileSync(new URL('../../../.work/key.pem', import.meta.url)), cert: readFileSync(new URL('../../../.work/cert.pem', import.meta.url)), allowHTTP1: true }, handler) : http.createServer(handler);
srv.listen(PORT, () => console.log('listening', PORT, H2 ? 'h2' : 'h1', COMP ? 'br' : 'plain'));
