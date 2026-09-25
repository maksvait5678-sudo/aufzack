// Тести цілісності теми genus. Запуск: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../js/topics/genus.data.js';
import genus, { SIGNAL_GENDER, blockedFromArticleGap } from '../js/topics/genus.js';

const GENDERS = ['der', 'die', 'das'];
const play = data.filter(d => !d.todo);

// Патерни для орфографічно скановних сигналів (-er і semder — вручну, без скану).
const SCAN = {
  e: /[^e]e$/, in: /[^e]in$/, ung: /ung$/, heit: /heit$/, keit: /keit$/,
  schaft: /schaft$/, ion: /ion$/, chen: /chen$/, um: /um$/, ling: /ling$/, zeug: /zeug$/
};

test('genus data: рід валідний, без дублікатів', () => {
  const seen = new Set();
  for (const d of data) {
    assert.ok(GENDERS.includes(d.g), `невалідний рід: ${d.w}`);
    assert.ok(!seen.has(d.w), `дубль: ${d.w}`);
    seen.add(d.w);
  }
});

test('genus data: сигнал s відповідає роду', () => {
  for (const d of play) {
    if (!d.s) continue;
    assert.ok(SIGNAL_GENDER[d.s], `невідомий сигнал ${d.s} у ${d.w}`);
    assert.equal(d.g, SIGNAL_GENDER[d.s], `${d.w}: s=${d.s} очікує ${SIGNAL_GENDER[d.s]}, а рід ${d.g}`);
  }
});

// Сигнали, у яких у цій колоді є РЕАЛЬНІ семантичні винятки (слово має морфему правила,
// але інший рід). Лише -e (Ge-слова, слабкі чоловіки, Auge, Ende). Орфографічні збіги
// без морфеми (Kuchen, Baum) позначаються collide, а не sx (див. SPEC-критерій).
const REAL_EXC = ['e'];

test('genus data: sx — справжній семантичний виняток (лише дозволені сигнали)', () => {
  for (const d of play) {
    if (!d.sx) continue;
    assert.ok(SIGNAL_GENDER[d.sx], `невідомий sx ${d.sx} у ${d.w}`);
    assert.notEqual(d.g, SIGNAL_GENDER[d.sx], `${d.w}: sx=${d.sx}, але рід збігається із сигналом`);
    if (SCAN[d.sx]) assert.ok(SCAN[d.sx].test(d.w), `${d.w}: sx=${d.sx}, але слово не матчить патерн`);
    assert.ok(REAL_EXC.includes(d.sx), `${d.w}: sx=${d.sx} — цей сигнал не має реальних винятків; це collide, не sx`);
  }
});

test('genus data: collide — прихований збіг (поверхнево на суфікс, інший рід, не показується)', () => {
  for (const d of play) {
    if (!d.collide) continue;
    assert.ok(SIGNAL_GENDER[d.collide], `невідомий collide ${d.collide} у ${d.w}`);
    assert.notEqual(d.g, SIGNAL_GENDER[d.collide], `${d.w}: collide, але рід збігається із сигналом`);
    // Поверхневий збіг: слово закінчується на літери сигналу (вужчий скан їх навмисно не ловить).
    assert.ok(d.w.toLowerCase().endsWith(d.collide), `${d.w}: collide=${d.collide}, але не закінчується на -${d.collide}`);
    assert.equal(d.sx, undefined, `${d.w}: sx і collide взаємовиключні`);
  }
});

test('genus data: weak-слово не має genEs (n-Deklination дає -en, не -es)', () => {
  for (const d of play) if (d.weak) assert.ok(!d.genEs, `${d.w}: weak і genEs суперечать (des ...en, не -es)`);
});

test('genus data: sq відповідає роду і не поєднується з s', () => {
  for (const d of play) {
    if (!d.sq) continue;
    assert.ok(SIGNAL_GENDER[d.sq], `невідомий sq ${d.sq} у ${d.w}`);
    assert.equal(d.g, SIGNAL_GENDER[d.sq], `${d.w}: sq=${d.sq} очікує ${SIGNAL_GENDER[d.sq]}, а рід ${d.g}`);
    assert.equal(d.s, undefined, `${d.w}: s і sq взаємовиключні`);
  }
});

test('genus data: слово на відомий суфікс завжди позначене (s/sq/sx/collide)', () => {
  for (const sig of Object.keys(SCAN)) {
    const P = SCAN[sig];
    for (const d of play) {
      if (!P.test(d.w)) continue;
      assert.ok(d.s || d.sq || d.sx || d.collide, `${d.w} закінчується на відомий суфікс, але без s/sq/sx/collide`);
    }
  }
});

test('genus data: посигнальний скан — інший рід позначено sx (виняток) або collide (збіг)', () => {
  // Слово того ж роду, що й сигнал, — консистентне (s/sq-підказка або лексика поза групою).
  // Слово ІНШОГО роду, що матчить патерн, — обов'язково sx (реальний виняток) або collide (збіг).
  for (const sig of Object.keys(SCAN)) {
    const P = SCAN[sig], G = SIGNAL_GENDER[sig];
    for (const d of play) {
      if (!P.test(d.w)) continue;
      if (d.g !== G) assert.ok(d.sx === sig || d.collide === sig, `${d.w} (${d.g}) матчить -${sig}, але не позначене sx/collide:${sig}`);
    }
  }
});

test('genus data: ліміт слів на сигнал (5, для -e 8) — падати на перевищенні', () => {
  const CAP = { e: 8 };
  const DEFAULT = 5;
  const counts = play.filter(d => d.s).reduce((m, d) => ((m[d.s] = (m[d.s] || 0) + 1), m), {});
  for (const [sig, n] of Object.entries(counts)) {
    const cap = CAP[sig] ?? DEFAULT;
    assert.ok(n <= cap, `сигнал -${sig}: ${n} слів, ліміт ${cap}`);
  }
});

test('genus data: пріоритет semder над орфографічним -ling однозначний', () => {
  const fr = byId('Frühling');
  assert.equal(fr.s, 'semder', 'Frühling має бути semder, не ling');
  assert.equal(SIGNAL_GENDER[fr.s], 'der');
  function byId(w) { return play.find(d => d.w === w); }
});

test('genus data: weak валідний і блокований у шаблонах із пропуском', () => {
  for (const d of play) {
    if (d.weak !== undefined) assert.ok(d.weak === true || d.weak === 'mixed', `bad weak ${d.w}`);
    assert.equal(blockedFromArticleGap(d), !!d.weak, `${d.w}: блокування != наявності weak`);
  }
  // усі weak-слова заблоковані
  for (const d of play.filter(d => d.weak)) assert.ok(blockedFromArticleGap(d), `${d.w} weak, але не заблоковане`);
});

test('genus data: genEs лише на der/das', () => {
  for (const d of play) if (d.genEs) assert.notEqual(d.g, 'die', `genEs на die: ${d.w}`);
});

test('genus topic: todo не в грі; кожна картка має cell/answer/why', () => {
  const todoWords = data.filter(d => d.todo).map(d => d.w);
  const cardWords = new Set(genus.cards.map(c => c.prompt));
  for (const w of todoWords) assert.ok(!cardWords.has(w), `todo-слово ${w} у грі`);
  assert.equal(genus.cards.length, play.length);
  const rowKeys = new Set(genus.matrix.rows.map(r => r.k));
  for (const c of genus.cards) {
    assert.ok(GENDERS.includes(c.answer));
    assert.equal(c.cell.col, c.answer);
    assert.ok(rowKeys.has(c.cell.row), `${c.id}: невідома група ${c.cell.row}`);
    assert.ok(c.why && c.why.length > 0, `${c.id}: порожній why`);
  }
});

test('genus data: пропорція (друк, не умова падіння)', () => {
  const s = play.filter(d => d.s).length;
  const sq = play.filter(d => d.sq).length;
  const rest = play.length - s - sq;
  const byG = play.reduce((m, d) => ((m[d.g] = (m[d.g] || 0) + 1), m), {});
  console.log(`  genus: у грі ${play.length} | у групах ${s} / під правилом поза групою ${sq} / без правила ${rest} | ${JSON.stringify(byG)}`);
  assert.ok(play.length > 0);
});
