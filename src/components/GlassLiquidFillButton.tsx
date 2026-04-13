// ============================================================
// GlassLiquidFillButton
//
// A glassmorphic button with internal liquid fill animation:
// - Hover: cyan liquid rises from bottom (CSS transition)
// - Click:  GSAP-driven red splash burst that overflows then drains
// - The liquid element is an absolutely-positioned div inside the button
// ============================================================

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'cyan' | 'red';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function GlassLiquidFillButton({
  children,
  onClick,
  variant = 'cyan',
  className = '',
  disabled = false,
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const liquidRef = useRef<HTMLDivElement>(null);
  const [isSplashing, setIsSplashing] = useState(false);

  useGSAP(() => {
    // Nothing on mount — animations are triggered on events
  }, []);

  function handleClick() {
    if (disabled || isSplashing) return;
    setIsSplashing(true);

    // GSAP red splash sequence:
    // 1. Liquid shoots up instantly (burst)
    // 2. Holds briefly
    // 3. Drains back down smoothly
    const liq = liquidRef.current;
    if (!liq) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsSplashing(false);
        // Reset to un-hovered state
        gsap.set(liq, { clearProps: 'all' });
      }
    });

    tl
      .to(liq, {
        bottom: '0%',
        height: '130%',
        borderRadius: '0',
        backgroundColor: 'rgba(255,0,0,0.38)',
        backgroundImage: 'none',
        duration: 0.12,
        ease: 'power3.out',
      })
      .to(liq, {
        scaleX: 1.08,
        duration: 0.08,
        ease: 'power2.out',
      })
      .to(liq, {
        scaleX: 1,
        duration: 0.06,
        ease: 'power2.in',
      })
      .to(liq, {
        bottom: '-120%',
        height: '220%',
        borderRadius: '50% 50% 0 0',
        backgroundColor: 'transparent',
        duration: 0.55,
        ease: 'power3.in',
        delay: 0.14,
      });

    onClick?.();
  }

  const isCyan = variant === 'cyan';

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled}
      className={`
        btn-glass ${!isCyan ? 'btn-glass-red' : ''}
        rounded-full px-8 py-3 text-sm tracking-widest uppercase
        font-display font-semibold
        transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed
        select-none
        ${className}
      `}
    >
      {/* The liquid fill element */}
      <div
        ref={liquidRef}
        className="btn-liquid"
        style={{
          // Initial state — below the button
          position: 'absolute',
          bottom: '-110%',
          left: '-10%',
          width: '120%',
          height: '220%',
          borderRadius: '50% 50% 0 0',
          pointerEvents: 'none',
          zIndex: 0,
          background: isCyan
            ? 'radial-gradient(ellipse at 50% 80%, rgba(0,240,255,0.22), rgba(0,240,255,0.06))'
            : 'radial-gradient(ellipse at 50% 80%, rgba(255,0,0,0.25), rgba(255,0,0,0.06))',
          transition: 'bottom 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      />

      {/* Button text content */}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </span>
    </button>
  );
}
