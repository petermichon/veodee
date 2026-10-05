import { describe, it, expect } from 'vitest';
import {
  extractYouTubeVideoId,
  isYouTubeHostedUrl,
  isYouTubeMusicVideo,
  getYouTubeThumbnailUrl,
} from './youtube';

const VIDEO_ID = 'dQw4w9WgXcQ';

describe('isYouTubeMusicVideo', () => {
  it('detects the 4:3 oEmbed size of music art tracks', () => {
    expect(isYouTubeMusicVideo({ width: 200, height: 150 })).toBe(true);
  });

  it('rejects the 16:9 oEmbed size of regular videos', () => {
    expect(isYouTubeMusicVideo({ width: 200, height: 113 })).toBe(false);
  });

  it('rejects missing dimensions', () => {
    expect(isYouTubeMusicVideo(undefined)).toBe(false);
    expect(isYouTubeMusicVideo({})).toBe(false);
  });
});

describe('extractYouTubeVideoId', () => {
  it('accepts a bare 11-character video ID', () => {
    expect(extractYouTubeVideoId(VIDEO_ID)).toBe(VIDEO_ID);
  });

  it('accepts a standard watch URL', () => {
    expect(
      extractYouTubeVideoId(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
    ).toBe(VIDEO_ID);
  });

  it('accepts a watch URL with extra query parameters', () => {
    expect(
      extractYouTubeVideoId(
        `https://www.youtube.com/watch?v=${VIDEO_ID}&t=42s&list=PL123`
      )
    ).toBe(VIDEO_ID);
  });

  it('accepts a watch URL where v is not the first parameter', () => {
    expect(
      extractYouTubeVideoId(
        `https://www.youtube.com/watch?feature=share&v=${VIDEO_ID}`
      )
    ).toBe(VIDEO_ID);
  });

  it('accepts a shortened youtu.be URL', () => {
    expect(extractYouTubeVideoId(`https://youtu.be/${VIDEO_ID}`)).toBe(
      VIDEO_ID
    );
  });

  it('accepts a shortened URL with a timestamp', () => {
    expect(extractYouTubeVideoId(`https://youtu.be/${VIDEO_ID}?t=10`)).toBe(
      VIDEO_ID
    );
  });

  it('accepts a shorts URL', () => {
    expect(
      extractYouTubeVideoId(`https://www.youtube.com/shorts/${VIDEO_ID}`)
    ).toBe(VIDEO_ID);
  });

  it('accepts a live URL', () => {
    expect(
      extractYouTubeVideoId(`https://www.youtube.com/live/${VIDEO_ID}`)
    ).toBe(VIDEO_ID);
  });

  it('accepts an embed URL', () => {
    expect(
      extractYouTubeVideoId(`https://www.youtube.com/embed/${VIDEO_ID}`)
    ).toBe(VIDEO_ID);
  });

  it('accepts a legacy /v/ URL', () => {
    expect(extractYouTubeVideoId(`https://www.youtube.com/v/${VIDEO_ID}`)).toBe(
      VIDEO_ID
    );
  });

  it('rejects a URL whose ID is too short', () => {
    expect(
      extractYouTubeVideoId('https://www.youtube.com/watch?v=short')
    ).toBeNull();
  });

  it('rejects unrelated URLs', () => {
    expect(extractYouTubeVideoId('https://example.com/video')).toBeNull();
  });

  it('rejects free text', () => {
    expect(extractYouTubeVideoId('not a video')).toBeNull();
  });

  it('rejects an empty string', () => {
    expect(extractYouTubeVideoId('')).toBeNull();
  });
});

describe('isYouTubeHostedUrl', () => {
  it('recognises youtube.com and its subdomains', () => {
    expect(isYouTubeHostedUrl('https://www.youtube.com/watch?v=x')).toBe(true);
    expect(isYouTubeHostedUrl('https://youtube.com/watch?v=x')).toBe(true);
  });

  it('recognises ytimg.com thumbnail hosts', () => {
    expect(isYouTubeHostedUrl('https://i.ytimg.com/vi/x/hqdefault.jpg')).toBe(
      true
    );
    expect(
      isYouTubeHostedUrl('https://img.youtube.com/vi/x/hqdefault.jpg')
    ).toBe(true);
  });

  it('rejects unrelated hosts and invalid input', () => {
    expect(isYouTubeHostedUrl('https://example.com/x.jpg')).toBe(false);
    expect(isYouTubeHostedUrl('not-a-url')).toBe(false);
    expect(isYouTubeHostedUrl(null)).toBe(false);
    expect(isYouTubeHostedUrl(undefined)).toBe(false);
  });
});

describe('getYouTubeThumbnailUrl', () => {
  it('builds a thumbnail URL at the requested quality', () => {
    expect(getYouTubeThumbnailUrl(VIDEO_ID, 'maxresdefault')).toBe(
      `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`
    );
    expect(getYouTubeThumbnailUrl(VIDEO_ID)).toBe(
      `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`
    );
  });
});
