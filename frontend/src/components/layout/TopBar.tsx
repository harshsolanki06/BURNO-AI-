'use client';

import { motion } from 'framer-motion';
import { Bell, Search, Wifi, Mic, ChevronDown, Zap, X, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SystemStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  status?: SystemStatus;
}

export default function TopBar({ status }: TopBarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const displayName = user?.name || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [micActive, setMicActive] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.header
      className="fixed top-0 right-0 z-40 flex items-center justify-between px-5"
      style={{
        left: 72,
        height: 60,
        background: 'rgba(2,5,16,0.88)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Subtle top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.15) 30%, rgba(139,92,246,0.12) 70%, transparent 100%)' }}
      />

      {/* ── Left ─────────────────────────────────────────── */}
      <div className="flex items-center gap-5">
        {/* System online badge */}
        <div className="flex items-center gap-2">
          <div className="dot-live" />
          <span className="label-accent">ALL SYSTEMS ONLINE</span>
        </div>

        {/* Divider */}
        <div className="divider-v" style={{ height: 24 }} />

        {/* Latency */}
        {status && (
          <div className="hidden lg:flex items-center gap-1.5">
            <Zap size={11} style={{ color: 'rgba(0,212,255,0.6)' }} />
            <span className="mono" style={{ fontSize: 10, color: 'rgba(0,212,255,0.7)' }}>
              {status.apiLatency}ms
            </span>
          </div>
        )}

        {/* Search bar */}
        <motion.div
          className="relative hidden md:flex items-center"
          animate={{ width: searchOpen ? 320 : 240 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Search
            size={13}
            style={{ position: 'absolute', left: 12, color: 'rgba(74,96,128,0.6)', zIndex: 1 }}
          />
          <input
            ref={searchRef}
            className="input"
            style={{ paddingLeft: 36, paddingRight: 48, paddingTop: 8, paddingBottom: 8, fontSize: 12 }}
            placeholder="Ask BURNO anything…"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => { if (!searchVal) setSearchOpen(false); }}
          />
          <div className="absolute right-3 flex items-center gap-1" style={{ zIndex: 1 }}>
            {searchVal ? (
              <button onClick={() => { setSearchVal(''); setSearchOpen(false); }}>
                <X size={12} style={{ color: 'rgba(74,96,128,0.5)' }} />
              </button>
            ) : (
              <div className="flex items-center gap-0.5">
                <kbd className="mono" style={{ fontSize: 9, color: 'rgba(74,96,128,0.4)', background: 'rgba(255,255,255,0.04)', padding: '1px 4px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Right ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Real-time clock */}
        <div className="text-right hidden lg:block">
          <p className="mono" style={{ fontSize: 13, color: '#00d4ff', letterSpacing: '0.06em', lineHeight: 1 }}>{time}</p>
          <p className="label" style={{ marginTop: 3 }}>{date}</p>
        </div>

        <div className="divider-v" style={{ height: 28 }} />

        {/* AI Model badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" style={{ boxShadow: '0 0 6px rgba(139,92,246,0.7)' }} />
          <span className="label" style={{ color: 'rgba(139,92,246,0.9)', letterSpacing: '0.1em' }}>GROQ LLAMA 3</span>
        </div>

        {/* WS status */}
        <div className="flex items-center gap-1.5">
          <Wifi size={13} style={{ color: '#10b981' }} />
          <span className="label" style={{ color: '#10b981' }}>LIVE</span>
        </div>

        {/* Mic button */}
        <motion.button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: micActive ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.06)',
            border: `1px solid ${micActive ? 'rgba(0,212,255,0.35)' : 'rgba(0,212,255,0.12)'}`,
          }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,212,255,0.14)' }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setMicActive(v => !v)}
        >
          <Mic size={13} style={{ color: '#00d4ff' }} />
          {micActive && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{ border: '1px solid rgba(0,212,255,0.4)' }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* Notifications */}
        <motion.button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.94 }}
        >
          <Bell size={13} style={{ color: 'rgba(138,160,192,0.7)' }} />
          <motion.div
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.7)' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        {/* User avatar + menu */}
        <div style={{ position: 'relative' }}>
          <motion.div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(0,212,255,0.15)' }}
            onClick={() => setShowUserMenu(v => !v)}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: isAuthenticated ? 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(99,102,241,0.25))' : 'rgba(255,255,255,0.06)' }}
            >
              <span className="orbitron font-black" style={{ fontSize: 10, color: isAuthenticated ? '#00d4ff' : '#6b7280' }}>{initial}</span>
            </div>
            <span className="text-xs font-medium hidden sm:block" style={{ color: isAuthenticated ? '#7a96bb' : '#4b5563' }}>{displayName}</span>
            <ChevronDown size={11} style={{ color: 'rgba(74,96,128,0.5)' }} />
          </motion.div>

          {/* Dropdown menu */}
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                minWidth: 180,
                background: 'rgba(5,10,28,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '0.4rem',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                zIndex: 100,
              }}
            >
              {isAuthenticated ? (
                <>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.3rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#e2eeff', fontWeight: 600 }}>{user?.name}</p>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(180,200,255,0.4)', marginTop: 2 }}>{user?.email}</p>
                  </div>
                  <button
                    id="topbar-logout"
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: 'transparent',
                      color: '#f87171',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </>
              ) : (
                <div style={{ padding: '0.5rem 0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(180,200,255,0.5)' }}>Guest session — no account</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
