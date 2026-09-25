// Тести двокрокової картки (Wechselpräpositionen): чисте ядро + цілісність демо-теми.
// Запуск: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade, gradeTwoStep, IV, FAST_STEP1, FAST } from '../js/engine/srs.js';
import wechsel from '../js/topics/wechsel.js';

const s = (b, due, r = 0, w = 0) => ({ b, due, r, w });
const now = 10000;

// ── grade: явний оверрайд fast (складена картка сама вирішує «швидко») ──

test('grade: fast=true ігнорує ms — рівень росте попри повільний ms', () => {
  const { state, fast } = grade(s(0, 0), { ok: true, ms: 999999, type: 'twostep', mode: 'learn', now, fast: true });
  assert.equal(fast, true);
  assert.equal(state.b, 1); // швидко → +1
});

test('grade: fast=false тримає рівень попри миттєвий ms', () => {
  const { state, fast } = grade(s(3, 0), { ok: true, ms: 1, type: 'twostep', mode: 'learn', now, fast: false });
  assert.equal(fast, false);
  assert.equal(state.b, 3); // повільно → не росте
});

// ── gradeTwoStep: обидва кроки, діагностика errStep / w1 / w2 ──

test('gradeTwoStep: обидва правильні і швидкі — рівень росте, помилок нема', () => {
  const r = gradeTwoStep(s(2, 0), { ok1: true, ms1: 800, ok2: true, ms2: 1200, mode: 'learn', now });
  assert.equal(r.ok, true);
  assert.equal(r.fast, true);
  assert.equal(r.state.b, 3);
  assert.equal(r.state.errStep, null);
  assert.equal(r.state.w1 || 0, 0);
  assert.equal(r.state.w2 || 0, 0);
});

test('gradeTwoStep: помилка кроку 1 (правило) — міс, errStep=step1, крок 2 усе одно зараховано у w2=0', () => {
  const r = gradeTwoStep(s(4, 0, 1, 0), { ok1: false, ms1: 2000, ok2: true, ms2: 1500, mode: 'learn', now });
  assert.equal(r.ok, false);
  assert.equal(r.state.b, 0);
  assert.equal(r.state.relearn, true);
  assert.equal(r.state.errStep, 'step1');
  assert.equal(r.state.w1, 1);
  assert.equal(r.state.w2 || 0, 0);
});

test('gradeTwoStep: помилка кроку 2 (таблиця) — errStep=step2, w2=1', () => {
  const r = gradeTwoStep(s(4, 0), { ok1: true, ms1: 800, ok2: false, ms2: 2000, mode: 'learn', now });
  assert.equal(r.ok, false);
  assert.equal(r.state.errStep, 'step2');
  assert.equal(r.state.w1 || 0, 0);
  assert.equal(r.state.w2, 1);
});

test('gradeTwoStep: помилка на обох — errStep=both, w1=w2=1', () => {
  const r = gradeTwoStep(s(4, 0), { ok1: false, ms1: 2000, ok2: false, ms2: 2000, mode: 'learn', now });
  assert.equal(r.state.errStep, 'both');
  assert.equal(r.state.w1, 1);
  assert.equal(r.state.w2, 1);
});

test('gradeTwoStep: правильно, але крок 1 повільний — рівень не росте (fast=false)', () => {
  const r = gradeTwoStep(s(2, 0), { ok1: true, ms1: FAST_STEP1 + 1, ok2: true, ms2: 1000, mode: 'learn', now });
  assert.equal(r.ok, true);
  assert.equal(r.fast1, false);
  assert.equal(r.fast, false);
  assert.equal(r.state.b, 2); // max(b,1) — не росте
});

test('gradeTwoStep: швидка помилка (< FAST_ERROR) на кроці, що впав — штраф w += 2', () => {
  const r = gradeTwoStep(s(3, 0, 0, 0), { ok1: false, ms1: 300, ok2: true, ms2: 1000, mode: 'learn', now });
  assert.equal(r.state.w, 2); // ms кроку-винуватця < 1200 → подвійний штраф
});

test('gradeTwoStep: w1/w2 накопичуються між спробами', () => {
  let st = s(2, 0);
  st = gradeTwoStep(st, { ok1: false, ms1: 2000, ok2: true, ms2: 1000, mode: 'learn', now }).state;
  st = gradeTwoStep(st, { ok1: false, ms1: 2000, ok2: false, ms2: 2000, mode: 'learn', now }).state;
  assert.equal(st.w1, 2);
  assert.equal(st.w2, 1);
});

// ── цілісність демо-теми ──

const T = { dat: { m: 'dem', f: 'der', n: 'dem' }, akk: { m: 'den', f: 'die', n: 'das' } };

test('wechsel: кожна картка коректна (форма, крок 1, cell, why)', () => {
  assert.ok(wechsel.cards.length >= 4 && wechsel.cards.length <= 6, 'демо 4–6 карток');
  for (const c of wechsel.cards) {
    assert.equal(c.type, 'twostep', `${c.id}: тип twostep`);
    assert.ok(c.prompt.includes('___'), `${c.id}: у реченні має бути пропуск`);
    // Крок 1: Wo?/Wohin? відповідає відмінку клітинки.
    assert.deepEqual(c.step1.options, ['Wo?', 'Wohin?']);
    const expectStep1 = c.cell.row === 'akk' ? 'Wohin?' : 'Wo?';
    assert.equal(c.step1.answer, expectStep1, `${c.id}: крок 1 має бути ${expectStep1}`);
    assert.ok(c.step1.why && c.step1.why.length > 0, `${c.id}: порожній why кроку 1`);
    // Крок 2: артикль відповідає таблиці за (відмінок, рід).
    assert.equal(c.answer, T[c.cell.row][c.cell.col], `${c.id}: артикль не збігається з таблицею`);
    assert.ok(wechsel.answers.includes(c.answer), `${c.id}: артикль поза набором кнопок`);
    assert.ok(c.why && c.why.length > 0, `${c.id}: порожній why кроку 2`);
  }
});

test('wechsel: правило кроку 1 — через локацію/межу, ніколи «рух → Akkusativ»', () => {
  for (const c of wechsel.cards) {
    const w = c.step1.why.toLowerCase();
    assert.ok(!/рух\s*(→|->|веде|значить)/.test(w) && !w.includes('рух → akkusativ'),
      `${c.id}: правило сформульоване через рух, а не через зміну локації`);
    assert.ok(/лока|меж|місц/.test(w), `${c.id}: правило має спиратися на локацію/межу/місце`);
  }
});

test('wechsel: є мінімальна пара (той самий іменник у dat і akk)', () => {
  // Демонстрація «рух є, але Dativ»: той самий прийменник+іменник, різні Wo/Wohin.
  const nounOf = c => (c.prompt.split('___')[1] || '').trim();
  const byNoun = {};
  for (const c of wechsel.cards) (byNoun[nounOf(c)] ||= new Set()).add(c.cell.row);
  const pairs = Object.values(byNoun).filter(set => set.has('dat') && set.has('akk'));
  assert.ok(pairs.length >= 1, 'має бути щонайменше одна пара dat/akk на той самий іменник');
});
