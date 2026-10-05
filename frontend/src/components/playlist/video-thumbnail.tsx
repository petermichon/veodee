import { getYouTubeThumbnailUrl } from '@/lib/color-extractor';

interface VideoThumbnailProps {
  videoId: string;
  /** Preferred source, e.g. the oEmbed `thumbnail_url`. Falls back to hqdefault. */
  src?: string;
  /**
   * Crop the hqdefault letterbox. hqdefault is a 4:3 canvas with the 16:9 frame
   * letterboxed; this zooms past the top/bottom bars so a 1:1 card's
   * `object-cover` yields a clean square. Used for music art tracks.
   */
  cropLetterbox?: boolean;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

// hqdefault's 16:9 frame is 270 of its 360px height, so scaling by 4/3 crops
// the 45px letterbox bars off the top and bottom.
const LETTERBOX_CROP_SCALE = 4 / 3;

/**
 * Native-lazy thumbnail, always `hqdefault`. Prefers the URL YouTube returns
 * from oEmbed and falls back to the constructed hqdefault URL, so the browser
 * defers the request until the card is near the viewport.
 */
export function VideoThumbnail({
  videoId,
  src,
  cropLetterbox = false,
  alt,
  className,
  onLoad,
}: VideoThumbnailProps) {
  return (
    <img
      src={src || getYouTubeThumbnailUrl(videoId, 'hqdefault')}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      style={
        cropLetterbox
          ? { transform: `scale(${LETTERBOX_CROP_SCALE})` }
          : undefined
      }
      onLoad={onLoad}
    />
  );
}
