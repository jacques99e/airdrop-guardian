import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Bell, Settings, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export const Header = () => {
  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">SolPortfolio</h1>
              <p className="text-xs text-muted-foreground">Powered by Plena</p>
            </div>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" className="text-primary font-medium">
            Portfolio
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
            Analytics
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
            History
          </Button>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {connected && (
            <>
              <Button variant="ghost" size="sm" className="glass-button">
                <Bell className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className="glass-button">
                <Settings className="w-4 h-4" />
              </Button>
              
              <div className="accent-highlight">
                Mainnet
              </div>
            </>
          )}
          
          <div className="wallet-adapter-button-trigger">
            <WalletMultiButton 
              style={{
                backgroundColor: 'transparent',
                border: '1px solid hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                borderRadius: '1rem',
                height: '40px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)',
                border: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
