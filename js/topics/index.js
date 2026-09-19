// Реєстр тем. Кожна нова тема додається сюди одним рядком.

import artikel from './artikel.js';

export const topics = [artikel];
export const byId = Object.fromEntries(topics.map(t => [t.id, t]));

export function getTopic(id) {
  return byId[id] || null;
}
