import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  ExternalLink,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { formatNumber, formatTokenBalance } from '@/lib/utils';


const transactionTypes = [
 { label: 'All', value: 'all' },
 { label: 'Buy', value: 'buy' },
 { label: 'Sell', value: 'sell' },
 { label: 'Swap', value: 'swap' },
];

export const TransactionHistory = () => {
 const [selectedType, setSelectedType] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');
 const { publicKey, connected } = useWallet();
  const { userTokenBalances } = useTokenBalance();

  // Generate dummy transactions based on user tokens
  const generateDummyTransactions = () => {
    const transactionTypes = ['buy', 'sell', 'swap'];
    const transactions = [];
    
    // Use user tokens if available, otherwise use fallback tokens
    const tokensToUse = userTokenBalances.length > 0 
      ? userTokenBalances 
      : [
          { symbol: 'SOL', name: 'Solana', balance: 0.068, balanceInUsd: 12.34 },
          { symbol: 'USDC', name: 'USD Coin', balance: 150.45, balanceInUsd: 150.45 },
          { symbol: 'RAY', name: 'Raydium', balance: 25.80, balanceInUsd: 48.32 },
          { symbol: 'BONK', name: 'Bonk', balance: 1000000, balanceInUsd: 25.67 }
        ];
    
    for (let i = 0; i < 12; i++) {
      const token = tokensToUse[Math.floor(Math.random() * tokensToUse.length)];
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      let transaction: any = {
        id: `dummy_${i}`,
        type,
        token: token.symbol,
        timestamp: timestamp.toISOString(),
        hash: `${Math.random().toString(36).substr(2, 8)}...${Math.random().toString(36).substr(2, 8)}`,
        status: 'completed'
      };
      
      if (type === 'swap') {
        const swapToToken = tokensToUse[Math.floor(Math.random() * tokensToUse.length)];
        transaction.tokenTo = swapToToken.symbol;
        transaction.amount = Math.random() * token.balance * 0.5;
        transaction.amountTo = transaction.amount * (0.8 + Math.random() * 0.4);
      } else {
        transaction.amount = Math.random() * token.balance * 0.3;
        transaction.price = token.balanceInUsd ? (token.balanceInUsd / token.balance) : Math.random() * 100;
        transaction.value = transaction.amount * transaction.price;
      }
      
      transactions.push(transaction);
    }
    
    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const transactions = generateDummyTransactions();

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    const matchesSearch = 
      tx.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case 'sell':
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case 'swap':
        return <TrendingUp className="w-4 h-4 text-primary" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'text-success';
      case 'sell':
        return 'text-destructive';
      case 'swap':
        return 'text-primary';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className="portfolio-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {transactionTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedType(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {!connected ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Connect your wallet to view transaction history.</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No transactions found.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="p-6 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{tx.type}</span>
                      <span className="text-primary font-bold">{tx.token}</span>
                      {tx.type === 'swap' && (
                        <>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-accent font-bold">{tx.tokenTo}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <span>{formatTime(tx.timestamp)}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <button 
                        className="hover:text-primary transition-colors flex items-center space-x-1"
                        onClick={() => window.open(`https://solscan.io/tx/${tx.hash}`, '_blank')}
                      >
                        <span className="font-mono">{tx.hash}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {tx.type === 'swap' ? (
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatNumber(tx.amount)} → {formatNumber(tx.amountTo || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tx.token} → {tx.tokenTo}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className={`font-medium ${getTransactionColor(tx.type)}`}>
                        {formatNumber(tx.amount)} {tx.token}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tx.value ? `$${formatNumber(tx.value)}` : '--'}
                      </div>
                    </div>
                  )}
                  
                  <Badge 
                    variant={tx.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs mt-2"
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
