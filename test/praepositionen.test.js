// Цілісність теми «Прийменники»: форми, порядок блоків, правило Wechsel через
// локацію (не «рух»), картки блоків 1–3 поза матрицею (без cell). Німецькі форми
// звіряються вчителем на praep-review.html; тут — машинні інваріанти.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import praep from '../js/topics/praepositionen.js';
import { FIXED, SENT, MERGE, WECHSEL, VERBS } from '../js/topics/praepositionen.data.js';

const T = { dat: { m: 'dem', f: 'der', n: 'dem' }, akk: { m: 'den', f: 'die', n: 'das' } };
const twostep = praep.cards.filter(c => c.type === 'twostep');

test('praep: кожна картка має why і несуперечливий тип', () => {
  for (const c of praep.cards) {
    assert.ok(c.why && c.why.length > 0, `${c.id}: порожній why`);
    assert.ok(['choice', 'sentence', 'twostep'].includes(c.type), `${c.id}: тип ${c.type}`);
  }
});

test('praep: todo-дані в гру не потрапляють', () => {
  const todo = [...FIXED, ...SENT, ...MERGE, ...WECHSEL, ...VERBS].filter(d => d.todo);
  assert.ok(todo.length >= 1, 'у даних мають бути todo (bis/entlang/gegenüber, zwischen)');
  // Жодна todo-фраза/прийменник не має id-картки.
  for (const d of todo) {
    const key = d.p || d.prep || d.text;
    assert.ok(!praep.cards.some(c => c.prompt === (d.text || d.p) || c.prompt === key),
      `todo ${key} потрапив у колоду`);
  }
});

test('praep: блок 1 — choice з кнопками Akkusativ/Dativ, без cell', () => {
  const b1 = praep.cards.filter(c => c.id.startsWith('p1-'));
  assert.equal(b1.length, FIXED.filter(d => !d.todo).length);
  for (const c of b1) {
    assert.equal(c.type, 'choice');
    assert.deepEqual(c.options, ['Akkusativ', 'Dativ'], `${c.id}: кнопки відмінків`);
    assert.ok(c.options.includes(c.answer), `${c.id}: відповідь поза кнопками`);
    assert.ok(!c.cell, `${c.id}: блок 1 не має бути в матриці`);
  }
});

test('praep: блок 2 — sentence, відповідь-артикль з набору теми, без cell', () => {
  const b2 = praep.cards.filter(c => c.id.startsWith('p2-'));
  assert.equal(b2.length, SENT.length);
  for (const c of b2) {
    assert.equal(c.type, 'sentence');
    assert.ok(c.prompt.includes('___'), `${c.id}: пропуск`);
    assert.ok(praep.answers.includes(c.answer), `${c.id}: артикль поза кнопками теми`);
    assert.ok(!c.cell, `${c.id}: блок 2 поза матрицею`);
  }
});

test('praep: блок 3 — злиті форми, відповідь із власних кнопок, без cell', () => {
  const b3 = praep.cards.filter(c => c.id.startsWith('p3-'));
  assert.equal(b3.length, MERGE.length);
  const merges = MERGE.map(d => d.merge);
  for (const c of b3) {
    assert.ok(c.prompt.includes('___'), `${c.id}: пропуск`);
    assert.deepEqual(c.options, merges, `${c.id}: кнопки — усі злиті форми`);
    assert.ok(merges.includes(c.answer), `${c.id}: відповідь поза злитими формами`);
    assert.ok(!c.cell, `${c.id}: блок 3 поза матрицею`);
  }
});

test('praep: блоки 4–5 (twostep) — артикль за таблицею, крок 1 за відмінком, cell', () => {
  assert.ok(twostep.length >= 6, 'мають бути картки Wechsel і дієслівні пари');
  for (const c of twostep) {
    assert.ok(c.prompt.includes('___'), `${c.id}: пропуск`);
    assert.deepEqual(c.step1.options, ['Wo?', 'Wohin?']);
    assert.equal(c.step1.answer, c.cell.row === 'akk' ? 'Wohin?' : 'Wo?', `${c.id}: крок 1`);
    assert.equal(c.answer, T[c.cell.row][c.cell.col], `${c.id}: артикль ≠ таблиця`);
    assert.ok(praep.answers.includes(c.answer), `${c.id}: артикль поза кнопками`);
    assert.ok(c.step1.why && c.step1.why.length > 0, `${c.id}: порожній why кроку 1`);
  }
});

test('praep: правило Wechsel — через локацію/межу, ніколи «рух → Akkusativ»', () => {
  for (const c of twostep) {
    const w = c.step1.why.toLowerCase();
    assert.ok(!/рух\s*(→|->|веде|значить)/.test(w) && !w.includes('рух → akkusativ'),
      `${c.id}: правило через рух, а не зміну локації`);
    assert.ok(/лока|меж|місц/.test(w), `${c.id}: правило має спиратися на локацію/межу/місце`);
  }
});

test('praep: у Wechsel є мінімальні пари (той самий прийменник+іменник у dat і akk)', () => {
  const nounOf = c => (c.prompt.split('___')[1] || '').trim();
  const byPhrase = {};
  for (const c of twostep) (byPhrase[nounOf(c)] ||= new Set()).add(c.cell.row);
  const pairs = Object.values(byPhrase).filter(s => s.has('dat') && s.has('akk'));
  assert.ok(pairs.length >= 3, 'щонайменше три пари dat/akk на ту саму фразу');
});

test('praep: матриця Wechsel (dat/akk × m/f/n) заповнюється повністю', () => {
  const filled = new Set(twostep.map(c => `${c.cell.row}-${c.cell.col}`));
  for (const row of ['dat', 'akk']) for (const col of ['m', 'f', 'n']) {
    assert.ok(filled.has(`${row}-${col}`), `клітинка ${row}-${col} порожня`);
  }
});

test('praep: порядок введення — не більше двох однакових відповідей підряд', () => {
  const a = praep.cards.map(c => c.answer);
  for (let i = 2; i < a.length; i++) {
    assert.ok(!(a[i] === a[i - 1] && a[i] === a[i - 2]),
      `три однакові відповіді підряд на позиції ${i}: ${a[i - 2]} ${a[i - 1]} ${a[i]}`);
  }
});
