/**
 * EchoVerse AI OS — API Client
 * Centralized fetch wrapper for all backend endpoints
 */
import { API_BASE_URL } from './constants';

// ─── Token Management ────────────────────────────────────────────────────────
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('echoverse_token', token);
  } else {
    localStorage.removeItem('echoverse_token');
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('echoverse_token');
  }
  return authToken;
}

// ─── Base Fetch ──────────────────────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export interface ChatRequest {
  message: string;
  session_id?: string;
  agent_type?: string;
}

export interface ChatResponse {
  id: string;
  content: string;
  agent_type: string;
  agent_name: string;
  session_id: string;
  processing_time_ms: number;
  tokens: number;
  timestamp: string;
}

export async function chatSend(
  message: string,
  sessionId?: string,
  agentType?: string,
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      session_id: sessionId || undefined,
      agent_type: agentType || undefined,
    }),
  });
}

// ─── System Status ───────────────────────────────────────────────────────────
export interface SystemStatusResponse {
  cpu: number;
  memory: number;
  active_agents: number;
  total_tasks: number;
  uptime: number;
  api_latency: number;
  ws_connected: boolean;
  timestamp: string;
}

export async function getSystemStatus(): Promise<SystemStatusResponse> {
  return apiFetch<SystemStatusResponse>('/api/system/status');
}

// ─── Agents ──────────────────────────────────────────────────────────────────
export interface AgentInfo {
  type: string;
  name: string;
  status: string;
}

export async function getAgents(): Promise<{ agents: AgentInfo[] }> {
  return apiFetch<{ agents: AgentInfo[] }>('/api/agents');
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthToken {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    is_active: boolean;
  };
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthToken> {
  const data = await apiFetch<AuthToken>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setAuthToken(data.access_token);
  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthToken> {
  const data = await apiFetch<AuthToken>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.access_token);
  return data;
}

export async function getMe(): Promise<AuthToken['user']> {
  return apiFetch<AuthToken['user']>('/api/auth/me');
}

// ─── Memory ──────────────────────────────────────────────────────────────────
export async function storeMemory(
  content: string,
  category = 'conversation',
  tags?: string[],
) {
  return apiFetch('/api/memory/store', {
    method: 'POST',
    body: JSON.stringify({ content, category, tags }),
  });
}

export async function searchMemory(query: string, limit = 5) {
  return apiFetch(`/api/memory/search?query=${encodeURIComponent(query)}&limit=${limit}`);
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export async function createTask(
  title: string,
  agentType: string,
  description?: string,
) {
  return apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, agent_type: agentType, description }),
  });
}

export async function listTasks(limit = 20) {
  return apiFetch(`/api/tasks?limit=${limit}`);
}
