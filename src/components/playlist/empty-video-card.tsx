import { useRef, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { useTag } from '@/contexts/tag-context';
import type { Video } from '@/types/index';

interface EmptyVideoCardProps {
  onVideoAdded?: (video: Video) => void;
  layout?: 'grid' | 'list';
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function EmptyVideoCard({ onVideoAdded, layout = 'grid' }: EmptyVideoCardProps) {
  const { addVideo } = useTag();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    setInputValue('');
  };

  const handleSubmit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const videoId = extractVideoId(inputValue);
    if (!videoId) return;
    try {
      const video: Video = { id: videoId, tags: [] };
      addVideo(video);
      onVideoAdded?.(video);
    } catch (error) {
      console.error('Error adding video:', error);
    }
    setIsExpanded(false);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit(e);
    if (e.key === 'Escape') { setIsExpanded(false); setInputValue(''); }
  };

  if (layout === 'list') {
    return (
      <div
        className="flex gap-5 items-center rounded-xl px-2 py-3 transition-colors hover:bg-accent/50 group"
        onClick={!isExpanded ? handleOpen : undefined}
        style={{ cursor: isExpanded ? 'default' : 'pointer' }}
      >
        <Plus className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
        <div className="w-48 aspect-video flex-shrink-0 rounded-xl border-2 border-dashed border-muted-foreground/40 group-hover:border-muted-foreground transition-colors flex items-center justify-center">
          <Plus className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        {isExpanded ? (
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="YouTube URL or video ID"
              className="flex-1 min-w-0 px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
            <button
              onClick={handleSubmit}
              disabled={!extractVideoId(inputValue)}
              className="p-1.5 rounded-lg bg-foreground text-background disabled:opacity-40 hover:opacity-80 transition-opacity cursor-pointer disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-foreground text-sm">Add Video</p>
            <p className="text-xs text-muted-foreground">Click to add a video</p>
          </div>
        )}
      </div>
    );
  }

  const handleAddVideo = () => {
    try {
      const video: Video = { id: '', tags: [] };
      addVideo(video);
      onVideoAdded?.(video);
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  return (
    <div
      className="group rounded-xl overflow-hidden cursor-pointer min-h-[200px] flex items-center justify-center hover:bg-accent/50 transition-colors"
      onClick={handleAddVideo}
    >
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground group-hover:text-foreground">
            Add Video
          </p>
          <p className="text-sm text-muted-foreground">
            Click to add a blank video
          </p>
        </div>
      </div>
    </div>
  );
}
