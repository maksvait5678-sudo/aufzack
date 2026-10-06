// Дані теми «Präsens» (відмінювання дієслів у теперішньому часі) — винесені окремо,
// щоб їх міг перевірити вчитель (сторінка praesens-review.html). Усі форми звірені з
// довідником дієвідмінювання; сумнівне позначається `todo: true` і в гру НЕ потрапляє
// (SPEC §12). Форми не вигадуються.
//
// Мова правил: `whyFor` — українською (це бачить учень у грі); `whyDeFor` — німецькою
// для перевірки вчителем (review-сторінка), у грі не використовуються. `why` пояснює
// МЕХАНІЗМ (напр. «a→ä у du і er формах»), а не конкретне відображення form.
//
// Тип картки — `type` (ввід форми): варіантів забагато, вибір тут не тренує. Порівняння
// без регістру, умлаути приймаються і як ae/oe/ue/ss — але лише там, де в правильній
// формі справді є умлаут (srs.normType РОЗГОРТАЄ умлаути, не згортає: faehrst ✓, fahrst ✗).

// ── Особи (рядки карти засвоєння) ────────────────────────────────────────────
export const PERSONS = [
  { k: 'ich', label: 'ich',        hint: 'я' },
  { k: 'du',  label: 'du',         hint: 'ти' },
  { k: 'er',  label: 'er/sie/es',  hint: 'він/вона/воно' },
  { k: 'wir', label: 'wir',        hint: 'ми' },
  { k: 'ihr', label: 'ihr',        hint: 'ви' },
  { k: 'sie', label: 'sie/Sie',    hint: 'вони / Ви' }
];

// ── Групи дієслів (колонки карти засвоєння) ──────────────────────────────────
// sein і haben — окремими колонками: найважливіші нерегулярні, у кожному реченні.
export const GROUPS = [
  { k: 'sein',  label: 'sein' },
  { k: 'haben', label: 'haben' },
  { k: 'reg',   label: 'правильні' },
  { k: 'ae',    label: 'a→ä' },
  { k: 'ei',    label: 'e→i' },
  { k: 'eie',   label: 'e→ie' },
  { k: 'modal', label: 'модальні' }
];

// ── Дієслова ─────────────────────────────────────────────────────────────────
// `group` — колонка карти (одна з GROUPS). `sub` — тонший підтип для правила `why`:
//   plain  звичайне правильне            (machen)
//   e      корінь на -t/-d, вставка -e-  (arbeiten, finden)
//   ss     корінь на -s/-ß/-z, du лише -t (heißen)
//   ae/ei/eie/modal/sein/haben — як група.
// `forms` — усі 6 форм у ключах PERSONS. Жодна не вигадана; усі звірені.
export const VERBS = [
  // Блок 1 — sein, haben (окремо, першими).
  { inf: 'sein',  uk: 'бути',            group: 'sein',  sub: 'sein',
    forms: { ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind' } },
  { inf: 'haben', uk: 'мати',            group: 'haben', sub: 'haben',
    forms: { ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben' } },

  // Блок 2 — правильні дієслова.
  { inf: 'machen',   uk: 'робити',       group: 'reg', sub: 'plain',
    forms: { ich: 'mache', du: 'machst', er: 'macht', wir: 'machen', ihr: 'macht', sie: 'machen' } },
  { inf: 'wohnen',   uk: 'мешкати',      group: 'reg', sub: 'plain',
    forms: { ich: 'wohne', du: 'wohnst', er: 'wohnt', wir: 'wohnen', ihr: 'wohnt', sie: 'wohnen' } },
  { inf: 'lernen',   uk: 'вчити(ся)',    group: 'reg', sub: 'plain',
    forms: { ich: 'lerne', du: 'lernst', er: 'lernt', wir: 'lernen', ihr: 'lernt', sie: 'lernen' } },
  { inf: 'kommen',   uk: 'приходити',    group: 'reg', sub: 'plain',
    forms: { ich: 'komme', du: 'kommst', er: 'kommt', wir: 'kommen', ihr: 'kommt', sie: 'kommen' } },
  { inf: 'gehen',    uk: 'йти',          group: 'reg', sub: 'plain',
    forms: { ich: 'gehe', du: 'gehst', er: 'geht', wir: 'gehen', ihr: 'geht', sie: 'gehen' } },
  { inf: 'spielen',  uk: 'грати',        group: 'reg', sub: 'plain',
    forms: { ich: 'spiele', du: 'spielst', er: 'spielt', wir: 'spielen', ihr: 'spielt', sie: 'spielen' } },
  { inf: 'arbeiten', uk: 'працювати',    group: 'reg', sub: 'e',
    forms: { ich: 'arbeite', du: 'arbeitest', er: 'arbeitet', wir: 'arbeiten', ihr: 'arbeitet', sie: 'arbeiten' } },
  { inf: 'finden',   uk: 'знаходити',    group: 'reg', sub: 'e',
    forms: { ich: 'finde', du: 'findest', er: 'findet', wir: 'finden', ihr: 'findet', sie: 'finden' } },
  { inf: 'heißen',   uk: 'зватися',      group: 'reg', sub: 'ss',
    forms: { ich: 'heiße', du: 'heißt', er: 'heißt', wir: 'heißen', ihr: 'heißt', sie: 'heißen' } },

  // Блок 3 — зміна кореневої голосної (лише du і er форми).
  { inf: 'fahren',   uk: 'їхати',        group: 'ae', sub: 'ae',
    forms: { ich: 'fahre', du: 'fährst', er: 'fährt', wir: 'fahren', ihr: 'fahrt', sie: 'fahren' } },
  { inf: 'schlafen', uk: 'спати',        group: 'ae', sub: 'ae',
    forms: { ich: 'schlafe', du: 'schläfst', er: 'schläft', wir: 'schlafen', ihr: 'schlaft', sie: 'schlafen' } },
  { inf: 'tragen',   uk: 'нести, носити', group: 'ae', sub: 'ae',
    forms: { ich: 'trage', du: 'trägst', er: 'trägt', wir: 'tragen', ihr: 'tragt', sie: 'tragen' } },
  { inf: 'waschen',  uk: 'мити',         group: 'ae', sub: 'ae',
    forms: { ich: 'wasche', du: 'wäschst', er: 'wäscht', wir: 'waschen', ihr: 'wascht', sie: 'waschen' } },
  { inf: 'halten',   uk: 'тримати',      group: 'ae', sub: 'ae',
    forms: { ich: 'halte', du: 'hältst', er: 'hält', wir: 'halten', ihr: 'haltet', sie: 'halten' } },
  { inf: 'sprechen', uk: 'говорити',     group: 'ei', sub: 'ei',
    forms: { ich: 'spreche', du: 'sprichst', er: 'spricht', wir: 'sprechen', ihr: 'sprecht', sie: 'sprechen' } },
  { inf: 'essen',    uk: 'їсти',         group: 'ei', sub: 'ei',
    forms: { ich: 'esse', du: 'isst', er: 'isst', wir: 'essen', ihr: 'esst', sie: 'essen' } },
  { inf: 'geben',    uk: 'давати',       group: 'ei', sub: 'ei',
    forms: { ich: 'gebe', du: 'gibst', er: 'gibt', wir: 'geben', ihr: 'gebt', sie: 'geben' } },
  { inf: 'helfen',   uk: 'допомагати',   group: 'ei', sub: 'ei',
    forms: { ich: 'helfe', du: 'hilfst', er: 'hilft', wir: 'helfen', ihr: 'helft', sie: 'helfen' } },
  { inf: 'sehen',    uk: 'бачити',       group: 'eie', sub: 'eie',
    forms: { ich: 'sehe', du: 'siehst', er: 'sieht', wir: 'sehen', ihr: 'seht', sie: 'sehen' } },
  { inf: 'lesen',    uk: 'читати',       group: 'eie', sub: 'eie',
    forms: { ich: 'lese', du: 'liest', er: 'liest', wir: 'lesen', ihr: 'lest', sie: 'lesen' } },

  // Блок 4 — модальні (ich і er — без закінчення; в однині особливий корінь).
  { inf: 'können', uk: 'могти, вміти',   group: 'modal', sub: 'modal',
    forms: { ich: 'kann', du: 'kannst', er: 'kann', wir: 'können', ihr: 'könnt', sie: 'können' } },
  { inf: 'müssen', uk: 'мусити',         group: 'modal', sub: 'modal',
    forms: { ich: 'muss', du: 'musst', er: 'muss', wir: 'müssen', ihr: 'müsst', sie: 'müssen' } },
  { inf: 'wollen', uk: 'хотіти',         group: 'modal', sub: 'modal',
    forms: { ich: 'will', du: 'willst', er: 'will', wir: 'wollen', ihr: 'wollt', sie: 'wollen' } },
  { inf: 'dürfen', uk: 'мати дозвіл',    group: 'modal', sub: 'modal',
    forms: { ich: 'darf', du: 'darfst', er: 'darf', wir: 'dürfen', ihr: 'dürft', sie: 'dürfen' } },
  { inf: 'mögen',  uk: 'любити',         group: 'modal', sub: 'modal',
    forms: { ich: 'mag', du: 'magst', er: 'mag', wir: 'mögen', ihr: 'mögt', sie: 'mögen' } }
];

// ── Правило (why) за підтипом і особою ───────────────────────────────────────
// Пояснює механізм, не повторює відповідь. Без прикладу-дієслова там, де підтип
// охоплює кілька дієслів (інакше приклад суперечив би конкретній картці); правильну
// форму з підметом учень і так бачить у фідбеку.
const PLURAL_UK = { wir: 'wir = форма інфінітива (-en).', sie: 'sie/Sie = форма інфінітива (-en).' };
const WHY_UK = {
  plain: {
    ich: 'Правильне дієслово: корінь + -e.',
    du:  'Правильне дієслово: корінь + -st.',
    er:  'Правильне дієслово: корінь + -t.',
    wir: PLURAL_UK.wir, ihr: 'Правильне дієслово: корінь + -t.', sie: PLURAL_UK.sie
  },
  e: {
    ich: 'Корінь на -t/-d: ich — корінь + -e.',
    du:  'Корінь на -t/-d: вставляємо -e- перед -st (du arbeitest).',
    er:  'Корінь на -t/-d: вставляємо -e- перед -t (er arbeitet).',
    wir: PLURAL_UK.wir,
    ihr: 'Корінь на -t/-d: вставляємо -e- перед -t (ihr arbeitet).',
    sie: PLURAL_UK.sie
  },
  ss: {
    ich: 'Корінь на -s/-ß/-z: ich — корінь + -e.',
    du:  'Корінь на -ß: du дістає лише -t (du heißt), без зайвого -s.',
    er:  'Корінь на -ß: er — корінь + -t (er heißt).',
    wir: PLURAL_UK.wir, ihr: 'Корінь на -ß: ihr — корінь + -t.', sie: PLURAL_UK.sie
  },
  ae: {
    ich: 'a→ä лише в du і er; ich — корінь без зміни + -e.',
    du:  'a→ä у du і er формах: корінь дістає умлаут, далі -st.',
    er:  'a→ä у du і er формах: корінь дістає умлаут, далі -t.',
    wir: 'a→ä лише в du і er; wir = форма інфінітива.',
    ihr: 'a→ä лише в du і er; ihr — корінь без зміни + -t.',
    sie: 'a→ä лише в du і er; sie/Sie = форма інфінітива.'
  },
  ei: {
    ich: 'e→i лише в du і er; ich — корінь без зміни + -e.',
    du:  'e→i у du і er формах: корінь міняє e→i, далі -st.',
    er:  'e→i у du і er формах: корінь міняє e→i, далі -t.',
    wir: 'e→i лише в du і er; wir = форма інфінітива.',
    ihr: 'e→i лише в du і er; ihr — корінь без зміни + -t.',
    sie: 'e→i лише в du і er; sie/Sie = форма інфінітива.'
  },
  eie: {
    ich: 'e→ie лише в du і er; ich — корінь без зміни + -e.',
    du:  'e→ie у du і er формах: корінь міняє e→ie, далі -st.',
    er:  'e→ie у du і er формах: корінь міняє e→ie, далі -t.',
    wir: 'e→ie лише в du і er; wir = форма інфінітива.',
    ihr: 'e→ie лише в du і er; ihr — корінь без зміни + -t.',
    sie: 'e→ie лише в du і er; sie/Sie = форма інфінітива.'
  },
  modal: {
    ich: 'Модальне: в однині особливий корінь, а ich — без закінчення.',
    du:  'Модальне: особливий корінь однини + -st.',
    er:  'Модальне: er, як і ich, — без закінчення (ich = er).',
    wir: 'Модальне: множина = форма інфінітива.',
    ihr: 'Модальне: ihr — інфінітив-корінь + -t.',
    sie: 'Модальне: множина = форма інфінітива.'
  },
  sein: {
    ich: 'sein — повністю нерегулярне: форми треба знати напамʼять.',
    du:  'sein — повністю нерегулярне: форми треба знати напамʼять.',
    er:  'sein — повністю нерегулярне: форми треба знати напамʼять.',
    wir: 'sein — повністю нерегулярне: форми треба знати напамʼять.',
    ihr: 'sein — повністю нерегулярне: форми треба знати напамʼять.',
    sie: 'sein — повністю нерегулярне: форми треба знати напамʼять.'
  },
  haben: {
    ich: 'haben: ich — правильна форма habe.',
    du:  'haben: у du і er випадає -b- (du hast, er hat).',
    er:  'haben: у du і er випадає -b- (du hast, er hat).',
    wir: 'haben: множина правильна (haben).',
    ihr: 'haben: ihr — правильна форма habt.',
    sie: 'haben: множина правильна (haben).'
  }
};

const PLURAL_DE = { wir: 'wir = Infinitivform (-en).', sie: 'sie/Sie = Infinitivform (-en).' };
const WHY_DE = {
  plain: {
    ich: 'Regelmäßig: Stamm + -e.',
    du:  'Regelmäßig: Stamm + -st.',
    er:  'Regelmäßig: Stamm + -t.',
    wir: PLURAL_DE.wir, ihr: 'Regelmäßig: Stamm + -t.', sie: PLURAL_DE.sie
  },
  e: {
    ich: 'Stamm auf -t/-d: ich — Stamm + -e.',
    du:  'Stamm auf -t/-d: -e- vor -st (du arbeitest).',
    er:  'Stamm auf -t/-d: -e- vor -t (er arbeitet).',
    wir: PLURAL_DE.wir, ihr: 'Stamm auf -t/-d: -e- vor -t (ihr arbeitet).', sie: PLURAL_DE.sie
  },
  ss: {
    ich: 'Stamm auf -s/-ß/-z: ich — Stamm + -e.',
    du:  'Stamm auf -ß: du bekommt nur -t (du heißt), kein zusätzliches -s.',
    er:  'Stamm auf -ß: er — Stamm + -t (er heißt).',
    wir: PLURAL_DE.wir, ihr: 'Stamm auf -ß: ihr — Stamm + -t.', sie: PLURAL_DE.sie
  },
  ae: {
    ich: 'a→ä nur bei du und er; ich — Stamm unverändert + -e.',
    du:  'a→ä bei du und er: Stamm bekommt Umlaut, dann -st.',
    er:  'a→ä bei du und er: Stamm bekommt Umlaut, dann -t.',
    wir: 'a→ä nur bei du und er; wir = Infinitivform.',
    ihr: 'a→ä nur bei du und er; ihr — Stamm unverändert + -t.',
    sie: 'a→ä nur bei du und er; sie/Sie = Infinitivform.'
  },
  ei: {
    ich: 'e→i nur bei du und er; ich — Stamm unverändert + -e.',
    du:  'e→i bei du und er: Stamm wechselt e→i, dann -st.',
    er:  'e→i bei du und er: Stamm wechselt e→i, dann -t.',
    wir: 'e→i nur bei du und er; wir = Infinitivform.',
    ihr: 'e→i nur bei du und er; ihr — Stamm unverändert + -t.',
    sie: 'e→i nur bei du und er; sie/Sie = Infinitivform.'
  },
  eie: {
    ich: 'e→ie nur bei du und er; ich — Stamm unverändert + -e.',
    du:  'e→ie bei du und er: Stamm wechselt e→ie, dann -st.',
    er:  'e→ie bei du und er: Stamm wechselt e→ie, dann -t.',
    wir: 'e→ie nur bei du und er; wir = Infinitivform.',
    ihr: 'e→ie nur bei du und er; ihr — Stamm unverändert + -t.',
    sie: 'e→ie nur bei du und er; sie/Sie = Infinitivform.'
  },
  modal: {
    ich: 'Modalverb: im Singular besonderer Stamm, ich ohne Endung.',
    du:  'Modalverb: besonderer Singular-Stamm + -st.',
    er:  'Modalverb: er wie ich — ohne Endung (ich = er).',
    wir: 'Modalverb: Plural = Infinitivform.',
    ihr: 'Modalverb: ihr — Infinitivstamm + -t.',
    sie: 'Modalverb: Plural = Infinitivform.'
  },
  sein: {
    ich: 'sein — völlig unregelmäßig: Formen auswendig lernen.',
    du:  'sein — völlig unregelmäßig: Formen auswendig lernen.',
    er:  'sein — völlig unregelmäßig: Formen auswendig lernen.',
    wir: 'sein — völlig unregelmäßig: Formen auswendig lernen.',
    ihr: 'sein — völlig unregelmäßig: Formen auswendig lernen.',
    sie: 'sein — völlig unregelmäßig: Formen auswendig lernen.'
  },
  haben: {
    ich: 'haben: ich — reguläre Form habe.',
    du:  'haben: bei du und er fällt -b- weg (du hast, er hat).',
    er:  'haben: bei du und er fällt -b- weg (du hast, er hat).',
    wir: 'haben: Plural regulär (haben).',
    ihr: 'haben: ihr — reguläre Form habt.',
    sie: 'haben: Plural regulär (haben).'
  }
};

export const whyFor = (sub, person) => WHY_UK[sub][person];
export const whyDeFor = (sub, person) => WHY_DE[sub][person];

// ── Патерн для peek у карті засвоєння (matrix.value) ─────────────────────────
// Карта нейтральна (SPEC §6): кольорів немає (type-тема), peek показує лише патерн
// закінчення за особою. sein/haben — реальні форми (одне дієслово на колонку).
const BASE = { ich: '-e', du: '-st', er: '-t', wir: '-en', ihr: '-t', sie: '-en' };
const MARK = {
  reg:   BASE,
  ae:    { ...BASE, du: 'ä+st', er: 'ä+t' },
  ei:    { ...BASE, du: 'i+st', er: 'i+t' },
  eie:   { ...BASE, du: 'ie+st', er: 'ie+t' },
  modal: { ...BASE, ich: '∅', er: '∅' }
};
const byInf = Object.fromEntries(VERBS.map(v => [v.inf, v]));
export function cellMark(groupK, personK) {
  if (groupK === 'sein') return byInf['sein'].forms[personK];
  if (groupK === 'haben') return byInf['haben'].forms[personK];
  return MARK[groupK][personK];
}
