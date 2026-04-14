// ============================================================
// bookmarkService.ts — Fetches bookmarks from the backend API
// and transforms them into the VideoBookmark[] format used by
// the frontend components.
// ============================================================

import API from './api';
import { buildThumbnail } from './data';
import type { VideoBookmark, BookmarkEntry } from '../types';

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
    const result: VideoBookmark[] = Object.entries(grouped).map(([videoId, bookmarks]) => {
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

      return {
        id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: `YouTube Video`,  // We'll try to fetch real title later
        channelName: 'YouTube',
        thumbnail: buildThumbnail(videoId),
        duration: estimatedDuration,
        bookmarks: bookmarkEntries,
        addedAt: Date.now(),
        views: 0,
      };
    });

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
