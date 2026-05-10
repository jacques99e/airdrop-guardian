import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { PortfolioDashboard } from '@/pages/PortfolioDashboard';
import { TerminalProvider } from '@/contexts/TerminalContext';

import '@solana/wallet-adapter-react-ui/styles.css';

const App = () => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TerminalProvider>
            <div className="flex flex-col min-h-screen bg-background">
              <Header />
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<PortfolioDashboard />} />
                </Routes>
              </main>
              
              <Footer />
              <Toaster />
            </div>
          </TerminalProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;