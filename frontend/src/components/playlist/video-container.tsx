import { memo, useState, useEffect, useRef } from 'react';
import { VideoItem } from './video-item';
import { YouTubeAPI, type YouTubeVideoDetails } from '@/services/youtube-api';
import type { Video } from '@/types/index';

interface VideoContainerProps {
  videos: Video[];
  onPlay: (video: Video) => void;
  onRemove?: (videoId: string) => void;
  onUpdate?: (videoId: string, updates: Partial<Video>) => void;
  loadThumbnails?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
  layout?: 'grid' | 'list';
  enableMaxresThumbnails?: boolean;
  onSetBackground?: (videoId: string) => void;
  currentBackgroundVideoId?: string | null;
  ratio?: '16:9' | '1:1';
}

export const VideoContainer = memo(function VideoContainer({
  videos,
  onPlay,
  onRemove,
  onUpdate,
  loadThumbnails = true,
  onLoadingChange,
  layout = 'grid',
  enableMaxresThumbnails = true,
  onSetBackground,
  currentBackgroundVideoId,
  ratio = '16:9',
}: VideoContainerProps) {
  const [details, setDetails] = useState<Record<string, YouTubeVideoDetails>>(
    {}
  );
  const [fetchingIds, setFetchingIds] = useState<Set<string>>(new Set());
  const fetchedOrFetching = useRef<Set<string>>(new Set());

  const [youtubePermission, setYoutubePermission] = useState(
    () => localStorage.getItem('youtube-permission') !== 'false'
  );

  // Listen for YouTube permission changes
  useEffect(() => {
    const handlePermissionGranted = () => {
      setYoutubePermission(true);
      // Reset tracking so videos get re-fetched with real data
      fetchedOrFetching.current.clear();
      setDetails({});
    };
    const handlePermissionRevoked = () => {
      setYoutubePermission(false);
      fetchedOrFetching.current.clear();
      setDetails({});
    };
    window.addEventListener(
      'youtube-permission-granted',
      handlePermissionGranted
    );
    window.addEventListener(
      'youtube-permission-revoked',
      handlePermissionRevoked
    );
    return () => {
      window.removeEventListener(
        'youtube-permission-granted',
        handlePermissionGranted
      );
      window.removeEventListener(
        'youtube-permission-revoked',
        handlePermissionRevoked
      );
    };
  }, []);

  // Fetch details for all videos (YouTubeAPI rate-limits internally)
  useEffect(() => {
    const toFetch = videos.filter((v) => !fetchedOrFetching.current.has(v.id));
    if (toFetch.length === 0) return;

    const batchIds = new Set(toFetch.map((v) => v.id));

    // Mark as fetching synchronously via ref to prevent duplicate fetches
    batchIds.forEach((id) => fetchedOrFetching.current.add(id));

    if (!youtubePermission) {
      // No permission: populate fallback details immediately without querying YouTube
      setDetails((prev) => {
        const next = { ...prev };
        toFetch.forEach((v) => {
          next[v.id] = {
            id: v.id,
            title: v.id,
            url: `https://www.youtube.com/watch?v=${v.id}`,
            thumbnail: '',
            duration: '0:00',
          };
        });
        return next;
      });
      return;
    }

    setFetchingIds((prev) => new Set([...prev, ...batchIds]));

    // Fetch all in parallel (the API queues and rate-limits requests)
    Promise.all(
      toFetch.map((v) => YouTubeAPI.getVideoDetails(v.id).catch(() => null))
    ).then((results) => {
      setDetails((prev) => {
        const next = { ...prev };
        toFetch.forEach((v, i) => {
          if (results[i]) next[v.id] = results[i]!;
        });
        return next;
      });
      setFetchingIds((prev) => {
        const next = new Set(prev);
        batchIds.forEach((id) => next.delete(id));
        return next;
      });
    });
  }, [videos, youtubePermission]);

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(fetchingIds.size > 0);
  }, [fetchingIds, onLoadingChange]);

  return (
    <div className="space-y-6 relative">
      <div
        className={
          layout === 'list'
            ? 'flex flex-col gap-2'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4'
        }
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className="rounded-xl transition-all duration-150"
          >
            <VideoItem
              video={video}
              videoDetails={details[video.id]}
              layout={layout === 'list' ? 'list' : 'grid'}
              onPlay={onPlay}
              onRemove={onRemove}
              onUpdate={onUpdate}
              loadThumbnails={loadThumbnails}
              enableMaxresThumbnails={enableMaxresThumbnails}
              onSetBackground={onSetBackground}
              currentBackgroundVideoId={currentBackgroundVideoId}
              ratio={ratio}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
