// Тема «Präsens» — відмінювання дієслів у теперішньому часі. Дані (усі форми) —
// у praesens.data.js (для вчителя, сторінка praesens-review.html).
//
// Тип картки — `type` (ввід форми з клавіатури): варіантів забагато, вибір не тренує.
// Одиниця — дієслово + особа → форма. Порядок уведення нових карток (SPEC §9-подібно):
//   1) sein, haben (окремо, першими — нерегулярні, у кожному реченні);
//   2) правильні (incl. -e- перед -st/-t та -ß);
//   3) зміна кореневої голосної a→ä, e→i, e→ie;
//   4) модальні (ich і er без закінчення — постійна помилка).
// Усередині дієслова — усі 6 осіб підряд: учень бачить парадигму цілком.
//
// Карта засвоєння (SPEC §6): особи × групи дієслів, НЕЙТРАЛЬНА (type-тема без кольорів
// відповідей). colors порожні; peek показує лише патерн закінчення (data.cellMark).
import { PERSONS, GROUPS, VERBS, whyFor, cellMark } from './praesens.data.js';

const KIND = {
  sein: 'Дієслово sein', haben: 'Дієслово haben', reg: 'Правильне дієслово',
  ae: 'Зміна кореня: a→ä', ei: 'Зміна кореня: e→i', eie: 'Зміна кореня: e→ie',
  modal: 'Модальне дієслово'
};
const personLabel = k => PERSONS.find(p => p.k === k).label;

// Картки: для кожного дієслова — 6 осіб у порядку PERSONS. todo-дієслово в гру не йде.
const cards = VERBS.filter(v => !v.todo).flatMap(v =>
  PERSONS.map(p => ({
    id: `pr-${v.inf}-${p.k}`,
    type: 'type',
    kind: KIND[v.group],
    prompt: v.inf,                 // інфінітив (великим)
    ask: p.label,                  // особа-підказка (du, er/sie/es …)
    gloss: v.uk,                   // укр. переклад (не нім. форма) — контекст
    answer: v.forms[p.k],          // правильна форма
    cell: { row: p.k, col: v.group },
    why: whyFor(v.sub, p.k)
  }))
);

const logo = `<span class="tl-word">Präsens</span>`
  + ['ich', 'du', 'er'].map(p =>
      `<span class="tl-pill" style="background:var(--surface2);color:var(--ink);border:1px solid var(--line)">${p}</span>`
    ).join('');

export default {
  id: 'praesens',
  title: 'Präsens: дієвідміна',
  subtitle: 'Теперішній час',
  blurb: 'Фундамент речення: sein і haben, правильні дієслова, зміна кореня (a→ä, e→i) і модальні. Ввід форми, не вибір.',
  logo,
  answers: [],              // type-картки не мають кнопок
  colors: {},               // карта засвоєння нейтральна (type-тема без кольорів)
  showChip: false,          // чип-рід тут не має сенсу
  matrix: {
    rows: PERSONS,
    cols: GROUPS,
    value: (row, col) => cellMark(col, row)   // heat викликає value(person, group)
  },
  cards
};
