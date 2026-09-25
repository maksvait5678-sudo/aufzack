// Інтернаціоналізація: t(key, vars), вибір мови зі store (default uk),
// заповнення [data-i18n] у HTML і <html lang>. Нову мову додають одним рядком у LANGS.
import * as store from '../engine/store.js';
import uk from './uk.js';

const LANGS = { uk };
export const DEFAULT_LANG = 'uk';

let current = DEFAULT_LANG;
let dict = uk;

// Прочитати мову зі store, застосувати словник і <html lang>. Викликати на старті сторінки.
export function initLang() {
  const l = store.getLang();
  current = LANGS[l] ? l : DEFAULT_LANG;
  dict = LANGS[current];
  if (typeof document !== 'undefined') document.documentElement.lang = current;
  return current;
}

export function getLangCode() { return current; }
export function availableLangs() { return Object.keys(LANGS); }

// Зберегти вибір мови (застосується після перезавантаження, як і імпорт прогресу).
export function setLang(l) {
  if (!LANGS[l]) return false;
  store.setLang(l);
  return true;
}

function lookup(path) {
  return String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

// Переклад за ключем-шляхом. Якщо ключа немає — повертаємо сам ключ (видно прогалину).
// {var} у рядку замінюється значеннями з vars.
export function t(key, vars) {
  let s = lookup(key);
  if (typeof s !== 'string') return key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}

// Заповнити атрибути з DOM: text для [data-i18n], а також aria-label/placeholder/title.
export function applyDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'))); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.setAttribute('title', t(el.getAttribute('data-i18n-title'))); });
}
