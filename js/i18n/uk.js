// Українські тексти інтерфейсу і тем. Німецький матеріал (Nominativ, maskulin,
// der, іменники, Wer?) сюди НЕ входить — це зміст, він живе в темах і не перекладається.
// Кожна нова тема додає свої тексти лише сюди (див. SPEC §5).

export default {
  ui: {
    hub: {
      title: 'Auf Zack — граматичний тренажер',
      intro: 'Зубріння німецької граматики через інтервальне повторення. Обери тему — прогрес зберігається в цьому браузері.',
      learned: 'засвоєно',
      due: 'на черзі',
      continue: 'Продовжити'
    },
    play: {
      title: 'Auf Zack — {topic}',
      homeAria: 'До вибору теми (Auf Zack)',
      modeGroupAria: 'Режим',
      learn: 'Навчання',
      drill: 'Профілактика',
      statDue: 'на черзі',
      statLearned: 'вивчено',
      statStreak: 'серія (рекорд {best})',
      statToday: 'відповідей сьогодні',
      mapTitle: 'Карта засвоєння',
      peekShow: 'Підглянути таблицю',
      peekHide: 'Сховати таблицю',
      syncNote: 'Прогрес зберігається в цьому браузері',
      exportBtn: 'Експортувати код',
      importBtn: 'Імпортувати код',
      reset: 'Скинути прогрес',
      back: '← До вибору теми',
      notFound: 'Тему не знайдено.',
      notFoundLink: 'До вибору теми',
      resetConfirm: 'Скинути весь прогрес?'
    },
    io: {
      exportTitle: 'Код прогресу',
      exportHint: 'Скопіюй цей код і встав його на іншому пристрої через «Імпортувати код».',
      copy: 'Копіювати',
      close: 'Закрити',
      copied: 'Скопійовано.',
      copyManual: 'Скопіюй вручну: Ctrl/Cmd+C.',
      importTitle: 'Імпорт прогресу',
      importHint: 'Встав код з іншого пристрою. Поточний прогрес буде замінено.',
      importPlaceholder: 'Встав код тут',
      apply: 'Застосувати',
      errBad: 'Код пошкоджено або порожній.',
      errIncompatible: 'Несумісний код прогресу.',
      errGeneric: 'Не вдалося імпортувати.'
    },
    card: {
      new: 'нова',
      level: 'рівень {b}',
      check: 'Перевірити',
      next: 'Далі',
      enter: '(Enter)',
      gridHint: 'Познач усі клітинки таблиці з цим артиклем'
    },
    fb: {
      correct: 'Так, {a} · {sec} с',
      correctNoun: 'Так, {a} {w} · {sec} с',
      wrong: 'Ні: {rl} · {cl} → {a}',
      wrongNoun: 'Ні: {a} {w}',
      slowRetry: ' — повільно, повторимо скоріше',
      slow: ' — повільно',
      gridExact: 'Точно · {sec} с',
      gridWrong: '{a}: {where}',
      gridLegend: 'Пунктир — пропущені, червоне — зайві.'
    },
    done: {
      title: 'Готово',
      body: 'Усе, що мало бути повторено, повторено. Наступне повторення — через {t}. Між сесіями грай у профілактику: помилки там повертають картку в чергу.',
      empty: 'Натисни «Навчання», щоб почати.',
      drill: 'Профілактика'
    },
    fmt: { sec: '{n} с', min: '{n} хв', hour: '{n} год', day: '{n} дн' }
  },

  topics: {
    artikel: {
      title: 'Артиклі: der, die, das',
      subtitle: 'Відмінки і роди',
      blurb: 'Основа основ: рід і відмінок задають форму майже кожного слова в реченні.',
      kind: {
        fwd: 'Відмінок + рід',
        qst: 'Питання + рід',
        snt: 'Встав артикль',
        rev: 'Де стоїть це слово?'
      },
      why: {
        q: {
          wer: 'Wer?/Was? питає про підмет → Nominativ',
          wessen: 'Wessen? — належність → Genitiv',
          wem: 'Wem? — адресат/отримувач → Dativ',
          wo: 'Wo? — місце без переходу межі → Dativ',
          wen: 'Wen?/Was? — прямий додаток → Akkusativ',
          wohin: 'Wohin? — напрям, зміна місця → Akkusativ'
        },
        s: {
          nom_subject: 'Підмет речення → Nominativ',
          sehen: 'sehen: прямий додаток → Akkusativ (Wen?)',
          kaufen: 'kaufen: що купуємо → Akkusativ (Was?)',
          oeffnen: 'öffnen: прямий додаток → Akkusativ (Was?)',
          besuchen: 'besuchen: кого → Akkusativ (Wen?)',
          legen: 'legen — зміна місця. Wohin? → Akkusativ',
          haengen_wohin: 'hängen тут дія, напрям. Wohin? → Akkusativ',
          helfen: 'helfen керує Dativ (Wem?)',
          geben: 'geben: адресат → Dativ (Wem?)',
          mit: 'mit завжди Dativ',
          danken: 'danken керує Dativ (Wem?)',
          liegen: 'liegen — стан, місце. Wo? → Dativ',
          haengen_wo: 'hängen тут стан. Wo? → Dativ',
          genitiv: 'Належність → Genitiv (Wessen?)'
        }
      }
    }
  }
};
