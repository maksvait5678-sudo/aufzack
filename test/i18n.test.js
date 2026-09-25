// Тести інтернаціоналізації: усі ключі, на які посилаються код і теми, є в uk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import uk from '../js/i18n/uk.js';
import artikel from '../js/topics/artikel.js';
import genus from '../js/topics/genus.js';

const get = (dict, path) => String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
const has = path => typeof get(uk, path) === 'string';

test('i18n: обовязкові ui-ключі присутні', () => {
  const req = [
    'ui.hub.title', 'ui.hub.intro', 'ui.hub.learned', 'ui.hub.due', 'ui.hub.continue',
    'ui.play.title', 'ui.play.homeAria', 'ui.play.modeGroupAria', 'ui.play.learn', 'ui.play.drill',
    'ui.play.statDue', 'ui.play.statLearned', 'ui.play.statStreak', 'ui.play.statToday',
    'ui.play.mapTitle', 'ui.play.peekShow', 'ui.play.peekHide', 'ui.play.syncNote',
    'ui.play.exportBtn', 'ui.play.importBtn', 'ui.play.reset', 'ui.play.back',
    'ui.play.notFound', 'ui.play.notFoundLink', 'ui.play.resetConfirm',
    'ui.io.exportTitle', 'ui.io.exportHint', 'ui.io.copy', 'ui.io.close', 'ui.io.copied', 'ui.io.copyManual',
    'ui.io.importTitle', 'ui.io.importHint', 'ui.io.importPlaceholder', 'ui.io.apply',
    'ui.io.errBad', 'ui.io.errIncompatible', 'ui.io.errGeneric',
    'ui.card.new', 'ui.card.level', 'ui.card.check', 'ui.card.next', 'ui.card.enter', 'ui.card.gridHint',
    'ui.fb.correct', 'ui.fb.correctNoun', 'ui.fb.wrong', 'ui.fb.wrongNoun',
    'ui.fb.slowRetry', 'ui.fb.slow', 'ui.fb.gridExact', 'ui.fb.gridWrong', 'ui.fb.gridLegend',
    'ui.done.title', 'ui.done.body', 'ui.done.empty', 'ui.done.drill',
    'ui.fmt.sec', 'ui.fmt.min', 'ui.fmt.hour', 'ui.fmt.day'
  ];
  for (const k of req) assert.ok(has(k), `нема ключа ${k}`);
});

test('i18n: тексти теми artikel присутні', () => {
  for (const k of ['title', 'subtitle', 'blurb']) assert.ok(has(`topics.artikel.${k}`), `нема topics.artikel.${k}`);
});

test('i18n: усі ключі kind/why карток artikel існують у uk', () => {
  for (const c of artikel.cards) {
    assert.ok(has(c.kind), `нема ${c.kind} (картка ${c.id})`);
    if (c.why) assert.ok(has(c.why), `нема ${c.why} (картка ${c.id})`);
  }
});

test('i18n: у темі artikel немає захардкодженого тексту UI', () => {
  assert.equal(artikel.title, undefined);
  assert.equal(artikel.subtitle, undefined);
  assert.equal(artikel.blurb, undefined);
});

test('i18n: тексти теми genus присутні (title/kind/групи)', () => {
  for (const k of ['title', 'subtitle', 'blurb', 'kind']) assert.ok(has(`topics.genus.${k}`), `нема topics.genus.${k}`);
  for (const row of genus.matrix.rows) {
    assert.ok(has(`topics.genus.groups.${row.k}.label`), `нема групи ${row.k}.label`);
    assert.ok(has(`topics.genus.groups.${row.k}.hint`), `нема групи ${row.k}.hint`);
  }
});

test('i18n: усі ключі kind/why карток genus існують у uk', () => {
  for (const c of genus.cards) {
    assert.ok(has(c.kind), `нема ${c.kind} (картка ${c.id})`);
    assert.ok(has(c.why), `нема ${c.why} (картка ${c.id})`);
  }
});

test('i18n: у темі genus немає захардкодженого тексту UI', () => {
  assert.equal(genus.title, undefined);
  assert.equal(genus.subtitle, undefined);
  assert.equal(genus.blurb, undefined);
  for (const row of genus.matrix.rows) assert.equal(row.label, undefined);
});
