'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import ChatInterface from '@/components/chat/ChatInterface';
import VoiceVisualizer from '@/components/voice/VoiceVisualizer';
import AgentsPanel from '@/components/dashboard/AgentsPanel';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SystemStats from '@/components/dashboard/SystemStats';
import QuickActions from '@/components/dashboard/QuickActions';
import HeroPanel from '@/components/dashboard/HeroPanel';
import { useChat, useVoice, useSystemStatus } from '@/hooks/useEchoverse';
import { VoiceState } from '@/types';
import { AGENTS, QUICK_ACTIONS, SAMPLE_ACTIVITY } from '@/lib/constants';

// ─── View: Dashboard ─────────────────────────────────────────────────────────
function DashboardView({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  const status = useSystemStatus();
  return (
    <div className="space-y-5">
      {/* Hero — full width */}
      <HeroPanel />

      {/* Below hero: 2 columns with breathing room */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 380px' }}>
        {/* Left: Quick Actions (primary) */}
        <QuickActions actions={QUICK_ACTIONS} onAction={onSendMessage} />

        {/* Right: Stats + Activity stacked */}
        <div className="flex flex-col gap-5">
          <SystemStats status={status} />
          <ActivityFeed items={SAMPLE_ACTIVITY} />
        </div>
      </div>
    </div>
  );
}

// ─── View: Agents ─────────────────────────────────────────────────────────────
function AgentsView() {
  return (
    <div className="space-y-4">
      <motion.div
        className="glass-panel p-5 relative overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="flex items-center gap-3 mb-1">
          <div className="dot-cyan" />
          <span className="label-accent">MULTI-AGENT SYSTEM</span>
        </div>
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'Orbitron, sans-serif', color: '#e2eeff' }}
        >
          AI Agent Network
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          6 specialized agents collaborate to route and handle your requests. The orchestrator
          automatically selects the most capable agent for each task.
        </p>
      </motion.div>
      <AgentsPanel agents={AGENTS} />
    </div>
  );
}

// ─── View: Voice ──────────────────────────────────────────────────────────────
function VoiceView({
  voiceState, waveformData, transcript, onStart, onStop,
}: {
  voiceState: VoiceState; waveformData: number[]; transcript: string;
  onStart: () => void; onStop: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-4" style={{ height: 'calc(100vh - 9rem)' }}>
      {/* Left spacer */}
      <motion.div
        className="glass-panel p-5 relative overflow-hidden"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="hud-corner-tl" />
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#e2eeff' }}>Voice Pipeline</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Powered by Whisper STT for speech recognition and ElevenLabs TTS for natural response synthesis.
        </p>
        <div className="space-y-2.5">
          {[
            { step: '01', label: 'Wake Word', desc: 'Say "Echo"', done: true },
            { step: '02', label: 'STT',       desc: 'Whisper transcribes', done: true },
            { step: '03', label: 'Routing',   desc: 'Agent selected', done: false },
            { step: '04', label: 'Claude',    desc: 'AI response', done: false },
            { step: '05', label: 'TTS',       desc: 'ElevenLabs speaks', done: false },
          ].map(s => (
            <div key={s.step} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: s.done ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${s.done ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <span className="mono" style={{ fontSize: 8, color: s.done ? '#00d4ff' : 'var(--text-dim)' }}>
                  {s.step}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: s.done ? '#e2eeff' : 'var(--text-secondary)' }}>
                  {s.label}
                </p>
                <p className="label" style={{ fontSize: 9 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Center: Voice visualizer */}
      <VoiceVisualizer
        voiceState={voiceState}
        waveformData={waveformData}
        transcript={transcript}
        onStartListening={onStart}
        onStopListening={onStop}
      />

      {/* Right: Commands */}
      <motion.div
        className="glass-panel p-5 relative overflow-hidden"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="hud-corner-tr" />
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#e2eeff' }}>Voice Commands</h3>
        <div className="space-y-2">
          {[
            { cmd: '"Search for latest AI news"',     agent: 'Research', color: '#3b82f6' },
            { cmd: '"Write a Python function"',        agent: 'Coding',   color: '#10b981' },
            { cmd: '"Open YouTube"',                   agent: 'Automation', color: '#f97316' },
            { cmd: '"Analyze my screen"',              agent: 'Vision',   color: '#f472b6' },
            { cmd: '"What did we discuss before?"',    agent: 'Memory',   color: '#00d4ff' },
            { cmd: '"Create a task for tomorrow"',     agent: 'Productivity', color: '#8b5cf6' },
          ].map((c, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl"
              style={{ background: `${c.color}07`, border: `1px solid ${c.color}15` }}
            >
              <p className="text-xs mb-0.5" style={{ color: '#e2eeff', fontStyle: 'italic' }}>{c.cmd}</p>
              <p className="label" style={{ fontSize: 9, color: c.color }}>→ {c.agent} Agent</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Placeholder View ─────────────────────────────────────────────────────────
const VIEW_CONFIG: Record<string, { title: string; description: string; icon: string }> = {
  automation:  { title: 'Automation Engine',  description: 'Browser control, form filling, and workflow automation with Playwright & PyAutoGUI.', icon: '⚡' },
  vision:      { title: 'Vision System',      description: 'Screen analysis, OCR text extraction, object detection, and face recognition via OpenCV & YOLOv8.', icon: '👁️' },
  terminal:    { title: 'AI Terminal',        description: 'Execute shell commands with AI assistance and real-time output analysis.', icon: '💻' },
  workflows:   { title: 'Workflow Builder',   description: 'Chain AI actions into automated workflows that execute autonomously.', icon: '🔄' },
  memory:      { title: 'Memory System',      description: 'Semantic memory storage and retrieval via ChromaDB vector embeddings.', icon: '🧠' },
  research:    { title: 'Research Agent',     description: 'Web scraping, article summarization, and knowledge synthesis on any topic.', icon: '🔍' },
  analytics:   { title: 'Analytics Center',  description: 'AI operation metrics, performance charts, usage statistics, and insights.', icon: '📊' },
  settings:    { title: 'Settings',          description: 'Configure voice, agents, API keys, themes, and system preferences.', icon: '⚙️' },
};

function PlaceholderView({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <motion.div
      className="glass-panel p-16 text-center relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />
      <div className="hud-scanline" />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.03), transparent)' }}
      />

      <motion.div
        className="text-5xl mb-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {icon}
      </motion.div>

      <h2
        className="text-2xl font-bold gradient-text mb-3"
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        {title}
      </h2>
      <p className="text-sm mx-auto mb-8" style={{ color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.7 }}>
        {description}
      </p>

      <div
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.18)' }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#00d4ff', boxShadow: '0 0 6px rgba(0,212,255,0.8)' }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="label-accent">Backend Integration Required</span>
      </div>
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { messages, sendMessage, isProcessing, clearMessages } = useChat();
  const { voiceState, transcript, waveformData, startListening, stopListening } = useVoice();
  const status = useSystemStatus();

  const handleQuickAction = (command: string) => {
    setActiveTab('chat');
    const prompts: Record<string, string> = {
      search:    'Search the web for the latest breakthroughs in AI.',
      code:      'Generate a Python function to sort a list with O(n log n) complexity.',
      browser:   'Open my browser and navigate to GitHub.',
      screenshot:'Analyze my current screen and describe everything you see.',
      task:      'Create a new task for my project planning backlog.',
      recall:    'What were we discussing in our last session? Recall context.',
      voice:     'Activate voice mode',
      workflow:  'Run my morning workflow automation sequence.',
    };
    sendMessage(prompts[command] || `Execute: ${command}`);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onSendMessage={handleQuickAction} />;

      case 'chat':
        return (
          <div style={{ height: 'calc(100vh - 9rem)' }}>
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isProcessing={isProcessing}
              onClear={clearMessages}
            />
          </div>
        );

      case 'voice':
        return (
          <VoiceView
            voiceState={voiceState}
            waveformData={waveformData}
            transcript={transcript}
            onStart={startListening}
            onStop={stopListening}
          />
        );

      case 'agents':
        return <AgentsView />;

      default: {
        const cfg = VIEW_CONFIG[activeTab];
        return cfg ? <PlaceholderView {...cfg} /> : null;
      }
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#020510' }}>
      {/* Animated background layer */}
      <AnimatedBackground />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main
        className="flex-1 min-h-screen relative"
        style={{ marginLeft: 72, paddingTop: 60, zIndex: 1 }}
      >
        {/* Top bar */}
        <TopBar status={status} />

        {/* Page content */}
        <div className="p-6 overflow-y-auto scroll-y" style={{ height: 'calc(100vh - 60px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
