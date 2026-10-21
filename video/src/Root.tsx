import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './theme';
import {TestMinute, TEST_FRAMES} from './TestMinute';
import {Full, FULL_FRAMES} from './Full';

export const Root: React.FC = () => (
  <>
    <Composition id="Full" component={Full} durationInFrames={FULL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="TestMinute" component={TestMinute} durationInFrames={TEST_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
