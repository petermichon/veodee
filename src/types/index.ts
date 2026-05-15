export interface Video {
  id: string;
  tags: string[];
}

export interface GroupVideo {
  id: string;
  deleted?: boolean;
  deletedAt?: number;
}

export interface TagGroup {
  tags: string[];
  videos: GroupVideo[];
}

export interface TagStorage {
  version: number;
  groups: TagGroup[];
  tags: Tag[];
}

export interface Tag {
  name: string;
  color: string;
}

export type Theme = 'dark' | 'light' | 'system';
