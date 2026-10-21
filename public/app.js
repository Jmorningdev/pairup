import { parseList, match } from './match.js';

const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
let csv = '';

$('example').onclick = () => {
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
  let h = `<div class="summary">
    <div class="stat"><b>${r.pairs.length} / ${e.people.length}</b>mentees paired</div>
    <div class="stat"><b>${first}</b>got their 1st choice</div>
    <div class="stat"><b>${r.unmatched.length}</b>not paired</div></div>`;
  if (warnings.length) h += `<div class="warn"><b>Check these lines</b><ul>${warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>`;
  for (const mentor of m.people) {
    const mine = r.pairs.filter(p => p.mentor === mentor.name);
    const open = mentor.capacity - mine.length;
    h += `<div class="mentor"><h3>${esc(mentor.name)}</h3>`;
    if (mine.length) h += `<ul>${mine.map(p => `<li>${esc(p.mentee)} <span class="why">— their ${ord(p.choice)} choice${p.passedOver.length ? `; ${esc(p.passedOver.join(', '))} ${p.passedOver.length > 1 ? 'were' : 'was'} already full` : ''}</span></li>`).join('')}</ul>`;
    if (open > 0) h += `<p class="open">${open} open ${open === 1 ? 'seat' : 'seats'}</p>`;
    h += `</div>`;
  }
  if (r.unmatched.length) h += `<div class="mentor"><h3>Not paired</h3><ul>${r.unmatched.map(u => `<li>${esc(u.mentee)} <span class="why">— ${u.noChoices ? 'listed no mentor from the mentor list' : (u.passedOver.length > 1 ? `the mentors they chose (${esc(u.passedOver.join(', '))}) were` : `${esc(u.passedOver[0])}, the only mentor they chose, was`) + ' already full'}</span></li>`).join('')}</ul></div>`;
  $('out').innerHTML = h;
  const q = s => `"${s.replace(/"/g, '""')}"`;
  csv = ['mentee,mentor,choice', ...r.pairs.map(p => `${q(p.mentee)},${q(p.mentor)},${p.choice}`), ...r.unmatched.map(u => `${q(u.mentee)},,`)].join('\n');
  $('copy').hidden = false;
}
