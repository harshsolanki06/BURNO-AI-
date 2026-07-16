'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DockItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  glow: string;
  status: 'idle' | 'active' | 'busy';
}

const DOCK_AGENTS: DockItem[] = [
  { id: 'chat',       label: 'Chat',        icon: '💬', color: '#3b82f6', glow: '#3b82f680', status: 'active' },
  { id: 'research',   label: 'Research',    icon: '🔍', color: '#06b6d4', glow: '#06b6d480', status: 'idle' },
  { id: 'agents',     label: 'Agents',      icon: '⚡', color: '#8b5cf6', glow: '#8b5cf680', status: 'active' },
  { id: 'memory',     label: 'Memory',      icon: '🧠', color: '#00d4ff', glow: '#00d4ff80', status: 'busy' },
  { id: 'knowledge',  label: 'Knowledge',   icon: '📚', color: '#10b981', glow: '#10b98180', status: 'idle' },
  { id: 'voice',      label: 'Voice',       icon: '🎙️', color: '#a855f7', glow: '#a855f780', status: 'idle' },
  { id: 'workflows',  label: 'Workflows',   icon: '🔄', color: '#f59e0b', glow: '#f59e0b80', status: 'idle' },
  { id: 'automation', label: 'Automation',  icon: '🤖', color: '#f97316', glow: '#f9731680', status: 'idle' },
];

interface BottomDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomDock({ activeTab, onTabChange }: BottomDockProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end', gap: 8,
      padding: '10px 16px',
      background: 'rgba(3,6,20,0.85)',
      backdropFilter: 'blur(40px) saturate(2)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 24,
      boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      {DOCK_AGENTS.map((item, i) => {
        const isActive = activeTab === item.id;
        const isHovered = hovered === item.id;
        const scale = isHovered ? 1.35 : isActive ? 1.15 : 1;

        return (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
            {/* Label tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', bottom: '100%', marginBottom: 10,
                    background: 'rgba(3,6,20,0.98)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '4px 10px',
                    fontSize: 11, fontWeight: 500, color: '#c8deff',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                  }}
                >
                  {item.label}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              animate={{ scale, y: isHovered ? -6 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 44, height: 44,
                borderRadius: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}22, ${item.color}10)`
                  : 'rgba(255,255,255,0.03)',
                boxShadow: isActive
                  ? `0 0 20px ${item.glow}40, 0 0 8px ${item.glow}20, inset 0 1px 0 rgba(255,255,255,0.06)`
                  : isHovered ? `0 0 14px ${item.glow}30` : 'none',
                border: `1px solid ${isActive ? `${item.color}30` : 'rgba(255,255,255,0.05)'}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Active shimmer */}
              {isActive && (
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(90deg, transparent, ${item.color}15, transparent)`,
                    pointerEvents: 'none',
                  }}
                />
              )}
              {item.icon}
            </motion.button>

            {/* Status dot */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], scale: item.status === 'busy' ? [1, 1.2, 1] : 1 }}
              transition={{ duration: item.status === 'busy' ? 1 : 2.5, repeat: Infinity }}
              style={{
                width: 4, height: 4, borderRadius: '50%',
                background: item.status === 'active' ? '#10b981'
                  : item.status === 'busy' ? '#f59e0b'
                  : isActive ? item.color : '#1e3050',
                boxShadow: item.status !== 'idle'
                  ? `0 0 6px ${item.status === 'active' ? '#10b981' : '#f59e0b'}`
                  : 'none',
              }}
            />
          </div>
        );
      })}

      {/* Divider */}
      <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)', margin: '0 4px', alignSelf: 'center' }} />

      {/* Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <motion.button
          whileHover={{ scale: 1.2, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange('settings')}
          style={{
            width: 44, height: 44, borderRadius: 13,
            border: '1px solid rgba(255,255,255,0.05)',
            background: activeTab === 'settings' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
            color: '#5a7599', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}
        >
          ⚙️
        </motion.button>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1e3050' }} />
      </div>
    </div>
  );
}
