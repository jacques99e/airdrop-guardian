import React from 'react';
import { useTerminal, TerminalState } from '@/contexts/TerminalContext';
import { Shield, ShieldAlert, ShieldOff, Terminal, ChevronRight } from 'lucide-react';

const STATUS_CONFIG: Record<TerminalState, {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  className: string;
  dotClass: string;
}> = {
  safe: {
    label: 'SYSTEM SECURE',
    sublabel: 'All scans passed - no threats detected',
    icon: <Shield className="w-4 h-4" />,
    className: 'terminal-status-safe',
    dotClass: 'terminal-dot-safe',
  },
  danger: {
    label: 'DANGER DETECTED',
    sublabel: 'Token flagged as high-risk',
    icon: <ShieldAlert className="w-4 h-4" />,
    className: 'terminal-status-danger',
    dotClass: 'terminal-dot-danger',
  },
  scam: {
    label: 'SCAM ALERT',
    sublabel: 'Simulation detected fraudulent activity',
    icon: <ShieldOff className="w-4 h-4" />,
    className: 'terminal-status-scam',
    dotClass: 'terminal-dot-scam',
  },
};

export const TerminalStatusBar: React.FC = () => {
  const { state } = useTerminal();
  const config = STATUS_CONFIG[state];

  return (
    <div className={`terminal-status-bar ${config.className}`}>
      <div className="flex items-center gap-3">
        <div className={`terminal-dot ${config.dotClass}`} />
        <Terminal className="w-4 h-4 opacity-60" />
        <span className="terminal-status-label">{config.label}</span>
        <ChevronRight className="w-3 h-3 opacity-40" />
        <span className="terminal-status-sublabel">{config.sublabel}</span>
      </div>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="terminal-status-badge">
          {state.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
