import { parseList, match } from './match.js';

const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
let csv = '';

$('example').onclick = () => {
  if (($('mentees').value.trim() || $('mentors').value.trim()) && !confirm('Replace what you typed with the example?')) return;
  $('mentees').value = 'Aisha: Priya, Marco, Tom\nBen: Priya, Tom\nChloe: Priya, Tom, Marco\nDiego: Marco, Tom\nEmma: Priya, Marco, Tom\nFinn: Tom\nGina: Marco, Priya';
  $('mentors').value = 'Marco (2): Diego, Aisha\nPriya (2): Emma, Chloe, Ben, Aisha\nTom (2)';
  run();
};
$('go').onclick = run;
$('copy').onclick = async () => {
  await navigator.clipboard.writeText(csv);
  $('copy').textContent = 'Copied';
  setTimeout(() => ($('copy').textContent = 'Copy as CSV'), 1500);
};
// Old results would no longer match the edited lists.
for (const id of ['mentees', 'mentors']) $(id).addEventListener('input', () => { $('out').innerHTML = ''; $('copy').hidden = true; });

const reasonPaired = p => `their ${ord(p.choice)} choice` + (p.passedOver.length ? `; ${p.passedOver.length > 1 ? p.passedOver.slice(0, -1).join(', ') + ' and ' + p.passedOver.at(-1) : p.passedOver[0]} filled up with mentees ahead of them` : '');
const reasonUnpaired = u => u.listedNone ? 'listed no mentors' : u.noChoices ? 'none of their choices matches a name on the mentor list' : `every mentor they chose (${u.passedOver.join(', ')}) filled up with mentees ahead of them`;

function run() {
  const e = parseList($('mentees').value, false), m = parseList($('mentors').value, true);
  if (!e.people.length || !m.people.length) {
    $('out').innerHTML = `<div class="warn">Add at least one mentee and one mentor first.</div>`;
    $('copy').hidden = true;
    return;
  }
  const r = match(e.people, m.people);
  const warnings = [...e.warnings.map(w => 'Mentees — ' + w), ...m.warnings.map(w => 'Mentors — ' + w), ...r.warnings];
  const first = r.pairs.filter(p => p.choice === 1).length;
  let h = `<div class="summary" id="summary">
    <div class="stat"><b>${r.pairs.length} / ${e.people.length}</b>mentees paired</div>
    <div class="stat"><b>${first}</b>got their 1st choice</div>
    <div class="stat"><b>${r.unmatched.length}</b>not paired</div></div>`;
  if (warnings.length) h += `<div class="warn"><b>Check these lines</b><ul>${warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>`;
  for (const mentor of m.people) {
    const mine = r.pairs.filter(p => p.mentor === mentor.name);
    h += `<div class="mentor"><h3>${esc(mentor.name)} <span class="open">${mine.length} of ${mentor.capacity} ${mentor.capacity === 1 ? 'seat' : 'seats'} filled</span></h3>`;
    if (mine.length) h += `<ul>${mine.map(p => `<li>${esc(p.mentee)} <span class="why">— ${esc(reasonPaired(p))}</span></li>`).join('')}</ul>`;
    h += `</div>`;
  }
  if (r.unmatched.length) h += `<div class="mentor"><h3>Not paired</h3><ul>${r.unmatched.map(u => `<li>${esc(u.mentee)} <span class="why">— ${esc(reasonUnpaired(u))}</span></li>`).join('')}</ul></div>`;
  if (r.pairs.some(p => p.passedOver.length) || r.unmatched.some(u => u.passedOver.length))
    h += `<p class="hint">“Ahead of them” means the mentor ranked those mentees higher. When a mentor gave no ranking, mentees who put that mentor higher on their own list come first, then whoever is higher in the pasted list.</p>`;
  $('out').innerHTML = h;
  // Spreadsheet apps run cells that start with = + - @ as formulas; prefix them with '.
  const q = s => `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
  csv = ['mentee,mentor,choice,reason', ...r.pairs.map(p => [q(p.mentee), q(p.mentor), p.choice, q(reasonPaired(p))].join(',')), ...r.unmatched.map(u => [q(u.mentee), '', '', q(reasonUnpaired(u))].join(','))].join('\n');
  $('copy').hidden = false;
  $('summary').scrollIntoView({ block: 'start' });
}
