'use client';

/**
 * EchoVerse AI OS — WebSocket Hook
 * Real-time connection to the backend via native WebSocket API
 * Auto-reconnect with exponential backoff, ping/pong keep-alive
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '@/lib/constants';
import { generateId } from '@/lib/utils';

export interface WSEvent {
  type: string;
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  /** If false, the socket will not connect. Useful for conditional connections. */
  enabled?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string>(generateId());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // ─── Cleanup helpers ───────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  // ─── Connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const url = `${WS_URL}/${sessionIdRef.current}`;
    console.log(`[WS] Connecting to ${url}...`);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('[WS] Connected');
        setIsConnected(true);
        reconnectAttemptRef.current = 0;

        // Start ping/pong keep-alive every 30s
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data: WSEvent = JSON.parse(event.data);

          switch (data.type) {
            case 'connected':
              console.log('[WS] Server confirmed connection:', data.message);
              break;

            case 'typing':
              setTypingAgent(data.agent as string);
              // Auto-clear typing after 10s (safety net)
              setTimeout(() => {
                if (mountedRef.current) setTypingAgent(null);
              }, 10000);
              break;

            case 'response':
              setTypingAgent(null);
              setLastEvent(data);
              break;

            case 'activity':
              setLastEvent(data);
              break;

            case 'pong':
              // Keep-alive acknowledged
              break;

            default:
              setLastEvent(data);
          }
        } catch {
          console.warn('[WS] Failed to parse message:', event.data);
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        console.log('[WS] Disconnected');
        setIsConnected(false);
        setTypingAgent(null);
        clearTimers();

        // Reconnect with exponential backoff (max 30s)
        const delay = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000);
        reconnectAttemptRef.current += 1;
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})...`);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = (err) => {
        console.warn('[WS] Error:', err);
        // onclose will fire after this, triggering reconnect
      };
    } catch (err) {
      console.error('[WS] Failed to create WebSocket:', err);
    }
  }, [enabled, clearTimers]);

  // ─── Send message via WebSocket ────────────────────────────────────────────
  const sendWsMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat',
          message,
          session_id: sessionIdRef.current,
        }),
      );
    }
  }, []);

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, connect, clearTimers]);

  return {
    isConnected,
    typingAgent,
    lastEvent,
    sendWsMessage,
    sessionId: sessionIdRef.current,
  };
}
