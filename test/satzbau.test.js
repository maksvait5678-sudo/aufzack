// Тема «Satzbau»: порівняння порядку (matchOrder), цілісність карток, інваріант
// мультимножини розвʼязків, і — головне — що лексика взята ЛИШЕ з уже вивчених тем
// (дієслова з praesens, прийменники/злиті з praepositionen, іменники з genus),
// структурні слова — з GLUE. Німецькі форми звіряє вчитель на satzbau-review.html.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchOrder } from '../js/engine/srs.js';
import satzbau from '../js/topics/satzbau.js';
import { GLUE, BLOCKS, SENTENCES } from '../js/topics/satzbau.data.js';
import { VERBS as PRAESENS } from '../js/topics/praesens.data.js';
import { FIXED, MERGE, WECHSEL, SENT } from '../js/topics/praepositionen.data.js';
import GENUS from '../js/topics/genus.data.js';

// ---------------------------------------------------------------- matchOrder

const sols = [
  { order: ['heute', 'fahre', 'ich', 'zur', 'Schule'], good: true },
  { order: ['ich', 'fahre', 'heute', 'zur', 'Schule'], good: false, note: 'краще спереду' }
];

test('matchOrder: точний гарний варіант → ok, good', () => {
  const r = matchOrder(['heute', 'fahre', 'ich', 'zur', 'Schule'], sols);
  assert.deepEqual(r, { ok: true, good: true, note: undefined });
});

test('matchOrder: стилістично гірший варіант → ok, good:false, note', () => {
  const r = matchOrder(['ich', 'fahre', 'heute', 'zur', 'Schule'], sols);
  assert.equal(r.ok, true);
  assert.equal(r.good, false);
  assert.ok(r.note);
});

test('matchOrder: неправильний порядок → не зараховано', () => {
  assert.equal(matchOrder(['heute', 'ich', 'fahre', 'zur', 'Schule'], sols).ok, false);
});

test('matchOrder: зайве/неповне слово (інша довжина) → не зараховано', () => {
  assert.equal(matchOrder(['heute', 'fahre', 'ich', 'zur', 'Schule', 'du'], sols).ok, false);
  assert.equal(matchOrder(['heute', 'fahre', 'ich'], sols).ok, false);
});

// ---------------------------------------------------------------- картки

test('satzbau: кожна картка — order, з uk, solutions, bank, why, валідним cell', () => {
  const rows = new Set(BLOCKS.map(b => b.k));
  for (const c of satzbau.cards) {
    assert.equal(c.type, 'order', `${c.id}: тип ${c.type}`);
    assert.ok(c.uk && c.uk.length, `${c.id}: порожнє завдання`);
    assert.ok(Array.isArray(c.solutions) && c.solutions.length, `${c.id}: немає solutions`);
    assert.ok(Array.isArray(c.bank) && c.bank.length, `${c.id}: немає bank`);
    assert.ok(c.why && c.why.length, `${c.id}: порожній why`);
    assert.ok(c.cell && rows.has(c.cell.row) && c.cell.col === 'o', `${c.id}: неправильний cell`);
    assert.ok(c.solutions.some(s => s.good !== false), `${c.id}: немає жодного good-варіанту`);
  }
});

test('satzbau: усі solutions речення — перестановки однієї мультимножини', () => {
  const key = arr => [...arr].sort().join('|');
  for (const s of SENTENCES) {
    const k0 = key(s.solutions[0].order);
    for (const sol of s.solutions) {
      assert.equal(key(sol.order), k0, `${s.uk}: solution не є перестановкою базового`);
    }
  }
});

test('satzbau: bank = слова базового розвʼязку + зайві (distractors)', () => {
  for (const c of satzbau.cards) {
    const base = c.solutions[0].order;
    assert.ok(c.bank.length >= base.length, `${c.id}: bank менший за розвʼязок`);
    const extra = c.bank.length - base.length;
    assert.ok(extra >= 1 && extra <= 2, `${c.id}: має бути 1–2 зайвих слова, а не ${extra}`);
  }
});

test('satzbau: 20–30 речень; блок nicht (b5) — короткий (3–4)', () => {
  assert.ok(SENTENCES.length >= 20 && SENTENCES.length <= 30, `речень ${SENTENCES.length}`);
  const b5 = SENTENCES.filter(s => s.block === 'b5').length;
  assert.ok(b5 >= 3 && b5 <= 4, `nicht-блок має бути 3–4 речення, а не ${b5}`);
  // nicht — останній блок у порядку карт.
  const lastBlocks = satzbau.cards.slice(-b5).map(c => c.cell.row);
  assert.ok(lastBlocks.every(b => b === 'b5'), 'nicht має бути останнім блоком');
});

// ------------------------------------------------- лексика лише з вивчених тем

// Набори слів із уже наявних тем.
const praesensForms = new Set();
for (const v of PRAESENS) { praesensForms.add(v.inf); for (const f of Object.values(v.forms)) praesensForms.add(f); }
const prepSet = new Set([
  ...FIXED.map(d => d.p), ...SENT.map(d => d.p),
  ...MERGE.map(d => d.merge), ...MERGE.map(d => d.p), ...WECHSEL.map(d => d.prep)
]);
const ART = new Set(['der', 'die', 'das', 'des', 'dem', 'den']);
const nounSet = new Set(GENUS.map(n => n.w));
// Іменники з praepositionen (великі слова в шаблонах) — теж вивчені.
for (const d of [...SENT, ...WECHSEL]) {
  for (const w of (d.text.match(/[A-ZÄÖÜ][a-zäöüß]+/g) || [])) nounSet.add(w);
}

function classify(tok) {
  if (GLUE.has(tok)) return 'glue';
  if (ART.has(tok)) return 'art';
  if (praesensForms.has(tok)) return 'verb';
  if (prepSet.has(tok)) return 'prep';
  if (nounSet.has(tok)) return 'noun';
  return null;
}

test('satzbau: уся лексика — з вивчених тем або структурний «клей»', () => {
  const unknown = new Set();
  for (const c of satzbau.cards) {
    for (const tok of c.bank) if (!classify(tok)) unknown.add(tok);
    for (const s of c.solutions) for (const tok of s.order) if (!classify(tok)) unknown.add(tok);
  }
  assert.equal(unknown.size, 0, `невідома лексика (не з тем і не glue): ${[...unknown].join(', ')}`);
});

test('satzbau: канонічна форма токенів — регістр не тренуємо', () => {
  // Іменники зберігаються з великої (бо такі в genus), решта — з малої: велику першу
  // літеру першому слову додає лише рендер, тож варіанти порядку працюють незалежно.
  for (const c of satzbau.cards) {
    for (const tok of new Set([...c.bank, ...c.solutions.flatMap(s => s.order)])) {
      const cls = classify(tok);
      if (cls === 'noun') assert.equal(tok[0], tok[0].toUpperCase(), `${tok}: іменник має бути з великої`);
      else assert.equal(tok, tok.toLowerCase(), `${tok} (${cls}): не-іменник має бути з малої (канонічна форма)`);
    }
  }
});
