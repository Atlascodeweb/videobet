import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {DISC_AT, DISC_LEN, FPS, fontFamily, vf} from './theme';
import {clamp, Grain, SceneProps, Watermark} from './lib';
import * as S from './scenes/intro';

// Crossfade overlap (frames) into the following scene.
const OV = 10;

type Cue = [start: number, end: number, C: React.FC<SceneProps>, overlap?: boolean];
const SCENES: Cue[] = [
  [0, 3.3, S.Logo],
  [3.3, 5.8, S.Topic],
  [5.8, 14.9, S.CouponBuild],
  [14.9, 20.8, S.OneLoss],
  [20.8, 25.15, S.SmallOdds],
  [25.15, 30.9, S.AlmostWin],
  [30.9, 33.55, S.Balance],
  [33.55, 42.85, S.Agenda],
  [42.85, DISC_AT, S.NoPromises, false],
  [DISC_AT, 51.45, S.Chapter1],
  [51.45, 64.9, S.Evening],
  [64.9, 73.4, S.ModestOdds, false],
];

export const TEST_END = 73.4;
export const TEST_FRAMES = vf(TEST_END) + 12;

const SFX: [t: number, name: string, vol: number][] = [
  [0.1, 'riser', 0.35],
  [1.6, 'impact', 0.5],
  [3.3, 'whoosh', 0.35],
  [4.6, 'impact', 0.35],
  [5.8, 'whoosh', 0.35],
  [8.1, 'tick', 0.5],
  [8.7, 'tick', 0.5],
  [9.32, 'tick', 0.5],
  [12.66, 'riser', 0.25],
  [14.9, 'whoosh', 0.35],
  [16.0, 'tick', 0.45],
  [16.4, 'tick', 0.45],
  [16.8, 'tick', 0.45],
  [17.2, 'tick', 0.45],
  [18.5, 'impact', 0.7],
  [20.8, 'whoosh', 0.35],
  [24.2, 'impact', 0.35],
  [25.15, 'whoosh', 0.35],
  [30.9, 'whoosh', 0.3],
  [33.55, 'whoosh', 0.35],
  [34.2, 'tick', 0.4],
  [35.56, 'tick', 0.4],
  [37.46, 'tick', 0.4],
  [41.6, 'impact', 0.35],
  [42.85, 'whoosh', 0.35],
  [46.7, 'riser', 0.3],
  [48.5, 'whoosh', 0.35],
  [49.74, 'impact', 0.35],
  [51.45, 'whoosh', 0.3],
  [55.8, 'tick', 0.4],
  [58.24, 'tick', 0.4],
  [61.2, 'tick', 0.4],
  [64.9, 'whoosh', 0.3],
  [67.76, 'tick', 0.5],
  [69.5, 'tick', 0.5],
  [71.32, 'tick', 0.5],
];

const discFrom = vf(DISC_AT - 0.0001) + 1;
const discLen = DISC_LEN * FPS;

export const TestMinute: React.FC = () => {
  const voice = staticFile('media/voice.mp3');
  return (
    <AbsoluteFill style={{background: '#000', fontFamily}}>
      {SCENES.map(([s, e, Comp, overlap = true]) => {
        const dur = vf(e) - vf(s) + (overlap ? OV : 0);
        return (
          <Sequence key={s} from={vf(s)} durationInFrames={dur}>
            <Comp start={s} dur={dur} />
          </Sequence>
        );
      })}

      <Sequence from={vf(5.8)} durationInFrames={discFrom - vf(5.8)}>
        <Watermark />
      </Sequence>
      <Sequence from={vf(51.45)} durationInFrames={TEST_FRAMES - vf(51.45)}>
        <Watermark />
      </Sequence>

      <Sequence from={discFrom} durationInFrames={discLen}>
        <OffthreadVideo src={staticFile('media/disclaimer.mp4')} />
      </Sequence>

      <Grain />

      {/* Voiceover, split around the disclaimer */}
      <Sequence from={0} durationInFrames={discFrom}>
        <Audio src={voice} trimAfter={Math.round(DISC_AT * FPS)} />
      </Sequence>
      <Sequence from={discFrom + discLen} durationInFrames={TEST_FRAMES - discFrom - discLen}>
        <Audio src={voice} trimBefore={Math.round(DISC_AT * FPS)} trimAfter={Math.round(TEST_END * FPS)} />
      </Sequence>

      <Audio
        src={staticFile('sfx/pad.wav')}
        volume={(f) =>
          0.32 *
          interpolate(f, [0, 30, discFrom - 15, discFrom, discFrom + discLen, discFrom + discLen + 20, TEST_FRAMES - 40, TEST_FRAMES], [0, 1, 1, 0.25, 0.25, 1, 1, 0], clamp)
        }
        trimAfter={TEST_FRAMES}
      />
      {SFX.map(([t, name, vol], i) => (
        <Sequence key={i} from={vf(t)} durationInFrames={60}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
