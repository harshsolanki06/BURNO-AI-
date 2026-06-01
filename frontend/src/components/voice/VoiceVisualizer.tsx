'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Loader2, Radio } from 'lucide-react';
import { VoiceState } from '@/types';

interface VoiceVisualizerProps {
  voiceState: VoiceState;
  waveformData: number[];
  transcript: string;
  onStartListening: () => void;
  onStopListening: () => void;
}

const STATE_CONFIG: Record<VoiceState, { label: string; color: string; rgb: string }> = {
  idle:       { label: 'Say "Echo" to activate',      color: 'rgba(61,80,112,0.6)',   rgb: '61,80,112'   },
  listening:  { label: 'Listening…',                  color: 'rgba(0,212,255,0.9)',    rgb: '0,212,255'   },
  processing: { label: 'Neural processing…',          color: 'rgba(139,92,246,0.9)',   rgb: '139,92,246'  },
  speaking:   { label: 'EchoVerse is responding…',    color: 'rgba(16,185,129,0.9)',   rgb: '16,185,129'  },
  error:      { label: 'Voice error — try again',     color: 'rgba(239,68,68,0.9)',    rgb: '239,68,68'   },
};

const BAR_COUNT = 28;

export default function VoiceVisualizer({
  voiceState, waveformData, transcript, onStartListening, onStopListening,
}: VoiceVisualizerProps) {
  const isActive = voiceState !== 'idle';
  const cfg      = STATE_CONFIG[voiceState];

  // Pad/sample waveform data to BAR_COUNT
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const src = waveformData;
    if (src.length === 0) return 3;
    return src[Math.floor(i * src.length / BAR_COUNT)] ?? 3;
  });

  return (
    <motion.div
      className="glass-panel p-6 relative overflow-hidden h-full flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* HUD corners */}
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* Active scanline */}
      {isActive && <div className="hud-scanline" />}

      {/* Ambient bg glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          background: isActive
            ? `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(${cfg.rgb},0.04) 0%, transparent 70%)`
            : 'none',
        }}
        transition={{ duration: 0.6 }}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: cfg.color }}
            animate={isActive ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] } : { scale: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="label-accent">VOICE INTERFACE</span>
        </div>
        <span
          className="mono"
          style={{ fontSize: 10, color: cfg.color, letterSpacing: '0.1em' }}
        >
          {voiceState === 'idle' ? 'STANDBY' : voiceState.toUpperCase()}
        </span>
      </div>

      {/* ── Center Content ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        {/* ── Waveform Display ────────────────────────── */}
        <div className="w-full">
          <div className="flex items-center justify-center gap-0.5" style={{ height: 64 }}>
            {bars.map((height, i) => {
              const h = isActive ? Math.max(3, height) : 3;
              return (
                <motion.div
                  key={i}
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: '2px',
                    background: isActive
                      ? `rgba(${cfg.rgb},${0.4 + (height / 32) * 0.6})`
                      : 'rgba(61,80,112,0.25)',
                  }}
                  animate={{ height: h }}
                  transition={{ duration: 0.08, ease: 'easeOut' }}
                />
              );
            })}
          </div>

          {/* Frequency spectrum hint (decorative) */}
          <div className="flex items-end justify-center gap-px mt-2 opacity-30" style={{ height: 12 }}>
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <div
                key={i}
                className={`rounded-t-sm ${isActive ? 'wave-bar' : ''}`}
                style={{
                  width: 2,
                  height: isActive ? (Math.abs(Math.sin(i * 9.87)) * 10 + 2) : 2,
                  background: `rgba(${cfg.rgb},0.5)`,
                  animationDelay: `${(i * 0.03)}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Main Orb Button ─────────────────────────── */}
        <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
          {/* Outer pulse rings */}
          {isActive && [1, 2].map(ring => (
            <motion.div
              key={ring}
              className="absolute rounded-full"
              style={{
                inset: -(ring * 16),
                border: `1px solid rgba(${cfg.rgb},${0.18 - ring * 0.05})`,
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: ring * 0.4 }}
            />
          ))}

          {/* Main circle */}
          <motion.button
            className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: `radial-gradient(circle, rgba(${cfg.rgb},0.18) 0%, rgba(${cfg.rgb},0.06) 60%, transparent 100%)`,
              border: `2px solid rgba(${cfg.rgb},${isActive ? 0.5 : 0.2})`,
              boxShadow: isActive ? `0 0 30px rgba(${cfg.rgb},0.2), inset 0 0 20px rgba(${cfg.rgb},0.05)` : 'none',
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={isActive ? onStopListening : onStartListening}
          >
            {/* Inner glow */}
            <motion.div
              className="absolute inset-2 rounded-full"
              style={{ background: `radial-gradient(circle, rgba(${cfg.rgb},0.12), transparent)` }}
              animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.3 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={voiceState}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {voiceState === 'processing'
                  ? <Loader2 size={30} style={{ color: `rgba(${cfg.rgb},1)` }} className="animate-spin" />
                  : voiceState === 'speaking'
                  ? <Volume2 size={30} style={{ color: `rgba(${cfg.rgb},1)` }} />
                  : voiceState === 'listening'
                  ? <Radio size={30} style={{ color: `rgba(${cfg.rgb},1)` }} />
                  : <Mic size={30} style={{ color: 'rgba(61,80,112,0.7)' }} />
                }
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* State Label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={voiceState}
            className="text-sm text-center font-medium"
            style={{ color: cfg.color }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {cfg.label}
          </motion.p>
        </AnimatePresence>

        {/* Transcript */}
        <AnimatePresence>
          {transcript && voiceState !== 'idle' && (
            <motion.div
              className="glass-card w-full p-4 text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="label mb-1.5" style={{ color: 'var(--text-muted)' }}>TRANSCRIPT</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {transcript}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard shortcut hint */}
        <p className="label" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
          Click orb to toggle • Or say <span style={{ color: 'var(--cyan)', opacity: 0.6 }}>&quot;Echo&quot;</span> to wake
        </p>
      </div>
    </motion.div>
  );
}
