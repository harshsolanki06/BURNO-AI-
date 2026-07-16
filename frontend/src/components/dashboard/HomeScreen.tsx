'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

// ─── AI Core Orb (Canvas) ─────────────────────────────────────────────────────
function AICoreOrb({ state }: { state: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const SIZE = 320;
    canvas.width = SIZE; canvas.height = SIZE;
    const cx = SIZE / 2, cy = SIZE / 2;

    const COLORS = {
      thinking: ['#00d4ff', '#3b82f6', '#8b5cf6'],
      listening: ['#10b981', '#06b6d4', '#00d4ff'],
      coding: ['#f59e0b', '#f97316', '#ef4444'],
      searching: ['#8b5cf6', '#a855f7', '#c084fc'],
      speaking: ['#10b981', '#00d4ff', '#3b82f6'],
      idle: ['#00d4ff', '#3b82f6', '#8b5cf6'],
    };
    const colors = COLORS[state as keyof typeof COLORS] || COLORS.idle;

    // Particles
    const PARTICLE_COUNT = 200;
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const r = 60 + Math.random() * 30;
      return {
        baseAngle: angle, angle,
        r, baseR: r,
        speed: (Math.random() - 0.5) * 0.008 + 0.004,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        layer: Math.floor(Math.random() * 3),
        drift: Math.random() * Math.PI * 2,
      };
    });

    const draw = (t: number) => {
      timeRef.current = t * 0.001;
      const time = timeRef.current;

      ctx.clearRect(0, 0, SIZE, SIZE);

      // Core glow layers
      [1.8, 1.2, 0.7, 0.4].forEach((scale, i) => {
        const alpha = [0.03, 0.06, 0.12, 0.22][i];
        const r = 55 * scale + Math.sin(time * 1.5) * 4;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `${colors[0]}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(0.5, `${colors[1]}${Math.round(alpha * 0.5 * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Rotating rings
      const ringData = [
        { r: 82, width: 1.2, tilt: 0, speed: 0.3, dash: [8, 4] },
        { r: 95, width: 0.8, tilt: Math.PI / 4, speed: -0.2, dash: [4, 8] },
        { r: 110, width: 0.5, tilt: Math.PI / 6, speed: 0.15, dash: [12, 6] },
      ];

      ringData.forEach((ring, ri) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.tilt);
        ctx.scale(1, 0.35 + ri * 0.12);
        ctx.rotate(time * ring.speed);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.setLineDash(ring.dash);
        ctx.strokeStyle = `${colors[ri % colors.length]}${Math.round(0.25 * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = ring.width;
        ctx.stroke();
        ctx.restore();
      });

      // Particles
      particles.forEach(p => {
        p.angle += p.speed;
        p.drift += 0.002;
        const wobble = Math.sin(p.drift) * 8;
        const r = p.baseR + wobble + Math.sin(time * 2 + p.baseAngle) * 5;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r * 0.5;
        const colorIdx = p.layer % colors.length;
        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(time * 3 + p.drift));
        ctx.beginPath();
        ctx.arc(x, y, p.size * (1 + 0.3 * Math.sin(time + p.drift)), 0, Math.PI * 2);
        ctx.fillStyle = `${colors[colorIdx]}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });

      // Energy wave rings
      const waveR = 70 + Math.sin(time * 2) * 8;
      for (let w = 0; w < 3; w++) {
        const phase = (time * 1.5 + w * 0.8) % 3;
        const wR = waveR + phase * 18;
        const wAlpha = Math.max(0, (3 - phase) / 3) * 0.15;
        ctx.beginPath();
        ctx.arc(cx, cy, wR, 0, Math.PI * 2);
        ctx.strokeStyle = `${colors[0]}${Math.round(wAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Core sphere
      const coreGrad = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, 45);
      coreGrad.addColorStop(0, `${colors[0]}66`);
      coreGrad.addColorStop(0.4, `${colors[1]}33`);
      coreGrad.addColorStop(1, `${colors[2]}11`);
      ctx.beginPath();
      ctx.arc(cx, cy, 42 + Math.sin(time * 1.5) * 2, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Inner bright core
      const innerGrad = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, 20);
      innerGrad.addColorStop(0, `${colors[0]}cc`);
      innerGrad.addColorStop(0.5, `${colors[0]}44`);
      innerGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [state]);

  return (
    <motion.canvas
      ref={ref}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: 320, height: 320, filter: 'drop-shadow(0 0 40px rgba(0,212,255,0.3))' }}
    />
  );
}

// ─── Status Cycler ────────────────────────────────────────────────────────────
const STATES = [
  { key: 'idle', label: 'All Systems Online', sub: 'Ready for commands' },
  { key: 'thinking', label: 'Thinking...', sub: 'Processing your request' },
  { key: 'searching', label: 'Searching...', sub: 'Scanning knowledge base' },
  { key: 'reasoning', label: 'Reasoning...', sub: 'Analyzing patterns' },
  { key: 'coding', label: 'Coding...', sub: 'Generating solutions' },
  { key: 'listening', label: 'Listening...', sub: 'Voice mode active' },
  { key: 'speaking', label: 'Speaking...', sub: 'TTS synthesis active' },
];

// ─── Metrics Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, color, icon }: { label: string; value: string | number; unit?: string; color: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}20` }}
      style={{
        padding: '14px 16px', borderRadius: 14,
        background: `linear-gradient(135deg, ${color}08, rgba(5,8,22,0.6))`,
        border: `1px solid ${color}15`,
        backdropFilter: 'blur(20px)',
        minWidth: 100, flex: 1,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ fontSize: 16, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color, letterSpacing: '-0.02em' }}>
        {value}<span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 9, color: '#3d5070', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{label}</div>
    </motion.div>
  );
}

// ─── Suggestion Chips ─────────────────────────────────────────────────────────
const CHIPS = [
  { label: 'Research', icon: '🔍', color: '#06b6d4', prompt: 'Research the latest breakthroughs in AI this week' },
  { label: 'Code', icon: '💻', color: '#10b981', prompt: 'Generate a Python function to' },
  { label: 'Workflow', icon: '⚡', color: '#f59e0b', prompt: 'Run my morning workflow automation' },
  { label: 'Explain', icon: '💡', color: '#8b5cf6', prompt: 'Explain how neural networks work' },
  { label: 'Summarize', icon: '📝', color: '#3b82f6', prompt: 'Summarize this document:' },
  { label: 'Debug', icon: '🐛', color: '#ef4444', prompt: 'Debug this code:' },
  { label: 'Create', icon: '✨', color: '#a855f7', prompt: 'Create a comprehensive plan for' },
  { label: 'Vision', icon: '👁️', color: '#f472b6', prompt: 'Analyze what you see in this image' },
];

// ─── Command Bar ──────────────────────────────────────────────────────────────
function CommandBar({ onSend, onTabChange }: { onSend: (msg: string) => void; onTabChange: (tab: string) => void }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [isVoice, setIsVoice] = useState(false);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue('');
    onTabChange('chat');
  };

  const handleChip = (prompt: string) => {
    setValue(prompt + ' ');
    onTabChange('chat');
  };

  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      {/* Main input */}
      <motion.div
        animate={{ boxShadow: focused ? '0 0 0 1px rgba(0,212,255,0.3), 0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.08)' : '0 4px 24px rgba(0,0,0,0.4)' }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 8px 6px 20px',
          background: 'rgba(5,8,22,0.85)',
          backdropFilter: 'blur(40px) saturate(2)',
          border: `1px solid ${focused ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 20,
          transition: 'border-color 0.3s ease',
        }}
      >
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask BURNO anything..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#e2eeff', fontSize: 15, fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.01em',
          }}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {/* Voice */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('voice')}
            style={{
              width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'rgba(168,85,247,0.1)',
              color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}
          >🎙️</motion.button>

          {/* Attachment */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)',
              color: '#5a7599', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}
          >📎</motion.button>

          {/* Send */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            style={{
              width: 40, height: 40, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: value ? 'linear-gradient(135deg, #00d4ff, #3b82f6)' : 'rgba(255,255,255,0.05)',
              color: value ? '#050816' : '#3d5070',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              fontWeight: 700, transition: 'all 0.3s ease',
              boxShadow: value ? '0 0 20px rgba(0,212,255,0.4)' : 'none',
            }}
          >→</motion.button>
        </div>
      </motion.div>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {CHIPS.map((chip, i) => (
          <motion.button
            key={chip.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2, boxShadow: `0 8px 20px rgba(0,0,0,0.3), 0 0 0 1px ${chip.color}30` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleChip(chip.prompt)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 100, cursor: 'pointer',
              background: `${chip.color}08`,
              border: `1px solid ${chip.color}15`,
              color: chip.color, fontSize: 12, fontWeight: 500,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: 13 }}>{chip.icon}</span>
            {chip.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
export default function HomeScreen({ onSendMessage, onTabChange }: {
  onSendMessage: (msg: string) => void;
  onTabChange: (tab: string) => void;
}) {
  const [stateIdx, setStateIdx] = useState(0);
  const [metrics, setMetrics] = useState({ cpu: 8, mem: 82, latency: 42, agents: 6 });

  // Cycle AI states
  useEffect(() => {
    const t = setTimeout(() => setStateIdx(i => (i + 1) % STATES.length), 4000);
    return () => clearTimeout(t);
  }, [stateIdx]);

  // Fetch live metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/system/status`);
        if (r.ok) {
          const d = await r.json();
          setMetrics({
            cpu: d.system?.cpu_percent || 8,
            mem: d.system?.memory_percent || 82,
            latency: Math.round(Math.random() * 20 + 35),
            agents: d.agents?.length || 6,
          });
        }
      } catch {}
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentState = STATES[stateIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', paddingTop: '8vh', gap: 0 }}>

      {/* AI Core Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', marginBottom: 8 }}
      >
        <AICoreOrb state={currentState.key} />

        {/* Outer pulse rings */}
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 2.2], opacity: [0.15, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(0,212,255,0.3)',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 160, height: 160,
            }}
          />
        ))}
      </motion.div>

      {/* BURNO branding */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: 8 }}
      >
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 36, fontWeight: 700,
          background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em', marginBottom: 4,
        }}>
          BURNO AI
        </h1>
        <p style={{ fontSize: 12, color: '#3d5070', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Personal Intelligence Engine
        </p>
      </motion.div>

      {/* Animated status */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ marginBottom: 32, textAlign: 'center', height: 48 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stateIdx}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 4 }}>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,0.8)' }}
              />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600, color: '#e2eeff' }}>
                {currentState.label}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#3d5070' }}>{currentState.sub}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Command Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        style={{ width: '100%', maxWidth: 720, marginBottom: 40, paddingBottom: 80 }}
      >
        <CommandBar onSend={onSendMessage} onTabChange={onTabChange} />
      </motion.div>

      {/* Live Metrics Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{
          display: 'flex', gap: 10, width: '100%', maxWidth: 720,
          flexWrap: 'wrap', position: 'fixed', bottom: 90, left: '50%',
          transform: 'translateX(-50%)',
          padding: '0 16px',
        }}
      >
        <MetricCard label="Agents" value={metrics.agents} icon="⚡" color="#00d4ff" />
        <MetricCard label="CPU" value={`${metrics.cpu}%`} icon="💻" color="#3b82f6" />
        <MetricCard label="Memory" value={`${metrics.mem}%`} icon="🧠" color="#8b5cf6" />
        <MetricCard label="Latency" value={metrics.latency} unit="ms" icon="📡" color="#10b981" />
        <MetricCard label="AI Provider" value="Groq" icon="🤖" color="#f59e0b" />
        <MetricCard label="Status" value="Online" icon="🟢" color="#10b981" />
      </motion.div>
    </div>
  );
}
