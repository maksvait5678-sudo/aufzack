// Рендер картки за типом і фідбек після відповіді. Візуал і тексти — 1:1 з legacy.
// Логіка стану сюди не заходить: контролер передає дані і колбеки.

const rowOf = (topic, k) => topic.matrix.rows.find(r => r.k === k);
const colOf = (topic, k) => topic.matrix.cols.find(c => c.k === k);
const rowLabel = (topic, k) => rowOf(topic, k).label;
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

// Кнопки кроку 1 двокрокової картки (Wo?/Wohin?) — нейтральні (не кольори артиклів):
// це інтерфейсний вибір правила, а не мнемоніка таблиці.
function stepPills(options) {
  return `<div class="answers${options.length === 2 ? ' two' : ''}" style="--ans-cols:${options.length}">${options
    .map((o, i) => `<button class="pill plain" data-a="${o}"><kbd>${i + 1}</kbd>${o}</button>`)
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
  // --mini-cols підганяє сітку під кількість родів теми (artikel — 4, wechsel — 3),
  // інакше на вузькому екрані клітинки й підписи рядків з'їжджають у чужі колонки.
  let h = `<div class="mini" style="--mini-cols:${topic.matrix.cols.length}"><div class="h"></div>${topic.matrix.cols.map(g => `<div class="h">${g.label}</div>`).join('')}`;
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
    ? '<span class="badge new">нова</span>'
    : (cardState ? `<span class="badge">рівень ${cardState.b}</span>` : '');

  // Тема може вимкнути чип-рід (genus: рід і є відповіддю — не підказувати).
  const chip = topic.showChip === false ? '' : genderChip(topic, c);

  // Двокрокова картка: речення з пропуском лишається на екрані обидва кроки (щоб крок 2
  // тренувався навіть після помилки в кроці 1). Спершу — лише кнопки Wo?/Wohin?.
  if (c.type === 'twostep') {
    const body = `<div class="sentence" lang="de">${c.prompt.replace('___', '<span class="blank" id="blank">&nbsp;</span>')}</div>${chip}`;
    cardEl.innerHTML = `<div class="kind"><span>${c.kind}</span>${badge}</div><div class="prompt">${body}</div>`
      + `<div id="step1wrap">${stepPills(c.step1.options)}</div><div class="feedback" id="fb1"></div>`
      + `<div id="step2wrap"></div><div class="feedback" id="fb"></div>`;
    cardEl.querySelectorAll('#step1wrap .pill').forEach(b => b.addEventListener('click', () => handlers.onChoose(b.dataset.a)));
    return;
  }
  let body = '';
  if (c.type === 'choice') body = `<div class="big" lang="de">${c.prompt}</div>${chip}`;
  if (c.type === 'sentence') body = `<div class="sentence" lang="de">${c.prompt.replace('___', '<span class="blank" id="blank">&nbsp;</span>')}</div>${chip}`;
  if (c.type === 'grid') body = `<div class="big" style="background:${color(topic, c.answer)};color:var(--pill-ink);padding:6px 26px;border-radius:22px">${c.answer}</div><div class="hint">Познач усі клітинки таблиці з цим артиклем</div>${revGrid(topic, c)}`;

  const ans = c.type === 'grid'
    ? `<div style="display:flex;justify-content:center;margin-top:10px"><button class="btn" id="check">Перевірити <small style="opacity:.6">(Enter)</small></button></div>`
    : pills(topic);

  cardEl.innerHTML = `<div class="kind"><span>${c.kind}</span>${badge}</div><div class="prompt">${body}</div>${ans}<div class="feedback" id="fb"></div>`;

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
  const whyHtml = card.why ? `<div class="why">${card.why}</div>` : '';

  // Теми без чипа (genus): відповідь показуємо як «die Tür», без сітки-міні-таблиці.
  if (topic.showChip === false) {
    const rl = rowLabel(topic, card.cell.row);
    if (ok) {
      cardEl.classList.add('flash-ok');
      fb.innerHTML = `<div class="fb-line"><span class="fb-text ok">Так, ${card.answer} ${card.prompt} · ${sec} с${fast ? '' : ' — повільно, повторимо скоріше'}</span><span class="hint">${rl}</span></div>${whyHtml}`;
      fb.classList.add('show');
    } else {
      cardEl.classList.add('flash-bad');
      fb.innerHTML = `<div class="fb-line"><span class="fb-text bad">Ні: ${card.answer} ${card.prompt}</span><span class="hint">${rl}</span></div>${whyHtml}<div style="display:flex;justify-content:flex-end"><button class="btn" id="nextBtn">Далі <small style="opacity:.6">(Enter)</small></button></div>`;
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
    fb.innerHTML = `<div class="fb-line"><span class="fb-text ok">Так, ${card.answer} · ${sec} с${fast ? '' : ' — повільно, повторимо скоріше'}</span><span class="hint">${rl} · ${cl}${qline}</span></div>${whyHtml}`;
    fb.classList.add('show');
  } else {
    cardEl.classList.add('flash-bad');
    fb.innerHTML = `<div class="fb-line"><span class="fb-text bad">Ні: ${rl} · ${cl} → ${card.answer}</span><span class="hint">${qline.slice(3)}</span></div>${whyHtml}${miniTable(topic, card.cell, chosen)}<div style="display:flex;justify-content:flex-end"><button class="btn" id="nextBtn">Далі <small style="opacity:.6">(Enter)</small></button></div>`;
    fb.classList.add('show');
    const nb = document.getElementById('nextBtn');
    nb.addEventListener('click', onNext);
    nb.focus();
  }
}

// Двокрокова картка, крок 1: позначити Wo?/Wohin?, показати ПРАВИЛО (зміна локації —
// не «рух»), тоді відкрити крок 2 (вибір артикля). Помилка не ховає крок 2.
export function showTwoStepStep1(cardEl, topic, card, chosen, ms1, fast1, ok1, onStep2) {
  cardEl.querySelectorAll('#step1wrap .pill').forEach(b => {
    b.disabled = true;
    const x = b.dataset.a;
    if (x === card.step1.answer) b.classList.add('right');
    else if (x === chosen) b.classList.add('wrong');
    else b.classList.add('dim');
  });
  const fb1 = document.getElementById('fb1');
  const head = ok1
    ? `<span class="fb-text ok">Так — ${card.step1.answer}</span>`
    : `<span class="fb-text bad">Ні — правильно ${card.step1.answer}</span>`;
  fb1.innerHTML = `<div class="fb-line">${head}<span class="hint">крок 2: артикль</span></div><div class="why">${card.step1.why}</div>`;
  fb1.classList.add('show');

  // Крок 2 — звичайний вибір артикля (ті самі пігулки, що в artikel).
  const wrap = document.getElementById('step2wrap');
  wrap.innerHTML = pills(topic);
  wrap.querySelectorAll('.pill').forEach(b => b.addEventListener('click', () => onStep2(b.dataset.a)));
}

// Двокрокова картка, крок 2: відмінок і рід. Показ правильності — за кроком 2 (учень міг
// узяти правильний артикль навіть після помилки в кроці 1). Кнопка «Далі» — коли картка в
// цілому не зарахована (щоб учень прочитав обидва фідбеки); інакше викликач автопереходить.
export function showTwoStepStep2(cardEl, topic, card, chosen, ms2, fast2, ok2, overallOk, onNext) {
  cardEl.querySelectorAll('#step2wrap .pill').forEach(b => {
    b.disabled = true;
    const x = b.dataset.a;
    if (x === card.answer) b.classList.add('right');
    else if (x === chosen) b.classList.add('wrong');
    else b.classList.add('dim');
  });
  const blank = document.getElementById('blank');
  if (blank) { blank.textContent = card.answer; blank.style.background = color(topic, card.answer); }

  const rl = rowLabel(topic, card.cell.row), cl = colLabel(topic, card.cell.col);
  const sec = (ms2 / 1000).toFixed(1);
  const whyHtml = card.why ? `<div class="why">${card.why}</div>` : '';
  const fb = document.getElementById('fb');
  const nextBtn = '<div style="display:flex;justify-content:flex-end"><button class="btn" id="nextBtn">Далі <small style="opacity:.6">(Enter)</small></button></div>';

  if (ok2) {
    cardEl.classList.add(overallOk ? 'flash-ok' : 'flash-bad');
    fb.innerHTML = `<div class="fb-line"><span class="fb-text ok">Так, ${card.answer} · ${sec} с${fast2 ? '' : ' — повільно'}</span><span class="hint">${rl} · ${cl}</span></div>${whyHtml}${overallOk ? '' : nextBtn}`;
  } else {
    cardEl.classList.add('flash-bad');
    fb.innerHTML = `<div class="fb-line"><span class="fb-text bad">Ні: ${rl} · ${cl} → ${card.answer}</span></div>${whyHtml}${miniTable(topic, card.cell, chosen)}${nextBtn}`;
  }
  fb.classList.add('show');
  const nb = document.getElementById('nextBtn');
  if (nb) { nb.addEventListener('click', onNext); nb.focus(); }
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
  chk.textContent = 'Далі (Enter)';
  chk.replaceWith(chk.cloneNode(true));
  const nb = document.getElementById('check');
  nb.addEventListener('click', onNext);

  const fb = document.getElementById('fb');
  const where = card.cells.map(k => { const [cs, g] = k.split('-'); return `${rowLabel(topic, cs)} ${colLabel(topic, g)}`; }).join(', ');
  const whyHtml = card.why ? `<div class="why">${card.why}</div>` : '';
  cardEl.classList.add(ok ? 'flash-ok' : 'flash-bad');
  fb.innerHTML = (ok
    ? `<span class="fb-text ok">Точно · ${(ms / 1000).toFixed(1)} с${fast ? '' : ' — повільно'}</span>`
    : `<span class="fb-text bad">${card.answer}: ${where}</span><span class="hint">Пунктир — пропущені, червоне — зайві.</span>`) + whyHtml;
  fb.classList.add('show');
  if (!ok) nb.focus();
}

export function renderDone(cardEl, data, cardsCount, onDrill) {
  const ds = Object.values(data.cards).map(s => s.due);
  const nxt = ds.length ? Math.min(...ds) - Date.now() : 0;
  const intro = Object.keys(data.cards).length;
  // Менше за хвилину — не показуємо секунди («через 4 с» виглядає як помилка), кажемо «зовсім скоро».
  const whenNext = Math.max(nxt, 0) < 60e3 ? 'зовсім скоро' : `через ${fmt(nxt)}`;
  cardEl.innerHTML = `<div class="done"><div class="big">Готово</div><p>${intro ? `Усе, що мало бути повторено, повторено. Наступне повторення — ${whenNext}. Між сесіями грай у профілактику: помилки там повертають картку в чергу.` : 'Натисни «Навчання», щоб почати.'}</p><button class="btn" id="goDrill">Профілактика</button></div>`;
  document.getElementById('goDrill').addEventListener('click', onDrill);
}

function fmt(ms) {
  const SEC = 1e3, MIN = 60e3, HOUR = 36e5, DAY = 864e5;
  if (ms < MIN) return `${Math.max(1, Math.round(ms / SEC))} с`;
  if (ms < HOUR) return `${Math.round(ms / MIN)} хв`;
  if (ms < DAY) return `${Math.round(ms / HOUR)} год`;
  return `${Math.round(ms / DAY)} дн`;
}
