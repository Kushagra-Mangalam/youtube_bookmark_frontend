// ============================================================
// AppHeader
// Sticky header with:
// - Logo + status dot
// - View toggle: switches between Vortex arc and Vault list
// - Sound toggle
// - Search (visible in vault mode)
// - Add bookmark button (always visible)
// - Logout button
// ============================================================

import { GlassLiquidFillButton } from './GlassLiquidFillButton';

interface Props {
  hasBookmarks: boolean;
  soundEnabled: boolean;
  searchQuery: string;
  onToggleSound: () => void;
  onSearch: (q: string) => void;
  onAdd: () => void;
  // View toggle
  demoMode: 'empty' | 'loaded';
  onToggleDemoMode: () => void;
  // Auth
  onLogout?: () => void;
  // Refresh bookmarks from API
  onRefresh?: () => void;
}

export function AppHeader({
  hasBookmarks,
  soundEnabled,
  searchQuery,
  onToggleSound,
  onSearch,
  onAdd,
  demoMode,
  onToggleDemoMode,
  onLogout,
  onRefresh,
}: Props) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        height: 64,
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: '1px solid var(--border-cyan)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="status-dot" />
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--cyan)',
            textTransform: 'uppercase',
          }}
        >
          YTMARKER'S
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            marginLeft: 4,
          }}
        >
          v2.047
        </span>
      </div>

      {/* ── Center controls ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* View mode toggle — only when there are bookmarks */}
        {hasBookmarks && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                userSelect: 'none',
              }}
            >
              {demoMode === 'empty' ? 'VORTEX' : 'VAULT'}
            </span>
            {/* Toggle track */}
            <div
              className={`toggle-track ${demoMode === 'loaded' ? 'active' : ''}`}
              onClick={onToggleDemoMode}
              title="Toggle between vortex arc and vault list"
            >
              <div className="toggle-thumb" />
            </div>
          </div>
        )}

        {/* Search — only in vault mode */}
        {demoMode === 'loaded' && hasBookmarks && (
          <div style={{ position: 'relative' }}>
            <svg
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 13,
                height: 13,
                opacity: 0.4,
                pointerEvents: 'none',
                color: 'var(--text-primary)',
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search vault..."
              style={{
                padding: '7px 14px 7px 34px',
                borderRadius: 30,
                border: '1px solid var(--border-cyan)',
                background: 'var(--glass)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                outline: 'none',
                width: 220,
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(0,240,255,0.45)';
                e.target.style.boxShadow = '0 0 16px rgba(0,240,255,0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border-cyan)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* ── Right actions ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '1px solid var(--border-cyan)',
            background: 'var(--glass)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--cyan)';
            (e.currentTarget as HTMLElement).style.background = 'var(--cyan-dim)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-cyan)';
            (e.currentTarget as HTMLElement).style.background = 'var(--glass)';
          }}
        >
          {soundEnabled ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" className="sound-active">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        {/* GitHub repo link */}
        <a
          href="https://github.com/Kushagra-Mangalam/youtube_bookmark_extension"
          target="_blank"
          rel="noopener noreferrer"
          title="Download Chrome Extension"
          style={{
            height: 36,
            padding: '0 16px',
            borderRadius: 8,
            border: '1px solid var(--border-cyan)',
            background: 'var(--glass)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.3s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--cyan)';
            (e.currentTarget as HTMLElement).style.background = 'var(--cyan-dim)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 18px rgba(0,240,255,0.12)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-cyan)';
            (e.currentTarget as HTMLElement).style.background = 'var(--glass)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--cyan)">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            Get Extension
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.6 }}>
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>

        {/* Sync/Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Sync bookmarks from server"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid var(--border-cyan)',
              background: 'var(--glass)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--cyan)';
              (e.currentTarget as HTMLElement).style.background = 'var(--cyan-dim)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-cyan)';
              (e.currentTarget as HTMLElement).style.background = 'var(--glass)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round">
              <path d="M21.5 2v6h-6" />
              <path d="M2.5 22v-6h6" />
              <path d="M3.34 8A9.96 9.96 0 0 1 12 2c3.6 0 6.74 1.95 8.5 4.84" />
              <path d="M20.66 16A9.96 9.96 0 0 1 12 22c-3.6 0-6.74-1.95-8.5-4.84" />
            </svg>
          </button>
        )}

        {/* Add button */}
        <GlassLiquidFillButton onClick={onAdd} className="text-xs py-2 px-5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </GlassLiquidFillButton>

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid rgba(255,0,0,0.15)',
              background: 'rgba(255,0,0,0.04)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)';
              (e.currentTarget as HTMLElement).style.background = 'var(--red-dim)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px rgba(255,0,0,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,0,0,0.15)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,0,0,0.04)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
