import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const days = Number(get('--days', 14));
const root = get('--dir', 'data/contrib');
const apply = args.includes('--apply');
const cutoff = Date.now() - days * 86400000;
let kept = 0, removed = 0, skipped = 0;

function dateOf(name) {
  const m = name.match(/(\d{4})-?(\d{2})-?(\d{2})/);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  return Number.isNaN(t) ? null : t;
}

function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    const t = dateOf(e.name);
    if (t === null) { skipped++; continue; }
    if (t < cutoff) {
      removed++;
      if (apply) rmSync(p); else console.log('apagaria', p);
    } else kept++;
  }
}

walk(root);
console.log(`${apply ? 'apagados' : 'simulação, a apagar'}: ${removed} | mantidos: ${kept} | ignorados (sem data no nome): ${skipped}`);
