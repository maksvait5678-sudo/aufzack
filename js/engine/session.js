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

  const st = cid => data.cards[cid];
  const persist = () => store.saveTopic(id, data);

  function pickNext(now = Date.now()) {
    return srs.pick(cards, data.cards, { mode, recent, now });
  }

  function next(now = Date.now()) {
    cur = pickNext(now);
    answered = false;
    shownAt = now;
    return cur;
  }

  // Спільне для всіх типів відповідей: серія/рекорд, лічильник дня, recent, прапорець.
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
    recent.push(cardId);
    if (recent.length > 6) recent.shift();
    answered = true;
  }

  // Оцінити відповідь на поточну картку. Повертає fast (чи була швидкою).
  function answer(card, ok, ms, now = Date.now()) {
    const { state, fast } = srs.grade(st(card.id), { ok, ms, type: card.type, mode, now });
    data.cards[card.id] = state;
    record(ok, card.id, now);
    persist();
    return fast;
  }

  // Оцінити двокрокову картку (обидва кроки разом). Серія/розклад — за загальним вердиктом;
  // діагностика (errStep, w1/w2) осідає у стані картки. Повертає покроковий результат для UI.
  function answerTwoStep(card, steps, now = Date.now()) {
    const res = srs.gradeTwoStep(st(card.id), { ...steps, mode, now });
    data.cards[card.id] = res.state;
    record(res.ok, card.id, now);
    persist();
    return res;
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
  }

  return {
    topic,
    get cards() { return cards; },
    get data() { return data; },
    get mode() { return mode; },
    get cur() { return cur; },
    get answered() { return answered; },
    get shownAt() { return shownAt; },
    stateOf: st,
    pickNext,
    next,
    answer,
    answerTwoStep,
    setMode,
    reset
  };
}
