export interface Video {
  id: string;
}

export interface Playlist {
  id: string;
  name: string;
  videos: Video[];
}

export type Theme = 'dark' | 'light' | 'system';
