'use client';

/**
 * BURNO AI — Live Agents Panel
 * Fetches real agent data from /api/agents, supports activate/pause + run task
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

interface AgentData {
  type: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
  status: string;
  tasks_completed: number;
  avg_response_ms: number;
  success_rate: number;
}

interface AgentsResponse {
  agents: AgentData[];
  total: number;
  active: number;
  standby: number;
}

export default function LiveAgentsPanel() {
  const [data, setData] = useState<AgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState<AgentData | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [taskResult, setTaskResult] = useState('');
  const [taskRunning, setTaskRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/agents`);
      if (r.ok) setData(await r.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (type: string, action: 'activate' | 'pause') => {
    try {
      await fetch(`${API_BASE_URL}/api/agents/${type}/${action}`, { method: 'POST' });
      load();
    } catch {}
  };

  const runTask = async () => {
    if (!taskModal || !taskInput.trim()) return;
    setTaskRunning(true);
    setTaskResult('');
    try {
      const r = await fetch(`${API_BASE_URL}/api/agents/${taskModal.type}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: taskInput }),
      });
      const d = await r.json();
      setTaskResult(d.result || d.detail || 'No response');
      load();
    } catch { setTaskResult('Connection error. Check backend.'); }
    setTaskRunning(false);
  };

  if (loading && !data) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading agents...</div>
  );

  const agents = data?.agents ?? [];
  const totalTasks = agents.reduce((s, a) => s + a.tasks_completed, 0);
  const avgSuccess = agents.length ? (agents.reduce((s, a) => s + a.success_rate, 0) / agents.length).toFixed(1) : '0';

  return (
    <>
      {/* Task modal */}
      <AnimatePresence>
        {taskModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) { setTaskModal(null); setTaskResult(''); } }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              style={{ width: 500, maxWidth: '90vw', background: 'rgba(8,12,28,.97)', border: '1px solid rgba(0,212,255,.15)', borderRadius: 20, padding: 22, boxShadow: '0 32px 80px rgba(0,0,0,.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: '#e2eeff' }}>
                  {taskModal.icon} {taskModal.name} Task
                </div>
                <button onClick={() => { setTaskModal(null); setTaskResult(''); }}
                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              <textarea
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                placeholder="Describe the task..."
                rows={4}
                style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(0,212,255,.2)', borderRadius: 11, color: '#e2eeff', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6, marginBottom: 12 }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runTask(); }}
              />
              <div style={{ display: 'flex', gap: 8, marginBottom: taskResult ? 12 : 0 }}>
                <button onClick={runTask} disabled={taskRunning || !taskInput.trim()}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', border: 'none', borderRadius: 10, color: '#050816', fontSize: 12, fontWeight: 700, cursor: taskRunning ? 'not-allowed' : 'pointer', opacity: taskRunning ? 0.6 : 1, fontFamily: 'Inter, sans-serif' }}>
                  {taskRunning ? 'Running...' : '▶ Run Task'}
                </button>
                <button onClick={() => { setTaskModal(null); setTaskResult(''); }}
                  style={{ padding: '10px 16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Cancel
                </button>
              </div>
              {taskRunning && (
                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,212,255,.03)', border: '1px solid rgba(0,212,255,.1)', fontSize: 11, color: 'var(--text-secondary)' }}>
                  ⚡ Agent processing...
                </div>
              )}
              {taskResult && !taskRunning && (
                <div style={{ padding: '13px 14px', borderRadius: 10, background: 'rgba(0,212,255,.03)', border: '1px solid rgba(0,212,255,.1)', fontSize: 12, color: '#e2eeff', lineHeight: 1.7, maxHeight: 200, overflowY: 'auto' }}>
                  <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, marginBottom: 6 }}>✅ Completed</div>
                  {taskResult}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 relative overflow-hidden">
          <div className="hud-corner-tl" /><div className="hud-corner-tr" />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div className="dot-cyan" />
                <span className="label-accent">MULTI-AGENT NETWORK</span>
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#e2eeff' }}>🤖 AI Agent Network</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>6 specialized agents powering BURNO's intelligence</p>
            </div>
            <button onClick={load}
              style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              ↻ Refresh
            </button>
          </div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { label: 'Active', val: data?.active ?? 0, color: '#10b981' },
              { label: 'Standby', val: data?.standby ?? 0, color: '#f59e0b' },
              { label: 'Tasks Done', val: totalTasks > 999 ? `${(totalTasks / 1000).toFixed(1)}K` : totalTasks, color: '#00d4ff' },
              { label: 'Avg Success', val: `${avgSuccess}%`, color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 21, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Agent grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {agents.map((agent, i) => {
            const isActive = agent.status === 'active';
            return (
              <motion.div key={agent.type} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-panel relative overflow-hidden"
                style={{ padding: 16, border: `1px solid ${agent.color}15`, cursor: 'default' }}
                whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,.5)' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, background: `${agent.color}0D`, border: `1px solid ${agent.color}25` }}>
                    {agent.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 100, fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: isActive ? 'rgba(16,185,129,.08)' : 'rgba(245,158,11,.08)', border: `1px solid ${isActive ? 'rgba(16,185,129,.2)' : 'rgba(245,158,11,.2)'}`, color: isActive ? '#10b981' : '#f59e0b' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? '#10b981' : '#f59e0b', boxShadow: `0 0 5px ${isActive ? '#10b981' : '#f59e0b'}` }} />
                    {agent.status}
                  </div>
                </div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600, color: '#e2eeff', marginBottom: 4 }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 10 }}>{agent.description}</div>
                {/* Caps */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 10 }}>
                  {(agent.capabilities || []).slice(0, 4).map(c => (
                    <span key={c} style={{ padding: '2px 7px', borderRadius: 100, fontSize: 9, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: 'var(--text-muted)' }}>{c}</span>
                  ))}
                </div>
                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 10 }}>
                  {[
                    { val: agent.tasks_completed, lbl: 'Tasks' },
                    { val: `${Math.round((agent.avg_response_ms || 0) / 100) / 10}s`, lbl: 'Avg' },
                    { val: `${(agent.success_rate || 0).toFixed(0)}%`, lbl: 'Rate' },
                  ].map(m => (
                    <div key={m.lbl} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 9, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 700, color: agent.color }}>{m.val}</div>
                      <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.lbl}</div>
                    </div>
                  ))}
                </div>
                {/* Progress */}
                <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,.05)', overflow: 'hidden', marginBottom: 4 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${agent.success_rate}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${agent.color}, ${agent.color}88)` }} />
                </div>
                <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 10 }}>Success rate: {agent.success_rate}%</div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setTaskModal(agent); setTaskInput(''); setTaskResult(''); }}
                    style={{ flex: 1, padding: '7px 8px', background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', border: 'none', borderRadius: 9, color: '#050816', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    ▶ Task
                  </button>
                  {isActive ? (
                    <button onClick={() => toggle(agent.type, 'pause')}
                      style={{ flex: 1, padding: '7px 8px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 9, color: '#ef4444', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      ⏸ Pause
                    </button>
                  ) : (
                    <button onClick={() => toggle(agent.type, 'activate')}
                      style={{ flex: 1, padding: '7px 8px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 9, color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      ▶ Activate
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
