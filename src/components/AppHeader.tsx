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
          KUSH YT BOOKMARKS
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
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
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
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          )}
        </button>

        {/* Add button */}
        <GlassLiquidFillButton onClick={onAdd} className="text-xs py-2 px-5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
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
