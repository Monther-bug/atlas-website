// Markdown summary of qa/run-qa.mjs results (tested in report.test.mjs).
// A result: { area, name, pass, detail, case?: { page, width, mode } }.

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Pass/fail counts per page × width × mode for the results that belong to a matrix case. */
export function matrix(results) {
  const cells = new Map();
  for (const r of results) {
    if (!r.case) continue;
    const key = `${r.case.page}|${r.case.width}|${r.case.mode}`;
    const c = cells.get(key) ?? { ...r.case, pass: 0, fail: 0 };
    if (r.pass) c.pass++;
    else c.fail++;
    cells.set(key, c);
  }
  return [...cells.values()].sort((a, b) => a.page.localeCompare(b.page) || a.width - b.width || a.mode.localeCompare(b.mode));
}

export function summarize(results, meta = {}) {
  const areas = new Map();
  for (const r of results) {
    const a = areas.get(r.area) ?? { pass: 0, fail: 0 };
    if (r.pass) a.pass++;
    else a.fail++;
    areas.set(r.area, a);
  }
  const failed = results.filter((r) => !r.pass);
  const lines = ['# QA summary', ''];
  if (meta.date) lines.push(`- Date: ${meta.date}`);
  if (meta.base) lines.push(`- Base URL: ${meta.base}`);
  if (meta.site) lines.push(`- SITE_URL expected in the head: ${meta.site}`);
  if (meta.target) lines.push(`- Expected build target: ${meta.target}`);
  if (meta.profile) lines.push(`- Build profile: ${meta.profile}`);
  lines.push(`- Checks: ${results.length - failed.length}/${results.length} passed`, '', '| Area | Passed | Failed |', '|---|---|---|');
  for (const [area, a] of [...areas].sort(([x], [y]) => x.localeCompare(y))) lines.push(`| ${area} | ${a.pass} | ${a.fail} |`);

  const cells = matrix(results);
  if (cells.length) {
    lines.push('', '## Matrix (page × width × mode)', '', '| Page | Width | Mode | Passed | Failed |', '|---|---|---|---|---|');
    for (const c of cells) lines.push(`| ${c.page} | ${c.width} | ${c.mode} | ${c.pass} | ${c.fail} |`);
  }

  lines.push('', '## Failures', '');
  if (failed.length) lines.push(...failed.map((r) => `- [${r.area}] ${r.name}${r.detail ? ` — ${esc(r.detail)}` : ''}`));
  else lines.push('None.');
  return lines.join('\n') + '\n';
}
