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

test('genus data: sx — справжній виняток (матчить патерн, інший рід)', () => {
  for (const d of play) {
    if (!d.sx) continue;
    assert.ok(SIGNAL_GENDER[d.sx], `невідомий sx ${d.sx} у ${d.w}`);
    assert.notEqual(d.g, SIGNAL_GENDER[d.sx], `${d.w}: sx=${d.sx}, але рід збігається із сигналом`);
    if (SCAN[d.sx]) assert.ok(SCAN[d.sx].test(d.w), `${d.w}: sx=${d.sx}, але слово не матчить патерн`);
  }
});

test('genus data: посигнальний скан колоди — жодної рядкової колізії без обробки', () => {
  const byWord = Object.fromEntries(play.map(d => [d.w, d]));
  for (const sig of Object.keys(SCAN)) {
    const P = SCAN[sig], G = SIGNAL_GENDER[sig];
    for (const d of play) {
      if (!P.test(d.w)) continue;
      if (d.g === G) {
        // слово підпадає під сигнал → має консистентний s (для підказки)
        assert.ok(d.s && SIGNAL_GENDER[d.s] === G, `${d.w} матчить -${sig} (${G}), але без консистентного s`);
      } else {
        // інший рід → має бути позначене винятком саме цього сигналу
        assert.equal(d.sx, sig, `${d.w} (${d.g}) матчить -${sig}, але не позначене sx:${sig}`);
      }
    }
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
  const sig = play.filter(d => d.s).length;
  const none = play.filter(d => !d.s).length;
  const byG = play.reduce((m, d) => ((m[d.g] = (m[d.g] || 0) + 1), m), {});
  console.log(`  genus: у грі ${play.length} | сигнальних ${sig} / без сигналу ${none} | ${JSON.stringify(byG)}`);
  assert.ok(play.length > 0);
});
