import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';
import {
  Bg,
  clamp,
  Flash,
  glass,
  glow,
  Kicker,
  Letters,
  Particles,
  prog,
  Reveal,
  rub,
  SceneProps,
  Scene,
  Sheen,
  useAt,
  useShake,
} from '../lib';

const center: React.CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  textAlign: 'center',
};

const H: React.FC<{size?: number; color?: string; shadow?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({
  size = 120,
  color = C.text,
  shadow,
  style,
  children,
}) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: '0.02em',
      color,
      textTransform: 'uppercase',
      textShadow: shadow ?? '0 8px 40px rgba(0,0,0,0.6)',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- 1. Logo ---------- */
const Flask: React.FC<{p: number; fill: number}> = ({p, fill}) => (
  <svg width={120} height={144} viewBox="0 0 100 120" style={{filter: `drop-shadow(0 0 18px ${C.cyanGlow})`}}>
    <defs>
      <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7fe0ff" />
        <stop offset="1" stopColor="#1a7fd6" />
      </linearGradient>
      <clipPath id="fl">
        <path d="M42 8v34L16 98a8 8 0 0 0 7 12h54a8 8 0 0 0 7-12L58 42V8z" />
      </clipPath>
    </defs>
    <g clipPath="url(#fl)">
      <rect x="0" y={110 - 42 * fill} width="100" height="60" fill="url(#liq)" opacity={0.85} />
    </g>
    <path
      d="M36 8h28M42 8v34L16 98a8 8 0 0 0 7 12h54a8 8 0 0 0 7-12L58 42V8"
      fill="none"
      stroke={C.cyan}
      strokeWidth={4.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  </svg>
);

export const Logo: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const spread = interpolate(f, [at(1.6), at(2.6)], [0.9, 0.42], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const ring = prog(f, 0, 50);
  return (
    <Scene dur={dur} fadeIn={12}>
      <Bg src="lab-microscope.png" dur={dur} from={1.2} to={1.1} blur={7} dim={0.72} />
      <Particles />
      <AbsoluteFill style={center}>
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            borderRadius: '50%',
            border: '1px solid rgba(76,201,255,0.18)',
            transform: `scale(${0.6 + 0.4 * ring}) rotate(${f * 0.2}deg)`,
            opacity: 0.8 * ring,
            boxShadow: 'inset 0 0 120px rgba(76,201,255,0.08)',
          }}
        />
        <Reveal at={4} dur={22} scale={0.7} y={0}>
          <Flask p={prog(f, 4, 30)} fill={prog(f, 18, 40)} />
        </Reveal>
        <div style={{height: 26}} />
        <Sheen at={at(2.3)} d={26}>
          <H size={150} shadow={`0 0 40px rgba(120,200,255,0.35), 0 10px 50px rgba(0,0,0,0.7)`} style={{letterSpacing: '0.08em'}}>
            <Letters text="BETTING" at={10} stagger={2.2} dur={16} />
          </H>
        </Sheen>
        <div style={{height: 14}} />
        <Reveal at={at(1.6)} dur={18} y={10}>
          <div style={{fontSize: 62, fontWeight: 800, color: C.cyan, letterSpacing: `${spread}em`, marginRight: `-${spread}em`, textShadow: glow(C.cyanGlow, 18)}}>
            LAB
          </div>
        </Reveal>
        <div style={{height: 34}} />
        <Reveal at={at(2.2)} dur={18} y={14}>
          <div style={{fontSize: 20, fontWeight: 600, color: C.dim, letterSpacing: '0.42em'}}>
            АНАЛИТИКА · ВЕРОЯТНОСТИ · ПСИХОЛОГИЯ
          </div>
        </Reveal>
      </AbsoluteFill>
    </Scene>
  );
};

/* ---------- 2. Topic ---------- */
export const Topic: React.FC<SceneProps> = ({start, dur}) => {
  const at = useAt(start);
  return (
    <Scene dur={dur}>
      <Bg src="lab-microscope.png" dur={dur} from={1.1} to={1.17} blur={10} dim={0.76} dx={-20} />
      <Particles />
      <AbsoluteFill style={center}>
        <Kicker text="Сегодня разбираем" at={at(3.4)} align="center" />
        <div style={{height: 34}} />
        <Reveal at={at(3.84)} dur={16} y={40} blur={14}>
          <H size={170} shadow="0 0 50px rgba(150,210,255,0.35), 0 12px 50px rgba(0,0,0,0.7)">Ставки</H>
        </Reveal>
        <div style={{height: 10}} />
        <Reveal at={at(4.6)} dur={16} y={40} blur={14} scale={1.15}>
          <Sheen at={at(5.0)}>
            <H size={150} color={C.gold} shadow={glow(C.goldGlow, 26)}>
              на экспрессы
            </H>
          </Sheen>
        </Reveal>
      </AbsoluteFill>
      <Flash at={at(4.6)} color="255,200,90" peak={0.3} />
    </Scene>
  );
};

/* ---------- 3. Coupon build ---------- */
const COUPON = [
  ['Вектор — Титан', 1.15],
  ['Атлант — Метеор', 1.2],
  ['Звезда — Рубикон', 1.25],
  ['Орион — Сокол', 1.18],
  ['Гранит — Нептун', 1.22],
  ['Факел — Буран', 1.15],
  ['Ротор — Квант', 1.2],
  ['Сатурн — Импульс', 1.25],
  ['Легион — Комета', 1.17],
  ['Протон — Вымпел', 1.21],
] as const;

export const CouponBuild: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = useAt(start);
  const steps: [number, number][] = [
    [at(6.68), 3],
    [at(8.1), 5],
    [at(8.7), 7],
    [at(9.32), 10],
  ];
  const rowAt = (i: number) => {
    let prev = 0;
    for (const [t, n] of steps) {
      if (i < n) return t + (i - prev) * 3;
      prev = n;
    }
    return 1e9;
  };
  const counts = steps.slice(1);
  const cur = [...counts].reverse().find(([t]) => f >= t);
  const n = cur ? cur[1] : 0;
  const pop = cur ? spring({frame: f - cur[0], fps, config: {damping: 9, stiffness: 180}}) : 0;
  const visible = COUPON.filter((_, i) => f >= rowAt(i));
  const total = visible.reduce((a, [, o]) => a * o, 1);
  const totalShown = interpolate(f, [at(12.66), at(14.0)], [1, total], clamp);
  const hot = prog(f, at(12.66), 20);
  return (
    <Scene dur={dur}>
      <Bg src="neon-coupon.png" dur={dur} from={1.08} to={1.2} dy={-14} dim={0.5} />
      <Particles />
      <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: '0 150px', gap: 120}}>
        <div style={{flex: 1}}>
          <Kicker text="Купон-экспресс" at={at(6.3)} />
          <div style={{height: 26}} />
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 28, opacity: n ? 1 : 0}}>
            <div
              style={{
                fontSize: 300,
                fontWeight: 900,
                lineHeight: 0.85,
                color: C.text,
                transform: `scale(${0.75 + 0.25 * pop})`,
                transformOrigin: 'left bottom',
                textShadow: glow(C.cyanGlow, 30),
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {n || ''}
            </div>
            <div style={{fontSize: 52, fontWeight: 800, color: C.cyan, paddingBottom: 18, letterSpacing: '0.06em'}}>
              СОБЫТИЙ
            </div>
          </div>
          <div style={{height: 30}} />
          <Reveal at={at(10.6)} dur={14} x={-30} y={0}>
            <div
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 34,
                fontWeight: 700,
                color: C.dim,
                fontStyle: 'italic',
              }}
            >
              «казалось бы, надёжных»
            </div>
          </Reveal>
        </div>
        <Reveal at={at(6.4)} dur={20} x={80} y={0} style={{width: 620}}>
          <div style={{...glass, padding: '26px 30px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14}}>
              <div style={{fontSize: 22, fontWeight: 800, letterSpacing: '0.18em', color: C.text}}>ЭКСПРЕСС</div>
              <div style={{fontSize: 18, fontWeight: 700, color: C.cyan, letterSpacing: '0.1em'}}>
                {visible.length} {visible.length >= 5 ? 'СОБЫТИЙ' : 'СОБЫТИЯ'}
              </div>
            </div>
            <div style={{height: 1, background: 'rgba(130,190,255,0.18)', marginBottom: 8}} />
            {COUPON.map(([name, odd], i) => {
              const p = prog(f, rowAt(i), 12);
              if (p <= 0) return null;
              return (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 40 * p,
                    opacity: p,
                    transform: `translateX(${(1 - p) * 40}px)`,
                    overflow: 'hidden',
                    fontSize: 21,
                    fontWeight: 600,
                    color: 'rgba(230,240,255,0.88)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span>
                    <span style={{color: 'rgba(160,190,230,0.55)', marginRight: 14, fontWeight: 700}}>{String(i + 1).padStart(2, '0')}</span>
                    {name}
                  </span>
                  <span style={{fontWeight: 800, color: C.text, fontVariantNumeric: 'tabular-nums'}}>{odd.toFixed(2)}</span>
                </div>
              );
            })}
            <div
              style={{
                marginTop: 18,
                padding: '16px 20px',
                borderRadius: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: `rgba(255,198,61,${0.04 + 0.1 * hot})`,
                border: `1px solid rgba(255,198,61,${0.15 + 0.5 * hot})`,
                boxShadow: hot ? `0 0 ${40 * hot}px rgba(255,198,61,${0.35 * hot})` : undefined,
              }}
            >
              <span style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.16em', color: C.dim}}>ОБЩИЙ КОЭФФИЦИЕНТ</span>
              <span
                style={{
                  fontSize: 46 + 14 * hot,
                  fontWeight: 900,
                  color: C.gold,
                  textShadow: hot ? glow(C.goldGlow, 18 * hot) : undefined,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {f >= at(12.66) ? totalShown.toFixed(2) : '—'}
              </span>
            </div>
          </div>
        </Reveal>
      </AbsoluteFill>
      <Flash at={at(12.66)} color="255,200,90" peak={0.25} d={18} />
    </Scene>
  );
};

/* ---------- 4. One loss kills the coupon ---------- */
export const OneLoss: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const wins = [16.0, 16.4, 16.8, 17.2].map(at);
  const fail = at(18.5);
  const shake = useShake(fail, 22, 18);
  const redWash = interpolate(f, [fail, fail + 4, fail + 40], [0, 0.5, 0.16], clamp);
  return (
    <Scene dur={dur}>
      <Bg src="chain-break.png" dur={dur} from={1.06} to={1.18} dim={0.58} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(255,40,70,0) 30%, rgba(255,30,60,${redWash}) 100%)`}} />
      <Particles color="255,170,170" count={26} />
      <AbsoluteFill style={{...center, transform: shake}}>
        <Reveal at={at(15.12)} dur={16}>
          <H size={64}>
            Четыре матча — <span style={{color: C.green, textShadow: glow(C.greenGlow, 14)}}>как надо</span>
          </H>
        </Reveal>
        <div style={{height: 60}} />
        <div style={{display: 'flex', gap: 26}}>
          {[0, 1, 2, 3, 4].map((i) => {
            const p = prog(f, at(15.46) + i * 3, 14);
            const isFail = i === 4;
            const done = isFail ? f >= fail : f >= wins[i];
            const k = done ? prog(f, isFail ? fail : wins[i], 10) : 0;
            const col = isFail ? C.red : C.green;
            const colGlow = isFail ? C.redGlow : C.greenGlow;
            const pulse = isFail && !done ? 0.5 + 0.5 * Math.abs(Math.sin(f / 5)) : 0;
            return (
              <div
                key={i}
                style={{
                  ...glass,
                  width: 180,
                  height: 210,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 40}px) scale(${1 + 0.08 * k * (1 - k) * 4})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 18,
                  borderColor: done ? col : `rgba(130,190,255,${0.16 + 0.4 * pulse})`,
                  boxShadow: done ? `0 0 ${40 * k}px ${colGlow}, ${glass.boxShadow}` : glass.boxShadow,
                }}
              >
                <div style={{fontSize: 17, fontWeight: 700, letterSpacing: '0.2em', color: C.dim}}>МАТЧ {i + 1}</div>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 50,
                    fontWeight: 900,
                    color: done ? '#06120c' : C.dim,
                    background: done ? col : 'rgba(255,255,255,0.06)',
                    transform: `scale(${done ? 0.6 + 0.4 * k : 1})`,
                  }}
                >
                  {done ? (isFail ? '✕' : '✓') : isFail ? '?' : '·'}
                </div>
                <div style={{fontSize: 22, fontWeight: 800, color: C.text}}>{(COUPON[i][1] as number).toFixed(2)}</div>
              </div>
            );
          })}
        </div>
        <div style={{height: 64}} />
        <Reveal at={at(19.06)} dur={14} y={30} scale={0.9}>
          <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
            <div style={{fontSize: 40, fontWeight: 800, color: C.dim, letterSpacing: '0.08em'}}>ОДНО ПОРАЖЕНИЕ =</div>
            <H size={96} color={C.red} shadow={glow(C.redGlow, 22)}>
              −100% ставки
            </H>
          </div>
        </Reveal>
      </AbsoluteFill>
      <Flash at={fail} color="255,60,80" peak={0.55} d={16} />
    </Scene>
  );
};

/* ---------- 5. Small odds != safe ---------- */
export const SmallOdds: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const chips = [
    {o: '1.10', x: 1280, y: 250},
    {o: '1.15', x: 1600, y: 380},
    {o: '1.20', x: 1230, y: 560},
    {o: '1.25', x: 1580, y: 700},
    {o: '1.12', x: 1350, y: 830},
  ];
  return (
    <Scene dur={dur}>
      <Bg src="jenga-pull.png" dur={dur} from={1.05} to={1.16} dx={-30} dim={0.5} />
      <Particles />
      {chips.map((c, i) => {
        const p = prog(f, at(21.58) + i * 4, 16);
        const bob = Math.sin((f + i * 20) / 22) * 10;
        return (
          <div
            key={c.o}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y + bob,
              opacity: p * 0.95,
              transform: `scale(${0.6 + 0.4 * p})`,
              ...glass,
              borderRadius: 14,
              padding: '14px 26px',
              fontSize: 40,
              fontWeight: 900,
              color: C.text,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {c.o}
          </div>
        );
      })}
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 150}}>
        <Kicker text="Иллюзия безопасности" at={at(21.0)} />
        <div style={{height: 30}} />
        <Reveal at={at(21.58)} dur={16} x={-40} y={0}>
          <H size={104}>Маленькие</H>
        </Reveal>
        <Reveal at={at(22.2)} dur={16} x={-40} y={0}>
          <H size={104}>коэффициенты</H>
        </Reveal>
        <div style={{height: 24}} />
        <Reveal at={at(24.2)} dur={14} x={-40} y={0}>
          <H size={104} color={C.red} shadow={glow(C.redGlow, 22)}>
            ≠ безопасность
          </H>
        </Reveal>
      </AbsoluteFill>
      <Flash at={at(24.3)} color="255,60,80" peak={0.25} />
    </Scene>
  );
};

/* ---------- 6. One step from the big win ---------- */
export const AlmostWin: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const fill = interpolate(f, [at(25.6), at(27.0), at(28.4), at(30.0)], [0, 0.8, 0.8, 0.97], {
    ...clamp,
    easing: (x) => 1 - Math.pow(1 - x, 2),
  });
  const tremble = f > at(30) ? Math.sin(f * 1.7) * 0.004 : 0;
  return (
    <Scene dur={dur}>
      <Bg src="runner-fall.png" dur={dur} from={1.05} to={1.22} dy={-10} dim={0.42} />
      <Particles />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 110}}>
        <Reveal at={at(25.5)} dur={16} y={-20} style={{width: 960}}>
          <div style={{...glass, padding: '22px 30px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, letterSpacing: '0.18em', color: C.dim, marginBottom: 14}}>
              <span>ПРОГРЕСС КУПОНА</span>
              <span style={{color: fill > 0.85 ? C.gold : C.green}}>{fill > 0.85 ? 'ПОЧТИ…' : `${Math.round(fill * 5)} / 5`}</span>
            </div>
            <div style={{height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
              <div
                style={{
                  width: `${(fill + tremble) * 100}%`,
                  height: '100%',
                  borderRadius: 7,
                  background: `linear-gradient(90deg, ${C.green}, ${fill > 0.85 ? C.gold : C.green})`,
                  boxShadow: glow(fill > 0.85 ? C.goldGlow : C.greenGlow, 10),
                }}
              />
            </div>
          </div>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{...center, justifyContent: 'flex-end', paddingBottom: 120}}>
        <Kicker text="Раз за разом" at={at(27.46)} align="center" />
        <div style={{height: 26}} />
        <Reveal at={at(29.04)} dur={14}>
          <H size={84}>в шаге от</H>
        </Reveal>
        <div style={{height: 8}} />
        <Reveal at={at(29.7)} dur={16} scale={1.12}>
          <Sheen at={at(30.2)}>
            <H size={120} color={C.gold} shadow={glow(C.goldGlow, 26)}>
              большого выигрыша
            </H>
          </Sheen>
        </Reveal>
      </AbsoluteFill>
    </Scene>
  );
};

/* ---------- 7. Balance keeps shrinking ---------- */
const SPARK = [0, 0.04, -0.02, 0.07, 0.1, 0.02, 0.12, -0.05, 0.03, -0.12, -0.08, -0.22, -0.18, -0.34, -0.3, -0.45, -0.52, -0.48, -0.64, -0.76];

export const Balance: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const p = interpolate(f, [at(31.3), at(33.3)], [0, 1], {...clamp, easing: (x) => x * x * (3 - 2 * x)});
  const value = 10000 - 7650 * p;
  const W = 640;
  const Hh = 200;
  const pts = SPARK.map((v, i) => `${(i / (SPARK.length - 1)) * W},${Hh * 0.25 - v * Hh * 0.9}`).join(' ');
  return (
    <Scene dur={dur}>
      <Bg src="floor-despair.png" dur={dur} from={1.12} to={1.04} dim={0.5} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'flex-end', paddingRight: 140}}>
        <Reveal at={at(31.0)} dur={16} x={60} y={0} style={{width: 720}}>
          <div style={{...glass, padding: '34px 40px'}}>
            <div style={{fontSize: 20, fontWeight: 700, letterSpacing: '0.22em', color: C.dim}}>БАЛАНС СЧЁТА</div>
            <div
              style={{
                fontSize: 112,
                fontWeight: 900,
                marginTop: 8,
                color: p > 0.15 ? C.red : C.text,
                textShadow: p > 0.15 ? glow(C.redGlow, 16) : undefined,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {rub(value)} ₽
            </div>
            <svg width={W} height={Hh} style={{marginTop: 18, overflow: 'visible'}}>
              <defs>
                <linearGradient id="sp" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor={C.cyan} />
                  <stop offset="0.45" stopColor={C.cyan} />
                  <stop offset="1" stopColor={C.red} />
                </linearGradient>
              </defs>
              <polyline
                points={pts}
                fill="none"
                stroke="url(#sp)"
                strokeWidth={4}
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - interpolate(f, [at(31.0), at(33.3)], [0.05, 1], clamp)}
                style={{filter: `drop-shadow(0 0 8px ${C.redGlow})`}}
              />
            </svg>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 18, fontWeight: 700, color: C.dim, letterSpacing: '0.1em'}}>
              <span>МЕСЯЦ 1</span>
              <span style={{color: C.red}}>−{Math.round(76.5 * p)}%</span>
              <span>МЕСЯЦ 6</span>
            </div>
          </div>
        </Reveal>
      </AbsoluteFill>
    </Scene>
  );
};

/* ---------- 8. Agenda ---------- */
export const Agenda: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const items = [
    {n: '01', t: 'Реальные расчёты', a: at(34.2)},
    {n: '02', t: 'Психология последнего матча', a: at(35.56)},
    {n: '03', t: 'Что происходит с вероятностью', a: at(37.46)},
  ];
  const active = [...items].reverse().find((it) => f >= it.a);
  const chance = interpolate(f, [at(41.6), at(42.4)], [32.8, 29.5], clamp);
  return (
    <Scene dur={dur}>
      <Bg src="lab-microscope.png" dur={dur} from={1.12} to={1.2} blur={9} dim={0.74} dx={20} />
      <Particles />
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 200}}>
        <Kicker text="Разберём" at={at(33.7)} />
        <div style={{height: 40}} />
        {items.map((it) => {
          const on = active === it;
          return (
            <Reveal key={it.n} at={it.a} dur={16} x={-60} y={0} style={{marginBottom: 22}}>
              <div
                style={{
                  ...glass,
                  width: 1240,
                  padding: '28px 40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 36,
                  borderColor: on ? 'rgba(76,201,255,0.7)' : 'rgba(130,190,255,0.12)',
                  boxShadow: on ? `0 0 40px rgba(76,201,255,0.25), ${glass.boxShadow}` : glass.boxShadow,
                  opacity: on ? 1 : 0.55,
                }}
              >
                <div style={{fontSize: 56, fontWeight: 900, color: on ? C.cyan : 'rgba(160,200,240,0.5)', textShadow: on ? glow(C.cyanGlow, 12) : undefined}}>
                  {it.n}
                </div>
                <div style={{fontSize: 44, fontWeight: 800, color: C.text, textTransform: 'uppercase', flex: 1, whiteSpace: 'nowrap'}}>{it.t}</div>
              </div>
            </Reveal>
          );
        })}
        <Reveal at={at(39.42)} dur={16} x={-40} y={0} style={{marginTop: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26, paddingLeft: 40}}>
            <div style={{fontSize: 26, fontWeight: 700, color: C.dim, letterSpacing: '0.14em'}}>ШАНС КУПОНА</div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: f >= at(41.6) ? C.red : C.text,
                fontVariantNumeric: 'tabular-nums',
                textShadow: f >= at(41.6) ? glow(C.redGlow, 14) : undefined,
              }}
            >
              {chance.toFixed(1)}%
            </div>
            <Reveal at={at(40.9)} dur={14} scale={0.7} y={0}>
              <div
                style={{
                  padding: '12px 22px',
                  borderRadius: 12,
                  background: 'rgba(255,198,61,0.12)',
                  border: '1px solid rgba(255,198,61,0.6)',
                  color: C.gold,
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                }}
              >
                + 1 «ЖЕЛЕЗНЫЙ» ИСХОД
              </div>
            </Reveal>
          </div>
        </Reveal>
      </AbsoluteFill>
    </Scene>
  );
};

/* ---------- 9. No promises ---------- */
export const NoPromises: React.FC<SceneProps> = ({start, dur}) => {
  const at = useAt(start);
  const Item: React.FC<{a: number; t: string}> = ({a, t}) => (
    <Reveal at={a} dur={14} y={20} out={at(45.5)}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 40, fontWeight: 800, color: C.text, letterSpacing: '0.08em'}}>
        <span style={{color: C.red, fontSize: 34}}>✕</span>
        {t}
      </div>
    </Reveal>
  );
  return (
    <Scene dur={dur} fadeOut={14}>
      <Bg src="funnel-gold.png" dur={dur} from={1.06} to={1.2} dim={0.5} />
      <Particles color="255,215,150" />
      <AbsoluteFill style={center}>
        <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center'}}>
          <Item a={at(43.0)} t="БЕЗ ПРОГНОЗОВ" />
          <Item a={at(44.06)} t="БЕЗ ОБЕЩАНИЙ ЗАРАБОТКА" />
        </div>
        <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Kicker text="Просто посмотрим" at={at(45.7)} align="center" />
          <div style={{height: 30}} />
          <Reveal at={at(46.7)} dur={18} scale={1.15}>
            <Sheen at={at(47.3)}>
              <H size={128} color={C.text} shadow={glow(C.cyanGlow, 26)}>
                как это <span style={{color: C.cyan}}>работает</span>
              </H>
            </Sheen>
          </Reveal>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

/* ---------- 10. Chapter card ---------- */
export const Chapter1: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const line = prog(f, at(49.3), 26);
  return (
    <Scene dur={dur} fadeIn={14}>
      <Bg src="laptop-notes.png" dur={dur} from={1.16} to={1.06} dim={0.62} />
      <Particles />
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 170}}>
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 120,
            fontSize: 520,
            fontWeight: 900,
            color: 'transparent',
            WebkitTextStroke: '2px rgba(76,201,255,0.22)',
            lineHeight: 1,
            opacity: prog(f, 6, 30),
            transform: `translateY(${(1 - prog(f, 6, 40)) * 60}px)`,
          }}
        >
          01
        </div>
        <Kicker text="Глава 01" at={at(48.5)} />
        <div style={{height: 30}} />
        <Reveal at={at(48.7)} dur={18} x={-40} y={0}>
          <H size={110}>Купон, который</H>
        </Reveal>
        <Reveal at={at(49.74)} dur={18} x={-40} y={0}>
          <H size={110} color={C.cyan} shadow={glow(C.cyanGlow, 22)}>
            кажется очевидным
          </H>
        </Reveal>
        <div style={{height: 34}} />
        <div style={{width: 760 * line, height: 3, background: `linear-gradient(90deg, ${C.cyan}, rgba(76,201,255,0))`, boxShadow: glow(C.cyanGlow, 8)}} />
      </AbsoluteFill>
    </Scene>
  );
};

/* ---------- 11. Ordinary evening: phone with match list ---------- */
// Green screen of phone-green.png measured at 711..987 x 133..724 px in the 1672x941 source.
const S = 1920 / 1672;
const SCREEN = {left: 711 * S - 2, top: 133 * S - 2.5, width: 277 * S + 4, height: 592 * S + 4};

const MATCHES = [
  ['Вектор', 'Титан', 1.15, 7.2, 14.5],
  ['Атлант', 'Метеор', 1.2, 5.6, 11.0],
  ['Звезда', 'Рубикон', 1.25, 5.1, 9.75],
  ['Орион', 'Сокол', 1.95, 3.5, 3.8],
  ['Гранит', 'Нептун', 2.4, 3.2, 2.9],
  ['Факел', 'Буран', 1.7, 3.6, 4.9],
] as const;

const PhoneUI: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const hl = [at(55.8), at(58.24), at(61.2)];
  const on = prog(f, at(52.6), 14);
  return (
    <div
      style={{
        position: 'absolute',
        ...SCREEN,
        borderRadius: 30,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0d1626 0%, #070c16 100%)',
        boxShadow: `0 0 60px rgba(76,201,255,${0.25 * on})`,
        padding: '18px 14px',
        boxSizing: 'border-box',
        color: C.text,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: C.dim, padding: '0 8px'}}>
        <span>20:47</span>
        <span>● ● ●</span>
      </div>
      <div style={{fontSize: 21, fontWeight: 800, margin: '22px 6px 4px'}}>Футбол · сегодня</div>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 36, fontSize: 12, fontWeight: 700, color: C.dim, padding: '0 22px 8px'}}>
        <span>П1</span>
        <span>X</span>
        <span>П2</span>
      </div>
      {MATCHES.map(([a, b, p1, x, p2], i) => {
        const p = prog(f, at(53.78) + i * 3, 12);
        const hIdx = hl.findIndex((h, k) => k === i);
        const lit = hIdx >= 0 && f >= hl[hIdx];
        const k = lit ? prog(f, hl[hIdx], 10) : 0;
        return (
          <div
            key={a}
            style={{
              margin: '0 0 8px',
              padding: '10px 10px',
              borderRadius: 12,
              background: lit ? 'rgba(76,201,255,0.12)' : 'rgba(255,255,255,0.045)',
              border: `1px solid ${lit ? `rgba(76,201,255,${0.8 * k})` : 'rgba(255,255,255,0.05)'}`,
              boxShadow: lit ? `0 0 ${22 * k}px rgba(76,201,255,0.45)` : undefined,
              opacity: p,
              transform: `translateY(${(1 - p) * 24}px)`,
            }}
          >
            <div style={{fontSize: 14, fontWeight: 700, marginBottom: 7}}>
              {a} — {b}
            </div>
            <div style={{display: 'flex', gap: 6}}>
              {[p1, x, p2].map((o, j) => (
                <div
                  key={j}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '6px 0',
                    borderRadius: 8,
                    background: lit && j === 0 ? C.cyan : 'rgba(255,255,255,0.07)',
                    color: lit && j === 0 ? '#04121c' : C.text,
                  }}
                >
                  {o.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Evening: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const at = useAt(start);
  const callouts = [
    {a: at(55.56), t: 'Сильная команда дома', y: 360},
    {a: at(57.96), t: 'Фаворит «не должен проиграть»', y: 450},
    {a: at(60.78), t: '«Сюрприз невозможен»', y: 540},
  ];
  return (
    <Scene dur={dur}>
      <Bg src="phone-green.png" dur={dur} from={1.0} to={1.07} dx={-8} dim={0.22} overlay={<PhoneUI start={start} />} />
      <Particles count={20} />
      <AbsoluteFill style={{justifyContent: 'flex-end', paddingLeft: 110, paddingBottom: 120}}>
        <Reveal at={at(51.6)} dur={16} x={-40} y={0} out={at(55.0)}>
          <Kicker text="20:47 · Обычный вечер" at={at(51.6)} />
          <div style={{height: 20}} />
          <H size={92}>Список матчей</H>
        </Reveal>
      </AbsoluteFill>
      {callouts.map((c) => {
        const p = prog(f, c.a, 16);
        const l = prog(f, c.a + 4, 14);
        return (
          <div key={c.t} style={{position: 'absolute', left: 90, top: c.y + (c.y - 360) * 0.25, display: 'flex', alignItems: 'center', opacity: p}}>
            <div
              style={{
                ...glass,
                padding: '16px 26px',
                fontSize: 30,
                fontWeight: 800,
                color: C.text,
                textTransform: 'uppercase',
                transform: `translateX(${(1 - p) * -40}px)`,
                borderColor: 'rgba(76,201,255,0.45)',
              }}
            >
              {c.t}
            </div>
            <div style={{width: 120 * l, height: 2, background: C.cyan, boxShadow: glow(C.cyanGlow, 6)}} />
            <div style={{width: 10, height: 10, borderRadius: 5, background: C.cyan, opacity: l, boxShadow: glow(C.cyanGlow, 8)}} />
          </div>
        );
      })}
    </Scene>
  );
};

/* ---------- 12. Modest odds ---------- */
export const ModestOdds: React.FC<SceneProps> = ({start, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = useAt(start);
  const cards = [
    {a: at(67.76), o: 1.15, m: 'Вектор — Титан'},
    {a: at(69.5), o: 1.2, m: 'Атлант — Метеор'},
    {a: at(71.32), o: 1.25, m: 'Звезда — Рубикон'},
  ];
  return (
    <Scene dur={dur}>
      <Bg src="couch-bet.png" dur={dur} from={1.1} to={1.18} blur={8} dim={0.7} />
      <Particles />
      <AbsoluteFill style={center}>
        <Kicker text="Каждый коэффициент по отдельности" at={at(65.06)} align="center" />
        <div style={{height: 30}} />
        <Reveal at={at(66.6)} dur={16} scale={1.1}>
          <H size={120} shadow={glow('rgba(150,210,255,0.35)', 24)}>
            скромный
          </H>
        </Reveal>
        <div style={{height: 70}} />
        <div style={{display: 'flex', gap: 40}}>
          {cards.map((c) => {
            const s = spring({frame: f - c.a, fps, config: {damping: 12, stiffness: 140}});
            const val = interpolate(f, [c.a, c.a + 14], [1, c.o], clamp);
            return (
              <div
                key={c.m}
                style={{
                  ...glass,
                  width: 340,
                  padding: '30px 0 34px',
                  textAlign: 'center',
                  opacity: Math.min(1, s * 1.4),
                  transform: `translateY(${(1 - s) * 60}px) scale(${0.85 + 0.15 * s})`,
                }}
              >
                <div style={{fontSize: 20, fontWeight: 700, color: C.dim, letterSpacing: '0.06em'}}>{c.m}</div>
                <div
                  style={{
                    fontSize: 104,
                    fontWeight: 900,
                    color: C.gold,
                    marginTop: 10,
                    textShadow: glow(C.goldGlow, 16),
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {val.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
