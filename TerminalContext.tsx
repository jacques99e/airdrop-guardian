import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type TerminalState = 'safe' | 'danger' | 'scam';

interface TerminalContextType {
  state: TerminalState;
  setSafe: () => void;
  setDanger: () => void;
  setScam: () => void;
  /** Returns the current HSL color string for the matrix rain */
  getColor: () => string;
  /** Returns the current glow color (rgba) */
  getGlow: () => string;
  /** Whether the terminal should flash (scam mode) */
  isFlashing: boolean;
}

const TerminalContext = createContext<TerminalContextType | null>(null);

const COLORS: Record<TerminalState, { main: string; glow: string }> = {
  safe: {
    main: '#00ff41',   // Classic matrix green
    glow: 'rgba(0, 255, 65, 0.4)',
  },
  danger: {
    main: '#ff2d2d',   // Terminal red
    glow: 'rgba(255, 45, 45, 0.5)',
  },
  scam: {
    main: '#ff0000',   // Bright red for scam
    glow: 'rgba(255, 0, 0, 0.6)',
  },
};

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TerminalState>('safe');
  const [isFlashing, setIsFlashing] = useState(false);
  const flashInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopFlashing = useCallback(() => {
    if (flashInterval.current) {
      clearInterval(flashInterval.current);
      flashInterval.current = null;
    }
    setIsFlashing(false);
  }, []);

  const setSafe = useCallback(() => {
    stopFlashing();
    setState('safe');
  }, [stopFlashing]);

  const setDanger = useCallback(() => {
    stopFlashing();
    setState('danger');
  }, [stopFlashing]);

  const setScam = useCallback(() => {
    setState('scam');
    setIsFlashing(true);
    // Auto-flash is handled in the canvas component via the isFlashing flag
  }, []);

  const getColor = useCallback(() => COLORS[state].main, [state]);
  const getGlow = useCallback(() => COLORS[state].glow, [state]);

  return (
    <TerminalContext.Provider
      value={{ state, setSafe, setDanger, setScam, getColor, getGlow, isFlashing }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = (): TerminalContextType => {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error('useTerminal must be used within a TerminalProvider');
  return ctx;
};
