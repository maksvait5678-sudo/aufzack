// Тема «Рід іменників»: іменник → der/die/das. Дані — у genus.data.js (для вчителя).
import data from './genus.data.js';

// Ті самі кольори, що й у таблиці артиклів (мнемоніка спільна: genus годує artikel).
const COLORS = { der: '#16C1E3', die: '#BDF45F', das: '#D3D6DE' };

// Сигнал закінчення → рід і правило (показується як `why` після відповіді).
const SIGNALS = {
  ung: { g: 'die', why: '-ung завжди die' },
  heit: { g: 'die', why: '-heit завжди die' },
  keit: { g: 'die', why: '-keit завжди die' },
  schaft: { g: 'die', why: '-schaft завжди die' },
  ion: { g: 'die', why: '-ion завжди die' },
  er: { g: 'der', why: '-er (діяч або знаряддя) зазвичай der' },
  ling: { g: 'der', why: '-ling завжди der' },
  ismus: { g: 'der', why: '-ismus завжди der' },
  chen: { g: 'das', why: '-chen (зменшувальне) завжди das' },
  lein: { g: 'das', why: '-lein (зменшувальне) завжди das' },
  um: { g: 'das', why: '-um завжди das' }
};

// Рядки карти засвоєння: три сигнальні групи + «без сигналу» (найбільша).
const GROUPS = [
  { k: 'die-sig', label: 'die-сигнали', hint: '-ung -heit -keit -schaft -ion' },
  { k: 'der-sig', label: 'der-сигнали', hint: '-er -ling -ismus' },
  { k: 'das-sig', label: 'das-сигнали', hint: '-chen -lein -um' },
  { k: 'none', label: 'без сигналу', hint: 'напам\'ять' }
];

const groupOf = s => s ? SIGNALS[s].g + '-sig' : 'none';
const whyOf = s => s ? SIGNALS[s].why : 'Немає сигналу — цей рід треба запам\'ятати.';

// Картки в порядку введення: спершу групи з сигналом, потім «без сигналу» (як у даних).
// todo-слова у гру не потрапляють.
const cards = data.filter(d => !d.todo).map(d => ({
  id: `g-${d.w}`,
  type: 'choice',
  kind: 'Який рід?',
  prompt: d.w,
  answer: d.g,
  group: groupOf(d.s),
  cell: { row: groupOf(d.s), col: d.g },
  why: whyOf(d.s)
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
