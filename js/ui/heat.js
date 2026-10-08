// Карта засвоєння. Заливка рівня — нейтральний колір; кольори відповідей
// показуються лише в режимі «Підглянути таблицю» (peek).

export function renderHeat(heatEl, topic, states, peek) {
  const st = id => states[id];
  // Кумулятивна карта (тема wortschatz): рядки — частини мови, стовпці — сходинки.
  // Клітинка (pos × сходинка N) наливається часткою слів цього pos, що ДОСЯГЛИ ≥ N
  // (слово на сходинці 2 вже «пройшло» 0 і 1). Сходи наливаються зліва направо й не
  // падають, коли слово просувається вперед (SPEC-рішення проти хибного «регресу»).
  if (topic.heatReach) return renderHeatReach(heatEl, topic, st);
  // Кількість колонок під матрицю теми (artikel — 4 роди, genus — 3 роди).
  heatEl.style.setProperty('--heat-cols', topic.matrix.cols.length);
  let h = `<div class="corner"></div>${topic.matrix.cols.map(g => `<div class="h">${g.label}</div>`).join('')}`;
  topic.matrix.rows.forEach(cs => {
    h += `<div class="h rh">${cs.label}<em>${cs.hint}</em></div>`;
    topic.matrix.cols.forEach(g => {
      const related = topic.cards.filter(c => c.type !== 'grid' && c.cell && c.cell.row === cs.k && c.cell.col === g.k);
      const has = related.length > 0;
      // Розріджена матриця (genus): порожня клітинка — без заливки й підпису, лишається нейтральною.
      const v = has ? related.reduce((acc, c) => acc + (st(c.id) ? Math.min(st(c.id).b, 4) / 4 : 0), 0) / related.length : 0;
      const a = topic.matrix.value(cs.k, g.k);
      // У peek текст на кольоровій пігулці — темний (--pill-ink), але якщо тема без
      // кольорів відповідей (praesens: нейтральна карта), фон лишається нейтральним,
      // тож беремо --ink (читається і в темній, і в світлій темі).
      const peekInk = topic.colors[a] ? '' : ' style="color:var(--ink)"';
      const label = !has ? '' : (peek ? `<span${peekInk}>${a}</span>` : `<span class="pct">${Math.round(v * 100)}%</span>`);
      const fill = has ? `<div class="fill" style="background:${peek ? topic.colors[a] : 'var(--prog)'};transform:scaleX(${peek ? 1 : v})"></div>` : '';
      h += `<div class="hc" title="${cs.label} ${g.label}">${fill}${label}</div>`;
    });
  });
  heatEl.innerHTML = h;
}

// Кумулятивна карта (heatReach): рядки — частини мови (cols[].k — числовий поріг сходинки).
// Нейтральна (без кольорів відповідей); peek тут нічого не відкриває — показуємо той самий %.
function renderHeatReach(heatEl, topic, st) {
  const rows = topic.matrix.rows, cols = topic.matrix.cols;
  heatEl.style.setProperty('--heat-cols', cols.length);
  let h = `<div class="corner"></div>${cols.map(c => `<div class="h">${c.label}<em>${c.hint}</em></div>`).join('')}`;
  rows.forEach(r => {
    h += `<div class="h rh">${r.label}${r.hint ? `<em>${r.hint}</em>` : ''}</div>`;
    const pool = topic.cards.filter(c => c.pos === r.k);
    cols.forEach(col => {
      const reached = pool.filter(c => { const s = st(c.id); return s && (s.step || 0) >= col.k; }).length;
      const v = pool.length ? reached / pool.length : 0;
      const label = pool.length ? `<span class="pct">${Math.round(v * 100)}%</span>` : '';
      const fill = pool.length ? `<div class="fill" style="background:var(--prog);transform:scaleX(${v})"></div>` : '';
      h += `<div class="hc" title="${r.label} · ${col.label}">${fill}${label}</div>`;
    });
  });
  heatEl.innerHTML = h;
}
