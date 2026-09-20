// Рендер картки за типом і фідбек після відповіді. Тексти — через i18n (t).
// Логіка стану сюди не заходить: контролер передає дані і колбеки.
import { t } from '../i18n/index.js';

const rowOf = (topic, k) => topic.matrix.rows.find(r => r.k === k);
const colOf = (topic, k) => topic.matrix.cols.find(c => c.k === k);
// Мітка рядка: німецька — інлайн (artikel), українська — з lang (genus-групи).
const rowLabel = (topic, k) => { const r = rowOf(topic, k); return r.label ?? t(`topics.${topic.id}.groups.${k}.label`); };
const colLabel = (topic, k) => colOf(topic, k).label;
const color = (topic, a) => topic.colors[a];

function genderChip(topic, card) {
  return `<span class="gchip">${colLabel(topic, card.cell.col)}</span>`;
}

function pills(topic) {
  // --ans-cols підганяє сітку під кількість кнопок (3 для genus, 6 для artikel).
  return `<div class="answers" style="--ans-cols:${topic.answers.length}">${topic.answers
    .map((a, i) => `<button class="pill" data-a="${a}" style="background:${color(topic, a)}"><kbd>${i + 1}</kbd>${a}</button>`)
    .join('')}</div>`;
}

function revGrid(topic, card) {
  let h = `<div class="grid" style="--sel:${color(topic, card.answer)}"><div></div>${topic.matrix.cols.map(g => `<div class="h">${g.label}</div>`).join('')}`;
  topic.matrix.rows.forEach(cs => {
    h += `<div class="h rh">${cs.label}</div>`;
    topic.matrix.cols.forEach(g => {
      h += `<button class="cell" aria-pressed="false" data-k="${cs.k}-${g.k}" aria-label="${cs.label} ${g.label}"></button>`;
    });
  });
  return h + '</div>';
}

function miniTable(topic, target, chosen) {
  let h = `<div class="mini"><div class="h"></div>${topic.matrix.cols.map(g => `<div class="h">${g.label}</div>`).join('')}`;
  topic.matrix.rows.forEach(cs => {
    h += `<div class="h" style="text-align:right">${cs.label}</div>`;
    topic.matrix.cols.forEach(g => {
      const a = topic.matrix.value(cs.k, g.k);
      let cls = 'c';
      if (cs.k === target.row) cls += ' row';
      if (cs.k === target.row && g.k === target.col) cls += ' target';
      else if (chosen && cs.k === target.row && a === chosen) cls += ' chosen';
      h += `<div class="${cls}" style="background:${color(topic, a)}">${a}</div>`;
    });
  });
  return h + '</div>';
}

// Рендер картки. handlers: { onChoose(answer), onToggleCell(k, el), onCheck() }.
export function renderCard(cardEl, topic, cur, cardState, handlers) {
  const c = cur.card;
  const badge = cur.isNew
    ? `<span class="badge new">${t('ui.card.new')}</span>`
    : (cardState ? `<span class="badge">${t('ui.card.level', { b: cardState.b })}</span>` : '');

  // Тема може вимкнути чип-рід (genus: рід і є відповіддю — не підказувати).
  const chip = topic.showChip === false ? '' : genderChip(topic, c);
  let body = '';
  if (c.type === 'choice') body = `<div class="big" lang="de">${c.prompt}</div>${chip}`;
  if (c.type === 'sentence') body = `<div class="sentence" lang="de">${c.prompt.replace('___', '<span class="blank" id="blank">&nbsp;</span>')}</div>${chip}`;
  if (c.type === 'grid') body = `<div class="big" style="background:${color(topic, c.answer)};color:var(--pill-ink);padding:6px 26px;border-radius:22px">${c.answer}</div><div class="hint">${t('ui.card.gridHint')}</div>${revGrid(topic, c)}`;

  const ans = c.type === 'grid'
    ? `<div style="display:flex;justify-content:center;margin-top:10px"><button class="btn" id="check">${t('ui.card.check')} <small style="opacity:.6">${t('ui.card.enter')}</small></button></div>`
    : pills(topic);

  cardEl.innerHTML = `<div class="kind"><span>${t(c.kind)}</span>${badge}</div><div class="prompt">${body}</div>${ans}<div class="feedback" id="fb"></div>`;

  if (c.type === 'grid') {
    cardEl.querySelectorAll('.cell').forEach(b => b.addEventListener('click', () => handlers.onToggleCell(b.dataset.k, b)));
    document.getElementById('check').addEventListener('click', handlers.onCheck);
  } else {
    cardEl.querySelectorAll('.pill').forEach(b => b.addEventListener('click', () => handlers.onChoose(b.dataset.a)));
  }
}

// Фідбек для choice/sentence. Повертає ok (для вибору таймінгу автопереходу).
export function showChoiceFeedback(cardEl, topic, card, chosen, ms, fast, ok, onNext) {
  cardEl.querySelectorAll('.pill').forEach(b => {
    b.disabled = true;
    const x = b.dataset.a;
    if (x === card.answer) b.classList.add('right');
    else if (x === chosen) b.classList.add('wrong');
    else b.classList.add('dim');
  });
  const blank = document.getElementById('blank');
  if (blank) { blank.textContent = card.answer; blank.style.background = color(topic, card.answer); }

  const fb = document.getElementById('fb');
  const sec = (ms / 1000).toFixed(1);
  const whyHtml = card.why ? `<div class="why">${t(card.why)}</div>` : '';

  // Теми без чипа (genus): відповідь показуємо як «die Tür», без сітки-міні-таблиці.
  if (topic.showChip === false) {
    const rl = rowLabel(topic, card.cell.row);
    if (ok) {
      cardEl.classList.add('flash-ok');
      fb.innerHTML = `<div class="fb-line"><span class="fb-text ok">${t('ui.fb.correctNoun', { a: card.answer, w: card.prompt, sec })}${fast ? '' : t('ui.fb.slowRetry')}</span><span class="hint">${rl}</span></div>${whyHtml}`;
      fb.classList.add('show');
    } else {
      cardEl.classList.add('flash-bad');
      fb.innerHTML = `<div class="fb-line"><span class="fb-text bad">${t('ui.fb.wrongNoun', { a: card.answer, w: card.prompt })}</span><span class="hint">${rl}</span></div>${whyHtml}<div style="display:flex;justify-content:flex-end"><button class="btn" id="nextBtn">${t('ui.card.next')} <small style="opacity:.6">${t('ui.card.enter')}</small></button></div>`;
      fb.classList.add('show');
      const nb = document.getElementById('nextBtn');
      nb.addEventListener('click', onNext);
      nb.focus();
    }
    return;
  }

  const qline = card.ask ? ` — ${card.ask}` : ` — ${rowOf(topic, card.cell.row).hint}`;
  const rl = rowLabel(topic, card.cell.row), cl = colLabel(topic, card.cell.col);

  if (ok) {
    cardEl.classList.add('flash-ok');
    fb.innerHTML = `<div class="fb-line"><span class="fb-text ok">${t('ui.fb.correct', { a: card.answer, sec })}${fast ? '' : t('ui.fb.slowRetry')}</span><span class="hint">${rl} · ${cl}${qline}</span></div>${whyHtml}`;
    fb.classList.add('show');
  } else {
    cardEl.classList.add('flash-bad');
    fb.innerHTML = `<div class="fb-line"><span class="fb-text bad">${t('ui.fb.wrong', { rl, cl, a: card.answer })}</span><span class="hint">${qline.slice(3)}</span></div>${whyHtml}${miniTable(topic, card.cell, chosen)}<div style="display:flex;justify-content:flex-end"><button class="btn" id="nextBtn">${t('ui.card.next')} <small style="opacity:.6">${t('ui.card.enter')}</small></button></div>`;
    fb.classList.add('show');
    const nb = document.getElementById('nextBtn');
    nb.addEventListener('click', onNext);
    nb.focus();
  }
}

// Фідбек для grid. sel — Set позначених клітинок.
export function showGridFeedback(cardEl, topic, card, sel, ms, fast, ok, onNext) {
  const want = new Set(card.cells);
  cardEl.querySelectorAll('.cell').forEach(b => {
    const k = b.dataset.k;
    b.disabled = true;
    if (want.has(k) && sel.has(k)) b.classList.add('ok');
    else if (want.has(k)) { b.classList.add('miss'); b.textContent = card.answer; }
    else if (sel.has(k)) b.classList.add('bad');
  });
  const chk = document.getElementById('check');
  chk.textContent = `${t('ui.card.next')} ${t('ui.card.enter')}`;
  chk.replaceWith(chk.cloneNode(true));
  const nb = document.getElementById('check');
  nb.addEventListener('click', onNext);

  const fb = document.getElementById('fb');
  const where = card.cells.map(k => { const [cs, g] = k.split('-'); return `${rowLabel(topic, cs)} ${colLabel(topic, g)}`; }).join(', ');
  const whyHtml = card.why ? `<div class="why">${card.why}</div>` : '';
  cardEl.classList.add(ok ? 'flash-ok' : 'flash-bad');
  fb.innerHTML = (ok
    ? `<span class="fb-text ok">${t('ui.fb.gridExact', { sec: (ms / 1000).toFixed(1) })}${fast ? '' : t('ui.fb.slow')}</span>`
    : `<span class="fb-text bad">${t('ui.fb.gridWrong', { a: card.answer, where })}</span><span class="hint">${t('ui.fb.gridLegend')}</span>`) + whyHtml;
  fb.classList.add('show');
  if (!ok) nb.focus();
}

export function renderDone(cardEl, data, cardsCount, onDrill) {
  const ds = Object.values(data.cards).map(s => s.due);
  const nxt = ds.length ? Math.min(...ds) - Date.now() : 0;
  const intro = Object.keys(data.cards).length;
  cardEl.innerHTML = `<div class="done"><div class="big">${t('ui.done.title')}</div><p>${intro ? t('ui.done.body', { t: fmt(Math.max(nxt, 0)) }) : t('ui.done.empty')}</p><button class="btn" id="goDrill">${t('ui.done.drill')}</button></div>`;
  document.getElementById('goDrill').addEventListener('click', onDrill);
}

function fmt(ms) {
  const SEC = 1e3, MIN = 60e3, HOUR = 36e5, DAY = 864e5;
  if (ms < MIN) return t('ui.fmt.sec', { n: Math.max(1, Math.round(ms / SEC)) });
  if (ms < HOUR) return t('ui.fmt.min', { n: Math.round(ms / MIN) });
  if (ms < DAY) return t('ui.fmt.hour', { n: Math.round(ms / HOUR) });
  return t('ui.fmt.day', { n: Math.round(ms / DAY) });
}
