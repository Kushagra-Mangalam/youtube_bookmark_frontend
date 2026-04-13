// ============================================================
// MultiBookmarkHoverBar
//
// Slides up from the bottom of a BookmarkCard when the card has
// 2+ bookmark entries. Shows a count pill + scrollable list of
// timestamps and labels. Each entry is clickable (opens YouTube
// at that timestamp).
//
// The slide-up is CSS-driven (transform: translateY) for
// performance. GSAP handles the card's 3D tilt separately.
// ============================================================

import type { BookmarkEntry } from '../types';

interface Props {
  bookmarks: BookmarkEntry[];
  videoUrl: string;
}

function buildTimestampUrl(url: string, seconds: number): string {
  try {
    const u = new URL(url);
    u.searchParams.set('t', String(seconds));
    return u.toString();
  } catch {
    return url;
  }
}

export function MultiBookmarkHoverBar({ bookmarks, videoUrl }: Props) {
  if (bookmarks.length < 2) return null;

  return (
    <div className="quick-bar" style={{ padding: '10px 16px', zIndex: 10 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
        }}
        className="no-scrollbar"
      >
        {/* Count pill */}
        <div
          className="ts-pill"
          style={{ flexShrink: 0, cursor: 'default' }}
        >
          ● {bookmarks.length}
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            height: 24,
            background: 'var(--border-cyan)',
            flexShrink: 0,
          }}
        />

        {/* Scrollable bookmark list */}
        {bookmarks.map((bm, i) => (
          <a
            key={i}
            href={buildTimestampUrl(videoUrl, bm.timeSeconds)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid var(--border-cyan)',
              background: 'var(--glass)',
              cursor: 'pointer',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'var(--cyan)';
              el.style.background = 'var(--cyan-dim)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'var(--border-cyan)';
              el.style.background = 'var(--glass)';
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--red)',
                minWidth: 38,
              }}
            >
              {bm.time}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                maxWidth: 140,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {bm.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
