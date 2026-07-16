'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/constants';

interface ToggleProps { value: boolean; onChange: (v: boolean) => void; color?: string; }
function Toggle({ value, onChange, color = '#00d4ff' }: ToggleProps) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: value ? `linear-gradient(90deg, ${color}, ${color}99)` : 'rgba(255,255,255,0.08)',
        position: 'relative', flexShrink: 0,
        boxShadow: value ? `0 0 12px ${color}50` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
          background: value ? '#050816' : '#3d5070',
        }}
      />
    </motion.button>
  );
}

interface SettingRowProps { label: string; description?: string; children: React.ReactNode; }
function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
      gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#c8deff' }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: '#3d5070', marginTop: 2 }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

interface SectionProps { title: string; icon: string; color: string; children: React.ReactNode; }
function Section({ title, icon, color, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '20px', borderRadius: 16, marginBottom: 16,
        background: 'rgba(5,8,22,0.6)',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `${color}15`, border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>{icon}</div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 600, color: '#e2eeff' }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    darkMode: true, animations: true, sounds: false,
    voiceEnabled: true, autospeak: false, wakeWord: false,
    memoryEnabled: true, autoSave: true,
    notifications: true, telemetry: false,
    provider: 'groq', model: 'llama-3.3-70b-versatile',
  });
  const [apiKeys, setApiKeys] = useState({ groq: '••••••••••••', elevenlabs: '••••••••••••', anthropic: '' });
  const [showKeys, setShowKeys] = useState({ groq: false, elevenlabs: false, anthropic: false });
  const [saved, setSaved] = useState(false);

  const set = (key: string, val: any) => setSettings(prev => ({ ...prev, [key]: val }));
  const saveSettings = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color: '#e2eeff', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#5a7599' }}>Configure BURNO AI to match your preferences</p>
      </div>

      {/* AI Provider */}
      <Section title="AI Provider" icon="🤖" color="#00d4ff">
        <SettingRow label="Primary Provider" description="Model used for all AI responses">
          <select
            value={settings.provider}
            onChange={e => set('provider', e.target.value)}
            style={{
              background: 'rgba(5,8,22,0.9)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 8, color: '#e2eeff', fontSize: 12, padding: '6px 12px',
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="groq">Groq (LLaMA 3.3 70B) — Free</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT-4)</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </SettingRow>

        {/* API Keys */}
        {[
          { key: 'groq', label: 'Groq API Key', placeholder: 'gsk_...' },
          { key: 'elevenlabs', label: 'ElevenLabs API Key', placeholder: 'sk_...' },
          { key: 'anthropic', label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
        ].map(item => (
          <SettingRow key={item.key} label={item.label}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type={showKeys[item.key as keyof typeof showKeys] ? 'text' : 'password'}
                value={apiKeys[item.key as keyof typeof apiKeys]}
                onChange={e => setApiKeys(prev => ({ ...prev, [item.key]: e.target.value }))}
                placeholder={item.placeholder}
                style={{
                  background: 'rgba(5,8,22,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, color: '#e2eeff', fontSize: 11, padding: '6px 10px',
                  outline: 'none', width: 180, fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowKeys(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof showKeys] }))}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#5a7599', fontSize: 11 }}
              >
                {showKeys[item.key as keyof typeof showKeys] ? '🙈' : '👁️'}
              </motion.button>
            </div>
          </SettingRow>
        ))}
      </Section>

      {/* Voice */}
      <Section title="Voice & TTS" icon="🎙️" color="#a855f7">
        <SettingRow label="Voice Enabled" description="Enable ElevenLabs text-to-speech">
          <Toggle value={settings.voiceEnabled} onChange={v => set('voiceEnabled', v)} color="#a855f7" />
        </SettingRow>
        <SettingRow label="Auto-speak responses" description="Automatically read BURNO's replies aloud">
          <Toggle value={settings.autospeak} onChange={v => set('autospeak', v)} color="#a855f7" />
        </SettingRow>
        <SettingRow label="Wake word detection" description="'Hey BURNO' triggers voice mode">
          <Toggle value={settings.wakeWord} onChange={v => set('wakeWord', v)} color="#a855f7" />
        </SettingRow>
        <SettingRow label="Voice ID" description="ElevenLabs voice character">
          <select style={{
            background: 'rgba(5,8,22,0.9)', border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: 8, color: '#e2eeff', fontSize: 12, padding: '6px 12px', outline: 'none',
          }}>
            <option>Rachel (Default)</option>
            <option>Josh</option>
            <option>Bella</option>
            <option>Adam</option>
          </select>
        </SettingRow>
      </Section>

      {/* Memory */}
      <Section title="Memory & Context" icon="🧠" color="#00d4ff">
        <SettingRow label="Memory Enabled" description="Remember context across conversations">
          <Toggle value={settings.memoryEnabled} onChange={v => set('memoryEnabled', v)} />
        </SettingRow>
        <SettingRow label="Auto-save memories" description="Automatically save important information">
          <Toggle value={settings.autoSave} onChange={v => set('autoSave', v)} />
        </SettingRow>
        <SettingRow label="Context window" description="How much history BURNO remembers">
          <select style={{
            background: 'rgba(5,8,22,0.9)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 8, color: '#e2eeff', fontSize: 12, padding: '6px 12px', outline: 'none',
          }}>
            <option>Last 20 messages</option>
            <option>Last 50 messages</option>
            <option>Last 100 messages</option>
            <option>Unlimited</option>
          </select>
        </SettingRow>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon="🎨" color="#8b5cf6">
        <SettingRow label="Animations" description="Enable UI micro-animations and transitions">
          <Toggle value={settings.animations} onChange={v => set('animations', v)} color="#8b5cf6" />
        </SettingRow>
        <SettingRow label="Sound effects" description="Play sounds on interactions">
          <Toggle value={settings.sounds} onChange={v => set('sounds', v)} color="#8b5cf6" />
        </SettingRow>
        <SettingRow label="Theme" description="Color scheme">
          <div style={{ display: 'flex', gap: 6 }}>
            {['Void', 'Aurora', 'Neon', 'Matrix'].map(t => (
              <button key={t} style={{
                padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                background: t === 'Void' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                color: t === 'Void' ? '#8b5cf6' : '#5a7599', fontSize: 11, cursor: 'pointer',
              }}>{t}</button>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Privacy */}
      <Section title="Privacy" icon="🔒" color="#10b981">
        <SettingRow label="Usage analytics" description="Help improve BURNO by sharing anonymized usage">
          <Toggle value={settings.telemetry} onChange={v => set('telemetry', v)} color="#10b981" />
        </SettingRow>
        <SettingRow label="Notifications" description="System and agent notifications">
          <Toggle value={settings.notifications} onChange={v => set('notifications', v)} color="#10b981" />
        </SettingRow>
        <SettingRow label="Data export" description="Download all your data">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.25)',
              background: 'rgba(16,185,129,0.08)', color: '#10b981', fontSize: 12, cursor: 'pointer',
            }}>
            Export JSON
          </motion.button>
        </SettingRow>
      </Section>

      {/* About */}
      <Section title="About" icon="ℹ️" color="#3b82f6">
        <SettingRow label="Version"><span style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}>2.0.0</span></SettingRow>
        <SettingRow label="Backend"><span style={{ fontSize: 11, color: '#5a7599', fontFamily: 'JetBrains Mono, monospace' }}>{API_BASE_URL}</span></SettingRow>
        <SettingRow label="Built with"><span style={{ fontSize: 12, color: '#5a7599' }}>Next.js 16 · FastAPI · Groq · ElevenLabs</span></SettingRow>
      </Section>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={saveSettings}
          style={{
            padding: '10px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: saved ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #00d4ff, #3b82f6)',
            color: '#050816', fontWeight: 700, fontSize: 13,
            boxShadow: '0 0 20px rgba(0,212,255,0.3)',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          {saved ? '✓ Saved!' : 'Save Settings'}
        </motion.button>
      </div>
    </div>
  );
}
