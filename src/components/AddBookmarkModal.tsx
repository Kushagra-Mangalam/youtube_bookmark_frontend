// ============================================================
// AddBookmarkModal
// Glassmorphic modal for manually adding a video bookmark.
// GSAP animates it in with a scale + fade entrance.
// ============================================================

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { GlassLiquidFillButton } from './GlassLiquidFillButton';
import { extractYouTubeId, buildThumbnail, timeToSeconds, uid } from '../utils/bookmarkService';
import type { VideoBookmark } from '../types';

interface Props {
  onAdd: (bm: VideoBookmark) => void;
  onClose: () => void;
}

export function AddBookmarkModal({ onAdd, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [thumb, setThumb] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');

  // ── Entrance animation ────────────────────────────────────
  useGSAP(() => {
    gsap.fromTo(panelRef.current, {
      opacity: 0,
      scale: 0.92,
      y: 20,
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.45,
      ease: 'back.out(1.5)',
    });
  }, { scope: panelRef });

  function handleClose() {
    gsap.to(panelRef.current, {
      opacity: 0,
      scale: 0.94,
      y: 12,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: onClose,
    });
  }

  function handleSubmit() {
    if (!title.trim()) {
      setError('Video title is required.');
      return;
    }

    const vid = extractYouTubeId(url);
    const bm: VideoBookmark = {
      id: uid(),
      url: url || '#',
      title: title.trim(),
      channelName: channel.trim() || 'Unknown Channel',
      thumbnail: thumb || (vid ? buildThumbnail(vid) : ''),
      duration: duration.trim() || '0:00',
      addedAt: Date.now(),
      views: 0,
      bookmarks: [{
        time: time.trim() || '0:00',
        timeSeconds: timeToSeconds(time.trim() || '0:00'),
        label: label.trim() || 'Bookmark',
        addedAt: Date.now(),
      }],
    };

    onAdd(bm);
    handleClose();
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--border-cyan)',
    background: 'var(--glass)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--cyan)',
    letterSpacing: '0.15em',
    marginBottom: 6,
    display: 'block',
    textTransform: 'uppercase' as const,
  };

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div ref={panelRef} className="modal-panel" style={{ padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--cyan)',
              letterSpacing: '0.08em',
              marginBottom: 4,
            }}
          >
            // ADD BOOKMARK
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Feed the vortex with a new YouTube entry
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
            ⚠ {error}
          </div>
        )}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Video URL</label>
            <input className="field-input" style={fieldStyle} placeholder="https://youtube.com/watch?v=..." value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Video Title *</label>
            <input className="field-input" style={fieldStyle} placeholder="e.g. Cyberpunk 2077 Full Lore..." value={title} onChange={e => { setTitle(e.target.value); setError(''); }} />
          </div>
          <div>
            <label style={labelStyle}>Channel Name</label>
            <input className="field-input" style={fieldStyle} placeholder="e.g. PixelVault Archives" value={channel} onChange={e => setChannel(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Timestamp</label>
              <input className="field-input" style={fieldStyle} placeholder="e.g. 4:22" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Duration</label>
              <input className="field-input" style={fieldStyle} placeholder="e.g. 34:12" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Label / Note</label>
            <input className="field-input" style={fieldStyle} placeholder="e.g. Key moment explained" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Thumbnail URL (optional)</label>
            <input className="field-input" style={fieldStyle} placeholder="Auto-detected from YouTube URL" value={thumb} onChange={e => setThumb(e.target.value)} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <GlassLiquidFillButton onClick={handleSubmit} className="flex-1 text-xs">
            ↯ Inject into Vortex
          </GlassLiquidFillButton>
          <GlassLiquidFillButton onClick={handleClose} variant="red" className="text-xs px-6">
            Cancel
          </GlassLiquidFillButton>
        </div>
      </div>
    </div>
  );
}
