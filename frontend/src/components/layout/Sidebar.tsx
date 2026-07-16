'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  glow: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home',       color: '#00d4ff', glow: 'rgba(0,212,255,0.4)',   icon: <HomeIcon /> },
  { id: 'chat',      label: 'Chat',       color: '#3b82f6', glow: 'rgba(59,130,246,0.4)',  icon: <ChatIcon /> },
  { id: 'agents',    label: 'Agents',     color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)', icon: <AgentsIcon /> },
  { id: 'memory',    label: 'Memory',     color: '#00d4ff', glow: 'rgba(0,212,255,0.4)',  icon: <MemoryIcon /> },
  { id: 'knowledge', label: 'Knowledge',  color: '#10b981', glow: 'rgba(16,185,129,0.4)', icon: <KBIcon /> },
  { id: 'voice',     label: 'Voice',      color: '#a855f7', glow: 'rgba(168,85,247,0.4)', icon: <VoiceIcon /> },
  { id: 'workflows', label: 'Workflows',  color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', icon: <WorkflowIcon /> },
  { id: 'automation',label: 'Automation', color: '#f97316', glow: 'rgba(249,115,22,0.4)', icon: <AutomationIcon /> },
  { id: 'research',  label: 'Research',   color: '#06b6d4', glow: 'rgba(6,182,212,0.4)',  icon: <ResearchIcon /> },
  { id: 'settings',  label: 'Settings',   color: '#6366f1', glow: 'rgba(99,102,241,0.4)', icon: <SettingsIcon /> },
];

// ── SVG Icons ──────────────────────────────────────────────────────────────
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function ChatIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
}
function AgentsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>;
}
function MemoryIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-2.5-2.5h-5A2.5 2.5 0 012 14.5v-5A2.5 2.5 0 014.5 7H9.5z"/><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 002.5-2.5h5A2.5 2.5 0 0022 14.5v-5A2.5 2.5 0 0019.5 7H14.5z"/></svg>;
}
function KBIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
function VoiceIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>;
}
function WorkflowIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function AutomationIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
}
function ResearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <motion.aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(false); setHoveredId(null); }}
      animate={{ width: expanded ? 200 : 64 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
        background: 'rgba(3,6,20,0.92)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column',
        padding: '16px 10px',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingLeft: 4, overflow: 'hidden', flexShrink: 0 }}>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}
        >
          ⚡
        </motion.div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: '#e2eeff', whiteSpace: 'nowrap' }}
            >
              BURNO AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredId === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}15, ${item.color}08)`
                  : isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                color: isActive ? item.color : isHovered ? '#c8deff' : '#5a7599',
                boxShadow: isActive ? `0 0 16px ${item.glow}20, inset 0 0 12px ${item.color}06` : 'none',
                borderLeft: isActive ? `2px solid ${item.color}` : '2px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {/* Glow bg */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 10,
                    background: `radial-gradient(ellipse at left, ${item.color}10, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'inherit' }}>
                {item.icon}
              </span>

              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, letterSpacing: '0.01em', color: 'inherit' }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active dot when collapsed */}
              {isActive && !expanded && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{
                    position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)',
                    width: 4, height: 4, borderRadius: '50%',
                    background: item.color,
                    boxShadow: `0 0 6px ${item.color}`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div style={{ paddingLeft: 4, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.7)', animation: 'dot-pulse 2s ease-in-out infinite', flexShrink: 0 }} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 10, color: '#3d5070', fontWeight: 500, whiteSpace: 'nowrap' }}
              >
                All systems online
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
