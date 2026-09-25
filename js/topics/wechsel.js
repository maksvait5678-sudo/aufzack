// Тема «Wechselpräpositionen (демо)»: двокрокова картка — спершу Wo?/Wohin?, потім артикль.
// Демонстрація механіки (§4 SPEC): повні дані прийдуть із темою прийменників.
// Правило формулюємо ТІЛЬКИ через зміну локації / перетин межі, ніколи «рух → Akkusativ»
// (Das Kind spielt auf der Straße — рух гри є, але межа не перетинається → Dativ).

// Означений артикль за відмінком і родом (лише dat/akk — виходи Wechsel).
const T = {
  dat: { m: 'dem', f: 'der', n: 'dem' },
  akk: { m: 'den', f: 'die', n: 'das' }
};
const CASES = [
  { k: 'dat', label: 'Dativ', hint: 'Wo? — місце' },
  { k: 'akk', label: 'Akkusativ', hint: 'Wohin? — напрям' }
];
const GENDERS = [{ k: 'm', label: 'maskulin' }, { k: 'f', label: 'feminin' }, { k: 'n', label: 'neutrum' }];

const ARTS = ['der', 'die', 'das', 'des', 'dem', 'den'];
const COLORS = { der: '#16C1E3', die: '#BDF45F', das: '#D3D6DE', des: '#FF6BCB', dem: '#FF6040', den: '#FFB957' };

const STEP1 = ['Wo?', 'Wohin?'];

// Дані демо: мінімальні пари (та сама фраза, різний відмінок), звірені форми, натуральні
// артиклі (без злитих im/ins — вони окрема фаза). g — рід іменника, c — відмінок (dat/akk).
const D = [
  { text: 'Das Kind läuft auf ___ Straße.', c: 'akk', g: 'f',
    why1: 'Дитина перетинає межу й опиняється на вулиці — зміна локації → Wohin (Akkusativ).' },
  { text: 'Das Kind spielt auf ___ Straße.', c: 'dat', g: 'f',
    why1: 'Гра відбувається на місці, межа не перетинається (рух є, але локація та сама) → Wo (Dativ).' },
  { text: 'Ich lege das Buch auf ___ Tisch.', c: 'akk', g: 'm',
    why1: 'Книга змінює місце — лягає на стіл (перетин межі) → Wohin (Akkusativ).' },
  { text: 'Das Buch liegt auf ___ Tisch.', c: 'dat', g: 'm',
    why1: 'Книга вже лежить, місце не змінюється → Wo (Dativ).' },
  { text: 'Die Katze springt auf ___ Sofa.', c: 'akk', g: 'n',
    why1: 'Кіт опиняється на дивані — зміна локації → Wohin (Akkusativ).' },
  { text: 'Die Katze schläft auf ___ Sofa.', c: 'dat', g: 'n',
    why1: 'Кіт спить на місці, локація не змінюється → Wo (Dativ).' }
];

const caseLabel = k => CASES.find(c => c.k === k).label;
const genderLabel = k => GENDERS.find(g => g.k === k).label;

const cards = D.map((d, i) => ({
  id: `w-${i}`,
  type: 'twostep',
  kind: 'Wo? чи Wohin? + артикль',
  prompt: d.text,
  step1: { options: STEP1, answer: d.c === 'akk' ? 'Wohin?' : 'Wo?', why: d.why1 },
  answer: T[d.c][d.g],
  cell: { row: d.c, col: d.g },
  why: `${caseLabel(d.c)} ${genderLabel(d.g)} → ${T[d.c][d.g]}`
}));

const logo = `<span class="tl-word">Wechsel</span>` +
  ['der', 'die', 'das'].map(a => `<span class="tl-pill" style="background:${COLORS[a]}">${a}</span>`).join('');

export default {
  id: 'wechsel',
  title: 'Wechselpräpositionen (демо)',
  subtitle: 'Wo? / Wohin?',
  blurb: 'Демо двокрокової картки: спершу Wo?/Wohin? (відмінок), потім артикль. Правило — через зміну локації, не «рух».',
  logo,
  answers: ARTS,
  colors: COLORS,
  matrix: {
    rows: CASES,
    cols: GENDERS,
    value: (row, col) => T[row][col]
  },
  cards
};
