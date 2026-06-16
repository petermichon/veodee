import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Video, Playlist } from '@/types/index';

const PLAYLISTS_KEY = 'playlists';
const ACTIVE_KEY = 'activePlaylistId';
const STORAGE_VERSION = 2;

interface VideoContextType {
  playlists: Playlist[];
  activePlaylistId: string;
  videos: Video[];
  setActivePlaylist: (id: string) => void;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  createBlankPlaylist: (name: string) => void;
  addVideo: (video: Video) => void;
  removeVideo: (videoId: string) => void;
  reorderVideos: (fromIndex: number, toIndex: number) => void;
  resetToDefaults: () => void;
  exportLibrary: () => void;
  importLibrary: (data: any, name: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const DEFAULT_PLAYLIST_ID = 'default';

const makeDefaultPlaylists = (): Playlist[] => [
  {
    id: DEFAULT_PLAYLIST_ID,
    name: 'Library',
    videos: [
      { id: 'd_xyD3nNQuo' },
      { id: 'OdYsO1FAFQk' },
      { id: 'hVvEISFw9w0' },
    ],
  },
];

const savePlaylists = (playlists: Playlist[]) => {
  localStorage.setItem(
    PLAYLISTS_KEY,
    JSON.stringify({ version: STORAGE_VERSION, playlists })
  );
};

const loadPlaylists = (): { playlists: Playlist[]; activeId: string } => {
  const stored = localStorage.getItem(PLAYLISTS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (
        parsed.version === STORAGE_VERSION &&
        Array.isArray(parsed.playlists)
      ) {
        const activeId =
          localStorage.getItem(ACTIVE_KEY) ||
          parsed.playlists[0]?.id ||
          DEFAULT_PLAYLIST_ID;
        return { playlists: parsed.playlists, activeId };
      }
    } catch {
      /* fall through */
    }
  }

  // Migrate from old single-library format (version 1)
  const oldStored = localStorage.getItem('videoLibrary');
  if (oldStored) {
    try {
      const oldParsed = JSON.parse(oldStored);
      if (oldParsed.version === 1 && Array.isArray(oldParsed.videos)) {
        const migrated: Playlist[] = [
          {
            id: DEFAULT_PLAYLIST_ID,
            name: 'Library',
            videos: oldParsed.videos,
          },
        ];
        savePlaylists(migrated);
        localStorage.removeItem('videoLibrary');
        return { playlists: migrated, activeId: DEFAULT_PLAYLIST_ID };
      }
    } catch {
      /* fall through */
    }
  }

  // Migrate from old tag-based format
  const tagStorage = localStorage.getItem('tagStorage');
  if (tagStorage) {
    try {
      const oldData = JSON.parse(tagStorage);
      const videos: Video[] = [];
      if (oldData.groups && Array.isArray(oldData.groups)) {
        oldData.groups.forEach((group: any) => {
          if (group.videos && Array.isArray(group.videos)) {
            group.videos.forEach((video: any) => {
              if (!video.deleted) videos.push({ id: video.id });
            });
          }
        });
      }
      const migrated: Playlist[] = [
        { id: DEFAULT_PLAYLIST_ID, name: 'Library', videos },
      ];
      savePlaylists(migrated);
      localStorage.removeItem('tagStorage');
      return { playlists: migrated, activeId: DEFAULT_PLAYLIST_ID };
    } catch {
      /* fall through */
    }
  }

  const defaults = makeDefaultPlaylists();
  savePlaylists(defaults);
  return { playlists: defaults, activeId: DEFAULT_PLAYLIST_ID };
};

const _initialState = loadPlaylists();

export function VideoProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(
    _initialState.playlists
  );
  const [activePlaylistId, setActivePlaylistId] = useState<string>(
    _initialState.activeId
  );

  const activePlaylist =
    playlists.find((p) => p.id === activePlaylistId) ?? playlists[0];
  const videos = activePlaylist?.videos ?? [];

  const updatePlaylists = useCallback((updated: Playlist[]) => {
    setPlaylists(updated);
    savePlaylists(updated);
  }, []);

  const setActivePlaylist = useCallback((id: string) => {
    setActivePlaylistId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const addPlaylist = useCallback(
    (playlist: Playlist) => {
      updatePlaylists([...playlists, playlist]);
    },
    [playlists, updatePlaylists]
  );

  const removePlaylist = useCallback(
    (id: string) => {
      const updated = playlists.filter((p) => p.id !== id);
      updatePlaylists(updated);
      if (activePlaylistId === id) {
        const newActive = updated[0]?.id ?? '';
        setActivePlaylist(newActive);
      }
    },
    [playlists, activePlaylistId, updatePlaylists, setActivePlaylist]
  );

  const renamePlaylist = useCallback(
    (id: string, name: string) => {
      updatePlaylists(playlists.map((p) => (p.id === id ? { ...p, name } : p)));
    },
    [playlists, updatePlaylists]
  );

  const createBlankPlaylist = useCallback(
    (name: string) => {
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        name,
        videos: [],
      };
      updatePlaylists([...playlists, newPlaylist]);
      setActivePlaylist(newPlaylist.id);
    },
    [playlists, updatePlaylists, setActivePlaylist]
  );

  const patchActiveVideos = useCallback(
    (newVideos: Video[]) => {
      const updated = playlists.map((p) =>
        p.id === activePlaylist?.id ? { ...p, videos: newVideos } : p
      );
      updatePlaylists(updated);
    },
    [playlists, activePlaylist, updatePlaylists]
  );

  const addVideo = useCallback(
    (videoData: Video) => {
      patchActiveVideos([...videos, videoData]);
    },
    [videos, patchActiveVideos]
  );

  const removeVideo = useCallback(
    (videoId: string) => {
      patchActiveVideos(videos.filter((v) => v.id !== videoId));
    },
    [videos, patchActiveVideos]
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
      patchActiveVideos(reordered);
    },
    [videos, patchActiveVideos]
  );

  const resetToDefaults = useCallback(() => {
    const defaults = makeDefaultPlaylists();
    updatePlaylists(defaults);
    setActivePlaylist(DEFAULT_PLAYLIST_ID);
  }, [updatePlaylists, setActivePlaylist]);

  const exportLibrary = useCallback(() => {
    const exportData = {
      version: 1,
      name: activePlaylist?.name ?? 'playlist',
      videos,
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    link.download = `veodee-export-${year}-${month}-${day}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [videos, activePlaylist]);

  const importLibrary = useCallback(
    (data: any, name: string) => {
      const importedVideos: Video[] = data.videos || [];
      const playlistName = data.name || name;
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        name: playlistName,
        videos: importedVideos,
      };
      const updated = [...playlists, newPlaylist];
      updatePlaylists(updated);
      setActivePlaylist(newPlaylist.id);
    },
    [playlists, updatePlaylists, setActivePlaylist]
  );

  return (
    <VideoContext.Provider
      value={{
        playlists,
        activePlaylistId,
        videos,
        setActivePlaylist,
        addPlaylist,
        removePlaylist,
        renamePlaylist,
        createBlankPlaylist,
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
