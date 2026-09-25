// Тема «Прийменники». Дані — у praepositionen.data.js (для вчителя).
// Порядок усередині теми (SPEC §9 Фаза 4):
//   1) прийменник → відмінок (Akk-група, потім Dat-група);
//   2) прийменник + артикль у реченні;
//   3) злиті форми (zum, ins, am, zur, im, beim, vom);
//   4) Wechselpräpositionen через двокрокову картку;
//   5) Wechsel через дієслівні пари.
//
// Карта засвоєння (SPEC §6) — ЛИШЕ Wechsel-таблиця (відмінок × рід): блоки 1–3 —
// інше знання (вибір відмінка, злиття), у сітку der/die/das їх не зводиш, тож їхні
// картки не мають `cell` і в карту не потрапляють (heat.js ігнорує картки без cell).
import { FIXED, SENT, MERGE, WECHSEL, VERBS } from './praepositionen.data.js';

// Ті самі кольори артиклів, що в artikel/wechsel (спільна мнемоніка таблиці).
const ARTS = ['der', 'die', 'das', 'des', 'dem', 'den'];
const COLORS = { der: '#16C1E3', die: '#BDF45F', das: '#D3D6DE', des: '#FF6BCB', dem: '#FF6040', den: '#FFB957' };

// Артикль за відмінком і родом (лише dat/akk — виходи Wechsel).
const T = {
  dat: { m: 'dem', f: 'der', n: 'dem' },
  akk: { m: 'den', f: 'die', n: 'das' }
};
const CASES = [
  { k: 'dat', label: 'Dativ', hint: 'Wo? — місце' },
  { k: 'akk', label: 'Akkusativ', hint: 'Wohin? — напрям' }
];
const GENDERS = [{ k: 'm', label: 'maskulin' }, { k: 'f', label: 'feminin' }, { k: 'n', label: 'neutrum' }];
const caseLabel = k => CASES.find(c => c.k === k).label;
const genderLabel = k => GENDERS.find(g => g.k === k).label;

const CASE_OPTIONS = ['Akkusativ', 'Dativ'];
const STEP1 = ['Wo?', 'Wohin?'];

// Пропорційне перемежовування (Брезенгем, як у genus): бере з тієї черги, що
// найбільше відстала від своєї частки, тож хвіст довшої групи не збивається в
// серію. avoid забороняє 3-тю однакову відповідь підряд (беремо іншого кандидата,
// а коли альтернативи нема — найкращого за дефіцитом). Жива черга (session.js,
// SPEC §3) тримає це саме правило й у рантаймі.
function interleave(queues, avoid) {
  const qs = queues.filter(q => q.length);
  const total = qs.reduce((s, q) => s + q.length, 0);
  const n = qs.map(q => q.length);
  const done = qs.map(() => 0);
  const out = [];
  while (out.length < total) {
    const t = out.length + 1;
    const order = qs
      .map((_, i) => ({ i, deficit: t * n[i] / total - done[i], left: n[i] - done[i] }))
      .filter(c => c.left > 0)
      .sort((a, b) => b.deficit - a.deficit || b.left - a.left);
    const ok = avoid && order.find(c => !avoid(qs[c.i][done[c.i]], out));
    const pick = ok || order[0];
    out.push(qs[pick.i][done[pick.i]]);
    done[pick.i]++;
  }
  return out;
}
const avoidSameAnswer = get => (card, out) => out.length >= 2 &&
  get(out[out.length - 1]) === get(card) && get(out[out.length - 2]) === get(card);

// ── Блок 1: прийменник → відмінок (choice з власними кнопками Akkusativ/Dativ) ──
const inPlay = list => list.filter(d => !d.todo);
const block1 = interleave(
  [inPlay(FIXED).filter(d => d.c === 'akk'), inPlay(FIXED).filter(d => d.c === 'dat')],
  avoidSameAnswer(d => d.c)
).map(d => ({
  id: `p1-${d.p}`, type: 'choice', kind: 'Який відмінок?',
  prompt: d.p, options: CASE_OPTIONS,      // власні кнопки картки (не topic.answers)
  answer: d.c === 'akk' ? 'Akkusativ' : 'Dativ',
  why: d.why
  // без cell: блок не входить у карту засвоєння
}));

// ── Блок 2: прийменник + артикль у реченні (sentence, кнопки — артиклі теми) ────
const block2 = SENT.map((d, i) => ({
  id: `p2-${i}`, type: 'sentence', kind: 'Встав артикль',
  prompt: d.text, answer: T[d.c][d.g], why: d.why
}));

// ── Блок 3: злиті форми (choice, власні кнопки — усі 7 злитих форм) ─────────────
const MERGE_OPTIONS = MERGE.map(d => d.merge);
const block3 = MERGE.map((d, i) => ({
  id: `p3-${i}`, type: 'sentence', kind: 'Злита форма',
  prompt: d.text, options: MERGE_OPTIONS, answer: d.merge, why: d.why
}));

// ── Блок 4: Wechselpräpositionen (двокрокова картка) ───────────────────────────
const block4 = inPlay(WECHSEL).map((d, i) => ({
  id: `p4-${i}`, type: 'twostep', kind: 'Wo? чи Wohin? + артикль',
  prompt: d.text,
  step1: { options: STEP1, answer: d.c === 'akk' ? 'Wohin?' : 'Wo?', why: d.why1 },
  answer: T[d.c][d.g], cell: { row: d.c, col: d.g },
  why: `${caseLabel(d.c)} ${genderLabel(d.g)} → ${T[d.c][d.g]}`
}));

// ── Блок 5: Wechsel через дієслівні пари (двокрокова картка) ────────────────────
const block5 = inPlay(VERBS).map((d, i) => ({
  id: `p5-${i}`, type: 'twostep', kind: 'Дієслово: місце чи напрям?',
  prompt: d.text,
  step1: { options: STEP1, answer: d.c === 'akk' ? 'Wohin?' : 'Wo?', why: d.why1 },
  answer: T[d.c][d.g], cell: { row: d.c, col: d.g },
  why: `${d.verbs}: ${caseLabel(d.c)} ${genderLabel(d.g)} → ${T[d.c][d.g]}`
}));

const cards = [...block1, ...block2, ...block3, ...block4, ...block5];

const logo = `<span class="tl-word">Präpositionen</span>` +
  ['der', 'die', 'das'].map(a => `<span class="tl-pill" style="background:${COLORS[a]}">${a}</span>`).join('');

export default {
  id: 'praepositionen',
  title: 'Прийменники',
  subtitle: 'Відмінок після прийменника',
  blurb: 'Найвища віддача на час: прийменник задає відмінок, а Wechsel — за зміною локації, не за «рухом».',
  logo,
  answers: ARTS,          // кнопки за замовчуванням (блок 2, крок 2 двокрокових карток)
  colors: COLORS,
  matrix: {               // карта засвоєння — лише Wechsel (відмінок × рід)
    rows: CASES,
    cols: GENDERS,
    value: (row, col) => T[row][col]
  },
  cards
};
