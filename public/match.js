// PairUp matching core: parse pasted lists, then mentee-proposing deferred acceptance
// (Gale–Shapley with mentor capacities). No DOM here so it runs in Node tests too.

const key = s => s.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
const HEADER = /\b(name|mentee|mentor|choice|preference|timestamp|capacity|seats|e-?mail)\b/i;
const SKIP = /timestamp|e-?mail|date|time/i, CAP = /capacity|seats|how many|max/i;
const STAMP = /^\d{1,4}[\/.\-]\d{1,2}[\/.\-]\d{1,4}\b/;

// One person per line. "Name: choice 1, choice 2" or rows copied from a spreadsheet
// (tab-separated: name, then choices; an optional header row tells which columns are timestamps,
// e-mails or capacity). Mentors may carry a capacity: "Name (2)" or a capacity column.
// Blank lines and "#" lines are skipped.
export function parseList(text, withCapacity) {
  const people = [], warnings = [], seen = new Map();
  let cols = null; // column roles from a header row
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    let cells;
    if (line.includes('\t')) cells = raw.split('\t').map(s => s.trim());
    else if (line.includes(':')) { const c = line.indexOf(':'); cells = [line.slice(0, c), ...line.slice(c + 1).split(/[,;>]/)]; }
    else cells = line.split(/[,;]/);
    cells = cells.map(s => s.trim());
    const isHeader = cells.length > 1 ? HEADER.test(cells[0]) || cells.some(c => /timestamp/i.test(c)) : HEADER.test(cells[0]) && cells[0].split(' ').length <= 3;
    if (!people.length && !cols && isHeader) {
      const roles = cells.map(c => (CAP.test(c) ? 'cap' : SKIP.test(c) ? 'skip' : /name|mentee|mentor/i.test(c) && !/choice|pref/i.test(c) ? 'name' : 'choice'));
      if (!roles.includes('name')) roles[roles.indexOf('choice')] = 'name';
      cols = roles;
      return;
    }
    const tabbed = line.includes('\t');
    let roles = (tabbed && cols) || cells.map((c, j) => (j === 0 ? 'name' : 'choice'));
    if (!(tabbed && cols) && STAMP.test(cells[0]) && cells.length > 1) roles = ['skip', 'name', ...cells.slice(2).map(() => 'choice')];
    let name = '', capacity = 1, capSet = false;
    const prefs = [], got = new Set();
    cells.forEach((c, j) => {
      const r = roles[j] ?? 'choice';
      if (!c || r === 'skip') return;
      if (r === 'name') { if (!name) name = c; return; }
      if (withCapacity && (r === 'cap' || /^\d+$/.test(c)) && !capSet) { capacity = Number(c) || 0; capSet = true; return; }
      if (r === 'cap') return;
      if (!got.has(key(c))) { got.add(key(c)); prefs.push(c); }
    });
    if (withCapacity) {
      const m = name.match(/\s*\((\d+)\)\s*$/);
      if (m) { capacity = Number(m[1]); name = name.slice(0, m.index).trim(); }
    }
    if (!name) return;
    if (seen.has(key(name))) { warnings.push(`Line ${i + 1}: "${name}" appears twice — kept the first line.`); return; }
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
  const asked = new Map(mentees.map(e => [e, new Map(choices.get(e).map((m, i) => [m, i]))]));
  // Lower = mentor likes them more. Unranked mentees come after ranked ones;
  // ties go to whoever ranked this mentor higher, then to the earlier line.
  const score = (m, e) => [rank.get(m).get(e) ?? Infinity, asked.get(e).get(m), order.get(e)];
  const cmp = (x, y) => x.s[0] - y.s[0] || x.s[1] - y.s[1] || x.s[2] - y.s[2] || 0;

  const held = new Map(mentors.map(m => [m, []]));
  const next = new Map(mentees.map(e => [e, 0]));
  const turnedDown = new Map(mentees.map(e => [e, []]));
  const free = [...mentees].reverse();
  while (free.length) {
    const e = free.pop();
    const list = choices.get(e);
    if (next.get(e) >= list.length) continue;
    const m = list[next.get(e)];
    next.set(e, next.get(e) + 1);
    const h = held.get(m);
    h.push({ e, s: score(m, e) });
    if (h.length > m.capacity) {
      h.sort(cmp);
      const out = h.pop().e;
      turnedDown.get(out).push(m);
      free.push(out);
    }
  }
  const pairs = [], unmatched = [];
  const mentorOf = new Map();
  for (const [m, h] of held) for (const { e } of h) mentorOf.set(e, m);
  for (const e of mentees) {
    const m = mentorOf.get(e);
    const why = turnedDown.get(e).map(x => x.name);
    if (m) pairs.push({ mentee: e.name, mentor: m.name, choice: choices.get(e).indexOf(m) + 1, passedOver: why });
    else unmatched.push({ mentee: e.name, passedOver: why, noChoices: choices.get(e).length === 0, listedNone: e.prefs.length === 0 });
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
