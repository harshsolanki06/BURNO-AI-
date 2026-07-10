'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard, Mic, Brain, Eye, Zap, Database,
  BarChart2, Settings, ChevronRight, Activity,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#00d4ff' },
      { id: 'chat',      label: 'AI Chat',   icon: Brain,           color: '#8b5cf6' },
      { id: 'voice',     label: 'Voice',     icon: Mic,             color: '#10b981' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'agents',     label: 'Agents',    icon: Activity, color: '#6366f1' },
      { id: 'memory',     label: 'Memory',    icon: Database, color: '#3b82f6' },
      { id: 'knowledge',  label: 'Knowledge', icon: Eye,      color: '#f59e0b' },
      { id: 'workflows',  label: 'Workflows', icon: Zap,      color: '#f97316' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart2, color: '#14b8a6' },
      { id: 'settings',  label: 'Settings',  icon: Settings,  color: '#6b7280' },
    ],
  },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const W = expanded ? 220 : 72;

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col py-4"
      style={{
        width: W,
        background: 'rgba(2,5,16,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}
      animate={{ width: W }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(false); setHovered(null); }}
    >
      {/* Sidebar inner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,212,255,0.02) 0%, transparent 40%, rgba(139,92,246,0.015) 100%)',
        }}
      />

      {/* Data flow line */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.15) 30%, rgba(139,92,246,0.12) 70%, transparent 100%)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 mb-6 flex-shrink-0" style={{ height: 48 }}>
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center relative flex-shrink-0 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(99,102,241,0.12))',
            border: '1px solid rgba(0,212,255,0.25)',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          <span
            className="orbitron text-sm font-black"
            style={{ color: '#00d4ff', textShadow: '0 0 12px rgba(0,212,255,0.6)' }}
          >
            B
          </span>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: '1px solid rgba(0,212,255,0.2)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="orbitron text-xs font-bold neon-text-cyan whitespace-nowrap">BURNO AI</p>
              <p className="label" style={{ color: 'rgba(74,96,128,0.7)', marginTop: 1 }}>Intelligence Engine</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-4 divider-h flex-shrink-0" />

      {/* ── Nav Groups ───────────────────────────────────── */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto scroll-y px-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-3' : ''}>
            <AnimatePresence>
              {expanded && (
                <motion.p
                  className="label px-2 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isHov = hovered === item.id;

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <motion.button
                    onClick={() => onTabChange(item.id)}
                    className="relative w-full flex items-center gap-3 rounded-xl transition-colors"
                    style={{
                      height: 44,
                      padding: expanded ? '0 12px' : '0',
                      justifyContent: expanded ? 'flex-start' : 'center',
                      background: isActive
                        ? `${item.color}10`
                        : isHov ? 'rgba(255,255,255,0.02)' : 'transparent',
                      border: `1px solid ${isActive ? `${item.color}22` : 'transparent'}`,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Active layoutId background */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        layoutId="sidebar-active"
                        style={{
                          background: `radial-gradient(ellipse 80% 60% at 20% 50%, ${item.color}08, transparent)`,
                        }}
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                      style={{ position: expanded ? 'relative' : 'relative', zIndex: 1 }}
                    >
                      <Icon
                        size={17}
                        style={{
                          color: isActive ? item.color : isHov ? 'rgba(138,160,192,0.9)' : 'rgba(74,96,128,0.7)',
                          transition: 'color 0.2s',
                          filter: isActive ? `drop-shadow(0 0 6px ${item.color}60)` : 'none',
                        }}
                      />
                    </div>

                    {/* Label */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.span
                          className="text-xs font-medium whitespace-nowrap"
                          style={{
                            color: isActive ? item.color : isHov ? 'rgba(226,238,255,0.9)' : 'rgba(122,150,187,0.8)',
                            transition: 'color 0.2s',
                            zIndex: 1,
                          }}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Active chevron */}
                    {expanded && isActive && (
                      <motion.div
                        className="ml-auto"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ zIndex: 1 }}
                      >
                        <ChevronRight size={12} style={{ color: item.color, opacity: 0.6 }} />
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Active left indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 rounded-r-full"
                      layoutId="sidebar-line"
                      style={{
                        top: '20%', bottom: '20%',
                        width: 2.5,
                        background: item.color,
                        boxShadow: `0 0 8px ${item.color}`,
                      }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}

                  {/* Tooltip (collapsed only) */}
                  {!expanded && isHov && (
                    <motion.div
                      className="tooltip absolute left-14 top-1/2 -translate-y-1/2"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.12 }}
                      style={{ zIndex: 100 }}
                    >
                      {item.label}
                      {/* Arrow */}
                      <div
                        className="absolute right-full top-1/2 -translate-y-1/2"
                        style={{
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          borderRight: '4px solid rgba(5,8,22,0.98)',
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom Status ─────────────────────────────────── */}
      <div className="mt-4 px-2 flex-shrink-0">
        <div className="mx-2 mb-3 divider-h" />

        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}
        >
          <div className="dot-live flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <p className="text-xs font-medium" style={{ color: '#10b981' }}>All Systems</p>
                <p className="label" style={{ color: 'rgba(74,96,128,0.6)', marginTop: 1 }}>Operational</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!expanded && (
          <p
            className="mono text-center mt-2"
            style={{ fontSize: 8, color: 'rgba(74,96,128,0.4)', letterSpacing: '0.12em' }}
          >
            v2.0
          </p>
        )}
      </div>
    </motion.aside>
  );
}
