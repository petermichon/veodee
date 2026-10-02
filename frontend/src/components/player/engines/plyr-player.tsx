import { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { youtubeEmbedBaseUrl } from '@/lib/player';
import type { PlayerRendererProps } from '../types';

declare global {
  interface Window {
    YT?: {
      Player: new (...args: unknown[]) => unknown;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function ensureYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => {
      youtubeApiPromise = null;
      reject(new Error('Failed to load YouTube API'));
    };
    document.head.appendChild(tag);
  });

  return youtubeApiPromise;
}

/**
 * Plyr's YouTube embed. Readiness is detected from the underlying YT player
 * state (or a 5s fallback) rather than Plyr's `ready`, which fires before the
 * first frame paints.
 */
export default function PlyrPlayer({
  videoId,
  cookiesEnabled,
  autoPlayEnabled,
  loopEnabled,
  forcedAspectRatio,
  onReady,
  onError,
}: PlayerRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    const markReady = () => {
      if (!cancelled) onReadyRef.current();
    };
    const markError = (error: Error) => {
      if (!cancelled) onErrorRef.current(error);
    };

    const init = async () => {
      try {
        await ensureYouTubeApi();
      } catch (err) {
        markError(err as Error);
        return;
      }
      if (cancelled || !containerRef.current) return;

      // The placeholder iframe already respects the cookie preference so no
      // non-privacy-enhanced request is made before Plyr takes over the embed.
      containerRef.current.innerHTML = `
        <div
          class="plyr__video-embed"
          data-plyr-provider="youtube"
          data-plyr-embed-id="${videoId}"
        >
          <iframe
            src="${youtubeEmbedBaseUrl(videoId, cookiesEnabled)}"
            allowfullscreen
            allowtransparency
            allow="autoplay"
          ></iframe>
        </div>
      `;

      try {
        const playerElement =
          containerRef.current.querySelector('.plyr__video-embed');
        if (!playerElement) {
          throw new Error('Player element not found');
        }

        const player = new Plyr(playerElement as HTMLElement, {
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
            noCookie: !cookiesEnabled,
            rel: 0,
            iv_load_policy: 3,
          },
          ratio: forcedAspectRatio ? `${forcedAspectRatio}:1` : null,
        });
        playerRef.current = player;

        if (forcedAspectRatio) {
          const embed = containerRef.current.querySelector(
            '.plyr__video-embed'
          ) as HTMLElement | null;
          if (embed) {
            embed.style.aspectRatio = `${forcedAspectRatio}`;
            embed.style.height = '100%';
            embed.style.width = '100%';
            const iframe = embed.querySelector('iframe');
            if (iframe) {
              iframe.style.aspectRatio = `${forcedAspectRatio}`;
              iframe.style.height = '100%';
              iframe.style.width = '100%';
            }
          }
        }

        let ready = false;
        const probes: number[] = [];
        const stopProbing = () => probes.forEach((id) => clearInterval(id));
        const reveal = () => {
          if (ready) return;
          ready = true;
          stopProbing();
          markReady();
        };

        const probe = () => {
          if (ready) {
            stopProbing();
            return;
          }
          const embed = (
            player as unknown as {
              embed?: { getPlayerState?: () => number };
            }
          ).embed;
          const state = embed?.getPlayerState?.();
          if (state === -1 || state === 5 || state === 1) reveal();
        };
        probes.push(window.setInterval(probe, 500));
        cleanups.push(stopProbing);

        player.on('statechange', (event) => {
          if (event.detail.code === -1 || event.detail.code === 5) reveal();
        });
        player.on('playing', reveal);
        player.on('ready', () => {
          const fallback = window.setTimeout(reveal, 5000);
          cleanups.push(() => clearTimeout(fallback));
        });
        player.on('error', (err) => {
          markError(err as Error);
        });
      } catch (err) {
        markError(err as Error);
      }
    };

    init();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Plyr may already be torn down.
        }
        playerRef.current = null;
      }
    };
  }, [
    videoId,
    cookiesEnabled,
    autoPlayEnabled,
    loopEnabled,
    forcedAspectRatio,
  ]);

  return <div ref={containerRef} className="w-full h-full" />;
}
