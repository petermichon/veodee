// YouTube Required Minimum Functionality: an embedded player's viewport must be
// at least 200x200 CSS px (16:9 recommended at least 480x270).
// https://developers.google.com/youtube/terms/required-minimum-functionality
export const PLAYER_MIN_SIZE_PX = 200;

/** Persisted storage keys. Legacy keys are read once and removed on save. */
export const PLAYER_ENGINE_STORAGE_KEY = 'player-engine';
export const LEGACY_PLAYER_TYPE_STORAGE_KEY = 'player-type';
export const COOKIES_STORAGE_KEY = 'player-cookies-enabled';
export const AUTOPLAY_STORAGE_KEY = 'player-autoplay-enabled';
export const LOOP_STORAGE_KEY = 'player-loop-enabled';
export const FULLSCREEN_MODE_STORAGE_KEY = 'fullscreen-mode';
export const SQUARE_RATIO_STORAGE_KEY = 'force-square-ratio';

export type ReadonlyStorage = Pick<Storage, 'getItem'>;
export type WritableStorage = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
>;

/**
 * The playback implementation that renders the video. Deliberately kept
 * separate from the cookie/privacy policy: every engine is YouTube-backed, but
 * only some honor {@link PlayerSettings.cookiesEnabled}.
 */
export type PlayerEngine = 'iframe' | 'plyr' | 'videojs';

export type FullscreenMode = 'contain' | 'cover';

export interface PlayerEngineDescriptor {
  readonly id: PlayerEngine;
  /** Label shown in the player settings selector. */
  readonly label: string;
}

/** Ordered registry that drives the settings UI and engine lookup. */
export const PLAYER_ENGINES = [
  { id: 'iframe', label: 'YouTube' },
  { id: 'plyr', label: 'Plyr' },
  { id: 'videojs', label: 'Video.js' },
] as const satisfies readonly PlayerEngineDescriptor[];

/** Ordered fullscreen modes, mirroring {@link PLAYER_ENGINES} for the UI. */
export const FULLSCREEN_MODES = ['cover', 'contain'] as const;

export interface PlayerSettings {
  engine: PlayerEngine;
  cookiesEnabled: boolean;
  autoPlay: boolean;
  loop: boolean;
  fullscreenMode: FullscreenMode;
  forceSquareRatio: boolean;
}

/**
 * Defaults mirror pre-refactor behavior: the raw iframe engine on the
 * privacy-enhanced (no-cookie) host, autoplay/loop off, cover fullscreen, and
 * square ratio enabled.
 */
export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  engine: 'iframe',
  cookiesEnabled: false,
  autoPlay: false,
  loop: false,
  fullscreenMode: 'cover',
  forceSquareRatio: true,
};

export function isPlayerEngine(value: unknown): value is PlayerEngine {
  return PLAYER_ENGINES.some((engine) => engine.id === value);
}

export function getPlayerEngine(id: PlayerEngine): PlayerEngineDescriptor {
  return PLAYER_ENGINES.find((engine) => engine.id === id) ?? PLAYER_ENGINES[0];
}

export function isFullscreenMode(value: unknown): value is FullscreenMode {
  return value === 'contain' || value === 'cover';
}

// Square Ratio is enabled by default; users who explicitly turn it off keep it
// off. Only an explicit "false" disables it.
export function isSquareRatioEnabled(
  storage: ReadonlyStorage = localStorage
): boolean {
  return storage.getItem(SQUARE_RATIO_STORAGE_KEY) !== 'false';
}

function readBoolean(
  storage: ReadonlyStorage,
  key: string,
  fallback: boolean
): boolean {
  const raw = storage.getItem(key);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

interface LegacyPlayerTypeMigration {
  engine: PlayerEngine;
  /** The cookie policy the legacy value encoded, when it encoded one. */
  cookiesEnabled: boolean | null;
}

// The pre-refactor `player-type` value conflated the engine with the cookie
// policy: `normal`/`youtube` were the same iframe engine on different hosts.
function migrateLegacyPlayerType(
  raw: string | null
): LegacyPlayerTypeMigration {
  switch (raw) {
    case 'normal':
      return { engine: 'iframe', cookiesEnabled: true };
    case 'youtube':
      return { engine: 'iframe', cookiesEnabled: false };
    case 'plyr':
      return { engine: 'plyr', cookiesEnabled: false };
    default:
      return {
        engine: DEFAULT_PLAYER_SETTINGS.engine,
        cookiesEnabled: null,
      };
  }
}

/**
 * Reads the persisted player settings, migrating the legacy `player-type`
 * value when the new `player-engine` key is absent. Never throws on corrupt
 * input; unknown values fall back to defaults.
 */
export function loadPlayerSettings(
  storage: ReadonlyStorage = localStorage
): PlayerSettings {
  const storedEngine = storage.getItem(PLAYER_ENGINE_STORAGE_KEY);

  let engine: PlayerEngine;
  let cookiesEnabled: boolean;

  if (isPlayerEngine(storedEngine)) {
    engine = storedEngine;
    cookiesEnabled = readBoolean(
      storage,
      COOKIES_STORAGE_KEY,
      DEFAULT_PLAYER_SETTINGS.cookiesEnabled
    );
  } else {
    const legacy = migrateLegacyPlayerType(
      storage.getItem(LEGACY_PLAYER_TYPE_STORAGE_KEY)
    );
    engine = legacy.engine;
    cookiesEnabled =
      legacy.cookiesEnabled ??
      readBoolean(
        storage,
        COOKIES_STORAGE_KEY,
        DEFAULT_PLAYER_SETTINGS.cookiesEnabled
      );
  }

  const fullscreenMode = storage.getItem(FULLSCREEN_MODE_STORAGE_KEY);

  return {
    engine,
    cookiesEnabled,
    autoPlay: readBoolean(
      storage,
      AUTOPLAY_STORAGE_KEY,
      DEFAULT_PLAYER_SETTINGS.autoPlay
    ),
    loop: readBoolean(storage, LOOP_STORAGE_KEY, DEFAULT_PLAYER_SETTINGS.loop),
    fullscreenMode: isFullscreenMode(fullscreenMode)
      ? fullscreenMode
      : DEFAULT_PLAYER_SETTINGS.fullscreenMode,
    forceSquareRatio: isSquareRatioEnabled(storage),
  };
}

/** Persists settings and retires the legacy `player-type` key. */
export function savePlayerSettings(
  storage: WritableStorage,
  settings: PlayerSettings
): void {
  storage.setItem(PLAYER_ENGINE_STORAGE_KEY, settings.engine);
  storage.setItem(COOKIES_STORAGE_KEY, String(settings.cookiesEnabled));
  storage.setItem(AUTOPLAY_STORAGE_KEY, String(settings.autoPlay));
  storage.setItem(LOOP_STORAGE_KEY, String(settings.loop));
  storage.setItem(FULLSCREEN_MODE_STORAGE_KEY, settings.fullscreenMode);
  storage.setItem(SQUARE_RATIO_STORAGE_KEY, String(settings.forceSquareRatio));
  storage.removeItem(LEGACY_PLAYER_TYPE_STORAGE_KEY);
}

/** The privacy-enhanced host is used unless cookies were explicitly allowed. */
export function youtubeEmbedHost(cookiesEnabled: boolean): string {
  return cookiesEnabled ? 'www.youtube.com' : 'www.youtube-nocookie.com';
}

export function youtubeEmbedBaseUrl(
  videoId: string,
  cookiesEnabled: boolean
): string {
  return `https://${youtubeEmbedHost(cookiesEnabled)}/embed/${videoId}`;
}

export interface YouTubeEmbedUrlOptions {
  videoId: string;
  cookiesEnabled: boolean;
  autoPlay: boolean;
  loop: boolean;
}

/** Fully-parameterized embed URL for the raw iframe engine. */
export function buildYouTubeEmbedUrl({
  videoId,
  cookiesEnabled,
  autoPlay,
  loop,
}: YouTubeEmbedUrlOptions): string {
  const params = new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
  });
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }
  return `${youtubeEmbedBaseUrl(videoId, cookiesEnabled)}?${params.toString()}`;
}

export interface YouTubeEngineOptions {
  rel: 0 | 1;
  iv_load_policy?: 1 | 3;
  origin?: string;
  playlist?: string;
}

export interface VideoJsYouTubeSource {
  src: string;
  engine: { youtube: YouTubeEngineOptions };
}

export interface BuildYouTubeSourceOptions {
  videoId: string;
  cookiesEnabled: boolean;
  loop: boolean;
  origin?: string;
}

/**
 * Structured source for the Video.js YouTube adapter. The adapter serializes
 * `engine.youtube` onto the embed URL itself, so only parameters it does not
 * expose as props belong here.
 */
export function buildVideoJsYouTubeSource({
  videoId,
  cookiesEnabled,
  loop,
  origin,
}: BuildYouTubeSourceOptions): VideoJsYouTubeSource {
  return {
    src: youtubeEmbedBaseUrl(videoId, cookiesEnabled),
    engine: {
      youtube: {
        rel: 0,
        iv_load_policy: 3,
        ...(origin ? { origin } : {}),
        ...(loop ? { playlist: videoId } : {}),
      },
    },
  };
}
