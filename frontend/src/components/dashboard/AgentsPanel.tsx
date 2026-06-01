'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Agent } from '@/types';
import { formatTimestamp } from '@/lib/utils';
import { Zap, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const STATUS_CFG = {
  active:     { label: 'Active',     color: '#10b981', icon: Zap },
  processing: { label: 'Processing', color: '#00d4ff', icon: Clock },
  idle:       { label: 'Idle',       color: '#3d5070', icon: CheckCircle2 },
  error:      { label: 'Error',      color: '#ef4444', icon: AlertCircle },
};

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const isActive  = agent.status === 'active' || agent.status === 'processing';
  const statusCfg = STATUS_CFG[agent.status] || STATUS_CFG.idle;
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: 'rgba(255,255,255,0.018)',
        border: `1px solid ${isActive ? `${agent.color}22` : 'rgba(255,255,255,0.05)'}`,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      whileHover={{ y: -3, borderColor: `${agent.color}35` }}
    >
      {/* Active shimmer border */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `1px solid ${agent.color}15` }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}

      {/* Top color bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background: isActive
            ? `linear-gradient(90deg, transparent, ${agent.color}, transparent)`
            : 'transparent',
        }}
      />

      {/* Hover ambient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${agent.color}06, transparent)` }}
      />

      <div className="p-4">
        {/* ── Top row ──────────────────────────── */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{
                background: `${agent.color}10`,
                border: `1px solid ${agent.color}20`,
                boxShadow: isActive ? `0 0 14px ${agent.color}18` : 'none',
              }}
            >
              {agent.icon}
            </div>
            <div>
              <h4 className="text-xs font-semibold" style={{ color: '#e2eeff' }}>{agent.name}</h4>
              <p className="label capitalize mt-0.5" style={{ fontSize: 9 }}>{agent.type} module</p>
            </div>
          </div>

          {/* Status pill */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full flex-shrink-0"
            style={{
              background: `${statusCfg.color}10`,
              border: `1px solid ${statusCfg.color}20`,
            }}
          >
            {isActive ? (
              <motion.div
                className="w-1 h-1 rounded-full"
                style={{ background: statusCfg.color }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ) : (
              <StatusIcon size={9} style={{ color: statusCfg.color }} />
            )}
            <span className="label" style={{ color: statusCfg.color, fontSize: 9 }}>
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* ── Description ──────────────────────── */}
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
          {agent.description}
        </p>

        {/* ── Footer stats ─────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Zap size={9} style={{ color: agent.color, opacity: 0.7 }} />
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {agent.tasksCompleted.toLocaleString()} tasks
            </span>
          </div>
          {agent.lastActive && (
            <span className="label" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
              {formatTimestamp(agent.lastActive)}
            </span>
          )}
        </div>

        {/* ── Active progress bar ───────────────── */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="mt-3 progress-track"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="progress-fill"
                style={{ background: `linear-gradient(90deg, ${agent.color}50, ${agent.color})` }}
                animate={{ width: ['8%', '92%'] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function AgentsPanel({ agents }: { agents: Agent[] }) {
  const activeCount = agents.filter(a => a.status === 'active' || a.status === 'processing').length;

  return (
    <motion.div
      className="glass-panel p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#e2eeff' }}>AI Agent Network</h3>
          <p className="label mt-0.5">
            <span style={{ color: '#00d4ff' }}>{activeCount}</span>
            <span style={{ color: 'var(--text-dim)' }}> / {agents.length} active</span>
          </p>
        </div>
        <div className="badge badge-violet">MULTI-AGENT</div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-3">
        {agents.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
