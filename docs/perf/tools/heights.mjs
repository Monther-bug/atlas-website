import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--ignore-certificate-errors'] });
for (const w of [360, 412, 600, 768, 1024, 1440]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: w < 700 ? 800 : 900, deviceScaleFactor: 2, isMobile: w < 800, hasTouch: w < 800 });
  await p.goto(process.argv[2], { waitUntil: 'networkidle0' }); await new Promise((r) => setTimeout(r, 2500));
  const r = await p.evaluate(() => Object.fromEntries(['crane-list', 'services', 'why-atlas', 'sites', 'request'].map((id) => [id, Math.round(document.getElementById(id).getBoundingClientRect().height)]).concat([['footer', Math.round(document.querySelector('[data-footer]').getBoundingClientRect().height)], ['doc', document.documentElement.scrollHeight]])));
  console.log(w, JSON.stringify(r)); await p.close();
}
await b.close();
