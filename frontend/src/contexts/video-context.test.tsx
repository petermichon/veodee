import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';

async function setup() {
  vi.resetModules();
  localStorage.clear();
  const mod = await import('./video-context');
  const { renderHook, act } = await import('@testing-library/react');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <mod.VideoProvider>{children}</mod.VideoProvider>
  );
  const { result } = renderHook(() => mod.useVideo(), { wrapper });
  return { mod, result, act };
}

beforeEach(() => {
  localStorage.clear();
});

describe('useVideo playlists', () => {
  it('starts with a default playlist containing sample videos', async () => {
    const { result } = await setup();
    expect(result.current.playlists).toHaveLength(1);
    expect(result.current.videos.length).toBeGreaterThan(0);
  });

  it('adds a video to the active playlist', async () => {
    const { result, act } = await setup();
    act(() => result.current.addVideo({ id: 'abc12345678' }));
    expect(result.current.videos).toContainEqual({ id: 'abc12345678' });
  });

  it('removes a video from the active playlist', async () => {
    const { result, act } = await setup();
    const target = result.current.videos[0].id;
    act(() => result.current.removeVideo(target));
    expect(result.current.videos.map((v) => v.id)).not.toContain(target);
  });

  it('keeps at least one playlist when the last one is removed', async () => {
    const { result, act } = await setup();
    act(() => result.current.removePlaylist(result.current.activePlaylistId));
    expect(result.current.playlists.length).toBeGreaterThanOrEqual(1);
    expect(result.current.activePlaylist).not.toBeNull();
  });

  it('still adds videos after every playlist has been removed', async () => {
    const { result, act } = await setup();
    act(() => result.current.removePlaylist(result.current.activePlaylistId));
    act(() => result.current.addVideo({ id: 'newvideo123' }));
    expect(result.current.activePlaylist?.videos).toContainEqual({
      id: 'newvideo123',
    });
  });

  it('persists added videos to localStorage', async () => {
    const { result, act } = await setup();
    act(() => result.current.addVideo({ id: 'persisted12' }));
    const saved = JSON.parse(localStorage.getItem('playlists')!);
    const videos = saved.playlists.flatMap(
      (p: { videos: Array<{ id: string }> }) => p.videos
    );
    expect(videos).toContainEqual({ id: 'persisted12' });
  });
});

describe('library export/import', () => {
  it('builds export data with an explicit version and defaults', async () => {
    const { mod, result } = await setup();
    const data = mod.buildExportData(
      result.current.activePlaylist,
      result.current.videos
    );
    expect(data.version).toBe(mod.EXPORT_VERSION);
    expect(data.videos).toEqual(result.current.videos);
    expect(data.name).toBe(result.current.activePlaylist?.name);
  });

  it('defaults a missing playlist name and ratio', async () => {
    const { mod, result } = await setup();
    const data = mod.buildExportData(undefined, result.current.videos);
    expect(data.name).toBe('playlist');
    expect(data.ratio).toBe('16:9');
  });

  it('round-trips exported data through importLibrary', async () => {
    const { mod, result, act } = await setup();
    const data = mod.buildExportData(
      result.current.activePlaylist,
      result.current.videos
    );
    act(() => result.current.importLibrary(data, 'ignored'));
    expect(result.current.activePlaylist?.name).toBe(data.name);
    expect(result.current.activePlaylist?.ratio).toBe(data.ratio);
    expect(result.current.videos).toEqual(data.videos);
  });

  it('falls back to the provided name and 16:9 for malformed imports', async () => {
    const { result, act } = await setup();
    act(() =>
      result.current.importLibrary(
        { videos: [{ id: 'imported123' }], ratio: 'bogus' },
        'My Import'
      )
    );
    expect(result.current.activePlaylist?.name).toBe('My Import');
    expect(result.current.activePlaylist?.ratio).toBe('16:9');
    expect(result.current.videos).toContainEqual({ id: 'imported123' });
  });
});
