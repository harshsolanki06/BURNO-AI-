'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  color: string;
  icon: string;
}

const TYPE_COLORS: Record<string, { color: string; icon: string }> = {
  agent:      { color: '#8b5cf6', icon: '⚡' },
  memory:     { color: '#00d4ff', icon: '🧠' },
  voice:      { color: '#a855f7', icon: '🎙️' },
  automation: { color: '#f97316', icon: '🤖' },
  task:       { color: '#3b82f6', icon: '📋' },
  system:     { color: '#10b981', icon: '✅' },
  knowledge:  { color: '#06b6d4', icon: '📚' },
  workflow:   { color: '#f59e0b', icon: '🔄' },
  research:   { color: '#06b6d4', icon: '🔍' },
};

const DEMO_EVENTS: ActivityEvent[] = [
  { id: '1', type: 'system', title: 'All agents online', description: '6 AI agents initialized and ready', timestamp: new Date().toISOString(), color: '#10b981', icon: '✅' },
  { id: '2', type: 'memory', title: 'Memory synchronized', description: 'Context loaded from previous session', timestamp: new Date(Date.now() - 60000).toISOString(), color: '#00d4ff', icon: '🧠' },
  { id: '3', type: 'agent', title: 'Coding Agent active', description: 'Ready for code generation tasks', timestamp: new Date(Date.now() - 120000).toISOString(), color: '#8b5cf6', icon: '⚡' },
];

function RelativeTime({ timestamp }: { timestamp: string }) {
  const diff = Math.round((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return <span>{diff}s ago</span>;
  if (diff < 3600) return <span>{Math.round(diff / 60)}m ago</span>;
  return <span>{Math.round(diff / 3600)}h ago</span>;
}

export default function RightPanel() {
  const [events, setEvents] = useState<ActivityEvent[]>(DEMO_EVENTS);
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState({ cpu: 8, mem: 82, provider: 'groq' });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/activity?limit=12`);
        if (r.ok) {
          const d = await r.json();
          const items = (d.items || []).map((item: any) => ({
            id: item.id,
            type: item.type || 'system',
            title: item.title,
            description: item.description || '',
            timestamp: item.timestamp,
            color: TYPE_COLORS[item.type]?.color || '#3d5070',
            icon: TYPE_COLORS[item.type]?.icon || '●',
          }));
          if (items.length > 0) setEvents(items);
        }
      } catch {}
    };
    fetchActivity();
    const t = setInterval(fetchActivity, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      animate={{ width: collapsed ? 48 : 280 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 50,
        background: 'rgba(3,6,20,0.88)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Toggle */}
      <motion.button
        onClick={() => setCollapsed(c => !c)}
        whileHover={{ background: 'rgba(0,212,255,0.08)' }}
        style={{
          padding: '16px', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0, color: '#5a7599', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14, transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', display: 'flex', flexShrink: 0 }}>◀</span>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Activity</span>
          </motion.div>
        )}
      </motion.button>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {/* Live indicator */}
          <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.7)' }}
            />
            <span style={{ fontSize: 9, color: '#3d5070', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Timeline</span>
          </div>

          {/* Events */}
          <div className="scroll-y" style={{ flex: 1, padding: '0 12px 12px', overflowY: 'auto' }}>
            <AnimatePresence initial={false}>
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  style={{
                    display: 'flex', gap: 8, marginBottom: 10,
                    padding: '9px 10px', borderRadius: 10,
                    background: `${event.color}06`,
                    border: `1px solid ${event.color}12`,
                    position: 'relative', overflow: 'hidden',
                    cursor: 'default',
                  }}
                >
                  {/* Left color accent */}
                  <div style={{ width: 2, borderRadius: 2, background: event.color, flexShrink: 0, alignSelf: 'stretch', boxShadow: `0 0 6px ${event.color}60` }} />

                  <div style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{event.icon}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#c8deff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.title}
                    </div>
                    {event.description && (
                      <div style={{ fontSize: 10, color: '#3d5070', lineHeight: 1.4 }}>{event.description.slice(0, 60)}{event.description.length > 60 ? '…' : ''}</div>
                    )}
                    <div style={{ fontSize: 9, color: '#1e3050', marginTop: 3 }}>
                      <RelativeTime timestamp={event.timestamp} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* System Status */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 9, color: '#3d5070', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>System</div>
            {[
              { label: 'AI Provider', value: 'Groq LLaMA', color: '#f59e0b' },
              { label: 'WebSocket', value: 'Connected', color: '#10b981' },
              { label: 'Memory', value: '82%', color: '#8b5cf6' },
              { label: 'Latency', value: '42ms', color: '#00d4ff' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: '#3d5070' }}>{item.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: item.color, fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
