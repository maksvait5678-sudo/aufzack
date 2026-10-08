// Дані теми «Perfekt» (минулий розмовний час) — винесені окремо, щоб їх міг перевірити
// вчитель (сторінка perfekt-review.html). Усі форми звірені з довідником; сумнівне
// позначається `todo: true` і в гру НЕ потрапляє (SPEC §12). Форми не вигадуються.
//
// Одиниця засвоєння — дієслово з двома навичками: (1) допоміжне haben/sein і (2) Partizip II.
// Тому кожне дієслово дає дві картки: вибір haben/sein (`choice`) і ввід Partizip II (`type`).
//
// Правило `why` пояснює МЕХАНІЗМ: не «gehen → gegangen», а «сильне дієслово, ge- + змінений
// корінь + -en». Мова: UK — бачить учень у грі; DE — для перевірки вчителем (review-сторінка).

// ── Групи формотворення Partizip II (рядки карти засвоєння) ───────────────────
// reg    правильне:       ge- + корінь + -t        (machen → gemacht)
// strong сильне:          ge- + змінений корінь+-en (gehen → gegangen) — напамʼять
// noge   без ge-:         -ieren (studiert) і невідокремлювані префікси (verstanden)
// sep    відокремлюване:  ge- всередину             (aufstehen → aufgestanden)
export const GROUPS = [
  { k: 'reg',    label: 'правильні',   hint: 'ge- + -t' },
  { k: 'strong', label: 'сильні',      hint: 'ge- + -en' },
  { k: 'noge',   label: 'без ge-',     hint: '-ieren, преф.' },
  { k: 'sep',    label: 'відокремл.',  hint: 'ge- всередині' }
];

// ── Карта засвоєння: один стовпець, кожен рядок — окрема навичка (SPEC §6) ────
// Форма Partizip НЕ залежить від допоміжного, тож два стовпці (формотворення ×
// haben/sein) показували б той самий маркер двічі — вдавали б два знання. Натомість
// один стовпець і 6 рядків: 4 типи формотворення Partizip + 2 рядки вибору допоміжного.
export const HEAT_COL = { k: 'x', label: 'правило' };
export const HEAT_ROWS = [
  ...GROUPS,                                                              // Partizip: 4 типи
  { k: 'aux_sein',  label: 'допом.: sein',  hint: 'рух / зміна стану' },  // haben/sein: вибір
  { k: 'aux_haben', label: 'допом.: haben', hint: 'дія без руху' }
];

// ── Дієслова ─────────────────────────────────────────────────────────────────
// `group`      — рядок карти (формотворення Partizip II).
// `aux`        — допоміжне дієслово (правильна відповідь картки haben/sein).
// `seinReason` — для sein-дієслів чому саме sein: 'move' рух зі зміною місця,
//                'change' зміна стану, 'special' sein/bleiben (виняток напамʼять).
// `pp`         — підтип правила Partizip II для `why`:
//                regt | regt_e (корінь на -t/-d) | strong | ieren | prefix | sep.
// `part`       — Partizip II (правильна відповідь type-картки). Жодна форма не вигадана.
// `ctx`        — короткий контекст у промпті картки haben/sein (для дієслів, що
//                допускають обидва допоміжні: фіксує рух → sein однозначно).
// `aux2`       — другий допустимий допоміжний (лише метадані для вчителя, не для гри).
// `todo`       — сумнівне/поза межами теми: у гру не йде.
//
// Дієслова — ті самі, що в praesens, плюс потрібні для щоденних розповідей (30–40 шт.).
export const VERBS = [
  // ── sein-дієслова (рух / зміна стану / виняток) ─────────────────────────────
  { inf: 'sein',       uk: 'бути',               group: 'strong', aux: 'sein', seinReason: 'special', pp: 'strong', part: 'gewesen' },
  { inf: 'bleiben',    uk: 'лишатися',           group: 'strong', aux: 'sein', seinReason: 'special', pp: 'strong', part: 'geblieben' },
  { inf: 'werden',     uk: 'ставати',            group: 'strong', aux: 'sein', seinReason: 'change',  pp: 'strong', part: 'geworden' },
  { inf: 'gehen',      uk: 'йти',                group: 'strong', aux: 'sein', seinReason: 'move',    pp: 'strong', part: 'gegangen' },
  { inf: 'kommen',     uk: 'приходити',          group: 'strong', aux: 'sein', seinReason: 'move',    pp: 'strong', part: 'gekommen' },
  { inf: 'fahren',     uk: 'їхати (кудись)',     group: 'strong', aux: 'sein', seinReason: 'move',    pp: 'strong', part: 'gefahren',
    ctx: 'nach Berlin fahren', aux2: 'haben',
    noteUk: 'Перехідне «ich habe das Auto gefahren» — з haben. Тут навчаємо рух зі зміною місця → sein (контекст у промпті).',
    noteDe: 'Transitiv „ich habe das Auto gefahren“ mit haben. Hier Bewegung mit Ortswechsel → sein (Kontext im Prompt).' },
  { inf: 'fliegen',    uk: 'летіти (кудись)',    group: 'strong', aux: 'sein', seinReason: 'move',    pp: 'strong', part: 'geflogen',
    ctx: 'nach Rom fliegen', aux2: 'haben',
    noteUk: 'Перехідне «er hat die Maschine geflogen» — з haben. Тут рух зі зміною місця → sein (контекст у промпті).',
    noteDe: 'Transitiv „er hat die Maschine geflogen“ mit haben. Hier Bewegung mit Ortswechsel → sein (Kontext im Prompt).' },
  { inf: 'reisen',     uk: 'подорожувати',       group: 'reg',    aux: 'sein', seinReason: 'move',    pp: 'regt',   part: 'gereist' },
  { inf: 'passieren',  uk: 'траплятися',         group: 'noge',   aux: 'sein', seinReason: 'change',  pp: 'ieren',  part: 'passiert' },
  { inf: 'aufstehen',  uk: 'вставати',           group: 'sep',    aux: 'sein', seinReason: 'change',  pp: 'sep',    part: 'aufgestanden' },
  { inf: 'einschlafen', uk: 'засинати',          group: 'sep',    aux: 'sein', seinReason: 'change',  pp: 'sep',    part: 'eingeschlafen' },
  { inf: 'ankommen',   uk: 'прибувати',          group: 'sep',    aux: 'sein', seinReason: 'move',    pp: 'sep',    part: 'angekommen' },

  // ── Правильні (haben): ge- + корінь + -t ────────────────────────────────────
  { inf: 'machen',     uk: 'робити',             group: 'reg', aux: 'haben', pp: 'regt',   part: 'gemacht' },
  { inf: 'wohnen',     uk: 'мешкати',            group: 'reg', aux: 'haben', pp: 'regt',   part: 'gewohnt' },
  { inf: 'lernen',     uk: 'вчити(ся)',          group: 'reg', aux: 'haben', pp: 'regt',   part: 'gelernt' },
  { inf: 'spielen',    uk: 'грати',              group: 'reg', aux: 'haben', pp: 'regt',   part: 'gespielt' },
  { inf: 'kaufen',     uk: 'купувати',           group: 'reg', aux: 'haben', pp: 'regt',   part: 'gekauft' },
  { inf: 'sagen',      uk: 'казати',             group: 'reg', aux: 'haben', pp: 'regt',   part: 'gesagt' },
  { inf: 'fragen',     uk: 'питати',             group: 'reg', aux: 'haben', pp: 'regt',   part: 'gefragt' },
  { inf: 'hören',      uk: 'чути, слухати',      group: 'reg', aux: 'haben', pp: 'regt',   part: 'gehört' },
  { inf: 'arbeiten',   uk: 'працювати',          group: 'reg', aux: 'haben', pp: 'regt_e', part: 'gearbeitet' },
  { inf: 'antworten',  uk: 'відповідати',        group: 'reg', aux: 'haben', pp: 'regt_e', part: 'geantwortet' },

  // ── Сильні (haben): ge- + змінений корінь + -en ─────────────────────────────
  { inf: 'essen',      uk: 'їсти',               group: 'strong', aux: 'haben', pp: 'strong', part: 'gegessen' },
  { inf: 'trinken',    uk: 'пити',               group: 'strong', aux: 'haben', pp: 'strong', part: 'getrunken' },
  { inf: 'lesen',      uk: 'читати',             group: 'strong', aux: 'haben', pp: 'strong', part: 'gelesen' },
  { inf: 'sehen',      uk: 'бачити',             group: 'strong', aux: 'haben', pp: 'strong', part: 'gesehen' },
  { inf: 'sprechen',   uk: 'говорити',           group: 'strong', aux: 'haben', pp: 'strong', part: 'gesprochen' },
  { inf: 'geben',      uk: 'давати',             group: 'strong', aux: 'haben', pp: 'strong', part: 'gegeben' },
  { inf: 'helfen',     uk: 'допомагати',         group: 'strong', aux: 'haben', pp: 'strong', part: 'geholfen' },
  { inf: 'nehmen',     uk: 'брати',              group: 'strong', aux: 'haben', pp: 'strong', part: 'genommen' },
  { inf: 'schreiben',  uk: 'писати',             group: 'strong', aux: 'haben', pp: 'strong', part: 'geschrieben' },
  { inf: 'tragen',     uk: 'нести, носити',      group: 'strong', aux: 'haben', pp: 'strong', part: 'getragen' },
  { inf: 'schlafen',   uk: 'спати',              group: 'strong', aux: 'haben', pp: 'strong', part: 'geschlafen' },
  { inf: 'finden',     uk: 'знаходити',          group: 'strong', aux: 'haben', pp: 'strong', part: 'gefunden' },

  // ── Без ge- (haben): -ieren і невідокремлювані префікси ──────────────────────
  { inf: 'studieren',  uk: 'навчатися (у ВНЗ)',  group: 'noge', aux: 'haben', pp: 'ieren',  part: 'studiert' },
  { inf: 'verstehen',  uk: 'розуміти',           group: 'noge', aux: 'haben', pp: 'prefix', part: 'verstanden' },
  { inf: 'bekommen',   uk: 'отримувати',         group: 'noge', aux: 'haben', pp: 'prefix', part: 'bekommen' },
  { inf: 'vergessen',  uk: 'забувати',           group: 'noge', aux: 'haben', pp: 'prefix', part: 'vergessen' },

  // ── Відокремлювані (haben): ge- всередину ───────────────────────────────────
  { inf: 'einkaufen',  uk: 'закуповуватися',     group: 'sep', aux: 'haben', pp: 'sep', part: 'eingekauft' },
  { inf: 'anrufen',    uk: 'телефонувати',       group: 'sep', aux: 'haben', pp: 'sep', part: 'angerufen' },

  // ── Поза межами теми (SPEC §12) ─────────────────────────────────────────────
  // Модальні в Perfekt утворюють подвійний інфінітив (Ich habe gehen müssen) або власний
  // Partizip (gekonnt/gemusst) лише без іншого дієслова — неоднозначно й це пізніша тема.
  { inf: 'können', uk: 'могти, вміти', group: 'strong', aux: 'haben', pp: 'strong', part: 'gekonnt', todo: true,
    noteUk: 'Perfekt модальних = подвійний інфінітив (Ich habe … können). Окрема пізніша тема.',
    noteDe: 'Perfekt der Modalverben = doppelter Infinitiv (Ich habe … können). Späteres Thema.' },
  { inf: 'müssen', uk: 'мусити',       group: 'strong', aux: 'haben', pp: 'strong', part: 'gemusst', todo: true,
    noteUk: 'Perfekt модальних = подвійний інфінітив. Окрема пізніша тема.',
    noteDe: 'Perfekt der Modalverben = doppelter Infinitiv. Späteres Thema.' },
  { inf: 'wollen', uk: 'хотіти',       group: 'strong', aux: 'haben', pp: 'strong', part: 'gewollt', todo: true,
    noteUk: 'Perfekt модальних = подвійний інфінітив. Окрема пізніша тема.',
    noteDe: 'Perfekt der Modalverben = doppelter Infinitiv. Späteres Thema.' },
  { inf: 'dürfen', uk: 'мати дозвіл',  group: 'strong', aux: 'haben', pp: 'strong', part: 'gedurft', todo: true,
    noteUk: 'Perfekt модальних = подвійний інфінітив. Окрема пізніша тема.',
    noteDe: 'Perfekt der Modalverben = doppelter Infinitiv. Späteres Thema.' },
  { inf: 'mögen',  uk: 'любити',       group: 'strong', aux: 'haben', pp: 'strong', part: 'gemocht', todo: true,
    noteUk: 'Perfekt модальних = подвійний інфінітив. Окрема пізніша тема.',
    noteDe: 'Perfekt der Modalverben = doppelter Infinitiv. Späteres Thema.' }
];

// ── Правило haben/sein (why картки вибору) ───────────────────────────────────
export const auxKey = v => (v.aux === 'sein' ? (v.seinReason || 'special') : 'haben');
const AUX_WHY_UK = {
  haben:   'Дія без зміни місця → допоміжне haben (більшість дієслів).',
  move:    'Рух зі зміною місця (кудись дістаємося) → sein.',
  change:  'Зміна стану (щось починається або переходить) → sein.',
  special: 'sein і bleiben беруть sein завжди — це не рух, а виняток напамʼять.'
};
const AUX_WHY_DE = {
  haben:   'Tätigkeit ohne Ortswechsel → Hilfsverb haben (die meisten Verben).',
  move:    'Bewegung mit Ortswechsel (irgendwohin) → sein.',
  change:  'Zustandsänderung (etwas beginnt oder geht über) → sein.',
  special: 'sein und bleiben nehmen immer sein — keine Bewegung, Ausnahme auswendig.'
};

// ── Правило Partizip II (why картки вводу) ────────────────────────────────────
const PP_WHY_UK = {
  regt:   'Правильне дієслово: ge- + корінь + -t (machen → gemacht).',
  regt_e: 'Корінь на -t/-d: ge- + корінь + -et (arbeiten → gearbeitet).',
  strong: 'Сильне дієслово: ge- + (часто змінений) корінь + -en. Напамʼять.',
  ieren:  'Дієслова на -ieren: Partizip без ge-, закінчення -iert (studieren → studiert).',
  prefix: 'Невідокремлюваний префікс (be-, er-, ver-, ent-, ge-, zer-, emp-): без ge-.',
  sep:    'Відокремлюваний префікс: ge- стає всередину, між префіксом і коренем (auf·ge·standen).'
};
const PP_WHY_DE = {
  regt:   'Regelmäßig: ge- + Stamm + -t (machen → gemacht).',
  regt_e: 'Stamm auf -t/-d: ge- + Stamm + -et (arbeiten → gearbeitet).',
  strong: 'Starkes Verb: ge- + (oft geänderter) Stamm + -en. Auswendig.',
  ieren:  'Verben auf -ieren: Partizip ohne ge-, Endung -iert (studieren → studiert).',
  prefix: 'Untrennbares Präfix (be-, er-, ver-, ent-, ge-, zer-, emp-): kein ge-.',
  sep:    'Trennbares Präfix: ge- kommt in die Mitte, zwischen Präfix und Stamm (auf·ge·standen).'
};

export const auxWhyFor = (v, lang) => (lang === 'de' ? AUX_WHY_DE : AUX_WHY_UK)[auxKey(v)];
export const ppWhyFor  = (v, lang) => (lang === 'de' ? PP_WHY_DE : PP_WHY_UK)[v.pp];

// ── Peek у карті засвоєння (matrix.value) ────────────────────────────────────
// Карта нейтральна (SPEC §6): кольорів немає (type/choice-тема). Абстрактний патерн уже
// стоїть у підписі рядка (hint), тож peek дає КОНКРЕТИКУ з даних теми, а не дублює патерн:
//   - рядки формотворення → 2-3 реальні приклади inf → Partizip;
//   - рядок «допом.: sein» → ПЕРЕЛІК усіх sein-дієслів теми (короткий, його треба знати
//     списком — це головна шпаргалка теми);
//   - рядок «допом.: haben» → «всі інші» (їх більшість, список марний).
const partOf = inf => (VERBS.find(v => v.inf === inf) || {}).part;
// Приклади формотворення — курований набір (форми беруться з даних, не вигадуються):
// по кілька дієслів на тип, що показують підтипи (plain + -et; -ieren + префікс; тощо).
const EX_INF = {
  reg:    ['machen', 'kaufen', 'arbeiten'],     // ge-…-t, зокрема -et після -t/-d
  strong: ['gehen', 'essen', 'sprechen'],       // ge-…-en зі зміною кореня
  noge:   ['studieren', 'verstehen', 'bekommen'], // -ieren і невідокремлювані префікси
  sep:    ['aufstehen', 'einkaufen', 'anrufen']   // ge- всередину
};
const SEIN_LIST = VERBS.filter(v => !v.todo && v.aux === 'sein').map(v => v.inf);

// Peek рендериться як HTML у клітинці (heat вставляє matrix.value як є, без екранування,
// як у satzbau). Один стовпець карти — клітинка широка, приклади/перелік вміщаються.
const peekBox = html => `<span style="font-size:.72rem;font-weight:500;color:var(--muted);white-space:normal;line-height:1.35;display:block;padding:3px 7px;text-align:left">${html}</span>`;
const exLines = infs => infs.map(inf => `${inf} → <b style="color:var(--ink);font-weight:700">${partOf(inf)}</b>`).join('<br>');
const ROW_PEEK = {
  reg:    peekBox(exLines(EX_INF.reg)),
  strong: peekBox(exLines(EX_INF.strong)),
  noge:   peekBox(exLines(EX_INF.noge)),
  sep:    peekBox(exLines(EX_INF.sep)),
  aux_sein:  peekBox(`<b style="color:var(--ink);font-weight:700">${SEIN_LIST.join(', ')}</b>`),
  aux_haben: peekBox('всі інші')
};
export const cellMark = rowK => ROW_PEEK[rowK];
