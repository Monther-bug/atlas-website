// CPU 4x + Slow 4G phone profile: long tasks / LoAF / trace main-thread breakdown / coverage / waterfall.
import puppeteer from 'puppeteer-core';
import { writeFile } from 'node:fs/promises';
const BASE = process.argv[2] ?? 'http://localhost:4380';
const PAGE = process.argv[3] ?? '/';
const TAG = process.argv[4] ?? 'base';
const CPU = Number(process.env.CPU ?? 4);
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-first-run', '--ignore-certificate-errors'] });
async function once(repeat) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 412, height: 823, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36');
  const cdp = await page.createCDPSession();
  await page.evaluateOnNewDocument(() => {
    window.__m = { lt: [], loaf: [], motion: 0, paints: {}, loaderDone: 0 };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__m.lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true });
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__m.loaf.push({ s: Math.round(e.startTime), d: Math.round(e.duration), blk: Math.round(e.blockingDuration), rs: Math.round(e.renderStart), sc: e.scripts.map((x) => ({ u: (x.sourceURL || '').split('/').pop(), f: x.sourceFunctionName, inv: x.invoker, d: Math.round(x.duration), ex: Math.round(x.executionStart - e.startTime), fs: Math.round(x.forcedStyleAndLayoutDuration), p: Math.round(x.pauseDuration) })) }))).observe({ type: 'long-animation-frame', buffered: true }); } catch {}
    const mo = new MutationObserver(() => { if (document.documentElement.dataset.motion && !window.__m.motion) window.__m.motion = Math.round(performance.now()); });
    mo.observe(document, { attributes: true, subtree: true, attributeFilter: ['data-motion'] });
    (function poll(){ const e = document.getElementById('al'); if (e) { (window.__m.ps ??= []).push([Math.round(performance.now()), +(parseFloat(e.style.getPropertyValue('--p')) || 0).toFixed(2), performance.getEntriesByType('resource').length]); if (!window.__m.alSeen) window.__m.alFirst = Math.round(performance.now()); window.__m.alSeen = 1; } else if (window.__m.alSeen && !window.__m.alGone) { window.__m.alGone = Math.round(performance.now()); return; } requestAnimationFrame(poll); })();
    addEventListener('atlas:loader-done', () => { window.__m.loaderDone = Math.round(performance.now()); });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__m.paints[e.name] = Math.round(e.startTime); })).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((l) => { const e = l.getEntries().at(-1); window.__m.lcp = Math.round(e.startTime); window.__m.lcpEl = e.element?.className || e.element?.tagName; }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  if (repeat) { // warm cache + session flag
    await page.goto(BASE + PAGE, { waitUntil: 'networkidle0' }); await new Promise((r) => setTimeout(r, 2500));
  }
  await cdp.send('Network.enable');
  if (process.env.NET === 'fast') await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: (12 * 1024 * 1024) / 8, uploadThroughput: (6 * 1024 * 1024) / 8 }); else await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  if (repeat) await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
  const reqs = [];
  cdp.on('Network.requestWillBeSent', (e) => reqs.push({ id: e.requestId, url: e.request.url.replace(BASE, ''), t0: e.timestamp, prio: e.request.initialPriority, type: e.type, init: e.initiator.type }));
  cdp.on('Network.responseReceived', (e) => { const r = reqs.find((x) => x.id === e.requestId); if (r) { r.status = e.response.status; r.cached = e.response.fromDiskCache; r.size = e.response.encodedDataLength; } });
  cdp.on('Network.loadingFinished', (e) => { const r = reqs.find((x) => x.id === e.requestId); if (r) { r.t1 = e.timestamp; r.enc = e.encodedDataLength; } });
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await page.coverage.startCSSCoverage({ resetOnNavigation: false });
  await page.tracing.start({ categories: ['devtools.timeline', 'v8.execute', 'disabled-by-default-devtools.timeline', 'loading', 'blink.user_timing'] });
  const nav0 = Date.now();
  await page.goto(BASE + PAGE, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.__m.motion > 0, { timeout: 12000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2500));
  const traceBuf = await page.tracing.stop();
  const js = await page.coverage.stopJSCoverage();
  const css = await page.coverage.stopCSSCoverage();
  const m = await page.evaluate(() => window.__m);
  const trace = JSON.parse(Buffer.from(traceBuf).toString());
  // main thread breakdown
  const ev = trace.traceEvents;
  const main = ev.find((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
  const nav = ev.find((e) => e.name === 'navigationStart' && e.pid === main.pid && e.tid === main.tid) ?? ev.find((e) => e.name === 'navigationStart');
  const t0 = nav.ts;
  const mainEv = ev.filter((e) => e.pid === main.pid && e.tid === main.tid && e.ph === 'X');
  const sum = (names) => mainEv.filter((e) => names.includes(e.name)).reduce((a, e) => a + e.dur, 0) / 1000;
  const tasks = mainEv.filter((e) => e.name === 'RunTask').map((e) => ({ s: (e.ts - t0) / 1000, d: e.dur / 1000 })).filter((t) => t.d >= 50).sort((a, b) => a.s - b.s);
  const parse = sum(['v8.compile', 'V8.CompileCode', 'v8.compileModule', 'v8.parseOnBackground']);
  const bd = { evalScript: sum(['EvaluateScript', 'v8.evaluateModule']), compile: sum(['v8.compile', 'v8.compileModule']), functionCall: sum(['FunctionCall']), parseHTML: sum(['ParseHTML']), style: sum(['UpdateLayoutTree']), layout: sum(['Layout']), paint: sum(['Paint']), commit: sum(['Commit']), layerize: sum(['Layerize']), prePaint: sum(['PrePaint']) , raster: 0};
  const jsTotal = js.reduce((a, e) => a + e.text.length, 0);
  const jsUsed = js.reduce((a, e) => a + e.ranges.reduce((s, r) => s + r.end - r.start, 0), 0);
  const cssTotal = css.reduce((a, e) => a + e.text.length, 0);
  const cssUsed = css.reduce((a, e) => a + e.ranges.reduce((s, r) => s + r.end - r.start, 0), 0);
  const covRows = js.map((e) => ({ u: e.url.split('/').pop(), tot: e.text.length, used: e.ranges.reduce((s, r) => s + r.end - r.start, 0) })).filter((r) => r.tot > 2000);
  const wf = reqs.filter((r) => r.t1).map((r) => ({ url: r.url.slice(0, 70), prio: r.prio, start: Math.round((r.t0 - reqs[0].t0) * 1000), end: Math.round((r.t1 - reqs[0].t0) * 1000), enc: r.enc, cached: r.cached })).sort((a, b) => a.start - b.start);
  await ctx.close();
  return { m, tasks, bd, jsTotal, jsUsed, cssTotal, cssUsed, covRows, wf, nTasks: tasks.length };
}
const out = {};
for (const visit of (process.env.VISITS ?? 'first,repeat').split(',')) {
  const runs = [];
  for (let i = 0; i < 3; i++) { for (let a = 0; a < 3; a++) { try { runs.push(await once(visit === 'repeat')); break; } catch (e) { console.log('retry', String(e.message).slice(0, 80)); } } }
  out[visit] = runs;
  const med = (f) => runs.map(f).sort((a, b) => a - b)[1];
  console.log(JSON.stringify(runs[1].m.ps?.filter((_, i) => i % 3 === 0).slice(0, 40)));
  console.log(visit, 'loaderDone', med((r) => r.m.loaderDone), 'alFirst', med((r) => r.m.alFirst), 'alGone', med((r) => r.m.alGone), 'FCP', med((r) => r.m.paints['first-contentful-paint']), 'LCP', med((r) => r.m.lcp), 'motionStart', med((r) => r.m.motion), 'LT count', med((r) => r.m.lt.length), 'total LT ms', med((r) => r.m.lt.reduce((a, t) => a + t[1], 0)), 'jsUsed%', med((r) => Math.round((100 * r.jsUsed) / r.jsTotal)), 'cssUsed%', med((r) => Math.round((100 * r.cssUsed) / r.cssTotal)));
  console.log('  bd', JSON.stringify(Object.fromEntries(Object.entries(runs[1].bd).map(([k, v]) => [k, Math.round(v)]))));
}
await writeFile(`.work/out/trace-${TAG}.json`, JSON.stringify(out));
await browser.close();
