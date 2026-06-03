import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Video } from '@/types/index';

const STORAGE_KEY = 'videoLibrary';
const STORAGE_VERSION = 1;

interface VideoContextType {
  videos: Video[];
  addVideo: (video: Video) => void;
  removeVideo: (videoId: string) => void;
  reorderVideos: (fromIndex: number, toIndex: number) => void;
  resetToDefaults: () => void;
  exportLibrary: () => void;
  importLibrary: (data: Video[], mergeStrategy: 'replace' | 'append') => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const initializeDefaultStorage = (): Video[] => {
  const defaultVideos: Video[] = [
    { id: 'd_xyD3nNQuo' },
    { id: 'OdYsO1FAFQk' },
    { id: 'hVvEISFw9w0' },
  ];

  const storage = {
    version: STORAGE_VERSION,
    videos: defaultVideos,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  return defaultVideos;
};

const migrateFromOldFormat = (oldData: any): Video[] => {
  // Migrate from old tag-based format to flat list
  let videos: Video[] = [];

  if (oldData.groups && Array.isArray(oldData.groups)) {
    oldData.groups.forEach((group: any) => {
      if (group.videos && Array.isArray(group.videos)) {
        group.videos.forEach((video: any) => {
          if (!video.deleted) {
            videos.push({ id: video.id });
          }
        });
      }
    });
  }

  const storage = {
    version: STORAGE_VERSION,
    videos,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  localStorage.removeItem('tagStorage');
  return videos;
};

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === STORAGE_VERSION) {
          return parsed.videos;
        }
        // Migration needed for older versions
        return initializeDefaultStorage();
      } catch {
        return initializeDefaultStorage();
      }
    }
    // Try to migrate from old tag-based format
    const oldStorage = localStorage.getItem('tagStorage');
    if (oldStorage) {
      try {
        return migrateFromOldFormat(JSON.parse(oldStorage));
      } catch {
        return initializeDefaultStorage();
      }
    }
    return initializeDefaultStorage();
  });

  const addVideo = useCallback(
    (videoData: Video) => {
      const updatedVideos = [...videos, videoData];
      setVideos(updatedVideos);
      const storage = {
        version: STORAGE_VERSION,
        videos: updatedVideos,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    },
    [videos]
  );

  const removeVideo = useCallback(
    (videoId: string) => {
      const updatedVideos = videos.filter((v) => v.id !== videoId);
      setVideos(updatedVideos);
      const storage = {
        version: STORAGE_VERSION,
        videos: updatedVideos,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    },
    [videos]
  );

  const reorderVideos = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        toIndex >= videos.length
      )
        return;

      const reordered = [...videos];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      setVideos(reordered);
      const storage = {
        version: STORAGE_VERSION,
        videos: reordered,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    },
    [videos]
  );

  const resetToDefaults = useCallback(() => {
    const defaultVideos = initializeDefaultStorage();
    setVideos(defaultVideos);
  }, []);

  const exportLibrary = useCallback(() => {
    const exportData = {
      version: STORAGE_VERSION,
      videos,
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veodee-library-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [videos]);

  const importLibrary = useCallback(
    (data: any, mergeStrategy: 'replace' | 'append') => {
      const importedVideos = data.videos || [];

      if (mergeStrategy === 'replace') {
        setVideos(importedVideos);
        const storage = {
          version: STORAGE_VERSION,
          videos: importedVideos,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
      } else {
        // Merge strategy: combine video lists, avoiding duplicates
        const existingIds = new Set(videos.map((v) => v.id));
        const newVideos = importedVideos.filter(
          (v: Video) => !existingIds.has(v.id)
        );
        const mergedVideos = [...videos, ...newVideos];
        setVideos(mergedVideos);
        const storage = {
          version: STORAGE_VERSION,
          videos: mergedVideos,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
      }
    },
    [videos]
  );

  return (
    <VideoContext.Provider
      value={{
        videos,
        addVideo,
        removeVideo,
        reorderVideos,
        resetToDefaults,
        exportLibrary,
        importLibrary,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}
