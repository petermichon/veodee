export interface YouTubeVideoData {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  type: 'video';
  version: string;
  provider_name: string;
  provider_url: string;
  width: number;
  height: number;
  html: string;
}

/**
 * Extracts video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Fetches YouTube video data using the oEmbed API (no API key required)
 */
export async function fetchYouTubeVideoData(
  videoUrl: string
): Promise<YouTubeVideoData> {
  const videoId = extractYouTubeVideoId(videoUrl);

  if (!videoId) {
    throw new Error('Invalid YouTube URL format');
  }

  const oembedUrl = new URL('https://www.youtube.com/oembed');
  oembedUrl.searchParams.set('url', videoUrl);
  oembedUrl.searchParams.set('format', 'json');

  try {
    const response = await fetch(oembedUrl.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return data as YouTubeVideoData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch YouTube video data: ${error.message}`, {
        cause: error,
      });
    }
    throw new Error('Failed to fetch YouTube video data: Unknown error', {
      cause: error,
    });
  }
}

/**
 * Gets the YouTube thumbnail URL for a video ID
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' = 'hqdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Whether a URL points at a YouTube/Google-hosted asset, such as a thumbnail.
 * Used to avoid loading YouTube-hosted images when YouTube access is disabled.
 */
export function isYouTubeHostedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'ytimg.com' ||
      hostname.endsWith('.ytimg.com')
    );
  } catch {
    return false;
  }
}
