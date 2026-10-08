// Тема «Wortschatz» — базова лексика рівня A1. Дані (усі слова) — у wortschatz.data.js
// (для вчителя, сторінка wortschatz-review.html).
//
// ГРАДУЙОВАНЕ ВІДТВОРЕННЯ — суть теми. Одне слово = ОДНА картка (type: 'word'), чий вигляд
// залежить від СХОДИНКИ, що зберігається у стані картки (srs: step/up/down):
//   0 нім→укр, вибір з 4 (впізнавання)
//   1 укр→нім, вибір з 4 (згадування з опорою)
//   2 укр→нім, ввід тексту (вільне згадування)
// Підйом — 3 правильні-і-швидкі підряд; спуск — 3 помилки підряд (логіка в srs.gradeWord).
// Дистрактори — зі слів ТІЄЇ Ж частини мови, щоб відповідь не вгадувалася за формою.
//
// Картка несе не фіксований рендер, а слово; конкретний вигляд дає `view(card, step)`.
// Контролер бере правильну відповідь через `answerFor`, а ввід перевіряє `checkInput`
// (для іменника розрізняє «інше слово» і «слово правильне, лише бракує артикля»).
//
// Карта засвоєння (SPEC §6): частини мови × сходинка, кумулятивна (heatReach). Нейтральна.
import { POS, STEPS, WORDS, ARTICLES } from './wortschatz.data.js';
import { normType, typeMatches } from '../engine/srs.js';

const KIND = { noun: 'Іменник', verb: 'Дієслово', adj: 'Прикметник', adv: 'Прислівник', q: 'Питальне слово' };

const play = WORDS.filter(w => !w.todo);

// Стабільний id зі слова (латиниця/цифри; умлаути й пробіли → дефіс).
const slug = de => de.toLowerCase().replace(/[äöü]/g, m => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }[m])).replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const cards = play.map(w => ({
  id: `ws-${slug(w.de)}`,
  type: 'word',
  kind: KIND[w.pos],
  pos: w.pos,
  de: w.de,
  uk: w.uk,
  alt: w.alt || null,
  accept: w.accept || null,
  answer: w.de            // стабільний унікальний ключ для анти-кластера рушія
}));

// Пул дистракторів за частиною мови (той самий `pos`), щоб вибір не вгадувався за формою.
const byPos = {};
for (const c of cards) (byPos[c.pos] = byPos[c.pos] || []).push(c);

// Відділити артикль від іменника: «der Tisch» → «Tisch». Для не-іменників — як є.
function stripArticle(de) {
  const m = de.match(/^(\S+)\s+(.+)$/);
  return (m && ARTICLES.includes(m[1])) ? m[2] : de;
}

// Три дистрактори зі слів того ж pos (поле `field`: 'uk' на сходинці 0, 'de' на 1),
// плюс правильна відповідь; перемішано. Відсіюємо збіги значення з правильним.
function options(card, field, rng = Math.random) {
  const correct = card[field];
  const pool = (byPos[card.pos] || []).filter(c => c !== card && c[field] !== correct);
  // Фішер-Єйтс на копії, беремо 3.
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const opts = [correct, ...pool.slice(0, 3).map(c => c[field])];
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return opts;
}

// Правильна відповідь для сходинки: 0 — українське значення, 1/2 — німецьке слово.
function answerFor(card, step) {
  return step === 0 ? card.uk : card.de;
}

// Вигляд картки на сходинці (для рендеру). mode: 'choice' | 'input'.
function view(card, step, rng = Math.random) {
  if (step === 0) return { mode: 'choice', prompt: card.de, promptLang: 'de', cue: 'обери переклад', options: options(card, 'uk', rng) };
  if (step === 1) return { mode: 'choice', prompt: card.uk, promptLang: 'uk', cue: 'обери німецькою', options: options(card, 'de', rng) };
  return { mode: 'input', prompt: card.uk, promptLang: 'uk', cue: 'напиши німецькою (іменник — з артиклем)' };
}

// Перевірка вводу (сходинка 2). Три результати:
//   { ok:true }                 — повний збіг (для іменника — разом з артиклем);
//   { ok:false, articleOnly:true } — іменник: слово правильне, лише бракує/хибний артикль;
//   { ok:false }                — інше слово (справжня помилка).
function checkInput(card, raw) {
  const forms = [card.de, ...(card.accept || [])];
  if (forms.some(f => typeMatches(raw, f))) return { ok: true, articleOnly: false };
  if (card.pos === 'noun') {
    const bare = forms.map(stripArticle);
    if (bare.some(f => typeMatches(raw, f)) && normType(raw) !== '') return { ok: false, articleOnly: true };
  }
  return { ok: false, articleOnly: false };
}

// Знак теми з її матеріалу — трійка нейтральних пігулок (нім ↔ укр).
const logo = `<span class="tl-word">Wortschatz</span>`
  + ['de', 'uk', 'A1'].map(w =>
      `<span class="tl-pill" style="background:var(--surface2);color:var(--ink);border:1px solid var(--line)">${w}</span>`
    ).join('');

export default {
  id: 'wortschatz',
  title: 'Wortschatz: базова лексика',
  subtitle: 'Частотні слова A1',
  blurb: 'Базова лексика рівня A1 з градуйованим відтворенням: кожне слово росте від упізнавання (вибір) до вільного згадування (ввід). Іменники — завжди з артиклем.',
  logo,
  answers: [],               // кнопки несе кожна картка окремо (дистрактори зі слів того ж pos)
  colors: {},                // карта засвоєння нейтральна (без кольорів відповідей)
  showChip: false,           // чип-рід тут не має сенсу
  maxNewPerSession: 10,      // не більше 10 нових слів за сесію (SPEC: щоб не завалити граматику)
  heatReach: true,           // карта кумулятивна: клітинка (pos × сходинка) — частка слів, що її досягли
  matrix: {
    rows: POS,
    cols: STEPS,
    value: () => ''          // нейтральна карта: нічого не підсвічуємо навіть у peek
  },
  cards,
  // Capability-хуки для спільного UI (render/keyboard), без перевірок на id теми:
  view,
  answerFor,
  checkInput
};
