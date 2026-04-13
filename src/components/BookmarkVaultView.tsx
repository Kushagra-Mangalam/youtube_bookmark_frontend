// ============================================================
// BookmarkVaultView
// The "loaded" state showing all saved bookmarks.
//
// Features:
// - Shows 3 skeleton cards for ~1.2s (simulates loading),
//   then morphs into real cards via droplet reveal
// - Tab bar: All / Recent / Most Bookmarked
// - GSAP scroll-triggered reveal for cards entering viewport
// - Stats bar at top
// ============================================================

import { useState, useEffect, useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkSkeleton } from './BookmarkSkeleton';
import { GlassLiquidFillButton } from './GlassLiquidFillButton';
import type { VideoBookmark } from '../types';

gsap.registerPlugin(ScrollTrigger);

type Tab = 'all' | 'recent' | 'mostBookmarked';

interface Props {
  bookmarks: VideoBookmark[];
  searchQuery: string;
  onDelete: (id: string) => void;
  onPlay: (url: string) => void;
  onClearAll: () => void;
  soundEnabled: boolean;
  onSoundPlop?: () => void;
  onSoundSplash?: () => void;
}

export function BookmarkVaultView({
  bookmarks,
  searchQuery,
  onDelete,
  onPlay,
  onClearAll,
  soundEnabled,
  onSoundPlop,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const headerRef = useRef<HTMLDivElement>(null);

  // Simulate skeleton loading on first mount
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Header slide-in
  useGSAP(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, { scope: headerRef });

  // Filtered & sorted bookmarks
  const displayed = useMemo(() => {
    let list = [...bookmarks];

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.channelName.toLowerCase().includes(q) ||
        b.bookmarks.some(bk => bk.label.toLowerCase().includes(q))
      );
    }

    // Apply tab sort
    if (activeTab === 'recent') list.sort((a, b) => b.addedAt - a.addedAt);
    if (activeTab === 'mostBookmarked') list.sort((a, b) => b.bookmarks.length - a.bookmarks.length);

    return list;
  }, [bookmarks, searchQuery, activeTab]);

  const totalTimestamps = bookmarks.reduce((acc, b) => acc + b.bookmarks.length, 0);

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    padding: '13px 18px',
    cursor: 'pointer',
    color: activeTab === tab ? 'var(--cyan)' : 'var(--text-muted)',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: `2px solid ${activeTab === tab ? 'var(--cyan)' : 'transparent'}`,
    textTransform: 'uppercase',
    transition: 'all 0.25s ease',
    background: 'none',
    userSelect: 'none',
  });

  return (
    <div style={{ padding: '0 0 60px', position: 'relative', zIndex: 1 }}>

      {/* ── Section header ─────────────────────────────────── */}
      <div
        ref={headerRef}
        style={{
          padding: '28px 40px 0',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--cyan)',
              marginBottom: 4,
            }}
          >
            // BOOKMARK VAULT
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
            }}
          >
            {bookmarks.length} video{bookmarks.length !== 1 ? 's' : ''} indexed
            &nbsp;·&nbsp;
            {totalTimestamps} timestamp{totalTimestamps !== 1 ? 's' : ''} stored
          </div>
        </div>

        <GlassLiquidFillButton
          onClick={onClearAll}
          variant="red"
          className="text-xs py-2 px-5"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
          </svg>
          Clear All
        </GlassLiquidFillButton>
      </div>

      {/* ── Tab bar ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-cyan)',
          padding: '0 40px',
          marginBottom: 24,
        }}
      >
        {(['all', 'recent', 'mostBookmarked'] as Tab[]).map(tab => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>
            {tab === 'all' ? 'All Bookmarks' : tab === 'recent' ? 'Recently Added' : 'Most Bookmarked'}
          </button>
        ))}
      </div>

      {/* ── Card grid ──────────────────────────────────────── */}
      <div style={{ padding: '0 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          // Skeleton placeholders
          Array.from({ length: 3 }).map((_, i) => (
            <BookmarkSkeleton key={i} />
          ))
        ) : displayed.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
            }}
          >
            // NO RESULTS IN VORTEX //
          </div>
        ) : (
          displayed.map((bm, i) => (
            <BookmarkCard
              key={bm.id}
              bookmark={bm}
              index={i}
              onDelete={onDelete}
              onPlay={onPlay}
              soundEnabled={soundEnabled}
              onSoundPlop={onSoundPlop}
            />
          ))
        )}
      </div>
    </div>
  );
}
