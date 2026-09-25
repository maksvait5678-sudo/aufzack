// Панель «Як це працює» — пояснення для нового користувача. Спільна для хаба й екрана гри.
// Увесь текст — тут (мовний файл, UI українською); прапорець «відкривали» — у store (мета-ключ).

import * as store from '../engine/store.js';

// Мовний файл панелі: підпис кнопки, заголовок і розділи (без жаргону).
export const HELP = {
  button: 'Як це працює',
  title: 'Як це працює',
  items: [
    {
      h: 'Це тренажер, а не тест',
      p: 'Помилятися нормально і корисно: помилка запускає часте повторення саме того, що не засвоєно.'
    },
    {
      h: 'Помилки повертаються скоро',
      p: 'Картка, на якій ти помилився, повернеться скоро. Щоб вона пішла надовго, треба відповісти правильно двічі з перервою.'
    },
    {
      h: 'Важлива не лише правильність, а й швидкість',
      p: 'Якщо відповів правильно, але повільно, рівень не росте: ціль — щоб відповідь спадала без роздумів.'
    },
    {
      h: '«Навчання» і «Профілактика»',
      p: '«Навчання» веде тебе за розкладом повторень і додає нові картки. «Профілактика» — вільне тренування вже відкритих карток, для підтримки форми. Помилка в профілактиці повертає картку в основний розклад.'
    },
    {
      h: 'Карта засвоєння',
      p: 'Показує, які частини теми вже тримаються, а які ні. Кнопка «Підглянути таблицю» відкриває правильні відповіді — користуйся нею для вивчення, але не під час гри.'
    },
    {
      h: 'Збереження прогресу',
      p: 'Прогрес зберігається в цьому браузері. Якщо граєш з кількох пристроїв або чистиш дані — збережи код через «Зберегти прогрес».'
    }
  ]
};

let overlay = null;

function onKey(e) { if (e.key === 'Escape') closeHelp(); }

export function closeHelp() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  document.removeEventListener('keydown', onKey);
}

function openHelp() {
  closeHelp();
  overlay = document.createElement('div');
  overlay.className = 'help-overlay';
  overlay.innerHTML = `<div class="help-panel" role="dialog" aria-modal="true" aria-label="${HELP.title}">`
    + `<div class="help-head"><h2>${HELP.title}</h2><button class="help-x" type="button" aria-label="Закрити">✕</button></div>`
    + `<div class="help-body">${HELP.items.map(i => `<section><h3>${i.h}</h3><p>${i.p}</p></section>`).join('')}</div>`
    + `</div>`;
  document.body.appendChild(overlay);
  // Клік поза панеллю (по бекдропу) закриває; клік усередині — ні.
  overlay.addEventListener('click', e => { if (e.target === overlay) closeHelp(); });
  overlay.querySelector('.help-x').addEventListener('click', closeHelp);
  document.addEventListener('keydown', onKey);
  overlay.querySelector('.help-x').focus();
}

// Змонтувати кнопку «Як це працює» у контейнер. Поки панель не відкривали — позначка-крапка;
// після першого відкриття зникає назавжди (прапорець у store).
export function mountHelp(container) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'help-btn';
  const unseen = !store.helpSeen();
  if (unseen) btn.classList.add('attention');
  btn.innerHTML = `${HELP.button}${unseen ? '<span class="help-dot" aria-hidden="true"></span>' : ''}`;
  btn.addEventListener('click', () => {
    store.markHelpSeen();
    btn.classList.remove('attention');
    const dot = btn.querySelector('.help-dot');
    if (dot) dot.remove();
    openHelp();
  });
  container.appendChild(btn);
  return btn;
}
