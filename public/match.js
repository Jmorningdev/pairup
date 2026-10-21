// PairUp matching core: parse pasted lists, then mentee-proposing deferred acceptance
// (Gale–Shapley with mentor capacities). No DOM here so it runs in Node tests too.

const key = s => s.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
const HEADER = new Set(['name', 'mentee', 'mentor', 'mentee name', 'mentor name', 'your name']);

// One person per line. "Name: choice 1, choice 2" or spreadsheet rows "Name<TAB>choice 1<TAB>choice 2".
// Mentors may carry a capacity: "Name (2): ..." or "Name x2". Blank lines and "#" lines are skipped.
export function parseList(text, withCapacity) {
  const people = [], warnings = [], seen = new Map();
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    let name, rest = '';
    const colon = line.indexOf(':');
    if (colon >= 0) [name, rest] = [line.slice(0, colon), line.slice(colon + 1)];
    else { const f = line.split(/\t|,/); name = f.shift(); rest = f.join(','); }
    let capacity = 1;
    if (withCapacity) {
      const m = name.match(/\s*(?:\((\d+)\)|[x×]\s*(\d+))\s*$/i);
      if (m) { capacity = Number(m[1] ?? m[2]); name = name.slice(0, m.index); }
    }
    name = name.trim();
    if (!name) return;
    if (people.length === 0 && HEADER.has(key(name))) return;
    if (seen.has(key(name))) { warnings.push(`Line ${i + 1}: "${name}" appears twice — kept the first line.`); return; }
    const prefs = [];
    for (const p of rest.split(/[,\t;>]/).map(s => s.trim()).filter(Boolean)) {
      if (prefs.some(q => key(q) === key(p))) continue;
      prefs.push(p);
    }
    const person = { name, prefs, capacity };
    seen.set(key(name), person);
    people.push(person);
  });
  return { people, warnings };
}

export function match(mentees, mentors) {
  const warnings = [];
  const byKey = new Map(mentors.map(m => [key(m.name), m]));
  const menteeKey = new Map(mentees.map(e => [key(e.name), e]));
  // Resolve preference names to objects; report names we can't find.
  const choices = new Map(), rank = new Map();
  for (const e of mentees) {
    const list = [];
    for (const p of e.prefs) {
      const m = byKey.get(key(p));
      if (m) list.push(m); else warnings.push(`${e.name} listed "${p}", who is not on the mentor list — skipped.`);
    }
    choices.set(e, list);
  }
  for (const m of mentors) {
    const r = new Map();
    m.prefs.forEach((p, i) => {
      const e = menteeKey.get(key(p));
      if (e) { if (!r.has(e)) r.set(e, i); } else warnings.push(`Mentor ${m.name} ranked "${p}", who is not on the mentee list — skipped.`);
    });
    rank.set(m, r);
  }
  const order = new Map(mentees.map((e, i) => [e, i]));
  // Lower = mentor likes them more. Unranked mentees come after ranked ones;
  // ties go to whoever ranked this mentor higher, then to the earlier line.
  const score = (m, e) => [rank.get(m).get(e) ?? Infinity, choices.get(e).indexOf(m), order.get(e)];
  const better = (m, a, b) => { const x = score(m, a), y = score(m, b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i]; return false; };

  const held = new Map(mentors.map(m => [m, []]));
  const next = new Map(mentees.map(e => [e, 0]));
  const turnedDown = new Map(mentees.map(e => [e, []]));
  const free = [...mentees];
  while (free.length) {
    const e = free.shift();
    const list = choices.get(e);
    if (next.get(e) >= list.length) continue;
    const m = list[next.get(e)];
    next.set(e, next.get(e) + 1);
    const h = held.get(m);
    h.push(e);
    if (h.length > m.capacity) {
      h.sort((a, b) => (better(m, a, b) ? -1 : better(m, b, a) ? 1 : 0));
      const out = h.pop();
      turnedDown.get(out).push(m);
      free.push(out);
    }
  }
  const pairs = [], unmatched = [];
  const mentorOf = new Map();
  for (const [m, h] of held) for (const e of h) mentorOf.set(e, m);
  for (const e of mentees) {
    const m = mentorOf.get(e);
    const why = turnedDown.get(e).map(x => x.name);
    if (m) pairs.push({ mentee: e.name, mentor: m.name, choice: choices.get(e).indexOf(m) + 1, passedOver: why });
    else unmatched.push({ mentee: e.name, passedOver: why, noChoices: choices.get(e).length === 0 });
  }
  const openSeats = mentors.map(m => ({ mentor: m.name, open: m.capacity - held.get(m).length })).filter(x => x.open > 0);
  return { pairs, unmatched, openSeats, warnings };
}

// A pair (mentee e, mentor m) "blocks" if both would rather have each other than what they got.
// Used by tests to prove the result is stable.
export function blockingPairs(mentees, mentors, result) {
  const { pairs } = result;
  const got = new Map(pairs.map(p => [key(p.mentee), p]));
  const out = [];
  for (const e of mentees) {
    const mine = got.get(key(e.name));
    const myChoice = mine ? mine.choice : Infinity;
    e.prefs.forEach((p, i) => {
      if (i + 1 >= myChoice) return;
      const m = mentors.find(x => key(x.name) === key(p));
      if (!m) return;
      const theirs = pairs.filter(q => key(q.mentor) === key(m.name));
      if (theirs.length < m.capacity) { out.push([e.name, m.name, 'open seat']); return; }
      const r = n => { const j = m.prefs.findIndex(x => key(x) === key(n)); return j < 0 ? Infinity : j; };
      if (theirs.some(q => r(e.name) < r(q.mentee))) out.push([e.name, m.name, 'mentor prefers']);
    });
  }
  return out;
}
