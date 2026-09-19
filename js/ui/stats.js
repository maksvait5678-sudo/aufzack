// Чотири лічильники над карткою.

export function renderStats(els, topic, data, now = Date.now()) {
  const st = id => data.cards[id];
  const intro = topic.cards.filter(c => st(c.id));
  const due = intro.filter(c => st(c.id).due <= now).length;
  const notIntro = topic.cards.filter(c => !st(c.id)).length;

  els.due.textContent = due + notIntro;
  els.learned.textContent = `${intro.filter(c => st(c.id).b >= 3).length}/${topic.cards.length}`;
  els.streak.textContent = data.streak;
  els.best.textContent = data.best;
  const d = new Date(now).toDateString();
  els.today.textContent = data.today.d === d ? data.today.n : 0;
}
