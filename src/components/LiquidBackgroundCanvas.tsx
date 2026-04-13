// ============================================================
// LiquidBackgroundCanvas
// Renders slow-moving radial gradient "liquid blobs" on a canvas.
// Uses requestAnimationFrame for smooth 60fps animation.
// Each blob drifts slowly across the screen and pulses gently.
// ============================================================

import { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorA: string; // inner stop
  colorB: string; // outer stop
  phase: number;  // used for pulsing radius
  phaseSpeed: number;
}

export function LiquidBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const blobsRef = useRef<Blob[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;

    /** Size canvas to viewport */
    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    /** Initialize blobs with random positions, velocities, colors */
    function initBlobs() {
      const blobDefs = [
        // cyan blobs
        { colorA: 'rgba(0,240,255,0.07)', colorB: 'rgba(0,240,255,0)' },
        { colorA: 'rgba(0,240,255,0.05)', colorB: 'rgba(0,240,255,0)' },
        { colorA: 'rgba(0,200,255,0.06)', colorB: 'rgba(0,200,255,0)' },
        // red blobs
        { colorA: 'rgba(255,0,0,0.055)', colorB: 'rgba(255,0,0,0)' },
        { colorA: 'rgba(255,30,0,0.04)', colorB: 'rgba(255,30,0,0)' },
        // mixed
        { colorA: 'rgba(0,240,255,0.04)', colorB: 'rgba(0,240,255,0)' },
      ];

      blobsRef.current = blobDefs.map(({ colorA, colorB }) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, // very slow drift
        vy: (Math.random() - 0.5) * 0.25,
        radius: 160 + Math.random() * 220,
        colorA,
        colorB,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.006 + Math.random() * 0.006,
      }));
    }

    resize();
    initBlobs();

    function drawSafe() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      blobsRef.current.forEach(blob => {
        blob.x += blob.vx;
        blob.y += blob.vy;
        if (blob.x < -blob.radius || blob.x > W + blob.radius) blob.vx *= -1;
        if (blob.y < -blob.radius || blob.y > H + blob.radius) blob.vy *= -1;
        blob.phase += blob.phaseSpeed;
        const r = blob.radius + Math.sin(blob.phase) * 28;
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, r);
        grad.addColorStop(0, blob.colorA);
        grad.addColorStop(1, blob.colorB);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      frameRef.current = requestAnimationFrame(drawSafe);
    }

    frameRef.current = requestAnimationFrame(drawSafe);

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
}
