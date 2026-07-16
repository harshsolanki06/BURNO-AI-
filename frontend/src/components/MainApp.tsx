'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import BottomDock from '@/components/layout/BottomDock';
import RightPanel from '@/components/layout/RightPanel';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import HomeScreen from '@/components/dashboard/HomeScreen';
import ChatInterface from '@/components/chat/ChatInterface';
import LiveAgentsPanel from '@/components/dashboard/LiveAgentsPanel';
import MemoryPanel from '@/components/dashboard/MemoryPanel';
import VoicePanel from '@/components/voice/VoicePanel';
import KnowledgePanel from '@/components/knowledge/KnowledgePanel';
import WorkflowPanel from '@/components/workflows/WorkflowPanel';
import { useChat, useSystemStatus, useActivity } from '@/hooks/useEchoverse';
import SettingsPanel from '@/components/settings/SettingsPanel';

// ─── Placeholder View (coming soon) ───────────────────────────────────────────
const COMING_SOON: Record<string, { title: string; icon: string; desc: string; color: string }> = {
  research:   { title: 'Research Mode',     icon: '🔍', desc: 'Web research with sources, citations, and mind maps.', color: '#06b6d4' },
  automation: { title: 'Automation Studio', icon: '🤖', desc: 'Drag-and-drop workflow builder with browser control.', color: '#f97316' },
  settings:   { title: 'Settings',          icon: '⚙️', desc: 'Configure AI providers, voice, themes, and more.', color: '#6366f1' },
  analytics:  { title: 'Analytics',         icon: '📊', desc: 'Real-time charts of AI usage and agent performance.', color: '#8b5cf6' },
};

function PlaceholderView({ id }: { id: string }) {
  const cfg = COMING_SOON[id] || { title: id, icon: '🔧', desc: 'Coming soon.', color: '#00d4ff' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '70vh', gap: 20,
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 90, height: 90, borderRadius: 26, fontSize: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${cfg.color}10`, border: `1px solid ${cfg.color}20`,
          boxShadow: `0 0 40px ${cfg.color}20`,
        }}
      >
        {cfg.icon}
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 700, color: '#e2eeff', marginBottom: 8 }}>
          {cfg.title}
        </h2>
        <p style={{ fontSize: 14, color: '#5a7599', maxWidth: 380, lineHeight: 1.7 }}>{cfg.desc}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 100, background: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}>
        <motion.div
          animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }}
        />
        <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Coming in next update
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { messages, sendMessage, isProcessing, clearMessages } = useChat();
  const status = useSystemStatus();

  const handleQuickAction = (msg: string) => {
    setActiveTab('chat');
    sendMessage(msg);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HomeScreen onSendMessage={handleQuickAction} onTabChange={setActiveTab} />;

      case 'chat':
        return (
          <div style={{ height: 'calc(100vh - 120px)', padding: '0 8px' }}>
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isProcessing={isProcessing}
              onClear={clearMessages}
            />
          </div>
        );

      case 'agents':
        return <LiveAgentsPanel />;

      case 'memory':
        return <MemoryPanel />;

      case 'voice':
        return <VoicePanel />;

      case 'knowledge':
        return <KnowledgePanel />;

      case 'workflows':
        return <WorkflowPanel />;

      case 'settings':
        return <SettingsPanel />;

      default:
        return <PlaceholderView id={activeTab} />;
    }
  };

  const isHome = activeTab === 'dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020510', overflow: 'hidden' }}>
      {/* Animated background — always underneath */}
      <AnimatedBackground />

      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content area */}
      <main style={{
        flex: 1,
        marginLeft: 64,  // sidebar collapsed width
        marginRight: 48, // right panel collapsed width
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        overflowX: 'hidden',
      }}>
        {/* Top status bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(2,5,16,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              BURNO AI
            </span>
            <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: 11, color: '#3d5070', textTransform: 'capitalize' }}>{activeTab}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }}
              />
              <span style={{ fontSize: 10, color: '#3d5070' }}>All systems online</span>
            </div>
            <span style={{ fontSize: 10, color: '#1e3050', fontFamily: 'JetBrains Mono, monospace' }}>
              v2.0.0
            </span>
          </div>
        </div>

        {/* Page content */}
        <div
          className="scroll-y"
          style={{
            padding: isHome ? 0 : '20px 24px 100px',
            height: 'calc(100vh - 53px)',
            overflowY: 'auto',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Right Panel — AI Activity */}
      <RightPanel />

      {/* Bottom Dock */}
      <BottomDock activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
