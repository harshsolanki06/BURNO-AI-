'use client';

import { motion } from 'framer-motion';
import { SystemStatus } from '@/types';
import { Cpu, Database, Zap, Activity, Wifi, Server, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

// ─── Ring Gauge ───────────────────────────────────────────────────────────────
function RingGauge({
  value, max = 100, color, size = 80, label, unit = '%',
  icon: Icon,
}: {
  value: number; max?: number; color: string; size?: number;
  label: string; unit?: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
  const r     = (size - 12) / 2;
  const circ  = 2 * Math.PI * r;
  const pct   = Math.min(1, value / max);
  const dash  = circ * pct;
  const gap   = circ - dash;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={6}
          />
          {/* Fill */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color}70)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Icon size={12} style={{ color, opacity: 0.7 }} />
          <span className="mono font-bold" style={{ fontSize: 14, color, lineHeight: 1 }}>
            {value}{unit}
          </span>
        </div>
      </div>

      <p className="label text-center" style={{ letterSpacing: '0.1em' }}>{label}</p>
    </div>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
function StatRow({
  label, value, unit, icon: Icon, color,
}: {
  label: string; value: number | string; unit?: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}10`, border: `1px solid ${color}1a` }}
      >
        <Icon size={13} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="label" style={{ fontSize: 9, letterSpacing: '0.12em' }}>{label}</p>
        <p className="mono font-semibold text-sm" style={{ color, lineHeight: 1.3 }}>
          {value}{unit}
        </p>
      </div>
      {/* Mini bar */}
      <div className="w-16 progress-track flex-shrink-0">
        <motion.div
          className="progress-fill"
          style={{ background: `linear-gradient(90deg, ${color}50, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: typeof value === 'number' ? `${Math.min(100, (value / 1000) * 100)}%` : '60%' }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function formatUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function SystemStats({ status }: { status: SystemStatus }) {
  const [cpu, setCpu] = useState(status.cpu);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu(prev => Math.max(8, Math.min(92, prev + (Math.random() - 0.5) * 6)));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="glass-panel relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      style={{ padding: '24px' }}
    >
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold" style={{ color: '#e2eeff' }}>System Monitor</h3>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="label" style={{ color: '#10b981', fontSize: 9 }}>NOMINAL</span>
        </div>
      </div>

      {/* ── Twin Ring Gauges ────────────────────── */}
      <div
        className="flex items-center justify-around mb-6 py-4 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <RingGauge
          value={Math.round(cpu)} color="#10b981" size={84}
          label="CPU" icon={Cpu}
        />

        {/* Divider */}
        <div className="divider-v" style={{ height: 60 }} />

        <RingGauge
          value={status.memory} color="#3b82f6" size={84}
          label="Memory" icon={Database}
        />
      </div>

      {/* ── Stat Rows ───────────────────────────── */}
      <div className="space-y-3.5">
        <StatRow
          label="Active Agents" value={status.activeAgents}
          icon={Zap} color="#8b5cf6"
        />
        <div className="divider-h" />
        <StatRow
          label="API Latency" value={status.apiLatency} unit="ms"
          icon={Activity} color="#00d4ff"
        />
        <div className="divider-h" />
        <StatRow
          label="Total Tasks" value={status.totalTasks}
          icon={Server} color="#f97316"
        />
        <div className="divider-h" />
        <StatRow
          label="Uptime" value={formatUptime(status.uptime)}
          icon={Clock} color="#f472b6"
        />
      </div>

      {/* ── Footer ─────────────────────────────── */}
      <div
        className="mt-5 pt-4 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-1.5">
          <Wifi size={11} style={{ color: '#14b8a6' }} />
          <span className="label" style={{ color: '#14b8a6' }}>WebSocket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="dot-cyan" style={{ width: 4, height: 4 }} />
          <span className="mono" style={{ fontSize: 10, color: '#00d4ff' }}>CONNECTED</span>
        </div>
      </div>
    </motion.div>
  );
}
