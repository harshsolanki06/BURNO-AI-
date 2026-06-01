'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Trash2, Copy, Mic, MoreHorizontal, CheckCheck, Code2 } from 'lucide-react';
import { Message } from '@/types';
import { formatTimestamp, getAgentIcon } from '@/lib/utils';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
  onClear: () => void;
}

const AGENT_COLORS: Record<string, string> = {
  research:     '#3b82f6',
  coding:       '#10b981',
  automation:   '#f97316',
  productivity: '#8b5cf6',
  vision:       '#f472b6',
  memory:       '#00d4ff',
};

// ─── Render message content with code block support ──────────────────────────
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines  = part.slice(3, -3).split('\n');
          const lang   = lines[0].trim() || 'code';
          const code   = lines.slice(1).join('\n');
          return (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(2,5,16,0.8)', border: '1px solid rgba(0,212,255,0.12)' }}
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5"
                style={{ borderBottom: '1px solid rgba(0,212,255,0.08)', background: 'rgba(0,212,255,0.04)' }}
              >
                <Code2 size={11} style={{ color: '#00d4ff' }} />
                <span className="mono" style={{ fontSize: 10, color: '#00d4ff', letterSpacing: '0.1em' }}>
                  {lang.toUpperCase()}
                </span>
              </div>
              <pre
                className="mono px-4 py-3 overflow-x-auto text-xs leading-relaxed"
                style={{ color: '#a8d8ea', whiteSpace: 'pre', fontSize: 12 }}
              >
                {code}
              </pre>
            </div>
          );
        }
        // Render checkmarks and bullets with light styling
        return (
          <div key={i} className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
            {part.split('\n').map((line, j) => {
              if (line.startsWith('✓') || line.startsWith('⟳') || line.startsWith('📌') ||
                  line.startsWith('📋') || line.startsWith('•')) {
                return (
                  <div key={j} className="flex items-start gap-2" style={{ paddingTop: 2 }}>
                    <span style={{ flexShrink: 0 }}>{line.slice(0, 2)}</span>
                    <span>{line.slice(2)}</span>
                  </div>
                );
              }
              return <span key={j}>{line}{j < part.split('\n').length - 1 ? '\n' : ''}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser   = msg.role === 'user';
  const isSystem = msg.role === 'system';
  const color    = msg.agentType ? (AGENT_COLORS[msg.agentType] || '#00d4ff') : '#00d4ff';

  const copy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isUser
            ? 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.12))'
            : isSystem
            ? 'rgba(139,92,246,0.1)'
            : `${color}12`,
          border: `1px solid ${isUser ? 'rgba(59,130,246,0.22)' : isSystem ? 'rgba(139,92,246,0.18)' : `${color}22`}`,
        }}
      >
        {isUser
          ? <User size={13} style={{ color: '#3b82f6' }} />
          : isSystem
          ? <Bot size={13} style={{ color: '#8b5cf6' }} />
          : <span style={{ fontSize: 13 }}>{getAgentIcon(msg.agentType || '')}</span>
        }
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Agent name */}
        {msg.agentName && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: color }} />
            <span className="label" style={{ color, fontSize: 9, letterSpacing: '0.12em' }}>
              {msg.agentName.toUpperCase()}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className="relative rounded-2xl px-4 py-3 w-full"
          style={{
            background: isUser
              ? 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.06))'
              : isSystem
              ? 'rgba(139,92,246,0.05)'
              : 'rgba(8,15,32,0.7)',
            border: isUser
              ? '1px solid rgba(59,130,246,0.16)'
              : isSystem
              ? '1px solid rgba(139,92,246,0.1)'
              : '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(16px)',
            color: isSystem ? 'var(--text-secondary)' : 'var(--text-primary)',
            fontStyle: isSystem ? 'italic' : 'normal',
          }}
        >
          {/* Top-left corner accent for assistant */}
          {!isUser && !isSystem && (
            <div className="absolute top-0 left-0 w-4 h-4" style={{
              borderTop: `1.5px solid ${color}28`,
              borderLeft: `1.5px solid ${color}28`,
              borderRadius: '12px 0 0 0',
            }} />
          )}

          {isUser || isSystem
            ? <p className="text-sm leading-relaxed">{msg.content}</p>
            : <MessageContent content={msg.content} />
          }
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-3 mt-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="label" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
            {formatTimestamp(msg.timestamp)}
          </span>
          {msg.metadata?.processingTime && (
            <span className="mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
              {msg.metadata.processingTime}ms
            </span>
          )}
          {msg.metadata?.model && (
            <span className="label" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
              {msg.metadata.model.split('-').slice(0, 2).join('-')}
            </span>
          )}
          {!isSystem && (
            <button
              onClick={copy}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
            >
              {copied
                ? <CheckCheck size={10} style={{ color: '#10b981' }} />
                : <Copy size={10} style={{ color: 'var(--text-muted)' }} />
              }
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.16)' }}>
        <Bot size={13} style={{ color: '#00d4ff' }} />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
        style={{ background: 'rgba(8,15,32,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'rgba(0,212,255,0.7)' }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
        <span className="label ml-1" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Processing…
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatInterface({ messages, onSendMessage, isProcessing, onClear }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [rows, setRows]   = useState(1);
  const endRef            = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    onSendMessage(input.trim());
    setInput('');
    setRows(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setRows(Math.min(e.target.value.split('\n').length, 5));
  };

  const canSend = input.trim().length > 0 && !isProcessing;

  const SUGGESTIONS = [
    'Search for AI news', 'Write a Python function', 'Analyze my screen', 'Recall memory',
  ];

  return (
    <motion.div
      className="glass-panel flex flex-col relative overflow-hidden"
      style={{ height: '100%' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
    >
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.14),rgba(99,102,241,0.1))', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Sparkles size={14} style={{ color: '#00d4ff' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#e2eeff' }}>BURNO AI</h3>
            <p className="label mt-0.5">Multi-agent • Claude Sonnet 4</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-1"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.14)' }}>
            <motion.div className="w-1 h-1 rounded-full" style={{ background: '#10b981' }}
              animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="label" style={{ color: '#10b981', fontSize: 9 }}>LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button onClick={onClear}
            className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.06)', color: '#ef4444' }}
            whileTap={{ scale: 0.94 }}>
            <Trash2 size={13} />
          </motion.button>
          <motion.button className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <MoreHorizontal size={13} />
          </motion.button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scroll-y">
        <AnimatePresence initial={false}>
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        </AnimatePresence>
        <AnimatePresence>
          {isProcessing && <TypingIndicator />}
        </AnimatePresence>

        {/* Suggestion chips — only when empty */}
        {messages.length === 1 && !isProcessing && (
          <motion.div
            className="flex flex-wrap gap-2 pt-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {SUGGESTIONS.map(s => (
              <motion.button
                key={s}
                onClick={() => onSendMessage(s)}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.14)',
                  color: 'rgba(0,212,255,0.8)',
                }}
                whileHover={{ backgroundColor: 'rgba(0,212,255,0.12)', borderColor: 'rgba(0,212,255,0.28)' }}
                whileTap={{ scale: 0.96 }}
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────── */}
      <div className="px-5 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-end gap-2.5">
          {/* Mic */}
          <motion.button
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}
            whileHover={{ scale: 1.06, backgroundColor: 'rgba(0,212,255,0.1)' }}
            whileTap={{ scale: 0.93 }}>
            <Mic size={14} style={{ color: '#00d4ff' }} />
          </motion.button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={rows}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask BURNO anything…  (Shift+Enter for new line)"
              disabled={isProcessing}
              className="glass-input resize-none w-full"
              style={{ paddingTop: 10, paddingBottom: 10, fontSize: 13, lineHeight: 1.55, minHeight: 40 }}
            />
          </div>

          {/* Send */}
          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: canSend ? 'linear-gradient(135deg,rgba(0,212,255,0.18),rgba(59,130,246,0.12))' : 'rgba(255,255,255,0.03)',
              border: canSend ? '1px solid rgba(0,212,255,0.32)' : '1px solid rgba(255,255,255,0.05)',
              boxShadow: canSend ? '0 0 18px rgba(0,212,255,0.12)' : 'none',
            }}
            whileHover={canSend ? { scale: 1.08, boxShadow: '0 0 28px rgba(0,212,255,0.22)' } : {}}
            whileTap={canSend ? { scale: 0.93 } : {}}>
            <Send size={14} style={{ color: canSend ? '#00d4ff' : 'var(--text-muted)' }} />
          </motion.button>
        </div>

        <p className="label mt-2 text-center" style={{ fontSize: 9 }}>
          Powered by Claude Sonnet 4 · Multi-agent routing active · 6 agents online
        </p>
      </div>
    </motion.div>
  );
}
