// ============================================================
// LandingPage
//
// Cinematic interactive landing page with:
// - Hero section: Massive animated title, floating particle canvas,
//   interactive vortex ring that responds to mouse
// - Features section: 3 glass cards that animate in on scroll
// - Auth section: Login/signup form
//
// Users cannot access the main app without authenticating.
// ============================================================

import { useRef, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthForm } from './AuthForm';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onAuthenticate: () => void;
}

// ── Particle system for hero background ─────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

function createParticle(W: number, H: number): Particle {
  const isCyan = Math.random() > 0.3;
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4 - 0.15,
    size: Math.random() * 2.5 + 0.5,
    alpha: Math.random() * 0.6 + 0.1,
    color: isCyan ? '0,240,255' : '255,0,0',
    life: 0,
    maxLife: 200 + Math.random() * 300,
  };
}

export function LandingPage({ onAuthenticate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // ── Particle canvas animation ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particlesRef.current = Array.from({ length: 80 }, () => createParticle(W, H));
    }

    resize();
    initParticles();

    let time = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      time += 0.01;

      // Draw vortex rings in center
      const cx = W * 0.5;
      const cy = H * 0.45;

      // Outer ring
      for (let r = 0; r < 3; r++) {
        const radius = 120 + r * 60;
        const segments = 60;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2 + time * (0.3 + r * 0.15) * (r % 2 === 0 ? 1 : -1);
          const wobble = Math.sin(angle * 3 + time * 2) * 4;
          const px = cx + (radius + wobble) * Math.cos(angle);
          const py = cy + (radius + wobble) * Math.sin(angle) * 0.6; // Elliptical
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        const alpha = 0.08 - r * 0.02;
        ctx.strokeStyle = r % 2 === 0
          ? `rgba(0,240,255,${alpha})`
          : `rgba(255,0,0,${alpha * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Central glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      coreGrad.addColorStop(0, `rgba(0,240,255,${0.06 + Math.sin(time * 2) * 0.02})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      particlesRef.current.forEach((p, i) => {
        p.life++;
        if (p.life > p.maxLife) {
          particlesRef.current[i] = createParticle(W, H);
          return;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Subtle attraction to center
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 50) {
          p.vx += (dx / dist) * 0.003;
          p.vy += (dy / dist) * 0.003;
        }

        // Mouse repulsion
        const mdx = p.x - mouseRef.current.x;
        const mdy = p.y - mouseRef.current.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 120 && mDist > 0) {
          p.vx += (mdx / mDist) * 0.15;
          p.vy += (mdy / mDist) * 0.15;
        }

        // Fade in/out based on life
        const lifeRatio = p.life / p.maxLife;
        const fadeAlpha = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.9 ? (1 - lifeRatio) * 10 : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha * fadeAlpha})`;
        ctx.fill();
      });

      // Connection lines between close particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,240,255,${0.04 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

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
    // Hero title animation
    gsap.fromTo('.landing-title-line', {
      opacity: 0,
      y: 40,
      skewY: 3,
    }, {
      opacity: 1,
      y: 0,
      skewY: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.15,
      delay: 0.3,
    });

    // Hero subtitle
    gsap.fromTo('.landing-subtitle', {
      opacity: 0,
      y: 20,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.9,
    });

    // Scroll indicator
    gsap.fromTo('.scroll-indicator', {
      opacity: 0,
    }, {
      opacity: 1,
      duration: 0.6,
      delay: 1.4,
    });

    gsap.to('.scroll-indicator-dot', {
      y: 12,
      duration: 1.2,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
    });

    // Feature cards — animate in when scrolled into view
    // IMPORTANT: immediateRender: false prevents GSAP from hiding
    // elements before the scroll trigger activates
    gsap.from('.feature-card-item', {
      opacity: 0,
      y: 50,
      scale: 0.9,
      duration: 0.8,
      ease: 'back.out(1.3)',
      stagger: 0.12,
      immediateRender: false,
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Features section heading
    gsap.from('.features-heading', {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power3.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Auth section fade in
    gsap.from('.auth-section-wrap', {
      opacity: 0,
      duration: 0.8,
      immediateRender: false,
      scrollTrigger: {
        trigger: authRef.current,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }, { scope: containerRef });

  // ── Smooth scroll to auth ──────────────────────────────────
  const scrollToAuth = useCallback(() => {
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: 'CAPTURE',
      desc: 'Save any YouTube moment with precision timestamps. Never lose that perfect scene again.',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: 'ORGANIZE',
      desc: 'Multiple bookmarks per video. Label, search, and filter your collection effortlessly.',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20" />
          <path d="M12 2c3 3 4.5 6.5 4.5 10S15 19 12 22" />
          <path d="M12 2c-3 3-4.5 6.5-4.5 10S9 19 12 22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      ),
      title: 'VORTEX VIEW',
      desc: 'Experience your bookmarks in a stunning semicircular vortex. Scroll to explore.',
    },
  ];

  return (
    <div ref={containerRef} style={{ position: 'relative', background: 'var(--black)' }}>
      {/* Particle canvas background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── HERO SECTION ────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '0 40px',
          textAlign: 'center',
        }}
      >
        {/* Top status bar */}
        <div style={{
          position: 'absolute',
          top: 30,
          left: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div className="status-dot" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
          }}>
            SYSTEM ONLINE // v2.047
          </span>
        </div>

        {/* Main title */}
        <div className="landing-title-line" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(3.5rem, 10vw, 8rem)',
          fontWeight: 700,
          lineHeight: 0.85,
          letterSpacing: '0.06em',
          marginBottom: 8,
          position: 'relative',
        }}>
          <span className="gradient-text-cyan" style={{ display: 'inline-block' }}>YTMARKER'S</span>
        </div>

        <div className="landing-title-line" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.2rem, 3.5vw, 2.5rem)',
          fontWeight: 600,
          letterSpacing: '0.35em',
          color: 'var(--red)',
          textShadow: '0 0 30px rgba(255,0,0,0.4)',
          marginBottom: 6,
        }}>
          THE BOOKMARKS
        </div>

        <div className="landing-title-line" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.6rem, 1.2vw, 0.8rem)',
          letterSpacing: '0.3em',
          color: 'var(--text-muted)',
          marginBottom: 40,
          textTransform: 'uppercase',
        }}>
          — Liquid Metal Bookmark Engine —
        </div>

        {/* Subtitle */}
        <p className="landing-subtitle" style={{
          fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
          color: 'var(--text-secondary)',
          maxWidth: 500,
          lineHeight: 1.8,
          marginBottom: 48,
          letterSpacing: '0.02em',
        }}>
          Save, organize, and explore your YouTube bookmarks
          in a cinematic vortex interface. Every moment captured,
          nothing lost.
        </p>

        {/* CTA */}
        <button
          onClick={scrollToAuth}
          style={{
            padding: '14px 40px',
            borderRadius: 50,
            border: '1px solid rgba(0,240,255,0.3)',
            background: 'rgba(0,240,255,0.05)',
            color: 'var(--cyan)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.88rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.35s ease',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--cyan)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(0,240,255,0.2)';
            e.currentTarget.style.background = 'rgba(0,240,255,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'rgba(0,240,255,0.05)';
          }}
        >
          Enter the Vortex ↓
        </button>

        {/* Scroll indicator */}
        <div className="scroll-indicator" style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 20,
            height: 32,
            borderRadius: 10,
            border: '1.5px solid rgba(0,240,255,0.25)',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 6,
          }}>
            <div className="scroll-indicator-dot" style={{
              width: 3,
              height: 6,
              borderRadius: 2,
              background: 'var(--cyan)',
              boxShadow: '0 0 6px var(--cyan-glow)',
            }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.2em',
          }}>
            SCROLL
          </span>
        </div>
      </section>

      {/* ── FEATURES SECTION ────────────────────────────────── */}
      <section
        ref={featuresRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 5,
          padding: '80px 40px',
        }}
      >
        {/* Section heading */}
        <div className="features-heading" style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            color: 'var(--cyan)',
            opacity: 0.6,
            marginBottom: 12,
            textTransform: 'uppercase',
          }}>
            // System capabilities
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }} className="gradient-text-cyan">
            BUILT FOR POWER
          </h2>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          maxWidth: 900,
          width: '100%',
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card-item"
              style={{
                padding: '36px 28px',
                borderRadius: 16,
                border: '1px solid rgba(0,240,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                textAlign: 'center',
                transition: 'all 0.35s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(0,240,255,0.06), 0 20px 60px rgba(0,0,0,0.5)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(0,240,255,0.1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Icon container */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                border: '1px solid rgba(0,240,255,0.12)',
                background: 'rgba(0,240,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                {f.icon}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: 'var(--text-primary)',
                marginBottom: 12,
              }}>
                {f.title}
              </h3>

              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                letterSpacing: '0.01em',
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Connecting line decoration */}
        <div style={{
          width: 1,
          height: 80,
          background: 'linear-gradient(to bottom, rgba(0,240,255,0.2), transparent)',
          marginTop: 60,
        }} />
      </section>

      {/* ── HOW IT WORKS SECTION ─────────────────────────────── */}
      <section
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 5,
          padding: '80px 40px',
        }}
      >
        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            color: 'var(--red)',
            opacity: 0.6,
            marginBottom: 12,
            textTransform: 'uppercase',
          }}>
            // How it works
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'var(--text-primary)',
          }}>
            <span style={{ color: 'var(--red)', textShadow: '0 0 20px rgba(255,0,0,0.3)' }}>3</span>{' '}
            <span className="gradient-text-cyan">SIMPLE STEPS</span>
          </h2>
        </div>

        {/* Steps */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0,
          maxWidth: 850,
          width: '100%',
        }}>
          {[
            {
              num: '01',
              title: 'INSTALL',
              desc: 'Add the YTMarker\'s extension to your browser. One click setup, zero config.',
              color: 'var(--cyan)',
            },
            {
              num: '02',
              title: 'BOOKMARK',
              desc: 'While watching any YouTube video, tap the marker to save the exact moment. Add labels for context.',
              color: 'var(--red)',
            },
            {
              num: '03',
              title: 'EXPLORE',
              desc: 'Open the vortex to browse, search, and replay your entire bookmark collection in style.',
              color: 'var(--cyan)',
            },
          ].map((step, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              {/* Connecting line between steps */}
              {i < 2 && (
                <div style={{
                  position: 'absolute',
                  top: 30,
                  left: '60%',
                  width: '80%',
                  height: 1,
                  background: `linear-gradient(90deg, ${step.color === 'var(--cyan)' ? 'rgba(0,240,255,0.2)' : 'rgba(255,0,0,0.2)'}, transparent)`,
                }} />
              )}

              {/* Step number */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: step.color,
                lineHeight: 1,
                marginBottom: 16,
                textShadow: step.color === 'var(--cyan)' ? '0 0 30px rgba(0,240,255,0.3)' : '0 0 30px rgba(255,0,0,0.3)',
              }}>
                {step.num}
              </div>

              {/* Step border dot */}
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: step.color,
                boxShadow: `0 0 12px ${step.color === 'var(--cyan)' ? 'rgba(0,240,255,0.5)' : 'rgba(255,0,0,0.5)'}`,
                margin: '0 auto 20px',
              }} />

              {/* Step title */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: 'var(--text-primary)',
                marginBottom: 12,
              }}>
                {step.title}
              </div>

              {/* Step description */}
              <p style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: 220,
                margin: '0 auto',
                letterSpacing: '0.01em',
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS / SOCIAL PROOF SECTION ──────────────────────── */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 5,
          padding: '60px 40px 100px',
        }}
      >
        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: 60,
          marginBottom: 50,
        }}>
          {[
            { value: '∞', label: 'BOOKMARKS', color: 'var(--cyan)' },
            { value: '0.1s', label: 'SAVE TIME', color: 'var(--red)' },
            { value: '24/7', label: 'ACCESS', color: 'var(--cyan)' },
            { value: '100%', label: 'FREE', color: 'var(--red)' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 700,
                color: stat.color,
                textShadow: stat.color === 'var(--cyan)' ? '0 0 20px rgba(0,240,255,0.3)' : '0 0 20px rgba(255,0,0,0.3)',
                marginBottom: 6,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: 450,
          lineHeight: 1.8,
          letterSpacing: '0.02em',
          fontStyle: 'italic',
          opacity: 0.7,
        }}>
          "Every moment you save is a memory you keep.
          The vortex never forgets."
        </p>

        {/* Divider line */}
        <div style={{
          width: 1,
          height: 60,
          background: 'linear-gradient(to bottom, rgba(255,0,0,0.2), transparent)',
          marginTop: 50,
        }} />
      </section>
      {/* ── AUTH SECTION ─────────────────────────────────────── */}
      <section
        ref={authRef}
        className="auth-section-wrap"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
          padding: '80px 40px',
        }}
      >
        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            color: 'var(--red)',
            opacity: 0.6,
            marginBottom: 12,
            textTransform: 'uppercase',
          }}>
            // Authentication required
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
          }}>
            <span className="gradient-text-cyan">ACCESS</span>{' '}
            <span style={{ color: 'var(--red)', textShadow: '0 0 20px rgba(255,0,0,0.3)' }}>PORTAL</span>
          </h2>
        </div>

        <AuthForm onAuthenticate={onAuthenticate} />

        {/* Bottom decoration */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.15em',
          opacity: 0.5,
        }}>
          KUSH YT BOOKMARKS // VORTEX ENGINE v2.047
        </div>
      </section>
    </div>
  );
}
