// Чисте ядро інтервального повторення: без DOM і без Date.now() усередині.
// Час і випадковість приходять аргументами, щоб усе було детерміновано тестовним.

export const SEC = 1e3, MIN = 60e3, HOUR = 36e5, DAY = 864e5;

// Рівні 0..8. Інтервали до наступного повторення для кожного рівня.
// Рівні 0 і 1 однакові навмисно: після помилки картка повертається не миттєво.
export const IV = [MIN, MIN, 10 * MIN, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY, 80 * DAY];
export const MAXB = IV.length - 1;

// Ліміт «швидкої» відповіді за типом картки, мс. twostep — поріг ДРУГОГО кроку (вибір артикля).
export const FAST = { choice: 4000, sentence: 7000, grid: 12000, type: 12000, twostep: 4000, order: 20000 };
// Поріг ПЕРШОГО кроку двокрокової картки (бінарний вибір Wo?/Wohin? — тугіший).
export const FAST_STEP1 = 3000;

// Порівняння текстової відповіді (картки типу `type`, SPEC §4).
// Умлаути РОЗГОРТАЄМО (ä→ae, ö→oe, ü→ue, ß→ss), а не згортаємо: `ae` зʼявляється
// лише з реального `ä`, тож «faehrst» (спосіб набрати умлаут без нім. клавіатури)
// зараховується, а «fahrst» (граматична помилка — без умлаута) — ні. Згортання
// (ä→a) зробило б «fahrst» правильним, що хибно. Регістр і крайні пробіли не важать.
export function normType(s) {
  return String(s).trim().toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}
export function typeMatches(input, answer) {
  return normType(input) === normType(answer) && normType(input) !== '';
}

// Порівняння порядку слів (картка `order`). `placed` — канонічні форми слів у порядку
// учня; `solutions` — [{ order:[...], good, note }]. Правильних варіантів може бути кілька:
// точний збіг із good!==false → зараховано як гарний; збіг лише з good:false → зараховано,
// але стилістично гірше (повертаємо note для фідбеку); інакше — помилка.
export function matchOrder(placed, solutions) {
  const eq = s => s.order.length === placed.length && s.order.every((w, i) => w === placed[i]);
  const hit = solutions.find(s => s.good !== false && eq(s)) || solutions.find(s => eq(s));
  if (!hit) return { ok: false };
  return { ok: true, good: hit.good !== false, note: hit.note };
}

// Помилка швидша за це — радше вгадування: важчий штраф у вазі профілактики.
export const FAST_ERROR = 1200;
// Мінімальний розрив між двома правильними відповідями, щоб зняти relearn.
export const RELEARN_GAP = 10 * MIN;

// Градуйоване відтворення (тема wortschatz, SPEC-подібно). Кожне слово має свою
// СХОДИНКУ 0..2, що зберігається у стані картки окремо від SRS-рівня `b`:
//   0 нім→укр вибір · 1 укр→нім вибір · 2 укр→нім ввід.
// Підйом: STEP_UP правильних-і-швидких підряд. Спуск: STEP_DOWN помилок підряд.
export const STEP_UP = 3, STEP_DOWN = 3, MAXSTEP = 2;
// Який тип рендеру (а отже й поріг швидкості) у слова на цій сходинці.
export function wordType(step) { return step >= 2 ? 'type' : 'choice'; }

// Свіжий стан картки, ще не введеної в роботу.
export function freshCard(now) {
  return { b: 0, due: now, r: 0, w: 0 };
}

// Вага картки в режимі «Профілактика»: нижчий рівень і більше помилок → частіше.
export function drillWeight(s) {
  return 1 + (6 - Math.min(s.b, 5)) * 2 + Math.min(s.w || 0, 5);
}

// Оцінити відповідь. Повертає НОВИЙ стан картки і чи була відповідь швидкою.
// streak/best/today тут не чіпаємо — це прогрес рівня сесії/сховища.
// `fast` можна передати явно (складені картки самі вирішують «швидко»); інакше — за ms/типом.
export function grade(state, { ok, ms, type, mode, now, fast }) {
  const s = state ? { ...state } : freshCard(now);
  if (fast === undefined) fast = ms <= FAST[type];
  const wasDue = s.due <= now;
  if (ok) {
    s.r++;
    if (mode === 'drill' && !wasDue) {
      // не прострочена картка в профілактиці — розклад і relearn не чіпаємо
    } else {
      let nb = fast ? Math.min(s.b + 1, MAXB) : Math.max(s.b, 1);
      if (s.relearn) {
        nb = Math.min(nb, 2); // під час перевчання рівень не піднімається вище 2
        if (s.relearnAt === undefined) {
          // перша правильна після помилки: рознести другу спробу щонайменше на RELEARN_GAP
          s.relearnAt = now;
          s.b = nb;
          s.due = now + Math.max(IV[nb], RELEARN_GAP);
        } else if (now - s.relearnAt >= RELEARN_GAP) {
          // друга правильна після розриву — перевчання завершено, далі рівень росте як звичайно
          s.relearn = false;
          s.relearnAt = undefined;
          s.b = nb;
          s.due = now + IV[nb];
        } else {
          // правильна раніше ніж через розрив — тримаємо стелю, чекаємо на рознесену спробу
          s.b = nb;
          s.due = now + IV[nb];
        }
      } else {
        s.b = nb;
        s.due = now + IV[nb];
      }
    }
  } else {
    s.w += (ms < FAST_ERROR ? 2 : 1);
    s.b = 0;
    s.due = now + IV[0];
    s.relearn = true;
    s.relearnAt = undefined;
  }
  return { state: s, fast, ok };
}

// Двокрокова картка (Wechselpräpositionen): крок 1 — Wo?/Wohin?, крок 2 — артикль.
// Обидва кроки оцінюються, час рахується окремо (різні пороги). Планувальник трактує
// картку як ціле: правильно = обидва кроки правильні, швидко = обидва в межах порогів.
// У стані зберігаємо ДІАГНОСТИКУ: errStep (де була помилка) і накопичувальні w1/w2 —
// step1 сигналить незнання правила (зміна локації), step2 — незнання таблиці артиклів.
export function gradeTwoStep(state, { ok1, ms1, ok2, ms2, mode, now }) {
  const fast1 = ms1 <= FAST_STEP1;
  const fast2 = ms2 <= FAST.twostep;
  const ok = ok1 && ok2;
  const fast = fast1 && fast2;
  // Штраф за вгадування рахуємо по ms кроку, що впав (раніший з невірних); якщо обидва вірні — не важливо.
  const penMs = !ok1 ? ms1 : (!ok2 ? ms2 : Math.max(ms1, ms2));
  const { state: s } = grade(state, { ok, ms: penMs, type: 'twostep', mode, now, fast });
  s.w1 = (s.w1 || 0) + (ok1 ? 0 : 1);
  s.w2 = (s.w2 || 0) + (ok2 ? 0 : 1);
  s.errStep = ok1 ? (ok2 ? null : 'step2') : (ok2 ? 'step1' : 'both');
  return { state: s, ok, fast, ok1, ok2, fast1, fast2 };
}

// Оцінити відповідь на слово-картку (градуйоване відтворення, тема wortschatz).
// Поверх `grade` (SRS-рівень/due/relearn) веде окрему СХОДИНКУ в стані:
//   `step` 0..2, `up` — підряд правильних-і-швидких, `down` — підряд помилок.
// Прапорці входу:
//   dontKnow    — кнопка «Не знаю»: учень не бачив слова. Жорсткіший за помилку —
//                 скидаємо і рівень (b=0), і сходинку (step=0). Не зараховується як правильне.
//   articleOnly — ввід: слово правильне, лише бракує/хибний артикль. Для SRS це помилка
//                 (серія рветься, b=0), АЛЕ сходинку вниз НЕ опускаємо (down не росте).
export function gradeWord(state, { ok, ms, step, mode, now, articleOnly, dontKnow }) {
  if (dontKnow) {
    const s = state ? { ...state } : freshCard(now);
    s.b = 0; s.due = now + IV[0]; s.relearn = true; s.relearnAt = undefined;
    s.step = 0; s.up = 0; s.down = 0;
    return { state: s, fast: false, ok: false };
  }
  // Поріг швидкості залежить від сходинки (вибір 4000 мс проти вводу 12000 мс).
  const { state: s, fast } = grade(state, { ok, ms, type: wordType(step), mode, now });
  s.step = s.step || 0; s.up = s.up || 0; s.down = s.down || 0;
  if (ok && fast) {
    s.up++; s.down = 0;
    if (s.up >= STEP_UP && s.step < MAXSTEP) { s.step++; s.up = 0; }  // підйом
  } else if (ok) {
    s.up = 0; s.down = 0;                       // правильно, але повільно — швидка серія рветься
  } else if (articleOnly) {
    s.up = 0;                                   // лише артикль — сходинку не чіпаємо (down без змін)
  } else {
    s.up = 0; s.down++;
    if (s.down >= STEP_DOWN && s.step > 0) { s.step--; s.down = 0; }  // спуск
  }
  return { state: s, fast, ok, articleOnly: !!articleOnly };
}

// Вибір наступної картки. `cards` — колода в порядку введення нових,
// `states` — мапа id → стан (лише введені картки мають стан).
// `newAllowed` — чи можна вводити НОВІ картки (false, коли тема вичерпала ліміт нових
// за сесію, напр. wortschatz: 10/сесію — інакше лексика завалює чергу граматичних тем).
// Повертає { card, isNew? } або null.
export function pick(cards, states, { mode, recent, now, rng = Math.random, newAllowed = true }) {
  const st = id => states[id];
  const intro = cards.filter(c => st(c.id));
  const recN = intro.length > 4 ? 6 : 1;
  const rec = recent.slice(-recN);
  const nr = c => !rec.includes(c.id);
  const byUrg = (a, b) => (st(a.id).b - st(b.id).b) || (st(a.id).due - st(b.id).due);

  // Перемежування — властивість ЖИВОЇ черги (і повторень, і введення нових карток). Пули,
  // що сортуються за (рівень, due), і масив введення нових не дивляться на відповідь, тож
  // однакові відповіді верталися пачками (серія 61 die у genus; 20+ sein у perfekt). Серед
  // кандидатів беремо першого, чия відповідь не дасть 3-ю підряд однакову; якщо різних немає —
  // лишаємо першого за порядком (рівень/due/послідовність теми не порушуємо без потреби).
  const answerOf = id => { const c = cards.find(x => x.id === id); return c && c.answer; };
  const last2 = recent.slice(-2).map(answerOf);
  const clustered = last2.length === 2 && last2[0] != null && last2[0] === last2[1];
  const pickNoRun = sorted =>
    (clustered && sorted.find(c => c.answer !== last2[0])) || sorted[0];

  if (mode === 'drill') {
    const pool = intro.filter(nr);
    if (!pool.length) return intro[0] ? { card: intro[0] } : null;
    let tot = 0;
    const w = pool.map(c => { const x = drillWeight(st(c.id)); tot += x; return x; });
    let r = rng() * tot;
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return { card: pool[i] }; }
    return { card: pool[pool.length - 1] };
  }

  // Режим «Навчання». Збираємо кандидатів у порядку пріоритету й одним проходом беремо
  // першого, чия відповідь не дасть 3-ю підряд однакову (pickNoRun). Збір у список (а не ранній
  // return з кожного пулу) робить перемежування НАСКРІЗНИМ між пулами: якщо весь пул прострочених
  // має однакову відповідь, а нова/рання картка — іншу, беремо її, а не тягнемо серію далі.
  // (Ранні return ламалися саме так: прострочені всі die → серія, хоча нова das була доступна.)
  const due = intro.filter(c => st(c.id).due <= now);
  const dueNr = due.filter(nr).sort(byUrg);
  const learning = intro.filter(c => st(c.id).b <= 2);
  // У ліміт «6 у роботі» relearn-картки не рахуємо: інакше вони забивають ліміт і блокують
  // введення нових, поки перевчання не почне зніматись (а це ≥ 10 хв).
  const working = learning.filter(c => !st(c.id).relearn);
  // Нові картки — у порядку масиву (послідовність задає тема). Серед невведених одразу беремо
  // ту, що не продовжить серію, щоб тема з однаковими відповідями підряд на початку масиву
  // (genus, perfekt) не давала довгої серії ще на етапі введення.
  const newPool = newAllowed ? cards.filter(c => !st(c.id)) : [];
  const nextNew = newPool.length ? pickNoRun(newPool) : null;
  const early = learning.filter(c => st(c.id).b <= 1 && nr(c) && !st(c.id).relearn).sort((a, b) => st(a.id).due - st(b.id).due);
  const b2 = learning.filter(nr).sort((a, b) => st(a.id).due - st(b.id).due);

  // Кандидати в порядку пріоритету (SPEC §3): 1 прострочені · 2 нова (якщо в роботі < 6) ·
  // 3 дострокове (рівень ≤ 1) · 4 нова (понад ліміт) · 5 найближча в роботі · запас — прострочені.
  const ordered = [];
  const seen = new Set();
  const add = (card, isNew) => {
    if (!card || seen.has(card.id)) return;
    seen.add(card.id);
    ordered.push(isNew ? { card, isNew: true } : { card });
  };
  dueNr.forEach(c => add(c));
  if (working.length < 6) add(nextNew, true);
  early.forEach(c => add(c));
  add(nextNew, true);
  b2.forEach(c => add(c));
  due.slice().sort(byUrg).forEach(c => add(c));   // запас: прострочені, вже без «крім останніх»

  if (!ordered.length) return null;
  // Наскрізне перемежування: перший кандидат з іншою відповіддю; якщо різних немає — найперший
  // (пріоритет/послідовність теми не порушуємо без потреби — лише щоб не дати 3-тю підряд).
  return (clustered && ordered.find(o => o.card.answer !== last2[0])) || ordered[0];
}
