import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {DISC_AT, DISC_LEN, FPS, fontFamily, vf} from './theme';
import {clamp, Grain, Watermark} from './lib';
import * as I from './scenes/intro';
import * as K from './kit';

const OV = 10;

type AnyScene = React.FC<any>;
type Cue = {t: number; C: AnyScene; p?: Record<string, unknown>; sfx?: [number, string, number][]; noOv?: boolean};

const ch = (t: number, num: string, img: string, l1: string, l2: string, at2: number, accent: K.Accent = 'cyan'): Cue => ({
  t,
  C: K.Chapter,
  p: {num, img, l1, l2, at2, accent},
  sfx: [
    [t - 1.2, 'riser', 0.3],
    [t + 0.1, 'impact', 0.55],
  ],
});
const st = (t: number, p: Omit<K.StatementP, 'start' | 'dur'>): Cue => ({t, C: K.Statement, p});

const CUES: Cue[] = [
  // ---------------- Intro (hand-built scenes) ----------------
  {t: 0, C: I.Logo},
  {t: 3.3, C: I.Topic},
  {t: 5.8, C: I.CouponBuild},
  {t: 14.9, C: I.OneLoss},
  {t: 20.8, C: I.SmallOdds},
  {t: 25.15, C: I.AlmostWin},
  {t: 30.9, C: I.Balance},
  {t: 33.55, C: I.Agenda},
  {t: 42.85, C: I.NoPromises, noOv: true},
  {t: DISC_AT, C: I.Chapter1},
  {t: 51.45, C: I.Evening},
  {t: 64.9, C: I.ModestOdds},

  // ---------------- 01 · Купон, который кажется очевидным ----------------
  st(73.4, {
    img: 'couch-bet.png',
    lines: [
      {t: 'Один исход — [скучно]', at: 73.7, size: 80},
      {t: 'Вместе — [заметная цифра]', at: 77.1, size: 80, accent: 'gold'},
    ],
  }),
  {
    t: 80.0,
    C: K.CouponScene,
    p: {
      img: 'laptop-notes.png',
      blur: true,
      kicker: 'Собираем экспресс',
      totalAt: 82.9,
      stake: 1000,
      rows: [
        {name: 'Вектор — Титан', odd: 1.15, at: 82.9},
        {name: 'Атлант — Метеор', odd: 1.2, at: 83.1},
        {name: 'Звезда — Рубикон', odd: 1.25, at: 83.3},
        {name: 'Орион — Сокол', odd: 1.22, at: 85.1, tag: 'НАДЁЖНО?'},
        {name: 'Гранит — Нептун', odd: 1.18, at: 89.3, tag: 'РАДИ КОЭФ.'},
      ],
      note: [
        {t: 'Не набор решений,', at: 94.3, accent: 'cyan'},
        {t: 'а [одна большая ставка]', at: 96.9, accent: 'gold'},
      ],
    },
    sfx: [
      [82.9, 'tick', 0.45],
      [85.1, 'tick', 0.45],
      [89.3, 'tick', 0.45],
      [96.9, 'impact', 0.35],
    ],
  },
  st(99.0, {
    img: 'tightrope.png',
    kicker: 'Ощущение',
    lines: [
      {t: 'Ничего [рискованного]?', at: 99.4, size: 92},
      {t: 'Ни одной сенсационной победы аутсайдера в купоне', at: 102.3, sub: true},
    ],
  }),
  {
    t: 105.6,
    C: K.MatchRun,
    p: {
      img: 'fan-nervous.png',
      blur: true,
      title: '[Начинаются] матчи',
      tAt: 105.7,
      outs: [
        {o: 'win', at: 107.4},
        {o: 'win', at: 109.0},
        {o: 'win', at: 110.2},
        {o: 'win', at: 112.6},
        {o: 'live', at: 0},
      ],
      payout: {at: 114.7, value: 2071},
      verdict: 'Остался один матч',
      vAt: 117.2,
      vAccent: 'gold',
    },
    sfx: [
      [107.4, 'tick', 0.45],
      [109.0, 'tick', 0.45],
      [110.2, 'tick', 0.45],
      [112.6, 'tick', 0.45],
      [114.7, 'riser', 0.25],
    ],
  },
  st(118.8, {
    img: 'keeper-dive.png',
    kicker: 'Последний матч · 87′',
    lines: [
      {t: 'Фаворит [атакует]', at: 119.1, size: 92, accent: 'green'},
      {t: '…но не забивает', at: 121.4, size: 92},
      {t: 'Финал — [1:1]', at: 124.4, size: 110, accent: 'red'},
    ],
    shakeAt: 124.6,
    flashAt: 124.6,
    flashRed: true,
  }),
  {
    t: 125.7,
    C: K.MatchRun,
    p: {
      img: 'kitchen-shock.png',
      blur: true,
      outs: [
        {o: 'win', at: 125.7},
        {o: 'win', at: 125.7},
        {o: 'win', at: 125.7},
        {o: 'win', at: 125.7},
        {o: 'draw', at: 126.0},
      ],
      verdict: 'Экспресс проиграл полностью',
      vAt: 126.6,
    },
    sfx: [[126.0, 'impact', 0.7]],
  },
  {t: 131.8, C: K.Quote, p: {img: 'floor-despair.png', text: 'Ну это же надо! Всё зашло, кроме одного!', at: 132.6, accent: 'red', kicker: 'Первая мысль'}},
  st(137.0, {
    img: 'runner-fall.png',
    kicker: 'Правило экспресса',
    lines: [
      {t: '[4 из 5] верных —', at: 140.3, size: 96, accent: 'green'},
      {t: 'это не «почти выигрыш»', at: 144.0, size: 80},
      {t: 'Это проигрыш', at: 146.0, size: 120, color: 'red'},
    ],
    flashAt: 146.0,
    flashRed: true,
  }),

  // ---------------- 02 · Маленькие коэффициенты ----------------
  ch(148.8, '02', 'iceberg.png', 'Маленькие коэффициенты', 'обманывают', 150.6),
  st(153.2, {
    img: 'puzzle-lamp.png',
    lines: [
      {t: 'Коэффициент [1,20]', at: 154.4, size: 110},
      {t: 'воспринимается как очень вероятный исход', at: 157.5, sub: true},
      {t: 'И зачастую так оно и есть', at: 160.4, sub: true},
    ],
  }),
  st(162.4, {
    img: 'chain-break.png',
    kicker: 'Где ошибка',
    lines: [
      {t: 'Надёжность [одного матча]', at: 163.4, size: 80},
      {t: '≠ надёжность [всей цепочки]', at: 166.0, size: 80, accent: 'red'},
      {t: 'Для выплаты должны выполниться [все условия сразу]', at: 171.2, sub: true, accent: 'gold'},
    ],
  }),
  {
    t: 176.6,
    C: K.ProbChain,
    p: {img: 'lab-microscope.png', blur: true, n: 5, pct: 80, kicker: 'Условный пример · 5 независимых событий', showAt: 179.0, resultAt: 194.0, result: '≈33%', caption: 'Купон выигрывает [≈ 1 раз из 3]', captionAt: 201.7},
    sfx: [
      [179.0, 'tick', 0.4],
      [194.0, 'riser', 0.25],
      [194.8, 'impact', 0.5],
    ],
  },
  {
    t: 206.3,
    C: K.ProbChain,
    p: {img: 'spiral-stairs.png', blur: true, n: 10, pct: 80, kicker: 'А если событий десять?', showAt: 206.8, resultAt: 214.5, result: '≈11%', caption: 'Не должно ошибиться [ни одно из десяти]', captionAt: 220.6},
    sfx: [
      [206.8, 'tick', 0.4],
      [214.5, 'riser', 0.25],
      [215.3, 'impact', 0.55],
    ],
  },
  st(224.6, {
    img: 'puzzle-lamp.png',
    zoom: 'out',
    kicker: 'Важная оговорка',
    lines: [
      {t: 'Только для [независимых] событий', at: 226.7, size: 76},
      {t: 'Разные матчи без существенной связи между исходами', at: 229.1, sub: true},
      {t: 'Связанные события — простое перемножение [не подходит]', at: 233.3, sub: true, accent: 'red'},
      {t: '+1 условие ≠ [легче выиграть]', at: 241.0, size: 70, accent: 'gold'},
    ],
  }),

  // ---------------- 03 · Что означает коэффициент ----------------
  ch(246.1, '03', 'analyst-monitors.png', 'Что на самом деле', 'означает коэффициент', 247.3),
  {
    t: 252.8,
    C: K.Money,
    p: {img: 'coins-city.png', blur: true, odd: 1.2, stake: 1000, sAt: 255.9, winAt: 258.6, loseAt: 261.1},
    sfx: [
      [258.6, 'tick', 0.5],
      [261.1, 'impact', 0.5],
    ],
  },
  st(263.7, {
    img: 'phone-smile.png',
    lines: [
      {t: '«Он же [почти наверняка] зайдёт»', at: 264.0, size: 72, accent: 'gold'},
      {t: 'Бессмысленно', at: 269.1, size: 110, color: 'red'},
      {t: 'Важно, какую вероятность [предполагает цена]', at: 270.2, sub: true},
    ],
    flashAt: 269.1,
    flashRed: true,
  }),
  {
    t: 274.4,
    C: K.BigStat,
    p: {
      img: 'analyst-monitors.png',
      blur: true,
      kicker: 'Безубыточность при 1,20',
      from: 50,
      to: 83.3,
      decimals: 1,
      suffix: '%',
      at: 279.6,
      accent: 'cyan',
      caption: 'нужная вероятность успеха',
      cAt: 280.6,
      sub: '1 ÷ 1,20 ≈ [0,833]',
      sAt: 281.6,
    },
    sfx: [[279.6, 'impact', 0.4]],
  },
  st(283.0, {
    img: 'analyst-monitors.png',
    zoom: 'out',
    kicker: 'Нюанс',
    panel: true,
    lines: [
      {t: 'Коэффициент ≠ [реальный шанс]', at: 285.3, size: 66},
      {t: 'В линии обычно есть [маржа]', at: 290.4, sub: true, accent: 'gold'},
      {t: 'А сама оценка может быть неточной', at: 292.3, sub: true},
      {t: '1,20 ≠ «[точно 83%]»', at: 294.9, size: 66, accent: 'red'},
    ],
  }),
  {
    t: 305.0,
    C: K.CouponScene,
    p: {
      img: 'neon-coupon.png',
      kicker: 'Возвращаемся к примеру',
      totalAt: 317.2,
      stake: 1000,
      rows: [
        {name: 'Матч 1 · шанс 80%', odd: 1.2, at: 312.4},
        {name: 'Матч 2 · шанс 80%', odd: 1.2, at: 312.6},
        {name: 'Матч 3 · шанс 80%', odd: 1.2, at: 312.8},
        {name: 'Матч 4 · шанс 80%', odd: 1.2, at: 313.0},
        {name: 'Матч 5 · шанс 80%', odd: 1.2, at: 313.2},
      ],
      note: [
        {t: 'Реальный шанс — [80%]', at: 308.1, accent: 'green'},
        {t: 'Общий коэф. [2,49]', at: 318.8, accent: 'gold'},
        {t: 'Шанс купона [≈33%]', at: 326.9, accent: 'red'},
      ],
    },
    sfx: [
      [312.4, 'tick', 0.4],
      [318.8, 'impact', 0.35],
      [326.9, 'impact', 0.45],
    ],
  },
  {
    t: 332.1,
    C: K.EVChart,
    p: {img: 'glass-dice.png', blur: true, at: 333.0, value: '−18,5%', caption: 'средний результат от суммы каждой ставки', cAt: 339.8},
    sfx: [[339.8, 'impact', 0.5]],
  },
  st(344.5, {
    img: 'glass-dice.png',
    kicker: 'Важно понимать',
    lines: [
      {t: 'Не прогноз купона', at: 344.6, size: 72},
      {t: 'Не универсальная цифра', at: 346.8, size: 72},
      {t: 'Небольшая невыгодность коэффициентов [усиливается] при перемножении', at: 349.8, sub: true, accent: 'red'},
    ],
  }),

  // ---------------- 04 · Ловушка «ещё один матч» ----------------
  ch(358.2, '04', 'jenga-pull.png', 'Ловушка', '«добавлю ещё один»', 359.4, 'gold'),
  {
    t: 365.8,
    C: K.CouponScene,
    p: {
      img: 'jenga-fall.png',
      blur: true,
      kicker: 'Всего один матч',
      totalAt: 367.4,
      stake: 1000,
      rows: [
        {name: 'Вектор — Титан', odd: 1.25, at: 366.0},
        {name: 'Атлант — Метеор', odd: 1.2, at: 366.2},
        {name: 'Звезда — Рубикон', odd: 1.25, at: 366.4},
        {name: 'Орион — Сокол', odd: 1.3, at: 366.6},
        {name: 'Гранит — Нептун', odd: 1.23, at: 366.8},
        {name: 'Факел — Буран', odd: 1.1, at: 377.2, tag: '«ОЧЕВИДНЫЙ»'},
      ],
      note: [
        {t: 'Выплата [+10%]', at: 385.8, accent: 'green'},
        {t: '+1 причина [проиграть]', at: 389.9, accent: 'red'},
        {t: 'Весь экспресс [потерян]', at: 399.5, accent: 'red'},
      ],
    },
    sfx: [
      [377.2, 'tick', 0.5],
      [385.8, 'tick', 0.45],
      [389.9, 'impact', 0.4],
      [399.5, 'impact', 0.55],
    ],
  },
  st(401.7, {
    img: 'bait-hook.png',
    kicker: 'Обратите внимание на мотив',
    lines: [
      {t: 'Не новое [выгодное] событие', at: 404.1, size: 76, accent: 'green'},
      {t: 'а желание [красивой цифры]', at: 407.7, size: 76, accent: 'gold'},
      {t: 'Анализ подменяется желанием. Стоит честно различать эти две вещи', at: 411.5, sub: true},
    ],
  }),
  {
    t: 419.2,
    C: K.ListCard,
    p: {
      img: 'eggs-basket.png',
      kicker: 'Длинный экспресс',
      title: 'Матчи добавляют [автоматически]',
      tAt: 419.3,
      items: [
        {t: 'Известный клуб', at: 425.1, mark: '?'},
        {t: 'Кто-то посоветовал', at: 427.5, mark: '?'},
        {t: 'Мало забивают', at: 430.0, mark: '?'},
        {t: 'С ним коэффициент [выше]', at: 432.4, mark: '?', accent: 'gold'},
      ],
      footer: 'Коллекция разрозненных предположений',
      fAt: 437.3,
      fAccent: 'gold',
    },
    sfx: [
      [425.1, 'tick', 0.4],
      [427.5, 'tick', 0.4],
      [430.0, 'tick', 0.4],
      [432.4, 'tick', 0.4],
      [437.3, 'impact', 0.35],
    ],
  },

  // ---------------- 05 · Последний матч ----------------
  ch(443.7, '05', 'referee-rain.png', 'Последний матч', 'больнее всего', 445.2, 'red'),
  {
    t: 450.8,
    C: K.Compare,
    p: {
      img: 'fan-nervous.png',
      blur: true,
      kicker: 'Психология',
      vs: '≠',
      cols: [
        {title: 'Мимо первый матч', at: 450.9, accent: 'cyan', rows: [{t: 'Всё заканчивается быстро', at: 452.9}, {t: 'Обидно, но понятно', at: 454.8}]},
        {title: '4 зашли, 5-й идёт', at: 456.7, accent: 'gold', rows: [{t: 'Мозг ведёт себя [иначе]', at: 461.3}]},
      ],
    },
  },
  {
    t: 463.6,
    C: K.MatchRun,
    p: {
      img: 'fan-nervous.png',
      title: 'Выплата кажется [почти вашей]',
      tAt: 463.8,
      outs: [
        {o: 'win', at: 463.6},
        {o: 'win', at: 463.6},
        {o: 'win', at: 463.6},
        {o: 'win', at: 463.6},
        {o: 'live', at: 0},
      ],
      payout: {at: 466.0, value: 24880},
      verdict: 'Но ничего ещё не выиграно',
      vAt: 470.2,
      vAccent: 'gold',
    },
    sfx: [[466.0, 'riser', 0.25]],
  },
  st(472.6, {
    img: 'tired-laptop.png',
    lines: [
      {t: 'Чем дольше последний матч —', at: 472.7, size: 70},
      {t: 'тем сильнее чувство, что у вас [отнимают своё]', at: 475.2, size: 70, accent: 'red'},
    ],
  }),
  st(480.7, {
    img: 'ball-net.png',
    kicker: '90′',
    lines: [
      {t: 'Гол на [90-й минуте]', at: 480.8, size: 92, accent: 'red'},
      {t: '= личная [несправедливость]', at: 485.2, size: 80, accent: 'red'},
      {t: '«В следующий раз точно доедет» — и новый экспресс без разбора старого', at: 487.5, sub: true},
    ],
    shakeAt: 481.3,
    flashAt: 481.3,
    flashRed: true,
  }),
  st(496.8, {
    img: 'glass-dice.png',
    zoom: 'out',
    kicker: 'Факт',
    lines: [
      {t: '4 выигранных события', at: 496.9, size: 80},
      {t: 'не делают 5-е [вероятнее]', at: 498.9, size: 80, accent: 'red'},
      {t: 'У матча нет обязанности закончиться так, как удобно вашему купону', at: 503.9, sub: true},
    ],
  }),
  st(513.6, {
    img: 'tightrope.png',
    zoom: 'out',
    kicker: 'Эффект близкого промаха',
    lines: [
      {t: 'Не хватило [одного шага]', at: 516.6, size: 86, accent: 'gold'},
      {t: '→ хочется повторить попытку', at: 520.1, sub: true},
    ],
  }),
  {
    t: 521.9,
    C: K.Compare,
    p: {
      img: 'runner-fall.png',
      blur: true,
      kicker: 'По финансовому результату',
      vs: '=',
      cols: [
        {title: 'Прошли 4 из 5', at: 522.0, accent: 'gold', rows: [{t: '✓ ✓ ✓ ✓ ✕', at: 524.0}], big: '−100%', bigAt: 530.9},
        {title: 'Прошли 0 из 5', at: 529.2, accent: 'red', rows: [{t: '✕ ✕ ✕ ✕ ✕', at: 529.4}], big: '−100%', bigAt: 531.4},
      ],
      footer: 'Ставка проиграна [в обоих случаях]',
      fAt: 533.5,
    },
    sfx: [
      [530.9, 'impact', 0.4],
      [531.4, 'impact', 0.4],
    ],
  },

  // ---------------- 06 · Огромные выигрыши в сети ----------------
  ch(536.6, '06', 'winner-confetti.png', 'Огромные выигрыши', 'в сети', 538.2, 'gold'),
  {
    t: 540.5,
    C: K.Survivorship,
    p: {img: 'winner-confetti.png', blur: true, postAt: 541.0, pileAt: 553.2, caption: 'Полная история [почти никогда] не видна', cAt: 556.2},
    sfx: [
      [541.0, 'whoosh', 0.3],
      [553.2, 'riser', 0.3],
    ],
  },
  st(563.5, {
    img: 'players-celebrate.png',
    kicker: 'Искажённая картина',
    lines: [
      {t: 'Удачным скриншотом [делятся]', at: 563.6, size: 72, accent: 'green'},
      {t: 'Проигрыши [не фотографируют]', at: 567.1, size: 72, accent: 'red'},
      {t: 'Кажется, что большие выигрыши случаются намного чаще, чем на самом деле', at: 572.1, sub: true},
    ],
  }),
  {
    t: 580.2,
    C: K.Compare,
    p: {
      img: 'laptop-notes.png',
      blur: true,
      kicker: 'Ещё один нюанс',
      vs: '≠',
      cols: [
        {title: 'Крупная выплата', at: 581.9, accent: 'green', rows: [{t: 'Один красивый купон', at: 587.8}], big: '+156 200 ₽', bigAt: 582.6},
        {title: 'Прибыль за год', at: 584.0, accent: 'cyan', rows: [{t: 'Сумма [всех] ставок', at: 590.6}, {t: 'Все выигрыши и проигрыши', at: 592.8}], big: '?', bigAt: 585.0},
      ],
      footer: 'Именно этой информации [обычно не хватает]',
      fAt: 595.9,
    },
  },

  // ---------------- 07 · Что выгодно букмекеру ----------------
  ch(599.5, '07', 'funnel-gold.png', 'Что здесь выгодно', 'букмекеру', 600.6, 'gold'),
  st(605.2, {
    img: 'referee-rain.png',
    kicker: 'Роль букмекера',
    lines: [
      {t: 'Контора не следит лично за вашим купоном', at: 605.3, sub: true},
      {t: 'Никто не [управляет] исходом', at: 611.4, size: 80},
      {t: 'Купон проигрывает, когда [одно условие] не выполнено', at: 616.2, size: 56, accent: 'red'},
    ],
  }),
  {
    t: 621.3,
    C: K.Compare,
    p: {
      img: 'funnel-gold.png',
      blur: true,
      kicker: 'Маржа в коэффициентах',
      cols: [
        {title: 'Справедливая цена', at: 625.1, accent: 'green', rows: [{t: 'Шанс 80% → коэф. [1,25]', at: 627.2}, {t: '1,25⁵', at: 628.5}], big: '3,05', bigAt: 629.0},
        {title: 'Цена с маржой', at: 629.6, accent: 'red', rows: [{t: 'Предлагают [1,20]', at: 630.0}, {t: '1,20⁵', at: 630.8}], big: '2,49', bigAt: 631.4},
      ],
      footer: 'Объединение [усиливает] недостаток игрока',
      fAt: 632.8,
    },
    sfx: [
      [629.0, 'tick', 0.45],
      [631.4, 'impact', 0.4],
    ],
  },
  st(636.5, {
    img: 'rope-bridge.png',
    lines: [
      {t: 'Длинный купон ≠ [большая выгода]', at: 636.6, size: 80, accent: 'red'},
      {t: 'Иногда это просто [более редкая] выплата', at: 642.1, size: 64, accent: 'gold'},
    ],
  }),
  st(645.9, {
    img: 'coins-city.png',
    kicker: 'Эмоции',
    warm: true,
    lines: [
      {t: 'Мечта о [большой сумме]', at: 649.5, size: 86, accent: 'gold'},
      {t: 'при сравнительно небольшой ставке', at: 651.1, sub: true},
      {t: 'подталкивает добавлять события и [играть чаще]', at: 653.5, sub: true, accent: 'red'},
      {t: 'Смотрите, какое поведение [формирует продукт]', at: 659.5, size: 52},
    ],
  }),

  // ---------------- 08 · Экспресс vs одиночные ----------------
  ch(665.2, '08', 'keeper-dive.png', 'Экспресс и одиночные', 'не одно и то же', 667.0),
  {t: 669.3, C: K.Quote, p: {img: 'couch-bet.png', blur: true, text: 'Я бы всё равно поставил на эти пять матчей по отдельности. Какая разница?', at: 669.6, accent: 'cyan', size: 64, who: 'частый аргумент'}},
  {
    t: 677.1,
    C: K.Compare,
    p: {
      img: 'puzzle-lamp.png',
      blur: true,
      kicker: 'Разница принципиальная',
      cols: [
        {
          title: 'Одиночные',
          at: 679.4,
          accent: 'cyan',
          rows: [
            {t: 'Один промах [не обнуляет] остальные', at: 681.0},
            {t: 'Тоже могут быть убыточными', at: 693.3},
          ],
        },
        {
          title: 'Экспресс',
          at: 685.5,
          accent: 'red',
          rows: [
            {t: 'Пройдут [все] — или купон проиграл', at: 687.3},
            {t: 'Риск зависит от коэф. и сумм', at: 697.6},
          ],
        },
      ],
      footer: 'Разные способы [распределить риск]',
      fAt: 707.4,
    },
  },
  st(711.0, {
    img: 'drowning-ring.png',
    kicker: 'Кэшаут',
    lines: [
      {t: 'Кэшаут ≠ [страховка]', at: 715.4, size: 96, accent: 'red'},
      {t: 'Сумма выкупа может быть существенно ниже потенциальной выплаты', at: 719.9, sub: true},
      {t: 'Это [не гарантия] спасения плохого решения', at: 725.1, sub: true, accent: 'red'},
    ],
  }),

  // ---------------- 09 · Попытка отыграться ----------------
  ch(731.2, '09', 'tunnel.png', 'Когда экспресс —', 'попытка отыграться', 732.7, 'red'),
  {
    t: 739.2,
    C: K.ListCard,
    p: {
      img: 'spiral-stairs.png',
      kicker: 'Спираль отыгрыша',
      title: 'Следующая попытка «должна» [всё вернуть]',
      tAt: 739.3,
      items: [
        {t: 'Событий не 5, а [7]', at: 746.7, mark: '↑', accent: 'red'},
        {t: 'Сумма ставки [больше]', at: 751.0, mark: '↑', accent: 'red'},
        {t: 'Коэффициент, чтобы [закрыть все потери]', at: 753.2, mark: '↑', accent: 'red'},
      ],
    },
    sfx: [
      [746.7, 'tick', 0.45],
      [751.0, 'tick', 0.45],
      [753.2, 'tick', 0.45],
    ],
  },
  st(760.7, {
    img: 'tunnel.png',
    zoom: 'out',
    lines: [
      {t: 'Меняется [сама цель]', at: 760.8, size: 96, accent: 'red'},
      {t: 'Уже не оценка событий, а попытка избавиться от ощущения потери', at: 763.0, sub: true},
      {t: 'Решения ради отыгрыша — [ещё рискованнее]', at: 771.3, size: 56, accent: 'red'},
    ],
  }),
  {
    t: 776.8,
    C: K.ListCard,
    p: {
      img: 'tired-laptop.png',
      kicker: 'Если вы узнаёте себя',
      items: [
        {t: '[Остановиться], а не искать «надёжный» купон', at: 778.8, mark: '01', accent: 'green'},
        {t: 'Смотреть на [пополнения и выводы]', at: 782.8, mark: '02', accent: 'green'},
        {t: 'Близкий промах — [всё равно проигрыш]', at: 789.0, mark: '03', accent: 'green'},
        {t: 'Сон, настроение, близкие → [пауза и поддержка]', at: 792.9, mark: '04', accent: 'gold'},
      ],
    },
    sfx: [
      [778.8, 'tick', 0.4],
      [782.8, 'tick', 0.4],
      [789.0, 'tick', 0.4],
      [792.9, 'tick', 0.4],
    ],
  },

  // ---------------- 10 · Что стоит запомнить ----------------
  ch(800.7, '10', 'players-celebrate.png', 'Что стоит', 'запомнить', 802.0, 'gold'),
  {
    t: 804.8,
    C: K.MatchRun,
    p: {
      img: 'players-celebrate.png',
      blur: true,
      title: 'Наш [первый экспресс]',
      tAt: 804.8,
      outs: [
        {o: 'win', at: 806.7},
        {o: 'win', at: 808.0},
        {o: 'win', at: 809.3},
        {o: 'win', at: 811.2},
        {o: 'lose', at: 815.0},
      ],
      verdict: 'Одного промаха достаточно',
      vAt: 823.2,
    },
    sfx: [
      [806.7, 'tick', 0.45],
      [808.0, 'tick', 0.45],
      [809.3, 'tick', 0.45],
      [811.2, 'tick', 0.45],
      [815.0, 'impact', 0.6],
    ],
  },
  st(827.0, {
    img: 'chain-break.png',
    zoom: 'out',
    kicker: 'Главная ловушка',
    lines: [
      {t: 'Мы складываем [уверенность]', at: 830.6, size: 76},
      {t: 'а нужно оценивать [всю цепочку]', at: 836.5, size: 76, accent: 'gold'},
      {t: 'Больше условий — легче недооценить риск. Маленькие коэффициенты и большая выплата этого не отменяют', at: 840.8, sub: true},
    ],
  }),
  st(850.3, {
    img: 'cliff-trophy.png',
    kicker: 'Главный вопрос',
    lines: [
      {t: 'Не «[Сколько я получу?]»', at: 854.3, size: 56, accent: 'red'},
      {t: 'Почему [все] события должны произойти одновременно?', at: 858.1, size: 56, accent: 'gold'},
      {t: 'Готов ли я [потерять всю сумму]?', at: 863.9, size: 66, accent: 'red'},
    ],
  }),
  st(870.6, {
    img: 'neon-coupon.png',
    align: 'center',
    lines: [
      {t: 'Если ответа нет —', at: 870.7, size: 70},
      {t: 'красивая цифра [ничего не меняет]', at: 872.0, size: 80, accent: 'gold'},
    ],
  }),
  st(875.9, {
    img: 'floor-despair.png',
    kicker: 'Напишите в комментариях',
    lines: [
      {t: '4, 5 или даже 9 событий [прошли]…', at: 878.2, size: 66, accent: 'green'},
      {t: '…а последний [перечеркнул всё]?', at: 881.1, size: 66, accent: 'red'},
      {t: 'Хотелось ли сразу собрать новый?', at: 885.9, sub: true},
      {t: 'Как вы справлялись с ощущением «почти выиграл»?', at: 889.7, sub: true},
    ],
  }),
  {t: 896.2, C: K.CTA, p: {img: 'lab-microscope.png', blur: true, subAt: 907.9, tgAt: 909.7, byeAt: 911.6}, noOv: true, sfx: [[907.9, 'tick', 0.5], [909.7, 'tick', 0.5]]},
];

export const VOICE_END = 914.3;
const OUTRO_LEN = 15 * FPS;
const outroFrom = vf(VOICE_END) + 6;
export const FULL_FRAMES = outroFrom + OUTRO_LEN;

const INTRO_SFX: [number, string, number][] = [
  [0.1, 'riser', 0.35],
  [1.6, 'impact', 0.5],
  [4.6, 'impact', 0.35],
  [8.1, 'tick', 0.5],
  [8.7, 'tick', 0.5],
  [9.32, 'tick', 0.5],
  [12.66, 'riser', 0.25],
  [16.0, 'tick', 0.45],
  [16.4, 'tick', 0.45],
  [16.8, 'tick', 0.45],
  [17.2, 'tick', 0.45],
  [18.5, 'impact', 0.7],
  [24.2, 'impact', 0.35],
  [34.2, 'tick', 0.4],
  [35.56, 'tick', 0.4],
  [37.46, 'tick', 0.4],
  [41.6, 'impact', 0.35],
  [46.7, 'riser', 0.3],
  [49.74, 'impact', 0.35],
  [55.8, 'tick', 0.4],
  [58.24, 'tick', 0.4],
  [61.2, 'tick', 0.4],
  [67.76, 'tick', 0.5],
  [69.5, 'tick', 0.5],
  [71.32, 'tick', 0.5],
];

const SFX: [number, string, number][] = [
  ...INTRO_SFX,
  ...CUES.slice(2).flatMap((c) => [[c.t, 'whoosh', 0.3] as [number, string, number], ...(c.sfx ?? [])]),
];

const discFrom = vf(DISC_AT - 0.0001) + 1;
const discLen = DISC_LEN * FPS;

export const Full: React.FC = () => {
  const voice = staticFile('media/voice.mp3');
  return (
    <AbsoluteFill style={{background: '#000', fontFamily}}>
      {CUES.map((c, i) => {
        const end = i + 1 < CUES.length ? CUES[i + 1].t : VOICE_END + 0.2;
        const dur = vf(end) - vf(c.t) + (c.noOv ? 0 : OV);
        return (
          <Sequence key={c.t} from={vf(c.t)} durationInFrames={dur}>
            <c.C start={c.t} dur={dur} {...(c.p ?? {})} />
          </Sequence>
        );
      })}

      <Sequence from={vf(5.8)} durationInFrames={discFrom - vf(5.8)}>
        <Watermark />
      </Sequence>
      <Sequence from={vf(51.45)} durationInFrames={vf(896.2) - vf(51.45)}>
        <Watermark />
      </Sequence>

      <Sequence from={discFrom} durationInFrames={discLen}>
        <OffthreadVideo src={staticFile('media/disclaimer.mp4')} />
      </Sequence>

      <Grain />

      <Sequence from={outroFrom} durationInFrames={OUTRO_LEN}>
        <OffthreadVideo src={staticFile('media/outro.mp4')} />
      </Sequence>

      <Sequence from={0} durationInFrames={discFrom}>
        <Audio src={voice} trimAfter={Math.round(DISC_AT * FPS)} />
      </Sequence>
      <Sequence from={discFrom + discLen} durationInFrames={outroFrom - discFrom - discLen}>
        <Audio src={voice} trimBefore={Math.round(DISC_AT * FPS)} />
      </Sequence>

      <Sequence from={0} durationInFrames={outroFrom + 20}>
        <Audio
          src={staticFile('sfx/pad.wav')}
          loop
          volume={(f) =>
            0.3 *
            interpolate(f, [0, 30, discFrom - 15, discFrom, discFrom + discLen, discFrom + discLen + 20, outroFrom - 40, outroFrom + 20], [0, 1, 1, 0.25, 0.25, 1, 1, 0], clamp)
          }
        />
      </Sequence>
      {SFX.map(([t, name, vol], i) => (
        <Sequence key={i} from={Math.max(0, vf(t))} durationInFrames={60}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Chapter boundaries (frames) used to split the render into chunks. */
export const CHUNKS: {title: string; from: number}[] = [
  {title: 'Вступление + дисклеймер', from: 0},
  {title: '01 · Купон, который кажется очевидным', from: discFrom + discLen},
  {title: '02 · Маленькие коэффициенты', from: vf(148.8)},
  {title: '03 · Что означает коэффициент', from: vf(246.1)},
  {title: '04 · Ловушка «ещё один матч»', from: vf(358.2)},
  {title: '05 · Последний матч', from: vf(443.7)},
  {title: '06 · Огромные выигрыши в сети', from: vf(536.6)},
  {title: '07 · Что выгодно букмекеру', from: vf(599.5)},
  {title: '08 · Экспресс и одиночные', from: vf(665.2)},
  {title: '09 · Попытка отыграться', from: vf(731.2)},
  {title: '10 · Что запомнить + аутро', from: vf(800.7)},
];
