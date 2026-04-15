// ============================================================
// BookmarkCard
//
// Displays a single video bookmark with:
// - Thumbnail, title, channel name, timestamp pills
// - Play / Delete icon buttons with liquid shine hover
// - 3D tilt effect: GSAP tracks mouse position relative to card
//   and applies subtle rotateX/Y for a lifted feel
// - MultiBookmarkHoverBar slides up from bottom on hover
// - Droplet reveal animation on mount (GSAP)
// ============================================================

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MultiBookmarkHoverBar } from './MultiBookmarkHoverBar';
import { timeAgo } from '../utils/bookmarkService';
import type { VideoBookmark } from '../types';

interface Props {
  bookmark: VideoBookmark;
  onDelete: (id: string) => void;
  onPlay: (url: string) => void;
  index: number; // for stagger delay
  soundEnabled: boolean;
  onSoundPlop?: () => void;
}

export function BookmarkCard({ bookmark, onDelete, onPlay, index, onSoundPlop }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasMulti = bookmark.bookmarks.length >= 2;
  // Extra bottom padding to make room for hover bar
  const bottomPad = hasMulti ? 56 : 16;

  // ── Droplet reveal on mount ───────────────────────────────
  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: -22,
        scale: 0.95,
        filter: 'brightness(1.4)',
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'brightness(1)',
        duration: 0.65,
        ease: 'back.out(1.6)',
        delay: index * 0.08,
      }
    );
  }, { scope: cardRef });

  // ── 3D tilt on mouse enter/leave ─────────────────────────
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
    const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1

    gsap.to(card, {
      rotateX: -dy * 4,     // tilt up/down max 4deg
      rotateY: dx * 6,      // tilt left/right max 6deg
      translateZ: 8,
      duration: 0.35,
      ease: 'power2.out',
      transformPerspective: 900,
    });
  }

  function handleMouseLeave() {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      duration: 0.55,
      ease: 'elastic.out(1, 0.5)',
      transformPerspective: 900,
    });
  }

  return (
    <div
      ref={cardRef}
      className="bm-card"
      style={{
        paddingTop: 16,
        paddingBottom: bottomPad,
        paddingLeft: 20,
        paddingRight: 20,
        display: 'grid',
        gridTemplateColumns: '88px 1fr auto',
        gap: 16,
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Thumbnail ─────────────────────────────────────── */}
      <div
        style={{
          width: 88,
          height: 54,
          borderRadius: 6,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
          background: '#111',
          position: 'relative',
        }}
      >
        <img
          src={bookmark.thumbnail}
          alt={bookmark.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Duration badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 3,
            right: 4,
            background: 'rgba(0,0,0,0.82)',
            borderRadius: 2,
            padding: '1px 4px',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: '#fff',
            lineHeight: 1.4,
          }}
        >
          {bookmark.duration}
        </div>
      </div>

      {/* ── Info ──────────────────────────────────────────── */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: 5,
            letterSpacing: '0.01em',
          }}
        >
          {bookmark.title}
        </div>
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginBottom: 7,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.05em',
          }}
        >
          {bookmark.channelName} · {timeAgo(bookmark.addedAt)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Primary timestamp */}
          <span className="ts-pill">
            ● {bookmark.bookmarks[0]?.time ?? '0:00'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 10px',
              borderRadius: 20,
              background: 'var(--glass)',
              border: '1px solid var(--border-white)',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
            }}
          >
            {bookmark.bookmarks[0]?.label ?? 'Bookmark'}
          </span>
          {/* Extra bookmark count */}
          {hasMulti && (
            <span className="ts-pill cyan">
              +{bookmark.bookmarks.length - 1}
            </span>
          )}
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        {/* Play */}
        <div
          className="icon-btn"
          title="Open video"
          onClick={e => {
            e.stopPropagation();
            onPlay(bookmark.url);
            onSoundPlop?.();
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--text-secondary)">
            <path d="M5 3l14 9-14 9V3z"/>
          </svg>
        </div>

        {/* Delete */}
        <div
          className="icon-btn danger"
          title="Delete bookmark"
          onClick={e => {
            e.stopPropagation();
            onDelete(bookmark.id);
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>
      </div>

      {/* ── Multi-bookmark hover bar ───────────────────────── */}
      {hasMulti && (
        <MultiBookmarkHoverBar
          bookmarks={bookmark.bookmarks}
          videoUrl={bookmark.url}
        />
      )}
    </div>
  );
}
