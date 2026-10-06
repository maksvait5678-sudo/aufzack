// Тема «Präsens»: нормалізація вводу (умлаути — розгортання, не згортання), цілісність
// карток (type, answer, why, cell), повнота парадигм і точкові перевірки відомих
// складних форм. Усі форми звіряються вчителем на praesens-review.html; тут — машинні
// інваріанти і захист від найчастішої помилки (fahrst ≠ fährst).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normType, typeMatches } from '../js/engine/srs.js';
import praesens from '../js/topics/praesens.js';
import { PERSONS, GROUPS, VERBS } from '../js/topics/praesens.data.js';

// ---------------------------------------------------------------- normType

test('normType: розгортає умлаути (ä→ae), а не згортає (ä→a)', () => {
  assert.equal(normType('fährst'), 'faehrst');
  assert.equal(normType('fahrst'), 'fahrst');     // без умлаута лишається без ae
  assert.equal(normType('heißt'), 'heisst');
  assert.equal(normType('schön'), 'schoen');
  assert.equal(normType('müde'), 'muede');
});

test('normType: регістр і крайні пробіли не важать', () => {
  assert.equal(normType('  FÄHRST '), 'faehrst');
});

// ---------------------------------------------------------------- typeMatches

test('typeMatches: faehrst зараховується, fahrst — ні', () => {
  // faehrst — спосіб набрати умлаут без нім. клавіатури → приймаємо.
  assert.equal(typeMatches('faehrst', 'fährst'), true);
  assert.equal(typeMatches('fährst', 'fährst'), true);
  // fahrst — граматична помилка (немає умлаута) → НЕ приймаємо.
  assert.equal(typeMatches('fahrst', 'fährst'), false);
});

test('typeMatches: ß↔ss і регістр', () => {
  assert.equal(typeMatches('heisst', 'heißt'), true);
  assert.equal(typeMatches('HEIßT', 'heißt'), true);
  assert.equal(typeMatches('heißst', 'heißt'), false);   // зайве -s (помилка du-форми на -ß)
});

test('typeMatches: порожній ввід ніколи не правильний', () => {
  assert.equal(typeMatches('', 'bin'), false);
  assert.equal(typeMatches('   ', 'bin'), false);
});

// ---------------------------------------------------------------- картки

test('praesens: кожна картка — type, з answer, why і валідним cell', () => {
  const rows = new Set(PERSONS.map(p => p.k));
  const cols = new Set(GROUPS.map(g => g.k));
  for (const c of praesens.cards) {
    assert.equal(c.type, 'type', `${c.id}: тип ${c.type}`);
    assert.ok(c.answer && c.answer.length > 0, `${c.id}: порожня відповідь`);
    assert.ok(c.why && c.why.length > 0, `${c.id}: порожній why`);
    assert.ok(c.ask && c.prompt, `${c.id}: немає prompt/ask`);
    assert.ok(c.cell && rows.has(c.cell.row) && cols.has(c.cell.col), `${c.id}: неправильний cell`);
  }
});

test('praesens: усі 6 осіб у кожного дієслова, форми непорожні й без пробілів', () => {
  for (const v of VERBS) {
    for (const p of PERSONS) {
      const f = v.forms[p.k];
      assert.ok(typeof f === 'string' && f.length > 0, `${v.inf}/${p.k}: порожня форма`);
      assert.ok(!/\s/.test(f), `${v.inf}/${p.k}: пробіл у формі`);
    }
  }
});

test('praesens: кількість карток = дієслова (без todo) × особи', () => {
  const play = VERBS.filter(v => !v.todo).length;
  assert.equal(praesens.cards.length, play * PERSONS.length);
  // Унікальні id.
  assert.equal(new Set(praesens.cards.map(c => c.id)).size, praesens.cards.length);
});

test('praesens: 25–30 найчастотніших дієслів (не більше)', () => {
  assert.ok(VERBS.length >= 25 && VERBS.length <= 30, `дієслів ${VERBS.length}`);
});

test('praesens: matrix.value визначена для кожної клітинки (особа × група)', () => {
  for (const p of PERSONS) {
    for (const g of GROUPS) {
      const val = praesens.matrix.value(p.k, g.k);
      assert.ok(val && String(val).length > 0, `немає value для ${p.k}×${g.k}`);
    }
  }
});

// Точкові перевірки відомих складних форм (захист від регресій у даних).
test('praesens: контрольні форми відомих пасток', () => {
  const f = inf => VERBS.find(v => v.inf === inf).forms;
  assert.equal(f('heißen').du, 'heißt');      // не «heißst»
  assert.equal(f('arbeiten').du, 'arbeitest'); // -e- перед -st
  assert.equal(f('arbeiten').er, 'arbeitet');
  assert.equal(f('halten').er, 'hält');        // корінь на -t + умлаут, без зайвого -t
  assert.equal(f('halten').ihr, 'haltet');     // ihr без умлаута, з -e-
  assert.equal(f('essen').du, 'isst');
  assert.equal(f('lesen').du, 'liest');
  assert.equal(f('sprechen').er, 'spricht');
  assert.equal(f('können').ich, 'kann');       // модальне: ich без закінчення
  assert.equal(f('können').er, 'kann');         // er = ich
  assert.equal(f('haben').er, 'hat');           // випадає -b-
  assert.equal(f('sein').er, 'ist');
});

test('praesens: sein і haben — перші дві групи введення', () => {
  assert.equal(praesens.cards[0].cell.col, 'sein');
  assert.equal(praesens.cards[PERSONS.length].cell.col, 'haben');
});
