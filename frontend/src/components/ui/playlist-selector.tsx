import { useRef, useState, useEffect, useCallback } from 'react';
import { Pencil, Plus, Upload, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideo } from '@/contexts/video-context';

interface PlaylistSelectorProps {
  onImportClick: () => void;
}

interface MenuState {
  playlistId: string;
  x: number;
  y: number;
}

interface AddMenuState {
  x: number;
  y: number;
}

export function PlaylistSelector({ onImportClick }: PlaylistSelectorProps) {
  const {
    playlists,
    activePlaylistId,
    setActivePlaylist,
    removePlaylist,
    renamePlaylist,
    createBlankPlaylist,
    exportLibrary,
  } = useVideo();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [addMenu, setAddMenu] = useState<AddMenuState | null>(null);
  const [renaming, setRenaming] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menu]);

  useEffect(() => {
    if (!addMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node)
      ) {
        setAddMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [addMenu]);

  useEffect(() => {
    if (renaming) {
      setTimeout(() => renameInputRef.current?.focus(), 30);
    }
  }, [renaming]);

  const openMenu = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ playlistId, x: rect.left, y: rect.bottom + 4 });
  };

  const openAddMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setAddMenu({ x: rect.left, y: rect.bottom + 4 });
  };

  const handleImportFromMenu = () => {
    setAddMenu(null);
    onImportClick();
  };

  const handleCreateBlank = () => {
    setAddMenu(null);
    const name = `Playlist ${playlists.length + 1}`;
    createBlankPlaylist(name);
  };

  const handleRename = useCallback(() => {
    if (!menu) return;
    const playlist = playlists.find((p) => p.id === menu.playlistId);
    if (!playlist) return;
    setRenaming({ id: playlist.id, value: playlist.name });
    setMenu(null);
  }, [menu, playlists]);

  const commitRename = useCallback(() => {
    if (!renaming) return;
    const trimmed = renaming.value.trim();
    if (!trimmed) {
      setRenaming(null);
      return;
    }
    renamePlaylist(renaming.id, trimmed);
    setRenaming(null);
  }, [renaming, renamePlaylist]);

  const handleExport = useCallback(() => {
    if (!menu) return;
    if (menu.playlistId !== activePlaylistId) {
      setActivePlaylist(menu.playlistId);
    }
    setMenu(null);
    setTimeout(() => exportLibrary(), 50);
  }, [menu, activePlaylistId, setActivePlaylist, exportLibrary]);

  const handleDelete = useCallback(() => {
    if (!menu) return;
    setDeletePrompt(menu.playlistId);
    setMenu(null);
  }, [menu]);

  const confirmDelete = useCallback(() => {
    if (!deletePrompt) return;
    removePlaylist(deletePrompt);
    setDeletePrompt(null);
  }, [deletePrompt, removePlaylist]);

  return (
    <>
      <div
        ref={scrollRef}
        className="flex items-center gap-0 overflow-x-auto scrollbar-none pb-0.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {playlists.map((playlist) => {
          const isActive = playlist.id === activePlaylistId;
          return (
            <div
              key={playlist.id}
              className={cn(
                'flex-shrink-0 flex items-center gap-0.5 rounded-full transition-colors duration-150',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {renaming?.id === playlist.id ? (
                <input
                  ref={renameInputRef}
                  value={renaming.value}
                  onChange={(e) =>
                    setRenaming({ ...renaming, value: e.target.value })
                  }
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setRenaming(null);
                  }}
                  className={cn(
                    'px-3 py-1 text-sm font-medium bg-transparent border-none outline-none w-32 text-foreground'
                  )}
                />
              ) : (
                <button
                  onClick={() => setActivePlaylist(playlist.id)}
                  className="px-3 py-1 text-sm font-medium bg-transparent border-none cursor-pointer whitespace-nowrap"
                >
                  {playlist.name}
                </button>
              )}
              <button
                onClick={(e) => openMenu(e, playlist.id)}
                className={cn(
                  'flex items-center justify-center h-5 rounded-full border-none cursor-pointer transition-all duration-200 overflow-hidden',
                  'text-muted-foreground/60 hover:text-foreground',
                  isActive
                    ? 'w-5 opacity-100 scale-100'
                    : 'w-0 opacity-0 scale-90 pointer-events-none'
                )}
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        <button
          onClick={openAddMenu}
          className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-foreground transition-colors duration-150 border-none cursor-pointer"
          title="Add playlist"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {menu && (
        <div
          ref={menuRef}
          className="fixed z-[300] min-w-[140px] rounded-lg border border-border bg-card/90 backdrop-blur-md shadow-lg py-1"
          style={{
            top: menu.y,
            left: menu.x,
            animation: 'fadeIn 150ms ease-out',
          }}
        >
          <button
            onClick={handleRename}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
          >
            <Pencil className="h-3.5 w-3.5" />
            Rename
          </button>
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
          >
            <Upload className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer border-none bg-transparent"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}

      {addMenu && (
        <div
          ref={addMenuRef}
          className="fixed z-[300] min-w-[140px] rounded-lg border border-border bg-card/90 backdrop-blur-md shadow-lg py-1"
          style={{
            top: addMenu.y,
            left: addMenu.x,
            animation: 'fadeIn 150ms ease-out',
          }}
        >
          <button
            onClick={handleImportFromMenu}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
          >
            <Download className="h-3.5 w-3.5" />
            Import
          </button>
          <button
            onClick={handleCreateBlank}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
          >
            <Plus className="h-3.5 w-3.5" />
            Create blank
          </button>
        </div>
      )}

      {deletePrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            setDeletePrompt(null);
          }}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl p-6 w-96 max-w-[90vw] flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                <span className="font-semibold text-foreground text-base">
                  Delete playlist?
                </span>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    {playlists.find((p) => p.id === deletePrompt)?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {
                      playlists.find((p) => p.id === deletePrompt)?.videos
                        .length
                    }{' '}
                    video
                    {playlists.find((p) => p.id === deletePrompt)?.videos
                      .length !== 1
                      ? 's'
                      : ''}
                  </span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                Are you sure you want to delete this playlist? This action
                cannot be undone.
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletePrompt(null)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
