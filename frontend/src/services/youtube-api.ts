import { fetchYouTubeVideoData } from '@/lib/youtube';

export interface YouTubeVideoDetails {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  author_name?: string;
  author_url?: string;
  width?: number;
  height?: number;
}

export class YouTubeAPI {
  private static cache = new Map<string, YouTubeVideoDetails>();
  private static failedCache = new Set<string>();
  private static requestQueue: Array<{
    videoId: string;
    resolve: (value: YouTubeVideoDetails | null) => void;
  }> = [];
  private static isProcessing = false;
  private static readonly MAX_CONCURRENT_REQUESTS = 5;
  private static activeRequests = 0;

  static clearCache() {
    this.failedCache.clear();
    this.cache.clear();
  }

  static async getVideoDetails(
    videoId: string
  ): Promise<YouTubeVideoDetails | null> {
    // Check cache first
    if (this.cache.has(videoId)) {
      return this.cache.get(videoId)!;
    }

    // Check if this video ID has previously failed to fetch
    if (this.failedCache.has(videoId)) {
      return null;
    }

    // Check YouTube permission
    const hasPermission = localStorage.getItem('youtube-permission') === 'true';
    if (!hasPermission) {
      return this.getFallbackVideoDetails(videoId);
    }

    // Add to queue for rate limiting
    return new Promise((resolve) => {
      this.requestQueue.push({ videoId, resolve });
      this.processQueue();
    });
  }

  private static async processQueue() {
    if (
      this.isProcessing ||
      this.activeRequests >= this.MAX_CONCURRENT_REQUESTS
    ) {
      return;
    }

    this.isProcessing = true;

    while (
      this.requestQueue.length > 0 &&
      this.activeRequests < this.MAX_CONCURRENT_REQUESTS
    ) {
      const { videoId, resolve } = this.requestQueue.shift()!;
      this.activeRequests++;

      // Process request
      this.fetchVideoDetails(videoId)
        .then(resolve)
        .finally(() => {
          this.activeRequests--;
          // Continue processing queue
          if (this.requestQueue.length > 0) {
            this.processQueue();
          } else {
            this.isProcessing = false;
          }
        });
    }

    this.isProcessing = false;
  }

  private static async fetchVideoDetails(
    videoId: string
  ): Promise<YouTubeVideoDetails | null> {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      // Use oEmbed API (no API key required)
      const oembedData = await fetchYouTubeVideoData(videoUrl);

      const videoDetails: YouTubeVideoDetails = {
        id: videoId,
        title: oembedData.title,
        url: videoUrl,
        thumbnail: oembedData.thumbnail_url,
        duration: '0:00', // oEmbed doesn't provide duration
        author_name: oembedData.author_name,
        author_url: oembedData.author_url,
        width: oembedData.width,
        height: oembedData.height,
      };

      // Cache the result
      this.cache.set(videoId, videoDetails);
      return videoDetails;
    } catch {
      // Add to failed cache to prevent infinite retries
      this.failedCache.add(videoId);
      return this.getFallbackVideoDetails(videoId);
    }
  }

  private static getFallbackVideoDetails(
    videoId: string
  ): YouTubeVideoDetails | null {
    // Return basic details with empty thumbnail so cards can still render
    return {
      id: videoId,
      title: videoId, // Use video ID as fallback title
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: '', // Empty thumbnail
      duration: '0:00',
      author_name: undefined,
      author_url: undefined,
      width: undefined,
      height: undefined,
    };
  }
}
