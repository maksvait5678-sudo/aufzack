// Дані теми «Рід іменників» — ДЛЯ ПЕРЕВІРКИ ВЧИТЕЛЕМ.
// Формат: { w, g, s?, sx?, weak?, genEs?, pl?, todo? }
//   w   — слово (Nominativ Singular).
//   g   — рід: 'der' | 'die' | 'das'.
//   s   — сигнал, під який слово підпадає (метадані для підказки; стоїть на ВСІХ таких словах).
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
  { w: 'Prüfung', g: 'die', s: 'ung' },
  { w: 'Erfahrung', g: 'die', s: 'ung' },
  { w: 'Einladung', g: 'die', s: 'ung' },
  // -heit: абстрактна якість → die
  { w: 'Freiheit', g: 'die', s: 'heit' },
  { w: 'Gesundheit', g: 'die', s: 'heit' },
  { w: 'Krankheit', g: 'die', s: 'heit' },
  { w: 'Wahrheit', g: 'die', s: 'heit' },
  { w: 'Kindheit', g: 'die', s: 'heit' },
  { w: 'Sicherheit', g: 'die', s: 'heit' },
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
  { w: 'Position', g: 'die', s: 'ion' },
  { w: 'Region', g: 'die', s: 'ion' },
  { w: 'Station', g: 'die', s: 'ion' },
  { w: 'Funktion', g: 'die', s: 'ion' },
  // -e (ненаголошене schwa): зазвичай die
  { w: 'Blume', g: 'die', s: 'e' },
  { w: 'Katze', g: 'die', s: 'e' },
  { w: 'Lampe', g: 'die', s: 'e' },
  { w: 'Straße', g: 'die', s: 'e' },
  { w: 'Sonne', g: 'die', s: 'e' },
  { w: 'Nase', g: 'die', s: 'e' },
  { w: 'Erde', g: 'die', s: 'e' },
  { w: 'Woche', g: 'die', s: 'e' },
  { w: 'Stunde', g: 'die', s: 'e' },
  { w: 'Minute', g: 'die', s: 'e' },
  { w: 'Frage', g: 'die', s: 'e' },
  { w: 'Sprache', g: 'die', s: 'e' },
  { w: 'Reise', g: 'die', s: 'e' },
  { w: 'Tasche', g: 'die', s: 'e' },
  { w: 'Brille', g: 'die', s: 'e' },
  { w: 'Schule', g: 'die', s: 'e' },
  { w: 'Klasse', g: 'die', s: 'e' },
  { w: 'Familie', g: 'die', s: 'e' },
  { w: 'Seite', g: 'die', s: 'e' },
  { w: 'Adresse', g: 'die', s: 'e' },
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
  { w: 'Arbeiter', g: 'der', s: 'er' },
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

  // ─── винятки (sx: слово матчить сигнал, але рід інший) ───────────
  { w: 'Auge', g: 'das', sx: 'e' },
  { w: 'Ende', g: 'das', sx: 'e', genEs: true },
  { w: 'Käse', g: 'der', sx: 'e' },
  { w: 'Gemüse', g: 'das', sx: 'e' },
  { w: 'Junge', g: 'der', sx: 'e', weak: true },
  { w: 'Name', g: 'der', sx: 'e', weak: 'mixed' },
  { w: 'Kuchen', g: 'der', sx: 'chen' },
  { w: 'Baum', g: 'der', sx: 'um', genEs: true },

  // ─── без сигналу: рід учиться напам'ять ──────────────────────────
  // der
  { w: 'Tisch', g: 'der', genEs: true },
  { w: 'Stuhl', g: 'der', genEs: true },
  { w: 'Schrank', g: 'der', genEs: true },
  { w: 'Mann', g: 'der', genEs: true },
  { w: 'Mensch', g: 'der', genEs: true, weak: true },
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
  { w: 'Wein', g: 'der', genEs: true },
  { w: 'Salat', g: 'der' },
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
  // die
  { w: 'Frau', g: 'die' },
  { w: 'Mutter', g: 'die' },
  { w: 'Tochter', g: 'die' },
  { w: 'Schwester', g: 'die' },
  { w: 'Nacht', g: 'die' },
  { w: 'Zeit', g: 'die' },
  { w: 'Hand', g: 'die' },
  { w: 'Uhr', g: 'die' },
  { w: 'Stadt', g: 'die' },
  { w: 'Wand', g: 'die' },
  { w: 'Insel', g: 'die' },
  { w: 'Luft', g: 'die' },
  { w: 'Milch', g: 'die' },
  { w: 'Butter', g: 'die' },
  { w: 'Wurst', g: 'die' },
  { w: 'Antwort', g: 'die' },
  { w: 'Arbeit', g: 'die' },
  { w: 'Musik', g: 'die' },
  { w: 'Party', g: 'die' },
  { w: 'Pizza', g: 'die' },
  // das
  { w: 'Kind', g: 'das', genEs: true },
  { w: 'Baby', g: 'das' },
  { w: 'Haus', g: 'das', genEs: true },
  { w: 'Zimmer', g: 'das' },
  { w: 'Fenster', g: 'das' },
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
  { w: 'Wasser', g: 'das' },
  { w: 'Brot', g: 'das', genEs: true },
  { w: 'Fleisch', g: 'das', genEs: true },
  { w: 'Obst', g: 'das', genEs: true },
  { w: 'Bier', g: 'das' },
  { w: 'Glas', g: 'das', genEs: true },
  { w: 'Messer', g: 'das' },
  { w: 'Ohr', g: 'das', genEs: true },
  { w: 'Bein', g: 'das', genEs: true },
  { w: 'Herz', g: 'das', weak: 'mixed' },
  { w: 'Haar', g: 'das', genEs: true },
  { w: 'Gesicht', g: 'das' },
  { w: 'Kleid', g: 'das', genEs: true },
  { w: 'Jahr', g: 'das', genEs: true },
  { w: 'Wetter', g: 'das' },
  { w: 'Land', g: 'das', genEs: true },
  { w: 'Kino', g: 'das' },
  { w: 'Hotel', g: 'das' },
  { w: 'Problem', g: 'das' },
  { w: 'Beispiel', g: 'das' },
  { w: 'Spiel', g: 'das', genEs: true },
  { w: 'Tier', g: 'das' },
  { w: 'Leben', g: 'das' },
  { w: 'Geschäft', g: 'das' },

  // ─── сумнівне/регіональне — у гру НЕ потрапляє ───────────────────
  { w: 'Joghurt', g: 'der', todo: 'регіонально der/das (Duden подає обидва)' }
];
