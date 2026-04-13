// ============================================================
// BookmarkSkeleton
//
// Bookmark-shaped placeholder with vertical liquid wave shimmer.
// The shimmer travels top → bottom (not the common left → right)
// to evoke liquid dripping down.
// ============================================================

export function BookmarkSkeleton() {
  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid var(--border-cyan)',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: '88px 1fr 80px',
        gap: 16,
        alignItems: 'center',
        background: 'var(--glass)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Vertical shimmer overlay — spans entire card */}
      <div
        className="skeleton-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Thumbnail placeholder */}
      <div
        style={{
          width: 88,
          height: 54,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
        }}
      />

      {/* Content placeholders */}
      <div>
        {/* Title */}
        <div
          style={{
            height: 14,
            width: '75%',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.08)',
            marginBottom: 10,
          }}
        />
        {/* Pills row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ height: 20, width: 56, borderRadius: 12, background: 'rgba(255,0,0,0.1)' }} />
          <div style={{ height: 20, width: 80, borderRadius: 12, background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      {/* Action icon placeholders */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  );
}
