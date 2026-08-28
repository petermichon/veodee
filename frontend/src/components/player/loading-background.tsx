import { useState, useEffect } from 'react';
import { getYouTubeThumbnailUrl } from '@/lib/color-extractor';

interface LoadingBackgroundProps {
  videoId: string | null;
  isLoading: boolean;
}

export function LoadingBackground({
  videoId,
  isLoading,
}: LoadingBackgroundProps) {
  const [thumbnailQuality, setThumbnailQuality] = useState<
    'maxresdefault' | 'hqdefault'
  >('hqdefault');

  useEffect(() => {
    if (videoId) {
      // Start with hqdefault, try to upgrade to maxresdefault if available
      const img = new window.Image();
      img.src = getYouTubeThumbnailUrl(videoId, 'maxresdefault');
      img.onload = () => {
        // YouTube returns a 120x90 placeholder when thumbnail doesn't exist
        if (img.naturalWidth > 120) {
          setThumbnailQuality('maxresdefault');
        }
      };
    }
  }, [videoId]);

  if (!isLoading || !videoId) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-10"
      style={{
        backgroundImage: `url(${getYouTubeThumbnailUrl(videoId, thumbnailQuality)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
