'use client';

/**
 * BURNO AI — Knowledge Base Panel
 * Upload docs (PDF/TXT/MD/DOCX), search, browse, delete
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

interface KBDoc {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  chunk_count: number;
  status: string;
  created_at: string;
  preview: string;
}

interface SearchHit extends KBDoc {
  matching_chunks: string[];
  match_count: number;
}

interface KBStats {
  total_documents: number;
  total_chunks: number;
  total_size_bytes: number;
  file_types: Record<string, number>;
}

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: '#ef4444', txt: '#10b981', md: '#3b82f6',
  mdx: '#3b82f6', docx: '#8b5cf6', doc: '#8b5cf6',
};

const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: '📕', txt: '📄', md: '📝', mdx: '📝', docx: '📘', doc: '📘',
};

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

export default function KnowledgePanel() {
  const [docs, setDocs] = useState<KBDoc[]>([]);
  const [stats, setStats] = useState<KBStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/knowledge/documents?limit=50`),
        fetch(`${API_BASE_URL}/api/knowledge/stats/summary`),
      ]);
      if (docsRes.ok) { const d = await docsRes.json(); setDocs(d.documents || []); }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Upload ──────────────────────────────────────────────────────────────
  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);

    for (const file of arr) {
      setUploadProgress(`Uploading ${file.name}…`);
      const form = new FormData();
      form.append('file', file);
      try {
        const r = await fetch(`${API_BASE_URL}/api/knowledge/upload`, { method: 'POST', body: form });
        if (!r.ok) {
          const e = await r.json();
          setUploadProgress(`❌ ${file.name}: ${e.detail}`);
          await new Promise(res => setTimeout(res, 2000));
        } else {
          const d = await r.json();
          setUploadProgress(`✅ ${d.filename} — ${d.chunk_count} chunks extracted`);
          await new Promise(res => setTimeout(res, 800));
        }
      } catch {
        setUploadProgress(`❌ ${file.name}: connection error`);
        await new Promise(res => setTimeout(res, 1500));
      }
    }

    setUploading(false);
    setUploadProgress('');
    loadData();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  // ── Search ──────────────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults(null); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`${API_BASE_URL}/api/knowledge/search?q=${encodeURIComponent(q)}&limit=20`);
        if (r.ok) { const d = await r.json(); setSearchResults(d.results || []); }
      } catch {}
      setSearching(false);
    }, 400);
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`${API_BASE_URL}/api/knowledge/${id}`, { method: 'DELETE' });
      setDocs(prev => prev.filter(d => d.id !== id));
      if (expandedId === id) setExpandedId(null);
      loadData();
    } catch {}
    setDeletingId(null);
  };

  const displayDocs = searchResults !== null ? searchResults : docs;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header + Stats */}
      <motion.div className="glass-panel p-5 relative overflow-hidden"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="hud-corner-tl" /><div className="hud-corner-tr" />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div className="dot-cyan" />
              <span className="label-accent">KNOWLEDGE BASE</span>
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#e2eeff' }}>
              📚 Knowledge Base
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Upload documents — BURNO extracts, chunks and searches them instantly
            </p>
          </div>
          <button onClick={loadData}
            style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            ↻ Refresh
          </button>
        </div>

        {/* Stat Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: 'Documents', val: stats?.total_documents ?? 0, color: '#00d4ff' },
            { label: 'Text Chunks', val: stats?.total_chunks ?? 0, color: '#10b981' },
            { label: 'Storage', val: fmtBytes(stats?.total_size_bytes ?? 0), color: '#8b5cf6' },
            { label: 'File Types', val: Object.keys(stats?.file_types ?? {}).length, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          padding: '28px 20px', borderRadius: 16, textAlign: 'center', cursor: uploading ? 'wait' : 'pointer',
          background: dragOver ? 'rgba(0,212,255,.06)' : 'rgba(255,255,255,.02)',
          border: `2px dashed ${dragOver ? 'rgba(0,212,255,.5)' : 'rgba(0,212,255,.2)'}`,
          transition: 'all .25s ease',
        }}>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.md,.mdx,.docx,.doc"
          style={{ display: 'none' }} onChange={handleFileInput} />

        {uploading ? (
          <div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(0,212,255,.2)', borderTopColor: '#00d4ff', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13, color: '#00d4ff', fontWeight: 500 }}>{uploadProgress || 'Processing…'}</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: dragOver ? '#00d4ff' : '#e2eeff', marginBottom: 6 }}>
              {dragOver ? 'Drop files here' : 'Drop files or click to upload'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Supports: PDF · TXT · Markdown · DOCX — max 20 MB each
            </div>
          </div>
        )}
      </motion.div>

      {/* Search bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
        <input
          type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)}
          placeholder="Search across all documents…"
          style={{ width: '100%', padding: '11px 14px 11px 40px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(0,212,255,.2)', borderRadius: 13, color: '#e2eeff', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }}
        />
        {searching && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-muted)' }}>Searching…</span>
        )}
        {searchResults !== null && !searching && (
          <button onClick={() => { setSearchQuery(''); setSearchResults(null); }}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        )}
      </motion.div>

      {/* Search result label */}
      {searchResults !== null && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          {searchResults.length === 0 ? `No results for "${searchQuery}"` : `${searchResults.length} document${searchResults.length !== 1 ? 's' : ''} match "${searchQuery}"`}
        </div>
      )}

      {/* Document list */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 13 }}>
            Loading knowledge base…
          </motion.div>
        ) : displayDocs.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2eeff', marginBottom: 8 }}>
              {searchResults !== null ? 'No matches found' : 'No documents yet'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {searchResults !== null
                ? 'Try a different search term.'
                : 'Upload your first document above.\nBURNO will extract the text and make it searchable.'}
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayDocs.map((doc, i) => {
              const color = FILE_TYPE_COLORS[doc.file_type] || '#00d4ff';
              const icon = FILE_TYPE_ICONS[doc.file_type] || '📄';
              const isExpanded = expandedId === doc.id;
              const hit = doc as SearchHit;

              return (
                <motion.div key={doc.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${color}12` }}>
                  
                  {/* Card header */}
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : doc.id)}>
                    {/* File icon */}
                    <div style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, background: `${color}10`, border: `1px solid ${color}20` }}>
                      {icon}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600, color: '#e2eeff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                        <span style={{ padding: '1px 6px', borderRadius: 100, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: `${color}10`, border: `1px solid ${color}20`, color, flexShrink: 0 }}>{doc.file_type}</span>
                        {doc.status === 'ready' && <span style={{ padding: '1px 6px', borderRadius: 100, fontSize: 8, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', color: '#10b981' }}>Ready</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-muted)' }}>
                        <span>{fmtBytes(doc.size_bytes)}</span>
                        <span>{doc.chunk_count} chunks</span>
                        <span>{fmtDate(doc.created_at)}</span>
                        {hit.match_count > 0 && <span style={{ color: '#f59e0b' }}>⚡ {hit.match_count} match{hit.match_count !== 1 ? 'es' : ''}</span>}
                      </div>
                      {/* Preview */}
                      {!isExpanded && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {doc.preview}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleDelete(doc.id)} disabled={deletingId === doc.id}
                        title="Delete document"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.05)', color: '#ef4444', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === doc.id ? 0.4 : 1 }}>
                        🗑
                      </button>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, alignSelf: 'center', marginLeft: 4 }}>
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ borderTop: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 16px' }}>
                          {/* Matching chunks for search */}
                          {hit.matching_chunks?.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>⚡ Matching Passages</div>
                              {hit.matching_chunks.map((chunk, ci) => (
                                <div key={ci} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.12)', fontSize: 12, color: '#e2eeff', lineHeight: 1.7, marginBottom: 6 }}>
                                  {chunk}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Full preview */}
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Document Preview</div>
                          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, maxHeight: 240, overflowY: 'auto', fontFamily: doc.file_type === 'txt' ? 'JetBrains Mono, monospace' : 'Inter, sans-serif', whiteSpace: 'pre-wrap' }}>
                            {doc.preview}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
