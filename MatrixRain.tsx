import React, { useRef, useEffect, useCallback } from 'react';
import { useTerminal } from '@/contexts/TerminalContext';

// Katakana + Latin + digits for authentic Matrix look
const MATRIX_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]|;:<>?/~';

const FONT_SIZE = 14;
const FADE_ALPHA = 0.05;

interface Drop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
}

export const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const dropsRef = useRef<Drop[]>([]);
  const lastTimeRef = useRef<number>(0);
  const flashPhaseRef = useRef<boolean>(false);
  const flashTimerRef = useRef<number>(0);

  const { getColor, getGlow, isFlashing, state } = useTerminal();

  // Store current state in refs so the animation loop always sees latest values
  const stateRef = useRef(state);
  const isFlashingRef = useRef(isFlashing);
  const getColorRef = useRef(getColor);
  const getGlowRef = useRef(getGlow);

  useEffect(() => {
    stateRef.current = state;
    isFlashingRef.current = isFlashing;
    getColorRef.current = getColor;
    getGlowRef.current = getGlow;
  }, [state, isFlashing, getColor, getGlow]);

  const randomChar = useCallback(() => {
    return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
  }, []);

  const initDrops = useCallback((width: number, height: number) => {
    const columns = Math.floor(width / FONT_SIZE);
    const drops: Drop[] = [];

    for (let i = 0; i < columns; i++) {
      const length = Math.floor(Math.random() * 20) + 5;
      const chars: string[] = [];
      for (let j = 0; j < length; j++) {
        chars.push(randomChar());
      }
      drops.push({
        x: i * FONT_SIZE,
        y: Math.random() * -height,
        speed: Math.random() * 2 + 1.5,
        chars,
        length,
      });
    }

    dropsRef.current = drops;
  }, [randomChar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initDrops(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = (timestamp: number) => {
      const delta = timestamp - lastTimeRef.current;

      // Cap at ~30fps for performance
      if (delta < 33) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTimeRef.current = timestamp;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Handle scam flash effect
      if (isFlashingRef.current) {
        flashTimerRef.current += delta;
        if (flashTimerRef.current > 150) {
          flashPhaseRef.current = !flashPhaseRef.current;
          flashTimerRef.current = 0;
        }
      } else {
        flashPhaseRef.current = false;
        flashTimerRef.current = 0;
      }

      // Fade out previous frame
      const fadeColor = flashPhaseRef.current
        ? 'rgba(40, 0, 0, 0.15)'
        : 'rgba(0, 0, 0, 0.05)';
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, w, h);

      // Flash overlay pulse
      if (flashPhaseRef.current) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.08)';
        ctx.fillRect(0, 0, w, h);
      }

      const mainColor = getColorRef.current();
      const glowColor = getGlowRef.current();

      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', 'Courier New', monospace`;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;

      for (const drop of dropsRef.current) {
        for (let j = 0; j < drop.length; j++) {
          const charY = drop.y - j * FONT_SIZE;
          if (charY < -FONT_SIZE || charY > h + FONT_SIZE) continue;

          // Head character is brighter
          if (j === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 16;
          } else if (j < 3) {
            // Near-head chars are full brightness
            ctx.fillStyle = mainColor;
            ctx.shadowBlur = 10;
          } else {
            // Tail fades out
            const alpha = Math.max(0.1, 1 - j / drop.length);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = mainColor;
            ctx.shadowBlur = 4;
          }

          ctx.fillText(drop.chars[j % drop.chars.length], drop.x, charY);
          ctx.globalAlpha = 1;
        }

        // Move drop down
        drop.y += drop.speed * FONT_SIZE * 0.15;

        // Randomly mutate characters for flickering effect
        if (Math.random() < 0.02) {
          const idx = Math.floor(Math.random() * drop.chars.length);
          drop.chars[idx] = randomChar();
        }

        // Reset drop when off screen
        if (drop.y - drop.length * FONT_SIZE > h) {
          drop.y = Math.random() * -200 - 50;
          drop.speed = Math.random() * 2 + 1.5;
          const newLength = Math.floor(Math.random() * 20) + 5;
          drop.length = newLength;
          drop.chars = [];
          for (let k = 0; k < newLength; k++) {
            drop.chars.push(randomChar());
          }
        }
      }

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      animFrameRef.current = requestAnimationFrame(draw);
    };

    // Initial black fill
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initDrops, randomChar]);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain-canvas"
      aria-hidden="true"
    />
  );
};
