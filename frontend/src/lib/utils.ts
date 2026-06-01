import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
}

export function getAgentColor(type: string): string {
  const colors: Record<string, string> = {
    research: '#4d7cff',
    coding: '#34d399',
    automation: '#fb923c',
    productivity: '#a855f7',
    vision: '#f472b6',
    memory: '#00f0ff',
  };
  return colors[type] || '#4d7cff';
}

export function getAgentIcon(type: string): string {
  const icons: Record<string, string> = {
    research: '🔍',
    coding: '💻',
    automation: '⚡',
    productivity: '📊',
    vision: '👁️',
    memory: '🧠',
  };
  return icons[type] || '🤖';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    online: '#34d399',
    active: '#00f0ff',
    processing: '#a855f7',
    idle: '#6b6490',
    error: '#f43f5e',
    completed: '#34d399',
    running: '#00f0ff',
    pending: '#fb923c',
    failed: '#f43f5e',
  };
  return colors[status] || '#6b6490';
}
