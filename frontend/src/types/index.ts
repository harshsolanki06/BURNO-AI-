// ========================================
// BURNO AI OS — TYPE DEFINITIONS
// ========================================

// Agent Types
export type AgentType = 'research' | 'coding' | 'automation' | 'productivity' | 'vision' | 'memory';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: 'idle' | 'active' | 'processing' | 'error';
  description: string;
  icon: string;
  color: string;
  tasksCompleted: number;
  lastActive?: string;
}

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system' | 'agent';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  agentType?: AgentType;
  agentName?: string;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    model?: string;
    tools?: string[];
  };
}

// Voice Types
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceSession {
  state: VoiceState;
  transcript: string;
  confidence: number;
  waveformData: number[];
  duration: number;
}

// Memory Types
export interface MemoryEntry {
  id: string;
  content: string;
  category: 'conversation' | 'preference' | 'task' | 'fact' | 'context';
  timestamp: string;
  relevanceScore: number;
  tags: string[];
  embedding?: number[];
}

// Task Types
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  agentType: AgentType;
  createdAt: string;
  completedAt?: string;
  progress: number;
  result?: string;
  error?: string;
}

// Activity Feed
export interface ActivityItem {
  id: string;
  type: 'message' | 'task' | 'agent' | 'system' | 'voice' | 'automation' | 'memory';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  metadata?: Record<string, unknown>;
}

// System Status
export interface SystemStatus {
  cpu: number;
  memory: number;
  activeAgents: number;
  totalTasks: number;
  uptime: number;
  apiLatency: number;
  wsConnected: boolean;
  voiceEnabled: boolean;
}

// Dashboard Widget
export interface Widget {
  id: string;
  title: string;
  type: 'chart' | 'feed' | 'status' | 'agent' | 'voice' | 'memory' | 'quick-actions';
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: { x: number; y: number };
}

// WebSocket Events
export interface WSEvent {
  type: 'message' | 'voice' | 'task' | 'status' | 'agent' | 'error';
  payload: unknown;
  timestamp: string;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Quick Action
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  command: string;
  agentType: AgentType;
  shortcut?: string;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  voiceEnabled: boolean;
  wakeWord: string;
  ttsVoice: string;
  language: string;
  notifications: boolean;
}
