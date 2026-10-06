// Дані теми «Satzbau» (конструктор речень, порядок слів) — окремо, щоб їх міг перевірити
// вчитель (satzbau-review.html). Порядок і форми не вигадані; сумнівне позначається
// `todo: true` і в гру НЕ потрапляє (SPEC §12).
//
// Лексика — лише з уже вивчених тем: дієслівні форми з praesens, прийменники й злиті форми
// з praepositionen (цілі звірені фрази: zur Schule, mit dem Bus, auf der Straße…), іменники
// з genus. Нове не вводимо. Структурні слова (підмети-займенники, прислівники часу, nicht,
// питальні слова) — це «клей» граматики, не лексика: їхній набір у GLUE (тест це контролює).
//
// Канонічна форма токена — СЕРЕДИННА (іменники з великої, решта з малої, «ich» з малої).
// Велику першу літеру додає рендер тому слову, що стало першим у рядку. Порівняння —
// за канонічними формами, тож варіанти порядку працюють незалежно від позиції (SPEC: тренуємо
// ПОРЯДОК, не регістр). Пунктуація речення (. / ?) — властивість картки, не перетягуване слово.
//
// `solutions` — усі допустимі порядки. good:true — правильно; good:false — допустимо, але
// стилістично гірше (зараховуємо, але кажемо `note`). Усі solutions одного речення мають бути
// перестановками одного мультимножини слів (тест це перевіряє). `distractors` — 1–2 зайвих
// слова, щоб не можна було натиснути все підряд.

// Структурні слова («клей») — не лексика з тем. Підмети-займенники, прислівники часу,
// заперечення, питальні слова, сполучники.
export const GLUE = new Set([
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr',
  'heute', 'morgen', 'jetzt', 'gern',
  'nicht', 'wohin', 'wann', 'was', 'und'
]);

// Блоки = типи речення (рядки карти засвоєння). `rule` — короткий маркер для peek.
export const BLOCKS = [
  { k: 'b1', label: 'Простий порядок', rule: 'V2' },
  { k: 'b2', label: 'Інверсія', rule: 'V2 + інв.' },
  { k: 'b3', label: 'Модальне + Inf', rule: '… Inf' },
  { k: 'b4', label: 'Питання', rule: '?' },
  { k: 'b5', label: 'Заперечення (nicht)', rule: 'nicht' }
];

const V2_WHY = 'Дієслово — на другому місці: спершу підмет, потім дієслово.';
const V2_WHY_DE = 'Das Verb steht an zweiter Stelle: zuerst das Subjekt, dann das Verb.';
const INV_WHY = 'Обставина на першому місці вимагає інверсії: дієслово лишається другим, тож підмет стає після нього (Heute fahre ich…, не Heute ich fahre…).';
const INV_WHY_DE = 'Eine Angabe am Satzanfang erzwingt die Inversion: das Verb bleibt an zweiter Stelle, das Subjekt rückt dahinter (Heute fahre ich…, nicht Heute ich fahre…).';
const INV_NOTE = 'Обставину з початку краще лишати спереду — тоді потрібна інверсія: Heute fahre ich…';
const BRACE_WHY = 'Модальне дієслово — друге, інфінітив — у кінці (дієслівна рамка): … muss … arbeiten.';
const BRACE_WHY_DE = 'Das Modalverb steht an zweiter Stelle, der Infinitiv am Satzende (Verbklammer): … muss … arbeiten.';
const QJA_WHY = 'У питанні без питального слова дієслово — на першому місці: Fährst du…?';
const QJA_WHY_DE = 'In der Entscheidungsfrage steht das Verb an erster Stelle: Fährst du…?';
const QW_WHY = 'Питальне слово — перше, дієслово — друге: Wohin fährst du?';
const QW_WHY_DE = 'Das Fragewort steht zuerst, das Verb an zweiter Stelle: Wohin fährst du?';

// Хелпер: речення з однією природною відповіддю + (необовʼязково) гіршим варіантом.
const one = (order) => [{ order, good: true }];

export const SENTENCES = [
  // ── Блок 1. Простий порядок (V2) ──────────────────────────────────────────
  { block: 'b1', uk: 'Я їду до школи.', punct: '.',
    solutions: one(['ich', 'fahre', 'zur', 'Schule']), distractors: ['du', 'die'],
    why: V2_WHY, whyDe: V2_WHY_DE },
  { block: 'b1', uk: 'Ти граєш у парку.', punct: '.',
    solutions: one(['du', 'spielst', 'im', 'Park']), distractors: ['ich', 'spielt'],
    why: V2_WHY, whyDe: V2_WHY_DE },
  { block: 'b1', uk: 'Він іде в кіно.', punct: '.',
    solutions: one(['er', 'geht', 'ins', 'Kino']), distractors: ['gehen', 'du'],
    why: V2_WHY, whyDe: V2_WHY_DE },
  { block: 'b1', uk: 'Ми їдемо автобусом.', punct: '.',
    solutions: one(['wir', 'fahren', 'mit', 'dem', 'Bus']), distractors: ['den', 'fährt'],
    why: V2_WHY, whyDe: V2_WHY_DE },
  { block: 'b1', uk: 'Я йду до лікаря.', punct: '.',
    solutions: one(['ich', 'gehe', 'zum', 'Arzt']), distractors: ['du', 'zur'],
    why: V2_WHY, whyDe: V2_WHY_DE },
  { block: 'b1', uk: 'Дитина грає на вулиці.', punct: '.',
    solutions: one(['das', 'Kind', 'spielt', 'auf', 'der', 'Straße']), distractors: ['die', 'spielen'],
    why: 'Дієслово — на другому місці: підмет «das Kind» (артикль + іменник) рахується як один член.',
    whyDe: 'Das Verb steht an zweiter Stelle: das Subjekt „das Kind“ (Artikel + Nomen) zählt als ein Satzglied.' },
  { block: 'b1', uk: 'Жінка приходить з міста.', punct: '.',
    solutions: one(['die', 'Frau', 'kommt', 'aus', 'der', 'Stadt']), distractors: ['den', 'kommen'],
    why: V2_WHY, whyDe: V2_WHY_DE },

  // ── Блок 2. Інверсія (обставина спереду) ──────────────────────────────────
  // good — інверсія (як вимагає початок речення); soft — та сама думка без фронтування.
  { block: 'b2', uk: 'Сьогодні я їду до школи.', punct: '.',
    solutions: [{ order: ['heute', 'fahre', 'ich', 'zur', 'Schule'], good: true },
                { order: ['ich', 'fahre', 'heute', 'zur', 'Schule'], good: false, note: INV_NOTE }],
    distractors: ['du'], why: INV_WHY, whyDe: INV_WHY_DE },
  { block: 'b2', uk: 'Завтра ми граємо в парку.', punct: '.',
    solutions: [{ order: ['morgen', 'spielen', 'wir', 'im', 'Park'], good: true },
                { order: ['wir', 'spielen', 'morgen', 'im', 'Park'], good: false, note: INV_NOTE }],
    distractors: ['ihr'], why: INV_WHY, whyDe: INV_WHY_DE },
  { block: 'b2', uk: 'Зараз він іде в кіно.', punct: '.',
    solutions: [{ order: ['jetzt', 'geht', 'er', 'ins', 'Kino'], good: true },
                { order: ['er', 'geht', 'jetzt', 'ins', 'Kino'], good: false, note: INV_NOTE }],
    distractors: ['sie'], why: INV_WHY, whyDe: INV_WHY_DE },
  { block: 'b2', uk: 'Сьогодні ти їдеш автобусом.', punct: '.',
    solutions: [{ order: ['heute', 'fährst', 'du', 'mit', 'dem', 'Bus'], good: true },
                { order: ['du', 'fährst', 'heute', 'mit', 'dem', 'Bus'], good: false, note: INV_NOTE }],
    distractors: ['den'], why: INV_WHY, whyDe: INV_WHY_DE },
  { block: 'b2', uk: 'Завтра я йду до лікаря.', punct: '.',
    solutions: [{ order: ['morgen', 'gehe', 'ich', 'zum', 'Arzt'], good: true },
                { order: ['ich', 'gehe', 'morgen', 'zum', 'Arzt'], good: false, note: INV_NOTE }],
    distractors: ['du'], why: INV_WHY, whyDe: INV_WHY_DE },
  { block: 'b2', uk: 'Сьогодні дитина спить.', punct: '.',
    solutions: [{ order: ['heute', 'schläft', 'das', 'Kind'], good: true },
                { order: ['das', 'Kind', 'schläft', 'heute'], good: false, note: INV_NOTE }],
    distractors: ['die'], why: INV_WHY, whyDe: INV_WHY_DE },

  // ── Блок 3. Модальне дієслово + інфінітив у кінці (рамка) ──────────────────
  { block: 'b3', uk: 'Я мушу сьогодні працювати.', punct: '.',
    solutions: [{ order: ['ich', 'muss', 'heute', 'arbeiten'], good: true },
                { order: ['heute', 'muss', 'ich', 'arbeiten'], good: true }],
    distractors: ['arbeitet'], why: BRACE_WHY, whyDe: BRACE_WHY_DE },
  { block: 'b3', uk: 'Ти можеш грати в парку.', punct: '.',
    solutions: one(['du', 'kannst', 'im', 'Park', 'spielen']), distractors: ['spielt'],
    why: BRACE_WHY, whyDe: BRACE_WHY_DE },
  { block: 'b3', uk: 'Він хоче їхати до школи.', punct: '.',
    solutions: one(['er', 'will', 'zur', 'Schule', 'fahren']), distractors: ['fährt'],
    why: BRACE_WHY, whyDe: BRACE_WHY_DE },
  { block: 'b3', uk: 'Ми хочемо йти в кіно.', punct: '.',
    solutions: one(['wir', 'wollen', 'ins', 'Kino', 'gehen']), distractors: ['geht'],
    why: BRACE_WHY, whyDe: BRACE_WHY_DE },
  { block: 'b3', uk: 'Я мушу йти до лікаря.', punct: '.',
    solutions: one(['ich', 'muss', 'zum', 'Arzt', 'gehen']), distractors: ['gehe'],
    why: BRACE_WHY, whyDe: BRACE_WHY_DE },
  { block: 'b3', uk: 'Дитина хоче грати на вулиці.', punct: '.',
    solutions: one(['das', 'Kind', 'will', 'auf', 'der', 'Straße', 'spielen']), distractors: ['spielt'],
    why: BRACE_WHY, whyDe: BRACE_WHY_DE },

  // ── Блок 4. Питання ───────────────────────────────────────────────────────
  { block: 'b4', uk: 'Ти їдеш до школи?', punct: '?',
    solutions: one(['fährst', 'du', 'zur', 'Schule']), distractors: ['ich'],
    why: QJA_WHY, whyDe: QJA_WHY_DE },
  { block: 'b4', uk: 'Ви граєте в парку?', punct: '?',
    solutions: one(['spielt', 'ihr', 'im', 'Park']), distractors: ['wir'],
    why: QJA_WHY, whyDe: QJA_WHY_DE },
  { block: 'b4', uk: 'Він іде в кіно?', punct: '?',
    solutions: one(['geht', 'er', 'ins', 'Kino']), distractors: ['sie'],
    why: QJA_WHY, whyDe: QJA_WHY_DE },
  { block: 'b4', uk: 'Куди ти їдеш?', punct: '?',
    solutions: one(['wohin', 'fährst', 'du']), distractors: ['wann'],
    why: QW_WHY, whyDe: QW_WHY_DE },
  { block: 'b4', uk: 'Коли ти працюєш?', punct: '?',
    solutions: one(['wann', 'arbeitest', 'du']), distractors: ['wohin'],
    why: QW_WHY, whyDe: QW_WHY_DE },
  { block: 'b4', uk: 'Ти хочеш іти в кіно?', punct: '?',
    solutions: one(['willst', 'du', 'ins', 'Kino', 'gehen']), distractors: ['gehst'],
    why: 'Питання + рамка: дієслово першим, інфінітив у кінці: Willst du … gehen?',
    whyDe: 'Frage + Klammer: Verb zuerst, Infinitiv am Ende: Willst du … gehen?' },

  // ── Блок 5. Заперечення (nicht) — останній і короткий (SPEC-нотатка) ───────
  // Кожне речення — один чистий випадок позиції nicht, з коротким why.
  { block: 'b5', uk: 'Я сьогодні не їду.', punct: '.',
    solutions: one(['ich', 'fahre', 'heute', 'nicht']), distractors: ['du'],
    why: 'Заперечення всього речення: nicht — у кінці (після обставини часу).',
    whyDe: 'Satznegation: nicht steht am Ende (nach der Zeitangabe).' },
  { block: 'b5', uk: 'Я їду не до школи.', punct: '.',
    solutions: one(['ich', 'fahre', 'nicht', 'zur', 'Schule']), distractors: ['die'],
    why: 'nicht стоїть перед тим, що заперечуємо — тут перед напрямком (zur Schule).',
    whyDe: 'nicht steht vor dem, was verneint wird — hier vor der Richtung (zur Schule).' },
  { block: 'b5', uk: 'Я сьогодні не можу працювати.', punct: '.',
    solutions: one(['ich', 'kann', 'heute', 'nicht', 'arbeiten']), distractors: ['arbeitet'],
    why: 'У рамці з модальним nicht стоїть перед інфінітивом: … nicht arbeiten.',
    whyDe: 'In der Verbklammer steht nicht vor dem Infinitiv: … nicht arbeiten.' },
  { block: 'b5', uk: 'Я їду не автобусом.', punct: '.',
    solutions: one(['ich', 'fahre', 'nicht', 'mit', 'dem', 'Bus']), distractors: ['den'],
    why: 'nicht стоїть перед членом, який заперечуємо — тут перед способом (mit dem Bus).',
    whyDe: 'nicht steht vor dem verneinten Glied — hier vor der Art und Weise (mit dem Bus).' }
];
