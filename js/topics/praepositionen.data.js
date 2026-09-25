// Дані теми «Прийменники» — винесені окремо, щоб їх міг перевірити вчитель
// (сторінка praep-review.html). Форми звірені з таблицею відмінювання означеного
// артикля. Сумнівне позначене `todo: true` і в гру НЕ потрапляє (SPEC §12).
//
// Мова правил: `why`/`why1` — українською (це бачить учень у грі); `whyDe`/`why1De`
// — німецькою для перевірки вчителем (review-сторінка), у грі не використовуються.
//
// Критично (SPEC §9 Фаза 4): правило Wechsel формулюємо ТІЛЬКИ через зміну локації /
// перетин межі, НІКОЛИ «рух → Akkusativ» (Ich laufe im Park — рух є, відмінок Dativ).
//
// Артиклі в шаблонах — лише сильні іменники (без n-Deklination), щоб не вивести
// хибну форму. Злиті прийменники (an/in/bei/zu/von + dem/das/der) у блоках 2 і 4
// не використовуються там, де злиття обовʼязкове, — вони живуть у власному блоці 3.

// ── Блок 1. Прийменник → відмінок ───────────────────────────────────────────
// Прийменники фіксованого відмінка. Спершу Akkusativ-група, потім Dativ-група.
// bis / entlang / gegenüber — todo (нестандартна поведінка), поза стартовою колодою.
const AKK_WHY = 'Akkusativ-група: durch, für, gegen, ohne, um.';
const AKK_WHY_DE = 'Akkusativ-Gruppe: durch, für, gegen, ohne, um.';
const DAT_WHY = 'Dativ-група: aus, bei, mit, nach, seit, von, zu.';
const DAT_WHY_DE = 'Dativ-Gruppe: aus, bei, mit, nach, seit, von, zu.';
export const FIXED = [
  // Akkusativ
  { p: 'durch', c: 'akk', why: AKK_WHY, whyDe: AKK_WHY_DE },
  { p: 'für',   c: 'akk', why: AKK_WHY, whyDe: AKK_WHY_DE },
  { p: 'gegen', c: 'akk', why: AKK_WHY, whyDe: AKK_WHY_DE },
  { p: 'ohne',  c: 'akk', why: AKK_WHY, whyDe: AKK_WHY_DE },
  { p: 'um',    c: 'akk', why: AKK_WHY, whyDe: AKK_WHY_DE },
  // Dativ
  { p: 'aus',   c: 'dat', why: DAT_WHY, whyDe: DAT_WHY_DE },
  { p: 'bei',   c: 'dat', why: DAT_WHY, whyDe: DAT_WHY_DE },
  { p: 'mit',   c: 'dat', why: DAT_WHY, whyDe: DAT_WHY_DE },
  { p: 'nach',  c: 'dat', why: DAT_WHY, whyDe: DAT_WHY_DE },
  { p: 'seit',  c: 'dat', why: DAT_WHY, whyDe: DAT_WHY_DE },
  { p: 'von',   c: 'dat', why: DAT_WHY, whyDe: DAT_WHY_DE },
  { p: 'zu',    c: 'dat', why: DAT_WHY, whyDe: DAT_WHY_DE },
  // todo: поза колодою, поведінка нестандартна — звірити й вирішити окремо.
  { p: 'bis',       c: 'akk', todo: true, note: 'Майже завжди «bis zu» + Dativ; чистий Akk рідкісний.' },
  { p: 'entlang',   c: 'akk', todo: true, note: 'Постпозиція (den Fluss entlang); з Genitiv — інший регістр.' },
  { p: 'gegenüber', c: 'dat', todo: true, note: 'Позиція вільна (пре-/постпозиція), плутає в шаблоні.' }
];

// ── Блок 2. Прийменник + артикль у реченні (фіксований відмінок) ─────────────
// Прийменники, що НЕ зливаються з артиклем у цих формах. g — рід іменника.
export const SENT = [
  { p: 'durch', c: 'akk', g: 'm', text: 'Wir gehen durch ___ Park.',
    why: 'durch — завжди Akkusativ; maskulin в Akk → den.', whyDe: 'durch — immer Akkusativ; maskulin im Akk → den.' },
  { p: 'für',   c: 'akk', g: 'f', text: 'Das Geschenk ist für ___ Frau.',
    why: 'für — завжди Akkusativ; feminin в Akk → die.', whyDe: 'für — immer Akkusativ; feminin im Akk → die.' },
  { p: 'ohne',  c: 'akk', g: 'n', text: 'Ich komme ohne ___ Kind.',
    why: 'ohne — завжди Akkusativ; neutrum в Akk → das.', whyDe: 'ohne — immer Akkusativ; neutrum im Akk → das.' },
  { p: 'gegen', c: 'akk', g: 'm', text: 'Das Auto fährt gegen ___ Baum.',
    why: 'gegen — завжди Akkusativ; maskulin в Akk → den.', whyDe: 'gegen — immer Akkusativ; maskulin im Akk → den.' },
  { p: 'um',    c: 'akk', g: 'f', text: 'Wir gehen um ___ Ecke.',
    why: 'um — завжди Akkusativ; feminin в Akk → die.', whyDe: 'um — immer Akkusativ; feminin im Akk → die.' },
  { p: 'mit',   c: 'dat', g: 'm', text: 'Ich fahre mit ___ Bus.',
    why: 'mit — завжди Dativ; maskulin в Dat → dem.', whyDe: 'mit — immer Dativ; maskulin im Dat → dem.' },
  { p: 'aus',   c: 'dat', g: 'f', text: 'Sie kommt aus ___ Stadt.',
    why: 'aus — завжди Dativ; feminin в Dat → der.', whyDe: 'aus — immer Dativ; feminin im Dat → der.' },
  { p: 'seit',  c: 'dat', g: 'm', text: 'Ich warte seit ___ Unfall.',
    why: 'seit — завжди Dativ; maskulin в Dat → dem.', whyDe: 'seit — immer Dativ; maskulin im Dat → dem.' },
  { p: 'nach',  c: 'dat', g: 'm', text: 'Nach ___ Film gehen wir essen.',
    why: 'nach — завжди Dativ; maskulin в Dat → dem.', whyDe: 'nach — immer Dativ; maskulin im Dat → dem.' },
  { p: 'von',   c: 'dat', g: 'f', text: 'Ich komme von ___ Arbeit.',
    why: 'von — завжди Dativ; feminin в Dat → der.', whyDe: 'von — immer Dativ; feminin im Dat → der.' },
  { p: 'bei',   c: 'dat', g: 'f', text: 'Ich bin bei ___ Arbeit.',
    why: 'bei — завжди Dativ; feminin в Dat → der.', whyDe: 'bei — immer Dativ; feminin im Dat → der.' }
];

// ── Блок 3. Злиті форми ──────────────────────────────────────────────────────
// Обовʼязкові злиття (SPEC перелік: zum, ins, am, zur, im, beim, vom). Розмовні
// стягнення (aufs, fürs, ans…) навмисно не додаються. Відмінок у злитті вже
// зафіксований контекстом (gehen → Wohin/Akk, sein → Wo/Dat), тож правило —
// про саме злиття, а не про вибір відмінка.
export const MERGE = [
  { merge: 'zum',  p: 'zu',  art: 'dem', text: 'Ich gehe ___ Arzt.',
    why: 'zu + dem = zum (обовʼязкове злиття).', whyDe: 'zu + dem = zum (obligatorische Verschmelzung).' },
  { merge: 'zur',  p: 'zu',  art: 'der', text: 'Ich gehe ___ Schule.',
    why: 'zu + der = zur (обовʼязкове злиття).', whyDe: 'zu + der = zur (obligatorische Verschmelzung).' },
  { merge: 'ins',  p: 'in',  art: 'das', text: 'Wir gehen ___ Kino.',
    why: 'in + das = ins (обовʼязкове злиття).', whyDe: 'in + das = ins (obligatorische Verschmelzung).' },
  { merge: 'im',   p: 'in',  art: 'dem', text: 'Wir sind ___ Kino.',
    why: 'in + dem = im (обовʼязкове злиття).', whyDe: 'in + dem = im (obligatorische Verschmelzung).' },
  { merge: 'am',   p: 'an',  art: 'dem', text: 'Das Bild ist ___ Fenster.',
    why: 'an + dem = am (обовʼязкове злиття).', whyDe: 'an + dem = am (obligatorische Verschmelzung).' },
  { merge: 'beim', p: 'bei', art: 'dem', text: 'Ich bin ___ Arzt.',
    why: 'bei + dem = beim (обовʼязкове злиття).', whyDe: 'bei + dem = beim (obligatorische Verschmelzung).' },
  { merge: 'vom',  p: 'von', art: 'dem', text: 'Ich komme ___ Arzt.',
    why: 'von + dem = vom (обовʼязкове злиття).', whyDe: 'von + dem = vom (obligatorische Verschmelzung).' }
];

// ── Блок 4. Wechselpräpositionen (двокрокова картка) ─────────────────────────
// Мінімальні пари: та сама фраза, різний відмінок. pair звʼязує двійку (для
// review-сторінки). Прийменники/іменники підібрані так, щоб артикль НЕ зливався
// (auf/über/unter/vor/hinter/neben не зливаються; an/in — з feminin: an der/die,
// in der/die). why1 — ТІЛЬКИ через зміну локації, ніколи «рух».
export const WECHSEL = [
  { prep: 'auf', pair: 'strasse', c: 'akk', g: 'f', text: 'Das Kind läuft auf ___ Straße.',
    why1: 'Дитина перетинає межу й опиняється на вулиці — зміна локації → Wohin (Akkusativ).',
    why1De: 'Das Kind überschreitet die Grenze und ist auf der Straße — Ortswechsel → Wohin (Akkusativ).' },
  { prep: 'auf', pair: 'strasse', c: 'dat', g: 'f', text: 'Das Kind spielt auf ___ Straße.',
    why1: 'Гра триває на місці, межа не перетинається (рух є, але локація та сама) → Wo (Dativ).',
    why1De: 'Das Spielen bleibt am selben Ort, keine Grenze wird überschritten (Bewegung ja, aber gleicher Ort) → Wo (Dativ).' },

  { prep: 'auf', pair: 'tisch', c: 'akk', g: 'm', text: 'Ich lege das Buch auf ___ Tisch.',
    why1: 'Книга змінює місце — лягає на стіл (перетин межі) → Wohin (Akkusativ).',
    why1De: 'Das Buch wechselt den Ort — es kommt auf den Tisch (Grenzüberschreitung) → Wohin (Akkusativ).' },
  { prep: 'auf', pair: 'tisch', c: 'dat', g: 'm', text: 'Das Buch liegt auf ___ Tisch.',
    why1: 'Книга вже лежить, місце не змінюється → Wo (Dativ).',
    why1De: 'Das Buch liegt bereits, der Ort ändert sich nicht → Wo (Dativ).' },

  { prep: 'in', pair: 'tasche', c: 'akk', g: 'f', text: 'Ich stecke den Schlüssel in ___ Tasche.',
    why1: 'Ключ потрапляє всередину сумки — перетин межі → Wohin (Akkusativ).',
    why1De: 'Der Schlüssel gelangt in die Tasche hinein — Grenzüberschreitung → Wohin (Akkusativ).' },
  { prep: 'in', pair: 'tasche', c: 'dat', g: 'f', text: 'Der Schlüssel ist in ___ Tasche.',
    why1: 'Ключ уже всередині, локація не змінюється → Wo (Dativ).',
    why1De: 'Der Schlüssel ist bereits drinnen, der Ort ändert sich nicht → Wo (Dativ).' },

  { prep: 'an', pair: 'wand', c: 'akk', g: 'f', text: 'Sie hängt das Bild an ___ Wand.',
    why1: 'Картина опиняється на стіні — зміна локації → Wohin (Akkusativ).',
    why1De: 'Das Bild kommt an die Wand — Ortswechsel → Wohin (Akkusativ).' },
  { prep: 'an', pair: 'wand', c: 'dat', g: 'f', text: 'Das Bild hängt an ___ Wand.',
    why1: 'Картина вже висить, місце те саме → Wo (Dativ).',
    why1De: 'Das Bild hängt bereits, gleicher Ort → Wo (Dativ).' },

  { prep: 'über', pair: 'tisch', c: 'akk', g: 'm', text: 'Er hängt die Lampe über ___ Tisch.',
    why1: 'Лампа переміщується на позицію над столом — зміна локації → Wohin (Akkusativ).',
    why1De: 'Die Lampe wird über den Tisch gebracht — Ortswechsel → Wohin (Akkusativ).' },
  { prep: 'über', pair: 'tisch', c: 'dat', g: 'm', text: 'Die Lampe hängt über ___ Tisch.',
    why1: 'Лампа вже висить над столом, місце не змінюється → Wo (Dativ).',
    why1De: 'Die Lampe hängt bereits über dem Tisch, der Ort ändert sich nicht → Wo (Dativ).' },

  { prep: 'unter', pair: 'tisch', c: 'akk', g: 'm', text: 'Die Katze kriecht unter ___ Tisch.',
    why1: 'Кіт заповзає під стіл — перетин межі → Wohin (Akkusativ).',
    why1De: 'Die Katze kriecht unter den Tisch — Grenzüberschreitung → Wohin (Akkusativ).' },
  { prep: 'unter', pair: 'tisch', c: 'dat', g: 'm', text: 'Die Katze liegt unter ___ Tisch.',
    why1: 'Кіт лежить під столом, локація не змінюється → Wo (Dativ).',
    why1De: 'Die Katze liegt unter dem Tisch, der Ort ändert sich nicht → Wo (Dativ).' },

  { prep: 'vor', pair: 'haus', c: 'akk', g: 'n', text: 'Er fährt das Auto vor ___ Haus.',
    why1: 'Авто змінює місце — стає перед будинком (перетин межі) → Wohin (Akkusativ).',
    why1De: 'Das Auto wechselt den Ort — es fährt vor das Haus (Grenzüberschreitung) → Wohin (Akkusativ).' },
  { prep: 'vor', pair: 'haus', c: 'dat', g: 'n', text: 'Das Auto steht vor ___ Haus.',
    why1: 'Авто вже стоїть перед будинком, місце те саме → Wo (Dativ).',
    why1De: 'Das Auto steht bereits vor dem Haus, gleicher Ort → Wo (Dativ).' },

  { prep: 'hinter', pair: 'tuer', c: 'akk', g: 'f', text: 'Er versteckt sich hinter ___ Tür.',
    why1: 'Він переходить за двері — зміна локації → Wohin (Akkusativ).',
    why1De: 'Er geht hinter die Tür — Ortswechsel → Wohin (Akkusativ).' },
  { prep: 'hinter', pair: 'tuer', c: 'dat', g: 'f', text: 'Er steht hinter ___ Tür.',
    why1: 'Він уже стоїть за дверима, місце не змінюється → Wo (Dativ).',
    why1De: 'Er steht bereits hinter der Tür, der Ort ändert sich nicht → Wo (Dativ).' },

  { prep: 'neben', pair: 'tuer', c: 'akk', g: 'f', text: 'Sie stellt die Tasche neben ___ Tür.',
    why1: 'Сумка опиняється біля дверей — зміна локації → Wohin (Akkusativ).',
    why1De: 'Die Tasche kommt neben die Tür — Ortswechsel → Wohin (Akkusativ).' },
  { prep: 'neben', pair: 'tuer', c: 'dat', g: 'f', text: 'Die Tasche steht neben ___ Tür.',
    why1: 'Сумка вже стоїть біля дверей, місце те саме → Wo (Dativ).',
    why1De: 'Die Tasche steht bereits neben der Tür, gleicher Ort → Wo (Dativ).' },

  // todo: zwischen майже завжди з множиною (zwischen den Fenstern) — потрібна
  // колонка plural у матриці, якої поки немає. Поза колодою.
  { prep: 'zwischen', pair: 'fenster', c: 'dat', g: 'p', todo: true, text: 'Das Bild hängt zwischen ___ Fenstern.',
    why1: 'Множина — матриця теми поки лише m/f/n.',
    why1De: 'Plural — die Themenmatrix hat vorerst nur m/f/n.' }
];

// ── Блок 5. Wechsel через дієслівні пари ─────────────────────────────────────
// Перехідне дієслово (stellen/legen/setzen) — предмет змінює місце → Wohin (Akk);
// неперехідне (stehen/liegen/sitzen) — стан на місці → Wo (Dat). Пара — той самий
// іменник і прийменник, різне дієслово. Правило — про перехідність/зміну локації.
export const VERBS = [
  { verbs: 'stellen/stehen', pair: 'flasche', c: 'akk', g: 'm', text: 'Ich stelle die Flasche auf ___ Tisch.',
    why1: 'stellen — предмет переміщують, він змінює місце (перетин межі) → Wohin (Akkusativ).',
    why1De: 'stellen — der Gegenstand wird bewegt, er wechselt den Ort (Grenzüberschreitung) → Wohin (Akkusativ).' },
  { verbs: 'stellen/stehen', pair: 'flasche', c: 'dat', g: 'm', text: 'Die Flasche steht auf ___ Tisch.',
    why1: 'stehen — предмет уже стоїть, місце не змінюється → Wo (Dativ).',
    why1De: 'stehen — der Gegenstand steht bereits, der Ort ändert sich nicht → Wo (Dativ).' },

  { verbs: 'legen/liegen', pair: 'handy', c: 'akk', g: 'm', text: 'Ich lege das Handy auf ___ Tisch.',
    why1: 'legen — предмет кладуть, він змінює місце (перетин межі) → Wohin (Akkusativ).',
    why1De: 'legen — der Gegenstand wird hingelegt, er wechselt den Ort (Grenzüberschreitung) → Wohin (Akkusativ).' },
  { verbs: 'legen/liegen', pair: 'handy', c: 'dat', g: 'm', text: 'Das Handy liegt auf ___ Tisch.',
    why1: 'liegen — предмет уже лежить, місце не змінюється → Wo (Dativ).',
    why1De: 'liegen — der Gegenstand liegt bereits, der Ort ändert sich nicht → Wo (Dativ).' },

  { verbs: 'setzen/sitzen', pair: 'kind', c: 'akk', g: 'm', text: 'Ich setze das Kind auf ___ Stuhl.',
    why1: 'setzen — дитину саджають, вона змінює місце (перетин межі) → Wohin (Akkusativ).',
    why1De: 'setzen — das Kind wird gesetzt, es wechselt den Ort (Grenzüberschreitung) → Wohin (Akkusativ).' },
  { verbs: 'setzen/sitzen', pair: 'kind', c: 'dat', g: 'm', text: 'Das Kind sitzt auf ___ Stuhl.',
    why1: 'sitzen — дитина вже сидить, місце не змінюється → Wo (Dativ).',
    why1De: 'sitzen — das Kind sitzt bereits, der Ort ändert sich nicht → Wo (Dativ).' }
];
