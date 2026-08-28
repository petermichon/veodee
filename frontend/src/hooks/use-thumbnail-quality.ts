import { useState, useEffect } from 'react';
import { getYouTubeThumbnailUrl } from '@/lib/color-extractor';

export function useThumbnailQuality(
  videoId: string | null,
  enableMaxres: boolean = true
) {
  const [maxresAvailableIds, setMaxresAvailableIds] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    if (!videoId || !enableMaxres) return;

    // Probe maxresdefault; YouTube returns a 120x90 placeholder when it doesn't exist
    const img = new window.Image();
    img.src = getYouTubeThumbnailUrl(videoId, 'maxresdefault');
    img.onload = () => {
      if (img.naturalWidth > 120) {
        setMaxresAvailableIds((prev) => new Set(prev).add(videoId));
      }
    };

    return () => {
      img.onload = null;
      img.src = '';
    };
  }, [videoId, enableMaxres]);

  if (!videoId || !enableMaxres) return 'hqdefault';
  return maxresAvailableIds.has(videoId) ? 'maxresdefault' : 'hqdefault';
}
