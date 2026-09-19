// localStorage: формат v:2, багато тем, одноразова міграція зі старого ключа.
// {
//   v: 2,
//   topics: { artikel: { cards, streak, best, today } },
//   updatedAt
// }

const KEY = 'deutsch-drill';
const OLD_KEY_ARTIKEL = 'artikel-srs-v1';
export const VERSION = 2;

export function freshTopic() {
  return { cards: {}, streak: 0, best: 0, today: { d: '', n: 0 } };
}
function freshAll() {
  return { v: VERSION, topics: {}, updatedAt: 0 };
}

function readRaw() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
}

// Перенести старий ключ artikel-srs-v1 у topics.artikel. Старий ключ НЕ видаляємо.
// Повертає true, якщо міграція справді щось перенесла.
function migrateOld(all) {
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY_ARTIKEL));
    if (old && old.v === 1) {
      all.topics.artikel = {
        cards: old.cards || {},
        streak: old.streak || 0,
        best: old.best || 0,
        today: old.today || { d: '', n: 0 }
      };
      all.updatedAt = old.updatedAt || Date.now();
      return true;
    }
  } catch (e) { /* старого прогресу немає або він битий — ігноруємо */ }
  return false;
}

let state = null;

export function load() {
  if (state) return state;
  const raw = readRaw();
  if (raw && raw.v === VERSION) { state = raw; return state; }
  // Формату v:2 ще немає — створюємо і підтягуємо старий прогрес.
  state = freshAll();
  // Мігрований прогрес одразу закріплюємо в новому ключі, щоб він не залежав
  // від старого ключа (SPEC §7: прогрес не повинен губитися).
  if (migrateOld(state)) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* квота */ }
  }
  return state;
}

export function getTopic(id) {
  const all = load();
  return all.topics[id] || freshTopic();
}

export function saveTopic(id, data) {
  const all = load();
  all.topics[id] = data;
  all.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* квота/приватний режим */ }
}

export function resetTopic(id) {
  saveTopic(id, freshTopic());
  return getTopic(id);
}

// Експорт усього прогресу одним base64-кодом (заміна прибраної хмарної синхронізації).
export function exportCode() {
  const all = load();
  return btoa(unescape(encodeURIComponent(JSON.stringify(all))));
}

// Імпорт коду. Валідуємо перед записом; при помилці наявний прогрес не чіпаємо.
export function importCode(code) {
  let obj;
  try {
    obj = JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
  } catch (e) {
    throw new Error('Код пошкоджено або порожній.');
  }
  if (!obj || obj.v !== VERSION || typeof obj.topics !== 'object') {
    throw new Error('Несумісний код прогресу.');
  }
  state = obj;
  try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) { /* квота */ }
  return obj;
}
