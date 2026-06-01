'use client';

/**
 * EchoVerse AI OS — Core Hooks
 * useChat:         Sends messages to POST /api/chat and manages conversation state
 * useVoice:        Voice visualizer (simulated until STT/TTS endpoints are built)
 * useSystemStatus: Polls GET /api/system/status for real system metrics
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, VoiceState, SystemStatus, AgentType } from '@/types';
import { generateId } from '@/lib/utils';
import { chatSend, getSystemStatus as fetchSystemStatus } from '@/lib/api';

// ─── Agent display names ──────────────────────────────────────────────────────
const AGENT_NAMES: Record<string, string> = {
  research: 'Research Agent',
  coding: 'Coding Agent',
  automation: 'Automation Agent',
  productivity: 'Productivity Agent',
  vision: 'Vision Agent',
  memory: 'Memory Agent',
};

// ─── useChat ──────────────────────────────────────────────────────────────────
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'system',
      content:
        'EchoVerse AI OS v2.0 initialized. All 6 agents online. Voice interface ready. Type a message or use a Quick Action to begin.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message to the UI immediately
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // Call the real backend API
      const response = await chatSend(
        content,
        sessionIdRef.current || undefined,
      );

      // Store the session ID for conversation continuity
      if (!sessionIdRef.current) {
        sessionIdRef.current = response.session_id;
      }

      // Build the assistant message from the API response
      const aiMsg: Message = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
        agentType: response.agent_type as AgentType,
        agentName: response.agent_name || AGENT_NAMES[response.agent_type] || 'Agent',
        metadata: {
          tokens: response.tokens,
          processingTime: response.processing_time_ms,
          model: 'claude-sonnet-4-20250514',
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      // Show error as a system message so the user knows what happened
      const errMsg: Message = {
        id: generateId(),
        role: 'system',
        content: `⚠️ ${error instanceof Error ? error.message : 'Failed to reach the backend. Make sure the server is running on http://localhost:8000'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    // Reset session so the next conversation gets a fresh ID
    sessionIdRef.current = null;
    setMessages([
      {
        id: generateId(),
        role: 'system',
        content: 'Conversation cleared. EchoVerse ready — how can I help?',
        timestamp: new Date().toISOString(),
      },
    ]);
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
