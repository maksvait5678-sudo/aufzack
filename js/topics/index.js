// Реєстр тем. Кожна нова тема додається сюди одним рядком.

import genus from './genus.js';
import artikel from './artikel.js';
import praepositionen from './praepositionen.js';
import wechsel from './wechsel.js';
import praesens from './praesens.js';
import satzbau from './satzbau.js';
import perfekt from './perfekt.js';

// Порядок = порядок у хабі. genus перший: рід — база для таблиці артиклів.
export const topics = [genus, artikel, praepositionen, wechsel, praesens, satzbau, perfekt];
export const byId = Object.fromEntries(topics.map(t => [t.id, t]));

export function getTopic(id) {
  return byId[id] || null;
}
