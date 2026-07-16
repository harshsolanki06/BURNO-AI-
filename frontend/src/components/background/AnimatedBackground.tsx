'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ─── Starfield Canvas ─────────────────────────────────────────────────────────
function StarfieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let raf: number;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;

    const STAR_COUNT = 180;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      opacity: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.012 + 0.002,
      twinkle: Math.random() * Math.PI * 2,
    }));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        s.twinkle += s.speed;
        const op = s.opacity * (0.7 + 0.3 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${op})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
    };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ─── Neural Network Canvas ────────────────────────────────────────────────────
function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;

    const NODE_COUNT = 28;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.06;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,255,0.15)';
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ─── Ambient Blobs ─────────────────────────────────────────────────────────────
function AmbientBlobs() {
  const blobs = [
    { color: 'rgba(59,130,246,0.055)', x: '15%', y: '-10%', w: '50vw', h: '50vw', delay: 0 },
    { color: 'rgba(139,92,246,0.04)',  x: '70%', y: '60%',  w: '40vw', h: '40vw', delay: 2 },
    { color: 'rgba(0,212,255,0.035)',  x: '5%',  y: '55%',  w: '35vw', h: '35vw', delay: 4 },
    { color: 'rgba(16,185,129,0.025)', x: '60%', y: '5%',   w: '30vw', h: '30vw', delay: 1 },
  ];
  return (
    <>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: b.x, top: b.y,
            width: b.w, height: b.h,
            background: `radial-gradient(ellipse, ${b.color}, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
        />
      ))}
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function AnimatedBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: 'radial-gradient(ellipse 120% 80% at 50% -20%, #070e2a 0%, #020510 55%, #030212 100%)',
      overflow: 'hidden', pointerEvents: 'none',
    }}>
      <StarfieldCanvas />
      <NeuralCanvas />
      <AmbientBlobs />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.008) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Scanline */}
      <motion.div
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.06), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
