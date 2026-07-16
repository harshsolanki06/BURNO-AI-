'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '@/types';

// ─── Thinking Indicator ────────────────────────────────────────────────────────
function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))',
        border: '1px solid rgba(0,212,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>⚡</div>
      <div style={{
        padding: '12px 16px', borderRadius: 16, borderBottomLeftRadius: 4,
        background: 'rgba(5,8,22,0.85)',
        border: '1px solid rgba(0,212,255,0.12)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 500, letterSpacing: '0.05em' }}>BURNO is reasoning</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: 4, height: 4, borderRadius: '50%', background: '#00d4ff' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Code Block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', margin: '8px 0', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 10, color: '#5a7599', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{language || 'code'}</span>
        <motion.button whileTap={{ scale: 0.95 }} onClick={copy} style={{ fontSize: 10, color: copied ? '#10b981' : '#5a7599', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          {copied ? '✓ Copied' : 'Copy'}
        </motion.button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, padding: '14px', background: 'rgba(2,4,16,0.9)', fontSize: 12, lineHeight: 1.6 }}
        showLineNumbers={code.split('\n').length > 5}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const [liked, setLiked] = useState<null | boolean>(null);
  const [copied, setCopied] = useState(false);

  const copyMsg = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end', gap: 10,
        marginBottom: 20,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.2))'
          : 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))',
        border: `1px solid ${isUser ? 'rgba(59,130,246,0.3)' : 'rgba(0,212,255,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13,
      }}>
        {isUser ? '👤' : '⚡'}
      </div>

      <div style={{ maxWidth: '72%', minWidth: 0 }}>
        {/* Bubble */}
        <motion.div
          whileHover={{ boxShadow: isUser ? '0 8px 30px rgba(59,130,246,0.15)' : '0 8px 30px rgba(0,212,255,0.08)' }}
          style={{
            padding: '12px 16px',
            borderRadius: 18,
            borderBottomRightRadius: isUser ? 4 : 18,
            borderBottomLeftRadius: isUser ? 18 : 4,
            background: isUser
              ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.12))'
              : 'rgba(5,8,22,0.85)',
            border: `1px solid ${isUser ? 'rgba(59,130,246,0.25)' : 'rgba(0,212,255,0.1)'}`,
            backdropFilter: 'blur(20px)',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Shimmer for user */}
          {isUser && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
          )}

          {/* Left accent for BURNO */}
          {!isUser && (
            <div style={{
              position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 2, borderRadius: 2,
              background: 'linear-gradient(180deg, #00d4ff, #8b5cf6)',
              boxShadow: '0 0 8px rgba(0,212,255,0.5)',
            }} />
          )}

          <div style={{ paddingLeft: !isUser ? 10 : 0 }}>
            {isUser ? (
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#e2eeff', margin: 0 }}>{message.content}</p>
            ) : (
              <div className="markdown-content" style={{ fontSize: 14, lineHeight: 1.7, color: '#c8deff' }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { children, className } = props;
                      const match = /language-(\w+)/.exec(className || '');
                      const isBlock = String(children).includes('\n');
                      if (isBlock) {
                        return <CodeBlock code={String(children).replace(/\n$/, '')} language={match?.[1] || ''} />;
                      }
                      return <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: 'rgba(0,212,255,0.08)', padding: '2px 6px', borderRadius: 4, color: '#00d4ff' }}>{children}</code>;
                    },
                    p: ({ children }) => <p style={{ margin: '0 0 10px 0', lastChild: 0 } as React.CSSProperties}>{children}</p>,
                    ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: 20 }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ margin: '8px 0', paddingLeft: 20 }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: 4, color: '#c8deff' }}>{children}</li>,
                    h1: ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 700, color: '#e2eeff', margin: '12px 0 6px', fontFamily: 'Space Grotesk, sans-serif' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2eeff', margin: '10px 0 5px' }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, color: '#c8deff', margin: '8px 0 4px' }}>{children}</h3>,
                    blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid rgba(0,212,255,0.4)', paddingLeft: 12, margin: '8px 0', color: '#7a96bb', fontStyle: 'italic' }}>{children}</blockquote>,
                    table: ({ children }) => <table style={{ borderCollapse: 'collapse', width: '100%', margin: '10px 0', fontSize: 12 }}>{children}</table>,
                    th: ({ children }) => <th style={{ padding: '6px 12px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.12)', color: '#00d4ff', fontWeight: 600, textAlign: 'left' }}>{children}</th>,
                    td: ({ children }) => <td style={{ padding: '6px 12px', border: '1px solid rgba(255,255,255,0.04)', color: '#c8deff' }}>{children}</td>,
                    strong: ({ children }) => <strong style={{ color: '#e2eeff', fontWeight: 600 }}>{children}</strong>,
                    a: ({ children, href }) => <a href={href} style={{ color: '#00d4ff', textDecoration: 'underline', textDecorationStyle: 'dotted' }} target="_blank" rel="noreferrer">{children}</a>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </motion.div>

        {/* Message actions */}
        {!isUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 6, marginTop: 6, paddingLeft: 10 }}
          >
            {[
              { icon: copied ? '✓' : '⊕', label: 'Copy', action: copyMsg, color: copied ? '#10b981' : '#3d5070' },
              { icon: '↺', label: 'Regenerate', action: () => {}, color: '#3d5070' },
              { icon: '👍', label: 'Like', action: () => setLiked(true), color: liked === true ? '#10b981' : '#3d5070' },
              { icon: '👎', label: 'Dislike', action: () => setLiked(false), color: liked === false ? '#ef4444' : '#3d5070' },
            ].map(a => (
              <motion.button key={a.label} whileHover={{ y: -1, color: '#c8deff' }} whileTap={{ scale: 0.9 }}
                onClick={a.action}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: a.color, padding: '2px 4px', transition: 'color 0.2s' }}
              >
                {a.icon}
              </motion.button>
            ))}
            <span style={{ fontSize: 10, color: '#1e3050', marginLeft: 4, alignSelf: 'center' }}>
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyChat() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 48 }}
      >
        ⚡
      </motion.div>
      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 600, color: '#e2eeff' }}>Start a conversation</h3>
      <p style={{ fontSize: 13, color: '#3d5070', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        Ask BURNO anything — research, code, analysis, automation, and more.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 400 }}>
        {['What can you do?', 'Write me some Python code', 'Explain quantum computing'].map(s => (
          <div key={s} style={{ padding: '6px 12px', borderRadius: 100, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', fontSize: 11, color: '#00d4ff', cursor: 'pointer' }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chat Interface ────────────────────────────────────────────────────────────
interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  onClear: () => void;
}

export default function ChatInterface({ messages, onSendMessage, isProcessing, onClear }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'rgba(2,5,16,0.4)',
      borderRadius: 20, border: '1px solid rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(3,6,20,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 8px rgba(16,185,129,0.5)', '0 0 16px rgba(16,185,129,0.8)', '0 0 8px rgba(16,185,129,0.5)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}
          />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 600, color: '#e2eeff' }}>BURNO Chat</span>
          <span style={{ fontSize: 10, color: '#3d5070', padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {messages.length} messages
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onClear}
          style={{ fontSize: 11, color: '#3d5070', background: 'none', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          Clear
        </motion.button>
      </div>

      {/* Messages */}
      <div className="scroll-y" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            <AnimatePresence>
              {isProcessing && <ThinkingIndicator />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(3,6,20,0.6)' }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '8px 8px 8px 16px',
          background: 'rgba(5,8,22,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          backdropFilter: 'blur(20px)',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isProcessing ? 'BURNO is thinking...' : 'Message BURNO...'}
            disabled={isProcessing}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#e2eeff', fontSize: 14, fontFamily: 'Inter, sans-serif',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            style={{
              width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: input.trim() && !isProcessing
                ? 'linear-gradient(135deg, #00d4ff, #3b82f6)'
                : 'rgba(255,255,255,0.04)',
              color: input.trim() && !isProcessing ? '#050816' : '#3d5070',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
              boxShadow: input.trim() ? '0 0 16px rgba(0,212,255,0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {isProcessing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#00d4ff' }}
              />
            ) : '→'}
          </motion.button>
        </div>
        <p style={{ fontSize: 10, color: '#1e3050', textAlign: 'center', marginTop: 8 }}>
          BURNO AI · Groq LLaMA 3.3 70B · Press Enter to send
        </p>
      </div>
    </div>
  );
}
