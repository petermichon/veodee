import { useState, useEffect } from 'react';
import { getYouTubeThumbnailUrl } from '@/lib/color-extractor';

export function useThumbnailQuality(
  videoId: string | null,
  enableMaxres: boolean = true
) {
  const [thumbnailQuality, setThumbnailQuality] = useState<
    'maxresdefault' | 'hqdefault'
  >('hqdefault');

  useEffect(() => {
    if (videoId && enableMaxres) {
      // Start with hqdefault, try to upgrade to maxresdefault if available
      const img = new window.Image();
      img.src = getYouTubeThumbnailUrl(videoId, 'maxresdefault');
      img.onload = () => {
        // YouTube returns a 120x90 placeholder when thumbnail doesn't exist
        if (img.naturalWidth > 120) {
          setThumbnailQuality('maxresdefault');
        }
      };
    } else if (videoId && !enableMaxres) {
      // Force hqdefault if maxres is disabled
      setThumbnailQuality('hqdefault');
    }
  }, [videoId, enableMaxres]);

  return thumbnailQuality;
}
