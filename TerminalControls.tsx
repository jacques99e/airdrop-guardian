import React from 'react';
import { useTerminal } from '@/contexts/TerminalContext';
import { Shield, ShieldAlert, ShieldOff } from 'lucide-react';

/** Demo controls to test the 3 terminal states */
export const TerminalControls: React.FC = () => {
  const { state, setSafe, setDanger, setScam } = useTerminal();

  return (
    <div className="terminal-controls">
      <span className="terminal-controls-label">Terminal Mode</span>
      <div className="terminal-controls-buttons">
        <button
          onClick={setSafe}
          className={`terminal-ctrl-btn terminal-ctrl-safe ${state === 'safe' ? 'terminal-ctrl-active-safe' : ''}`}
        >
          <Shield className="w-3.5 h-3.5" />
          Safe
        </button>
        <button
          onClick={setDanger}
          className={`terminal-ctrl-btn terminal-ctrl-danger ${state === 'danger' ? 'terminal-ctrl-active-danger' : ''}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Danger
        </button>
        <button
          onClick={setScam}
          className={`terminal-ctrl-btn terminal-ctrl-scam ${state === 'scam' ? 'terminal-ctrl-active-scam' : ''}`}
        >
          <ShieldOff className="w-3.5 h-3.5" />
          Scam
        </button>
      </div>
    </div>
  );
};
