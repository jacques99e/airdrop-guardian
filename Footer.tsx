import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Twitter, Github, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold gradient-text">SolPortfolio</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Track your Solana investments with real-time data and beautiful visualizations.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Powered by Plena Finance
            </Badge>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-semibold">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Portfolio Tracking</li>
              <li>Real-time Prices</li>
              <li>Transaction History</li>
              <li>Multi-wallet Support</li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-1">
                <span>Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </li>
              <li className="flex items-center space-x-1">
                <span>API Reference</span>
                <ExternalLink className="w-3 h-3" />
              </li>
              <li className="flex items-center space-x-1">
                <span>Support</span>
                <ExternalLink className="w-3 h-3" />
              </li>
              <li className="flex items-center space-x-1">
                <span>Status</span>
                <ExternalLink className="w-3 h-3" />
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                <Twitter className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                <Github className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                <Globe className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© 2024 SolPortfolio. Built with ❤️ for the Solana community.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
