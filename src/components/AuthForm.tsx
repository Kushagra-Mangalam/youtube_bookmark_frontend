// ============================================================
// AuthForm
//
// Glassmorphic login/signup toggle form.
// Demo-only auth: stores isAuthenticated flag in localStorage.
// GSAP animated mode transitions (login ↔ signup).
// ============================================================

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { GlassLiquidFillButton } from './GlassLiquidFillButton';
import { loginUser, registerUser } from '../utils/auth';
interface Props {
  onAuthenticate: () => void;
}

const AUTH_KEY = 'kush_yt_auth';

export function AuthForm({ onAuthenticate }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // ── Entrance animation ────────────────────────────────────
  useGSAP(() => {
    gsap.fromTo(panelRef.current, {
      opacity: 0,
      y: 60,
      scale: 0.95,
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: 'back.out(1.3)',
    });
  }, { scope: panelRef });

  // ── Mode toggle animation ─────────────────────────────────
  function toggleMode() {
    if (!formRef.current) return;
    gsap.to(formRef.current, {
      opacity: 0,
      x: mode === 'login' ? -20 : 20,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setMode(m => m === 'login' ? 'signup' : 'login');
        setError('');
        setPassword('');
        setConfirmPassword('');
        gsap.fromTo(formRef.current, {
          opacity: 0,
          x: mode === 'login' ? 20 : -20,
        }, {
          opacity: 1,
          x: 0,
          duration: 0.35,
          ease: 'power3.out',
        });
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim() || password.length < 3) {
      setError('Password must be at least 3 characters');
      return;
    }
    if (mode === 'signup') {
      if (!username.trim()) {
        setError('Username is required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    try {
      let response;

      if (mode === 'login') {
        response = await loginUser({
          email: email.trim(),
          password: password.trim()
        });

      } else {
        response = await registerUser({
          name: username.trim(),
          email: email.trim(),
          password,
        });
      }
      if (response?.token?.access) {
        localStorage.setItem("access", response.token.access);
        localStorage.setItem("refresh", response.token.refresh);
        // Set the auth flag that App.tsx expects
        localStorage.setItem(AUTH_KEY, "true");

        // Animate out then authenticate
        gsap.to(panelRef.current, {
          opacity: 0,
          scale: 0.92,
          y: -30,
          duration: 0.45,
          ease: 'power3.in',
          onComplete: onAuthenticate,
        });
      } else {
        setError("Authentication failed: No token received");
      }
    } catch (err: any) {
      console.error("Auth error:", err);

      // Error #31 Fix: Ensure the error we pass to state is always a string.
      let message = "Connection to Vortex failed.";
      const responseData = err.response?.data;

      if (typeof responseData === 'string') {
        message = responseData;
      } else if (responseData?.error) {
        // Handle { error: "..." } or { error: { message: "..." } }
        message = typeof responseData.error === 'string' 
          ? responseData.error 
          : (responseData.error.message || JSON.stringify(responseData.error));
      } else if (responseData?.message) {
        // Handle { message: "..." }
        message = responseData.message;
      } else if (responseData && typeof responseData === 'object') {
        // Handle field errors: { email: ["..."] }
        const values = Object.values(responseData);
        if (values.length > 0) {
          const firstVal = values[0];
          message = Array.isArray(firstVal) ? firstVal[0] : JSON.stringify(responseData);
        }
      } else if (err.message) {
        // Fallback to axios error message if no response data
        message = err.message;
      }

      setError(message);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 10,
    border: '1px solid rgba(0,240,255,0.15)',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.88rem',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.62rem',
    color: 'rgba(0,240,255,0.6)',
    letterSpacing: '0.2em',
    marginBottom: 6,
    display: 'block',
    textTransform: 'uppercase',
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: 420,
        maxWidth: '92vw',
        background: 'rgba(12,12,12,0.92)',
        border: '1px solid rgba(0,240,255,0.12)',
        borderRadius: 20,
        padding: '36px 32px 32px',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        boxShadow: '0 0 80px rgba(0,240,255,0.06), 0 40px 80px rgba(0,0,0,0.8)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow orb */}
      <div style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.8rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          marginBottom: 4,
        }} className="gradient-text-cyan">
          {mode === 'login' ? '// ACCESS VORTEX' : '// CREATE IDENTITY'}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
        }}>
          {mode === 'login'
            ? 'Authenticate to enter the vortex'
            : 'Register a new vortex identity'}
        </div>
      </div>

      {/* Mode toggle tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(0,240,255,0.1)',
        marginBottom: 24,
      }}>
        {(['login', 'signup'] as const).map(m => (
          <button
            key={m}
            onClick={() => { if (m !== mode) toggleMode(); }}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${mode === m ? 'var(--cyan)' : 'transparent'}`,
              color: mode === m ? 'var(--cyan)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            {m === 'login' ? 'LOGIN' : 'SIGN UP'}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="vortex_user"
                style={inputStyle}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(0,240,255,0.4)';
                  e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(0,240,255,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="user@vortex.io"
              style={inputStyle}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(0,240,255,0.4)';
                e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(0,240,255,0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(0,240,255,0.4)';
                e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(0,240,255,0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(0,240,255,0.4)';
                  e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(0,240,255,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            color: 'var(--red)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            marginTop: 14,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(255,0,0,0.06)',
            border: '1px solid rgba(255,0,0,0.15)',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: 24 }}>
          <GlassLiquidFillButton
            onClick={() => { }}
            className="w-full text-sm py-3.5"
            type="submit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            {mode === 'login' ? 'Enter the Vortex' : 'Create & Enter'}
          </GlassLiquidFillButton>
        </div>
      </form>

      {/* Bottom decoration */}
      <div style={{
        marginTop: 24,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
      }}>
        {mode === 'login' ? 'NO ACCOUNT?' : 'ALREADY REGISTERED?'}
        <span
          onClick={toggleMode}
          style={{
            color: 'var(--cyan)',
            cursor: 'pointer',
            marginLeft: 6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.target as HTMLElement).style.opacity = '0.7'}
          onMouseLeave={e => (e.target as HTMLElement).style.opacity = '1'}
        >
          {mode === 'login' ? 'CREATE ONE →' : '← LOGIN'}
        </span>
      </div>
    </div>
  );
}
