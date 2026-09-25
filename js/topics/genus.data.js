// Дані теми «Рід іменників» — ДЛЯ ПЕРЕВІРКИ ВЧИТЕЛЕМ.
// Формат: { w, g, s?, sq?, sx?, collide?, weak?, genEs?, pl?, todo? }
//   collide — орфографічний збіг: слово матчить патерн сигналу, але БЕЗ його морфеми
//         (Kuchen — не зменшувальне; Baum — не латинське). Учневі НЕ показується (напам'ять).
//   w   — слово (Nominativ Singular).
//   g   — рід: 'der' | 'die' | 'das'.
//   s   — сигнал: слово входить у сигнальну групу карти засвоєння (ліміт: ≤5, для -e ≤8).
//   sq  — слово підпадає під сигнал, але НЕ входить у групу (перевищення ліміту). Правило діє —
//         фідбек показує те саме правило, що й для s; у карті засвоєння — в «без сигналу».
//   sx  — анти-сигнал: слово орфографічно матчить сигнал, але має інший рід (виняток; показується).
//   weak — n-Deklination: true (Junge, Mensch) або 'mixed' (Name, Herz — des Namens/Herzens,
//          Akk das Herz). Будь-яке weak заблоковане в шаблонах із пропуском артикля (SPEC).
//   genEs — Genitiv на -es (односкладові der/das на приголосний). Метадані; Genitiv-карток поки
//          немає (SPEC: des Tages і des Tags обидва правильні).
//   pl  — множина. ЗАРЕЗЕРВОВАНО, порожнє: заповнимо в окремій темі про множину (SPEC TODO).
//   todo — сумнівна/регіональна форма: у гру НЕ потрапляє.
//
// Сигнали (семантичні, не орфографічні):
//   die: -ung, -heit, -keit, -schaft, -ion, -e (schwa), -in
//   der: -er (девербальний), -ling, semder (день/місяць/пора року)
//   das: -chen, -um, -zeug
// -er і semder призначаються ЛИШЕ вручну (s), без орфографічного скану (Butter, Tier тощо
// орфографічно на -er, але не девербальні). Решта сигналів мають патерн і скануються тестом.

export default [
  // ─── die-сигнали ────────────────────────────────────────────────
  // -ung: від дієслова (дія/процес) → die
  { w: 'Zeitung', g: 'die', s: 'ung' },
  { w: 'Wohnung', g: 'die', s: 'ung' },
  { w: 'Meinung', g: 'die', s: 'ung' },
  { w: 'Rechnung', g: 'die', s: 'ung' },
  { w: 'Ordnung', g: 'die', s: 'ung' },
  // -heit: абстрактна якість → die
  { w: 'Freiheit', g: 'die', s: 'heit' },
  { w: 'Gesundheit', g: 'die', s: 'heit' },
  { w: 'Krankheit', g: 'die', s: 'heit' },
  { w: 'Wahrheit', g: 'die', s: 'heit' },
  { w: 'Kindheit', g: 'die', s: 'heit' },
  // -keit: абстрактна якість → die
  { w: 'Möglichkeit', g: 'die', s: 'keit' },
  { w: 'Schwierigkeit', g: 'die', s: 'keit' },
  { w: 'Fähigkeit', g: 'die', s: 'keit' },
  // -schaft: спільнота/стан → die
  { w: 'Freundschaft', g: 'die', s: 'schaft' },
  { w: 'Wissenschaft', g: 'die', s: 'schaft' },
  { w: 'Gesellschaft', g: 'die', s: 'schaft' },
  { w: 'Mannschaft', g: 'die', s: 'schaft' },
  { w: 'Wirtschaft', g: 'die', s: 'schaft' },
  // -ion: інтернаціональні → die
  { w: 'Nation', g: 'die', s: 'ion' },
  { w: 'Information', g: 'die', s: 'ion' },
  { w: 'Situation', g: 'die', s: 'ion' },
  { w: 'Lektion', g: 'die', s: 'ion' },
  { w: 'Diskussion', g: 'die', s: 'ion' },
  // -e (ненаголошене schwa): зазвичай die. Ліміт 8 (найбільше винятків — потрібен контраст).
  { w: 'Blume', g: 'die', s: 'e' },
  { w: 'Katze', g: 'die', s: 'e' },
  { w: 'Lampe', g: 'die', s: 'e' },
  { w: 'Straße', g: 'die', s: 'e' },
  { w: 'Sonne', g: 'die', s: 'e' },
  { w: 'Schule', g: 'die', s: 'e' },
  { w: 'Woche', g: 'die', s: 'e' },
  { w: 'Frage', g: 'die', s: 'e' },
  // -in: назва особи жіночого роду → die (патерн /[^e]in$/ — -ein не матчить)
  { w: 'Freundin', g: 'die', s: 'in' },
  { w: 'Lehrerin', g: 'die', s: 'in' },
  { w: 'Ärztin', g: 'die', s: 'in' },
  { w: 'Studentin', g: 'die', s: 'in' },

  // ─── der-сигнали ────────────────────────────────────────────────
  // -er: дієслівна основа + -er = діяч/знаряддя → der (лише девербальні; призначається вручну)
  { w: 'Lehrer', g: 'der', s: 'er' },
  { w: 'Fahrer', g: 'der', s: 'er' },
  { w: 'Drucker', g: 'der', s: 'er' },
  { w: 'Spieler', g: 'der', s: 'er' },
  { w: 'Verkäufer', g: 'der', s: 'er' },
  // -ling: особа/істота → der
  { w: 'Liebling', g: 'der', s: 'ling' },
  { w: 'Zwilling', g: 'der', s: 'ling' },
  { w: 'Lehrling', g: 'der', s: 'ling' },
  // semder: день тижня, місяць, пора року → der (пріоритет над орфографічним -ling)
  { w: 'Montag', g: 'der', s: 'semder' },
  { w: 'Januar', g: 'der', s: 'semder' },
  { w: 'Frühling', g: 'der', s: 'semder' },

  // ─── das-сигнали ────────────────────────────────────────────────
  // -chen: зменшувальне → das
  { w: 'Mädchen', g: 'das', s: 'chen' },
  { w: 'Brötchen', g: 'das', s: 'chen' },
  { w: 'Märchen', g: 'das', s: 'chen' },
  { w: 'Hähnchen', g: 'das', s: 'chen' },
  // -um: латинське запозичення → das
  { w: 'Museum', g: 'das', s: 'um' },
  { w: 'Zentrum', g: 'das', s: 'um' },
  { w: 'Datum', g: 'das', s: 'um' },
  { w: 'Studium', g: 'das', s: 'um' },
  { w: 'Praktikum', g: 'das', s: 'um' },
  // -zeug: засіб/знаряддя → das
  { w: 'Flugzeug', g: 'das', s: 'zeug' },
  { w: 'Spielzeug', g: 'das', s: 'zeug' },
  { w: 'Werkzeug', g: 'das', s: 'zeug' },

  // ─── винятки (sx): слово РЕАЛЬНО підпадає під семантичний опис правила, але має
  //     інший рід. За цим критерієм лишаються тільки -e-винятки: Ge-слова, слабкі
  //     чоловіки, Auge, Ende. sx показується учневі («виняток з правила»).
  { w: 'Auge', g: 'das', sx: 'e' },
  { w: 'Ende', g: 'das', sx: 'e' },
  { w: 'Käse', g: 'der', sx: 'e' },
  { w: 'Gemüse', g: 'das', sx: 'e' },
  { w: 'Junge', g: 'der', sx: 'e', weak: true },
  { w: 'Name', g: 'der', sx: 'e', weak: 'mixed' },

  // ─── орфографічні збіги (collide): матчать патерн, але БЕЗ морфеми правила.
  //     Приховане поле (учневі НЕ показується — інакше вчили б правило про рядок,
  //     а не про морфему); рід учиться напам'ять.
  { w: 'Kuchen', g: 'der', collide: 'chen' },          // немає зменшувального суфікса
  { w: 'Baum', g: 'der', collide: 'um', genEs: true }, // немає латинського -um

  // ─── без сигналу: рід учиться напам'ять ──────────────────────────
  // der
  { w: 'Tisch', g: 'der', genEs: true },
  { w: 'Stuhl', g: 'der', genEs: true },
  { w: 'Schrank', g: 'der', genEs: true },
  { w: 'Mann', g: 'der', genEs: true },
  { w: 'Mensch', g: 'der', weak: true },
  { w: 'Vater', g: 'der' },
  { w: 'Bruder', g: 'der' },
  { w: 'Sohn', g: 'der', genEs: true },
  { w: 'Freund', g: 'der', genEs: true },
  { w: 'Arzt', g: 'der', genEs: true },
  { w: 'Hund', g: 'der', genEs: true },
  { w: 'Fisch', g: 'der', genEs: true },
  { w: 'Berg', g: 'der', genEs: true },
  { w: 'Mond', g: 'der', genEs: true },
  { w: 'Himmel', g: 'der' },
  { w: 'Tag', g: 'der', genEs: true },
  { w: 'Monat', g: 'der' },
  { w: 'Morgen', g: 'der' },
  { w: 'Abend', g: 'der' },
  { w: 'Zug', g: 'der', genEs: true },
  { w: 'Bus', g: 'der', genEs: true },
  { w: 'Garten', g: 'der' },
  { w: 'Schlüssel', g: 'der' },
  { w: 'Finger', g: 'der' },
  { w: 'Kaffee', g: 'der' },
  { w: 'Tee', g: 'der' },
  { w: 'Wein', g: 'der', genEs: true, collide: 'in' },
  { w: 'Salat', g: 'der' },
  { w: 'Apfel', g: 'der' },
  { w: 'Kopf', g: 'der', genEs: true },
  { w: 'Arm', g: 'der', genEs: true },
  { w: 'Fuß', g: 'der', genEs: true },
  { w: 'Mund', g: 'der', genEs: true },
  { w: 'Preis', g: 'der', genEs: true },
  { w: 'Film', g: 'der', genEs: true },
  { w: 'Weg', g: 'der', genEs: true },
  { w: 'Platz', g: 'der', genEs: true },
  { w: 'Grund', g: 'der', genEs: true },
  { w: 'Brief', g: 'der', genEs: true },
  { w: 'Bahnhof', g: 'der' },
  { w: 'Schuh', g: 'der' },
  { w: 'Mantel', g: 'der' },
  { w: 'Rock', g: 'der', genEs: true },
  { w: 'Ball', g: 'der', genEs: true },
  { w: 'Arbeiter', g: 'der', sq: 'er' },
  // die
  { w: 'Frau', g: 'die' },
  { w: 'Mutter', g: 'die', collide: 'er' },
  { w: 'Tochter', g: 'die', collide: 'er' },
  { w: 'Schwester', g: 'die', collide: 'er' },
  { w: 'Nacht', g: 'die' },
  { w: 'Zeit', g: 'die' },
  { w: 'Hand', g: 'die' },
  { w: 'Uhr', g: 'die' },
  { w: 'Stadt', g: 'die' },
  { w: 'Wand', g: 'die' },
  { w: 'Insel', g: 'die' },
  { w: 'Luft', g: 'die' },
  { w: 'Milch', g: 'die' },
  { w: 'Butter', g: 'die', collide: 'er' },
  { w: 'Wurst', g: 'die' },
  { w: 'Antwort', g: 'die' },
  { w: 'Arbeit', g: 'die' },
  { w: 'Musik', g: 'die' },
  { w: 'Party', g: 'die' },
  { w: 'Pizza', g: 'die' },
  // sq: підпадають під сигнал, але не входять у трійку/сигнальну групу карти (перевищення ліміту).
  // Правило на них діє — фідбек показує те саме правило, що й для сигнальних слів.
  { w: 'Prüfung', g: 'die', sq: 'ung' },
  { w: 'Erfahrung', g: 'die', sq: 'ung' },
  { w: 'Einladung', g: 'die', sq: 'ung' },
  { w: 'Sicherheit', g: 'die', sq: 'heit' },
  { w: 'Position', g: 'die', sq: 'ion' },
  { w: 'Region', g: 'die', sq: 'ion' },
  { w: 'Station', g: 'die', sq: 'ion' },
  { w: 'Funktion', g: 'die', sq: 'ion' },
  { w: 'Nase', g: 'die', sq: 'e' },
  { w: 'Erde', g: 'die', sq: 'e' },
  { w: 'Stunde', g: 'die', sq: 'e' },
  { w: 'Minute', g: 'die', sq: 'e' },
  { w: 'Sprache', g: 'die', sq: 'e' },
  { w: 'Reise', g: 'die', sq: 'e' },
  { w: 'Tasche', g: 'die', sq: 'e' },
  { w: 'Brille', g: 'die', sq: 'e' },
  { w: 'Klasse', g: 'die', sq: 'e' },
  { w: 'Familie', g: 'die', sq: 'e' },
  { w: 'Seite', g: 'die', sq: 'e' },
  { w: 'Adresse', g: 'die', sq: 'e' },
  { w: 'Tomate', g: 'die', sq: 'e' },
  { w: 'Hose', g: 'die', sq: 'e' },
  { w: 'Jacke', g: 'die', sq: 'e' },
  // das
  { w: 'Kind', g: 'das', genEs: true },
  { w: 'Baby', g: 'das' },
  { w: 'Haus', g: 'das', genEs: true },
  { w: 'Zimmer', g: 'das', collide: 'er' },
  { w: 'Fenster', g: 'das', collide: 'er' },
  { w: 'Bett', g: 'das', genEs: true },
  { w: 'Auto', g: 'das' },
  { w: 'Fahrrad', g: 'das' },
  { w: 'Buch', g: 'das', genEs: true },
  { w: 'Wort', g: 'das', genEs: true },
  { w: 'Bild', g: 'das', genEs: true },
  { w: 'Foto', g: 'das' },
  { w: 'Handy', g: 'das' },
  { w: 'Telefon', g: 'das' },
  { w: 'Radio', g: 'das' },
  { w: 'Geld', g: 'das', genEs: true },
  { w: 'Wasser', g: 'das', collide: 'er' },
  { w: 'Brot', g: 'das', genEs: true },
  { w: 'Ei', g: 'das' },
  { w: 'Fleisch', g: 'das', genEs: true },
  { w: 'Obst', g: 'das', genEs: true },
  { w: 'Bier', g: 'das', collide: 'er' },
  { w: 'Glas', g: 'das', genEs: true },
  { w: 'Messer', g: 'das', collide: 'er' },
  { w: 'Ohr', g: 'das', genEs: true },
  { w: 'Bein', g: 'das', genEs: true, collide: 'in' },
  { w: 'Herz', g: 'das', weak: 'mixed' },
  { w: 'Haar', g: 'das', genEs: true },
  { w: 'Gesicht', g: 'das' },
  { w: 'Kleid', g: 'das', genEs: true },
  { w: 'Jahr', g: 'das', genEs: true },
  { w: 'Wetter', g: 'das', collide: 'er' },
  { w: 'Land', g: 'das', genEs: true },
  { w: 'Kino', g: 'das' },
  { w: 'Hotel', g: 'das' },
  { w: 'Problem', g: 'das' },
  { w: 'Beispiel', g: 'das' },
  { w: 'Spiel', g: 'das', genEs: true },
  { w: 'Tier', g: 'das', collide: 'er' },
  { w: 'Leben', g: 'das' },
  { w: 'Geschäft', g: 'das' },

  // ─── сумнівне/регіональне — у гру НЕ потрапляє ───────────────────
  { w: 'Joghurt', g: 'der', todo: 'регіонально der/das (Duden подає обидва)' }
];
