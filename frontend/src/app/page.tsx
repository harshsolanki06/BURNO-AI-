'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainApp from '@/components/MainApp';
import AuthPage from '@/components/auth/AuthPage';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  // Guest mode: user clicked "continue as guest" — bypass auth
  const [guestMode, setGuestMode] = useState(false);

  // Show a minimal loading screen while we check the stored token
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#020510',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 40,
            height: 40,
            border: '2px solid rgba(0,212,255,0.15)',
            borderTopColor: '#00d4ff',
            borderRadius: '50%',
          }}
        />
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            color: 'rgba(0,212,255,0.5)',
          }}
        >
          INITIALIZING…
        </p>
      </div>
    );
  }

  // Show the main app if authenticated or in guest mode
  const showApp = isAuthenticated || guestMode;

  return (
    <AnimatePresence mode="wait">
      {showApp ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <MainApp />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuthPage onSuccess={() => setGuestMode(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
