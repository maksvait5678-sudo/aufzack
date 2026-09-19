// Тести чистого ядра. Запуск: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade, pick, drillWeight, IV, MAXB, FAST } from '../js/engine/srs.js';

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
  const { state } = grade(s(5, 999, 2, 1), { ok: false, ms: 100, type: 'choice', mode: 'learn', now });
  assert.equal(state.b, 0);
  assert.equal(state.due, now + IV[0]);
  assert.equal(state.w, 2);
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

test('pick: recN=3 при колоді понад 4 введені картки', () => {
  const cards = deck(8);
  const now = 1000;
  const states = {};
  for (let i = 0; i < 5; i++) states['c' + i] = s(0, 0); // 5 прострочених, intro>4
  const r = pick(cards, states, { mode: 'learn', recent: ['c0', 'c1', 'c2'], now });
  assert.ok(!['c0', 'c1', 'c2'].includes(r.card.id)); // три останні виключено
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
