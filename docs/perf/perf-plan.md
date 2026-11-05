# Performance plan (task PA)

Setup: brotli static server (matches Vercel; vite preview is uncompressed and inflates mobile LCP 0.84 -> 1.74 s), Lighthouse median of 3,
plus a 4x CPU + Slow 4G phone trace (H2). Tools: `docs/perf/tools/`. LH LCP does not see the loader; Speed Index and "curtain gone" do.

## Baseline (pre-merge site, LH median of 3)
Mobile AR first/repeat: FCP=LCP 905/842 ms, SI 2212/842, TBT 0, perf 100. Desktop FCP=LCP 244/229. LCP element = H1 line. First load 538 KB, JS 102.1 KB gz, CSS 21.7.

## Findings
- Main thread (4x): first render style+layout ~480 ms, hydration ~90 ms in one task, module eval ~55 ms, startMotion ~85 ms. JS parse/compile ~2 ms. Hydration is not the bottleneck.
- boot = 87 KB gz: react-dom 63 KB (72%), app code ~22 KB (RequestForm 5, Header 2.5, rest ~1 each). GSAP chunk 44 KB gz is lazy. Coverage at load: boot 38% used, CSS 83%.
- Waterfall: the 79 KB badge.png (Low priority) shared the Slow 4G pipe with fonts, JS and hero until 2.1 s. Fonts (6 small files) and unicode-range splits are already good.
- Loader holds the hero ~0.95 s + 0.64 s lift on every first visit.
- AVIF q50 effort 4 was heavier than needed.
- Scroll (desktop and touch, 4x): p95 16.7 ms in every section; 2-3 long tasks of 54-66 ms (core start, hoist import).

## Applied (own commits)
| Change | Measured |
|---|---|
| badge-192.webp + 64/180 icons (a56f19f) | first-visit curtain gone 2527 -> 2297 ms, motion start 2870 -> 2280 ms, repeat FCP 806 -> 714 (4x/Slow 4G) |
| Phone loader shorter (fde6d4f) | curtain gone 2298 -> 1935 ms (Slow 4G), 1587 -> 1151 ms (fast) |
| AVIF q42/hero q40, effort 6 (ebfa941 + regenerated 1e17636) | AVIF 8.6 -> 6.1 MB, hero mobile 39 -> 30.9 KB, desktop 78.5 -> 55.2 KB; PSNR -1.1 dB, no visible change at 100% |
| Combined, LH mobile AR | SI first 2212 -> ~1630 (pre-merge), first load 538 -> 369 KB; EN SI 2364 -> 1762 |
After merging feat/site-build: home mobile first FCP 1052, SI 1810; repeat 826. Crane pages first 902 / SI 1393, repeat 629. Perf 100, BP 100 everywhere. Initial JS 104.1 KB (budget 110), CSS 23.3.
Apply `npm run assets` again after merges that add photos; drop the regenerated-images commit. Inline loader script changed: CSP now lists two hashes (home, crane head). Recompute with the README recipe (all HTML files).

## Measured, not applied
- Skip loader on phones: curtain 0 ms (hero at FCP) vs 1935 (Slow 4G): `patches/loader-skip-phones.patch`. Needs qa/loader.mjs 390 checks changed. Biggest remaining first-visit win; design call.
- content-visibility on below-fold sections: repeat FCP 696 -> 560 ms, style/layout -25%, but document height drifted (+1.5k px) and ScrollTrigger positions with estimated heights: needs per-width size calibration and a refresh hook. `patches/content-visibility-rejected.patch`. Defer.
- One font preload instead of three: first FCP -60 ms, fast -30 ms. Needs smoke-prerender (3 -> 1, crane check) and spec edit. Marginal.
- Lazy hydration / trimming boot (form, menu): hydration total is ~90 ms at 4x (~22 ms real); lazy form+menu saves ~6 KB gz (~30 ms on Slow 4G, off the critical path). Not worth the risk.
- Preact/compat would save ~50 KB gz but needs `npm install` and React 19 API checks. Research item.
- Cache: `/brand/` is 1 day, not immutable; hash badge names later. Critical CSS inline: not worth it (CSS is 19 KB br, cached).
