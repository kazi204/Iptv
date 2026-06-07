export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  language?: string;
  country?: string;
  isCustom?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  url?: string;
  content?: string;
  channelCount: number;
  isActive: boolean;
  importedAt: string;
}

export interface TVState {
  channels: Channel[];
  playlists: Playlist[];
  watchlist: string[];
  selectedCategory: string;
  searchQuery: string;
  activeChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
}
