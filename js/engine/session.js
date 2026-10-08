// Стан сесії навколо чистого ядра: колода, recent[], режим, поточна картка,
// а також прогрес рівня теми (streak/best/today). DOM тут відсутній.

import * as srs from './srs.js';
import * as store from './store.js';

export function createSession(topic) {
  const id = topic.id;
  const cards = topic.cards;

  let data = store.getTopic(id); // { cards, streak, best, today }
  let mode = 'learn';
  let recent = [];
  let cur = null;
  let shownAt = 0;
  let answered = false;
  // Скільки НОВИХ карток уведено в ЦІЙ сесії. Тема може обмежити (topic.maxNewPerSession:
  // wortschatz — 10), щоб лексика не завалювала чергу граматичних тем. Живе в сесії, не в прогресі.
  let newThisSession = 0;
  const maxNew = topic.maxNewPerSession;
  // Прапорець «підглядали в таблицю під час показу цієї картки». Живе в сесії, НЕ в
  // прогресі (не зберігається). Поки стоїть — відповідь на картку не змінює стан
  // (ні рівень, ні due, ні серію, ні лічильник дня): людина розбирається, не перевіряє
  // себе. Скидається лише при переході до наступної картки (next), не при закритті таблиці.
  let peeked = false;

  const st = cid => data.cards[cid];
  const persist = () => store.saveTopic(id, data);

  function pickNext(now = Date.now()) {
    const newAllowed = maxNew === undefined || newThisSession < maxNew;
    return srs.pick(cards, data.cards, { mode, recent, now, newAllowed });
  }

  function next(now = Date.now()) {
    cur = pickNext(now);
    if (cur && cur.isNew) newThisSession++;   // врахувати введену нову картку в ліміт сесії
    answered = false;
    peeked = false;      // нова картка — чистий прапорець підглядання
    shownAt = now;
    return cur;
  }

  // Позначити, що під час показу поточної картки відкрили таблицю. Діє лише до відповіді;
  // після відповіді картка вже «закрита», ретроактивно нічого не міняємо.
  function markPeeked() {
    if (cur && !answered) peeked = true;
  }

  // Сесійна «обслуга» будь-якої відповіді (і зарахованої, і ні): recent і прапорець answered.
  function markSeen(cardId) {
    recent.push(cardId);
    if (recent.length > 6) recent.shift();
    answered = true;
  }

  // Нарахування за відповідь: серія/рекорд, лічильник дня. Лише для зарахованих.
  function record(ok, cardId, now) {
    if (ok) {
      data.streak++;
      data.best = Math.max(data.best, data.streak);
    } else {
      data.streak = 0;
    }
    const d = new Date(now).toDateString();
    if (data.today.d !== d) data.today = { d, n: 0 };
    data.today.n++;
    markSeen(cardId);
  }

  // Оцінити відповідь на поточну картку. Повертає fast (чи була швидкою).
  // Підглядання: стан НЕ змінюємо (картка лишається як була), лише «закриваємо» її для UI.
  function answer(card, ok, ms, now = Date.now()) {
    if (peeked) { markSeen(card.id); return true; }
    const { state, fast } = srs.grade(st(card.id), { ok, ms, type: card.type, mode, now });
    data.cards[card.id] = state;
    record(ok, card.id, now);
    persist();
    return fast;
  }

  // Оцінити двокрокову картку (обидва кроки разом). Серія/розклад — за загальним вердиктом;
  // діагностика (errStep, w1/w2) осідає у стані картки. Повертає покроковий результат для UI.
  // Підглядання: стан НЕ змінюємо; повертаємо лише вердикт для показу (counted: false).
  function answerTwoStep(card, steps, now = Date.now()) {
    if (peeked) {
      markSeen(card.id);
      const ok = steps.ok1 && steps.ok2;
      return { ok, fast: true, fast2: true, counted: false };
    }
    const res = srs.gradeTwoStep(st(card.id), { ...steps, mode, now });
    data.cards[card.id] = res.state;
    record(res.ok, card.id, now);
    persist();
    return res;
  }

  // Оцінити слово-картку (градуйоване відтворення, тема wortschatz). `ok` і `articleOnly`
  // рахує викликач (знає мову поточної сходинки); сходинку рушій бере зі стану картки.
  // Підглядання: стан НЕ змінюємо, повертаємо лише вердикт для показу (counted:false).
  function answerWord(card, { ok, ms, articleOnly }, now = Date.now()) {
    if (peeked) { markSeen(card.id); return { ok, fast: true, articleOnly: !!articleOnly, counted: false }; }
    const prev = st(card.id);
    const step = (prev && prev.step) || 0;
    const res = srs.gradeWord(prev, { ok, ms, step, articleOnly, mode, now });
    data.cards[card.id] = res.state;
    record(res.ok, card.id, now);   // articleOnly/помилка → record(false): серія рветься
    persist();
    return { ok: res.ok, fast: res.fast, articleOnly: res.articleOnly, counted: true };
  }

  // Кнопка «Не знаю»: скидає картку на рівень 0 і першу сходинку, не зараховується.
  function dontKnow(card, now = Date.now()) {
    if (peeked) { markSeen(card.id); return { counted: false }; }
    const res = srs.gradeWord(st(card.id), { dontKnow: true, mode, now });
    data.cards[card.id] = res.state;
    record(false, card.id, now);
    persist();
    return { counted: true };
  }

  function setMode(m) {
    mode = m;
    // Профілактика недоступна, поки жодної картки не введено.
    if (m === 'drill' && !Object.keys(data.cards).length) mode = 'learn';
    return mode;
  }

  function reset() {
    data = store.resetTopic(id);
    recent = [];
    mode = 'learn';
    cur = null;
    answered = false;
    peeked = false;
    newThisSession = 0;
  }

  return {
    topic,
    get cards() { return cards; },
    get data() { return data; },
    get mode() { return mode; },
    get cur() { return cur; },
    get answered() { return answered; },
    get shownAt() { return shownAt; },
    get peeked() { return peeked; },
    stateOf: st,
    pickNext,
    next,
    markPeeked,
    answer,
    answerTwoStep,
    answerWord,
    dontKnow,
    setMode,
    reset
  };
}
