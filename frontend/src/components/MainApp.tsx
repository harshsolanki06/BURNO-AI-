'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import ChatInterface from '@/components/chat/ChatInterface';
import HeroPanel from '@/components/dashboard/HeroPanel';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SystemStats from '@/components/dashboard/SystemStats';
import LiveAgentsPanel from '@/components/dashboard/LiveAgentsPanel';
import MemoryPanel from '@/components/dashboard/MemoryPanel';
import VoicePanel from '@/components/voice/VoicePanel';
import KnowledgePanel from '@/components/knowledge/KnowledgePanel';
import WorkflowPanel from '@/components/workflows/WorkflowPanel';
import { useChat, useSystemStatus, useActivity } from '@/hooks/useEchoverse';
import { QUICK_ACTIONS } from '@/lib/constants';

// ─── Dashboard ───────────────────────────────────────────────────────────────
function DashboardView({ onSendMessage, activityItems }: {
  onSendMessage: (msg: string) => void;
  activityItems: import('@/types').ActivityItem[];
}) {
  const status = useSystemStatus();
  return (
    <div className="space-y-5">
      <HeroPanel />
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 380px' }}>
        <QuickActions actions={QUICK_ACTIONS} onAction={onSendMessage} />
        <div className="flex flex-col gap-5">
          <SystemStats status={status} />
          <ActivityFeed items={activityItems} />
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder ─────────────────────────────────────────────────────────────
const PLACEHOLDERS: Record<string, { title: string; description: string; icon: string; soon?: boolean }> = {
  knowledge:  { title: 'Knowledge Base',    icon: '📚', description: 'Upload documents, PDFs, and articles. BURNO indexes them for semantic search and recall.', soon: true },
  workflows:  { title: 'Workflow Builder',  icon: '⚡', description: 'Chain AI actions into automated workflows — research + summarize + store to memory.', soon: true },
  automation: { title: 'Automation Engine', icon: '🤖', description: 'Browser control, form filling, and multi-step workflow execution with Playwright.', soon: true },
  analytics:  { title: 'Analytics Center',  icon: '📊', description: 'Real-time charts of AI usage, agent performance, and system metrics.', soon: true },
  settings:   { title: 'Settings',          icon: '⚙️', description: 'Configure API keys, voice preferences, theme, and agent behavior.', soon: false },
};

function PlaceholderView({ id }: { id: string }) {
  const cfg = PLACEHOLDERS[id] || { title: id, icon: '🔧', description: 'Coming soon.' };
  return (
    <motion.div className="glass-panel p-16 text-center relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="hud-corner-tl" /><div className="hud-corner-tr" />
      <div className="hud-corner-bl" /><div className="hud-corner-br" />
      <div className="hud-scanline" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.03), transparent)' }} />
      <motion.div className="text-5xl mb-6" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        {cfg.icon}
      </motion.div>
      <h2 className="text-2xl font-bold gradient-text mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cfg.title}</h2>
      <p className="text-sm mx-auto mb-8" style={{ color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.7 }}>{cfg.description}</p>
      {cfg.soon && (
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.18)' }}>
          <motion.div className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#00d4ff', boxShadow: '0 0 6px rgba(0,212,255,0.8)' }}
            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="label-accent">Coming in next update</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { messages, sendMessage, isProcessing, clearMessages } = useChat();
  const status = useSystemStatus();
  const activityItems = useActivity();

  const handleQuickAction = (command: string) => {
    setActiveTab('chat');
    const prompts: Record<string, string> = {
      search:     'Search the web for the latest breakthroughs in AI this week.',
      code:       'Generate a Python function to sort a list of dictionaries by a key.',
      browser:    'Open my browser and navigate to GitHub.',
      screenshot: 'Analyze my current screen and describe everything you see.',
      task:       'Create a new task for my project planning backlog.',
      recall:     'What were we discussing in our last session? Recall context.',
      voice:      'Activate voice mode',
      workflow:   'Run my morning workflow automation sequence.',
    };
    sendMessage(prompts[command] || `Execute: ${command}`);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onSendMessage={handleQuickAction} activityItems={activityItems} />;

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

      default:
        return PLACEHOLDERS[activeTab]
          ? <PlaceholderView id={activeTab} />
          : null;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#020510' }}>
      <AnimatedBackground />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 min-h-screen relative" style={{ marginLeft: 72, paddingTop: 60, zIndex: 1 }}>
        <TopBar status={status} />
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
