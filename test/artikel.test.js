// Тести цілісності теми artikel. Запуск: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import artikel from '../js/topics/artikel.js';

// Гвардія проти регресу порядку введення: кожен блок відмінка перебирає всі роди,
// тож відповіді вже чергуються (der die das die …). Якщо майбутня зміна згрупує
// картки за рядком-відповіддю (як було в genus), цей тест впаде.
test('artikel порядок: не більше 2 підряд з однаковою відповіддю', () => {
  const a = artikel.cards.map(c => c.answer);
  for (let i = 2; i < a.length; i++) {
    assert.ok(!(a[i] === a[i - 1] && a[i] === a[i - 2]),
      `три однакові підряд (${a[i]}) на позиції ${i}: ...${a.slice(i - 2, i + 1).join(' ')}`);
  }
});
