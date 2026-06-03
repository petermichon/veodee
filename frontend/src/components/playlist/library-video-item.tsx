import { memo, useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { YouTubeAPI, type YouTubeVideoDetails } from '@/services/youtube-api';
import type { Video } from '@/types/index';

type LayoutMode = 'grid' | 'list';

interface LibraryVideoItemProps {
  video: Video;
  videoDetails?: YouTubeVideoDetails;
  layout: LayoutMode;
  onPlay: (video: Video) => void;
  hideThumbnail?: boolean;
  hideTitle?: boolean;
  isDeleted?: boolean;
}

export const LibraryVideoItem = memo(function LibraryVideoItem({
  video,
  videoDetails,
  layout,
  onPlay,
  hideThumbnail = false,
  hideTitle = false,
  isDeleted = false,
}: LibraryVideoItemProps) {
  const [fetchedDetails, setFetchedDetails] =
    useState<YouTubeVideoDetails | null>(null);
  const [loadError, setLoadError] = useState(false);
  const hasFetched = useRef(false);

  const details = videoDetails || fetchedDetails;

  // Fetch video details if not provided and not previously failed
  useEffect(() => {
    if (videoDetails || hasFetched.current || loadError) return;
    // Skip API calls if thumbnails are hidden (raw mode)
    if (hideThumbnail) return;
    hasFetched.current = true;
    YouTubeAPI.getVideoDetails(video.id)
      .then((result) => {
        if (result) {
          setFetchedDetails(result);
        } else {
          setLoadError(true);
        }
      })
      .catch(() => {
        setLoadError(true);
      });
  }, [video.id, videoDetails, hideThumbnail, loadError]);

  // Layout-specific classes
  const containerClasses =
    layout === 'grid'
      ? `group overflow-hidden flex gap-3`
      : `group overflow-hidden flex gap-3`;

  const thumbnailClasses =
    layout === 'grid'
      ? 'relative w-24 h-[54px] overflow-hidden flex-shrink-0 rounded-lg'
      : 'relative w-32 h-20 overflow-hidden flex-shrink-0 rounded-lg';

  const contentClasses =
    layout === 'grid'
      ? 'flex-1 min-w-0 flex flex-col justify-center'
      : 'flex-1 min-w-0 flex flex-col justify-center';

  const titleClasses =
    layout === 'grid'
      ? 'font-medium text-sm leading-tight text-card-foreground truncate group-hover:text-primary transition-colors'
      : 'font-medium text-sm leading-tight text-card-foreground truncate group-hover:text-primary transition-colors';

  return (
    <div
      className={`${containerClasses} ${isDeleted ? 'opacity-50' : ''} ${!isDeleted ? 'cursor-pointer' : ''}`}
      onClick={() => !isDeleted && onPlay(video)}
    >
      {layout === 'grid' ? (
        // Grid Layout (horizontal with small thumbnail)
        <>
          {/* Thumbnail */}
          <div className={thumbnailClasses}>
            {hideThumbnail ? (
              <div className="w-full h-full bg-muted/20" />
            ) : details?.thumbnail ? (
              <img
                src={details.thumbnail}
                alt={details.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                }}
              />
            ) : loadError ? (
              <div className="w-full h-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive/60" />
              </div>
            ) : (
              <div className="w-full h-full bg-muted/20" />
            )}
          </div>

          {/* Content */}
          <div className={contentClasses}>
            <div className="">
              {hideTitle ? (
                <div className="h-4 bg-muted/20 rounded" />
              ) : details?.title ? (
                <h3 className={titleClasses}>{details.title}</h3>
              ) : (
                <div className="h-4 bg-muted/20 rounded" />
              )}

              {/* Video ID */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-mono text-muted-foreground truncate">
                  {video.id}
                </span>
                {isDeleted && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-destructive/20 text-destructive rounded">
                    Deleted
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        // List Layout
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className={thumbnailClasses}>
            {hideThumbnail ? (
              <div className="w-full h-full bg-muted/20" />
            ) : details?.thumbnail ? (
              <img
                src={details.thumbnail}
                alt={details.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                }}
              />
            ) : loadError ? (
              <div className="w-full h-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive/60" />
              </div>
            ) : (
              <div className="w-full h-full bg-muted/20" />
            )}
          </div>

          {/* Content */}
          <div className={contentClasses}>
            <div className="">
              {hideTitle ? (
                <div className="h-4 bg-muted/20 rounded" />
              ) : details?.title ? (
                <h3 className={titleClasses}>{details.title}</h3>
              ) : (
                <div className="h-4 bg-muted/20 rounded" />
              )}

              {/* Video ID */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-mono text-muted-foreground truncate">
                  {video.id}
                </span>
                {isDeleted && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-destructive/20 text-destructive rounded">
                    Deleted
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
