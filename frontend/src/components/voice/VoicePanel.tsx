'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

type VoicePhase = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
type AnyRec = any;

const PHASE_CONFIG = {
  idle:       { color: '#00d4ff', glow: 'rgba(0,212,255,0.4)',   icon: '🎙️', label: 'Click to speak' },
  listening:  { color: '#10b981', glow: 'rgba(16,185,129,0.5)',  icon: '🎙️', label: 'Listening...' },
  processing: { color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  icon: '⚡',  label: 'Processing...' },
  speaking:   { color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)', icon: '🔊',  label: 'Speaking...' },
  error:      { color: '#ef4444', glow: 'rgba(239,68,68,0.4)',  icon: '⚠️',  label: 'Error — try again' },
};

const QUICK_CMDS = [
  { text: 'Search latest AI news', color: '#06b6d4' },
  { text: 'Write a Python function', color: '#10b981' },
  { text: 'What did we discuss before?', color: '#00d4ff' },
  { text: 'Explain machine learning', color: '#a855f7' },
  { text: 'Create a task for tomorrow', color: '#f59e0b' },
  { text: 'Analyze my screen', color: '#f472b6' },
];

export default function VoicePanel() {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [agentName, setAgentName] = useState('');
  const [ttsReady, setTtsReady] = useState(false);
  const [waveData, setWaveData] = useState<number[]>(new Array(32).fill(3));
  const [sessionId, setSessionId] = useState<string | null>(null);

  const recRef = useRef<AnyRec>(null);
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTranscriptRef = useRef('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/voice/status`).then(r => r.json()).then(d => setTtsReady(!!d.configured)).catch(() => {});
    audioRef.current = new Audio();
    return () => { stopWave(); recRef.current?.stop(); audioRef.current?.pause(); };
  }, []);

  const startWave = (intensity: number) => {
    if (waveRef.current) clearInterval(waveRef.current);
    waveRef.current = setInterval(() => {
      setWaveData(() => Array.from({ length: 32 }, (_, i) => {
        const base = Math.sin((i / 32) * Math.PI) * intensity * 0.7;
        return base + Math.random() * intensity * 0.5 + 3;
      }));
    }, 60);
  };

  const stopWave = () => {
    if (waveRef.current) { clearInterval(waveRef.current); waveRef.current = null; }
    setWaveData(new Array(32).fill(3));
  };

  const startListening = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setPhase('error'); setTranscript('Voice requires Chrome browser.'); return; }
    const rec = new SR();
    rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = true;
    recRef.current = rec; lastTranscriptRef.current = '';

    rec.onstart = () => { setPhase('listening'); setTranscript(''); setResponse(''); startWave(40); };
    rec.onresult = (e: AnyRec) => {
      let fin = '', int = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript;
        else int += e.results[i][0].transcript;
      }
      if (fin) lastTranscriptRef.current = fin;
      setTranscript(fin || int);
    };
    rec.onend = () => { stopWave(); const t = lastTranscriptRef.current; t.trim() ? sendVoice(t) : setPhase('idle'); };
    rec.onerror = (e: AnyRec) => { stopWave(); setPhase('error'); setTranscript(`Error: ${e.error}`); setTimeout(() => setPhase('idle'), 3000); };
    rec.start();
  };

  const sendVoice = async (text: string) => {
    setTranscript(text); setPhase('processing'); startWave(16);
    try {
      const r = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId ?? undefined }),
      });
      const d = await r.json();
      if (d.session_id && !sessionId) setSessionId(d.session_id);
      const reply: string = d.content || '';
      setResponse(reply); setAgentName(d.agent_name || 'BURNO AI');
      await playTTS(reply.substring(0, 800));
    } catch { setPhase('error'); setResponse('Backend unreachable.'); setTimeout(() => setPhase('idle'), 3000); }
  };

  const playTTS = async (text: string) => {
    setPhase('speaking'); startWave(32);
    try {
      const r = await fetch(`${API_BASE_URL}/api/voice/speak`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) { stopWave(); setPhase('idle'); return; }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => { stopWave(); setPhase('idle'); URL.revokeObjectURL(url); };
      }
    } catch { stopWave(); setPhase('idle'); }
  };

  const handleOrbClick = () => {
    if (phase === 'idle' || phase === 'error') startListening();
    else if (phase === 'listening') recRef.current?.stop();
    else if (phase === 'speaking') { audioRef.current?.pause(); stopWave(); setPhase('idle'); }
  };

  const cfg = PHASE_CONFIG[phase];

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 28, padding: '20px 0',
    }}>

      {/* Full-screen ambient glow */}
      <motion.div
        animate={{ opacity: phase === 'idle' ? 0.3 : 0.7, scale: phase === 'speaking' ? 1.3 : 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(ellipse 60% 60% at 50% 40%, ${cfg.color}12, transparent 70%)`,
        }}
      />

      {/* Orb */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Outer pulse rings */}
        {(phase === 'listening' || phase === 'speaking') && [1, 2, 3].map(i => (
          <motion.div key={i}
            animate={{ scale: [1, 2.4], opacity: [0.3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute', borderRadius: '50%',
              border: `1px solid ${cfg.color}`,
              width: 200, height: 200,
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Rotating orbit rings */}
        {[0, 1].map(i => (
          <motion.div key={`orbit-${i}`}
            animate={{ rotate: i === 0 ? 360 : -360 }}
            transition={{ duration: i === 0 ? 6 : 10, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: 240 + i * 30, height: 240 + i * 30,
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              borderRadius: '50%',
              border: `1px dashed ${cfg.color}25`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Main Orb */}
        <motion.button
          onClick={handleOrbClick}
          animate={{
            scale: phase === 'listening' ? [1, 1.08, 1] : phase === 'speaking' ? [1, 1.12, 1] : 1,
            boxShadow: [
              `0 0 40px ${cfg.glow}, 0 0 80px ${cfg.glow.replace('0.', '0.0')}`,
              `0 0 70px ${cfg.glow}, 0 0 140px ${cfg.glow.replace('0.', '0.0')}`,
              `0 0 40px ${cfg.glow}, 0 0 80px ${cfg.glow.replace('0.', '0.0')}`,
            ],
          }}
          transition={{ duration: 1.5, repeat: (phase === 'idle' || phase === 'error') ? 0 : Infinity }}
          style={{
            width: 200, height: 200, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${cfg.color}cc, ${cfg.color}44 50%, #050816)`,
            border: `1px solid ${cfg.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 60, cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {cfg.icon}
        </motion.button>
      </div>

      {/* Status label */}
      <motion.div key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: cfg.color, marginBottom: 4 }}>
          {cfg.label}
        </div>
        {!ttsReady && phase === 'idle' && (
          <div style={{ fontSize: 11, color: '#5a7599' }}>Add ELEVENLABS_API_KEY for voice output</div>
        )}
      </motion.div>

      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 60, zIndex: 1 }}>
        {waveData.map((h, i) => (
          <motion.div key={i}
            animate={{ height: Math.max(h, 3), opacity: phase === 'idle' ? 0.2 : 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: 4, borderRadius: 3,
              background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}44)`,
              boxShadow: phase !== 'idle' ? `0 0 6px ${cfg.color}40` : 'none',
            }}
          />
        ))}
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              maxWidth: 520, padding: '14px 20px', borderRadius: 16, zIndex: 1,
              background: 'rgba(5,8,22,0.8)', border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: '#3d5070', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>You said</div>
            <div style={{ fontSize: 14, color: '#e2eeff', lineHeight: 1.6, fontStyle: 'italic' }}>"{transcript}"</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response */}
      <AnimatePresence>
        {response && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              maxWidth: 560, padding: '14px 20px', borderRadius: 16, zIndex: 1,
              background: `${cfg.color}06`, border: `1px solid ${cfg.color}15`,
              backdropFilter: 'blur(20px)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 6 }}>
              {agentName}
            </div>
            <div style={{ fontSize: 13, color: '#c8deff', lineHeight: 1.7 }}>
              {response.substring(0, 400)}{response.length > 400 ? '…' : ''}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick commands */}
      {phase === 'idle' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 580, zIndex: 1 }}
        >
          {QUICK_CMDS.map(cmd => (
            <motion.button key={cmd.text}
              whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => sendVoice(cmd.text)}
              style={{
                padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
                background: `${cmd.color}08`, border: `1px solid ${cmd.color}20`,
                color: cmd.color, fontSize: 12, fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {cmd.text}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
