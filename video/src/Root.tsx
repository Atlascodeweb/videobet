import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './theme';
import {TestMinute, TEST_FRAMES} from './TestMinute';

export const Root: React.FC = () => (
  <Composition id="TestMinute" component={TestMinute} durationInFrames={TEST_FRAMES} fps={FPS} width={1920} height={1080} />
);
