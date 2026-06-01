'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Brain, Zap, TrendingUp, Eye } from 'lucide-react';
import AICoreOrb from '@/components/three/AICoreOrb';

const HERO_STATS = [
  { label: 'Agents',      value: 6,   icon: Brain,       color: '#8b5cf6' },
  { label: 'Tasks',       value: 847, icon: Zap,         color: '#00d4ff' },
  { label: 'Automations', value: 23,  icon: TrendingUp,  color: '#10b981' },
  { label: 'Scans',       value: 12,  icon: Eye,         color: '#f472b6' },
];

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];

function StatPill({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 30;
    const inc = value / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += inc;
      if (cur >= value) { setCount(value); clearInterval(id); }
      else setCount(Math.floor(cur));
    }, 40);
    return () => clearInterval(id);
  }, [value]);

  return (
    <motion.div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
      style={{ background: `${color}08`, border: `1px solid ${color}18` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ borderColor: `${color}35`, background: `${color}12` }}
    >
      <Icon size={14} style={{ color, flexShrink: 0 }} />
      <span className="mono font-semibold text-sm" style={{ color }}>{count}</span>
      <span className="label" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </motion.div>
  );
}

export default function HeroPanel() {
  const [greeting, setGreeting] = useState('Good evening');
  useEffect(() => {
    const hour = new Date().getHours();
    const activeGreeting = hour < 12 ? GREETINGS[0] : hour < 18 ? GREETINGS[1] : GREETINGS[2];
    const timer = setTimeout(() => setGreeting(activeGreeting), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="glass-panel relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ padding: '40px 48px' }}
    >
      {/* HUD corners */}
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 70% 80% at 75% 50%, rgba(59,130,246,0.055) 0%, transparent 60%),
                     radial-gradient(ellipse 40% 60% at 10% 80%, rgba(139,92,246,0.04) 0%, transparent 55%)`
      }} />

      {/* Layout: text left, orb right */}
      <div className="flex items-center justify-between gap-12">

        {/* ── Left: Text ────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Label */}
          <motion.div
            className="flex items-center gap-2 mb-5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="dot-cyan" />
            <span className="label-accent tracking-widest">ECHOVERSE AI OS v2.0</span>
          </motion.div>

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-bold leading-tight" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 32 }}>
              <span className="gradient-text">{greeting},</span>
              <br />
              <span style={{ color: '#e2eeff' }}>Commander</span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-sm mt-4 leading-relaxed"
            style={{ color: 'var(--text-secondary)', maxWidth: 380 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            All agents online. Neural systems nominal.<br />
            How may I assist you today?
          </motion.p>

          {/* Stat pills row */}
          <motion.div
            className="flex items-center gap-3 mt-8 flex-wrap"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {HERO_STATS.map(s => (
              <StatPill key={s.label} {...s} />
            ))}
          </motion.div>
        </div>

        {/* ── Right: AI Core Orb ───────────────────────── */}
        <motion.div
          className="flex-shrink-0 relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Backdrop rings */}
          {[1.55, 1.28].map((scale, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 280 * scale,
                height: 280 * scale,
                border: `1px solid rgba(0,212,255,${0.05 - i * 0.02})`,
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 28 + i * 10, repeat: Infinity, ease: 'linear' }}
            />
          ))}
          <AICoreOrb state="idle" size={280} />
        </motion.div>
      </div>
    </motion.div>
  );
}
