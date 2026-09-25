// Тема «Рід іменників»: іменник → der/die/das. Дані — у genus.data.js (для вчителя).
// Тексти (title/kind/why/мітки груп) — у мовних файлах під topics.genus.*
import data from './genus.data.js';

// Ті самі кольори, що й у таблиці артиклів (мнемоніка спільна: genus годує artikel).
const COLORS = { der: '#16C1E3', die: '#BDF45F', das: '#D3D6DE' };

// Сигнал → рід. -er і semder призначаються ВРУЧНУ (без орфографічного скану:
// Butter/Tier орфографічно на -er, але не девербальні); решта сигналів мають патерн.
export const SIGNAL_GENDER = {
  ung: 'die', heit: 'die', keit: 'die', schaft: 'die', ion: 'die', e: 'die', in: 'die',
  er: 'der', ling: 'der', semder: 'der',
  chen: 'das', um: 'das', zeug: 'das'
};

// Рядки карти засвоєння: три сигнальні групи + «без сигналу» (мітки — у lang).
const GROUPS = [{ k: 'die-sig' }, { k: 'der-sig' }, { k: 'das-sig' }, { k: 'none' }];

const groupOf = s => s ? SIGNAL_GENDER[s] + '-sig' : 'none';

// Ключ why: сигнал (s або sq) → те саме правило; sx → виняток; інакше — напам'ять.
// sq не дає групи (немає s), тож у карті засвоєння слово лишається в «без сигналу».
const whyKey = d => {
  if (d.s) return `topics.genus.why.${d.s}`;
  if (d.sq) return `topics.genus.why.${d.sq}`;
  if (d.sx) return `topics.genus.why.exc.${d.sx}`;
  return 'topics.genus.why.none';
};

// Метадані: слова з weak (n-Deklination) заблоковані в шаблонах із пропуском артикля,
// поки немає окремої теми про слабку відміну (SPEC).
export const blockedFromArticleGap = entry => !!entry.weak;

// Картки в порядку введення (як у даних). todo-слова у гру не потрапляють.
const cards = data.filter(d => !d.todo).map(d => ({
  id: `g-${d.w}`,
  type: 'choice',
  kind: 'topics.genus.kind',
  prompt: d.w,
  answer: d.g,
  group: groupOf(d.s),
  cell: { row: groupOf(d.s), col: d.g },
  why: whyKey(d)
}));

// Лого теми — три пігулки родів (матеріал теми — самі der/die/das).
const logo = ['der', 'die', 'das']
  .map(a => `<span class="tl-pill" style="background:${COLORS[a]}">${a}</span>`).join('');

export default {
  id: 'genus',
  // Тексти (title/subtitle/blurb/kind/why/groups) — у мовних файлах під topics.genus.*
  logo,
  showChip: false,            // рід і є відповіддю — не підказувати його чипом
  answers: ['der', 'die', 'das'],
  colors: COLORS,
  matrix: {
    rows: GROUPS,
    cols: [{ k: 'der', label: 'der' }, { k: 'die', label: 'die' }, { k: 'das', label: 'das' }],
    value: (row, col) => col   // клітинка карти = рід її колонки
  },
  cards
};
