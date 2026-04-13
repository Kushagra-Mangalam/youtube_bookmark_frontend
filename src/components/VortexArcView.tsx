// ============================================================
// VortexArcView — Continuous Loop Semicircle
//
// Bookmark cards orbit on a semicircle pinned to the left edge
// in a continuous, seamless LOOP. The rotation is automatic:
//
//   ≤3 cards:  continuous auto-rotation, no scroll required
//   >3 cards:  same continuous loop — after the last card
//              exits, the first card re-enters instantly
//
// The "active" card (closest to 3 o'clock / center of
// screen height) is always highlighted with a detail panel
// on the right showing its full info.
//
// Users CAN scroll up/down to speed up or reverse rotation
// direction, but the default is auto-play forward.
//
// Layout:
// ┌─────────────────────────────────────────────────┐
// │           ╭ card           │                     │
// │         ╭ card             │                     │
// │       ╭ ACTIVE CARD ──────│──► Detail Panel     │
// │         ╰ card             │                     │
// │           ╰ card           │                     │
// └─────────────────────────────────────────────────┘
// ============================================================

import { useRef, useState, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { GlassLiquidFillButton } from './GlassLiquidFillButton';
import { timeAgo } from '../utils/data';
import type { VideoBookmark } from '../types';

interface Props {
  bookmarks: VideoBookmark[];
  onDelete: (id: string) => void;
  onPlay: (url: string) => void;
  onClearAll: () => void;
  soundEnabled: boolean;
  onSoundPlop?: () => void;
}

// ── Arc position for a single card ──────────────────────────
function getCardTransform(
  cardAngle: number,  // the angle of this card on the circle
  radius: number,
  centerY: number,
) {
  // x,y on the circle
  const x = radius * Math.cos(cardAngle);
  const y = centerY + radius * Math.sin(cardAngle);

  // Normalize angle into [-π, π] for active detection
  let norm = cardAngle % (Math.PI * 2);
  if (norm > Math.PI) norm -= Math.PI * 2;
  if (norm < -Math.PI) norm += Math.PI * 2;

  // "Active" = closest to angle 0 (3-o'clock = center height)
  const distFromActive = Math.abs(norm);
  const maxDist = Math.PI * 0.6;

  // Visibility: only show the RIGHT semicircle (-π/2 to π/2)
  const isVisible = distFromActive < Math.PI * 0.55;

  // Scale: active = 1.05, edges = 0.5
  const scale = isVisible
    ? Math.max(0.5, 1.05 - (distFromActive / maxDist) * 0.55)
    : 0.4;

  // Opacity: active = 1, edges fade
  const opacity = isVisible
    ? Math.max(0.1, 1 - (distFromActive / maxDist) * 0.9)
    : 0;

  // Tilt tangent to arc (subtle)
  const tiltDeg = norm * 10;

  // Z-index: active gets highest
  const zIndex = isVisible ? Math.round((1 - distFromActive / Math.PI) * 20) : 0;

  return { x, y, scale, opacity, tiltDeg, zIndex, isVisible, norm };
}

export function VortexArcView({
  bookmarks,
  onDelete,
  onPlay,
  onClearAll,
  onSoundPlop,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rotation state — continuously incremented
  const rotationRef = useRef(0);
  const targetSpeedRef = useRef(0.004); // radians per frame (~0.23°/frame ≈ 14°/s)
  const currentSpeedRef = useRef(0.004);
  const frameRef = useRef(0);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const cardCount = bookmarks.length;
  const RADIUS = Math.min(window.innerHeight * 0.38, 340);
  const CENTER_Y = window.innerHeight * 0.5;
  const CARD_W = 240;
  const CARD_H = 150;

  // ── The angle spacing between cards on the full circle ────
  const angleStep = cardCount > 0 ? (Math.PI * 2) / cardCount : 0;

  // ── Continuous animation loop ──────────────────────────────
  useEffect(() => {
    if (cardCount === 0) return;

    function tick() {
      // Smooth speed interpolation
      currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * 0.08;

      if (!isPaused) {
        rotationRef.current += currentSpeedRef.current;
      }

      // Wrap rotation to prevent floating point drift
      if (rotationRef.current > Math.PI * 2) {
        rotationRef.current -= Math.PI * 2;
      }
      if (rotationRef.current < 0) {
        rotationRef.current += Math.PI * 2;
      }

      // Update card positions via DOM (no React re-render)
      const container = cardsContainerRef.current;
      if (!container) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const cards = container.children;
      let closestIdx = 0;
      let closestDist = Infinity;

      for (let i = 0; i < cardCount; i++) {
        const cardAngle = i * angleStep + rotationRef.current;
        const t = getCardTransform(cardAngle, RADIUS, CENTER_Y);
        const el = cards[i] as HTMLElement | undefined;
        if (!el) continue;

        el.style.transform = `translate(${t.x - CARD_W / 2 + 30}px, ${t.y - CARD_H / 2}px) scale(${t.scale}) rotate(${t.tiltDeg}deg)`;
        el.style.opacity = String(t.opacity);
        el.style.zIndex = String(t.zIndex);
        el.style.pointerEvents = t.isVisible ? 'auto' : 'none';

        // Border glow for closest to active
        if (Math.abs(t.norm) < closestDist) {
          closestDist = Math.abs(t.norm);
          closestIdx = i;
        }
      }

      // Update active card highlight (via data attribute)
      for (let i = 0; i < cardCount; i++) {
        const el = cards[i] as HTMLElement | undefined;
        if (!el) continue;
        if (i === closestIdx) {
          el.style.borderColor = 'rgba(0,240,255,0.5)';
          el.style.boxShadow = '0 0 40px rgba(0,240,255,0.1), 0 20px 60px rgba(0,0,0,0.6)';
          el.style.background = 'rgba(0,240,255,0.04)';
        } else {
          el.style.borderColor = 'rgba(0,240,255,0.08)';
          el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
          el.style.background = 'rgba(255,255,255,0.02)';
        }
      }

      setActiveIndex(closestIdx);
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [cardCount, angleStep, RADIUS, CENTER_Y, isPaused]);

  // ── Scroll to adjust speed/direction ───────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      // Scroll temporarily adjusts speed
      const boost = e.deltaY > 0 ? 0.025 : -0.025;
      currentSpeedRef.current += boost;
      // Auto-return to normal speed
      targetSpeedRef.current = 0.004;
    }

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // ── Pause on hover ─────────────────────────────────────────
  const handleCardEnter = useCallback(() => {
    targetSpeedRef.current = 0.001; // slow down on hover
  }, []);

  const handleCardLeave = useCallback(() => {
    targetSpeedRef.current = 0.004; // resume normal speed
  }, []);

  const activeBookmark = bookmarks[activeIndex];

  // ── Entrance animation ─────────────────────────────────────
  useGSAP(() => {
    gsap.fromTo('.arc-detail-panel', {
      opacity: 0,
      x: 40,
    }, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.3,
    });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* ── LEFT: Semicircle Arc ────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '55%',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Arc background rings */}
        {[RADIUS * 0.4, RADIUS * 0.65, RADIUS, RADIUS * 1.3, RADIUS * 1.55].map((r, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -r,
              top: CENTER_Y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `1px ${i % 2 === 0 ? 'solid' : 'dashed'} rgba(0,240,255,${0.025 + (i === 2 ? 0.025 : 0)})`,
              pointerEvents: 'none',
              transition: 'border-color 0.5s ease',
            }}
          />
        ))}

        {/* Center glow at the left edge */}
        <div style={{
          position: 'absolute',
          left: -120,
          top: CENTER_Y - 120,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Pulsing core dot */}
        <div style={{
          position: 'absolute',
          left: -4,
          top: CENTER_Y - 4,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--cyan)',
          boxShadow: '0 0 20px var(--cyan-glow), 0 0 60px var(--cyan-glow-soft)',
          animation: 'pulse-dot 2s ease infinite',
          zIndex: 25,
        }} />

        {/* Cards container — positioned via rAF, not React state */}
        <div ref={cardsContainerRef}>
          {bookmarks.map((bm, i) => (
            <div
              key={bm.id}
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
              onClick={() => { onPlay(bm.url); onSoundPlop?.(); }}
              style={{
                position: 'absolute',
                width: CARD_W,
                height: CARD_H,
                borderRadius: 14,
                border: '1px solid rgba(0,240,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                overflow: 'hidden',
                cursor: 'pointer',
                willChange: 'transform, opacity',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                transformOrigin: 'left center',
              }}
            >
              {/* Thumbnail */}
              <div style={{
                height: '58%',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <img
                  src={bm.thumbnail}
                  alt={bm.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '55%',
                  background: 'linear-gradient(transparent, rgba(10,10,10,0.9))',
                  pointerEvents: 'none',
                }} />
                {/* Duration badge */}
                <div style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 8,
                  background: 'rgba(0,0,0,0.85)',
                  borderRadius: 3,
                  padding: '1px 6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: '#fff',
                  lineHeight: 1.4,
                }}>
                  {bm.duration}
                </div>
                {/* Bookmark count pill */}
                {bm.bookmarks.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    background: 'rgba(255,0,0,0.85)',
                    borderRadius: 10,
                    padding: '1px 7px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: '#fff',
                    lineHeight: 1.4,
                  }}>
                    {bm.bookmarks.length} ●
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '6px 12px' }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: 2,
                }}>
                  {bm.title}
                </div>
                <div style={{
                  fontSize: '0.58rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {bm.channelName} · {bm.bookmarks[0]?.time ?? '0:00'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loop indicator */}
        <div style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          opacity: 0.4,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          CONTINUOUS LOOP · {cardCount} CARD{cardCount !== 1 ? 'S' : ''}
        </div>
      </div>

      {/* ── RIGHT: Detail Panel ────────────────────────────── */}
      <div
        className="arc-detail-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 50px 60px 40px',
          position: 'relative',
        }}
      >
        {activeBookmark ? (
          <>
            {/* Section label */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.25em',
              color: 'var(--cyan)',
              opacity: 0.5,
              marginBottom: 20,
              textTransform: 'uppercase',
            }}>
              // NOW SHOWING — {activeIndex + 1} OF {cardCount}
            </div>

            {/* Thumbnail preview */}
            <div style={{
              width: '100%',
              maxWidth: 380,
              aspectRatio: '16/9',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid rgba(0,240,255,0.15)',
              marginBottom: 20,
              position: 'relative',
            }}>
              <img
                src={activeBookmark.thumbnail}
                alt={activeBookmark.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Play overlay */}
              <div
                onClick={() => { onPlay(activeBookmark.url); onSoundPlop?.(); }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  opacity: 0,
                  transition: 'opacity 0.25s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(0,240,255,0.15)',
                  border: '2px solid rgba(0,240,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--cyan)">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.2rem, 2.2vw, 1.7rem)',
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: 'var(--text-primary)',
              marginBottom: 8,
              lineHeight: 1.25,
            }}>
              {activeBookmark.title}
            </h2>

            {/* Channel & time */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              marginBottom: 22,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>{activeBookmark.channelName}</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>{timeAgo(activeBookmark.addedAt)}</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span style={{ color: 'var(--red)' }}>{activeBookmark.duration}</span>
            </div>

            {/* Divider */}
            <div style={{
              width: 50,
              height: 1,
              background: 'linear-gradient(90deg, var(--cyan), transparent)',
              marginBottom: 20,
            }} />

            {/* Timestamps */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              marginBottom: 10,
              textTransform: 'uppercase',
            }}>
              BOOKMARKS ({activeBookmark.bookmarks.length})
            </div>

            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 28,
            }}>
              {activeBookmark.bookmarks.map((bk, i) => (
                <a
                  key={i}
                  href={`${activeBookmark.url}&t=${bk.timeSeconds}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,240,255,0.1)',
                    background: 'rgba(255,255,255,0.02)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,240,255,0.35)';
                    e.currentTarget.style.background = 'rgba(0,240,255,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,240,255,0.1)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    color: 'var(--red)',
                    fontWeight: 600,
                  }}>
                    {bk.time}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    maxWidth: 160,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {bk.label}
                  </span>
                </a>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <GlassLiquidFillButton
                onClick={() => { onPlay(activeBookmark.url); onSoundPlop?.(); }}
                className="text-xs py-2.5 px-6"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                Watch Now
              </GlassLiquidFillButton>

              <GlassLiquidFillButton
                onClick={() => onDelete(activeBookmark.id)}
                variant="red"
                className="text-xs py-2.5 px-6"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                Remove
              </GlassLiquidFillButton>

              {/* Pause/Resume */}
              <button
                onClick={() => setIsPaused(p => !p)}
                title={isPaused ? 'Resume rotation' : 'Pause rotation'}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid rgba(0,240,255,0.15)',
                  background: 'rgba(0,240,255,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)';
                  e.currentTarget.style.background = 'rgba(0,240,255,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)';
                  e.currentTarget.style.background = 'rgba(0,240,255,0.03)';
                }}
              >
                {isPaused ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--cyan)">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--cyan)">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                )}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
          }}>
            // LOADING VORTEX DATA...
          </div>
        )}

        {/* Clear all */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          right: 50,
        }}>
          <GlassLiquidFillButton
            onClick={onClearAll}
            variant="red"
            className="text-xs py-2 px-5"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
            Clear All
          </GlassLiquidFillButton>
        </div>

        {/* Bottom version */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: 40,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.56rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          opacity: 0.35,
        }}>
          {cardCount} IN ORBIT // v2.047
        </div>
      </div>
    </div>
  );
}
