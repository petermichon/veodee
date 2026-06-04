import { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Youtube } from 'lucide-react';
import { SimpleYoutubePlayer } from '@/components/player/simple-youtube-player';
import { LoadingBackground } from '@/components/player/loading-background';
import { YouTubeAPI } from '@/services/youtube-api';
import type { Video } from '@/types/index';
import { getYouTubeThumbnailUrl } from '@/lib/color-extractor';

// Video Player Component
function VideoPlayer({
  videoId,
  playerType,
  showPermissionModal,
  onGrantPermission,
  autoPlayEnabled,
  loopEnabled,
  fillScreen,
}: {
  videoId: string | null;
  playerType: 'normal' | 'youtube' | 'plyr';
  showPermissionModal: boolean;
  onGrantPermission: () => void;
  autoPlayEnabled: boolean;
  loopEnabled: boolean;
  fillScreen: boolean;
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
          <div className="relative w-full h-full flex items-center justify-center">
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

            <div
              style={{
                aspectRatio: '16 / 9',
                width: 'min(100vw, 100vh * 16 / 9)',
                height: 'auto',
              }}
            >
              <SimpleYoutubePlayer
                videoId={videoId}
                autoPlayEnabled={autoPlayEnabled}
                loopEnabled={loopEnabled}
                onReady={() => setIsLoading(false)}
                onError={() => {
                  setError('Failed to load Plyr player');
                  setIsLoading(false);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
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

            <div
              style={{
                aspectRatio: fillScreen ? undefined : '16 / 9',
                width: fillScreen ? '100vw' : 'min(100vw, 100vh * 16 / 9)',
                height: fillScreen ? '100vh' : 'auto',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <iframe
                style={{
                  backgroundColor: 'transparent',
                  width: fillScreen ? 'max(100vw, 100vh * 16 / 9)' : '100%',
                  height: fillScreen ? 'max(100vh, 100vw * 9 / 16)' : '100%',
                  position: fillScreen ? 'absolute' : 'relative',
                  top: fillScreen ? '50%' : 'auto',
                  left: fillScreen ? '50%' : 'auto',
                  transform: fillScreen ? 'translate(-50%, -50%)' : 'none',
                }}
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}

export function Cinema() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [autoPlayEnabled] = useState(
    () => localStorage.getItem('player-autoplay-enabled') === 'true'
  );
  const [loopEnabled] = useState(
    () => localStorage.getItem('player-loop-enabled') === 'true'
  );
  const [playerType] = useState<'normal' | 'youtube' | 'plyr'>(() => {
    const saved = localStorage.getItem('player-type');
    return (saved as 'normal' | 'youtube' | 'plyr') || 'plyr';
  });
  const [youtubePermission, setYoutubePermission] = useState(() => {
    const saved = localStorage.getItem('youtube-permission');
    if (saved === null) {
      localStorage.setItem('youtube-permission', 'false');
      return false;
    }
    return saved === 'true';
  });
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [thumbnailBackgroundUrl, setThumbnailBackgroundUrl] = useState<
    string | null
  >(null);
  const [customBackground, setCustomBackground] = useState(() => {
    return localStorage.getItem('home-background');
  });
  const [fillScreen, setFillScreen] = useState(false);
  const [showUI, setShowUI] = useState(true);

  // Handle video from navigation
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

  // Trigger fullscreen on mount
  useEffect(() => {
    document.documentElement.requestFullscreen();

    // Try to lock orientation to landscape on mobile
    if ((screen.orientation as any)?.lock) {
      (screen.orientation as any).lock('landscape').catch(() => {
        // Ignore errors if orientation lock is not supported or denied
      });
    }
  }, []);

  // Handle UI visibility based on user interaction
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const showUINow = () => {
      setShowUI(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowUI(false);
      }, 3000);
    };

    const handleInteraction = () => {
      showUINow();
    };

    // Show UI initially
    showUINow();

    // Add event listeners
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    setThumbnailBackgroundUrl(
      currentVideoId
        ? getYouTubeThumbnailUrl(currentVideoId, 'hqdefault')
        : null
    );
  }, [currentVideoId]);

  // Listen for background changes
  useEffect(() => {
    const handleBackgroundChange = () => {
      setCustomBackground(localStorage.getItem('home-background'));
    };
    window.addEventListener('background-changed', handleBackgroundChange);
    return () =>
      window.removeEventListener('background-changed', handleBackgroundChange);
  }, []);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setFillScreen(isNowFullscreen);

      // Exit cinema mode when leaving fullscreen
      if (!isNowFullscreen) {
        if (currentVideoId) {
          navigate(`/player?videoId=${currentVideoId}`);
        } else {
          navigate('/player');
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [navigate, currentVideoId]);

  const handleGrantPermission = () => {
    setYoutubePermission(true);
    localStorage.setItem('youtube-permission', 'true');
    YouTubeAPI.clearCache();
    window.dispatchEvent(new CustomEvent('youtube-permission-granted'));
    setShowPermissionModal(false);
  };

  return (
    <div className="relative">
      {(thumbnailBackgroundUrl || customBackground) && (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: thumbnailBackgroundUrl
              ? `url(${thumbnailBackgroundUrl})`
              : customBackground?.startsWith('linear-gradient') ||
                  customBackground?.startsWith('radial-gradient')
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
      <div className="relative z-10 w-full h-screen flex items-center justify-center">
        {/* UI Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            showUI ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute top-4 left-4 pointer-events-auto">
            <button
              onClick={() => {
                if (currentVideoId) {
                  navigate(`/player?videoId=${currentVideoId}`);
                } else {
                  navigate('/player');
                }
              }}
              className="p-2 rounded-md bg-black/50 hover:bg-black/70 transition-colors text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-sm font-medium">Video ID: {currentVideoId}</p>
              <p className="text-xs text-gray-300 mt-1">
                Press Esc to exit fullscreen
              </p>
            </div>
          </div>
        </div>

        <VideoPlayer
          videoId={youtubePermission ? currentVideoId : null}
          playerType={playerType}
          showPermissionModal={showPermissionModal}
          onGrantPermission={handleGrantPermission}
          autoPlayEnabled={autoPlayEnabled}
          loopEnabled={loopEnabled}
          fillScreen={fillScreen}
        />
      </div>
    </div>
  );
}
