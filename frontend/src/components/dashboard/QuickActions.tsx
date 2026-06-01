'use client';

import { motion } from 'framer-motion';
import { QuickAction } from '@/types';

interface QuickActionsProps {
  actions: QuickAction[];
  onAction: (command: string) => void;
}

const AGENT_COLORS: Record<string, string> = {
  research:     '#3b82f6',
  coding:       '#10b981',
  automation:   '#f97316',
  productivity: '#8b5cf6',
  vision:       '#f472b6',
  memory:       '#00d4ff',
};

export default function QuickActions({ actions, onAction }: QuickActionsProps) {
  return (
    <motion.div
      className="glass-panel relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.6 }}
      style={{ padding: '28px 28px' }}
    >
      <div className="hud-corner-tl" />
      <div className="hud-corner-br" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#e2eeff' }}>Quick Actions</h3>
          <p className="label mt-1">Launch any agent instantly</p>
        </div>
        <span className="badge badge-cyan">{actions.length} commands</span>
      </div>

      {/* 2-column grid, spacious cards */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => {
          const color = AGENT_COLORS[action.agentType] || '#00d4ff';
          return (
            <motion.button
              key={action.id}
              onClick={() => onAction(action.command)}
              className="relative flex items-center gap-4 rounded-2xl text-left group overflow-hidden"
              style={{
                padding: '16px 18px',
                background: `${color}07`,
                border: `1px solid ${color}14`,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.04 }}
              whileHover={{
                y: -3,
                background: `${color}12`,
                borderColor: `${color}30`,
                boxShadow: `0 8px 30px ${color}10`,
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(ellipse 80% 80% at 15% 50%, ${color}08, transparent)` }}
              />

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base relative z-10"
                style={{
                  background: `${color}14`,
                  border: `1px solid ${color}22`,
                  boxShadow: `0 0 12px ${color}10`,
                }}
              >
                {action.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 relative z-10">
                <p className="text-sm font-medium leading-none mb-1.5" style={{ color: '#e2eeff' }}>
                  {action.label}
                </p>
                <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                  {action.description}
                </p>
              </div>

              {/* Shortcut */}
              {action.shortcut && (
                <kbd
                  className="mono flex-shrink-0 relative z-10"
                  style={{
                    fontSize: 9,
                    color: `${color}60`,
                    background: `${color}08`,
                    border: `1px solid ${color}15`,
                    padding: '2px 6px',
                    borderRadius: 5,
                  }}
                >
                  {action.shortcut}
                </kbd>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
