// Антисерійність у живій черзі для ВСІХ тем. Рушій не повинен давати 3-тю підряд картку з
// тією самою правильною відповіддю, коли серед кандидатів є альтернатива (SPEC §3). Цей тест
// проганяє кожну зареєстровану тему через режим «Навчання» (правильні швидкі відповіді) і
// падає, якщо десь трапляється 3 однакові відповіді підряд — щоб наступна тема ловила дефект
// автоматично, а не очима на двадцятій картці. Баг повторився двічі (genus «61 die», perfekt
// «20+ sein»), бо нові картки вводилися строго в порядку масиву без перемежування.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as srs from '../js/engine/srs.js';
import { topics } from '../js/topics/index.js';

// Проганяємо тему через чергу, повертаємо послідовність відповідей показаних карток.
// Відповідаємо правильно і швидко (ok, малий ms), щоб картки рухалися й вводились нові.
function playSequence(topic, steps) {
  const cards = topic.cards;
  const states = {};
  let recent = [];
  let now = 0;
  const answers = [];
  for (let i = 0; i < steps; i++) {
    const picked = srs.pick(cards, states, { mode: 'learn', recent, now, rng: () => 0.5 });
    if (!picked) break;                 // колода вичерпана / нічого не на черзі
    const c = picked.card;
    answers.push(c.answer);             // order-картки не мають scalar-відповіді → undefined
    const { state } = srs.grade(states[c.id], { ok: true, ms: 300, type: c.type, mode: 'learn', now });
    states[c.id] = state;
    recent.push(c.id);
    if (recent.length > 6) recent.shift();
    now += 3 * srs.SEC;                 // 3 с на картку — вводяться нові, потім підходять due
  }
  return answers;
}

// Найдовша серія однакової ВИЗНАЧЕНОЇ відповіді підряд (undefined-відповіді не рахуємо).
function longestRun(answers) {
  let max = 0, run = 0, prev;
  let at = -1, atMax = -1;
  for (let i = 0; i < answers.length; i++) {
    const a = answers[i];
    if (a != null && a === prev) { run++; } else { run = a != null ? 1 : 0; }
    prev = a;
    if (run > max) { max = run; atMax = i; }
  }
  return { max, at: atMax };
}

for (const topic of topics) {
  test(`interleave: ${topic.id} — немає 3 однакових відповідей підряд`, () => {
    const answers = playSequence(topic, topic.cards.length * 3);
    assert.ok(answers.length > 0, `${topic.id}: черга нічого не повернула`);
    const { max, at } = longestRun(answers);
    assert.ok(
      max <= 2,
      `${topic.id}: серія ${max} однакових відповідей підряд («${answers[at]}», крок ${at}). `
      + `Рушій мав перемежувати — серед кандидатів була альтернатива. Перевір порядок карток теми.`
    );
  });
}
