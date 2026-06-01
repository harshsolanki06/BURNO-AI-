'use client';

import { useRef, useEffect } from 'react';

interface AICoreOrbProps {
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  size?: number;
}

const STATE_PALETTES = {
  idle:      { core: '#00d4ff', mid: '#3b82f6', ring: '#6366f1', glow: 'rgba(0,212,255,0.15)'   },
  listening: { core: '#10b981', mid: '#00d4ff', ring: '#14b8a6', glow: 'rgba(16,185,129,0.18)'  },
  thinking:  { core: '#a78bfa', mid: '#8b5cf6', ring: '#6366f1', glow: 'rgba(139,92,246,0.18)'  },
  speaking:  { core: '#00d4ff', mid: '#38bdf8', ring: '#0ea5e9', glow: 'rgba(0,212,255,0.20)'   },
};

export default function AICoreOrb({ state = 'idle', size = 300 }: AICoreOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const tRef      = useRef(0);
  const stateRef  = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;

    // ── Lerp helper ─────────────────────────────────────────
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const draw = () => {
      tRef.current += 0.007;
      const t  = tRef.current;
      const pal = STATE_PALETTES[stateRef.current];

      ctx.clearRect(0, 0, size, size);

      // ── 1. Deep ambient glow layer ──────────────────────
      const ambientGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
      ambientGlow.addColorStop(0, 'transparent');
      ambientGlow.addColorStop(0.7, pal.glow);
      ambientGlow.addColorStop(1,   'transparent');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, size, size);

      // ── 2. Outer scanner ring (dashed, rotating) ────────
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.25);
      ctx.strokeStyle = `rgba(0,212,255,0.07)`;
      ctx.lineWidth   = 1;
      ctx.setLineDash([5, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.47, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── 3. Secondary ring (counter-rotate) ──────────────
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.4);
      ctx.strokeStyle = `rgba(139,92,246,0.09)`;
      ctx.lineWidth   = 1;
      ctx.setLineDash([3, 9]);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── 4. Tertiary thin ring ────────────────────────────
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.7);
      ctx.strokeStyle = `rgba(59,130,246,0.08)`;
      ctx.lineWidth   = 0.5;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── 5. Breathing pulse ring ──────────────────────────
      const pulseR = size * 0.27 + Math.sin(t * 1.8) * size * 0.022;
      const pulseA = 0.09 + Math.sin(t * 1.8) * 0.045;
      ctx.strokeStyle = `rgba(0,212,255,${pulseA})`;
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      // ── 6. Scanning arc (sweeps 360°) ───────────────────
      const rgb = hexToRgb(pal.core);
      ctx.save();
      ctx.translate(cx, cy);
      const arcAngle = (t * 1.2) % (Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`;
      ctx.lineWidth   = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.43, arcAngle, arcAngle + 0.7);
      ctx.stroke();
      // Scanner dot
      const sdx = Math.cos(arcAngle + 0.7) * size * 0.43;
      const sdy = Math.sin(arcAngle + 0.7) * size * 0.43;
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`;
      ctx.beginPath();
      ctx.arc(sdx, sdy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 7. Data arc triplets ─────────────────────────────
      for (let i = 0; i < 3; i++) {
        const a0 = t * 0.5 + (i * Math.PI * 2) / 3;
        const a1 = a0 + 0.5 + Math.sin(t * 0.8 + i) * 0.2;
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.14 + i * 0.04})`;
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.38, a0, a1);
        ctx.stroke();
      }

      // ── 8. Core sphere ───────────────────────────────────
      const coreR = size * 0.175 + Math.sin(t * 0.9) * size * 0.007;
      const coreG = ctx.createRadialGradient(
        cx - coreR * 0.28, cy - coreR * 0.28, coreR * 0.04,
        cx, cy, coreR
      );
      coreG.addColorStop(0,    'rgba(255,255,255,0.95)');
      coreG.addColorStop(0.12, pal.core);
      coreG.addColorStop(0.45, pal.mid);
      coreG.addColorStop(0.8,  pal.ring);
      coreG.addColorStop(1,    'rgba(5,8,22,0.9)');
      ctx.fillStyle = coreG;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // ── 9. Core specular highlight ───────────────────────
      const specR = coreR * 0.45;
      const specG = ctx.createRadialGradient(
        cx - coreR * 0.3, cy - coreR * 0.35, 0,
        cx - coreR * 0.15, cy - coreR * 0.2, specR
      );
      specG.addColorStop(0, 'rgba(255,255,255,0.35)');
      specG.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = specG;
      ctx.beginPath();
      ctx.arc(cx - coreR * 0.2, cy - coreR * 0.2, specR, 0, Math.PI * 2);
      ctx.fill();

      // ── 10. Core bloom ───────────────────────────────────
      const bloomG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.8);
      bloomG.addColorStop(0,   `rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`);
      bloomG.addColorStop(0.4, `rgba(${rgb.r},${rgb.g},${rgb.b},0.06)`);
      bloomG.addColorStop(1,   'transparent');
      ctx.fillStyle = bloomG;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // ── 11. Orbiting particles ───────────────────────────
      const orbiters = [
        { speed: 1.2,  r: size * 0.34, sz: 2.5, alpha: 0.80, offset: 0            },
        { speed: 1.2,  r: size * 0.34, sz: 1.8, alpha: 0.50, offset: Math.PI*0.67 },
        { speed: 1.2,  r: size * 0.34, sz: 2.0, alpha: 0.60, offset: Math.PI*1.33 },
        { speed: -0.8, r: size * 0.42, sz: 1.5, alpha: 0.30, offset: 0            },
        { speed: -0.8, r: size * 0.42, sz: 1.5, alpha: 0.30, offset: Math.PI      },
        { speed: 0.6,  r: size * 0.21, sz: 1.5, alpha: 0.40, offset: Math.PI*0.5  },
        { speed: 0.6,  r: size * 0.21, sz: 1.2, alpha: 0.30, offset: Math.PI*1.5  },
      ];
      for (const o of orbiters) {
        const angle = t * o.speed + o.offset;
        const px = cx + Math.cos(angle) * o.r;
        const py = cy + Math.sin(angle) * o.r * 0.45;
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${o.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, o.sz, 0, Math.PI * 2);
        ctx.fill();
        // Particle glow
        const pGlow = ctx.createRadialGradient(px, py, 0, px, py, o.sz * 4);
        pGlow.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`);
        pGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(px, py, o.sz * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── State: Listening — sonic rings ──────────────────
      if (stateRef.current === 'listening') {
        const rr = hexToRgb(STATE_PALETTES.listening.core);
        for (let i = 1; i <= 4; i++) {
          const wR = coreR + i * 16 + Math.sin(t * 5 + i) * 8;
          const wA = Math.max(0, 0.22 - i * 0.05);
          ctx.strokeStyle = `rgba(${rr.r},${rr.g},${rr.b},${wA})`;
          ctx.lineWidth   = 1.5;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(cx, cy, wR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ── State: Thinking — spinner arc ───────────────────
      if (stateRef.current === 'thinking') {
        const tr_ = hexToRgb(STATE_PALETTES.thinking.core);
        ctx.strokeStyle = `rgba(${tr_.r},${tr_.g},${tr_.b},0.7)`;
        ctx.lineWidth   = 2.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(cx, cy, coreR + 14, t * 3.5, t * 3.5 + Math.PI * 0.65);
        ctx.stroke();
        // Second spinner (opposite, slower)
        ctx.strokeStyle = `rgba(${tr_.r},${tr_.g},${tr_.b},0.3)`;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR + 22, -t * 2, -t * 2 + Math.PI * 0.9);
        ctx.stroke();
      }

      // ── State: Speaking — waveform bands ────────────────
      if (stateRef.current === 'speaking') {
        const sr_ = hexToRgb(STATE_PALETTES.speaking.core);
        for (let i = 0; i < 6; i++) {
          const wA = Math.abs(Math.sin(t * 6 + i * 0.8)) * 0.2;
          const wR = coreR + 10 + i * 12;
          ctx.strokeStyle = `rgba(${sr_.r},${sr_.g},${sr_.b},${wA})`;
          ctx.lineWidth   = 1;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(cx, cy, wR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ── 12. Outer ring (solid thin, always) ─────────────
      ctx.strokeStyle = `rgba(0,212,255,0.06)`;
      ctx.lineWidth   = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="animate-float-slow"
    />
  );
}
