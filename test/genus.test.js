// Тести цілісності даних теми genus. Запуск: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../js/topics/genus.data.js';
import genus from '../js/topics/genus.js';

const GENDERS = ['der', 'die', 'das'];
const SIG = { ung: 'die', heit: 'die', keit: 'die', schaft: 'die', ion: 'die', er: 'der', ling: 'der', ismus: 'der', chen: 'das', lein: 'das', um: 'das' };
const play = data.filter(d => !d.todo);

test('genus data: у кожного слова валідний рід', () => {
  for (const d of data) assert.ok(GENDERS.includes(d.g), `невалідний рід у ${d.w}: ${d.g}`);
});

test('genus data: немає дублікатів слів', () => {
  const seen = new Set();
  for (const d of data) {
    assert.ok(!seen.has(d.w), `дубль: ${d.w}`);
    seen.add(d.w);
  }
});

test('genus data: сигнал відповідає роду', () => {
  for (const d of data) {
    if (!d.s) continue;
    assert.ok(SIG[d.s], `невідомий сигнал у ${d.w}: ${d.s}`);
    assert.equal(d.g, SIG[d.s], `сигнал -${d.s} має бути ${SIG[d.s]}, а у ${d.w} — ${d.g}`);
  }
});

test('genus data: ігрових слів 150–200', () => {
  assert.ok(play.length >= 150 && play.length <= 200, `у грі ${play.length}, поза діапазоном 150–200`);
});

test('genus data: група «без сигналу» — найбільша', () => {
  const none = play.filter(d => !d.s).length;
  const sig = play.filter(d => d.s).length;
  assert.ok(none > sig, `без сигналу ${none} має бути більше за сигнальні ${sig}`);
});

test('genus topic: todo-слова не потрапили в картки', () => {
  const todoWords = data.filter(d => d.todo).map(d => d.w);
  const cardWords = new Set(genus.cards.map(c => c.prompt));
  for (const w of todoWords) assert.ok(!cardWords.has(w), `todo-слово ${w} потрапило в гру`);
  assert.equal(genus.cards.length, play.length);
});

test('genus topic: кожна картка має cell, answer і why', () => {
  const rowKeys = new Set(genus.matrix.rows.map(r => r.k));
  for (const c of genus.cards) {
    assert.equal(c.type, 'choice');
    assert.ok(GENDERS.includes(c.answer), `картка ${c.id}: рід ${c.answer}`);
    assert.equal(c.cell.col, c.answer, `картка ${c.id}: cell.col має = рід`);
    assert.ok(rowKeys.has(c.cell.row), `картка ${c.id}: невідома група ${c.cell.row}`);
    assert.ok(c.why && c.why.length > 0, `картка ${c.id}: порожній why`);
  }
});

test('genus topic: сигнальні слова у своїй групі, решта — у «без сигналу»', () => {
  const byWord = Object.fromEntries(play.map(d => [d.w, d]));
  for (const c of genus.cards) {
    const d = byWord[c.prompt];
    const expected = d.s ? SIG[d.s] + '-sig' : 'none';
    assert.equal(c.cell.row, expected, `картка ${c.id}: група ${c.cell.row}, очікували ${expected}`);
  }
});

test('genus topic: matrix.value повертає рід колонки', () => {
  for (const r of genus.matrix.rows)
    for (const col of genus.matrix.cols)
      assert.equal(genus.matrix.value(r.k, col.k), col.k);
});
