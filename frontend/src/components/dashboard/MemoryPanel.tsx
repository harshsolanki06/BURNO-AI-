'use client';

/**
 * BURNO AI — Memory Panel View
 * Full CRUD memory view: browse, search, add, delete
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

interface MemoryItem {
  id: string;
  content: string;
  category: string;
  tags: string[];
  relevance_score: number;
  created_at: string;
}

interface MemStats {
  total: number;
  categories: Record<string, number>;
}

const CAT_COLORS: Record<string, string> = {
  conversation: '#00d4ff',
  knowledge:    '#10b981',
  task:         '#f59e0b',
  note:         '#8b5cf6',
  preference:   '#f472b6',
};

const CATEGORIES = ['all', 'conversation', 'knowledge', 'task', 'note', 'preference'];

export default function MemoryPanel() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [stats, setStats] = useState<MemStats>({ total: 0, categories: {} });
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [newCat, setNewCat] = useState('conversation');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/memory/stats`);
      if (r.ok) setStats(await r.json());
    } catch {}
  }, []);

  const loadMemories = useCallback(async (q = '', cat = 'all') => {
    setLoading(true);
    try {
      let url: string;
      if (q.trim()) {
        url = `${API_BASE_URL}/api/memory/search?query=${encodeURIComponent(q)}&limit=30`;
      } else {
        url = `${API_BASE_URL}/api/memory/list?limit=50&category=${cat}`;
      }
      const r = await fetch(url);
      if (!r.ok) throw new Error('fetch failed');
      const d = await r.json();
      setMemories(d.results ?? d.memories ?? []);
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadMemories('', 'all');
  }, [loadStats, loadMemories]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadMemories(v, activeCat), 350);
  };

  const handleCat = (cat: string) => {
    setActiveCat(cat);
    setSearch('');
    loadMemories('', cat);
  };

  const handleSave = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/memory/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim(), category: newCat }),
      });
      if (r.ok) {
        setNewContent('');
        await Promise.all([loadStats(), loadMemories(search, activeCat)]);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`${API_BASE_URL}/api/memory/${id}`, { method: 'DELETE' });
      setMemories(prev => prev.filter(m => m.id !== id));
      loadStats();
    } catch {}
    setDeletingId(null);
  };

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 relative overflow-hidden">
        <div className="hud-corner-tl" /><div className="hud-corner-tr" />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div className="dot-cyan" />
              <span className="label-accent">MEMORY SYSTEM</span>
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#e2eeff', marginBottom: 4 }}>
              🧠 Memory Bank
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Store, search and manage everything BURNO knows about you
            </p>
          </div>
          <button
            onClick={() => { loadStats(); loadMemories(search, activeCat); }}
            style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border-soft)', background: 'rgba(255,255,255,.03)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 16 }}>
          {[
            { label: 'Total', val: stats.total, color: '#00d4ff' },
            { label: 'Conversations', val: stats.categories.conversation ?? 0, color: '#8b5cf6' },
            { label: 'Knowledge', val: stats.categories.knowledge ?? 0, color: '#10b981' },
            { label: 'Tasks', val: stats.categories.task ?? 0, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add new memory */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-4 relative overflow-hidden">
        <div style={{ fontSize: 10, fontWeight: 600, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>+ Store New Memory</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Enter memory content — a note, fact, preference, or anything BURNO should remember..."
            rows={3}
            style={{ flex: 1, padding: '10px 13px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(0,212,255,.15)', borderRadius: 11, color: '#e2eeff', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave(); }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <select
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              style={{ padding: '8px 10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(0,212,255,.15)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer', minWidth: 120 }}
            >
              {CATEGORIES.slice(1).map(c => <option key={c} value={c} style={{ background: '#050816' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <button
              onClick={handleSave}
              disabled={saving || !newContent.trim()}
              style={{ padding: '9px 12px', background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', border: 'none', borderRadius: 10, color: '#050816', fontSize: 12, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'Inter, sans-serif' }}
            >
              {saving ? 'Saving…' : '💾 Save'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search + filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="🔍 Search memories..."
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(0,212,255,.2)', borderRadius: 12, color: '#e2eeff', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCat(cat)}
              style={{
                padding: '5px 11px', borderRadius: 100, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                border: activeCat === cat ? '1px solid rgba(0,212,255,.35)' : '1px solid rgba(255,255,255,.07)',
                background: activeCat === cat ? 'rgba(0,212,255,.1)' : 'rgba(255,255,255,.02)',
                color: activeCat === cat ? '#00d4ff' : 'var(--text-secondary)',
                transition: 'all .2s',
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Memory list */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: 13 }}>
            Loading memories...
          </motion.div>
        ) : memories.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
            {search ? `No memories found for "${search}"` : 'No memories yet. Store your first memory above or chat with BURNO.'}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memories.map((m, i) => {
              const cc = CAT_COLORS[m.category] || '#00d4ff';
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-panel"
                  style={{ padding: '13px 15px', cursor: 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, fontSize: 12, color: '#e2eeff', lineHeight: 1.65 }}>{m.content}</div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button
                        onClick={() => navigator.clipboard?.writeText(m.content)}
                        title="Copy"
                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >📋</button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        title="Delete"
                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.05)', color: '#ef4444', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === m.id ? 0.5 : 1 }}
                      >🗑</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', background: `rgba(${parseInt(cc.slice(1,3),16)},${parseInt(cc.slice(3,5),16)},${parseInt(cc.slice(5,7),16)},0.08)`, border: `1px solid ${cc}30`, color: cc }}>
                      {m.category}
                    </span>
                    {(m.tags || []).map(t => (
                      <span key={t} style={{ padding: '1px 6px', borderRadius: 100, fontSize: 9, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: 'var(--text-muted)' }}>{t}</span>
                    ))}
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 'auto' }}>{fmtDate(m.created_at)}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
