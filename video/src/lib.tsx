import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C} from './theme';

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type SceneProps = {start: number; dur: number};

/** Converts a voiceover timestamp into a frame local to the scene that starts at `start`. */
export const useAt = (start: number) => {
  const {fps} = useVideoConfig();
  return (t: number) => Math.round((t - start) * fps);
};

export const prog = (f: number, a: number, d: number, e = ease) =>
  interpolate(f, [a, a + d], [0, 1], {...clamp, easing: e});

export const rub = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');

export const glow = (c: string, r = 28) => `0 0 ${r}px ${c}, 0 0 ${r * 2.2}px ${c}`;

export const glass: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(22,34,56,0.74) 0%, rgba(8,13,25,0.82) 100%)',
  border: '1px solid rgba(130,190,255,0.16)',
  borderRadius: 20,
  boxShadow:
    '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 40px rgba(76,201,255,0.04)',
};

export const Scene: React.FC<{
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({dur, fadeIn = 10, fadeOut = 0, children}) => {
  const f = useCurrentFrame();
  const i = fadeIn ? interpolate(f, [0, fadeIn], [0, 1], clamp) : 1;
  const o = fadeOut ? interpolate(f, [dur - fadeOut, dur], [1, 0], clamp) : 1;
  return <AbsoluteFill style={{opacity: Math.min(i, o)}}>{children}</AbsoluteFill>;
};

/** Ken Burns background with cinematic grade. `overlay` shares the image transform but sits above the dimming. */
export const Bg: React.FC<{
  src: string;
  dur: number;
  from?: number;
  to?: number;
  dx?: number;
  dy?: number;
  blur?: number;
  dim?: number;
  overlay?: React.ReactNode;
}> = ({src, dur, from = 1.06, to = 1.16, dx = 0, dy = 0, blur = 0, dim = 0.45, overlay}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const s = from + (to - from) * p;
  const transform = `scale(${s}) translate(${dx * p}px, ${dy * p}px)`;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.bg}}>
      <AbsoluteFill style={{transform}}>
        <Img
          src={staticFile(blur ? `img/blur/${src.replace('.png', '.jpg')}` : `img/${src}`)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'saturate(1.08) contrast(1.06)',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(3,6,14,${dim})`}} />
      <AbsoluteFill
        style={{background: 'linear-gradient(120deg, rgba(20,60,120,0.18), rgba(0,0,0,0) 55%, rgba(120,20,40,0.12))', mixBlendMode: 'screen'}}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(3,6,14,0.45) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 62%, rgba(3,6,14,0.8) 100%)',
        }}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.78) 100%)'}}
      />
      {overlay ? <AbsoluteFill style={{transform}}>{overlay}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.075}) => {
  const f = useCurrentFrame();
  const i = Math.floor(f / 2) % 4;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`fx/grain${i}.png`)})`,
        backgroundSize: '256px 256px',
        backgroundPosition: `${(f * 37) % 256}px ${(f * 53) % 256}px`,
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

export const Particles: React.FC<{count?: number; color?: string}> = ({count = 42, color = '170,215,255'}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`px${i}`) * 1920;
        const y0 = random(`py${i}`) * 1080;
        const sp = 0.15 + random(`ps${i}`) * 0.45;
        const size = 1.2 + random(`pz${i}`) * 3.2;
        const y = (((y0 - f * sp) % 1180) + 1180) % 1180 - 50;
        const x = x0 + Math.sin(f / (40 + i) + i) * 18;
        const tw = 0.25 + 0.75 * Math.abs(Math.sin(f / (22 + (i % 9) * 4) + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `rgba(${color},${0.55 * tw})`,
              boxShadow: `0 0 ${size * 4}px rgba(${color},${0.5 * tw})`,
              filter: size > 3.5 ? 'blur(1px)' : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{at: number; color?: string; peak?: number; d?: number}> = ({
  at,
  color = '120,200,255',
  peak = 0.45,
  d = 14,
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 2, at + 1, at + d], [0, peak, 0], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(${color},0.9) 0%, rgba(${color},0.25) 40%, rgba(0,0,0,0) 75%)`,
        opacity: o,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
  );
};

/** Decaying camera shake starting at `at`. */
export const useShake = (at: number, amp = 18, d = 16) => {
  const f = useCurrentFrame();
  if (f < at || f > at + d) return 'translate(0px,0px)';
  const k = 1 - (f - at) / d;
  const x = (random(`sx${f}`) - 0.5) * 2 * amp * k;
  const y = (random(`sy${f}`) - 0.5) * 2 * amp * k;
  return `translate(${x}px,${y}px)`;
};

export const Reveal: React.FC<{
  at: number;
  dur?: number;
  y?: number;
  x?: number;
  blur?: number;
  scale?: number;
  out?: number;
  outDur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, dur = 16, y = 30, x = 0, blur = 10, scale = 1, out, outDur = 10, style, children}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur);
  const o = out === undefined ? 1 : interpolate(f, [out, out + outDur], [1, 0], clamp);
  const po = out === undefined ? 0 : 1 - o;
  return (
    <div
      style={{
        opacity: p * o,
        transform: `translate(${(1 - p) * x}px, ${(1 - p) * y - po * 20}px) scale(${scale + (1 - scale) * p})`,
        filter: p >= 1 && po <= 0 ? undefined : `blur(${(1 - p) * blur + po * 8}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Letters: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({text, at, stagger = 1.4, dur = 14, style}) => {
  const f = useCurrentFrame();
  return (
    <span style={{display: 'inline-block', whiteSpace: 'pre', ...style}}>
      {[...text].map((ch, i) => {
        const p = prog(f, at + i * stagger, dur);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 0.4}em) scale(${0.9 + 0.1 * p})`,
              filter: p >= 1 ? undefined : `blur(${(1 - p) * 9}px)`,
            }}
          >
            {ch === ' ' ? '\u00a0' : ch}
          </span>
        );
      })}
    </span>
  );
};

export const Kicker: React.FC<{
  text: string;
  at: number;
  color?: string;
  size?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}> = ({text, at, color = C.cyan, size = 22, align = 'left', style}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 18);
  const line = <div style={{width: 56 * p, height: 2, background: color, boxShadow: glow(color, 8), opacity: 0.9}} />;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap: 16,
        color,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: '0.34em',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {line}
      <Letters text={text} at={at + 3} stagger={0.7} dur={12} />
      {align === 'center' ? line : null}
    </div>
  );
};

/** Moving specular highlight across a block of text. */
export const Sheen: React.FC<{at: number; d?: number; children: React.ReactNode}> = ({at, d = 24, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + d], [-30, 130], clamp);
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      {children}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(105deg, rgba(255,255,255,0) ${p - 12}%, rgba(255,255,255,0.75) ${p}%, rgba(255,255,255,0) ${p + 12}%)`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export const Watermark: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 18));
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        top: 42,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: 'rgba(220,235,255,0.75)',
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: '0.3em',
      }}
    >
      <div
        style={{width: 8, height: 8, borderRadius: 4, background: C.cyan, opacity: pulse, boxShadow: glow(C.cyan, 6)}}
      />
      BETTING LAB
    </div>
  );
};
