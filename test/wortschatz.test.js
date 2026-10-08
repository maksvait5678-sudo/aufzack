// Тема «Wortschatz»: градуйоване відтворення (сходинки в стані картки), кнопка «Не знаю»,
// ліміт нових за сесію (через pick), і цілісність даних/теми. Німецькі форми звіряє вчитель
// на wortschatz-review.html; тут — машинні інваріанти логіки сходинок і структури.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeWord, pick, STEP_UP, STEP_DOWN, MAXSTEP, wordType, FAST } from '../js/engine/srs.js';
import wortschatz from '../js/topics/wortschatz.js';
import { WORDS, POS } from '../js/topics/wortschatz.data.js';

const now = 1_000_000;
const fastMs = 100;         // < FAST.choice і < FAST.type → швидко на будь-якій сходинці
const slowMs = 100_000;     // повільно скрізь

// Прогнати правильну-швидку відповідь, передаючи поточну сходинку зі стану.
function hitFast(s) {
  const step = (s && s.step) || 0;
  return gradeWord(s, { ok: true, ms: fastMs, step, mode: 'learn', now }).state;
}
function miss(s) {
  const step = (s && s.step) || 0;
  return gradeWord(s, { ok: false, ms: slowMs, step, mode: 'learn', now }).state;
}

// ---------------------------------------------------------------- сходинки

test('підйом: STEP_UP правильних-і-швидких підряд піднімають сходинку', () => {
  let s = undefined;
  for (let i = 0; i < STEP_UP - 1; i++) s = hitFast(s);
  assert.equal(s.step, 0, 'ще не піднялись');
  assert.equal(s.up, STEP_UP - 1);
  s = hitFast(s);
  assert.equal(s.step, 1, 'піднялись на сходинку 1');
  assert.equal(s.up, 0, 'лічильник підйому скинуто');
});

test('підйом доходить до MAXSTEP і не вище', () => {
  let s = undefined;
  for (let i = 0; i < STEP_UP * (MAXSTEP + 2); i++) s = hitFast(s);
  assert.equal(s.step, MAXSTEP, 'не вище за максимальну сходинку');
});

test('правильно, але повільно: сходинка не росте, швидка серія рветься', () => {
  let s = hitFast(hitFast(undefined));          // up=2, step 0
  assert.equal(s.up, 2);
  s = gradeWord(s, { ok: true, ms: slowMs, step: 0, mode: 'learn', now }).state;
  assert.equal(s.up, 0, 'повільна правильна скидає швидку серію');
  assert.equal(s.step, 0, 'сходинка без змін');
});

test('спуск: STEP_DOWN помилок підряд знижують сходинку', () => {
  let s = { b: 3, due: now, r: 9, w: 0, step: 1, up: 0, down: 0 };
  for (let i = 0; i < STEP_DOWN - 1; i++) s = miss(s);
  assert.equal(s.step, 1, 'ще не спустились');
  s = miss(s);
  assert.equal(s.step, 0, 'спустились на сходинку 0');
  assert.equal(s.down, 0, 'лічильник спуску скинуто');
});

test('спуск не нижче 0', () => {
  let s = { b: 0, due: now, r: 0, w: 0, step: 0, up: 0, down: 0 };
  for (let i = 0; i < STEP_DOWN + 2; i++) s = miss(s);
  assert.equal(s.step, 0);
});

test('articleOnly: помилка для SRS (b=0), але сходинку вниз НЕ опускає', () => {
  const s0 = { b: 4, due: now, r: 10, w: 1, step: 1, up: 0, down: STEP_DOWN - 1 };
  const r = gradeWord(s0, { ok: false, ms: slowMs, step: 1, articleOnly: true, mode: 'learn', now });
  assert.equal(r.ok, false, 'зараховано як помилку');
  assert.equal(r.state.b, 0, 'рівень скинуто, як при помилці');
  assert.equal(r.state.down, STEP_DOWN - 1, 'лічильник спуску не змінився');
  assert.equal(r.state.step, 1, 'сходинка не знижена');
  assert.equal(r.state.relearn, true);
});

test('«Не знаю»: скид і рівня, і сходинки', () => {
  const s0 = { b: 6, due: now + 1e9, r: 20, w: 0, step: MAXSTEP, up: 2, down: 0 };
  const r = gradeWord(s0, { dontKnow: true, mode: 'learn', now });
  assert.equal(r.ok, false);
  assert.equal(r.state.b, 0);
  assert.equal(r.state.step, 0);
  assert.equal(r.state.up, 0);
  assert.equal(r.state.down, 0);
  assert.equal(r.state.relearn, true);
});

test('wordType: сходинки 0/1 — choice, 2 — type (поріг швидкості)', () => {
  assert.equal(wordType(0), 'choice');
  assert.equal(wordType(1), 'choice');
  assert.equal(wordType(2), 'type');
  // На сходинці 2 поріг ширший: 10 с — швидко для вводу, але було б повільно для вибору.
  const s = { b: 2, due: now, r: 0, w: 0, step: 2, up: 0, down: 0 };
  const r = gradeWord(s, { ok: true, ms: 10_000, step: 2, mode: 'learn', now });
  assert.ok(10_000 <= FAST.type && 10_000 > FAST.choice);
  assert.equal(r.fast, true, 'ввід за 10 с — швидко');
});

// ---------------------------------------------------------------- ліміт нових (pick)

test('pick: newAllowed:false не вводить нових карток', () => {
  const states = {};
  const r = pick(wortschatz.cards, states, { mode: 'learn', recent: [], now, newAllowed: false });
  assert.equal(r, null, 'нічого ввести — і не вводимо');
  const r2 = pick(wortschatz.cards, states, { mode: 'learn', recent: [], now, newAllowed: true });
  assert.ok(r2 && r2.isNew, 'з дозволом — вводимо нову');
});

// ---------------------------------------------------------------- дані і тема

test('wortschatz: ~250 слів, кожна частина мови має ≥4 (для дистракторів)', () => {
  assert.ok(WORDS.length >= 240 && WORDS.length <= 260, `слів ${WORDS.length}`);
  for (const p of POS) {
    const n = WORDS.filter(w => w.pos === p.k).length;
    assert.ok(n >= 4, `${p.k}: лише ${n} слів — замало для 4 варіантів`);
  }
});

test('wortschatz: кожна картка — word, з pos/de/uk, унікальні id', () => {
  const posK = new Set(POS.map(p => p.k));
  for (const c of wortschatz.cards) {
    assert.equal(c.type, 'word', `${c.id}: тип ${c.type}`);
    assert.ok(posK.has(c.pos), `${c.id}: невідомий pos ${c.pos}`);
    assert.ok(c.de && c.uk, `${c.id}: немає de/uk`);
    assert.equal(c.answer, c.de, `${c.id}: answer має дорівнювати de`);
  }
  assert.equal(new Set(wortschatz.cards.map(c => c.id)).size, wortschatz.cards.length);
});

test('wortschatz: іменники подано з артиклем der/die/das', () => {
  const nouns = wortschatz.cards.filter(c => c.pos === 'noun');
  for (const c of nouns) {
    assert.ok(/^(der|die|das) \S/.test(c.de), `${c.de}: іменник без артикля`);
  }
});

test('view: сходинка 0 — нім→укр вибір; 1 — укр→нім вибір; 2 — ввід', () => {
  const c = wortschatz.cards.find(x => x.pos === 'noun');
  const v0 = wortschatz.view(c, 0);
  assert.equal(v0.mode, 'choice');
  assert.equal(v0.prompt, c.de);
  assert.equal(v0.options.length, 4);
  assert.ok(v0.options.includes(c.uk), 'правильна відповідь серед варіантів');
  const v1 = wortschatz.view(c, 1);
  assert.equal(v1.mode, 'choice');
  assert.equal(v1.prompt, c.uk);
  assert.ok(v1.options.includes(c.de));
  const v2 = wortschatz.view(c, 2);
  assert.equal(v2.mode, 'input');
  assert.equal(v2.prompt, c.uk);
});

test('answerFor: 0 → укр, 1/2 → нім', () => {
  const c = wortschatz.cards[0];
  assert.equal(wortschatz.answerFor(c, 0), c.uk);
  assert.equal(wortschatz.answerFor(c, 1), c.de);
  assert.equal(wortschatz.answerFor(c, 2), c.de);
});

test('checkInput: іменник — три результати (повний / лише артикль / інше слово)', () => {
  const c = wortschatz.cards.find(x => x.pos === 'noun' && /^der /.test(x.de));
  const bare = c.de.replace(/^der /, '');
  assert.deepEqual(wortschatz.checkInput(c, c.de), { ok: true, articleOnly: false });
  const r = wortschatz.checkInput(c, bare);
  assert.equal(r.ok, false);
  assert.equal(r.articleOnly, true, 'слово без артикля → лише артикль');
  const r2 = wortschatz.checkInput(c, 'xyzqwerty');
  assert.equal(r2.ok, false);
  assert.equal(r2.articleOnly, false, 'інше слово → справжня помилка');
});

test('checkInput: не-іменник — артикль не розглядаємо', () => {
  const v = wortschatz.cards.find(x => x.pos === 'verb');
  assert.deepEqual(wortschatz.checkInput(v, v.de), { ok: true, articleOnly: false });
  const r = wortschatz.checkInput(v, 'nichtsgleiches');
  assert.equal(r.articleOnly, false);
});

test('wortschatz: тема нейтральна, з лімітом і кумулятивною картою', () => {
  assert.equal(wortschatz.showChip, false);
  assert.equal(wortschatz.maxNewPerSession, 10);
  assert.equal(wortschatz.heatReach, true);
  assert.deepEqual(wortschatz.answers, []);
});
