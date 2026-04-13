// ============================================================
// KUSH YT BOOKMARKS — Sample Data & Utilities
// ============================================================

import type { VideoBookmark } from '../types';

/** Extract YouTube video ID from various URL formats */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Build YouTube thumbnail URL from video ID */
export function buildThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/** Convert "mm:ss" or "h:mm:ss" to seconds */
export function timeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

/** Generate a unique ID */
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Format a unix timestamp to "X ago" */
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Sample Bookmarks for Demo ────────────────────────────
export const SAMPLE_BOOKMARKS: VideoBookmark[] = [
  {
    id: 'sample-1',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Cyberpunk 2077 — Complete Night City Lore Deep Dive',
    channelName: 'PixelVault Archives',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    duration: '34:12',
    addedAt: Date.now() - 1000 * 60 * 30,
    views: 3,
    bookmarks: [
      { time: '0:45', timeSeconds: 45, label: 'Night City origins explained', addedAt: Date.now() - 2000 },
      { time: '4:22', timeSeconds: 262, label: 'V character backstory breakdown', addedAt: Date.now() - 1800 },
      { time: '12:11', timeSeconds: 731, label: 'Arasaka corporation reveal', addedAt: Date.now() - 1600 },
      { time: '24:55', timeSeconds: 1495, label: 'Johnny Silverhand truth', addedAt: Date.now() - 1400 },
    ],
  },
  {
    id: 'sample-2',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    title: 'Blade Runner 2049 — Hidden Details & Visual Symbolism',
    channelName: 'CinemaVault Pro',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
    duration: '18:44',
    addedAt: Date.now() - 1000 * 60 * 60 * 2,
    views: 7,
    bookmarks: [
      { time: '1:07', timeSeconds: 67, label: 'Opening shot Easter egg', addedAt: Date.now() - 3000 },
      { time: '8:33', timeSeconds: 513, label: 'Memory implant symbolism', addedAt: Date.now() - 2800 },
    ],
  },
  {
    id: 'sample-3',
    url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    title: 'Unity 6 — Next-Gen Rendering Pipeline Full Tutorial',
    channelName: 'Kush Dev Studio',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg',
    duration: '52:08',
    addedAt: Date.now() - 1000 * 60 * 60 * 5,
    views: 12,
    bookmarks: [
      { time: '3:12', timeSeconds: 192, label: 'URP pipeline setup', addedAt: Date.now() - 4000 },
      { time: '9:45', timeSeconds: 585, label: 'Shader graph for liquid metal', addedAt: Date.now() - 3800 },
      { time: '22:30', timeSeconds: 1350, label: 'GPU instancing trick', addedAt: Date.now() - 3600 },
      { time: '41:00', timeSeconds: 2460, label: 'Post-processing stack', addedAt: Date.now() - 3400 },
    ],
  },
  {
    id: 'sample-4',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    title: 'Lo-Fi Cyberpunk Beats — Study & Focus 2047',
    channelName: 'NeonWave Audio',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
    duration: '1:48:00',
    addedAt: Date.now() - 1000 * 60 * 60 * 24,
    views: 1,
    bookmarks: [
      { time: '12:00', timeSeconds: 720, label: 'Best beat starts here', addedAt: Date.now() - 5000 },
    ],
  },
];

// Vortex thumbnail sources (real YT IDs that exist)
export const VORTEX_VIDEO_IDS = [
  'dQw4w9WgXcQ', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'JGwWNGJdvx8',
  'RgKAFK5djSk', 'OPf0YbXqDm0', 'pRpeEdMmmQ0', 'fRh_vgS2dFE',
  '60ItHLz5WEA', 'YqeW9_5kURI', 'hT_nvWreIhg', 'nfWlot6h_JM',
];

export const VORTEX_LABELS = [
  '4:22', '1:07', '12:45', '0:33', '7:11', '3:58',
  '9:02', '2:17', '15:33', '6:44', '0:55', '8:29',
];
