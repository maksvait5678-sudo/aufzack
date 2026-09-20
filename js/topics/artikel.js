// Тема «Артиклі: der, die, das». Дані звірені з таблицею відмінювання
// означеного артикля; порядок карток = порядок введення нових.

const CASES = [
  { k: 'nom', label: 'Nominativ', hint: 'Wer? Was?' },
  { k: 'gen', label: 'Genitiv', hint: 'Wessen?' },
  { k: 'dat', label: 'Dativ', hint: 'Wem? Wo?' },
  { k: 'akk', label: 'Akkusativ', hint: 'Wen? Was? Wohin?' }
];
const GENDERS = [
  { k: 'm', label: 'maskulin' },
  { k: 'f', label: 'feminin' },
  { k: 'n', label: 'neutrum' },
  { k: 'p', label: 'plural' }
];

// Означений артикль за відмінком і родом.
const T = {
  nom: { m: 'der', f: 'die', n: 'das', p: 'die' },
  gen: { m: 'des', f: 'der', n: 'des', p: 'der' },
  dat: { m: 'dem', f: 'der', n: 'dem', p: 'den' },
  akk: { m: 'den', f: 'die', n: 'das', p: 'die' }
};

const ARTS = ['der', 'die', 'das', 'des', 'dem', 'den'];
const COLORS = { der: '#16C1E3', die: '#BDF45F', das: '#D3D6DE', des: '#FF6BCB', dem: '#FF6040', den: '#FFB957' };

// Питальні слова: слово, відмінок, правило (питання → відмінок).
const QW = {
  wer: ['Wer?', 'nom', 'Wer?/Was? питає про підмет → Nominativ'],
  wessen: ['Wessen?', 'gen', 'Wessen? — належність → Genitiv'],
  wem: ['Wem?', 'dat', 'Wem? — адресат/отримувач → Dativ'],
  wo: ['Wo?', 'dat', 'Wo? — місце без переходу межі → Dativ'],
  wen: ['Wen?', 'akk', 'Wen?/Was? — прямий додаток → Akkusativ'],
  wohin: ['Wohin?', 'akk', 'Wohin? — напрям, зміна місця → Akkusativ']
};

// Речення з пропуском: { рід, текст, підказка-питання?, правило? }.
const SENT = {
  nom: [
    { g: 'm', text: '___ Hund bellt.', why: 'Підмет речення → Nominativ' },
    { g: 'f', text: '___ Lampe ist neu.', why: 'Підмет речення → Nominativ' },
    { g: 'n', text: '___ Fenster ist offen.', why: 'Підмет речення → Nominativ' },
    { g: 'p', text: '___ Kinder spielen.', why: 'Підмет речення → Nominativ' }
  ],
  akk: [
    { g: 'm', text: 'Ich sehe ___ Hund.', why: 'sehen: прямий додаток → Akkusativ (Wen?)' },
    { g: 'f', text: 'Ich kaufe ___ Lampe.', why: 'kaufen: що купуємо → Akkusativ (Was?)' },
    { g: 'n', text: 'Er öffnet ___ Fenster.', why: 'öffnen: прямий додаток → Akkusativ (Was?)' },
    { g: 'p', text: 'Wir besuchen ___ Kinder.', why: 'besuchen: кого → Akkusativ (Wen?)' },
    { g: 'm', text: 'Ich lege das Buch auf ___ Tisch.', ask: 'Wohin?', why: 'legen — зміна місця. Wohin? → Akkusativ' },
    { g: 'f', text: 'Sie hängt das Bild an ___ Wand.', ask: 'Wohin?', why: 'hängen тут дія, напрям. Wohin? → Akkusativ' }
  ],
  dat: [
    { g: 'm', text: 'Ich helfe ___ Mann.', why: 'helfen керує Dativ (Wem?)' },
    { g: 'f', text: 'Er gibt ___ Frau eine Blume.', why: 'geben: адресат → Dativ (Wem?)' },
    { g: 'n', text: 'Wir spielen mit ___ Kind.', why: 'mit завжди Dativ' },
    { g: 'p', text: 'Ich danke ___ Kindern.', why: 'danken керує Dativ (Wem?)' },
    { g: 'm', text: 'Das Buch liegt auf ___ Tisch.', ask: 'Wo?', why: 'liegen — стан, місце. Wo? → Dativ' },
    { g: 'f', text: 'Das Bild hängt an ___ Wand.', ask: 'Wo?', why: 'hängen тут стан. Wo? → Dativ' }
  ],
  gen: [
    { g: 'm', text: 'Das Auto ___ Vaters ist rot.', why: 'Належність → Genitiv (Wessen?)' },
    { g: 'f', text: 'Die Tasche ___ Mutter ist schwer.', why: 'Належність → Genitiv (Wessen?)' },
    { g: 'n', text: 'Die Farbe ___ Hauses ist weiß.', why: 'Належність → Genitiv (Wessen?)' },
    { g: 'p', text: 'Die Lehrerin ___ Kinder ist nett.', why: 'Належність → Genitiv (Wessen?)' }
  ]
};

// Колода в порядку введення нових. Типи — контракт рендеру (SPEC §4).
const cards = [];
const caseLabel = k => CASES.find(c => c.k === k).label;

// choice: «Відмінок + рід» — показано назву відмінка.
const fwd = c => GENDERS.forEach(g => cards.push({
  id: `f-${c}-${g.k}`, type: 'choice', kind: 'Відмінок + рід',
  prompt: caseLabel(c), answer: T[c][g.k], cell: { row: c, col: g.k }
}));

// choice: «Питання + рід» — показано питальне слово.
const qst = w => {
  const [word, c, why] = QW[w];
  GENDERS.forEach(g => cards.push({
    id: `q-${w}-${g.k}`, type: 'choice', kind: 'Питання + рід',
    prompt: word, ask: word, why, answer: T[c][g.k], cell: { row: c, col: g.k }
  }));
};

// sentence: речення з пропуском.
const snt = c => SENT[c].forEach((s, i) => cards.push({
  id: `s-${c}-${i}`, type: 'sentence', kind: 'Встав артикль',
  prompt: s.text, ask: s.ask, why: s.why, answer: T[c][s.g], cell: { row: c, col: s.g }
}));

// grid: зворотна картка — показано артикль, позначити всі його клітинки.
const rev = a => {
  const cells = [];
  CASES.forEach(c => GENDERS.forEach(g => { if (T[c.k][g.k] === a) cells.push(c.k + '-' + g.k); }));
  cards.push({ id: `r-${a}`, type: 'grid', kind: 'Де стоїть це слово?', answer: a, cells });
};

fwd('nom'); qst('wer'); snt('nom');
fwd('akk'); qst('wen'); qst('wohin'); snt('akk'); rev('das'); rev('die');
fwd('dat'); qst('wem'); qst('wo'); snt('dat'); rev('dem'); rev('den');
fwd('gen'); qst('wessen'); snt('gen'); rev('des'); rev('der');

export default {
  id: 'artikel',
  title: 'Артиклі: der, die, das',
  subtitle: 'Відмінки і роди',
  blurb: 'Основа основ: рід і відмінок задають форму майже кожного слова в реченні.',
  brand: { word: 'Artikel', chips: ['der', 'die', 'das'] },
  answers: ARTS,
  colors: COLORS,
  matrix: {
    rows: CASES,
    cols: GENDERS,
    value: (row, col) => T[row][col]
  },
  cards
};
