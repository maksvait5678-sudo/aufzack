// Поведінка сесії: підглядання в таблицю не дає прогресу. Прапорець живе в сесії,
// скидається лише на наступній картці; відповідь під підгляданням не змінює ні стан
// картки, ні серію, ні лічильник дня. Закриття таблиці прапорець не знімає.
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Мінімальний localStorage для node (store.js усе одно у try/catch, але так детерміновано).
class MemStore {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

const { createSession } = await import('../js/engine/session.js');

// store.load() кешує стан у модульній змінній, тож кожна сесія бере УНІКАЛЬНИЙ id —
// інакше топіки тестів ділили б один слот і прогрес протікав би між тестами.
let seq = 0;
function freshSession() {
  globalThis.localStorage = new MemStore();
  const topic = {
    id: 'tst-' + (++seq),
    cards: [
      { id: 'c1', type: 'choice', answer: 'a' },
      { id: 'c2', type: 'choice', answer: 'b' }
    ],
    answers: ['a', 'b'], colors: {},
    matrix: { rows: [], cols: [], value: () => '' }
  };
  return createSession(topic);
}

test('session: звичайна відповідь змінює стан, серію і лічильник дня', () => {
  const s = freshSession();
  const card = s.next().card;
  s.answer(card, true, 100);
  assert.ok(s.stateOf(card.id), 'має зʼявитися стан картки');
  assert.equal(s.stateOf(card.id).b, 1);
  assert.equal(s.data.streak, 1);
  assert.equal(s.data.today.n, 1);
  assert.equal(s.answered, true);
});

test('session: відповідь під підгляданням не змінює стан взагалі', () => {
  const s = freshSession();
  const card = s.next().card;
  s.markPeeked();
  assert.equal(s.peeked, true);
  s.answer(card, true, 100);
  assert.equal(s.stateOf(card.id), undefined, 'стан картки не має створюватися');
  assert.equal(s.data.streak, 0);
  assert.equal(s.data.today.n, 0);
  assert.equal(s.answered, true, 'картка все одно закривається для UI');
});

test('session: навіть помилка під підгляданням не обнуляє серію', () => {
  const s = freshSession();
  // спершу заробимо серію звичайною правильною відповіддю
  const c1 = s.next().card;
  s.answer(c1, true, 100);
  assert.equal(s.data.streak, 1);
  // наступна картка — під підгляданням, помилка
  const c2 = s.next().card;
  s.markPeeked();
  s.answer(c2, false, 100);
  assert.equal(s.data.streak, 1, 'серія не обнуляється');
  assert.equal(s.data.today.n, 1, 'лічильник дня не росте');
});

test('session: markPeeked після відповіді вже не діє', () => {
  const s = freshSession();
  const card = s.next().card;
  s.answer(card, true, 100);
  s.markPeeked();
  assert.equal(s.peeked, false, 'ретроактивно картку не позначаємо');
});

test('session: перехід на наступну картку скидає прапорець', () => {
  const s = freshSession();
  s.next();
  s.markPeeked();
  assert.equal(s.peeked, true);
  s.next();
  assert.equal(s.peeked, false);
});
