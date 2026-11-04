// A small, dependency-free reader for the <head> of our own HTML (QA + head consistency test).
// It is not a general HTML parser: it expects double- or single-quoted attributes like Vite writes.
const NAMED = { '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&lt;': '<', '&gt;': '>' };

export function decodeEntities(s) {
  return String(s)
    .replace(/&(quot|#39|#x27|lt|gt);/g, (m) => NAMED[m])
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

/** Attributes of one start tag, keys lower-cased, values entity-decoded ('' for bare attributes). */
export function parseAttrs(tag) {
  const inner = String(tag).replace(/^<\s*[a-zA-Z][\w-]*/, '').replace(/\/?\s*>$/, '');
  const attrs = {};
  for (const m of inner.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
}

export function parseHead(html) {
  const htmlAttrs = parseAttrs(html.match(/<html\b[^>]*>/i)?.[0] ?? '<html>');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const title = decodeEntities(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '');
  const meta = {};
  for (const m of head.matchAll(/<meta\b[^>]*>/gi)) {
    const a = parseAttrs(m[0]);
    const key = a.name ?? a.property;
    if (key && a.content !== undefined) meta[key] = a.content;
  }
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => parseAttrs(m[0]));
  const canonical = links.find((l) => l.rel === 'canonical')?.href ?? null;
  const alternates = Object.fromEntries(links.filter((l) => l.rel === 'alternate' && l.hreflang).map((l) => [l.hreflang, l.href]));
  const icons = links.filter((l) => /(^|\s)(icon|apple-touch-icon)(\s|$)/.test(l.rel ?? '')).map((l) => l.href);
  const jsonLd = [];
  const jsonLdErrors = [];
  for (const m of head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      jsonLd.push(JSON.parse(m[1]));
    } catch (e) {
      jsonLdErrors.push(String(e));
    }
  }
  return { lang: htmlAttrs.lang ?? null, dir: htmlAttrs.dir ?? null, title, meta, canonical, alternates, icons, jsonLd, jsonLdErrors };
}
