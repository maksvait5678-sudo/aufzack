// Чисте ядро інтервального повторення: без DOM і без Date.now() усередині.
// Час і випадковість приходять аргументами, щоб усе було детерміновано тестовним.

export const SEC = 1e3, MIN = 60e3, HOUR = 36e5, DAY = 864e5;

// Рівні 0..8. Інтервали до наступного повторення для кожного рівня.
// Рівні 0 і 1 однакові навмисно: після помилки картка повертається не миттєво.
export const IV = [MIN, MIN, 10 * MIN, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY, 80 * DAY];
export const MAXB = IV.length - 1;

// Ліміт «швидкої» відповіді за типом картки, мс.
export const FAST = { choice: 4000, sentence: 7000, grid: 12000, type: 12000 };

// Помилка швидша за це — радше вгадування: важчий штраф у вазі профілактики.
export const FAST_ERROR = 1200;
// Мінімальний розрив між двома правильними відповідями, щоб зняти relearn.
export const RELEARN_GAP = 10 * MIN;

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
export function grade(state, { ok, ms, type, mode, now }) {
  const s = state ? { ...state } : freshCard(now);
  const fast = ms <= FAST[type];
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

// Вибір наступної картки. `cards` — колода в порядку введення нових,
// `states` — мапа id → стан (лише введені картки мають стан).
// Повертає { card, isNew? } або null.
export function pick(cards, states, { mode, recent, now, rng = Math.random }) {
  const st = id => states[id];
  const intro = cards.filter(c => st(c.id));
  const recN = intro.length > 4 ? 6 : 1;
  const rec = recent.slice(-recN);
  const nr = c => !rec.includes(c.id);
  const byUrg = (a, b) => (st(a.id).b - st(b.id).b) || (st(a.id).due - st(b.id).due);

  if (mode === 'drill') {
    const pool = intro.filter(nr);
    if (!pool.length) return intro[0] ? { card: intro[0] } : null;
    let tot = 0;
    const w = pool.map(c => { const x = drillWeight(st(c.id)); tot += x; return x; });
    let r = rng() * tot;
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return { card: pool[i] }; }
    return { card: pool[pool.length - 1] };
  }

  // Режим «Навчання», по порядку пріоритету:
  // 1. Прострочені, крім останніх показаних; менший рівень → раніший due.
  const due = intro.filter(c => st(c.id).due <= now);
  const dueNr = due.filter(nr).sort(byUrg);
  if (dueNr.length) return { card: dueNr[0] };

  const learning = intro.filter(c => st(c.id).b <= 2);
  // У ліміт «6 у роботі» relearn-картки не рахуємо: інакше вони забивають ліміт і
  // блокують введення нових, поки перевчання не почне зніматись (а це ≥ 10 хв).
  const working = learning.filter(c => !st(c.id).relearn);
  const nextNew = cards.find(c => !st(c.id));
  // 2. Нова картка, якщо в роботі менше 6.
  if (nextNew && working.length < 6) return { card: nextNew, isNew: true };
  // 3. Дострокове повторення картки з рівнем ≤ 1, крім останніх показаних і крім relearn
  //    (дострокова поява ламала б 10-хвилинне рознесення relearn — глухий цикл без прогресу).
  const early = learning.filter(c => st(c.id).b <= 1 && nr(c) && !st(c.id).relearn).sort((a, b) => st(a.id).due - st(b.id).due);
  if (early.length) return { card: early[0] };
  // 4. Нова картка, навіть якщо ліміт у роботі перевищено.
  if (nextNew) return { card: nextNew, isNew: true };
  // 5. Найближча за due в роботі.
  const b2 = learning.filter(nr).sort((a, b) => st(a.id).due - st(b.id).due);
  if (b2.length) return { card: b2[0] };
  if (due.length) return { card: due.sort(byUrg)[0] };
  return null;
}
