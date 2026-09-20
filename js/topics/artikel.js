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

// Питальні слова: слово (нім., зміст) + відмінок. Ключ why = сам ідентифікатор слова.
const QW = {
  wer: ['Wer?', 'nom'],
  wessen: ['Wessen?', 'gen'],
  wem: ['Wem?', 'dat'],
  wo: ['Wo?', 'dat'],
  wen: ['Wen?', 'akk'],
  wohin: ['Wohin?', 'akk']
};

// Речення з пропуском: { рід, текст (нім.), підказка-питання?, wk = ключ правила why }.
const SENT = {
  nom: [
    { g: 'm', text: '___ Hund bellt.', wk: 'nom_subject' },
    { g: 'f', text: '___ Lampe ist neu.', wk: 'nom_subject' },
    { g: 'n', text: '___ Fenster ist offen.', wk: 'nom_subject' },
    { g: 'p', text: '___ Kinder spielen.', wk: 'nom_subject' }
  ],
  akk: [
    { g: 'm', text: 'Ich sehe ___ Hund.', wk: 'sehen' },
    { g: 'f', text: 'Ich kaufe ___ Lampe.', wk: 'kaufen' },
    { g: 'n', text: 'Er öffnet ___ Fenster.', wk: 'oeffnen' },
    { g: 'p', text: 'Wir besuchen ___ Kinder.', wk: 'besuchen' },
    { g: 'm', text: 'Ich lege das Buch auf ___ Tisch.', ask: 'Wohin?', wk: 'legen' },
    { g: 'f', text: 'Sie hängt das Bild an ___ Wand.', ask: 'Wohin?', wk: 'haengen_wohin' }
  ],
  dat: [
    { g: 'm', text: 'Ich helfe ___ Mann.', wk: 'helfen' },
    { g: 'f', text: 'Er gibt ___ Frau eine Blume.', wk: 'geben' },
    { g: 'n', text: 'Wir spielen mit ___ Kind.', wk: 'mit' },
    { g: 'p', text: 'Ich danke ___ Kindern.', wk: 'danken' },
    { g: 'm', text: 'Das Buch liegt auf ___ Tisch.', ask: 'Wo?', wk: 'liegen' },
    { g: 'f', text: 'Das Bild hängt an ___ Wand.', ask: 'Wo?', wk: 'haengen_wo' }
  ],
  gen: [
    { g: 'm', text: 'Das Auto ___ Vaters ist rot.', wk: 'genitiv' },
    { g: 'f', text: 'Die Tasche ___ Mutter ist schwer.', wk: 'genitiv' },
    { g: 'n', text: 'Die Farbe ___ Hauses ist weiß.', wk: 'genitiv' },
    { g: 'p', text: 'Die Lehrerin ___ Kinder ist nett.', wk: 'genitiv' }
  ]
};

// Колода в порядку введення нових. Типи — контракт рендеру (SPEC §4).
const cards = [];
const caseLabel = k => CASES.find(c => c.k === k).label;

// Тексти (kind, why) — ключі в мовних файлах (js/i18n/), не літерали.
const KIND = { fwd: 'topics.artikel.kind.fwd', qst: 'topics.artikel.kind.qst', snt: 'topics.artikel.kind.snt', rev: 'topics.artikel.kind.rev' };

// choice: «Відмінок + рід» — показано назву відмінка.
const fwd = c => GENDERS.forEach(g => cards.push({
  id: `f-${c}-${g.k}`, type: 'choice', kind: KIND.fwd,
  prompt: caseLabel(c), answer: T[c][g.k], cell: { row: c, col: g.k }
}));

// choice: «Питання + рід» — показано питальне слово.
const qst = w => {
  const [word, c] = QW[w];
  GENDERS.forEach(g => cards.push({
    id: `q-${w}-${g.k}`, type: 'choice', kind: KIND.qst,
    prompt: word, ask: word, why: `topics.artikel.why.q.${w}`, answer: T[c][g.k], cell: { row: c, col: g.k }
  }));
};

// sentence: речення з пропуском.
const snt = c => SENT[c].forEach((s, i) => cards.push({
  id: `s-${c}-${i}`, type: 'sentence', kind: KIND.snt,
  prompt: s.text, ask: s.ask, why: `topics.artikel.why.s.${s.wk}`, answer: T[c][s.g], cell: { row: c, col: s.g }
}));

// grid: зворотна картка — показано артикль, позначити всі його клітинки.
const rev = a => {
  const cells = [];
  CASES.forEach(c => GENDERS.forEach(g => { if (T[c.k][g.k] === a) cells.push(c.k + '-' + g.k); }));
  cards.push({ id: `r-${a}`, type: 'grid', kind: KIND.rev, answer: a, cells });
};

fwd('nom'); qst('wer'); snt('nom');
fwd('akk'); qst('wen'); qst('wohin'); snt('akk'); rev('das'); rev('die');
fwd('dat'); qst('wem'); qst('wo'); snt('dat'); rev('dem'); rev('den');
fwd('gen'); qst('wessen'); snt('gen'); rev('des'); rev('der');

// Лого теми — зроблене з її ж матеріалу: слово + пігулки der/die/das у їхніх кольорах.
const logo = `<span class="tl-word">Artikel</span>` +
  ['der', 'die', 'das'].map(a => `<span class="tl-pill" style="background:${COLORS[a]}">${a}</span>`).join('');

export default {
  id: 'artikel',
  // Тексти (title/subtitle/blurb) — у мовних файлах під topics.artikel.*
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
