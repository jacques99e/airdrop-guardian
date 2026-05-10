import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import type { UserTokenBalance } from '@/hooks/useTokenBalance';
import { formatTokenBalance, formatNumber } from '@/lib/utils';

export const TokenList = () => {
  const { userTokenBalances, loading, connected } = useTokenBalance();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredTokens = userTokenBalances.filter(token =>
    (token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     token.symbol.toLowerCase().includes(searchQuery.toLowerCase())) &&
    token.balanceInUsd > 0
  );

  const toggleFavorite = (address: string) => {
    setFavorites(prev => 
      prev.includes(address) 
        ? prev.filter(addr => addr !== address)
        : [...prev, address]
    );
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-glass-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold gradient-text">Your Holdings</h2>
          <div className="accent-highlight">
            {userTokenBalances.length} Assets
          </div>
        </div>
        
        <div className="relative glass-input rounded-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-input border-0 bg-transparent"
          />
        </div>
      </div>

      <div className="divide-y divide-glass-border">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TokenSkeleton key={i} />
          ))
        ) : filteredTokens.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No tokens found matching your search.</p>
          </div>
        ) : (
          filteredTokens.map((token) => (
            <TokenRow
              key={token.address}
              token={token}
              isFavorite={favorites.includes(token.address)}
              onToggleFavorite={() => toggleFavorite(token.address)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TokenRow = ({ 
  token, 
  isFavorite, 
  onToggleFavorite 
}: { 
  token: UserTokenBalance;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => {
  const changePercent = Math.random() * 20 - 10; // Mock data
  const isPositive = changePercent >= 0;

  return (
    <div className="p-6 hover:bg-glass-hover transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className="p-1 h-auto hover:bg-transparent"
          >
            <Star 
              className={`w-4 h-4 ${
                isFavorite ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary'
              }`} 
            />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center glow-primary">
              {token.logoURI ? (
                <img 
                  src={token.logoURI} 
                  alt={token.symbol}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {token.symbol.slice(0, 2)}
                </span>
              )}
            </div>
            
            <div>
              <div className="font-semibold text-foreground">{token.name}</div>
              <div className="text-sm text-primary font-medium">{token.symbol}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">

          <div className="text-right">
            <div className="font-bold text-lg">
              {formatTokenBalance(token.balance, token.decimals)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {token.balanceInUsd && token.balanceInUsd > 0 ? `$${formatNumber(token.balanceInUsd)}` : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TokenSkeleton = () => (
  <div className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-4 h-4 bg-glass-hover" />
        <Skeleton className="w-12 h-12 rounded-full bg-glass-hover" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-4 bg-glass-hover" />
          <Skeleton className="w-16 h-3 bg-glass-hover" />
        </div>
      </div>
      
      <div className="flex items-center space-x-8">
        <div className="space-y-2">
          <Skeleton className="w-20 h-5 bg-glass-hover" />
          <Skeleton className="w-16 h-4 bg-glass-hover" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
    </div>
  </div>
);
