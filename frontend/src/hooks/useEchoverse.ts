'use client';

/**
 * EchoVerse AI OS — Core Hooks
 * useChat:         Sends messages to POST /api/chat and manages conversation state
 * useVoice:        Voice visualizer (simulated until STT/TTS endpoints are built)
 * useSystemStatus: Polls GET /api/system/status for real system metrics
 * useActivity:     Polls GET /api/activity for live activity feed data
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, VoiceState, SystemStatus, AgentType, ActivityItem } from '@/types';
import { generateId } from '@/lib/utils';
import { chatSend, getSystemStatus as fetchSystemStatus } from '@/lib/api';
import { SAMPLE_ACTIVITY, API_BASE_URL } from '@/lib/constants';

// ─── Agent display names ──────────────────────────────────────────────────────
const AGENT_NAMES: Record<string, string> = {
  research: 'Research Agent',
  coding: 'Coding Agent',
  automation: 'Automation Agent',
  productivity: 'Productivity Agent',
  vision: 'Vision Agent',
  memory: 'Memory Agent',
};

// ─── useChat (streaming — tokens appear word-by-word) ────────────────────────
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'system',
      content:
        'BURNO AI OS v2.0 initialized. All 6 agents online. Ready to assist — ask me anything!',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Add user message immediately
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Placeholder for the streaming assistant reply
    const streamId = generateId();
    const streamMsg: Message = {
      id: streamId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      agentType: undefined,
      agentName: 'Thinking…',
    };
    setMessages(prev => [...prev, streamMsg]);

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('echoverse_token')
        : null;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          session_id: sessionIdRef.current || undefined,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));

            if (evt.error) {
              setMessages(prev => prev.map(m =>
                m.id === streamId
                  ? { ...m, content: `Error: ${evt.error}`, agentName: 'Error' }
                  : m
              ));
              break;
            }

            if (evt.token !== undefined) {
              accumulated += evt.token;
              const snap = accumulated;
              setMessages(prev => prev.map(m =>
                m.id === streamId ? { ...m, content: snap } : m
              ));
            }

            if (evt.done) {
              // Save session ID for conversation continuity
              if (!sessionIdRef.current) sessionIdRef.current = evt.session_id;

              setMessages(prev => prev.map(m =>
                m.id === streamId
                  ? {
                      ...m,
                      id: evt.id,
                      agentType: evt.agent_type as AgentType,
                      agentName: evt.agent_name,
                      timestamp: evt.timestamp,
                      metadata: {
                        tokens: evt.tokens,
                        processingTime: evt.processing_time_ms,
                        model: 'burno-multi-agent',
                      },
                    }
                  : m
              ));
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }
    } catch (error) {
      // Streaming failed — fall back to regular endpoint
      try {
        const resp = await chatSend(content, sessionIdRef.current || undefined);
        if (!sessionIdRef.current) sessionIdRef.current = resp.session_id;

        setMessages(prev => prev.map(m =>
          m.id === streamId
            ? {
                ...m,
                id: resp.id,
                content: resp.content,
                agentType: resp.agent_type as AgentType,
                agentName: resp.agent_name,
                timestamp: resp.timestamp,
                metadata: {
                  tokens: resp.tokens,
                  processingTime: resp.processing_time_ms,
                  model: 'burno-multi-agent',
                },
              }
            : m
        ));
      } catch (fallbackErr) {
        const errText = fallbackErr instanceof Error
          ? fallbackErr.message
          : 'Could not reach the backend. Is the server running on port 8000?';
        setMessages(prev => prev.map(m =>
          m.id === streamId
            ? { ...m, content: `⚠️ ${errText}`, agentName: 'Error' }
            : m
        ));
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const clearMessages = useCallback(() => {
    sessionIdRef.current = null;
    setMessages([{
      id: generateId(),
      role: 'system',
      content: 'Conversation cleared. BURNO AI ready — ask me anything!',
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  return { messages, sendMessage, isProcessing, clearMessages };
}

// ─── useVoice (simulated — real voice requires Whisper/ElevenLabs endpoints) ─
export function useVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [waveformData, setWaveformData] = useState<number[]>(new Array(28).fill(3));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startListening = useCallback(() => {
    setVoiceState('listening');
    setTranscript('');

    intervalRef.current = setInterval(() => {
      setWaveformData(Array.from({ length: 28 }, () => Math.random() * 48 + 4));
    }, 80);

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setWaveformData(Array.from({ length: 28 }, () => Math.random() * 20 + 2));
      setVoiceState('processing');
      setTranscript('Analyze the current screen and describe what you see in detail…');

      setTimeout(() => {
        setVoiceState('speaking');
        setWaveformData(Array.from({ length: 28 }, () => Math.random() * 32 + 4));

        setTimeout(() => {
          setVoiceState('idle');
          setWaveformData(new Array(28).fill(3));
          setTranscript('');
        }, 4000);
      }, 1600);
    }, 3500);
  }, []);

  const stopListening = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVoiceState('idle');
    setWaveformData(new Array(28).fill(3));
    setTranscript('');
  }, []);

  return { voiceState, transcript, waveformData, startListening, stopListening };
}

// ─── useSystemStatus — polls GET /api/system/status every 5s ─────────────────
export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    cpu: 0,
    memory: 0,
    activeAgents: 2,
    totalTasks: 0,
    uptime: 0,
    apiLatency: 0,
    wsConnected: false,
    voiceEnabled: true,
  });

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const data = await fetchSystemStatus();
        if (!mounted) return;
        setStatus({
          cpu: Math.round(data.cpu * 10) / 10,
          memory: Math.round(data.memory * 10) / 10,
          activeAgents: data.active_agents,
          totalTasks: data.total_tasks,
          uptime: data.uptime,
          apiLatency: Math.round(data.api_latency),
          wsConnected: data.ws_connected,
          voiceEnabled: true,
        });
      } catch {
        // Keep last known values — don't crash the UI if one poll fails
      }
    }

    // Initial fetch immediately
    poll();

    // Poll every 5 seconds
    const id = setInterval(poll, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return status;
}

// ─── useActivity — polls GET /api/activity every 10s, falls back to sample data
export function useActivity() {
  const [items, setItems] = useState<ActivityItem[]>(SAMPLE_ACTIVITY);

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/activity?limit=20`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        // If the backend has real items, use them; otherwise keep sample data
        if (data.items && data.items.length > 0) {
          setItems(data.items as ActivityItem[]);
        }
      } catch {
        // Keep last known values — don't crash on network error
      }
    }

    // Initial fetch immediately
    poll();
    const id = setInterval(poll, 10000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return items;
}
