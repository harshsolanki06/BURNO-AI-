'use client';

/**
 * BURNO AI — Workflow Builder Panel
 * Visual chain editor + SSE streaming execution
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkflowStep {
  id: string;
  agent: string;
  action: string;
  label: string;
  prompt: string;
  config?: Record<string, string>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  builtin?: boolean;
  steps: WorkflowStep[];
  created_at?: string;
}

interface StepResult {
  step_id: string;
  label: string;
  agent: string;
  action: string;
  output: string;
  elapsed_s: number;
  status: string;
}

interface RunState {
  phase: 'idle' | 'running' | 'completed' | 'failed';
  runId: string | null;
  currentStep: number;
  totalSteps: number;
  stepResults: StepResult[];
  finalOutput: string;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AGENT_COLORS: Record<string, string> = {
  research: '#4d7cff', coding: '#10b981', memory: '#00d4ff',
  productivity: '#a855f7', vision: '#f472b6', any: '#f59e0b',
};

const AGENT_ICONS: Record<string, string> = {
  research: '🔍', coding: '💻', memory: '🧠',
  productivity: '📊', vision: '👁️', any: '⚡',
};

const ACTION_LABELS: Record<string, string> = {
  prompt: 'AI Prompt', summarize: 'Summarize', store_memory: 'Store to Memory',
  search_knowledge: 'Search KB', custom: 'Custom',
};

// ─── Step Card Component ──────────────────────────────────────────────────────
function StepCard({ step, index, total, result, isActive }:
  { step: WorkflowStep; index: number; total: number; result?: StepResult; isActive?: boolean }) {
  const ac = AGENT_COLORS[step.agent] || '#00d4ff';
  const statusColor = result?.status === 'completed' ? '#10b981' : result?.status === 'failed' ? '#ef4444' : ac;

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      {/* connector line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <motion.div
          animate={isActive ? { scale: [1, 1.15, 1], boxShadow: [`0 0 8px ${ac}40`, `0 0 20px ${ac}80`, `0 0 8px ${ac}40`] } : {}}
          transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: result ? `${statusColor}15` : `${ac}10`, border: `1px solid ${result ? statusColor : ac}25`, fontSize: 14 }}>
          {result?.status === 'completed' ? '✓' : result?.status === 'failed' ? '✕' : AGENT_ICONS[step.agent] || '⚡'}
        </motion.div>
        {index < total - 1 && (
          <div style={{ width: 1, flex: 1, minHeight: 16, background: result ? `${statusColor}30` : 'rgba(255,255,255,.07)', margin: '4px 0' }} />
        )}
      </div>
      {/* card */}
      <motion.div
        animate={isActive ? { borderColor: `${ac}40` } : { borderColor: `${ac}15` }}
        style={{ flex: 1, padding: '11px 13px', borderRadius: 12, background: `${ac}06`, border: `1px solid ${ac}15`, marginBottom: index < total - 1 ? 8 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 100, background: `${ac}12`, border: `1px solid ${ac}20`, color: ac, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{step.agent}</span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>→</span>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{ACTION_LABELS[step.action] || step.action}</span>
          {result && <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-muted)' }}>{result.elapsed_s}s</span>}
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#e2eeff', marginBottom: result ? 6 : 0 }}>{step.label}</div>
        {result && result.output && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '7px 9px', borderRadius: 8, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', marginTop: 5, maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
            {result.output.substring(0, 400)}{result.output.length > 400 ? '…' : ''}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Run Modal ────────────────────────────────────────────────────────────────
function RunModal({ workflow, onClose }: { workflow: Workflow; onClose: () => void }) {
  const [vars, setVars] = useState<Record<string, string>>({});
  const [runState, setRunState] = useState<RunState>({ phase: 'idle', runId: null, currentStep: -1, totalSteps: workflow.steps.length, stepResults: [], finalOutput: '' });
  const eventSourceRef = useRef<EventSource | null>(null);

  // Detect required template vars from prompts
  const requiredVars = useCallback(() => {
    const seen = new Set<string>();
    for (const step of workflow.steps) {
      const matches = (step.prompt || '').matchAll(/\{\{(\w+)\}\}/g);
      for (const m of matches) {
        if (m[1] !== 'prev_output' && !m[1].startsWith('step_')) seen.add(m[1]);
      }
    }
    return Array.from(seen);
  }, [workflow.steps]);

  const doRun = async () => {
    setRunState(s => ({ ...s, phase: 'running', stepResults: [], currentStep: 0, finalOutput: '' }));

    try {
      const r = await fetch(`${API_BASE_URL}/api/workflows/${workflow.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: vars }),
      });

      const reader = r.body?.getReader();
      if (!reader) { setRunState(s => ({ ...s, phase: 'failed', error: 'No stream' })); return; }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.type === 'start') {
              setRunState(s => ({ ...s, runId: ev.run_id, totalSteps: ev.total_steps }));
            } else if (ev.type === 'step_start') {
              setRunState(s => ({ ...s, currentStep: ev.step_index }));
            } else if (ev.type === 'step_done') {
              setRunState(s => ({ ...s, stepResults: [...s.stepResults, ev.result] }));
            } else if (ev.type === 'step_error') {
              setRunState(s => ({ ...s, phase: 'failed', error: ev.error }));
            } else if (ev.type === 'complete') {
              setRunState(s => ({ ...s, phase: ev.status === 'completed' ? 'completed' : 'failed', finalOutput: ev.final_output || '', currentStep: -1 }));
            }
          } catch {}
        }
      }
    } catch (e) {
      setRunState(s => ({ ...s, phase: 'failed', error: String(e) }));
    }
  };

  const vars_ = requiredVars();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget && runState.phase !== 'running') onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(10px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        style={{ width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', background: 'rgba(5,8,22,.97)', border: '1px solid rgba(0,212,255,.15)', borderRadius: 20, padding: 24, boxShadow: '0 32px 80px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: `${workflow.color}12`, border: `1px solid ${workflow.color}20` }}>
              {workflow.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: '#e2eeff' }}>{workflow.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{workflow.description}</div>
            </div>
          </div>
          {runState.phase !== 'running' && (
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14 }}>✕</button>
          )}
        </div>

        {/* Input vars */}
        {vars_.length > 0 && runState.phase === 'idle' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Workflow Inputs</div>
            {vars_.map(v => (
              <div key={v} style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{v.charAt(0).toUpperCase() + v.slice(1)}</label>
                <input
                  value={vars[v] || ''}
                  onChange={e => setVars(prev => ({ ...prev, [v]: e.target.value }))}
                  placeholder={`Enter ${v}…`}
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(0,212,255,.2)', borderRadius: 10, color: '#e2eeff', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            {runState.phase === 'idle' ? 'Workflow Steps' : 'Execution Progress'}
          </div>
          {workflow.steps.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              total={workflow.steps.length}
              result={runState.stepResults[i]}
              isActive={runState.phase === 'running' && runState.currentStep === i}
            />
          ))}
        </div>

        {/* Status */}
        {runState.phase === 'running' && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(0,212,255,.04)', border: '1px solid rgba(0,212,255,.12)', fontSize: 12, color: '#00d4ff', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(0,212,255,.2)', borderTopColor: '#00d4ff', flexShrink: 0 }} />
            Running step {runState.currentStep + 1} of {runState.totalSteps}…
          </div>
        )}

        {runState.phase === 'completed' && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,.04)', border: '1px solid rgba(16,185,129,.15)', fontSize: 12, color: '#10b981', marginBottom: 12 }}>
            ✅ Workflow completed — {runState.stepResults.length} steps in {runState.stepResults.reduce((s, r) => s + (r.elapsed_s || 0), 0).toFixed(1)}s
          </div>
        )}

        {runState.phase === 'failed' && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.15)', fontSize: 12, color: '#ef4444', marginBottom: 12 }}>
            ❌ Failed: {runState.error || 'Unknown error'}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(runState.phase === 'idle' || runState.phase === 'completed' || runState.phase === 'failed') && (
            <button onClick={doRun}
              style={{ flex: 1, padding: '11px', background: `linear-gradient(135deg, ${workflow.color}, #8b5cf6)`, border: 'none', borderRadius: 11, color: '#050816', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {runState.phase === 'idle' ? '▶ Run Workflow' : '↻ Run Again'}
            </button>
          )}
          {runState.phase !== 'running' && (
            <button onClick={onClose}
              style={{ padding: '11px 18px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 11, color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Close
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function WorkflowPanel() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWf, setActiveWf] = useState<Workflow | null>(null);
  const [recentRuns, setRecentRuns] = useState<Record<string, string>>({}); // wf_id → last status

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wfRes, runsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/workflows`),
        fetch(`${API_BASE_URL}/api/workflows/runs/recent?limit=30`),
      ]);
      if (wfRes.ok) {
        const d = await wfRes.json();
        setWorkflows(d.workflows || []);
      }
      if (runsRes.ok) {
        const d = await runsRes.json();
        const statusMap: Record<string, string> = {};
        for (const run of (d.runs || []).reverse()) {
          statusMap[run.workflow_id] = run.status;
        }
        setRecentRuns(statusMap);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <AnimatePresence>{activeWf && <RunModal key={activeWf.id} workflow={activeWf} onClose={() => { setActiveWf(null); load(); }} />}</AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <motion.div className="glass-panel p-5 relative overflow-hidden"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="hud-corner-tl" /><div className="hud-corner-tr" />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div className="dot-cyan" />
                <span className="label-accent">AUTOMATION ENGINE</span>
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#e2eeff' }}>⚡ Workflow Builder</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Chain AI agents into automated workflows — click any workflow to configure and run
              </p>
            </div>
            <button onClick={load} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              ↻ Refresh
            </button>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {Object.entries(AGENT_ICONS).filter(([k]) => k !== 'any').map(([agent, icon]) => (
              <div key={agent} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${AGENT_COLORS[agent]}12`, border: `1px solid ${AGENT_COLORS[agent]}25` }}>{icon}</div>
                <span style={{ color: AGENT_COLORS[agent], textTransform: 'capitalize', fontWeight: 500 }}>{agent}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Built-in label */}
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          ⚡ Templates
        </div>

        {/* Workflow grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 13 }}>Loading workflows…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {workflows.map((wf, i) => {
              const lastStatus = recentRuns[wf.id];
              return (
                <motion.div key={wf.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-panel relative overflow-hidden"
                  style={{ padding: 16, border: `1px solid ${wf.color}15`, cursor: 'pointer' }}
                  whileHover={{ y: -3, boxShadow: `0 16px 40px rgba(0,0,0,.5), 0 0 0 1px ${wf.color}20` }}
                  onClick={() => setActiveWf(wf)}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: `${wf.color}10`, border: `1px solid ${wf.color}20` }}>
                      {wf.icon}
                    </div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {wf.builtin && (
                        <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 100, background: 'rgba(0,212,255,.08)', border: '1px solid rgba(0,212,255,.15)', color: '#00d4ff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Built-in</span>
                      )}
                      {lastStatus && (
                        <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 100,
                          background: lastStatus === 'completed' ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
                          border: `1px solid ${lastStatus === 'completed' ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
                          color: lastStatus === 'completed' ? '#10b981' : '#ef4444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          {lastStatus === 'completed' ? '✓ Done' : '✕ Failed'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, color: '#e2eeff', marginBottom: 6 }}>{wf.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{wf.description}</div>

                  {/* Step preview pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                    {wf.steps.map((step, si) => (
                      <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, background: `${AGENT_COLORS[step.agent] || '#00d4ff'}12`, border: `1px solid ${AGENT_COLORS[step.agent] || '#00d4ff'}20`, flexShrink: 0 }}>
                          {AGENT_ICONS[step.agent] || '⚡'}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{step.label}</span>
                        {si < wf.steps.length - 1 && <span style={{ fontSize: 8, color: 'var(--text-muted)', marginLeft: 'auto' }}>↓</span>}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{wf.steps.length} steps</div>
                    <motion.div whileHover={{ x: 3 }}
                      style={{ fontSize: 11, fontWeight: 600, color: wf.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Run ▶
                    </motion.div>
                  </div>

                  {/* Gradient accent */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${wf.color}40, transparent)` }} />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* How it works */}
        <motion.div className="glass-panel p-4 relative overflow-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>How Workflows Work</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { n: '1', t: 'Pick Template', d: 'Choose from built-in or create your own chain' },
              { n: '2', t: 'Set Variables', d: 'Define inputs like {{query}} or {{topic}}' },
              { n: '3', t: 'Execute', d: 'BURNO runs each step, passing output forward' },
              { n: '4', t: 'Results', d: 'Review each step output and final summary' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 12, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#00d4ff', marginBottom: 6 }}>{s.n}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#e2eeff', marginBottom: 4 }}>{s.t}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
