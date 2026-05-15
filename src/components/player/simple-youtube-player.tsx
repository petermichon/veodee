import { useEffect, useRef, useState } from 'react';
import * as Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { LoadingBackground } from './loading-background';

interface SimpleYoutubePlayerProps {
  videoId: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
  autoPlayEnabled?: boolean;
  loopEnabled?: boolean;
  forcedAspectRatio?: number | null;
}

export function SimpleYoutubePlayer({
  videoId,
  onReady,
  onError,
  autoPlayEnabled = false,
  loopEnabled = false,
  forcedAspectRatio,
}: SimpleYoutubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousVideoIdRef = useRef<string | null>(null);
  const previousAutoPlayRef = useRef<boolean>(autoPlayEnabled);
  const previousLoopRef = useRef<boolean>(loopEnabled);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    // Skip re-initialization if nothing has changed
    if (
      previousVideoIdRef.current === videoId &&
      previousAutoPlayRef.current === autoPlayEnabled &&
      previousLoopRef.current === loopEnabled
    )
      return;

    previousVideoIdRef.current = videoId;
    previousAutoPlayRef.current = autoPlayEnabled;
    previousLoopRef.current = loopEnabled;

    setIsLoading(true);
    setError(null);

    // Clean up any existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (err) {
        console.warn('Plyr cleanup error:', err);
      }
      playerRef.current = null;
    }

    // Create the HTML structure for Plyr YouTube
    containerRef.current.innerHTML = `
      <div 
        class="plyr__video-embed" 
        data-plyr-provider="youtube" 
        data-plyr-embed-id="${videoId}"
        style="${forcedAspectRatio ? `aspect-ratio: ${forcedAspectRatio} !important;` : ''}"
      >
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;autohide=1&amp;wmode=opaque&amp;autoplay=${autoPlayEnabled ? 1 : 0}" 
          allowfullscreen
          allowtransparency
          allow="autoplay"
          style="${forcedAspectRatio ? `aspect-ratio: ${forcedAspectRatio} !important;` : ''}"
        ></iframe>
      </div>
    `;

    try {
      const playerElement =
        containerRef.current.querySelector('.plyr__video-embed');
      if (!playerElement) {
        throw new Error('Player element not found');
      }

      // Initialize Plyr with npm package
      const player = new (Plyr as any).default(playerElement as HTMLElement, {
        autoplay: autoPlayEnabled,
        muted: autoPlayEnabled,
        loop: { active: loopEnabled },
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
        ratio: forcedAspectRatio ? `${forcedAspectRatio}:1` : null,
      });

      playerRef.current = player;

      // Apply forced aspect ratio after Plyr initializes
      if (forcedAspectRatio) {
        const plyrElement = containerRef.current.querySelector('.plyr');
        if (plyrElement) {
          (plyrElement as HTMLElement).style.aspectRatio = `${forcedAspectRatio}`;
          (plyrElement as HTMLElement).style.height = '100%';
          (plyrElement as HTMLElement).style.width = '100%';
        }
        const embedElement = containerRef.current.querySelector('.plyr__video-embed');
        if (embedElement) {
          (embedElement as HTMLElement).style.aspectRatio = `${forcedAspectRatio}`;
          (embedElement as HTMLElement).style.height = '100%';
          (embedElement as HTMLElement).style.width = '100%';
          const iframe = embedElement.querySelector('iframe');
          if (iframe) {
            (iframe as HTMLElement).style.aspectRatio = `${forcedAspectRatio}`;
            (iframe as HTMLElement).style.height = '100%';
            (iframe as HTMLElement).style.width = '100%';
          }
        }
      }

      player.on('ready', () => {
        setIsLoading(false);
        if (onReady) onReady();
      });

      player.on('error', (error) => {
        console.error('Plyr player error:', error);
        setError('Failed to load video');
        setIsLoading(false);
        if (onError) onError(error as Error);
      });
    } catch (err) {
      console.error('Plyr initialization error:', err);
      setError('Failed to initialize player');
      setIsLoading(false);
      if (onError) onError(err as Error);
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        try {
          // Check if player is initialized before destroying
          if (playerRef.current.initialised) {
            playerRef.current.destroy();
          }
        } catch (err) {
          console.warn('Plyr cleanup error:', err);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, onReady, onError, autoPlayEnabled, loopEnabled]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <LoadingBackground videoId={videoId} isLoading={isLoading} />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center text-white">
            <p className="mb-2">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Force re-initialization
                setTimeout(() => {
                  if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                  }
                }, 100);
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          minHeight: '200px',
          aspectRatio: forcedAspectRatio || undefined,
        }}
      />
    </div>
  );
}
