// ============================================================
// VortexEmptyState — "THE VOID"
//
// An immersive experience when the user has no bookmarks:
//
// 1. CENTRAL PORTAL: A massive animated vortex made of
//    concentric neon rings spinning at different speeds/directions.
//    The portal's core pulses with a breathing radial gradient.
//
// 2. GHOST THUMBNAILS: YouTube thumbnails slowly drift in from
//    screen edges, travel in curved paths toward the portal
//    center, shrink and fade as they approach — as if being
//    consumed by the vortex.
//
// 3. PARTICLE SPIRAL: Dozens of tiny glowing particles spiral
//    inward on a logarithmic curve, creating constant motion.
//
// 4. MOUSE INTERACTION: Moving the mouse near the portal causes
//    it to pulse and grow. The portal center shifts slightly
//    toward the cursor.
//
// 5. HUD ELEMENTS: Corner decorations, telemetry readouts,
//    and a radar sweep line add a sci-fi control room feel.
//
// 6. CTAs: "Browse Trending" and "Add Manual" buttons let users
//    start using the app.
// ============================================================

import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { GlassLiquidFillButton } from './GlassLiquidFillButton';
import { VORTEX_VIDEO_IDS } from '../utils/data';

interface Props {
  onBrowseTrending: () => void;
  onAddManual: () => void;
}

// ── Ghost thumbnail paths ───────────────────────────────────
interface GhostThumb {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  opacity: number;
  rotation: number;
  speed: number;
  angle: number;
  orbitRadius: number;
  life: number;
  maxLife: number;
}

// ── Spiral particle ─────────────────────────────────────────
interface SpiralParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
}

export function VortexEmptyState({ onBrowseTrending, onAddManual }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1, y: -1 });
  const ghostsRef = useRef<GhostThumb[]>([]);
  const spiralsRef = useRef<SpiralParticle[]>([]);
  const timeRef = useRef(0);
  const portalPulseRef = useRef(0);

  // ── Canvas animation system ────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let portalCX = 0, portalCY = 0;

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      portalCX = W * 0.38;
      portalCY = H * 0.5;
    }

    function initSpirals() {
      spiralsRef.current = Array.from({ length: 60 }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 200 + Math.random() * 350,
        speed: 0.003 + Math.random() * 0.008,
        size: 1 + Math.random() * 2,
        color: Math.random() > 0.35 ? '0,240,255' : '255,0,0',
        alpha: 0.15 + Math.random() * 0.35,
      }));
    }

    function spawnGhost() {
      if (ghostsRef.current.length >= 6) return;
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (side === 0) { x = -100; y = Math.random() * H; }         // left
      else if (side === 1) { x = W + 100; y = Math.random() * H; } // right
      else if (side === 2) { x = Math.random() * W; y = -80; }     // top
      else { x = Math.random() * W; y = H + 80; }                  // bottom

      ghostsRef.current.push({
        id: VORTEX_VIDEO_IDS[Math.floor(Math.random() * VORTEX_VIDEO_IDS.length)],
        x, y,
        targetX: portalCX,
        targetY: portalCY,
        scale: 0.6 + Math.random() * 0.5,
        opacity: 0.5,
        rotation: Math.random() * 360,
        speed: 0.4 + Math.random() * 0.6,
        angle: Math.atan2(portalCY - y, portalCX - x),
        orbitRadius: 0,
        life: 0,
        maxLife: 400 + Math.random() * 300,
      });
    }

    resize();
    initSpirals();

    // Pre-load ghost thumbnail images
    const thumbImages: { [key: string]: HTMLImageElement } = {};
    VORTEX_VIDEO_IDS.forEach(vid => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
      thumbImages[vid] = img;
    });

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      timeRef.current += 0.008;
      const t = timeRef.current;

      // Mouse proximity to portal
      const mdx = mouseRef.current.x - portalCX;
      const mdy = mouseRef.current.y - portalCY;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const mouseInfluence = mouseRef.current.x < 0 ? 0 : Math.max(0, 1 - mDist / 400);
      portalPulseRef.current += (mouseInfluence * 0.3 - portalPulseRef.current) * 0.05;

      const portalShiftX = portalCX + mdx * 0.02 * mouseInfluence;
      const portalShiftY = portalCY + mdy * 0.02 * mouseInfluence;

      // ── 1. PORTAL CORE GLOW ────────────────────────────────
      const coreRadius = 40 + portalPulseRef.current * 15 + Math.sin(t * 3) * 5;
      const coreGrad = ctx.createRadialGradient(
        portalShiftX, portalShiftY, 0,
        portalShiftX, portalShiftY, coreRadius * 2.5
      );
      coreGrad.addColorStop(0, `rgba(0,240,255,${0.12 + portalPulseRef.current * 0.08})`);
      coreGrad.addColorStop(0.4, `rgba(0,240,255,${0.04 + portalPulseRef.current * 0.03})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(portalShiftX, portalShiftY, coreRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner hot core
      const innerGrad = ctx.createRadialGradient(
        portalShiftX, portalShiftY, 0,
        portalShiftX, portalShiftY, coreRadius
      );
      innerGrad.addColorStop(0, `rgba(255,255,255,${0.06 + portalPulseRef.current * 0.04})`);
      innerGrad.addColorStop(0.5, `rgba(0,240,255,${0.08 + Math.sin(t * 2) * 0.02})`);
      innerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(portalShiftX, portalShiftY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. CONCENTRIC RINGS ────────────────────────────────
      const ringConfigs = [
        { radius: 80, width: 1.5, color: '0,240,255', speed: 0.4, alpha: 0.12, dashed: false },
        { radius: 130, width: 1, color: '255,0,0', speed: -0.25, alpha: 0.08, dashed: true },
        { radius: 180, width: 1.2, color: '0,240,255', speed: 0.18, alpha: 0.06, dashed: false },
        { radius: 240, width: 0.8, color: '0,240,255', speed: -0.12, alpha: 0.04, dashed: true },
        { radius: 310, width: 0.6, color: '255,0,0', speed: 0.08, alpha: 0.03, dashed: false },
      ];

      ringConfigs.forEach(ring => {
        const baseR = ring.radius + portalPulseRef.current * ring.radius * 0.08;
        ctx.save();
        ctx.translate(portalShiftX, portalShiftY);
        ctx.rotate(t * ring.speed);

        ctx.beginPath();
        const segments = 80;
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          const wobble = Math.sin(a * 5 + t * 2) * 3;
          const r = baseR + wobble;
          const px = r * Math.cos(a);
          const py = r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        if (ring.dashed) ctx.setLineDash([8, 12]);
        else ctx.setLineDash([]);

        ctx.strokeStyle = `rgba(${ring.color},${ring.alpha + portalPulseRef.current * 0.03})`;
        ctx.lineWidth = ring.width;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });

      // ── 3. RADAR SWEEP ─────────────────────────────────────
      const sweepAngle = t * 0.8;
      ctx.save();
      ctx.translate(portalShiftX, portalShiftY);
      ctx.rotate(sweepAngle);
      const sweepGrad = ctx.createLinearGradient(0, 0, 300, 0);
      sweepGrad.addColorStop(0, 'rgba(0,240,255,0.08)');
      sweepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 300, -0.05, 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ── 4. SPIRAL PARTICLES ────────────────────────────────
      spiralsRef.current.forEach(p => {
        p.angle += p.speed;
        p.radius -= 0.15;
        if (p.radius < 15) {
          p.radius = 200 + Math.random() * 350;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = portalShiftX + p.radius * Math.cos(p.angle);
        const py = portalShiftY + p.radius * Math.sin(p.angle);

        // Fade as approaching center
        const fadeAlpha = Math.min(1, (p.radius - 15) / 100);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha * fadeAlpha})`;
        ctx.fill();
      });

      // ── 5. GHOST THUMBNAILS ────────────────────────────────
      // Spawn occasionally
      if (Math.random() < 0.008 && ghostsRef.current.length < 6) {
        spawnGhost();
      }

      ghostsRef.current = ghostsRef.current.filter(ghost => {
        ghost.life++;
        if (ghost.life > ghost.maxLife) return false;

        // Move toward portal center with a curved path
        const dx = portalShiftX - ghost.x;
        const dy = portalShiftY - ghost.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 30) return false; // consumed by portal

        // Curved approach — add perpendicular velocity component
        const nx = dx / dist;
        const ny = dy / dist;
        const perpX = -ny;
        const perpY = nx;

        const curveStrength = Math.max(0, 1 - ghost.life / 100) * 0.3;
        ghost.x += (nx * ghost.speed + perpX * curveStrength * ghost.speed);
        ghost.y += (ny * ghost.speed + perpY * curveStrength * ghost.speed);

        // Scale and opacity based on distance
        const progress = ghost.life / ghost.maxLife;
        ghost.scale = (0.6 + Math.random() * 0.01) * (1 - progress * 0.6);
        ghost.opacity = Math.min(0.5, progress < 0.1 ? progress * 5 : 0.5) * (1 - progress * 0.7);
        ghost.rotation += 0.2;

        // Draw thumbnail
        const img = thumbImages[ghost.id];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.translate(ghost.x, ghost.y);
          ctx.rotate((ghost.rotation * Math.PI) / 180);
          ctx.globalAlpha = ghost.opacity;
          const w = 100 * ghost.scale;
          const h = 60 * ghost.scale;
          // Rounded rect clip
          ctx.beginPath();
          const r = 6 * ghost.scale;
          ctx.moveTo(-w/2 + r, -h/2);
          ctx.lineTo(w/2 - r, -h/2);
          ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
          ctx.lineTo(w/2, h/2 - r);
          ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
          ctx.lineTo(-w/2 + r, h/2);
          ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
          ctx.lineTo(-w/2, -h/2 + r);
          ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, -w/2, -h/2, w, h);
          ctx.restore();

          // Glow border
          ctx.save();
          ctx.translate(ghost.x, ghost.y);
          ctx.rotate((ghost.rotation * Math.PI) / 180);
          ctx.globalAlpha = ghost.opacity * 0.5;
          ctx.strokeStyle = 'rgba(0,240,255,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-w/2 + r, -h/2);
          ctx.lineTo(w/2 - r, -h/2);
          ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
          ctx.lineTo(w/2, h/2 - r);
          ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
          ctx.lineTo(-w/2 + r, h/2);
          ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
          ctx.lineTo(-w/2, -h/2 + r);
          ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }

        return true;
      });

      // ── 6. HUD CORNER BRACKETS ─────────────────────────────
      ctx.strokeStyle = 'rgba(0,240,255,0.08)';
      ctx.lineWidth = 1;
      const cs = 30; // corner size
      const margin = 25;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(margin, margin + cs); ctx.lineTo(margin, margin); ctx.lineTo(margin + cs, margin);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(W - margin - cs, margin); ctx.lineTo(W - margin, margin); ctx.lineTo(W - margin, margin + cs);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(margin, H - margin - cs); ctx.lineTo(margin, H - margin); ctx.lineTo(margin + cs, H - margin);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(W - margin - cs, H - margin); ctx.lineTo(W - margin, H - margin); ctx.lineTo(W - margin, H - margin - cs);
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // ── GSAP animations ────────────────────────────────────────
  useGSAP(() => {
    // Title glitch reveal
    gsap.fromTo('.void-title', {
      opacity: 0,
      y: 20,
      skewX: -10,
    }, {
      opacity: 1,
      y: 0,
      skewX: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.3,
    });

    gsap.fromTo('.void-subtitle', {
      opacity: 0,
      y: 15,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.6,
    });

    gsap.fromTo('.void-desc', {
      opacity: 0,
      y: 10,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      delay: 0.85,
    });

    gsap.fromTo('.void-cta', {
      opacity: 0,
      y: 15,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.1,
      delay: 1.1,
    });

    // Telemetry readout animation
    gsap.fromTo('.void-telemetry', {
      opacity: 0,
    }, {
      opacity: 1,
      duration: 0.4,
      stagger: 0.15,
      delay: 1.4,
    });

    // Periodic glitch on title
    function glitchPulse() {
      const el = document.querySelector('.void-title');
      if (!el) return;
      gsap.to(el, {
        skewX: () => (Math.random() - 0.5) * 8,
        x: () => (Math.random() - 0.5) * 4,
        duration: 0.07,
        ease: 'none',
        onComplete: () => {
          gsap.to(el, { skewX: 0, x: 0, duration: 0.07, ease: 'none' });
        },
      });
      gsap.delayedCall(3 + Math.random() * 5, glitchPulse);
    }
    gsap.delayedCall(2, glitchPulse);

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
      {/* Void canvas — full screen behind everything */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── RIGHT SIDE: Content ───────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          marginLeft: '50%',
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 50px 60px 40px',
          minHeight: '100vh',
        }}
      >
        {/* System status */}
        <div className="void-telemetry" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.25em',
          color: 'var(--cyan)',
          opacity: 0.5,
          marginBottom: 24,
          textTransform: 'uppercase',
        }}>
          // VORTEX CORE — AWAITING INPUT
        </div>

        {/* Main title */}
        <h1
          className="void-title"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            fontWeight: 700,
            lineHeight: 0.85,
            letterSpacing: '0.06em',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          <span className="gradient-text-cyan">THE</span>{' '}
          <span style={{
            color: 'var(--red)',
            textShadow: '0 0 30px rgba(255,0,0,0.5), 0 0 60px rgba(255,0,0,0.2)',
          }}>VOID</span>
        </h1>

        {/* Subtitle */}
        <div className="void-subtitle" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(0.9rem, 2vw, 1.3rem)',
          fontWeight: 600,
          letterSpacing: '0.25em',
          color: 'var(--cyan)',
          marginBottom: 24,
          textTransform: 'uppercase',
          opacity: 0.7,
        }}>
          AWAITS YOUR DATA
        </div>

        {/* Divider */}
        <div style={{
          width: 80,
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
          marginBottom: 28,
        }} />

        {/* Description */}
        <p className="void-desc" style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
          maxWidth: 340,
          textAlign: 'center',
          marginBottom: 44,
          letterSpacing: '0.015em',
        }}>
          Your vortex is hungry. Start watching videos and save your
          favorite moments — watch them get pulled into the void.
        </p>

        {/* CTAs */}
        <div className="void-cta" style={{ marginBottom: 12 }}>
          <GlassLiquidFillButton onClick={onBrowseTrending}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            Browse Trending Videos
          </GlassLiquidFillButton>
        </div>

        <div className="void-cta">
          <GlassLiquidFillButton onClick={onAddManual} variant="red" className="text-xs py-2.5 px-6">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Manual Bookmark
          </GlassLiquidFillButton>
        </div>

        {/* Bottom telemetry */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          display: 'flex',
          gap: 40,
        }}>
          <div className="void-telemetry" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textAlign: 'center',
          }}>
            <div style={{ color: 'var(--red)', marginBottom: 2 }}>0</div>
            BOOKMARKS
          </div>
          <div className="void-telemetry" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textAlign: 'center',
          }}>
            <div style={{ color: 'var(--cyan)', marginBottom: 2 }}>∅</div>
            TIMESTAMPS
          </div>
          <div className="void-telemetry" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textAlign: 'center',
          }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>—</div>
            CHANNELS
          </div>
        </div>
      </div>

      {/* ── Left side vignette ──────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '55%',
        height: '100%',
        background: 'radial-gradient(ellipse at 38% 50%, transparent 30%, rgba(10,10,10,0.5) 80%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Corner version */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        right: 30,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
        opacity: 0.4,
        zIndex: 3,
      }}>
        v2.047 // KUSH
      </div>
    </div>
  );
}
