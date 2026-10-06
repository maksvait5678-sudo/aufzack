// Тема «Satzbau» — конструктор речень (порядок слів). Дані — у satzbau.data.js
// (для вчителя, satzbau-review.html). Тип картки — `order` (складання слів):
// завдання українською, розсип слів, рядок-результат. Тренуємо ПОРЯДОК, не форми
// (відмінювання — у praesens) і не регістр (велику першу літеру додає рендер).
//
// Порядок уведення (SPEC-подібно): простий V2 → інверсія → модальне+Inf → питання →
// заперечення (nicht) — nicht останній і короткий (найзаплутаніше, не псує перше враження).
//
// Карта засвоєння: рядки = блоки (типи речення), один стовпець «порядок»; peek показує
// маркер правила блоку (V2, V2+інв., …Inf, ?, nicht). Нейтральна (без кольорів відповідей).
import { BLOCKS, SENTENCES } from './satzbau.data.js';

const blockLabel = k => BLOCKS.find(b => b.k === k).label;

// Картки: по одній на речення (без todo). bank = слова першого розвʼязку + зайві слова.
const cards = SENTENCES.filter(s => !s.todo).map((s, i) => ({
  id: `sb-${s.block}-${i}`,
  type: 'order',
  kind: blockLabel(s.block),
  uk: s.uk,
  punct: s.punct || '.',
  solutions: s.solutions,
  bank: [...s.solutions[0].order, ...(s.distractors || [])],
  cell: { row: s.block, col: 'o' },
  why: s.why
}));

// Знак теми з її матеріалу — слоти речення (хто · дія · куди), нейтральні пігулки.
const logo = `<span class="tl-word">Satzbau</span>`
  + ['wer', 'Verb', 'wohin'].map(w =>
      `<span class="tl-pill" style="background:var(--surface2);color:var(--ink);border:1px solid var(--line)">${w}</span>`
    ).join('');

export default {
  id: 'satzbau',
  title: 'Satzbau: порядок слів',
  subtitle: 'Конструктор речень',
  blurb: 'Дієслово — на другому місці. Склади речення зі слів: простий порядок, інверсія, рамка з інфінітивом, питання, заперечення.',
  logo,
  answers: [],
  colors: {},
  showChip: false,
  matrix: {
    rows: BLOCKS.map(b => ({ k: b.k, label: b.label, hint: b.rule })),
    cols: [{ k: 'o', label: 'порядок' }],
    value: (row) => BLOCKS.find(b => b.k === row).rule
  },
  cards
};
