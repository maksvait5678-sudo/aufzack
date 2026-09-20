// Тема «Рід іменників»: іменник → der/die/das. Дані — у genus.data.js (для вчителя).
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

// Правила семантичні (не «рядок → рід»), щоб учень не зламався на der Baum, der Kuchen.
const SIGNAL_WHY = {
  ung: '-ung від дієслова (дія/процес) → die',
  heit: 'абстрактна якість на -heit → die',
  keit: 'абстрактна якість на -keit → die',
  schaft: '-schaft (спільнота/стан) → die',
  ion: 'інтернаціональне на -ion → die',
  e: 'ненаголошене -e (schwa) зазвичай die',
  in: 'назва особи жіночого роду на -in → die',
  er: 'дієслівна основа + -er (діяч або знаряддя) → der',
  ling: '-ling (особа/істота) → der',
  semder: 'день тижня, місяць або пора року → der',
  chen: 'зменшувальне на -chen → das',
  um: 'латинське запозичення на -um → das',
  zeug: '-zeug (засіб або знаряддя) → das'
};

// Рядки карти засвоєння: три сигнальні групи + «без сигналу».
const GROUPS = [
  { k: 'die-sig', label: 'die-сигнали', hint: '-ung -heit -keit -schaft -ion -e -in' },
  { k: 'der-sig', label: 'der-сигнали', hint: '-er -ling · дні/місяці/пори' },
  { k: 'das-sig', label: 'das-сигнали', hint: '-chen -um -zeug' },
  { k: 'none', label: 'без сигналу', hint: 'напам\'ять' }
];

const groupOf = s => s ? SIGNAL_GENDER[s] + '-sig' : 'none';

// why картки: сигнал (s або sq) → те саме правило; sx → «виняток»; інакше — напам'ять.
// sq не дає групи (немає s), тож у карті засвоєння слово лишається в «без сигналу».
const whyOf = d => {
  if (d.s) return SIGNAL_WHY[d.s];
  if (d.sq) return SIGNAL_WHY[d.sq];
  if (d.sx) return `Виняток із правила «-${d.sx} → ${SIGNAL_GENDER[d.sx]}»`;
  return 'Немає сигналу — цей рід треба запам\'ятати.';
};

// Метадані: слова з weak (n-Deklination) заблоковані в шаблонах із пропуском артикля,
// поки немає окремої теми про слабку відміну (SPEC).
export const blockedFromArticleGap = entry => !!entry.weak;

// Картки в порядку введення (як у даних). todo-слова у гру не потрапляють.
const cards = data.filter(d => !d.todo).map(d => ({
  id: `g-${d.w}`,
  type: 'choice',
  kind: 'Який рід?',
  prompt: d.w,
  answer: d.g,
  group: groupOf(d.s),
  cell: { row: groupOf(d.s), col: d.g },
  why: whyOf(d)
}));

// Лого теми — три пігулки родів (матеріал теми — самі der/die/das).
const logo = ['der', 'die', 'das']
  .map(a => `<span class="tl-pill" style="background:${COLORS[a]}">${a}</span>`).join('');

export default {
  id: 'genus',
  title: 'Рід іменників',
  subtitle: 'der, die, das',
  blurb: 'Без роду таблиця артиклів марна: знаєш, що Dativ feminin — der, але не знаєш, що Tür — feminin.',
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
