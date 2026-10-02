import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Cookie,
  PlayCircle,
  Share2,
  Bookmark,
  Check,
  Pencil,
  X,
  Repeat,
  Maximize,
  Maximize2,
  Minimize2,
  Settings,
  Info,
} from 'lucide-react';
import { PlayerSurface } from '@/components/player/player-surface';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { SegmentedOption } from '@/components/ui/segmented-control';
import { YouTubeAPI } from '@/services/youtube-api';
import { useVideo } from '@/contexts/video-context';
import { useToast } from '@/hooks/use-toast';
import { usePlayerSettings } from '@/hooks/use-player-settings';
import type { Video } from '@/types/index';
import { getYouTubeThumbnailUrl } from '@/lib/color-extractor';
import { isYouTubeHostedUrl } from '@/lib/youtube';
import {
  FULLSCREEN_MODES,
  PLAYER_ENGINES,
  PLAYER_MIN_SIZE_PX,
} from '@/lib/player';
import type { FullscreenMode, PlayerEngine } from '@/lib/player';

export function Player() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addVideo, removeVideo, videos } = useVideo();
  const { toast } = useToast();

  // Helper to save preference to localStorage
  const savePreference = (key: string, value: boolean | string) => {
    localStorage.setItem(key, String(value));
  };

  const [currentVideoId, setCurrentVideoId] = useState<string | null>(() => {
    const fromParam = searchParams.get('v');
    const fromState = (location.state?.video as Video | undefined)?.id ?? null;
    return fromState ?? fromParam;
  });
  const [videoUrl, setVideoUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { settings, update } = usePlayerSettings();
  const { cookiesEnabled, autoPlayEnabled, loopEnabled } = settings;
  const engine = settings.engine;
  const fullscreenMode = settings.fullscreenMode;
  const forceSquareRatio = settings.forceSquareRatio;

  const playerEngineOptions = useMemo<SegmentedOption<PlayerEngine>[]>(
    () =>
      PLAYER_ENGINES.map((descriptor) => ({
        value: descriptor.id,
        label: descriptor.label,
      })),
    []
  );

  const fullscreenOptions = useMemo<SegmentedOption<FullscreenMode>[]>(
    () =>
      FULLSCREEN_MODES.map((mode) => ({
        value: mode,
        label: mode === 'cover' ? 'Cover' : 'Contain',
        icon:
          mode === 'cover' ? (
            <Maximize2 className="h-5 w-5" />
          ) : (
            <Minimize2 className="h-5 w-5" />
          ),
      })),
    []
  );
  const [youtubePermission, setYoutubePermission] = useState(() => {
    const saved = localStorage.getItem('youtube-permission');
    if (saved === null) {
      savePreference('youtube-permission', true);
      return true;
    }
    return saved === 'true';
  });
  const [showPermissionModal, setShowPermissionModal] = useState(() => {
    const fromParam = searchParams.get('v');
    const fromState = (location.state?.video as Video | undefined)?.id ?? null;
    return !youtubePermission && (!!fromState || !!fromParam);
  });
  const [shareClicked, setShareClicked] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const editInputRef = useRef<HTMLDivElement>(null);
  const videoIdInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const thumbnailBackgroundUrl =
    youtubePermission && currentVideoId
      ? getYouTubeThumbnailUrl(currentVideoId, 'hqdefault')
      : null;
  const [customBackground, setCustomBackground] = useState(() => {
    return localStorage.getItem('home-background');
  });
  const [backgroundMode, setBackgroundMode] = useState<'normal' | 'custom'>(
    () => {
      const savedMode = localStorage.getItem('background-mode');
      if (savedMode === 'normal' || savedMode === 'custom') {
        return savedMode;
      }
      return 'custom';
    }
  );
  const pageBackground = thumbnailBackgroundUrl
    ? `url(${thumbnailBackgroundUrl})`
    : customBackground &&
        (youtubePermission || !isYouTubeHostedUrl(customBackground))
      ? customBackground.startsWith('linear-gradient') ||
        customBackground.startsWith('radial-gradient')
        ? customBackground
        : `url(${customBackground})`
      : null;
  const [aspectByVideo, setAspectByVideo] = useState<
    Record<string, { ratio: number | null; isMusic: boolean }>
  >({});
  const aspectInfo = currentVideoId ? aspectByVideo[currentVideoId] : undefined;
  const videoAspectRatio = youtubePermission
    ? (aspectInfo?.ratio ?? null)
    : null;
  const isYouTubeMusicVideo = youtubePermission ? !!aspectInfo?.isMusic : false;
  const [showSquareRatioTooltip, setShowSquareRatioTooltip] = useState(false);
  const playerAspectRatio =
    forceSquareRatio && isYouTubeMusicVideo ? 1 : videoAspectRatio || 16 / 9;
  // Fit the player inside a 16:9 envelope (so non-16:9 videos don't grow the
  // layout on wide screens), while the min-size floor below still applies.
  const playerFitWidth =
    playerAspectRatio < 16 / 9
      ? `${(playerAspectRatio / (16 / 9)) * 100}%`
      : '100%';
  const [showCookiesTooltip, setShowCookiesTooltip] = useState(false);
  const [showPlayerSettings, setShowPlayerSettings] = useState(false);
  const playerSettingsBtnRef = useRef<HTMLButtonElement>(null);
  const playerSettingsPopupRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fillScreen, setFillScreen] = useState(false);

  const isInLibrary = currentVideoId
    ? videos.some((v) => v.id === currentVideoId)
    : false;

  // Video URL extraction utilities
  const extractVideoId = (url: string): string | null => {
    // Check if it's a raw video ID (11 characters: alphanumeric, underscore, hyphen)
    const rawIdMatch = url.match(/^[a-zA-Z0-9_-]{11}$/);
    if (rawIdMatch) return rawIdMatch[0];

    // Check if it's a YouTube URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
      /[?&]v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleCookieToggle = () => {
    update({ cookiesEnabled: !cookiesEnabled });
  };

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Handle video from navigation
  // (currentVideoId is initialized from the route above; local edits update it directly)

  // Fetch video details to get aspect ratio
  useEffect(() => {
    if (!currentVideoId || !youtubePermission) return;
    let cancelled = false;

    YouTubeAPI.getVideoDetails(currentVideoId).then((details) => {
      if (cancelled) return;
      let ratio: number | null = null;
      let isMusic = false;
      if (details && details.width && details.height) {
        ratio = details.width / details.height;
        // Detect YouTube Music videos (200x150 = 4:3 ratio)
        isMusic = details.width === 200 && details.height === 150;
      }
      setAspectByVideo((prev) => ({
        ...prev,
        [currentVideoId]: { ratio, isMusic },
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [currentVideoId, youtubePermission]);

  // Listen for background changes
  useEffect(() => {
    const handleBackgroundChange = () => {
      setCustomBackground(localStorage.getItem('home-background'));
      const savedMode = localStorage.getItem('background-mode');
      if (savedMode === 'normal' || savedMode === 'custom') {
        setBackgroundMode(savedMode);
      } else {
        setBackgroundMode('custom');
      }
    };
    window.addEventListener('background-changed', handleBackgroundChange);
    return () =>
      window.removeEventListener('background-changed', handleBackgroundChange);
  }, []);

  // React to YouTube access being granted or revoked
  useEffect(() => {
    const handleGranted = () => setYoutubePermission(true);
    const handleRevoked = () => setYoutubePermission(false);
    window.addEventListener('youtube-permission-granted', handleGranted);
    window.addEventListener('youtube-permission-revoked', handleRevoked);
    return () => {
      window.removeEventListener('youtube-permission-granted', handleGranted);
      window.removeEventListener('youtube-permission-revoked', handleRevoked);
    };
  }, []);

  // Handle click outside for player settings popup
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        playerSettingsBtnRef.current &&
        !playerSettingsBtnRef.current.contains(target) &&
        playerSettingsPopupRef.current &&
        !playerSettingsPopupRef.current.contains(target)
      ) {
        setShowPlayerSettings(false);
      }
    }
    if (showPlayerSettings)
      document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPlayerSettings]);

  // Handle click outside to save and exit edit mode
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        editInputRef.current &&
        !editInputRef.current.contains(event.target as Node)
      ) {
        const videoId = extractVideoId(videoUrl);
        if (videoId) {
          setCurrentVideoId(videoId);
          if (!youtubePermission) {
            setShowPermissionModal(true);
          }
        }
        setVideoUrl('');
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, videoUrl, youtubePermission]);

  // Handle fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      setFillScreen(isNowFullscreen);

      // Add/remove class to hide top nav
      if (isNowFullscreen) {
        document.documentElement.classList.add('player-fullscreen');
      } else {
        document.documentElement.classList.remove('player-fullscreen');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleShare = async (urlType: 'youtube' | 'current') => {
    setShareClicked(true);
    setTimeout(() => setShareClicked(false), 1000);
    setShowShareDialog(false);

    const url =
      urlType === 'youtube'
        ? `https://www.youtube.com/watch?v=${currentVideoId}`
        : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'YouTube Video',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      await navigator.clipboard.writeText(url);
    }
  };

  const navigateToLibrary = () => {
    if (currentVideoId) {
      try {
        if (isInLibrary) {
          removeVideo(currentVideoId);
          toast({
            title: 'Video removed from library',
            description: `Video ${currentVideoId} has been removed from your library`,
          });
        } else {
          const video: Video = {
            id: currentVideoId,
          };
          addVideo(video);
          toast({
            title: 'Video added to library',
            description: `Video ${currentVideoId} has been added to your library`,
          });
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to update library',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'No video to add',
        description: 'Load a video first to add it to the library',
        variant: 'destructive',
      });
    }
  };

  const handleGrantPermission = () => {
    setYoutubePermission(true);
    localStorage.setItem('youtube-permission', 'true');
    YouTubeAPI.clearCache();
    window.dispatchEvent(new CustomEvent('youtube-permission-granted'));
    setShowPermissionModal(false);
  };

  return (
    <div className="relative select-none-touch">
      {backgroundMode === 'custom' && pageBackground && (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: pageBackground,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
            transition: 'background-image 0.5s ease-in-out',
          }}
        >
          <div
            className="absolute inset-0 backdrop-blur-[100px]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>
      )}
      <div
        className={`relative z-10 ${fillScreen ? 'w-full h-screen flex items-center justify-center' : 'container mx-auto px-4 sm:px-6 lg:px-8 pt-0 sm:pt-4 pb-8'}`}
      >
        <div className={fillScreen ? '' : 'max-w-7xl mx-auto'}>
          <div className={fillScreen ? '' : 'space-y-8'}>
            {/* Main Video Player - Full Width */}
            <div
              className={`relative ${
                fillScreen ? 'w-full h-screen' : '-mx-4 sm:mx-0'
              }`}
              style={
                fillScreen
                  ? undefined
                  : {
                      minWidth: PLAYER_MIN_SIZE_PX,
                      minHeight: PLAYER_MIN_SIZE_PX,
                    }
              }
              onDragEnter={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setIsDragging(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                // Only hide if leaving the drop zone, not entering a child element
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsDragging(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setIsDragging(false);
                const droppedText = e.dataTransfer.getData('text');
                const videoId = extractVideoId(droppedText);
                if (videoId) {
                  setCurrentVideoId(videoId);
                  if (!youtubePermission) {
                    setShowPermissionModal(true);
                  }
                }
              }}
            >
              <div
                className={`${fillScreen ? '' : 'shadow-2xl overflow-hidden rounded-lg sm:rounded-3xl mx-auto'} ${fillScreen ? 'w-full h-full' : ''} bg-transparent`}
                style={
                  fillScreen
                    ? undefined
                    : {
                        width: playerFitWidth,
                        aspectRatio: playerAspectRatio,
                        minWidth: PLAYER_MIN_SIZE_PX,
                        minHeight: PLAYER_MIN_SIZE_PX,
                      }
                }
              >
                {(currentVideoId || fillScreen) && (
                  <PlayerSurface
                    videoId={youtubePermission ? currentVideoId : null}
                    engine={engine}
                    cookiesEnabled={cookiesEnabled}
                    showPermissionModal={showPermissionModal}
                    onGrantPermission={handleGrantPermission}
                    autoPlayEnabled={autoPlayEnabled}
                    loopEnabled={loopEnabled}
                    forcedAspectRatio={
                      forceSquareRatio && isYouTubeMusicVideo ? 1 : null
                    }
                    fillScreen={fillScreen}
                    fullscreenMode={fullscreenMode}
                  />
                )}
              </div>
              {isDragging && !fillScreen && (
                <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center z-10 backdrop-blur-sm rounded-lg sm:rounded-3xl">
                  <div className="text-center">
                    <p className="text-foreground text-lg font-semibold">
                      Drop video ID here
                    </p>
                    <p className="text-foreground/80 text-sm mt-1">
                      YouTube URL or video ID
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info & Controls - Hidden in fullscreen */}
            {!fillScreen && (
              <div className="flex flex-col gap-4 mt-6">
                {/* Rows 1 & 2: Combined on same line when space permits */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  {/* Row 1: Saved, Share, Video ID */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={navigateToLibrary}
                      disabled={!currentVideoId}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none ${!currentVideoId ? 'opacity-50' : 'cursor-pointer'}`}
                      style={{
                        color: isInLibrary
                          ? 'hsl(var(--foreground))'
                          : 'hsl(var(--muted-foreground))',
                      }}
                      onMouseEnter={(e) => {
                        if (currentVideoId) {
                          e.currentTarget.style.color =
                            'hsl(var(--foreground))';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentVideoId) {
                          e.currentTarget.style.color = isInLibrary
                            ? 'hsl(var(--foreground))'
                            : 'hsl(var(--muted-foreground))';
                        }
                      }}
                    >
                      <Bookmark
                        className={`h-5 w-5 ${isInLibrary ? 'fill-current' : ''}`}
                        style={{
                          color: isInLibrary
                            ? 'hsl(var(--foreground))'
                            : 'hsl(var(--muted-foreground))',
                        }}
                      />
                      <span
                        className="text-sm"
                        style={{
                          width: '45px',
                          display: 'inline-block',
                          textAlign: 'left',
                        }}
                      >
                        {isInLibrary ? 'Saved' : 'Save'}
                      </span>
                    </button>
                    <button
                      onClick={() => setShowShareDialog(true)}
                      disabled={!currentVideoId}
                      onMouseEnter={(e) => {
                        if (!shareClicked) {
                          e.currentTarget.style.color =
                            'hsl(var(--foreground))';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!shareClicked) {
                          e.currentTarget.style.color =
                            'hsl(var(--muted-foreground))';
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none ${!currentVideoId ? 'opacity-50' : shareClicked ? 'text-foreground bg-foreground/10' : 'text-muted-foreground'}`}
                      style={{
                        color: shareClicked
                          ? 'hsl(var(--foreground))'
                          : 'hsl(var(--muted-foreground))',
                        backgroundColor: shareClicked
                          ? 'hsl(var(--foreground) / 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm">Share</span>
                    </button>

                    {isEditing ? (
                      <div ref={editInputRef} className="relative ml-4">
                        <div className="flex items-center h-[44px] rounded-md w-[176px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const videoId = extractVideoId(videoUrl);
                              if (videoId) {
                                setCurrentVideoId(videoId);
                                if (!youtubePermission) {
                                  setShowPermissionModal(true);
                                }
                              }
                              setVideoUrl('');
                              setIsEditing(false);
                            }}
                            className="absolute left-0 top-0 h-full p-2 text-white transition-colors cursor-pointer bg-transparent border-none"
                            style={{
                              width: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {extractVideoId(videoUrl) ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <X className="h-5 w-5" />
                            )}
                          </button>
                          <div className="h-full flex items-center">
                            <input
                              ref={videoIdInputRef}
                              type="text"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              onFocus={(e) => e.target.select()}
                              onPaste={(e) => {
                                const pastedText =
                                  e.clipboardData.getData('text');
                                const videoId = extractVideoId(pastedText);
                                if (videoId) {
                                  e.preventDefault();
                                  setCurrentVideoId(videoId);
                                  if (!youtubePermission) {
                                    setShowPermissionModal(true);
                                  }
                                  setVideoUrl('');
                                  setIsEditing(false);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && videoUrl.trim()) {
                                  const videoId = extractVideoId(videoUrl);
                                  if (videoId) {
                                    setCurrentVideoId(videoId);
                                    if (!youtubePermission) {
                                      setShowPermissionModal(true);
                                    }
                                  }
                                  setVideoUrl('');
                                  setIsEditing(false);
                                }
                                if (e.key === 'Escape') {
                                  setIsEditing(false);
                                }
                              }}
                              placeholder=""
                              className="text-sm text-foreground bg-transparent border-none focus:outline-none focus:ring-0 w-full pl-10 pr-3"
                              style={{ fontFamily: 'monospace' }}
                              spellCheck={false}
                              autoCorrect="off"
                              autoCapitalize="off"
                              autoComplete="off"
                              autoFocus
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative ml-4">
                        <div
                          className="flex items-center h-[44px] rounded-md w-[176px] cursor-pointer group"
                          onClick={() => {
                            setIsEditing(true);
                            setVideoUrl(currentVideoId || '');
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditing(true);
                              setVideoUrl(currentVideoId || '');
                            }}
                            className="absolute left-0 top-0 h-full p-2 text-muted-foreground group-hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                            style={{
                              width: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <div
                            className="h-full pl-10 pr-3 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate"
                            style={{ fontFamily: 'monospace' }}
                          >
                            {currentVideoId || ''}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Fullscreen, Autoplay, Loop, YouTube, Plyr */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Fullscreen Toggle */}
                    <button
                      onClick={() => {
                        if (!isFullscreen) {
                          document.documentElement.requestFullscreen();
                        } else {
                          document.exitFullscreen();
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer"
                      style={{
                        color: isFullscreen
                          ? 'white'
                          : 'hsl(var(--muted-foreground))',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'hsl(var(--foreground))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isFullscreen
                          ? 'white'
                          : 'hsl(var(--muted-foreground))';
                      }}
                    >
                      <Maximize className="h-5 w-5" />
                      <span className="text-sm">Fullscreen</span>
                    </button>

                    {/* Player Settings */}
                    <button
                      ref={playerSettingsBtnRef}
                      onClick={() => setShowPlayerSettings(!showPlayerSettings)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer ${showPlayerSettings ? 'text-foreground' : 'text-muted-foreground'}`}
                      style={{
                        color: showPlayerSettings
                          ? 'hsl(var(--foreground))'
                          : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="text-sm">Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Settings Popup */}
      {showPlayerSettings && !fillScreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-background/50 shadow-2xl transition-opacity duration-200"
          onClick={() => setShowPlayerSettings(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Player Settings
              </h3>
              <button
                onClick={() => setShowPlayerSettings(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Player Type */}
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Player Type
            </h4>
            <SegmentedControl
              options={playerEngineOptions}
              value={engine}
              onChange={(value) => update({ engine: value })}
              ariaLabel="Player type"
            />

            {/* Fullscreen Mode */}
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Fullscreen Mode
            </h4>
            <SegmentedControl
              options={fullscreenOptions}
              value={fullscreenMode}
              onChange={(value) => update({ fullscreenMode: value })}
              ariaLabel="Fullscreen mode"
            />

            {/* Cookies */}
            <div className="relative flex items-center">
              <button
                onClick={handleCookieToggle}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer"
                style={{
                  color: cookiesEnabled
                    ? 'white'
                    : 'hsl(var(--muted-foreground))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--foreground))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = cookiesEnabled
                    ? 'white'
                    : 'hsl(var(--muted-foreground))';
                }}
              >
                <Cookie className="h-5 w-5" />
                <span className="text-sm">Cookies</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCookiesTooltip(!showCookiesTooltip);
                }}
                onMouseEnter={() => setShowCookiesTooltip(true)}
                onMouseLeave={() => setShowCookiesTooltip(false)}
                className="p-1 rounded-full hover:bg-accent transition-colors border-none cursor-pointer"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <Info className="h-4 w-4" />
              </button>
              {showCookiesTooltip && (
                <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg text-sm">
                  <p className="font-semibold text-foreground">Cookies</p>
                  <p className="text-muted-foreground mt-1">
                    Play through youtube.com so YouTube can set cookies, instead
                    of the privacy-enhanced youtube-nocookie.com host.
                  </p>
                </div>
              )}
            </div>

            {/* Autoplay */}
            <div className="relative flex items-center">
              <button
                onClick={() => update({ autoPlayEnabled: !autoPlayEnabled })}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer"
                style={{
                  color: autoPlayEnabled
                    ? 'white'
                    : 'hsl(var(--muted-foreground))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--foreground))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = autoPlayEnabled
                    ? 'white'
                    : 'hsl(var(--muted-foreground))';
                }}
              >
                <PlayCircle className="h-5 w-5" />
                <span className="text-sm">Autoplay</span>
              </button>
            </div>

            {/* Loop */}
            <div className="relative flex items-center">
              <button
                onClick={() => update({ loopEnabled: !loopEnabled })}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer"
                style={{
                  color: loopEnabled ? 'white' : 'hsl(var(--muted-foreground))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--foreground))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = loopEnabled
                    ? 'white'
                    : 'hsl(var(--muted-foreground))';
                }}
              >
                <Repeat className="h-5 w-5" />
                <span className="text-sm">Loop</span>
              </button>
            </div>

            {/* Square Ratio */}
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  update({ forceSquareRatio: !forceSquareRatio });
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer"
                style={{
                  color: forceSquareRatio
                    ? 'white'
                    : 'hsl(var(--muted-foreground))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--foreground))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = forceSquareRatio
                    ? 'white'
                    : 'hsl(var(--muted-foreground))';
                }}
              >
                <Maximize className="h-5 w-5" />
                <span className="text-sm">Square Ratio</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSquareRatioTooltip(!showSquareRatioTooltip);
                }}
                onMouseEnter={() => setShowSquareRatioTooltip(true)}
                onMouseLeave={() => setShowSquareRatioTooltip(false)}
                className="p-1 rounded-full hover:bg-accent transition-colors border-none cursor-pointer"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <Info className="h-4 w-4" />
              </button>
              {showSquareRatioTooltip && (
                <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Square Ratio</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      EXPERIMENTAL
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Forces a square aspect ratio for YouTube Music videos for a
                    more immersive experience.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && !fillScreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-background/50 shadow-2xl transition-opacity duration-200"
          onClick={() => setShowShareDialog(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Share URL
              </h3>
              <button
                onClick={() => setShowShareDialog(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Which URL would you like to share?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleShare('youtube')}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium text-left hover:bg-foreground/5 transition-colors"
              >
                YouTube URL
                <span className="block text-xs text-muted-foreground mt-1">
                  https://www.youtube.com/watch?v={currentVideoId}
                </span>
              </button>
              <button
                onClick={() => handleShare('current')}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium text-left hover:bg-foreground/5 transition-colors"
              >
                Veodee URL
                <span className="block text-xs text-muted-foreground mt-1">
                  {window.location.href}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
