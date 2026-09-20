// Реєстр тем. Кожна нова тема додається сюди одним рядком.

import genus from './genus.js';
import artikel from './artikel.js';

// Порядок = порядок у хабі. genus перший: рід — база для таблиці артиклів.
export const topics = [genus, artikel];
export const byId = Object.fromEntries(topics.map(t => [t.id, t]));

export function getTopic(id) {
  return byId[id] || null;
}
