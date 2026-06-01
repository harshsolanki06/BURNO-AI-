'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ActivityItem } from '@/types';
import { useEffect, useState } from 'react';

interface ActivityFeedProps {
  items: ActivityItem[];
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  agent:      { label: 'Agent',      color: '#10b981' },
  memory:     { label: 'Memory',     color: '#00d4ff' },
  voice:      { label: 'Voice',      color: '#8b5cf6' },
  automation: { label: 'Automation', color: '#f97316' },
  task:       { label: 'Research',   color: '#3b82f6' },
  system:     { label: 'System',     color: '#14b8a6' },
};

export default function ActivityFeed({ items }: ActivityFeedProps) {
  const [mounted, setMounted] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const id = setInterval(() => tick(v => v + 1), 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(id);
    };
  }, []);

  const recent = items.slice(0, 5);

  return (
    <motion.div
      className="glass-panel relative overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.6 }}
      style={{ padding: '24px' }}
    >
      <div className="hud-corner-tl" />
      <div className="hud-corner-br" />

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#e2eeff' }}>Recent Activity</h3>
          <p className="label mt-0.5">Agent operations log</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#10b981' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="label" style={{ color: '#10b981', fontSize: 9 }}>LIVE</span>
        </div>
      </div>

      {/* ── Items ───────────────────────────────────── */}
      <div className="flex flex-col gap-2 flex-1">
        <AnimatePresence initial={false}>
          {recent.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type] || { label: item.type, color: item.color };
            return (
              <motion.div
                key={item.id}
                className="group relative flex items-start gap-3 p-3 rounded-2xl cursor-default overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{
                  background: `rgba(${hexToRgbStr(cfg.color)},0.04)`,
                  borderColor: `${cfg.color}20`,
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
                  style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }}
                />

                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5"
                  style={{
                    background: `${cfg.color}12`,
                    border: `1px solid ${cfg.color}22`,
                  }}
                >
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-xs font-semibold leading-snug" style={{ color: '#e2eeff' }}>
                      {item.title}
                    </p>
                    {/* Type badge */}
                    <span
                      className="flex-shrink-0 text-center rounded-full px-1.5 py-0.5"
                      style={{
                        fontSize: 8,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        background: `${cfg.color}12`,
                        color: cfg.color,
                        border: `1px solid ${cfg.color}20`,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                    {item.description}
                  </p>
                  <p
                    className="mono mt-1.5"
                    style={{ fontSize: 9, color: 'var(--text-dim)' }}
                    suppressHydrationWarning
                  >
                    {mounted ? timeAgo(item.timestamp) : ''}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// helper: "#10b981" → "16,185,129"
function hexToRgbStr(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return '0,212,255';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
