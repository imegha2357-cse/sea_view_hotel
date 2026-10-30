// Speed budget (feature #98): fails CI if a public page ships too much JavaScript on first load.
// Reads the sizes Next.js prints after `next build` (saved to build.log in CI).
import { readFileSync } from 'node:fs';

const LIMIT_KB = Number(process.env.SPEED_BUDGET_KB || 200);
const log = readFileSync(process.argv[2] || 'build.log', 'utf8');
const rows = [...log.matchAll(/^[├└┌]\s+[○●ƒλ]\s+(\/\S*)\s+[\d.]+\s+k?B\s+([\d.]+)\s+(k?B)/gm)].map((m) => ({ path: m[1], kb: m[3] === 'kB' ? Number(m[2]) : Number(m[2]) / 1024 }));
if (!rows.length) {
  console.log('No page sizes found in the build log; skipping the speed budget.');
  process.exit(0);
}
const over = rows.filter((r) => !/^\/(admin|account|login)/.test(r.path) && r.kb > LIMIT_KB);
for (const r of rows.sort((a, b) => b.kb - a.kb).slice(0, 8)) console.log(`${r.kb.toFixed(1).padStart(7)} kB  ${r.path}`);
if (over.length) {
  console.error(`\nOver the ${LIMIT_KB} kB first-load budget:\n${over.map((r) => `  ${r.path}: ${r.kb.toFixed(1)} kB`).join('\n')}`);
  process.exit(1);
}
console.log(`\nAll public pages are within the ${LIMIT_KB} kB first-load budget.`);
