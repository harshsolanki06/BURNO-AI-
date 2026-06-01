'use client';

/**
 * EchoVerse AI OS — Login / Register Page
 * Futuristic glassmorphism auth form with animated background
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// ─── Particle canvas for background ──────────────────────────────────────────
function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

// ─── Input field component ─────────────────────────────────────────────────
function AuthInput({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: focused ? '#00d4ff' : 'rgba(180,200,255,0.5)',
          marginBottom: '0.4rem',
          fontFamily: 'JetBrains Mono, monospace',
          transition: 'color 0.2s',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          background: focused
            ? 'rgba(0, 212, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${focused ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          color: '#e2eeff',
          fontSize: '0.9rem',
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          transition: 'all 0.2s',
          boxSizing: 'border-box',
          boxShadow: focused ? '0 0 0 2px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
        }}
      />
    </div>
  );
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────
export default function AuthPage({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const { login, register, error, clearError, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clear errors when switching modes
  useEffect(() => {
    setLocalError('');
    clearError();
    setName('');
    setEmail('');
    setPassword('');
  }, [mode, clearError]);

  // Propagate context errors to local
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setLocalError('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onSuccess();
    } catch {
      // error already set by context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020510',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AuthBackground />

      {/* Ambient glow blobs */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          left: '15%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '10%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(99,51,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 440,
          margin: '0 1rem',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* HUD corners */}
        {[
          { top: 0, left: 0, borderTop: '1px solid rgba(0,212,255,0.4)', borderLeft: '1px solid rgba(0,212,255,0.4)', borderRadius: '1.5rem 0 0 0' },
          { top: 0, right: 0, borderTop: '1px solid rgba(0,212,255,0.4)', borderRight: '1px solid rgba(0,212,255,0.4)', borderRadius: '0 1.5rem 0 0' },
          { bottom: 0, left: 0, borderBottom: '1px solid rgba(0,212,255,0.4)', borderLeft: '1px solid rgba(0,212,255,0.4)', borderRadius: '0 0 0 1.5rem' },
          { bottom: 0, right: 0, borderBottom: '1px solid rgba(0,212,255,0.4)', borderRight: '1px solid rgba(0,212,255,0.4)', borderRadius: '0 0 1.5rem 0' },
        ].map((style, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 18,
              height: 18,
              ...style,
            }}
          />
        ))}

        {/* Logo / brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 1rem',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, rgba(0,212,255,0.3), rgba(99,51,255,0.2))',
              border: '1px solid rgba(0,212,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 0 30px rgba(0,212,255,0.2)',
            }}
          >
            🌌
          </motion.div>

          <h1
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1.4rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00d4ff 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              letterSpacing: '0.05em',
            }}
          >
            EchoVerse AI OS
          </h1>
          <p
            style={{
              fontSize: '0.72rem',
              color: 'rgba(180,200,255,0.4)',
              marginTop: '0.3rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {mode === 'login' ? 'System Access' : 'Create Account'}
          </p>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '0.75rem',
            padding: '3px',
            marginBottom: '1.75rem',
            gap: '3px',
          }}
        >
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              id={`auth-tab-${m}`}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.55rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
                background:
                  mode === m
                    ? 'rgba(0,212,255,0.12)'
                    : 'transparent',
                color: mode === m ? '#00d4ff' : 'rgba(180,200,255,0.4)',
                boxShadow: mode === m ? '0 0 12px rgba(0,212,255,0.1)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <AuthInput
                  id="auth-name"
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthInput
            id="auth-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <AuthInput
            id="auth-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {/* Error message */}
          <AnimatePresence>
            {localError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  borderRadius: '0.6rem',
                  padding: '0.6rem 0.9rem',
                  fontSize: '0.78rem',
                  color: '#f87171',
                  marginBottom: '1rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                ⚠️ {localError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <button
            id="auth-submit"
            type="submit"
            disabled={submitting || isLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '0.85rem',
              border: '1px solid rgba(0,212,255,0.3)',
              background: submitting
                ? 'rgba(0,212,255,0.05)'
                : 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(99,51,255,0.15) 100%)',
              color: submitting ? 'rgba(0,212,255,0.5)' : '#00d4ff',
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.06em',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: submitting ? 'none' : '0 0 20px rgba(0,212,255,0.1)',
              marginTop: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                (e.target as HTMLButtonElement).style.boxShadow = '0 0 32px rgba(0,212,255,0.2)';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(0,212,255,0.6)';
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,212,255,0.1)';
              (e.target as HTMLButtonElement).style.borderColor = 'rgba(0,212,255,0.3)';
            }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(0,212,255,0.3)', borderTopColor: '#00d4ff', borderRadius: '50%' }}
                />
                {mode === 'login' ? 'Authenticating…' : 'Creating account…'}
              </span>
            ) : (
              mode === 'login' ? '→ Access System' : '→ Create Account'
            )}
          </button>
        </form>

        {/* Guest mode link */}
        <div style={{ textAlign: 'center', marginTop: '1.4rem' }}>
          <button
            id="auth-guest"
            onClick={onSuccess}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.73rem',
              color: 'rgba(180,200,255,0.35)',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.04em',
              transition: 'color 0.2s',
              textDecoration: 'underline',
              textDecorationColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.color = 'rgba(180,200,255,0.6)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.color = 'rgba(180,200,255,0.35)';
            }}
          >
            Continue as guest (no account required)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
