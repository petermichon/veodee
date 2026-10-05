import { useEffect, useRef } from 'react';
import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin } from '@videojs/react/video';
import { YouTubeVideo } from '@videojs/react/media/youtube-video';
import { buildVideoJsYouTubeSource } from '@/lib/player';
import type { PlayerRendererProps } from '../types';

/**
 * Video.js v10 engine. Uses the official YouTube IFrame adapter with the
 * packaged video skin; the host supplies layout and shared UI.
 */
export default function VideoJsPlayer({
  videoId,
  cookiesEnabled,
  autoPlay,
  loop,
  onReady,
  onError,
}: PlayerRendererProps) {
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
  });

  const markReady = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    onReadyRef.current();
  };

  // The adapter does not guarantee a media event before the first frame; mirror
  // the Plyr engine's fallback so the loading cover always clears.
  useEffect(() => {
    const fallback = window.setTimeout(markReady, 5000);
    return () => clearTimeout(fallback);
  }, []);

  const source = buildVideoJsYouTubeSource({
    videoId,
    cookiesEnabled,
    loop,
    origin: typeof window === 'undefined' ? undefined : window.location.origin,
  });

  return (
    <VideoPlayer>
      <VideoSkin style={{ width: '100%', height: '100%' }}>
        <YouTubeVideo
          source={source}
          autoplay={autoPlay}
          muted={autoPlay}
          defaultMuted={autoPlay}
          loop={loop}
          playsInline
          onLoadedMetadata={markReady}
          onPlaying={markReady}
          onError={() =>
            onErrorRef.current(new Error('Failed to load YouTube video'))
          }
        />
      </VideoSkin>
    </VideoPlayer>
  );
}
