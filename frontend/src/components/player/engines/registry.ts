import { lazy } from 'react';
import type { PlayerEngine } from '@/lib/player';
import type { PlayerRenderer } from '../types';
import IframePlayer from './iframe-player';

// Plyr and Video.js are sizeable dependencies and are only needed once selected.
const PlyrPlayer = lazy(() => import('./plyr-player'));
const VideoJsPlayer = lazy(() => import('./videojs-player'));

/**
 * Maps each engine to its renderer. The `satisfies` clause makes adding a new
 * {@link PlayerEngine} a compile error until it is registered here.
 */
export const PLAYER_RENDERERS = {
  iframe: IframePlayer,
  plyr: PlyrPlayer,
  videojs: VideoJsPlayer,
} as const satisfies Record<PlayerEngine, PlayerRenderer>;
