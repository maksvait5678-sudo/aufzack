// Карта засвоєння. Заливка рівня — нейтральний колір; кольори відповідей
// показуються лише в режимі «Підглянути таблицю» (peek).

export function renderHeat(heatEl, topic, states, peek) {
  const st = id => states[id];
  // Кількість колонок під матрицю теми (artikel — 4 роди, genus — 3 роди).
  heatEl.style.setProperty('--heat-cols', topic.matrix.cols.length);
  let h = `<div></div>${topic.matrix.cols.map(g => `<div class="h">${g.label}</div>`).join('')}`;
  topic.matrix.rows.forEach(cs => {
    h += `<div class="h rh">${cs.label}<em>${cs.hint}</em></div>`;
    topic.matrix.cols.forEach(g => {
      const related = topic.cards.filter(c => c.type !== 'grid' && c.cell && c.cell.row === cs.k && c.cell.col === g.k);
      const has = related.length > 0;
      // Розріджена матриця (genus): порожня клітинка — без заливки й підпису, лишається нейтральною.
      const v = has ? related.reduce((acc, c) => acc + (st(c.id) ? Math.min(st(c.id).b, 4) / 4 : 0), 0) / related.length : 0;
      const a = topic.matrix.value(cs.k, g.k);
      const label = !has ? '' : (peek ? `<span>${a}</span>` : `<span class="pct">${Math.round(v * 100)}%</span>`);
      const fill = has ? `<div class="fill" style="background:${peek ? topic.colors[a] : 'var(--prog)'};transform:scaleX(${peek ? 1 : v})"></div>` : '';
      h += `<div class="hc" title="${cs.label} ${g.label}">${fill}${label}</div>`;
    });
  });
  heatEl.innerHTML = h;
}
