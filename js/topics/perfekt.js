// Тема «Perfekt» — минулий розмовний час. Дані (усі форми) — у perfekt.data.js
// (для вчителя, сторінка perfekt-review.html).
//
// Одиниця — дієслово з двома навичками: кожне дієслово дає ДВІ картки:
//   1) вибір допоміжного haben/sein — тип `choice` (дві нейтральні кнопки);
//   2) ввід Partizip II — тип `type` (варіантів забагато, вибір не тренує), як у praesens.
//
// Порядок уведення нових карток (SPEC §9-подібно, блоки за порядком):
//   1) haben/sein — спершу sein-дієслова (рідкісні, несуть правило), тоді haben;
//   2) Partizip II правильних (gemacht);  3) сильних (gegangen);
//   4) без ge- (studiert, verstanden);    5) відокремлюваних (aufgestanden).
// Жива черга рушія перемежовує картки сама (SPEC §3) — масив лише задає порядок відкриття.
//
// Карта засвоєння (SPEC §6): формотворення Partizip (рядки) × haben/sein (стовпці),
// НЕЙТРАЛЬНА (без кольорів відповідей). Кожне дієслово лягає в одну клітинку (свій тип ×
// свій допоміжний), обидві його картки — туди ж. Peek показує лише маркер формотворення.
import { GROUPS, AUX, VERBS, auxWhyFor, ppWhyFor, cellMark } from './perfekt.data.js';

const KIND_PP = {
  reg: 'Partizip II: правильне', strong: 'Partizip II: сильне',
  noge: 'Partizip II: без ge-',  sep: 'Partizip II: відокремлюване'
};

const play = VERBS.filter(v => !v.todo);

// Картка 1 — вибір haben/sein. Дуальні дієслова (fahren, fliegen) несуть контекст у промпті,
// щоб рух зі зміною місця → sein був однозначним (інакше обидві відповіді правильні).
const auxCard = v => ({
  id: `pf-aux-${v.inf}`,
  type: 'choice',
  kind: 'haben чи sein?',
  prompt: v.ctx || v.inf,
  gloss: v.uk,
  options: ['haben', 'sein'],
  answer: v.aux,
  cell: { row: v.group, col: v.aux },
  why: auxWhyFor(v, 'uk')
});

// Картка 2 — ввід Partizip II.
const ppCard = v => ({
  id: `pf-pp-${v.inf}`,
  type: 'type',
  kind: KIND_PP[v.group],
  prompt: v.inf,
  ask: 'Partizip II',
  gloss: v.uk,
  answer: v.part,
  cell: { row: v.group, col: v.aux },
  why: ppWhyFor(v, 'uk')
});

// Блок 1 — усі картки haben/sein (sein-дієслова першими: правило вчиться на них).
const auxCards = [...play.filter(v => v.aux === 'sein'), ...play.filter(v => v.aux === 'haben')].map(auxCard);
// Блоки 2–5 — Partizip II у порядку груп формотворення.
const GROUP_ORDER = ['reg', 'strong', 'noge', 'sep'];
const ppCards = GROUP_ORDER.flatMap(g => play.filter(v => v.group === g).map(ppCard));

const cards = [...auxCards, ...ppCards];

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
    rows: GROUPS,
    cols: AUX,
    value: (group, aux) => cellMark(group, aux)   // heat викликає value(row, col)
  },
  cards
};
