import type { ComponentType } from 'react';

/**
 * The single contract every player engine implements. The host
 * (`PlayerSurface`) owns shared concerns — permission, loading cover, error and
 * retry, layout — so an engine only renders media at 100% and reports
 * lifecycle through `onReady` / `onError`.
 */
export interface PlayerRendererProps {
  videoId: string;
  cookiesEnabled: boolean;
  autoPlayEnabled: boolean;
  loopEnabled: boolean;
  forcedAspectRatio: number | null;
  onReady: () => void;
  onError: (error: Error) => void;
}

export type PlayerRenderer = ComponentType<PlayerRendererProps>;
