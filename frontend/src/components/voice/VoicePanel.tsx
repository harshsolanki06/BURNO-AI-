'use client';

/**
 * BURNO AI — Voice Assistant Panel
 * Web Speech API STT + ElevenLabs TTS via /api/voice/speak
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

type VoicePhase = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any;

interface TtsStatus { configured: boolean; provider: string; voice_id: string | null; }

const SAMPLE_COMMANDS = [
  { text: 'Search for latest AI news', agent: 'Research Agent', color: '#4d7cff' },
  { text: 'Write a Python function', agent: 'Coding Agent', color: '#10b981' },
  { text: 'What did we discuss before?', agent: 'Memory Agent', color: '#00d4ff' },
  { text: 'Explain machine learning simply', agent: 'Productivity Agent', color: '#a855f7' },
  { text: 'Create a task for tomorrow', agent: 'Productivity Agent', color: '#f59e0b' },
  { text: 'Analyze my screen', agent: 'Vision Agent', color: '#f472b6' },
];

export default function VoicePanel() {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [agentName, setAgentName] = useState('');
  const [ttsStatus, setTtsStatus] = useState<TtsStatus | null>(null);
  const [waveData, setWaveData] = useState<number[]>(new Array(24).fill(4));
  const [sessionId, setSessionId] = useState<string | null>(null);

  const recRef = useRef<AnyRec>(null);
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTranscriptRef = useRef('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/voice/status`)
      .then(r => r.json())
      .then(d => setTtsStatus(d))
      .catch(() => {});
    audioRef.current = new Audio();
    return () => {
      stopWave();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      recRef.current?.stop();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      audioRef.current?.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startWave = (intensity: number) => {
    if (waveRef.current) clearInterval(waveRef.current);
    waveRef.current = setInterval(() => {
      setWaveData(prev => prev.map(() => Math.random() * intensity + 4));
    }, 80);
  };

  const stopWave = () => {
    if (waveRef.current) { clearInterval(waveRef.current); waveRef.current = null; }
    setWaveData(new Array(24).fill(4));
  };

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setPhase('error'); setTranscript('Voice input requires Chrome browser.'); return; }

    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    recRef.current = rec;
    lastTranscriptRef.current = '';

    rec.onstart = () => { setPhase('listening'); setTranscript(''); setResponse(''); startWave(44); };

    rec.onresult = (e: AnyRec) => {
      let fin = '', int = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript;
        else int += e.results[i][0].transcript;
      }
      const text = fin || int;
      if (fin) lastTranscriptRef.current = fin;
      setTranscript(text);
    };

    rec.onend = () => {
      stopWave();
      const text = lastTranscriptRef.current;
      if (text.trim()) sendVoice(text);
      else setPhase('idle');
    };

    rec.onerror = (e: AnyRec) => {
      stopWave();
      setPhase('error');
      setTranscript(`Error: ${e.error}. Try again.`);
      setTimeout(() => setPhase('idle'), 2500);
    };

    rec.start();
  };

  const stopListening = () => {
    recRef.current?.stop();
    stopWave();
  };

  const sendVoice = async (text: string) => {
    setTranscript(text);
    setPhase('processing');
    startWave(20);
    try {
      const r = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId ?? undefined }),
      });
      const d = await r.json();
      if (d.session_id && !sessionId) setSessionId(d.session_id);
      const reply: string = d.content || '';
      setResponse(reply);
      setAgentName(d.agent_name || 'BURNO AI');
      await playTTS(reply.substring(0, 800));
    } catch {
      setPhase('error');
      setResponse('Could not reach the backend. Make sure it is running on port 8000.');
      setTimeout(() => setPhase('idle'), 3000);
    }
  };

  const playTTS = async (text: string) => {
    setPhase('speaking');
    startWave(36);
    try {
      const r = await fetch(`${API_BASE_URL}/api/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) { stopWave(); setPhase('idle'); return; }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => {
          stopWave();
          setPhase('idle');
          URL.revokeObjectURL(url);
        };
      }
    } catch { stopWave(); setPhase('idle'); }
  };

  const handleOrbClick = () => {
    if (phase === 'idle' || phase === 'error') startListening();
    else if (phase === 'listening') stopListening();
    else if (phase === 'speaking') {
      audioRef.current?.pause();
      stopWave();
      setPhase('idle');
    }
  };

  const handleQuick = (text: string) => {
    if (phase !== 'idle') return;
    setTranscript(text);
    sendVoice(text);
  };

  const orbColor = {
    idle: '#00d4ff', listening: '#00d4ff',
    processing: '#f59e0b', speaking: '#10b981', error: '#ef4444',
  }[phase];

  const statusText = {
    idle: ttsStatus?.configured
      ? 'Click orb to speak — ElevenLabs TTS ready ✓'
      : 'Click orb to speak (add ELEVENLABS_API_KEY for voice output)',
    listening: '🎙️ Listening... speak now',
    processing: '⚡ Processing your request...',
    speaking: `🔊 ${agentName} speaking...`,
    error: 'Error — click orb to try again',
  }[phase];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, height: 'calc(100vh - 9rem)' }}>
      {/* LEFT — main voice UI */}
      <motion.div className="glass-panel relative overflow-hidden"
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: 32 }}>
        <div className="hud-corner-tl" /><div className="hud-corner-br" />

        {/* ORB */}
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          {[0, 1].map(i => (
            <motion.div key={i}
              style={{ position: 'absolute', inset: -(i + 1) * 14, borderRadius: '50%', border: `1px solid ${orbColor}20` }}
              animate={{ rotate: 360 }}
              transition={{ duration: i === 0 ? 8 : 14, repeat: Infinity, ease: 'linear' }} />
          ))}
          <motion.div
            onClick={handleOrbClick}
            animate={{ scale: (phase === 'listening' || phase === 'speaking') ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 0.8, repeat: (phase === 'listening' || phase === 'speaking') ? Infinity : 0 }}
            style={{
              width: '100%', height: '100%', borderRadius: '50%', cursor: 'pointer',
              background: `radial-gradient(circle at 35% 35%, ${orbColor}dd, #8b5cf699 60%, #050816)`,
              boxShadow: `0 0 ${phase !== 'idle' ? 60 : 30}px ${orbColor}50, 0 0 ${phase !== 'idle' ? 120 : 60}px ${orbColor}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, userSelect: 'none',
            }}>
            {phase === 'listening' ? '🎙️' : phase === 'processing' ? '⚡' : phase === 'speaking' ? '🔊' : phase === 'error' ? '❌' : '🎙️'}
          </motion.div>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 52 }}>
          {waveData.map((h, i) => (
            <motion.div key={i}
              animate={{ height: h }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              style={{ width: 4, borderRadius: 2, background: `${orbColor}99` }} />
          ))}
        </div>

        {/* Status text */}
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 600, color: orbColor, textAlign: 'center', lineHeight: 1.5 }}>
          {statusText}
        </div>

        {/* Transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ maxWidth: 440, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', fontSize: 13, color: '#e2eeff', textAlign: 'center', lineHeight: 1.6 }}>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', marginBottom: 4, letterSpacing: '0.1em' }}>YOU SAID</span>
              &ldquo;{transcript}&rdquo;
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response */}
        <AnimatePresence>
          {response && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ maxWidth: 480, padding: '14px 18px', borderRadius: 14, background: 'rgba(0,212,255,.04)', border: '1px solid rgba(0,212,255,.12)', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7 }}>
              <span style={{ fontSize: 9, color: '#00d4ff', display: 'block', marginBottom: 5, fontWeight: 600, letterSpacing: '0.1em' }}>{agentName.toUpperCase()}</span>
              {response.substring(0, 300)}{response.length > 300 ? '…' : ''}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning if TTS not configured */}
        {!ttsStatus?.configured && (
          <div style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.15)', fontSize: 11, color: 'rgba(245,158,11,.85)', textAlign: 'center', maxWidth: 420 }}>
            💡 Add <code style={{ background: 'rgba(0,0,0,.3)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>ELEVENLABS_API_KEY</code> to <code style={{ background: 'rgba(0,0,0,.3)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>backend/.env</code> for AI voice output
          </div>
        )}
      </motion.div>

      {/* RIGHT — pipeline + quick commands */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Pipeline */}
        <motion.div className="glass-panel p-4 relative overflow-hidden" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="hud-corner-tr" />
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#e2eeff', marginBottom: 14 }}>Voice Pipeline</h3>
          {[
            { step: '01', label: 'STT', desc: 'Web Speech API (Chrome)', done: true },
            { step: '02', label: 'Agent Routing', desc: 'Auto-detect intent & route', done: true },
            { step: '03', label: 'Groq LLM', desc: 'LLaMA 3.3 70B response', done: true },
            { step: '04', label: 'TTS Output', desc: 'ElevenLabs voice synthesis', done: !!ttsStatus?.configured },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: s.done ? 'rgba(0,212,255,.1)' : 'rgba(255,255,255,.03)', border: `1px solid ${s.done ? 'rgba(0,212,255,.3)' : 'rgba(255,255,255,.06)'}` }}>
                <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: s.done ? '#00d4ff' : 'var(--text-muted)' }}>{s.done ? '✓' : s.step}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: s.done ? '#e2eeff' : 'var(--text-secondary)' }}>{s.label}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick commands */}
        <motion.div className="glass-panel p-4 relative overflow-hidden" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={{ flex: 1 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#e2eeff', marginBottom: 12 }}>Quick Commands</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {SAMPLE_COMMANDS.map((cmd, i) => (
              <motion.div key={i} whileHover={{ x: 4 }}
                onClick={() => handleQuick(cmd.text)}
                style={{ padding: '9px 12px', borderRadius: 11, background: `${cmd.color}07`, border: `1px solid ${cmd.color}15`, cursor: phase === 'idle' ? 'pointer' : 'not-allowed', opacity: phase !== 'idle' ? 0.5 : 1 }}>
                <div style={{ fontSize: 11, color: '#e2eeff', fontStyle: 'italic', marginBottom: 3 }}>&ldquo;{cmd.text}&rdquo;</div>
                <div style={{ fontSize: 9, color: cmd.color, fontWeight: 600 }}>→ {cmd.agent}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
