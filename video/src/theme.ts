import {loadFont} from '@remotion/google-fonts/Montserrat';

export const {fontFamily} = loadFont('normal', {
  weights: ['500', '600', '700', '800', '900'],
  subsets: ['latin', 'cyrillic'],
});

export const FPS = 30;

export const C = {
  bg: '#04070e',
  cyan: '#4cc9ff',
  cyanGlow: 'rgba(76,201,255,0.55)',
  gold: '#ffc63d',
  goldGlow: 'rgba(255,198,61,0.55)',
  red: '#ff3b57',
  redGlow: 'rgba(255,59,87,0.55)',
  green: '#35e08c',
  greenGlow: 'rgba(53,224,140,0.5)',
  text: '#eef4ff',
  dim: 'rgba(214,228,255,0.62)',
};

// The disclaimer clip is inserted between the intro and chapter 1; the voiceover pauses for it.
export const DISC_AT = 48.4;
export const DISC_LEN = 10;

// Voiceover time (s) -> output frame.
export const vf = (t: number) => Math.round((t < DISC_AT ? t : t + DISC_LEN) * FPS);
