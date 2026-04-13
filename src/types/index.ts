// ============================================================
// KUSH YT BOOKMARKS — Type Definitions
// ============================================================

export interface BookmarkEntry {
  time: string;       // e.g. "4:22"
  timeSeconds: number; // for seeking
  label: string;      // e.g. "Key moment"
  addedAt: number;    // unix timestamp
}

export interface VideoBookmark {
  id: string;
  url: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration: string;      // e.g. "12:45"
  bookmarks: BookmarkEntry[];
  addedAt: number;
  views: number;         // play count within app
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'cyan' | 'red';
}

export interface AppState {
  view: 'empty' | 'loaded';
  bookmarks: VideoBookmark[];
  notifications: NotificationItem[];
  soundEnabled: boolean;
  searchQuery: string;
  activeTab: 'all' | 'recent' | 'mostBookmarked';
  modalOpen: boolean;
}
