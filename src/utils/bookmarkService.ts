// ============================================================
// bookmarkService.ts — Fetches bookmarks from the backend API
// and transforms them into the VideoBookmark[] format used by
// the frontend components.
// ============================================================

import API from './api';
import type { VideoBookmark, BookmarkEntry } from '../types';

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

/** Raw bookmark record from the backend */
interface RawBookmark {
  _id: string;
  user_email: string;
  videoId: string;
  time: number;
  desc: string;
}

/** Convert seconds to "m:ss" or "h:mm:ss" */
function secondsToTime(s: number): string {
  const secs = Math.floor(s);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const sec = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/**
 * Fetch all bookmarks for the logged-in user from the backend,
 * group them by videoId, and return as VideoBookmark[].
 */
export async function fetchAllBookmarks(): Promise<VideoBookmark[]> {
  try {
    const res = await API.get('/bookmarks/');
    const rawBookmarks: RawBookmark[] = res.data;

    if (!Array.isArray(rawBookmarks) || rawBookmarks.length === 0) {
      return [];
    }

    // Group by videoId
    const grouped: Record<string, RawBookmark[]> = {};
    for (const bm of rawBookmarks) {
      if (!grouped[bm.videoId]) {
        grouped[bm.videoId] = [];
      }
      grouped[bm.videoId].push(bm);
    }

    // Transform each group into a VideoBookmark
    const resultPromises = Object.entries(grouped).map(async ([videoId, bookmarks]) => {
      // Sort bookmarks by time
      bookmarks.sort((a, b) => a.time - b.time);

      const bookmarkEntries: BookmarkEntry[] = bookmarks.map(bm => ({
        time: secondsToTime(bm.time),
        timeSeconds: typeof bm.time === 'number' ? bm.time : parseFloat(String(bm.time)),
        label: bm.desc || `Bookmark at ${secondsToTime(bm.time)}`,
        addedAt: Date.now(), // backend doesn't store addedAt yet
      }));

      // Estimate total duration from last bookmark
      const maxTime = Math.max(...bookmarks.map(b => (typeof b.time === 'number' ? b.time : 0)));
      const estimatedDuration = secondsToTime(maxTime + 60); // rough estimate

      let title = "YouTube Video";
      let channelName = "YouTube";
      try {
        const oRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const oData = await oRes.json();
        if (oData.title) title = oData.title;
        if (oData.author_name) channelName = oData.author_name;
      } catch (e) {
        console.error("Failed to fetch youtube details", videoId, e);
      }

      return {
        id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        channelName,
        thumbnail: buildThumbnail(videoId),
        duration: estimatedDuration,
        bookmarks: bookmarkEntries,
        addedAt: Date.now(),
        views: 0,
      } as VideoBookmark;
    });

    const result = await Promise.all(resultPromises);

    // Sort by most recently bookmarked (most bookmarks first)
    result.sort((a, b) => b.bookmarks.length - a.bookmarks.length);

    return result;
  } catch (err) {
    console.error('Failed to fetch bookmarks from API:', err);
    return [];
  }
}

/**
 * Delete a specific bookmark from the backend.
 * @param videoId - The YouTube video ID
 * @param time - The timestamp of the bookmark to delete
 */
export async function deleteBookmarkFromAPI(videoId: string, time: number): Promise<void> {
  await API.post('/bookmarks/delete/', { videoId, time });
}

/**
 * Add a bookmark via the backend API.
 */
export async function addBookmarkToAPI(videoId: string, time: number, desc: string): Promise<void> {
  await API.post('/bookmarks/add/', { videoId, time, desc });
}
