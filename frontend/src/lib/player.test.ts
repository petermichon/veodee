import { describe, it, expect } from 'vitest';
import {
  AUTOPLAY_STORAGE_KEY,
  COOKIES_STORAGE_KEY,
  DEFAULT_PLAYER_SETTINGS,
  FULLSCREEN_MODE_STORAGE_KEY,
  LEGACY_PLAYER_TYPE_STORAGE_KEY,
  LOOP_STORAGE_KEY,
  PLAYER_ENGINE_STORAGE_KEY,
  PLAYER_ENGINES,
  SQUARE_RATIO_STORAGE_KEY,
  buildVideoJsYouTubeSource,
  buildYouTubeEmbedUrl,
  getPlayerEngine,
  isFullscreenMode,
  isPlayerEngine,
  isSquareRatioEnabled,
  loadPlayerSettings,
  savePlayerSettings,
  youtubeEmbedBaseUrl,
  youtubeEmbedHost,
} from './player';
import type { PlayerSettings } from './player';

function createStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    has: (key: string) => data.has(key),
    get: (key: string) => data.get(key),
  };
}

const readOnly = (value: string | null): Pick<Storage, 'getItem'> => ({
  getItem: () => value,
});

describe('isSquareRatioEnabled', () => {
  it('is enabled by default when nothing is stored', () => {
    expect(isSquareRatioEnabled(readOnly(null))).toBe(true);
  });

  it('stays enabled when explicitly true', () => {
    expect(isSquareRatioEnabled(readOnly('true'))).toBe(true);
  });

  it('is disabled only when explicitly false', () => {
    expect(isSquareRatioEnabled(readOnly('false'))).toBe(false);
  });

  it('treats unknown stored values as enabled', () => {
    expect(isSquareRatioEnabled(readOnly('bogus'))).toBe(true);
  });

  it('reads the force-square-ratio key', () => {
    let readKey: string | null = null;
    isSquareRatioEnabled({
      getItem: (key: string) => {
        readKey = key;
        return null;
      },
    });
    expect(readKey).toBe(SQUARE_RATIO_STORAGE_KEY);
    expect(SQUARE_RATIO_STORAGE_KEY).toBe('force-square-ratio');
  });
});

describe('isPlayerEngine', () => {
  it('accepts registered engines', () => {
    for (const { id } of PLAYER_ENGINES) {
      expect(isPlayerEngine(id)).toBe(true);
    }
  });

  it('rejects unknown, legacy, and non-string values', () => {
    expect(isPlayerEngine('normal')).toBe(false);
    expect(isPlayerEngine('youtube')).toBe(false);
    expect(isPlayerEngine(null)).toBe(false);
    expect(isPlayerEngine(1)).toBe(false);
  });
});

describe('getPlayerEngine', () => {
  it('returns the matching descriptor', () => {
    expect(getPlayerEngine('plyr').label).toBe('Plyr');
    expect(getPlayerEngine('iframe').label).toBe('YouTube');
  });
});

describe('isFullscreenMode', () => {
  it('accepts contain and cover only', () => {
    expect(isFullscreenMode('contain')).toBe(true);
    expect(isFullscreenMode('cover')).toBe(true);
    expect(isFullscreenMode('fill')).toBe(false);
    expect(isFullscreenMode(null)).toBe(false);
  });
});

describe('loadPlayerSettings', () => {
  it('returns defaults when storage is empty', () => {
    expect(loadPlayerSettings(createStorage())).toEqual(
      DEFAULT_PLAYER_SETTINGS
    );
  });

  it('reads an explicit engine and cookie preference', () => {
    const settings = loadPlayerSettings(
      createStorage({
        [PLAYER_ENGINE_STORAGE_KEY]: 'plyr',
        [COOKIES_STORAGE_KEY]: 'true',
      })
    );
    expect(settings.engine).toBe('plyr');
    expect(settings.cookiesEnabled).toBe(true);
  });

  it('migrates legacy normal to iframe with cookies enabled', () => {
    const settings = loadPlayerSettings(
      createStorage({ [LEGACY_PLAYER_TYPE_STORAGE_KEY]: 'normal' })
    );
    expect(settings.engine).toBe('iframe');
    expect(settings.cookiesEnabled).toBe(true);
  });

  it('migrates legacy youtube to iframe with cookies disabled', () => {
    const settings = loadPlayerSettings(
      createStorage({ [LEGACY_PLAYER_TYPE_STORAGE_KEY]: 'youtube' })
    );
    expect(settings.engine).toBe('iframe');
    expect(settings.cookiesEnabled).toBe(false);
  });

  it('migrates legacy plyr', () => {
    const settings = loadPlayerSettings(
      createStorage({ [LEGACY_PLAYER_TYPE_STORAGE_KEY]: 'plyr' })
    );
    expect(settings.engine).toBe('plyr');
  });

  it('lets the legacy type win over a stale cookie key', () => {
    const settings = loadPlayerSettings(
      createStorage({
        [LEGACY_PLAYER_TYPE_STORAGE_KEY]: 'normal',
        [COOKIES_STORAGE_KEY]: 'false',
      })
    );
    expect(settings.cookiesEnabled).toBe(true);
  });

  it('prefers the new engine key over the legacy one', () => {
    const settings = loadPlayerSettings(
      createStorage({
        [PLAYER_ENGINE_STORAGE_KEY]: 'plyr',
        [LEGACY_PLAYER_TYPE_STORAGE_KEY]: 'normal',
      })
    );
    expect(settings.engine).toBe('plyr');
    expect(settings.cookiesEnabled).toBe(false);
  });

  it('ignores corrupt values and falls back to defaults', () => {
    const settings = loadPlayerSettings(
      createStorage({
        [PLAYER_ENGINE_STORAGE_KEY]: 'flash',
        [LEGACY_PLAYER_TYPE_STORAGE_KEY]: 'silverlight',
        [FULLSCREEN_MODE_STORAGE_KEY]: 'stretch',
        [AUTOPLAY_STORAGE_KEY]: 'yes',
        [LOOP_STORAGE_KEY]: '1',
      })
    );
    expect(settings.engine).toBe(DEFAULT_PLAYER_SETTINGS.engine);
    expect(settings.fullscreenMode).toBe('cover');
    expect(settings.autoPlay).toBe(false);
    expect(settings.loop).toBe(false);
  });

  it('reads fullscreen mode and booleans', () => {
    const settings = loadPlayerSettings(
      createStorage({
        [FULLSCREEN_MODE_STORAGE_KEY]: 'contain',
        [AUTOPLAY_STORAGE_KEY]: 'true',
        [LOOP_STORAGE_KEY]: 'true',
        [SQUARE_RATIO_STORAGE_KEY]: 'false',
      })
    );
    expect(settings.fullscreenMode).toBe('contain');
    expect(settings.autoPlay).toBe(true);
    expect(settings.loop).toBe(true);
    expect(settings.forceSquareRatio).toBe(false);
  });
});

describe('savePlayerSettings', () => {
  const settings: PlayerSettings = {
    engine: 'plyr',
    cookiesEnabled: true,
    autoPlay: true,
    loop: true,
    fullscreenMode: 'contain',
    forceSquareRatio: false,
  };

  it('writes every key', () => {
    const storage = createStorage();
    savePlayerSettings(storage, settings);
    expect(storage.get(PLAYER_ENGINE_STORAGE_KEY)).toBe('plyr');
    expect(storage.get(COOKIES_STORAGE_KEY)).toBe('true');
    expect(storage.get(AUTOPLAY_STORAGE_KEY)).toBe('true');
    expect(storage.get(LOOP_STORAGE_KEY)).toBe('true');
    expect(storage.get(FULLSCREEN_MODE_STORAGE_KEY)).toBe('contain');
    expect(storage.get(SQUARE_RATIO_STORAGE_KEY)).toBe('false');
  });

  it('retires the legacy key', () => {
    const storage = createStorage({
      [LEGACY_PLAYER_TYPE_STORAGE_KEY]: 'normal',
    });
    savePlayerSettings(storage, settings);
    expect(storage.has(LEGACY_PLAYER_TYPE_STORAGE_KEY)).toBe(false);
  });

  it('round-trips through load', () => {
    const storage = createStorage();
    savePlayerSettings(storage, settings);
    expect(loadPlayerSettings(storage)).toEqual(settings);
  });
});

describe('youtubeEmbedHost', () => {
  it('uses the privacy-enhanced host unless cookies are enabled', () => {
    expect(youtubeEmbedHost(false)).toBe('www.youtube-nocookie.com');
    expect(youtubeEmbedHost(true)).toBe('www.youtube.com');
  });

  it('builds the base embed URL with the right host', () => {
    expect(youtubeEmbedBaseUrl('abc', false)).toBe(
      'https://www.youtube-nocookie.com/embed/abc'
    );
    expect(youtubeEmbedBaseUrl('abc', true)).toBe(
      'https://www.youtube.com/embed/abc'
    );
  });
});

describe('buildYouTubeEmbedUrl', () => {
  const base = {
    videoId: 'aqz-KE-bpKQ',
    cookiesEnabled: false,
    autoPlay: false,
    loop: false,
  };

  it('disables autoplay and related videos by default', () => {
    const url = buildYouTubeEmbedUrl(base);
    expect(url).toContain('https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ');
    expect(url).toContain('autoplay=0');
    expect(url).toContain('rel=0');
    expect(url).not.toContain('loop=1');
  });

  it('enables autoplay when requested', () => {
    expect(buildYouTubeEmbedUrl({ ...base, autoPlay: true })).toContain(
      'autoplay=1'
    );
  });

  it('loops a single video via the playlist parameter', () => {
    const url = buildYouTubeEmbedUrl({ ...base, loop: true });
    expect(url).toContain('loop=1');
    expect(url).toContain('playlist=aqz-KE-bpKQ');
  });

  it('honors the cookie preference', () => {
    expect(buildYouTubeEmbedUrl({ ...base, cookiesEnabled: true })).toContain(
      'https://www.youtube.com/embed/'
    );
  });
});

describe('buildVideoJsYouTubeSource', () => {
  it('builds a structured source with sane engine defaults', () => {
    const source = buildVideoJsYouTubeSource({
      videoId: 'aqz-KE-bpKQ',
      cookiesEnabled: false,
      loop: false,
    });
    expect(source.src).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ'
    );
    expect(source.engine.youtube.rel).toBe(0);
    expect(source.engine.youtube.iv_load_policy).toBe(3);
    expect(source.engine.youtube.playlist).toBeUndefined();
    expect(source.engine.youtube.origin).toBeUndefined();
  });

  it('adds playlist for looping and origin when provided', () => {
    const source = buildVideoJsYouTubeSource({
      videoId: 'aqz-KE-bpKQ',
      cookiesEnabled: true,
      loop: true,
      origin: 'https://veodee.com',
    });
    expect(source.src).toBe('https://www.youtube.com/embed/aqz-KE-bpKQ');
    expect(source.engine.youtube.playlist).toBe('aqz-KE-bpKQ');
    expect(source.engine.youtube.origin).toBe('https://veodee.com');
  });
});
