import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Plus, 
  MoreVertical, 
  Copy, 
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Settings
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatNumber } from '@/lib/utils';

interface WalletData {
  id: string;
  name: string;
  address: string;
  balance: number;
  isActive: boolean;
  isFavorite: boolean;
  isWatchOnly: boolean;
}

// Mock wallet data
const mockWallets: WalletData[] = [
  {
    id: '1',
    name: 'Main Wallet',
    address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    balance: 12456.78,
    isActive: true,
    isFavorite: true,
    isWatchOnly: false,
  },
  {
    id: '2',
    name: 'Trading Wallet',
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    balance: 3247.91,
    isActive: false,
    isFavorite: false,
    isWatchOnly: false,
  },
  {
    id: '3',
    name: 'Watch Wallet',
    address: '5KJp8f6YZ2HvVXbPqtWc3HkCqDqF8NjGb7xPzRqUvMnA',
    balance: 8765.43,
    isActive: false,
    isFavorite: false,
    isWatchOnly: true,
  },
];

export const WalletManager = () => {
  const [wallets, setWallets] = useState<WalletData[]>(mockWallets);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [isWatchOnly, setIsWatchOnly] = useState(false);
  const { toast } = useToast();
  const { publicKey, connected } = useWallet();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Wallet address has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const addWallet = () => {
    if (!newWalletName || !newWalletAddress) {
      toast({
        title: "Missing information",
        description: "Please provide both wallet name and address.",
        variant: "destructive",
      });
      return;
    }

    const newWallet: WalletData = {
      id: Date.now().toString(),
      name: newWalletName,
      address: newWalletAddress,
      balance: 0,
      isActive: false,
      isFavorite: false,
      isWatchOnly,
    };

    setWallets([...wallets, newWallet]);
    setNewWalletName('');
    setNewWalletAddress('');
    setIsWatchOnly(false);
    setShowAddDialog(false);

    toast({
      title: "Wallet added",
      description: `${newWalletName} has been added to your portfolio.`,
    });
  };

  const toggleFavorite = (id: string) => {
    setWallets(wallets.map(wallet => 
      wallet.id === id 
        ? { ...wallet, isFavorite: !wallet.isFavorite }
        : wallet
    ));
  };

  const removeWallet = (id: string) => {
    setWallets(wallets.filter(wallet => wallet.id !== id));
    toast({
      title: "Wallet removed",
      description: "Wallet has been removed from your portfolio.",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Card className="portfolio-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Wallet Manager</h2>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="glow-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Wallet</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-name">Wallet Name</Label>
                  <Input
                    id="wallet-name"
                    placeholder="Enter wallet name"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wallet-address">Wallet Address</Label>
                  <Input
                    id="wallet-address"
                    placeholder="Enter Solana wallet address"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isWatchOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsWatchOnly(!isWatchOnly)}
                  >
                    {isWatchOnly ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                    {isWatchOnly ? 'Watch Only' : 'Regular Wallet'}
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Button onClick={addWallet} className="flex-1">
                    Add Wallet
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mt-4">
          <Badge variant="outline" className="text-primary border-primary">
            {wallets.length} Wallets
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-border">
        {/* Connected Wallet */}
        {connected && publicKey && (
          <div className="p-6 bg-primary/5 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Connected Wallet</span>
                    <Badge className="text-xs bg-success text-success-foreground">
                      Active
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {formatAddress(publicKey.toString())}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(publicKey.toString())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://solscan.io/account/${publicKey.toString()}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet List */}
        {wallets.map((wallet) => (
          <div key={wallet.id} className="p-6 hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  wallet.isWatchOnly ? 'bg-muted border border-border' : 'bg-gradient-primary'
                }`}>
                  {wallet.isWatchOnly ? (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Wallet className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{wallet.name}</span>
                    {wallet.isFavorite && (
                      <Star className="w-4 h-4 text-warning fill-warning" />
                    )}
                    {wallet.isWatchOnly && (
                      <Badge variant="outline" className="text-xs">
                        Watch Only
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {formatAddress(wallet.address)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">
                    ${formatNumber(wallet.balance)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Portfolio Value
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(wallet.id)}
                  >
                    <Star className={`w-4 h-4 ${
                      wallet.isFavorite ? 'text-warning fill-warning' : 'text-muted-foreground'
                    }`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(wallet.address)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://solscan.io/account/${wallet.address}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWallet(wallet.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
