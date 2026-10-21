// Run: node test.mjs  (no dependencies)
import assert from 'node:assert/strict';
import { parseList, match, blockingPairs } from './public/match.js';

const run = (a, b) => { const e = parseList(a, false), m = parseList(b, true); return { e, m, r: match(e.people, m.people) }; };

// 1. Classic case: everyone gets someone, result is stable.
{
  const { e, m, r } = run(
    'Ana: Kenji, Lee\nBo: Kenji, Lee\nCy: Lee, Kenji',
    'Kenji (1): Bo, Ana\nLee x2: Ana, Cy, Bo');
  assert.equal(r.unmatched.length, 0);
  assert.deepEqual(r.pairs.map(p => [p.mentee, p.mentor]), [['Ana', 'Lee'], ['Bo', 'Kenji'], ['Cy', 'Lee']]);
  assert.deepEqual(r.pairs[0].passedOver, ['Kenji']); // Ana asked Kenji first, Kenji preferred Bo
  assert.deepEqual(blockingPairs(e.people, m.people, r), []);
}
// 2. Spreadsheet paste with header, tabs, case/space differences, unknown name, duplicate.
{
  const { e, m, r } = run(
    'Name\tChoice 1\tChoice 2\nana  lopez\tKENJI\tNobody\nBo\tkenji\nBo\tLee',
    'Mentor name\nKenji');
  assert.deepEqual(e.people.map(p => p.name), ['ana  lopez', 'Bo']);
  assert.equal(e.warnings.length, 1);
  assert.ok(r.warnings.some(w => w.includes('Nobody')));
  assert.equal(r.pairs.length, 1);
  assert.equal(r.pairs[0].mentee, 'ana  lopez'); // tie on mentor side -> earlier line
  assert.equal(r.unmatched[0].mentee, 'Bo');
  assert.deepEqual(r.unmatched[0].passedOver, ['Kenji']);
}
// 3. Unranked mentor: prefers whoever ranked them higher.
{
  const { r } = run('A: X, Y\nB: Y, X', 'X\nY');
  assert.deepEqual(r.pairs.map(p => p.choice), [1, 1]);
}
// 4. Random instances: never a blocking pair, never over capacity, nobody twice.
{
  let seed = 7; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let t = 0; t < 300; t++) {
    const nE = 1 + rnd(12), nM = 1 + rnd(5);
    const E = Array.from({ length: nE }, (_, i) => 'e' + i), M = Array.from({ length: nM }, (_, i) => 'm' + i);
    const shuffle = a => a.map(x => [rnd(1000), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
    const a = E.map(x => `${x}: ${shuffle(M).slice(0, rnd(nM + 1)).join(', ')}`).join('\n');
    const b = M.map(x => `${x} (${1 + rnd(3)}): ${shuffle(E).join(', ')}`).join('\n');
    const { e, m, r } = run(a, b);
    assert.deepEqual(blockingPairs(e.people, m.people, r), [], a + '\n--\n' + b);
    for (const mm of m.people) assert.ok(r.pairs.filter(p => p.mentor === mm.name).length <= mm.capacity);
    assert.equal(r.pairs.length + r.unmatched.length, nE);
  }
}
console.log('ok');
