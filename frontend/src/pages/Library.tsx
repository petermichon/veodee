import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVideo } from '@/contexts/video-context';
import { LibraryControls } from '@/components/playlist/playlist-controls';
import { LibraryVideoItem } from '@/components/playlist/library-video-item';
import { Button } from '@/components/ui/button';
import { X, Upload, Download } from 'lucide-react';
import { YouTubePermissionBanner } from '@/components/ui/youtube-permission-banner';
import { VideoEmptyState } from '@/components/ui/empty-state';
import { Footer } from '@/components/ui/footer';
import { YouTubeAPI } from '@/services/youtube-api';
import type { Video } from '@/types/index';

export function Library() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    removeVideo,
    resetToDefaults,
    videos,
    exportLibrary,
    importLibrary,
    activePlaylist,
  } = useVideo();

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(
    null
  );
  const [importFileInfo, setImportFileInfo] = useState<{
    videos: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [youtubePermission, setYoutubePermission] = useState(() => {
    const saved = localStorage.getItem('youtube-permission');
    if (saved === null) {
      localStorage.setItem('youtube-permission', 'false');
      return false;
    }
    return saved === 'true';
  });
  const [hideThumbnailsAndTitles, setHideThumbnailsAndTitles] = useState(() => {
    const saved = localStorage.getItem('library-raw-mode');
    return saved === 'true';
  });

  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('home-background');
  });
  const [backgroundMode, setBackgroundMode] = useState<'normal' | 'custom'>(
    () => {
      const savedMode = localStorage.getItem('background-mode');
      if (savedMode === 'normal' || savedMode === 'custom') {
        return savedMode;
      }
      return localStorage.getItem('home-background') ? 'custom' : 'normal';
    }
  );

  // Save raw mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('library-raw-mode', String(hideThumbnailsAndTitles));
  }, [hideThumbnailsAndTitles]);

  // Listen for background changes
  useEffect(() => {
    const handleBackgroundChange = () => {
      setBackgroundImage(localStorage.getItem('home-background'));
      const savedMode = localStorage.getItem('background-mode');
      if (savedMode === 'normal' || savedMode === 'custom') {
        setBackgroundMode(savedMode);
      } else {
        setBackgroundMode(
          localStorage.getItem('home-background') ? 'custom' : 'normal'
        );
      }
    };
    window.addEventListener('background-changed', handleBackgroundChange);
    return () =>
      window.removeEventListener('background-changed', handleBackgroundChange);
  }, []);

  const handleGrantPermission = () => {
    setYoutubePermission(true);
    localStorage.setItem('youtube-permission', 'true');
    YouTubeAPI.clearCache();
    window.dispatchEvent(new CustomEvent('youtube-permission-granted'));
  };

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Callback functions with useCallback for performance
  const handlePlayVideo = useCallback(
    (video: Video) => {
      navigate('/', { state: { video } });
    },
    [navigate]
  );

  const handleRemoveVideo = useCallback(
    (videoId: string) => {
      removeVideo(videoId);
    },
    [removeVideo]
  );

  const handleExportLibrary = useCallback(() => {
    setShowExportDialog(true);
  }, []);

  const handleImportLibrary = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      setSelectedImportFile(file);

      // Reset the file input so selecting the same file again triggers onChange
      event.target.value = '';

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Basic validation
          if (!data.videos || !Array.isArray(data.videos)) {
            setImportFileInfo(null);
            return;
          }

          setImportFileInfo({
            videos: data.videos.length,
          });
        } catch {
          setImportFileInfo(null);
        }
      };
      reader.readAsText(file);
      setShowImportDialog(true);
    },
    []
  );

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (!selectedImportFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Basic validation
        if (!data.videos || !Array.isArray(data.videos)) {
          alert('Invalid file format');
          return;
        }

        importLibrary(data, 'append');
        setShowImportDialog(false);
        setSelectedImportFile(null);
        setImportFileInfo(null);
      } catch {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(selectedImportFile);
  }, [selectedImportFile, importLibrary]);

  // Derived state
  const isEmptyState = videos.length === 0;

  return (
    <div className="relative">
      {/* Background Image */}
      {backgroundMode === 'custom' && backgroundImage && (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage:
              backgroundImage.startsWith('linear-gradient') ||
              backgroundImage.startsWith('radial-gradient')
                ? backgroundImage
                : `url(${backgroundImage})`,
            backgroundSize:
              backgroundImage?.startsWith('linear-gradient') ||
              backgroundImage?.startsWith('radial-gradient')
                ? 'cover'
                : 'cover',
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

      <div className="relative z-10 md:px-8 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Actions */}
          <div className="flex items-center justify-between mb-6">
            <LibraryControls
              onReset={() => setShowResetDialog(true)}
              onExport={handleExportLibrary}
              onImport={handleImportClick}
              onRaw={() => setHideThumbnailsAndTitles(!hideThumbnailsAndTitles)}
              rawActive={hideThumbnailsAndTitles}
            />
          </div>

          {/* Reset Dialog */}
          {showResetDialog && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-background/50 shadow-2xl transition-opacity duration-200"
              onClick={() => setShowResetDialog(false)}
            >
              <div
                className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Reset Library
                  </h3>
                  <button
                    onClick={() => setShowResetDialog(false)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This will permanently remove all your videos.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Videos:</span>
                      <span className="font-medium">{videos.length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setShowResetDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      resetToDefaults();
                      setShowResetDialog(false);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Export Dialog */}
          {showExportDialog && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/30 backdrop-blur-sm"
              onClick={() => setShowExportDialog(false)}
            >
              <div
                className="bg-card/80 backdrop-blur-lg border border-border rounded-lg shadow-lg max-w-sm w-full p-3 space-y-4 pointer-events-auto text-sm"
                onClick={(e) => e.stopPropagation()}
                style={{
                  animation: 'fadeIn 150ms ease-out',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-foreground/80" />
                    <span className="text-sm font-medium text-foreground/80 uppercase tracking-wider">
                      Export Library
                    </span>
                  </div>
                  <button
                    onClick={() => setShowExportDialog(false)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    The following will be exported:
                  </p>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Videos:</span>
                      <span className="font-medium">{videos.length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setShowExportDialog(false)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-muted-foreground hover:bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      exportLibrary();
                      setShowExportDialog(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-muted-foreground hover:bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Import Dialog */}
          {showImportDialog && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-background/50 shadow-2xl transition-opacity duration-200"
              onClick={() => setShowImportDialog(false)}
            >
              <div
                className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Import Library
                  </h3>
                  <button
                    onClick={() => {
                      setShowImportDialog(false);
                      setSelectedImportFile(null);
                      setImportFileInfo(null);
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedImportFile && importFileInfo ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        The file contains:
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            File:
                          </span>
                          <p className="text-sm font-medium truncate ml-2">
                            {selectedImportFile.name}
                          </p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Videos:</span>
                          <span className="font-medium">
                            {importFileInfo.videos}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Invalid file format or unable to read file.
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setShowImportDialog(false);
                      setSelectedImportFile(null);
                      setImportFileInfo(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  {selectedImportFile && importFileInfo && (
                    <Button onClick={handleConfirmImport} className="flex-1">
                      Import
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input for file selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportLibrary}
            className="hidden"
          />

          {/* YouTube Permission Banner */}
          {!youtubePermission && (
            <YouTubePermissionBanner onAllow={handleGrantPermission} />
          )}

          {/* Videos Display */}
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveVideo(video.id);
                    }}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete video"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                  <LibraryVideoItem
                    video={video}
                    layout="grid"
                    onPlay={handlePlayVideo}
                    hideThumbnail={hideThumbnailsAndTitles}
                    hideTitle={hideThumbnailsAndTitles}
                    ratio={activePlaylist?.ratio ?? '16:9'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {isEmptyState && <VideoEmptyState />}
        </div>
        <Footer />
      </div>
    </div>
  );
}
