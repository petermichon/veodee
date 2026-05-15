import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Video, Tag, TagGroup, TagStorage } from '@/types/index';

const STORAGE_VERSION = 2;
const getCanonicalKey = (tags: string[]): string => {
  return tags.sort().join(',');
};

// Helper to derive videos from groups (excludes deleted videos)
const deriveVideosFromGroups = (groups: TagGroup[]): Video[] => {
  const videos: Video[] = [];
  groups.forEach((group) => {
    group.videos.forEach((video) => {
      if (!video.deleted) {
        videos.push({ id: video.id, tags: group.tags });
      }
    });
  });
  return videos;
};

interface TagContextType {
  videos: Video[];
  tags: Tag[];
  groups: TagGroup[];
  selectedTags: string[];
  addVideo: (video: Video) => void;
  updateVideo: (videoId: string, updates: Partial<Video>) => void;
  removeVideo: (videoId: string) => void;
  restoreVideo: (videoId: string) => void;
  addTag: (tag: Tag) => void;
  removeTag: (tagName: string) => void;
  setSelectedTags: (tags: string[]) => void;
  getVideosByTags: (tags: string[]) => Video[];
  reorderVideos: (fromIndex: number, toIndex: number) => void;
  resetToDefaults: () => void;
  exportLibrary: () => void;
  importLibrary: (
    data: TagStorage,
    mergeStrategy: 'replace' | 'append'
  ) => void;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

const initializeDefaultStorage = (): TagStorage => {
  const groups: TagGroup[] = [];
  const defaultTags: Tag[] = [];

  const storage: TagStorage = {
    version: STORAGE_VERSION,
    groups,
    tags: defaultTags,
  };

  localStorage.setItem('tagStorage', JSON.stringify(storage));
  return storage;
};

const migrateFromOldFormat = (oldVideos: any[]): TagStorage => {
  const groups: TagGroup[] = [];

  // Get tags from separate localStorage during migration
  const storedTags = localStorage.getItem('tags');
  let defaultTags: Tag[] = [];
  if (storedTags) {
    try {
      defaultTags = JSON.parse(storedTags).map((tag: any) => ({
        ...tag,
      }));
    } catch {
      defaultTags = [];
    }
  }

  const groupedVideos = new Map<string, string[]>();
  oldVideos.forEach((video: any) => {
    const tags = video.tags || [];
    const key = getCanonicalKey(tags);
    if (!groupedVideos.has(key)) {
      groupedVideos.set(key, []);
    }
    groupedVideos.get(key)!.push(video.id);
  });

  groupedVideos.forEach((videoIds, key) => {
    const tags = key.split(',').filter((t) => t);
    groups.push({ tags, videos: videoIds.map((id) => ({ id })) });
  });

  const storage: TagStorage = {
    version: STORAGE_VERSION,
    groups,
    tags: defaultTags,
  };

  localStorage.setItem('tagStorage', JSON.stringify(storage));
  localStorage.removeItem('videos');
  localStorage.removeItem('tags');
  return storage;
};

const migrateFromV1 = (oldStorage: any): TagStorage => {
  // Migrate from videoIds (array of strings) to videos (array of objects with id)
  const migratedGroups = oldStorage.groups.map((group: any) => {
    if (group.videoIds) {
      // Old format: convert videoIds to videos
      return {
        tags: group.tags,
        videos: group.videoIds.map((id: string) => ({ id })),
      };
    }
    // Already in new format
    return group;
  });

  const migratedStorage: TagStorage = {
    version: STORAGE_VERSION,
    groups: migratedGroups,
    tags: oldStorage.tags,
  };

  localStorage.setItem('tagStorage', JSON.stringify(migratedStorage));
  return migratedStorage;
};

const migrateFromV0 = (): TagStorage => {
  return initializeDefaultStorage();
};

export function TagProvider({ children }: { children: ReactNode }) {
  const [tagStorage, setTagStorage] = useState<TagStorage>(() => {
    const stored = localStorage.getItem('tagStorage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any;
        if (parsed.version === STORAGE_VERSION) {
          return parsed;
        }
        // Migration needed for older versions
        if (parsed.version === 1) {
          return migrateFromV1(parsed);
        }
        return migrateFromV0();
      } catch {
        return initializeDefaultStorage();
      }
    }
    // Try to migrate from old format
    const oldVideos = localStorage.getItem('videos');
    if (oldVideos) {
      try {
        return migrateFromOldFormat(JSON.parse(oldVideos));
      } catch {
        return initializeDefaultStorage();
      }
    }
    return initializeDefaultStorage();
  });

  const [tags, setTags] = useState<Tag[]>(() => {
    // Get tags from tagStorage
    if (tagStorage.tags && tagStorage.tags.length > 0) {
      return tagStorage.tags.map((tag: any) => ({
        ...tag,
      }));
    }

    return [];
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const addVideo = useCallback(
    (videoData: Video) => {
      const key = getCanonicalKey(videoData.tags);

      const updatedGroups = [...tagStorage.groups];
      const existingGroupIndex = updatedGroups.findIndex(
        (g) => getCanonicalKey(g.tags) === key
      );

      if (existingGroupIndex >= 0) {
        updatedGroups[existingGroupIndex] = {
          ...updatedGroups[existingGroupIndex],
          videos: [
            ...updatedGroups[existingGroupIndex].videos,
            { id: videoData.id },
          ],
        };
      } else {
        updatedGroups.push({
          tags: videoData.tags,
          videos: [{ id: videoData.id }],
        });
      }

      const updatedStorage: TagStorage = {
        version: STORAGE_VERSION,
        groups: updatedGroups,
        tags: tagStorage.tags,
      };

      setTagStorage(updatedStorage);
      localStorage.setItem('tagStorage', JSON.stringify(updatedStorage));
    },
    [tagStorage]
  );

  const updateVideo = useCallback(
    (videoId: string, updates: Partial<Video>) => {
      if (!updates.tags) {
        // If not updating tags, we don't need to do anything since videos are derived from groups
        // The video ID won't change, so no group changes needed
        return;
      }

      // Find the group containing this video
      const groupIndex = tagStorage.groups.findIndex((g) =>
        g.videos.some((v) => v.id === videoId)
      );
      if (groupIndex < 0) return;

      const oldGroup = tagStorage.groups[groupIndex];
      const oldTags = oldGroup.tags;
      const newTags = updates.tags;
      const oldKey = getCanonicalKey(oldTags);
      const newKey = getCanonicalKey(newTags);

      if (oldKey === newKey) return;

      const updatedGroups = [...tagStorage.groups];

      const oldGroupIndex = updatedGroups.findIndex(
        (g) => getCanonicalKey(g.tags) === oldKey
      );
      if (oldGroupIndex >= 0) {
        const oldGroup = updatedGroups[oldGroupIndex];
        const newVideos = oldGroup.videos.filter((v) => v.id !== videoId);

        if (newVideos.length === 0) {
          updatedGroups.splice(oldGroupIndex, 1);
        } else {
          updatedGroups[oldGroupIndex] = { ...oldGroup, videos: newVideos };
        }
      }

      const newGroupIndex = updatedGroups.findIndex(
        (g) => getCanonicalKey(g.tags) === newKey
      );
      if (newGroupIndex >= 0) {
        updatedGroups[newGroupIndex] = {
          ...updatedGroups[newGroupIndex],
          videos: [...updatedGroups[newGroupIndex].videos, { id: videoId }],
        };
      } else {
        updatedGroups.push({
          tags: newTags,
          videos: [{ id: videoId }],
        });
      }

      const updatedStorage: TagStorage = {
        version: STORAGE_VERSION,
        groups: updatedGroups,
        tags: tagStorage.tags,
      };

      setTagStorage(updatedStorage);
      localStorage.setItem('tagStorage', JSON.stringify(updatedStorage));
    },
    [tagStorage]
  );

  const removeVideo = useCallback(
    (videoId: string) => {
      console.log('removeVideo called for:', videoId);
      const updatedGroups = tagStorage.groups.map((group) => {
        const videoIndex = group.videos.findIndex((v) => v.id === videoId);
        if (videoIndex >= 0) {
          const updatedVideos = [...group.videos];
          updatedVideos[videoIndex] = {
            ...updatedVideos[videoIndex],
            deleted: true,
            deletedAt: Date.now(),
          };
          return { ...group, videos: updatedVideos };
        }
        return group;
      });

      console.log('Updated groups after delete:', updatedGroups.map(g => ({ tags: g.tags, videos: g.videos.map(v => ({ id: v.id, deleted: v.deleted })) })));
      const updatedStorage: TagStorage = {
        version: STORAGE_VERSION,
        groups: updatedGroups,
        tags: tagStorage.tags,
      };

      setTagStorage(updatedStorage);
      localStorage.setItem('tagStorage', JSON.stringify(updatedStorage));
    },
    [tagStorage]
  );

  const restoreVideo = useCallback(
    (videoId: string) => {
      const updatedGroups = tagStorage.groups.map((group) => {
        const videoIndex = group.videos.findIndex((v) => v.id === videoId);
        if (videoIndex >= 0) {
          const updatedVideos = [...group.videos];
          const { deleted: _deleted, deletedAt: _deletedAt, ...rest } = updatedVideos[videoIndex];
          updatedVideos[videoIndex] = rest;
          return { ...group, videos: updatedVideos };
        }
        return group;
      });

      const updatedStorage: TagStorage = {
        version: STORAGE_VERSION,
        groups: updatedGroups,
        tags: tagStorage.tags,
      };

      setTagStorage(updatedStorage);
      localStorage.setItem('tagStorage', JSON.stringify(updatedStorage));
    },
    [tagStorage]
  );

  const addTag = useCallback(
    (tagData: Tag) => {
      const updatedTags = [...tags, tagData];
      setTags(updatedTags);

      const updatedStorage: TagStorage = {
        ...tagStorage,
        tags: updatedTags,
      };
      setTagStorage(updatedStorage);
      localStorage.setItem('tagStorage', JSON.stringify(updatedStorage));
    },
    [tags, tagStorage]
  );

  const removeTag = useCallback(
    (tagName: string) => {
      const updatedTags = tags.filter((tag) => tag.name !== tagName);
      setTags(updatedTags);

      const updatedGroups = [...tagStorage.groups];

      // Find all groups that contain this tag and remove it
      for (let i = updatedGroups.length - 1; i >= 0; i--) {
        const group = updatedGroups[i];
        if (group.tags.includes(tagName)) {
          const newTags = group.tags.filter((t) => t !== tagName);

          if (newTags.length === 0) {
            // Remove the group entirely if it has no tags left
            updatedGroups.splice(i, 1);
          } else {
            const newKey = getCanonicalKey(newTags);
            const existingGroupIndex = updatedGroups.findIndex(
              (g, idx) => getCanonicalKey(g.tags) === newKey && idx !== i
            );

            if (existingGroupIndex >= 0) {
              // Merge with existing group
              const existingGroup = updatedGroups[existingGroupIndex];
              updatedGroups[existingGroupIndex] = {
                ...existingGroup,
                videos: [...existingGroup.videos, ...group.videos],
              };
              updatedGroups.splice(i, 1);
            } else {
              // Just update the group's tags
              updatedGroups[i] = { ...group, tags: newTags };
            }
          }
        }
      }

      const updatedStorage: TagStorage = {
        version: STORAGE_VERSION,
        groups: updatedGroups,
        tags: updatedTags,
      };

      setTagStorage(updatedStorage);
      localStorage.setItem('tagStorage', JSON.stringify(updatedStorage));
    },
    [tags, tagStorage]
  );

  const getVideosByTags = useCallback(
    (tagNames: string[]) => {
      if (tagNames.length === 0) {
        return deriveVideosFromGroups(tagStorage.groups);
      }

      // Filter groups that contain all selected tags
      const matchingGroups = tagStorage.groups.filter((group) => {
        return tagNames.every((tagName) => group.tags.includes(tagName));
      });

      const videos: Video[] = [];
      matchingGroups.forEach((group) => {
        group.videos.forEach((video) => {
          videos.push({ id: video.id, tags: group.tags });
        });
      });
      return videos;
    },
    [tagStorage]
  );

  const reorderVideos = useCallback(
    (fromIndex: number, toIndex: number) => {
      // Build flat ordered list of {id, tags} from groups
      const flat: { id: string; tags: string[] }[] = [];
      tagStorage.groups.forEach((group) => {
        group.videos.forEach((v) => {
          flat.push({ id: v.id, tags: group.tags });
        });
      });

      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || toIndex >= flat.length) return;

      const reordered = [...flat];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      // Rebuild groups preserving tags per video, maintaining group order
      const newGroupsMap = new Map<string, { tags: string[]; videos: { id: string }[] }>();
      const groupOrder: string[] = [];
      reordered.forEach(({ id, tags }) => {
        const key = getCanonicalKey([...tags]);
        if (!newGroupsMap.has(key)) {
          newGroupsMap.set(key, { tags, videos: [] });
          groupOrder.push(key);
        }
        newGroupsMap.get(key)!.videos.push({ id });
      });

      const updatedGroups = groupOrder.map((key) => newGroupsMap.get(key)!);

      const updatedStorage: TagStorage = {
        version: STORAGE_VERSION,
        groups: updatedGroups,
        tags: tagStorage.tags,
      };

      setTagStorage(updatedStorage);
      localStorage.setItem('tagStorage', JSON.stringify(updatedStorage));
    },
    [tagStorage]
  );

  const resetToDefaults = useCallback(() => {
    const groups: TagGroup[] = [];
    const defaultTags: Tag[] = [];

    const newStorage: TagStorage = {
      version: STORAGE_VERSION,
      groups,
      tags: defaultTags,
    };

    setTagStorage(newStorage);
    setTags(defaultTags);
    setSelectedTags([]);
    localStorage.setItem('tagStorage', JSON.stringify(newStorage));
    localStorage.removeItem('tags');
    localStorage.removeItem('videos');
  }, []);

  const exportLibrary = useCallback(() => {
    // Export without deleted videos - filter out deleted videos from each group
    const exportGroups = tagStorage.groups.map((group) => ({
      ...group,
      videos: group.videos.filter((v) => !v.deleted),
    }));

    const exportData: TagStorage = {
      version: tagStorage.version,
      groups: exportGroups,
      tags: tagStorage.tags,
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
  }, [tagStorage]);

  const importLibrary = useCallback(
    (data: TagStorage, mergeStrategy: 'replace' | 'append') => {
      // Strip IDs from imported groups to match current structure
      // Also handle migration from old videoIds format to new videos format
      const cleanedGroups = (data.groups || []).map((group: any) => {
        if (group.videoIds) {
          // Migrate from old format
          return {
            tags: group.tags,
            videos: group.videoIds.map((id: string) => ({ id })),
          };
        }
        return { tags: group.tags, videos: group.videos };
      });

      if (mergeStrategy === 'replace') {
        const validatedData: TagStorage = {
          version: data.version || STORAGE_VERSION,
          groups: cleanedGroups,
          tags: data.tags || [],
        };
        setTagStorage(validatedData);
        setTags(validatedData.tags);
        localStorage.setItem('tagStorage', JSON.stringify(validatedData));
      } else {
        // Merge strategy: combine tags, groups, and videoIds
        const existingTags = new Map(tags.map((t) => [t.name, t]));
        const existingGroups = new Map(
          tagStorage.groups.map((g) => [getCanonicalKey(g.tags), g])
        );

        // Merge tags
        const mergedTags = [...tags];
        data.tags?.forEach((tag) => {
          if (!existingTags.has(tag.name)) {
            mergedTags.push(tag);
            existingTags.set(tag.name, tag);
          }
        });

        // Merge groups
        const mergedGroups = [...tagStorage.groups];
        cleanedGroups.forEach((group) => {
          const key = getCanonicalKey(group.tags);
          if (existingGroups.has(key)) {
            // Merge videos
            const existingGroup = existingGroups.get(key)!;
            const existingVideoIds = new Set(
              existingGroup.videos.map((v) => v.id)
            );
            group.videos.forEach((v) => existingVideoIds.add(v.id));
            existingGroup.videos = Array.from(existingVideoIds).map((id) => ({
              id,
            }));
          } else {
            mergedGroups.push(group);
            existingGroups.set(key, group);
          }
        });

        const mergedStorage: TagStorage = {
          version: STORAGE_VERSION,
          groups: mergedGroups,
          tags: mergedTags,
        };

        setTagStorage(mergedStorage);
        setTags(mergedTags);
        localStorage.setItem('tagStorage', JSON.stringify(mergedStorage));
      }
    },
    [tags, tagStorage]
  );

  return (
    <TagContext.Provider
      value={{
        videos: deriveVideosFromGroups(tagStorage.groups),
        tags,
        groups: tagStorage.groups,
        selectedTags,
        addVideo,
        updateVideo,
        removeVideo,
        restoreVideo,
        addTag,
        removeTag,
        setSelectedTags,
        getVideosByTags,
        reorderVideos,
        resetToDefaults,
        exportLibrary,
        importLibrary,
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

export function useTag() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTag must be used within a TagProvider');
  }
  return context;
}
