// Тести чистого ядра. Запуск: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade, pick, drillWeight, IV, MAXB, FAST, FAST_ERROR, RELEARN_GAP, MIN } from '../js/engine/srs.js';

const s = (b, due, r = 0, w = 0) => ({ b, due, r, w });

// ---------------------------------------------------------------- grade

test('grade: правильно і швидко — рівень росте, due = now + IV[b]', () => {
  const now = 1000;
  const { state, fast } = grade(s(0, 0), { ok: true, ms: 100, type: 'choice', mode: 'learn', now });
  assert.equal(fast, true);
  assert.equal(state.b, 1);
  assert.equal(state.due, now + IV[1]);
  assert.equal(state.r, 1);
});

test('grade: правильно, але повільно — рівень не росте вище max(b,1)', () => {
  const now = 1000;
  const slow = grade(s(0, 0), { ok: true, ms: 5000, type: 'choice', mode: 'learn', now });
  assert.equal(slow.fast, false);
  assert.equal(slow.state.b, 1); // з 0 повільно → мінімум 1
  assert.equal(slow.state.due, now + IV[1]);

  const kept = grade(s(3, 0), { ok: true, ms: 5000, type: 'choice', mode: 'learn', now });
  assert.equal(kept.state.b, 3); // рівень не падає і не росте
  assert.equal(kept.state.due, now + IV[3]);
});

test('grade: помилка — b=0, due = now + IV[0], лічильник помилок росте', () => {
  const now = 1000;
  const { state } = grade(s(5, 999, 2, 1), { ok: false, ms: 3000, type: 'choice', mode: 'learn', now });
  assert.equal(state.b, 0);
  assert.equal(state.due, now + IV[0]);
  assert.equal(state.w, 2); // повільна помилка → +1 (було 1)
});

test('grade: межа швидкості — ms === ліміту вважається швидким', () => {
  const now = 0;
  const { fast } = grade(s(0, 0), { ok: true, ms: FAST.sentence, type: 'sentence', mode: 'learn', now });
  assert.equal(fast, true);
});

test('grade: рівень не перевищує MAXB', () => {
  const now = 0;
  const { state } = grade(s(MAXB, 0), { ok: true, ms: 1, type: 'choice', mode: 'learn', now });
  assert.equal(state.b, MAXB);
  assert.equal(state.due, now + IV[MAXB]);
});

test('grade: профілактика на не простроченій картці не змінює розкладу', () => {
  const now = 1000;
  const before = s(4, 5000);
  const { state } = grade(before, { ok: true, ms: 1, type: 'choice', mode: 'drill', now });
  assert.equal(state.b, 4);       // без змін
  assert.equal(state.due, 5000);  // розклад збережено
  assert.equal(state.r, 1);       // але правильна відповідь зарахована
});

test('grade: профілактика на простроченій картці діє як звичайно', () => {
  const now = 1000;
  const { state } = grade(s(4, 500), { ok: true, ms: 1, type: 'choice', mode: 'drill', now });
  assert.equal(state.b, 5);
  assert.equal(state.due, now + IV[5]);
});

test('grade: не мутує вхідний стан', () => {
  const before = s(2, 100);
  const snapshot = { ...before };
  grade(before, { ok: false, ms: 1, type: 'choice', mode: 'learn', now: 1 });
  assert.deepEqual(before, snapshot);
});

// ---------------------------------------------------------------- drillWeight

test('drillWeight: формула ваги', () => {
  assert.equal(drillWeight(s(0, 0, 0, 0)), 13); // 1 + 6*2 + 0
  assert.equal(drillWeight(s(5, 0, 0, 5)), 8);  // 1 + 1*2 + 5
  assert.equal(drillWeight(s(8, 0, 0, 10)), 8); // рівень і помилки обрізаються до 5
});

// ---------------------------------------------------------------- pick

const deck = n => Array.from({ length: n }, (_, i) => ({ id: 'c' + i, type: 'choice' }));

test('pick: порожній стан у навчанні дає першу нову картку', () => {
  const cards = deck(8);
  const r = pick(cards, {}, { mode: 'learn', recent: [], now: 1000 });
  assert.equal(r.card.id, 'c0');
  assert.equal(r.isNew, true);
});

test('pick: прострочені першими, менший рівень → раніший due', () => {
  const cards = deck(8);
  const states = { c0: s(2, 0), c1: s(0, 500) };
  const r = pick(cards, states, { mode: 'learn', recent: [], now: 1000 });
  assert.equal(r.card.id, 'c1'); // нижчий рівень має пріоритет
});

test('pick: виключає останню показану картку (recN=1 при малій колоді)', () => {
  const cards = deck(8);
  const states = { c0: s(0, 0), c1: s(0, 0) };
  const r = pick(cards, states, { mode: 'learn', recent: ['c0'], now: 1000 });
  assert.equal(r.card.id, 'c1');
});

test('pick: нова картка, поки в роботі менше 6', () => {
  const cards = deck(8);
  const states = { c0: s(5, 9e9) }; // введена, не в роботі, не прострочена
  const r = pick(cards, states, { mode: 'learn', recent: [], now: 1000 });
  assert.equal(r.card.id, 'c1');
  assert.equal(r.isNew, true);
});

test('pick: коли в роботі ≥6 — дострокове повторення b≤1 за раннім due', () => {
  const cards = deck(8);
  const now = 1000;
  const states = {};
  for (let i = 0; i < 6; i++) states['c' + i] = s(1, now + 1000);
  states.c3 = s(1, now + 100); // найраніший due серед b≤1
  const r = pick(cards, states, { mode: 'learn', recent: [], now });
  assert.equal(r.card.id, 'c3');
});

test('pick: запасний крок — найближча за due картка в роботі', () => {
  const cards = deck(8);
  const now = 1000;
  const states = {};
  for (let i = 0; i < 8; i++) states['c' + i] = s(2, now + 1000); // усі введені, b=2, не прострочені
  states.c5 = s(2, now + 50);
  const r = pick(cards, states, { mode: 'learn', recent: [], now });
  assert.equal(r.card.id, 'c5');
});

test('pick: null, коли немає ні черги, ні нових карток', () => {
  const cards = deck(1);
  const states = { c0: s(5, 9e9) };
  const r = pick(cards, states, { mode: 'learn', recent: [], now: 1000 });
  assert.equal(r, null);
});

test('pick: recN=6 — виключає 6 останніх показаних', () => {
  const cards = deck(8);
  const now = 1000;
  const states = {};
  for (let i = 0; i < 8; i++) states['c' + i] = s(0, 0); // 8 прострочених, intro>4
  const recent = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
  const r = pick(cards, states, { mode: 'learn', recent, now });
  assert.ok(!recent.includes(r.card.id));       // жодна з 6 останніх
  assert.ok(['c6', 'c7'].includes(r.card.id));
});

test('pick: профілактика — детермінований вибір за вагами і rng', () => {
  const cards = deck(2);
  const states = { c0: s(0, 0), c1: s(5, 0) }; // ваги 13 і 3, разом 16
  const lo = pick(cards, states, { mode: 'drill', recent: [], now: 1000, rng: () => 0 });
  assert.equal(lo.card.id, 'c0');
  const hi = pick(cards, states, { mode: 'drill', recent: [], now: 1000, rng: () => 0.99 });
  assert.equal(hi.card.id, 'c1');
});

test('pick: профілактика виключає останні показані', () => {
  const cards = deck(2);
  const states = { c0: s(0, 0), c1: s(0, 0) };
  const r = pick(cards, states, { mode: 'drill', recent: ['c0'], now: 1000, rng: () => 0 });
  assert.equal(r.card.id, 'c1');
});

// -------------------------------------------------- §A: перевчання і штрафи

test('IV: рівень 0 підняли до 60 с і зрівняли з рівнем 1', () => {
  assert.equal(IV[0], MIN);
  assert.equal(IV[0], IV[1]);
});

test('grade: помилка ставить relearn і повертає через IV[0]', () => {
  const now = 1000;
  const { state } = grade(s(4, 0, 0, 0), { ok: false, ms: 3000, type: 'choice', mode: 'learn', now });
  assert.equal(state.b, 0);
  assert.equal(state.relearn, true);
  assert.equal(state.due, now + IV[0]);
  assert.equal(state.w, 1); // повільна помилка → +1
});

test('grade: швидка помилка (< FAST_ERROR) додає w += 2', () => {
  const now = 1000;
  const { state } = grade(s(3, 0, 0, 0), { ok: false, ms: FAST_ERROR - 1, type: 'choice', mode: 'learn', now });
  assert.equal(state.w, 2);
  assert.equal(state.relearn, true);
});

test('grade: під час relearn рівень не вище 2, перша правильна розносить наступну спробу', () => {
  const now = 1000;
  const { state } = grade({ b: 2, due: 0, r: 0, w: 1, relearn: true }, { ok: true, ms: 100, type: 'choice', mode: 'learn', now });
  assert.equal(state.b, 2);            // не 3
  assert.equal(state.relearn, true);
  assert.equal(state.relearnAt, now);
  assert.ok(state.due - now >= RELEARN_GAP); // друга спроба щонайменше через розрив
});

test('grade: relearn знімається лише після другої правильної через ≥ RELEARN_GAP', () => {
  const t0 = 1000;
  let st = grade(s(0, 0, 0, 0), { ok: false, ms: 3000, type: 'choice', mode: 'learn', now: t0 }).state;
  assert.equal(st.relearn, true);

  const t1 = t0 + IV[0];
  st = grade(st, { ok: true, ms: 100, type: 'choice', mode: 'learn', now: t1 }).state;
  assert.equal(st.relearn, true);
  assert.equal(st.relearnAt, t1);
  assert.ok(st.b <= 2);

  // правильна раніше ніж через розрив — прапорець лишається
  const early = grade(st, { ok: true, ms: 100, type: 'choice', mode: 'learn', now: t1 + RELEARN_GAP - 1 }).state;
  assert.equal(early.relearn, true);

  // правильна після розриву — прапорець знято
  const t2 = t1 + RELEARN_GAP;
  st = grade(st, { ok: true, ms: 100, type: 'choice', mode: 'learn', now: t2 }).state;
  assert.equal(st.relearn, false);
  assert.equal(st.relearnAt, undefined);

  // після зняття рівень знову може рости вище 2
  st = grade(st, { ok: true, ms: 100, type: 'choice', mode: 'learn', now: st.due }).state;
  assert.ok(st.b >= 3);
});

test('pick: relearn не рахуються в ліміті 6 — нову вводимо попри 6 у роботі', () => {
  const cards = deck(8);
  const now = 1000;
  const states = {};
  for (let i = 0; i < 5; i++) states['c' + i] = { b: 1, due: now + RELEARN_GAP, r: 0, w: 1, relearn: true };
  states.c5 = { b: 1, due: now + RELEARN_GAP, r: 1, w: 0 }; // звичайна картка в роботі
  const r = pick(cards, states, { mode: 'learn', recent: [], now });
  assert.equal(r.isNew, true);     // working = лише c5 (1) < 6
  assert.equal(r.card.id, 'c6');
});

test('pick: дострокове повторення не витягує relearn-картку', () => {
  const cards = deck(8);
  const now = 1000;
  const states = {};
  for (let i = 0; i < 6; i++) states['c' + i] = { b: 2, due: now + 1e9, r: 1, w: 0 }; // 6 у роботі, не relearn
  states.c6 = { b: 1, due: now + RELEARN_GAP, r: 0, w: 1, relearn: true };            // кандидат для early, але relearn
  const r = pick(cards, states, { mode: 'learn', recent: [], now });
  assert.notEqual(r.card.id, 'c6'); // relearn виключено з дострокового повторення
});
