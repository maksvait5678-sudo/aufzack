// Керування з клавіатури: цифри 1..N — вибір відповіді, Enter — перевірити/далі.
// Логіка збережена 1:1 з legacy.

export function bindKeyboard(handlers) {
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const cur = handlers.getCur();
    if (!cur) return;
    const c = cur.card;
    const answered = handlers.isAnswered();
    const answers = handlers.getAnswers();

    if (!answered && c.type !== 'grid' && e.key >= '1' && e.key <= String(answers.length)) {
      e.preventDefault();
      handlers.onChoose(answers[+e.key - 1]);
      return;
    }
    if (e.key === 'Enter') {
      const ae = document.activeElement;
      // Enter на клітинці ще не відповідженого grid — лишаємо перемикання клітинки.
      if (ae && ae.tagName === 'BUTTON' && !answered && c.type === 'grid' && ae.classList.contains('cell')) return;
      e.preventDefault();
      if (answered) handlers.onNext();
      else if (c.type === 'grid') handlers.onCheck();
    }
  });
}
