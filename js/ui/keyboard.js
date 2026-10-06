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

    // Цифри — лише для карток з кнопками. grid і type вводяться інакше (клітинки / поле),
    // тож цифри там не перехоплюємо (інакше ламали б набір форми в type-полі).
    if (!answered && c.type !== 'grid' && c.type !== 'type' && e.key >= '1' && e.key <= String(answers.length)) {
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
      // Перевірка відповіді: grid (кнопка «Перевірити») і type (поле вводу, Enter/«Готово»).
      else if (c.type === 'grid' || c.type === 'type') handlers.onCheck();
    }
  });
}
