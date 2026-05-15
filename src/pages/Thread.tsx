import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTag } from '@/contexts/tag-context';
import { VideoContainer } from '@/components/playlist/video-container';
import { TagFilter } from '@/components/ui/tag-filter';
import { Search, RefreshCw, ChevronDown, Grid2X2, LayoutGrid, List, Upload, Download, RotateCcw, Image, Tag, Plus, X, ArrowUpDown } from 'lucide-react';
import { YouTubePermissionBanner } from '@/components/ui/youtube-permission-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { Footer } from '@/components/ui/footer';
import { YouTubeAPI } from '@/services/youtube-api';
import type { Video } from '@/types/index';

const LOAD_STEP = 12;

export function Thread() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    addVideo,
    removeVideo,
    updateVideo,
    reorderVideos,
    selectedTags,
    getVideosByTags,
    setSelectedTags,
    exportLibrary,
    importLibrary,
    resetToDefaults,
    videos,
    tags,
  } = useTag();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const normalButtonRef = useRef<HTMLButtonElement>(null);
  const compactButtonRef = useRef<HTMLButtonElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const [youtubePermission, setYoutubePermission] = useState(() => {
    const saved = localStorage.getItem('youtube-permission');
    if (saved === null) {
      localStorage.setItem('youtube-permission', 'false');
      return false;
    }
    return saved === 'true';
  });

  const [autoLoadMore, setAutoLoadMore] = useState(() => {
    const saved = localStorage.getItem('auto-load-more');
    return saved !== 'false';
  });

  const [viewMode, setViewMode] = useState<'normal' | 'compact' | 'list'>(() => {
    const saved = localStorage.getItem('view-mode');
    if (saved === 'normal' || saved === 'compact' || saved === 'list') return saved;
    const legacySmall = localStorage.getItem('small-cards');
    return legacySmall === 'true' ? 'compact' : 'normal';
  });
  const [enableMaxresThumbnails, setEnableMaxresThumbnails] = useState(() => {
    const saved = localStorage.getItem('enable-maxres-thumbnails');
    return saved !== 'false';
  });
  const [showTags, setShowTags] = useState(() => {
    const saved = localStorage.getItem('show-tags');
    return saved !== 'false';
  });
  const [isReversed, setIsReversed] = useState(() => {
    return localStorage.getItem('videos-reversed') === 'true';
  });
  const listButtonRef = useRef<HTMLButtonElement>(null);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [importFileInfo, setImportFileInfo] = useState<{
    groups: number;
    tags: number;
    videos: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('home-background');
  });

  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const addVideoInputRef = useRef<HTMLInputElement>(null);

  const currentBackgroundVideoId = backgroundImage
    ? backgroundImage.match(/\/vi\/([^/]+)\//)?.[1] ?? null
    : null;

  // Listen for YouTube permission changes
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

  // Listen for background changes
  useEffect(() => {
    const handleBackgroundChange = () => {
      setBackgroundImage(localStorage.getItem('home-background'));
    };
    window.addEventListener('background-changed', handleBackgroundChange);
    return () => window.removeEventListener('background-changed', handleBackgroundChange);
  }, []);

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Handle search from custom event
  useEffect(() => {
    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchQuery(customEvent.detail);
    };
    window.addEventListener('video-search', handleSearchEvent);
    return () => window.removeEventListener('video-search', handleSearchEvent);
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(0);
  }, [searchQuery, selectedTags]);

  // Filter videos by search query and selected tags
  const filteredVideos = useMemo(() => {
    let result = getVideosByTags([]);

    // Filter by tags first
    if (selectedTags.length > 0) {
      result = getVideosByTags(selectedTags);
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((video) => {
        return video.id.toLowerCase().includes(query);
      });
    }

    // Deduplicate videos by ID (keep first occurrence)
    const uniqueVideos = new Map<string, Video>();
    result.forEach((video) => {
      if (!uniqueVideos.has(video.id)) {
        uniqueVideos.set(video.id, video);
      }
    });

    return Array.from(uniqueVideos.values());
  }, [searchQuery, selectedTags, getVideosByTags]);

  // Slice videos for infinite scroll
  const visibleVideos = (isReversed ? [...filteredVideos].reverse() : filteredVideos).slice(0, visibleCount);
  const hasMore = filteredVideos.length > visibleCount;

  // Intersection observer for infinite scroll (only when autoLoadMore is enabled)
  useEffect(() => {
    if (!autoLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_STEP, filteredVideos.length)
          );
        }
      },
      { rootMargin: '0px', threshold: 0 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, filteredVideos.length, autoLoadMore]);

  const handleGrantPermission = () => {
    setYoutubePermission(true);
    localStorage.setItem('youtube-permission', 'true');
    YouTubeAPI.clearCache();
    window.dispatchEvent(new CustomEvent('youtube-permission-granted'));
  };

  const handleToggleAutoLoad = () => {
    const newValue = !autoLoadMore;
    setAutoLoadMore(newValue);
    localStorage.setItem('auto-load-more', String(newValue));
  };


  const handleToggleMaxresThumbnails = () => {
    const newValue = !enableMaxresThumbnails;
    setEnableMaxresThumbnails(newValue);
    localStorage.setItem('enable-maxres-thumbnails', String(newValue));
  };

  const handleToggleShowTags = () => {
    const newValue = !showTags;
    setShowTags(newValue);
    localStorage.setItem('show-tags', String(newValue));
  };

  const handleExportLibrary = () => {
    setShowExportDialog(true);
  };

  const handleImportLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedImportFile(file);

    event.target.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (
          !data.groups ||
          !Array.isArray(data.groups) ||
          !data.tags ||
          !Array.isArray(data.tags)
        ) {
          setImportFileInfo(null);
          return;
        }

        let videoCount = 0;
        data.groups.forEach((group: any) => {
          if (group.videos && Array.isArray(group.videos)) {
            videoCount += group.videos.length;
          }
        });

        setImportFileInfo({
          groups: data.groups.length,
          tags: data.tags.length,
          videos: videoCount,
        });
      } catch (error) {
        setImportFileInfo(null);
      }
    };
    reader.readAsText(file);
    setShowImportDialog(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmImport = () => {
    if (!selectedImportFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (
          !data.groups ||
          !Array.isArray(data.groups) ||
          !data.tags ||
          !Array.isArray(data.tags)
        ) {
          alert('Invalid file format');
          return;
        }

        importLibrary(data, 'append');
        setShowImportDialog(false);
        setSelectedImportFile(null);
        setImportFileInfo(null);
      } catch (error) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(selectedImportFile);
  };

  const [isLoading, setIsLoading] = useState(false);

  // Update indicator position when view mode changes
  useEffect(() => {
    const activeButton =
      viewMode === 'compact' ? compactButtonRef.current :
      viewMode === 'list' ? listButtonRef.current :
      normalButtonRef.current;
    const container = sliderRef.current;
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const buttonCenter = buttonRect.left - containerRect.left + buttonRect.width / 2;
      const width = isSliderHovered ? 48 : 16;
      setIndicatorStyle({ left: buttonCenter - width / 2, width });
    }
  }, [viewMode, isSliderHovered]);

  const handleLoadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + LOAD_STEP, filteredVideos.length)
    );
  };

  const handlePlayVideo = useCallback(
    (video: Video) => {
      navigate('/player', { state: { video } });
    },
    [navigate]
  );

  const handleRemoveVideo = useCallback(
    (videoId: string) => {
      removeVideo(videoId);
    },
    [removeVideo]
  );

  const handleReorderVideos = useCallback(
    (fromVisible: number, toVisible: number) => {
      // Map visible indices to full library indices
      const allVideos = getVideosByTags([]);
      const uniqueAll = new Map<string, number>();
      allVideos.forEach((v, i) => {
        if (!uniqueAll.has(v.id)) uniqueAll.set(v.id, i);
      });
      const fromId = visibleVideos[fromVisible]?.id;
      const toId = visibleVideos[toVisible]?.id;
      if (!fromId || !toId) return;
      const fromFull = uniqueAll.get(fromId);
      const toFull = uniqueAll.get(toId);
      if (fromFull === undefined || toFull === undefined) return;
      reorderVideos(fromFull, toFull);
    },
    [visibleVideos, getVideosByTags, reorderVideos]
  );

  const handleUpdateVideo = useCallback(
    (videoId: string, updates: Partial<Video>) => {
      updateVideo(videoId, updates);
    },
    [updateVideo]
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index > 0) {
        handleReorderVideos(index, index - 1);
      }
    },
    [handleReorderVideos]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index < visibleVideos.length - 1) {
        handleReorderVideos(index, index + 1);
      }
    },
    [visibleVideos.length, handleReorderVideos]
  );

  const extractVideoId = (url: string): string | null => {
    const rawIdMatch = url.match(/^[a-zA-Z0-9_-]{11}$/);
    if (rawIdMatch) return rawIdMatch[0];
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

  const handleAddVideoSubmit = () => {
    const videoId = extractVideoId(newVideoUrl.trim());
    if (videoId) {
      addVideo({ id: videoId, tags: [] });
      setNewVideoUrl('');
      setShowAddVideoDialog(false);
    }
  };

  const handleAddVideoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddVideoSubmit();
    if (e.key === 'Escape') {
      setShowAddVideoDialog(false);
      setNewVideoUrl('');
    }
  };

  const handleSetBackground = useCallback((videoId: string) => {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    if (currentBackgroundVideoId === videoId) {
      localStorage.removeItem('home-background');
      setBackgroundImage(null);
    } else {
      localStorage.setItem('home-background', thumbnailUrl);
      setBackgroundImage(thumbnailUrl);
    }
    window.dispatchEvent(new CustomEvent('background-changed'));
  }, [currentBackgroundVideoId]);

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: backgroundImage.startsWith('linear-gradient') || backgroundImage.startsWith('radial-gradient')
              ? backgroundImage
              : `url(${backgroundImage})`,
            backgroundSize: backgroundImage?.startsWith('linear-gradient') || backgroundImage?.startsWith('radial-gradient') ? 'cover' : 'cover',
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
        {/* Search Bar and Tag Filter */}
        <div className="mb-6 space-y-4 px-4 sm:px-0">
          {/* Library Management Buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => {
                setShowAddVideoDialog(true);
                setTimeout(() => addVideoInputRef.current?.focus(), 50);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Add video
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Download className="h-5 w-5" />
              <span className="text-sm">Import</span>
            </button>
            <button
              onClick={handleExportLibrary}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-5 w-5" />
              <span className="text-sm">Export</span>
            </button>
            <button
              onClick={() => setShowResetDialog(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-5 w-5" />
              <span className="text-sm">Reset</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative max-w-md flex-1 flex items-center group focus-within:text-foreground">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-foreground group-focus-within:text-foreground transition-colors duration-150" />
              <div className="flex-1">
                <input
                  type="text"
                  id="search-input"
                  name="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 w-full bg-transparent border-none focus:ring-0 text-muted-foreground group-hover:text-foreground group-focus-within:text-foreground placeholder:text-muted-foreground group-hover:placeholder:text-foreground group-focus-within:placeholder:text-foreground transition-colors duration-150 ease-in-out"
                />
              </div>
            </div>
            <button
              onClick={handleToggleAutoLoad}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer ${
                autoLoadMore ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <RefreshCw className="h-5 w-5" />
              <span className="text-sm">
                Autoload
              </span>
            </button>
            <button
              onClick={handleToggleMaxresThumbnails}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer ${
                enableMaxresThumbnails ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Image className="h-5 w-5" />
              <span className="text-sm">
                HD
              </span>
            </button>
            <button
              onClick={handleToggleShowTags}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer ${
                showTags ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tag className="h-5 w-5" />
              <span className="text-sm">
                Tags
              </span>
            </button>
            <button
              onClick={() => {
                const next = !isReversed;
                setIsReversed(next);
                localStorage.setItem('videos-reversed', String(next));
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isReversed ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Reverse order"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>Reverse</span>
            </button>
            <div
              ref={sliderRef}
              className="relative flex items-center"
              onMouseEnter={() => setIsSliderHovered(true)}
              onMouseLeave={() => setIsSliderHovered(false)}
            >
              <button
                ref={normalButtonRef}
                onClick={() => {
                  setViewMode('normal');
                  localStorage.setItem('view-mode', 'normal');
                }}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'normal' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Normal</span>
              </button>
              <button
                ref={compactButtonRef}
                onClick={() => {
                  setViewMode('compact');
                  localStorage.setItem('view-mode', 'compact');
                }}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'compact' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
                <span>Compact</span>
              </button>
              <button
                ref={listButtonRef}
                onClick={() => {
                  setViewMode('list');
                  localStorage.setItem('view-mode', 'list');
                }}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </button>
              <div
                className="absolute bottom-1 h-0.5 bg-foreground rounded-full transition-all duration-300 ease-out"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
            </div>
          </div>
          {showTags && <TagFilter />}
        </div>

        {/* Video Count */}
        <div className="text-sm text-muted-foreground px-4 sm:px-0 py-2">
          {filteredVideos.length} videos
        </div>

        {/* YouTube Permission Banner */}
        {!youtubePermission && (
          <YouTubePermissionBanner onAllow={handleGrantPermission} />
        )}

        {/* Videos Grid */}
        <div className="transition-all duration-300">
          <VideoContainer
            videos={visibleVideos}
            onPlay={handlePlayVideo}
            onRemove={handleRemoveVideo}
            onUpdate={handleUpdateVideo}
            onReorder={viewMode === 'list' ? handleReorderVideos : undefined}
            onVideoAdded={viewMode === 'list' ? (video) => addVideo(video) : undefined}
            onLoadingChange={setIsLoading}
            layout={viewMode === 'list' ? 'list' : 'grid'}
            enableMaxresThumbnails={enableMaxresThumbnails}
            showTags={showTags}
            onSetBackground={handleSetBackground}
            currentBackgroundVideoId={currentBackgroundVideoId}
            onMoveUp={viewMode === 'list' ? handleMoveUp : undefined}
            onMoveDown={viewMode === 'list' ? handleMoveDown : undefined}
          />
        </div>

        {/* Load more sentinel / button */}
        <div
          ref={loadMoreRef}
          className="h-48 flex items-center justify-center"
        >
          {hasMore && !autoLoadMore && !isLoading && (
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors border-none cursor-pointer"
              style={{
                color: 'hsl(var(--muted-foreground))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'hsl(var(--foreground))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
              }}
            >
              <ChevronDown className="h-5 w-5" />
              <span className="text-sm">
                Load more
              </span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 &&
          !searchQuery.trim() &&
          selectedTags.length === 0 && <EmptyState />}

        {/* No Search Results State */}
        {filteredVideos.length === 0 &&
          (searchQuery.trim() !== '' || selectedTags.length > 0) && (
            <div className="p-32 text-center">
              <h3 className="text-xl font-semibold mb-2">
                No videos match your search
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or tags
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTags([]);
                }}
                className="text-sm text-primary"
              >
                Clear filters
              </button>
            </div>
          )}

        {/* Footer when no more videos to load or no search results */}
        {(!hasMore ||
          (filteredVideos.length === 0 &&
            (searchQuery.trim() !== '' || selectedTags.length > 0))) && (
          <Footer />
        )}
      </div>
      </div>
      <div className="h-16 md:hidden" />

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
                <ChevronDown className="h-5 w-5 rotate-45" />
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tags:</span>
                  <span className="font-medium">{tags.length}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExportDialog(false)}
                className="flex-1 h-8 text-muted-foreground hover:bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  exportLibrary();
                  setShowExportDialog(false);
                }}
                className="flex-1 h-8 text-muted-foreground hover:bg-transparent border-none cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
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
                <ChevronDown className="h-5 w-5 rotate-45" />
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
                      <span className="text-muted-foreground">Groups:</span>
                      <span className="font-medium">
                        {importFileInfo.groups}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tags:</span>
                      <span className="font-medium">
                        {importFileInfo.tags}
                      </span>
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
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setSelectedImportFile(null);
                  setImportFileInfo(null);
                }}
                className="flex-1 px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors border-none cursor-pointer"
              >
                Cancel
              </button>
              {selectedImportFile && importFileInfo && (
                <button onClick={handleConfirmImport} className="flex-1 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors border-none cursor-pointer">
                  Import
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
                <ChevronDown className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This will permanently remove all your videos, tags, and groups.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Videos:</span>
                  <span className="font-medium">{videos.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tags:</span>
                  <span className="font-medium">{tags.length}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setShowResetDialog(false);
                }}
                className="flex-1 px-3 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors border-none cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Video Dialog */}
      {showAddVideoDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => {
            setShowAddVideoDialog(false);
            setNewVideoUrl('');
          }}
        >
          <div
            className="bg-card/90 backdrop-blur-lg border border-border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeIn 150ms ease-out' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/80 uppercase tracking-wider">
                Add video
              </span>
              <button
                onClick={() => {
                  setShowAddVideoDialog(false);
                  setNewVideoUrl('');
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                ref={addVideoInputRef}
                type="text"
                placeholder="YouTube URL or video ID"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                onKeyDown={handleAddVideoKeyDown}
                className="flex-1 h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleAddVideoSubmit}
                disabled={!extractVideoId(newVideoUrl.trim())}
                className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste a YouTube link or an 11-character video ID
            </p>
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
    </div>
  );
}
