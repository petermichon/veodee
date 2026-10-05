import { Suspense, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import type { FullscreenMode, PlayerEngine } from '@/lib/player';
import { LoadingBackground } from './loading-background';
import { PLAYER_RENDERERS } from './engines/registry';

export interface PlayerSurfaceProps {
  videoId: string | null;
  engine: PlayerEngine;
  cookiesEnabled: boolean;
  autoPlay: boolean;
  loop: boolean;
  forcedAspectRatio: number | null;
  fillScreen: boolean;
  fullscreenMode: FullscreenMode;
  showPermissionModal: boolean;
  onGrantPermission: () => void;
}

function getLayoutStyle(
  fillScreen: boolean,
  fullscreenMode: FullscreenMode
): CSSProperties {
  if (!fillScreen) {
    return {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    };
  }

  const centered: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'hidden',
  };

  return fullscreenMode === 'contain'
    ? {
        ...centered,
        width: 'min(100vw, 100vh * 16 / 9)',
        height: 'min(100vh, 100vw * 9 / 16)',
      }
    : {
        ...centered,
        width: 'max(100vw, 100vh * 16 / 9)',
        height: 'max(100vh, 100vw * 9 / 16)',
      };
}

/**
 * Host for every player engine. Owns the concerns shared across engines —
 * permission, loading cover, error + retry, and layout — and delegates media
 * rendering to the engine registered for the selected {@link PlayerEngine}.
 */
export function PlayerSurface({
  videoId,
  engine,
  cookiesEnabled,
  autoPlay,
  loop,
  forcedAspectRatio,
  fillScreen,
  fullscreenMode,
  showPermissionModal,
  onGrantPermission,
}: PlayerSurfaceProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const resetKey = [
    videoId,
    engine,
    cookiesEnabled,
    autoPlay,
    loop,
    retryKey,
  ].join(':');
  const [previousResetKey, setPreviousResetKey] = useState(resetKey);
  if (previousResetKey !== resetKey) {
    setPreviousResetKey(resetKey);
    setIsLoading(true);
    setError(null);
  }

  const Engine = PLAYER_RENDERERS[engine];

  return (
    <div className="relative w-full h-full">
      {showPermissionModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 pointer-events-auto text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Allow YouTube Connection
            </h3>
            <div className="text-sm text-muted-foreground">
              <p>
                YouTube may collect IP address, browser info, and viewing data
                per their privacy policy
              </p>
            </div>
            <Button
              onClick={onGrantPermission}
              className="w-full text-white bg-red-600 hover:bg-red-700"
            >
              Allow
            </Button>
          </div>
        </div>
      )}

      {videoId && (
        <>
          <LoadingBackground
            videoId={videoId}
            isLoading={isLoading && !error}
          />

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center text-white">
                <p className="mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRetryKey((key) => key + 1)}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div
            style={getLayoutStyle(fillScreen, fullscreenMode)}
            className="bg-transparent"
          >
            <Suspense fallback={null}>
              <Engine
                key={resetKey}
                videoId={videoId}
                cookiesEnabled={cookiesEnabled}
                autoPlay={autoPlay}
                loop={loop}
                forcedAspectRatio={forcedAspectRatio}
                onReady={() => setIsLoading(false)}
                onError={(err) => {
                  console.error('Player error:', err);
                  setError('Failed to load video');
                  setIsLoading(false);
                }}
              />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}
