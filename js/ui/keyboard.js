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
    // Ввід тексту: type, а також слово-картка на сходинці 2 (питає сам контролер).
    const text = handlers.isTextEntry && handlers.isTextEntry();

    // Конструктор (order): цифри додають N-те слово з розсипу, Backspace знімає останнє.
    if (!answered && c.type === 'order') {
      if (e.key >= '1' && e.key <= '9') { e.preventDefault(); handlers.onPlaceIndex(+e.key - 1); return; }
      if (e.key === 'Backspace') { e.preventDefault(); handlers.onUnplaceLast(); return; }
    }
    // Цифри — лише для карток з кнопками. grid/order і будь-який ввід тексту вводяться інакше.
    if (!answered && !text && c.type !== 'grid' && c.type !== 'order' && e.key >= '1' && e.key <= String(answers.length)) {
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
      // Перевірка: grid (кнопка), order (складений рядок), будь-який ввід тексту (поле).
      else if (text || c.type === 'grid' || c.type === 'order') handlers.onCheck();
    }
  });
}
