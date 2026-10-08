// Тема «Perfekt» — минулий розмовний час. Дані (усі форми) — у perfekt.data.js
// (для вчителя, сторінка perfekt-review.html).
//
// Одиниця — дієслово з двома навичками: кожне дієслово дає ДВІ картки:
//   1) вибір допоміжного haben/sein — тип `choice` (дві нейтральні кнопки);
//   2) ввід Partizip II — тип `type` (варіантів забагато, вибір не тренує), як у praesens.
//
// ── Порядок уведення нових карток ────────────────────────────────────────────
// Пара [haben/sein, Partizip] кожного дієслова йде ПІДРЯД, а дієслова чергуються за
// допоміжним (≈ sein, haben, haben). Так кожну картку haben/sein розділяє картка Partizip
// з УНІКАЛЬНОЮ відповіддю, і серед нових карток не буває двох однакових відповідей підряд.
// Це важливо, бо srs.pick вводить нові картки СТРОГО в порядку масиву (кроки 2/4), а
// перемежування за відповіддю (pickNoRun) діє лише в пулах review (кроки 1/3/5) — тобто
// антисерійність уведення нових карток належить темі (SPEC §9: «тема сама вирішує
// послідовність»). Масив з усіма sein підряд давав 20+ sein-карток поспіль.
//
// ── Карта засвоєння (SPEC §6) ────────────────────────────────────────────────
// Один стовпець, кожен рядок — ОКРЕМА навичка: 4 типи формотворення Partizip
// (правильні/сильні/без ge-/відокремлювані) + 2 рядки вибору допоміжного (sein / haben).
// Два стовпці (формотворення × haben/sein) відкинуто: форма Partizip не залежить від
// допоміжного, тож обидві колонки показували б той самий маркер — вдавали б два знання.
// Нейтральна (без кольорів відповідей). Картка Partizip → рядок свого формотворення;
// картка haben/sein → рядок свого допоміжного.
import { HEAT_ROWS, HEAT_COL, VERBS, auxWhyFor, ppWhyFor, cellMark } from './perfekt.data.js';

const KIND_PP = {
  reg: 'Partizip II: правильне', strong: 'Partizip II: сильне',
  noge: 'Partizip II: без ge-',  sep: 'Partizip II: відокремлюване'
};

const play = VERBS.filter(v => !v.todo);

// Картка 1 — вибір haben/sein. Рядок карти — допоміжне дієслова. Дуальні дієслова
// (fahren, fliegen) несуть контекст у промпті, щоб рух зі зміною місця → sein був
// однозначним (інакше обидві відповіді правильні).
const auxCard = v => ({
  id: `pf-aux-${v.inf}`,
  type: 'choice',
  kind: 'haben чи sein?',
  prompt: v.ctx || v.inf,
  gloss: v.uk,
  options: ['haben', 'sein'],
  answer: v.aux,
  cell: { row: v.aux === 'sein' ? 'aux_sein' : 'aux_haben', col: HEAT_COL.k },
  why: auxWhyFor(v, 'uk')
});

// Картка 2 — ввід Partizip II. Рядок карти — тип формотворення.
const ppCard = v => ({
  id: `pf-pp-${v.inf}`,
  type: 'type',
  kind: KIND_PP[v.group],
  prompt: v.inf,
  ask: 'Partizip II',
  gloss: v.uk,
  answer: v.part,
  cell: { row: v.group, col: HEAT_COL.k },
  why: ppWhyFor(v, 'uk')
});

// Порядок дієслів: усередині кожного допоміжного — за типом формотворення (щоб патерни
// Partizip трохи трималися купи), тоді чергуємо sein / haben / haben (sein рідкісні — 12,
// haben — 28, тож на кожне sein ≈ два haben). sein з'являється одразу і регулярно (SPEC:
// несе правило), а не пачкою на початку.
const GROUP_ORDER = ['reg', 'strong', 'noge', 'sep'];
const byFormation = (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
const seinV = play.filter(v => v.aux === 'sein').sort(byFormation);
const habenV = play.filter(v => v.aux === 'haben').sort(byFormation);

const verbOrder = [];
for (let i = 0, j = 0; i < seinV.length || j < habenV.length;) {
  if (i < seinV.length) verbOrder.push(seinV[i++]);
  if (j < habenV.length) verbOrder.push(habenV[j++]);
  if (j < habenV.length) verbOrder.push(habenV[j++]);
}

// Пара карток кожного дієслова підряд — ключ до антисерійності (див. коментар згори).
const cards = verbOrder.flatMap(v => [auxCard(v), ppCard(v)]);

// Знак теми з її матеріалу — два допоміжні у 3-й особі (hat / ist), нейтральні пігулки.
const logo = `<span class="tl-word">Perfekt</span>`
  + ['hat', 'ist'].map(w =>
      `<span class="tl-pill" style="background:var(--surface2);color:var(--ink);border:1px solid var(--line)">${w}</span>`
    ).join('');

export default {
  id: 'perfekt',
  title: 'Perfekt: минулий час',
  subtitle: 'Розмовний минулий',
  blurb: 'Минулий час розмови: вибір haben/sein і Partizip II — правильні (gemacht), сильні (gegangen), без ge- (studiert, verstanden) та відокремлювані (aufgestanden).',
  logo,
  answers: [],              // кнопки несе кожна картка haben/sein окремо (options)
  colors: {},               // карта засвоєння нейтральна (без кольорів відповідей)
  showChip: false,          // чип-рід тут не має сенсу
  matrix: {
    rows: HEAT_ROWS,
    cols: [HEAT_COL],
    value: (row) => cellMark(row)   // heat викликає value(row, col); стовпець один
  },
  cards
};
