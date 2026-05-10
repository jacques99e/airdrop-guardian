import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { formatNumber, formatTokenBalance } from '@/lib/utils';

export const PortfolioHeader = () => {
  const { getTotalValue, userTokenBalances, connected } = useTokenBalance();
  
  const totalValue = parseFloat(getTotalValue() || '0');
  const hasBalances = userTokenBalances.length > 0;
  
  const changePercent = 5.2; // Mock data for demo
  const change24h = totalValue * (changePercent / 100);
  const isPositive = changePercent >= 0;

  if (!connected) {
    return (
      <div className="glass-card p-8 text-center bg-animated">
        <div className="space-y-4">
          <Wallet className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Solana Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to view your mainnet portfolio data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Total Portfolio Value */}
      <div className="glass-card p-8 lg:col-span-2 bg-animated">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-muted-foreground">
              Total Portfolio Value
            </h2>
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          
          <div className="space-y-2">
            <div className="text-5xl font-bold gradient-text">
              ${formatNumber(totalValue, 2)}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                24h change
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="space-y-6">
        <div className="stats-glass rounded-2xl p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Assets</h3>
            <div className="text-3xl font-bold text-primary">{userTokenBalances.length}</div>
            <p className="text-xs text-muted-foreground">Total holdings</p>
          </div>
        </div>

        <div className="stats-glass rounded-2xl p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">24h Change</h3>
            <div className={`text-3xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}${formatNumber(change24h, 2)}
            </div>
            <p className="text-xs text-muted-foreground">Portfolio change</p>
          </div>
        </div>
      </div>
    </div>
  );
};
