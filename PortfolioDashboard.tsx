import React from 'react';
import { PortfolioHeader } from '@/components/Portfolio/PortfolioHeader';
import { PortfolioChart } from '@/components/Portfolio/PortfolioChart';
import { TokenList } from '@/components/Portfolio/TokenList';
import { TransactionHistory } from '@/components/Portfolio/TransactionHistory';
import { WalletManager } from '@/components/Portfolio/WalletManager';
import { MatrixRain } from '@/components/MatrixRain';
import { TerminalStatusBar } from '@/components/TerminalStatusBar';
import { TerminalControls } from '@/components/TerminalControls';

export const PortfolioDashboard = () => {
  return (
    <div className="min-h-screen relative" style={{ background: '#010101' }}>
      {/* Matrix Rain canvas background */}
      <MatrixRain />

      {/* CRT scanline overlay */}
      <div className="matrix-scanlines" />

      {/* Content sits above the canvas */}
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-6">
        {/* Terminal Status + Controls row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <TerminalStatusBar />
          </div>
          <TerminalControls />
        </div>

        {/* Portfolio Overview */}
        <PortfolioHeader />

        {/* Charts and Analytics */}
        <PortfolioChart />

        {/* Token Holdings */}
        <TokenList />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TransactionHistory />
          <WalletManager />
        </div>
      </div>
    </div>
  );
};
