import { buildYouTubeEmbedUrl } from '@/lib/player';
import type { PlayerRendererProps } from '../types';

/**
 * Raw YouTube IFrame embed. The host supplies layout, so this fills its
 * container and reports readiness once the iframe has painted.
 */
export default function IframePlayer({
  videoId,
  cookiesEnabled,
  autoPlayEnabled,
  loopEnabled,
  onReady,
  onError,
}: PlayerRendererProps) {
  const embedUrl = buildYouTubeEmbedUrl({
    videoId,
    cookiesEnabled,
    autoPlay: autoPlayEnabled,
    loop: loopEnabled,
  });

  // Defer readiness by two frames so the first painted frame is in the embed
  // before the host removes the loading cover.
  const handleLoad = () => {
    requestAnimationFrame(() => requestAnimationFrame(onReady));
  };

  return (
    <div className="w-full h-full">
      <iframe
        className="w-full h-full"
        style={{ backgroundColor: 'transparent' }}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
        title="YouTube video player"
        onLoad={handleLoad}
        onError={() => onError(new Error('Failed to load YouTube embed'))}
      />
    </div>
  );
}
