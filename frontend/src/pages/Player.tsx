import { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Youtube,
  Cookie,
  PlayCircle,
  Share2,
  Bookmark,
  Check,
  Pencil,
  X,
  Repeat,
  Maximize,
  Settings,
} from 'lucide-react';
import { SimpleYoutubePlayer } from '@/components/player/simple-youtube-player';
import { LoadingBackground } from '@/components/player/loading-background';
import { YouTubeAPI } from '@/services/youtube-api';
import { useVideo } from '@/contexts/video-context';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/ui/footer';
import type { Video } from '@/types/index';
import { getYouTubeThumbnailUrl } from '@/lib/color-extractor';

// Video Player Component - Always Visible
function VideoPlayer({
  videoId,
  playerType,
  showPermissionModal,
  onGrantPermission,
  autoPlayEnabled,
  loopEnabled,
  forcedAspectRatio,
}: {
  videoId: string | null;
  playerType: 'normal' | 'youtube' | 'plyr';
  showPermissionModal: boolean;
  onGrantPermission: () => void;
  autoPlayEnabled: boolean;
  loopEnabled: boolean;
  forcedAspectRatio: number | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const embedUrl = videoId
    ? `https://${playerType === 'youtube' ? 'www.youtube-nocookie.com' : 'www.youtube.com'}/embed/${videoId}?autoplay=${autoPlayEnabled ? 1 : 0}&rel=0&modestbranding=1${loopEnabled ? `&loop=1&playlist=${videoId}` : ''}`
    : null;

  useEffect(() => {
    if (videoId) {
      setIsLoading(true);
      setError(null);
    }
  }, [videoId, playerType, autoPlayEnabled, loopEnabled]);

  const handleLoad = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsLoading(false);
      });
    });
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load video');
  };

  return (
    <div className="relative w-full h-full">
      {showPermissionModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 pointer-events-auto text-center">
            <Youtube className="h-10 w-10 mx-auto text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">
              Allow YouTube Connection
            </h3>
            <div className="text-sm text-muted-foreground">
              <p>
                YouTube may collect IP address, browser info, and viewing data
                per their privacy policy
              </p>
            </div>
            <Button
              onClick={onGrantPermission}
              className="w-full text-white bg-red-600 hover:bg-red-700"
            >
              Allow
            </Button>
          </div>
        </div>
      )}

      {videoId ? (
        playerType === 'plyr' ? (
          <div className="w-full h-full">
            <SimpleYoutubePlayer
              videoId={videoId}
              autoPlayEnabled={autoPlayEnabled}
              loopEnabled={loopEnabled}
              forcedAspectRatio={forcedAspectRatio}
              onReady={() => setIsLoading(false)}
              onError={() => {
                setError('Failed to load Plyr player');
                setIsLoading(false);
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full relative">
            <LoadingBackground videoId={videoId} isLoading={isLoading} />

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="text-center text-white">
                  <p className="mb-2">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <iframe
              className="w-full h-full absolute inset-0"
              style={{ backgroundColor: 'transparent' }}
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        )
      ) : null}
    </div>
  );
}

export function Player() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addVideo, removeVideo, videos } = useVideo();
  const { toast } = useToast();
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [cookiesEnabled, setCookiesEnabled] = useState(
    () => localStorage.getItem('player-cookies-enabled') === 'true'
  );
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(
    () => localStorage.getItem('player-autoplay-enabled') === 'true'
  );
  const [loopEnabled, setLoopEnabled] = useState(
    () => localStorage.getItem('player-loop-enabled') === 'true'
  );
  const [playerType, setPlayerType] = useState<'normal' | 'youtube' | 'plyr'>(
    () => {
      const saved = localStorage.getItem('player-type');
      return (saved as 'normal' | 'youtube' | 'plyr') || 'youtube';
    }
  );
  const [youtubePermission, setYoutubePermission] = useState(() => {
    const saved = localStorage.getItem('youtube-permission');
    if (saved === null) {
      savePreference('youtube-permission', false);
      return false;
    }
    return saved === 'true';
  });
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [shareClicked, setShareClicked] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [playerIndicatorStyle, setPlayerIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const playerBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const editInputRef = useRef<HTMLDivElement>(null);
  const videoIdInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnailBackgroundUrl, setThumbnailBackgroundUrl] = useState<
    string | null
  >(null);
  const [customBackground, setCustomBackground] = useState(() => {
    return localStorage.getItem('home-background');
  });
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const [isYouTubeMusicVideo, setIsYouTubeMusicVideo] = useState(false);
  const [forceSquareRatio, setForceSquareRatio] = useState(() => {
    const saved = localStorage.getItem('force-square-ratio');
    return saved === 'true';
  });
  const [showPlayerSettings, setShowPlayerSettings] = useState(false);
  const playerSettingsBtnRef = useRef<HTMLButtonElement>(null);
  const playerSettingsPopupRef = useRef<HTMLDivElement>(null);

  const isYouTubeType = playerType === 'normal' || playerType === 'youtube';

  const isInLibrary = currentVideoId
    ? videos.some((v) => v.id === currentVideoId)
    : false;

  // Helper to save preference to localStorage
  const savePreference = (key: string, value: boolean | string) => {
    localStorage.setItem(key, String(value));
  };

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

  // Save player type to localStorage when it changes
  useEffect(() => {
    savePreference('player-type', playerType);
  }, [playerType]);

  // Save cookies preference to localStorage when it changes
  useEffect(() => {
    savePreference('player-cookies-enabled', cookiesEnabled);
  }, [cookiesEnabled]);

  // Save auto-play preference to localStorage when it changes
  useEffect(() => {
    savePreference('player-autoplay-enabled', autoPlayEnabled);
  }, [autoPlayEnabled]);

  // Save loop preference to localStorage when it changes
  useEffect(() => {
    savePreference('player-loop-enabled', loopEnabled);
  }, [loopEnabled]);

  // Calculate player indicator position
  useEffect(() => {
    const activeIndex = isYouTubeType ? 0 : 1;
    const playerBtn = playerBtnRefs.current[activeIndex];
    if (!playerBtn) return;

    const parent = playerBtn.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const btnRect = playerBtn.getBoundingClientRect();
    const lineCenter = btnRect.left - parentRect.left + btnRect.width / 2;
    setPlayerIndicatorStyle({ left: lineCenter - 8, width: 16 });
  }, [playerType, isYouTubeType]);

  // Handle cookie toggle - switches between normal and youtube when on YouTube
  const handleCookieToggle = () => {
    const newCookiesEnabled = !cookiesEnabled;
    setCookiesEnabled(newCookiesEnabled);
    if (isYouTubeType) {
      setPlayerType(newCookiesEnabled ? 'normal' : 'youtube');
    }
  };

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Handle video from navigation and thumbnail updates
  useEffect(() => {
    const videoIdFromParam = searchParams.get('videoId');
    if (location.state?.video) {
      const video = location.state.video as Video;
      if (video && video.id) {
        setCurrentVideoId(video.id);
        if (!youtubePermission) {
          setShowPermissionModal(true);
        }
      }
    } else if (videoIdFromParam) {
      setCurrentVideoId(videoIdFromParam);
      if (!youtubePermission) {
        setShowPermissionModal(true);
      }
    }
  }, [location.state, youtubePermission, searchParams]);

  useEffect(() => {
    setThumbnailBackgroundUrl(
      currentVideoId
        ? getYouTubeThumbnailUrl(currentVideoId, 'hqdefault')
        : null
    );
  }, [currentVideoId]);

  // Fetch video details to get aspect ratio
  useEffect(() => {
    if (!currentVideoId || !youtubePermission) {
      setVideoAspectRatio(null);
      setIsYouTubeMusicVideo(false);
      return;
    }

    YouTubeAPI.getVideoDetails(currentVideoId).then((details) => {
      if (details && details.width && details.height) {
        const ratio = details.width / details.height;

        // Detect YouTube Music videos (200x150 = 4:3 ratio)
        const isMusicVideo = details.width === 200 && details.height === 150;
        setIsYouTubeMusicVideo(isMusicVideo);

        setVideoAspectRatio(ratio);
      } else {
        setVideoAspectRatio(null);
        setIsYouTubeMusicVideo(false);
      }
    });
  }, [currentVideoId, youtubePermission]);

  // Listen for background changes
  useEffect(() => {
    const handleBackgroundChange = () => {
      setCustomBackground(localStorage.getItem('home-background'));
    };
    window.addEventListener('background-changed', handleBackgroundChange);
    return () =>
      window.removeEventListener('background-changed', handleBackgroundChange);
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
      } catch (error) {
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
    <div className="relative min-h-screen">
      {(thumbnailBackgroundUrl || customBackground) && (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: thumbnailBackgroundUrl
              ? `url(${thumbnailBackgroundUrl})`
              : customBackground.startsWith('linear-gradient') ||
                  customBackground.startsWith('radial-gradient')
                ? customBackground
                : `url(${customBackground})`,
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
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-0 sm:pt-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Main Video Player - Full Width */}
            <div
              className="relative -mx-4 sm:mx-0 flex items-center justify-center aspect-video"
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
                className="relative"
                style={{
                  width: (() => {
                    const ratio =
                      forceSquareRatio && isYouTubeMusicVideo
                        ? 1
                        : videoAspectRatio || 16 / 9;
                    return ratio < 16 / 9
                      ? `${(ratio / (16 / 9)) * 100}%`
                      : '100%';
                  })(),
                  height: (() => {
                    const ratio =
                      forceSquareRatio && isYouTubeMusicVideo
                        ? 1
                        : videoAspectRatio || 16 / 9;
                    return ratio > 16 / 9
                      ? `${(16 / 9 / ratio) * 100}%`
                      : '100%';
                  })(),
                }}
              >
                <div className="shadow-2xl overflow-hidden rounded-none sm:rounded-3xl w-full h-full bg-transparent">
                  {videoAspectRatio && (
                    <VideoPlayer
                      videoId={youtubePermission ? currentVideoId : null}
                      playerType={playerType}
                      showPermissionModal={showPermissionModal}
                      onGrantPermission={handleGrantPermission}
                      autoPlayEnabled={autoPlayEnabled}
                      loopEnabled={loopEnabled}
                      forcedAspectRatio={
                        forceSquareRatio && isYouTubeMusicVideo ? 1 : null
                      }
                    />
                  )}
                </div>
                {isDragging && (
                  <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center z-10 backdrop-blur-sm rounded-none sm:rounded-3xl">
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
            </div>

            {/* Video Info & Controls */}
            <div className="flex flex-col gap-4 mt-6">
              {/* Rows 1 & 2: Combined on same line when space permits */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                {/* Row 1: Saved, Share, Video ID */}
                <div className="flex items-center gap-2 flex-nowrap">
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
                        e.currentTarget.style.color = 'hsl(var(--foreground))';
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
                        e.currentTarget.style.color = 'hsl(var(--foreground))';
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
                  <button
                    ref={playerSettingsBtnRef}
                    onClick={() => setShowPlayerSettings(!showPlayerSettings)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer ${showPlayerSettings ? 'text-foreground bg-foreground/10' : 'text-muted-foreground'}`}
                    style={{
                      color: showPlayerSettings
                        ? 'hsl(var(--foreground))'
                        : 'hsl(var(--muted-foreground))',
                      backgroundColor: showPlayerSettings
                        ? 'hsl(var(--foreground) / 0.1)'
                        : 'transparent',
                    }}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">Player</span>
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

                {/* Row 2: Autoplay, Loop, YouTube, Plyr - Hidden when settings popup is open */}
                {!showPlayerSettings && (
                  <div className="flex items-center gap-4 flex-nowrap">
                    {/* Auto-play Toggle */}
                    <button
                      onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
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

                    {/* Loop Toggle */}
                    <button
                      onClick={() => setLoopEnabled(!loopEnabled)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer"
                      style={{
                        color: loopEnabled
                          ? 'white'
                          : 'hsl(var(--muted-foreground))',
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

                    {/* Player Type Toggle */}
                    <div className="flex flex-nowrap items-center gap-1.5 p-1.5 relative">
                      <button
                        ref={(el) => {
                          playerBtnRefs.current[0] = el;
                        }}
                        onClick={() =>
                          setPlayerType(cookiesEnabled ? 'normal' : 'youtube')
                        }
                        onMouseEnter={(e) => {
                          if (!isYouTubeType) {
                            e.currentTarget.style.color =
                              'hsl(var(--foreground))';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isYouTubeType) {
                            e.currentTarget.style.color =
                              'hsl(var(--muted-foreground))';
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all duration-200 border-none"
                        style={{
                          color: isYouTubeType
                            ? 'white'
                            : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        <Youtube
                          className="h-5 w-5"
                          style={{
                            color: isYouTubeType
                              ? 'white'
                              : 'hsl(var(--muted-foreground))',
                          }}
                        />
                        <span className="text-sm">YouTube</span>
                      </button>
                      <button
                        ref={(el) => {
                          playerBtnRefs.current[1] = el;
                        }}
                        onClick={() => setPlayerType('plyr')}
                        onMouseEnter={(e) => {
                          if (playerType !== 'plyr') {
                            e.currentTarget.style.color =
                              'hsl(var(--foreground))';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (playerType !== 'plyr') {
                            e.currentTarget.style.color =
                              'hsl(var(--muted-foreground))';
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all duration-200 border-none"
                        style={{
                          color:
                            playerType === 'plyr'
                              ? 'white'
                              : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        <PlayCircle
                          className="h-5 w-5"
                          style={{
                            color:
                              playerType === 'plyr'
                                ? 'white'
                                : 'hsl(var(--muted-foreground))',
                          }}
                        />
                        <span className="text-sm">Plyr</span>
                      </button>
                      <div
                        className="absolute bottom-[-4px] h-0.5 rounded-full transition-all duration-300 ease-out"
                        style={{
                          left: playerIndicatorStyle.left,
                          width: playerIndicatorStyle.width,
                          backgroundColor: 'white',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Settings Popup */}
      {showPlayerSettings && (
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

            {/* Autoplay */}
            <button
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
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

            {/* Loop */}
            <button
              onClick={() => setLoopEnabled(!loopEnabled)}
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

            {/* Player Type */}
            <div className="flex flex-nowrap items-center gap-1.5 p-1.5 relative">
              <button
                onClick={() =>
                  setPlayerType(cookiesEnabled ? 'normal' : 'youtube')
                }
                onMouseEnter={(e) => {
                  if (!isYouTubeType) {
                    e.currentTarget.style.color = 'hsl(var(--foreground))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isYouTubeType) {
                    e.currentTarget.style.color =
                      'hsl(var(--muted-foreground))';
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all duration-200 border-none"
                style={{
                  color: isYouTubeType
                    ? 'white'
                    : 'hsl(var(--muted-foreground))',
                }}
              >
                <Youtube
                  className="h-5 w-5"
                  style={{
                    color: isYouTubeType
                      ? 'white'
                      : 'hsl(var(--muted-foreground))',
                  }}
                />
                <span className="text-sm">YouTube</span>
              </button>
              <button
                onClick={() => setPlayerType('plyr')}
                onMouseEnter={(e) => {
                  if (playerType !== 'plyr') {
                    e.currentTarget.style.color = 'hsl(var(--foreground))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (playerType !== 'plyr') {
                    e.currentTarget.style.color =
                      'hsl(var(--muted-foreground))';
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all duration-200 border-none"
                style={{
                  color:
                    playerType === 'plyr'
                      ? 'white'
                      : 'hsl(var(--muted-foreground))',
                }}
              >
                <PlayCircle
                  className="h-5 w-5"
                  style={{
                    color:
                      playerType === 'plyr'
                        ? 'white'
                        : 'hsl(var(--muted-foreground))',
                  }}
                />
                <span className="text-sm">Plyr</span>
              </button>
              <div
                className="absolute bottom-[-4px] h-0.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  left: playerIndicatorStyle.left,
                  width: playerIndicatorStyle.width,
                  backgroundColor: 'white',
                }}
              />
            </div>

            {/* Cookies */}
            <button
              onClick={isYouTubeType ? handleCookieToggle : undefined}
              disabled={!isYouTubeType}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer"
              style={{
                color: cookiesEnabled
                  ? 'white'
                  : 'hsl(var(--muted-foreground))',
              }}
              onMouseEnter={(e) => {
                if (isYouTubeType) {
                  e.currentTarget.style.color = 'hsl(var(--foreground))';
                }
              }}
              onMouseLeave={(e) => {
                if (isYouTubeType) {
                  e.currentTarget.style.color = cookiesEnabled
                    ? 'white'
                    : 'hsl(var(--muted-foreground))';
                }
              }}
            >
              <Cookie className="h-5 w-5" />
              <span className="text-sm">Cookies</span>
            </button>

            {/* Square Ratio */}
            <button
              onClick={() => {
                const newValue = !forceSquareRatio;
                setForceSquareRatio(newValue);
                localStorage.setItem('force-square-ratio', String(newValue));
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
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
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
                className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-left"
              >
                YouTube URL
                <span className="block text-xs text-muted-foreground mt-1">
                  https://www.youtube.com/watch?v={currentVideoId}
                </span>
              </button>
              <button
                onClick={() => handleShare('current')}
                className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-left"
              >
                Current Page URL
                <span className="block text-xs text-muted-foreground mt-1">
                  {window.location.href}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
