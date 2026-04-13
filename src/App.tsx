// ============================================================
// App.tsx — Root component
//
// Three-layer routing:
//   1. Not authenticated → LandingPage (cinematic intro + auth)
//   2. Authenticated + no bookmarks → VortexEmptyState ("The Void")
//   3. Authenticated + has bookmarks:
//      - demoMode === 'empty'  → VortexArcView (semicircle scroll)
//      - demoMode === 'loaded' → BookmarkVaultView (list/grid)
//
// Auth is demo-only (localStorage). In production you'd
// replace with a real auth provider.
// ============================================================

import { useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { LiquidBackgroundCanvas } from './components/LiquidBackgroundCanvas';
import { LandingPage } from './components/LandingPage';
import { AppHeader } from './components/AppHeader';
import { VortexEmptyState } from './components/VortexEmptyState';
import { VortexArcView } from './components/VortexArcView';
import { BookmarkVaultView } from './components/BookmarkVaultView';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { NotificationStack } from './components/NotificationStack';

import { useSoundFX } from './hooks/useSoundFX';
import { SAMPLE_BOOKMARKS, uid } from './utils/data';
import type { VideoBookmark, NotificationItem } from './types';

// Register GSAP React plugin globally
import { useGSAP as _useGSAP } from '@gsap/react';
gsap.registerPlugin(_useGSAP);

// ─────────────────────────────────────────────────────────────
// Persistence helpers
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'kush_yt_bookmarks_v1';
const AUTH_KEY = 'kush_yt_auth';

function loadBookmarks(): VideoBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VideoBookmark[];
  } catch {
    return [];
  }
}

function saveBookmarks(bms: VideoBookmark[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bms));
  } catch {
    // quota exceeded or private mode — silent fail
  }
}

function isAuthenticated(): boolean {
  try {
    return !!localStorage.getItem(AUTH_KEY);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ────────────────────────────────────────────
  const [authed, setAuthed] = useState(isAuthenticated);

  // ── State ─────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>(loadBookmarks);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // View mode: vortex arc vs vault list (only when bookmarks exist)
  const [viewMode, setViewMode] = useState<'vortex' | 'vault'>(
    bookmarks.length > 0 ? 'vortex' : 'vortex'
  );

  // ── Sound FX ──────────────────────────────────────────────
  const { playPlop, playSplash, playWhoosh } = useSoundFX(soundEnabled);

  // ── Cursor glow (follow mouse) ────────────────────────────
  useGSAP(() => {
    const glow = document.querySelector('.cursor-glow') as HTMLElement;
    if (!glow) return;
    window.addEventListener('mousemove', (e) => {
      gsap.to(glow, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.12,
        ease: 'none',
      });
    });
  }, []);

  // ── Auth handlers ─────────────────────────────────────────
  const handleAuthenticate = useCallback(() => {
    setAuthed(true);
  }, []);

  const handleLogout = useCallback(() => {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    setAuthed(false);
  }, []);

  // ── Notifications ─────────────────────────────────────────
  const notify = useCallback((message: string, type: 'cyan' | 'red' = 'cyan') => {
    const item: NotificationItem = { id: uid(), message, type };
    setNotifications(prev => [...prev, item]);
  }, []);

  const dismissNotif = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // ── Bookmark CRUD ─────────────────────────────────────────
  const addBookmark = useCallback((bm: VideoBookmark) => {
    const updated = [bm, ...bookmarks];
    setBookmarks(updated);
    saveBookmarks(updated);
    setViewMode('vortex');
    notify('↯ Injected into vortex', 'cyan');
    playPlop();
  }, [bookmarks, notify, playPlop]);

  const deleteBookmark = useCallback((id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    saveBookmarks(updated);
    notify('◌ Bookmark removed', 'red');
    playWhoosh();
  }, [bookmarks, notify, playWhoosh]);

  const clearAll = useCallback(() => {
    if (!window.confirm('Clear all bookmarks from the vortex?')) return;
    setBookmarks([]);
    saveBookmarks([]);
    notify('⚡ Vortex cleared', 'red');
    playSplash();
  }, [notify, playSplash]);

  const playVideo = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    playPlop();
  }, [playPlop]);

  // ── View mode toggle ──────────────────────────────────────
  const handleToggleViewMode = useCallback(() => {
    if (viewMode === 'vortex') {
      setViewMode('vault');
      notify('⬡ Vault view active', 'cyan');
      playWhoosh();
    } else {
      setViewMode('vortex');
      setSearchQuery('');
      notify('↯ Vortex view active', 'cyan');
      playPlop();
    }
  }, [viewMode, notify, playPlop, playWhoosh]);

  // Browse trending = load samples + switch to vortex
  const handleBrowseTrending = useCallback(() => {
    const updated = SAMPLE_BOOKMARKS;
    setBookmarks(updated);
    saveBookmarks(updated);
    setViewMode('vortex');
    notify('↯ Trending data injected into vortex', 'cyan');
    playSplash();
  }, [notify, playSplash]);

  // ──────────────────────────────────────────────────────────
  // RENDER: Landing page (not authenticated)
  // ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', position: 'relative' }}>
        <LiquidBackgroundCanvas />
        <div className="cursor-glow" />
        <div className="scan-line" />
        <LandingPage onAuthenticate={handleAuthenticate} />
        <NotificationStack notifications={notifications} onDismiss={dismissNotif} />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // RENDER: Main app (authenticated)
  // ──────────────────────────────────────────────────────────
  const hasBookmarks = bookmarks.length > 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--black)',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Animated liquid noise background */}
      <LiquidBackgroundCanvas />

      {/* Cursor glow follower */}
      <div className="cursor-glow" />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Sticky header */}
      <AppHeader
        hasBookmarks={hasBookmarks}
        soundEnabled={soundEnabled}
        searchQuery={searchQuery}
        onToggleSound={() => {
          setSoundEnabled(s => !s);
          notify(soundEnabled ? '🔇 Sound off' : '🔊 Sound on', 'cyan');
        }}
        onSearch={setSearchQuery}
        onAdd={() => { setModalOpen(true); playPlop(); }}
        demoMode={viewMode === 'vortex' ? 'empty' : 'loaded'}
        onToggleDemoMode={handleToggleViewMode}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {!hasBookmarks ? (
          // No bookmarks: show "The Void"
          <VortexEmptyState
            onBrowseTrending={handleBrowseTrending}
            onAddManual={() => { setModalOpen(true); playPlop(); }}
          />
        ) : viewMode === 'vortex' ? (
          // Has bookmarks + vortex mode: semicircle arc
          <VortexArcView
            bookmarks={bookmarks}
            onDelete={deleteBookmark}
            onPlay={playVideo}
            onClearAll={clearAll}
            soundEnabled={soundEnabled}
            onSoundPlop={playPlop}
          />
        ) : (
          // Has bookmarks + vault mode: list view
          <BookmarkVaultView
            bookmarks={bookmarks}
            searchQuery={searchQuery}
            onDelete={deleteBookmark}
            onPlay={playVideo}
            onClearAll={clearAll}
            soundEnabled={soundEnabled}
            onSoundPlop={playPlop}
            onSoundSplash={playSplash}
          />
        )}
      </main>

      {/* Add bookmark modal */}
      {modalOpen && (
        <AddBookmarkModal
          onAdd={addBookmark}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Notification stack */}
      <NotificationStack
        notifications={notifications}
        onDismiss={dismissNotif}
      />
    </div>
  );
}
