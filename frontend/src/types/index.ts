export interface Video {
  id: string;
}

export interface Playlist {
  id: string;
  name: string;
  videos: Video[];
  ratio: '16:9' | '1:1';
}

export type Theme = 'dark' | 'light' | 'system';
