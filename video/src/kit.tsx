import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from './theme';
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
  Scene,
  Sheen,
  useAt,
  useShake,
} from './lib';

export type Accent = 'cyan' | 'gold' | 'red' | 'green' | 'text';
const AC: Record<Accent, [string, string]> = {
  cyan: [C.cyan, C.cyanGlow],
  gold: [C.gold, C.goldGlow],
  red: [C.red, C.redGlow],
  green: [C.green, C.greenGlow],
  text: [C.text, 'rgba(150,210,255,0.3)'],
};

type Base = {start: number; dur: number};
export type BgOpts = {img: string; blur?: boolean; dim?: number; zoom?: 'in' | 'out'; dx?: number; dy?: number; warm?: boolean};

const BgX: React.FC<BgOpts & {dur: number}> = ({img, blur, dim, zoom = 'in', dx = 0, dy = 0, dur, warm}) => (
  <>
    <Bg
      src={img}
      dur={dur}
      blur={blur ? 8 : 0}
      dim={dim ?? (blur ? 0.7 : 0.5)}
      from={zoom === 'in' ? 1.05 : 1.18}
      to={zoom === 'in' ? 1.17 : 1.06}
      dx={dx}
      dy={dy}
    />
    <Particles color={warm ? '255,210,150' : undefined} count={30} />
  </>
);

/** Inline markup: text in [brackets] is painted with the accent colour. */
export const Rich: React.FC<{text: string; accent: Accent}> = ({text, accent}) => {
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('[') ? (
          <span key={i} style={{color: AC[accent][0], textShadow: glow(AC[accent][1], 18)}}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

export const Title: React.FC<{size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({
  size = 96,
  color = C.text,
  style,
  children,
}) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 900,
      lineHeight: 1.06,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color,
      textShadow: '0 8px 40px rgba(0,0,0,0.65)',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Chapter card                                                         */
/* ------------------------------------------------------------------ */
export type ChapterP = Base & BgOpts & {num: string; l1: string; l2: string; at2: number; accent?: Accent};
export const Chapter: React.FC<ChapterP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const [col, g] = AC[p.accent ?? 'cyan'];
  const line = prog(f, 12, 30);
  return (
    <Scene dur={p.dur} fadeIn={14}>
      <BgX {...p} dim={p.dim ?? 0.64} />
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 170}}>
        <div
          style={{
            position: 'absolute',
            right: 110,
            top: 110,
            fontSize: 520,
            fontWeight: 900,
            color: 'transparent',
            WebkitTextStroke: `2px ${col}`,
            lineHeight: 1,
            opacity: 0.25 * prog(f, 4, 30),
            transform: `translateY(${(1 - prog(f, 4, 40)) * 60}px)`,
          }}
        >
          {p.num}
        </div>
        <Kicker text={`Глава ${p.num}`} at={2} color={col} />
        <div style={{height: 30}} />
        <Reveal at={6} dur={18} x={-40} y={0}>
          <Title size={100}>{p.l1}</Title>
        </Reveal>
        <Reveal at={Math.max(14, at(p.at2))} dur={18} x={-40} y={0}>
          <Sheen at={Math.max(24, at(p.at2) + 8)}>
            <Title size={100} color={col} style={{textShadow: glow(g, 22)}}>
              {p.l2}
            </Title>
          </Sheen>
        </Reveal>
        <div style={{height: 34}} />
        <div style={{width: 760 * line, height: 3, background: `linear-gradient(90deg, ${col}, rgba(0,0,0,0))`, boxShadow: glow(g, 8)}} />
      </AbsoluteFill>
      <Flash at={4} color="120,200,255" peak={0.3} />
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Statement: kicker + timed lines                                      */
/* ------------------------------------------------------------------ */
export type Line = {t: string; at: number; size?: number; accent?: Accent; color?: Accent; sub?: boolean};
export type StatementP = Base &
  BgOpts & {
    kicker?: string;
    kAt?: number;
    lines: Line[];
    align?: 'left' | 'center' | 'bottom' | 'right';
    accent?: Accent;
    flashAt?: number;
    flashRed?: boolean;
    shakeAt?: number;
    panel?: boolean;
  };
export const Statement: React.FC<StatementP> = (p) => {
  const at = useAt(p.start);
  const align = p.align ?? 'left';
  const accent = p.accent ?? 'cyan';
  const shake = useShake(p.shakeAt !== undefined ? at(p.shakeAt) : -999, 18, 16);
  const wrap: React.CSSProperties =
    align === 'center'
      ? {justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 140px'}
      : align === 'bottom'
        ? {justifyContent: 'flex-end', paddingLeft: 140, paddingRight: 300, paddingBottom: 110}
        : align === 'right'
          ? {justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right', paddingRight: 140, paddingLeft: 700}
          : {justifyContent: 'center', paddingLeft: 150, paddingRight: 560};
  const body = (
    <>
      {p.kicker ? (
        <>
          <Kicker text={p.kicker} at={at(p.kAt ?? p.start + 0.2)} color={AC[accent][0]} align={align === 'center' ? 'center' : 'left'} style={align === 'right' ? {justifyContent: 'flex-end'} : undefined} />
          <div style={{height: 30}} />
        </>
      ) : null}
      {p.lines.map((l, i) => (
        <Reveal key={i} at={at(l.at)} dur={16} x={align === 'center' ? 0 : align === 'right' ? 40 : -40} y={align === 'center' ? 30 : 0} style={{marginBottom: l.sub ? 8 : 14}}>
          {l.sub ? (
            <div style={{fontSize: l.size ?? 38, fontWeight: 600, color: C.dim, lineHeight: 1.3}}>
              <Rich text={l.t} accent={l.accent ?? accent} />
            </div>
          ) : (
            <Title size={l.size ?? 84} color={l.color ? AC[l.color][0] : C.text} style={l.color ? {textShadow: glow(AC[l.color][1], 20)} : undefined}>
              <Rich text={l.t} accent={l.accent ?? accent} />
            </Title>
          )}
        </Reveal>
      ))}
    </>
  );
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{...wrap, transform: shake}}>
        {p.panel ? <div style={{...glass, padding: '44px 54px', maxWidth: 1250}}>{body}</div> : body}
      </AbsoluteFill>
      {p.flashAt !== undefined ? <Flash at={at(p.flashAt)} color={p.flashRed ? '255,60,80' : '255,200,90'} peak={0.35} /> : null}
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Quote                                                                */
/* ------------------------------------------------------------------ */
export type QuoteP = Base & BgOpts & {text: string; at: number; who?: string; accent?: Accent; size?: number; kicker?: string};
export const Quote: React.FC<QuoteP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const [col, g] = AC[p.accent ?? 'gold'];
  const words = p.text.split(' ');
  const a0 = at(p.at);
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 200px', textAlign: 'center'}}>
        {p.kicker ? <Kicker text={p.kicker} at={4} color={col} align="center" style={{marginBottom: 30}} /> : null}
        <div
          style={{
            fontSize: 260,
            fontWeight: 900,
            lineHeight: 0.6,
            height: 120,
            color: col,
            opacity: 0.85 * prog(f, a0 - 8, 16),
            textShadow: glow(g, 24),
          }}
        >
          «
        </div>
        <div style={{fontSize: p.size ?? 76, fontWeight: 800, lineHeight: 1.18, color: C.text, fontStyle: 'italic', textShadow: '0 8px 40px rgba(0,0,0,0.7)'}}>
          {words.map((w, i) => {
            const q = prog(f, a0 + i * 3, 14);
            return (
              <span key={i} style={{display: 'inline-block', marginRight: '0.28em', opacity: q, transform: `translateY(${(1 - q) * 22}px)`, filter: q >= 1 ? undefined : `blur(${(1 - q) * 8}px)`}}>
                {w}
              </span>
            );
          })}
        </div>
        {p.who ? (
          <Reveal at={a0 + words.length * 3 + 6} dur={14} style={{marginTop: 36}}>
            <div style={{fontSize: 26, fontWeight: 700, letterSpacing: '0.24em', color: C.dim}}>— {p.who}</div>
          </Reveal>
        ) : null}
      </AbsoluteFill>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Probability chain: n events × p each                                 */
/* ------------------------------------------------------------------ */
export type ChainP = Base &
  BgOpts & {n: number; pct: number; kicker: string; showAt: number; resultAt: number; result: string; caption?: string; captionAt?: number; accent?: Accent};
export const ProbChain: React.FC<ChainP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const s0 = at(p.showAt);
  const r0 = at(p.resultAt);
  const size = p.n > 6 ? 118 : 168;
  const gap = p.n > 6 ? 22 : 46;
  const total = Math.pow(p.pct / 100, p.n) * 100;
  const shown = interpolate(f, [r0, r0 + 30], [p.pct, total], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const link = prog(f, s0 + p.n * 3, 24);
  const [col, g] = AC[p.accent ?? 'red'];
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Kicker text={p.kicker} at={4} align="center" />
        <div style={{height: 60}} />
        <div style={{position: 'relative', display: 'flex', gap}}>
          <div
            style={{
              position: 'absolute',
              left: size / 2,
              top: size / 2 - 1.5,
              height: 3,
              width: (p.n - 1) * (size + gap) * link,
              background: `linear-gradient(90deg, ${C.cyan}, ${f >= r0 ? col : C.cyan})`,
              boxShadow: glow(f >= r0 ? g : C.cyanGlow, 8),
            }}
          />
          {new Array(p.n).fill(0).map((_, i) => {
            const q = spring({frame: f - (s0 + i * 3), fps: 30, config: {damping: 12, stiffness: 160}});
            return (
              <div
                key={i}
                style={{
                  width: size,
                  height: size,
                  ...glass,
                  borderRadius: size / 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${q})`,
                  borderColor: 'rgba(76,201,255,0.55)',
                  boxShadow: `0 0 30px rgba(76,201,255,0.25), ${glass.boxShadow}`,
                }}
              >
                <div style={{fontSize: size * 0.27, fontWeight: 900, color: C.text}}>{p.pct}%</div>
                <div style={{fontSize: size * 0.11, fontWeight: 700, color: C.dim, letterSpacing: '0.12em'}}>МАТЧ {i + 1}</div>
              </div>
            );
          })}
        </div>
        <div style={{height: 70}} />
        <Reveal at={r0 - 10} dur={14}>
          <div style={{fontSize: 34, fontWeight: 700, color: C.dim, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums'}}>
            {(p.pct / 100).toFixed(1).replace('.', ',')}
            <sup style={{fontSize: 22}}>{p.n}</sup> = шанс всего купона
          </div>
        </Reveal>
        <Reveal at={r0} dur={14} scale={1.2}>
          <div style={{fontSize: 200, fontWeight: 900, color: f >= r0 + 20 ? col : C.text, textShadow: glow(f >= r0 + 20 ? g : C.cyanGlow, 30), fontVariantNumeric: 'tabular-nums', lineHeight: 1.05}}>
            {f >= r0 + 30 ? p.result : `${Math.round(shown)}%`}
          </div>
        </Reveal>
        {p.caption ? (
          <Reveal at={at(p.captionAt ?? p.resultAt + 1.5)} dur={14}>
            <div style={{fontSize: 40, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: '0.04em'}}>
              <Rich text={p.caption} accent={p.accent ?? 'red'} />
            </div>
          </Reveal>
        ) : null}
      </AbsoluteFill>
      <Flash at={r0 + 20} color={p.accent === 'gold' ? '255,200,90' : '255,60,80'} peak={0.3} />
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Match run: a row of match cards resolving one by one                 */
/* ------------------------------------------------------------------ */
export type Outcome = 'win' | 'lose' | 'draw' | 'live';
export type MatchRunP = Base &
  BgOpts & {
    title?: string;
    tAt?: number;
    outs: {o: Outcome; at: number; label?: string}[];
    verdict?: string;
    vAt?: number;
    vAccent?: Accent;
    payout?: {at: number; value: number};
  };
export const MatchRun: React.FC<MatchRunP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const lose = p.outs.find((o) => o.o === 'lose' || o.o === 'draw');
  const fail = lose ? at(lose.at) : -999;
  const lost = lose !== undefined && f >= fail;
  const shake = useShake(fail, 22, 18);
  const redWash = lose ? interpolate(f, [fail, fail + 4, fail + 40], [0, 0.5, 0.16], clamp) : 0;
  const w = p.outs.length > 5 ? 150 : 180;
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(255,40,70,0) 30%, rgba(255,30,60,${redWash}) 100%)`}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', transform: shake}}>
        {p.title ? (
          <Reveal at={at(p.tAt ?? p.start)} dur={16}>
            <Title size={60}>
              <Rich text={p.title} accent="green" />
            </Title>
          </Reveal>
        ) : null}
        <div style={{height: 56}} />
        <div style={{display: 'flex', gap: 24}}>
          {p.outs.map((o, i) => {
            const appear = prog(f, 4 + i * 3, 14);
            const done = o.o !== 'live' && f >= at(o.at);
            const k = done ? prog(f, at(o.at), 10) : 0;
            const bad = o.o === 'lose' || o.o === 'draw';
            const col = bad ? C.red : C.green;
            const cg = bad ? C.redGlow : C.greenGlow;
            const live = o.o === 'live' || (!done && bad);
            const pulse = live ? 0.5 + 0.5 * Math.abs(Math.sin(f / 6)) : 0;
            const sym = o.o === 'win' ? '✓' : o.o === 'lose' ? '✕' : o.o === 'draw' ? '1:1' : '';
            return (
              <div
                key={i}
                style={{
                  ...glass,
                  width: w,
                  height: 210,
                  opacity: appear,
                  transform: `translateY(${(1 - appear) * 40}px) scale(${1 + 0.32 * k * (1 - k)})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  borderColor: done ? col : `rgba(255,198,61,${0.15 + 0.6 * pulse})`,
                  boxShadow: done ? `0 0 ${40 * k}px ${cg}, ${glass.boxShadow}` : glass.boxShadow,
                }}
              >
                <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.2em', color: C.dim}}>{o.label ?? `МАТЧ ${i + 1}`}</div>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: sym.length > 1 ? 30 : 48,
                    fontWeight: 900,
                    color: done ? '#06120c' : C.gold,
                    background: done ? col : 'rgba(255,255,255,0.06)',
                    transform: `scale(${done ? 0.6 + 0.4 * k : 1})`,
                  }}
                >
                  {done ? sym : live ? 'LIVE' : '·'}
                </div>
                <div style={{fontSize: 15, fontWeight: 800, color: live && !done ? C.gold : C.dim, letterSpacing: '0.12em'}}>
                  {done ? (bad ? 'НЕ ЗАШЁЛ' : 'ЗАШЁЛ') : live ? `${Math.min(90, 60 + Math.floor(f / 10))}′` : 'ОЖИДАНИЕ'}
                </div>
              </div>
            );
          })}
        </div>
        {p.payout ? (
          <Reveal at={at(p.payout.at)} dur={14} style={{marginTop: 46}}>
            <div style={{...glass, padding: '18px 36px', display: 'flex', gap: 26, alignItems: 'center', borderColor: lost ? 'rgba(255,59,87,0.6)' : 'rgba(255,198,61,0.5)'}}>
              <span style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.18em', color: C.dim}}>ПОТЕНЦИАЛЬНАЯ ВЫПЛАТА</span>
              <span
                style={{
                  fontSize: 58,
                  fontWeight: 900,
                  color: lost ? C.red : C.gold,
                  textDecoration: lost ? 'line-through' : undefined,
                  textShadow: glow(lost ? C.redGlow : C.goldGlow, 14),
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {rub(interpolate(f, [at(p.payout.at), at(p.payout.at) + 30], [0, p.payout.value], clamp))} ₽
              </span>
            </div>
          </Reveal>
        ) : null}
        {p.verdict ? (
          <Reveal at={at(p.vAt ?? 0)} dur={14} y={30} scale={0.9} style={{marginTop: 46}}>
            <Title size={84} color={AC[p.vAccent ?? 'red'][0]} style={{textShadow: glow(AC[p.vAccent ?? 'red'][1], 22)}}>
              {p.verdict}
            </Title>
          </Reveal>
        ) : null}
      </AbsoluteFill>
      {lose ? <Flash at={fail} color="255,60,80" peak={0.5} d={16} /> : null}
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Big animated number                                                  */
/* ------------------------------------------------------------------ */
export type StatP = Base &
  BgOpts & {
    kicker: string;
    from: number;
    to: number;
    at: number;
    d?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    accent?: Accent;
    caption?: string;
    cAt?: number;
    sub?: string;
    sAt?: number;
    align?: 'left' | 'center';
  };
export const BigStat: React.FC<StatP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const a0 = at(p.at);
  const v = interpolate(f, [a0, a0 + (p.d ?? 1.2) * 30], [p.from, p.to], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const [col, g] = AC[p.accent ?? 'gold'];
  const txt = `${p.prefix ?? ''}${v.toFixed(p.decimals ?? 0).replace('.', ',')}${p.suffix ?? ''}`;
  const center = (p.align ?? 'center') === 'center';
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: center ? 'center' : 'flex-start', textAlign: center ? 'center' : 'left', paddingLeft: center ? 0 : 150}}>
        <Kicker text={p.kicker} at={4} color={col} align={center ? 'center' : 'left'} />
        <div style={{height: 20}} />
        <Reveal at={a0 - 4} dur={14} scale={0.8} y={0}>
          <Sheen at={a0 + 40}>
            <div style={{fontSize: 260, fontWeight: 900, color: col, textShadow: glow(g, 30), fontVariantNumeric: 'tabular-nums', lineHeight: 1.05}}>{txt}</div>
          </Sheen>
        </Reveal>
        {p.caption ? (
          <Reveal at={at(p.cAt ?? p.at + 1)} dur={14}>
            <Title size={56}>
              <Rich text={p.caption} accent={p.accent ?? 'gold'} />
            </Title>
          </Reveal>
        ) : null}
        {p.sub ? (
          <Reveal at={at(p.sAt ?? p.at + 2)} dur={14} style={{marginTop: 24, maxWidth: 1300}}>
            <div style={{fontSize: 34, fontWeight: 600, color: C.dim, lineHeight: 1.35}}>
              <Rich text={p.sub} accent={p.accent ?? 'gold'} />
            </div>
          </Reveal>
        ) : null}
      </AbsoluteFill>
      <Flash at={a0 + 2} color={p.accent === 'red' ? '255,60,80' : '255,200,90'} peak={0.22} />
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* List of items with ticks / crosses / numbers                         */
/* ------------------------------------------------------------------ */
export type ListItem = {t: string; at: number; mark?: '✓' | '✕' | '?' | '→' | string; accent?: Accent};
export type ListP = Base & BgOpts & {kicker: string; title?: string; tAt?: number; items: ListItem[]; footer?: string; fAt?: number; fAccent?: Accent; side?: 'left' | 'right'};
export const ListCard: React.FC<ListP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const active = [...p.items].reverse().find((it) => f >= at(it.at));
  const right = p.side === 'right';
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: right ? 'flex-end' : 'flex-start', padding: '0 150px'}}>
        <div style={{width: 1050}}>
          <Kicker text={p.kicker} at={4} />
          {p.title ? (
            <Reveal at={at(p.tAt ?? p.start)} dur={16} x={-30} y={0} style={{marginTop: 26}}>
              <Title size={72}>
                <Rich text={p.title} accent="cyan" />
              </Title>
            </Reveal>
          ) : null}
          <div style={{height: 34}} />
          {p.items.map((it, i) => {
            const on = active === it;
            const [col, g] = AC[it.accent ?? 'cyan'];
            return (
              <Reveal key={i} at={at(it.at)} dur={16} x={-60} y={0} style={{marginBottom: 18}}>
                <div
                  style={{
                    ...glass,
                    padding: '22px 34px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 30,
                    borderColor: on ? col : 'rgba(130,190,255,0.12)',
                    boxShadow: on ? `0 0 40px ${g.replace('0.55', '0.25')}, ${glass.boxShadow}` : glass.boxShadow,
                    opacity: on ? 1 : 0.62,
                  }}
                >
                  <div style={{minWidth: 56, fontSize: 44, fontWeight: 900, color: col, textShadow: on ? glow(g, 10) : undefined}}>{it.mark ?? String(i + 1).padStart(2, '0')}</div>
                  <div style={{fontSize: 38, fontWeight: 800, color: C.text, lineHeight: 1.2}}>
                    <Rich text={it.t} accent={it.accent ?? 'cyan'} />
                  </div>
                </div>
              </Reveal>
            );
          })}
          {p.footer ? (
            <Reveal at={at(p.fAt ?? 0)} dur={16} style={{marginTop: 26}}>
              <Title size={58} color={AC[p.fAccent ?? 'red'][0]} style={{textShadow: glow(AC[p.fAccent ?? 'red'][1], 18)}}>
                {p.footer}
              </Title>
            </Reveal>
          ) : null}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Two-column comparison                                                */
/* ------------------------------------------------------------------ */
export type Col = {title: string; at: number; accent: Accent; rows: {t: string; at: number}[]; big?: string; bigAt?: number};
export type CompareP = Base & BgOpts & {kicker: string; cols: [Col, Col]; vs?: string; footer?: string; fAt?: number};
export const Compare: React.FC<CompareP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Kicker text={p.kicker} at={4} align="center" />
        <div style={{height: 50}} />
        <div style={{display: 'flex', gap: 60, alignItems: 'stretch'}}>
          {p.cols.map((c, ci) => {
            const [col, g] = AC[c.accent];
            return (
              <React.Fragment key={ci}>
                {ci === 1 ? (
                  <Reveal at={at(p.cols[1].at) - 6} dur={14} scale={0.6} y={0} style={{alignSelf: 'center'}}>
                    <div style={{fontSize: 44, fontWeight: 900, color: C.dim}}>{p.vs ?? 'VS'}</div>
                  </Reveal>
                ) : null}
                <Reveal at={at(c.at)} dur={18} x={ci ? 60 : -60} y={0}>
                  <div style={{...glass, width: 640, minHeight: 300, padding: '34px 40px', borderColor: col, boxShadow: `0 0 50px ${g.replace('0.55', '0.18')}, ${glass.boxShadow}`}}>
                    <div style={{fontSize: 40, fontWeight: 900, color: col, letterSpacing: '0.06em', textTransform: 'uppercase', textShadow: glow(g, 12)}}>{c.title}</div>
                    <div style={{height: 1, background: 'rgba(255,255,255,0.1)', margin: '22px 0'}} />
                    {c.rows.map((r, ri) => {
                      const q = prog(f, at(r.at), 14);
                      return (
                        <div key={ri} style={{opacity: q, transform: `translateX(${(1 - q) * 30}px)`, fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 16, lineHeight: 1.25}}>
                          <span style={{color: col, marginRight: 14}}>●</span>
                          <Rich text={r.t} accent={c.accent} />
                        </div>
                      );
                    })}
                    {c.big ? (
                      <Reveal at={at(c.bigAt ?? c.at + 1)} dur={14} scale={1.2} style={{marginTop: 10}}>
                        <div style={{fontSize: 92, fontWeight: 900, color: col, textShadow: glow(g, 20)}}>{c.big}</div>
                      </Reveal>
                    ) : null}
                  </div>
                </Reveal>
              </React.Fragment>
            );
          })}
        </div>
        {p.footer ? (
          <Reveal at={at(p.fAt ?? 0)} dur={16} style={{marginTop: 50}}>
            <Title size={54}>
              <Rich text={p.footer} accent="gold" />
            </Title>
          </Reveal>
        ) : null}
      </AbsoluteFill>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Coupon card with optional extra row and total                        */
/* ------------------------------------------------------------------ */
export type CouponRow = {name: string; odd: number; at: number; tag?: string};
export type CouponP = Base &
  BgOpts & {
    kicker: string;
    rows: CouponRow[];
    totalAt: number;
    stake?: number;
    note?: {t: string; at: number; accent?: Accent}[];
  };
export const CouponScene: React.FC<CouponP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const visible = p.rows.filter((r) => f >= at(r.at));
  const total = visible.reduce((a, r) => a * r.odd, 1);
  const lastAt = visible.length ? at(visible[visible.length - 1].at) : 0;
  const prevTotal = visible.slice(0, -1).reduce((a, r) => a * r.odd, 1);
  const t0 = at(p.totalAt);
  const shownTotal = f < t0 ? null : interpolate(f, [Math.max(t0, lastAt), Math.max(t0, lastAt) + 18], [Math.max(t0, lastAt) === t0 ? 1 : prevTotal, total], clamp);
  const hot = prog(f, t0, 20);
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: '0 150px', gap: 100}}>
        <div style={{flex: 1}}>
          <Kicker text={p.kicker} at={4} />
          <div style={{height: 34}} />
          {(p.note ?? []).map((n, i) => (
            <Reveal key={i} at={at(n.at)} dur={16} x={-40} y={0} style={{marginBottom: 18}}>
              <Title size={64}>
                <Rich text={n.t} accent={n.accent ?? 'gold'} />
              </Title>
            </Reveal>
          ))}
        </div>
        <Reveal at={6} dur={20} x={80} y={0} style={{width: 640}}>
          <div style={{...glass, padding: '26px 30px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14}}>
              <div style={{fontSize: 22, fontWeight: 800, letterSpacing: '0.18em', color: C.text}}>ЭКСПРЕСС</div>
              <div style={{fontSize: 18, fontWeight: 700, color: C.cyan, letterSpacing: '0.1em'}}>СОБЫТИЙ: {visible.length}</div>
            </div>
            <div style={{height: 1, background: 'rgba(130,190,255,0.18)', marginBottom: 8}} />
            {p.rows.map((r, i) => {
              const q = prog(f, at(r.at), 12);
              if (q <= 0) return null;
              const isNew = r.tag !== undefined;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 46 * q,
                    opacity: q,
                    overflow: 'hidden',
                    transform: `translateX(${(1 - q) * 40}px)`,
                    fontSize: 22,
                    fontWeight: 600,
                    color: 'rgba(230,240,255,0.88)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: isNew ? 'rgba(255,198,61,0.1)' : undefined,
                    borderRadius: isNew ? 8 : 0,
                    padding: isNew ? '0 10px' : 0,
                  }}
                >
                  <span>
                    <span style={{color: 'rgba(160,190,230,0.55)', marginRight: 14, fontWeight: 700}}>{String(i + 1).padStart(2, '0')}</span>
                    {r.name}
                    {isNew ? <span style={{marginLeft: 12, fontSize: 14, fontWeight: 800, color: C.gold, letterSpacing: '0.1em'}}>{r.tag}</span> : null}
                  </span>
                  <span style={{fontWeight: 800, color: isNew ? C.gold : C.text, fontVariantNumeric: 'tabular-nums'}}>{r.odd.toFixed(2)}</span>
                </div>
              );
            })}
            <div
              style={{
                marginTop: 18,
                padding: '16px 20px',
                borderRadius: 14,
                background: `rgba(255,198,61,${0.04 + 0.1 * hot})`,
                border: `1px solid rgba(255,198,61,${0.15 + 0.5 * hot})`,
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.16em', color: C.dim}}>ОБЩИЙ КОЭФФИЦИЕНТ</span>
                <span style={{fontSize: 52, fontWeight: 900, color: C.gold, textShadow: hot ? glow(C.goldGlow, 16 * hot) : undefined, fontVariantNumeric: 'tabular-nums'}}>
                  {shownTotal === null ? '—' : shownTotal.toFixed(2)}
                </span>
              </div>
              {p.stake && shownTotal !== null ? (
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 20, fontWeight: 700, color: C.dim}}>
                  <span>Ставка {rub(p.stake)} ₽</span>
                  <span style={{color: C.text}}>Выплата {rub(p.stake * shownTotal)} ₽</span>
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>
      </AbsoluteFill>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Stake / win / loss cards                                             */
/* ------------------------------------------------------------------ */
export type MoneyP = Base & BgOpts & {odd: number; stake: number; sAt: number; winAt: number; loseAt: number; footer?: string; fAt?: number};
export const Money: React.FC<MoneyP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const card = (title: string, val: string, col: string, g: string, a: number, sub: string) => (
    <Reveal at={at(a)} dur={18} y={50}>
      <div style={{...glass, width: 580, padding: '36px 40px', textAlign: 'center', borderColor: col, boxShadow: `0 0 50px ${g.replace('0.55', '0.22')}, ${glass.boxShadow}`}}>
        <div style={{fontSize: 22, fontWeight: 800, letterSpacing: '0.2em', color: C.dim}}>{title}</div>
        <div style={{fontSize: 100, fontWeight: 900, color: col, textShadow: glow(g, 20), marginTop: 10, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{val}</div>
        <div style={{fontSize: 24, fontWeight: 600, color: C.dim}}>{sub}</div>
      </div>
    </Reveal>
  );
  const s0 = at(p.sAt);
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Kicker text={`Цена коэффициента ${p.odd.toFixed(2).replace('.', ',')}`} at={4} align="center" />
        <div style={{height: 30}} />
        <Reveal at={s0} dur={16}>
          <div style={{fontSize: 40, fontWeight: 800, color: C.text, letterSpacing: '0.06em'}}>
            СТАВКА <span style={{color: C.cyan, textShadow: glow(C.cyanGlow, 12)}}>{rub(interpolate(f, [s0, s0 + 20], [0, p.stake], clamp))} ₽</span>
          </div>
        </Reveal>
        <div style={{height: 50}} />
        <div style={{display: 'flex', gap: 60}}>
          {card('ЕСЛИ ВЫИГРАЛ', `+${rub(p.stake * (p.odd - 1))} ₽`, C.green, C.greenGlow, p.winAt, 'чистая прибыль')}
          {card('ЕСЛИ ПРОИГРАЛ', `−${rub(p.stake)} ₽`, C.red, C.redGlow, p.loseAt, 'вся ставка')}
        </div>
        {p.footer ? (
          <Reveal at={at(p.fAt ?? 0)} dur={16} style={{marginTop: 50}}>
            <Title size={52}>
              <Rich text={p.footer} accent="gold" />
            </Title>
          </Reveal>
        ) : null}
      </AbsoluteFill>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Survivorship: one shiny screenshot vs the hidden pile of losses      */
/* ------------------------------------------------------------------ */
export type SurvP = Base & BgOpts & {postAt: number; pileAt: number; caption?: string; cAt?: number};
export const Survivorship: React.FC<SurvP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const pile = at(p.pileAt);
  const N = 60;
  const zoomOut = prog(f, pile - 6, 40);
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 14, padding: '80px 120px'}}>
          {new Array(N).fill(0).map((_, i) => {
            const q = prog(f, pile + (random(`d${i}`) * 40) | 0, 12);
            return (
              <div
                key={i}
                style={{
                  width: 150,
                  height: 92,
                  borderRadius: 10,
                  background: 'rgba(30,10,18,0.75)',
                  border: '1px solid rgba(255,59,87,0.45)',
                  opacity: q * 0.9,
                  transform: `scale(${0.7 + 0.3 * q})`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: C.red,
                  fontWeight: 900,
                  fontSize: 30,
                }}
              >
                ✕<span style={{fontSize: 12, letterSpacing: '0.16em', color: 'rgba(255,160,170,0.7)'}}>ПРОИГРЫШ</span>
              </div>
            );
          })}
        </div>
        <Reveal at={at(p.postAt)} dur={18} scale={0.85} y={40}>
          <div
            style={{
              ...glass,
              width: 560,
              padding: '28px 32px',
              transform: `scale(${1 - 0.35 * zoomOut})`,
              borderColor: 'rgba(53,224,140,0.7)',
              boxShadow: `0 0 70px rgba(53,224,140,0.3), ${glass.boxShadow}`,
              background: 'linear-gradient(180deg, rgba(14,40,32,0.95), rgba(6,16,14,0.97))',
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{width: 46, height: 46, borderRadius: 23, background: 'linear-gradient(135deg,#4cc9ff,#35e08c)'}} />
              <div>
                <div style={{fontSize: 20, fontWeight: 800, color: C.text}}>lucky_bettor</div>
                <div style={{fontSize: 15, color: C.dim}}>только что</div>
              </div>
            </div>
            <div style={{fontSize: 22, fontWeight: 700, color: C.dim, margin: '20px 0 6px', letterSpacing: '0.12em'}}>ЭКСПРЕСС · 10 СОБЫТИЙ ✓</div>
            <div style={{fontSize: 24, fontWeight: 700, color: C.text}}>Ставка 500 ₽ · коэф. 312,40</div>
            <div style={{fontSize: 76, fontWeight: 900, color: C.green, textShadow: glow(C.greenGlow, 18)}}>+156 200 ₽</div>
            <div style={{fontSize: 18, color: C.dim, marginTop: 8}}>♥ 4 812 · ↻ 1 240</div>
          </div>
        </Reveal>
      </AbsoluteFill>
      {p.caption ? (
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60}}>
          <Reveal at={at(p.cAt ?? p.pileAt + 2)} dur={16}>
            <div style={{...glass, padding: '18px 36px'}}>
              <Title size={44}>
                <Rich text={p.caption} accent="red" />
              </Title>
            </div>
          </Reveal>
        </AbsoluteFill>
      ) : null}
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Expected value: many repeats drift down                              */
/* ------------------------------------------------------------------ */
export type EVP = Base & BgOpts & {at: number; value: string; caption: string; cAt: number};
export const EVChart: React.FC<EVP> = (p) => {
  const f = useCurrentFrame();
  const at = useAt(p.start);
  const a0 = at(p.at);
  const W = 1400;
  const H = 420;
  const n = 80;
  const pts: string[] = [];
  const sim: number[] = [];
  let bal = 0;
  const draw = interpolate(f, [a0, a0 + 90], [0, 1], clamp);
  for (let i = 0; i < n; i++) {
    // Coupon odds 2.49, win chance ~0.328: EV = 0.328*1.49 - 0.672 = -0.185 per unit.
    bal += random(`ev${i}`) < 0.328 ? 1.49 : -1;
    sim.push(bal);
  }
  // Pin the random walk's end to its expected value so the chart shows the trend, not luck.
  const drift = (sim[n - 1] + 0.185 * n) / (n - 1);
  sim.forEach((b, i) => pts.push(`${(i / (n - 1)) * W},${H / 2 - (b - drift * i) * 9}`));
  const visibleN = Math.max(2, Math.floor(n * draw));
  return (
    <Scene dur={p.dur}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Kicker text="Если повторять много раз" at={4} align="center" />
        <div style={{height: 40}} />
        <div style={{...glass, padding: 40}}>
          <svg width={W} height={H} style={{overflow: 'visible'}}>
            <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.25)" strokeDasharray="8 8" />
            <text x={6} y={H / 2 - 12} fill="rgba(214,228,255,0.6)" fontSize={20} fontWeight={700}>
              0
            </text>
            <line x1={0} y1={H / 2} x2={W * draw} y2={H / 2 + 0.185 * n * 9 * draw} stroke={C.red} strokeWidth={3} strokeDasharray="14 10" opacity={0.85} />
            <polyline points={pts.slice(0, visibleN).join(' ')} fill="none" stroke={C.cyan} strokeWidth={3.5} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 6px ${C.cyanGlow})`}} />
          </svg>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 40, marginTop: 40}}>
          <Reveal at={a0 + 60} dur={14} scale={1.2}>
            <div style={{fontSize: 130, fontWeight: 900, color: C.red, textShadow: glow(C.redGlow, 22)}}>{p.value}</div>
          </Reveal>
          <Reveal at={at(p.cAt)} dur={14} x={-30} y={0}>
            <div style={{fontSize: 38, fontWeight: 800, color: C.text, maxWidth: 640, textTransform: 'uppercase', lineHeight: 1.2}}>{p.caption}</div>
          </Reveal>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Ending: comments CTA + subscribe                                     */
/* ------------------------------------------------------------------ */
export type CTAP = Base & BgOpts & {subAt: number; tgAt: number; byeAt: number};
export const CTA: React.FC<CTAP> = (p) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = useAt(p.start);
  const btn = (label: string, a: number, col: string, g: string, icon: React.ReactNode) => {
    const s = spring({frame: f - at(a), fps, config: {damping: 11, stiffness: 150}});
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '24px 46px',
          borderRadius: 18,
          background: col,
          color: '#fff',
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: '0.06em',
          boxShadow: `0 0 50px ${g}`,
          transform: `scale(${s})`,
          opacity: Math.min(1, s * 2),
        }}
      >
        {icon}
        {label}
      </div>
    );
  };
  return (
    <Scene dur={p.dur} fadeOut={20}>
      <BgX {...p} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <Reveal at={6} dur={20} scale={0.8} y={0}>
          <Title size={140} style={{letterSpacing: '0.08em', textShadow: '0 0 40px rgba(120,200,255,0.35)'}}>
            <Letters text="BETTING LAB" at={6} stagger={1.6} />
          </Title>
        </Reveal>
        <Reveal at={24} dur={18}>
          <div style={{fontSize: 30, fontWeight: 600, color: C.dim, marginTop: 20, letterSpacing: '0.08em', maxWidth: 1300, lineHeight: 1.4}}>
            Букмекерская индустрия · психология ставок · то, о чём не говорят
          </div>
        </Reveal>
        <div style={{display: 'flex', gap: 40, marginTop: 70}}>
          {btn('ПОДПИСАТЬСЯ', p.subAt, '#e3263f', 'rgba(227,38,63,0.55)', <span style={{fontSize: 34}}>▶</span>)}
          {btn('TELEGRAM', p.tgAt, '#2aa3e0', 'rgba(42,163,224,0.55)', <span style={{fontSize: 34}}>✈</span>)}
        </div>
        <Reveal at={at(p.byeAt)} dur={18} style={{marginTop: 60}}>
          <div style={{fontSize: 36, fontWeight: 800, color: C.gold, letterSpacing: '0.2em', textShadow: glow(C.goldGlow, 14)}}>УВИДИМСЯ В СЛЕДУЮЩЕМ ВЫПУСКЕ</div>
        </Reveal>
      </AbsoluteFill>
    </Scene>
  );
};
